# Laravel Passport

- [イントロダクション](#introduction)
    - [Passportか？Sanctumか？？](#passport-or-sanctum)
- [インストール](#installation)
    - [Passportのデプロイ](#deploying-passport)
    - [Passportのアップグレード](#upgrading-passport)
- [設定](#configuration)
    - [トークン持続時間](#token-lifetimes)
    - [デフォルトモデルのオーバーライド](#overriding-default-models)
    - [ルートのオーバーライド](#overriding-routes)
- [コードグラントの認証](#authorization-code-grant)
    - [クライアント管理](#managing-clients)
    - [トークンのリクエスト](#requesting-tokens)
    - [トークン管理](#managing-tokens)
    - [トークンのリフレッシュ](#refreshing-tokens)
    - [トークンの取り消し](#revoking-tokens)
    - [トークンの削除](#purging-tokens)
- [PKCEを使った認可コードグラント](#code-grant-pkce)
    - [クライアント生成](#creating-a-auth-pkce-grant-client)
    - [トークンのリクエスト](#requesting-auth-pkce-grant-tokens)
- [デバイス認証グラント](#device-authorization-grant)
    - [デバイスコードグラント認証クライアントの作成](#creating-a-device-authorization-grant-client)
    - [トークンのリクエスト](#requesting-device-authorization-grant-tokens)
- [パスワードグラント](#password-grant)
    - [パスワードグラントクライアントの作成](#creating-a-password-grant-client)
    - [トークンのリクエスト](#requesting-password-grant-tokens)
    - [全スコープの要求](#requesting-all-scopes)
    - [ユーザープロバイダのカスタマイズ](#customizing-the-user-provider)
    - [ユーザー名フィールドのカスタマイズ](#customizing-the-username-field)
    - [パスワードバリデーションのカスタマイズ](#customizing-the-password-validation)
- [暗黙的グラント](#implicit-grant)
- [クライアント認証グラント](#client-credentials-grant)
- [パーソナルアクセストークン](#personal-access-tokens)
    - [パーソナルアクセスクライアントの作成](#creating-a-personal-access-client)
    - [ユーザープロバイダのカスタマイズ](#customizing-the-user-provider-for-pat)
    - [パーソナルアクセストークンの管理](#managing-personal-access-tokens)
- [ルート保護](#protecting-routes)
    - [ミドルウェアによる保護](#via-middleware)
    - [アクセストークンの受け渡し](#passing-the-access-token)
- [トークンのスコープ](#token-scopes)
    - [スコープの定義](#defining-scopes)
    - [デフォルトスコープ](#default-scope)
    - [トークンへのスコープ割り付け](#assigning-scopes-to-tokens)
    - [スコープのチェック](#checking-scopes)
- [SPA認証](#spa-authentication)
- [イベント](#events)
- [テスト](#testing)

<a name="introduction"></a>
## イントロダクション

[Laravel Passport](https://github.com/laravel/passport)は、Laravelアプリケーションへ完全なOAuth2サーバの実装を数分で提供します。Passportは、Andy MillingtonとSimon Hampがメンテナンスしている[League OAuth2 server](https://github.com/thephpleague/oauth2-server)の上に構築しています。

> [!NOTE]
> このドキュメントは、皆さんがOAuth2に慣れていることを前提にしています。OAuth2について知らなければ、この先を続けて読む前に、一般的な[用語](https://oauth2.thephpleague.com/terminology/)とOAuth2の機能について予習してください。

<a name="passport-or-sanctum"></a>
### Passportか？Sanctumか？？

始める前に、アプリケーションがLaravel Passport、もしくは[Laravel Sanctum](/docs/{{version}}/sanctum)のどちらにより適しているかを検討することをお勧めします。アプリケーションが絶対にOAuth2をサポートする必要がある場合は、Laravel　Passportを使用する必要があります。

しかし、シングルページアプリケーションやモバイルアプリケーションを認証したり、APIトークンを発行したりする場合は、[Laravel Sanctum](/docs/{{version}}/sanctum)を使用する必要があります。Laravel SanctumはOAuth2をサポートしていません。ただし、はるかにシンプルなAPI認証開発エクスペリエンスを提供します。

<a name="installation"></a>
## インストール

Laravel Passportは、`install:api` Artisanコマンドでインストールします。

```shell
php artisan install:api --passport
```

このコマンドは、アプリケーションがOAuth2クライアントとアクセストークンを格納するために必要なテーブルを作成するために必要なデータベースのマイグレーションをリソース公開し、実行します。このコマンドは、セキュアなアクセストークンを生成するために必要な暗号化キーも作成します。

`install:api`コマンドを実行したら、`App\Models\User`モデルへ`Laravel\Passport\HasApiTokens`トレイトと`Laravel\Passport\Contracts\OAuthenticatable`インターフェイスを追加してください。このトレイトは、認証済みユーザーのトークンとスコープを検査できる、いくつかのヘルパメソッドをモデルに提供します。

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\Contracts\OAuthenticatable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable implements OAuthenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
}
```

最後に、アプリケーションの`config/auth.php`設定ファイルで、`api`認証ガードを定義して、`driver`オプションを`passport`に設定します。これにより、API リクエストを認証する際に Passportの`TokenGuard`を使用するようアプリケーションに指示します。

```php
'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],

    'api' => [
        'driver' => 'passport',
        'provider' => 'users',
    ],
],
```

<a name="deploying-passport"></a>
### Passportのデプロイ

Passportをアプリケーションのサーバへ初めてデプロイするときは、`passport:keys`コマンドを実行する必要があります。このコマンドは、アクセストークンを生成するためにPassportが必要とする暗号化キーを生成します。生成されたキーは通常、ソース管理しません。

```shell
php artisan passport:keys
```

必要であれば、Passportのキーをロードするパスを定義することもできます。これには`Passport::loadKeysFrom`メソッドを使用します。通常、このメソッドはアプリケーションの`App\Providers\AppServiceProvider`クラスの `boot`メソッドから呼び出します。

```php
/**
 * 全アプリケーションサービスの初期起動処理
 */
public function boot(): void
{
    Passport::loadKeysFrom(__DIR__.'/../secrets/oauth');
}
```

<a name="loading-keys-from-the-environment"></a>
#### 環境からのキーのロード

または、`vendor:publish` Artisanコマンドを使用してPassportの設定ファイルをリソース公開することもできます。

```shell
php artisan vendor:publish --tag=passport-config
```

設定ファイルをリソース公開した後、環境変数として定義することにより、アプリケーションの暗号化キーをロードできます。

```ini
PASSPORT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
<プライベートキーをここに記述>
-----END RSA PRIVATE KEY-----"

PASSPORT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
<パブリックキーをここに記述>
-----END PUBLIC KEY-----"
```

<a name="upgrading-passport"></a>
### Passportのアップグレード

Passportの新しいメジャーバージョンにアップグレードするときは、[アップグレードガイド](https://github.com/laravel/passport/blob/master/UPGRADE.md)を注意深く確認することが重要です。

<a name="configuration"></a>
## 設定

<a name="token-lifetimes"></a>
### トークン持続時間

Passportはデフォルトで、１年後に失効する長寿命のアクセストークンを発行します。トークンの有効期限を長く／短く設定したい場合は、`tokensExpireIn`、`refreshTokensExpireIn`、`personalAccessTokensExpireIn`メソッを使用してください。これらのメソッドは、アプリケーションの `App\Providers\AppServiceProvider`クラスの`boot`メソッドから呼び出す必要があります。

```php
use Carbon\CarbonInterval;

/**
 * 全アプリケーションサービスの初期起動処理
 */
public function boot(): void
{
    Passport::tokensExpireIn(CarbonInterval::days(15));
    Passport::refreshTokensExpireIn(CarbonInterval::days(30));
    Passport::personalAccessTokensExpireIn(CarbonInterval::months(6));
}
```

> [!WARNING]
> Passportのデータベーステーブルの`expires_at`カラムは読み取り専用であり、表示のみを目的としています。トークンを発行するとき、Passportは署名および暗号化されたトークン内に有効期限情報を保存します。トークンを無効にする必要がある場合は、[取り消す](#revoking-tokens)必要があります。

<a name="overriding-default-models"></a>
### デフォルトモデルのオーバーライド

独自のモデルを定義し、対応するPassportモデルを拡張することにより、Passportにより内部的に使用されるモデルを自由に拡張できます。

```php
use Laravel\Passport\Client as PassportClient;

class Client extends PassportClient
{
    // ...
}
```

モデルを定義した後、`Laravel\Passport\Passport`クラスを使い、カスタムモデルを使うようにPassportへ指示できます。通常、アプリケーションの`App\Providers\AppServiceProvider`クラスの`boot`メソッドで、カスタムモデルについてPassportへ通知します。

```php
use App\Models\Passport\AuthCode;
use App\Models\Passport\Client;
use App\Models\Passport\DeviceCode;
use App\Models\Passport\RefreshToken;
use App\Models\Passport\Token;
use Laravel\Passport\Passport;

/**
 * 全アプリケーションサービスの初期起動処理
 */
public function boot(): void
{
    Passport::useTokenModel(Token::class);
    Passport::useRefreshTokenModel(RefreshToken::class);
    Passport::useAuthCodeModel(AuthCode::class);
    Passport::useClientModel(Client::class);
    Passport::useDeviceCodeModel(DeviceCode::class);
}
```

<a name="overriding-routes"></a>
### ルートのオーバーライド

Passportが定義するルートをカスタマイズしたい場合もあるでしょう。そのためには、まずアプリケーションの`AppServiceProvider`の`register`メソッドへ、`Passport::ignoreRoutes`を追加し、Passportが登録したルートを無視する必要があります。

```php
use Laravel\Passport\Passport;

/**
 * 全アプリケーションサービスの登録
 */
public function register(): void
{
    Passport::ignoreRoutes();
}
```

そして、Passport自身の[ルートファイル](https://github.com/laravel/passport/blob/master/routes/web.php)で定義しているルートをアプリケーションの`routes/web.php`ファイルへコピーして、好みに合わせ変更してください。

```php
Route::group([
    'as' => 'passport.',
    'prefix' => config('passport.path', 'oauth'),
    'namespace' => '\Laravel\Passport\Http\Controllers',
], function () {
    // Passportのルート…
});
```

<a name="authorization-code-grant"></a>
## コードグラントの認証

認証コードを介してOAuth2を使用することは、OAuth2を扱う時にほとんどの開発者が精通している方法です。認証コードを使用する場合、クライアントアプリケーションはユーザーをサーバにリダイレクトし、そこでユーザーはクライアントへアクセストークンを発行するリクエストを承認または拒否します。

まず最初に、Passportへ「認証」ビューをどのように返すかを指示する必要があります。

全ての認証ビューのレンダロジックは、`Laravel\Passport\Passport`クラス経由で、利用可能で適切なメソッドを使ってカスタマイズ可能です。通常、アプリケーションの`App\Providers\AppServiceProvider`クラスの`boot`メソッドからこのメソッドを呼び出します。

```php
use Inertia\Inertia;
use Laravel\Passport\Passport;

/**
 * 全アプリケーションサービスの初期起動処理
 */
public function boot(): void
{
    // ビュー名を指定
    Passport::authorizationView('auth.oauth.authorize');

    // クロージャにより指定
    Passport::authorizationView(
        fn ($parameters) => Inertia::render('Auth/OAuth/Authorize', [
            'request' => $parameters['request'],
            'authToken' => $parameters['authToken'],
            'client' => $parameters['client'],
            'user' => $parameters['user'],
            'scopes' => $parameters['scopes'],
        ])
    );
}
```

Passportはこのビューを返す`/oauth/authorize`ルートを自動的に定義します。`auth.oauth.authorize`テンプレートには、承認を行うための`passport.authorizations.approve`ルートへPOSTリクエストを行うフォームと、承認を拒否するための`passport.authorizations.deny`ルートへDELETEリクエストを行うフォームを含める必要があります。`passport.authorizations.approve`ルートと`passport.authorizations.deny`ルートでは、`state`、`client_id`、`auth_token`フィールドを期待しています。

<a name="managing-clients"></a>
### クライアントの管理

あなたのアプリケーションのAPIを操作する必要があるアプリケーションを構築する開発者は、「クライアント」を作成することにより、あなたのアプリケーションへ自分のアプリケーションを登録する必要があります。通常、これはアプリケーションの名前と、ユーザーが認証のリクエストを承認した後に、アプリケーションをリダイレクトできるURIを提供してもらうことから構成されます。

<a name="managing-first-party-clients"></a>
#### ファーストパーティクライアント

クライアントを作成する一番簡単な方法は、`passport:client` Artisanコマンドを使用することです。このコマンドは、ファーストパーティクライアントの作成やOAuth2機能のテストに使用します。`passport:client`コマンドを実行すると、Passportはクライアントに関する詳細情報を求めるプロンプトを表示し、クライアントIDとシークレットを提供します。

```shell
php artisan passport:client
```

クライアントへ複数のリダイレクトURIを許したい場合は、`passport:client`コマンドでURIの入力を求められたときに、カンマ区切りのリストを使って指定してください。カンマを含むURIはすべてURIエンコードされている必要があります：

```shell
https://third-party-app.com/callback,https://example.com/oauth/redirect
```

<a name="managing-third-party-clients"></a>
#### サードパーティクライアント

アプリケーションのユーザーは`passport:client`コマンドを利用できないため、`Laravel\Passport\ClientRepository`クラスの`createAuthorizationCodeGrantClient`メソッドを使用して、指定ユーザーのクライアントを登録してください。

```php
use App\Models\User;
use Laravel\Passport\ClientRepository;

$user = User::find($userId);

// 指定ユーザーに属するOAuthアプリクライアントを作成
$client = app(ClientRepository::class)->createAuthorizationCodeGrantClient(
    user: $user,
    name: 'Example App',
    redirectUris: ['https://third-party-app.com/callback'],
    confidential: false,
    enableDeviceFlow: true
);

// ユーザーに属するすべてのOAuthアプリクライアントを取得
$clients = $user->oauthApps()->get();
```

`createAuthorizationCodeGrantClient`メソッドは`Laravel\Passport\Client`のインスタンスを返します。クライアントIDとして`$client->id`、クライアント秘密鍵として`$client->plainSecret`をユーザーへ表示してください。

<a name="requesting-tokens"></a>
### トークンのリクエスト

<a name="requesting-tokens-redirecting-for-authorization"></a>
#### 許可のリダイレクト

クライアントが作成されると、開発者はクライアントIDとシークレットを使用し、あなたのアプリケーションへ許可コードとアクセストークンをリクエストするでしょう。まず、API利用側アプリケーションは以下のように、あなたのアプリケーションの`/oauth/authorize`ルートへのリダイレクトリクエストを作成する必要があります。

```php
use Illuminate\Http\Request;
use Illuminate\Support\Str;

Route::get('/redirect', function (Request $request) {
    $request->session()->put('state', $state = Str::random(40));

    $query = http_build_query([
        'client_id' => 'your-client-id',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'response_type' => 'code',
        'scope' => 'user:read orders:create',
        'state' => $state,
        // 'prompt' => '', // "none"、"consent"、"login"
    ]);

    return redirect('https://passport-app.test/oauth/authorize?'.$query);
});
```

`prompt`パラメータは、Passportアプリケーションの認証動作を指定するために使用します。

`prompt`の値が`none`の場合、ユーザーがPassportアプリケーションで認証されていないとき、Passportは認証エラーを常時スローします。値が`consent`の場合、すべてのスコープが事前に利用者側アプリケーションへ許可されていても、Passportは常に承認スクリーンを表示します。値が`login`である場合、Passportアプリケーションは、ユーザーが既にセッションを持っていても、アプリケーションへ再ログインするように常に促します。

`prompt`値を指定しない場合、要求されたスコープに対する消費者側アプリケーションへのアクセスをそのユーザーへ以前に許可していない場合のみ、認可のためのプロンプトを表示します。

> [!NOTE]
> `/oauth/authorize`ルートは、すでにPassportが定義づけていることを覚えておいてください。このルートを自分で定義する必要はありません。

<a name="approving-the-request"></a>
#### リクエストの承認

認証リクエストを受け取ると、Passportは`prompt`パラメータが指定されている場合は、その値に基づいて自動的に応答し、認証リクエストを承認または拒否するためのテンプレートをユーザーに表示します。ユーザーがリクエストを承認した場合、消費者側アプリケーションにより指定された、`redirect_uri`へリダイレクトします。この`redirect_uri`は、クライアントが作成されたときに指定した、`redirect` URLと一致しなければなりません。

ファーストパーティクライアントを認証するときなど、認証プロンプトを飛ばしたいことも起きるでしょう。このような場合は、[`Client`モデルを拡張し](#overriding-default-models)、`skipsAuthorization`メソッドを定義すれば実現できます。`skipsAuthorization`が、`true`を返したら、クライアントは承認され、ユーザーはすぐに`redirect_uri`へリダイレクトされます。ただし、消費者側アプリケーションが承認のためのリダイレクト時に、明示的に`prompt`パラメータを設定した場合はこの限りではありません。

```php
<?php

namespace App\Models\Passport;

use Illuminate\Contracts\Auth\Authenticatable;
use Laravel\Passport\Client as BaseClient;

class Client extends BaseClient
{
    /**
     * クライアントが認証プロンプトをスキップするかを決定
     *
     * @param  \Laravel\Passport\Scope[]  $scopes
     */
    public function skipsAuthorization(Authenticatable $user, array $scopes): bool
    {
        return $this->firstParty();
    }
}
```

<a name="requesting-tokens-converting-authorization-codes-to-access-tokens"></a>
#### 許可コードからアクセストークンへの変換

ユーザーが承認リクエストを承認すると、ユーザーは利用側アプリケーションにリダイレクトされます。利用側はまず、リダイレクトの前に保存した値に対して`state`パラメータを確認する必要があります。状態パラメータが一致する場合、利用側はアプリケーションへ`POST`リクエストを発行してアクセストークンをリクエストする必要があります。リクエストには、ユーザーが認証リクエストを承認したときにアプリケーションが発行した認証コードを含める必要があります。

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

Route::get('/callback', function (Request $request) {
    $state = $request->session()->pull('state');

    throw_unless(
        strlen($state) > 0 && $state === $request->state,
        InvalidArgumentException::class,
        'Invalid state value.'
    );

    $response = Http::asForm()->post('https://passport-app.test/oauth/token', [
        'grant_type' => 'authorization_code',
        'client_id' => 'your-client-id',
        'client_secret' => 'your-client-secret',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'code' => $request->code,
    ]);

    return $response->json();
});
```

この`/oauth/token`ルートは、`access_token`、`refresh_token`、`expires_in`属性を含むJSONレスポンスを返します。`expires_in`属性は、アクセストークンが無効になるまでの秒数を含んでいます。

> [!NOTE]
> `/oauth/authorize`ルートと同様に、`/oauth/token`ルートはPassportによって定義されます。このルートを手作業で定義する必要はありません。

<a name="managing-tokens"></a>
### トークン管理

ユーザーの認証済みトークンを取得するには、`Laravel\Passport\HasApiTokens`トレイトの`tokens`メソッドを使ってください。例えば、サードパーティアプリケーションとの接続を追跡するためのダッシュボードをユーザーに提供するために、これを使うことができるでしょう。

```php
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Date;
use Laravel\Passport\Token;

$user = User::find($userId);

// このユーザーの有効なトークンをすべて取得
$tokens = $user->tokens()
    ->where('revoked', false)
    ->where('expires_at', '>', Date::now())
    ->get();

// サードパーティのOAuthアプリクライアントへのユーザーの接続をすべて取得
$connections = $tokens->load('client')
    ->reject(fn (Token $token) => $token->client->firstParty())
    ->groupBy('client_id')
    ->map(fn (Collection $tokens) => [
        'client' => $tokens->first()->client,
        'scopes' => $tokens->pluck('scopes')->flatten()->unique()->values()->all(),
        'tokens_count' => $tokens->count(),
    ])
    ->values();
```

<a name="refreshing-tokens"></a>
### トークンのリフレッシュ

アプリケーションが短期間のアクセストークンを発行する場合、ユーザーはアクセストークンが発行されたときに提供された更新トークンを利用して、アクセストークンを更新する必要があります。

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/token', [
    'grant_type' => 'refresh_token',
    'refresh_token' => 'the-refresh-token',
    'client_id' => 'your-client-id',
    'client_secret' => 'your-client-secret', // 気密性の高いクライアントのみ必須
    'scope' => 'user:read orders:create',
]);

return $response->json();
```

この`/oauth/token`ルートは、`access_token`、`refresh_token`、`expires_in`属性を含むJSONレスポンスを返します。`expires_in`属性は、アクセストークンが無効になるまでの秒数を含んでいます。

<a name="revoking-tokens"></a>
### トークンの取り消し

トークンを取り消すには、`Laravel\Passport\Token`モデルの`revoke`メソッドを使用します。トークンのリフレッシュトークンを取り消すためには、`Laravel\Passport\RefreshToken`モデルの`revoke` メソッドを使用します。

```php
use Laravel\Passport\Passport;
use Laravel\Passport\Token;

$token = Passport::token()->find($tokenId);

// アクセストークンの取り消し
$token->revoke();

// リフレッシュトークンの取り消し
$token->refreshToken?->revoke();

// ユーザーのすべてのトークンを取り消し
User::find($userId)->tokens()->each(function (Token $token) {
    $token->revoke();
    $token->refreshToken?->revoke();
});
```

<a name="purging-tokens"></a>
### トークンの削除

トークンが取り消されたり期限切れになったりした場合は、データベースからトークンを削除することを推奨します。Passportに含まれている`passport:purge` Artisanコマンドでこれを実行できます。

```shell
# 取り消し・期限切れのトークン、認証コード、デバイスコードを削除
php artisan passport:purge

# 期限切れから６時間以上経っているトークンのみ削除
php artisan passport:purge --hours=6

# 取り消したトークン、認証コード、デバイスコードのみ削除
php artisan passport:purge --revoked

# 期限切れのトークン、認証コード、デバイスコードのみ削除
php artisan passport:purge --expired
```

アプリケーションの`routes/console.php`ファイルで[ジョブのスケジュール](/docs/{{version}}/scheduling)を設定して、このスケジュールに従い自動的にトークンを削除することもできます。

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('passport:purge')->hourly();
```

<a name="code-grant-pkce"></a>
## PKCEを使った認可コードグラント

"Proof Key for Code Exchange"(PKCE)を使用した認証コード付与は、シングルページアプリケーションやモバイルアプリケーションがAPIにアクセスする際の安全な認証方法です。このグラントは、クライアントシークレットの機密保存を保証できない場合や、攻撃者による認証コードの傍受の脅威を軽減する場合に使用します。「コードベリファイア」と「コードチャレンジ」の組み合わせは、アクセストークンと認証コードを交換する際に、クライアントシークレットに取って代わるものです。

<a name="creating-a-auth-pkce-grant-client"></a>
### クライアント生成

アプリケーションがPKCEでの認証コードグラントを介してトークンを発行する前に、PKCE対応のクライアントを作成する必要があります。これは、`passport:client` Artisanコマンドと`--public`オプションを使用して行えます。

```shell
php artisan passport:client --public
```

<a name="requesting-auth-pkce-grant-tokens"></a>
### トークンのリクエスト

<a name="code-verifier-code-challenge"></a>
#### コードベリファイヤとコードチャレンジ

この認可グラントではクライアント秘密コードが提供されないため、開発者はトークンを要求するためにコードベリファイヤとコードチャレンジのコンビネーションを生成する必要があります。

コードベリファイアは、[RFC 7636 仕様](https://tools.ietf.org/html/rfc7636)で定義されているように、文字、数字、`"-"`、`"."`、`"_"`、`"~"`文字を含む４３文字から１２８文字のランダムな文字列でなければなりません。

コードチャレンジはURL／ファイルネームセーフな文字をBase64エンコードしたものである必要があります。文字列終端の`'='`文字を削除し、ラインブレイクやホワイトスペースを含まず、その他はそのままにします。

```php
$encoded = base64_encode(hash('sha256', $codeVerifier, true));

$codeChallenge = strtr(rtrim($encoded, '='), '+/', '-_');
```

<a name="code-grant-pkce-redirecting-for-authorization"></a>
#### 許可のリダイレクト

クライアントが生成できたら、アプリケーションから認可コードとアクセストークンをリクエストするために、クライアントIDと生成したコードベリファイヤ、コードチャレンジを使用します。最初に、認可要求側のアプリケーションは、あなたのアプリケーションの`/oauth/authorize`ルートへのリダイレクトリクエストを生成する必要があります。

```php
use Illuminate\Http\Request;
use Illuminate\Support\Str;

Route::get('/redirect', function (Request $request) {
    $request->session()->put('state', $state = Str::random(40));

    $request->session()->put(
        'code_verifier', $codeVerifier = Str::random(128)
    );

    $codeChallenge = strtr(rtrim(
        base64_encode(hash('sha256', $codeVerifier, true))
    , '='), '+/', '-_');

    $query = http_build_query([
        'client_id' => 'your-client-id',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'response_type' => 'code',
        'scope' => 'user:read orders:create',
        'state' => $state,
        'code_challenge' => $codeChallenge,
        'code_challenge_method' => 'S256',
        // 'prompt' => '', // "none"、"consent"、"login"
    ]);

    return redirect('https://passport-app.test/oauth/authorize?'.$query);
});
```

<a name="code-grant-pkce-converting-authorization-codes-to-access-tokens"></a>
#### 許可コードからアクセストークンへの変換

ユーザーが認可リクエストを承認すると、認可要求側のアプリケーションへリダイレクで戻されます。認可要求側では認可コードグラントの規約に従い、リダイレクトの前に保存しておいた値と、`state`パラメータを検証する必要があります。

stateパラメータが一致したら、要求側はアクセストークンをリクエストするために、あなたのアプリケーションへ`POST`リクエストを発行する必要があります。そのリクエストは最初に生成したコードベリファイヤと同時に、ユーザーが認可リクエストを承認したときにあなたのアプリケーションが発行した認可コードを持っている必要があります。

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

Route::get('/callback', function (Request $request) {
    $state = $request->session()->pull('state');

    $codeVerifier = $request->session()->pull('code_verifier');

    throw_unless(
        strlen($state) > 0 && $state === $request->state,
        InvalidArgumentException::class
    );

    $response = Http::asForm()->post('https://passport-app.test/oauth/token', [
        'grant_type' => 'authorization_code',
        'client_id' => 'your-client-id',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'code_verifier' => $codeVerifier,
        'code' => $request->code,
    ]);

    return $response->json();
});
```

<a name="device-authorization-grant"></a>
## デバイス認証グラント

OAuth2デバイス認証グラントは、テレビやゲーム機のようなブラウザレスまたは限定された入力デバイスが、「デバイスコード」を交換することでアクセストークンを取得することを可能にします。デバイスフローを使用する場合、デバイスクライアントはユーザーへコンピュータやスマートフォンなどのセカンダリデバイスを使用するよう指示し、提供した「ユーザーコード」を入力してサーバに接続し、アクセス要求を承認または拒否します。

これには、まずPassportへ「ユーザーコード」と「認証」ビューをどのように返すかを指示する必要があります。

全ての認可ビューのレンダロジックは、`Laravel\Passport\Passport`クラスで利用可能な、適切なメソッドを使用してカスタマイズできます。通常、アプリケーションの`Laravel\Passport\Passport`クラスの`boot`メソッドからこのメソッドを呼び出します。

```php
use Inertia\Inertia;
use Laravel\Passport\Passport;

/**
 * 全アプリケーションサービスの初期起動処理
 */
public function boot(): void
{
    // ビュー名を指定
    Passport::deviceUserCodeView('auth.oauth.device.user-code');
    Passport::deviceAuthorizationView('auth.oauth.device.authorize');

    // クロージャにより指定
    Passport::deviceUserCodeView(
        fn ($parameters) => Inertia::render('Auth/OAuth/Device/UserCode')
    );

    Passport::deviceAuthorizationView(
        fn ($parameters) => Inertia::render('Auth/OAuth/Device/Authorize', [
            'request' => $parameters['request'],
            'authToken' => $parameters['authToken'],
            'client' => $parameters['client'],
            'user' => $parameters['user'],
            'scopes' => $parameters['scopes'],
        ])
    );

    // ...
}
```

Passportはこれらのビューを返すルートを自動的に定義します。`auth.oauth.device.user-code`テンプレートには、`passport.device.authorizations.authorize`ルートへGETリクエストを行うフォームを含める必要があります。`passport.device.authorizations.authorize`ルートは`user_code`クエリパラメータを期待しています。

`auth.oauth.device.authorize`テンプレートには、承認を行うための`passport.device.authorizations.approve`ルートへPOSTリクエストを行うフォームと、承認を拒否するための`passport.device.authorizations.deny`ルートへDELETEリクエストを行うフォームを含める必要があります。`passport.device.authorizations.approve`ルートと`passport.device.authorizations.deny`ルートは、`state`、`client_id`、`auth_token`フィールドを必要とします。

<a name="creating-a-device-authorization-grant-client"></a>
### デバイス認証グラントクライアントの作成

アプリケーションがデバイス認証グラントでトークンを発行する前に、デバイスフローが有効なクライアントを作成する必要があります。これを行うには、`passport:client` Artisanコマンドに`--device`オプションを指定します。このコマンドはファーストパーティのデバイスフロー対応クライアントを作成し、クライアントIDとシークレットを提供します。

```shell
php artisan passport:client --device
```

さらに、`ClientRepository`クラスの`createDeviceAuthorizationGrantClient`メソッドを使用して、指定ユーザーに属するサードパーティクライアントを登録することもできます。

```php
use App\Models\User;
use Laravel\Passport\ClientRepository;

$user = User::find($userId);

$client = app(ClientRepository::class)->createDeviceAuthorizationGrantClient(
    user: $user,
    name: 'Example Device',
    confidential: false,
);
```

<a name="requesting-device-authorization-grant-tokens"></a>
### トークンのリクエスト

<a name="device-code"></a>
#### デバイスコードのリクエスト

クライアントを作成したら、開発者はそのクライアントIDを使用してアプリケーションにデバイスコードをリクエストできます。まず、デバイスコードを要求するためアプリケーションの`/oauth/device/code`ルートへ`POST`リクエストを行います。

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/device/code', [
    'client_id' => 'your-client-id',
    'scope' => 'user:read orders:create',
]);

return $response->json();
```

これは`device_code`、`user_code`、`verification_uri`、`interval`、`expires_in` 属性を含む、JSONレスポンスを返します。`expires_in`属性には、デバイスコードの有効期限が切れるまでの秒数が格納されます。`interval`属性には、`/oauth/token`ルートをポーリングするときに、レート制限エラーを回避するため、利用するデバイスがリクエスト間で何秒待つかを指定します。

> [!NOTE]
> `/oauth/device/code`ルートは、あらかじめPassportが定義していることを忘れないでください。このルートを手作業で定義する必要はありません。

<a name="user-code"></a>
#### 確認URIとユーザーコードの表示

デバイスコードをリクエストを取得したら、認証要求を承認するため別のデバイスを使用し、指定された`verification_uri`へアクセスして`user_code`を入力するように、消費デバイスでユーザーへ指示してください。

<a name="polling-token-request"></a>
#### トークンリクエストのポーリング

ユーザーはアクセスを許可(または拒否)するために別のデバイスを使用するので、ユーザーがいつリクエストに応答したかを判断するために、使用デバイスはアプリケーションの`/oauth/token`ルートをポーリングする必要があります。使用デバイスは、レートリミットエラーを避けるため、デバイスコードをリクエストするときに、JSONレスポンスで指定される最小のポーリング`間隔`を使用する必要があります。

```php
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Sleep;

$interval = 5;

do {
    Sleep::for($interval)->seconds();

    $response = Http::asForm()->post('https://passport-app.test/oauth/token', [
        'grant_type' => 'urn:ietf:params:oauth:grant-type:device_code',
        'client_id' => 'your-client-id',
        'client_secret' => 'your-client-secret', // 気密性の高いクライアントのみ必須
        'device_code' => 'the-device-code',
    ]);

    if ($response->json('error') === 'slow_down') {
        $interval += 5;
    }
} while (in_array($response->json('error'), ['authorization_pending', 'slow_down']));

return $response->json();
```

ユーザーが認可リクエストを承認した場合、`access_token`属性と`refresh_token`属性と`expires_in`属性を含んだJSONレスポンスが返される。`expires_in`属性には、アクセストークンの有効期限が切れるまでの秒数が格納されます。

<a name="password-grant"></a>
## パスワードグラント

> [!WARNING]
> パスワードグラントトークンの使用は、現在推奨していません。代わりに、[OAuth2サーバが現在推奨しているグラントタイプ](https://oauth2.thephpleague.com/authorization-server/which-grant/) を選択する必要があります。

OAuth2パスワードグラントにより、モバイルアプリケーションなどの他のファーストパーティクライアントは、電子メールアドレス／ユーザー名とパスワードを使用してアクセストークンを取得できます。これにより、ユーザーがOAuth2認証コードのリダイレクトフロー全体を実行しなくても、ファーストパーティクライアントにアクセストークンを安全に発行できます。

パスワードグラントを有効にするには、アプリケーションの`App\Providers\AppServiceProvider`クラスの`boot`メソッドで、`enablePasswordGrant`メソッドを呼び出してください。

```php
/**
 * 全アプリケーションサービスの初期起動処理
 */
public function boot(): void
{
    Passport::enablePasswordGrant();
}
```

<a name="creating-a-password-grant-client"></a>
### パスワードグラントクライアントの作成

アプリケーションがパスワードグラントでトークンを発行する前に、パスワードグラントクライアントを作成する必要があります。これを行うには、`passport:client` Artisanコマンドに`--password`オプションを指定します。

```shell
php artisan passport:client --password
```

<a name="requesting-password-grant-tokens"></a>
### トークンのリクエスト

グラントを有効にしてパスワードグラントクライアントを作成したら、ユーザーのメールアドレスとパスワードにより、`/oauth/token`ルートへ`POST`リクエストを発行し、アクセストークンをリクエストできます。このルートは Passportがあらかじめ登録しているため、手作業で定義する必要はありません。リクエストが成功すると、サーバからのJSONレスポンスに、`access_token`と`refresh_token`が返されます。

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/token', [
    'grant_type' => 'password',
    'client_id' => 'your-client-id',
    'client_secret' => 'your-client-secret', // 気密性の高いクライアントのみ必須
    'username' => 'taylor@laravel.com',
    'password' => 'my-password',
    'scope' => 'user:read orders:create',
]);

return $response->json();
```

> [!NOTE]
> アクセストークンはデフォルトで、長期間有効であることを記憶しておきましょう。ただし、必要であれば自由に、[アクセストークンの最長持続時間を設定](#configuration)できます。

<a name="requesting-all-scopes"></a>
### 全スコープの要求

パスワードグラント、またはクライアント認証情報グラントを使用時は、あなたのアプリケーションでサポートする全スコープを許可するトークンを発行したいと考えるかと思います。`*`スコープをリクエストすれば可能です。`*`スコープをリクエストすると、そのトークンインスタンスの`can`メソッドは、いつも`true`を返します。このスコープは`password`か`client_credentials`グラントを使って発行されたトークのみに割り付けるのが良いでしょう。

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/token', [
    'grant_type' => 'password',
    'client_id' => 'your-client-id',
    'client_secret' => 'your-client-secret', // 気密性の高いクライアントのみ必須
    'username' => 'taylor@laravel.com',
    'password' => 'my-password',
    'scope' => '*',
]);
```

<a name="customizing-the-user-provider"></a>
### ユーザープロバイダのカスタマイズ

アプリケーションが複数の[認証ユーザープロバイダ](/docs/{{version}}/authentication#introduction)を使用している場合、`artisan passport:client --password`コマンドでクライアントを作成するときに、`--provider`オプションを指定すれば、パスワードグラントクライアントが使用するユーザープロバイダを指定できます。指定するプロバイダ名は、アプリケーションの`config/auth.php`設定ファイルで定義している、有効なプロバイダと一致する必要があります。その後、[ミドルウェアを使用してルートを保護する](#multiple-authentication-guards)ことで、ガードの指定したプロバイダからのユーザーのみが認証されるようにすることができます。

<a name="customizing-the-username-field"></a>
### ユーザー名フィールドのカスタマイズ

パスワードグラントを使用して認証する場合、Passportは認証可能なモデルの`email`属性を「ユーザー名」として使用します。ただし、モデルで`findForPassport`メソッドを定義することにより、この動作をカスタマイズできます。

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\Bridge\Client;
use Laravel\Passport\Contracts\OAuthenticatable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable implements OAuthenticatable
{
    use HasApiTokens, Notifiable;

    /**
     * 指定ユーザー名に対応するユーザーインスタンスを検索
     */
    public function findForPassport(string $username, Client $client): User
    {
        return $this->where('username', $username)->first();
    }
}
```

<a name="customizing-the-password-validation"></a>
### パスワードバリデーションのカスタマイズ

パスワードガードを使用して認証している場合、Passportは指定されたパスワードを確認するためにモデルの`password`属性を使用します。もし、`password`属性を持っていないか、パスワードのバリデーションロジックをカスタマイズしたい場合は、モデルの`validateForPassportPasswordGrant`メソッドを定義してください。

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Passport\Contracts\OAuthenticatable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable implements OAuthenticatable
{
    use HasApiTokens, Notifiable;

    /**
     * Passportパスワードグラントに対しユーザーパスワードを検証
     */
    public function validateForPassportPasswordGrant(string $password): bool
    {
        return Hash::check($password, $this->password);
    }
}
```

<a name="implicit-grant"></a>
## 暗黙的グラント

> [!WARNING]
> 暗黙的のグラントトークンの使用は、現在推奨していません。代わりに、[OAuth2サーバが現在推奨しているグラントタイプ](https://oauth2.thephpleague.com/authorization-server/which-grant/)を選択する必要があります。

暗黙のグラントは、認証コードグラントと似ていますが、トークンは認証コードを交換せずにクライアントへ返します。このグラントは、JavaScriptやモバイルアプリケーションで、クライアントの認証情報を安全に保存できない場合によく使われます。このグラントを有効にするには、アプリケーションの`App\Providers\AppServiceProvider`クラスの`boot`メソッドで`enableImplicitGrant`メソッドを呼び出してください。

```php
/**
 * 全アプリケーションサービスの初期起動処理
 */
public function boot(): void
{
    Passport::enableImplicitGrant();
}
```

アプリケーションが暗黙的グラントでトークンを発行する前に、暗黙的グラントクライアントを作成する必要があります。これを行うには、`passport:client` Artisanコマンドに`--implicit`オプションを指定します。

```shell
php artisan passport:client --implicit
```

グラントを有効にして暗黙的なクライアントを作成すると、開発者はそのクライアントIDを使い、アプリケーションへアクセストークンをリクエストできます。利用するアプリケーションは、あなたのアプリケーションの`/oauth/authorize`ルートへリダイレクトリクエストを行う必要があります。

```php
use Illuminate\Http\Request;

Route::get('/redirect', function (Request $request) {
    $request->session()->put('state', $state = Str::random(40));

    $query = http_build_query([
        'client_id' => 'your-client-id',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'response_type' => 'token',
        'scope' => 'user:read orders:create',
        'state' => $state,
        // 'prompt' => '', // "none"、"consent"、"login"
    ]);

    return redirect('https://passport-app.test/oauth/authorize?'.$query);
});
```

> [!NOTE]
> `/oauth/authorize`ルートは、すでにPassportが定義づけていることを覚えておいてください。このルートを自分で定義する必要はありません。

<a name="client-credentials-grant"></a>
## クライアント利用資格情報グラント

クライアント利用資格情報グラントはマシンとマシン間の認証に最適です。たとえば、APIによりメンテナンスタスクを実行する、定期実行ジョブに使用できます。

アプリケーションがクライアント利用資格情報グラントを介してトークンを発行する前に、クライアント利用資格情報グラントクライアントを作成する必要があります。これは、`passport:client` Artisanコマンドの`--client`オプションを使用して行うことができます。

```shell
php artisan passport:client --client
```

次に、`Laravel\Passport\Http\Middleware\EnsureClientIsResourceOwner`ミドルウェアをルートに割り当てます。

```php
use Laravel\Passport\Http\Middleware\EnsureClientIsResourceOwner;

Route::get('/orders', function (Request $request) {
    // アクセストークンは有効で、クライアントはリソースの所有者
})->middleware(EnsureClientIsResourceOwner::class);
```

ルートへのアクセスを特定のスコープに制限するには、`using`メソッドへ必要なスコープのリストを指定します。

```php
Route::get('/orders', function (Request $request) {
    // アクセストークンは有効で、クライアントはリソースの所有者であり、"servers:read"と"servers:create"の両スコープを持っている
})->middleware(EnsureClientIsResourceOwner::using('servers:read', 'servers:create'));
```

> [!WARNING]
> [基盤となるOAuth2サーバ](https://oauth2.thephpleague.com/database-setup/#:~:text=Please%20note%20that,the%20bearer%20token.)は、クライアント認証トークンの場合、トークンの`sub`クレームにクライアントの識別子を設定します。デフォルトで、PassportはクライアントにUUIDを使用するため、これがユーザーの整数プライマリキーと衝突することはありません。しかし、`Passport::$clientUuids`を`false`に設定している場合、クライアント認証トークンが、クライアントのIDと一致するIDを持つユーザーを意図せず解決してしまう可能性があります。そのような場合、このミドルウェアを使用しても、入ってくるトークンがクライアント認証トークンであることを保証できません。

<a name="retrieving-tokens"></a>
### トークンの取得

このグラントタイプを使用してトークンを取得するには、`oauth/token`エンドポイントにリクエストを送信します。

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/token', [
    'grant_type' => 'client_credentials',
    'client_id' => 'your-client-id',
    'client_secret' => 'your-client-secret',
    'scope' => 'servers:read servers:create',
]);

return $response->json()['access_token'];
```

<a name="personal-access-tokens"></a>
## パーソナルアクセストークン

ときどき、あなたのユーザーが典型的なコードリダイレクションフローに従うのではなく、自分たち自身でアクセストークンを発行したがることもあるでしょう。あなたのアプリケーションのUIを通じて、ユーザー自身のトークンを発行を許可することにより、あなたのAPIをユーザーに経験してもらう事ができますし、全般的なアクセストークン発行するシンプルなアプローチとしても役立つでしょう。

> [!NOTE]
> もしあなたのアプリケーションが、主にパーソナルアクセストークンを発行するためにPassportを使用しているのであれば、APIアクセストークンを発行するためのLaravelの軽量ファーストパーティライブラリである[Laravel Sanctum](/docs/{{version}}/sanctum)の使用を検討してください。

<a name="creating-a-personal-access-client"></a>
### パーソナルアクセスクライアントの作成

アプリケーションがパーソナルアクセストークンを発行する前に、パーソナルアクセスクライアントを作成する必要があります。これを行うには、`--personal`オプションを指定して`passport:client` Artisanコマンドを実行します。すでに`passport:install`コマンドを実行している場合は、次のコマンドを実行する必要はありません。

```shell
php artisan passport:client --personal
```

<a name="customizing-the-user-provider-for-pat"></a>
### ユーザープロバイダのカスタマイズ

アプリケーションが複数の[認証ユーザープロバイダ](/docs/{{version}}/authentication#introduction)を使用している場合、`artisan passport:client --personal`コマンドでクライアントを作成するときに、`--provider`オプションを指定することで、パーソナルアクセスグラントクライアントが使用するユーザープロバイダを指定できます。指定するプロバイダ名は、アプリケーションの`config/auth.php`設定ファイルで定義している有効なプロバイダと一致させる必要があります。その後、[ミドルウェアを使用してルートを保護する](#multiple-authentication-guards)ことで、ガードで指定したプロバイダからのユーザーのみを認証するようにできます。

<a name="managing-personal-access-tokens"></a>
### パーソナルアクセストークンの管理

パーソナルアクセスクライアントを作成したら、`App\Models\User`モデルインスタンスで`createToken`メソッドを使用して特定のユーザーにトークンを発行できます。`createToken`メソッドは、最初の引数にトークン名、２番目の引数にオプションの[スコープ](#token-scopes)の配列を取ります。

```php
use App\Models\User;
use Illuminate\Support\Facades\Date;
use Laravel\Passport\Token;

$user = User::find($userId);

// スコープ無しのトークンを作成する
$token = $user->createToken('My Token')->accessToken;

// スコープ付きのトークンを作成する
$token = $user->createToken('My Token', ['user:read', 'orders:create'])->accessToken;

// 全スコープ付きのトークンを作成する
$token = $user->createToken('My Token', ['*'])->accessToken;

// ユーザーに属する有効なパーソナルアクセストークンをすべて取得する。
$tokens = $user->tokens()
    ->with('client')
    ->where('revoked', false)
    ->where('expires_at', '>', Date::now())
    ->get()
    ->filter(fn (Token $token) => $token->client->hasGrantType('personal_access'));
```

<a name="protecting-routes"></a>
## ルート保護

<a name="via-middleware"></a>
### ミドルウェアによる保護

Passportは、受信リクエストのアクセストークンを検証する[認証グラント](/docs/{{version}}/authentication#adding-custom-guards)を用意しています。`passport`ドライバを使用するように`api`ガードを設定したら、有効なアクセストークンを必要とするルートで`auth:api`ミドルウェアを指定するだけで済みます。

```php
Route::get('/user', function () {
    // API認証ユーザーのみがこのルートにアクセス可能
})->middleware('auth:api');
```

> [!WARNING]
> [クライアント認証グラント](#client-credentials-grant)を使用している場合、`auth:api`ミドルウェアの代わりに、ルートを保護するために[`Laravel\Passport\Http\Middleware\EnsureClientIsResourceOwner`ミドルウェア](#client-credentials-grant)を使うべきです。

<a name="multiple-authentication-guards"></a>
#### 複数認証ガード

アプリケーションの認証でたぶんまったく異なるEloquentモデルを使用する、別々のタイプのユーザーを認証する場合、それぞれのユーザープロバイダタイプごとにガード設定を定義する必用があるでしょう。これにより特定ユーザープロバイダ向けのリクエストを保護できます。例として`config/auth.php`設定ファイルで以下のようなガード設定を行っているとしましょう。

```php
'guards' => [
    'api' => [
        'driver' => 'passport',
        'provider' => 'users',
    ],

    'api-customers' => [
        'driver' => 'passport',
        'provider' => 'customers',
    ],
],
```

以下のルートは受信リクエストを認証するため`customers`ユーザープロバイダを使用する`api-customers`ガードを使用します。

```php
Route::get('/customer', function () {
    // ...
})->middleware('auth:api-customers');
```

> [!NOTE]
> Passportで複数のユーザープロバイダを使用する際の詳細は、[パーソナルアクセストークンのドキュメント](#customizing-the-user-provider-for-pat)および[パスワードグラントのドキュメント](#customizing-the-user-provider)を参照してください。

<a name="passing-the-access-token"></a>
### アクセストークンの受け渡し

Passportで保護しているルートを呼び出す場合、アプリケーションのAPI使用側はリクエストの`Authorization`ヘッダに、`Bearer`トークンとしてアクセストークンを指定する必要があります。例として、`Http`ファサードを使用する場合を御覧ください。

```php
use Illuminate\Support\Facades\Http;

$response = Http::withHeaders([
    'Accept' => 'application/json',
    'Authorization' => "Bearer $accessToken",
])->get('https://passport-app.test/api/user');

return $response->json();
```

<a name="token-scopes"></a>
## トークンのスコープ

スコープは、あるアカウントにアクセスする許可がリクエストされたとき、あなたのAPIクライアントに限定された一連の許可をリクエストできるようにします。たとえば、eコマースアプリケーションを構築している場合、全API利用者へ発注する許可を与える必要はないでしょう。代わりに、利用者へ注文の発送状況にアクセスできる許可を与えれば十分です。言い換えれば、スコープはアプリケーションユーザーに対し、彼らの代理としてのサードパーティアプリケーションが実行できるアクションを制限できるようにします。

<a name="defining-scopes"></a>
### スコープの定義

APIのスコープは、アプリケーションの`App\Providers\AppServiceProvider`クラスの`boot`メソッドで、`Passport::tokensCan`メソッドを使用して定義してください。`tokensCan`メソッドは、スコープ名とスコープの説明の配列を引数に取ります。スコープの説明は何でもよく、認可の承認画面でユーザーへ表示します。

```php
/**
 * 全アプリケーションサービスの初期起動処理
 */
public function boot(): void
{
    Passport::tokensCan([
        'user:read' => 'Retrieve the user info',
        'orders:create' => 'Place orders',
        'orders:read:status' => 'Check order status',
    ]);
}
```

<a name="default-scope"></a>
### デフォルトスコープ

クライアントが特定のスコープを要求しない場合に、`defaultScopes`メソッドを使用して、トークンにデフォルトのスコープを付与するようにPassportサーバを設定できます。通常、このメソッドはアプリケーションの`App\Providers\AppServiceProvider`クラスの`boot`メソッドから呼び出します。

```php
use Laravel\Passport\Passport;

Passport::tokensCan([
    'user:read' => 'Retrieve the user info',
    'orders:create' => 'Place orders',
    'orders:read:status' => 'Check order status',
]);

Passport::defaultScopes([
    'user:read',
    'orders:create',
]);
```

<a name="assigning-scopes-to-tokens"></a>
### トークンへのスコープ割り付け

<a name="when-requesting-authorization-codes"></a>
#### 許可コードのリクエスト時

許可コードグラントを用い、アクセストークンをリクエストする際、利用者は`scope`クエリ文字列パラメータとして、希望するスコープを指定する必要があります。`scope`パラメータはスコープを空白で区切ったリストです。

```php
Route::get('/redirect', function () {
    $query = http_build_query([
        'client_id' => 'your-client-id',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'response_type' => 'code',
        'scope' => 'user:read orders:create',
    ]);

    return redirect('https://passport-app.test/oauth/authorize?'.$query);
});
```

<a name="when-issuing-personal-access-tokens"></a>
#### パーソナルアクセストークン発行時

`App\Models\User`モデルの`createToken`メソッドを使用してパーソナルアクセストークンを発行している場合は、メソッドの２番目の引数に目的のスコープの配列を渡すことができます。

```php
$token = $user->createToken('My Token', ['orders:create'])->accessToken;
```

<a name="checking-scopes"></a>
### スコープのチェック

Passportは受信リクエストが、与えるトークンの指定したスコープで認証されていることを検証するために使用できる２つのミドルウェアを持っています。

<a name="check-for-all-scopes"></a>
#### 全スコープの確認

受信リクエストのアクセストークンが、リストしたすべてのスコープを持つことを検証するには、`Laravel\Passport\Http\Middleware\CheckToken`ミドルウェアをルートへ指定してください。

```php
use Laravel\Passport\Http\Middleware\CheckToken;

Route::get('/orders', function () {
    // アクセストークンは"orders:read"と"orders:create"両方のスコープを持つ
})->middleware(['auth:api', CheckToken::using('orders:read', 'orders:create')]);
```

<a name="check-for-any-scopes"></a>
#### 一部のスコープの確認

受信リクエストのアクセストークンが、リストしたスコープのうち*少なくとも1つ*を持つことを検証するには、`Laravel\Passport\Http\Middleware\CheckTokenForAnyScope`ミドルウェアをルートに割り当ててください。

```php
use Laravel\Passport\Http\Middleware\CheckTokenForAnyScope;

Route::get('/orders', function () {
    // アクセストークンは"orders:read"か"orders:create"スコープのどれかを持つ
})->middleware(['auth:api', CheckTokenForAnyScope::using('orders:read', 'orders:create')]);
```

<a name="scope-attributes"></a>
#### スコープ属性

アプリケーションで[コントローラミドルウェア属性](/docs/{{version}}/controllers#middleware-attributes)を使用している場合、Passportのスコープミドルウェアの便利なショートカットとして、`Laravel\Passport\Attributes\AuthorizeToken`属性を使用できます。

```php
<?php

namespace App\Http\Controllers;

use Laravel\Passport\Attributes\AuthorizeToken;

#[AuthorizeToken('orders:read')]
#[AuthorizeToken('orders:create', only: ['store'])]
class OrderController
{
    #[AuthorizeToken(['orders:read', 'orders:create'], anyScope: true)]
    public function index()
    {
        // アクセストークンが"orders:read"または"orders:create"スコープのいずれかを持っている場合
    }

    public function store()
    {
        // アクセストークンが"orders:read"と"orders:create"スコープの両方を持っている場合
    }
}
```

`AuthorizeToken`属性はデフォルトで、指定したすべてのスコープを要求します。`anyScope: true`を渡すと、トークンが指定したスコープのうち少なくとも１つを持っている場合にリクエストが認可されます。

<a name="checking-scopes-on-a-token-instance"></a>
#### トークンインスタンスでのスコープチェック

アクセストークンの認証済みリクエストがアプリケーションに入力された後でも、認証済みの`App\Models\User`インスタンスで`tokenCan`メソッドを使用して、トークンに特定のスコープがあるかどうかを確認できます。

```php
use Illuminate\Http\Request;

Route::get('/orders', function (Request $request) {
    if ($request->user()->tokenCan('orders:create')) {
        // ...
    }
});
```

<a name="additional-scope-methods"></a>
#### その他のスコープメソッド

`scopeIds`メソッドは定義済みの全ID／名前の配列を返します。

```php
use Laravel\Passport\Passport;

Passport::scopeIds();
```

`scopes`メソッドは定義済みの全スコープを`Laravel\Passport\Scope`のインスタンスの配列として返します。

```php
Passport::scopes();
```

`scopesFor`メソッドは、指定したID／名前に一致する`Laravel\Passport\Scope`インスタンスの配列を返します。

```php
Passport::scopesFor(['user:read', 'orders:create']);
```

指定したスコープが定義済みであるかを判定するには、`hasScope`メソッドを使います。

```php
Passport::hasScope('orders:create');
```

<a name="spa-authentication"></a>
## SPA認証

API構築時にJavaScriptアプリケーションから、自分のAPIを利用できたらとても便利です。このAPI開発のアプローチにより、世界中で共有されるのと同一のAPIを自身のアプリケーションで使用できるようになります。自分のWebアプリケーションやモバイルアプリケーション、サードパーティアプリケーション、そしてさまざまなパッケージマネージャ上で公開するSDKにより、同じAPIが使用されます。

通常、JavaScriptアプリケーションからAPIを利用する場合、手作業でアクセストークンをアプリケーションへ送信し、アプリケーションへリクエストするたび、アクセストークンを渡す必要があります。しかし、Passportは、この処理を代行するミドルウェアを用意しています。アプリケーションの`bootstrap/app.php`ファイルの`web`ミドルウェアグループに`CreateFreshApiToken`ミドルウェアを追加するだけです。

```php
use Laravel\Passport\Http\Middleware\CreateFreshApiToken;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->web(append: [
        CreateFreshApiToken::class,
    ]);
})
```

> [!WARNING]
> ミドルウェアの指定の中で、`CreateFreshApiToken`ミドルウェアは確実に最後へリストしてください。

このミドルウェアは、送信レスポンスに`laravel_token`クッキーを添付します。このクッキーには、PassportがJavaScriptアプリケーションからのAPIリクエストを認証するために使用する暗号化されたJWTが含まれています。JWTの有効期間は、`session.lifetime`設定値と同じです。これで、ブラウザは後続のすべてのリクエストでクッキーを自動的に送信するため、アクセストークンを明示的に渡さなくても、アプリケーションのAPIにリクエストを送信できます。

```js
axios.get('/api/user')
    .then(response => {
        console.log(response.data);
    });
```

<a name="customizing-the-cookie-name"></a>
#### クッキー名のカスタマイズ

必要であれば、`Passport::cookie`メソッドをつかい、`laravel_token`クッキーの名前をカスタマイズできます。通常、このメソッドはアプリケーションの`App\Providers\AppServiceProvider`クラスの`boot`メソッドから呼び出します。

```php
/**
 * 全アプリケーションサービスの初期起動処理
 */
public function boot(): void
{
    Passport::cookie('custom_name');
}
```

<a name="csrf-protection"></a>
#### CSRF保護

この認証方法を使用する場合、リクエストに有効なCSRFトークンヘッダを確実に含める必要があります。スケルトンアプリケーションとすべてのスターターキットに含まれるデフォルトのLaravel JavaScriptスカフォールドには[Axios](https://github.com/axios/axios)インスタンスを含んでおり、暗号化した`XSRF-TOKEN`クッキーの値を自動的に使用して、同一オリジンのリクエストへ`X-XSRF-TOKEN`ヘッダを送信します。

> [!NOTE]
> `X-XSRF-TOKEN`の代わりに`X-CSRF-TOKEN`ヘッダを送る方法を取る場合は、`csrf_token()`により提供される復元したトークンを使用する必要があります。

<a name="events"></a>
## イベント

Passportはアクセストークンやリフレッシュトークンを発行する際に、イベントを発生させます。これらの[イベントをリッスン](/docs/{{version}}/events)して、データベース内の他のアクセストークンを削除したり取り消したりできます。

<div class="overflow-auto">

| イベント名                                      |
| --------------------------------------------- |
| `Laravel\Passport\Events\AccessTokenCreated`  |
| `Laravel\Passport\Events\AccessTokenRevoked`  |
| `Laravel\Passport\Events\RefreshTokenCreated` |

</div>

<a name="testing"></a>
## テスト

Passportの`actingAs`メソッドは、現在認証中のユーザーを指定すると同時にスコープも指定します。`actingAs`メソッドの最初の引数はユーザーのインスタンスで、第２引数はユーザートークンに許可するスコープ配列を指定します。

```php tab=Pest
use App\Models\User;
use Laravel\Passport\Passport;

test('orders can be created', function () {
    Passport::actingAs(
        User::factory()->create(),
        ['orders:create']
    );

    $response = $this->post('/api/orders');

    $response->assertStatus(201);
});
```

```php tab=PHPUnit
use App\Models\User;
use Laravel\Passport\Passport;

public function test_orders_can_be_created(): void
{
    Passport::actingAs(
        User::factory()->create(),
        ['orders:create']
    );

    $response = $this->post('/api/orders');

    $response->assertStatus(201);
}
```

Passportの`actingAsClient`メソッドは、現在認証中のクライアントを指定すると同時にスコープも指定します。`actingAsClient`メソッドの最初の引数はクライアントインスタンスで、第２引数はクライアントのトークンへ許可するスコープの配列です。

```php tab=Pest
use Laravel\Passport\Client;
use Laravel\Passport\Passport;

test('servers can be retrieved', function () {
    Passport::actingAsClient(
        Client::factory()->create(),
        ['servers:read']
    );

    $response = $this->get('/api/servers');

    $response->assertStatus(200);
});
```

```php tab=PHPUnit
use Laravel\Passport\Client;
use Laravel\Passport\Passport;

public function test_servers_can_be_retrieved(): void
{
    Passport::actingAsClient(
        Client::factory()->create(),
        ['servers:read']
    );

    $response = $this->get('/api/servers');

    $response->assertStatus(200);
}
```
