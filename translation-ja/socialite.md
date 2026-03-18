# Laravel Socialite

- [イントロダクション](#introduction)
- [インストール](#installation)
- [Socialiteのアップグレード](#upgrading-socialite)
- [設定](#configuration)
- [認証](#authentication)
    - [ルート](#routing)
    - [認証と保存](#authentication-and-storage)
    - [アクセススコープ](#access-scopes)
    - [Slack Botスコープ](#slack-bot-scopes)
    - [オプションのパラメータ](#optional-parameters)
- [ユーザー詳細情報の取得](#retrieving-user-details)
- [テスト](#testing)

<a name="introduction"></a>
## イントロダクション

Laravelは、一般的なフォームベースの認証に加えて、[Laravel Socialite](https://github.com/laravel/socialite)(ソーシャライト：名士)を使用したOAuthプロバイダで認証するためのシンプルで便利な方法も提供します。Socialiteは現在、Facebook、X、LinkedIn、Google、GitHub、GitLab、Bitbucket、Slackでの認証をサポートしています。

> [!NOTE]
> 他のプラットフォームのアダプタは、コミュニティにより管理されている[Socialiteプロバイダ](https://socialiteproviders.com/)Webサイトから利用できます。

<a name="installation"></a>
## インストール

Socialiteを使い始めるには、Composerパッケージマネージャを使用して、プロジェクトの依存関係へパッケージを追加します。

```shell
composer require laravel/socialite
```

<a name="upgrading-socialite"></a>
## Socialiteのアップグレード

Socialiteの新しいメジャーバージョンにアップグレードするときは、[アップグレードガイド](https://github.com/laravel/socialite/blob/master/UPGRADE.md)を注意深く確認することが重要です。

<a name="configuration"></a>
## 設定

Socialiteを使用する前に、アプリケーションが利用するOAuthプロバイダの認証情報を追加する必要があります。通常、これらの認証情報は、認証するサービスのダッシュボード内で「開発者用アプリケーション」を作成することで取得できます。

こうした認証情報は、アプリケーションの`config/services.php`設定ファイルへ記述します。キーは`facebook`, `X`、`linkedin-openid`、`google`、`github`、`gitlab`、`bitbucket`、`slack`、`slack-openid`で、アプリケーションで必要なプロバイダによります。

```php
'github' => [
    'client_id' => env('GITHUB_CLIENT_ID'),
    'client_secret' => env('GITHUB_CLIENT_SECRET'),
    'redirect' => 'http://example.com/callback-url',
],
```

> [!NOTE]
> `redirect`オプションが相対パスである場合、自動的に完全なURLへ解決されます。

<a name="authentication"></a>
## 認証

<a name="routing"></a>
### ルート

OAuthプロバイダを使ってユーザーを認証するには、OAuthプロバイダへユーザーをリダイレクトするルートと、認証後にプロバイダからのコールバックを受け取るルートの２つが必要になります。以下のルート例では、両方のルートを実装しています。

```php
use Laravel\Socialite\Socialite;

Route::get('/auth/redirect', function () {
    return Socialite::driver('github')->redirect();
});

Route::get('/auth/callback', function () {
    $user = Socialite::driver('github')->user();

    // $user->token
});
```

`Socialite`ファサードが提供する`redirect`メソッドは、ユーザーをOAuthプロバイダへリダイレクトします。一方、`user`メソッドは受信リクエストを調べ、そのリクエストの認証を承認した後に、プロバイダからユーザー情報を取得します。

<a name="authentication-and-storage"></a>
### 認証と保存

OAuthプロバイダからユーザーを取得したら、そのユーザーがアプリケーションのデータベースに存在するかを判断し、[ユーザーを認証](/docs/{{version}}/authentication#authenticate-a-user-instance)します。ユーザーがアプリケーションのデータベースに存在していない場合は通常、そのユーザーを表す新しいレコードをデータベースに作成します。

```php
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Socialite;

Route::get('/auth/callback', function () {
    $githubUser = Socialite::driver('github')->user();

    $user = User::updateOrCreate([
        'github_id' => $githubUser->id,
    ], [
        'name' => $githubUser->name,
        'email' => $githubUser->email,
        'github_token' => $githubUser->token,
        'github_refresh_token' => $githubUser->refreshToken,
    ]);

    Auth::login($user);

    return redirect('/dashboard');
});
```

> [!NOTE]
> 特定のOAuthプロバイダからどんなユーザー情報が得られるかについては、[ユーザー情報の取得](#retrieving-user-details)ドキュメントを参照してください。

<a name="access-scopes"></a>
### アクセススコープ

ユーザーをリダイレクトする前に、`scopes`メソッドを使用し、認証リクエストに含めるべき「スコープ」を指定できます。このメソッドは、以前に指定したすべてのスコープを、指定したスコープとマージします。

```php
use Laravel\Socialite\Socialite;

return Socialite::driver('github')
    ->scopes(['read:user', 'public_repo'])
    ->redirect();
```

`setScopes`メソッドを使用して、認証リクエストの既存のスコープをすべて上書きできます。

```php
return Socialite::driver('github')
    ->setScopes(['read:user', 'public_repo'])
    ->redirect();
```

<a name="slack-bot-scopes"></a>
### Slack Botスコープ

SlackのAPIは[さまざまなタイプのアクセストークン](https://api.slack.com/authentication/token-types)を提供しており、それぞれに[許可スコープ](https://api.slack.com/scopes)が設定されています。Socialiteは以下のSlackのアクセストークンに対応しています：

<div class="content-list" markdown="1">

- Bot (`xoxb-`のプレフィックス)
- User (`xoxp-`のプレフィックス)

</div>

`slack`ドライバはデフォルトで、`user`トークンを生成し、ドライバの`user`メソッドを呼び出すと、そのユーザーの詳細を返します。

ボットトークンは主に、アプリケーションのユーザーが所有する、外部のSlackワークスペースへ通知を送信する場合に便利です。ボットトークンを生成するには、ユーザーを認証のためにSlackにリダイレクトする前に、`asBotUser`メソッドを呼び出します：

```php
return Socialite::driver('slack')
    ->asBotUser()
    ->setScopes(['chat:write', 'chat:write.public', 'chat:write.customize'])
    ->redirect();
```

さらに、認証後にSlackがユーザーをアプリケーションへリダイレクトした後、`user`メソッドを呼び出す前に`asBotUser`メソッドを呼び出す必要があります。

```php
$user = Socialite::driver('slack')->asBotUser()->user();
```

ボットトークンを生成するときでも、`user`メソッドは`Laravel\Socialite\Two\User`インスタンスを返しますが、`token`プロパティだけがハイドレートされます。このトークンは、[認証されたユーザーのSlackワークスペースに通知を送る](/docs/{{version}}/notifications#notifying-external-slack-workspaces)ために保存しておくべきでしょう。

<a name="optional-parameters"></a>
### オプションのパラメータ

多くのOAuthプロバイダがリダイレクトリクエスト中で、その他にもオプションパラメータをサポートしています。リクエストにオプションパラメータを含めるには、`with`メソッドを呼び出し、連想配列を渡します。

```php
use Laravel\Socialite\Socialite;

return Socialite::driver('google')
    ->with(['hd' => 'example.com'])
    ->redirect();
```

> [!WARNING]
> `with`メソッド使用時は、`state`や`response_type`などの予約キーワードを渡さないように注意してください。

<a name="retrieving-user-details"></a>
## ユーザー詳細情報の取得

ユーザーをアプリケーションの認証コールバックルートへリダイレクトした後、Socialiteの`user`メソッドを使用してユーザーの詳細を取得できます。`user`メソッドが返すユーザーオブジェクトは、ユーザーに関する情報をデータベースへ保存するために使用できる様々なプロパティやメソッドを提供します。

認証につかうOAuthプロバイダが、OAuth1.0とOAuth2.0のどちらをサポートしているかにより、このオブジェクトで利用できるプロパティやメソッドが異なります。

```php
use Laravel\Socialite\Socialite;

Route::get('/auth/callback', function () {
    $user = Socialite::driver('github')->user();

    // OAuth2.0プロバイダ
    $token = $user->token;
    $refreshToken = $user->refreshToken;
    $expiresIn = $user->expiresIn;

    // OAuth1.0プロバイダ
    $token = $user->token;
    $tokenSecret = $user->tokenSecret;

    // 全プロバイダ
    $user->getId();
    $user->getNickname();
    $user->getName();
    $user->getEmail();
    $user->getAvatar();
});
```

<a name="retrieving-user-details-from-a-token-oauth2"></a>
#### トークンからのユーザー詳細情報の取得

ユーザーの有効なアクセストークンを既に持っている場合は、Socialiteの`userFromToken`メソッドを使用してユーザーの詳細を取得できます。

```php
use Laravel\Socialite\Socialite;

$user = Socialite::driver('github')->userFromToken($token);
```

iOSアプリケーションでFacebook限定ログインを使用している場合、Facebookはアクセストークンの代わりにOIDCトークンを返します。アクセストークンと同様に、OIDCトークンも`userFromToken`メソッドへ渡し、ユーザーの詳細情報を取得できます。

<a name="stateless-authentication"></a>
#### ステートレス認証

`stateless`メソッドを使用すると、セッション状態の確認を無効にできます。これは、クッキーベースのセッションを利用しないステートレスAPIに、ソーシャル認証を追加する場合に有用です。

```php
use Laravel\Socialite\Socialite;

return Socialite::driver('google')->stateless()->user();
```

<a name="testing"></a>
## テスト

Laravel Socialiteは、実際にOAuthプロバイダへリクエストを送信せずに、OAuth認証フローをテストする便利な方法を提供します。`fake`メソッドを使用すると、OAuthプロバイダの動作を模擬し、返すべきユーザーデータを定義できます。

<a name="faking-the-redirect"></a>
#### リダイレクトのFake

アプリケーションがユーザーをOAuthプロバイダへ正しくリダイレクトするかをテストするには、リダイレクト先ルートへのリクエストを送信する前に、`fake`メソッドを呼び出します。これにより、Socialiteは実際のOAuthプロバイダーへのリダイレクトではなく、偽の認証URLへのリダイレクトを返します：

```php
use Laravel\Socialite\Socialite;

test('user is redirected to github', function () {
    Socialite::fake('github');

    $response = $this->get('/auth/github/redirect');

    $response->assertRedirect();
});
```

<a name="faking-the-callback"></a>
#### コールバックのFake

アプリケーションのコールバックルートをテストするには、`fake`メソッドを呼び出し、アプリケーションがプロバイダにユーザーの詳細を要求したときに返すべき`User`インスタンスを指定します。`User`インスタンスは`map`メソッドを使用して作成できます。

```php
use Laravel\Socialite\Socialite;
use Laravel\Socialite\Two\User;

test('user can login with github', function () {
    Socialite::fake('github', (new User)->map([
        'id' => 'github-123',
        'name' => 'Jason Beggs',
        'email' => 'jason@example.com',
    ]));

    $response = $this->get('/auth/github/callback');

    $response->assertRedirect('/dashboard');

    $this->assertDatabaseHas('users', [
        'name' => 'Jason Beggs',
        'email' => 'jason@example.com',
        'github_id' => 'github-123',
    ]);
});
```

`User`インスタンスはデフォルトで、`token`プロパティも含んでいます。必要に応じて、`User`インスタンスに追加のプロパティを手作業で指定できます。

```php
$fakeUser = (new User)->map([
    'id' => 'github-123',
    'name' => 'Jason Beggs',
    'email' => 'jason@example.com',
])->setToken('fake-token')
  ->setRefreshToken('fake-refresh-token')
  ->setExpiresIn(3600)
  ->setApprovedScopes(['read', 'write'])
```
