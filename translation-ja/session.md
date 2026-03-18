# HTTPセッション

- [イントロダクション](#introduction)
    - [設定](#configuration)
    - [ドライバの動作要件](#driver-prerequisites)
- [セッションの操作](#interacting-with-the-session)
    - [データの取得](#retrieving-data)
    - [データの保存](#storing-data)
    - [データの一時保存](#flash-data)
    - [データの削除](#deleting-data)
    - [セッションIDの再生成](#regenerating-the-session-id)
- [セッションキャッシュ](#session-cache)
- [セッションブロッキング](#session-blocking)
- [カスタムセッションドライバの追加](#adding-custom-session-drivers)
    - [ドライバの実装](#implementing-the-driver)
    - [ドライバの登録](#registering-the-driver)

<a name="introduction"></a>
## イントロダクション

HTTPで駆動するアプリケーションはステートレスであるため、セッションで複数のリクエストにわたりユーザーに関する情報を保存する手段を提供しています。そうしたユーザー情報は、後続のリクエストからアクセスできる永続的な保存／バックエンドに通常配置されます。

Laravelには、表現力豊かで統一されたAPIを介してアクセスできるさまざまなセッションバックエンドを用意しています。[Memcached](https://memcached.org)、[Redis](https://redis.io)、データベースなどの一般的なバックエンドをサポートしています。

<a name="configuration"></a>
### 設定

アプリケーションのセッション設定ファイルは、`config/session.php`へ保存します。このファイルで利用可能なオプションを確認してください。Laravelはデフォルトで、`database`セッションドライバを使用するように設定しています。

セッション`driver`設定オプションは、各リクエストのセッションデータをどこに保存するかを定義します。Laravelには様々なドライバがあります。

<div class="content-list" markdown="1">

- `file` - セッションを`storage/framework/sessions`に保存します
- `cookie` - セッションを暗号化され安全なクッキーに保存します
- `database` - セッションをリレーショナルデータベースへ保存します
- `memcached`／`redis` - セッションをこれらの高速なキャッシュベースの保存域へ保存します
- `dynamodb` - セッションをAWS DynamoDBへ保存します
- `array` - セッションをPHP配列に格納し、永続化しません

</div>

> [!NOTE]
> 配列(array)ドライバは主に[テスト](/docs/{{version}}/tests)中に使用し、セッションに保存したデータが永続化されるのを防ぎます。

<a name="driver-prerequisites"></a>
### ドライバの動作要件

<a name="database"></a>
#### データベース

`database`セッションドライバを使用する場合、セッションデータを格納するデータベーステーブルを用意する必要があります。通常、これはLaravelのデフォルト`0001_01_01_000000_create_users_table.php`[データベースマイグレーション](/docs/{{version}}/migrations)に含まれていますが、何らかの理由で`sessions`テーブルがない場合は、`make:session-table` Artisanコマンドを使用してこのマイグレーションを生成してください。

```shell
php artisan make:session-table

php artisan migrate
```

<a name="redis"></a>
#### Redis

LaravelでRedisセッションを使用する前に、PECLを介してPhpRedis PHP拡張機能をインストールするか、Composerを介して`predis/predis`パッケージ(〜1.0)をインストールする必要があります。Redisの設定の詳細は、Laravelの[Redisドキュメント](/docs/{{version}}/redis#configuration)を参照してください。

> [!NOTE]
> `SESSION_CONNECTION`環境変数または`session.php`設定ファイルの`connection`オプションを使用して、セッションの保存に使用する Redis接続を指定できます。

<a name="interacting-with-the-session"></a>
## セッションの操作

<a name="retrieving-data"></a>
### データの取得

Laravelでセッションデータを操作する主な方法は、グローバルな`session`ヘルパと`Request`インスタンスの２つあります。最初に、`Request`インスタンスを介してセッションにアクセスする方法を見てみましょう。これはルートクロージャまたはコントローラメソッドでタイプヒントを使い取得できます。コントローラメソッドの依存関係は、Laravel[サービスコンテナ](/docs/{{version}}/container)を介して自動的に依存注入されることに注意してください。

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * 指定ユーザーのプロファイル表示
     */
    public function show(Request $request, string $id): View
    {
        $value = $request->session()->get('key');

        // ...

        $user = $this->users->find($id);

        return view('user.profile', ['user' => $user]);
    }
}
```

セッションからアイテムを取得するときに、`get`メソッドの２番目の引数としてデフォルト値を渡すこともできます。指定したキーがセッションに存在しない場合、このデフォルト値を返します。クロージャをデフォルト値として`get`メソッドに渡すと、リクエストされたキーが存在しない場合にそのクロージャを実行し、その実行結果を返します。

```php
$value = $request->session()->get('key', 'default');

$value = $request->session()->get('key', function () {
    return 'default';
});
```

<a name="the-global-session-helper"></a>
#### グローバルセッションヘルパ

グローバルな`session`PHP関数を使用して、セッション内のデータを取得／保存することもできます。`session`ヘルパを文字列引数一つで呼び出すと、そのセッションキーの値を返します。キー／値ペアの配列を使用してヘルパを呼び出すと、それらの値をセッションへ保存します。

```php
Route::get('/home', function () {
    // セッションからデータを取得
    $value = session('key');

    // デフォルト値の指定
    $value = session('key', 'default');

    // セッションにデータを保存
    session(['key' => 'value']);
});
```

> [!NOTE]
> HTTPリクエストインスタンスを介してセッションを使用する場合と、グローバルな`session`ヘルパを使用する場合の、実践的な違いはほとんどありません。どちらのメソッドも、すべてのテストケースで使用できる`assertSessionHas`メソッドを使用し、[テスト可能](/docs/{{version}}/tests)です。

<a name="retrieving-all-session-data"></a>
#### 全セッションデータの取得

セッション内のすべてのデータを取得する場合は、`all`メソッドを使用します。

```php
$data = $request->session()->all();
```

<a name="retrieving-a-portion-of-the-session-data"></a>
#### セッションデータの部分取得

`only`メソッドと`except`メソッドは、セッションデータのサブセットを取得するために使います。

```php
$data = $request->session()->only(['username', 'email']);

$data = $request->session()->except(['username', 'email']);
```

<a name="determining-if-an-item-exists-in-the-session"></a>
#### アイテムのセッション存在判定

アイテムがセッションに存在するかを判定するには、`has`メソッドを使用します。アイテムが存在し、`null`でない場合、`has`メソッドは`true`を返します。

```php
if ($request->session()->has('users')) {
    // ...
}
```

値が`null`でも、そのアイテムがセッションに存在するかを判定する場合には、`exists`メソッドを使用します。

```php
if ($request->session()->exists('users')) {
    // ...
}
```

アイテムがセッションに存在しないことを判定するには、`missing`メソッドを使用します。そのアイテムが存在しない場合、`missing`メソッドは`true`を返します。

```php
if ($request->session()->missing('users')) {
    // ...
}
```

<a name="storing-data"></a>
### データの保存

セッションにデータを保存するには、通常、リクエストインスタンスの`put`メソッドまたは`session`グローバルヘルパを使用します。

```php
// リクエストインスタンス経由
$request->session()->put('key', 'value');

// グローバルな"session"ヘルパ経由
session(['key' => 'value']);
```

<a name="pushing-to-array-session-values"></a>
#### 配列セッション値への追加

`push`メソッドを使用して、配列のセッション値へ新しい値を追加できます。たとえば、`user.teams`キーにチーム名の配列が含まれている場合、次のように新しい値を配列に追加できます。

```php
$request->session()->push('user.teams', 'developers');
```

<a name="retrieving-deleting-an-item"></a>
#### アイテムの取得と削除

`pull`メソッドは、単一のステートメントでセッションからアイテムを取得および削除します。

```php
$value = $request->session()->pull('key', 'default');
```

<a name="incrementing-and-decrementing-session-values"></a>
#### セッション値の増分／減分

セッションデータが整数で増分や減分をしたい場合は、`increment`メソッドと`decrement`メソッドを使えます。

```php
$request->session()->increment('count');

$request->session()->increment('count', $incrementBy = 2);

$request->session()->decrement('count');

$request->session()->decrement('count', $decrementBy = 2);
```

<a name="flash-data"></a>
### データの一時保存

後続のリクエストで使用するために、セッションにアイテムを一時保存したい場合があります。`flash`メソッドを使い実現できます。このメソッドを使用してセッションに保存されたデータは、即時および後続のHTTPリクエスト中に利用可能です。後続のHTTPリクエストの後、一時保存したデータを削除します。一時保存データは、主に持続保存の必要がないステータスメッセージに役立ちます。

```php
$request->session()->flash('status', 'Task was successful!');
```

複数のリクエストの間、一時保存データを保持する必要がある場合は、`reflash`メソッドを使用します。これにより、後続のリクエストのためすべての一時保存データを保持します。特定の一時保存データのみを保持する必要がある場合は、`keep`メソッドを使用します。

```php
$request->session()->reflash();

$request->session()->keep(['username', 'email']);
```

一時保存データを現在のリクエストに対してのみ持続するには、`now`メソッドを使用します。

```php
$request->session()->now('status', 'Task was successful!');
```

<a name="deleting-data"></a>
### データの削除

`forget`メソッドは、セッションからデータの一部を削除します。セッションからすべてのデータを削除したい場合は、`flush`メソッドを使用できます。

```php
// 一つのキーを削除
$request->session()->forget('name');

// 複数のキーを削除
$request->session()->forget(['name', 'status']);

$request->session()->flush();
```

<a name="regenerating-the-session-id"></a>
### セッションIDの再生成

多くの場合、セッションIDの再生成は、悪意のあるユーザーがアプリケーションに対する[セッション固定](https://owasp.org/www-community/attacks/Session_fixation)攻撃を防ぐため行います。

Laravel[アプリケーションスターターキット](/docs/{{version}}/starter-kits)または[Laravel　Fortify](/docs/{{version}}/fortify)のどちらかを使用している場合、Laravelは認証中にセッションIDを自動的に再生成します。しかし、セッションIDを手作業で再生成する必要がある場合は、`regenerate`メソッドを使用できます。

```php
$request->session()->regenerate();
```

セッションIDを再生成してセッションからすべてのデータを一文で削除する必要がある場合は、`invalidate`メソッドを使用します。

```php
$request->session()->invalidate();
```

<a name="session-cache"></a>
## セッションキャッシュ

Laravelのセッションキャッシュは、個々のユーザーセッションでスコープしたデータをキャッシュする便利な方法を提供します。グローバルなアプリケーションキャッシュとは異なり、セッションキャッシュのデータはセッションごとに自動的に分離され、セッションが期限切れになったり破棄されたりするとクリーンアップします。セッションキャッシュは、`get`、`put`、`remember`、`forget`など、おなじみの[Laravelキャッシュメソッド](/docs/{{version}}/cache)をすべてサポートしますが、これらは現在のセッションにスコープされます。

セッションキャッシュは、同じセッション内で複数のリクエストにまたがって保持したいが永続的に保存する必要のない、一時的なユーザー固有データの保存に最適です。これには、フォームデータ、一時的な計算結果、APIレスポンス、特定のユーザーのセッションに関連付けるべきその他の一時的なデータなどが含まれます。

セッションキャッシュには、セッションオブジェクトの`cache`メソッドを通じてアクセスできます。

```php
$discount = $request->session()->cache()->get('discount');

$request->session()->cache()->put(
    'discount', 10, now()->plus(minutes: 5)
);
```

Laravelのキャッシュメソッドに関する詳細情報は、[キャッシュのドキュメント](/docs/{{version}}/cache)を参照してください。

<a name="session-blocking"></a>
## セッションブロッキング

> [!WARNING]
> セッションブロッキングを利用するには、アプリケーションで[アトミックロック](/docs/{{version}}/cache#atomic-locks)をサポートするキャッシュドライバを使用している必要があります。現在、これらのキャッシュドライバには、`memcached`、`dynamodb`、`redis`、`mongodb`（`mongodb/laravel-mongodb`公式パッケージに含まれています）、`database`、`file`、`array`ドライバをサポートしています。また、`cookie`セッションドライバを使用することはできません。

デフォルトでは、Laravelは同じセッションを使用するリクエストを同時に実行することを許可します。したがって、たとえば、JavaScript HTTPライブラリを使用してアプリケーションへ２つのHTTPリクエストを作成すると、両方が同時に実行されます。多くのアプリケーションでは、これは問題ではありません。ただし、セッションデータの損失が、両方がセッションへデータを書き込む２つの異なるアプリケーションエンドポイントに同時にリクエストを行うアプリケーションの小さなサブセットで発生する可能性があります。

これを軽減するために、Laravelは特定のセッションの同時リクエストを制限できる機能を提供します。これを使用するには、`block`メソッドをルート定義にチェーンするだけです。この例では、`/profile`エンドポイントへの受信リクエストがセッションロックを取得します。このロックが保持されている間、同じセッションIDを共有する`/profile`または`/order`エンドポイントへの受信リクエストは、実行を続行する前に最初のリクエストの実行が終了するのを待ちます。

```php
Route::post('/profile', function () {
    // ...
})->block($lockSeconds = 10, $waitSeconds = 10);

Route::post('/order', function () {
    // ...
})->block($lockSeconds = 10, $waitSeconds = 10);
```

`block`メソッドは２つのオプションの引数を取ります。`block`メソッドの最初の引数は、セッションロックを解放するまでに保持する必要がある最大秒数です。もちろん、この時間より前にリクエストの実行が終了すれば、ロックはより早く解放されます。

`block`メソッドの２番目の引数は、セッションロックを取得しようとしているときにリクエストが待機する秒数です。リクエストが指定された秒数以内にセッションロックを取得できない場合、`Illuminate\Contracts\Cache\LockTimeoutException`を投げます。

これらの引数のいずれも渡されない場合、ロックは最大１０秒間取得され、リクエストはロックの取得を試行する間、最大１０秒間待機します。

```php
Route::post('/profile', function () {
    // ...
})->block();
```

<a name="adding-custom-session-drivers"></a>
## カスタムセッションドライバの追加

<a name="implementing-the-driver"></a>
### ドライバの実装

既存のセッションドライバがアプリケーションのニーズに合わない場合、Laravelでは独自のセッションハンドラが作成できます。カスタムセッションドライバは、PHPの組み込みの`SessionHandlerInterface`を実装する必要があります。このインターフェイスには、いくつかの簡単なメソッドが含まれています。スタブ化されたMongoDBの実装は次のようになります。

```php
<?php

namespace App\Extensions;

class MongoSessionHandler implements \SessionHandlerInterface
{
    public function open($savePath, $sessionName) {}
    public function close() {}
    public function read($sessionId) {}
    public function write($sessionId, $data) {}
    public function destroy($sessionId) {}
    public function gc($lifetime) {}
}
```

Laravelにはエクステンションを格納するデフォルトのディレクトリはありません。好きな場所に自由に置くことができます。この例では、`MongoSessionHandler`を格納するために、`Extensions`ディレクトリを作成しています。

これらのメソッドの目的は容易に理解できないため、ここで各メソッドの目的を概説します。

<div class="content-list" markdown="1">

- `open`メソッドは通常、ファイルベースのセッションストアシステムで使用します。Laravelには`file`セッションドライバが付属しているため、このメソッドに何も入れる必要があることはまれです。このメソッドは空のままにしておくことができます。
- `open`メソッドと同様に、`close`メソッドも通常は無視できます。ほとんどのドライバにとって、それは必要ありません。
- `read`メソッドは、指定された`$sessionId`に関連付いたセッションデータの文字列バージョンを返す必要があります。Laravelがシリアル化を実行するため、ドライバでセッションデータを取得または保存するときに、シリアル化やその他のエンコードを行う必要はありません。
- `write`メソッドは、`$sessionId`に関連付いた、指定`$data`文字列を、MongoDBや選択した別のストレージシステムなどの永続ストレージシステムに書き込む必要があります。繰り返しになりますが、シリアル化を実行しないでください。Laravelがすでにそれを処理しています。
- `destroy`メソッドは、永続ストレージから`$sessionId`に関連付いたデータを削除する必要があります。
- `gc`メソッドは、指定`$lifetime`(UNIXタイムスタンプ)よりも古いすべてのセッションデータを破棄する必要があります。MemcachedやRedisなどの自己期限切れシステムの場合、このメソッドは空のままにしておくことができます。

</div>

<a name="registering-the-driver"></a>
### ドライバの登録

ドライバを実装したら、Laravelへ登録する準備が済みました。Laravelのセッションバックエンドへドライバを追加するには、`Session`[ファサード](/docs/{{version}}/facades)が提供する`extend`メソッドを使用します。[サービスプロバイダ](/docs/{{version}}/provider)の`boot`メソッドから`extend`メソッドを呼び出す必要があります。これは、既存の`App\Providers\AppServiceProvider`から行うか、もしくはまったく新しいプロバイダを作成することもできます。

```php
<?php

namespace App\Providers;

use App\Extensions\MongoSessionHandler;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\ServiceProvider;

class SessionServiceProvider extends ServiceProvider
{
    /**
     * 全アプリケーションサービスの登録
     */
    public function register(): void
    {
        // ...
    }

    /**
     * 全アプリケーションサービスの初期起動処理
     */
    public function boot(): void
    {
        Session::extend('mongo', function (Application $app) {
            // SessionHandlerInterfaceの実装を返す…
            return new MongoSessionHandler;
        });
    }
}
```

セッションドライバを登録したら、`SESSION_DRIVER`環境変数か、アプリケーションの`config/session.php`設定ファイルで、`mongo`ドライバをアプリケーションのセッションドライバとして指定します。
