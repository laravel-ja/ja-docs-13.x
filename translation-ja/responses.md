# HTTPレスポンス

- [レスポンスの生成](#creating-responses)
    - [ヘッダの付加](#attaching-headers-to-responses)
    - [クッキーの付加](#attaching-cookies-to-responses)
    - [クッキーと暗号化](#cookies-and-encryption)
- [リダイレクト](#redirects)
    - [名前付きルートへのリダイレクト](#redirecting-named-routes)
    - [コントローラアクションへのリダイレクト](#redirecting-controller-actions)
    - [外部ドメインへのリダイレクト](#redirecting-external-domains)
    - [一時保持データを保存するリダイレクト](#redirecting-with-flashed-session-data)
- [他のレスポンスタイプ](#other-response-types)
    - [Viewレスポンス](#view-responses)
    - [JSONレスポンス](#json-responses)
    - [Fileダウンロード](#file-downloads)
    - [Fileレスポンス](#file-responses)
- [ストリームレスポンス](#streamed-responses)
    - [ストリームレスポンスの利用](#consuming-streamed-responses)
    - [ストリームJSONレスポンス](#streamed-json-responses)
    - [イベントストリーム（SES）](#event-streams)
    - [ストリームのダウンロード](#streamed-downloads)
- [レスポンスマクロ](#response-macros)

<a name="creating-responses"></a>
## レスポンスの生成

<a name="strings-arrays"></a>
#### 文字列と配列

当然ながらすべてのルートやコントローラは、ユーザーのブラウザに対し、何らかのレスポンスを返す必要があります。Laravelはレスポンスを返すためにさまざまな手段を用意しています。一番基本的なレスポンスは、ルートかコントローラから文字列を返します。フレームワークが自動的に、文字列を完全なHTTPレスポンスへ変換します。

```php
Route::get('/', function () {
    return 'Hello World';
});
```

ルートやコントローラから文字列を返す他に、配列も返せます。フレームワークは自動的に、配列をJSONレスポンスへ変換します。

```php
Route::get('/', function () {
    return [1, 2, 3];
});
```

> [!NOTE]
> [Eloquentコレクション](/docs/{{version}}/eloquent-collections)も返せることを知っていますか？　自動的にJSONへ変換されます。試してください！

<a name="response-objects"></a>
#### レスポンスオブジェクト

通常、皆さんは単純な文字列や配列をルートアクションから返すだけじゃありませんよね。代わりに、`Illuminate\Http\Response`インスタンスか[ビュー](/docs/{{version}}/views)を返したいですよね。

完全な`Response`インスタンスを返せば、レスポンスのHTTPステータスコードやヘッダをカスタマイズできます。`Response`インスタンスは、`Symfony\Component\HttpFoundation\Response`クラスを継承しており、HTTPレスポンスを構築するためにさまざまなメソッドを提供しています。

```php
Route::get('/home', function () {
    return response('Hello World', 200)
        ->header('Content-Type', 'text/plain');
});
```

<a name="eloquent-models-and-collections"></a>
#### Eloquentモデルとコレクション

[Eloquent ORM](/docs/{{version}}/eloquent)モデルとコレクションをルートとコントローラから直接返すこともできます。これを行うと、Laravelはモデルの[非表示属性](/docs/{{version}}/eloquent-serialization#hiding-attributes-from-json)を尊重しながら、モデルやコレクションをJSONレスポンスへ自動的に変換します。

```php
use App\Models\User;

Route::get('/user/{user}', function (User $user) {
    return $user;
});
```

<a name="attaching-headers-to-responses"></a>
### レスポンスへのヘッダ付加

レスポンスインスタンスをスラスラと構築できるように、ほとんどのレスポンスメソッドはチェーンとしてつなげられることを覚えておきましょう。たとえば、ユーザーにレスポンスを送り返す前に、`header`メソッドでいくつかのヘッダを追加できます。

```php
return response($content)
    ->header('Content-Type', $type)
    ->header('X-Header-One', 'Header Value')
    ->header('X-Header-Two', 'Header Value');
```

もしくは、`withHeaders`メソッドで、レスポンスへ追加したいヘッダの配列を指定します。

```php
return response($content)
    ->withHeaders([
        'Content-Type' => $type,
        'X-Header-One' => 'Header Value',
        'X-Header-Two' => 'Header Value',
    ]);
```

`withoutHeader`メソッドを使用して、送信するレスポンスから特定のヘッダを削除できます。

```php
return response($content)->withoutHeader('X-Debug');

return response($content)->withoutHeader(['X-Debug', 'X-Powered-By']);
```

<a name="cache-control-middleware"></a>
#### キャッシュコントロール・ミドルウェア

ルートグループへ`Cache-Control`ヘッダを簡単に指定できるよう、Laravelは`cache.headers`を用意しています。ディレクティブは、対応するcache-controlディレクティブの「スネークケース」を使用し、セミコロンで区切って指定してください。ディレクティブのリストの中で`etag`を指定すると、レスポンスコンテンツのMD5ハッシュをETag識別子へ自動的にセットします。

```php
Route::middleware('cache.headers:public;max_age=30;s_maxage=300;stale_while_revalidate=600;etag')->group(function () {
    Route::get('/privacy', function () {
        // …
    });

    Route::get('/terms', function () {
        // …
    });
});
```

<a name="attaching-cookies-to-responses"></a>
### レスポンスへのクッキー付加

`cookie`メソッドを使用して、発信`Illuminate\Http\Response`インスタンスへクッキーを添付できます。Cookieが有効であると見なされる名前、値、および分数をメソッドへ渡す必要があります。

```php
return response('Hello World')->cookie(
    'name', 'value', $minutes
);
```

`cookie`メソッドはさらに、使用機会が少ない引数をいくつか受け付けます。これらの引数は、全般的にPHPネイティブの[setcookie](https://secure.php.net/manual/en/function.setcookie.php)メソッドに指定する引数と、同じ目的、同じ意味合いを持っています。

```php
return response('Hello World')->cookie(
    'name', 'value', $minutes, $path, $domain, $secure, $httpOnly
);
```

クッキーが送信レスポンスとともに確実に送信したいが、そのレスポンスのインスタンスがまだない場合は、`Cookie`ファサードを使用して、送信時にレスポンスへ添付するためにそのクッキーを「キュー」へ投入できます。`queue`メソッドは、クッキーインスタンスの作成に必要な引数をとります。こうしたクッキーは、ブラウザへ送信される前に送信レスポンスへ添付します。

```php
use Illuminate\Support\Facades\Cookie;

Cookie::queue('name', 'value', $minutes);
```

<a name="generating-cookie-instances"></a>
#### クッキーインスタンスの生成

後ほどレスポンスインスタンスへアタッチできる`Symfony\Component\HttpFoundation\Cookie`インスタンスを生成したい場合は、グローバルな`cookie`ヘルパを使用します。このCookieは、レスポンスインスタンスへ添付しない限り、クライアントに返送されません。

```php
$cookie = cookie('name', 'value', $minutes);

return response('Hello World')->cookie($cookie);
```

<a name="expiring-cookies-early"></a>
#### クッキーの早期期限切れ

送信レスポンスの`withoutCookie`メソッドを介してクッキーを期限切れにすることにより、そのクッキーを削除できます。

```php
return response('Hello World')->withoutCookie('name');
```

送信レスポンスのインスタンスがまだない場合は、`Cookie`ファサードの`expire`メソッドを使用してCookieを期限切れにすることができます。

```php
Cookie::expire('name');
```

<a name="cookies-and-encryption"></a>
### クッキーと暗号化

デフォルトではありがたいことに、`Illuminate\Cookie\Middleware\EncryptCookies`ミドルウェアのおかげで、Laravelが生成したすべてのクッキーは暗号化され、クライアントによって変更されたり読み取られたりしないように署名を付けます。アプリケーションが生成したクッキーのサブセットの暗号化を無効にしたい場合は、アプリケーションの`bootstrap/app.php`ファイルで、`encryptCookies`メソッドを使用してください。

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->encryptCookies(except: [
        'cookie_name',
    ]);
})
```

> [!NOTE]
> 一般的に、クッキーの暗号化は無効化すべきではありません。無効化すると、クライアント側でのデータ漏洩や改ざんのリスクにクッキーが晒されるためです。

<a name="redirects"></a>
## リダイレクト

リダイレクトのレスポンスは`Illuminate\Http\RedirectResponse`クラスのインスタンスであり、ユーザーを他のURLへリダイレクトさせるために必要なしっかりとしたヘッダを含んでいます。`RedirectResponse`インスタンスを生成するにはさまざまな方法があります。一番簡単な方法は、グローバルな`redirect`ヘルパを使う方法です。

```php
Route::get('/dashboard', function () {
    return redirect('/home/dashboard');
});
```

送信したフォームが無効な場合など、ユーザーを以前の場所にリダイレクトしたい場合があります。これは、グローバルな`back`ヘルパ関数を使用して行うことができます。この機能は[セッション](/docs/{{version}}/session)を利用するため、`back`関数を呼び出すルートが`web`ミドルウェアグループを使用していることを確認してください。

```php
Route::post('/user/profile', function () {
    // リクエストのバリデーション処理…

    return back()->withInput();
});
```

<a name="redirecting-named-routes"></a>
### 名前付きルートへのリダイレクト

`redirect`ヘルパを引数無しで呼ぶと、`Illuminate\Routing\Redirector`インスタンスが返され、`Redirector`インスタンスのメソッドが呼び出せるようになります。たとえば、名前付きルートに対する`RedirectResponse`を生成したい場合は、`route`メソッドが使えます。

```php
return redirect()->route('login');
```

ルートにパラメータがある場合は、`route`メソッドの第２引数として渡してください。

```php
// profile/{id}のURIを持つルートの場合

return redirect()->route('profile', ['id' => 1]);
```

<a name="populating-parameters-via-eloquent-models"></a>
#### Eloquentモデルによる、パラメータの埋め込み

Eloquentモデルの"ID"をルートパラメータとしてリダイレクトする場合は、モデルをそのまま渡してください。IDは自動的に取り出されます。

```php
// profile/{id}のURIを持つルートの場合

return redirect()->route('profile', [$user]);
```

ルートパラメータへ配置する値をカスタマイズする場合は、ルートパラメータ定義(`/profile/{id:slug}`)でカラムを指定するか、Eloquentモデルの`getRouteKey`メソッドをオーバーライドします。

```php
/**
 * モデルのルートキー値の取得
 */
public function getRouteKey(): mixed
{
    return $this->slug;
}
```

<a name="redirecting-controller-actions"></a>
### コントローラアクションへのリダイレクト

[コントローラアクション](/docs/{{version}}/controllers)に対するリダイレクトを生成することもできます。そのためには、コントローラとアクションの名前を`action`メソッドに渡してください。

```php
use App\Http\Controllers\UserController;

return redirect()->action([UserController::class, 'index']);
```

コントローラルートにパラメータが必要ならば、`action`メソッドの第２引数として渡してください。

```php
return redirect()->action(
    [UserController::class, 'profile'], ['id' => 1]
);
```

<a name="redirecting-external-domains"></a>
### 外部ドメインへのリダイレクト

アプリケーション外のドメインへリダイレクトする必要がときどき起きます。このためには`away`メソッドを呼び出してください。これは`RedirectResponse`を生成しますが、URLエンコードを追加せず、バリデーションも検証も行いません。

```php
return redirect()->away('https://www.google.com');
```

<a name="redirecting-with-flashed-session-data"></a>
### フラッシュデータを保存するリダイレクト

新しいURLへリダイレクトし、[セッションへフラッシュデータを保存する](/docs/{{version}}/session#flash-data)のは、一度にまとめて行われる典型的な作業です。典型的な使い方は、あるアクションが実行成功した後に、実効成功メッセージをフラッシュデータとしてセッションに保存する場合でしょう。これに便利なように、`RedirectResponse`インスタンスを生成し、メソッドチェーンを一つだけさっと書けば、データをセッションへ保存できるようになっています。

```php
Route::post('/user/profile', function () {
    // ...

    return redirect('/dashboard')->with('status', 'Profile updated!');
});
```

ユーザーを新しいページヘリダイレクトした後、[セッション](/docs/{{version}}/session)へ保存したフラッシュデータのメッセージを取り出して、表示します。たとえば、[Blade記法](/docs/{{version}}/blade)を使ってみましょう。

```blade
@if (session('status'))
    <div class="alert alert-success">
        {{ session('status') }}
    </div>
@endif
```

<a name="redirecting-with-input"></a>
#### 入力と共にリダイレクト

ユーザーを新しい場所にリダイレクトする前に、`RedirectResponse`インスタンスが提供する`withInput`メソッドを使用して、現在のリクエストの入力データをセッションへ一時保存できます。これは通常、ユーザーがバリデーションエラーに遭遇した場合に行います。入力をセッションに一時保存したら、次のリクエスト中で簡単に[取得](/docs/{{version}}/requests#retrieveing-old-input)してフォームを再入力できます。

```php
return back()->withInput();
```

<a name="other-response-types"></a>
## 他のレスポンスタイプ

`response`ヘルパは、他のタイプのレスポンスインスタンスを生成するために便利です。`response`ヘルパが引数なしで呼び出されると、`Illuminate\Contracts\Routing\ResponseFactory`[契約](/docs/{{version}}/contracts)が返されます。この契約はレスポンスを生成するための、さまざまなメソッドを提供しています。

<a name="view-responses"></a>
### Viewレスポンス

レスポンスのステータスやヘッダをコントロールしながらも、レスポンス内容として[ビュー](/docs/{{version}}/views)を返す必要がある場合は、`view`メソッドを使用してください。

```php
return response()
    ->view('hello', $data, 200)
    ->header('Content-Type', $type);
```

もちろん、カスタムHTTPステータスコードやカスタムヘッダを渡す必要がない場合は、グローバルな`view`ヘルパ関数が使用できます。

<a name="json-responses"></a>
### JSONレスポンス

`json`メソッドは自動的に`Content-Type`ヘッダを`application/json`にセットし、同時に指定された配列を`json_encode` PHP関数によりJSONへ変換します。

```php
return response()->json([
    'name' => 'Abigail',
    'state' => 'CA',
]);
```

JSONPレスポンスを生成したい場合は、`json`メソッドと`withCallback`メソッドを組み合わせてください。

```php
return response()
    ->json(['name' => 'Abigail', 'state' => 'CA'])
    ->withCallback($request->input('callback'));
```

<a name="file-downloads"></a>
### Fileダウンロード

`download`メソッドを使用して、ユーザーのブラウザに対し、指定パスのファイルをダウンロードするように強制するレスポンスを生成できます。`download`メソッドは、メソッドの引数の２番目にファイル名を取ります。これにより、ユーザーがファイルをダウンロードするときに表示するファイル名が決まります。最後に、HTTPヘッダの配列をメソッドの３番目の引数として渡すこともできます。

```php
return response()->download($pathToFile);

return response()->download($pathToFile, $name, $headers);
```

> [!WARNING]
> ファイルダウンロードを管理しているSymfony HttpFoundationクラスは、ASCIIのダウンロードファイル名を指定するよう要求しています。

<a name="file-responses"></a>
### Fileレスポンス

`file`メソッドは、画像やPDFのようなファイルを、ダウンロードを開始する代わりにユーザーのブラウザに直接表示するために使用します。このメソッドは、第一引数にファイルの絶対パスを、第二引数にヘッダの配列を受け取ります。

```php
return response()->file($pathToFile);

return response()->file($pathToFile, $headers);
```

<a name="streamed-responses"></a>
## ストリームレスポンス

生成済みのデータをクライアントへストリーミングすることで、特に非常に大きなレスポンスでは、メモリ使用量とパフォーマンスを大幅に削減できます。Streamedレスポンスでは、サーバがデータの送信を終える前にクライアントがデータの処理を始めることができます。

```php
Route::get('/stream', function () {
    return response()->stream(function (): void {
        foreach (['developer', 'admin'] as $string) {
            echo $string;
            ob_flush();
            flush();
            sleep(2); // チャンク間の遅延をシミュレート
        }
    }, 200, ['X-Accel-Buffering' => 'no']);
});
```

使いやすいように、`stream`メソッドで指定したクロージャが[ジェネレータ](https://www.php.net/manual/ja/language.generators.overview.php)を返す場合、Laravelはジェネレーターが返す文字列間の出力バッファを自動的にフラッシュし、Nginxの出力バッファリングも無効にします。

```php
Route::post('/chat', function () {
    return response()->stream(function (): Generator {
        $stream = OpenAI::client()->chat()->createStreamed(...);

        foreach ($stream as $response) {
            yield $response->choices[0];
        }
    });
});
```

<a name="consuming-streamed-responses"></a>
### ストリームレスポンスの利用

ストリームレスポンスは、Laravelのレスポンスやイベントストリームとやり取りするための便利なAPIを提供する、Laravelの`stream` npmパッケージを使用して利用できます。開始するには、`@laravel/stream-react`、`@laravel/stream-vue`、`@laravel/stream-svelte`パッケージをインストールしてください。

```shell tab=React
npm install @laravel/stream-react
```

```shell tab=Vue
npm install @laravel/stream-vue
```

```shell tab=Svelte
npm install @laravel/stream-svelte
```

次に、イベントストリームを利用するために、`useStream`を使用します。ストリームのURLを指定後、Laravelアプリケーションからコンテンツが返されると、フックは自動的に`data`を連結したレスポンスで更新します。

```tsx tab=React
import { useStream } from "@laravel/stream-react";

function App() {
    const { data, isFetching, isStreaming, send } = useStream("chat");

    const sendMessage = () => {
        send({
            message: `Current timestamp: ${Date.now()}`,
        });
    };

    return (
        <div>
            <div>{data}</div>
            {isFetching && <div>接続中…</div>}
            {isStreaming && <div>生成中…</div>}
            <button onClick={sendMessage}>メッセージ送信</button>
        </div>
    );
}
```

```vue tab=Vue
<script setup lang="ts">
import { useStream } from "@laravel/stream-vue";

const { data, isFetching, isStreaming, send } = useStream("chat");

const sendMessage = () => {
    send({
        message: `Current timestamp: ${Date.now()}`,
    });
};
</script>

<template>
    <div>
        <div>{{ data }}</div>
        <div v-if="isFetching">接続中…</div>
        <div v-if="isStreaming">生成中…</div>
        <button @click="sendMessage">メッセージ送信</button>
    </div>
</template>
```

```svelte tab=Svelte
<script>
import { useStream } from "@laravel/stream-svelte";

const stream = useStream("chat");

const sendMessage = () => {
    stream.send({
        message: `Current timestamp: ${Date.now()}`,
    });
};
</script>

<div>
    <div>{$stream.data}</div>
    {#if $stream.isFetching}
        <div>Connecting...</div>
    {/if}
    {#if $stream.isStreaming}
        <div>Generating...</div>
    {/if}
    <button onclick={sendMessage}>Send Message</button>
</div>
```

データを`send`を使いストリームに送り返す場合、ストリームへのアクティブな接続は新しいデータを送信する前にキャンセルします。すべてのリクエストは、JSON `POST`リクエストとして送信します。

> [!WARNING]
> `useStream`フックは、アプリケーションに対し`POST`リクエストを行うため、有効なCSRFトークンが必要です。CSRFトークンを提供する最も簡単な方法は、[アプリケーションレイアウトのheadにmetaタグとして含めることです](/docs/{{version}}/csrf#csrf-x-csrf-token)。

`useStream`の第２引数は、オプションオブジェクトで、ストリームの利用動作をカスタマイズするために使用します。このオブジェクトのデフォルト値を以下に示します。

```tsx tab=React
import { useStream } from "@laravel/stream-react";

function App() {
    const { data } = useStream("chat", {
        id: undefined,
        initialInput: undefined,
        headers: undefined,
        csrfToken: undefined,
        onResponse: (response: Response) => void,
        onData: (data: string) => void,
        onCancel: () => void,
        onFinish: () => void,
        onError: (error: Error) => void,
    });

    return <div>{data}</div>;
}
```

```vue tab=Vue
<script setup lang="ts">
import { useStream } from "@laravel/stream-vue";

const { data } = useStream("chat", {
    id: undefined,
    initialInput: undefined,
    headers: undefined,
    csrfToken: undefined,
    onResponse: (response: Response) => void,
    onData: (data: string) => void,
    onCancel: () => void,
    onFinish: () => void,
    onError: (error: Error) => void,
});
</script>

<template>
    <div>{{ data }}</div>
</template>
```

```svelte tab=Svelte
<script>
import { useStream } from "@laravel/stream-svelte";

const stream = useStream("chat", {
    id: undefined,
    initialInput: undefined,
    headers: undefined,
    csrfToken: undefined,
    onResponse: (response) => {},
    onData: (data) => {},
    onCancel: () => {},
    onFinish: () => {},
    onError: (error) => {},
});
</script>

<div>{$stream.data}</div>
```

ストリームからの最初のレスポンスが成功した後に、`onResponse`をトリガーし、素の[レスポンス](https://developer.mozilla.org/ja/docs/Web/API/Response)をコールバックへ渡します。各チャンクが受信されるたびに`onData`を呼び出し、現在のチャンクをコールバックへ渡します。`onFinish`は、ストリームが終了したときと、フェッチ/読み込みのサイクルでエラーが発生したときに呼び出します。

デフォルトでは、初期化時にストリームへのリクエストを行いません。ストリームに初期ペイロードを渡す場合は、`initialInput`オプションを使用してください。

```tsx tab=React
import { useStream } from "@laravel/stream-react";

function App() {
    const { data } = useStream("chat", {
        initialInput: {
            message: "Introduce yourself.",
        },
    });

    return <div>{data}</div>;
}
```

```vue tab=Vue
<script setup lang="ts">
import { useStream } from "@laravel/stream-vue";

const { data } = useStream("chat", {
    initialInput: {
        message: "Introduce yourself.",
    },
});
</script>

<template>
    <div>{{ data }}</div>
</template>
```

```svelte tab=Svelte
<script>
import { useStream } from "@laravel/stream-svelte";

const stream = useStream("chat", {
    initialInput: {
        message: "Introduce yourself.",
    },
});
</script>

<div>{$stream.data}</div>
```

ストリームを手作業でキャンセルするには、フックが返す、`cancel`メソッドを使用します。

```tsx tab=React
import { useStream } from "@laravel/stream-react";

function App() {
    const { data, cancel } = useStream("chat");

    return (
        <div>
            <div>{data}</div>
            <button onClick={cancel}>Cancel</button>
        </div>
    );
}
```

```vue tab=Vue
<script setup lang="ts">
import { useStream } from "@laravel/stream-vue";

const { data, cancel } = useStream("chat");
</script>

<template>
    <div>
        <div>{{ data }}</div>
        <button @click="cancel">Cancel</button>
    </div>
</template>
```

```svelte tab=Svelte
<script>
import { useStream } from "@laravel/stream-svelte";

const stream = useStream("chat");
</script>

<div>
    <div>{$stream.data}</div>
    <button onclick={() => stream.cancel()}>Cancel</button>
</div>
```

`useStream`フックを使用するたびに、そのストリームを識別するためのランダムな`id`を生成します。これはリクエストごとに`X-STREAM-ID`ヘッダとしてサーバへ返します。複数のコンポーネントで同じストリームを使用する場合、独自の`id`を指定することにより、ストリームの読み書きが行えます。

```tsx tab=React
// App.tsx
import { useStream } from "@laravel/stream-react";

function App() {
    const { data, id } = useStream("chat");

    return (
        <div>
            <div>{data}</div>
            <StreamStatus id={id} />
        </div>
    );
}

// StreamStatus.tsx
import { useStream } from "@laravel/stream-react";

function StreamStatus({ id }) {
    const { isFetching, isStreaming } = useStream("chat", { id });

    return (
        <div>
            {isFetching && <div>接続中…</div>}
            {isStreaming && <div>生成中…</div>}
        </div>
    );
}
```

```vue tab=Vue
<!-- App.vue -->
<script setup lang="ts">
import { useStream } from "@laravel/stream-vue";
import StreamStatus from "./StreamStatus.vue";

const { data, id } = useStream("chat");
</script>

<template>
    <div>
        <div>{{ data }}</div>
        <StreamStatus :id="id" />
    </div>
</template>

<!-- StreamStatus.vue -->
<script setup lang="ts">
import { useStream } from "@laravel/stream-vue";

const props = defineProps<{
    id: string;
}>();

const { isFetching, isStreaming } = useStream("chat", { id: props.id });
</script>

<template>
    <div>
        <div v-if="isFetching">接続中…</div>
        <div v-if="isStreaming">生成中…</div>
    </div>
</template>
```

```svelte tab=Svelte
<!-- App.svelte -->
<script>
import { useStream } from "@laravel/stream-svelte";
import StreamStatus from "./StreamStatus.svelte";

const stream = useStream("chat");
</script>

<div>
    <div>{$stream.data}</div>
    <StreamStatus id={stream.id} />
</div>

<!-- StreamStatus.svelte -->
<script>
import { useStream } from "@laravel/stream-svelte";

let { id } = $props();

const stream = useStream("chat", { id });
</script>

<div>
    {#if $stream.isFetching}
        <div>Connecting...</div>
    {/if}
    {#if $stream.isStreaming}
        <div>Generating...</div>
    {/if}
</div>
```

<a name="streamed-json-responses"></a>
### ストリームJSONレスポンス

JSONデータを徐々にストリーミングする必要がある場合は、`streamJson`メソッドを利用してください。このメソッドは、JavaScriptで簡単にパースできる形式で、ブラウザに逐次送信する必要がある大きなデータセットの場合に特に有用です。

```php
use App\Models\User;

Route::get('/users.json', function () {
    return response()->streamJson([
        'users' => User::cursor(),
    ]);
});
```

`useJsonStream`フックは、[useStreamフック](#consuming-streamed-responses)と同じですが、ストリーミングが終了すると、データをJSONとしてパースしようと試みます。

```tsx tab=React
import { useJsonStream } from "@laravel/stream-react";

type User = {
    id: number;
    name: string;
    email: string;
};

function App() {
    const { data, send } = useJsonStream<{ users: User[] }>("users");

    const loadUsers = () => {
        send({
            query: "taylor",
        });
    };

    return (
        <div>
            <ul>
                {data?.users.map((user) => (
                    <li>
                        {user.id}: {user.name}
                    </li>
                ))}
            </ul>
            <button onClick={loadUsers}>Load Users</button>
        </div>
    );
}
```

```vue tab=Vue
<script setup lang="ts">
import { useJsonStream } from "@laravel/stream-vue";

type User = {
    id: number;
    name: string;
    email: string;
};

const { data, send } = useJsonStream<{ users: User[] }>("users");

const loadUsers = () => {
    send({
        query: "taylor",
    });
};
</script>

<template>
    <div>
        <ul>
            <li v-for="user in data?.users" :key="user.id">
                {{ user.id }}: {{ user.name }}
            </li>
        </ul>
        <button @click="loadUsers">Load Users</button>
    </div>
</template>
```

```svelte tab=Svelte
<script>
import { useJsonStream } from "@laravel/stream-svelte";

const stream = useJsonStream("users");

const loadUsers = () => {
    stream.send({
        query: "taylor",
    });
};
</script>

<div>
    <ul>
        {#if $stream.data?.users}
            {#each $stream.data.users as user (user.id)}
                <li>{user.id}: {user.name}</li>
            {/each}
        {/if}
    </ul>
    <button onclick={loadUsers}>Load Users</button>
</div>
```

<a name="event-streams"></a>
### イベントストリーム（SES）

`eventStream`メソッドは、`text/event-stream`コンテントタイプを使用して、サーバ送信イベント （SSE）ストリームレスポンスを返すために使用します。`eventStream`メソッドはクロージャを引数に取ります。クロージャはレスポンスが利用可能になると、ストリームに対するレスポンスを[yield](https://www.php.net/manual/en/language.generators.overview.php)します。

```php
Route::get('/chat', function () {
    return response()->eventStream(function () {
        $stream = OpenAI::client()->chat()->createStreamed(...);

        foreach ($stream as $response) {
            yield $response->choices[0];
        }
    });
});
```

イベント名をカスタマイズしたい場合は、`StreamedEvent`クラスのインスタンスを生成してください。

```php
use Illuminate\Http\StreamedEvent;

yield new StreamedEvent(
    event: 'update',
    data: $response->choices[0],
);
```

<a name="consuming-event-streams"></a>
#### イベントストリームの利用

イベントストリームは、Laravelのイベントストリームを操作するための便利なAPIを提供する、Laravelの`stream` npmパッケージを使用して利用できます。使い始めるには、`@laravel/stream-react`、`@laravel/stream-vue`、`@laravel/stream-svelte`パッケージをインストールしてください。

```shell tab=React
npm install @laravel/stream-react
```

```shell tab=Vue
npm install @laravel/stream-vue
```

```shell tab=Svelte
npm install @laravel/stream-svelte
```

次に、`useEventStream`を使用してイベントストリームを使用します。ストリームのURLを指定すると、フックは自動的に`message`を連結したレスポンスで更新します。このメッセージは、Laravelアプリケーションから返したものです。

```jsx tab=React
import { useEventStream } from "@laravel/stream-react";

function App() {
  const { message } = useEventStream("/chat");

  return <div>{message}</div>;
}
```

```vue tab=Vue
<script setup lang="ts">
import { useEventStream } from "@laravel/stream-vue";

const { message } = useEventStream("/chat");
</script>

<template>
  <div>{{ message }}</div>
</template>
```

```svelte tab=Svelte
<script>
import { useEventStream } from "@laravel/stream-svelte";

const eventStream = useEventStream("/chat");
</script>

<div>{$eventStream.message}</div>
```

`useEventStream`に指定する、２番目の引数はオプションオブジェクトで、ストリームの利用動作をカスタマイズするために使用します。このオブジェクトのデフォルト値を以下に示します。

```jsx tab=React
import { useEventStream } from "@laravel/stream-react";

function App() {
  const { message } = useEventStream("/stream", {
    eventName: "update",
    onMessage: (message) => {
      //
    },
    onError: (error) => {
      //
    },
    onComplete: () => {
      //
    },
    endSignal: "</stream>",
    glue: " ",
  });

  return <div>{message}</div>;
}
```

```vue tab=Vue
<script setup lang="ts">
import { useEventStream } from "@laravel/stream-vue";

const { message } = useEventStream("/chat", {
  eventName: "update",
  onMessage: (message) => {
    // ...
  },
  onError: (error) => {
    // ...
  },
  onComplete: () => {
    // ...
  },
  endSignal: "</stream>",
  glue: " ",
});
</script>
```

```svelte tab=Svelte
<script>
import { useEventStream } from "@laravel/stream-svelte";

const eventStream = useEventStream("/chat", {
    eventName: "update",
    onMessage: (event) => {
        //
    },
    onError: (error) => {
        //
    },
    onComplete: () => {
        //
    },
    endSignal: "</stream>",
    glue: " ",
    replace: false,
});
</script>
```

イベントストリームは、アプリケーションのフロントエンドによって、[EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) オブジェクトを介して手作業で利用することもできます。ストリームが終了すると、`eventStream`メソッドは自動的にイベントストリームへ`</stream>`更新を送信します。

```js
const source = new EventSource('/chat');

source.addEventListener('update', (event) => {
    if (event.data === '</stream>') {
        source.close();

        return;
    }

    console.log(event.data);
});
```

イベントストリームへ送信する最終イベントをカスタマイズするには、`eventStream`メソッドの`endStreamWith`引数に、`StreamedEvent`インスタンスを指定してください。

```php
return response()->eventStream(function () {
    // ...
}, endStreamWith: new StreamedEvent(event: 'update', data: '</stream>'));
```

<a name="streamed-downloads"></a>
### ストリームのダウンロード

特定の操作の文字列レスポンスを、操作の内容をディスクに書き込まずにダウンロード可能なレスポンスへ変換したい場合もあるでしょう。このシナリオでは、`streamDownload`メソッドを使用します。このメソッドは、コールバック、ファイル名、およびオプションのヘッダ配列を引数に取ります。

```php
use App\Services\GitHub;

return response()->streamDownload(function () {
    echo GitHub::api('repo')
        ->contents()
        ->readme('laravel', 'laravel')['contents'];
}, 'laravel-readme.md');
```

<a name="response-macros"></a>
## レスポンスマクロ

さまざまなルートやコントローラで再利用できるカスタムレスポンスを定義する場合は、`Response`ファサードで`macro`メソッドを使用してください。通常、このメソッドは、`App\Providers\AppServiceProvider`サービスプロバイダなど、アプリケーションの[サービスプロバイダ](/docs/{{version}}/providers)の１つの`boot`メソッドから呼び出す必要があります。

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Response;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 全アプリケーションサービスの初期起動処理
     */
    public function boot(): void
    {
        Response::macro('caps', function (string $value) {
            return Response::make(strtoupper($value));
        });
    }
}
```

`macro`関数は、最初の引数に名前を受け入れ、２番目の引数にクロージャを取ります。マクロのクロージャは、`ResponseFactory`実装または`response`ヘルパからマクロ名を呼び出すときに実行されます。

```php
return response()->caps('foo');
```
