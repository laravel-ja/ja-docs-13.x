# AI開発支援

- [イントロダクション](#introduction)
    - [なぜAI開発にLaravelが最適なのか？](#why-laravel-for-ai-development)
- [Laravel Boost](#laravel-boost)
    - [インストール](#installation)
    - [利用可能なツール](#available-tools)
    - [AIガイドライン](#ai-guidelines)
    - [エージェントスキル](#agent-skills)
    - [ドキュメント検索](#documentation-search)
    - [エージェント統合](#agents-integration)

<a name="introduction"></a>
## イントロダクション

Laravelは、AI支援開発やエージェントによる開発において、最高のフレームワークとなる独自の地位を確立しています。[Claude Code](https://docs.anthropic.com/en/docs/claude-code)、[OpenCode](https://opencode.ai)、[Cursor](https://cursor.com)、[GitHub Copilot](https://github.com/features/copilot)といったAIコーディングエージェントの台頭は、開発者のコード記述方法を一変させました。これらのツールは、これまでにないスピードで機能全体の生成、複雑な問題のデバッグ、コードのリファクタリングを実行できます。しかし、その効果はツールがあなたのコードベースをどれだけ深く理解しているかに大きく依存します。

<a name="why-laravel-for-ai-development"></a>
### なぜAI開発にLaravelが最適なのか？

Laravelの規約を重視する設計（オピニオンな規約）と明確に定義された構造は、AI支援開発に理想的な環境を提供します。開発者がAIエージェントにコントローラの追加を依頼すると、AIはそれをどこに配置すべきか正確に判断します。新しいマイグレーションが必要な場合も、命名規則やファイルの場所を予測できます。この一貫性により、より柔軟なフレームワークでAIツールが陥りがちな「推測」という作業を排除します。

ファイル構成にとどまらず、Laravelの表現力豊かな構文と包括的なドキュメントは、AIエージェントが正確で慣習に沿った（イディオマティックな）コードを生成するために必要なコンテキスト（文脈）を与えます。Eloquentのリレーションシップ、フォームリクエスト、ミドルウェアなどの機能は、エージェントが確実に理解し、再現できるパターンに従っています。その結果、AIが生成するコードは、汎用的なPHPスニペットを繋ぎ合わせたものではなく、熟練したLaravel開発者が書いたような品質になります。

<a name="laravel-boost"></a>
## Laravel Boost

[Laravel Boost](https://github.com/laravel/boost)は、AIコーディングエージェントとあなたのLaravelアプリケーションの橋渡しをします。BoostはMCP（Model Context Protocol）サーバであり、15以上の専門的なツールを備えています。これらのツールは、アプリケーションの構造、データベース、ルートなどに関する深い洞察をAIエージェントに提供します。Boostをインストールすれば、AIエージェントは汎用的なコードアシスタントから、あなたのアプリケーションを具体的に理解したLaravelエキスパートへと進化します。

Boostは3つの主要な機能を提供します。アプリケーションの検査や操作を行うためのMCPツール群、Laravelエコシステム向けに特別に作成した構成可能なAIガイドライン、そして17,000以上のLaravel固有のナレッジを含む強力なドキュメントAPIです。

<a name="installation"></a>
### インストール

Boostは、PHP8.1以上で動作するLaravel10、11、12、１３のアプリケーションにインストールできます。まずは、開発用依存パッケージとしてBoostをインストールしてください。

```shell
composer require laravel/boost --dev
```

インストール後、対話型インストーラを実行します。

```shell
php artisan boost:install
```

インストーラがIDEとAIエージェントを自動検出し、プロジェクトに適した統合機能を選択できるようにします。Boostは、MCP対応エディタ用の`.mcp.json`や、AIのコンテキスト用ガイドラインファイルなどの必要な設定ファイルを生成します。

> [!NOTE]
> 各開発者が独自の環境を構成したい場合は、生成される`.mcp.json`、`CLAUDE.md`、`boost.json`などの設定ファイルを`.gitignore`へ安全に追加できます。

<a name="available-tools"></a>
### 利用可能なツール

Boostは、Model Context Protocol（MCP）を通じて、包括的なツールセットをAIエージェントへ公開します。これらのツールにより、エージェントはLaravelアプリケーションを深く理解し、操作できるようになります。

<div class="content-list" markdown="1">

- **アプリケーションのイントロスペクション** - PHPやLaravelのバージョンを照会し、インストール済みパッケージを一覧表示し、アプリケーションの設定や環境変数を検査します。
- **データベースツール** - 会話画面から離れることなく、データベーススキーマを検査し、読み取り専用クエリを実行し、データ構造を把握します。
- **ルート検査** - 登録されているすべてのルートを、関連するミドルウェア、コントローラ、パラメーターとともに一覧表示します。
- **Artisanコマンド** - 利用可能なArtisanコマンドとその引数を検出し、エージェントがタスクに最適なコマンドを提案・実行できるようにします。
- **ログ分析** - アプリケーションのログファイルを読み込んで分析し、問題のデバッグを支援します。
- **ブラウザログ** - Laravelのフロントエンドツールを使用した開発時に、ブラウザのコンソールログやエラーにアクセスします。
- **Tinker統合** - Laravel Tinkerを経由してアプリケーションのコンテキスト内でPHPコードを実行し、エージェントが仮説をテストして動作を検証できるようにします。
- **ドキュメント検索** - インストールされているパッケージのバージョンに合わせて調整された結果を用いて、Laravelエコシステムのドキュメントを検索します。

</div>

<a name="ai-guidelines"></a>
### AIガイドライン

Boostは、Laravelエコシステムのために特別に作られた包括的なAIガイドラインのセットを含みます。これらのガイドラインはAIエージェントへ、Laravelコードの慣用的な書き方、フレームワークの規約に従うこと、はまりがちな間違いの回避方法を教えます。ガイドラインは構成可能であり、バージョンを認識するため、エージェントは使用している正確なパッケージバージョンに適した指示を受け取ります。

ガイドラインはLaravel自体に加え、以下を含むLaravelエコシステムの16以上のパッケージで利用可能です。

<div class="content-list" markdown="1">

- Livewire (2.x, 3.x, 4.x)
- Inertia.js (React、Svelte、Vueバリアント)
- Tailwind CSS (3.xおよび4.x)
- Filament (3.xおよび4.x)
- PHPUnit
- Pest PHP
- Laravel Pint
- その他多数

</div>

`boost:install`を実行すると、Boostはアプリケーションが使用しているパッケージを自動的に検出し、関連するガイドラインをプロジェクトのAIコンテキストファイルに組み込みます。

<a name="agent-skills"></a>
### エージェントスキル

[Agent Skills](https://agentskills.io/home)は、エージェントが特定のドメインで作業する際にオンデマンドで有効化できる、軽量でターゲットを絞った知識モジュールです。事前ロードされるガイドラインとは異なり、スキルを使用すると詳細なパターンやベストプラクティスを関連性がある場合にのみロードできるため、コンテキストの肥大化を抑え、AIが生成するコードの関連性を向上させます。

スキルは、Livewire、Inertia、Tailwind CSS、Pestなどの人気のあるLaravelパッケージで利用可能です。`boost:install`を実行して機能としてスキルを選択すると、`composer.json`で検出されたパッケージに基づいてスキルを自動的にインストールします。

<a name="documentation-search"></a>
### ドキュメント検索

Boostは、AIエージェントが17,000件を超えるLaravelエコシステムのドキュメントにアクセスできるようにする、強力なドキュメントAPIを備えています。一般的なWeb検索とは異なり、このドキュメントはインデックス化およびベクトル化されており、使用中の正確なパッケージバージョンに一致するようフィルタリングされています。

機能の仕組みを理解する必要がある場合、エージェントはBoostのドキュメントAPIを検索し、正確でバージョン固有の情報を受け取れます。これにより、AIエージェントが古いフレームワークバージョンの非推奨メソッドや構文を提案してしまうという、よくある問題を排除します。

<a name="agent-integration"></a>
### エージェント統合

Boostは、Model Context Protocolをサポートする人気のIDEやAIツールと統合します。Cursor、Claude Code、Codex、Gemini CLI、GitHub Copilot、Junieの詳細なセットアップ手順については、Boostドキュメントの[エージェントのセットアップ](/docs/{{version}}/boost#set-up-your-agents)セクションを参照してください。
