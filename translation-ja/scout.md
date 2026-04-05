# Laravel Scout

- [イントロダクション](#introduction)
- [インストール](#installation)
    - [キュー投入](#queueing)
- [ドライバ動作要件](#driver-prerequisites)
- [設定](#configuration)
    - [検索可能データの設定](#configuring-searchable-data)
- [データベース／コレクションエンジン](#database-and-collection-engines)
    - [データベースエンジン](#database-engine)
    - [コレクションエンジン](#collection-engine)
- [サードパーティエンジン設定](#third-party-engine-configuration)
    - [モデルインデックスの設定](#configuring-model-indexes)
    - [Algolia](#algolia-configuration)
    - [Meilisearch](#meilisearch-configuration)
    - [Typesense](#typesense-configuration)
- [サードパーティエンジンインデックス](#indexing)
    - [バッチ取り込み](#batch-import)
    - [レコード追加](#adding-records)
    - [レコード更新](#updating-records)
    - [レコード削除](#removing-records)
    - [インデックスの一時停止](#pausing-indexing)
    - [条件付き検索可能モデルインスタンス](#conditionally-searchable-model-instances)
- [検索](#searching)
    - [Where節](#where-clauses)
    - [ペジネーション](#pagination)
    - [ソフトデリート](#soft-deleting)
    - [エンジンの検索のカスタマイズ](#customizing-engine-searches)
- [カスタムエンジン](#custom-engines)

<a name="introduction"></a>
## イントロダクション

[Laravel Scout](https://github.com/laravel/scout)（Scout、斥候）は、[Eloquentモデル](/docs/{{version}}/eloquent)へ、シンプルなドライバベースのフルテキストサーチを提供します。モデルオブサーバを使い、Scoutは検索インデックスを自動的にEloquentレコードと同期します。

coutは組み込みの`database`エンジンを搭載しており、MySQL／PostgreSQLのフルテキストインデックスと`LIKE`句を使用して既存のデータベースを検索するため、外部サービスは必要ありません。ほとんどのアプリケーションでは、これで十分です。Laravelで使用できるすべての検索オプションの概要は、[検索ドキュメント](/docs/{{version}}/search)を参照してください。

Scoutには、タイポトレランス（打ち間違い許容）、ファセットフィルタリング、大規模なジオサーチなどの機能が必要な場合のために、[Algolia](https://www.algolia.com/)、[Meilisearch](https://www.meilisearch.com)、[Typesense](https://typesense.org)のドライバも用意しています。ローカル開発用の"collection"ドライバも利用でき、[カスタムエンジン](#custom-engines)を自由に作成することさえも可能です。

<a name="installation"></a>
## インストール

最初に、Composerパッケージマネージャを使い、Scoutをインストールします。

```shell
composer require laravel/scout
```

Scoutをインストールした後、`vendor:publish` Artisanコマンドを実行してScout設定ファイルをリソース公開する必要があります。このコマンドは、`scout.php`設定ファイルをアプリケーションの`config`ディレクトリへリソース公開します。

```shell
php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"
```

最後に、検索可能にしたいモデルに`Laravel\Scout\Searchable`トレイトを追加します。このトレイトは、モデルを検索ドライバと自動的に同期させるモデルオブザーバを登録します。

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Post extends Model
{
    use Searchable;
}
```

<a name="queueing"></a>
### キュー投入

`database`または`collection`以外のエンジンを使用する場合、ライブラリを使用する前に[キュードライバ](/docs/{{version}}/queues)の設定を考慮すべきです。キューワーカを実行することで、Scoutはモデル情報を検索インデックスに同期する全ての操作をキューに投入し、アプリケーションのWebインターフェイスのレスポンス時間を大幅に改善できます。

キュードライバを設定したら、`config/scout.php`設定ファイルの`queue`オプションの値を`true`へ設定してください。

```php
'queue' => true,
```

`queue`オプションを`false`に設定している場合でも、AlgoliaやMeilisearchなどの一部のScoutドライバは、常に非同期でレコードをインデックスすることを忘れないでください。言い換えると、Laravelアプリケーション内でインデックス操作が完了しても、検索エンジン自体には、新しいレコードや更新したレコードがすぐに反映されない場合があります。

Scoutジョブで使用する接続とキューを指定するには、`queue`設定オプションを配列で定義してください。

```php
'queue' => [
    'connection' => 'redis',
    'queue' => 'scout'
],
```

もちろん、Scoutジョブが利用するコネクションやキューをカスタマイズする場合は、そのコネクションやキューでジョブを処理するキューワーカを実行する必要があります。

```shell
php artisan queue:work redis --queue=scout
```

<a name="driver-prerequisites"></a>
## ドライバ動作要件

<a name="algolia"></a>
### Algolia

Algoliaドライバを使用する場合、Algolia `id`と`secret`接続情報を`config/scout.php`設定ファイルで設定する必要があります。接続情報を設定し終えたら、Algolia PHP SDKをComposerパッケージマネージャで、インストールする必要があります。

```shell
composer require algolia/algoliasearch-client-php
```

<a name="meilisearch"></a>
### Meilisearch

[Meilisearch](https://www.meilisearch.com)は、高速なオープンソースの検索エンジンです。ローカルマシンにMeilisearchをインストールする方法がわからない場合は、Laravelの公式サポートのDocker開発環境である[Laravel Sail](/docs/{{version}}/sail#meilisearch)を利用できます。

Meilisearchドライバを使用する場合は、Composerパッケージマネージャを使用して、Meilisearch PHP SDKをインストールする必要があります。

```shell
composer require meilisearch/meilisearch-php http-interop/http-factory-guzzle
```

次に、アプリケーションの`.env`ファイル内の`SCOUT_DRIVER`環境変数とMeilisearch `host`と`key`認証情報を設定します。

```ini
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_KEY=masterKey
```

Meilisearchの詳細については、[Meilisearchのドキュメント](https://docs.meilisearch.com/learn/getting_started/quick_start.html)を参照してください。

さらに、[Meilisearchのバイナリ互換のドキュメント](https://github.com/meilisearch/meilisearch-php#-compatibility-with-meilisearch)を見て、自分が使っているMeilisearchのバイナリバージョンと互換性のあるバージョンの`meilisearch/meilisearch-php`をインストールしてください。

> [!WARNING]
> Meilisearchを利用しているアプリケーションのScoutをアップグレードする際には、常にMeilisearchサービス自体に[追加の破壊的な変更](https://github.com/meilisearch/Meilisearch/releases)がないか確認する必要があります。

<a name="typesense"></a>
### Typesense

[Typesense](https://typesense.org)は、光のように早いオープンソース検索エンジンで、キーワード検索、セマンティック検索、ジオ検索、ベクトル検索をサポートしています。

Typesenseを[セルフホスト](https://typesense.org/docs/guide/install-typesense.html#option-2-local-machine-self-hosting)することも、[Typesense Cloud](https://cloud.typesense.org)を利用することもできます。

ScoutでTypesenseを使用開始するには、Composerパッケージマネージャにより、Typesense PHP SDKをインストールします。

```shell
composer require typesense/typesense-php
```

次に、アプリケーションの.envファイルで、`SCOUT_DRIVER`環境変数と、TypesenseホストとAPIキーの認証情報を設定します。

```ini
SCOUT_DRIVER=typesense
TYPESENSE_API_KEY=masterKey
TYPESENSE_HOST=localhost
```

[Laravel Sail](/docs/{{version}}/sail)を使用している場合は、Dockerコンテナ名に合わせて`TYPESENSE_HOST`環境変数を調整する必要があるかもしれません。また、オプションでインストールのポート、パス、プロトコルを指定することもできます。

```ini
TYPESENSE_PORT=8108
TYPESENSE_PATH=
TYPESENSE_PROTOCOL=http
```

Typesenseコレクションの追加設定とスキーマ定義は、アプリケーションの`config/scout.php`設定ファイルにあります。Typesenseに関するより詳しい情報は、[Typesenseドキュメント](https://typesense.org/docs/guide/#quick-start)を参照してください。

<a name="configuration"></a>
## 設定

<a name="configuring-searchable-data"></a>
### Searchableデータの設定

特定のモデルの`toArray`形式のすべてをその検索インデックスへデフォルトで保存します。検索インデックスに同期するデータをカスタマイズしたい場合は、モデルの`toSearchableArray`メソッドをオーバーライドしてください。

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Post extends Model
{
    use Searchable;

    /**
     * モデルのindexableなデータ配列を取得
     *
     * @return array<string, mixed>
     */
    public function toSearchableArray(): array
    {
        $array = $this->toArray();

        // データ配列のカスタマイズ…

        return $array;
    }
}
```

<a name="configuring-search-engines-per-model"></a>
#### モデルエンジンの設定

検索時、Scoutは通常、アプリケーションの`scout`設定ファイルで指定したデフォルトの検索エンジンを使用します。ただし、モデルの`searchableUsing`メソッドをオーバーライドすれば、指定のモデル検索エンジンへ変更できます。

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Engines\Engine;
use Laravel\Scout\Scout;
use Laravel\Scout\Searchable;

class User extends Model
{
    use Searchable;

    /**
     * モデルのインデックスに使用するエンジンの取得
     */
    public function searchableUsing(): Engine
    {
        return Scout::engine('meilisearch');
    }
}
```

<a name="database-and-collection-engines"></a>
## データベース／コレクションエンジン

<a name="database-engine"></a>
### データベースエンジン

> [!WARNING]
> データベースエンジンは現在、MySQLとPostgreSQLをサポートしており、両方とも高速なフルテキストカラムインデックスをサポートしています。

`database`エンジンは、MySQL／PostgreSQLのフルテキストインデックスと`LIKE`句を使用して、既存のデータベースを直接検索します。多くのアプリケーションにとって、これは検索を追加する最もシンプルで実用的な方法であり、外部サービスや追加のインフラストラクチャは必要ありません。

データベースエンジンを使用するには、環境変数`SCOUT_DRIVER`を`database`に設定してください。

```ini
SCOUT_DRIVER=database
```

設定を完了したら、[Searchableなデータを定義](#configuring-searchable-data)し、モデルに対して[検索クエリの実行](#searching)を使用開始できます。サードパーティのエンジンとは異なり、データベースエンジンは個別のインデックス作成ステップを必要とせず、データベーステーブルを直接検索します。

#### データベース検索戦略のカスタマイズ

デフォルトでは、データベースエンジンは[Searchableとして設定](#configuring-searchable-data)したすべてのモデル属性に対して`LIKE`クエリを実行します。しかし、特定のカラムに対し、より効率的な検索戦略を割り当てることもできます。 `SearchUsingFullText`属性はそのカラムにデータベースのフルテキストインデックスを使用し、`SearchUsingPrefix`は文字列全体の中を検索（`%example%`）する代わりに、文字列の先頭（`example%`）のみを一致させます。

この動作を定義するには、モデルの`toSearchableArray`メソッドへPHP属性を割り当てます。属性のないカラムは、引き続きデフォルトの`LIKE`戦略を使用します。

```php
use Laravel\Scout\Attributes\SearchUsingFullText;
use Laravel\Scout\Attributes\SearchUsingPrefix;

/**
 * モデルのインデックス可能なデータ配列の取得
 *
 * @return array<string, mixed>
 */
#[SearchUsingPrefix(['id', 'email'])]
#[SearchUsingFullText(['bio'])]
public function toSearchableArray(): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'bio' => $this->bio,
    ];
}
```

> [!WARNING]
> カラムがフルテキストクエリ制約を使用するように指定する前に、そのカラムに[フルテキストインデックス](/docs/{{version}}/migrations#available-index-types)を確実に割り当ててください。

<a name="collection-engine"></a>
### コレクションエンジン

「コレクション」エンジンは、迅速なプロトタイプ、非常に小さなデータセット（数百レコード程度）、またはテストの実行を目的としています。データベースから可能なすべてのレコードを取得し、PHPでLaravelの`Str::is`ヘルパを使用してそれらをフィルタリングするため、インデックス作成やデータベース固有の機能は必要ありません。最小のユースケースを超えるものは、代わりに[データベースエンジン](#database-engine)を使用する必要があります。

コレクションエンジンを使用するには、`SCOUT_DRIVER`環境変数の値を`collection`に設定するか、アプリケーションの`scout`設定ファイルで`collection`ドライバを直接指定してください。

```ini
SCOUT_DRIVER=collection
```

使用するドライバとしてコレクションドライバを指定したら、モデルに対して[検索クエリの実行](#searching)を開始できます。Algolia、Meilisearch、Typesenseのインデックスにシードするために必要なインデックス作成などの検索エンジンインデックス作成は、コレクションエンジンを使用する場合には不要です。

#### データベースエンジンとの違い

データベースエンジンは、一致するレコードを効率的に見つけるために全文検索インデックスや`LIKE`句を使用しますが、コレクションエンジンはすべてのレコードを取得し、PHP内でそれらをフィルタリングします。コレクションエンジンは、Laravelがサポートするすべてのリレーショナルデータベース（SQLiteやSQL Serverを含む）で動作するため、最もポータブルな選択肢です。しかし、データベースエンジンよりも大幅に効率が劣るため、大規模なデータセットには使用しないでください。

<a name="third-party-engine-configuration"></a>
## サードパーティエンジン設定

以下の設定オプションは、Algolia、Meilisearch、Typesenseなどのサードパーティ検索エンジンを使用する場合にのみ関連します。もし[データベースエンジン](#database-engine)を使用している場合は、このセクションをスキップしてください。

<a name="configuring-model-indexes"></a>
### モデルインデックスの設定

サードパーティエンジンを使用する場合、各Eloquentモデルは、そのモデルのすべてのSearchableレコードを含む指定検索「インデックス」と同期させます。デフォルトでは、各モデルはモデルの典型的な「テーブル」名と一致するインデックスに保存されます。通常、これはモデル名の複数形ですが、モデルの`searchableAs`メソッドをオーバーライドすれば、モデルのインデックスを自由にカスタマイズできます。

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Post extends Model
{
    use Searchable;

    /**
     * モデルに関連付けているインデックスの名前を取得
     */
    public function searchableAs(): string
    {
        return 'posts_index';
    }
}
```

> [!NOTE]
> `searchableAs`メソッドは、常にモデルのデータベーステーブルを直接検索するデータベースエンジンを使用する場合には効果がありません。

<a name="configuring-the-model-id"></a>
#### モデルIDの設定

Scoutはデフォルトで、モデルの主キーを検索インデックスに保存するモデルの一意のID／キーとして使用します。サードパーティエンジンを使用する際に、この動作をカスタマイズする必要がある場合は、モデルの`getScoutKey`メソッドと`getScoutKeyName`メソッドをオーバーライドしてください。

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class User extends Model
{
    use Searchable;

    /**
     * モデルをインデックスするために使用する値を取得
     */
    public function getScoutKey(): mixed
    {
        return $this->email;
    }

    /**
     * モデルをインデックスするために使用するキー名を取得
     */
    public function getScoutKeyName(): mixed
    {
        return 'email';
    }
}
```

> [!NOTE]
> `getScoutKey`メソッドと`getScoutKeyName`メソッドは、常にモデルの主キーを使用するデータベースエンジンを使用する場合には効果がありません。

<a name="algolia-configuration"></a>
### Algolia

<a name="algolia-index-settings"></a>
#### インデックス設定

Algoliaのインデックスへ設定を追加したい場合もあるでしょう。これらの設定はAlgoliaのUIから管理できますが、アプリケーションの`config/scout.php`設定ファイルで直接インデックス設定の望ましい状態を管理する方が効率的な場合もあります。

このアプローチにより、アプリケーションの自動デプロイパイプラインを通じて、これらの設定をデプロイできるようになります。手作業による設定を回避し、複数の環境間での一貫性を確保できます。フィルタリング可能な属性、ランキング、ファセット、もしくは[サポート済みのその他の設定](https://www.algolia.com/doc/rest-api/search/#tag/Indices/operation/setSettings)を設定可能です。

これを始めるには、アプリケーションの`config/scout.php`設定ファイルへ各インデックスの設定を追加します。

```php
use App\Models\User;
use App\Models\Flight;

'algolia' => [
    'id' => env('ALGOLIA_APP_ID', ''),
    'secret' => env('ALGOLIA_SECRET', ''),
    'index-settings' => [
        User::class => [
            'searchableAttributes' => ['id', 'name', 'email'],
            'attributesForFaceting'=> ['filterOnly(email)'],
            // その他の設定項目…
        ],
        Flight::class => [
            'searchableAttributes'=> ['id', 'destination'],
        ],
    ],
],
```

指定するインデックスの元となるモデルが、ソフトデリート可能で、`index-settings`配列に含まれている場合、Scoutはそのインデックスのソフトデリート済みモデルに対するファセットを自動的にサポートします。ソフトデリート可能なモデルインデックスに対し定義するファセット属性が他にない場合は、そのモデルに対して`index-settings`配列に空のエントリを追加するだけです。

```php
'index-settings' => [
    Flight::class => []
],
```

アプリケーションのインデックス設定を行った後は、`scout:sync-index-settings` Artisanコマンドを起動する必要があります。このコマンドは現在設定しているインデックス設定をAlgoliaへ通知します。このコマンドをデプロイプロセスの一部とすると便利でしょう。

```shell
php artisan scout:sync-index-settings
```

<a name="algolia-identifying-users"></a>
#### ユーザーの識別

Scoutは、Algoliaを使用している場合、ユーザーを自動識別できます。認証済みユーザーを検索操作に関連付けることは、Algoliaのダッシュボード内で検索分析を表示する際に役立ちます。アプリケーションの`.env`ファイルで、`SCOUT_IDENTIFY`環境変数を`true`として定義することで、ユーザー識別を有効にできます。

```ini
SCOUT_IDENTIFY=true
```

この機能を有効にすると、リクエストのIPアドレスと認証済みユーザーの主要な識別子もAlgoliaに渡されるため、このデータはユーザーが行うすべての検索リクエストに関連付けられます。

<a name="meilisearch-configuration"></a>
### Meilisearch

<a name="meilisearch-index-settings"></a>
#### インデックス設定

Meilisearchでは、フィルタリング可能な属性、ソート可能な属性、および[その他のサポートされている設定フィールド](https://docs.meilisearch.com/reference/api/settings.html)などのインデックス検索設定をあらかじめ定義しておく必要があります。

フィルタリング可能な属性とは、Scoutの`where`メソッドを呼び出す際にフィルタリングする予定の属性であり、ソート可能な属性とは、Scoutの`orderBy`メソッドを呼び出す際にソートする予定の属性のことです。インデックスの設定を行うには、アプリケーションの`scout`設定ファイルにある、`meilisearch`設定項目の`index-settings`部分を調整します。

```php
use App\Models\User;
use App\Models\Flight;

'meilisearch' => [
    'host' => env('MEILISEARCH_HOST', 'http://localhost:7700'),
    'key' => env('MEILISEARCH_KEY', null),
    'index-settings' => [
        User::class => [
            'filterableAttributes'=> ['id', 'name', 'email'],
            'sortableAttributes' => ['created_at'],
            // その他の設定項目…
        ],
        Flight::class => [
            'filterableAttributes'=> ['id', 'destination'],
            'sortableAttributes' => ['updated_at'],
        ],
    ],
],
```

インデックスの基盤となるモデルがソフトデリート可能で、かつ`index-settings`配列に含まれていれば、Scoutは自動的にそのインデックスのソフトデリートモデルに対するフィルタリングをサポートします。もし、ソフトデリート可能なモデルのインデックスに対して定義すべきフィルタリングやソート可能な属性がなければ、そのモデルに対し、`index-settings`配列へ空のエントリを追加するだけでよいでしょう。

```php
'index-settings' => [
    Flight::class => []
],
```

アプリケーションのインデックス設定後に、`scout:sync-index-settings` Artisanコマンドを呼び出す必要があります。このコマンドは、現在設定しているインデックス設定をMeilisearchに通知します。このコマンドをデプロイプロセスの一部とすると便利です。

```shell
php artisan scout:sync-index-settings
```

<a name="meilisearch-data-types"></a>
#### Searchableデータタイプ

Meilisearchは、正しい型のデータに対してのみフィルタ操作（`>`、`<`など）を実行します。Searchableデータをカスタマイズする際は、数値が正しい型にキャストされていることを確認してください。

```php
public function toSearchableArray()
{
    return [
        'id' => (int) $this->id,
        'name' => $this->name,
        'price' => (float) $this->price,
    ];
}
```

<a name="typesense-configuration"></a>
### Typesense

<a name="typesense-searchable-data"></a>
#### Searchableデータの準備

Typesenseを使用する場合、Searchableモデルは、モデルの主キーを文字列に、作成日をUNIXタイムスタンプにキャストする`toSearchableArray`メソッドを定義する必要があります。

```php
/**
 * モデルのインデックス可能なデータ配列の取得
 *
 * @return array<string, mixed>
 */
public function toSearchableArray(): array
{
    return array_merge($this->toArray(),[
        'id' => (string) $this->id,
        'created_at' => $this->created_at->timestamp,
    ]);
}
```

また、アプリケーションの`config/scout.php`ファイルで、Typesenseコレクションスキーマを定義する必要もあります。コレクションスキーマは、Typesenseを介して検索可能な各フィールドのデータ型を記述します。利用可能なすべてのスキーマオプションの詳細については、[Typesenseドキュメント](https://typesense.org/docs/latest/api/collections.html#schema-parameters)を参照してください。

定義した後にTypesenseコレクションのスキーマを変更する必要がある場合は、`scout:flush`と`scout:import`を実行して既存のすべてのインデックス付きデータを削除し、スキーマを再作成できます。または、TypesenseのAPIを使用して、インデックス付きデータを削除せずにコレクションのスキーマを変更することもできます。

Searchableモデルがソフトデリート可能な場合は、アプリケーションの`config/scout.php`設定ファイル内のモデルに対応するTypesenseスキーマに`__soft_deleted`フィールドを定義する必要があります。

```php
User::class => [
    'collection-schema' => [
        'fields' => [
            // ...
            [
                'name' => '__soft_deleted',
                'type' => 'int32',
                'optional' => true,
            ],
        ],
    ],
],
```

<a name="typesense-dynamic-search-parameters"></a>
#### 動的検索パラメータ

Typesenseでは、`options`メソッドを使用して検索操作を実行する際に、[検索パラメータ](https://typesense.org/docs/latest/api/search.html#search-parameters)を動的に変更できます。

```php
use App\Models\Todo;

Todo::search('Groceries')->options([
    'query_by' => 'title, description'
])->get();
```

<a name="indexing"></a>
## サードパーティエンジンインデックス

> [!NOTE]
> このセクションで説明するインデックス機能は、主にサードパーティエンジン（Algolia、Meilisearch、またはTypesense）を使用する場合に関連します。データベースエンジンはデータベーステーブルを直接検索するため、手作業でのインデックス管理は不要です。

<a name="batch-import"></a>
### バッチ取り込み

Scoutを既存のプロジェクトにインストールする場合は、インデックスへインポートする必要のあるデータベースレコードがすでに存在している可能性があります。Scoutは、既存のすべてのレコードを検索インデックスにインポートするために使用できる`scout:import` Artisanコマンドを提供しています。

```shell
php artisan scout:import "App\Models\Post"
```

`scout:queue-import`コマンドは[キュー投入ジョブ](/docs/{{version}}/queues)を使用して既存レコードを全てインポートするために使用します。

```shell
php artisan scout:queue-import "App\Models\Post" --chunk=500
```

`flush`コマンドは、検索インデックスからモデルの全レコードを削除するために使用します。

```shell
php artisan scout:flush "App\Models\Post"
```

<a name="modifying-the-import-query"></a>
#### インポートクエリの変更

バッチインポートで全モデルを取得するために使用されるクエリを変更する場合は、モデルに`makeAllSearchableUsing`メソッドを定義してください。これはモデルをインポートする前に、必要になる可能性のあるイエガーリレーションの読み込みを追加するのに最適な場所です。

```php
use Illuminate\Database\Eloquent\Builder;

/**
 * 全モデルを検索可能にするときの、モデル取得に使用するクエリを変更
 */
protected function makeAllSearchableUsing(Builder $query): Builder
{
    return $query->with('author');
}
```

> [!WARNING]
> キューを使用してモデルを一括インポートする場合、`makeAllSearchableUsing`メソッドは適さないでしょう。モデルコレクションをジョブで処理する際に、リレーションが[復元されない](/docs/{{バージョン}}/queues#handling-relationships)からです。

<a name="adding-records"></a>
### レコード追加

モデルに`Laravel\Scout\Searchable`トレイトを追加したら、モデルインスタンスを`保存`または`作成`するだけで、検索インデックスに自動的に追加されます。[キューを使用](#queueing)するようにScoutを設定した場合、この操作はキューワーカによってバックグラウンドで実行されます。

```php
use App\Models\Order;

$order = new Order;

// ...

$order->save();
```

<a name="adding-records-via-query"></a>
#### クエリによるレコード追加

Eloquentクエリを介してモデルのコレクションを検索インデックスに追加する場合は、`searchable`メソッドをEloquentクエリにチェーンできます。`searchable`メソッドはクエリの[結果をチャンク](/docs/{{version}}/eloquent#chunking-results)し、レコードを検索インデックスに追加します。繰り返しますが、キューを使用するようにScoutを設定した場合、すべてのチャンクはキューワーカによってバックグラウンドでインポートされます。

```php
use App\Models\Order;

Order::where('price', '>', 100)->searchable();
```

Eloquentリレーションインスタンスで `searchable`メソッドを呼び出すこともできます。

```php
$user->orders()->searchable();
```

または、メモリ内にEloquentモデルのコレクションが既にある場合は、コレクションインスタンスで`searchable`メソッドを呼び出して、モデルインスタンスを対応するインデックスに追加できます。

```php
$orders->searchable();
```

> [!NOTE]
> `searchable`メソッドは、「アップサート（upsert）」操作と考えるられます。つまり、モデルレコードがすでにインデックスに含まれている場合は、更新され、検索インデックスに存在しない場合は追加されます。

<a name="updating-records"></a>
### レコード更新

検索可能モデルを更新するには、モデルインスタンスのプロパティを更新し、`save`でモデルをデータベースへ保存します。Scoutは自動的に変更を検索インデックスへ保存します。

```php
use App\Models\Order;

$order = Order::find(1);

// 注文の更新処理…

$order->save();
```

Eloquentクエリインスタンスで`searchable`メソッドを呼び出して、モデルのコレクションを更新することもできます。モデルが検索インデックスに存在しない場合は作成されます。

```php
Order::where('price', '>', 100)->searchable();
```

リレーションシップ内のすべてのモデルの検索インデックスレコードを更新する場合は、リレーションシップインスタンスで`searchable`を呼び出すことができます。

```php
$user->orders()->searchable();
```

または、メモリ内にEloquentモデルのコレクションが既にある場合は、コレクションインスタンスで`searchable`メソッドを呼び出して、対応するインデックスのモデルインスタンスを更新できます。

```php
$orders->searchable();
```

<a name="modifying-records-before-importing"></a>
#### インポート前のレコードの変更

時には検索可能にする前に、モデルのコレクションを準備する必要が起きる場合があります。例えば、関連するデータを効率よく検索インデックスに追加するため、リレーションをEagerロードしたいと思うでしょう。これを実現するには、対応するモデル上に、`makeSearchableUsing`メソッドを定義します：

```php
use Illuminate\Database\Eloquent\Collection;

/**
 * 検索可能なモデルのコレクションを変更する
 */
public function makeSearchableUsing(Collection $models): Collection
{
    return $models->load('author');
}
```

<a name="conditionally-updating-the-search-index"></a>
#### 検索インデックスの条件付き更新

Scoutはデフォルトで、どの属性が変更されたかに関わらず、更新されたモデルを再インデックスします。この動作をカスタマイズしたい場合は、モデルに`searchIndexShouldBeUpdated`メソッドを定義してください。

```php
/**
 * 検索インデックスを更新すべきか判断
 */
public function searchIndexShouldBeUpdated(): bool
{
    return $this->wasRecentlyCreated || $this->wasChanged(['title', 'body']);
}
```

<a name="removing-records"></a>
### レコード削除

インデックスからレコードを削除するには、データベースからモデルを`delete`するだけです。これは、[ソフトデリート](/docs/{{version}}/eloquent#soft-deleting)モデルを使用している場合でも実行できます。

```php
use App\Models\Order;

$order = Order::find(1);

$order->delete();
```

レコードを削除する前にモデルを取得したくない場合は、Eloquentクエリインスタンスで`unsearchable`メソッドを使用できます。

```php
Order::where('price', '>', 100)->unsearchable();
```

リレーション内のすべてのモデルの検索インデックスレコードを削除する場合は、リレーションインスタンスで`unsearchable`を呼び出してください。

```php
$user->orders()->unsearchable();
```

または、メモリ内にEloquentモデルのコレクションが既にある場合は、コレクションインスタンスで`unsearchable`メソッドを呼び出して、対応するインデックスからモデルインスタンスを削除できます。

```php
$orders->unsearchable();
```

すべてのモデルレコードを対応するインデックスから削除するには、`removeAllFromSearch`メソッドを呼び出します。

```php
Order::removeAllFromSearch();
```

<a name="pausing-indexing"></a>
### インデックスの一時停止

モデルデータを検索インデックスに同期せずに、モデルに対してEloquent操作のバッチを実行する必要がある場合があります。これは、`withoutSyncingToSearch`メソッドを使用して行うことができます。このメソッドは、すぐに実行される単一のクロージャを引数に取ります。クロージャ内で発行するモデル操作は、モデルのインデックスに同期されません。

```php
use App\Models\Order;

Order::withoutSyncingToSearch(function () {
    // モデルアクションを実行…
});
```

<a name="conditionally-searchable-model-instances"></a>
### 条件付き検索可能モデルインスタンス

特定の条件下でのみ、モデルを検索可能にする必要がある場合も起きるでしょう。たとえば、`App\Models\Post`モデルが、"draft"か"published"の２つのうち、どちらか１つの状態を取ると想像してください。「公開済み:published」のポストのみ検索可能にする必要があります。これを実現するには、モデルに`shouldBeSearchable`メソッドを定義してください。

```php
/**
 * モデルを検索可能にするかの判断
 */
public function shouldBeSearchable(): bool
{
    return $this->isPublished();
}
```

`shouldBeSearchable`メソッドは、`save`および`create`メソッド、クエリ、またはリレーションを通してモデルを操作する場合にのみ適用されます。`searchable`メソッドを使用してモデルまたはコレクションを直接検索可能にすると、`shouldBeSearchable`メソッドの結果が上書きされます。

> [!WARNING]
> 検索可能なデータは常にデータベースへ保存されるため、`shouldBeSearchable`メソッドはScoutの「データベース」エンジンを使用する際には適用されません。データベースエンジン使用時に同様の動作をさせるには、代わりに[WHERE句](#where-clauses)を使用する必要があります。

<a name="searching"></a>
## 検索

`search`メソッドにより、モデルの検索を開始しましょう。`search`メソッドはモデルを検索するために使用する文字列だけを引数に指定します。`get`メソッドを検索クエリにチェーンし、指定した検索クエリに一致するEloquentモデルを取得できます。

```php
use App\Models\Order;

$orders = Order::search('Star Trek')->get();
```

Scoutの検索ではEloquentモデルのコレクションが返されるため、ルートやコントローラから直接結果を返せば、自動的にJSONへ変換されます。

```php
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/search', function (Request $request) {
    return Order::search($request->search)->get();
});
```

Eloquentモデルへ変換する前に素の検索結果を取得したい場合は、`raw`メソッドを使用できます。

```php
$orders = Order::search('Star Trek')->raw();
```

<a name="custom-indexes"></a>
#### カスタムインデックス

サードパーティエンジンを使用して検索する場合、検索クエリは通常、モデルの[searchableAs](#configuring-model-indexes)メソッドで指定するインデックスに対して実行されます。ただし、`within`メソッドを使用して、代わりに検索する必要があるカスタムインデックスを指定できます。

```php
$orders = Order::search('Star Trek')
    ->within('tv_shows_popularity_desc')
    ->get();
```

<a name="where-clauses"></a>
### Where節

Scoutでは、検索クエリに「where」節を追加できます。例えば、基本的な一致チェックは、オーナーIDで検索クエリのスコープを絞り込むのに便利です。

```php
use App\Models\Order;

$orders = Order::search('Star Trek')->where('user_id', 1)->get();
```

さらに、より高度なクエリを構築するために、`=`、`!=`、`<`、`>`、`>=`、`<=`の比較オペレータも使用できます。

```php
Order::search('Star Trek')
  ->where('status', '=', 'completed')
  ->where('is_refunded', '!=', true)
  ->where('total_price', '>', 100)
  ->where('shipping_cost', '<', 20)
  ->where('discount_percent', '>=', 10)
  ->where('item_count', '<=', 5)
  ->get();
```

さらに、`whereIn`メソッドを使うと、指定カラムの値が指定した配列内に含まれていることを確認できます。

```php
$orders = Order::search('Star Trek')->whereIn(
    'status', ['open', 'paid']
)->get();
```

`whereNotIn`メソッドは、指定カラムの値が指定した配列に含まれないことを確認します。

```php
$orders = Order::search('Star Trek')->whereNotIn(
    'status', ['closed']
)->get();
```

> [!WARNING]
> アプリケーションでMeilisearchを使用している場合、Scoutの"where"句を利用する前に、アプリケーションの[filterable属性](#meilisearch-index-settings)を設定する必要があります。

<a name="customizing-the-eloquent-results-query"></a>
#### Eloquent結果クエリのカスタマイズ

Scoutがアプリケーションの検索エンジンから一致するEloquentモデルのリストを取得した後、Eloquentを使用して主キーによりすべての一致するモデルを取得します。`query`メソッドを呼び出すことで、このクエリをカスタマイズできます。`query`メソッドは、Eloquentクエリビルダインスタンスを引数にするクロージャを引数に取ります。

```php
use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;

$orders = Order::search('Star Trek')
    ->query(fn (Builder $query) => $query->with('invoices'))
    ->get();
```

サードパーティエンジンを使用する場合、このコールバックは関連するモデルが検索エンジンからすでに取得された後に呼び出されるため、結果の「フィルタリング」には使用しないでください。代わりに[Scoutのwhere句](#where-clauses)を使用してください。ただし、データベースエンジンを使用する場合、`query`メソッドの制約はデータベースクエリに直接適用されるため、フィルタリングにも使用できます。

<a name="pagination"></a>
### ペジネーション

モデルのコレクションを取得することに加えて、`paginate`メソッドを使用して検索結果をページ分割することができます。このメソッドは、[従来のEloquentクエリをペジネーションする](/docs/{{version}}/pagination)場合と同じように、`Illuminate\Pagination\LengthAwarePaginator`インスタンスを返します。

```php
use App\Models\Order;

$orders = Order::search('Star Trek')->paginate();
```

`paginate`メソッドの第１引数として、各ページごとに取得したいモデル数を指定します。

```php
$orders = Order::search('Star Trek')->paginate(15);
```

データベースエンジンを使用する場合、`simplePaginate`メソッドも使用できます。ページ番号を表示するために一致するレコードの総数を取得する`paginate`とは異なり、`simplePaginate`は現在のページ以降にさらに結果があるかどうかのみを判断します。これにより、「前へ」と「次へ」のリンクのみが必要な大規模なデータセットに対してより効率的になります。

```php
$orders = Order::search('Star Trek')->simplePaginate(15);
```

結果が取得できたら、通常のEloquentクエリのペジネーションと同様に、結果を表示し、[Blade](/docs/{{version}}/blade)を使用してページリンクをレンダできます。

```html
<div class="container">
    @foreach ($orders as $order)
        {{ $order->price }}
    @endforeach
</div>

{{ $orders->links() }}
```

もちろん、ペジネーションの結果をJSONとして取得したい場合は、ルートまたはコントローラから直接ペジネータインスタンスを返すことができます。

```php
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/orders', function (Request $request) {
    return Order::search($request->input('query'))->paginate(15);
});
```

> [!WARNING]
> 検索エンジンはEloquentモデルのグローバルスコープ定義を認識しないため、Scoutのペジネーションを利用するアプリケーションではグローバルスコープを使うべきでありません。それでも、Scoutにより検索する場合は、グローバルスコープの制約を再作成する必要があります。

<a name="soft-deleting"></a>
### ソフトデリート

インデックス付きのモデルが[ソフトデリート](/docs/{{version}}/eloquent#soft-deleting)され、ソフトデリート済みのモデルをサーチする必要がある場合、`config/scout.php`設定ファイルの`soft_delete`オプションを`true`に設定してください。

```php
'soft_delete' => true,
```

この設定オプションを`true`にすると、Scoutは検索インデックスからソフトデリートされたモデルを削除しません。代わりに、インデックスされたレコードへ、隠し`__soft_deleted`属性をセットします。これにより、検索時にソフトデリート済みレコードを取得するために、`withTrashed`や`onlyTrashed`メソッドがつかえます。

```php
use App\Models\Order;

// 結果の取得時に、削除済みレコードも含める
$orders = Order::search('Star Trek')->withTrashed()->get();

// 結果の取得時に、削除済みレコードのみを対象とする
$orders = Order::search('Star Trek')->onlyTrashed()->get();
```

> [!NOTE]
> ソフトデリートされたモデルが、`forceDelete`により完全に削除されると、Scoutは自動的に検索インデックスから削除します。

<a name="customizing-engine-searches"></a>
### エンジンの検索のカスタマイズ

エンジンの検索動作の高度なカスタマイズを実行する必要がある場合は、 `search`メソッドの２番目の引数にクロージャを渡せます。たとえば、このコールバックを使用して、検索クエリがAlgoliaに渡される前に、地理的位置データを検索オプションに追加できます。

```php
use Algolia\AlgoliaSearch\SearchIndex;
use App\Models\Order;

Order::search(
    'Star Trek',
    function (SearchIndex $algolia, string $query, array $options) {
        $options['body']['query']['bool']['filter']['geo_distance'] = [
            'distance' => '1000km',
            'location' => ['lat' => 36, 'lon' => 111],
        ];

        return $algolia->search($query, $options);
    }
)->get();
```

<a name="custom-engines"></a>
## カスタムエンジン

<a name="writing-the-engine"></a>
#### エンジンのプログラミング

組み込みのScout検索エンジンがニーズに合わない場合、独自のカスタムエンジンを書き、Scoutへ登録してください。エンジンは、`Laravel\Scout\Engines\Engine`抽象クラスを拡張してください。この抽象クラスは、カスタムエンジンが実装する必要のある、８つのメソッドを持っています。

```php
use Laravel\Scout\Builder;

abstract public function update($models);
abstract public function delete($models);
abstract public function search(Builder $builder);
abstract public function paginate(Builder $builder, $perPage, $page);
abstract public function mapIds($results);
abstract public function map(Builder $builder, $results, $model);
abstract public function getTotalCount($results);
abstract public function flush($model);
```

これらのメソッドの実装をレビューするために、`Laravel\Scout\Engines\AlgoliaEngine`クラスが役に立つでしょう。このクラスは独自エンジンで、各メソッドをどのように実装すればよいかの、良い取り掛かりになるでしょう。

<a name="registering-the-engine"></a>
#### エンジンの登録

カスタムエンジンを作成したら、Scoutエンジンマネージャの`extend`メソッドを使用してScoutへ登録します。Scoutのエンジンマネージャは、Laravelサービスコンテナが依存解決できます。`App\Providers\AppServiceProvider`クラスの`boot`メソッドまたはアプリケーションが使用している他のサービスプロバイダから`extend`メソッドを呼び出せます。

```php
use App\ScoutExtensions\MySqlSearchEngine;
use Laravel\Scout\EngineManager;

/**
 * 全アプリケーションサービスの初期起動処理
 */
public function boot(): void
{
    resolve(EngineManager::class)->extend('mysql', function () {
        return new MySqlSearchEngine;
    });
}
```

エンジンを登録したら、アプリケーションの`config/scout.php`設定ファイルでデフォルトのスカウト`driver`として指定できます。

```php
'driver' => 'mysql',
```
