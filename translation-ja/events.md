# イベント

- [イントロダクション](#introduction)
- [イベントとリスナの生成](#generating-events-and-listeners)
- [イベントとリスナの登録](#registering-events-and-listeners)
    - [イベント追跡](#event-discovery)
    - [イベントの手作業登録](#manually-registering-events)
    - [クロージャリスナ](#closure-listeners)
- [イベント定義](#defining-events)
- [リスナ定義](#defining-listeners)
- [キュー投入するイベントリスナ](#queued-event-listeners)
    - [キューの手作業操作](#manually-interacting-with-the-queue)
    - [キュー投入するイベントリスナとデータベーストランザクション](#queued-event-listeners-and-database-transactions)
    - [キュー投入リスナミドルウェア](#queued-listener-middleware)
    - [暗号化キュー投入リスナ](#encrypted-queued-listeners)
    - [ユニークイベントリスナ](#unique-event-listeners)
        - [処理を開始するまでリスナをユニークに保つ](#keeping-listeners-unique-until-processing-begins)
        - [一意のリスナロック](#unique-listener-locks)
    - [失敗したジョブの処理](#handling-failed-jobs)
- [イベント発行](#dispatching-events)
    - [データベーストランザクション後のイベント発行](#dispatching-events-after-database-transactions)
    - [遅延イベント](#deferring-events)
- [イベントサブスクライバ](#event-subscribers)
    - [イベントサブスクライバの記述](#writing-event-subscribers)
    - [イベントサブスクライバの登録](#registering-event-subscribers)
- [テスト](#testing)
    - [イベントサブセットのFake](#faking-a-subset-of-events)
    - [イベントFakeのスコープ](#scoped-event-fakes)

<a name="introduction"></a>
## イントロダクション

Laravelのイベントは、単純なオブザーバーパターンの実装を提供し、アプリケーション内で発生するさまざまなイベントをサブスクライブしてリッスンできるようにします。イベントクラスは通常、`app/Events`ディレクトリに保存し、リスナは`app/Listeners`に保存します。Artisanコンソールコマンドを使用してイベントとリスナを生成すると、これらのディレクトリが作成されるため、アプリケーションにこれらのディレクトリが表示されていなくても心配ありません。

１つのイベントに、相互に依存しない複数のリスナを含めることができるため、イベントは、アプリケーションのさまざまな側面を分離するための優れた方法として機能します。たとえば、注文が発送されるたびにユーザーにSlack通知を送信したい場合があります。注文処理コードをSlack通知コードに結合する代わりに、リスナが受信してSlack通知をディスパッチするために使用できる`App\Events\OrderShipped`イベントを発生させることができます。

<a name="generating-events-and-listeners"></a>
## イベントとリスナの生成

イベントとリスナを素早く生成するには、`make:event`と`make:listener`のArtisanコマンドを使います。

```shell
php artisan make:event PodcastProcessed

php artisan make:listener SendPodcastNotification --event=PodcastProcessed
```

使いやすいように、引数を指定せずに`make:event`と`make:listener` Artisanコマンドを呼び出すこともできます。その場合、Laravelは自動的にクラス名、リスナを作成する場合はクラス名と、そのリスナがリッスンするイベントのクラス名を求めるプロンプトを表示します。

```shell
php artisan make:event

php artisan make:listener
```

<a name="registering-events-and-listeners"></a>
## イベントとリスナの登録

<a name="event-discovery"></a>
### イベント追跡

Laravelはデフォルトで、アプリケーションの`Listeners`ディレクトリをスキャンして、イベントリスナを自動的に見つけて登録します。`handle`または`__invoke`で始まるリスナクラスのメソッドが見つかると、Laravelはそれらのメソッドを、メソッドのシグネチャでタイプヒントしてあるイベントのイベントリスナとして登録します。

```php
use App\Events\PodcastProcessed;

class SendPodcastNotification
{
    /**
     * イベントの処理
     */
    public function handle(PodcastProcessed $event): void
    {
        // ...
    }
}
```

PHPのユニオン型を使い、複数のイベントをリッスンできます。

```php
/**
 * イベントの処理
 */
public function handle(PodcastProcessed|PodcastPublished $event): void
{
    // ...
}
```

リスナを別のディレクトリや複数のディレクトリへ保存する場合は、アプリケーションの`bootstrap/app.php`ファイルで`withEvents`メソッドを使用し、それらのディレクトリをスキャンするようにLaravelに指示してください。

```php
->withEvents(discover: [
    __DIR__.'/../app/Domain/Orders/Listeners',
])
```

ワイルドカードとして、`*`文字を使用すれば、複数の類似したディレクトリにあるリスナをスキャンできます。

```php
->withEvents(discover: [
    __DIR__.'/../app/Domain/*/Listeners',
])
```

`event:list`コマンドは、アプリケーションに登録したすべてのリスナをリストアップするために使用します。

```shell
php artisan event:list
```

<a name="event-discovery-in-production"></a>
#### 実機でのイベント追跡

アプリケーションを高速化するために、`optimize`または`event:cache` Artisanコマンドを使用して、アプリケーションのすべてのリスナのマニフェストをキャッシュする必要があります。通常、このコマンドはアプリケーションの[デプロイプロセス](/docs/{{version}}/deployment#optimization)の一部として実行する必要があります。このマニフェストは、イベント登録処理を高速化するためにフレームワークが使用します。イベントキャッシュを破棄するには、`event:clear`コマンドを使用します。

<a name="manually-registering-events"></a>
### イベントの手作業登録

`Event`ファサードを使用すると、アプリケーションの`AppServiceProvider`の`boot`メソッド内で、イベントとそれに対応するリスナを手作業で登録できます。

```php
use App\Domain\Orders\Events\PodcastProcessed;
use App\Domain\Orders\Listeners\SendPodcastNotification;
use Illuminate\Support\Facades\Event;

/**
 * 全アプリケーションサービスの初期起動処理
 */
public function boot(): void
{
    Event::listen(
        PodcastProcessed::class,
        SendPodcastNotification::class,
    );
}
```

`event:list`コマンドは、アプリケーションに登録したすべてのリスナをリストアップするために使用します。

```shell
php artisan event:list
```

<a name="closure-listeners"></a>
### クロージャリスナ

通常、リスナはクラスとして定義しますが、アプリケーションの`AppServiceProvider`の`boot`メソッドで、手作業でクロージャベースのイベントリスナを登録することもできます。

```php
use App\Events\PodcastProcessed;
use Illuminate\Support\Facades\Event;

/**
 * 全アプリケーションサービスの初期起動処理
 */
public function boot(): void
{
    Event::listen(function (PodcastProcessed $event) {
        // ...
    });
}
```

<a name="queuable-anonymous-event-listeners"></a>
#### Queueable匿名イベントリスナ

クロージャベースのイベントリスナを登録するとき、リスナのクロージャを`Illuminate\Events\queueable`関数でラップして、[キュー](/docs/{{version}}/queues)を使用してリスナを実行するように、Laravelへ指示できます。

```php
use App\Events\PodcastProcessed;
use function Illuminate\Events\queueable;
use Illuminate\Support\Facades\Event;

/**
 * 全アプリケーションサービスの初期起動処理
 */
public function boot(): void
{
    Event::listen(queueable(function (PodcastProcessed $event) {
        // ...
    }));
}
```

キュー投入ジョブと同様に、`onConnection`、`onQueue`、`delay`メソッドを使用して、キュー投入するリスナの実行をカスタマイズできます。

```php
Event::listen(queueable(function (PodcastProcessed $event) {
    // ...
})->onConnection('redis')->onQueue('podcasts')->delay(now()->plus(seconds: 10)));
```

キューに投入した匿名リスナの失敗を処理したい場合は、`queueable`リスナを定義するときに`catch`メソッドにクロージャを指定できます。このクロージャは、リスナの失敗の原因となったイベントインスタンスと`Throwable`インスタンスを受け取ります。

```php
use App\Events\PodcastProcessed;
use function Illuminate\Events\queueable;
use Illuminate\Support\Facades\Event;
use Throwable;

Event::listen(queueable(function (PodcastProcessed $event) {
    // ...
})->catch(function (PodcastProcessed $event, Throwable $e) {
    // The queued listener failed...
}));
```

<a name="wildcard-event-listeners"></a>
#### ワイルドカードイベントリスナ

ワイルドカードパラメータとして、`*`文字を使用してリスナを登録することもでき、同じリスナで複数のイベントをキャッチできます。ワイルドカードリスナは、最初の引数にイベント名を受け取り、２番目の引数にイベントデータ配列全体を受け取ります。

```php
Event::listen('event.*', function (string $eventName, array $data) {
    // ...
});
```

<a name="defining-events"></a>
## イベント定義

イベントクラスは、基本的に、イベントに関連する情報を保持するデータコンテナです。たとえば、`App\Events\OrderShipped`イベントが[Eloquent ORM](/docs/{{version}}/eloquent)オブジェクトを受け取るとします。

```php
<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderShipped
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * 新しいイベントインスタンスの生成
     */
    public function __construct(
        public Order $order,
    ) {}
}
```

ご覧のとおり、このイベントクラスにはロジックが含まれていません。購読した`App\Models\Order`インスタンスのコンテナです。イベントで使用される`SerializesModels`トレイトは、[キュー投入するリスナ](#queued-event-listeners)を利用する場合など、イベントオブジェクトがPHPの`serialize`関数を使用してシリアル化される場合、Eloquentモデルを適切にシリアル化します。

<a name="defining-listeners"></a>
## リスナ定義

次に、例題のイベントのリスナを見てみましょう。イベントリスナは`handle`メソッドで、イベントインスタンスを受け取ります。`make:listener` Artisanコマンドは、`--event`オプションを指定して呼び出すと、自動的に適切なイベントクラスをインポートし、`handle`メソッド内でイベントをタイプヒントします。`handle`メソッド内では、イベントに応答するために必要なアクションを実行できます。

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;

class SendShipmentNotification
{
    /**
     * イベントリスナの生成
     */
    public function __construct() {}

    /**
     * イベントの処理
     */
    public function handle(OrderShipped $event): void
    {
        // Access the order using $event->order...
    }
}
```

> [!NOTE]
> イベントリスナは、コンストラクタに必要な依存関係をタイプヒントすることもできます。すべてのイベントリスナはLaravel[サービスコンテナ](/docs/{{version}}/container)を介して依存解決されるため、依存関係は自動的に注入されます。

<a name="stopping-the-propagation-of-an-event"></a>
#### イベント伝播の停止

場合によっては、他のリスナへのイベント伝播を停止したいことがあります。これを行うには、リスナの`handle`メソッドから`false`を返します。

<a name="queued-event-listeners"></a>
## キュー投入するイベントリスナ

リスナをキューに投入することは、リスナが電子メールの送信やHTTPリクエストの作成などの遅いタスクを実行する場合に役立ちます。キューに入れられたリスナを使用する前に、必ず[キューを設定](/docs/{{version}}/queues)して、サーバまたはローカル開発環境でキューワーカを起動してください。

リスナをキュー投入するように指定するには、リスナクラスへ`ShouldQueue`インターフェイスを追加します。`make:listener` Artisanコマンドが生成したリスナは、あらかじめこのインターフェイスを現在の名前空間へインポートしているので、すぐに使用できます。

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendShipmentNotification implements ShouldQueue
{
    // ...
}
```

これだけです！これで、このリスナによって処理されるイベントがディスパッチされると、リスナはLaravelの[キューシステム](/docs/{{version}}/queues)を使用してイベントディスパッチャによって自動的にキューへ投入されます。リスナがキューによって実行されたときに例外が投げられない場合、キュー投入済みジョブは、処理が終了した後で自動的に削除されます。

<a name="customizing-the-queue-connection-queue-name"></a>
#### キュー接続と名前、遅延のカスタマイズ

イベントリスナのキュー接続、キュー名、またはキュー遅延時間をカスタマイズしたい場合は、リスナクラスで`Connection`、`Queue`、`Delay`属性を使用します。

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\Attributes\Connection;
use Illuminate\Queue\Attributes\Delay;
use Illuminate\Queue\Attributes\Queue;

#[Connection('sqs')]
#[Queue('listeners')]
#[Delay(60)]
class SendShipmentNotification implements ShouldQueue
{
    // ...
}
```
実行時にリスナのキュー接続、キュー名、遅延時間を定義したい場合は、リスナに`viaConnection`、`viaQueue`、`withDelay`メソッドを定義します。

```php
/**
 * リスナのキュー接続名を取得
 */
public function viaConnection(): string
{
    return 'sqs';
}

/**
 * リスナのキュー名を取得
 */
public function viaQueue(): string
{
    return 'listeners';
}

/**
 * ジョブを処理するまでの秒数を取得
 */
public function withDelay(OrderShipped $event): int
{
    return $event->highPriority ? 0 : 60;
}
```

<a name="conditionally-queueing-listeners"></a>
#### 条件付き投入リスナ

場合によっては、実行時にのみ使用可能なデータに基づいて、リスナをキュー投入する必要があるかどうかを判断する必要が起きるでしょう。このために、`shouldQueue`メソッドをリスナに追加して、リスナをキュー投入する必要があるかどうかを判断できます。`shouldQueue`メソッドが`false`を返す場合、リスナはキュー投入されません。

```php
<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use Illuminate\Contracts\Queue\ShouldQueue;

class RewardGiftCard implements ShouldQueue
{
    /**
     * 顧客へギフトカードを進呈
     */
    public function handle(OrderCreated $event): void
    {
        // ...
    }

    /**
     * リスナをキューへ投入するか決定
     */
    public function shouldQueue(OrderCreated $event): bool
    {
        return $event->order->subtotal >= 5000;
    }
}
```

<a name="manually-interacting-with-the-queue"></a>
### キューの手作業操作

リスナの基になるキュージョブの`delete`メソッドと`release`メソッドへ手作業でアクセスする必要がある場合は、`Illuminate\Queue\InteractsWithQueue`トレイトを使用してアクセスできます。このトレイトは、生成したリスナにはデフォルトでインポートされ、以下のメソッドへのアクセスを提供します。

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendShipmentNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * イベントの処理
     */
    public function handle(OrderShipped $event): void
    {
        if ($condition) {
            $this->release(30);
        }
    }
}
```

<a name="queued-event-listeners-and-database-transactions"></a>
### キュー投入するイベントリスナとデータベーストランザクション

キュー投入したリスナがデータベーストランザクション内でディスパッチされると、データベーストランザクションがコミットされる前にキューによって処理される場合があります。これが発生した場合、データベーストランザクション中にモデルまたはデータベースレコードに加えた更新は、データベースにまだ反映されていない可能性があります。さらに、トランザクション内で作成されたモデルまたはデータベースレコードは、データベースに存在しない可能性があります。リスナがこれらのモデルに依存している場合、キューに入れられたリスナをディスパッチするジョブの処理時に予期しないエラーが発生する可能性があります。

キュー接続の`after_commit`設定オプションが`false`に設定されている場合でも、リスナクラスで`ShouldQueueAfterCommit`インターフェイスを実装することにより、開いているすべてのデータベーストランザクションがコミットされた後に、特定のキューに入れられたリスナをディスパッチする必要があることを示すことができます。

```php
<?php

namespace App\Listeners;

use Illuminate\Contracts\Queue\ShouldQueueAfterCommit;
use Illuminate\Queue\InteractsWithQueue;

class SendShipmentNotification implements ShouldQueueAfterCommit
{
    use InteractsWithQueue;
}
```

> [!NOTE]
> こうした問題の回避方法の詳細は、[キュー投入されるジョブとデータベーストランザクション](/docs/{{version}}/queues#jobs-and-database-transactions)に関するドキュメントを確認してください。

<a name="queued-listener-middleware"></a>
### キュー投入リスナミドルウェア

キューリスナは[ジョブミドルウェア](/docs/{{version}}/queues#job-middleware)を利用することもできます。ジョブミドルウェアは、キューリスナの実行へカスタムロジックをラップすることを可能にし、リスナ自身の定型コードを減らします。ジョブミドルウェアを作成した後、リスナの`middleware`メソッドからジョブミドルウェアを返すことで、リスナへアタッチします。

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use App\Jobs\Middleware\RateLimited;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendShipmentNotification implements ShouldQueue
{
    /**
     * イベントの処理
     */
    public function handle(OrderShipped $event): void
    {
        // イベントを処理する…
    }

    /**
     * リスナが通過するミドルウェアを取得
     *
     * @return array<int, object>
     */
    public function middleware(OrderShipped $event): array
    {
        return [new RateLimited];
    }
}
```

<a name="encrypted-queued-listeners"></a>
#### 暗号化キュー投入リスナ

Laravelでは[暗号化](/docs/{{version}}/encryption)により、キュー投入するリスナのデータのプライバシーと整合性を確保できます。使い始めるには、リスナクラスへ`ShouldBeEncrypted`インターフェイスを追加するだけです。このインターフェイスをクラスに追加すると、Laravelはリスナをキューへ投入する前に自動的に暗号化します。

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendShipmentNotification implements ShouldQueue, ShouldBeEncrypted
{
    // ...
}
```

<a name="unique-event-listeners"></a>
### ユニークイベントリスナ

> [!WARNING]
> ユニークリスナには、[ロック](/docs/{{version}}/cache#atomic-locks)をサポートするキャッシュドライバが必要です。現在、`memcached`、`redis`、`dynamodb`、`database`、`file`、`array`のキャッシュドライバがアトミックロックをサポートしています。

特定のリスナのインスタンスが、いかなる時点においてもキューに一つしか存在しないようにしたい場合があると思います。そのためには、リスナクラスに`ShouldBeUnique`インターフェイスを実装します。

```php
<?php

namespace App\Listeners;

use App\Events\LicenseSaved;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;

class AcquireProductKey implements ShouldQueue, ShouldBeUnique
{
    public function __invoke(LicenseSaved $event): void
    {
        // ...
    }
}
```

上記の例では、`AcquireProductKey`リスナはユニークです。したがって、リスナの別のインスタンスがすでにキューに存在し、処理を終えていない場合、そのリスナはキューに投入されません。これにより、たとえ短期間にライセンスが何度も保存されたとしても、各ライセンスに対してプロダクトキーが一つだけ取得されることを保証します。

特定のケースでは、リスナをユニークにするための特定の「キー」を定義したい場合や、リスナがユニークであり続けるタイムアウト時間を指定したい場合があります。これを実現するには、リスナクラスに`uniqueId`および`uniqueFor`プロパティまたはメソッドを定義します。これらのメソッドはイベントインスタンスを受け取るため、イベントデータを使用して戻り値を構築できます。

```php
<?php

namespace App\Listeners;

use App\Events\LicenseSaved;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;

class AcquireProductKey implements ShouldQueue, ShouldBeUnique
{
    /**
     * リスナのユニークロックが解除されるまでの秒数
     *
     * @var int
     */
    public $uniqueFor = 3600;

    public function __invoke(LicenseSaved $event): void
    {
        // ...
    }

    /**
     * リスナのユニークIDを取得
     */
    public function uniqueId(LicenseSaved $event): string
    {
        return 'listener:'.$event->license->id;
    }
}
```

上記の例では、`AcquireProductKey`リスナはライセンスIDごとにユニークです。そのため、同じライセンスに対してリスナを新しくディスパッチしても、既存のリスナが処理を完了するまでは無視されます。これにより、同じライセンスに対して重複したプロダクトキーが取得されるのを防ぎます。さらに、既存のリスナが1時間以内に処理されない場合、ユニークロックは解放され、同じユニークキーを持つ別のリスナをキューに入れられるようになります。

> [!WARNING]
> アプリケーションが複数のWebサーバやコンテナからイベントをディスパッチする場合、Laravelがリスナがユニークであるかどうかを正確に判断できるように、すべてのサーバが同じ中央キャッシュサーバと通信していることを確認してください。

<a name="keeping-listeners-unique-until-processing-begins"></a>
#### 処理を開始するまでリスナをユニークに保つ

 ユニークリスナはデフォルトで、そのリスナが処理を完了するか、すべてのリトライ試行に失敗した後に「アンロック」されます。しかし、リスナを処理する直前にアンロックしたい状況もあるでしょう。これを行うには、リスナへ`ShouldBeUnique`契約の代わりに、`ShouldBeUniqueUntilProcessing`契約を実装します。

```php
<?php

namespace App\Listeners;

use App\Events\LicenseSaved;
use Illuminate\Contracts\Queue\ShouldBeUniqueUntilProcessing;
use Illuminate\Contracts\Queue\ShouldQueue;

class AcquireProductKey implements ShouldQueue, ShouldBeUniqueUntilProcessing
{
    // ...
}
```

<a name="unique-listener-locks"></a>
#### 一意のリスナロック

`ShouldBeUnique`リスナをディスパッチすると、Laravelは内部的に、`uniqueId`キーを使用して[ロック](/docs/{{version}}/cache#atomic-locks)の取得を試みます。すでにロックが保持されている場合、そのリスナはディスパッチしません。このロックは、リスナが処理を完了するか、すべてのリトライ試行に失敗したとき、解放します。Laravelはデフォルトで、このロックを取得するためにデフォルトキャッシュドライバを使用します。しかし、ロックの取得に別のドライバを使用したい場合は、使用するキャッシュドライバを返す`uniqueVia`メソッドを定義してください。

```php
<?php

namespace App\Listeners;

use App\Events\LicenseSaved;
use Illuminate\Contracts\Cache\Repository;
use Illuminate\Support\Facades\Cache;

class AcquireProductKey implements ShouldQueue, ShouldBeUnique
{
    // ...

    /**
     * ユニークリスナロック用のキャッシュドライバを取得
     */
    public function uniqueVia(LicenseSaved $event): Repository
    {
        return Cache::driver('redis');
    }
}
```

> [!NOTE]
> リスナの並行処理のみを制限する必要がある場合は、代わりに[WithoutOverlapping](/docs/{{version}}/queues#preventing-job-overlaps)ジョブミドルウェアを使用してください。

<a name="handling-failed-jobs"></a>
### 失敗したジョブの処理

キュー投入したイベントリスナが失敗する場合があります。キュー投入したリスナがキューワーカによって定義された最大試行回数を超えると、リスナ上の`failed`メソッドが呼び出されます。`failed`メソッドは、失敗の原因となったイベントインスタンスと`Throwable`を受け取ります。

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Throwable;

class SendShipmentNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * イベントの処理
     */
    public function handle(OrderShipped $event): void
    {
        // ...
    }

    /**
     * 失敗したジョブを処理
     */
    public function failed(OrderShipped $event, Throwable $exception): void
    {
        // ...
    }
}
```

<a name="specifying-queued-listener-maximum-attempts"></a>
#### キュー投入したリスナの最大試行回数の指定

キュー投入したリスナの１つでエラーが発生した場合、リスナが無期限に再試行し続けることを皆さんも望まないでしょう。そのため、Laravelはリスナを試行できる回数または期間を指定するさまざまな方法を提供しています。

リスナが失敗したとみなすまでに、何回試行するかを指定するには、リスナクラスで`Tries`属性を使用します。

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\Attributes\Tries;
use Illuminate\Queue\InteractsWithQueue;

#[Tries(5)]
class SendShipmentNotification implements ShouldQueue
{
    use InteractsWithQueue;

    // ...
}
```

リスナが失敗するまでに試行できる回数を定義する代わりに、リスナをそれ以上試行しない時間を定義することもできます。これにより、リスナは特定の時間枠内で何度でも試行します。リスナの試行最長時間を定義するには、リスナクラスに`retryUntil`メソッドを追加します。このメソッドは`DateTime`インスタンスを返す必要があります:

```php
use DateTime;

/**
 * リスナがタイムアウトする時間を決定
 */
public function retryUntil(): DateTime
{
    return now()->plus(minutes: 5);
}
```

`retryUntil`と`tries`の両方を定義した場合、Laravelは`retryUntil`メソッドを優先します。

<a name="specifying-queued-listener-backoff"></a>
#### キュー投入済みリスナの再試行待ち秒数指定

例外が発生したリスナを再試行するまで、Laravelが何秒間待機するかを設定したい場合は、リスナクラスで`Backoff`属性を使用します。

```php
<?php

namespace App\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\Attributes\Backoff;

#[Backoff(3)]
class SendShipmentNotification implements ShouldQueue
{
    // ...
}
```

リスナの再試行待ち時間を決定するため、より複雑なロジックが必要な場合は、リスナクラスに`backoff`メソッドを定義してください。

```php
/**
 * キュー投入したリスナを再試行するまで待つ秒数を計算
 */
public function backoff(OrderShipped $event): int
{
    return 3;
}
```

`backoff`メソッドからバックオフ値の配列を返すことで、簡単に「指数関数的」な待ち秒数が設定できます。この例では、リトライの遅延は最初のリトライで１秒、２回目のリトライで５秒、３回目のリトライで１０秒、それ以降もリトライが残っている場合は毎回１０秒となります：

```php
/**
 * キュー投入したリスナを再試行するまで待つ秒数を計算
 *
 * @return list<int>
 */
public function backoff(OrderShipped $event): array
{
    return [1, 5, 10];
}
```

<a name="specifying-queued-listener-max-exceptions"></a>
#### キュー投入リスナの最大例外の指定

キュー投入したリスナが何度も試行される可能性がある一方で、（`release`メソッドによって直接リリースされるのではなく）特定の回数の未処理の例外によって再試行を起動した場合は、失敗するように指定したい場合があります。これを実現するには、リスナクラスで`Tries`属性と`MaxExceptions`属性を使用します。

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\Attributes\MaxExceptions;
use Illuminate\Queue\Attributes\Tries;
use Illuminate\Queue\InteractsWithQueue;

#[Tries(25)]
#[MaxExceptions(3)]
class SendShipmentNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * イベントの処理
     */
    public function handle(OrderShipped $event): void
    {
        // イベントを処理する…
    }
}
```

この例で、リスナを最大２５回再試行します。しかし、リスナにより３回、未処理の例外が投げられるとこのリスナは失敗します。

<a name="specifying-queued-listener-timeout"></a>
#### キュー投入リスナのタイムアウトの指定

大抵の場合、キュー投入したリスナにどのくらいの時間がかかるか、大まかに把握しているはずです。このため、Laravelでは「タイムアウト」値を指定できます。リスナがタイムアウト値で指定された秒数よりも長く処理を続けている場合、そのリスナを処理しているワーカはエラーで終了します。リスナの実行を許可する最大秒数を定義するには、リスナクラスで`Timeout`属性を使用します。

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\Attributes\Timeout;

#[Timeout(120)]
class SendShipmentNotification implements ShouldQueue
{
    // ...
}
```

リスナがタイムアウト時に失敗としてマークされるように指定したい場合は、リスナクラスで`FailOnTimeout`属性を使用します。

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\Attributes\FailOnTimeout;

#[FailOnTimeout]
class SendShipmentNotification implements ShouldQueue
{
    // ...
}
```

<a name="dispatching-events"></a>
## イベント発行

イベントをディスパッチするには、イベントで静的な`dispatch`メソッドを呼び出します。このメソッドは`Illuminate\Foundation\Events\Dispatchable`トレイトにより、イベントで使用可能になります。`dispatch`メソッドに渡された引数はすべて、イベントのコンストラクタへ渡されます。

```php
<?php

namespace App\Http\Controllers;

use App\Events\OrderShipped;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class OrderShipmentController extends Controller
{
    /**
     * 指定注文を発送
     */
    public function store(Request $request): RedirectResponse
    {
        $order = Order::findOrFail($request->order_id);

        // 注文発送ロジック…

        OrderShipped::dispatch($order);

        return redirect('/orders');
    }
}
```

条件付きでイベントをディスパッチしたい場合は、`dispatchIf`か`dispatchUnless`メソッドが使用できます。

```php
OrderShipped::dispatchIf($condition, $order);

OrderShipped::dispatchUnless($condition, $order);
```

> [!NOTE]
> テストの際、あるイベントが実際にリスナを起動することなくディスパッチされたことをアサートできると役立ちます。Laravelに[組み込み済みのテストヘルパ](#testing)は、これを簡単に実現します。

<a name="dispatching-events-after-database-transactions"></a>
### データベーストランザクション後のイベント発行

アクティブなデータベーストランザクションをコミットした後にのみ、イベントを発行するようにLaravelへ指示したい場合があると思います。そのためには、イベントクラスで`ShouldDispatchAfterCommit`インターフェイスを実装します。

このインターフェイスは、現在のデータベーストランザクションがコミットされるまで、イベントを発行しないようにLaravelへ指示するものです。トランザクションが失敗した場合は、イベントを破棄します。イベントを発行した時にデータベーストランザクションが進行中でなければ、イベントを直ちに発行します。

```php
<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderShipped implements ShouldDispatchAfterCommit
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * 新しいイベントインスタンスの生成
     */
    public function __construct(
        public Order $order,
    ) {}
}
```

<a name="deferring-events"></a>
### 遅延イベント

遅延イベントを使用すると、モデルイベントの送信とイベントリスナの実行を、特定のコードブロックが完了するまで遅延できます。これは、イベントリスナが起動される前に、関連するすべてのレコードが作成済みであることを保証する必要がある場合、特に役立ちます。

イベントを遅延するには、`Event::defer()`メソッドへクロージャを指定します。

```php
use App\Models\User;
use Illuminate\Support\Facades\Event;

Event::defer(function () {
    $user = User::create(['name' => 'Victoria Otwell']);

    $user->posts()->create(['title' => 'My first post!']);
});
```

クロージャ内で発行したすべてのイベントは、クロージャを実行した後にディスパッチします。これにより、イベントリスナは遅延実行中に作成した関連するすべてのレコードへアクセスできるようになります。クロージャ内で例外が発生した場合、遅延イベントをディスパッチしません。

特定のイベントのみ遅延させるには、`defer`メソッドの第２引数にイベントの配列を指定します。

```php
use App\Models\User;
use Illuminate\Support\Facades\Event;

Event::defer(function () {
    $user = User::create(['name' => 'Victoria Otwell']);

    $user->posts()->create(['title' => 'My first post!']);
}, ['eloquent.created: '.User::class]);
```

<a name="event-subscribers"></a>
## イベントサブスクライバ

<a name="writing-event-subscribers"></a>
### イベントサブスクライバの記述

イベントサブスクライバは、サブスクライバクラス自体から複数のイベントを購読できるクラスであり、単一のクラス内で複数のイベントハンドラを定義できます。サブスクライバは、イベントディスパッチャーインスタンスを受け取る`subscribe`メソッドを定義する必要があります。特定のディスパッチャ上の`listen`メソッドを呼び出して、イベントリスナを登録します。

```php
<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Events\Dispatcher;

class UserEventSubscriber
{
    /**
     * ユーザーログインイベントの処理
     */
    public function handleUserLogin(Login $event): void {}

    /**
     * ユーザーログアウトイベントの処理
     */
    public function handleUserLogout(Logout $event): void {}

    /**
     * 定期購入者のリスナ登録
     */
    public function subscribe(Dispatcher $events): void
    {
        $events->listen(
            Login::class,
            [UserEventSubscriber::class, 'handleUserLogin']
        );

        $events->listen(
            Logout::class,
            [UserEventSubscriber::class, 'handleUserLogout']
        );
    }
}
```

イベントリスナのメソッドがサブスクライバ自身の中で定義されている場合は、サブスクライバの`subscribe`メソッドからメソッド名とイベントの配列を返す方が便利でしょう。Laravelはイベントリスナを登録する際に、サブスクライバのクラス名を自動的に決定します。

```php
<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Events\Dispatcher;

class UserEventSubscriber
{
    /**
     * ユーザーログインイベントの処理
     */
    public function handleUserLogin(Login $event): void {}

    /**
     * ユーザーログアウトイベントの処理
     */
    public function handleUserLogout(Logout $event): void {}

    /**
     * 定期購入者のリスナ登録
     *
     * @return array<string, string>
     */
    public function subscribe(Dispatcher $events): array
    {
        return [
            Login::class => 'handleUserLogin',
            Logout::class => 'handleUserLogout',
        ];
    }
}
```

<a name="registering-event-subscribers"></a>
### イベントサブスクライバの登録

サブスクライバを書き終えたら、Laravelの[イベント検出規約](#event-discovery)に従っていれば、Laravelは自動的にサブスクライバ内へハンドラメソッドを登録します。そうでない場合は、`Event`ファサードの`subscribe`メソッドを使用して、手作業でサブスクライバを登録します。通常、これはアプリケーションの`AppServiceProvider`の`boot`メソッド内で行います。

```php
<?php

namespace App\Providers;

use App\Listeners\UserEventSubscriber;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * アプリケーションの全サービスの初期起動処理
     */
    public function boot(): void
    {
        Event::subscribe(UserEventSubscriber::class);
    }
}
```

<a name="testing"></a>
## Testing

イベントをディスパッチするコードをテストする場合、イベントのリスナを実際に実行しないように、Laravelへ指示したい場合があるでしょう。リスナのコードは、対応するイベントをディスパッチするコードとは別に、直接テストすることができるからです。もちろん、リスナ自体をテストするには、リスナインスタンスをインスタンス化し、テスト内で直接`handle`メソッドを呼び出せます。

`Event`ファサードの`fake`メソッドを使用し、リスナを実行しないでテスト対象のコードを実行し、`assertDispatched`、`assertNotDispatched`、`assertNothingDispatched`メソッドを使用してアプリケーションがどのイベントをディスパッチするかをアサートできます。

```php tab=Pest
<?php

use App\Events\OrderFailedToShip;
use App\Events\OrderShipped;
use Illuminate\Support\Facades\Event;

test('orders can be shipped', function () {
    Event::fake();

    // 注文の発送処理…

    // 一つのイベントをディスパッチするのをアサート
    Event::assertDispatched(OrderShipped::class);

    // 一つのイベントを２回ディスパッチするのをアサート
    Event::assertDispatched(OrderShipped::class, 2);

    // 一つのイベントを１回ディスパッチするのをアサート
    Event::assertDispatchedOnce(OrderShipped::class);

    // あるイベントをディスパッチしないことをアサート
    Event::assertNotDispatched(OrderFailedToShip::class);

    // イベントを全くディスパッチしないことをアサート
    Event::assertNothingDispatched();
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Events\OrderFailedToShip;
use App\Events\OrderShipped;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * 注文発送のテスト
     */
    public function test_orders_can_be_shipped(): void
    {
        Event::fake();

        // 注文の発送処理…

        // 一つのイベントをディスパッチするのをアサート
        Event::assertDispatched(OrderShipped::class);

        // 一つのイベントを２回ディスパッチするのをアサート
        Event::assertDispatched(OrderShipped::class, 2);

        // 一つのイベントを１回ディスパッチするのをアサート
        Event::assertDispatchedOnce(OrderShipped::class);

        // あるイベントをディスパッチしないことをアサート
        Event::assertNotDispatched(OrderFailedToShip::class);

        // イベントを全くディスパッチしないことをアサート
        Event::assertNothingDispatched();
    }
}
```

クロージャを`assertDispatched`や`assertNotDispatched`メソッドに渡すと、指定したその「真理値テスト」に合格するイベントが、ディスパッチされたことをアサートできます。指定真理値テストにパスするイベントが最低１つディスパッチされた場合、アサートは成功します。

```php
Event::assertDispatched(function (OrderShipped $event) use ($order) {
    return $event->order->id === $order->id;
});
```

イベントリスナが指定イベントをリッスンしていることを単純にアサートしたい場合は、`assertListening`メソッドを使用してください。

```php
Event::assertListening(
    OrderShipped::class,
    SendShipmentNotification::class
);
```

> [!WARNING]
> `Event::fake()`を呼び出した後は、イベントリスナが実行されることはありません。したがって、テストがイベントに依存するモデルファクトリを使用している場合、例えば、モデルの`creating`イベント中にUUIDを作成する場合、ファクトリを使用した**後**に、`Event::fake()`を呼び出す必要があります。

<a name="faking-a-subset-of-events"></a>
### イベントサブセットのFake

特定のイベントセットに対してのみイベントリスナをFakeしたい場合は、`fake`または`fakeFor`メソッドへそれらを渡してください。

```php tab=Pest
test('orders can be processed', function () {
    Event::fake([
        OrderCreated::class,
    ]);

    $order = Order::factory()->create();

    Event::assertDispatched(OrderCreated::class);

    // 他のイベントは普段通りディスパッチする
    $order->update([
        // ...
    ]);
});
```

```php tab=PHPUnit
/**
 * 注文発送のテスト
 */
public function test_orders_can_be_processed(): void
{
    Event::fake([
        OrderCreated::class,
    ]);

    $order = Order::factory()->create();

    Event::assertDispatched(OrderCreated::class);

    // 他のイベントは普段通りディスパッチする
    $order->update([
        // ...
    ]);
}
```

`except`メソッドを使用すると、指定イベント以外のすべてのイベントをFakeできます。

```php
Event::fake()->except([
    OrderCreated::class,
]);
```

<a name="scoped-event-fakes"></a>
### イベントFakeのスコープ

テストの一部分だけでイベントリスナをFakeしたい場合は、`fakeFor`メソッドを使用します。

```php tab=Pest
<?php

use App\Events\OrderCreated;
use App\Models\Order;
use Illuminate\Support\Facades\Event;

test('orders can be processed', function () {
    $order = Event::fakeFor(function () {
        $order = Order::factory()->create();

        Event::assertDispatched(OrderCreated::class);

        return $order;
    });

    // イベントを通常通りディスパッチし、オブザーバが実行される
    $order->update([
        // ...
    ]);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Events\OrderCreated;
use App\Models\Order;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * 注文処理のテスト
     */
    public function test_orders_can_be_processed(): void
    {
        $order = Event::fakeFor(function () {
            $order = Order::factory()->create();

            Event::assertDispatched(OrderCreated::class);

            return $order;
        });

        // イベントを通常通りディスパッチし、オブザーバが実行される
        $order->update([
            // ...
        ]);
    }
}
```
