# 画像操作

- [イントロダクション](#introduction)
- [インストール](#installation)
    - [設定](#configuration)
- [画像読み込み](#reading-images)
    - [アップロード済みファイル](#uploaded-files)
    - [保存ファイル](#storage-files)
    - [その他のソース](#other-sources)
- [画像操作](#manipulating-images)
    - [画像リサイズ](#resizing-images)
    - [他の操作](#other-transformations)
- [画像のエンコード](#encoding-images)
- [画像の保存](#storing-images)
- [画像の調査](#inspecting-images)
- [画像ドライバ](#image-drivers)
    - [画像ドライバのカスタマイズ](#custom-image-drivers)
    - [カスタム操作](#custom-transformations)

<a name="introduction"></a>
## イントロダクション

Laravelは、フレームワーク全体で見られる表現力豊かな規約と同じ規約を使用して、画像のサイズ変更、クロップ、エンコード、保存を行える読み書きしやすい画像操作APIを提供しています。Laravelの画像機能は[Intervention Image](https://image.intervention.io/)をベースにしており、GDおよびImagick PHP拡張モジュールをサポートしています。

画像APIは、アップロード済みファイル、Laravelの[ファイルシステムディスク](/docs/{{version}}/filesystem)に保存しているファイル、ローカルファイル、リモートURL、または画像の生バイトを処理するときに便利です。

```php
use Illuminate\Support\Facades\Image;

$path = Image::fromStorage('avatars/photo.jpg', 'public')
    ->cover(400, 400)
    ->toWebp()
    ->quality(80)
    ->storePublicly('avatars', 'public');
```

> [!WARNING]
> 画像操作は、CPUとメモリを大量に消費する可能性があります。大規模な画像処理のワークロードは、アップロードを受け取るHTTPリクエスト中ではなく、[ジョブキュー](/docs/{{version}}/queues)で実行することを検討してください。

<a name="installation"></a>
## インストール

Laravelの画像操作機能を使用する前に、Composer経由でIntervention Imageパッケージをインストールしてください。

```shell
composer require intervention/image:^4.0
```

また、アプリケーションが使用するドライバに応じて、確実にPHP環境へGDまたはImagick拡張モジュールのいずれかをインストールしてください。

<a name="configuration"></a>
### 設定

Laravelの画像設定ファイルは、`config/images.php`にあります。アプリケーションに`images`設定ファイルがない場合は、`config:publish` Artisanコマンドを使用してリソース公開できます。

```shell
php artisan config:publish images
```

画像設定ファイルで、アプリケーションのデフォルトの画像ドライバを指定できます。また、`IMAGE_DRIVER`環境変数を使用してデフォルトのドライバを指定することも可能です。サポートしているドライバは、`gd`と`imagick`です。

```ini
IMAGE_DRIVER=imagick
```

<a name="reading-images"></a>
## 画像読み込み

`Image`ファサードは、一般的なソースから画像を読み込むためのメソッドをいくつか提供します。画像コンテンツは遅延ロードされるため、通常は画像が処理されるか、そのバイトが要求されるまで、ソースを読み込みません。

<a name="uploaded-files"></a>
### アップロード済みファイル

`image`メソッドを使用すれば、受信リクエストからアップロードした画像を取得できます。このメソッドは、アップロードしたファイルの`Illuminate\Image\Image`インスタンスを返します。ファイルが存在しない場合は`null`を返します。

```php
use Illuminate\Http\Request;

Route::post('/avatar', function (Request $request)
    {$request->validate(['avatar' => ['required', 'image']]);

    $path =$request->image('avatar')
        ->cover(400, 400)
        ->toWebp()
        ->storePublicly('avatars', 'public');

    // ...
});
```

あるいは、`fromUpload`メソッドを使用して、`Illuminate\Http\UploadedFile`インスタンスから画像インスタンスを作成することもできます。

```php
use Illuminate\Support\Facades\Image;

$image = Image::fromUpload($request->file('avatar'));
```

アップロード済みファイルから画像を作成した場合、`file`メソッドを使用して基になるアップロードファイルを取得できます。

```php
$file =$image->file();
```

<a name="storage-files"></a>
### 保存ファイル

`fromStorage`メソッドを使用すれば、アプリケーションの[ファイルシステムディスク](/docs/{{version}}/filesystem)のいずれかに保存しているファイルから画像インスタンスを作成できます。第１引数はファイルへのパス、第２引数はディスク名です。

```php
use Illuminate\Support\Facades\Image;

$image = Image::fromStorage('avatars/photo.jpg', disk: 'public');
```

また、`image`メソッドを使用して、ファイルシステムディスクインスタンスから直接画像インスタンスを作成することもできます。

```php
use Illuminate\Support\Facades\Storage;

$image = Storage::disk('public')->image('avatars/photo.jpg');
```

<a name="other-sources"></a>
### その他のソース

`Image`ファサードには、生のバイト、ローカルファイルのパス、リモートURL、およびBase64エンコードされた文字列から画像インスタンスを作成するためのメソッドも用意しています。

```php
use Illuminate\Support\Facades\Image;

$image = Image::fromBytes($contents);
$image = Image::fromBase64($base64);
$image = Image::fromPath(storage_path('app/avatars/photo.jpg'));
$image = Image::fromUrl('[https://example.com/photo.jpg](https://example.com/photo.jpg)');
```

<a name="manipulating-images"></a>
## 画像操作

画像インスタンスはイミュータブルです。各操作メソッドは、処理パイプラインに変換を追加した新しい画像インスタンスを返すため、メソッドを流暢にチェーンできます。

```php
$image =$request->image('avatar')
    ->orient()
    ->cover(400, 400)
    ->sharpen(10);
```

変換は、画像パイプラインに追加した順に処理され、画像は最後に1回だけエンコードされます。

<a name="resizing-images"></a>
### 画像リサイズ

`resize`メソッドは、画像を特定のサイズに変更します。幅と高さの両方を指定することも、名前付き引数を使用して1つの次元だけを指定することもできます。

```php
$image =$image->resize(800, 600);
$image =$image->resize(width: 800);
$image =$image->resize(height: 600);
```

`scale`メソッドは、指定したサイズに収まるように画像を比例的に縮小します。このメソッドが画像のサイズを拡大することはありません。

```php
$image =$image->scale(800, 600);
$image =$image->scale(width: 800);
$image =$image->scale(height: 600);
```

`cover`メソッドは、指定したサイズを完全に覆うように画像のサイズを変更し、クロップします。

```php
$image =$image->cover(400, 400);
```

`contain`メソッドは、画像全体を維持しながら、指定したサイズに収まるように画像のサイズを変更します。必要に応じて、オプションの背景色を使用して空白を埋めます。

```php
$image =$image->contain(400, 400);
$image =$image->contain(400, 400, '#ffffff');
$image = $image->contain(400, 400, 'dominant');
```

画像の支配色で余白を埋めるには、背景色として`dominant`を指定します。

`crop`メソッドを使用して画像をクロップできます。最初の２つの引数は希望する幅と高さで、オプションの第３引数と第４引数でクロップの`x`座標と`y`座標を指定します。

```php
$image =$image->crop(300, 200);
$image =$image->crop(300, 200, x: 50, y: 25);
```

<a name="other-transformations"></a>
### 他の操作

Laravelは、他にもさまざまな画像変換メソッドを提供しています。

```php
$image =$image->orient();
$image =$image->rotate(90);
$image =$image->rotate(90, '#ffffff');
$image = $image->rotate(90, 'dominant');
$image =$image->blur(5);
$image =$image->grayscale();
$image =$image->sharpen(10);
$image =$image->flipVertically();
$image =$image->flipHorizontally();
```

`orient`メソッドは、EXIF回転データに従って画像を回転させます。`rotate`メソッドは、指定した角度だけ画像を時計回りに回転させ、オプションの背景色を受け入れます。`blur`メソッドと`sharpen`メソッドは、`0`から`100`の間の値を受け入れます。

<a name="conditional-transformations"></a>
#### 条件付き操作

画像インスタンスはLaravelの`Conditionable`トレイトをサポートしているため、`when`メソッドと`unless`メソッドを使用して、条件付きで変換を適用できます。

```php
$image =$request->image('avatar')
    ->when($request->boolean('crop'), fn ($image) => $image->cover(400, 400))
    ->unless($request->boolean('preserve_format'), fn ($image) =>$image->toWebp());
```

<a name="encoding-images"></a>
## 画像のエンコード

デフォルトでは、処理済みの画像は元のフォーマットを使用してエンコードされます。ただし、画像を取得または保存する前に、別のサポートしているフォーマットに変換できます。

```php
$image =$image->toWebp();
$image =$image->toJpg();
$image =$image->toJpeg();
$image = $image->toPng();
$image = $image->toGif();
$image = $image->toAvif();
$image = $image->toBmp();
```

`quality`メソッドを使用して、出力品質を設定できます。品質は`1`から`100`の間に制限されます。

```php
$image =$image->toWebp()->quality(80);
```

`optimize`メソッドは、画像を指定したフォーマットに変換し、その品質を設定するための便利なショートカットです。デフォルトでは、画像は品質`70`のWebP画像として最適化されます。

```php
$image =$image->optimize();

$image =$image->optimize(format: 'jpg', quality: 85);
```

処理済みの画像コンテンツをバイト文字列、base64エンコードされた文字列、またはデータURIとして取得できます。

```php
$bytes =$image->toBytes();
$base64 =$image->toBase64();
$dataUri =$image->toDataUri();
```

画像インスタンスを文字列にキャストして、データURIを取得することもできます。

```php
$dataUri = (string) $image;
```

<a name="storing-images"></a>
## 画像の保存

`store`メソッドは、処理済みの画像をアプリケーションのファイルシステムディスクのいずれかに保存します。アップロードしたファイルと同様に、Laravelはユニークなファイル名を生成し、保存したパスを返します。第２引数を使用してディスクを指定できます。

```php
$path =$request->image('avatar')
    ->cover(400, 400)
    ->store(path: 'avatars');

$path =$request->image('avatar')
    ->cover(400, 400)
    ->store(path: 'avatars', disk: 's3');
```

`storeAs`メソッドを使用して、保存するファイル名を指定できます。

```php
$path =$request->image('avatar')
    ->cover(400, 400)
    ->storeAs(path: 'avatars', name: 'avatar.jpg', disk: 'public');
```

`storePublicly`メソッドと`storePubliclyAs`メソッドは、画像を`public`な公開設定で保存します。

```php
$path =$request->image('avatar')
    ->cover(400, 400)
    ->storePublicly(path: 'avatars', disk: 'public');

$path =$request->image('avatar')
    ->cover(400, 400)
    ->storePubliclyAs(path: 'avatars', name: 'avatar.webp', disk: 'public');
```

画像を保存できなかった場合、保存メソッドは`false`を返します。

<a name="inspecting-images"></a>
## 画像の調査

以下のメソッドを使用して、画像のMIMEタイプ、拡張子、サイズ、幅、高さ、支配色を取得できます。

```php
$mimeType =$image->mimeType();
$extension =$image->extension();

[$width, $height] =$image->dimensions();
$width =$image->width();
$height =$image->height();

$dominantColor = $image->dominantColor();
```

これらのメソッドは、処理済みの画像に対して動作します。たとえば、`cover(400, 400)`の後に`width`を呼び出すと、`400`を返します。

<a name="image-drivers"></a>
## 画像ドライバ

<a name="custom-image-drivers"></a>
### 画像ドライバのカスタマイズ

Laravelの画像マネージャは、Laravelのベースである`Illuminate\Support\Manager`クラスを拡張しています。つまり、画像マネージャおよび`Image`ファサードで利用できる`extend`メソッドを使用して、カスタム画像ドライバを登録できます。

カスタム画像ドライバは、`Illuminate\Contracts\Image\Driver`インターフェイスを実装する必要があります。`process`メソッドは、元の画像コンテンツと、画像に適用すべき順序付けられた`Illuminate\Image\ImagePipeline`を受け取り、処理済みの画像バイトを返す必要があります。

```php
<?php

namespace App\Images;

use Illuminate\Contracts\Image\Driver;
use Illuminate\Image\ImagePipeline;

class VipsDriver implements Driver
{
    /**
     * 指定パイプラインで、特定の画像コンテンツを処理
     */
    public function process(string $contents, ImagePipeline$pipeline): string
    {
        // パイプラインの変換と出力オプションを適用…

        return $contents;
    }

    /**
     * 変換ハンドラの登録
     */
    public function transformUsing(string $transformation, callable$callback): static
    {
        // パイプラインの処理中に適用できるように、ハンドラを保存…

        return $this;
    }
}
```

> [!NOTE]
> カスタム画像ドライバの実装方法をより深く理解するために、フレームワークに組み込まれている`Illuminate\Image\Drivers\InterventionDriver`クラスを確認するとよいでしょう。

カスタムドライバを実装したら、`Image`ファサードの`extend`メソッドを使用して登録できます。通常、これはサービスプロバイダの`boot`メソッドで行います。

```php
use App\Images\VipsDriver;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Image;

/**
 * 全アプリケーションサービスの初期起動処理
 */
public function boot(): void
{
    Image::extend('vips', function (Application $app) {
        return new VipsDriver;
    });
}
```

ドライバを登録した後は、`using`メソッドを使用して、指定画像へそのドライバを使用できます。

```php
$image =$request->image('avatar')
    ->using('vips')
    ->cover(400, 400);
```

また、アプリケーションの`config/images.php`設定ファイルの`default`オプション、または`IMAGE_DRIVER`環境変数を使用して、カスタムドライバをアプリケーションのデフォルトの画像ドライバとして設定することもできます。

```ini
IMAGE_DRIVER=vips
```

<a name="custom-transformations"></a>
### カスタム操作

アプリケーションやパッケージは、`Illuminate\Contracts\Image\Transformation`契約を実装するクラスを作成することで、カスタム変換を定義できます。その後、`transform`メソッドを使用して、カスタム変換を画像パイプラインに追加できます。

```php
<?php

namespace App\Images\Transformations;

use Illuminate\Contracts\Image\Transformation;

class Pixelate implements Transformation
{
    public function __construct(
        public readonly int $size,
    ) {
        //
    }
}
```

次に、`Image`ファサードの`transformUsing`メソッドを使用して、変換とドライバのハンドラを登録します。通常、これはサービスプロバイダの`boot`メソッドで行います。

```php
use App\Images\Transformations\Pixelate;
use Illuminate\Support\Facades\Image;
use Intervention\Image\Interfaces\ImageInterface;

Image::transformUsing('gd', Pixelate::class, function (ImageInterface $image, Pixelate$transformation) {
    return $image->pixelate($transformation->size);
});
```

変換ハンドラを登録すると、画像へその変換を適用できます。

```php
use App\Images\Transformations\Pixelate;

$image =$request->image('avatar')
    ->transform(new Pixelate(12))
    ->store('avatars');
```
