# フロントエンド

- [イントロダクション](#introduction)
- [PHPの使用](#using-php)
    - [PHPとBlade](#php-and-blade)
    - [Livewire](#livewire)
    - [スターターキット](#php-starter-kits)
- [React、Svelte、Vueの使用](#using-react-or-vue)
    - [Inertia](#inertia)
    - [スターターキット](#inertia-starter-kits)
- [アセットの結合](#bundling-assets)

<a name="introduction"></a>
## イントロダクション

Laravelは、[ルーティング](/docs/{{version}}/routing)、[バリデーション](/docs/{{version}}/validation)、[キャッシュ](/docs/{{version}}/cache), [キュー](/docs/{{version}}/queues), [ファイルストレージ](/docs/{{version}}/filesystem)など、最新のウェブアプリケーション構築に必要となる全ての機能が提供されているバックエンド・フレームワークです。しかし、私たちはアプリケーションのフロントエンドを構築するための強力なアプローチを含む、美しいフルスタック体験を開発者に提供することも重要であると考えています。

Laravelでアプリケーションを構築する場合、フロントエンドの開発には主に２つの方法があります。どちらの方法を選択するかは、PHPを活用してフロントエンドを構築するか、React、Svelte、VueなどのJavaScriptフレームワークを使用するかにより決まります。以下では、こうした選択肢について説明し、あなたのアプリケーションに最適なフロントエンド開発のアプローチの情報を十分に得た上で、決定してもらえるようにします。

<a name="using-php"></a>
## PHPの使用

<a name="php-and-blade"></a>
### PHPとBlade

以前、ほとんどのPHPアプリケーションでは、リクエスト時にデータベースから取得したデータを表示するため、PHPの`echo`文を散りばめた単純なHTMLテンプレートを使用し、ブラウザでHTMLをレンダしていました。

```blade
<div>
    <?php foreach ($users as $user): ?>
        Hello, <?php echo $user->name; ?> <br />
    <?php endforeach; ?>
</div>
```

このHTML表示の手法を使う場合、Laravelでは[ビュー](/docs/{{version}}/views)と[Blade](/docs/{{version}}/blade)を使用して実現できます。Bladeは非常に軽量なテンプレート言語で、データの表示や反復処理などに便利な、短い構文を提供しています。

```blade
<div>
    @foreach ($users as $user)
        Hello, {{ $user->name }} <br />
    @endforeach
</div>
```

この方法でアプリケーションを構築する場合、フォーム送信や他のページへの操作は、通常サーバから全く新しいHTMLドキュメントを受け取り、ページ全体をブラウザで再レンダします。現在でも多くのアプリケーションは、シンプルなBladeテンプレートを使い、この方法でフロントエンドを構築するのが、最も適していると思われます。

<a name="growing-expectations"></a>
#### 高まる期待

しかし、Webアプリケーションに対するユーザーの期待値が高まるにつれ、多くの開発者がよりダイナミックなフロントエンドを構築し、洗練した操作性を感じてもらう必要性を感じてきています。そのため、React、Svelte、VueといったJavaScriptフレームワークを用いた、アプリケーションのフロントエンド構築を選択する開発者もいます。

一方で、自分が使い慣れたバックエンド言語にこだわる人たちは、そのバックエンド言語を主に利用しながら、最新のWebアプリケーションUIの構築を可能にするソリューションを開発しました。たとえば、[Rails](https://rubyonrails.org/) のエコシステムでは、[Turbo](https://turbo.hotwired.dev/) や[Hotwire]、[Stimulus](https://stimulus.hotwired.dev/) などのライブラリ作成が勢いづいています。

Laravelのエコシステムでは、主にPHPを使い、モダンでダイナミックなフロントエンドを作りたいというニーズから、[Laravel Livewire](https://livewire.laravel.com)と[Alpine.js](https://alpinejs.dev/)が生まれました。

<a name="livewire"></a>
### Livewire

[Laravel Livewire](https://livewire.laravel.com)は、React、Svelte、VueといったモダンなJavaScriptフレームワークで作ったフロントエンドのように、ダイナミックでモダン、そして生き生きとしたLaravelで動作するフロントエンドを構築するためのフレームワークです。

Livewireを使用する場合、レンダし、アプリケーションのフロントエンドから呼び出したり操作したりできるメソッドやデータを公開するUI部分をLivewire「コンポーネント」として作成します。例えば、シンプルな"Counter"コンポーネントは、以下のようなものです。

```php
<?php

use Livewire\Component;

new class extends Component
{
    public $count = 0;

    public function increment()
    {
        $this->count++;
    }
};
?>

<div>
    <button wire:click="increment">+</button>
    <h1>{{ $count }}</h1>
</div>

```

ご覧の通り、Livewireでは、Laravelアプリケーションのフロントエンドとバックエンドをつなぐ、`wire:click`のような新しいHTML属性を書けます。さらに、シンプルなBlade式を使って、コンポーネントの現在の状態をレンダできます。

多くの人にとって、LivewireはLaravelでのフロントエンド開発に革命を起こし、Laravelの快適さを保ちながら、モダンでダイナミックなWebアプリケーションを構築することを可能にしました。通常、Livewireを使用している開発者は、[Alpine.js](https://alpinejs.dev/)も利用して、ダイアログウィンドウのレンダなど、必要な場合にのみフロントエンドにJavaScriptを「トッピング」します。

Laravelに慣れていない方は、[ビュー](/docs/{{version}}/views)と[Blade](/docs/{{version}}/blade)の基本的な使い方に、まず慣れることをお勧めします。その後、公式の[Laravel Livewireドキュメント](https://livewire.laravel.com/docs)を参照し、インタラクティブなLivewireコンポーネントでアプリケーションを次のレベルに引き上げる方法を学んでください。

<a name="php-starter-kits"></a>
### スターターキット

PHPとLivewireを使い、フロントエンドを構築したい場合は、[Livewireスターターキット](/docs/{{version}}/starter-kits)を活用して、アプリケーションの開発をジャンプスタートできます。

<a name="using-react-or-vue"></a>
## React、Svelte、Vueの使用

LaravelやLivewireを使用してモダンなフロントエンドを構築することは可能ですが、多くの開発者はReact、Svelte、VueのようなJavaScriptフレームワークのパワーを活用することを好みます。これにより、開発者はNPMを使い、JavaScriptパッケージやツールなど豊富にある利用可能なエコシステムを活用できます。

しかし、追加のツール無しにLaravelとReact、Svelte、Vueを組み合わせるには、クライアントサイドのルーティング、データハイドレーション、認証など多種にわたる複雑な問題を解決する必要が起こります。クライアントサイドのルーティングは、[Next](https://nextjs.org/)や[Nuxt](https://nuxt.com/)のようなReact／Vueフレームワークのオピニオンを使用することで簡略化されることが多いです。しかし、データハイドレーションと認証は、Laravelのようなバックエンドフレームワークとこれらのフロントエンドフレームワークをペアリングする際に解決しなければならない複雑で面倒な問題のままです。

さらに、開発者は２つの別々のコードリポジトリを管理することになり、しばしばメンテナンス、リリース、デプロイメントを両方のリポジトリにまたがって調整する必要が起きます。こうした問題は克服できないものではありませんが、アプリケーションを開発する上で、生産的で楽しい方法とは思えません。

<a name="inertia"></a>
### Inertia

幸運なことに、Laravelは両方の世界のベストを提供しています。[Inertia](https://inertiajs.com)は、LaravelアプリケーションとモダンなReact、Svelte、Vueフロントエンドの橋渡しをします。React、Svelte、Vueを使って本格的なモダンフロントエンドを構築しながら、ルーティング、データハイドレーション、認証のためにLaravelのルートとコントローラを活用することができます。このアプローチでは、LaravelとReact／Svelte／Vueの両方のフルパワーを、どちらのツールの機能も損なうことなく利用できます。

LaravelアプリケーションにInertiaをインストールしたあとで、通常通りにルートとコントローラを記述します。しかし、コントローラからBladeテンプレートを返すのではなく、Inertiaページを返すようにします。

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * 指定ユーザーのプロフィールページを表示
     */
    public function show(string $id): Response
    {
        return Inertia::render('users/show', [
            'user' => User::findOrFail($id)
        ]);
    }
}
```

Inertiaページは React、Svelte、Vueコンポーネントに対応し、通常はアプリケーションの`resources/js/pages`ディレクトリへ格納します。`Inertia::render`メソッドを通してページへ与えたデータは、ページコンポーネントの"props"をハイドレートするため使用されます：

```jsx
import Layout from '@/layouts/authenticated';
import { Head } from '@inertiajs/react';

export default function Show({ user }) {
    return (
        <Layout>
            <Head title="Welcome" />
            <h1>Welcome</h1>
            <p>Hello {user.name}, welcome to Inertia.</p>
        </Layout>
    )
}
```

ご覧のようにInertiaは、フロントエンドを構築する際にReact、Svelte、Vueのフルパワーを活用でき、同時にLaravelを使用したバックエンドとJavaScriptを使用したフロントエンドの間に軽量なブリッジを提供します。

#### サーバサイドレンダ

アプリケーションにサーバサイドレンダが必要なため、Inertiaへ飛び込むことに不安を感じている方も安心してください。Inertiaは[サーバサイドレンダサポート](https://inertiajs.com/server-side-rendering)を提供しています。さらに、アプリケーションを[Laravel Cloud](https://cloud.laravel.com)または[Laravel Forge](https://forge.laravel.com)経由でデプロイする場合、Inertiaのサーバサイドレンダリングプロセスが常に実行されていることを確認するのは簡単です。

<a name="inertia-starter-kits"></a>
### スターターキット

InertiaとReact／Svelte／Vueを使用してフロントエンドを構築したい場合は、[ReactまたはVueアプリケーション・スターターキット](/docs/{{version}}/starter-kits)を活用してアプリケーションの開発をジャンプスタートできます。どちらのスターターキットも、Inertia、React／Svelte／Vue、[Tailwind](https://tailwindcss.com)、[Vite](https://vitejs.dev)を使用して、アプリケーションのバックエンドとフロントエンドの認証フローをスカフォールドしており、次の大きなアイデアを作り始めることができます。

<a name="bundling-assets"></a>
## アセットの結合

BladeとLivewire、React／Svelte／VueとInertiaのどちらを使用してフロントエンドを開発するにしても、アプリケーションのCSSをプロダクション用アセットへバンドルする必要があるでしょう。もちろん、React、Svelte、Vueでアプリケーションのフロントエンドを構築することを選択した場合は、コンポーネントをブラウザ用JavaScriptアセットへバンドルする必要があります。

Laravelは、デフォルトで[Vite](https://vitejs.dev)を利用してアセットをバンドルします。Viteは、ローカル開発において、ビルドが非常に速く、ほぼ瞬時のホットモジュール交換（HMR）を提供しています。[スターターキット](/docs/{{version}}/starter-kits)を含むすべての新しいLaravelアプリケーションでは、`vite.config.js`ファイルがあり、軽量なLaravel Viteプラグインがロードされ、LaravelアプリケーションでViteを楽しく使用できるようにしています。

LaravelとViteの使用を開始する最も早い方法は、フロントエンドとバックエンドの認証スカフォールドを提供することにより、アプリケーションをジャンプスタートさせる[アプリケーションスターターキット](/docs/{{version}}/starter-kits)を使用してアプリケーションの開発を開始することです。

> [!NOTE]
> LaravelでViteを活用するための詳細なドキュメントは、[アセットバンドルとコンパイルに関する専用のドキュメント](/docs/{{version}}/vite)を参照してください。
