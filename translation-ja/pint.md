# Laravel Pint

- [イントロダクション](#introduction)
- [インストール](#installation)
- [Pintの実行](#running-pint)
- [Pintの設定](#configuring-pint)
    - [プリセット](#presets)
    - [ルール](#rules)
    - [ファイル／フォルダの除外](#excluding-files-or-folders)
- [継続的インテグレーション](#continuous-integration)
    - [GitHub Actions](#running-tests-on-github-actions)

<a name="introduction"></a>
## イントロダクション

[Laravel Pint](https://github.com/laravel/pint)は、ミニマリストのためのPHPコードスタイルフィクサーです。Pintは[PHP CS Fixer](https://github.com/FriendsOfPHP/PHP-CS-Fixer)上で構築しており、あなたのコードスタイルがクリーンで一貫したものになるよう、シンプルに保つことができます。

Pintは、すべての新しいLaravelアプリケーションに自動的にインストールされますので、すぐに使い始めることができます。デフォルトで、Pintは設定を必要とせず、Laravelの主張を取り入れたコーディングスタイルに従い、コードスタイルの問題を修正します。

<a name="installation"></a>
## インストール

PintはLaravelフレームワークの最近のリリースに含まれているため、通常インストールは不要です。しかし、古いアプリケーションでは、Composer経由でLaravel Pintをインストールできます。

```shell
composer require laravel/pint --dev
```

<a name="running-pint"></a>
## Pintの実行

プロジェクトの`vendor/bin`ディレクトリにある、`pint`バイナリを起動し、Pintへコードスタイルの問題を修正するように指示できます。

```shell
./vendor/bin/pint
```

Pintを並列モード（試験中）で実行してパフォーマンスを向上させたい場合は、`--parallel`オプションを使用します。

```shell
./vendor/bin/pint --parallel
```

並列モードでは、`--max-processes`オプションを使用して実行するプロセスの最大数を指定することもできます。このオプションが指定されていない場合、Pint はマシン上で利用可能なすべてのコアを使用します。

```shell
./vendor/bin/pint --parallel --max-processes=4
```

また、特定のファイルやディレクトリに対してPintを実行することもできます。

```shell
./vendor/bin/pint app/Models

./vendor/bin/pint app/Models/User.php
```

Pintは更新した全ファイルの完全なリストを表示します。Pintを起動する際に、`-v`オプションを指定すれば、Pintが行う変更についてさらに詳しく確認できます。

```shell
./vendor/bin/pint -v
```

もし、実際にファイルを変更せず、Pintにコードのスタイルエラーを検査させたい場合は、`--test`オプションを使用します。Pintはコードスタイルのエラーを見つけた場合、0以外の終了コードを返します。

```shell
./vendor/bin/pint --test
```

Gitで指定したブランチと比較して、異なるファイルのみをPintで修正したい場合は、`--diff=[branch]`オプションを使用します。これはCI環境（GitHub actionsなど）で効果的に使用でき、新規または変更されたファイルのみを調べることで時間を節約できます。

```shell
./vendor/bin/pint --diff=main
```

もし、Gitへコミットされていない変更のあるファイルだけをPintに修正させたい場合は、`--dirty` オプションを使用します。

```shell
./vendor/bin/pint --dirty
```

Pintにコードスタイルのエラーがあるファイルを修正させたいが、エラーを修正した場合にコードを0以外で終了させたい場合は、`--repair`オプションを使用します。

```shell
./vendor/bin/pint --repair
```

<a name="configuring-pint"></a>
## Pintの設定

前述したように、Pintは設定を一切必要としません。しかし、プリセットやルール、インスペクトフォルダをカスタマイズしたい場合は、プロジェクトのルートディレクトリに、`pint.json`ファイルを作成してください。

```json
{
    "preset": "laravel"
}
```

また、特定のディレクトリにある`pint.json`を利用したい場合は、Pintを起動する際に`--config`オプションを指定してください。

```shell
./vendor/bin/pint --config vendor/my-company/coding-style/pint.json
```

<a name="presets"></a>
### プリセット

プリセットは、コード内のスタイルの問題を修正するために使用するルールセットを定義しています。デフォルトでPintは、`laravel`プリセットを使用します。これは、Laravelの意見に基づいたコーディングスタイルに従って問題を修正するものです。しかし、Pintに`--preset`オプションを指定することで、別のプリセットも指定できます。

```shell
./vendor/bin/pint --preset psr12
```

お望みならば、プロジェクトの`pint.json`ファイルにプリセットを設定できます。

```json
{
    "preset": "psr12"
}
```

Pintが現在サポートしているプリセットは、`laravel`、`per`、`psr12`、`symfony`、`empty`です。

<a name="rules"></a>
### ルール

ルールは、コードのスタイルに関する問題を修正するためにPintが使用するスタイルのガイドラインです。前述したように、プリセットはあらかじめ定義されたルールのグループであり、ほとんどのPHPプロジェクトに最適であるため、通常、含まれる個々のルールについて心配する必要はありません。

しかし、必要に応じて、`pint.json`ファイルで特定のルールの有効／無効を指定できますし、`empty`プリセットを使用し、ゼロからルールを定義することもできます。

```json
{
    "preset": "laravel",
    "rules": {
        "simplified_null_return": true,
        "array_indentation": false,
        "new_with_parentheses": {
            "anonymous_class": true,
            "named_class": true
        }
    }
}
```

Pintは[PHP CS Fixer](https://github.com/FriendsOfPHP/PHP-CS-Fixer)上に構築しています。そのため、PHP CS Fixerのルールのいずれかを使用して、プロジェクトのコードスタイルの問題を修正することができます。[PHP CS Fixer設定](https://mlocati.github.io/php-cs-fixer-configurator)を参照してください。

<a name="custom-rules"></a>
#### カスタムルール

PHP CS Fixerのルールに加えて、Pintは`Pint/`というプレフィックスが付いたカスタムルールを提供しています。これらのルールはデフォルトでは有効になっていませんが、`pint.json`ファイルで有効にできます。

<a name="phpdoc-type-annotations-only"></a>
##### `Pint/phpdoc_type_annotations_only`

このルールは、コードからすべてのコメントとドックブロックの解説文を削除し、`@param`、`@return`、`@var`、`@phpstan-type`などの`@`アノテーションを含む行のみを保持します。

```php
/**
 * ユーザーの投稿を取得 [tl! remove]
 * [tl! remove]
 * @return HasMany<Post, $this>
 */
public function posts(): HasMany
```

単一行コメントや、`@`アノテーションのないブロックコメントは完全に削除されます。特定のコメントを保持したい場合は、プレフィックスに`@note`、`@warning`、または`@todo`を付けます。

```php
// @note このコメントは保持されます
```

このルールを有効にするには、`pint.json`ファイルに追加してください。

```json
{
    "preset": "laravel",
    "rules": {
        "Pint/phpdoc_type_annotations_only": true
    }
}
```

> [!NOTE]
> 設定ファイルは通常ドキュメントとしてコメントに依存しているため、このルールは`config`ディレクトリ内のファイルを自動的にスキップします。

<a name="excluding-files-or-folders"></a>
### ファイル／フォルダの除外

デフォルトでPintは、プロジェクト内の`vendor`ディレクトリにあるものを除く、すべての`.php`ファイルを検査します。もし、より多くのフォルダを除外したい場合は、`exclude`設定オプションを使用して除外可能です。

```json
{
    "exclude": [
        "my-specific/folder"
    ]
}
```

もし、指定した名前のパターンに一致するファイルをすべて除外したい場合は、`notName`設定オプションを使用します。

```json
{
    "notName": [
        "*-my-file.php"
    ]
}
```

もし、ファイルの正確なパスを指定して除外したい場合は、`notPath`設定オプションを使用して除外できます。

```json
{
    "notPath": [
        "path/to/excluded-file.php"
    ]
}
```

<a name="continuous-integration"></a>
## 継続的インテグレーション

<a name="running-tests-on-github-actions"></a>
### GitHub Actions

Laravel Pintでプロジェクトのリントを自動化するには、[GitHub Actions](https://github.com/features/actions)を設定し、新しいコードをGitHubにプッシュするたびにPintを実行します。まず、**Settings > Actions > General > Workflow permissions**で、GitHub内のワークフローへ、"Read and write permissions"を付与してください。次に、`.github/workflows/lint.yml`ファイルを以下の内容で作成します。

```yaml
name: Fix Code Style

on: [push]

jobs:
  lint:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: true
      matrix:
        php: [8.4]

    steps:
      - name: Checkout code
        uses: actions/checkout@v5

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: ${{ matrix.php }}
          tools: pint

      - name: Run Pint
        run: pint

      - name: Commit linted files
        uses: stefanzweifel/git-auto-commit-action@v6
```
