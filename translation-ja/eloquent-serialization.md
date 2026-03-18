# Eloquent: シリアライズ

- [イントロダクション](#introduction)
- [モデルとコレクションのシリアル化](#serializing-models-and-collections)
    - [配列へのシリアル化](#serializing-to-arrays)
    - [JSONへのシリアル化](#serializing-to-json)
- [JSONから属性を隠す](#hiding-attributes-from-json)
- [JSONへ値の追加](#appending-values-to-json)
- [日付のシリアル化](#date-serialization)

<a name="introduction"></a>
## イントロダクション

Laravelを使用してAPIを構築する場合、モデルとリレーションを配列またはJSONに変換する必要が頻繁にあります。Eloquentには、これらの変換を行うための便利な方法と、モデルのシリアル化された表現に含まれる属性を制御するための便利な方法が含まれています。

> [!NOTE]
> EloquentモデルとコレクションのJSONシリアル化を処理するさらに堅牢な方法については、[Eloquent APIリソース](/docs/{{version}}/eloquent-resources)のドキュメントを確認してください。

<a name="serializing-models-and-collections"></a>
## モデルとコレクションのシリアル化

<a name="serializing-to-arrays"></a>
### 配列へのシリアル化

モデルとそのロードされた[リレーション](/docs/{{version}}/eloquent-relationships)を配列へ変換するには、`toArray`メソッドを使用する必要があります。このメソッドは再帰的であるため、すべての属性とすべてのリレーション(リレーションのリレーションを含む)を配列へ変換します。

```php
use App\Models\User;

$user = User::with('roles')->first();

return $user->toArray();
```

`attributesToArray`メソッドを使用して、モデルの属性を配列に変換できますが、そのリレーションは変換できません。

```php
$user = User::first();

return $user->attributesToArray();
```

コレクションインスタンスで`toArray`メソッドを呼び出すことにより、モデルの[コレクション](/docs/{{version}}/eloquent-collections)全体を配列へ変換することもできます。

```php
$users = User::all();

return $users->toArray();
```

<a name="serializing-to-json"></a>
### JSONへのシリアル化

モデルをJSONに変換するには、`toJson`メソッドを使用する必要があります。`toArray`と同様に、`toJson`メソッドは再帰的であるため、すべての属性とリレーションはJSONに変換されます。[PHPがサポートしている](https://secure.php.net/manual/en/function.json-encode.php)JSONエンコーディングオプションを指定することもできます。

```php
use App\Models\User;

$user = User::find(1);

return $user->toJson();

return $user->toJson(JSON_PRETTY_PRINT);
```

もしくは、モデルまたはコレクションを文字列にキャストすると、モデルまたはコレクションの`toJson`メソッドが自動的に呼び出されます。

```php
return (string) User::find(1);
```

モデルとコレクションは文字列にキャストされるとJSONに変換されるため、アプリケーションのルートまたはコントローラから直接Eloquentオブジェクトを返すことができます。Laravelはルートまたはコントローラから返されるときに、EloquentモデルコレクションをJSONへ自動的にシリアル化します。

```php
Route::get('/users', function () {
    return User::all();
});
```

<a name="relationships"></a>
#### リレーション

EloquentモデルをJSONに変換すると、ロードずみのリレーションは自動的にJSONオブジェクトの属性として含まれます。また、Eloquentリレーションシップメソッドは「キャメルケース」メソッド名を使用して定義されますが、リレーションシップのJSON属性は「スネークケース」になります。

<a name="hiding-attributes-from-json"></a>
## JSONから属性を隠す

Sometimes you may wish to limit the attributes, such as passwords, that are included in your model's array or JSON representation. To do so, you may use the `Hidden` attribute on your model. Attributes that are listed in the `Hidden` attribute will not be included in the serialized representation of your model:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;

#[Hidden(['password'])]
class User extends Model
{
    // ...
}
```


> [!NOTE]
> To hide relationships, add the relationship's method name to your Eloquent model's `Hidden` attribute.

Alternatively, you may use the `Visible` attribute to define an "allow list" of attributes that should be included in your model's array and JSON representation. All attributes that are not present in the `Visible` attribute will be hidden when the model is converted to an array or JSON:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Visible;
use Illuminate\Database\Eloquent\Model;

#[Visible(['first_name', 'last_name'])]
class User extends Model
{
    // ...
}
```

<a name="temporarily-modifying-attribute-visibility"></a>
#### 属性の可視性を一時的に変更

特定のモデルインスタンスで通常は非表示になっている属性を表示したい場合は、`makeVisible`や`mergeVisible`メソッドを使用します。`makeVisible`メソッドはモデルインスタンスを返します:

```php
return $user->makeVisible('attribute')->toArray();

return $user->mergeVisible(['name', 'email'])->toArray();
```

同様に、通常表示される属性を非表示にしたい場合は、`makeHidden`または`mergeHidden`メソッドを使用します。

```php
return $user->makeHidden('attribute')->toArray();

return $user->mergeHidden(['name', 'email'])->toArray();
```

一時的にすべてのvisible属性やhidden属性を上書きしたい場合は、`setVisible`または`setHidden`メソッドが使用できます。

```php
return $user->setVisible(['id', 'name'])->toArray();

return $user->setHidden(['email', 'password', 'remember_token'])->toArray();
```

<a name="appending-values-to-json"></a>
## JSONへ値の追加

モデルを配列またはJSONに変換するときに、データベースに対応するカラムがない属性を追加したい場合もまれにあります。これを行うには、最初に値の[アクセサ](/docs/{{version}}/eloquent-mutators)を定義します。

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * ユーザーが管理者かを判断
     */
    protected function isAdmin(): Attribute
    {
        return new Attribute(
            get: fn () => 'yes',
        );
    }
}
```

If you would like the accessor to always be appended to your model's array and JSON representations, you may use the `Appends` attribute on your model. Note that attribute names are typically referenced using their "snake case" serialized representation, even though the accessor's PHP method is defined using "camel case":

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Model;

#[Appends(['is_admin'])]
class User extends Model
{
    // ...
}
```

属性を`appends`リストへ追加すると、モデルの配列とJSON表現の両方に含まれます。`appends`配列の属性は、モデルで設定された`visible`および`hidden`設定も尊重します。

<a name="appending-at-run-time"></a>
#### 実行時の追加

実行時に、`append`や`mergeAppends`メソッドを使用して追加の属性を追加するようにモデルインスタンスへ指示できます。または、`setAppends`メソッドを使用して、特定のモデルインスタンスに追加されたプロパティの配列全体をオーバーライドすることもできます。

```php
return $user->append('is_admin')->toArray();

return $user->mergeAppends(['is_admin', 'status'])->toArray();

return $user->setAppends(['is_admin'])->toArray();
```

同様に、モデルからすべての追加したプロパティを削除したい場合は、`withoutAppends`メソッドを使用します。

```php
return $user->withoutAppends()->toArray();
```

<a name="date-serialization"></a>
## 日付のシリアル化

<a name="customizing-the-default-date-format"></a>
#### デフォルトの日付形式のカスタマイズ

`serializeDate`メソッドをオーバーライドすることにより、デフォルトのシリアル化形式をカスタマイズできます。この方法は、データベースに保存するために日付をフォーマットする方法には影響しません。

```php
/**
 * 配列／JSONシリアライズ用に日付を準備
 */
protected function serializeDate(DateTimeInterface $date): string
{
    return $date->format('Y-m-d');
}
```

<a name="customizing-the-date-format-per-attribute"></a>
#### 属性ごとの日付形式のカスタマイズ

モデルの[キャスト定義](/docs/{{version}}/eloquent-mutators#attribute-casting)で日付形式を指定することにより、個々のEloquent日付属性のシリアル化形式をカスタマイズできます。

```php
protected function casts(): array
{
    return [
        'birthday' => 'date:Y-m-d',
        'joined_at' => 'datetime:Y-m-d H:00',
    ];
}
```
