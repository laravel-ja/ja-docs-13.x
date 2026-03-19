# ヘルパ

- [イントロダクション](#introduction)
- [使用可能なメソッド](#available-methods)
- [その他のユーティリティ](#other-utilities)
    - [ベンチマーク](#benchmarking)
    - [日付と時間](#dates)
    - [遅延関数](#deferred-functions)
    - [抽選](#lottery)
    - [パイプライン](#pipeline)
    - [スリープ](#sleep)
    - [Timebox](#timebox)
    - [URI](#uri)

<a name="introduction"></a>
## イントロダクション

Laravelはさまざまな、グローバル「ヘルパ」PHP関数を用意しています。これらの多くはフレームワーク自身で使用されています。便利なものが見つかれば、皆さんのアプリケーションでも大いに活用してください。

<a name="available-methods"></a>
## 使用可能なメソッド

<style>
    .collection-method-list > p {
        columns: 10.8em 3; -moz-columns: 10.8em 3; -webkit-columns: 10.8em 3;
    }

    .collection-method-list a {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>

<a name="arrays-and-objects-method-list"></a>
### 配列とオブジェクト

<div class="collection-method-list" markdown="1">

[Arr::accessible](#method-array-accessible)
[Arr::add](#method-array-add)
[Arr::array](#method-array-array)
[Arr::boolean](#method-array-boolean)
[Arr::collapse](#method-array-collapse)
[Arr::crossJoin](#method-array-crossjoin)
[Arr::divide](#method-array-divide)
[Arr::dot](#method-array-dot)
[Arr::every](#method-array-every)
[Arr::except](#method-array-except)
[Arr::exceptValues](#method-array-except-values)
[Arr::exists](#method-array-exists)
[Arr::first](#method-array-first)
[Arr::flatten](#method-array-flatten)
[Arr::float](#method-array-float)
[Arr::forget](#method-array-forget)
[Arr::from](#method-array-from)
[Arr::get](#method-array-get)
[Arr::has](#method-array-has)
[Arr::hasAll](#method-array-hasall)
[Arr::hasAny](#method-array-hasany)
[Arr::integer](#method-array-integer)
[Arr::isAssoc](#method-array-isassoc)
[Arr::isList](#method-array-islist)
[Arr::join](#method-array-join)
[Arr::keyBy](#method-array-keyby)
[Arr::last](#method-array-last)
[Arr::map](#method-array-map)
[Arr::mapSpread](#method-array-map-spread)
[Arr::mapWithKeys](#method-array-map-with-keys)
[Arr::only](#method-array-only)
[Arr::onlyValues](#method-array-only-values)
[Arr::partition](#method-array-partition)
[Arr::pluck](#method-array-pluck)
[Arr::prepend](#method-array-prepend)
[Arr::prependKeysWith](#method-array-prependkeyswith)
[Arr::pull](#method-array-pull)
[Arr::push](#method-array-push)
[Arr::query](#method-array-query)
[Arr::random](#method-array-random)
[Arr::reject](#method-array-reject)
[Arr::select](#method-array-select)
[Arr::set](#method-array-set)
[Arr::shuffle](#method-array-shuffle)
[Arr::sole](#method-array-sole)
[Arr::some](#method-array-some)
[Arr::sort](#method-array-sort)
[Arr::sortDesc](#method-array-sort-desc)
[Arr::sortRecursive](#method-array-sort-recursive)
[Arr::string](#method-array-string)
[Arr::take](#method-array-take)
[Arr::toCssClasses](#method-array-to-css-classes)
[Arr::toCssStyles](#method-array-to-css-styles)
[Arr::undot](#method-array-undot)
[Arr::where](#method-array-where)
[Arr::whereNotNull](#method-array-where-not-null)
[Arr::wrap](#method-array-wrap)
[data_fill](#method-data-fill)
[data_get](#method-data-get)
[data_set](#method-data-set)
[data_forget](#method-data-forget)
[head](#method-head)
[last](#method-last)
</div>

<a name="numbers-method-list"></a>
### 数値

<div class="collection-method-list" markdown="1">

[Number::abbreviate](#method-number-abbreviate)
[Number::clamp](#method-number-clamp)
[Number::currency](#method-number-currency)
[Number::defaultCurrency](#method-default-currency)
[Number::defaultLocale](#method-default-locale)
[Number::fileSize](#method-number-file-size)
[Number::forHumans](#method-number-for-humans)
[Number::format](#method-number-format)
[Number::ordinal](#method-number-ordinal)
[Number::pairs](#method-number-pairs)
[Number::parseInt](#method-number-parse-int)
[Number::parseFloat](#method-number-parse-float)
[Number::percentage](#method-number-percentage)
[Number::spell](#method-number-spell)
[Number::spellOrdinal](#method-number-spell-ordinal)
[Number::trim](#method-number-trim)
[Number::useLocale](#method-number-use-locale)
[Number::withLocale](#method-number-with-locale)
[Number::useCurrency](#method-number-use-currency)
[Number::withCurrency](#method-number-with-currency)

</div>

<a name="paths-method-list"></a>
### パス

<div class="collection-method-list" markdown="1">

[app_path](#method-app-path)
[base_path](#method-base-path)
[config_path](#method-config-path)
[database_path](#method-database-path)
[lang_path](#method-lang-path)
[public_path](#method-public-path)
[resource_path](#method-resource-path)
[storage_path](#method-storage-path)

</div>

<a name="urls-method-list"></a>
### URL

<div class="collection-method-list" markdown="1">

[action](#method-action)
[asset](#method-asset)
[route](#method-route)
[secure_asset](#method-secure-asset)
[secure_url](#method-secure-url)
[to_action](#method-to-action)
[to_route](#method-to-route)
[uri](#method-uri)
[url](#method-url)

</div>

<a name="miscellaneous-method-list"></a>
### その他

<div class="collection-method-list" markdown="1">

[abort](#method-abort)
[abort_if](#method-abort-if)
[abort_unless](#method-abort-unless)
[app](#method-app)
[auth](#method-auth)
[back](#method-back)
[bcrypt](#method-bcrypt)
[blank](#method-blank)
[broadcast](#method-broadcast)
[broadcast_if](#method-broadcast-if)
[broadcast_unless](#method-broadcast-unless)
[cache](#method-cache)
[class_uses_recursive](#method-class-uses-recursive)
[collect](#method-collect)
[config](#method-config)
[context](#method-context)
[cookie](#method-cookie)
[csrf_field](#method-csrf-field)
[csrf_token](#method-csrf-token)
[decrypt](#method-decrypt)
[dd](#method-dd)
[dispatch](#method-dispatch)
[dispatch_sync](#method-dispatch-sync)
[dump](#method-dump)
[encrypt](#method-encrypt)
[env](#method-env)
[event](#method-event)
[fake](#method-fake)
[filled](#method-filled)
[info](#method-info)
[literal](#method-literal)
[logger](#method-logger)
[method_field](#method-method-field)
[now](#method-now)
[old](#method-old)
[once](#method-once)
[optional](#method-optional)
[policy](#method-policy)
[redirect](#method-redirect)
[report](#method-report)
[report_if](#method-report-if)
[report_unless](#method-report-unless)
[request](#method-request)
[rescue](#method-rescue)
[resolve](#method-resolve)
[response](#method-response)
[retry](#method-retry)
[session](#method-session)
[tap](#method-tap)
[throw_if](#method-throw-if)
[throw_unless](#method-throw-unless)
[today](#method-today)
[trait_uses_recursive](#method-trait-uses-recursive)
[transform](#method-transform)
[validator](#method-validator)
[value](#method-value)
[view](#method-view)
[with](#method-with)
[when](#method-when)

</div>

<a name="arrays"></a>
## 配列とオブジェクト

<a name="method-array-accessible"></a>
#### `Arr::accessible()` {.collection-method .first-collection-method}

`Arr::accessible`メソッドは、指定した値が配列アクセス可能かを判別します。

```php
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;

$isAccessible = Arr::accessible(['a' => 1, 'b' => 2]);

// true

$isAccessible = Arr::accessible(new Collection);

// true

$isAccessible = Arr::accessible('abc');

// false

$isAccessible = Arr::accessible(new stdClass);

// false
```

<a name="method-array-add"></a>
#### `Arr::add()` {.collection-method}

`Arr::add`メソッドは指定キー／値のペアをそのキーが存在していない場合と`null`がセットされている場合に、配列に追加します。

```php
use Illuminate\Support\Arr;

$array = Arr::add(['name' => 'Desk'], 'price', 100);

// ['name' => 'Desk', 'price' => 100]

$array = Arr::add(['name' => 'Desk', 'price' => null], 'price', 100);

// ['name' => 'Desk', 'price' => 100]
```

<a name="method-array-array"></a>
#### `Arr::array()` {.collection-method}

`Arr::array`メソッドは[Arr::get()](#method-array-get)と同様に、深くネストした配列から「ドット」記法で値を取得します。ただし、要求した値が`array`でなかった場合は、`InvalidArgumentException`を投げます。

```
use Illuminate\Support\Arr;

$array = ['name' => 'Joe', 'languages' => ['PHP', 'Ruby']];

$value = Arr::array($array, 'languages');

// ['PHP', 'Ruby']

$value = Arr::array($array, 'name');

// InvalidArgumentExceptionを投げる
```

<a name="method-array-boolean"></a>
#### `Arr::boolean()` {.collection-method}

`Arr::boolean`メソッドは[Arr::get()](#method-array-get)と同様に、深くネストした配列から「ドット」記法で値を取得します。ただし、要求した値が`boolean`でなかった場合は、`InvalidArgumentException`を投げます。

```
use Illuminate\Support\Arr;

$array = ['name' => 'Joe', 'available' => true];

$value = Arr::boolean($array, 'available');

// true

$value = Arr::boolean($array, 'name');

// InvalidArgumentExceptionを投げる
```


<a name="method-array-collapse"></a>
#### `Arr::collapse()` {.collection-method}

`Arr::collapse`メソッドは配列やコレクションの配列を一次元の配列へ展開します。

```php
use Illuminate\Support\Arr;

$array = Arr::collapse([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);

// [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

<a name="method-array-crossjoin"></a>
#### `Arr::crossJoin()` {.collection-method}

`Arr::crossJoin`メソッドは指定配列をクロス結合し、可能性があるすべての順列の直積集合を返します。

```php
use Illuminate\Support\Arr;

$matrix = Arr::crossJoin([1, 2], ['a', 'b']);

/*
    [
        [1, 'a'],
        [1, 'b'],
        [2, 'a'],
        [2, 'b'],
    ]
*/

$matrix = Arr::crossJoin([1, 2], ['a', 'b'], ['I', 'II']);

/*
    [
        [1, 'a', 'I'],
        [1, 'a', 'II'],
        [1, 'b', 'I'],
        [1, 'b', 'II'],
        [2, 'a', 'I'],
        [2, 'a', 'II'],
        [2, 'b', 'I'],
        [2, 'b', 'II'],
    ]
*/
```

<a name="method-array-divide"></a>
#### `Arr::divide()` {.collection-method}

`Arr::divide`メソッドは２つの配列を返します。１つは指定した配列のキーを含み、もう１つは値を含みます。

```php
use Illuminate\Support\Arr;

[$keys, $values] = Arr::divide(['name' => 'Desk']);

// $keys: ['name']

// $values: ['Desk']
```

<a name="method-array-dot"></a>
#### `Arr::dot()` {.collection-method}

`Arr::dot`メソッドは多次元配列を「ドット」記法で深さを表した一次元配列に変換します。

```php
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

$flattened = Arr::dot($array);

// ['products.desk.price' => 100]
```

<a name="method-array-every"></a>
#### `Arr::every()` {.collection-method}

`Arr::every`メソッドは、配列内のすべての値が指定した真偽テストにパスすることを保証します。

```php
use Illuminate\Support\Arr;

$array = [1, 2, 3];

Arr::every($array, fn ($i) => $i > 0);

// true

Arr::every($array, fn ($i) => $i > 2);

// false
```

<a name="method-array-except"></a>
#### `Arr::except()` {.collection-method}

`Arr::except`メソッドは指定キー／値ペアを配列から削除します。

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Desk', 'price' => 100];

$filtered = Arr::except($array, ['price']);

// ['name' => 'Desk']
```

<a name="method-array-except-values"></a>
#### `Arr::exceptValues()` {.collection-method}

`Arr::exceptValues`メソッドは、指定値を配列から取り除きます。

```php
use Illuminate\Support\Arr;

$array = ['foo', 'bar', 'baz', 'qux'];

$filtered = Arr::exceptValues($array, ['foo', 'baz']);

// ['bar', 'qux']
```

フィルタリング時に厳密な型比較を行うには、`strict`引数に`true`を渡します。

```php
use Illuminate\Support\Arr;

$array = [1, '1', 2, '2'];

$filtered = Arr::exceptValues($array, [1, 2], strict: true);

// ['1', '2']
```

<a name="method-array-exists"></a>
#### `Arr::exists()` {.collection-method}

`Arr::exists`メソッドは指定キーが指定配列に存在するかをチェックします。

```php
use Illuminate\Support\Arr;

$array = ['name' => 'John Doe', 'age' => 17];

$exists = Arr::exists($array, 'name');

// true

$exists = Arr::exists($array, 'salary');

// false
```

<a name="method-array-first"></a>
#### `Arr::first()` {.collection-method}

`Arr::first`メソッドは指定したテストにパスした最初の要素を返します。

```php
use Illuminate\Support\Arr;

$array = [100, 200, 300];

$first = Arr::first($array, function (int $value, int $key) {
    return $value >= 150;
});

// 200
```

デフォルト値を３つ目の引数で指定することもできます。この値はどの値もテストへパスしない場合に返されます。

```php
use Illuminate\Support\Arr;

$first = Arr::first($array, $callback, $default);
```

<a name="method-array-flatten"></a>
#### `Arr::flatten()` {.collection-method}

`Arr::flatten`メソッドは、多次元配列を一次元配列へ変換します。

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Joe', 'languages' => ['PHP', 'Ruby']];

$flattened = Arr::flatten($array);

// ['Joe', 'PHP', 'Ruby']
```

<a name="method-array-float"></a>
#### `Arr::float()` {.collection-method}

`Arr::float`メソッドは[Arr::get()](#method-array-get)と同様に、深くネストした配列から「ドット」記法で値を取得します。ただし、要求された値が`float`でない場合は、`InvalidArgumentException`を投げます。

```
use Illuminate\Support\Arr;

$array = ['name' => 'Joe', 'balance' => 123.45];

$value = Arr::float($array, 'balance');

// 123.45

$value = Arr::float($array, 'name');

// InvalidArgumentExceptionを投げる
```

<a name="method-array-forget"></a>
#### `Arr::forget()` {.collection-method}

`Arr::forget`メソッドは「ドット記法」で指定キー／値のペアを深くネストされた配列から取り除きます。

```php
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

Arr::forget($array, 'products.desk');

// ['products' => []]
```

<a name="method-array-from"></a>
#### `Arr::from()` {.collection-method}

`Arr::from`メソッドは、様々な入力型をプレーンなPHPの配列へ変換します。`Arrayable`、`Enumerable`、`Jsonable`、`JsonSerializable`など、Laravelの一般的なインターフェイスをサポートしています。さらに、`Traversable`と`WeakMap`インスタンスも扱うことができます。

```php
use Illuminate\Support\Arr;

Arr::from((object) ['foo' => 'bar']); // ['foo' => 'bar']

class TestJsonableObject implements Jsonable
{
    public function toJson($options = 0)
    {
        return json_encode(['foo' => 'bar']);
    }
}

Arr::from(new TestJsonableObject); // ['foo' => 'bar']
```

<a name="method-array-get"></a>
#### `Arr::get()` {.collection-method}

`Arr::get`メソッドは「ドット」記法で指定した値を深くネストされた配列から取得します。

```php
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

$price = Arr::get($array, 'products.desk.price');

// 100
```

`Arr::get`メソッドはデフォルト値も引数に取ります。これは、指定したキーが配列で存在しない場合に返されます。

```php
use Illuminate\Support\Arr;

$discount = Arr::get($array, 'products.desk.discount', 0);

// 0
```

<a name="method-array-has"></a>
#### `Arr::has()` {.collection-method}

`Arr::has`メソッドは、「ドット」記法で指定したアイテムが配列に存在するかをチェックします。

```php
use Illuminate\Support\Arr;

$array = ['product' => ['name' => 'Desk', 'price' => 100]];

$contains = Arr::has($array, 'product.name');

// true

$contains = Arr::has($array, ['product.price', 'product.discount']);

// false
```

<a name="method-array-hasall"></a>
#### `Arr::hasAll()` {.collection-method}

`Arr::hasAll`メソッドは、「ドット」記法を用いて、指定配列に指定キーがすべて存在するかを判定します。

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Taylor', 'language' => 'PHP'];

Arr::hasAll($array, ['name']); // true
Arr::hasAll($array, ['name', 'language']); // true
Arr::hasAll($array, ['name', 'IDE']); // false
```

<a name="method-array-hasany"></a>
#### `Arr::hasAny()` {.collection-method}

`Arr::hasAny`メソッドは「ドット」記法を使い、配列中に一連のアイテムが存在するかを調べます。

```php
use Illuminate\Support\Arr;

$array = ['product' => ['name' => 'Desk', 'price' => 100]];

$contains = Arr::hasAny($array, 'product.name');

// true

$contains = Arr::hasAny($array, ['product.name', 'product.discount']);

// true

$contains = Arr::hasAny($array, ['category', 'product.discount']);

// false
```

<a name="method-array-integer"></a>
#### `Arr::integer()` {.collection-method}

`Arr::integer`メソッドは[Arr::get()](#method-array-get)と同様に、深くネストした配列から「ドット」記法で値を取得します。ただし、要求した値が`int`でない場合は、`InvalidArgumentException`を投げます。

```
use Illuminate\Support\Arr;

$array = ['name' => 'Joe', 'age' => 42];

$value = Arr::integer($array, 'age');

// 42

$value = Arr::integer($array, 'name');

// InvalidArgumentExceptionを投げる
```

<a name="method-array-isassoc"></a>
#### `Arr::isAssoc()` {.collection-method}

`Arr::isAssoc`メソッドは、指定した配列が連想配列である場合、`true`を返します。配列が0から始まる連続したキーを持たない場合、その配列を「連想配列」であると見なします。

```php
use Illuminate\Support\Arr;

$isAssoc = Arr::isAssoc(['product' => ['name' => 'Desk', 'price' => 100]]);

// true

$isAssoc = Arr::isAssoc([1, 2, 3]);

// false
```

<a name="method-array-islist"></a>
#### `Arr::isList()` {.collection-method}

`Arr::isList`メソッドは、指定した配列のキーが0から始まる連続した整数である場合、`true`を返します。

```php
use Illuminate\Support\Arr;

$isList = Arr::isList(['foo', 'bar', 'baz']);

// true

$isList = Arr::isList(['product' => ['name' => 'Desk', 'price' => 100]]);

// false
```

<a name="method-array-join"></a>
#### `Arr::join()` {.collection-method}

`Arr::join`メソッドは、配列の要素を文字列として結合します。このメソッドに第３引数を使用し、配列の最後の要素前に挿入する文字列を指定できます。

```php
use Illuminate\Support\Arr;

$array = ['Tailwind', 'Alpine', 'Laravel', 'Livewire'];

$joined = Arr::join($array, ', ');

// Tailwind, Alpine, Laravel, Livewire

$joined = Arr::join($array, ', ', ', and ');

// Tailwind, Alpine, Laravel, and Livewire
```

<a name="method-array-keyby"></a>
#### `Arr::keyBy()` {.collection-method}

`Arr::keyBy`メソッドは、指定したキーで配列へキーを設定します。複数のアイテムが同じキーを持つ場合、最後のものだけを新しい配列に残します。

```php
use Illuminate\Support\Arr;

$array = [
    ['product_id' => 'prod-100', 'name' => 'Desk'],
    ['product_id' => 'prod-200', 'name' => 'Chair'],
];

$keyed = Arr::keyBy($array, 'product_id');

/*
    [
        'prod-100' => ['product_id' => 'prod-100', 'name' => 'Desk'],
        'prod-200' => ['product_id' => 'prod-200', 'name' => 'Chair'],
    ]
*/
```

<a name="method-array-last"></a>
#### `Arr::last()` {.collection-method}

`Arr::last`メソッドは、テストでパスした最後の配列要素を返します。

```php
use Illuminate\Support\Arr;

$array = [100, 200, 300, 110];

$last = Arr::last($array, function (int $value, int $key) {
    return $value >= 150;
});

// 300
```

メソッドの第３引数には、デフォルト値を渡します。テストでパスする値がない場合に、返されます。

```php
use Illuminate\Support\Arr;

$last = Arr::last($array, $callback, $default);
```

<a name="method-array-map"></a>
#### `Arr::map()` {.collection-method}

`Arr::map`メソッドは配列を繰り返し処理し、それぞれの値とキーを指定したコールバックへ渡します。配列の値は、コールバックの返却値で置き換えます。

```php
use Illuminate\Support\Arr;

$array = ['first' => 'james', 'last' => 'kirk'];

$mapped = Arr::map($array, function (string $value, string $key) {
    return ucfirst($value);
});

// ['first' => 'James', 'last' => 'Kirk']
```

<a name="method-array-map-spread"></a>
#### `Arr::mapSpread()` {.collection-method}

`Arr::mapSpread`メソッドは配列を繰り返し処理し、入れ子になった各項目の値を与えられたクロージャへ渡します。クロージャは自由にアイテムを変更してそれを返すことができ、変更したアイテムで新しい配列を形成します。

```php
use Illuminate\Support\Arr;

$array = [
    [0, 1],
    [2, 3],
    [4, 5],
    [6, 7],
    [8, 9],
];

$mapped = Arr::mapSpread($array, function (int $even, int $odd) {
    return $even + $odd;
});

/*
    [1, 5, 9, 13, 17]
*/
```

<a name="method-array-map-with-keys"></a>
#### `Arr::mapWithKeys()` {.collection-method}

`Arr::mapWithKeys`メソッドは、配列を繰り返し処理し、各値を指定したコールバックへ渡します。コールバックは、キー／値のペアを１つ含む連想配列を返す必要があります。

```php
use Illuminate\Support\Arr;

$array = [
    [
        'name' => 'John',
        'department' => 'Sales',
        'email' => 'john@example.com',
    ],
    [
        'name' => 'Jane',
        'department' => 'Marketing',
        'email' => 'jane@example.com',
    ]
];

$mapped = Arr::mapWithKeys($array, function (array $item, int $key) {
    return [$item['email'] => $item['name']];
});

/*
    [
        'john@example.com' => 'John',
        'jane@example.com' => 'Jane',
    ]
*/
```

<a name="method-array-only"></a>
#### `Arr::only()` {.collection-method}

`Arr::only`メソッドは配列中に存在する、指定したキー／値ペアのアイテムのみを返します。

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Desk', 'price' => 100, 'orders' => 10];

$slice = Arr::only($array, ['name', 'price']);

// ['name' => 'Desk', 'price' => 100]
```

<a name="method-array-only-values"></a>
#### `Arr::onlyValues()` {.collection-method}

`Arr::onlyValues`メソッドは、指定値だけを配列から返します。

```php
use Illuminate\Support\Arr;

$array = ['foo', 'bar', 'baz', 'qux'];

$filtered = Arr::onlyValues($array, ['foo', 'baz']);

// ['foo', 'baz']
```

フィルタリング時に厳密な型比較を行うには、`strict`引数に`true`を渡します。

```php
use Illuminate\Support\Arr;

$array = [1, '1', 2, '2'];

$filtered = Arr::onlyValues($array, [1, 2], strict: true);

// [1, 2]
```

<a name="method-array-partition"></a>
#### `Arr::partition()` {.collection-method}

`Arr::partition`メソッドは、PHP配列の分割代入と組み合わせ、真偽判定にパスした要素とそうでない要素を分離します。

```php
<?php

use Illuminate\Support\Arr;

$numbers = [1, 2, 3, 4, 5, 6];

[$underThree, $equalOrAboveThree] = Arr::partition($numbers, function (int $i) {
    return $i < 3;
});

dump($underThree);

// [1, 2]

dump($equalOrAboveThree);

// [3, 4, 5, 6]
```

<a name="method-array-pluck"></a>
#### `Arr::pluck()` {.collection-method}

`Arr::pluck`メソッドは配列中の指定キーに対する値をすべて取得します。

```php
use Illuminate\Support\Arr;

$array = [
    ['developer' => ['id' => 1, 'name' => 'Taylor']],
    ['developer' => ['id' => 2, 'name' => 'Abigail']],
];

$names = Arr::pluck($array, 'developer.name');

// ['Taylor', 'Abigail']
```

さらに、結果のリストのキー項目も指定できます。

```php
use Illuminate\Support\Arr;

$names = Arr::pluck($array, 'developer.name', 'developer.id');

// [1 => 'Taylor', 2 => 'Abigail']
```

<a name="method-array-prepend"></a>
#### `Arr::prepend()` {.collection-method}

`Arr::prepend`メソッドは配列の先頭にアイテムを追加します。

```php
use Illuminate\Support\Arr;

$array = ['one', 'two', 'three', 'four'];

$array = Arr::prepend($array, 'zero');

// ['zero', 'one', 'two', 'three', 'four']
```

必要であれば、値に対するキーを指定できます。

```php
use Illuminate\Support\Arr;

$array = ['price' => 100];

$array = Arr::prepend($array, 'Desk', 'name');

// ['name' => 'Desk', 'price' => 100]
```

<a name="method-array-prependkeyswith"></a>
#### `Arr::prependKeysWith()` {.collection-method}

`Arr::prependKeysWith`は、連想配列のすべてのキー名の前に、指定したプレフィックスを付加します。

```php
use Illuminate\Support\Arr;

$array = [
    'name' => 'Desk',
    'price' => 100,
];

$keyed = Arr::prependKeysWith($array, 'product.');

/*
    [
        'product.name' => 'Desk',
        'product.price' => 100,
    ]
*/
```

<a name="method-array-pull"></a>
#### `Arr::pull()` {.collection-method}

`Arr::pull`メソッドは配列から指定キー／値ペアを取得し、同時に削除します。

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Desk', 'price' => 100];

$name = Arr::pull($array, 'name');

// $name: Desk

// $array: ['price' => 100]
```

メソッドの第３引数として、デフォルト値を渡せます。この値はキーが存在しない場合に返されます。

```php
use Illuminate\Support\Arr;

$value = Arr::pull($array, $key, $default);
```

<a name="method-array-push"></a>
#### `Arr::push()` {.collection-method}

`Arr::push`メソッドは、ドット表記を使用して配列へアイテムを追加します。指定したキーに配列が存在しない場合は、その配列を作成します。

```php
use Illuminate\Support\Arr;

$array = [];

Arr::push($array, 'office.furniture', 'Desk');

// $array: ['office' => ['furniture' => ['Desk']]]
```

<a name="method-array-query"></a>
#### `Arr::query()` {.collection-method}

`Arr::query`メソッドは配列をクエリ文字列へ変換します。

```php
use Illuminate\Support\Arr;

$array = [
    'name' => 'Taylor',
    'order' => [
        'column' => 'created_at',
        'direction' => 'desc'
    ]
];

Arr::query($array);

// name=Taylor&order[column]=created_at&order[direction]=desc
```

<a name="method-array-random"></a>
#### `Arr::random()` {.collection-method}

`Arr::random`メソッドは配列からランダムに値を返します。

```php
use Illuminate\Support\Arr;

$array = [1, 2, 3, 4, 5];

$random = Arr::random($array);

// 4 - (retrieved randomly)
```

オプションの２番目の引数に返すアイテム数を指定することもできます。この引数を指定すると、アイテムが１つだけ必要な場合でも、配列が返されることに注意してください。

```php
use Illuminate\Support\Arr;

$items = Arr::random($array, 2);

// [2, 5] - (retrieved randomly)
```

<a name="method-array-reject"></a>
#### `Arr::reject()` {.collection-method}

`Arr::reject`メソッドは、指定クロージャを使い配列から項目を削除します。

```php
use Illuminate\Support\Arr;

$array = [100, '200', 300, '400', 500];

$filtered = Arr::reject($array, function (string|int $value, int $key) {
    return is_string($value);
});

// [0 => 100, 2 => 300, 4 => 500]
```

<a name="method-array-select"></a>
#### `Arr::select()` {.collection-method}

`Arr::select`メソッドは、配列から値の配列を選択します。

```php
use Illuminate\Support\Arr;

$array = [
    ['id' => 1, 'name' => 'Desk', 'price' => 200],
    ['id' => 2, 'name' => 'Table', 'price' => 150],
    ['id' => 3, 'name' => 'Chair', 'price' => 300],
];

Arr::select($array, ['name', 'price']);

// [['name' => 'Desk', 'price' => 200], ['name' => 'Table', 'price' => 150], ['name' => 'Chair', 'price' => 300]]
```

<a name="method-array-set"></a>
#### `Arr::set()` {.collection-method}

`Arr::set`メソッドは「ドット」記法を使用し、深くネストした配列に値をセットします。

```php
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

Arr::set($array, 'products.desk.price', 200);

// ['products' => ['desk' => ['price' => 200]]]
```

<a name="method-array-shuffle"></a>
#### `Arr::shuffle()` {.collection-method}

`Arr::shuffle`メソッドは、配列中のアイテムをランダムにシャッフルします。

```php
use Illuminate\Support\Arr;

$array = Arr::shuffle([1, 2, 3, 4, 5]);

// [3, 2, 5, 1, 4] - (generated randomly)
```

<a name="method-array-sole"></a>
#### `Arr::sole()` {.collection-method}

`Arr::sole`メソッドは、指定クロージャを使用して配列から単一の値を取得します。指定した真偽テストに複数の配列値がマッチする場合、`Illuminate\Support\MultipleItemsFoundException`例外をなげます。真偽テストにマッチする値がない場合、`Illuminate\Support\ItemNotFoundException`例外を投げます。

```php
use Illuminate\Support\Arr;

$array = ['Desk', 'Table', 'Chair'];

$value = Arr::sole($array, fn (string $value) => $value === 'Desk');

// 'Desk'
```

<a name="method-array-some"></a>
#### `Arr::some()` {.collection-method}

`Arr::some`メソッドは、配列内の値のうち最低１つが指定した真偽テストに合格することを保証します。

```php
use Illuminate\Support\Arr;

$array = [1, 2, 3];

Arr::some($array, fn ($i) => $i > 2);

// true
```

<a name="method-array-sort"></a>
#### `Arr::sort()` {.collection-method}

`Arr::sort`メソッドは、配列の値に基づきソートします。

```php
use Illuminate\Support\Arr;

$array = ['Desk', 'Table', 'Chair'];

$sorted = Arr::sort($array);

// ['Chair', 'Desk', 'Table']
```

指定するクロージャの結果で配列を並べ替えることもできます。

```php
use Illuminate\Support\Arr;

$array = [
    ['name' => 'Desk'],
    ['name' => 'Table'],
    ['name' => 'Chair'],
];

$sorted = array_values(Arr::sort($array, function (array $value) {
    return $value['name'];
}));

/*
    [
        ['name' => 'Chair'],
        ['name' => 'Desk'],
        ['name' => 'Table'],
    ]
*/
```

<a name="method-array-sort-desc"></a>
#### `Arr::sortDesc()` {.collection-method}

`Arr::sortDesc`メソッドは、配列を値の降順でソートします。

```php
use Illuminate\Support\Arr;

$array = ['Desk', 'Table', 'Chair'];

$sorted = Arr::sortDesc($array);

// ['Table', 'Desk', 'Chair']
```

指定するクロージャの結果で配列を並べ替えることもできます。

```php
use Illuminate\Support\Arr;

$array = [
    ['name' => 'Desk'],
    ['name' => 'Table'],
    ['name' => 'Chair'],
];

$sorted = array_values(Arr::sortDesc($array, function (array $value) {
    return $value['name'];
}));

/*
    [
        ['name' => 'Table'],
        ['name' => 'Desk'],
        ['name' => 'Chair'],
    ]
*/
```

<a name="method-array-sort-recursive"></a>
#### `Arr::sortRecursive()` {.collection-method}

`Arr::sortRecursive`メソッドは、数値インデックス付きサブ配列の場合は`sort`関数を使用し、連想サブ配列の場合は`ksort`関数を使用して、配列を再帰的に並べ替えます。

```php
use Illuminate\Support\Arr;

$array = [
    ['Roman', 'Taylor', 'Li'],
    ['PHP', 'Ruby', 'JavaScript'],
    ['one' => 1, 'two' => 2, 'three' => 3],
];

$sorted = Arr::sortRecursive($array);

/*
    [
        ['JavaScript', 'PHP', 'Ruby'],
        ['one' => 1, 'three' => 3, 'two' => 2],
        ['Li', 'Roman', 'Taylor'],
    ]
*/
```

結果を降順にソートしたい場合は、`Arr::sortRecursiveDesc`メソッドを使用します。

```php
$sorted = Arr::sortRecursiveDesc($array);
```

<a name="method-array-string"></a>
#### `Arr::string()` {.collection-method}

`Arr::string`メソッドは[Arr::get()](#method-array-get)と同様に、深くネストした配列から「ドット」記法で値を取得します。しかし、要求した値が`string`でない場合は、`InvalidArgumentException`を投げます。

```
use Illuminate\Support\Arr;

$array = ['name' => 'Joe', 'languages' => ['PHP', 'Ruby']];

$value = Arr::string($array, 'name');

// Joe

$value = Arr::string($array, 'languages');

// InvalidArgumentExceptionを投げる
```

<a name="method-array-take"></a>
#### `Arr::take()` {.collection-method}

`Arr::take`メソッドは、指定数のアイテムを持つ新しい配列を返します。

```php
use Illuminate\Support\Arr;

$array = [0, 1, 2, 3, 4, 5];

$chunk = Arr::take($array, 3);

// [0, 1, 2]
```

負の整数を渡し、配列の末尾から指定数の項目を取り出すこともできます。

```php
$array = [0, 1, 2, 3, 4, 5];

$chunk = Arr::take($array, -2);

// [4, 5]
```

<a name="method-array-to-css-classes"></a>
#### `Arr::toCssClasses()` {.collection-method}

`Arr::toCssClasses`メソッドは、CSSクラス文字列を条件付きでコンパイルします。この方法はクラスの配列を引数に取り、配列キーに追加したいクラス、値は論理式です。配列要素に数字キーがある場合は、レンダするクラスリストへ常に含めます。

```php
use Illuminate\Support\Arr;

$isActive = false;
$hasError = true;

$array = ['p-4', 'font-bold' => $isActive, 'bg-red' => $hasError];

$classes = Arr::toCssClasses($array);

/*
    'p-4 bg-red'
*/
```

<a name="method-array-to-css-styles"></a>
#### `Arr::toCssStyles()` {.collection-method}

`Arr::toCssStyles`メソッドは、条件に基づいてCSSスタイル文字列を生成します。このメソッドはCSS宣言の配列を受け取ります。配列のキーには追加したいCSS宣言を指定し、値には論理式を指定します。配列要素のキーが数値の場合は、生成するCSSスタイル文字列へ常にその要素を含めます。

```php
use Illuminate\Support\Arr;

$hasColor = true;

$array = ['background-color: blue', 'color: blue' => $hasColor];

$classes = Arr::toCssStyles($array);

/*
    'background-color: blue; color: blue;'
*/
```

このメソッドは、[Bladeコンポーネントのアトリビュートバッグを使ったクラスのマージ](/docs/{{version}}/blade#conditionally-merge-classes)と、`@class` [Bladeディレクティブ](/docs/{{version}}/blade#conditional-classes)を提供するLaravelの機能を強化します。

<a name="method-array-undot"></a>
#### `Arr::undot()` {.collection-method}

`Arr::undot`メソッドは、「ドット」記法を用いた一次元配列を多次元配列へ展開します。

```php
use Illuminate\Support\Arr;

$array = [
    'user.name' => 'Kevin Malone',
    'user.occupation' => 'Accountant',
];

$array = Arr::undot($array);

// ['user' => ['name' => 'Kevin Malone', 'occupation' => 'Accountant']]
```

<a name="method-array-where"></a>
#### `Arr::where()` {.collection-method}

`Arr::where`メソッドは、指定したクロージャを使用して配列をフィルタリングします。

```php
use Illuminate\Support\Arr;

$array = [100, '200', 300, '400', 500];

$filtered = Arr::where($array, function (string|int $value, int $key) {
    return is_string($value);
});

// [1 => '200', 3 => '400']
```

<a name="method-array-where-not-null"></a>
#### `Arr::whereNotNull()` {.collection-method}

`Arr::whereNotNull`メソッドは、指定する配列からすべての`null`値を削除します。

```php
use Illuminate\Support\Arr;

$array = [0, null];

$filtered = Arr::whereNotNull($array);

// [0 => 0]
```

<a name="method-array-wrap"></a>
#### `Arr::wrap()` {.collection-method}

`Arr::wrap`メソッドは、指定した値を配列にラップします。指定した値がすでに配列にある場合は、変更せずに返します。

```php
use Illuminate\Support\Arr;

$string = 'Laravel';

$array = Arr::wrap($string);

// ['Laravel']
```

指定値が`null`の場合、空の配列を返します。

```php
use Illuminate\Support\Arr;

$array = Arr::wrap(null);

// []
```

<a name="method-data-fill"></a>
#### `data_fill()` {.collection-method}

`data_fill`関数は「ドット」記法を使用し、ターゲットの配列やオブジェクトへ足りない値をセットします。

```php
$data = ['products' => ['desk' => ['price' => 100]]];

data_fill($data, 'products.desk.price', 200);

// ['products' => ['desk' => ['price' => 100]]]

data_fill($data, 'products.desk.discount', 10);

// ['products' => ['desk' => ['price' => 100, 'discount' => 10]]]
```

この関数はアスタリスクもワイルドカードとして受け取り、それに応じてターゲットにデータを埋め込みます。

```php
$data = [
    'products' => [
        ['name' => 'Desk 1', 'price' => 100],
        ['name' => 'Desk 2'],
    ],
];

data_fill($data, 'products.*.price', 200);

/*
    [
        'products' => [
            ['name' => 'Desk 1', 'price' => 100],
            ['name' => 'Desk 2', 'price' => 200],
        ],
    ]
*/
```

<a name="method-data-get"></a>
#### `data_get()` {.collection-method}

`data_get`関数は「ドット」記法を使用し、ネストした配列やオブジェクトから値を取得します。

```php
$data = ['products' => ['desk' => ['price' => 100]]];

$price = data_get($data, 'products.desk.price');

// 100
```

`data_get`関数は、指定したキーが存在しない場合に返す、デフォルト値も指定できます。

```php
$discount = data_get($data, 'products.desk.discount', 0);

// 0
```

配列やオブジェクトのいずれのキーにもマッチする、ワイルドカードとしてアスタリスクも使用できます。

```php
$data = [
    'product-one' => ['name' => 'Desk 1', 'price' => 100],
    'product-two' => ['name' => 'Desk 2', 'price' => 150],
];

data_get($data, '*.name');

// ['Desk 1', 'Desk 2'];
```

`{first}`と`{last}`プレースホルダを使うと、配列の最初または最後の項目を取り出せます。

```php
$flight = [
    'segments' => [
        ['from' => 'LHR', 'departure' => '9:00', 'to' => 'IST', 'arrival' => '15:00'],
        ['from' => 'IST', 'departure' => '16:00', 'to' => 'PKX', 'arrival' => '20:00'],
    ],
];

data_get($flight, 'segments.{first}.arrival');

// 15:00
```

<a name="method-data-set"></a>
#### `data_set()` {.collection-method}

`data_set`関数は「ドット」記法を使用し、ネストした配列やオブジェクトに値をセットします。

```php
$data = ['products' => ['desk' => ['price' => 100]]];

data_set($data, 'products.desk.price', 200);

// ['products' => ['desk' => ['price' => 200]]]
```

この関数は、アスタリスクを使用したワイルドカードも受け入れ、それに応じてターゲットに値を設定します。

```php
$data = [
    'products' => [
        ['name' => 'Desk 1', 'price' => 100],
        ['name' => 'Desk 2', 'price' => 150],
    ],
];

data_set($data, 'products.*.price', 200);

/*
    [
        'products' => [
            ['name' => 'Desk 1', 'price' => 200],
            ['name' => 'Desk 2', 'price' => 200],
        ],
    ]
*/
```

デフォルトでは、既存の値はすべて上書きされます。値が存在しない場合にのみ値をセットする場合は、関数の4番目の引数に`false`を渡してください。

```php
$data = ['products' => ['desk' => ['price' => 100]]];

data_set($data, 'products.desk.price', 200, overwrite: false);

// ['products' => ['desk' => ['price' => 100]]]
```

<a name="method-data-forget"></a>
#### `data_forget()` {.collection-method}

`data_forget`関数は「ドット」記法を使い、ネストした配列やオブジェクト内の値を削除します。

```php
$data = ['products' => ['desk' => ['price' => 100]]];

data_forget($data, 'products.desk.price');

// ['products' => ['desk' => []]]
```

この関数は、アスタリスクを使ったワイルドカードも受け付け、適応するターゲットの値を削除します。

```php
$data = [
    'products' => [
        ['name' => 'Desk 1', 'price' => 100],
        ['name' => 'Desk 2', 'price' => 150],
    ],
];

data_forget($data, 'products.*.price');

/*
    [
        'products' => [
            ['name' => 'Desk 1'],
            ['name' => 'Desk 2'],
        ],
    ]
*/
```

<a name="method-head"></a>
#### `head()` {.collection-method}

`head`関数は、配列の最初の要素を返します。空配列の場合は、`false`を返します。

```php
$array = [100, 200, 300];

$first = head($array);

// 100
```

<a name="method-last"></a>
#### `last()` {.collection-method}

`last`関数は指定した配列の最後の要素を返します。空配列の場合は、`false`を返します。

```php
$array = [100, 200, 300];

$last = last($array);

// 300
```

<a name="numbers"></a>
## 数値

<a name="method-number-abbreviate"></a>
#### `Number::abbreviate()` {.collection-method}

`Number::abbreviate`メソッドは、指定値を人間が読みやすい形式に、単位の週略系をつけて返します。

```php
use Illuminate\Support\Number;

$number = Number::abbreviate(1000);

// 1K

$number = Number::abbreviate(489939);

// 490K

$number = Number::abbreviate(1230000, precision: 2);

// 1.23M
```

<a name="method-number-clamp"></a>
#### `Number::clamp()` {.collection-method}

`Number::clamp`メソッドは、指定値を指定範囲内に収めます。数値が最小値より小さい場合は最小値を返します。数値が最大値より大きい場合は、最大値を返します。

```php
use Illuminate\Support\Number;

$number = Number::clamp(105, min: 10, max: 100);

// 100

$number = Number::clamp(5, min: 10, max: 100);

// 10

$number = Number::clamp(10, min: 10, max: 100);

// 10

$number = Number::clamp(20, min: 10, max: 100);

// 20
```

<a name="method-number-currency"></a>
#### `Number::currency()` {.collection-method}

`Number::currency`メソッドは、指定値の通貨表現を文字列として返します。

```php
use Illuminate\Support\Number;

$currency = Number::currency(1000);

// $1,000.00

$currency = Number::currency(1000, in: 'EUR');

// €1,000.00

$currency = Number::currency(1000, in: 'EUR', locale: 'de');

// 1.000,00 €

$currency = Number::currency(1000, in: 'EUR', locale: 'de', precision: 0);

// 1.000 €
```

<a name="method-default-currency"></a>
#### `Number::defaultCurrency()` {.collection-method}

`Number::defaultCurrency`メソッドは、`Number`クラスが使用するデフォルトの通貨を返します。

```php
use Illuminate\Support\Number;

$currency = Number::defaultCurrency();

// USD
```

<a name="method-default-locale"></a>
#### `Number::defaultLocale()` {.collection-method}

`Number::defaultLocale`メソッドは、`Number`クラスが使用しているデフォルトのロケールを返します。

```php
use Illuminate\Support\Number;

$locale = Number::defaultLocale();

// en
```

<a name="method-number-file-size"></a>
#### `Number::fileSize()` {.collection-method}

`Number::fileSize`メソッドは、指定バイト値をファイルサイズ表現の文字列として返します。

```php
use Illuminate\Support\Number;

$size = Number::fileSize(1024);

// 1 KB

$size = Number::fileSize(1024 * 1024);

// 1 MB

$size = Number::fileSize(1024, precision: 2);

// 1.00 KB
```

<a name="method-number-for-humans"></a>
#### `Number::forHumans()` {.collection-method}

`Number::forHumans`メソッドは、指定値を人間が読める形式で返します。

```php
use Illuminate\Support\Number;

$number = Number::forHumans(1000);

// 1 thousand

$number = Number::forHumans(489939);

// 490 thousand

$number = Number::forHumans(1230000, precision: 2);

// 1.23 million
```

<a name="method-number-format"></a>
#### `Number::format()` {.collection-method}

`Number::format`メソッドは、指定値をロケール固有の文字列に整形します。

```php
use Illuminate\Support\Number;

$number = Number::format(100000);

// 100,000

$number = Number::format(100000, precision: 2);

// 100,000.00

$number = Number::format(100000.123, maxPrecision: 2);

// 100,000.12

$number = Number::format(100000, locale: 'de');

// 100.000
```

<a name="method-number-ordinal"></a>
#### `Number::ordinal()` {.collection-method}

`Number::ordinal`メソッドは、数値の序数英語表現を返します。

```php
use Illuminate\Support\Number;

$number = Number::ordinal(1);

// 1st

$number = Number::ordinal(2);

// 2nd

$number = Number::ordinal(21);

// 21st
```

<a name="method-number-pairs"></a>
#### `Number::pairs()` {.collection-method}

`Number::pairs`メソッドは、指定する範囲とステップ値に基づき、数値のペア（部分範囲）の配列を生成します。このメソッドは、ペジネーションやバッチ処理などのために、大きな範囲の数値を管理しやすい小さな範囲に分割するのに便利です。`pairs`メソッドは配列の配列を返し、各内部配列は数値のペア（部分範囲）を表します。

```php
use Illuminate\Support\Number;

$result = Number::pairs(25, 10);

// [[0, 9], [10, 19], [20, 25]]

$result = Number::pairs(25, 10, offset: 0);

// [[0, 10], [10, 20], [20, 25]]
```

<a name="method-number-parse-int"></a>
#### `Number::parseInt()` {.collection-method}

`Number::parseInt`メソッドは、指定したロケールに従い文字列を整数にパースします。

```php
use Illuminate\Support\Number;

$result = Number::parseInt('10.123');

// (int) 10

$result = Number::parseInt('10,123', locale: 'fr');

// (int) 10
```

<a name="method-number-parse-float"></a>
#### `Number::parseFloat()` {.collection-method}

`Number::parseFloat`メソッドは、指定ロケールに従い文字列を浮動小数点数にパースします。

```php
use Illuminate\Support\Number;

$result = Number::parseFloat('10');

// (float) 10.0

$result = Number::parseFloat('10', locale: 'fr');

// (float) 10.0
```

<a name="method-number-percentage"></a>
#### `Number::percentage()` {.collection-method}

`Number::percentage`メソッドは、指定値のパーセンテージ表現を文字列で返します。

```php
use Illuminate\Support\Number;

$percentage = Number::percentage(10);

// 10%

$percentage = Number::percentage(10, precision: 2);

// 10.00%

$percentage = Number::percentage(10.123, maxPrecision: 2);

// 10.12%

$percentage = Number::percentage(10, precision: 2, locale: 'de');

// 10,00%
```

<a name="method-number-spell"></a>
#### `Number::spell()` {.collection-method}

Number::spell`メソッドは、指定する数字を単語の文字列へ変換します。

```php
use Illuminate\Support\Number;

$number = Number::spell(102);

// one hundred and two

$number = Number::spell(88, locale: 'fr');

// quatre-vingt-huit
```

`after`引数は、これより大きい数字は文字へ変換する値を指定します。

```php
$number = Number::spell(10, after: 10);

// 10

$number = Number::spell(11, after: 10);

// eleven
```

`until`引数は、これより大きい数字は文字へ変換する値を指定します。

```php
$number = Number::spell(5, until: 10);

// five

$number = Number::spell(10, until: 10);

// 10
```

<a name="method-number-spell-ordinal"></a>
#### `Number::spellOrdinal()` {.collection-method}

`Number::spellOrdinal`メソッドは、数値の序数を単語の文字列として返します。

```php
use Illuminate\Support\Number;

$number = Number::spellOrdinal(1);

// first

$number = Number::spellOrdinal(2);

// second

$number = Number::spellOrdinal(21);

// twenty-first
```

<a name="method-number-trim"></a>
#### `Number::trim()` {.collection-method}

`Number::trim`メソッドは、指定した数値の小数点以下の末尾にあるゼロをすべて削除します。

```php
use Illuminate\Support\Number;

$number = Number::trim(12.0);

// 12

$number = Number::trim(12.30);

// 12.3
```

<a name="method-number-use-locale"></a>
#### `Number::useLocale()` {.collection-method}

`Number::useLocale`メソッドはデフォルトの数値ロケールをグローバルに指定します。この指定は、以降に実行する`Number`クラスのメソッドの数字や金額のフォーマットに影響を与えます。

```php
use Illuminate\Support\Number;

/**
 * 全アプリケーションサービスの初期起動処理
 */
public function boot(): void
{
    Number::useLocale('de');
}
```

<a name="method-number-with-locale"></a>
#### `Number::withLocale()` {.collection-method}

`Number::withLocale`メソッドは、指定ロケールを用いてクロージャを実行し、コールバック実行後に元のロケールに戻します。

```php
use Illuminate\Support\Number;

$number = Number::withLocale('de', function () {
    return Number::format(1500);
});
```

<a name="method-number-use-currency"></a>
#### `Number::useCurrency()` {.collection-method}

`Number::useCurrency`メソッドは、デフォルトの数値通貨をグローバルに設定し、それ以降の`Number`クラスのメソッドを呼び出す際に、通貨をどのようにフォーマットするかに影響します。

```php
use Illuminate\Support\Number;

/**
 * 全アプリケーションサービスの初期起動処理
 */
public function boot(): void
{
    Number::useCurrency('GBP');
}
```

<a name="method-number-with-currency"></a>
#### `Number::withCurrency()` {.collection-method}

`Number::withCurrency`メソッドは渡したクロージャを指定通貨で実行し、コールバックが実行された後に元の通貨に戻します。

```php
use Illuminate\Support\Number;

$number = Number::withCurrency('GBP', function () {
    // ...
});
```

<a name="paths"></a>
## パス

<a name="method-app-path"></a>
#### `app_path()` {.collection-method}

`app_path`関数は、アプリケーションの`app`ディレクトリの完全修飾パスを返します。`app_path`関数を使用して、アプリケーションディレクトリに関連するファイルへの完全修飾パスを生成することもできます。

```php
$path = app_path();

$path = app_path('Http/Controllers/Controller.php');
```

<a name="method-base-path"></a>
#### `base_path()` {.collection-method}

`base_path`関数は、アプリケーションのルートディレクトリへの完全修飾パスを返します。`base_path`関数を使用して、プロジェクトのルートディレクトリに関連する特定のファイルへの完全修飾パスを生成することもできます。

```php
$path = base_path();

$path = base_path('vendor/bin');
```

<a name="method-config-path"></a>
#### `config_path()` {.collection-method}

`config_path`関数は、アプリケーションの`config`ディレクトリへの完全修飾パスを返します。`config_path`関数を使用して、アプリケーションの構成ディレクトリ内の特定のファイルへの完全修飾パスを生成することもできます。

```php
$path = config_path();

$path = config_path('app.php');
```

<a name="method-database-path"></a>
#### `database_path()` {.collection-method}

`database_path`関数は、アプリケーションの`database`ディレクトリへの完全修飾パスを返します。`database_path`関数を使用して、データベースディレクトリ内の特定のファイルへの完全修飾パスを生成することもできます。

```php
$path = database_path();

$path = database_path('factories/UserFactory.php');
```

<a name="method-lang-path"></a>
#### `lang_path()` {.collection-method}

`lang_path`関数は、アプリケーションの`lang`ディレクトリの完全修飾パスを返します。また、`lang_path`関数を使用して、ディレクトリ内の指定したファイルの完全修飾パスを生成することもできます。

```php
$path = lang_path();

$path = lang_path('en/messages.php');
```

> [!NOTE]
> Laravelアプリケーションのスケルトンは、デフォルトで`lang`ディレクトリを用意していません。Laravelの言語ファイルをカスタマイズしたい場合は、`lang:publish` Artisanコマンドでリソース公開することができます。

<a name="method-public-path"></a>
#### `public_path()` {.collection-method}

`public_path`関数は、アプリケーションの`public`ディレクトリへの完全修飾パスを返します。`public_path`関数を使用して、パブリックディレクトリ内の特定のファイルへの完全修飾パスを生成することもできます。

```php
$path = public_path();

$path = public_path('css/app.css');
```

<a name="method-resource-path"></a>
#### `resource_path()` {.collection-method}

`resource_path`関数は、アプリケーションの`resources`ディレクトリへの完全修飾パスを返します。`resource_path`関数を使用して、リソースディレクトリ内の特定のファイルへの完全修飾パスを生成することもできます。

```php
$path = resource_path();

$path = resource_path('sass/app.scss');
```

<a name="method-storage-path"></a>
#### `storage_path()` {.collection-method}

`storage_path`関数は、アプリケーションの`storage`ディレクトリへの完全修飾パスを返します。`storage_path`関数を使用して、ストレージディレクトリ内の特定のファイルへの完全修飾パスを生成することもできます。

```php
$path = storage_path();

$path = storage_path('app/file.txt');
```

<a name="urls"></a>
## URL

<a name="method-action"></a>
#### `action()` {.collection-method}

`action`関数は、指定されたコントローラアクションのURLを生成します。

```php
use App\Http\Controllers\HomeController;

$url = action([HomeController::class, 'index']);
```

メソッドがルートパラメータを受け付ける場合は、第２引数で指定してください。

```php
$url = action([UserController::class, 'profile'], ['id' => 1]);
```

<a name="method-asset"></a>
#### `asset()` {.collection-method}

`asset`関数は、現在のリクエストのスキーマ（HTTPかHTTPS）を使い、アセットへのURLを生成します。

```php
$url = asset('img/photo.jpg');
```

`.env`ファイルで`ASSET_URL`変数を設定することにより、アセットURLホストを設定できます。これは、AmazonS3や別のCDNなどの外部サービスでアセットをホストする場合に役立ちます。

```php
// ASSET_URL=http://example.com/assets

$url = asset('img/photo.jpg'); // http://example.com/assets/img/photo.jpg
```

<a name="method-route"></a>
#### `route()` {.collection-method}

`route`関数は、指定した[名前付きルート](/docs/{{version}}/routing#named-routes)のURLを生成します。

```php
$url = route('route.name');
```

ルートがパラメータを受け入れる場合は、それらを関数の２番目の引数として渡すことができます。

```php
$url = route('route.name', ['id' => 1]);
```

デフォルトでは、`route`関数は絶対URLを生成します。相対URLを生成する場合は、関数の３番目の引数として`false`を渡してください。

```php
$url = route('route.name', ['id' => 1], false);
```

<a name="method-secure-asset"></a>
#### `secure_asset()` {.collection-method}

`secure_asset`関数はHTTPSを使い、アセットへのURLを生成します。

```php
$url = secure_asset('img/photo.jpg');
```

<a name="method-secure-url"></a>
#### `secure_url()` {.collection-method}

`secure_url`関数は、指定されたパスへの完全修飾HTTPS URLを生成します。関数の２番目の引数で追加のURLセグメントを渡すことができます。

```php
$url = secure_url('user/profile');

$url = secure_url('user/profile', [1]);
```

<a name="method-to-action"></a>
#### `to_action()` {.collection-method}

`to_action`関数は、指定したコントローラアクションに対する[リダイレクトHTTPレスポンス](/docs/{{version}}/responses#redirects)を生成します。

```php
use App\Http\Controllers\UserController;

return to_action([UserController::class, 'show'], ['user' => 1]);
```

必要に応じ、リダイレクトに割り当てるHTTPステータスコードと、追加のレスポンスヘッダを、`to_action`メソッドの３番目と４番目の引数として渡せます。

```php
return to_action(
    [UserController::class, 'show'],
    ['user' => 1],
    302,
    ['X-Framework' => 'Laravel']
);
```

<a name="method-to-route"></a>
#### `to_route()` {.collection-method}

`to_route`関数は、指定した[名前付きルート](/docs/{{version}}/routing#named-routes)に対して、[リダイレクトHTTPレスポンス](/docs/{{version}}/responses#redirects)を生成します。

```php
return to_route('users.show', ['user' => 1]);
```

必要であれば、`to_route`メソッドの第３，第４引数へ、リダイレクトに割り当てるHTTPステータスコードと、追加のレスポンスヘッダを指定できます。

```php
return to_route('users.show', ['user' => 1], 302, ['X-Framework' => 'Laravel']);
```

<a name="method-uri"></a>
#### `uri()` {.collection-method}

`uri`関数は、指定したURIの[読み書きしやすいURIインスタンス](#uri)を生成します。

```php
$uri = uri('https://example.com')
    ->withPath('/users')
    ->withQuery(['page' => 1]);
```

`uri`関数へ呼び出し可能なコントローラとメソッドのペアを含む配列を渡すと、コントローラメソッドのルートパスへの`Uri`インスタンスを作成します。

```php
use App\Http\Controllers\UserController;

$uri = uri([UserController::class, 'show'], ['user' => $user]);
```

コントローラがInvokableの場合は、コントローラのクラス名を指定します。

```php
use App\Http\Controllers\UserIndexController;

$uri = uri(UserIndexController::class);
```

`uri`関数へ指定した値が[名前付きルート](/docs/{{version}}/routing#named-routes)の名前と一致する場合、そのルートのパスに対する`Uri`インスタンスを生成します。

```php
$uri = uri('users.show', ['user' => $user]);
```

<a name="method-url"></a>
#### `url()` {.collection-method}

`url`関数は指定したパスへの完全なURLを生成します。

```php
$url = url('user/profile');

$url = url('user/profile', [1]);
```

パスを指定しない場合は、`Illuminate\Routing\UrlGenerator`インスタンスを返します。

```php
$current = url()->current();

$full = url()->full();

$previous = url()->previous();
```

`url`関数の取り扱いの詳細は、[URL生成ドキュメント](/docs/{{version}}/urls#generating-urls)を参照してください。

<a name="miscellaneous"></a>
## その他

<a name="method-abort"></a>
#### `abort()` {.collection-method}

`abort`関数は、[例外ハンドラ](/docs/{{version}}/errors#the-exception-handler)によりレンダされるであろう、[HTTP例外](/docs/{{version}}/errors#handling-exceptions)を投げます。

```php
abort(403);
```

ブラウザに送信する必要のある例外のメッセージとカスタムHTTP応答ヘッダを指定することもできます。

```php
abort(403, 'Unauthorized.', $headers);
```

<a name="method-abort-if"></a>
#### `abort_if()` {.collection-method}

`abort_if`関数は、指定された論理値が`true`と評価された場合に、HTTP例外を投げます。

```php
abort_if(! Auth::user()->isAdmin(), 403);
```

`abort`メソッドと同様に、例外の応答テキストを３番目の引数として指定し、カスタム応答ヘッダの配列を４番目の引数として関数に指定することもできます。

<a name="method-abort-unless"></a>
#### `abort_unless()` {.collection-method}

`abort_unless`関数は、指定した論理値が`false`と評価された場合に、HTTP例外を投げます。

```php
abort_unless(Auth::user()->isAdmin(), 403);
```

`abort`メソッドと同様に、例外の応答テキストを３番目の引数として指定し、カスタム応答ヘッダの配列を４番目の引数として関数に指定することもできます。

<a name="method-app"></a>
#### `app()` {.collection-method}

`app`関数は、[サービスコンテナ](/docs/{{version}}/container)のインスタンスを返します。

```php
$container = app();
```

コンテナにより依存解決する、クラス名かインターフェイス名を渡すこともできます。

```php
$api = app('HelpSpot\API');
```

<a name="method-auth"></a>
#### `auth()` {.collection-method}

`auth`関数は、[Authenticator](/docs/{{version}}/authentication)インスタンスを返します。`Auth`ファサードの代わりに使用できます。

```php
$user = auth()->user();
```

必要であれば、アクセスしたいガードインスタンスを指定することもできます。

```php
$user = auth('admin')->user();
```

<a name="method-back"></a>
#### `back()` {.collection-method}

`back`関数はユーザーの直前のロケーションへの[リダイレクトHTTPレスポンス](/docs/{{version}}/responses#redirects)を生成します。

```php
return back($status = 302, $headers = [], $fallback = '/');

return back();
```

<a name="method-bcrypt"></a>
#### `bcrypt()` {.collection-method}

`bcrypt`関数はBcryptを使用して指定された値を[ハッシュ](/docs/{{version}}/hashing)します。この関数は、`Hash`ファサードの代わりに使用できます。

```php
$password = bcrypt('my-secret-password');
```

<a name="method-blank"></a>
#### `blank()` {.collection-method}

`blank`関数は、指定された値が「空白」であるかどうかを判別します。

```php
blank('');
blank('   ');
blank(null);
blank(collect());

// true

blank(0);
blank(true);
blank(false);

// false
```

`blank`の逆の動作は、[filled](#method-filled)関数です。

<a name="method-broadcast"></a>
#### `broadcast()` {.collection-method}

`broadcast`関数は、指定した[イベント](/docs/{{version}}/events)をリスナへ[ブロードキャスト](/docs/{{version}}/broadcasting)します。

```php
broadcast(new UserRegistered($user));

broadcast(new UserRegistered($user))->toOthers();
```

<a name="method-broadcast-if"></a>
#### `broadcast_if()` {.collection-method}

`broadcast_if`関数は、指定した論理式が`true`と評価された場合に、指定[イベント](/docs/{{version}}/broadcasting)をリスナへブロードキャストします。

```php
broadcast_if($user->isActive(), new UserRegistered($user));

broadcast_if($user->isActive(), new UserRegistered($user))->toOthers();
```

<a name="method-broadcast-unless"></a>
#### `broadcast_unless()` {.collection-method}

`broadcast_unless`関数は、指定した論理式が`false`と評価された場合に、指定[イベント](/docs/{{version}}/broadcasting)をリスナへブロードキャストします。

```php
broadcast_unless($user->isBanned(), new UserRegistered($user));

broadcast_unless($user->isBanned(), new UserRegistered($user))->toOthers();
```

<a name="method-cache"></a>
#### `cache()` {.collection-method}

`cache`関数は[キャッシュ](/docs/{{version}}/cache)から値を取得するために使用します。キャッシュに指定したキーが存在しない場合、オプション値が返されます。

```php
$value = cache('key');

$value = cache('key', 'default');
```

関数にキー／値ペアの配列を渡すと、アイテムをキャッシュへ追加します。さらに秒数、もしくはキャッシュ値が有効であると推定される期限を渡すこともできます。

```php
cache(['key' => 'value'], 300);

cache(['key' => 'value'], now()->plus(seconds: 10));
```

<a name="method-class-uses-recursive"></a>
#### `class_uses_recursive()` {.collection-method}

`class_uses_recursive`関数は、すべての親で使われているものも含め、クラス中で使用されているトレイトをすべて返します。

```php
$traits = class_uses_recursive(App\Models\User::class);
```

<a name="method-collect"></a>
#### `collect()` {.collection-method}

`collect`関数は、指定値から[コレクション](/docs/{{version}}/collections)インスタンスを生成します。

```php
$collection = collect(['Taylor', 'Abigail']);
```

<a name="method-config"></a>
#### `config()` {.collection-method}

`config`関数は、[設定](/docs/{{version}}/configuration)変数の値を取得します。設定値はファイル名とアクセスしたいオプションを「ドット」記法で指定します。デフォルト値が指定でき、設定オプションが存在しない時に返します。

```php
$value = config('app.timezone');

$value = config('app.timezone', $default);
```

キー／値ペアの配列を渡すことにより、実行時に設定変数を設定できます。ただし、この関数は現在のリクエストの設定値にのみ影響し、実際の設定値は更新しないことに注意してください。

```php
config(['app.debug' => true]);
```

<a name="method-context"></a>
#### `context()` {.collection-method}

`context`関数は、現在の[コンテキスト](/docs/{{version}}/context)から値を取得します。デフォルト値も指定でき、コンテキストキーが存在しない場合にそれを返します。

```php
$value = context('trace_id');

$value = context('trace_id', $default);
```

コンテキストの値を設定するには、キーと値のペアの配列を渡します。

```php
use Illuminate\Support\Str;

context(['trace_id' => Str::uuid()->toString()]);
```

<a name="method-cookie"></a>
#### `cookie()` {.collection-method}

`cookie`関数は新しい[クッキー](/docs/{{version}}/requests#cookies)インスタンスを生成します。

```php
$cookie = cookie('name', 'value', $minutes);
```

<a name="method-csrf-field"></a>
#### `csrf_field()` {.collection-method}

`csrf_field`関数は、CSRFトークン値を持つHTML「隠し」入力フィールドを生成します。[ブレード記法](/docs/{{version}}/blade)を使用した例です。

```blade
{{ csrf_field() }}
```

<a name="method-csrf-token"></a>
#### `csrf_token()` {.collection-method}

`csrf_token`関数は、現在のCSRFトークン値を取得します。

```php
$token = csrf_token();
```

<a name="method-decrypt"></a>
#### `decrypt()` {.collection-method}

`decrypt`関数は、指定した値を [復号化](/docs/{{version}}/encryption) します。この関数は、`Crypt`ファサードの代わりとして使用できます。

```php
$password = decrypt($value);
```

`decrypt`の逆関数については、[encrypt](#method-encrypt)関数を参照してください。

<a name="method-dd"></a>
#### `dd()` {.collection-method}

`dd`関数は指定された変数の内容を表示し、スクリプトの実行を停止します。

```php
dd($value);

dd($value1, $value2, $value3, ...);
```

スクリプトの実行を停止したくない場合は、代わりに[dump](#method-dump)関数を使ってください。

<a name="method-dispatch"></a>
#### `dispatch()` {.collection-method}

`dispatch`関数は、指定した[ジョブ](/docs/{{version}}/queues#creating-jobs)をLaravelの[ジョブキュー](/docs/{{version}}/queues)へ投入します。

```php
dispatch(new App\Jobs\SendEmails);
```

<a name="method-dispatch-sync"></a>
#### `dispatch_sync()` {.collection-method}

dispatch_sync`関数は、指定ジョブを即時処理する[sync](/docs/{{version}}/queues#synchronous-dispatching)キューへ投入します。

```php
dispatch_sync(new App\Jobs\SendEmails);
```

<a name="method-dump"></a>
#### `dump()` {.collection-method}

`dump`関数は指定した変数をダンプします。

```php
dump($value);

dump($value1, $value2, $value3, ...);
```

変数の値をダンプした後に実行を停止したい場合は、代わりに[dd](#method-dd)関数を使用してください。

<a name="method-encrypt"></a>
#### `encrypt()` {.collection-method}

`encrypt`関数は、指定した値を[暗号化](/docs/{{version}}/encryption)します。この関数は、`Crypt`ファサードの代わりに使用できます。

```php
$secret = encrypt('my-secret-value');
```

`encrypt`の逆関数については、[decrypt](#method-decrypt)関数を参照してください。

<a name="method-env"></a>
#### `env()` {.collection-method}

`env`関数は[環境変数](/docs/{{version}}/configuration#environment-configuration)の値を取得します。取得できない場合はデフォルト値を返します。

```php
$env = env('APP_ENV');

$env = env('APP_ENV', 'production');
```

> [!WARNING]
> 開発手順の中で`config:cache`コマンドを実行する場合は、必ず設定ファイルの中からだけ、`env`関数を使用してください。設定ファイルがキャッシュされると、`.env`ファイルはロードされなくなり、すべての`env`関数の呼び出しは、サーバレベルやシステムレベルの環境変数のような外部環境変数を返すか、もしくは`null`を返します。

<a name="method-event"></a>
#### `event()` {.collection-method}

`event`関数は、指定した[イベント](/docs/{{version}}/events)をリスナにディスパッチします。

```php
event(new UserRegistered($user));
```

<a name="method-fake"></a>
#### `fake()` {.collection-method}

`fake`関数は、コンテナから[Faker](https://github.com/FakerPHP/Faker)シングルトンを依存解決します。これは、モデルファクトリ、データベース初期値設定、テスト、プロトタイピングビューでフェイクデータを作成する場合に便利です。

```blade
@for ($i = 0; $i < 10; $i++)
    <dl>
        <dt>Name</dt>
        <dd>{{ fake()->name() }}</dd>

        <dt>Email</dt>
        <dd>{{ fake()->unique()->safeEmail() }}</dd>
    </dl>
@endfor
```

`fake`関数はデフォルトで、`config/app.php`設定にある、`app.faker_locale`設定オプションを利用します。通常、この設定オプションは`APP_FAKER_LOCALE`環境変数で設定します。また、ロケールを`fake`関数へ渡して指定することもできます。各ロケールは個別のシングルトンを解決します。

```php
fake('nl_NL')->name()
```

<a name="method-filled"></a>
#### `filled()` {.collection-method}

`filled`期間関数は、指定された値が「空白」でないかどうかを判別します。

```php
filled(0);
filled(true);
filled(false);

// true

filled('');
filled('   ');
filled(null);
filled(collect());

// false
```

`filled`の逆関数については、[blank](#method-blank)関数を参照してください。

<a name="method-info"></a>
#### `info()` {.collection-method}

`info`関数は、アプリケーションの[ログ](/docs/{{version}}/logging)へ情報を書き込みます。

```php
info('Some helpful information!');
```

関連情報の配列を関数へ渡すこともできます。

```php
info('User login attempt failed.', ['id' => $user->id]);
```

<a name="method-literal"></a>
#### `literal()` {.collection-method}

`literal`関数は、指定した名前付き引数をプロパティとして持つ、新しい[stdClass](https://www.php.net/manual/ja/class.stdclass.php)インスタンスを作成します。

```php
$obj = literal(
    name: 'Joe',
    languages: ['PHP', 'Ruby'],
);

$obj->name; // 'Joe'
$obj->languages; // ['PHP', 'Ruby']
```

<a name="method-logger"></a>
#### `logger()` {.collection-method}

`logger`関数は、`debug`レベルのメッセージを[ログ](/docs/{{version}}/logging)へ書き出します。

```php
logger('Debug message');
```

関連情報の配列を関数へ渡すこともできます。

```php
logger('User has logged in.', ['id' => $user->id]);
```

関数に値を渡さない場合は、[ロガー](/docs/{{version}}/logging)インスタンスが返されます。

```php
logger()->error('You are not allowed here.');
```

<a name="method-method-field"></a>
#### `method_field()` {.collection-method}

`method_field`関数はフォームのHTTP動詞の見せかけの値を保持する「隠し」HTTP入力フィールドを生成します。[Blade記法](/docs/{{version}}/blade)を使う例です。

```blade
<form method="POST">
    {{ method_field('DELETE') }}
</form>
```

<a name="method-now"></a>
#### `now()` {.collection-method}

`now`関数は、現時点を表す新しい`Illuminate\Support\Carbon`インスタンスを生成します。

```php
$now = now();
```

<a name="method-old"></a>
#### `old()` {.collection-method}

`old`関数はセッションに一時保持データーとして保存されている[直前の入力値](/docs/{{version}}/requests#old-input)を[取得](/docs/{{version}}/requests#retrieving-input)します。

```php
$value = old('value');

$value = old('value', 'default');
```

`old`関数の第２引数として指定される「デフォルト値」は、Eloquentモデルの属性であることが多いため、LaravelではEloquentモデル全体を`old`関数の第２引数として渡せるようになっています。この場合、Laravelは`old`関数に渡された最初の引数を「デフォルト値」とみなすべきEloquent属性の名前として扱います。

```blade
{{ old('name', $user->name) }}

// Is equivalent to...

{{ old('name', $user) }}
```

<a name="method-once"></a>
#### `once()` {.collection-method}

`once`関数は、指定したコールバックを実行し、リクエストの間、結果をメモリへキャッシュします。以降、同じコールバックを使用して、`once`関数を呼び出すと、以前にキャッシュした結果を返します。

```php
function random(): int
{
    return once(function () {
        return random_int(1, 1000);
    });
}

random(); // 123
random(); // 123 (cached result)
random(); // 123 (cached result)
```

オブジェクトインスタンス内から、`once`関数を実行すると、キャッシュされる結果はそのオブジェクトインスタンスに固有のものになります。

```php
<?php

class NumberService
{
    public function all(): array
    {
        return once(fn () => [1, 2, 3]);
    }
}

$service = new NumberService;

$service->all();
$service->all(); // (キャッシュ済みの結果)

$secondService = new NumberService;

$secondService->all();
$secondService->all(); // (キャッシュ済みの結果)
```
<a name="method-optional"></a>
#### `optional()` {.collection-method}

`optional`関数はどんな引数も指定でき、そのオブジェクトのプロパティへアクセスするか、メソッドを呼び出せます。指定したオブジェクトが`null`だった場合、エラーを発生させる代わりに、プロパティとメソッドは`null`を返します。

```php
return optional($user->address)->street;

{!! old('name', optional($user)->name) !!}
```

`optional`関数は、２番目の引数としてクロージャも受け入れます。最初の引数として指定された値がnullでない場合、クロージャが呼び出されます。

```php
return optional(User::find($id), function (User $user) {
    return $user->name;
});
```

<a name="method-policy"></a>
#### `policy()` {.collection-method}

`policy`関数は、指定クラスの[ポリシー](/docs/{{version}}/authorization#creating-policies)インスタンスを取得します。

```php
$policy = policy(App\Models\User::class);
```

<a name="method-redirect"></a>
#### `redirect()` {.collection-method}

`redirect`関数は、[リダイレクトHTTPレスポンス](/docs/{{version}}/responses#redirects)を返します。引数無しで呼び出した場合は、リダイレクタインスタンスを返します。

```php
return redirect($to = null, $status = 302, $headers = [], $secure = null);

return redirect('/home');

return redirect()->route('route.name');
```

<a name="method-report"></a>
#### `report()` {.collection-method}

`report`関数は[例外ハンドラ](/docs/{{version}}/errors#handling-exceptions)を使用して例外をレポートします。

```php
report($e);
```

`report`関数は文字列を引数に取ります。関数に文字列が与えられると、関数は指定する文字列をメッセージとする例外を作成します。

```php
report('Something went wrong.');
```

<a name="method-report-if"></a>
#### `report_if()` {.collection-method}

`report_if`関数は、指定した論理式が`true`と評価された場合に、あなたの[例外ハンドラ](/docs/{{version}}/errors#handling-exceptions)を使って例外を報告します。

```php
report_if($shouldReport, $e);

report_if($shouldReport, 'Something went wrong.');
```

<a name="method-report-unless"></a>
#### `report_unless()` {.collection-method}

`report_unless`関数は、指定した論理式が`false`と評価された場合に、あなたの[例外ハンドラ](/docs/{{version}}/errors#handling-exceptions)を使って例外を報告します。

```php
report_unless($reportingDisabled, $e);

report_unless($reportingDisabled, 'Something went wrong.');
```

<a name="method-request"></a>
#### `request()` {.collection-method}

`request`関数は、現在の[request](/docs/{{version}}/requests)インスタンスを返すか、現在のリクエストから入力フィールドの値を取得します。

```php
$request = request();

$value = request('key', $default);
```

<a name="method-rescue"></a>
#### `rescue()` {.collection-method}

`rescue`関数は指定されたクロージャを実行し、その実行中に発生した例外をすべてキャッチします。キャッチした例外はすべて[例外ハンドラ](/docs/{{version}}/errors#handling-exceptions)へ送られますが、リクエストの処理は続行されます。

```php
return rescue(function () {
    return $this->method();
});
```

`rescue`関数に２番目の引数を渡すこともできます。この引数は、クロージャの実行で例外が発生した場合に返す「デフォルト」値です。

```php
return rescue(function () {
    return $this->method();
}, false);

return rescue(function () {
    return $this->method();
}, function () {
    return $this->failure();
});
```

例外を`report`関数でレポートするかを決定するために、`rescue`関数に`report`引数を指定できます。

```php
return rescue(function () {
    return $this->method();
}, report: function (Throwable $throwable) {
    return $throwable instanceof InvalidArgumentException;
});
```

<a name="method-resolve"></a>
#### `resolve()` {.collection-method}

`resolve`関数は、[サービスコンテナ](/docs/{{version}}/container)を使用して、指定したクラスまたはインターフェイス名をインスタンスへ依存解決します。

```php
$api = resolve('HelpSpot\API');
```

<a name="method-response"></a>
#### `response()` {.collection-method}

`response`関数は[response](/docs/{{version}}/responses)インスタンスを返すか、レスポンスファクトリのインスタンスを取得します。

```php
return response('Hello World', 200, $headers);

return response()->json(['foo' => 'bar'], 200, $headers);
```

<a name="method-retry"></a>
#### `retry()` {.collection-method}

`retry`関数は指定された最大試行回数を過ぎるまで、指定されたコールバックを実行します。コールバックが例外を投げなければ、返却値を返します。コールバックが例外を投げた場合は、自動的にリトライします。最大試行回数を超えると、例外を投げます。

```php
return retry(5, function () {
    // 試行間に100msずつ休みながら5回トライ
}, 100);
```

もし、試行間隔を何ミリ秒にするかを手作業で計算したい場合は、`retry`関数の第３引数へクロージャを渡します。

```php
use Exception;

return retry(5, function () {
    // ...
}, function (int $attempt, Exception $exception) {
    return $attempt * 100;
});
```

便利なように、`retry`関数の最初の引数には配列を指定することもできます。この配列は、次の再試行の間に何ミリ秒スリープさせるかを決定するために使用されます。

```php
return retry([100, 200], function () {
    // 1回目の再試行で100ms、2回目の再試行で200msスリープ
});
```

特定条件下でのみ再試行するには、`retry`関数への4番目の引数としてクロージャを渡せます。

```php
use App\Exceptions\TemporaryException;
use Exception;

return retry(5, function () {
    // ...
}, 100, function (Exception $exception) {
    return $exception instanceof TemporaryException;
});
```

<a name="method-session"></a>
#### `session()` {.collection-method}

`session`関数は[セッション](/docs/{{version}}/session)へ値を設定、もしくは取得するために使用します。

```php
$value = session('key');
```

キー／値ペアの配列を渡し、値を設定できます。

```php
session(['chairs' => 7, 'instruments' => 3]);
```

関数に引数を渡さない場合は、セッション保存域が返されます。

```php
$value = session()->get('key');

session()->put('key', $value);
```

<a name="method-tap"></a>
#### `tap()` {.collection-method}

`tap`関数は、任意の`$value`とクロージャの２つの引数を受け入れます。`$value`はクロージャに渡され、`tap`関数によって返されます。クロージャの戻り値は関係ありません。

```php
$user = tap(User::first(), function (User $user) {
    $user->name = 'Taylor';

    $user->save();
});
```

`tap`関数にクロージャが渡されない場合は、指定した`$value`で任意のメソッドを呼び出せます。呼び出すメソッドの戻り値は、メソッドがその定義で実際に何を返すかに関係なく、常に`$value`になります。たとえば、Eloquentの`update`メソッドは通常、整数を返します。しかし、`tap`関数を介して`update`メソッド呼び出しをチェーンすることで、メソッドへモデル自体を返すように強制できます。

```php
$user = tap($user)->update([
    'name' => $name,
    'email' => $email,
]);
```

クラスへ`tap`メソッドを追加するには、`Illuminate\Support\Traits\Tappable`トレイトをそのクラスへ追加してください。このトレイトの`tap`メソッドはクロージャだけを引数に受け取ります。オブジェクトインスタンス自身がクロージャに渡され、`tap`メソッドによりリターンされます。

```php
return $user->tap(function (User $user) {
    // ...
});
```

<a name="method-throw-if"></a>
#### `throw_if()` {.collection-method}

`throw_if`関数は、指定した論理式が`true`と評価された場合に、指定した例外を投げます。

```php
throw_if(! Auth::user()->isAdmin(), AuthorizationException::class);

throw_if(
    ! Auth::user()->isAdmin(),
    AuthorizationException::class,
    'You are not allowed to access this page.'
);
```

<a name="method-throw-unless"></a>
#### `throw_unless()` {.collection-method}

`throw_unless`関数は、指定した論理式が`false`と評価された場合に、指定した例外を投げます。

```php
throw_unless(Auth::user()->isAdmin(), AuthorizationException::class);

throw_unless(
    Auth::user()->isAdmin(),
    AuthorizationException::class,
    'You are not allowed to access this page.'
);
```

<a name="method-today"></a>
#### `today()` {.collection-method}

`today`関数は、現在の日付を表す新しい`Illuminate\Support\Carbon`インスタンスを生成します。

```php
$today = today();
```

<a name="method-trait-uses-recursive"></a>
#### `trait_uses_recursive()` {.collection-method}

`trait_uses_recursive`関数は、そのトレイトで使用されている全トレイトを返します。

```php
$traits = trait_uses_recursive(\Illuminate\Notifications\Notifiable::class);
```

<a name="method-transform"></a>
#### `transform()` {.collection-method}

`transform`関数は、値が[空白](#method-blank)でない場合、指定値に対してクロージャを実行し、クロージャの戻り値を返します。

```php
$callback = function (int $value) {
    return $value * 2;
};

$result = transform(5, $callback);

// 10
```

デフォルト値またはクロージャは、関数の３番目の引数として渡せます。指定値が空白の場合、この値をが返します。

```php
$result = transform(null, $callback, 'The value is blank');

// The value is blank
```

<a name="method-validator"></a>
#### `validator()` {.collection-method}

`validator`関数は、引数を使用して新しい[バリデータ](/docs/{{version}}/validation)インスタンスを作成します。`Validator`ファサードの代わりに使用できます。

```php
$validator = validator($data, $rules, $messages);
```

<a name="method-value"></a>
#### `value()` {.collection-method}

`value`関数は、指定値を返します。ただし、関数へクロージャを渡すと、そのクロージャを実行し、その戻り値を返します。

```php
$result = value(true);

// true

$result = value(function () {
    return false;
});

// false
```

`value`関数に追加の引数を渡すこともできます。最初の引数がクロージャであれば、追加した引数はクロージャの引数として渡されます。クロージャでなければ、無視します。

```php
$result = value(function (string $name) {
    return $name;
}, 'Taylor');

// 'Taylor'
```

<a name="method-view"></a>
#### `view()` {.collection-method}

`view`関数は[view](/docs/{{version}}/views)インスタンスを返します。

```php
return view('auth.login');
```

<a name="method-with"></a>
#### `with()` {.collection-method}

`with`関数は、指定値を返します。関数の２番目の引数としてクロージャを渡すと、クロージャが実行され、その戻り値を返します。

```php
$callback = function (mixed $value) {
    return is_numeric($value) ? $value * 2 : 0;
};

$result = with(5, $callback);

// 10

$result = with(null, $callback);

// 0

$result = with(5, null);

// 5
```

<a name="method-when"></a>
#### `when()` {.collection-method}

`when`関数は、指定条件を`true`と評価した場合に、指定値を返します。そうでない場合は`null`を返します。関数の第２引数にクロージャを渡した場合は、そのクロージャを実行し、その戻り値を返します。

```php
$value = when(true, 'Hello World');

$value = when(true, fn () => 'Hello World');
```

`when`関数は主にHTML属性を条件付きでレンダリングするのに便利です。

```blade
<div {!! when($condition, 'wire:poll="calculate"') !!}>
    ...
</div>
```

<a name="other-utilities"></a>
## その他のユーティリティ

<a name="benchmarking"></a>
### ベンチマーク

時には、アプリケーションの特定の部分のパフォーマンスを素早くテストしたいと思うこともあるでしょう。そのような場合は、`Benchmark`サポートクラスを利用して、指定するコールバックが完了するまでにかかるミリ秒を測定できます。

```php
<?php

use App\Models\User;
use Illuminate\Support\Benchmark;

Benchmark::dd(fn () => User::find(1)); // 0.1 ms

Benchmark::dd([
    'Scenario 1' => fn () => User::count(), // 0.5 ms
    'Scenario 2' => fn () => User::all()->count(), // 20.0 ms
]);
```

デフォルトでは、指定したコールバックは、１回（１繰り返し）実行され、その期間はブラウザ／コンソールに表示されます。

コールバックを複数回呼び出すには、メソッドの第２引数でコールバックを呼び出す反復回数を指定してください。コールバックを複数回実行する場合、`Benchmark`クラスはコールバックの実行にかかった平均ミリ秒を返します。

```php
Benchmark::dd(fn () => User::count(), iterations: 10); // 0.5 ms
```

コールバックが返す値を取得しながら、コールバックの実行をベンチマークしたい場合もあるでしょう。`value`メソッドはコールバックが返した値と、コールバックの実行にかかったミリ秒数を含むタプルを返します：

```php
[$count, $duration] = Benchmark::value(fn () => User::count());
```

<a name="dates"></a>
### 日付と時間

Laravelは、強力な日付と時間の操作ライブラリである[Carbon](https://carbon.nesbot.com/guide/getting-started/introduction.html)を含んでいます。新しい`Carbon`インスタンスを作成するには、`now`関数を呼び出してください。この関数はLaravelアプリケーション内でグローバルに利用可能です。

```php
$now = now();
```

もしくは、`Illuminate\Support\Carbon`クラスを使い、新しい`Carbon`インスタンスを作成できます。

```php
use Illuminate\Support\Carbon;

$now = Carbon::now();
```

Laravelは`Carbon`インスタンスを`plus`および`minus`メソッドで拡張しており、インスタンスの日時を簡単に操作できるようになっています。

```php
return now()->plus(minutes: 5);
return now()->plus(hours: 8);
return now()->plus(weeks: 4);

return now()->minus(minutes: 5);
return now()->minus(hours: 8);
return now()->minus(weeks: 4);
```

Carbonの概要や特徴については、[Carbon公式ドキュメント](https://carbon.nesbot.com/guide/getting-started/introduction.html)を参照してください。

<a name="interval-functions"></a>
#### インターバル関数

LaravelはPHPの[DateInterval](https://www.php.net/manual/en/class.dateinterval.php)クラスを拡張した`CarbonInterval`インスタンスを返す、`milliseconds`、`seconds`、`minutes`、`hours`、`days`、`weeks`、`months`、`years`関数も提供しています。これらの関数は、LaravelがDateIntervalインスタンスを受け付けるあらゆる場所で使用できます。

```php
use Illuminate\Support\Facades\Cache;

use function Illuminate\Support\{minutes};

Cache::put('metrics', $metrics, minutes(10));
```

<a name="deferred-functions"></a>
### 遅延関数

Laravelの[ジョブキュー投入](/docs/{{version}}/queues)では、バックグラウンド処理のためにタスクをキューに入れることができますが、時には、長時間実行するキューワーカの設定やメンテナンスをせずに、単純にタスク実行を先延ばししたいこともあるでしょう。

遅延関数により、HTTPレスポンスをユーザーへ送信した後まで、クロージャの実行を遅延でき、アプリケーションの高速性と応答性を保てます。クロージャの実行を遅延させるには、`Illuminate\Support\defer`関数にクロージャを渡すだけです。

```php
use App\Services\Metrics;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use function Illuminate\Support\defer;

Route::post('/orders', function (Request $request) {
    // 注文を作成する…

    defer(fn () => Metrics::reportOrder($order));

    return $order;
});
```

デフォルトでは、遅延した関数は、`Illuminate\Support\defer`が呼び出されたHTTPレスポンス、Artisanコマンド、もしくはキュー投入したジョブが正常に完了した場合にのみ実行します。つまり、リクエストの結果が`4xx`か`5xx`　HTTPレスポンスの場合、遅延した関数を実行しません。遅延した関数を常に実行させたい場合は、遅延関数へ`always`メソッドをチェーンしてください。

```php
defer(fn () => Metrics::reportOrder($order))->always();
```

> [!WARNING]
> [Swoole PHP拡張機能](https://www.php.net/manual/en/book.swoole.php)をインストールしている場合、Laravelの`defer`関数がSwooleのグローバルな`defer`関数と衝突し、ウェブサーバエラーが発生する可能性があります。Laravelの`defer`ヘルパ関数を名前空間を明示的に指定して呼び出すようにしてください：`use function Illuminate\Support\defer;`

<a name="cancelling-deferred-functions"></a>
#### 遅延関数のキャンセル

遅延関数を実行する前にキャンセルする必要がある場合は、その関数名で`forget`メソッドを使用し、キャンセルできます。遅延関数に名前を付けるには、`Illuminate\Support\defer`関数に第２引数を与えます：

```php
defer(fn () => Metrics::report(), 'reportMetrics');

defer()->forget('reportMetrics');
```

<a name="disabling-deferred-functions-in-tests"></a>
#### テスト時の遅延関数無効化

テストを書くときに、遅延関数を無効にできると便利です。テストの中で`withoutDefer`を呼び出せば、すべての遅延関数をすぐに呼び出すようにLaravelへ指示できます。

```php tab=Pest
test('without defer', function () {
    $this->withoutDefer();

    // ...
});
```

```php tab=PHPUnit
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_without_defer(): void
    {
        $this->withoutDefer();

        // ...
    }
}
```

テストケース内のすべてのテストで遅延関数を無効にしたい場合は、ベースとなる`TestCase`クラスの`setUp`メソッドで、`withoutDefer`メソッドを呼び出します。

```php
<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void// [tl! add:start]
    {
        parent::setUp();

        $this->withoutDefer();
    }// [tl! add:end]
}
```

<a name="lottery"></a>
### 抽選

Laravelの抽選クラスは、指定する確率セットに基づき、コールバックを実行するために使用します。この機能は、受信リクエストの何パーセントだけに対し、コードを実行したい場合、特に便利です。

```php
use Illuminate\Support\Lottery;

Lottery::odds(1, 20)
    ->winner(fn () => $user->won())
    ->loser(fn () => $user->lost())
    ->choose();
```

Laravelの抽選クラスとLaravelの別機能を組み合わせることもできます。例えば、スロークエリのごく一部だけを例外ハンドラに報告したい場合などです。また、抽選クラスはCallableなので、Callableを引数に取るメソッドへ、クラスインスタンスを渡せます。

```php
use Carbon\CarbonInterval;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Lottery;

DB::whenQueryingForLongerThan(
    CarbonInterval::seconds(2),
    Lottery::odds(1, 100)->winner(fn () => report('Querying > 2 seconds.')),
);
```

<a name="testing-lotteries"></a>
#### 抽選のテスト

Laravelは、アプリケーションでの抽選の呼び出しを簡単にテストできるように、簡単なメソッドをいくつか提供しています。

```php
// 抽選は常に当選
Lottery::alwaysWin();

// 抽選は常に外れ
Lottery::alwaysLose();

// 抽選は当選し、次に外れる。その後は通常の振る舞いを返す
Lottery::fix([true, false]);

// 抽選は通常の振る舞いを返す
Lottery::determineResultsNormally();
```

<a name="pipeline"></a>
### パイプライン

Laravelの`Pipeline`ファサードは、指定する入力を一連の呼び出し可能なクラス、クロージャ、Callableを通して、「パイプ」接続する便利な方法を提供し、各クラスに入力を検査または修正する機会を与え、パイプラインの次のCallableを呼び出します。

```php
use Closure;
use App\Models\User;
use Illuminate\Support\Facades\Pipeline;

$user = Pipeline::send($user)
    ->through([
        function (User $user, Closure $next) {
            // ...

            return $next($user);
        },
        function (User $user, Closure $next) {
            // ...

            return $next($user);
        },
    ])
    ->then(fn (User $user) => $user);
```

ご覧のように、パイプライン中の呼び出し可能な各クラスやクロージャには、入力と`$next`クロージャを引数に渡します。`next`クロージャが呼び出されると、パイプラインの次の呼び出し可能なクラスを呼び出します。お気づきかもしれませんが、これは [ミドルウェア](/docs/{{version}}/middleware) と非常によく似ています。

パイプラインの最後のCallableが`$next`クロージャを呼び出すと、`then`メソッドに渡されたCallableを呼び出します。一般的に、このCallableは単に与えられた入力を返すだけです。使いやすいように、単に入力を処理した後に返したい場合は、`thenReturn`メソッドが使えます。

もちろん、前述したように、パイプラインに渡すのは、クロージャに限定されません。呼び出し可能なクラスを提供することもできます。クラス名が提供された場合、そのクラスはLaravelの[サービスコンテナ](/docs/{{version}}/container)を通じてインスタンス化し、呼び出し可能なクラスへ依存関係を注入します。

```php
$user = Pipeline::send($user)
    ->through([
        GenerateProfilePhoto::class,
        ActivateSubscription::class,
        SendWelcomeEmail::class,
    ])
    ->thenReturn();
```

`withinTransaction`メソッドをパイプラインに対して呼び出すことにより、パイプラインのすべてのステップを単一のデータベーストランザクション内へ自動的にラップします。

```php
$user = Pipeline::send($user)
    ->withinTransaction()
    ->through([
        ProcessOrder::class,
        TransferFunds::class,
        UpdateInventory::class,
    ])
    ->thenReturn();
```

<a name="sleep"></a>
### スリープ

Laravelの`Sleep`クラスは、PHPネイティブの`sleep`と`usleep`関数の軽量ラッパーで、テスト性を高めるとともに、開発者に優しい時間操作のためのAPIを公開しています。

```php
use Illuminate\Support\Sleep;

$waiting = true;

while ($waiting) {
    Sleep::for(1)->second();

    $waiting = /* ... */;
}
```

`Sleep`クラスは、異なる時間単位を扱う様々なメソッドを提供しています。

```php
// 停止後に値を返す
$result = Sleep::for(1)->second()->then(fn () => 1 + 1);

// 指定した値がtrueの間中、停止
Sleep::for(1)->second()->while(fn () => shouldKeepSleeping());

// 実行を９０秒停止
Sleep::for(1.5)->minutes();

// 実行を２秒停止
Sleep::for(2)->seconds();

// 実行を５００ミリ秒停止
Sleep::for(500)->milliseconds();

// 実行を５０００マイクロ秒停止
Sleep::for(5000)->microseconds();

// 実行を指定時間まで停止
Sleep::until(now()->plus(minutes: 1));

// PHPネイティブの"sleep"関数のエイリアス
Sleep::sleep(2);

// PHPネイティブの"usleep"関数のエイリアス
Sleep::usleep(5000);
```

時間の単位を簡単に組み合わせるには、`and`メソッドを使用します。

```php
Sleep::for(1)->second()->and(10)->milliseconds();
```

<a name="testing-sleep"></a>
#### スリープのテスト

`Sleep`クラスやPHPネイティブのスリープ関数を使用するコードをテストする場合、テストの実行は一時停止します。皆さんの予想通り、これはテストスイートの速度を著しく低下させます。たとえば、次のようなコードをテストしているとしましょう：

```php
$waiting = /* ... */;

$seconds = 1;

while ($waiting) {
    Sleep::for($seconds++)->seconds();

    $waiting = /* ... */;
}
```

通常、このコードのテストは最低でも１秒かかるでしょう。幸運なことに、`Sleep`クラスは、テストスイートを高速に保つために、スリープを「Fake」できます。

```php tab=Pest
it('waits until ready', function () {
    Sleep::fake();

    // ...
});
```

```php tab=PHPUnit
public function test_it_waits_until_ready()
{
    Sleep::fake();

    // ...
}
```

`Sleep`クラスをFakeする場合、実際の実行の一時停止をバイパスするため、テストは大幅に高速化されます。

一度`Sleep`クラスをFakeすると、本来発生するはずの「スリープ」に対してアサートできるようになります。これを説明するために、実行を３回一時停止するコードをテストしていると仮定します。（各停止時間は１秒ずつ増加させます。）`assertSequence`メソッドを使用すると、テストの速度を維持したまま、適切な時間だけコードが「スリープ」したことをアサートできます：

```php tab=Pest
it('checks if ready three times', function () {
    Sleep::fake();

    // ...

    Sleep::assertSequence([
        Sleep::for(1)->second(),
        Sleep::for(2)->seconds(),
        Sleep::for(3)->seconds(),
    ]);
}
```

```php tab=PHPUnit
public function test_it_checks_if_ready_three_times()
{
    Sleep::fake();

    // ...

    Sleep::assertSequence([
        Sleep::for(1)->second(),
        Sleep::for(2)->seconds(),
        Sleep::for(3)->seconds(),
    ]);
}
```

もちろん、`Sleep`クラスには、テスト時に使用できる、他の様々なアサーションを用意しています。

```php
use Carbon\CarbonInterval as Duration;
use Illuminate\Support\Sleep;

// スリープが３回呼び出されることを宣言
Sleep::assertSleptTimes(3);

// スリープの時間に対して宣言
Sleep::assertSlept(function (Duration $duration): bool {
    return /* ... */;
}, times: 1);

// Sleepクラスが起動されないことを宣言
Sleep::assertNeverSlept();

// Sleepが呼び出されても、実行を中断しないことを宣言
Sleep::assertInsomniac();
```

Fakeスリープが発生するたびに、アクションを実行できれば便利な場合が時々あるでしょう。これを行うには、`whenFakingSleep`メソッドへコールバックを渡します。以下の例では、Laravelの[時間操作ヘルパ](/docs/{{version}}/mocking#interacting-with-time)を使い、Sleepの間隔ごとで、瞬時に時間を進めています。

```php
use Carbon\CarbonInterval as Duration;

$this->freezeTime();

Sleep::fake();

Sleep::whenFakingSleep(function (Duration $duration) {
    // SleepをFakeした時点で、時間を進める
    $this->travel($duration->totalMilliseconds)->milliseconds();
});
```

時間の進行は一般的な要件であるため、`fake`メソッドは`syncWithCarbon`引数を取り、テスト内でスリープしているときにカーボンの同期を保ちます。

```php
Sleep::fake(syncWithCarbon: true);

$start = now();

Sleep::for(1)->second();

$start->diffForHumans(); // 1秒前
```

Laravelは実行を一時停止するとき、にいつでも内部的に`Sleep`クラスを使用しています。例えば、[retry](#method-retry)ヘルパはスリープ時に`Sleep`クラスを使用し、そのヘルパを使用する際のテストの実行性を上げています。

<a name="timebox"></a>
### Timebox

Laravelの`Timebox`クラスは、指定したコールバックの実際の実行が早く完了しても、実行にかかる時間が常に一定であることを保証します。これは、攻撃者が実行時間のばらつきを悪用して機密情報を推測する可能性がある暗号操作やユーザー認証チェックで特に有用です。

実行時間が固定時間を超えた場合、`Timebox`は何の効果もありません。最悪のシナリオを考慮して、固定時間として十分に長い時間を選択するかは開発者次第です。

callメソッドは、クロージャとマイクロ秒単位の制限時間を受け取り、クロージャを実行し、制限時間に達するまで待ちます。

```php
use Illuminate\Support\Timebox;

(new Timebox)->call(function ($timebox) {
    // ...
}, microseconds: 10000);
```

クロージャ内で例外が投げられた場合、このクラスは定義された遅延を尊重し、遅延後に例外を再び投げます。

<a name="uri"></a>
### URI

Laravelの`Uri`クラスは、URIの作成と操作のために、便利で読み書きしやすいインターフェイスを提供します。このクラスは、基盤となるLeague　URIパッケージが提供する機能をラップし、Laravelのルーティングシステムとシームレスに統合しています。

静的メソッドを使用し、`Uri`インスタンスを簡単に作成できます。

```php
use App\Http\Controllers\UserController;
use App\Http\Controllers\InvokableController;
use Illuminate\Support\Uri;

// 指定した文字列から、URIインスタンスを生成
$uri = Uri::of('https://example.com/path');

// パス、名前付きルート、コントローラから、URIインスタンスを生成
$uri = Uri::to('/dashboard');
$uri = Uri::route('users.show', ['user' => 1]);
$uri = Uri::signedRoute('users.show', ['user' => 1]);
$uri = Uri::temporarySignedRoute('user.index', now()->plus(minutes: 5));
$uri = Uri::action([UserController::class, 'index']);
$uri = Uri::action(InvokableController::class);

// 現在のリクエストのURIから、URIインスタンスを生成
$uri = $request->uri();
```

一度URIインスタンスを作れば、それを流暢に変更できます。

```php
$uri = Uri::of('https://example.com')
    ->withScheme('http')
    ->withHost('test.com')
    ->withPort(8000)
    ->withPath('/users')
    ->withQuery(['page' => 2])
    ->withFragment('section-1');
```

<a name="inspecting-uris"></a>
#### URIの調査

`Uri`クラスでは、URIの様々な構成要素を簡単に調査することもできます。

```php
$scheme = $uri->scheme();
$authority = $uri->authority();
$host = $uri->host();
$port = $uri->port();
$path = $uri->path();
$segments = $uri->pathSegments();
$query = $uri->query();
$fragment = $uri->fragment();
```

<a name="manipulating-query-strings"></a>
#### クエリ文字列の操作

`Uri`クラスは、URIのクエリ文字列を操作するメソッドをいくつか提供しています。`withQuery`メソッドを使うと、追加のクエリ文字列パラメータを既存のクエリ文字列へマージできます。

```php
$uri = $uri->withQuery(['sort' => 'name']);
```

`withQueryIfMissing`メソッドは、指定キーがクエリ文字列中にまだ存在していない場合に、追加のクエリ文字列パラメータを既存のクエリ文字列にマージするために使用します。

```php
$uri = $uri->withQueryIfMissing(['page' => 1]);
```

`replaceQuery`メソッドは、既存のクエリ文字列を新しいものへ置き換えるために使います。

```php
$uri = $uri->replaceQuery(['page' => 1]);
```

`pushOntoQuery`メソッドは、配列の値を持つクエリ文字列パラメータへパラメータを追加するために使います。

```php
$uri = $uri->pushOntoQuery('filter', ['active', 'pending']);
```

`withoutQuery`メソッドは、クエリ文字列からパラメータを取り除クために使います。

```php
$uri = $uri->withoutQuery(['page']);
```

<a name="generating-responses-from-uris"></a>
#### URIからのレスポンス生成

`redirect`メソッドは、指定URIに対する`RedirectResponse`インスタンスを生成するために使います。

```php
$uri = Uri::of('https://example.com');

return $uri->redirect();
```

あるいは、ルートやコントローラのアクションから、`Uri`インスタンスをただ返せば、返したURIへのリダイレクトレスポンスを自動的に生成します。

```php
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Uri;

Route::get('/redirect', function () {
    return Uri::to('/index')
        ->withQuery(['sort' => 'name']);
});
```
