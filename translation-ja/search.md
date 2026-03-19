# 検索

- [イントロダクション](#introduction)
    - [全文検索](#introduction-full-text-search)
    - [セマンティック／ベクトル検索](#introduction-semantic-vector-search)
    - [リランキング](#introduction-reranking)
    - [Scout検索エンジン](#introduction-scout-search-engines)
- [全文検索](#full-text-search)
    - [全文インデックスの追加](#adding-full-text-indexes)
    - [全文クエリの実行](#running-full-text-queries)
- [セマンティック／ベクトル検索](#semantic-vector-search)
    - [エンベディングの生成](#generating-embeddings)
    - [ベクトルの保存とインデックス作成](#storing-and-indexing-vectors)
    - [類似性によるクエリ](#querying-by-similarity)
- [結果のリランキング](#reranking-results)
- [Laravel Scout](#laravel-scout)
    - [データベースエンジン](#database-engine)
    - [サードパーティエンジン](#third-party-engines)
- [テクニックの組み合わせ](#combining-techniques)

<a name="introduction"></a>
## イントロダクション

ほぼすべてのアプリケーションで検索が必要になります。ユーザーが関連する記事をナレッジベースで検索する場合でも、製品カタログを探索する場合でも、ドキュメントのコーパスに対して自然言語で質問する場合でも、Laravelはこれらの各シナリオを処理するための組み込みツールを提供しており、多くの場合、外部サービスを必要としません。

ほとんどのアプリケーションでは、Laravelが提供する組み込みのデータベース駆動型オプションで十分であることがわかります。外部の検索サービスが必要になるのは、タイポ許容、ファセットフィルタリング、または大規模な地理検索などの機能が必要な場合のみです。

<a name="introduction-full-text-search"></a>
#### 全文検索

キーワードの関連性ランキング（データベースが検索語といかに一致するかに基づいて結果をスコアリングしソートする機能）が必要な場合、Laravelの`whereFullText`クエリビルダメソッドで、MariaDB、MySQL、PostgreSQLのネイティブな全文インデックスを活用できます。全文検索は単語の境界や語幹（ステミング）を理解するため、"running"の検索で"run"を含むレコードに一致させることができます。外部サービスは不要です。

<a name="introduction-semantic-vector-search"></a>
#### セマンティック／ベクトル検索

正確なキーワードではなく、*意味*によって結果を一致させるAI駆動のセマンティック検索の場合、`whereVectorSimilarTo`クエリビルダメソッドが、`pgvector`拡張機能を使用してPostgreSQLに保存したベクトル埋め込みを使用します。たとえば、「best wineries in Napa Valley（ナパバレーの最高のワイナリー）」を検索すると、単語が重なっていなくても「Top Vineyards to Visit（訪れるべきトップブドウ園）」というタイトルの記事を表示できます。ベクトル検索には、`pgvector`拡張機能を含むPostgreSQLと[Laravel AI SDK](/docs/{{version}}/ai-sdk)が必要です。

<a name="introduction-reranking"></a>
#### リランキング

Laravelの[AI SDK](/docs/{{version}}/ai-sdk)は、AIモデルを使用して、クエリに対するセマンティックな関連性によって結果セットを並べ替えるリランキング機能を提供します。リランキングは、全文検索のような高速な初期取得ステップの後の第２段階として特に強力であり、スピードとセマンティックな精度の両方を提供します。

<a name="introduction-scout-search-engines"></a>
#### Laravel Scout検索

検索インデックスを自動的にEloquentモデルと同期させる`Searchable`トレイトを必要とするアプリケーションのために、[Laravel Scout](/docs/{{version}}/scout)は組み込みのデータベースエンジンと、Algolia、Meilisearch、Typesenseなどのサードパーティサービス用のドライバの両方を提供しています。

<a name="full-text-search"></a>
## 全文検索

`LIKE`クエリは単純な部分一致には適していますが、言語を理解しません。`LIKE`による「running」の検索では「run」を含むレコードは見つかりません。また、結果は関連性でランク付けされず、単にデータベースが見つけた順に返されます。全文検索は、単語の境界、語幹、関連性スコアリングを理解する専用のインデックスを使用することで、これら両方の問題を解決し、データベースが最も関連性の高い結果を最初に返せるようにします。

高速な全文検索はMariaDB、MySQL、PostgreSQLに組み込まれており、外部の検索サービスは不要です。検索したい列に全文インデックスを追加し、それらに対して`whereFullText`クエリビルダメソッドを使用して検索するだけです。

> [!WARNING]
> 全文検索は現在、MariaDB、MySQL、PostgreSQLでサポートされています。

<a name="adding-full-text-indexes"></a>
### 全文インデックスの追加

全文検索を使用するには、まず検索したい列に全文インデックスを追加します。単一の列にインデックスを追加することも、列の配列を渡して複数のフィールドを一度に検索する複合インデックスを作成することもできます。

```php
Schema::create('articles', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('body');
    $table->timestamps();

    $table->fullText(['title', 'body']);
});
```

PostgreSQLでは、インデックスに言語設定を指定でき、これにより単語の語幹処理方法を制御できます。

```php
$table->fullText('body')->language('english');
```

インデックス作成の詳細については、[マイグレーションドキュメント](/docs/{{version}}/migrations#available-index-types)を参照してください。

<a name="running-full-text-queries"></a>
### 全文クエリの実行

インデックスを作成したら、`whereFullText`クエリビルダメソッドを使用して検索を行います。Laravelはデータベースドライバに応じた適切なSQLを生成します。たとえば、MariaDBとMySQLでは`MATCH(...) AGAINST(...)`、PostgreSQLでは`to_tsvector(...) @@ plainto_tsquery(...)`となります。

```php
$articles = Article::whereFullText('body', 'web developer')->get();
```

MariaDBとMySQLを使用する場合、結果は自動的に関連性スコア順に並べ替えられます。PostgreSQLでは、`whereFullText`は一致するレコードをフィルタリングしますが、関連性によるソートは行いません。PostgreSQLで自動的な関連性ソートが必要な場合は、これを自動で処理する[Scoutのデータベースエンジン](#database-engine)の使用を検討してください。

複数の列にまたがる複合全文インデックスを作成した場合は、`whereFullText`に同じ列の配列を渡すことで、それらすべてに対して検索できます。

```php
$articles = Article::whereFullText(
    ['title', 'body'], 'web developer'
)->get();
```

`orWhereFullText`メソッドを使用して、全文検索句を「or」条件として追加できます。詳細は、[クエリビルダドキュメント](/docs/{{version}}/queries#full-text-where-clauses)を参照してください。

<a name="semantic-vector-search"></a>
## セマンティック／ベクトル検索

全文検索はキーワードの一致に依存しており、クエリ内の単語がデータ内に（何らかの形で）存在する必要があります。セマンティック検索は根本的に異なるアプローチを取ります。AIが生成したベクトル埋め込みを使用してテキストの「意味」を数値の配列として表現し、その意味がクエリに最も近い結果を見つけます。たとえば、「best wineries in Napa Valley」を検索すると、単語がまったく重なっていなくても「Top Vineyards to Visit」というタイトルの記事を表示できます。

ベクトル検索の基本的なワークフローは、コンテンツの各断片に対してエンベディング（数値配列）を生成してデータと共に保存し、検索時にユーザーのクエリに対してエンベディングを生成し、ベクトル空間でそれに最も近い保存済みエンベディングを見つけることです。

> [!NOTE]
> ベクトル検索には、`pgvector`拡張機能を含むPostgreSQLデータベースと[Laravel AI SDK](/docs/{{version}}/ai-sdk)が必要です。[Laravel Cloud](https://cloud.laravel.com) Serverless Postgresデータベース全てには、あらかじめ`pgvector`を用意済みです。

<a name="generating-embeddings"></a>
### エンベディングの生成

エンベディングとは、テキストのセマンティックな意味を表す高次元の数値配列（通常は数百または数千の数値）です。Laravelの`Stringable`クラスで利用可能な`toEmbeddings`メソッドを使用して、文字列のエンベディングを生成できます。

```php
use Illuminate\Support\Str;

$embedding = Str::of('Napa Valley has great wine.')->toEmbeddings();
```

複数の入力に対して一度にエンベディングを生成する場合（エンベディングプロバイダへのAPI呼び出しが１回で済むため、１つずつ生成するよりも効率的です）、`Embeddings`クラスを使用します。

```php
use Laravel\Ai\Embeddings;

$response = Embeddings::for([
    'Napa Valley has great wine.',
    'Laravel is a PHP framework.',
])->generate();

$response->embeddings; // [[0.123, 0.456, ...], [0.789, 0.012, ...]]
```

エンベディングプロバイダの設定、次元のカスタマイズ、およびキャッシュの詳細については、[AI SDKドキュメント](/docs/{{version}}/ai-sdk#embeddings)を参照してください。

<a name="storing-and-indexing-vectors"></a>
### ベクトルの保存とインデックス作成

ベクトル埋め込みを保存するには、マイグレーションで`vector`列を定義し、エンベディングプロバイダの出力と一致する次元数を指定します（たとえば、OpenAIの`text-embedding-3-small`モデルの場合は1536）。また、その列で`index`を呼び出してHNSW（Hierarchical Navigable Small World）インデックスを作成する必要があります。これにより、大規模なデータセットでの類似性検索が劇的に高速化されます。

```php
Schema::ensureVectorExtensionExists();

Schema::create('documents', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('content');
    $table->vector('embedding', dimensions: 1536)->index();
    $table->timestamps();
});
```

`Schema::ensureVectorExtensionExists`メソッドは、テーブルを作成する前にPostgreSQLデータベースで`pgvector`拡張機能が有効になっていることを確実にします。

Eloquentモデルでは、LaravelがPHP配列とデータベースのベクトル形式の間の変換を自動的に処理するように、ベクトル列を`array`にキャストしてください。

```php
protected function casts(): array
{
    return [
        'embedding' => 'array',
    ];
}
```

ベクトル列とインデックスの詳細については、[マイグレーションドキュメント](/docs/{{version}}/migrations#available-column-types)を参照してください。

<a name="querying-by-similarity"></a>
### 類似性によるクエリ

コンテンツのエンベディングを保存したら、`whereVectorSimilarTo`メソッドを使用して類似したレコードを検索できます。このメソッドは、コサイン類似度を使用して指定したエンベディングと保存済みのベクトルを比較し、`minSimilarity`しきい値未満の結果をフィルタリングし、最も類似したレコードを先頭にして自動的に結果を関連性順に並べ替えます。しきい値は`0.0`から`1.0`の間の値にする必要があり、`1.0`はベクトルが同一であることを意味します。

```php
$documents = Document::query()
    ->whereVectorSimilarTo('embedding', $queryEmbedding, minSimilarity: 0.4)
    ->limit(10)
    ->get();
```

便利な機能として、エンベディング配列の代わりに普通の文字列を与えた場合、Laravelは設定されたエンベディングプロバイダを使用して自動的にエンベディングを生成します。つまり、ユーザーが検索クエリを手作業でエンベディングへ変換しなくとも、直接渡すことができます。

```php
$documents = Document::query()
    ->whereVectorSimilarTo('embedding', 'best wineries in Napa Valley')
    ->limit(10)
    ->get();
```

ベクトルクエリをより低レベルで制御するために、`whereVectorDistanceLessThan`、`selectVectorDistance`、`orderByVectorDistance`メソッドも利用可能です。これらのメソッドを使用すると、類似性スコアではなく距離値を直接操作したり、計算された距離を結果の列として選択したり、順序を手作業で制御したりできます。詳細は、[クエリビルダドキュメント](/docs/{{version}}/queries#vector-similarity-clauses)および[AI SDKドキュメント](/docs/{{version}}/ai-sdk#querying-embeddings)を参照してください。

<a name="reranking-results"></a>
## 結果のリランキング

リランキングとは、AIモデルを使用して、各結果が特定のクエリにいかにセマンティックに関連しているかによって結果セットを並べ替える手法です。エンベディングを事前計算して保存しておく必要があるベクトル検索とは異なり、リランキングは任意のテキストコレクションに対して機能します。生のコンテンツとクエリを入力として受け取り、関連性でソートされたアイテムを返します。

リランキングは、高速な初期取得ステップの後の第２段階として特に強力です。たとえば、全文検索を使用して数千のレコードから上位50の候補に素早く絞り込み、次にリランキングを使用して最も関連性の高い結果を一番上に配置できます。この「取得してリランキング」パターンは、スピードとセマンティックな精度の両方を提供します。

`Reranking`クラスを使用して文字列の配列をリランキングします。

```php
use Laravel\Ai\Reranking;

$response = Reranking::of([
    'Django is a Python web framework.',
    'Laravel is a PHP web application framework.',
    'React is a JavaScript library for building user interfaces.',
])->rerank('PHP frameworks');

$response->first()->document; // "Laravel is a PHP web application framework."
```

Laravelのコレクションには、フィールド名（またはクロージャ）とクエリを受け取る`rerank`マクロもあり、Eloquentの結果を簡単にリランキングできます。

```php
$articles = Article::all()
    ->rerank('body', 'Laravel tutorials');
```

リランキングプロバイダの設定と利用可能なオプションの詳細については、[AI SDKドキュメント](/docs/{{version}}/ai-sdk#reranking)を参照してください。

<a name="laravel-scout"></a>
## Laravel Scout

上記で説明した検索手法はすべて、コード内で直接呼び出すクエリビルダメソッドです。[Laravel Scout](/docs/{{version}}/scout)は異なるアプローチを取ります。Eloquentモデルに追加する`Searchable`トレイトを提供し、Scoutはレコードが作成、更新、削除されるたびに、検索インデックスを自動的に同期させます。これは、インデックスの更新を手作業で管理することなく、モデルを常に検索可能にしておきたい場合に特に便利です。

<a name="database-engine"></a>
### データベースエンジン

Scoutの組み込みデータベースエンジンは、既存のデータベースに対して全文検索および`LIKE`検索を実行します。外部サービスや追加のインフラは不要です。単にモデルに`Searchable`トレイトを追加し、検索可能にしたい列を返す`toSearchableArray`メソッドを定義するだけです。

PHP属性を使用して、各列の検索戦略を制御できます。`SearchUsingFullText`はデータベースの全文インデックスを使用し、`SearchUsingPrefix`は文字列の先頭からのみ一致させ（`example%`）、属性のない列は両側にワイルドカードを付けたデフォルトの`LIKE`戦略（`%example%`）を使用します。

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Attributes\SearchUsingFullText;
use Laravel\Scout\Attributes\SearchUsingPrefix;
use Laravel\Scout\Searchable;

class Article extends Model
{
    use Searchable;

    #[SearchUsingPrefix(['id'])]
    #[SearchUsingFullText(['title', 'body'])]
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'body' => $this->body,
        ];
    }
}
```

> [!WARNING]
> 列が全文クエリ制約を使用するように指定する前に、その列に[全文インデックス](/docs/{{version}}/migrations#available-index-types)が割り当てられていることを確認してください。

トレイトを追加したら、Scoutの`search`メソッドを使用してモデルを検索できます。Scoutのデータベースエンジンは、PostgreSQLであっても自動的に結果を関連性順に並べ替えます。

```php
$articles = Article::search('Laravel')->get();
```

データベースエンジンは、検索のニーズが中程度で、外部サービスをデプロイせずにScoutの自動インデックス同期の利便性を享受したい場合に最適です。フィルタリング、ペジネーション、ソフトデリート済みレコードの処理など、最も一般的な検索ユースケースをうまく処理します。詳細は、[Scoutドキュメント](/docs/{{version}}/scout#database-engine)を参照してください。

<a name="third-party-engines"></a>
### サードパーティエンジン

Scoutは、[Algolia](https://www.algolia.com/)、[Meilisearch](https://www.meilisearch.com)、[Typesense](https://typesense.org)などのサードパーティ検索エンジンもサポートしています。これらの専用検索サービスは、タイポ許容、ファセットフィルタリング、地理検索、カスタムランキングルールなど、非常に大規模なスケールや、高度に洗練した検索体験（search-as-you-type）が必要な場合に重要となる高度な機能を提供します。

Scoutはすべてのドライバで統一したAPIを提供しているため、後でデータベースエンジンからサードパーティエンジンに切り替える際も、最小限のコード変更で済みます。まずはデータベースエンジンから始め、アプリケーションのニーズがデータベースの提供能力を超えた場合にのみサードパーティサービスに移行できます。

サードパーティエンジンの設定に関する詳細は、[Scoutドキュメント](/docs/{{version}}/scout)を参照してください。

> [!NOTE]
> 多くのアプリケーションでは外部検索エンジンは不要です。このページで説明している組み込みの手法で、大部分のユースケースをカバーできます。

<a name="combining-techniques"></a>
## テクニックの組み合わせ

このページで説明されている検索手法は互いに排他的なものではなく、それらを組み合わせることでしばしば最良の結果が得られます。ここでは、これらのツールがいかに連携するかを示す２つの一般的なパターンを紹介します。

**全文検索取得＋リランキング**

全文検索を使用して大規模なデータセットから候補セットを素早く絞り込み、次にリランキングを適用して、それらの候補をセマンティックな関連性でソートします。これにより、データベースネイティブな全文検索のスピードと、AI駆動の関連性スコアリングの精度を両立できます。

```php
$articles = Article::query()
    ->whereFullText('body', $request->input('query'))
    ->limit(50)
    ->get()
    ->rerank('body', $request->input('query'), limit: 10);
```

**ベクトルサーチ＋トラディショナルなフィルタ**

ベクトルの類似性と標準的な`where`句を組み合わせて、セマンティック検索をレコードのサブセットに制限します。これは、意味ベースの検索を行いたいが、所有権、カテゴリ、またはその他の属性で結果を制限する必要がある場合に便利です。

```php
$documents = Document::query()
    ->where('team_id', $user->team_id)
    ->whereVectorSimilarTo('embedding', $request->input('query'))
    ->limit(10)
    ->get();
```
