# CSRF保護

- [イントロダクション](#csrf-introduction)
- [CSRFリクエストの防止](#preventing-csrf-requests)
    - [Origin Verification](#origin-verification)
    - [除外URI](#csrf-excluding-uris)
- [X-CSRF-Token](#csrf-x-csrf-token)
- [X-XSRF-Token](#csrf-x-xsrf-token)

<a name="csrf-introduction"></a>
## イントロダクション

クロスサイトリクエストフォージェリは、認証済みユーザーに代わって不正なコマンドを実行する、悪意のある攻撃の一種です。幸いに、Laravelを使用すれば、[クロスサイトリクエストフォージェリ](https://en.wikipedia.org/wiki/Cross-site_request_forgery)（CSRF）攻撃からアプリケーションを簡単に保護できます。

<a name="csrf-explanation"></a>
#### 脆弱性の説明

あなたがクロスサイトリクエストフォージェリを知らない場合に備え、この脆弱性を悪用する方法の例を説明しましょう。アプリケーションに、認証済みユーザーの電子メールアドレスを変更するための`POST`リクエストを受け入れる`/user/email`ルートがあるとします。ほとんどの場合、このルートでは、`email`入力フィールドにユーザーが使用を開始したいメールアドレスが含まれている必要があります。

CSRF保護がないと、悪意のあるWebサイトがアプリケーションの`/user/email`ルートを指すHTMLフォームを作成し、悪意のあるユーザー自身の電子メールアドレスを送信する可能性があります。

```blade
<form action="https://your-application.com/user/email" method="POST">
    <input type="email" value="malicious-email@example.com">
</form>

<script>
    document.forms[0].submit();
</script>
```

悪意のあるWebサイトがページの読み込み時にフォームを自動的に送信する場合、悪意のあるユーザーは、アプリケーションの疑いを持たないユーザーを誘惑してWebサイトにアクセスするだけで、あなたのアプリケーションの電子メールアドレスが変更されます。

この脆弱性を防ぐには、すべての受信`POST`、`PUT`、`PATCH`、`DELETE`リクエストを調べて、悪意のあるアプリケーションがアクセスできないシークレットセッション値を確認する必要があります。

<a name="preventing-csrf-requests"></a>
## CSRFリクエストの防止

The `Illuminate\Foundation\Http\Middleware\PreventRequestForgery` [middleware](/docs/{{version}}/middleware), which is included in the `web` middleware group by default, protects your application from cross-site request forgeries using a two-layer approach.

First, the middleware checks the browser's `Sec-Fetch-Site` header. Modern browsers automatically set this header on every request, indicating whether it originated from the same origin, the same site, or a cross-site source. If the header indicates the request came from the same origin, the request is allowed immediately without any token verification.

If origin verification does not pass — for example, because the request comes from an older browser that doesn't send the `Sec-Fetch-Site` header or because the connection is not secure — the middleware falls back to traditional CSRF token validation.

Laravelは、アプリケーションによって管理されているアクティブな[ユーザーセッション](/docs/{{version}}/session)ごとにCSRF「トークン」を自動的に生成します。このトークンは、認証済みユーザーが実際にアプリケーションへリクエストを行っているユーザーであることを確認するために使用されます。このトークンはユーザーのセッションに保存され、セッションが再生成されるたびに変更されるため、悪意のあるアプリケーションはこのトークンへアクセスできません。

現在のセッションのCSRFトークンには、リクエストのセッションまたは`csrf_token`ヘルパ関数を介してアクセスできます。

```php
use Illuminate\Http\Request;

Route::get('/token', function (Request $request) {
    $token = $request->session()->token();

    $token = csrf_token();

    // ...
});
```

アプリケーションで"POST"、"PUT"、"PATCH"、"DELETE" HTMLフォームを定義するときはいつでも、CSRF保護ミドルウェアがリクエストを検証できるように、フォームに非表示のCSRF`_token`フィールドを含める必要があります。便利なように、`@csrf` Bladeディレクティブを使用して、非表示のトークン入力フィールドを生成できます。

```blade
<form method="POST" action="/profile">
    @csrf

    <!-- Equivalent to... -->
    <input type="hidden" name="_token" value="{{ csrf_token() }}" />
</form>
```

<a name="csrf-tokens-and-spas"></a>
#### CSRF Tokens & SPAs

LaravelをAPIバックエンドとして利用するSPAを構築している場合は、APIによる認証とCSRFの脆弱性からの保護について、[Laravel　Sanctumドキュメント](/docs/{{version}}/sanctum)を参照してください。

<a name="origin-verification"></a>
### Origin Verification

As discussed above, Laravel's request forgery middleware first checks the `Sec-Fetch-Site` header to determine if the request is from the same origin. By default, if this check does not pass, the middleware falls back to CSRF token validation.

However, if you would like to rely solely on origin verification and disable the CSRF token fallback entirely, you may do so using the `preventRequestForgery` method in your application's `bootstrap/app.php` file:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->preventRequestForgery(originOnly: true);
})
```

When using origin-only mode, requests that fail origin verification will receive a `403` HTTP response instead of the `419` response typically associated with CSRF token mismatches.

> [!WARNING]
> The `Sec-Fetch-Site` header is only sent by browsers over secure (HTTPS) connections. If your application is not served over HTTPS, origin verification will not be available and the middleware will fall back to CSRF token validation.

If your application needs to accept requests from subdomains (for example, `dashboard.example.com` accepting requests from `example.com`), you may allow same-site requests in addition to same-origin requests:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->preventRequestForgery(allowSameSite: true);
})
```

<a name="csrf-excluding-uris"></a>
### CSRF保護から除外するURI

場合により、一連のURIをCSRF保護から除外したいことが起きます。たとえば、[Stripe](https://stripe.com)を使用して支払いを処理し、そのWebhookシステムを利用している場合、StripeはどのCSRFトークンをルートへ送るのか認識していないため、Stripe　WebフックハンドラルートをCSRF保護から除外する必要があります。

Typically, you should place these kinds of routes outside of the `web` middleware group that Laravel applies to all routes in the `routes/web.php` file. However, you may also exclude specific routes by providing their URIs to the `preventRequestForgery` method in your application's `bootstrap/app.php` file:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->preventRequestForgery(except: [
        'stripe/*',
        'http://example.com/foo/bar',
        'http://example.com/foo/*',
    ]);
})
```

> [!NOTE]
> 利便性向上のため、[テスト実行](/docs/{{version}}/testing)時に、CSRFミドルウェアはすべてのルートで自動的に無効になります。

<a name="csrf-x-csrf-token"></a>
## X-CSRF-TOKEN

In addition to checking for the CSRF token as a POST parameter, the `PreventRequestForgery` middleware will also check for the `X-CSRF-TOKEN` request header. You could, for example, store the token in an HTML `meta` tag:

```blade
<meta name="csrf-token" content="{{ csrf_token() }}">
```

次にjQueryなどのライブラリで、すべてのリクエストヘッダへトークンを自動的に追加するように指示できます。これにより、レガシーJavaScriptテクノロジーを使用して、AJAXベースのアプリケーションにシンプルで便利なCSRF保護を提供しています。

```js
$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});
```

<a name="csrf-x-xsrf-token"></a>
## X-XSRF-TOKEN

Laravelはフレームワークが生成する各レスポンスに含める`XSRF-TOKEN`暗号化クッキーへ、現在のCSRFトークンを保存します。クッキー値を使用して、`X-XSRF-TOKEN`リクエストヘッダを設定できます。

AngularやAxiosなどの一部のJavaScriptフレームワークとライブラリは、同じオリジンのリクエストでその値を自動的に`X-XSRF-TOKEN`ヘッダへ配置するため、このクッキーは主に開発者の利便性のために送信されます。

> [!NOTE]
> デフォルトで、`resources/js/bootstrap.js`ファイルにはAxios HTTPライブラリが含まれており、`X-XSRF-TOKEN`ヘッダを自動的に送信します。
