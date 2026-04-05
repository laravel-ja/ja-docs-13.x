# アップグレードガイド

- [12.xから13.0へのアップグレード](#upgrade-13.0)
    - [AIを使用したアップグレード](#upgrading-using-ai)

<a name="high-impact-changes"></a>
## 影響度の高い変更

<div class="content-list" markdown="1">

- [依存パッケージの更新](#updating-dependencies)
- [Laravelインストーラのアップデート](#updating-the-laravel-installer)
- [リクエストフォージェリ保護](#request-forgery-protection)

</div>

<a name="medium-impact-changes"></a>
## 影響度が中程度の変更

<div class="content-list" markdown="1">

- [キャッシュの`serializable_classes`設定](#cache-serializable_classes-configuration)
- [MySQLまたはMariaDBを使用したデータベースの`upsert`](#database-upsert-mariadb-mysql)
</div>

<a name="low-impact-changes"></a>
## 影響度の低い変更

<div class="content-list" markdown="1">

- [キャッシュプレフィックスとセッションクッキー名](#cache-prefixes-and-session-cookie-names)
- [コレクションモデルのシリアライゼーションによるEagerロード済みリレーションの復元](#collection-model-serialization-restores-eager-loaded-relations)
- [`Container::call`とNullableクラスのデフォルト値](#containercall-and-nullable-class-defaults)
- [ドメインルート登録の優先順位](#domain-route-registration-precedence)
- [`JobAttempted`イベントのエクセプションペイロード](#jobattempted-event-exception-payload)
- [マネージャの`extend`コールバックのバインディング](#manager-extend-callback-binding)
- [`JOIN`、`ORDER BY`、`LIMIT`を伴うMySQLの`DELETE`クエリ](#mysql-delete-queries-with-join-order-by-and-limit)
- [ペジネーションのBootstrapビュー名](#pagination-bootstrap-view-names)
- [ポリモーフィックなピボットテーブル名の生成](#polymorphic-pivot-table-name-generation)
- [`QueueBusy`イベントのプロパティ名の変更](#queuebusy-event-property-rename)
- [テスト間での`Str`ファクトリのリセット](#str-factories-reset-between-tests)

</div>

<a name="upgrade-13.0"></a>
## 12.xから13.0へのアップグレード

#### 推定アップグレード時間：10分

> [!NOTE]
> 私たちは、考えられるすべての破壊的変更をドキュメント化するよう努めています。これらの破壊的変更の中には、フレームワークの目立たない部分にあるものもあるため、実際にアプリケーションに影響を与えるのはこれらの変更の一部のみである可能性があります。時間を節約するために、[Shift](https://laravelshift.com)を利用することもできます。ShiftはLaravelのアップグレードを自動化する、コミュニティによってメンテナンスされているサービスです。

<a name="upgrading-using-ai"></a>
### AIを使用したアップグレード

[Laravel Boost](https://github.com/laravel/boost)を使用して、アップグレードを自動化できます。BoostはファーストパーティのMCPサーバであり、AIアシスタントにガイド付きのアップグレードプロンプトを提供します。Laravel 12アプリケーションにインストールしたら、Claude Code、Cursor、OpenCode、Gemini、VS Codeで`/upgrade-laravel-v13`スラッシュコマンドを使用して、Laravel 13へのアップグレードを開始してください。このコマンドにはLaravel Boostの`^2.0`が必要です。

<a name="updating-dependencies"></a>
### 依存パッケージのアップデート

**影響の可能性： 高い**

アプリケーションの`composer.json`ファイルにある、以下の依存パッケージを更新してください。

<div class="content-list" markdown="1">

- `laravel/framework`を`^13.0`へ
- `laravel/boost` を `^2.0`へ
- `laravel/tinker`を`^3.0`へ
- `phpunit/phpunit`を`^12.0`へ
- `pestphp/pest`を`^4.0`へ

</div>

<a name="updating-the-laravel-installer"></a>
### Laravelインストーラのアップデート

新しいLaravelアプリケーションを作成するためにLaravelインストーラCLIツールを使用している場合は、Laravel 13.xとの互換性のためにインストーラのインストールをアップデートしてください。

`composer global require`経由でLaravelインストーラをインストールした場合は、`composer global update`を使用してインストーラをアップデートできます。

```shell
composer global update laravel/installer
```

または、[Laravel Herd](https://herd.laravel.com)バンドルのLaravelインストーラを使用している場合は、Herdインストールを最新リリースへ更新してください。

<a name="cache"></a>
### キャッシュ

<a name="cache-prefixes-and-session-cookie-names"></a>
#### キャッシュプレフィックスとセッションクッキー名

**影響の可能性： 低い**

LaravelのデフォルトのキャッシュとRedisキーのプレフィックスは、ハイフンでつながれたサフィックスを使用するようになりました。さらに、デフォルトのセッションクッキー名は、アプリケーション名に`Str::snake(...)`を使用するようになりました。

ほとんどのアプリケーションでは、アプリケーションレベルの設定ファイルで既にこれらの値を定義しているため、この変更は適用されません。これは主に、対応するアプリケーション設定値が存在しない場合にフレームワークレベルのフォールバック設定に依存しているアプリケーションに影響します。

アプリケーションがこれらの生成されたデフォルト値に依存している場合、アップグレード後にキャッシュキーとセッションクッキー名が変わる可能性があります。

```php
// Laravel <= 12.x
Str::slug((string) env('APP_NAME', 'laravel'), '_').'_cache_';
Str::slug((string) env('APP_NAME', 'laravel'), '_').'_database_';
Str::slug((string) env('APP_NAME', 'laravel'), '_').'_session';

// Laravel >= 13.x
Str::slug((string) env('APP_NAME', 'laravel')).'-cache-';
Str::slug((string) env('APP_NAME', 'laravel')).'-database-';
Str::snake((string) env('APP_NAME', 'laravel')).'_session';
```

以前の挙動を維持するには、環境変数で`CACHE_PREFIX`、`REDIS_PREFIX`、`SESSION_COOKIE`を明示的に設定してください。

<a name="store-and-repository-contracts-touch"></a>
#### `Store`および`Repository`契約：`touch`

**影響の可能性： とても低い**

キャッシュ契約に、アイテムのTTLを延長するための`touch`メソッドを含めました。カスタムキャッシュストアの実装をメンテナンスしている場合は、このメソッドを追加してください。

```php
// Illuminate\Contracts\Cache\Store
public function touch($key, $seconds);
```

<a name="cache-serializable_classes-configuration"></a>
#### キャッシュの`serializable_classes`設定

**影響の可能性：　中程度**

デフォルトのアプリケーション`cache`設定へ、`false`に設定した`serializable_classes`オプションを含めました。これにより、アプリケーションの`APP_KEY`が漏洩した場合のPHPデシリアライゼーションガジェットチェーン攻撃を防ぐために、キャッシュのアンシリアライズ挙動が強化しました。アプリケーションが意図的にPHPオブジェクトをキャッシュに保存している場合は、アンシリアライズを許可するクラスを明示的にリストする必要があります。

```php
'serializable_classes' => [
    App\Data\CachedDashboardStats::class,
    App\Support\CachedPricingSnapshot::class,
],
```

アプリケーションが以前、任意のキャッシュ済みオブジェクトのアンシリアライズに依存していた場合は、その使用方法を明示的なクラスの許可リストまたは非オブジェクトのキャッシュペイロード（配列など）に移行する必要があります。

<a name="container"></a>
### コンテナ

<a name="containercall-and-nullable-class-defaults"></a>
#### `Container::call`とNullableクラスのデフォルト値

**影響の可能性： 低い**

`Container::call`は、バインディングが存在しない場合にNullableなクラスパラメータのデフォルト値を尊重するようになりました。これはLaravel12で導入されたコンストラクタ注入の挙動と一致します。

```php
$container->call(function (?Carbon $date = null) {
    return $date;
});

// Laravel <= 12.x: Carbonインスタンス
// Laravel >= 13.x: null
```

メソッド呼び出し依存注入のロジックが、以前の挙動に依存していた場合は、アップデートが必要になる可能性があります。

<a name="contracts"></a>
### 契約

<a name="dispatcher-contract-dispatchafterresponse"></a>
#### `Dispatcher`契約：`dispatchAfterResponse`

**影響の可能性： とても低い**

`Illuminate\Contracts\Bus\Dispatcher`契約へ、`dispatchAfterResponse($command, $handler = null)`メソッドを含めました。

カスタムディスパッチャの実装をメンテナンスしている場合は、このメソッドをクラスへ追加してください。

<a name="responsefactory-contract-eventstream"></a>
#### `ResponseFactory`契約：`eventStream`

**影響の可能性： とても低い**

`Illuminate\Contracts\Routing\ResponseFactory`契約へ、`eventStream`シグネチャを含めました。。

この契約のカスタム実装をメンテナンスしている場合は、このメソッドを追加してください。

<a name="mustverifyemail-contract-markemailasunverified"></a>
#### `MustVerifyEmail`契約：`markEmailAsUnverified`

**影響の可能性： とても低い**

`Illuminate\Contracts\Auth\MustVerifyEmail`契約へ、`markEmailAsUnverified()`を含めました。

この契約のカスタム実装を提供している場合は、互換性を維持するためにこのメソッドを追加してください。

<a name="database"></a>
### データベース

<a name="database-upsert-mariadb-mysql"></a>
#### MySQLまたはMariaDBを使用したデータベースの`upsert`

**影響の可能性：　中**

Laravelは、呼び出し元が`uniqueBy`に空でない値を指定しているかをバリデートするようにしました。空の場合、無効なSQLを生成する代わりに`InvalidArgumentException`を投げます。

MariaDBとMySQLのデータベースドライバは`uniqueBy`の値を無視し、常にテーブルのプライマリキーとユニークインデックスを使用して既存のレコードを検出しますが、このバリデーションは依然として適用されます。`uniqueBy`が空の場合、`InvalidArgumentException`を投げます。

<a name="mysql-delete-queries-with-join-order-by-and-limit"></a>
#### `JOIN`、`ORDER BY`、`LIMIT`を伴うMySQLの`DELETE`クエリ

**影響の可能性： 低い**

Laravelは、MySQL文法において`ORDER BY`と`LIMIT`を含む完全な`DELETE ... JOIN`クエリをコンパイルするようにしました。

以前のバージョンでは、結合した削除において`ORDER BY`／`LIMIT`句が黙って無視されることがありました。Laravel13では、これらの句を生成するSQLへ含めます。その結果、この構文をサポートしていないデータベースエンジン（標準的なMySQL／MariaDBバリアントなど）は、制限のない削除を実行する代わりに`QueryException`を投げる可能性があります。

<a name="eloquent"></a>
### Eloquent

<a name="model-booting-and-nested-instantiation"></a>
#### モデルの初期起動とネストしたインスタンス化

**影響の可能性： とても低い**

モデルがまだブートしている間にそのモデルの新しいインスタンスを作成することを許可しなくなり、`LogicException`を投げるようになりました。

これは、モデルの`boot`メソッドまたはトレイトの`boot*`メソッド内からモデルをインスタンス化するコードに影響します。

```php
protected static function boot()
{
    parent::boot();

    // ブート中のインスタンス化は許可されなくなりました
    (new static())->getTable();
}
```

ネストしたブートを避けるために、このロジックをブートサイクルの外に移動してください。

<a name="polymorphic-pivot-table-name-generation"></a>
#### ポリモーフィックなピボットテーブル名の生成

**影響の可能性： 低い**

カスタムピボットモデルクラスを使用してポリモーフィックなピボットモデルのテーブル名が推測される場合、Laravelは複数形の名前を生成するようにしました。

アプリケーションが、モーフピボットテーブルに対して以前の単数形の推測名に依存しており、かつカスタムピボットクラスを使用していた場合は、ピボットモデルでテーブル名を明示的に定義する必要があります。

<a name="collection-model-serialization-restores-eager-loaded-relations"></a>
#### コレクションモデルのシリアライゼーションによるEagerロード済みリレーションの復元

**影響の可能性： 低い**

Eloquentモデルコレクションがシリアライズおよび復元する際（ジョブのキュー投入時など）、コレクションのモデルに対してEagerロード済みリレーションも復元するようになりました。

デシリアライズ後にリレーションが存在しないことに依存しているコードがある場合は、そのロジックを調整する必要があるかもしれません。

<a name="http-client"></a>
### HTTPクライアント

<a name="http-client-response-throw-and-throwif-signatures"></a>
#### HTTPクライアントの`Response::throw`と`throwif`シグネチャ

**影響の可能性： とても低い**

HTTPクライアントのレスポンスメソッドは、メソッドシグネチャでコールバックパラメータを宣言するようにしました。

```php
public function throw($callback = null);
public function throwIf($condition, $callback = null);
```

カスタムレスポンスクラスでこれらのメソッドをオーバーライドしている場合は、メソッドシグネチャに互換性があることを確認してください。

<a name="notifications"></a>
### 通知

<a name="default-password-reset-subject"></a>
#### デフォルトのパスワードリセットの件名

**影響の可能性： とても低い**

Laravelのデフォルトのパスワードリセットメールの件名を変更しました。

```text
// Laravel <= 12.x
Reset Password Notification

// Laravel >= 13.x
Reset your password
```

テスト、アサーション、または翻訳のオーバーライドが以前のデフォルト文字列に依存している場合は、それに応じてアップデートしてください。

<a name="queued-notifications-and-missing-models"></a>
#### キュー投入した通知と見つからないモデル

**影響の可能性： とても低い**

キュー投入済み通知は、通知クラスで定義された`#[DeleteWhenMissingModels]`属性および`$deleteWhenMissingModels`プロパティを尊重するようになりました。

以前のバージョンでは、削除されることを期待していたケースでも、モデルが見つからないことによってキュー投入された通知ジョブが失敗することがありました。

<a name="queue"></a>
### キュー

<a name="jobattempted-event-exception-payload"></a>
#### ``JobAttempted`イベントのエクセプションペイロード

**影響の可能性： 低い**

`Illuminate\Queue\Events\JobAttempted`イベントは、以前のブール値の`$exceptionOccurred`プロパティに代わり、`$exception`を介してエクセプションオブジェクト（または`null`）を提供するようになりました。

```php
// Laravel <= 12.x
$event->exceptionOccurred;

// Laravel >= 13.x
$event->exception;
```

このイベントをリッスンしている場合は、それに応じてリスナのコードをアップデートしてください。

<a name="queuebusy-event-property-rename"></a>
#### `QueueBusy`イベントのプロパティ名の変更

**影響の可能性： 低い**

他のキューイベントとの一貫性を保つため、`Illuminate\Queue\Events\QueueBusy`イベントのプロパティ`$connection`を`$connectionName`に名称変更しました。

リスナが`$connection`を参照している場合は、`$connectionName`にアップデートしてください。

<a name="queue-contract-method-additions"></a>
#### `Queue`契約へのメソッド追加

**影響の可能性： とても低い**

`Illuminate\Contracts\Queue\Queue`契約に、以前はdocblockでのみ宣言されていたキューサイズ検査メソッドを含めるようになりました。

この契約のカスタムキュードライバ実装をメンテナンスしている場合は、以下の実装を追加してください。

<div class="content-list" markdown="1">

- `pendingSize`
- `delayedSize`
- `reservedSize`
- `creationTimeOfOldestPendingJob`

</div>

<a name="routing"></a>
### ルーティング

<a name="domain-route-registration-precedence"></a>
#### ドメインルート登録の優先順位

**影響の可能性： 低い**

ルートマッチングにおいて、明示的なドメインを持つルートが非ドメインルートよりも優先されるようになりました。

これにより、非ドメインルートが先に登録されている場合でも、キャッチオールなサブドメインルートが安定して動作するようになります。アプリケーションがドメインルートと非ドメインルートの間の以前の登録優先順位に依存していた場合は、ルートマッチングの挙動を確認してください。

<a name="scheduling"></a>
### タスクスケジュール

<a name="withscheduling-registration-timing"></a>
#### `withScheduling`の登録タイミング

**影響の可能性： とても低い**

`ApplicationBuilder::withScheduling()`を介して登録されたスケジュールは、`Schedule`が依存解決されるまで延期するようにしました。

アプリケーションが初期起動中の即時スケジュール登録タイミングに依存していた場合は、そのロジックを調整する必要があるかもしれません。

<a name="security"></a>
### セキュリティ

<a name="request-forgery-protection"></a>
#### リクエストフォージェリ保護

**影響の可能性： 高い**

LaravelのCSRFミドルウェアは`VerifyCsrfToken`から`PreventRequestForgery`へ名称変更し、`Sec-Fetch-Site`ヘッダを使用したリクエストオリジンの検証を含むようになりました。

`VerifyCsrfToken`と`ValidateCsrfToken`は非推奨のエイリアスとして残りますが、特にテストやルート定義でミドルウェアを除外する場合は、直接の参照を`PreventRequestForgery`にアップデートする必要があります。

```php
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

// Laravel <= 12.x
->withoutMiddleware([VerifyCsrfToken::class]);

// Laravel >= 13.x
->withoutMiddleware([PreventRequestForgery::class]);
```

ミドルウェア設定APIでも、`preventRequestForgery(...)`を提供するようにしました。

<a name="support"></a>
### サポート

<a name="manager-extend-callback-binding"></a>
#### マネージャの`extend`コールバックの結合

**影響の可能性： 低い**

マネージャの`extend`メソッドを介して登録したカスタムドライバのクロージャは、マネージャインスタンスへ結合するようになりました。

以前、これらのコールバック内で別のバインド済みオブジェクト（サービスプロバイダインスタンスなど）を`$this`として依存していた場合は、`use (...)`を使用してそれらの値をクロージャに取り込むように移動する必要があります。

<a name="str-factories-reset-between-tests"></a>
#### テスト間での`Str`ファクトリのリセット

**影響の可能性： 低い**

Laravelは、テストのティアダウン中にカスタム`Str`ファクトリをリセットするようにしました。

テストが、テストメソッド間で持続するカスタムUUID／ULID／ランダム文字列ファクトリに依存していた場合は、各関連テストまたはセットアップフックでそれらを設定する必要があります。

<a name="jsfrom-uses-unescaped-unicode-by-default"></a>
#### `Js::from`はデフォルトでエスケープされていないUnicodeを使用する

**影響の可能性： とても低い**

`Illuminate\Support\Js::from`は、デフォルトで`JSON_UNESCAPED_UNICODE`を使用するようになりました。

テストやフロントエンドの出力比較がエスケープ済みのUnicodeシーケンス（例：`\u00e8`）に依存している場合は、期待値をアップデートしてください。

<a name="views"></a>
### ビュー

<a name="pagination-bootstrap-view-names"></a>
#### ペジネーションのBootstrapビュー名

**影響の可能性： 低い**

Bootstrap3のデフォルトの内部ペジネーションビュー名を明示的にしました。

```nothing
// Laravel <= 12.x
pagination::default
pagination::simple-default

// Laravel >= 13.x
pagination::bootstrap-3
pagination::simple-bootstrap-3
```

アプリケーションが古いペジネーションビュー名を直接参照している場合は、それらの参照をアップデートしてください。

<a name="miscellaneous"></a>
### その他

`laravel/laravel`の[GitHubリポジトリ](https://github.com/laravel/laravel)で変更点を確認することもお勧めします。これらの変更の多くは必須ではありませんが、これらのファイルをアプリケーションと同期させておきたいと思うかもしれません。これらの変更の一部はこのアップグレードガイドでカバーされていますが、設定ファイルやコメントの変更など、その他の変更はカバーされていません。[GitHubの比較ツール](https://github.com/laravel/laravel/compare/12.x...13.x)を使用して簡単に変更を確認し、自分にとって重要なアップデートを選択できます。
