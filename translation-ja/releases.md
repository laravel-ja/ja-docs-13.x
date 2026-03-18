# リリースノート

- [バージョニング規約](#versioning-scheme)
- [サポートポリシー](#support-policy)
- [Laravel 13](#laravel-13)

<a name="versioning-scheme"></a>
## バージョニング規約

Laravelとファーストパーティパッケージは、[セマンティックバージョニング](https://semver.org)にしたがっています。メジャーなフレームのリリースは、毎年（第１四半期に）リリースします。マイナーとパッチリリースはより頻繁に毎週リリースします。マイナーとパッチリリースは、**決して**ブレーキングチェンジを含みません

When referencing the Laravel framework or its components from your application or package, you should always use a version constraint such as `^13.0`, since major releases of Laravel do include breaking changes. However, we strive to always ensure you may update to a new major release in one day or less.

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

Laravel 13 continues Laravel's annual release cadence with a focus on AI-native workflows, stronger defaults, and more expressive developer APIs. This release includes first-party AI primitives, JSON:API resources, semantic / vector search capabilities, and incremental improvements across queues, cache, and security.

<a name="minimal-breaking-changes"></a>
### 最低限のブレイキングチェンジ

このリリースサイクルでは、ブレイキングチェンジを最小限に抑えることに重点を置いてきました。その代わりに、既存のアプリケーションを壊さないようなクオリティ・オブ・ライフの改善を年間を通して継続的に行うことに専念してきました。

Therefore, the Laravel 13 release is a relatively minor upgrade in terms of effort, while still delivering substantial new capabilities. In light of this, most Laravel applications may upgrade to Laravel 13 without changing much application code.

<a name="php-8"></a>
### PHP 8.3

Laravel 13.x requires a minimum PHP version of 8.3.

<a name="ai-sdk"></a>
### Laravel AI SDK

Laravel 13 introduces the first-party [Laravel AI SDK](https://laravel.com/ai), providing a unified API for text generation, tool-calling agents, embeddings, audio, images, and vector-store integrations.

With the AI SDK, you can build provider-agnostic AI features while keeping a consistent, Laravel-native developer experience.

For example, a basic agent can be prompted with a single call:

```php
use App\Ai\Agents\SalesCoach;

$response = SalesCoach::make()->prompt('Analyze this sales transcript...');

return (string) $response;
```

The Laravel AI SDK can also generate images, audio, and embeddings:

For visual generation use cases, the SDK offers a clean API for creating images from plain-language prompts:

```php
use Laravel\Ai\Image;

$image = Image::of('A donut sitting on the kitchen counter')->generate();

$rawContent = (string) $image;
```

For voice experiences, you can synthesize natural-sounding audio from text for assistants, narrations, and accessibility features:

```php
use Laravel\Ai\Audio;

$audio = Audio::of('I love coding with Laravel.')->generate();

$rawContent = (string) $audio;
```

And for semantic search and retrieval workflows, you can generate embeddings directly from strings:

```php
use Illuminate\Support\Str;

$embeddings = Str::of('Napa Valley has great wine.')->toEmbeddings();
```

<a name="json-api"></a>
### JSON:API Resources

Laravel now includes first-party [JSON:API resources](/docs/{{version}}/eloquent-resources#jsonapi-resources), making it straightforward to return responses compliant with the JSON:API specification.

JSON:API resources handle resource object serialization, relationship inclusion, sparse fieldsets, links, and JSON:API-compliant response headers.

<a name="request-forgery-protection"></a>
### Request Forgery Protection

For security, Laravel's [request forgery protection](/docs/{{version}}/csrf#preventing-csrf-requests) middleware has been enhanced and formalized as `PreventRequestForgery`, adding origin-aware request verification while preserving compatibility with token-based CSRF protection.

<a name="queue-routing"></a>
### Queue Routing

Laravel 13 adds [queue routing by class](/docs/{{version}}/queues#queue-routing) via `Queue::route(...)`, allowing you to define default queue / connection routing rules for specific jobs in a central place:

```php
Queue::route(ProcessPodcast::class, connection: 'redis', queue: 'podcasts');
```

<a name="php-attributes"></a>
### Expanded PHP Attributes

Laravel 13 continues to expand first-party PHP attribute support across the framework, making common configuration and behavioral concerns more declarative and colocated with your classes and methods.

Notable additions include controller and authorization attributes like [`#[Middleware]`](/docs/{{version}}/controllers#controller-middleware) and [`#[Authorize]`](/docs/{{version}}/controllers#authorize-attribute), as well as queue-oriented job controls like [`#[Tries]`](/docs/{{version}}/queues#max-job-attempts-and-timeout), [`#[Backoff]`](/docs/{{version}}/queues#dealing-with-failed-jobs), [`#[Timeout]`](/docs/{{version}}/queues#max-job-attempts-and-timeout), and [`#[FailOnTimeout]`](/docs/{{version}}/queues#failing-on-timeout).

For example, controller middleware and policy checks can now be declared directly on classes and methods:

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

Additional attributes have also been introduced across Eloquent, events, notifications, validation, testing, and resource serialization APIs, giving you a consistent attribute-first option in more areas of the framework.

<a name="cache-touch"></a>
### Cache TTL Extension

Laravel now includes [`Cache::touch(...)`](/docs/{{version}}/cache), which lets you extend an existing cache item's TTL without retrieving and re-storing its value.

<a name="semantic-search"></a>
### Semantic / Vector Search

Laravel 13 deepens its semantic search story with native vector query support, embedding workflows, and related APIs documented across [search](/docs/{{version}}/search#semantic-vector-search), [queries](/docs/{{version}}/queries#vector-similarity-clauses), and the [AI SDK](/docs/{{version}}/ai-sdk#embeddings).

These features make it straightforward to build AI-powered search experiences using PostgreSQL + `pgvector`, including similarity search against embeddings generated directly from strings.

For example, you may run semantic similarity searches directly from the query builder:

```php
$documents = DB::table('documents')
    ->whereVectorSimilarTo('embedding', 'Best wineries in Napa Valley')
    ->limit(10)
    ->get();
```
