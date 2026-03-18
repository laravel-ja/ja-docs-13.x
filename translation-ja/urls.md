# URL生成

- [イントロダクション](#introduction)
- [基礎](#the-basics)
    - [URLの生成](#generating-urls)
    - [現在のURLへのアクセス](#accessing-the-current-url)
- [名前付きルートのURL](#urls-for-named-routes)
    - [署名付きURL](#signed-urls)
- [コントローラアクションのURL](#urls-for-controller-actions)
- [Fluent URIオブジェクト](#fluent-uri-objects)
- [デフォルト値](#default-values)

<a name="introduction"></a>
## イントロダクション

Laravelは、アプリケーションのURLを生成するのに役立つヘルパをいくつか提供しています。これらのヘルパは、主にテンプレートとAPIレスポンスでリンクを構築するとき、またはアプリケーションの別の部分へのリダイレクトレスポンスを生成するときに役立ちます。

<a name="the-basics"></a>
## 基礎

<a name="generating-urls"></a>
### URLの生成

`url`ヘルパは、アプリケーションの任意のURLを生成するために使用します。生成したURLは、アプリケーションが処理している現在のリクエストのスキーム(HTTPまたはHTTPS)とホストを自動的に使用します。

```php
$post = App\Models\Post::find(1);

echo url("/posts/{$post->id}");

// http://example.com/posts/1
```

クエリ文字列パラメータを用いたURLを生成するには、`query`メソッドを使います。

```php
echo url()->query('/posts', ['search' => 'Laravel']);

// https://example.com/posts?search=Laravel

echo url()->query('/posts?sort=latest', ['search' => 'Laravel']);

// http://example.com/posts?sort=latest&search=Laravel
```

あらかじめパスに存在するクエリ文字列パラメータを指定すると、既存の値を上書きします。

```php
echo url()->query('/posts?sort=latest', ['sort' => 'oldest']);

// http://example.com/posts?sort=oldest
```

値の配列もクエリパラメータとして渡すことができます。これらの値は生成するURLの中で、適切にキー付し、エンコードします。

```php
echo $url = url()->query('/posts', ['columns' => ['title', 'body']]);

// http://example.com/posts?columns%5B0%5D=title&columns%5B1%5D=body

echo urldecode($url);

// http://example.com/posts?columns[0]=title&columns[1]=body
```

<a name="accessing-the-current-url"></a>
### 現在のURLへのアクセス

`url`ヘルパにパスを指定しないと、`Illuminate\Routing\UrlGenerator`インスタンスが返され、現在のURLに関する情報へアクセスできます。

```php
// クエリ文字列を除いた現在のURL
echo url()->current();

// クエリ文字列を含んだ現在のURL
echo url()->full();
```

これらの各メソッドは、`URL`[ファサード](/docs/{{version}}/facades)経由でもアクセス可能です。

```php
use Illuminate\Support\Facades\URL;

echo URL::current();
```

<a name="accessing-the-previous-url"></a>
#### 以前のURLへのアクセス

ユーザーが訪れた以前のURLを知ることは、時に有用です。以前のURLには、`url`ヘルパの`previous`と`previousPath`メソッドでアクセスできます。

```php
// 直前のリクエストの完全なURL
echo url()->previous();

// 直前のリクエストのパスの取得
echo url()->previousPath();
```

あるいは、[セッション](/docs/{{version}}/session) を通じて、以前のURLへ[読み書きしやすい(fluent)URI](#fluent-uri-objects)インスタンスとしてもアクセスできます。

```php
use Illuminate\Http\Request;

Route::post('/users', function (Request $request) {
    $previousUri = $request->session()->previousUri();

    // ...
});
```

セッションを介して、以前にアクセスしたURLのルート名を取得することも可能です。

```php
$previousRoute = $request->session()->previousRoute();
```

<a name="urls-for-named-routes"></a>
## 名前付きルートのURL

`route`ヘルパは、[名前付きルート](/docs/{{version}}/routing#named-routes)へのURLを生成するためにも使用できます。名前付きルートを使用すると、ルートで定義する実際のURLと結合せずにURLを生成できます。したがって、ルートのURLが変更された場合でも、`route`関数の呼び出しを変更する必要はありません。たとえば、アプリケーションに次のように定義されたルートが含まれているとします。

```php
Route::get('/post/{post}', function (Post $post) {
    // ...
})->name('post.show');
```

このルートへのURLを生成するには、次のように`route`ヘルパを使用します。

```php
echo route('post.show', ['post' => 1]);

// http://example.com/post/1
```

もちろん、`route`ヘルパを使用して、複数のパラメータを持つルートのURLを生成することもできます。

```php
Route::get('/post/{post}/comment/{comment}', function (Post $post, Comment $comment) {
    // ...
})->name('comment.show');

echo route('comment.show', ['post' => 1, 'comment' => 3]);

// http://example.com/post/1/comment/3
```

ルートの定義パラメータに対応しない過剰な配列要素は、URLのクエリ文字列として追加されます。

```php
echo route('post.show', ['post' => 1, 'search' => 'rocket']);

// http://example.com/post/1?search=rocket
```

<a name="eloquent-models"></a>
#### Eloquentモデル

[Eloquentモデル](/docs/{{version}}/eloquent)のルートキー（通常は主キー）を使ってURLを生成することが多いでしょう。そのため、パラメータ値としてEloquentモデルを渡せます。`route`ヘルパは、モデルのルートキーを自動的に抽出します。

```php
echo route('post.show', ['post' => $post]);
```

<a name="signed-urls"></a>
### 署名付きURL

Laravelでは名前付きルートに対し、簡単に「署名付きURL」を作成できます。このURLは「署名」ハッシュをクエリ文字列として付加し、作成されてからそのURLが変更されていないかをLaravelで確認できるようにします。署名付きURLは公にアクセスさせるルートではあるが、URL操作に対する保護レイヤが必要な場合とくに便利です。

たとえば、公の「購読終了」リンクを顧客へのメールへ用意するために、署名付きURLが使用できます。名前付きルートに対し署名URLを作成するには、`URL`ファサードの`signedRoute`メソッドを使用します。

```php
use Illuminate\Support\Facades\URL;

return URL::signedRoute('unsubscribe', ['user' => 1]);
```

`signedRoute`メソッドで`absolute`引数を指定すれば、署名付きURLハッシュからドメインを除外できます。

```php
return URL::signedRoute('unsubscribe', ['user' => 1], absolute: false);
```

指定する時間が経過すると期限切れになる一時的な署名付きルートURLを生成する場合は、`temporarySignedRoute`メソッドを使用します。Laravelが一時的な署名付きルートURLを検証するとき、署名付きURLにエンコードされている有効期限のタイムスタンプが経過していないことを確認します。

```php
use Illuminate\Support\Facades\URL;

return URL::temporarySignedRoute(
    'unsubscribe', now()->plus(minutes: 30), ['user' => 1]
);
```

<a name="validating-signed-route-requests"></a>
#### 署名付きルートリクエストの検査

受信リクエストに有効な署名があるかどうかを確認するには、受信した`Illuminate\Http\Request`インスタンスで`hasValidSignature`メソッドを呼び出します。

```php
use Illuminate\Http\Request;

Route::get('/unsubscribe/{user}', function (Request $request) {
    if (! $request->hasValidSignature()) {
        abort(401);
    }

    // ...
})->name('unsubscribe');
```

クライアントサイドのペジネーションなど、アプリケーションのフロントエンドが署名付きURLにデータを追加することを許可する必要が起きる場合があります。そのようなときは、`hasValidSignatureWhileIgnoring`メソッドを用いて、署名付きURLを検証する際に無視すべきリクエストクエリパラメータを指定します。パラメータの無視を許すと、誰でもリクエストのそのパラメータを変更できる点に注意してください。

```php
if (! $request->hasValidSignatureWhileIgnoring(['page', 'order'])) {
    abort(401);
}
```

受信リクエストインスタンスを使って署名付きURLを検証する代わりに、`signed`（`Illuminate\Routing\Middleware\ValidateSignature`）[ミドルウェア](/docs/{{version}}/middleware)をルートへ指定できます。受信クエストが有効な署名を持っていない場合、ミドルウェアは自動的に `403` HTTP レスポンスをします。

```php
Route::post('/unsubscribe/{user}', function (Request $request) {
    // ...
})->name('unsubscribe')->middleware('signed');
```

署名付きURLがURLハッシュにドメインを含んでいない場合、ミドルウェアで`relative`引数を与える必要があります。

```php
Route::post('/unsubscribe/{user}', function (Request $request) {
    // ...
})->name('unsubscribe')->middleware('signed:relative');
```

<a name="responding-to-invalid-signed-routes"></a>
#### 無効な署名付きルートのレスポンス

有効期限が切れた署名付きURLへ誰かがアクセスすると、`403`HTTPステータスコードの一般的なエラーページを表示します。しかし、アプリケーションの`bootstrap/app.php`ファイルで、`InvalidSignatureException`例外用のカスタム「レンダ」クロージャを定義することで、この動作をカスタマイズできます。

```php
use Illuminate\Routing\Exceptions\InvalidSignatureException;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->render(function (InvalidSignatureException $e) {
        return response()->view('errors.link-expired', status: 403);
    });
})
```

<a name="urls-for-controller-actions"></a>
## コントローラアクションのURL

`action`関数は、指定するコントローラアクションに対するURLを生成します。

```php
use App\Http\Controllers\HomeController;

$url = action([HomeController::class, 'index']);
```

コントローラメソッドがルートパラメータを受け入れる場合、関数の２番目の引数としてルートパラメータの連想配列を渡せます。

```php
$url = action([UserController::class, 'profile'], ['id' => 1]);
```

<a name="fluent-uri-objects"></a>
## Fluent URIオブジェクト

Laravelの`Uri`クラスは、オブジェクトを介してURIを作成・操作するための便利で読み書きしやすい（Fluent）インターフェイスを提供します。このクラスは、基盤のLeague URIパッケージが提供する機能をラップし、Laravelのルーティングシステムとシームレスに統合しています。

静的メソッドを使い、`Uri`インスタンスを簡単に作成できます。

```php
use App\Http\Controllers\UserController;
use App\Http\Controllers\InvokableController;
use Illuminate\Support\Uri;

// 指定した文字列から、URIインスタンスを生成
$uri = Uri::of('https://example.com/path');

// パス、名前付きルート、コントローラアクションからURIインスタンスを生成
$uri = Uri::to('/dashboard');
$uri = Uri::route('users.show', ['user' => 1]);
$uri = Uri::signedRoute('users.show', ['user' => 1]);
$uri = Uri::temporarySignedRoute('user.index', now()->plus(minutes: 5));
$uri = Uri::action([UserController::class, 'index']);
$uri = Uri::action(InvokableController::class);

// 現在のリクエストからURIインスタンスを生成
$uri = $request->uri();

// 以前のリクエストからURIインスタンスを生成
$uri = $request->session()->previousUri();
```

URIインスタンスを生成したら、スラスラと変更できます。

```php
$uri = Uri::of('https://example.com')
    ->withScheme('http')
    ->withHost('test.com')
    ->withPort(8000)
    ->withPath('/users')
    ->withQuery(['page' => 2])
    ->withFragment('section-1');
```

Fluent URIオブジェクトの操作の詳細は、[URIドキュメント](/docs/{{version}}/helpers#uri)を参照してください。

<a name="default-values"></a>
## デフォルト値

アプリケーションにより、特定のURLパラメータのデフォルト値をリクエスト全体で指定したい場合もあります。たとえば、多くのルートで`{locale}`パラメータを定義していると想像してください。

```php
Route::get('/{locale}/posts', function () {
    // ...
})->name('post.index');
```

毎回`route`ヘルパを呼び出すごとに、`locale`をいつも指定するのは厄介です。そのため、現在のリクエストの間、常に適用されるこのパラメートのデフォルト値は、`URL::defaults`メソッドを使用し定義できます。現在のリクエストでアクセスできるように、[ルートミドルウェア](/docs/{{version}}/middleware#assigning-middleware-to-routes)から、このメソッドを呼び出したいかと思います。

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\Response;

class SetDefaultLocaleForUrls
{
    /**
     * 受信リクエストの処理
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        URL::defaults(['locale' => $request->user()->locale]);

        return $next($request);
    }
}
```

一度`locale`パラメータに対するデフォルト値をセットしたら、`route`ヘルパを使いURLを生成する時に、値を渡す必要はもうありません。

<a name="url-defaults-middleware-priority"></a>
#### URLのデフォルトとミドルウェアの優先度

URLのデフォルト値を設定すると、Laravelの暗黙のモデル結合の処理と干渉することがあります。そのため、URLのデフォルト値を設定する[ミドルウェア](/docs/{{version}}/middleware#sorting-middleware)は、Laravel自身の`SubstituteBindings`ミドルウェアよりも先に実行されるように、[優先順位を付ける]必要があります。アプリケーションの`bootstrap/app.php`ファイルにある`priority`ミドルウェアメソッドを使用することで指定できます。

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->prependToPriorityList(
        before: \Illuminate\Routing\Middleware\SubstituteBindings::class,
        prepend: \App\Http\Middleware\SetDefaultLocaleForUrls::class,
    );
})
```
