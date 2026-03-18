# キャッシュ

- [イントロダクション](#introduction)
- [設定](#configuration)
    - [ドライバ要件](#driver-prerequisites)
- [キャッシュ使用法](#cache-usage)
    - [キャッシュインスタンスの取得](#obtaining-a-cache-instance)
    - [キャッシュからのアイテム取得](#retrieving-items-from-the-cache)
    - [キャッシュへのアイテム保存](#storing-items-in-the-cache)
    - [Extending Item Lifetime](#extending-item-lifetime)
    - [キャッシュからのアイテム削除](#removing-items-from-the-cache)
    - [キャッシュのメモ](#cache-memoization)
    - [キャッシュヘルパ](#the-cache-helper)
- [キャッシュタグ](#cache-tags)
- [アトミックロック](#atomic-locks)
    - [ロック管理](#managing-locks)
    - [プロセス間でのロック管理](#managing-locks-across-processes)
    - [同時実行制限](#concurrency-limiting)
- [キャッシュフェイルオーバ](#cache-failover)
- [カスタムキャッシュドライバの追加](#adding-custom-cache-drivers)
    - [ドライバの作成](#writing-the-driver)
    - [ドライバの登録](#registering-the-driver)
- [イベント](#events)

<a name="introduction"></a>
## イントロダクション

アプリケーションによって実行されるデータ取得または処理タスクの一部は、ＣＰＵに負荷がかかるか、完了するまでに数秒かかる場合があります。この場合、取得したデータを一時的にキャッシュして、同じデータに対する後続のリクエストですばやく取得できるようにするのが一般的です。キャッシュするデータは通常、[Memcached](https://memcached.org)や[Redis](https://redis.io)などの非常に高速なデータストアに保存します。

幸いLaravelはさまざまなキャッシュバックエンドに表現力豊かで統一されたAPIを提供し、その超高速データ取得を利用してWebアプリケーションを高速化できるようにします。

<a name="configuration"></a>
## 設定

アプリケーションのキャッシュ設定ファイルは、`config/cache.php`にあります。アプリケーション全体でデフォルトとして使用するキャッシュストアをこのファイルで指定します。Laravelは、[Memcached](https://memcached.org)、[Redis](https://redis.io)、[DynamoDB](https://aws.amazon.com/dynamodb)、リレーショナルデータベースなど一般的なキャッシュバックエンドをサポートしています。さらに、ファイルベースのキャッシュドライバも利用でき、`array`キャッシュドライバと`null`キャッシュドライバは、自動テストに便利なキャッシュバックエンドを提供します。

キャッシュ設定ファイルには、他にも様々なオプションがあるので確認してください。Laravelはデフォルトで、`database`キャッシュドライバを使用するように設定してあり、シリアライズ済みのキャッシュオブジェクトをアプリケーションのデータベースに保存します。

<a name="driver-prerequisites"></a>
### ドライバ要件

<a name="prerequisites-database"></a>
#### データベース

`database`キャッシュドライバを使用する場合、キャッシュデータを格納するデータベーステーブルが必要になります。通常、これはLaravelの`0001_01_01_000001_create_cache_table.php` [データベースマイグレーション](/docs/{{version}}/migrations)にデフォルトで含まれていますが、アプリケーションにこのマイグレーションが含まれていない場合は、`make:cache-table` Artisanコマンドを使用して生成してください。

```shell
php artisan make:cache-table

php artisan migrate
```

<a name="memcached"></a>
#### Memcached

Memcachedドライバを使用するには、[Memcached PECLパッケージ](https://pecl.php.net/package/memcached)がインストールされている必要があります。すべてのMemcachedサーバを`config/cache.php`設定ファイルにリストしてください。このファイルには、設定しやすいように`memcached.servers`エントリがはじめから用意しています。

```php
'memcached' => [
    // ...

    'servers' => [
        [
            'host' => env('MEMCACHED_HOST', '127.0.0.1'),
            'port' => env('MEMCACHED_PORT', 11211),
            'weight' => 100,
        ],
    ],
],
```

必要に応じて、`host`オプションをUNIXソケットパスに設定できます。これを行う場合は、`port`オプションを`0`に設定する必要があります。

```php
'memcached' => [
    // ...

    'servers' => [
        [
            'host' => '/var/run/memcached/memcached.sock',
            'port' => 0,
            'weight' => 100
        ],
    ],
],
```

<a name="redis"></a>
#### Redis

LaravelでRedisキャッシュを使用する前に、PECL経由でPhpRedis PHP拡張をインストールするか、Composer経由で`predis/predis`パッケージ（~2.0）をインストールする必要があります。[Laravel Sail](/docs/{{version}}/sail)は、あらかじめこの拡張機能を用意してあります。また、[Laravel Cloud](https://cloud.laravel.com)や[Laravel Forge](https://forge.laravel.com)などの公式Laravelアプリケーションプラットフォームでは、デフォルトでPhpRedis拡張をインストールしています。

Redisの設定の詳細については、[Laravelドキュメントページ](/docs/{{version}}/redis#configuration)を参照してください。

<a name="dynamodb"></a>
#### DynamoDB

[DynamoDB](https://aws.amazon.com/dynamodb)キャッシュドライバを使用する前に、すべてのキャッシュデータを格納するDynamoDBテーブルを作成する必要があります。通常、このテーブルは`cache`という名前にします。ただし、`cache`設定ファイル内の`stores.dynamodb.table`設定値に基づいてテーブル名を付ける必要があります。テーブル名は`DYNAMODB_CACHE_TABLE`環境変数で設定することもできます。

このテーブルには、アプリケーションの`cache`設定ファイル内の`stores.dynamodb.attributes.key`設定項目の値に対応する名前の、文字列パーティションキーもあります。デフォルトでは、パーティションキーは`key`という名前にする必要があります。

通常、DynamoDBは期限切れのアイテムをテーブルから積極的に削除しません。そのため、テーブルで[TTL (Time to Live)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html)を有効にする必要があります。テーブルのTTLを設定する場合、TTL属性名を`expires_at`に設定します。

次に、LaravelアプリケーションがDynamoDBと通信できるように、AWS SDKをインストールします。

```shell
composer require aws/aws-sdk-php
```

加えて、DynamoDBキャッシュストアの設定オプションへ値を確実に指定してください。`AWS_ACCESS_KEY_ID`や`AWS_SECRET_ACCESS_KEY`などのオプションは、アプリケーションの`.env`設定ファイルで定義する必要があります。

```php
'dynamodb' => [
    'driver' => 'dynamodb',
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'table' => env('DYNAMODB_CACHE_TABLE', 'cache'),
    'endpoint' => env('DYNAMODB_ENDPOINT'),
],
```

<a name="mongodb"></a>
#### MongoDB

MongoDBを使っている場合は、`mongodb/laravel-mongodb`公式パッケージで、`mongodb`キャッシュドライバを提供しており、`mongodb`データベース接続で使用する設定ができます。MongoDBは、期限切れのキャッシュアイテムを自動的にクリアするために使用する、TTLインデックスをサポートしています。

MongoDBの設定の詳細は、MongoDB [キャッシュとロックのドキュメント](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/cache/)を参照してください。

<a name="cache-usage"></a>
## キャッシュ使用法

<a name="obtaining-a-cache-instance"></a>
### キャッシュインスタンスの取得

キャッシュ保存域インスタンスを取得するには、`Cache`ファサードを使用できます。これは、このドキュメント全体で使用します。`Cache`ファサードは、Laravelキャッシュ契約の基盤となる実装への便利で簡潔なアクセスを提供します。

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;

class UserController extends Controller
{
    /**
     * アプリケーションの全ユーザーのリストを表示
     */
    public function index(): array
    {
        $value = Cache::get('key');

        return [
            // …
        ];
    }
}
```

<a name="accessing-multiple-cache-stores"></a>
#### 複数のキャッシュ保存域へのアクセス

`Cache`ファサードを使用すると、`store`メソッドを介してさまざまなキャッシュ保存域にアクセスできます。`store`メソッドに渡されるキーは、`cache`設定ファイルの`stores`設定配列にリストされている保存域の１つに対応している必要があります。

```php
$value = Cache::store('file')->get('foo');

Cache::store('redis')->put('bar', 'baz', 600); // 10 Minutes
```

<a name="retrieving-items-from-the-cache"></a>
### キャッシュからのアイテム取得

`Cache`ファサードの`get`メソッドは、キャッシュからアイテムを取得するために使用します。アイテムがキャッシュに存在しない場合、`null`を返します。必要に応じて、アイテムが存在しない場合に返されるデフォルト値を指定する２番目の引数を`get`メソッドに渡すことができます。

```php
$value = Cache::get('key');

$value = Cache::get('key', 'default');
```

デフォルト値としてクロージャを渡すこともできます。指定されたアイテムがキャッシュに存在しない場合、クロージャの結果が返されます。クロージャを渡すことで、データベースまたは他の外部サービスからのデフォルト値の取得を延期できるようになります。

```php
$value = Cache::get('key', function () {
    return DB::table(/* ... */)->get();
});
```

<a name="checking-for-item-existence"></a>
#### アイテムの存在を判定

`has`メソッドを使用して、アイテムがキャッシュに存在するかを判定できます。このメソッドは、アイテムが存在するがその値が`null`の場合にも、`false`を返します。

```php
if (Cache::has('key')) {
    // ...
}
```

<a name="incrementing-decrementing-values"></a>
#### 値の増減

`increment`メソッドと`decrement`メソッドを使用して、キャッシュ内の整数項目の値を増減できます。これらのメソッドは両方とも、アイテムの値をインクリメントまたはデクリメントする数を示すオプションの２番目の引数を取ります。

```php
// Initialize the value if it does not exist...
Cache::add('key', 0, now()->plus(hours: 4));

// Increment or decrement the value...
Cache::increment('key');
Cache::increment('key', $amount);
Cache::decrement('key');
Cache::decrement('key', $amount);
```

<a name="retrieve-store"></a>
#### 取得か保存

時に、キャッシュからアイテムを取得したいが、リクエストされたアイテムが存在しない場合はデフォルト値を保存したい場合があります。たとえば、すべてのユーザーをキャッシュから取得するか、存在しない場合はデータベースから取得してキャッシュに追加できます。これは、`Cache::remember`メソッドを使用して行えます。

```php
$value = Cache::remember('users', $seconds, function () {
    return DB::table('users')->get();
});
```

アイテムがキャッシュに存在しない場合、`remember`メソッドに渡されたクロージャが実行され、その結果がキャッシュに配置されます。

`rememberForever`メソッドを使用して、キャッシュからアイテムを取得するか、アイテムが存在しない場合は永久に保存できます。

```php
$value = Cache::rememberForever('users', function () {
    return DB::table('users')->get();
});
```

<a name="swr"></a>
#### Stale While Revalidate

`Cache::remember`メソッドを使用する場合、キャッシュ済の値が有効期限切れだと、レスポンスが遅くなるのを一部のユーザーは経験しています。データの種類により、キャッシュ済み値をバックグラウンドで再計算する間、部分的に古くなったデータを提供できるようにすることで、キャッシュ済み値を計算する間にレスポンスが遅くなることを防止できます。これはしばしば、"stale-while-revalidate"パターンと呼ばれ、`Cache::flexible`メソッドはこのパターンの実装を提供します。

flexibleメソッドは、キャッシュ済み値を「新しい」とみなす時間と、「古い」とみなす時間を指定する配列を引数に取ります。配列の最初の値は、キャッシュが新鮮だとみなす秒数を表し、２番目の値は再計算が必要になるまでにどれくらいの時間、古いデータとして提供できるかを定義します。

リクエストがフレッシュ期間内（最初の値の前）に行われた場合、キャッシュを再計算せず直ちに返します。もしリクエストが古い期間中(２つの値の間)に行われた場合、古い値をユーザーに提供し、レスポンスをユーザーへ送った後に、キャッシュ済み値をリフレッシュするために[遅延関数](/docs/{{version}}/helpers#deferred-functions)を登録します。もし２番目の値より後にリクエストが行われた場合、キャッシュを期限切れとみなし、値を即座に再計算します。

```php
$value = Cache::flexible('users', [5, 10], function () {
    return DB::table('users')->get();
});
```

<a name="retrieve-delete"></a>
#### 取得後、削除

キャッシュからアイテムを取得してからアイテムを削除する必要がある場合は、`pull`メソッドを使用できます。`get`メソッドと同様に、アイテムがキャッシュに存在しない場合は`null`が返されます。

```php
$value = Cache::pull('key');

$value = Cache::pull('key', 'default');
```

<a name="storing-items-in-the-cache"></a>
### キャッシュへのアイテム保存

`Cache`ファサードで`put`メソッドを使用して、アイテムをキャッシュに保存できます。

```php
Cache::put('key', 'value', $seconds = 10);
```

保存時間が`put`メソッドに渡されない場合、アイテムは無期限に保存されます。

```php
Cache::put('key', 'value');
```

秒数を整数として渡す代わりに、キャッシュするアイテムの有効期限を表す`DateTime`インスタンスを渡すこともできます。

```php
Cache::put('key', 'value', now()->plus(minutes: 10));
```

<a name="store-if-not-present"></a>
#### 存在しない場合は保存

`add`メソッドは、アイテムがキャッシュストアにまだ存在しない場合にのみ、アイテムをキャッシュに追加します。アイテムが実際にキャッシュに追加された場合、メソッドは`true`を返します。それ以外の場合にメソッドは`false`を返します。`add`メソッドはアトミック操作です。

```php
Cache::add('key', 'value', $seconds);
```

<a name="extending-item-lifetime"></a>
### Extending Item Lifetime

The `touch` method allows you to extend the lifetime (TTL) of an existing cache item. The `touch` method will return `true` if the cache item exists and its expiration time was successfully extended. If the item does not exist in the cache, the method will return `false`:

```php
Cache::touch('key', 3600);
```

You may provide a `DateTimeInterface`, `DateInterval`, or `Carbon` instance to specify an exact expiration time:

```php
Cache::touch('key', now()->addHours(2));
```

<a name="storing-items-forever"></a>
#### アイテムを永久に保存

`forever`メソッドを使用して、アイテムをキャッシュに永続的に保存できます。保存アイテムは期限切れにならないため、`forget`メソッドを使用して手作業でキャッシュから削除する必要があります。

```php
Cache::forever('key', 'value');
```

> [!NOTE]
> Memcachedドライバを使用している場合、「永久に」保存されているアイテムは、キャッシュがサイズ制限に達すると削除される可能性があります。

<a name="removing-items-from-the-cache"></a>
### キャッシュからのアイテム削除

`forget`メソッドを使用してキャッシュからアイテムを削除できます。

```php
Cache::forget('key');
```

有効期限の秒数をゼロまたは負にすることで、アイテムを削除することもできます。

```php
Cache::put('key', 'value', 0);

Cache::put('key', 'value', -5);
```

`flush`メソッドを使用してキャッシュ全体をクリアできます。

```php
Cache::flush();
```

You may clear all atomic locks in the cache using the `flushLocks` method:

```php
Cache::flushLocks();
```

> [!WARNING]
> キャッシュのフラッシュは、設定したキャッシュの「プレフィックス」を尊重せず、キャッシュからすべてのエントリを削除します。他のアプリケーションと共有するキャッシュをクリアするときは、これを慎重に検討してください。

<a name="cache-memoization"></a>
### キャッシュのメモ

Laravelの`memo`キャッシュドライバは、１回のリクエスト中やジョブの実行中、解決したキャッシュ値を一時的にメモリへ保存できます。これにより、同じ実行内でキャッシュヒットが繰り返されることを防ぎ、パフォーマンスを大幅に向上させます。

このキャッシュのメモを使うには、`memo`メソッドを呼び出します。

```php
use Illuminate\Support\Facades\Cache;

$value = Cache::memo()->get('key');
```

`memo`メソッドのオプションとして、キャッシュストア名も指定できます。これは、メモ化のドライバがデコレートする元のキャッシュストアを指定します。

```php
// デフォルトキャッシュストアの使用
$value = Cache::memo()->get('key');

// Redisキャッシュストアの使用
$value = Cache::memo('redis')->get('key');
```

指定したキーに対する最初の`get`呼び出しはキャッシュストアから値を取得しますが、同じリクエストまたはジョブ内でのそれ以降の呼び出しはメモリから値を取得します。

```php
// キャッシュをヒットする
$value = Cache::memo()->get('key');

// キャッシュをヒットせずに、メモの値を返す
$value = Cache::memo()->get('key');
```

キャッシュの値を変更するメソッド（`put`、`increment`、`remember` など）を呼び出すと、メモしたキャッシュは自動的にその値をクリアし、変更したメソッドの呼び出しを元のキャッシュストアへ引き継ぎます。

```php
Cache::memo()->put('name', 'Taylor'); // 元のキャッシュへ書き込む
Cache::memo()->get('name');           // 元のキャッシュをヒットする
Cache::memo()->get('name');           // メモ済みなので、キャッシュをヒットしない

Cache::memo()->put('name', 'Tim');    // メモ済みの値をクリアし、新しい値を書き込む
Cache::memo()->get('name');           // 再度、元のキャッシュをヒットする
```

<a name="the-cache-helper"></a>
### キャッシュヘルパ

`Cache`ファサードの使用に加え、グローバルな`cache`関数を使用して、キャッシュによるデータの取得および保存もできます。`cache`関数が単一の文字列引数で呼び出されると、指定されたキーの値を返します。

```php
$value = cache('key');
```

キーと値のペアの配列と有効期限を関数に指定すると、指定された期間、値がキャッシュに保存されます。

```php
cache(['key' => 'value'], $seconds);

cache(['key' => 'value'], now()->plus(minutes: 10));
```

`cache`関数を引数なしで呼び出すと、`Illuminate\Contracts\Cache\Factory`実装のインスタンスが返され、他のキャッシュメソッドを呼び出せます。

```php
cache()->remember('users', $seconds, function () {
    return DB::table('users')->get();
});
```

> [!NOTE]
> グローバルな`cache`関数の呼び出しをテストするときは、[ファサードをテストする](/docs/{{version}}/mocking#mocking-facades)のように`Cache::shouldReceive`メソッドを使用できます。

<a name="cache-tags"></a>
## キャッシュタグ

> [!WARNING]
> `file`、`dynamodb`、`database`キャッシュドライバを使用する場合、キャッシュタグはサポートしていません。

<a name="storing-tagged-cache-items"></a>
### タグ付きキャッシュ項目の保存

キャッシュタグを使用すると、キャッシュ内の関連項目にタグを付け、特定のタグが割り当てられたすべてのキャッシュ値を一括で消去できます。タグ付きキャッシュには、タグ名順の配列を渡すことでアクセスできます。一例として、タグ付きキャッシュにアクセスして値を`put`してみましょう。

```php
use Illuminate\Support\Facades\Cache;

Cache::tags(['people', 'artists'])->put('John', $john, $seconds);
Cache::tags(['people', 'authors'])->put('Anne', $anne, $seconds);
```

<a name="accessing-tagged-cache-items"></a>
### タグ付きキャッシュ項目のアクセス

タグ経由で保存した項目は、値の保存に使用したタグを指定せずにアクセスすることはできません。タグ付きキャッシュ項目を取得するには、`tags`メソッドに同じ順序のタグリストを渡した後、取得したいキーで`get`メソッドを呼び出します。

```php
$john = Cache::tags(['people', 'artists'])->get('John');

$anne = Cache::tags(['people', 'authors'])->get('Anne');
```

<a name="removing-tagged-cache-items"></a>
### タグ付きキャッシュ項目の削除

タグまたはタグのリストが割り当てられたすべての項目を消去できます。たとえば、次のコードは `people`、`authors`、またはその両方のタグが付いたすべてのキャッシュを削除します。したがって、`Anne`と`John`の両方をキャッシュから削除します。

```php
Cache::tags(['people', 'authors'])->flush();
```

上記と比べ、以下のコードでは`authors`タグが付いたキャッシュ値のみを削除するため、`Anne`は削除されますが、`John`は削除されません。

```php
Cache::tags('authors')->flush();
```

<a name="atomic-locks"></a>
## アトミックロック

> [!WARNING]
> この機能を利用するには、アプリケーションのデフォルトのキャッシュドライバとして、`memcached`、`redis`、`dynamodb`、`database`、`file`、`array`キャッシュドライバを使用する必要があります。さらに、すべてのサーバが同じ中央キャッシュサーバと通信している必要があります。

<a name="managing-locks"></a>
### ロック管理

アトミックロックを使用すると、競合状態を心配することなく分散ロックを操作できます。例えば、[Laravel Cloud](https://cloud.laravel.com)はアトミックロックを使用して、サーバ上で一度に１つのリモートタスクしか実行しないようにしています。ロックの作成と管理には`Cache::lock`メソッドを使用します。

```php
use Illuminate\Support\Facades\Cache;

$lock = Cache::lock('foo', 10);

if ($lock->get()) {
    // １０秒間ロックを獲得

    $lock->release();
}
```

`get`メソッドもクロージャを受け入れます。クロージャが実行された後、Laravelは自動的にロックを解除します。

```php
Cache::lock('foo', 10)->get(function () {
    // １０秒間ロックを獲得し、自動的にリリースする
});
```

リクエストした時点でロックが利用できない場合に、指定された秒数待つようにLaravelへ指示できます。指定された制限時間内にロックを取得できない場合、`Illuminate\Contracts\Cache\LockTimeoutException`を投げます。

```php
use Illuminate\Contracts\Cache\LockTimeoutException;

$lock = Cache::lock('foo', 10);

try {
    $lock->block(5);

    // 最大5秒待った後、ロック獲得
} catch (LockTimeoutException $e) {
    // ロックを獲得できなかった
} finally {
    $lock->release();
}
```

上記の例は、クロージャを`block`メソッドに渡すことで簡略化できます。クロージャがこのメソッドに渡されると、Laravelは指定された秒数の間ロックを取得しようとし、クロージャが実行されると自動的にロックを解放します。

```php
Cache::lock('foo', 10)->block(5, function () {
    // 最大5秒待った後、１０秒ロック獲得
});
```

<a name="managing-locks-across-processes"></a>
### プロセス間でのロック管理

あるプロセスでロックを取得し、別のプロセスでそれを解放したい場合があります。たとえば、Webリクエスト中にロックを取得し、そのリクエストによってトリガーされたキュー投入済みジョブの終了時にロックを解放したい場合があるでしょう。このシナリオでは、ロックのスコープ付き「所​​有者トークン」をキュー投入済みジョブに渡し、ジョブが渡されたトークンを使用してロックを再インスタンス化できるようにする必要があります。

以下の例では、ロックが正常に取得された場合に、キュー投入済みジョブをディスパッチします。さらに、ロックの`owner`メソッドを介して、ロックの所有者トークンをキュー投入済みジョブに渡します。

```php
$podcast = Podcast::find($id);

$lock = Cache::lock('processing', 120);

if ($lock->get()) {
    ProcessPodcast::dispatch($podcast, $lock->owner());
}
```

アプリケーションの`ProcessPodcast`ジョブ内で、所有者トークンを使用してロックを復元し、解放できます。

```php
Cache::restoreLock('processing', $this->owner)->release();
```

現在の所有者を尊重せずにロックを解放したい場合は、`forceRelease`メソッドを使用できます。

```php
Cache::lock('processing')->forceRelease();
```

<a name="concurrency-limiting"></a>
### 同時実行制限

Laravelのアトミックロック機能は、クロージャの同時実行を制限する方法もいくつか提供しています。インフラ全体で実行インスタンスを１つのみ許可したい場合は、`withoutOverlapping`を使用してください。

```php
Cache::withoutOverlapping('foo', function () {
    // 最大10秒間待機した後、ロックを取得
});
```

ロックはデフォルトで、クロージャ実行が終了するまで維持され、メソッドはロックを取得するために最大１０秒間待ちます。追加の引数を使用して、これらの値をカスタマイズできます。

```php
Cache::withoutOverlapping('foo', function () {
    // 最大5秒間待機した後、120秒間ロックを取得...
}, lockFor: 120, waitFor: 5);
```

指定した待機時間内にロックを取得できない場合、`Illuminate\Contracts\Cache\LockTimeoutException`を投げます。

並列処理を制御する必要がある場合は、`funnel`メソッドを使用して、同時実行の最大数を設定してください。`funnel`メソッドは、ロックをサポートするすべてのキャッシュドライバで動作します。

```php
Cache::funnel('foo')
    ->limit(3)
    ->releaseAfter(60)
    ->block(10)
    ->then(function () {
        // 同時実行ロックを取得できた
    }, function () {
        // 同時実行ロックを取得できなかった
    });
```

`funnel`キーは、制限するリソースを識別します。`limit`メソッドは、最大同時実行数を定義します。`releaseAfter`メソッドは、取得したスロットが自動的に解放されるまでのセーフティタイムアウトを秒単位で設定します。`block`メソッドは、利用可能なスロットを待機する秒数を設定します。

失敗時のクロージャを指定する代わりに、例外でタイムアウトを処理したい場合は、２番目のクロージャを省略してください。指定した待ち時間内にロックを取得できない場合、`Illuminate\Cache\Limiters\LimiterTimeoutException`を投げます。

```php
use Illuminate\Cache\Limiters\LimiterTimeoutException;

try {
    Cache::funnel('foo')
        ->limit(3)
        ->releaseAfter(60)
        ->block(10)
        ->then(function () {
            // 同時実行ロックを取得できた
        });
} catch (LimiterTimeoutException $e) {
    // 同時実行ロックを取得できなかった
}
```

同時実行制限で特定のキャッシュストアを使用したい場合は、対象のストアで`funnel`メソッドを呼び出します。

```php
Cache::store('redis')->funnel('foo')
    ->limit(3)
    ->block(10)
    ->then(function () {
        // "redis"ストアを使用して同時実行ロックを取得できた
    });
```

> [!NOTE]
> `funnel`メソッドは、キャッシュストアが`Illuminate\Contracts\Cache\LockProvider`インターフェイスを実装している必要があります。ロックをサポートしていないキャッシュストアで`funnel`を使用しようとすると、`BadMethodCallException`を投げます。

<a name="cache-failover"></a>
## キャッシュフェイルオーバ

`failover`キャッシュドライバは、キャッシュとのやり取り時に自動フェイスセーフ機能を提供します。`failover`のプライマリキャッシュストアが何らかの理由で障害を起こした場合、Laravelは自動的にリスト内で次に設定してあるストアの使用を試みます。これは、キャッシュの信頼性が極めて重要な本番環境において高可用性を確保するために特に有用です。

フェイスセーフキャッシュストアを設定するには、`failover`ドライバを指定し、順に試行するストア名の配列を指定します。Laravelはデフォルトでアプリケーションの`config/cache.php`設定ファイルに、フェイスセーフ設定の例を含んでいます。

```php
'failover' => [
    'driver' => 'failover',
    'stores' => [
        'database',
        'array',
    ],
],
```

`failover`ドライバを使用するストアを一度設定し終えたら、フェイスセーフ機能を利用するために、アプリケーションの`.env`ファイルでフェイスセーフスストアをデフォルトのキャッシュストアとして設定する必要があります。

```ini
CACHE_STORE=failover
```

キャッシュストア操作が失敗しフェイスセーフがアクティブになると、Laravelは`Illuminate\Cache\Events\CacheFailedOver`イベントを発行します。これにより、キャッシュストアの失敗を報告またはログに記録できます。

<a name="adding-custom-cache-drivers"></a>
## カスタムキャッシュドライバの追加

<a name="writing-the-driver"></a>
### ドライバの作成

カスタムキャッシュドライバを作成するには、最初に`Illuminate\Contracts\Cache\Store`[契約](/docs/{{version}}/Contracts)を実装する必要があります。したがって、MongoDBキャッシュの実装は次のようになります。

```php
<?php

namespace App\Extensions;

use Illuminate\Contracts\Cache\Store;

class MongoStore implements Store
{
    public function get($key) {}
    public function many(array $keys) {}
    public function put($key, $value, $seconds) {}
    public function putMany(array $values, $seconds) {}
    public function increment($key, $value = 1) {}
    public function decrement($key, $value = 1) {}
    public function forever($key, $value) {}
    public function forget($key) {}
    public function flush() {}
    public function getPrefix() {}
}
```

MongoDB接続を使用してこれらの各メソッドを実装する必要があります。これらの各メソッドを実装する方法の例については、[Laravelフレームワークのソースコード](https://github.com/laravel/framework)の`Illuminate\Cache\MemcachedStore`をご覧ください。実装が完了したら、`Cache`ファサードの`extend`メソッドを呼び出してカスタムドライバの登録を完了してください。

```php
Cache::extend('mongo', function (Application $app) {
    return Cache::repository(new MongoStore);
});
```

> [!NOTE]
> カスタムキャッシュドライバコードをどこに置くか迷っている場合は、`app`ディレクトリ内に`Extensions`名前空間を作成できます。ただし、Laravelには厳密なアプリケーション構造がなく、好みに応じてアプリケーションを自由にオーガナイズできることに注意してください。

<a name="registering-the-driver"></a>
### Registering the Driver

カスタムキャッシュドライバをLaravelに登録するには、`Cache`ファサードで`extend`メソッドを使用します。他のサービスプロバイダは`boot`メソッド内でキャッシュされた値を読み取ろうとする可能性があるため、`booting`コールバック内にカスタムドライバを登録します。`booting`コールバックを使用することで、アプリケーションのサービスプロバイダで`boot`メソッドが呼び出される直前で、すべてのサービスプロバイダで`register`メソッドが呼び出された後にカスタムドライバが登録されるようにすることができます。アプリケーションの`App\Providers\AppServiceProvider`クラスの`register`メソッド内に`booting`コールバックを登録します。

```php
<?php

namespace App\Providers;

use App\Extensions\MongoStore;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 全アプリケーションサービスの登録
     */
    public function register(): void
    {
        $this->app->booting(function () {
             Cache::extend('mongo', function (Application $app) {
                 return Cache::repository(new MongoStore);
             });
         });
    }

    /**
     * 全アプリケーションサービスの初期起動処理
     */
    public function boot(): void
    {
        // …
    }
}
```

`extend`メソッドに渡す最初の引数はドライバの名前です。これは、`config/cache.php`設定ファイルの`driver`オプションに対応させます。２番目の引数は、`Illuminate\Cache\Repository`インスタンスを返す必要があるクロージャです。クロージャには、[サービスコンテナ](/docs/{{version}}/container)のインスタンスである`$app`インスタンスが渡されます。

拡張機能を登録したら、アプリケーションの`config/cache.php`設定ファイル内の`CACHE_STORE`環境変数、または`default`オプションを拡張機能の名前に更新します。

<a name="events"></a>
## イベント

すべてのキャッシュ操作でコードを実行できるように、キャッシュがディスパッチするさまざまな[イベント](/docs/{{version}}/events)をリッスンできます。

<div class="overflow-auto">

| Event Name                                      |
|-------------------------------------------------|
| `Illuminate\Cache\Events\CacheFlushed`          |
| `Illuminate\Cache\Events\CacheFlushing`         |
| `Illuminate\Cache\Events\CacheFlushFailed`      |
| `Illuminate\Cache\Events\CacheLocksFlushed`     |
| `Illuminate\Cache\Events\CacheLocksFlushing`    |
| `Illuminate\Cache\Events\CacheLocksFlushFailed` |
| `Illuminate\Cache\Events\CacheHit`              |
| `Illuminate\Cache\Events\CacheMissed`           |
| `Illuminate\Cache\Events\ForgettingKey`         |
| `Illuminate\Cache\Events\KeyForgetFailed`       |
| `Illuminate\Cache\Events\KeyForgotten`          |
| `Illuminate\Cache\Events\KeyWriteFailed`        |
| `Illuminate\Cache\Events\KeyWritten`            |
| `Illuminate\Cache\Events\RetrievingKey`         |
| `Illuminate\Cache\Events\RetrievingManyKeys`    |
| `Illuminate\Cache\Events\WritingKey`            |
| `Illuminate\Cache\Events\WritingManyKeys`       |

</div>

パフォーマンスを向上させるために、`config/cache.php`設定ファイルの`events`設定オプションを`false`に設定し、イベントのキャッシュ保存を無効にできます。

```php
'database' => [
    'driver' => 'database',
    // ...
    'events' => false,
],
```
