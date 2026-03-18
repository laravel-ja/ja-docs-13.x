# Laravel Horizon

- [イントロダクション](#introduction)
- [インストール](#installation)
    - [設定](#configuration)
    - [ダッシュボードの認可](#dashboard-authorization)
    - [最大ジョブ試行回数](#max-job-attempts)
    - [ジョブタイムアウト](#job-timeout)
    - [ジョブ待機時間](#job-backoff)
    - [非表示のジョブ](#silenced-jobs)
- [バランス戦略](#balancing-strategies)
    - [自動バランス](#auto-balancing)
    - [単純バランス](#simple-balancing)
    - [バランス戦略なし](#no-balancing)
- [Horizonのアップグレード](#upgrading-horizon)
- [Horizonの実行](#running-horizon)
    - [Horizonのデプロイ](#deploying-horizon)
- [タグ](#tags)
- [通知](#notifications)
- [メトリクス](#metrics)
- [失敗したジョブの削除](#deleting-failed-jobs)
- [キューのジョブをクリア](#clearing-jobs-from-queues)

<a name="introduction"></a>
## イントロダクション

> [!NOTE]
> Laravel Horizo​​nを掘り下げる前に、Laravelの基本的な[キューサービス](/docs/{{version}}/queues)をよく理解しておく必要があります。Horizo​​nは、Laravelが提供する基本的なキュー機能にまだ慣れていない場合は混乱してしまう可能性がある追加機能であり、Laravelのキューを拡張します。

[Laravel Horizon](https://github.com/laravel/horizon)（ホライズン、地平線）は、Laravelを利用した[Redisキュー](/docs/{{version}}/queues)に美しいダッシュボードとコード駆動型の設定を提供します。Horizo​​nを使用すると、ジョブのスループット、ランタイム、ジョブの失敗など、キューシステムの主要なメトリックを簡単に監視できます。

Horizo​​nを使用する場合、すべてのキューワーカ設定は単一の単純な設定ファイルへ保存します。バージョン管理されたファイルでアプリケーションのワーカ設定を定義することにより、アプリケーションのデプロイ時に、キューワーカを簡単にスケーリングや変更できます。

<img src="https://laravel.com/img/docs/horizon-example.png">

<a name="installation"></a>
## インストール

> [!WARNING]
> Laravel Horizo​​nは、[Redis](https://redis.io)を使用してキューを使用する必要があります。したがって、アプリケーションの`config/queue.php`設定ファイルでキュー接続が`redis`に設定されていることを確認する必要があります。現時点でHorizonは、Redis Clusterと互換性がありません。

Composerパッケージマネージャを使用して、Horizo​​nをプロジェクトにインストールします。

```shell
composer require laravel/horizon
```

Horizo​​nをインストールした後、`horizo​​n:install` Artisanコマンドを使用してアセット公開します。

```shell
php artisan horizon:install
```

<a name="configuration"></a>
### 設定

Horizo​​nのアセットを公開すると、そのプライマリ設定ファイルは`config/horizo​​n.php`へ設置されます。この設定ファイルでアプリケーションのキューワーカオプションを設定できます。各設定オプションにはその目的の説明が含まれているため、このファイルを徹底的に調べてください。

> [!WARNING]
> Horizonは内部で`horizon`という名前のRedis接続を使用します。このRedis接続名は予約語であり、`database.php`設定ファイル中で他のRedis接続に割り当てたり、`horizon.php`設定ファイルの`use`オプションの値に使用したりしてはいけません。

<a name="environments"></a>
#### 環境

インストール後に、よく理解する必要のある主要なHorizo​​n設定オプションは、`environments`設定オプションです。この設定オプションは、アプリケーションを実行する環境の配列であり、各環境のワーカプロセスオプションを定義します。デフォルトのこのエントリは`production`環境と`local`環境です。ただし、環境は必要に応じ自由に追加できます。

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            'maxProcesses' => 10,
            'balanceMaxShift' => 1,
            'balanceCooldown' => 3,
        ],ｑ
    ],

    'local' => [
        'supervisor-1' => [
            'maxProcesses' => 3,
        ],ｑ
    ],
],
```

他に一致する環境が見つからない場合に使用する、ワイルドカード環境（`*`）を定義することもできます。

```php
'environments' => [
    // ...

    '*' => [
        'supervisor-1' => [
            'maxProcesses' => 3,
        ],ｑ
    ],
],
```

Horizo​​nを起動すると、アプリケーションを実行する環境のワーカプロセス設定オプションが使用されます。通常、環境は`APP_ENV`[環境変数](/docs/{{version}}/configuration#determining-the-current-environment)の値によって決定されます。たとえば、デフォルトの`local` Horizo​​n環境は、３つのワーカプロセスを開始し、各キューに割り当てられたワーカプロセスの数のバランスを自動的にとるように設定されています。デフォルトの`production`環境は、最大１０個のワーカプロセスを開始し、各キューに割り当てられたワーカプロセスの数のバランスを自動的にとるように設定されています。

> [!WARNING]
> `horizo​​n`設定ファイルの`environments`部分に、Horizonを実行する予定の各[環境](/docs/{{version}}/configuration#environment-configuration)のエントリを確実に指定してください。

<a name="supervisors"></a>
#### スーパーバイザ

Horizo​​nのデフォルトの設定ファイルでわかるように。各環境には、１つ以上の「スーパーバイザ（supervisor）」を含めることができます。デフォルトでは、設定ファイルはこのスーパーバイザを`supervisor-1`として定義します。ただし、スーパーバイザには自由に名前を付けることができます。各スーパーバイザは、基本的にワーカプロセスのグループを「監視」する責任があり、キュー間でワーカプロセスのバランスを取ります。

特定の環境で実行する必要があるワーカプロセスの新しいグループを定義する場合は、指定環境にスーパーバイザを追加します。アプリケーションが使用する特定のキューへ他のバランス戦略やワーカプロセス数を指定することもできます。

<a name="maintenance-mode"></a>
#### メンテナンスモード

アプリケーションが、[メンテナンスモード](/docs/{{version}}/configuration#maintenance-mode)にあるとき、Horizon設定ファイル内のスーパーバイザの`force`オプションを`true`で定義していない限り、キューに投入するジョブをHorizonは処理しません。

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'force' => true,
        ],ｑ
    ],
],
```

<a name="default-values"></a>
#### デフォルト値

Horizo​​nのデフォルト設定ファイル内に、`defaults`設定オプションがあります。この設定オプションにアプリケーションの[スーパーバイザ](#supervisors)のデフォルト値を指定します。スーパーバイザのデフォルト設定値は、各環境のスーパーバイザの設定にマージされるため、スーパーバイザを定義するときに不必要な繰り返しを回避できます。

<a name="dashboard-authorization"></a>
### ダッシュボードの認可

Horizonダッシュボードは、`/horizon`ルートでアクセスできます。このダッシュボードはデフォルトで、`local`環境でのみアクセスできます。ですが、`app/Providers/HorizonServiceProvider.php`ファイル内には、[認可ゲート](/docs/{{version}}/authorization#gates)の定義があります。この認可ゲートは、**非ローカル**環境におけるHorizonへのアクセスを制御します。Horizonインストールへのアクセスを制限するため、このゲートを必要に応じて自由に変更してください。

```php
/**
 * Horizonゲートの登録
 *
 * このゲートは非ローカル環境で、Horizonへアクセスできるユーザーを決定する。
 */
protected function gate(): void
{
    Gate::define('viewHorizon', function (User $user) {
        return in_array($user->email, [
            'taylor@laravel.com',
        ]);
    });
}
```

<a name="alternative-authentication-strategies"></a>
#### その他の認証戦略

Laravelは、認証したユーザーをゲートクロージャへ自動的に依存注入することを忘れないでください。アプリケーションがIP制限など別の方法でHorizonセキュリティを提供している場合、Horizonユーザーは「ログイン」する必要がない場合があります。したがって、Laravelの認証を必要としないようにするため、上記の`function (User $user)`クロージャの引数を`function (User $user = null)`に変更する必要があるでしょう。

<a name="max-job-attempts"></a>
### 最大ジョブ試行回数

> [!NOTE]
> これらのオプションを調整する前に、Laravelのデフォルトの[キューサービス](/docs/{{version}}/queues#max-job-attempts-and-timeout)と「試行回数」の概念に確実に精通してください。

ジョブがスーパーバイザの構成内で利用できる最大試行回数を定義します。

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'tries' => 10,
        ],ｑ
    ],
],
```

> [!NOTE]
> このオプションは、Artisanコマンドでキューを処理するときの`--tries` オプションと類似しています。

`tries`オプションの調整は、`WithoutOverlapping`や`RateLimited`などのミドルウェアを使用する際に不可欠です。これらのミドルウェアは試行回数を消費するからです。これに対応するため、`tries`の設定値をスーパーバイザーレベルで調整するか、ジョブクラスで`$tries`プロパティを定義することで対応します。

`tries`オプションを設定しない場合、Horizonはデフォルトで１回だけ試行します。ただし、ジョブクラスで`$tries`を定義している場合は、その設定をHorizonの設定よりも優先します。

`tries`か`$tries`を0に設定すると、試行が無制限になります。これは、試行回数が不明な場合に最適です。失敗を無限に繰り返すのを防ぐため、ジョブクラスに`$maxExceptions`プロパティを設定し、許可する例外の数を制限できます。

<a name="job-timeout"></a>
### ジョブタイムアウト

同様に、スーパーバイザレベルで`timeout`値を設定できます。この値は、ワーカプロセスがジョブを実行できる秒数を指定し、その時間が経過すると強制的に終了します。終了後、ジョブはキュー設定に従い再試行するか、失敗としてマークします。

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...¨
            'timeout' => 60,
        ],ｑ
    ],
],
```

> [!WARNING]
> `auto`バランス戦略を使用する場合、Horizonは進行中のワーカを「停止状態」と見なし、スケールダウン時にHorizonのタイムアウト経過後に強制終了します。Horizonのタイムアウトは常にジョブレベルのタイムアウトよりも長く設定してください。そうしないと、ジョブが実行途中で終了する可能性があります。加えて、`timeout`の値は、常に`config/queue.php`設定ファイルで定義した`retry_after`の値よりも、数秒短く設定する必要があります。そうしないと、ジョブが２回処理される可能性があります。

<a name="job-backoff"></a>
### ジョブ待機時間

`backoff`値をスーパーバイザレベルで定義することで、Horizonが未処理の例外が発生したジョブを再試行する前に、待機する時間を指定できます。

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'backoff' => 10,
        ],ｑ
    ],
],
```

「指数関数的」に待機時間を設定するには、`backoff`値に配列を使用します。以下の例では、最初の再試行の遅延は１秒、２回目の再試行は５秒、３回目の再試行は１０、それ以降の再試行で試行回数が残っていれば毎回１０秒ずつ遅延します。

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'backoff' => [1, 5, 10],
        ],ｑ
    ],
],
```

<a name="silenced-jobs"></a>
### 非表示のジョブ

アプリケーションやサードパーティパッケージが送信する特定のジョブを見たくない場合があるでしょう。こうしたジョブで「完了したジョブ」リスト上の領域を占有させずに、非表示にできます。最初の方法は、アプリケーションの`horizon`設定ファイルにある、`silenced`設定オプションへジョブのクラス名を追加します。

```php
'silenced' => [
    App\Jobs\ProcessPodcast::class,
],
```

個々のジョブクラスを非表示にする機能に加え、Horizonでは[タグ](#tags)に基づくジョブの非表示もサポートしています。共通のタグを持つ複数のジョブを非表示にしたい場合に便利です。

```php
'silenced_tags' => [
    'notifications'
],
```

別の方法は、表示しないジョブへ`Laravel\Horizon\Contracts\Silenced`インターフェイスを実装します。このインターフェイスを実装したジョブは、`silenced`設定配列に存在しなくても、自動的に表示しません。

```php
use Laravel\Horizon\Contracts\Silenced;

class ProcessPodcast implements ShouldQueue, Silenced
{
    use Queueable;

    // ...
}
```

<a name="balancing-strategies"></a>
## バランス戦略

各スーパーバイザーは、１つ以上のキューを処理できますが、Laravelのデフォルトのキューシステムとは異なり、Horizonでは３つのワーカバランス戦略を選択できます。`auto`、`simple`、`false`です。

<a name="auto-balancing"></a>
### 自動バランス

`auto`戦略（デフォルトの戦略）は、キューの現在の負荷に基づいて、各キューごとのワーカプロセスの数を調整します。例えば、`notifications`キューに1,000件の未処理ジョブがあり、一方で`default`キューが空の場合、Horizonは`notifications`キューへ追加のワーカを割り当て、キューが空になるまで継続します。

`auto`戦略を採用する場合、`minProcesses`と`maxProcesses`設定オプションを構成することもできます。

<div class="content-list" markdown="1">

- `minProcesses`は、各キューあたりのワーカプロセスの最小数を定義します。この値は1以上でなければなりません。
- `maxProcesses`は、Horizonがすべてのキューに渡りスケールアップできるワーカプロセスの最大総数を定義します。この値は通常、キューの数に`minProcesses`の値を乗じた値よりも大きくする必要があります。スーパーバイザがプロセスを起動しないようにするには、この値を0に設定してください。

</div>

例えば、各キューごとに最低１つのプロセスを維持し、合計で１０個のワーカプロセスまでスケールアップするようにHorizonを構成してみましょう。

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            'connection' => 'redis',
            'queue' => ['default', 'notifications'],
            'balance' => 'auto',
            'autoScalingStrategy' => 'time',
            'minProcesses' => 1,
            'maxProcesses' => 10,
            'balanceMaxShift' => 1,
            'balanceCooldown' => 3,
        ],ｑ
    ],
],
```

`autoScalingStrategy`設定オプションは、Horizonがキューに追加のワーカプロセスを割り当てる方法を決定します。２つの戦略から選択できます。

<div class="content-list" markdown="1">

- `time`戦略は、キューをクリアするのにかかる総推定時間に基づいてワーカを割り当てます。
- `size`戦略は、キュー内のジョブ総数に基づいてワーカを割り当てます。

</div>

`balanceMaxShift`および`balanceCooldown`の設定値は、Horizonがワーカの需要に対応するためにスケールする速度を決定します。上記の例では、毎秒3秒ごとに最大１つの新しいプロセスを作成または破棄します。アプリケーションの要件に応じ、これらの値を必要に合わせて自由に調整してください。

<a name="auto-queue-priorities"></a>
#### キューの優先順位と自動バランス調整

`auto`バランス戦略を使用する場合、Horizonはキュー間の厳格な優先順位を強制しません。スーパーバイザの構成におけるキューの順序は、ワーカプロセスの割り当て方法に影響を与えません。代わりに、Horizonは選択された`autoScalingStrategy`に基づいて、キューの負荷に応じてワーカプロセスを動的に割り当てます。

例えば、以下の構成では、リストの最初に表示されているにもかかわらず、highキューをdefaultキューよりも優先しません。

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'queue' => ['high', 'default'],
            'minProcesses' => 1,
            'maxProcesses' => 10,
        ],ｑ
    ],
],
```

キュー間の相対的な優先順位を強制する必要がある場合は、複数のスーパーバイザを定義し、処理リソースを明示的に割り当てる必要があります。

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'queue' => ['default'],
            'minProcesses' => 1,
            'maxProcesses' => 10,
        ],ｑ
        'supervisor-2' => [
            // ...
            'queue' => ['images'],
            'minProcesses' => 1,
            'maxProcesses' => 1,
        ],ｑ
    ],
],
```

この例では、デフォルトの`queue`は最大１０プロセスまでスケールアップ可能ですが、`images`キューは１プロセスに制限しています。この構成により、キューが独立してスケールできるようになります。

> [!NOTE]
> リソースを大量に消費するジョブを実行するときは、`maxProcesses`値を制限した専用のキューに割り当てるのが最善の策です。そうしないと、これらのジョブが過剰なCPUリソースを消費し、システムを過負荷状態に陥らせる可能性があります。

<a name="simple-balancing"></a>
### 単純バランス

`simple`戦略は、指定したキューにワーカプロセスを均等に分散します。この戦略では、Horizonはワーカプロセスの数を自動的にスケールしません。代わりに、固定数のプロセスを使用します。

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'queue' => ['default', 'notifications'],
            'balance' => 'simple',
            'processes' => 10,
        ],ｑ
    ],
],
```

上記の例では、Horizonは合計１０を均等に分割し、両キューに５つのプロセスを割り当てます。

各キューに割り当てるワーカプロセスの数を個別に制御したい場合は、複数のスーパーバイザを定義できます。

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'queue' => ['default'],
            'balance' => 'simple',
            'processes' => 10,
        ],ｑ
        'supervisor-notifications' => [
            // ...
            'queue' => ['notifications'],
            'balance' => 'simple',
            'processes' => 2,
        ],ｑ
    ],
],
```

この設定により、Horizonは`default`キューに１０プロセス、`notifications`キューに２プロセスを割り当てます。

<a name="no-balancing"></a>
### バランス戦略なし

`balance`オプションを`false`に設定している場合、Horizonはキューをリスト順序通りに厳密に処理します。これはLaravelのデフォルトのキューシステムに類似しています。ただし、ジョブが蓄積し始めた場合、ワーカプロセスの数をスケールアップします。

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'queue' => ['default', 'notifications'],
            'balance' => false,
            'minProcesses' => 1,
            'maxProcesses' => 10,
        ],ｑ
    ],
],
```

上記の例では、`default`キューのジョブは常に`notifications`キューのジョブよりも優先されます。例えば、`default`キューに 1,000 件のジョブがあり、`notifications`キューに 10 件しかない場合、Horizon は`notifications`キューのジョブを処理する前に、`default`キューのすべてのジョブを完全に処理します。

Horizonのワーカプロセスのスケーリング機能を制御するため、`minProcesses`と`maxProcesses`オプションを使用できます。

<div class="content-list" markdown="1">

- `minProcesses` は、総ワーカプロセスの最小数を定義します。この値は１以上でなければなりません。
- `maxProcesses` は、Horizon がスケールアップできる総ワーカプロセスの最大数を定義します。

</div>

<a name="upgrading-horizon"></a>
## Horizonのアップグレード

Horizonの新しいメジャーバージョンへアップグレードするときは、[アップグレードガイド](https://github.com/laravel/horizon/blob/master/UPGRADE.md)を注意深く確認することが重要です。

<a name="running-horizon"></a>
## Horizonの実行

アプリケーションの`config/horizo​​n.php`設定ファイルでスーパーバイザとワーカを設定したら、`horizo​​n` Artisanコマンドを使用してHorizo​​nを起動できます。この単一のコマンドは、現在の環境用に設定されたすべてのワーカプロセスを開始します。

```shell
php artisan horizon
```

`horizo​​n:pause`と`horizo​​n:continue` Artisanコマンドで、Horizo​​nプロセスを一時停止したり、ジョブの処理を続行するように指示したりできます。

```shell
php artisan horizon:pause

php artisan horizon:continue
```

`horizo​​n:pause-supervisor`と`horizo​​n:continue-supervisor` Artisanコマンドを使用して、特定のHorizo​​n[スーパーバイザ](#supervisors)を一時停止／続行することもできます。

```shell
php artisan horizon:pause-supervisor supervisor-1

php artisan horizon:continue-supervisor supervisor-1
```

`horizo​​n:status` Artisanコマンドを使用して、Horizo​​nプロセスの現在のステータスを確認できます。

```shell
php artisan horizon:status
```

特定のHorizon [スーパーバイザ](#supervisors)の現在のステータスは、`horizon:supervisor-status` Artisanコマンドを使い、確認できます。

```shell
php artisan horizon:supervisor-status supervisor-1
```

`horizo​​n:terminate` Artisanコマンドを使用して、Horizo​​nプロセスを正常に終了できます。現在処理されているジョブがすべて完了してから、Horizo​​nは実行を停止します。

```shell
php artisan horizon:terminate
```

<a name="automatically-restarting-horizon"></a>
#### Horizonの自動再起動

ローカルでの開発中は、`horizon:listen`コマンドを実行してください。`horizon:listen`コマンドを使用すれば、更新したコードを読み込むためにHorizonを手作業で再起動する必要はありません。この機能を使用する前に、ローカル開発環境へ[Node](https://nodejs.org)がインストールされていることを確認してください。さらに、ファイル監視ライブラリである[Chokidar](https://github.com/paulmillr/chokidar)をプロジェクトへインストールする必要があります。

```shell
npm install --save-dev chokidar
```

Chokidarをインストールしたら、`horizon:listen`コマンドを使ってHorizonを起動します。

```shell
php artisan horizon:listen
```

DockerやVagrant内で実行する場合は、`--poll`オプションを使用します。

```shell
php artisan horizon:listen --poll
```

アプリケーションの`config/horizon.php`設定ファイル内の、`watch`設定オプションを使用して、監視対象のディレクトリやファイルを設定します。

```php
'watch' => [
    'app',
    'bootstrap',
    'config',
    'database',
    'public/**/*.php',
    'resources/**/*.php',
    'routes',
    'composer.lock',
    '.env',
],
```

<a name="deploying-horizon"></a>
### Horizonのデプロイ

Horizo​​nをアプリケーションの実際のサーバにデプロイする準備ができたら、`php artisan horizo​​n`コマンドを監視するようにプロセスモニタを設定し、予期せず終了した場合は再起動する必要があります。心配ありません。以下からプロセスモニタのインストール方法について説明します。

アプリケーションのデプロイメントプロセス中で、Horizo​​nプロセスへ終了するように指示し、プロセスモニターによって再起動され、コードの変更を反映するようにする必要があります。

```shell
php artisan horizon:terminate
```

<a name="installing-supervisor"></a>
#### Supervisorのインストール

SupervisorはLinuxオペレーティングシステムのプロセスモニタであり、実行が停止すると`horizon`プロセスを自動的に再起動してくれます。UbuntuにSupervisorをインストールするには、次のコマンドを使用できます。Ubuntuを使用していない場合は、オペレーティングシステムのパッケージマネージャを使用してSupervisorをインストールしてください。

```shell
sudo apt-get install supervisor
```

> [!NOTE]
> もしSupervisorを自分で設定するのが大変そうに思えるなら、Laravelアプリケーションのバックグラウンドプロセスを管理できる[Laravel Cloud](https://cloud.laravel.com)の使用を検討してください。

<a name="supervisor-configuration"></a>
#### Supervisor設定

Supervisor設定ファイルは通常、サーバの`/etc/supervisor/conf.d`ディレクトリ内に保管されます。このディレクトリ内に、プロセスの監視方法をスSupervisorに指示する設定ファイルをいくつでも作成できます。たとえば、`horizo​​n`プロセスを開始および監視する`horizo​​n.conf`ファイルを作成しましょう。

```ini
[program:horizon]
process_name=%(program_name)s
command=php /home/forge/example.com/artisan horizon
autostart=true
autorestart=true
user=forge
redirect_stderr=true
stdout_logfile=/home/forge/example.com/horizon.log
stopwaitsecs=3600
```

Supervisorの設定を定義する際には、`stopwaitsecs`の値が、最も長く実行されるジョブが費やす秒数より確実に大きくしてください。そうしないと、Supervisorが処理を終える前にジョブを強制終了してしまう可能性があります。

> [!WARNING]
> 上記の設定例は、Ubuntuベースのサーバで有効ですが、Supervisor設定ファイルの場所とファイル拡張子は、他のサーバオペレーティングシステムで異なる場合があります。詳細は、お使いのサーバのマニュアルを参照してください。

<a name="starting-supervisor"></a>
#### Supervisorの開始

設定ファイルを作成したら、以下のコマンドを使用して、Supervisor設定を更新し、監視対象プロセスを開始できます。

```shell
sudo supervisorctl reread

sudo supervisorctl update

sudo supervisorctl start horizon
```

> [!NOTE]
> Supervisorの実行の詳細は、[Supervisorのドキュメント](http://supervisord.org/index.html)を参照してください。

<a name="tags"></a>
## タグ

Horizo​​nを使用すると、メール可能、ブロードキャストイベント、通知、キュー投入するイベントリスナなどのジョブに「タグ」を割り当てることができます。実際、Horizo​​nは、ジョブに関連付けられているEloquentモデルに応じて、ほとんどのジョブにインテリジェントかつ自動的にタグを付けます。たとえば、以下のジョブを見てみましょう。

```php
<?php

namespace App\Jobs;

use App\Models\Video;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class RenderVideo implements ShouldQueue
{
    use Queueable;

    /**
     * 新しいジョブインスタンスの生成
     */
    public function __construct(
        public Video $video,
    ) {}

    /**
     * 仕事を実行
     */
    public function handle(): void
    {
        // ...
    }
}
```

このジョブが`id`属性は`1`の`App\Models\Video`インスタンスでキューに投入されると、タグ`App\Models\Video:1`が自動的に付けられます。これは、Horizo​​nがジョブのプロパティでEloquentモデルを検索するためです。Eloquentモデルが見つかった場合、Horizo​​nはモデルのクラス名と主キーを使用してジョブにインテリジェントにタグを付けます。

```php
use App\Jobs\RenderVideo;
use App\Models\Video;

$video = Video::find(1);

RenderVideo::dispatch($video);
```

<a name="manually-tagging-jobs"></a>
#### ジョブに手作業でタグ付ける

Queueableオブジェクトの１つにタグを手作業で定義する場合は、クラスに`tags`メソッドを定義します。

```php
class RenderVideo implements ShouldQueue
{
    /**
     * このジョブへ割り当てるべきタグを取得
     *
     * @return array<int, string>
     */
    public function tags(): array
    {
        return ['render', 'video:'.$this->video->id];
    }
}
```

<a name="manually-tagging-event-listeners"></a>
#### 手作業によるイベントリスナのタグ付け

キュー投入したイベントリスナのタグを取得する場合、イベントのデータをタグへ追加できるように、Horizonは自動的にそのイベントインスタンスを`tags`メソッドへ渡します。

```php
class SendRenderNotifications implements ShouldQueue
{
    /**
     * このリスナへ割り当てるべきタグを取得
     *
     * @return array<int, string>
     */
    public function tags(VideoRendered $event): array
    {
        return ['video:'.$event->video->id];
    }
}
```

<a name="notifications"></a>
## 通知

> [!WARNING]
> SlackまたはSMS通知を送信するようにHorizo​​nを設定する場合は、[関連する通知チャネルの前提条件](/docs/{{version}}/notifications)を確認する必要があります。

キューの１つに長い待機時間があったときに通知を受け取りたい場合は、`Horizo​​n::routeMailNotificationsTo`、`Horizo​​n::routeSlackNotificationsTo`、および`Horizo​​n::routeSmsNotificationsTo`メソッドが使用できます。これらのメソッドは、アプリケーションの`App\Providers\Horizo​​nServiceProvider`の`boot`メソッドから呼び出せます。

```php
/**
 * 全アプリケーションサービスの初期起動処理
 */
public function boot(): void
{
    parent::boot();

    Horizon::routeSmsNotificationsTo('15556667777');
    Horizon::routeMailNotificationsTo('example@example.com');
    Horizon::routeSlackNotificationsTo('slack-webhook-url', '#channel');
}
```

<a name="configuring-notification-wait-time-thresholds"></a>
#### 待機通知の時間のしきい値の設定

アプリケーションの`config/horizo​​n.php`設定ファイル内で「長時間待機」と見なす秒数を設定できます。このファイル内の`waits`設定オプションを使用すると、各接続/キューの組み合わせの長時間待機しきい値を制御できます。未定義の接続／キューの組み合わせの、長時間待機時間のしきい値はデフォルトで６０秒です。

```php
'waits' => [
    'redis:critical' => 30,
    'redis:default' => 60,
    'redis:batch' => 120,
],
```

キューのしきい値を`0`に設定すると、そのキューに対する長時間待機通知が無効になります。

<a name="metrics"></a>
## メトリクス

Horizonは、ジョブおよびキューの待ち時間とスループットに関する情報を提供する、メトリクスダッシュボードを用意しています。このダッシュボードを表示するには、アプリケーションの`routes/console.php`ファイルで、Horizonの`snapshot` Artisanコマンドを５分ごとに実行するように設定する必要があります。

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('horizon:snapshot')->everyFiveMinutes();
```

メトリクスデータをすべて削除したい場合は、`horizon:clear-metrics` Artisanコマンドを呼び出します。

```shell
php artisan horizon:clear-metrics
```

<a name="deleting-failed-jobs"></a>
## 失敗したジョブの削除

失敗したジョブを削除したい場合は、`horizo​​n:forget`コマンドを使用します。`horizo​​n:forget`コマンドは、失敗したジョブのIDかUUIDを唯一の引数に取ります。

```shell
php artisan horizon:forget 5
```

失敗したジョブをすべて削除したい場合は、`horizon:forget`コマンドに`--all`オプションを指定します：

```shell
php artisan horizon:forget --all
```

<a name="clearing-jobs-from-queues"></a>
## キューのジョブをクリア

アプリケーションのデフォルトキューからすべてのジョブを削除する場合は、`horizo​​n:clear` Artisanコマンドを使用して削除します。

```shell
php artisan horizon:clear
```

特定のキューからジョブを削除するために`queue`オプションが指定できます。

```shell
php artisan horizon:clear --queue=emails
```
