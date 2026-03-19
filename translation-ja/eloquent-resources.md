# Eloquent：APIリソース

- [イントロダクション](#introduction)
- [リソースの生成](#generating-resources)
- [概論](#concept-overview)
    - [リソースコレクション](#resource-collections)
- [リソースの記述](#writing-resources)
    - [データのラップ](#data-wrapping)
    - [ペジネーション](#pagination)
    - [条件付き属性](#conditional-attributes)
    - [条件付きリレーション](#conditional-relationships)
    - [メタデータの追加](#adding-meta-data)
- [JSON:API Resources](#jsonapi-resources)
    - [Generating JSON:API Resources](#generating-jsonapi-resources)
    - [Defining Attributes](#defining-jsonapi-attributes)
    - [Defining Relationships](#defining-jsonapi-relationships)
    - [Resource Type and ID](#jsonapi-resource-type-and-id)
    - [Sparse Fieldsets and Includes](#jsonapi-sparse-fieldsets-and-includes)
    - [Links and Meta](#jsonapi-links-and-meta)
- [リソースレスポンス](#resource-responses)

<a name="introduction"></a>
## イントロダクション

APIを構築する場合、Eloquentモデルと実際にアプリケーションのユーザーへ返すJSONレスポンスの間に変換レイヤーが必要になるでしょう。たとえば、ユーザーのサブセットに対して特定の属性を表示し、他のユーザーには表示したくない場合や、モデルのJSON表現に常に特定のリレーションを含めたい場合などです。Eloquentのリソースクラスを使用すると、モデルとモデルコレクションを表現力豊かかつ簡単にJSONに変換できます。

もちろん、`toJson`メソッドを使用してEloquentモデルまたはコレクションをJSONへいつでも変換できます。ただし、Eloquentリソースは、モデルのJSONシリアル化とそれらの関係をよりきめ細かく堅牢に制御します。

<a name="generating-resources"></a>
## リソースの生成

リソースクラスを生成するには、`make:resource` Artisanコマンドを使用します。リソースはアプリケーションの`app/Http/Resources`ディレクトリにデフォルトで配置されます。リソースは`Illuminate\Http\Resources\Json\JsonResource`クラスを拡張します。

```shell
php artisan make:resource UserResource
```

<a name="generating-resource-collections"></a>
#### リソースコレクション

個々のモデルを変換するリソースを生成することに加えて、モデルのコレクションの変換を担当するリソースを生成することもできます。これにより、JSONレスポンスへ指定するリソースのコレクション全体へ関連するリンクやその他のメタ情報を含められます。

リソースコレクションを生成するには、リソースを生成するときに`--collection`フラグを使用する必要があります。または、リソース名に`Collection`という単語を含めると、コレクションリソースを作成する必要があるとLaravelに指示できます。コレクションリソースは、`Illuminate\Http\Resources\JSON\ResourceCollection`クラスを拡張します。

```shell
php artisan make:resource User --collection

php artisan make:resource UserCollection
```

<a name="concept-overview"></a>
## 概論

> [!NOTE]
> これは、リソースとリソースコレクションの概要です。リソースによって提供されるカスタマイズとパワーをより深く理解するために、このドキュメントの他のセクションも読むことを強く推奨します。

リソースを作成するときに利用できるすべてのオプションに飛び込む前に、まずLaravel内でリソースがどのように使用されているかを大まかに見てみましょう。リソースクラスは、JSON構造に変換する必要がある単一のモデルを表します。たとえば、以下は単純な`UserResource`リソースクラスです。

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * リソースを配列に変換
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

リソースをルートまたはコントローラメソッドからのレスポンスとして返すときにJSONへ変換する必要があるため、属性の配列を返す`toArray`メソッドをすべてのリソースクラスで定義します。

`$this`変数からモデルのプロパティに直接アクセスできることに注意してください。これは、リソースクラスがプロパティとメソッドのアクセスを基になるモデルに自動的にプロキシしており、アクセスを便利にしているためです。リソースを定義したら、ルートまたはコントローラから返せます。リソースは、コンストラクターを介して基になるモデルインスタンスを受け入れます。

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/user/{id}', function (string $id) {
    return new UserResource(User::findOrFail($id));
});
```

使いやすくするため、モデルの`toResource`メソッドを使用できます。このメソッドはフレームワークの規約を使用し、モデルの基礎となるリソースを自動的に検出します。

```php
return User::findOrFail($id)->toResource();
```

`toResource`メソッドを呼び出すと、モデルの名前に一致し、オプションでモデルの名前空間に最も近い`Http\Resources`名前空間内の`Resource`という接尾辞が付いたリソースをLaravelは探します。

リソースクラスがこの命名規則に従わない場合、もしくは別の名前空間にある場合は、`UseResource`属性を使用してモデルのデフォルトリソースを指定してください。

```php
<?php

namespace App\Models;

use App\Http\Resources\CustomUserResource;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\UseResource;

#[UseResource(CustomUserResource::class)]
class User extends Model
{
    // ...
}
```

あるいは、`toResource`メソッドへリソースクラスを渡して指定してください。

```php
return User::findOrFail($id)->toResource(CustomUserResource::class);
```

<a name="resource-collections"></a>
### リソースコレクション

リソースのコレクションまたはページ分割されたレスポンスを返す場合は、ルートまたはコントローラでリソースインスタンスを作成するときに、リソースクラスによって提供される`collection`メソッドを使用する必要があります。

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/users', function () {
    return UserResource::collection(User::all());
});
```

あるいは、使いやすいように、Eloquentコレクションの`toResourceCollection`メソッドを使用することもできます。このメソッドはフレームワークの規約を使用して、モデルの基礎となるリソースコレクションを自動的に検出します。

```php
return User::all()->toResourceCollection();
```

`toResourceCollection`メソッドを呼び出すと、モデルの名前空間に最も近い`Http\Resources`名前空間内で、モデルの名前に一致し、接尾辞が`Collection`であるリソースコレクションをLaravelは探します。

リソースコレクションクラスがこの命名規則に従わない場合、もしくは別の名前空間にある場合は、`UseResourceCollection`属性を使用してモデルのデフォルトリソースコレクションを指定してください。

```php
<?php

namespace App\Models;

use App\Http\Resources\CustomUserCollection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\UseResourceCollection;

#[UseResourceCollection(CustomUserCollection::class)]
class User extends Model
{
    // ...
}
```

あるいは、`toResourceCollection`メソッドにリソースコレクションクラスを渡し、そのクラスを指定してください。

```php
return User::all()->toResourceCollection(CustomUserCollection::class);
```

<a name="custom-resource-collections"></a>
#### カスタムリソースコレクション

リソースコレクションはデフォルトで、コレクションと一緒に返す必要のあるカスタムメタデータを追加できません。リソースコレクションのレスポンスをカスタマイズしたい場合は、コレクションを表す専用のリソースを作成してください。

```shell
php artisan make:resource UserCollection
```

リソースコレクションクラスを生成したら、レスポンスに含める必要のあるメタデータを簡単に定義できます。

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * リソースコレクションを配列に変換
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'links' => [
                'self' => 'link-value',
            ],
        ];
    }
}
```

リソースコレクションを定義したら、ルートまたはコントローラから返せます。

```php
use App\Http\Resources\UserCollection;
use App\Models\User;

Route::get('/users', function () {
    return new UserCollection(User::all());
});
```

あるいは、使いやすいように、Eloquentコレクションの`toResourceCollection`メソッドを使用することもできます。このメソッドはフレームワークの規約を使用して、モデルの基礎となるリソースコレクションを自動的に検出します。

```php
return User::all()->toResourceCollection();
```

`toResourceCollection`メソッドを呼び出すと、モデルの名前空間に最も近い`Http\Resources`名前空間内で、モデルの名前に一致し、接尾辞が`Collection`であるリソースコレクションをLaravelは探します。

<a name="preserving-collection-keys"></a>
#### コレクションキーの保存

ルートからリソースコレクションを返すとき、Laravelはコレクションのキーをリセットして数値順にします。しかし、リソースクラスで`PreserveKeys`属性を使用することで、コレクションの元のキーを保持するかどうかを指定できます。

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Attributes\PreserveKeys;
use Illuminate\Http\Resources\Json\JsonResource;

#[PreserveKeys]
class UserResource extends JsonResource
{
    // ...
}
```

`preserveKeys`プロパティが`true`に設定されている場合、コレクションをルートまたはコントローラから返すとき、コレクションのキーが保持されます。

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/users', function () {
    return UserResource::collection(User::all()->keyBy->id);
});
```

<a name="customizing-the-underlying-resource-class"></a>
#### 基礎となるリソースクラスのカスタマイズ

通常、リソースコレクションの`$this->collection`プロパティへは、コレクションの各アイテムをその単一のリソースクラスにマッピングした結果を自動的に代入します。単一のリソースクラスは、クラス名の末尾から`Collection`部分除いたコレクションのクラス名であると想定します。さらに、個人的な好みにもよりますが、単数形のリソースクラスには、`Resource`というサフィックスが付いていてもいなくてもかまいません。

例として、`UserCollection`は渡されたユーザーインスタンスを`UserResource`リソースへマップしようとしているとしましょう。この動作をカスタマイズするには、リソースコレクションで`Collects`属性を使用してください。

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Attributes\Collects;
use Illuminate\Http\Resources\Json\ResourceCollection;

#[Collects(Member::class)]
class UserCollection extends ResourceCollection
{
    // ...
}
```

<a name="writing-resources"></a>
## リソースの記述

> [!NOTE]
> [概論](#concept-overview)を読んでいない場合は、このドキュメント読み進める前に一読することを強く推奨します。

リソースは特定のモデルを配列へ変換するだけで済みます。したがって、各リソースには、モデルの属性をアプリケーションのルートまたはコントローラから返すことができるAPIフレンドリーな配列に変換する`toArray`メソッドが含まれています。

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * リソースを配列に変換
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

リソースを定義したら、ルートまたはコントローラから直接返せます。

```php
use App\Models\User;

Route::get('/user/{id}', function (string $id) {
    return User::findOrFail($id)->toUserResource();
});
```

<a name="relationships"></a>
#### リレーション

リレーションをレスポンスへ含めたい場合は、リソースの`toArray`メソッドから返す配列にそれらを追加できます。この例では、`PostResource`リソースの`collection`メソッドを使用して、ユーザーのブログ投稿をリソースレスポンスへ追加しています。

```php
use App\Http\Resources\PostResource;
use Illuminate\Http\Request;

/**
 * リソースを配列へ変換
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'posts' => PostResource::collection($this->posts),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

> [!NOTE]
> リレーションがすでにロードされている場合にのみリレーションを含めたい場合は、[条件付きリレーション](#conditional-relationships)のドキュメントを確認してください。

<a name="writing-resource-collections"></a>
#### リソースコレクション

リソースが単一のモデルを配列に変換するのに対し、リソースコレクションはモデルのコレクションを配列へ変換します。しかし、すべてのEloquentモデルコレクションは`toResourceCollection`メソッドを提供し、そのまま「アドホック」なリソースコレクションを生成できるため、モデルごとにリソースコレクションクラスを定義する必要はありません。

```php
use App\Models\User;

Route::get('/users', function () {
    return User::all()->toResourceCollection();
});
```

ただし、コレクションとともに返されるメタデータをカスタマイズする必要がある場合は、独自のリソースコレクションを定義する必要があります。

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * リソースコレクションを配列に変換
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'links' => [
                'self' => 'link-value',
            ],
        ];
    }
}
```

単一のリソースと同様に、リソースコレクションはルートまたはコントローラから直接返されるでしょう。

```php
use App\Http\Resources\UserCollection;
use App\Models\User;

Route::get('/users', function () {
    return new UserCollection(User::all());
});
```

あるいは、使いやすいように、Eloquentコレクションの`toResourceCollection`メソッドを使用することもできます。このメソッドはフレームワークの規約を使用して、モデルの基礎となるリソースコレクションを自動的に検出します。

```php
return User::all()->toResourceCollection();
```

`toResourceCollection`メソッドを呼び出すと、モデルの名前空間に最も近い`Http\Resources`名前空間内で、モデルの名前に一致し、接尾辞が`Collection`であるリソースコレクションをLaravelは探します。

<a name="data-wrapping"></a>
### データのラップ

デフォルトでは、リソースレスポンスがJSONに変換されるときに、最も外側のリソースが`data`キーでラップされます。したがって、たとえば、一般的なリソースコレクションのレスポンスは次のようになります。

```json
{
    "data": [
        {
            "id": 1,
            "name": "Eladio Schroeder Sr.",
            "email": "therese28@example.com"
        },
        {
            "id": 2,
            "name": "Liliana Mayert",
            "email": "evandervort@example.com"
        }
    ]
}
```

最も外側のリソースのラッピングを無効にする場合は、ベースの`Illuminate\Http\Resources\Json\JsonResource`クラスで`withoutWrapping`メソッドを呼び出す必要があります。通常、このメソッドは、アプリケーションへのすべてのリクエストで読み込まれる`AppServiceProvider`か、別の[サービスプロバイダ](/docs/{{version}}/provider)から呼び出す必要があります。

```php
<?php

namespace App\Providers;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 全アプリケーションサービスの登録
     */
    public function register(): void
    {
        // ...
    }

    /**
     * 全アプリケーションサービスの初期起動処理
     */
    public function boot(): void
    {
        JsonResource::withoutWrapping();
    }
}
```

> [!WARNING]
> `withoutWrapping`メソッドは最も外側のレスポンスにのみ影響し、独自のリソースコレクションに手作業で追加した`data`キーは削除しません。

<a name="wrapping-nested-resources"></a>
#### ネストされたリソースのラップ

リソースのリレーションをどのようにラップするか、決定する完全な自由が皆さんにあります。ネストに関係なくすべてのリソースコレクションを`data`キーでラップする場合は、リソースごとにリソースコレクションクラスを定義し、`data`キー内でコレクションを返す必要があります。

これにより、もっとも外側のリソースが２つの`data`キーにラップされてしまうのか疑問に思われるかもしれません。心配ありません。Laravelが誤ってリソースを二重にラップすることは決してないので、変換するリソースコレクションのネストレベルについて心配する必要はありません。

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class CommentsCollection extends ResourceCollection
{
    /**
     * リソースコレクションを配列に変換
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return ['data' => $this->collection];
    }
}
```

<a name="data-wrapping-and-pagination"></a>
#### データのラップとペジネーション

リソースレスポンスを介してページ付けされたコレクションを返す場合、Laravelは`withoutWrapping`メソッドが呼び出された場合でも、リソースデータを`data`キーでラップします。これはページ化されたレスポンスには、常にページネーターの状態に関する情報を含む`meta`キーと`links`キーが含まれているためです。

```json
{
    "data": [
        {
            "id": 1,
            "name": "Eladio Schroeder Sr.",
            "email": "therese28@example.com"
        },
        {
            "id": 2,
            "name": "Liliana Mayert",
            "email": "evandervort@example.com"
        }
    ],
    "links":{
        "first": "http://example.com/users?page=1",
        "last": "http://example.com/users?page=1",
        "prev": null,
        "next": null
    },
    "meta":{
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "path": "http://example.com/users",
        "per_page": 15,
        "to": 10,
        "total": 10
    }
}
```

<a name="pagination"></a>
### ペジネーション

Laravel ペジネータインスタンスをリソースの`collection`メソッドまたはカスタムリソースコレクションに渡すことができます。

```php
use App\Http\Resources\UserCollection;
use App\Models\User;

Route::get('/users', function () {
    return new UserCollection(User::paginate());
});
```

あるいは使いやすいように、ペジネータの`toResourceCollection`メソッドを使用することもできます。このメソッドはフレームワークの規約を使用して、ペジネートしたモデルの基底リソースコレクションを自動的に検出します。

```php
return User::paginate()->toResourceCollection();
```

ページ化されたレスポンスには、常に、ページネーターの状態に関する情報を含む`meta`キーと`links`キーが含まれます。

```json
{
    "data": [
        {
            "id": 1,
            "name": "Eladio Schroeder Sr.",
            "email": "therese28@example.com"
        },
        {
            "id": 2,
            "name": "Liliana Mayert",
            "email": "evandervort@example.com"
        }
    ],
    "links":{
        "first": "http://example.com/users?page=1",
        "last": "http://example.com/users?page=1",
        "prev": null,
        "next": null
    },
    "meta":{
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "path": "http://example.com/users",
        "per_page": 15,
        "to": 10,
        "total": 10
    }
}
```

<a name="customizing-the-pagination-information"></a>
#### ペジネーション情報のカスタマイズ

レスポンスの`links`や`meta`キーが持つ情報をカスタマイズしたい場合は、リソースに`paginationInformation`メソッドを定義してください。このメソッドは`$paginated`データと、`$default`情報の配列（`links`キーと`meta`キーを含む配列）を引数に受けます。

```php
/**
 * リソースのペジネーション情報をカスタマイズ
 *
 * @param  \Illuminate\Http\Request  $request
 * @param  array  $paginated
 * @param  array  $default
 * @return array
 */
public function paginationInformation($request, $paginated, $default)
{
    $default['links']['custom'] = 'https://example.com';

    return $default;
}
```

<a name="conditional-attributes"></a>
### 条件付き属性

特定の条件が満たされた場合にのみ、リソースレスポンスに属性を含めたい場合があるでしょう。たとえば、現在のユーザーが「管理者（administrator）」である場合にのみ値を含めることができます。Laravelはこうした状況で、皆さんを支援するためのさまざまなヘルパメソッドを提供します。`when`メソッドを使用して、リソースレスポンスに属性を条件付きで追加できます。

```php
/**
 * リソースを配列へ変換
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'secret' => $this->when($request->user()->isAdmin(), 'secret-value'),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

この例では、認証済みユーザーの`isAdmin`メソッドが`true`を返した場合にのみ、最終的なリソースレスポンスで`secret`キーが返されます。メソッドが`false`を返す場合、`secret`キーは、クライアントに送信される前にリソースレスポンスから削除されます。`when`メソッドを使用すると、配列を作成するときに条件文に頼ることなく、リソースを表現的に定義できます。

`when`メソッドは２番目の引数としてクロージャも受け入れ、指定する条件が`true`の場合にのみ結果の値を計算できるようにします。

```php
'secret' => $this->when($request->user()->isAdmin(), function () {
    return 'secret-value';
}),
```

`whenHas`メソッドは、元となるモデルへ実際にその属性が存在する場合に含めたい時に使えます。

```php
'name' => $this->whenHas('name'),
```

さらに、`whenNotNull`メソッドを使用すると、属性がNULLでない場合、その属性をリソースレスポンスへ含められます。

```php
'name' => $this->whenNotNull($this->name),
```

<a name="merging-conditional-attributes"></a>
#### 条件付き属性のマージ

同じ条件に基づいてリソースレスポンスにのみ含める必要のある属性が複数存在する場合があります。この場合、指定する条件が`true`の場合にのみ、`mergeWhen`メソッドを使用して属性をレスポンスへ含められます。

```php
/**
 * リソースを配列へ変換
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        $this->mergeWhen($request->user()->isAdmin(), [
            'first-secret' => 'value',
            'second-secret' => 'value',
        ]),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

この場合も、指定する条件が`false`の場合、これらの属性は、クライアントに送信される前にリソースレスポンスから削除されます。

> [!WARNING]
> `mergeWhen`メソッドは、文字列キーと数値キーが混在する配列内では使用しないでください。さらに、順番に並べられていない数値キーを持つ配列内では使用しないでください。

<a name="conditional-relationships"></a>
### 条件付きリレーション

属性を条件付きでロードできるだけでなく、モデルのリレーションがすでにロード済みかに応じて、リソースのレスポンスへリレーションを条件付きで含めることもできます。これにより、どのリレーションをロードすべきかをコントローラ側で決定し、リソース側では実際にロード済みの場合にのみ、そのリレーションをレスポンスへ簡単に含めることができるようになります。結果として、リソース内での「Ｎ＋１」クエリ問題を回避しやすくなります。
`whenLoaded`メソッドを使用して、リレーションを条件付きでロードできます。リレーションを不必要にロードすることを避けるために、このメソッドはリレーション自体ではなくリレーション名を引数に取ります。

```php
use App\Http\Resources\PostResource;

/**
 * リソースを配列へ変換
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'posts' => PostResource::collection($this->whenLoaded('posts')),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

この例では、リレーションがロードされていない場合、`posts`キーはクライアントに送信される前に、リソースレスポンスから削除されます。

<a name="conditional-relationship-counts"></a>
#### 条件付きリレーションカウント

条件付きでリレーションを含めることに加えて、リレーションのカウントがモデルにロード済みかどうかにもとづき、リソースレスポンスへリレーションの「カウント(count)」を条件付きで含められます。

```php
new UserResource($user->loadCount('posts'));
```

`whenCounted`メソッドを使用すると、リレーションのカウントを条件付きでリソースレスポンスに含めることができます。このメソッドは、リレーションのカウントが存在しない場合に、不必要に属性をインクルードする事態を避けます。

```php
/**
 * リソースを配列へ変換
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'posts_count' => $this->whenCounted('posts'),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

この例では、`posts`リレーションのカウントがロードされていない場合、`posts_count`キーはクライアントへ送信される前に、リソースレスポンスから削除されます。

`avg`、`sum`、`min`、`max`など、他の種類の集約も、`whenAggregated`メソッドを使い条件付きでロードできます。

```php
'words_avg' => $this->whenAggregated('posts', 'words', 'avg'),
'words_sum' => $this->whenAggregated('posts', 'words', 'sum'),
'words_min' => $this->whenAggregated('posts', 'words', 'min'),
'words_max' => $this->whenAggregated('posts', 'words', 'max'),
```

<a name="conditional-pivot-information"></a>
#### 条件付きピボット情報

リソースレスポンスへリレーション情報を条件付きで含めることに加えて、`whenPivotLoaded`メソッドを使用して、多対多関係の中間テーブルからのデータを条件付きで含めることもできます。`whenPivotLoaded`メソッドは、最初の引数にピボットテーブル名を取ります。２番目の引数は、モデルでピボット情報が利用可能な場合に返す値を返すクロージャである必要があります。

```php
/**
 * リソースを配列へ変換
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'expires_at' => $this->whenPivotLoaded('role_user', function () {
            return $this->pivot->expires_at;
        }),
    ];
}
```

リレーションが[カスタム中間テーブルモデル](/docs/{{version}}/eloquent-relationships#defining-custom-intermediate-table-models)を使用している場合は、`whenPivotLoaded`メソッドへの最初の引数に中間テーブルモデルのインスタンスを渡すことができます。

```php
'expires_at' => $this->whenPivotLoaded(new Membership, function () {
    return $this->pivot->expires_at;
}),
```

中間テーブルが`pivot`以外のアクセサを使用している場合は、`whenPivotLoadedAs`メソッドを使用します。

```php
/**
 * リソースを配列へ変換
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'expires_at' => $this->whenPivotLoadedAs('subscription', 'role_user', function () {
            return $this->subscription->expires_at;
        }),
    ];
}
```

<a name="adding-meta-data"></a>
### メタデータの追加

一部のJSON API基準では、リソースおよびリソースコレクションのレスポンスへメタデータを追加する必要があります。これには多くの場合、リソースまたは関連リソースへの「リンク（`links`）」や、リソース自体に関するメタデータなどが含まれます。リソースに関する追加のメタデータを返す必要がある場合は、それを`toArray`メソッドに含めます。たとえば、リソースコレクションを変換するときに`links`情報を含められます。

```php
/**
 * リソースを配列へ変換
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'data' => $this->collection,
        'links' => [
            'self' => 'link-value',
        ],
    ];
}
```

リソースから追​​加のメタデータを返す場合、ページ付けされたレスポンスを返すときにLaravelによって自動的に追加される`links`または`meta`キーを誤ってオーバーライドしてしまうことを心配する必要はありません。追加定義した`links`は、ページネーターによって提供されるリンクとマージされます。

<a name="top-level-meta-data"></a>
#### トップレベルのメタデータ

リソースが返す最も外側のリソースである場合、リソースレスポンスへ特定のメタデータのみを含めたい場合があります。通常、これにはレスポンス全体に関するメタ情報が含まれます。このメタデータを定義するには、リソースクラスに`with`メソッドを追加します。このメソッドは、リソースが変換される最も外側のリソースである場合にのみ、リソースレスポンスに含めるメタデータの配列を返す必要があります。

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * リソースコレクションを配列に変換
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return parent::toArray($request);
    }

    /**
     * リソース配列と一緒に返すべき追加データを取得
     *
     * @return array<string, mixed>
     */
    public function with(Request $request): array
    {
        return [
            'meta' => [
                'key' => 'value',
            ],
        ];
    }
}
```

<a name="adding-meta-data-when-constructing-resources"></a>
#### リソースを構築する際のメタデータの追加

ルートまたはコントローラでリソースインスタンスを構築するときに、トップレベルのデータを追加することもできます。すべてのリソースで使用できる`additional`メソッドは、リソースレスポンスへ追加する必要のあるデータの配列を引数に取ります。

```php
return User::all()
    ->load('roles')
    ->toResourceCollection()
    ->additional(['meta' => [
        'key' => 'value',
    ]]);
```

<a name="jsonapi-resources"></a>
## JSON:APIリソース

Laravelは、[JSON:API仕様](https://jsonapi.org/)に準拠したレスポンスを生成するリソースクラスである`JsonApiResource`を同梱しています。これは標準の`JsonResource`クラスを拡張し、リソースオブジェクト構造、リレーションシップ、スパース・フィールドセット、インクルードを自動的に処理し、`Content-Type`ヘッダに`application/vnd.api+json`をセットします。

> [!NOTE]
> LaravelのJSON:APIリソースは、レスポンスのシリアル化を処理します。フィルタやソートなどの受信したJSON:APIクエリパラメータをパースする必要もある場合は、[SpatieのLaravel Query Builder](https://spatie.be/docs/laravel-query-builder/v6/introduction)が優れたコンパニオンパッケージになります。

<a name="generating-jsonapi-resources"></a>
### JSON:APIリソースの生成

JSON:APIリソースを生成するには、`--json-api`フラグを付けて`make:resource` Artisanコマンドを使用します。

```shell
php artisan make:resource PostResource --json-api
```

生成したクラスは、`Illuminate\Http\Resources\JsonApi\JsonApiResource`を拡張し、定義するための`$attributes`プロパティと`$relationships`プロパティを含んでいます。

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\JsonApi\JsonApiResource;

class PostResource extends JsonApiResource
{
    /**
     * リソースの属性
     */
    public $attributes = [
        // ...
    ];

    /**
     * リソースのリレーションシップ
     */
    public $relationships = [
        // ...
    ];
}
```

SON:APIリソースは、標準のリソースと同じようにルートやコントローラから返せます。

```php
use App\Http\Resources\PostResource;
use App\Models\Post;

Route::get('/api/posts/{post}', function (Post $post) {
    return new PostResource($post);
});
```

または、簡略するためにモデルの`toResource`メソッドを使用することもできます。

```php
Route::get('/api/posts/{post}', function (Post $post) {
    return $post->toResource();
});
```

これにより、JSON:API準拠のレスポンスが生成されます。

```json
{
    "data": {
        "id": "1",
        "type": "posts",
        "attributes": {
            "title": "Hello World",
            "body": "This is my first post."
        }
    }
}
```

JSON:APIリソースのコレクションを返すには、`collection`メソッドか、簡略型の`toResourceCollection`メソッドを使用します。

```php
return PostResource::collection(Post::all());

return Post::all()->toResourceCollection();
```

<a name="defining-jsonapi-attributes"></a>
### 属性の定義

JSON:APIリソースに含める属性を定義する方法は２つあります。

最も簡単な方法は、リソースに`$attributes`プロパティを定義することです。属性名を値としてリストすると、それらは基底のモデルから直接読み取られます。

```php
public $attributes = [
    'title',
    'body',
    'created_at',
];
```

または、リソースの属性を完全に制御するには、リソースの`toAttributes`メソッドをオーバーライドします。

```php
/**
 * リソースの属性を取得
 *
 * @return array<string, mixed>
 */
public function toAttributes(Request $request): array
{
    return [
        'title' => $this->title,
        'body' => $this->body,
        'is_published' => $this->published_at !== null,
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

<a name="defining-jsonapi-relationships"></a>
### リレーションシップの定義

JSON:APIリソースは、JSON:API仕様に従ったリレーションシップの定義をサポートしています。リレーションシップは、クライアントが`include`クエリパラメータを介して要求した場合のみ、シリアル化します。

#### The `$relationships`プロパティ

リソースの`$relationships`プロパティを介して、リソースのインクルード可能なリレーションシップを定義できます。

```php
public $relationships = [
    'author',
    'comments',
];
```

リレーションシップ名を値としてリストすると、Laravelは対応するEloquentリレーションシップを解決し、適切なリソースクラスを自動的に検出します。リソースクラスを明示的に指定する必要がある場合は、リレーションシップをキーとクラスのペアとして定義できます。

```php
use App\Http\Resources\UserResource;

public $relationships = [
    'author' => UserResource::class,
    'comments',
];
```

あるいは、リソースの`toRelationships`メソッドをオーバーライドすることもできます。

```php
/**
 * リソースのリレーションシップを取得
 */
public function toRelationships(Request $request): array
{
    return [
        'author' => UserResource::class,
        'comments',
    ];
}
```

#### リレーションシップのインクルード

クライアントは、`include`クエリパラメータを使用して関連リソースをリクエストできます。

```
GET /api/posts/1?include=author,comments
```

これにより、`relationships`キーにリソース識別子オブジェクト、トップレベルの`included`配列に完全なリソースオブジェクトが含まれるレスポンスが生成されます。

```json
{
    "data": {
        "id": "1",
        "type": "posts",
        "attributes": {
            "title": "Hello World"
        },
        "relationships": {
            "author": {
                "data": {
                    "id": "1",
                    "type": "users"
                }
            },
            "comments": {
                "data": [
                    {
                        "id": "1",
                        "type": "comments"
                    }
                ]
            }
        }
    },
    "included": [
        {
            "id": "1",
            "type": "users",
            "attributes": {
                "name": "Taylor Otwell"
            }
        },
        {
            "id": "1",
            "type": "comments",
            "attributes": {
                "body": "Great post!"
            }
        }
    ]
}
```

ネストしたリレーションシップは、ドット記法を使用してインクルードできます。

```
GET /api/posts/1?include=comments.author
```

<a name="jsonapi-relationship-depth"></a>
#### リレーションシップの深さ

デフォルトでは、ネストしたリレーションシップのインクルード制限は最大深度です。通常アプリケーションのサービスプロバイダのいずれかで、`maxRelationshipDepth`メソッドを使用してこの制限をカスタマイズできます。

```php
use Illuminate\Http\Resources\JsonApi\JsonApiResource;

JsonApiResource::maxRelationshipDepth(3);
```

<a name="jsonapi-resource-type-and-id"></a>
### リソースタイプとID

リソースの`type`は、デフォルトでリソースクラス名から派生します。例えば、`PostResource`は`posts`タイプを生成し、`BlogPostResource`は`blog-posts`を生成します。リソースの`id`はモデルのプライマリキーから解決されます。

これらの値をカスタマイズする必要がある場合は、リソースの`toType`メソッドと`toId`メソッドをオーバーライドしてください。

```php
/**
 * リソースのタイプを取得
 */
public function toType(Request $request): string
{
    return 'articles';
}

/**
 * リソースのIDを取得
 */
public function toId(Request $request): string
{
    return (string) $this->uuid;
}
```

これは、`AuthorResource`が`User`モデルをラップし、`authors`タイプを出力する必要がある場合など、リソースのタイプをクラス名と異なるものにする必要がある場合に特に便利です。

<a name="jsonapi-sparse-fieldsets-and-includes"></a>
### スパース・フィールドセットとインクルード

JSON:APIリソースは[スパース・フィールドセット](https://jsonapi.org/format/#fetching-sparse-fieldsets)をサポートしており、クライアントが`fields`クエリパラメータを使用して各リソースタイプの特定の属性のみをリクエストできるようにします。

```
GET /api/posts?fields[posts]=title,created_at&fields[users]=name
```

これにより、`posts`リソースの`title`と`created_at`属性、および`users`リソースの`name`属性のみが含まれます。

<a name="jsonapi-ignoring-query-string"></a>
#### クエリ文字列の無視

特定のリソースレスポンスでスパース・フィールドセットのフィルタリングを無効にしたい場合は、`ignoreFieldsAndIncludesInQueryString`メソッドを呼び出せます。

```php
return $post->toResource()
    ->ignoreFieldsAndIncludesInQueryString();
```

<a name="jsonapi-including-previously-loaded-relationships"></a>
#### 以前にロード済みのリレーションシップのインクルード

リレーションシップは、`include`クエリパラメータを介してリクエストされた場合にのみ、デフォルトでレスポンスへ含めます。クエリ文字列に関係なく、以前にEagerロード済みの全リレーションシップを含めたい場合は、`includePreviouslyLoadedRelationships`メソッドを呼び出します。

```php
return $post->load('author', 'comments')
    ->toResource()
    ->includePreviouslyLoadedRelationships();
```

<a name="jsonapi-links-and-meta"></a>
### リンクとメタ

リソースの`toLinks`メソッドと`toMeta`メソッドをオーバーライドすれば、JSON:APIリソースオブジェクトにリンクとメタ情報を追加できます。

```php
/**
 * リソースのリンクを取得
 */
public function toLinks(Request $request): array
{
    return [
        'self' => route('api.posts.show', $this->resource),
    ];
}

/**
 * リソースのメタ情報を取得
 */
public function toMeta(Request $request): array
{
    return [
        'readable_created_at' => $this->created_at->diffForHumans(),
    ];
}
```

これにより、レスポンスのリソースオブジェクトへ`links`キーと`meta`キーを追加します。

```json
{
    "data": {
        "id": "1",
        "type": "posts",
        "attributes": {
            "title": "Hello World"
        },
        "links": {
            "self": "https://example.com/api/posts/1"
        },
        "meta": {
            "readable_created_at": "2 hours ago"
        }
    }
}
```

<a name="resource-responses"></a>
## リソースレスポンス

すでにお読みになったように、リソースはルートとコントローラから直接返します。

```php
use App\Models\User;

Route::get('/user/{id}', function (string $id) {
    return User::findOrFail($id)->toResource();
});
```

しかし、クライアントに送信する前に、送信HTTPレスポンスをカスタマイズする必要が起きる場合があります。これを実現するには２つの方法があります。最初の方法は、`response`メソッドをリソースにチェーンすることです。このメソッドは`Illuminate\Http\JsonResponse`インスタンスを返し、皆さんがレスポンスのヘッダを完全にコントロールできるようにします。

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/user', function () {
    return User::find(1)
        ->toResource()
        ->response()
        ->header('X-Value', 'True');
});
```

もう一つの方法は、リソース自身の中で`withResponse`メソッドを定義することです。このメソッドは、リソースがレスポンスにおいて最も外側のリソースとして返されるときに呼び出されます。

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * リソースを配列に変換
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
        ];
    }

    /**
     * リソースの送信レスポンスをカスタマイズ
     */
    public function withResponse(Request $request, JsonResponse $response): void
    {
        $response->header('X-Value', 'True');
    }
}
```
