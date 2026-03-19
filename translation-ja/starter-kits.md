# スターターキット

- [イントロダクション](#introduction)
- [スターターキットを使ったアプリケーションの作成](#creating-an-application)
- [利用可能なスターターキット](#available-starter-kits)
    - [React](#react)
    - [Svelte](#svelte)
    - [Vue](#vue)
    - [Livewire](#livewire)
- [スターターキットのカスタマイズ](#starter-kit-customization)
    - [React](#react-customization)
    - [Svelte](#svelte-customization)
    - [Vue](#vue-customization)
    - [Livewire](#livewire-customization)
- [認証](#authentication)
    - [機能の有効化と無効化](#enabling-and-disabling-features)
    - [ユーザー生成とパスワードリセットのカスタマイズ](#customizing-actions)
    - [2要素認証](#two-factor-authentication)
    - [レート制限](#rate-limiting)
- [WorkOS AuthKit認証](#workos)
- [Inertia SSR](#inertia-ssr)
- [コミュニティが保守するスターターキット](#community-maintained-starter-kits)
- [良くある質問](#faqs)

<a name="introduction"></a>
## イントロダクション

新しいLaravelアプリケーションの構築を開始できるように、[アプリケーションスターターキット](https://laravel.com/starter-kits)を提供いたします。このスターターキットは、次にLaravelアプリケーションを構築する口火を切るためのもので、アプリケーションのユーザー登録と認証に必要なルート、コントローラ、ビューを含んでいます。スターターキットは、認証機能を提供するために[Laravel Fortify](/docs/{{version}}/fortify)を使用しています。

皆さんがこのスターターキットを使用してくれるのは大歓迎ですが、これは必須でありません。Laravelの真新しいコピーをインストールするだけで、自分自身のアプリケーションを自由にゼロから構築できます。いずれにせよ、みなさんが素晴らしいものを作り上げるのはわかっています！

<a name="creating-an-application"></a>
## スターターキットを使ったアプリケーションの作成

スターターキットを使用して新しいLaravelアプリケーションを作成するには、まず[PHPとLaravel CLIツールをインストール](/docs/{{version}}/installation#installing-php)してください。すでにPHPとComposerがインストールされている場合は、Composer経由でLaravelインストーラCLIツールをインストールしてください。

```shell
composer global require laravel/installer
```

次に、LaravelインストーラCLIを使用して、新しいLaravelアプリケーションを作成します。Laravelインストーラは、希望するスターターキットを選択するよう促します。

```shell
laravel new my-app
```

Laravelアプリケーションを作成したら、NPM経由でフロントエンドの依存関係パッケージをインストールし、Laravel開発サーバを起動するだけです。

```shell
cd my-app
npm install && npm run build
composer run dev
```

Laravel開発サーバを起動すると、ウェブブラウザで[http://localhost:8000](http://localhost:8000)からアプリケーションへアクセスできるようになります。

<a name="available-starter-kits"></a>
## 利用可能なスターターキット

<a name="react"></a>
### React

私達のReactスターターキットは、[Inertia](https://inertiajs.com)を使用してReactフロントエンドで、Laravelアプリケーションを構築するための堅牢でモダンな出発点を提供します。

Inertiaを使用すると、古典的なサーバサイドのルーティングとコントローラを使用して、モダンなシングルページのReactアプリケーションを構築できます。これにより、Reactのフロントエンドのパワーと、Laravelの驚異的なバックエンドの生産性、そして電光石火のViteコンパイルを組み合わせることができます。

Reactスターターキットは、React19、TypeScript、Tailwind、[shadcn/ui](https://ui.shadcn.com)コンポーネントライブラリを使用しています。

<a name="svelte"></a>
### Svelte

Svelteスターターキットは、[Inertia](https://inertiajs.com)を使用して、Svelteフロントエンドを備えたLaravelアプリケーションを構築するための、堅牢でモダンな出発点を提供します。

Inertiaを使用すると、従来のサーバサイドのルーティングとコントローラを使用して、モダンなシングルページSvelteアプリケーションを構築できます。これにより、Svelteのフロントエンドのパワーと、Laravelの驚異的なバックエンドの生産性、そして非常に高速なViteのコンパイルを組み合わせて享受できます。

Svelteスターターキットは、Svelte5、TypeScript、Tailwind、および[shadcn-svelte](https://www.shadcn-svelte.com/)コンポーネントライブラリを利用しています。

<a name="vue"></a>
### Vue

私達のVueスターターキットは、[Inertia](https://inertiajs.com)を使用してVueフロントエンドで、Laravelアプリケーションを構築するための素晴らしい出発点を提供します。

Inertiaを使用すると、古典的なサーバサイドのルーティングとコントローラを使用して、モダンなシングルページのVueアプリケーションを構築できます。これにより、Vueのフロントエンドのパワーと、Laravelの驚異的なバックエンドの生産性、そして電光石火のViteコンパイルを組み合わせることができます。

Vueスターターキットは、Vue Composition API、TypeScript、Tailwind、[shadcn-vue](https://www.shadcn-vue.com/)コンポーネントライブラリを利用しています。

<a name="livewire"></a>
### Livewire

私たちのLivewireスターターキットは、[Laravel Livewire](https://livewire.laravel.com)フロントエンドでLaravelアプリケーションを構築するための完璧な出発点を提供します。

Livewireは、PHPだけでダイナミックでリアクティブなフロントエンドUIを構築するパワフルな手法です。主にBladeテンプレートを使用し、React、Svelte、VueのようなJavaScript駆動のSPAフレームワークのシンプルな代替を探しているチームに最適です。

Livewireスターターキットは、Livewire、Tailwind、[Flux UI](https://fluxui.dev)コンポーネントライブラリを利用しています。

<a name="starter-kit-customization"></a>
## スターターキットのカスタマイズ

<a name="react-customization"></a>
### React

Reactスターターキットは、Inertia2、React19、Tailwind4、および[shadcn/ui](https://ui.shadcn.com)で構築しています。すべてのスターターキットと同様に、バックエンドとフロントエンドのコードはすべてアプリケーション内に存在し、フルカスタマイズが可能です。

フロントエンドのコードの大部分は、`resources/js`ディレクトリにあります。アプリケーションの外観や動作をカスタマイズするために、自由にコードを変更できます。

```text
resources/js/
├── components/    # 再利用可能なReactコンポーネント
├── hooks/         # Reactのフック
├── layouts/       # アプリケーションのレイアウト
├── lib/           # ユーティリティ機能と設定
├── pages/         # ページコンポーネント
└── types/         # TypeScript定義
```

追加のshadcnコンポーネントをリソース公開するには、まず[公開したいコンポーネントを探してください](https://ui.shadcn.com)。次に、`npx`を使用してコンポーネントを公開します。

```shell
npx shadcn@latest add switch
```

この例のコマンドは、Switchコンポーネントを`resources/js/components/ui/switch.tsx`へリソース公開します。コンポーネントを公開したら、どのページでも使用できます。

```jsx
import { Switch } from "@/components/ui/switch"

const MyPage = () => {
  return (
    <div>
      <Switch />
    </div>
  );
};

export default MyPage;
```

<a name="react-available-layouts"></a>
#### 利用可能なレイアウト

Reactスターターキットには、「サイドバー」レイアウトと「ヘッダ」レイアウトの２つの異なる主要レイアウトを用意してあり、選択できます。デフォルトはサイドバーレイアウトですが、アプリケーションの`resources/js/layouts/app-layout.tsx`ファイルの一番上にインポートしているレイアウトを変更すれば、ヘッダレイアウトへ切り替えられます。

```js
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout'; // [tl! remove]
import AppLayoutTemplate from '@/layouts/app/app-header-layout'; // [tl! add]
```

<a name="react-sidebar-variants"></a>
#### サイドバー別型

サイドバーレイアウトには３つの異なる別型があります。デフォルトのサイドバー別型、「inset」別型、「floating」別型です。`resources/js/components/app-sidebar.tsx`コンポーネントを修正し、一番好きなレイアウトを選択してください。

```text
<Sidebar collapsible="icon" variant="sidebar"> [tl! remove]
<Sidebar collapsible="icon" variant="inset"> [tl! add]
```

<a name="react-authentication-page-layout-variants"></a>
#### 認証ページレイアウト別型

Reactスターターキットに含まれている、ログインページや登録ページなどの認証ページには、３種類のレイアウトバリエーションがあります。「simple」、「card」、「split」です。

認証レイアウトを変更するには、アプリケーションの`resources/js/layouts/auth-layout.tsx`ファイルの先頭にインポートしているレイアウトを変更します。

```js
import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout'; // [tl! remove]
import AuthLayoutTemplate from '@/layouts/auth/auth-split-layout'; // [tl! add]
```

<a name="svelte-customization"></a>
### Svelte

Svelteのスターターキットは、Inertia2、Svelte5、Tailwind、および[shadcn-svelte](https://www.shadcn-svelte.com/)で構築しています。すべてのスターターキットと同様に、バックエンドとフロントエンドのすべてのコードがアプリケーション内に存在し、自由にカスタマイズできます。

フロントエンドのコードの大部分は、`resources/js`ディレクトリにあります。アプリケーションの外観や動作をカスタマイズするために、自由にコードを変更できます。

```text
resources/js/
├── components/    # 再利用可能なSvelteコンポーネント
├── layouts/       # アプリケーションのレイアウト
├── lib/           # ユーティリティ関数、設定、およびSvelte runeモジュール
├── pages/         # ページコンポーネント
└── types/         # TypeScript定義
```

追加のshadcn-svelteコンポーネントをリソース公開するには、まず[公開したいコンポーネントを見つけてください](https://www.shadcn-svelte.com)。次に、`npx`を使用してコンポーネントをリソース公開します。

```shell
npx shadcn-svelte@latest add switch
```

この例では、コマンドはSwitchコンポーネントを`resources/js/components/ui/switch/switch.svelte`へリソース公開します。コンポーネントを公開したら、どのページからでも使用できます。

```svelte
<script lang="ts">
    import { Switch } from '@/components/ui/switch'
</script>

<div>
    <Switch />
</div>
```

<a name="svelte-available-layouts"></a>
#### 利用可能なレイアウト

Svelteスターターキットには、選択可能な2つの主要なレイアウト（「サイドバー」レイアウトと「ヘッダ」レイアウト）が含まれています。サイドバーレイアウトがデフォルトですが、アプリケーションの`resources/js/layouts/AppLayout.svelte`ファイルの先頭でインポートしているレイアウトを変更すれば、ヘッダレイアウトへ切り替えられます。

```js
import AppLayout from '@/layouts/app/AppSidebarLayout.svelte'; // [tl! remove]
import AppLayout from '@/layouts/app/AppHeaderLayout.svelte'; // [tl! add]
```

<a name="svelte-sidebar-variants"></a>
#### サイドバー別型

サイドバーレイアウトには、デフォルトのサイドバーバリエーション、「inset」バリエーション、「floating」バリエーションの3つの異なるバリエーションがあります。`resources/js/components/AppSidebar.svelte`コンポーネントを修正して、最も好みのバリエーションを選択できます。

```text
<Sidebar collapsible="icon" variant="sidebar"> [tl! remove]
<Sidebar collapsible="icon" variant="inset"> [tl! add]
```

<a name="svelte-authentication-page-layout-variants"></a>
#### 認証ページレイアウト別型

ログインページや登録ページなど、Svelteスターターキットが用意している認証ページでも、「simple」、「card」、「split」の3つの異なるレイアウトバリエーションを提供しています。

認証レイアウトを変更するには、アプリケーションの`resources/js/layouts/AuthLayout.svelte`ファイルの先頭でインポートしているレイアウトを修正してください。

```js
import AuthLayout from '@/layouts/auth/AuthSimpleLayout.svelte'; // [tl! remove]
import AuthLayout from '@/layouts/auth/AuthSplitLayout.svelte'; // [tl! add]
```

<a name="vue-customization"></a>
### Vue

Vueスターターキットは、Inertia2、Vue3 Composition API、Tailwind、および[shadcn-vue](https://www.shadcn-vue.com/)を使用して構築しています。他のスターターキットと同様に、バックエンドとフロントエンドのコードはすべてアプリケーション内に存在し、フルカスタマイズ可能です。

フロントエンドのコードの大部分は、`resources/js`ディレクトリにあります。アプリケーションの外観や動作をカスタマイズするために、自由にコードを変更できます。

```text
resources/js/
├── components/    # 再利用可能なVueコンポーネント
├── composables/   # Vueコンポーネント／フック
├── layouts/       # アプリケーションのレイアウト
├── lib/           # ユーティリティ機能と設定
├── pages/         # ページコンポーネント
└── types/         # TypeScript定義
```

追加のshadcnコンポーネントをリソース公開するには、まず[公開したいコンポーネントを探してください](https://ui.shadcn.com)。次に、`npx`を使用してコンポーネントを公開します。

```shell
npx shadcn-vue@latest add switch
```

この例のコマンドは、Switchコンポーネントを`resources/js/components/ui/switch.tsx`へリソース公開します。コンポーネントを公開したら、どのページでも使用できます。

```vue
<script setup lang="ts">
import { Switch } from '@/components/ui/switch'
</script>

<template>
    <div>
        <Switch />
    </div>
</template>
```

<a name="vue-available-layouts"></a>
#### 利用可能なレイアウト

Vueスターターキットには、「サイドバー」レイアウトと「ヘッダ」レイアウトの２つの異なる主要レイアウトを用意してあり、選択できます。デフォルトはサイドバーレイアウトですが、アプリケーションの`resources/js/layouts/AppLayout.vue`ファイルの一番上にインポートしているレイアウトを変更すれば、ヘッダレイアウトへ切り替えられます。

```js
import AppLayout from '@/layouts/app/AppSidebarLayout.vue'; // [tl! remove]
import AppLayout from '@/layouts/app/AppHeaderLayout.vue'; // [tl! add]
```

<a name="vue-sidebar-variants"></a>
#### サイドバー別型

サイドバーレイアウトには３つの異なる別型があります。デフォルトのサイドバー別型、「inset」別型、「floating」別型です。`resources/js/components/AppSidebar.vue`コンポーネントを修正し、一番好きなレイアウトを選択してください。

```text
<Sidebar collapsible="icon" variant="sidebar"> [tl! remove]
<Sidebar collapsible="icon" variant="inset"> [tl! add]
```

<a name="vue-authentication-page-layout-variants"></a>
#### 認証ページレイアウト別型

Vueスターターキットに含まれている、ログインページや登録ページなどの認証ページには、３種類のレイアウトバリエーションがあります。「simple」、「card」、「split」です。

認証レイアウトを変更するには、アプリケーションの`resources/js/layouts/AuthLayout.tsx`ファイルの先頭にインポートしているレイアウトを変更します。

```js
import AuthLayout from '@/layouts/auth/AuthSimpleLayout.vue'; // [tl! remove]
import AuthLayout from '@/layouts/auth/AuthSplitLayout.vue'; // [tl! add]
```

<a name="livewire-customization"></a>
### Livewire

Livewireスターターキットは、Livewire4、Laravel Volt、Tailwind、[Flux UI](https://fluxui.dev/)で構築されています。他のスターターキットと同様に、バックエンドとフロントエンドのコードはすべてアプリケーション内に存在し、フルカスタマイズが可能です。

フロントエンドのコードの大部分は、`resources/js`ディレクトリにあります。アプリケーションの外観や動作をカスタマイズするために、自由にコードを変更できます。

```text
resources/views
├── components            # 再利用可能なコンポーネント
├── flux                  # カスタマイズ済みFluxコンポーネント
├── layouts               # アプリケーションレイアウト
├── pages                 # Livewireページ
├── partials              # 再利用可能なBladeの部分ファイル
├── dashboard.blade.php   # 認証済みユーザーのダッシュボード
├── welcome.blade.php     # ゲストユーザーのウエルカムページ
```

<a name="livewire-available-layouts"></a>
#### 利用可能なレイアウト

Livewireスターターキットには、「サイドバー」レイアウトと「ヘッダ」レイアウトの２つの異なる主要レイアウトを用意してあり、選択できます。デフォルトはサイドバーレイアウトですが、アプリケーションの`resources/views/layouts/app.blade.php`ファイルのレイアウトを変更すれば、ヘッダレイアウトへ切り替えられます。加えて、メインのFluxコンポーネントへ`container`属性を追加してください。

```blade
<x-layouts::app.header>
    <flux:main container>
        {{ $slot }}
    </flux:main>
</x-layouts::app.header>
```

<a name="livewire-authentication-page-layout-variants"></a>
#### 認証ページレイアウト別型

Livewireスターターキットに含まれている、ログインページや登録ページなどの認証ページには、３種類のレイアウトバリエーションがあります。「simple」、「card」、「split」です。

認証レイアウトを変更するには、アプリケーションの`resources/views/layouts/auth.blade.php` ファイルで使用しているレイアウトを修正してください。

```blade
<x-layouts::auth.split>
    {{ $slot }}
</x-layouts::auth.split>
```

<a name="authentication"></a>
## 認証

すべてのスターターキットは、認証処理に[Laravel Fortify](/docs/{{version}}/fortify)を使用しています。Fortifyは、ログイン、登録、パスワードリセット、メール認証などのためのルート、コントローラ、ロジックを提供します。

Fortifyは、アプリケーションの`config/fortify.php`設定ファイルで有効化してある機能に基づき、以下の認証ルートを自動的に登録します。

| ルート                              | メソッド   | 説明                                 |
| ---------------------------------- | ------   | ----------------------------------- |
| `/login`                           | `GET`    | ログインフォーム表示                     |
| `/login`                           | `POST`   | ユーザー認証                           |
| `/logout`                          | `POST`   | ユーザーログアウト                       |
| `/register`                        | `GET`    | 登録フォーム表示                        |
| `/register`                        | `POST`   | 新しいユーザー登録                       |
| `/forgot-password`                 | `GET`    | パスワードリクエスト要求フォーム表示         |
| `/forgot-password`                 | `POST`   | パスワードリセットリンク送信               |
| `/reset-password/{token}`          | `GET`    | パスワードリセットフォーム表示              |
| `/reset-password`                  | `POST`   | パスワード更新                          |
| `/email/verify`                    | `GET`    | メール認証通知の表示                     |
| `/email/verify/{id}/{hash}`        | `GET`    | メールアドレス確認                       |
| `/email/verification-notification` | `POST`   | 確認メール送信                          |
| `/user/confirm-password`           | `GET`    | パスワード確認フォーム表示                 |
| `/user/confirm-password`           | `POST`   | パスワード確認                          |
| `/two-factor-challenge`            | `GET`    | ２要素挑戦フォーム表示                    |
| `/two-factor-challenge`            | `POST`   | ２要素コード確認                        |

`php artisan route:list` Artisanコマンドを使用すると、アプリケーション内のすべてのルートを表示できます。

<a name="enabling-and-disabling-features"></a>
### 機能の有効化と無効化

アプリケーションの `config/fortify.php` 設定ファイルで、有効にするFortify機能を制御できます。

```php
use Laravel\Fortify\Features;

'features' => [
    Features::registration(),
    Features::resetPasswords(),
    Features::emailVerification(),
    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]),
],
```

機能を無効化するには、`features`配列から該当する機能エントリをコメントアウトするか削除してください。例えば、リソース公開の登録を無効化するには`Features::registration()`を削除します。

[React](#react)、[Svelte](#svelte)、[Vue](#vue)スターターキットを使用する場合、フロントエンドコード内で無効化した機能のルートへの参照をすべて削除する必要があります。例えば、メール認証を無効化した場合、React、Svelte、Vueコンポーネント内の`verification`ルートへのインポートや参照を削除する必要があります。これは、これらのスターターキットが型安全なルーティングのためにWayfinderを使用しており、ビルド時にルート定義を生成するためです。存在しないルートを参照すると、アプリケーションのビルドが失敗します。

<a name="customizing-actions"></a>
### ユーザー生成とパスワードリセットのカスタマイズ

ユーザーが登録またはパスワードをリセットすると、Fortifyはアプリケーションの`app/Actions/Fortify`ディレクトリにあるアクションクラスを呼び出します：

| ファイル                        | 説明                                   |
| ----------------------------- | ------------------------------------- |
| `CreateNewUser.php`           | 新しいユーザーの確認と登録                  |
| `ResetUserPassword.php`       | ユーザーパスワードの確認と登録               |
| `PasswordValidationRules.php` | パスワード確認ルールの定義                  |

たとえば、アプリケーションの登録ロジックをカスタマイズするには、`CreateNewUser`アクションを編集する必要があります:

```php
public function create(array $input): User
{
    Validator::make($input, [
        'name' => ['required', 'string', 'max:255'],
        'email' => ['required', 'email', 'max:255', 'unique:users'],
        'phone' => ['required', 'string', 'max:20'], // [tl! add]
        'password' => $this->passwordRules(),
    ])->validate();

    return User::create([
        'name' => $input['name'],
        'email' => $input['email'],
        'phone' => $input['phone'], // [tl! add]
        'password' => Hash::make($input['password']),
    ]);
}
```

<a name="two-factor-authentication"></a>
### 2要素認証

スターターキットには組み込みの２要素認証（2FA）が含まれており、ユーザーは任意のTOTP互換認証アプリを使用してアカウントを保護できます。2FAは、アプリケーションの`config/fortify.php`設定ファイル内の`Features::twoFactorAuthentication()`によってデフォルトで有効化されています。

`confirm` オプションは、2FA が完全に有効になる前にユーザーがコードを確認することを要求します。一方、`confirmPassword`は、2FAの有効化または無効化前にパスワードの確認を要求します。詳細については、[Fortify の二要素認証ドキュメント](/docs/{{version}}/fortify#two-factor-authentication)を参照してください。

<a name="rate-limiting"></a>
### レート制限

レート制限は、認証エンドポイントへのブルートフォース攻撃や繰り返しのログイン試行による過負荷を防止します。アプリケーションの`FortifyServiceProvider`でFortifyのレート制限動作をカスタマイズできます。

```php
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;

RateLimiter::for('login', function ($request) {
    return Limit::perMinute(5)->by($request->email.$request->ip());
});
```

<a name="workos"></a>
## WorkOS AuthKit認証

デフォルトでは、React、Svelte、Vue、Livewireのスターターキットはすべて、Laravelの組み込み認証システムを利用し、ログイン、登録、パスワードリセット、メール認証などを提供します。それに加え、各スターターキット向きに、[WorkOS AuthKit](https://authkit.com)搭載バージョンも提供しています。

<div class="content-list" markdown="1">

- ソーシャル認証（Google、Microsoft、GitHub、Apple）
- パスキー認証
- メールベースの「Magic Auth」
- SSO

</div>

認証プロバイダーとしてWorkOSを使用するには、[WorkOSアカウントが必要です](https://workos.com)。WorkOSは、月間アクティブユーザー数１００万人までのアプリケーションに無料で認証を提供しています。

アプリケーションの認証プロバイダとしてWorkOS AuthKitを使用するには、`laravel new`経由で新しいスターターキット搭載アプリケーションを作成する際に、WorkOSオプションを選択します。

### WorkOSスターターキットの設定

WorkOSを使用するスターターキットで新しいアプリケーションを作成したら、アプリケーションの`.env`ファイルへ、`WORKOS_CLIENT_ID`、`WORKOS_API_KEY`、`WORKOS_REDIRECT_URL` 環境変数を設定する必要があります。これらの変数はあなたのアプリケーション用に、WorkOSダッシュボードが提供した値と一致させる必要があります。

```ini
WORKOS_CLIENT_ID=your-client-id
WORKOS_API_KEY=your-api-key
WORKOS_REDIRECT_URL="${APP_URL}/authenticate"
```

さらに、WorkOSダッシュボードでアプリケーションのホームページURLを設定する必要があります。このURLは、ユーザーがアプリケーションからログアウトした後にリダイレクトされる場所です。

<a name="configuring-authkit-authentication-methods"></a>
#### AuthKit認証メソッドの設定

WorkOSベースのスターターキットを使用する場合、アプリケーションのWorkOS AuthKit設定内で「Email + Password」認証を無効にすることを推奨します。これにより、ユーザーはソーシャル認証プロバイダ、パスキー、「Magic Auth」、SSOのみで認証するようになります。この設定により、アプリケーションでユーザーパスワードを処理することを完全に回避できます。

<a name="configuring-authkit-session-timeouts"></a>
#### AuthKitセッションタイムアウトの設定

さらに、WorkOS AuthKitセッションの非アクティブタイムアウトをLaravelアプリケーションで設定しているセッションタイムアウトのしきい値（通常２時間）に合わせて設定することをお勧めします。

<a name="inertia-ssr"></a>
### Inertia SSR

React、Svelte、VueのスタータキットはInertiaの[サーバサイドレンダリング](https://inertiajs.com/server-side-rendering)機能と互換性があります。あなたのアプリケーション用にInertia SSR互換バンドルをビルドするには、`build:ssr`コマンドを実行します。

```shell
npm run build:ssr
```

使いやすいように、`composer dev:ssr`コマンドも用意しています。このコマンドは、アプリケーションのSSR互換バンドルをビルドした後、Laravel開発サーバとInertia SSRサーバを起動し、Inertiaのサーバサイドレンダリングエンジンを使ってアプリケーションをローカルでテストできるようにします。

```shell
composer dev:ssr
```

<a name="community-maintained-starter-kits"></a>
### コミュニティが保守するスターターキット

Laravelインストーラを使用して新しいLaravelアプリケーションを作成する場合、Packagistで利用可能なコミュニティが保守しているスターターキットを`--using`フラグで指定できます。

```shell
laravel new my-app --using=example/starter-kit
```

<a name="creating-starter-kits"></a>
#### スターターキットの作成

作成したスターターキットを他の人が利用できるようにするには、[Packagist](https://packagist.org)で公開する必要があります。スターターキットは、`.env.example`ファイルで必要な環境変数を定義し、インストール後に必要なコマンドはスターターキットの`composer.json`ファイルの`post-create-project-cmd`配列に記述します。

<a name="faqs"></a>
### 良くある質問

<a name="faq-upgrade"></a>
#### どうやってアップグレードするのですか？

どのスターターキットも、次のアプリケーションのための確かな出発点を与えてくれます。コードを完全に把握し、微調整やカスタマイズを行い、思い描いたとおりにアプリケーションを構築できます。ただし、スターターキット自体を更新する必要はありません。

<a name="faq-enable-email-verification"></a>
#### メール認証を有効にするには？

`App/Models/User.php`モデルの`MustVerifyEmail`インポートのコメントを外し、モデルで`MustVerifyEmail`インターフェイスを実装すれば、メール認証を追加できます。

```php
<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
// ...

class User extends Authenticatable implements MustVerifyEmail
{
    // ...
}
```

登録後、ユーザーは認証メールを受け取ります。ユーザーのメールアドレスが認証されるまで特定のルートへのアクセスを制限するには、ルートへ`verified`ミドルウェアを追加します。

```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});
```

> [!NOTE]
> スターターキットの[WorkOS](#workos)版を使用する場合、電子メール認証は必須でありません。

<a name="faq-modify-email-template"></a>
#### メールテンプレートほどうやって変更するの？

デフォルトのメールテンプレートをカスタマイズして、アプリケーションのブランディングに合わせたい場合もあると思います。このテンプレートを変更するには、次のコマンドを使用してアプリケーションへメールビューをリソース公開する必要があります。

```
php artisan vendor:publish --tag=laravel-mail
```

これにより、`resources/views/vendor/mail`にいくつかファイルを生成します。これらのファイルや`resources/views/vendor/mail/themes/default.css`ファイルを変更すれば、デフォルトのメールテンプレートの外観を変更することができます。
