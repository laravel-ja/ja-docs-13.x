# 貢献ガイド

- [バグレポート](#bug-reports)
- [質問のサポート](#support-questions)
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

活発なコラボレーションを促進するため、LaravelはGitHub issueではなく、問題に対処するプルリクエストを強く推奨します。ほとんどのファーストパーティパッケージでは、GitHub issueを無効にしています。

問題を発見した場合は、その問題に対処するプルリクエストを作成してください。プルリクエストには、タイトルと、問題およびその解決策についての明確な説明を含める必要があります。また、できるだけ多くの関連情報と、問題を実証するコードサンプルも含めてください。プルリクエストの目標は、自分自身、そして他の人が問題を理解し、修正を検証しやすくすることです。

問題の修正方法がわからない場合は、コーディングエージェントに問題を説明し、プルリクエストを作成してください。

プルリクエストは、「ready for review」とマークされ（「draft」状態ではない）、新機能のすべてのテストにパスした場合のみレビューします。「draft」状態のまま放置された非アクティブなプルリクエストは、数日後にクローズします。

LaravelのソースコードはGitHubで管理され、各Laravelプロジェクトのリポジトリが存在しています。

<div class="content-list" markdown="1">

- [Laravel AI SDK](https://github.com/laravel/ai)
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

Laravelへ送信するすべてのプルリクエストに感謝します。しかし、思慮深い人間のレビューや検討を経ずに、主にAIが生成した大幅な貢献は受け付けません。

フレームワークへの大規模または複雑な貢献を支援するためにAIツールの使用を選択する場合、提出する前に、結果として得られるコードを徹底的にレビュー、テストし、自身で理解している**必要があります**。

プルリクエストの説明は、**必ず**コントリビュータがすべて自身で作成してください。AIが生成した説明を含むプルリクエストはクローズします。

**完全にAIによって生成したイシューやプルリクエストの大量作成は、容認しません。**そのようなプルリクエストはレビューなしでクローズし、投稿したユーザーはリポジトリからブロックする可能性があります。

コントリビューターの皆さんには、既存のコードベースに精通し、コミュニティと交流し、解決しようとしている問題に対する自分自身の理解と細心の注意を反映したプルリクエストを提出することを推奨します。

<a name="security-vulnerabilities"></a>
## セキュリティ脆弱性

Laravel内のセキュリティ脆弱性を発見した場合は、<a href="mailto:security@laravel.com">security@laravel.com</a>のセキュリティチームへメールを送信してください。すべてのセキュリティ脆弱性へ迅速に対応します。

<a name="coding-style"></a>
## コーディングスタイル

Laravelは[PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md)コーディング規約と[PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md)オートローディング規約に準拠しています。

<a name="phpdoc"></a>
### PHPDoc

次に正しいLaravelのドキュメントブロックの例を示します。`@param`属性に続け２スペース、引数タイプ、２スペース、最後に変数名となっていることに注意してください。

```php
/**
 * コンテナへ結合を登録
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
 * ジョブを実行
 * [tl! remove]
 * @return void [tl! remove]
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
 * [tl! add]
 * @return array<int, \Illuminate\Mail\Mailables\Attachment> [tl! add]
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
