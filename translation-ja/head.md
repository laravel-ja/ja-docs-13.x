# Laravel Head

- [イントロダクション](#introduction)
- [インストール](#installation)
- [クイックスタート](#quickstart)
- [解決の優先順位](#resolution-precedence)
- [メタデータの定義](#defining-metadata)
    - [デフォルト](#defaults)
    - [ルートメタデータ](#route-metadata)
    - [実行時メタデータ](#runtime-metadata)
    - [エラーページ](#error-pages)
- [Open Graph](#open-graph)
    - [X／Twitterカード](#twitter-cards)
- [テーマカラー](#theme-colors)
- [アプリケーションメタデータとアイコン](#app-metadata-and-icons)
- [プログレッシブウェブアプリ（PWA）](#progressive-web-apps)
- [パフォーマンスと検出](#performance-and-discovery)
- [カスタムタグ](#custom-tags)
- [スキーマ](#schemas)
    - [パンくずリスト](#breadcrumbs)
    - [FAQ](#faqs)
    - [カスタムスキーマ](#custom-schemas)
- [レンダリング](#rendering)
    - [Blade](#blade)
    - [Livewire](#livewire)
    - [Inertia](#inertia)

<a name="introduction"></a>
## イントロダクション

[Laravel Head](https://github.com/laravel/head)は、タイトルやメタタグ、Open Graphメタデータ、正規URL、robots指示子、パフォーマンスヒント、構造化データなど、アプリケーションのドキュメントの`<head>`要素を管理するための流暢なAPIを提供します。Blade、Livewire、およびInertiaで動作します。

<a name="installation"></a>
## インストール

Composerパッケージマネージャを使用してLaravel Headをインストールできます。

```shell
composer require laravel/head
```

<a name="quickstart"></a>
## クイックスタート

サービスプロバイダでサイト全体に適用するデフォルト値を登録します。

```php
use Laravel\Head\Facades\Head;
use Laravel\Head\HeadBuilder;

Head::defaults(fn (HeadBuilder $head) => $head
    ->title('Laravel', suffix: ' - Laravel')
    ->description('Build something great.'));
```

実行時にページ固有のメタデータを設定します。

```php
Head::title($post->title)
    ->description($post->description);
```

レイアウト内で解決したタグをレンダリングします。

```blade
<head>
    @head
</head>
```

<a name="resolution-precedence"></a>
## 解決の優先順位

ページのメタデータは、優先度の低い順に以下の5つの層から解決します。

1. ページのデフォルト
2. ルートグループのメタデータ
3. ルートメタデータ
4. 実行時メタデータ
5. エラーメタデータ

優先度の高い層は、低い層のフィールドをフィールド単位で置き換えます。例えば、実行時のタイトルはルートのタイトルを置き換えますが、ルートのドキュメント説明文（description）は置き換えません。以下のセクションでは、各層でメタデータを設定する方法を説明します。Blade、Livewire、Inertiaで解決されたメタデータをレンダリングする方法の詳細は、[レンダリング](#rendering)を参照してください。

<a name="defining-metadata"></a>
## メタデータの定義

Laravel Headを使用すると、サイト全体のデフォルト、ルートメタデータ、実行時呼び出し、エラーページ定義を使用してメタデータを定義できます。

<a name="defaults"></a>
### デフォルト

サービスプロバイダでページのデフォルト値を登録します。

```php
use Laravel\Head\Enums\OgType;
use Laravel\Head\Facades\Head;
use Laravel\Head\HeadBuilder;

Head::defaults(function (HeadBuilder $head) {
    $head
        ->title('Laravel', suffix: ' - Laravel')
        ->description('Build something great.')
        ->canonical()
        ->og(siteName: 'Laravel', type: OgType::Website)
        ->searchableByRobots()
        ->preconnect('[https://fonts.example.com](https://fonts.example.com)');
});
```

デフォルト値は、最も優先順位の低いページメタデータ層です。ルート、実行時、またはエラーメタデータがタイトルを設定しない場合、`Laravel`をそのままレンダリングします。より高い層がページタイトルを設定する場合、継承したサフィックスを適用するため、`Head::title('About')`は`About - Laravel`としてレンダリングします。継承したプレフィックスやサフィックスを無視するタイトルには、`exact: true`を渡してください。

`Head::canonical()`を呼び出すと、現在のリクエストURLを使用して正規URLをレンダリングします。明示的にURLを設定するには、`Head::canonical('/about')`のように文字列を渡します。正規URLはデフォルトで`https`に正規化します。リクエストスキームを保持するには、`forceHttps: false`を渡してください。

robots指示子は、生文字列、`RobotsRule` Enumケース、あるいは両方の形式を混在させたリストとして渡せます。リストはカンマ区切りの指示子としてレンダリングするため、`Head::robots([RobotsRule::NoIndex, RobotsRule::NoFollow])`は`noindex, nofollow`をレンダリングします。

利便性のために、`searchableByRobots`メソッドは`all`をレンダリングし、`hiddenFromRobots`メソッドは`none`をレンダリングします。

<a name="route-metadata"></a>
### ルートメタデータ

ルート上で直接メタデータを定義できます。これは、メタデータが事前に判明しているセミスタティックなページで特に役立ちます。

<a name="routes-and-groups"></a>
#### ルートとグループ

```php
Route::view('/contact', 'contact')
    ->name('contact')
    ->withHead(
        title: 'Contact Us',
        description: 'Get in touch.',
    );
```

共有ルートメタデータは、チェーン内の任意の場所でグループに適用できます。

```php
Route::withHead(robots: 'noindex, nofollow')
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', DashboardController::class)
            ->name('dashboard')
            ->withHead(title: 'Dashboard');
    });
```

リソースルートおよびシングルトンルートのメタデータも定義できます。

```php
Route::resource('posts', PostController::class)->withHead(
    robots: 'index, follow',
);

Route::singleton('profile', ProfileController::class)->withHead(
    title: 'Your Profile',
);
```

`withHead`メソッドは、LaravelネイティブのルートメタデータAPIを介してプレーンな配列を保存します。これは、`head`キーの下にネストした属性を指定して`metadata`メソッドを呼び出すのと同じであるため、メタデータはキャッシュ済みルートとの互換性を維持します。

エディタや静的解析が誤字を検出できるように、名前付き引数はLaravel Headの組み込みルートプロパティに意図的に限定しています。カスタムタグビルダで登録したルート属性は、`extensions`を介して渡せます。

```php
Route::get('/article', ArticleController::class)->withHead(
    title: 'Article',
    extensions: ['readingTime' => 4],
);
```

<a name="supported-properties"></a>
#### サポートしているプロパティ

サポートしているルートプロパティは、流暢なビルダメソッドと同じ名前に対応しています。

| カテゴリ | プロパティ |
| --- | --- |
| ドキュメント | `title`, `description`, `canonical`, `robots` |
| アプリケーションメタデータ | `themeColor`, `applicationName`, `colorScheme`, `referrer`, `viewport`, `appleWebAppTitle`, `webAppCapable`, `appleWebAppStatusBarStyle` |
| ソーシャル | `og`, `ogImage`, `ogVideo`, `ogAudio`, `twitter`, `twitterImage` |
| パフォーマンス | `preload`, `prefetch`, `preconnect`, `dnsPrefetch` |
| 検出 | `alternates`, `feed`, `icon`, `favicon`, `appleTouchIcon`, `appleTouchStartupImage`, `maskIcon`, `manifest` |
| 構造化データ | `schema` |
| カスタムタグ | `meta`, `link` |

ネストしたオプション名は、流暢なAPIと同じ`camelCase`命名（`forceHttps`、`siteName`、`secureUrl`など）を使用します。

`ogImage`、`preload`、`feed`、`schema`、`icon`、`appleTouchStartupImage`などの繰り返し可能なプロパティは、単一の値またはリストのいずれかを受け入れます。

<a name="runtime-metadata"></a>
### 実行時メタデータ

表示中の投稿のタイトルなど、リクエストが到達するまで値が判明しない場合は、実行時に設定できます。

```php
use Laravel\Head\Facades\Head;

public function __invoke(Post $post): Response
{
    Head::title($post->title);

    // ...
}
```

`Head`ファサードを介して行う実行時呼び出しは、リクエスト依存データのためにルートメタデータをオーバーライドします。コントローラやアクションは、こうした呼び出しを行う最も一般的な場所です。

```php
use App\Models\Post;
use Laravel\Head\Facades\Head;

public function show(Post $post)
{
    Head::title($post->title)
        ->description($post->description);

    return view('posts.show', ['post' => $post]);
}
```

複数の実行時呼び出しは、実行した順序でマージします。タイトル、ドキュメント説明文（description）、正規URL、robots指示子などの単一値フィールドの場合、後からの呼び出しを優先します。繰り返し可能なフィールドは複数のエントリを保持しますが、同じキーを再度追加すると前のエントリを更新します。`ogImage`メソッドの場合、URLがキーになります。

```php
Head::ogImage('/images/cover.jpg', alt: 'Draft cover')
    ->ogImage('/images/gallery.jpg', alt: 'Gallery image')
    ->ogImage('/images/cover.jpg', alt: 'Final cover', width: 1200, height: 630);
```

```html
<meta property="og:image" content="/images/cover.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Final cover">
<meta property="og:image" content="/images/gallery.jpg">
<meta property="og:image:alt" content="Gallery image">
```

デフォルト値から継承したOpen Graphメディアはフォールバックとして機能します。ルート、実行時、またはエラーメタデータが同じタイプの固有メディアを定義している場合、デフォルトメディアはマージせずに置換するため、ページの`og:image`がサイト全体のデフォルト画像を優先します。

`when`メソッドと`unless`メソッドを使用して、条件付きメタデータを流暢に定義できます。

```php
Head::title($post->title)
    ->when($post->isDraft(), fn ($head) => $head->hiddenFromRobots());
```

<a name="error-pages"></a>
### エラーページ

通常、アプリケーションの`AppServiceProvider`クラスの`boot`メソッド内でエラーメタデータを登録する必要があります。

```php
use Laravel\Head\ErrorPages;
{use Laravel\Head\Facades\Head;

/**
 * アプリケーションの全サービスの起動処理
 */
public function boot(): void
{
    Head::errors(function (ErrorPages $errors) {
        $errors->defaults(robots: 'noindex, follow');

        $errors->status(
            404,
            title: 'Page Not Found',
            description: 'The page you are looking for could not be found.',
        );
    });
}
```

`defaults`メソッドと`status`メソッドも、`Head::defaults()`が使用するのと同じ流暢なビルダコールバックを受け入れます。

```php
use Laravel\Head\ErrorPages;
use Laravel\Head\Facades\Head;
use Laravel\Head\HeadBuilder;

Head::errors(function (ErrorPages $errors) {
    $errors->status(404, fn (HeadBuilder $head) => $head
        ->title('Page Not Found')
        ->description('The page you are looking for could not be found.'));
});
```

登録したエラーステータスに対してレスポンスをレンダリングする場合、そのメタデータが他のすべての層よりも優先します。

Laravelは、エラービューをレンダリングするとき、またはInertiaの`handleExceptionsUsing()`メソッドなどのレスポンスフェーズフックを実行するときに、レスポンスステータスを自動的に検出します。`$exceptions->render()`コールバック内でエラーレスポンスをレンダリングする場合は、エラーメタデータを適用するように、レンダリングする前に`Head::status(404)`を呼び出してください。

<a name="open-graph"></a>
## Open Graph

`og`メソッドを使用してOpen Graphプロパティを設定できます。繰り返し可能なメディアは、名前付き引数を直接受け入れるトップレベルのメソッドを使用して追加できます。

```php
use Laravel\Head\Enums\ImageType;
use Laravel\Head\Enums\OgType;

Head::og(type: OgType::Article, title: $post->title)
    ->ogImage($post->hero_image_url)
    ->ogImage(
        $post->gallery_image_url,
        alt: $post->gallery_image_alt,
        width: 1200,
        height: 630,
        type: ImageType::Jpeg,
    );
```

`ogImage`、`ogVideo`、`ogAudio`の各メソッドは、第1引数としてURLを受け入れ、Open Graph仕様でサポートしている`alt`、`width`、`height`、`type`、`secureUrl`などのオプションの名前付き引数も受け入れます。

`ImageType::Svg`、`ImageType::Png`、`ImageType::Jpeg`、`ImageType::Webp`など、APIが画像の`type`を受け入れる場所であればどこでも、画像MIMEタイプを`ImageType` Enumケースとして渡せます。

> [!NOTE]
> ドキュメントの`title`と`description`は、欠落している`og:title`と`og:description`の値を自動的に補完します。

他の属性がない単一のOpen Graph画像の場合は、`og`メソッドに`image`名前付き引数を渡せます。

```php
Head::og(
    type: OgType::Website,
    title: $page->title,
    description: $page->description,
    image: $page->og_image_url,
);
```

`og(image: ...)`呼び出しと`ogImage(...)`呼び出しは、同じ内部画像リストに書き込むため、呼び出し場所でより表現力豊かな方を使用できます。プロダクトや記事のプロパティなどのカスタムOpen Graph拡張機能には、[`meta`](#custom-tags)メソッドを使用できます。

<a name="twitter-cards"></a>
### X／Twitterカード

Open Graphが使用するのと同じタイトル、説明文、画像からX／Twitterカードをレンダリングするには、デフォルト値に`twitter()`を登録します。

```php
use Laravel\Head\Enums\TwitterCard;
use Laravel\Head\Facades\Head;
use Laravel\Head\HeadBuilder;

Head::defaults(fn (HeadBuilder $head) => $head->twitter(
    card: TwitterCard::SummaryWithLargeImage,
));
```

次に、ページレベルのメタデータを設定します。

```php
Head::title('Introducing Laravel Head')
    ->description('A fluent API for Laravel document head metadata.')
    ->ogImage('[https://example.com/social.jpg](https://example.com/social.jpg)', alt: 'Introducing Laravel Head');
```

これにより、一致するTwitterタグをレンダリングします。

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Introducing Laravel Head">
<meta name="twitter:description" content="A fluent API for Laravel document head metadata.">
<meta name="twitter:image" content="[https://example.com/social.jpg](https://example.com/social.jpg)">
<meta name="twitter:image:alt" content="Introducing Laravel Head">
```

明示的なTwitterの値を指定して、個別ページをカスタマイズできます。

```php
Head::twitter(title: $post->social_title)
    ->twitterImage($post->social_image_url, alt: $post->title);
```

ルートメタデータは`twitter`と`twitterImage`を受け入れます。

<a name="theme-colors"></a>
## テーマカラー

テーマカラーは、グローバル、ルート単位、または実行時に設定できます。

```php
Head::themeColor('#0f172a');
```

これは`<meta name="theme-color">`タグをレンダリングします。メディア固有のテーマカラーには、`Media` Enumを使用できます。

```php
use Laravel\Head\Enums\Media;

Head::themeColor('#ffffff', media: Media::Light)
    ->themeColor('#111827', media: Media::Dark);
```

`Media` Enumには`Portrait`と`Landscape`も含まれています。`media`引数は、カスタムメディアクエリ文字列も受け入れます。

ルートメタデータは、同じ`camelCase`キーによる単一のテーマカラーをサポートしています。

```php
Route::view('/dashboard', 'dashboard')->withHead(
    themeColor: '#0f172a',
);
```

<a name="app-metadata-and-icons"></a>
## アプリケーションメタデータとアイコン

Laravel Headには、一般的なブラウザおよびアプリケーションメタデータ用のメソッドが含まれています。

```php
use Laravel\Head\Enums\ImageType;
use Laravel\Head\Enums\Media;

Head::applicationName('Laravel')
    ->colorScheme('light dark')
    ->referrer('strict-origin-when-cross-origin')
    ->viewport('width=device-width, initial-scale=1')
    ->appleWebAppTitle('Laravel')
    ->webAppCapable()
    ->appleWebAppStatusBarStyle('black')
    ->favicon('/favicon.svg', type: ImageType::Svg)
    ->icon('/favicon-32x32.png', type: ImageType::Png, sizes: '32x32')
    ->appleTouchIcon('/apple-touch-icon.png', sizes: '180x180')
    ->appleTouchStartupImage('/launch.png', media: Media::Portrait)
    ->maskIcon('/safari-pinned-tab.svg', color: '#111827')
    ->manifest('/site.webmanifest');
```

`favicon`メソッドは`icon`メソッドのエイリアスであり、同じ`type`、`sizes`、`media`引数を受け入れます。

ルートメタデータも同じ名前を使用します。

```php
use Laravel\Head\Enums\ImageType;
use Laravel\Head\Enums\Media;

Route::view('/dashboard', 'dashboard')->withHead(
    applicationName: 'Laravel',
    colorScheme: 'light dark',
    appleWebAppTitle: 'Laravel',
    webAppCapable: true,
    appleWebAppStatusBarStyle: 'black',
    favicon: [
        ['href' => '/favicon.svg', 'type' => ImageType::Svg],
        ['href' => '/favicon-32x32.png', 'type' => ImageType::Png, 'sizes' => '32x32'],
    ],
    appleTouchIcon: ['href' => '/apple-touch-icon.png', 'sizes' => '180x180'],
    appleTouchStartupImage: ['href' => '/launch.png', 'media' => Media::Portrait],
    manifest: '/site.webmanifest',
);
```

<a name="progressive-web-apps"></a>
## プログレッシブウェブアプリ（PWA）

`pwa`メソッドは、インストール可能なウェブアプリに必要な一般的なドキュメント`<head>`タグを設定します。

```php
Head::pwa(
    name: 'Laravel',
    manifest: '/site.webmanifest',
    themeColor: '#0f172a',
    appleTouchIcon: '/apple-touch-icon.png',
    appleWebAppStatusBarStyle: 'black',
);
```

これはアプリケーション名、ウェブアプリケーションマニフェストリンク、およびiOSスタンドアロンメタデータをレンダリングします。指定した場合、テーマカラー、Appleステータスバーのスタイル、Appleタッチアイコンもレンダリングします。ウェブアプリケーションマニフェストの作成とサービスワーカの登録は、引き続きアプリケーション側の責任です。

`pwa`メソッドはデフォルト値または実行時メタデータで使用できます。ルートメタデータは、上記に示す個別のプロパティをサポートしています。

<a name="performance-and-discovery"></a>
## パフォーマンスと検出

Laravel Headは、パフォーマンスヒント、ペジネーションリンク、ロケール代替、フィード検出をレンダリングします。

```php
Head::preload(asset('fonts/inter.woff2'), as: 'font', crossorigin: true)
    ->prefetch(asset('images/next.webp'))
    ->preconnect('[https://cdn.example.com](https://cdn.example.com)')
    ->dnsPrefetch('[https://analytics.example.com](https://analytics.example.com)')
    ->paginate($posts)
    ->alternates([
        'en' => '[https://example.com/en/about](https://example.com/en/about)',
        'fr' => '[https://example.com/fr/about](https://example.com/fr/about)',
        'x-default' => '[https://example.com/about](https://example.com/about)',
    ])
    ->feed('/feed', title: 'Laravel RSS')
    ->feed('/feed.atom', type: 'atom', title: 'Laravel Atom');
```

ローカルアセットの場合、`preloadAsset()`および`prefetchAsset()`は`asset()`ヘルパを介してURLを解決し、ファイル拡張子から`as`属性を検出します。フォントのプリロードには`crossorigin`が自動的に含まれます。これは、プリロードの仕様により同一オリジンのフォントであっても必要とされるためです。

```php
Head::preloadAsset('fonts/inter.woff2')
    ->prefetchAsset('images/next.webp');
```

```html
<link rel="preload" href="[https://example.com/fonts/inter.woff2](https://example.com/fonts/inter.woff2)" as="font" crossorigin>
<link rel="prefetch" href="[https://example.com/images/next.webp](https://example.com/images/next.webp)" as="image">
```

明示的に`as`を渡して検出をオーバーライドできます。ブラウザはこの属性がないプリロードを無視するため、拡張子から`as`属性を検出できない場合、`preloadAsset`メソッドは例外を投げます。`prefetchAsset`メソッドは単にそれを省略します。

<a name="custom-tags"></a>
## カスタムタグ

専用メソッドのないタグには、`meta()`と`link()`を使用します。

```php
Head::meta('format-detection', 'telephone=no')
    ->meta('article:author', $post->author->name)
    ->link('search', '/opensearch.xml', [
        'type' => 'application/opensearchdescription+xml',
        'title' => 'Laravel Search',
    ])
    ->link('me', '[https://social.example.com/@laravel](https://social.example.com/@laravel)');
```

一致する条件の下でのみブラウザがタグを適用すべき場合は、metaタグにメディアクエリを含められます。

```php
use Laravel\Head\Enums\Media;

Head::meta('theme-color', '#ffffff', media: Media::Light)
    ->meta('theme-color', '#111827', media: Media::Dark);
```

`meta`メソッドは、通常のmetaタグには`name`属性を使用します。Open Graph（`og:`）や記事メタデータ（`article:`）など、通常`property`属性を使用するキーの場合、メソッドは自動的に切り替えます。

```php
Head::meta('description', 'About Laravel')
    ->meta('og:title', 'About Laravel');
```

```html
<meta name="description" content="About Laravel">
<meta property="og:title" content="About Laravel">
```

`property: true`または`property: false`を渡して、どちらの属性かを明示的に選択できます。

<a name="schemas"></a>
## スキーマ

組み込みのスキーマビルダは、一般的なJSON-LDタイプをカバーしています。

```php
use Laravel\Head\Enums\OfferAvailability;
use Laravel\Head\Facades\Schema;

Head::schema(
    Schema::product()
        ->name($product->name)
        ->offers(
            Schema::offer()
                ->price($product->price)
                ->currency('USD')
                ->availability(OfferAvailability::InStock)
        )
);
```

組み込みのファクトリメソッドは、`article`、`blogPosting`、`product`、`offer`、`brand`、`breadcrumbs`、`faq`、`organization`、`person`、`webPage`、および`webSite`です。未知のファクトリメソッドは汎用スキーマオブジェクトを作成するため、カスタムのschema.orgタイプを表現することも可能です。

JSON-LDスキーマデータが無効な場合、Laravel Headは本番以外の環境で例外を投げ、本番環境で警告をログに記録します。

<a name="breadcrumbs"></a>
### パンくずリスト

ブレッドクラム項目は、一度に1つずつ、またはまとめて追加できます。位置は項目を追加した順序で自動的に割り当てます。

```php
Head::schema(
    Schema::breadcrumbs()->items([
        'Home' => route('home'),
        'Shop' => route('shop.index'),
        'Shoes' => route('shop.category', 'shoes'),
    ])
);
```

単一のブレッドクラム項目を追加するには、`item`メソッドを使用できます。

```php
Schema::breadcrumbs()
    ->item('Home', route('home'))
    ->item('Shop', route('shop.index'));
```

<a name="faqs"></a>
### FAQ

FAQエントリも同じパターンに従います。`question`メソッドを使用して一度に1つずつ追加するか、`questions`メソッドを使用してまとめて追加できます。

```php
Head::schema(
    Schema::faq()->questions([
        'What is Laravel Head?' => 'A fluent API for managing the document head.',
        'Is it free?' => 'Yes, it is open source.',
    ])
);
```

<a name="custom-schemas"></a>
### カスタムスキーマ

カスタムスキーマタイプを明示的に登録できます。

```php
use DateTimeInterface;
use Laravel\Head\Facades\Schema;
use Laravel\Head\Schema\SchemaObject;
use Laravel\Head\SchemaType;

#[SchemaType('JobPosting')]
class JobPosting extends SchemaObject
{
    public function title(string $title): static
    {
        return $this->set('title', $title);
    }

    public function datePosted(DateTimeInterface|string $date): static
    {
        return $this->date('datePosted', $date);
    }
}

Schema::register(JobPosting::class);

Head::schema(
    Schema::jobPosting()
        ->title('Senior Laravel Developer')
        ->datePosted(now())
);
```

<a name="rendering"></a>
## レンダリング

Laravel Headは、現在のレスポンス向けにページのメタデータをタグに解決します。これらのタグをレンダリングする方法は、アプリケーションスタックによって異なります。

HTMLレンダラは、`@head`ディレクティブと、Laravel Headが`head` Propを介してInertiaと共有するレンダリング済み要素を駆動します。配列レンダラは、解決されたメタデータを構造化データとして必要とするアプリケーション向けに`Head::toArray()`を駆動します。

<a name="blade"></a>
### Blade

レイアウトの`<head>`内で、蓄積されたタグを`@head`ディレクティブでレンダリングします。

```blade
<head>
    <meta charset="utf-8">
    @head
</head>
```

`@head`ディレクティブは同期的にレンダリングするため、レイアウトをレンダリングする前にページのメタデータを定義する必要があります。

<a name="livewire"></a>
### Livewire

Livewireアプリケーションは、ドキュメントレイアウト内で同じ`@head`ディレクティブを使用します。

```blade
<head>
    @head
</head>

<body>
    {{ $slot }}

    @livewireScripts
</body>
```

Livewire固有の設定は不要です。Laravel Headのメタデータはリクエスト単位で解決し、リゾルバはリクエストにスコープされます。したがって、`wire:navigate`による遷移のたびに新しいドキュメントを取得し、その`@head`出力には移動先ルートのメタデータを反映します。`wire:navigate`を使用して表示したページは、コンポーネントレベルのheadコードを必要とすることなく、適切なルート、実行時、およびエラーのメタデータを受け取ります。

<a name="inertia"></a>
### Inertia

Inertiaのルートテンプレート内で、Inertia自身のコンポーネントと並べて同じ`@head`ディレクティブを使用します。

```blade
<html>
<head>
    <meta charset="utf-8">
    @head

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    <x-inertia::head />
</head>
<body>
    <x-inertia::app />
</body>
</html>
```

Inertiaをインストールすると、Laravel Headはすべてのページオブジェクト上の`head` Propの下に、レンダリングされた要素文字列の配列として、ページ管理下のheadを自動的に共有します。

```json
{
    "props": {
        "head": [
            "<title data-inertia=\"title\">Dashboard - Laravel</title>",
            "<meta data-inertia=\"description\" name=\"description\" content=\"Your application overview.\">"
        ]
    }
}
```

アプリケーションが`createInertiaApp()`を呼び出す場所で、Inertiaの`serverHead`オプションを有効にしてください。このオプションはInertia 3.5以降で利用できます。

```js
createInertiaApp({
    // ...
    serverHead: true,
});
```

ページ管理下の各要素には安定した`data-inertia`キーが存在します。`@head`ディレクティブが最初のドキュメントをレンダリングした後、Inertiaがそれらの要素を引き継ぎ、通常の訪問、[インスタント訪問](https://inertiajs.com/docs/v3/the-basics/instant-visits)、および「戻る・進む」のナビゲーション中に同期を保ちます。要素は最初のHTMLレスポンス内に存在するため、クローラやリンクプレビューのボットはJavaScriptを実行することなくそれらを読み込めます。クライアント側の`<Head>`コンポーネントは不要です。

これは[サーバサイドレンダリング（SSR）](https://inertiajs.com/docs/v3/advanced/server-side-rendering)の有無にかかわらず動作します。アプリケーションに個別のSSRエントリポイントがある場合は、そこでも`serverHead`を有効にしてください。Laravel Headは、JavaScript SSRが生成した他のhead要素を保持しつつ、順序に関係なく`@head`と`<x-inertia::head />`の間でページ管理下の要素を自動的に重複除外します。

> [!NOTE]
> 既存のInertiaアプリケーションにLaravel Headを追加する場合は、Laravel Headが最終的なドキュメントタイトルを管理できるように、`resources/js/app.tsx`および`resources/js/ssr.tsx`からタイトルのコールバックを削除し、両者が同じ要素を定義しないようにInertiaの[`<Head>`コンポーネント](https://inertiajs.com/docs/v3/the-basics/title-and-meta)が管理するタグをLaravel Headへ移動してください。

`head` Propは部分リロードのレスポンスからは省略するため、Inertiaは最後のフルページのheadを保持します。同様に、インスタント訪問でもバックグラウンドレスポンスが到着するまで現在のheadを保持します。アプリケーションがすでに`head` Propを使用している場合は、サービスプロバイダでその名前を変更してください。

```php
use Laravel\Head\Facades\Head;

public function boot(): void
{
    Head::inertia(prop: '_head');
}
```

次に、`serverHead: '_head'`でInertiaが同じPropを指すように指定します。

<a name="static-inertia-tags"></a>
#### スタティックInertiaタグ

Laravel Headが各ページに適切な値を解決できるように、ほとんどのタグはデフォルト値、ルートメタデータ、または実行時メタデータに含める必要があります。Inertiaグローバルは、最初のHTMLレスポンスでレンダリングされ、セッションの残りの部分でInertiaによって変更されないドキュメントタグにのみ使用してください。

サービスプロバイダで`Head::inertiaGlobals()`を使用して登録します。

```php
use Laravel\Head\Facades\Head;
use Laravel\Head\HeadBuilder;

Head::inertiaGlobals(function (HeadBuilder $head) {
    $head
        ->viewport('width=device-width, initial-scale=1')
        ->colorScheme('light dark')
        ->icon('/favicon.svg', type: 'image/svg+xml')
        ->appleTouchIcon('/apple-touch-icon.png', sizes: '180x180')
        ->manifest('/site.webmanifest');
});
```

Inertiaグローバルは`head` Propから除外され、`data-inertia`所有権属性なしでレンダリングされ、最初のレスポンス以降に更新することは一切ありません。これらのグローバルは、ビューポート、カラー構成、ファビコン、タッチアイコン、マニフェストなど、安定したブラウザヒントに適しています。タグがページ固有である場合、SEOに関連する場合、または後でオーバーライドする可能性がある場合は、代わりに`defaults`、ルートメタデータ、または実行時メタデータに配置してください。

レンダリングされたタグの代わりに構造化データとして解決されたメタデータを必要とするアプリケーションは、`Head::toArray()`を呼び出すことができます。返されるデータには、タイトル、Open Graphの値、JSON-LDスキーマ、およびその他の解決されたメタデータを含みます。
