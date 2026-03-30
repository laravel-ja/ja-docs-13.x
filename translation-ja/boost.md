# Laravel Boost

- [イントロダクション](#introduction)
- [インストール](#installation)
    - [Boostリソースの最新保持](#keeping-boost-resources-updated)
    - [エージェントのセットアップ](#set-up-your-agents)
- [MCPサーバ](#mcp-server)
    - [利用可能なMCPツール](#available-mcp-tools)
    - [MCPサーバの手作業での登録](#manually-registering-the-mcp-server)
- [AIガイドライン](#ai-guidelines)
    - [利用可能なAIガイドライン](#available-ai-guidelines)
    - [カスタムAIガイドラインの追加](#adding-custom-ai-guidelines)
    - [Boost AIガイドラインのオーバーライド](#overriding-boost-ai-guidelines)
    - [サードパーティパッケージのAIガイドライン](#third-party-package-ai-guidelines)
- [エージェントスキル](#agent-skills)
    - [利用可能なスキル](#available-skills)
    - [カスタムスキル](#custom-skills)
    - [スキルのオーバーライド](#overriding-skills)
    - [サードパーティパッケージのスキル](#third-party-package-skills)
- [ガイドライン対スキル](#guidelines-vs-skills)
- [ドキュメントAPI](#documentation-api)
- [Boostの拡張](#extending-boost)
    - [他のIDE／AIエージェントへのサポート追加](#adding-support-for-other-ides-ai-agents)

<a name="introduction"></a>
## イントロダクション

Laravel Boostは、AIエージェントがLaravelのベストプラクティスに従った高品質なLaravelアプリケーションを作成するのを助ける、不可欠なガイドラインとエージェントスキルを提供し、AI支援開発を加速させます。

また、Boostは、17,000件を超えるLaravel固有の情報を含む広範なナレッジベースと、組み込みのMCPツールを組み合わせた、強力なLaravelエコシステムドキュメントAPIを提供します。これらはすべて、正確で文脈を考慮した結果を得るために、埋め込み（embeddings）を使用したセマンティック検索機能によって強化しています。Boostは、Claude CodeやCursorのようなAIエージェントに、このAPIを使用して最新のLaravel機能とベストプラクティスを学習するように指示します。

<a name="installation"></a>
## インストール

Laravel Boostは、Composer経由でインストールできます。

```shell
composer require laravel/boost --dev
```

次に、MCPサーバとコーディングガイドラインをインストールします。

```shell
php artisan boost:install
```

`boost:install`コマンドは、インストールプロセス中に選択したコーディングエージェントに合わせて、関連するエージェントガイドラインとスキルファイルを生成します。

Laravel Boostをインストールすれば、CursorやClaude Code、またはお好みのAIエージェントでコーディングを開始する準備は完了です。

> [!NOTE]
> 生成されたMCP設定ファイル（`.mcp.json`）、ガイドラインファイル（`CLAUDE.md`、`AGENTS.md`、`junie/`など）、および`boost.json`設定ファイルは、`boost:install`や`boost:update`を実行した際に自動的に再生成されるファイルのため、アプリケーションの`.gitignore`に追加するかは、おまかせします。

<a name="set-up-your-agents"></a>
### エージェントのセットアップ

```text tab=Cursor
1. Open the command palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. 「/open MCP Settings」で`enter`を押します。
3. `laravel-boost`のトグルをオンにします。
```

```text tab=Claude Code
Claude Codeのサポートは通常、自動的に有効になります。もし有効になっていない場合は、プロジェクトのディレクトリでシェルを開き、以下のコマンドを実行してください。

claude mcp add -s local -t stdio laravel-boost php artisan boost:mcp
```

```text tab=Codex
Codexのサポートは通常、自動的に有効になります。もし有効になっていない場合は、プロジェクトのディレクトリでシェルを開き、以下のコマンドを実行してください。

codex mcp add laravel-boost -- php "artisan" "boost:mcp"
```

```text tab=Gemini CLI
Gemini CLIのサポートは通常、自動的に有効になります。もし有効になっていない場合は、プロジェクトのディレクトリでシェルを開き、以下のコマンドを実行してください。

gemini mcp add -s project -t stdio laravel-boost php artisan boost:mcp
```

```text tab=GitHub Copilot (VS Code)
1. Open the command palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. 「MCP: List Servers」で`enter`を押します。
3. 矢印キーで`laravel-boost`に合わせ、`enter`を押します。
4. 「Start server」を選択します。
```

```text tab=Junie
1. `shift`を2回押してコマンドパレットを開きます。
2. 「MCP Settings」を検索して`enter`を押します。
3. `laravel-boost`の隣にあるチェックボックスをオンにします。
4. 右下の「Apply」をクリックします。
```

<a name="keeping-boost-resources-updated"></a>
### Boostリソースの最新保持

インストールしているLaravelエコシステムパッケージの最新バージョンを確実に反映させるために、ローカルのBoostリソース（AIガイドラインとスキル）を定期的に更新するとよいでしょう。そのためには、`boost:update` Artisanコマンドを使用します。

```shell
php artisan boost:update
```

また、Composerの"post-update-cmd"スクリプトにこれを追加して、プロセスを自動化することもできます。

```json
{
  "scripts": {
    "post-update-cmd": [
      "@php artisan boost:update --ansi"
    ]
  }
}
```

`boost:update`コマンドはデフォルトで、アプリケーション内ですでに公開している既存のBoostリソースのみを更新します。新たにインストールしたパッケージをBoostにスキャンさせ、対応するガイドラインやスキルの公開を提案させたい場合は、`--discover`オプションを使用してください。

```shell
php artisan boost:update --discover
```

<a name="mcp-server"></a>
## MCPサーバ

Laravel Boostは、AIエージェントがLaravelアプリケーションとやり取りするためのツールを公開するMCP（Model Context Protocol）サーバを提供します。これらのツールにより、エージェントはアプリケーションの構造を検査したり、データベースをクエリしたり、コードを実行したりといった能力を得られます。

<a name="available-mcp-tools"></a>
### 利用可能なMCPツール

| 名前                          | 備考                                     |
|----------------------------|----------------------------------------------------------------------------------------------------------------|
| Application Info           | PHPとLaravelのバージョン、データベースエンジン、バージョン付きのエコシステムパッケージ一覧、Eloquentモデルを読み取る |
| Browser Logs               | ブラウザからのログとエラーを読み取る |
| Database Connections       | デフォルトの接続を含む、利用可能なデータベース接続を検査する |
| Database Query             | データベースに対してクエリを実行する |
| Database Schema            | データベーススキーマを読み取る |
| Get Absolute URL           | 相対パスのURIを絶対パスに変換し、エージェントが有効なURLを生成できるようにする              |
| Last Error                 | アプリケーションのログファイルから最後のエラーを読み取る |
| Read Log Entries           | 直近N個のログエントリを読み取る |
| Search Docs                | インストール済みパッケージに基づいてドキュメントを取得するために、LaravelがホストするドキュメントAPIサービスを照会する |

<a name="manually-registering-the-mcp-server"></a>
### MCPサーバの手作業での登録

選択したエディタにLaravel Boost MCPサーバを手作業で登録する必要がある場合があります。以下の詳細を使用してMCPサーバを登録してください。

<table>
<tr><td><strong>Command</strong></td><td><code>php</code></td></tr>
<tr><td><strong>Args</strong></td><td><code>artisan boost:mcp</code></td></tr>
</table>

JSONの例：

```json
{
    "mcpServers": {
        "laravel-boost": {
            "command": "php",
            "args": ["artisan", "boost:mcp"]
        }
    }
}
```

<a name="ai-guidelines"></a>
## AIガイドライン

AIガイドラインは、AIエージェントにLaravelエコシステムパッケージに関する不可欠なコンテキストを提供するために、事前にロードされる構成可能な指示ファイルです。これらのガイドラインには、エージェントが一貫性のある高品質なコードを生成するのに役立つ、コアとなる規約、ベストプラクティス、およびフレームワーク固有のパターンが含まれています。

<a name="available-ai-guidelines"></a>
### 利用可能なAIガイドライン

Laravel Boostには、以下のパッケージとフレームワーク用のAIガイドラインが含まれています。`core`ガイドラインは、すべてのバージョンに適用可能な、対象パッケージに対する一般的で汎用的なアドバイスをAIに提供します。

| パッケージ          | サポートバージョン          |
| ----------------- | ---------------------- |
| Core & Boost      | core                   |
| Laravel Framework | core, 10.x, 11.x, 12.x, 13.x |
| Livewire          | core, 2.x, 3.x, 4.x    |
| Flux UI           | core, free, pro        |
| Folio             | core                   |
| Herd              | core                   |
| Inertia Laravel   | core, 1.x, 2.x, 3.x    |
| Inertia React     | core, 1.x, 2.x, 3.x    |
| Inertia Vue       | core, 1.x, 2.x, 3.x    |
| Inertia Svelte    | core, 1.x, 2.x, 3.x    |
| MCP               | core                   |
| Pennant           | core                   |
| Pest              | core, 3.x, 4.x         |
| PHPUnit           | core                   |
| Pint              | core                   |
| Sail              | core                   |
| Tailwind CSS      | core, 3.x, 4.x         |
| Livewire Volt     | core                   |
| Wayfinder         | core                   |
| Enforce Tests     | conditional            |

> **注意：** AIガイドラインを最新の状態に保つには、[Boostリソースの最新保持](#keeping-boost-resources-updated)セクションを参照してください。

<a name="adding-custom-ai-guidelines"></a>
### カスタムAIガイドラインの追加

独自のカスタムAIガイドラインでLaravel Boostを強化するには、アプリケーションの`.ai/guidelines/*`ディレクトリに`.blade.php`または`.md`ファイルを追加してください。これらのファイルは、`boost:install`を実行した際に、自動的にLaravel Boostのガイドラインへ取り込まれます。

<a name="overriding-boost-ai-guidelines"></a>
### Boost AIガイドラインのオーバーライド

一致するファイルパスを持つ独自のカスタムガイドラインを作成することで、Boostに組み込まれるAIガイドラインをオーバーライドできます。既存のBoostガイドラインのパスと一致するカスタムガイドラインを作成すると、Boostは組み込みバージョンの代わりにカスタムバージョンを使用します。

例えば、Boostの「Inertia React v2 Form Guidance」ガイドラインをオーバーライドするには、`.ai/guidelines/inertia-react/2/forms.blade.php`にファイルを作成します。`boost:install`を実行すると、Boostはデフォルトの代わりにカスタムガイドラインを組み込みます。

<a name="third-party-package-ai-guidelines"></a>
### サードパーティパッケージのAIガイドライン

サードパーティパッケージをメンテナンスしており、BoostにそのためのAIガイドラインを含めたい場合は、パッケージに`resources/boost/guidelines/core.blade.php`ファイルを追加することで実現できます。パッケージのユーザーが`php artisan boost:install`を実行した際、Boostは自動的にあなたのガイドラインをロードします。

AIガイドラインでは、パッケージが行うことの短い概要を提供し、必要なファイル構造や規約を概説し、主な機能の作成方法や使用方法を（コマンド例やコードスニペットと共に）説明する必要があります。AIがユーザーに対して正しいコードを生成できるように、簡潔で実用的、かつベストプラクティスに焦点を当てた内容にしてください。以下に例を示します。

```php
## パッケージ名

このパッケージは、[機能の簡単な説明]を提供します。

### 機能

- 機能1：[明確で短い説明]。
- 機能2：[明確で短い説明]。使用例：

@verbatim
<code-snippet name="機能2の使用方法" lang="php">
$result = PackageName::featureTwo($param1, $param2);
</code-snippet>
@verbatim
```

<a name="agent-skills"></a>
## エージェントスキル

[エージェントスキル](https://agentskills.io/home)は、エージェントが特定のドメインで作業する際に、オンデマンドでアクティブ化できる軽量で焦点を絞った知識モジュールです。事前にロードされるガイドラインとは異なり、スキルを使用すると、関連する場合にのみ詳細なパターンやベストプラクティスをロードできるため、コンテキストの肥大化を抑え、AIが生成するコードの関連性を向上させることができます。

`boost:install`を実行して機能としてスキルを選択すると、`composer.json`で検出されたパッケージに基づいてスキルが自動的にインストールされます。例えば、プロジェクトに`livewire/livewire`が含まれている場合、`livewire-development`スキルが自動的にインストールされます。

<a name="available-skills"></a>
### 利用可能なスキル

| スキル                      | パッケージ        |
| -------------------------- | -------------- |
| fluxui-development         | Flux UI        |
| folio-routing              | Folio          |
| inertia-react-development  | Inertia React  |
| inertia-svelte-development | Inertia Svelte |
| inertia-vue-development    | Inertia Vue    |
| livewire-development       | Livewire       |
| mcp-development            | MCP            |
| pennant-development        | Pennant        |
| pest-testing               | Pest           |
| tailwindcss-development    | Tailwind CSS   |
| volt-development           | Volt           |
| wayfinder-development      | Wayfinder      |

> **注意：** スキルを最新の状態に保つには、[Boostリソースの最新保持](#keeping-boost-resources-updated)セクションを参照してください。

<a name="custom-skills"></a>
### カスタムスキル

独自のカスタムスキルを作成するには、アプリケーションの`.ai/skills/{skill-name}/`ディレクトリに`SKILL.md`ファイルを追加してください。`boost:update`を実行すると、カスタムスキルがBoostの組み込みスキルと一緒にインストールされます。

例えば、アプリケーションのドメインロジック用のカスタムスキルを作成する場合です。

```
.ai/skills/creating-invoices/SKILL.md
```

<a name="overriding-skills"></a>
### スキルのオーバーライド

一致する名前を持つ独自のカスタムスキルを作成することにより、Boostに組み込まれたスキルをオーバーライドできます。既存のBoostスキル名と一致するカスタムスキルを作成すると、Boostは組み込みバージョンの代わりにカスタムバージョンを使用します。

例えば、Boostの`livewire-development`スキルをオーバーライドするには、`.ai/skills/livewire-development/SKILL.md`にファイルを作成します。`boost:update`を実行すると、Boostはデフォルトの代わりにカスタムスキルを組み込みます。

<a name="third-party-package-skills"></a>
### サードパーティパッケージのスキル

サードパーティパッケージをメンテナンスしており、Boostにそのためのスキルを含めたい場合は、パッケージに`resources/boost/skills/{skill-name}/SKILL.md`ファイルを追加することで実現できます。パッケージのユーザーが`php artisan boost:install`を実行した際、Boostはユーザーの好みに基づいて自動的にあなたのスキルをインストールします。

Boostスキルは[Agent Skillsフォーマット](https://agentskills.io/what-are-skills)をサポートしており、YAMLフロントマターとMarkdown形式の指示を含む`SKILL.md`ファイルを格納したフォルダとして構成する必要があります。`SKILL.md`ファイルには必須のフロントマター（`name`と`description`）を含める必要があり、オプションでスクリプト、テンプレート、および参照資料を含めることができます。

スキルでは、必要なファイル構造や規約を概説し、主な機能の作成方法や使用方法を（コマンド例やコードスニペットと共に）説明する必要があります。AIがユーザーに対して正しいコードを生成できるように、簡潔で実用的、かつベストプラクティスに焦点を当てた内容にしてください。

```markdown
---
name: package-name-development
description: コンポーネントやワークフローを含む、PackageName機能の構築と操作。
---

# パッケージ開発

## このスキルをいつ使うか
PackageNameの機能を操作するときにこのスキルを使用してください...

## 機能

- 機能1：[明確で短い説明]。
- 機能2：[明確で短い説明]。使用例：

$result = PackageName::featureTwo($param1, $param2);
```

<a name="guidelines-vs-skills"></a>
## ガイドライン対スキル

Laravel Boostは、アプリケーションに関するコンテキストをAIエージェントに提供するための2つの異なる方法、**ガイドライン**と**スキル**を提供します。

**ガイドライン**はAIエージェントの起動時に事前にロードされ、コードベース全体に広く適用されるLaravelの規約やベストプラクティスに関する不可欠なコンテキストを提供します。

**スキル**は特定のタスクに取り組む際にオンデマンドでアクティブ化され、特定のドメイン（LivewireコンポーネントやPestテストなど）の詳細なパターンを含みます。関連する場合にのみスキルをロードすることで、コンテキストの肥大化を抑え、コードの品質を向上させます。

| 側面 | ガイドライン | スキル |
|--------|------------|--------|
| **ロード** | 事前ロード、常に存在 | オンデマンド、関連時のみ |
| **スコープ** | 広範、基礎的 | 焦点、タスク固有 |
| **目的** | コアとなる規約とベストプラクティス | 詳細な実装パターン |

<a name="documentation-api"></a>
## ドキュメントAPI

Laravel Boostは、17,000件を超えるLaravel固有の情報を含む広範なナレッジベースへのアクセスをAIエージェントに提供する、ドキュメントAPIを含んでいます。このAPIは、正確で文脈を考慮した結果を提供するために、埋め込みを使用したセマンティック検索を利用しています。

`Search Docs` MCPツールにより、エージェントはインストール済みパッケージに基づいてドキュメントを取得するために、LaravelがホストするドキュメントAPIサービスを照会できるようにしています。BoostのAIガイドラインとスキルは、このAPIを使用するようコーディングエージェントへ自動的に指示します。

| パッケージ           | サポートバージョン     |
| ----------------- | ------------------ |
| Laravel Framework | 10.x, 11.x, 12.x, 13.x |
| Filament          | 2.x, 3.x, 4.x, 5.x |
| Flux UI           | 2.x Free, 2.x Pro  |
| Inertia           | 1.x, 2.x           |
| Livewire          | 1.x, 2.x, 3.x, 4.x |
| Nova              | 4.x, 5.x           |
| Pest              | 3.x, 4.x           |
| Tailwind CSS      | 3.x, 4.x           |

<a name="extending-boost"></a>
## Boostの拡張

Boostは、多くの一般的なIDEやAIエージェントでそのまま動作します。お使いのコーディングツールがまだサポートされていない場合は、独自のエージェントを作成してBoostと統合できます。

<a name="adding-support-for-other-ides-ai-agents"></a>
### 他のIDE／AIエージェントへのサポート追加

新しいIDEやAIエージェントのサポートを追加するには、`Laravel\Boost\Install\Agents\Agent`を継承したクラスを作成し、必要に応じて以下のコントラクトを1つ以上実装してください。

- `Laravel\Boost\Contracts\SupportsGuidelines` - AIガイドラインのサポートを追加します。
- `Laravel\Boost\Contracts\SupportsMcp` - MCPのサポートを追加します。
- `Laravel\Boost\Contracts\SupportsSkills` - エージェントスキルのサポートを追加します。

<a name="writing-the-agent"></a>
#### エージェントの記述

```php
<?php

declare(strict_types=1);

namespace App;

use Laravel\Boost\Contracts\SupportsGuidelines;
use Laravel\Boost\Contracts\SupportsMcp;
use Laravel\Boost\Contracts\SupportsSkills;
use Laravel\Boost\Install\Agents\Agent;

class CustomAgent extends Agent implements SupportsGuidelines, SupportsMcp, SupportsSkills
{
    // 実装内容...
}
```

実装例については、[ClaudeCode.php](https://github.com/laravel/boost/blob/main/src/Install/Agents/ClaudeCode.php)を参照してください。

<a name="registering-the-agent"></a>
#### エージェントの登録

アプリケーションの`App\Providers\AppServiceProvider`の`boot`メソッドで、カスタムエージェントを登録します。

```php
use Laravel\Boost\Boost;

public function boot(): void
{
    Boost::registerAgent('customagent', CustomAgent::class);
}
```

登録し終えたら、`php artisan boost:install`の実行時にエージェントを選択できるようになります。
