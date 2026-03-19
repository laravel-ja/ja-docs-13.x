# リリースノート

- [バージョニング規約](#versioning-scheme)
- [サポートポリシー](#support-policy)
- [Laravel 13](#laravel-13)

<a name="versioning-scheme"></a>
## バージョニング規約

Laravelとファーストパーティパッケージは、[セマンティックバージョニング](https://semver.org)にしたがっています。メジャーなフレームのリリースは、毎年（第１四半期に）リリースします。マイナーとパッチリリースはより頻繁に毎週リリースします。マイナーとパッチリリースは、**決して**ブレーキングチェンジを含みません

アプリケーションやパッケージからLaravelフレームワークやそのコンポーネントを参照する場合、Laravelのメジャーリリースには互換性のない変更が含まれるため、常に`^13.0`のようなバージョン制約を使用してください。しかしながら、私たちは常に１日以内に新しいメジャーリリースへ更新できるように努めています。

<a name="named-arguments"></a>
#### 名前付き引数

[名前付き引数](https://www.php.net/manual/ja/functions.arguments.php#functions.named-arguments)は、Laravelの下位互換性ガイドラインの対象外です。Laravelコードベースを改善するために、必要に応じて関数の引数の名前を変更することもできます。したがって、Laravelメソッドを呼び出すときに名前付き引数を使用する場合は、パラメータ名が将来変更される可能性があることを理解した上で、慎重に行う必要があります。

<a name="support-policy"></a>
## サポートポリシー

Laravelのすべてのリリースは、バグフィックスは１８ヶ月、セキュリティフィックスは２年です。その他の追加ライブラリでは、最新のメジャーリリースのみでバグフィックスを受け付けています。また、[Laravelがサポートする](/docs/{{version}}/database#introduction)データベースのサポートについても確認してください。

<div class="overflow-auto">

| バージョン | PHP (*)   | リリース         | バグフィックス期日   | セキュリティ修正期日  |
| ------- |-----------| --------------- | --------------- | ---------------- |
| 10      | 8.1 - 8.3 | ２０２３年２月１４日 | ２０２４年８月６日   | ２０２５年２月４日   |
| 11      | 8.2 - 8.4 | ２０２４年３月１２日 | ２０２５年９月３日   | ２０２６年３月１２日  |
| 12      | 8.2 - 8.5 | ２０２５年２月２４日 | ２０２６年８月１３日 | ２０２７年２月２４日  |
| 13      | 8.3 - 8.5 | ２０２６年第１四半期 | ２０２７年第３四半期 | ２０２８年第１四半期  |

</div>

<div class="version-colors">
    <div class="end-of-life">
        <div class="color-box"></div>
        <div>End of life</div>
    </div>
    <div class="security-fixes">
        <div class="color-box"></div>
        <div>Security fixes only</div>
    </div>
</div>

(*) 対応PHPバージョン

<a name="laravel-13"></a>
## Laravel 13

Laravel 13は、AIネイティブのワークフロー、より強力なデフォルト設定、そしてより表現力豊かな開発者向けAPIに焦点を当て、Laravelの年次リリースサイクルを継続しています。このリリースには、ファーストパーティのAIプリミティブ、JSON:APIリソース、セマンティック／ベクトル検索機能が含まれており、キュー、キャッシュ、セキュリティにわたって段階的な改善が行われています。

<a name="minimal-breaking-changes"></a>
### 最低限のブレイキングチェンジ

このリリースサイクルでは、ブレイキングチェンジを最小限に抑えることに重点を置いてきました。その代わりに、既存のアプリケーションを壊さないようなクオリティ・オブ・ライフの改善を年間を通して継続的に行うことに専念してきました。

したがって、Laravel 13のリリースは、労力の面では比較的小規模なアップグレードでありながら、実質的な新機能を提供しています。このため、ほとんどのLaravelアプリケーションは、アプリケーションコードを大きく変更することなく、Laravel 13へアップグレードできるでしょう。

<a name="php-8"></a>
### PHP8.3

Laravel13.xは、最低でもPHP8.3のバージョンを必要とします。

<a name="ai-sdk"></a>
### Laravel AI SDK

Laravel13では、ファーストパーティの[Laravel AI SDK](https://laravel.com/ai)が導入され、テキスト生成、ツール呼び出しエージェント、埋め込み、オーディオ、画像、およびベクトルストア統合のための統一されたAPIを提供します。

AI SDKを使用すると、一貫したLaravelネイティブの開発者体験を維持しながら、プロバイダに依存しないAI機能を構築できます。

たとえば、基本的なエージェントは１回の呼び出しでプロンプトを実行できます。

```php
use App\Ai\Agents\SalesCoach;

$response = SalesCoach::make()->prompt('Analyze this sales transcript...');

return (string) $response;
```

Laravel AI SDKは、画像、オーディオ、埋め込みを生成することもできます。

画像生成のユースケースでは、このSDKは簡単な言葉のプロンプトから画像を生成するためのクリーンなAPIを提供します。

```php
use Laravel\Ai\Image;

$image = Image::of('A donut sitting on the kitchen counter')->generate();

$rawContent = (string) $image;
```

音声体験については、アシスタント、ナレーション、アクセシビリティ機能のために、テキストから自然な響きのオーディオを合成できます。

```php
use Laravel\Ai\Audio;

$audio = Audio::of('I love coding with Laravel.')->generate();

$rawContent = (string) $audio;
```

また、セマンティック検索や検索ワークフローのために、文字列から直接埋め込みを生成できます。

```php
use Illuminate\Support\Str;

$embeddings = Str::of('Napa Valley has great wine.')->toEmbeddings();
```

<a name="json-api"></a>
### JSON:APIリソース

Laravelはファーストパーティの[JSON:APIリソース](/docs/{{version}}/eloquent-resources#jsonapi-resources)を含むようになり、JSON:API仕様に準拠したレスポンスを簡単に返せるようになりました。

JSON:APIリソースは、リソースオブジェクトのシリアライズ、リレーションの含め方（inclusion）、特定のフィールドのみの取得（sparse fieldsets）、リンク、およびJSON:API準拠のレスポンスヘッダを処理します。

<a name="request-forgery-protection"></a>
### リクエストフォージェリ保護

セキュリティ面では、Laravelの[リクエストフォージェリ保護](/docs/{{version}}/csrf#preventing-csrf-requests)ミドルウェアを強化し、`PreventRequestForgery`として正式に定義しました。これにより、トークンベースのCSRF保護との互換性を保ちつつ、オリジンを認識したリクエスト検証を追加しました。

<a name="queue-routing"></a>
### キューのルート指定

Laravel 13で、`Queue::route(...)`による[クラスごとのキューのルート指定](/docs/{{version}}/queues#queue-routing)を追加しました。これにより、特定のジョブに対するデフォルトのキュー／接続のルート指定ルールを一箇所で定義できます。

```php
Queue::route(ProcessPodcast::class, connection: 'redis', queue: 'podcasts');
```

<a name="php-attributes"></a>
### PHP属性の拡張

Laravel 13では、フレームワーク全体でファーストパーティのPHP属性のサポートを引き続き拡大しており、一般的な設定や動作に関する関心をより宣言的にし、クラスやメソッドと同じ場所に配置できるようになりました。

注目すべき追加要素には、[`#[Middleware]`](/docs/{{version}}/controllers#controller-middleware)や[`#[Authorize]`](/docs/{{version}}/controllers#authorize-attribute)のようなコントローラおよび認可属性のほか、[`#[Tries]`](/docs/{{version}}/queues#max-job-attempts-and-timeout)、[`#[Backoff]`](/docs/{{version}}/queues#dealing-with-failed-jobs)、[`#[Timeout]`](/docs/{{version}}/queues#max-job-attempts-and-timeout)、[`#[FailOnTimeout]`](/docs/{{version}}/queues#failing-on-timeout)といったキュー指向のジョブ制御を含みます。

たとえば、コントローラのミドルウェアやポリシーのチェックを、クラスやメソッドに直接宣言できるようになりました。

```php
<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Routing\Attributes\Controllers\Authorize;
use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth')]
class CommentController
{
    #[Middleware('subscribed')]
    #[Authorize('create', [Comment::class, 'post'])]
    public function store(Post $post)
    {
        // ...
    }
}
```

さらに、Eloquent、イベント、通知、バリデーション、テスト、およびリソースシリアライズAPI全体でも追加の属性を導入し、フレームワークのより多くの領域で一貫した属性優先のオプションが選択できるようになりました。

<a name="cache-touch"></a>
### キャッシュTTLの延長

Laravelに[`Cache::touch(...)`](/docs/{{version}}/cache)を導入しました。これにより、既存のキャッシュアイテムの値を再取得して保存し直すことなく、そのTTLを延長できます。

<a name="semantic-search"></a>
### セマンティック／ベクトル検索

Laravel 13は、ネイティブのベクトルクエリサポート、埋め込みワークフロー、および[検索](/docs/{{version}}/search#semantic-vector-search)、[クエリ](/docs/{{version}}/queries#vector-similarity-clauses)、[AI SDK](/docs/{{version}}/ai-sdk#embeddings)のドキュメントに記載している関連APIにより、セマンティック検索の機能を強化しています。

これらの機能により、PostgreSQL+`pgvector`を使用して、文字列から直接生成した埋め込みに対する類似性検索を含む、AI駆動の検索体験を簡単に構築できます。

たとえば、クエリビルダから直接セマンティック類似性検索を実行できます。

```php
$documents = DB::table('documents')
    ->whereVectorSimilarTo('embedding', 'Best wineries in Napa Valley')
    ->limit(10)
    ->get();
```
