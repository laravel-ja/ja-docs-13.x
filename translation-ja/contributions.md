# 貢献ガイド

- [バグレポート](#bug-reports)
- [質問のサポート](#support-questions)
- [コア開発の議論](#core-development-discussion)
- [どのブランチ？](#which-branch)
- [アセットのコンパイル](#compiled-assets)
- [AI生成による貢献](#ai-generated-contributions)
- [セキュリティ脆弱性](#security-vulnerabilities)
- [コーディングスタイル](#coding-style)
    - [PHPDoc](#phpdoc)
    - [StyleCI](#styleci)
- [行動規範](#code-of-conduct)

<a name="bug-reports"></a>
## バグレポート

より積極的に援助して頂きたいため、Laravelではただのバグレポートでなく、プルリクエストしてくれることを強く推奨しています。プルリクエストは、”ready for review"（"draft"状態ではない）とマークされている場合にのみレビューされ、新しい機能のすべてのテストを通します。"draft"状態で残された残りの非アクティブプルリクエストは、数日後に閉じられます。

バグレポートを提出する場合にはその問題をタイトルに含め、明確に内容を記述してください。できる限り関連する情報や、その問題をデモするコードも含めてください。バグレポートの目的はあなた自身、そして他の人でも、簡単にバグが再現でき修正されるようにすることです。

バグ報告は、同じ問題を抱える他の人たちが、解決に向けてあなたと協力し合えることを期待して作成するものです。バグ報告を行えば、自動的に何らかの動きがあったり、誰かがすぐに修正に乗り出したりすることを期待しないでください。バグ報告の作成は、あなた自身や他の人たちが問題解決への歩みを始めるのに役立ちます。もし協力したいのであれば、[私たちのイシュー・トラッカーにリストされているバグ](https://github.com/issues?q=is%3Aopen+is%3Aissue+label%3Abug+user%3Alaravel)の修正を手伝ってください。Laravelのすべてのイシューを表示するには、GitHubで認証する必要があります。

Laravelを使っているときに、DocBlock、PHPStan、IDEの警告に気づいた場合は、GitHub issueを作成しないでください。代わりに、問題を解決するための、プルリクエストを提出してください。

LaravelのソースコードはGitHubで管理され、各Laravelプロジェクトのリポジトリが存在しています。

<div class="content-list" markdown="1">

- [Laravelアプリケーション](https://github.com/laravel/laravel)
- [Laravelアートワーク](https://github.com/laravel/art)
- [Laravel Boost](https://github.com/laravel/boost)
- [Laravelドキュメント](https://github.com/laravel/docs)
- [Laravel Dusk](https://github.com/laravel/dusk)
- [Laravel Cashier Stripe](https://github.com/laravel/cashier)
- [Laravel Cashier Paddle](https://github.com/laravel/cashier-paddle)
- [Laravel Echo](https://github.com/laravel/echo)
- [Laravel Envoy](https://github.com/laravel/envoy)
- [Laravel Folio](https://github.com/laravel/folio)
- [Laravelフレームワーク](https://github.com/laravel/framework)
- [Laravel Horizon](https://github.com/laravel/horizon)
- [Laravel Passport](https://github.com/laravel/passport)
- [Laravel Pennant](https://github.com/laravel/pennant)
- [Laravel Pint](https://github.com/laravel/pint)
- [Laravel Prompts](https://github.com/laravel/prompts)
- [Laravel Reverb](https://github.com/laravel/reverb)
- [Laravel Sail](https://github.com/laravel/sail)
- [Laravel Sanctum](https://github.com/laravel/sanctum)
- [Laravel Scout](https://github.com/laravel/scout)
- [Laravel Socialite](https://github.com/laravel/socialite)
- [Laravel Telescope](https://github.com/laravel/telescope)
- [Laravel Livewire Starter Kit](https://github.com/laravel/livewire-starter-kit)
- [Laravel React Starter Kit](https://github.com/laravel/react-starter-kit)
- [Laravel Svelte Starter Kit](https://github.com/laravel/svelte-starter-kit)
- [Laravel Vue Starter Kit](https://github.com/laravel/vue-starter-kit)

</div>

<a name="support-questions"></a>
## 質問のサポート

LaravelのGitHubイシュートラッカーは、Laravelのヘルプやサポートの提供を目的としていません。代わりに以下のチャンネルを利用してください。

<div class="content-list" markdown="1">

- [GitHub Discussions](https://github.com/laravel/framework/discussions)
- [Laracastsフォーラム](https://laracasts.com/discuss)
- [Laravel.ioフォーラム](https://laravel.io/forum)
- [StackOverflow](https://stackoverflow.com/questions/tagged/laravel)
- [Discord](https://discord.gg/laravel)
- [Larachat](https://larachat.co)
- [IRC](https://web.libera.chat/?nick=artisan&channels=#laravel)

</div>

<a name="core-development-discussion"></a>
## コア開発の議論

新機能や、現存のLaravelの振る舞いについて改善を提言したい場合は、Laravelフレームワークリポジトリの[GitHub discussion board](https://github.com/laravel/framework/discussions)へお願いします。新機能を提言する場合は自発的に、それを完動させるのに必要な、コードを最低限でも実装してください。

バグ、新機能、既存機能の実装についてのざっくばらんな議論は、[Laravel Discord server](https://discord.gg/laravel)の`#internals`チャンネルで行っています。LaravelのメンテナーであるTaylor Otwellは、通常ウイークエンドの午前８時から５時まで（America/Chicago標準時、UTC-6:00）接続しています。他の時間帯では、ときどき接続しています。

<a name="which-branch"></a>
## どのブランチ？

**すべての**バグフィックスは、バグフィックスをサポートする最新バージョン (現在は `13.x`) へ送るべきです。次期リリースにのみ存在する機能を修正する場合を除き、バグ修正を**決して**、`master`ブランチに送ってはいけません。

現在のリリースと**完全な下位互換性**がある**マイナー**な機能は、最新の安定版ブランチ（現在は`13.x`）へ送ってください。

**メジャー**な新機能や互換性のない変更を含む機能は、常に次のリリースに含まれる`master`ブランチへ送ってください。

<a name="compiled-assets"></a>
## アセットのコンパイル

`laravel/laravel`リポジトリの`resources/css`や`resources/js`下のほとんどのファイルのように、コンパイル済みファイルに影響を及ぼすファイルへ変更を行う場合、コンパイル済みファイルをコミットしないでください。大きなファイルサイズであるため、メンテナは実際レビューできません。悪意のあるコードをLaravelへ紛れ込ませる方法を提供してしまいます。これを防御的に防ぐため、すべてのコンパイル済みファイルはLaravelメンテナが生成しコミットします。

<a name="ai-generated-contributions"></a>
## AI生成による貢献

Laravelへ提出されるすべてのプルリクエストに感謝します。しかし、思慮深い人間によるレビューや検討なしに、主にAIによって生成されたコントリビューションは受け入れられません。

コントリビューションを補助するためにAIツールの使用を選択する場合、結果のコードは提出前に、あなた自身で徹底的にレビュー、テスト、理解する**必要があります**。

**完全にAIによって生成したイシューやプルリクエストの大量作成は、容認しません。**そのようなプルリクエストはレビューなしでクローズし、投稿したユーザーはリポジトリからブロックする可能性があります。

コントリビューターの皆さんには、既存のコードベースに精通し、コミュニティと交流し、解決しようとしている問題に対する自分自身の理解と細心の注意を反映したプルリクエストを提出することを推奨します。

<a name="security-vulnerabilities"></a>
## セキュリティ脆弱性

Laravelにセキュリティー脆弱性を見つけたときは、メールで[Taylor Otwell(taylorotwell@laravel.com)](mailto:taylor@laravel.com)に連絡してください。全セキュリティー脆弱性は、速やかに対応されるでしょう。

<a name="coding-style"></a>
## コーディングスタイル

Laravelは[PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md)コーディング規約と[PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md)オートローディング規約に準拠しています。

<a name="phpdoc"></a>
### PHPDoc

次に正しいLaravelのドキュメントブロックの例を示します。`@param`属性に続け２スペース、引数タイプ、２スペース、最後に変数名となっていることに注意してください。

```php
/**
 * Register a binding with the container.
 *
 * @param  string|array  $abstract
 * @param  \Closure|string|null  $concrete
 * @param  bool  $shared
 * @return void
 *
 * @throws \Exception
 */
public function bind($abstract, $concrete = null, $shared = false)
{
    // …
}
```

ネイティブ型の使用により、`@param`属性や`@return`属性が冗長になる場合は、それらを削除することができます。

```php
/**
 * 仕事を実行
 */
public function handle(AudioProcessor $processor): void
{
    // …
}
```

ただし、ネイティブ型が汎用型の場合は、`@param`属性または`@return`属性を用いて汎用型を指定してください。

```php
/**
 * メッセージの添付を取得
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [
        Attachment::fromStorage('/path/to/file'),
    ];
}
```

<a name="styleci"></a>
### StyleCI

コードのスタイルが完璧でなくても心配ありません。プルリクエストがマージされた後で、[StyleCI](https://styleci.io/)が自動的にスタイルを修正し、Laravelリポジトリへマージします。これによりコードスタイルではなく、貢献の内容へ集中できます。

<a name="code-of-conduct"></a>
## 行動規範

Laravelの行動規範はRubyの行動規範を基にしています。行動規範の違反はTaylor Otwell(taylor@laravel.com)へ報告してください。

<div class="content-list" markdown="1">

- 参加者は反対意見に寛容であること。
- 参加者は個人攻撃や個人的な発言の誹謗に陥らぬように言動に気をつけてください。
- 相手の言動を解釈する時、参加者は常に良い意図だと仮定してください。
- 嫌がらせと考えるのがふさわしい振る舞いは、寛容に扱いません。

</div>
