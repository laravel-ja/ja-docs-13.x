# Laravel MCP

- [イントロダクション](#introduction)
- [インストール](#installation)
    - [ルートの公開](#publishing-routes)
- [サーバの作成](#creating-servers)
    - [サーバの登録](#server-registration)
    - [Webサーバ](#web-servers)
    - [ローカルサーバ](#local-servers)
- [ツール](#tools)
    - [ツールの作成](#creating-tools)
    - [ツールの入力スキーマ](#tool-input-schemas)
    - [ツールの出力スキーマ](#tool-output-schemas)
    - [ツール引数のバリデーション](#validating-tool-arguments)
    - [ツールの依存注入](#tool-dependency-injection)
    - [ツールのアノテーション](#tool-annotations)
    - [条件付きツール登録](#conditional-tool-registration)
    - [ツールのレスポンス](#tool-responses)
- [プロンプト](#prompts)
    - [プロンプトの作成](#creating-prompts)
    - [プロンプトの引数](#prompt-arguments)
    - [プロンプト引数のバリデーション](#validating-prompt-arguments)
    - [プロンプトの依存注入](#prompt-dependency-injection)
    - [条件付きプロンプト登録](#conditional-prompt-registration)
    - [プロンプトのレスポンス](#prompt-responses)
- [リソース](#resources)
    - [リソースの作成](#creating-resources)
    - [リソーステンプレート](#resource-templates)
    - [リソースURIとMIMEタイプ](#resource-uri-and-mime-type)
    - [リソースリクエスト](#resource-request)
    - [リソースの依存注入](#resource-dependency-injection)
    - [リソースアノテーション](#resource-annotations)
    - [条件付きリソース登録](#conditional-resource-registration)
    - [リソースのレスポンス](#resource-responses)
- [メタデータ](#metadata)
- [認証](#authentication)
    - [OAuth 2.1](#oauth)
    - [Sanctum](#sanctum)
- [認可](#authorization)
- [サーバのテスト](#testing-servers)
    - [MCPインスペクタ](#mcp-inspector)
    - [ユニットテスト](#unit-tests)

<a name="introduction"></a>
## イントロダクション

[Laravel MCP](https://github.com/laravel/mcp)は、[Model Context Protocol](https://modelcontextprotocol.io/docs/getting-started/intro)を介してAIクライアントがLaravelアプリケーションと対話するための、シンプルでエレガントな方法を提供します。アプリケーションとのAIによる対話を可能にするサーバ、ツール、リソース、プロンプトを定義するための、表現力豊かで読み書きしやすいインターフェイスを提供します。

<a name="installation"></a>
## インストール

使い始めるには、Composerパッケージマネージャを使い、プロジェクトへLaravel MCPをインストールしてください。

```shell
composer require laravel/mcp
```

<a name="publishing-routes"></a>
### ルートの公開

Laravel MCPをインストールした後、`vendor:publish` Artisanコマンドを実行して、MCPサーバを定義する`routes/ai.php`ファイルを公開してください。

```shell
php artisan vendor:publish --tag=ai-routes
```

このコマンドは、アプリケーションの`routes`ディレクトリに`routes/ai.php`ファイルを作成します。このファイルはMCPサーバを登録するために使用します。

<a name="creating-servers"></a>
## サーバの作成

`make:mcp-server` Artisanコマンドを使用してMCPサーバを作成できます。サーバは、ツール、リソース、プロンプトのようなMCP機能をAIクライアントに公開する中心的な通信ポイントとして機能します。

```shell
php artisan make:mcp-server WeatherServer
```

このコマンドは、`app/Mcp/Servers`ディレクトリに新しいサーバクラスを作成します。生成するサーバクラスは、Laravel MCPのベースである`Laravel\Mcp\Server`クラスを継承しており、サーバの設定やツール、リソース、プロンプトを登録するための属性とプロパティを提供します。

```php
<?php

namespace App\Mcp\Servers;

use Laravel\Mcp\Server\Attributes\Instructions;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Version;
use Laravel\Mcp\Server;

#[Name('Weather Server')]
#[Version('1.0.0')]
#[Instructions('This server provides weather information and forecasts.')]
class WeatherServer extends Server
{
    /**
     * このMCPサーバで登録するツール
     *
     * @var array<int, class-string<\Laravel\Mcp\Server\Tool>>
     */
    protected array $tools = [
        // GetCurrentWeatherTool::class,
    ];

    /**
     * このMCPサーバで登録するリソース
     *
     * @var array<int, class-string<\Laravel\Mcp\Server\Resource>>
     */
    protected array $resources = [
        // WeatherGuidelinesResource::class,
    ];

    /**
     * このMCPサーバで登録するプロンプト
     *
     * @var array<int, class-string<\Laravel\Mcp\Server\Prompt>>
     */
    protected array $prompts = [
        // DescribeWeatherPrompt::class,
    ];
}
```

<a name="server-registration"></a>
### サーバの登録

サーバを作成したら、アクセス可能にするために`routes/ai.php`ファイルに登録する必要があります。Laravel MCPはサーバを登録するために2つのメソッドを提供します。HTTPでアクセス可能なサーバ用の`web`と、コマンドラインサーバ用の`local`です。

<a name="web-servers"></a>
### Webサーバ

Webサーバは最も一般的なタイプのサーバであり、HTTP POSTリクエストを介してアクセスできるため、リモートAIクライアントやWebベースの統合に最適です。Webサーバを登録するには`web`メソッドを使用します:

```php
use App\Mcp\Servers\WeatherServer;
use Laravel\Mcp\Facades\Mcp;

Mcp::web('/mcp/weather', WeatherServer::class);
```

通常のルートと同様に、ミドルウェアを適用してWebサーバを保護できます:

```php
Mcp::web('/mcp/weather', WeatherServer::class)
    ->middleware(['throttle:mcp']);
```

<a name="local-servers"></a>
### ローカルサーバ

ローカルサーバはArtisanコマンドとして実行され、[Laravel Boost](/docs/{{version}}/installation#installing-laravel-boost)のようなローカルAIアシスタントの統合を構築するのに最適です。ローカルサーバを登録するには`local`メソッドを使用します:

```php
use App\Mcp\Servers\WeatherServer;
use Laravel\Mcp\Facades\Mcp;

Mcp::local('weather', WeatherServer::class);
```

登録後は、通常、`mcp:start` Artisanコマンドを手作業で実行する必要はありません。代わりに、MCPクライアント(AIエージェント)を設定してサーバを起動するか、[MCPインスペクタ](#mcp-inspector)を使用してください。

<a name="tools"></a>
## ツール

ツールを使用すると、サーバはAIクライアントが呼び出せる機能を公開できます。これにより、言語モデルはアクションの実行、コードの実行、または外部システムとの対話が可能になります:

```php
<?php

namespace App\Mcp\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description('Fetches the current weather forecast for a specified location.')]
class CurrentWeatherTool extends Tool
{
    /**
     * ツールリクエストの処理
     */
    public function handle(Request $request): Response
    {
        $location = $request->get('location');

        // 天気を取得...

        return Response::text('The weather is...');
    }

    /**
     * ツールの入力スキーマの取得
     *
     * @return array<string, \Illuminate\JsonSchema\Types\Type>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'location' => $schema->string()
                ->description('The location to get the weather for.')
                ->required(),
        ];
    }
}
```

<a name="creating-tools"></a>
### ツールの作成

ツールを作成するには、`make:mcp-tool` Artisanコマンドを実行します:

```shell
php artisan make:mcp-tool CurrentWeatherTool
```

ツールを作成した後、サーバの`$tools`プロパティに登録してください:

```php
<?php

namespace App\Mcp\Servers;

use App\Mcp\Tools\CurrentWeatherTool;
use Laravel\Mcp\Server;

class WeatherServer extends Server
{
    /**
     * このMCPサーバで登録するツール
     *
     * @var array<int, class-string<\Laravel\Mcp\Server\Tool>>
     */
    protected array $tools = [
        CurrentWeatherTool::class,
    ];
}
```

<a name="tool-name-title-description"></a>
#### ツール名、タイトル、説明

デフォルトで、ツールの名前とタイトルはクラス名から派生します。例えば、`CurrentWeatherTool`の名前は`current-weather`になり、タイトルは`Current Weather Tool`になります。これらの値は、`Name`属性と`Title`属性を使用してカスタマイズできます。

```php
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;

#[Name('get-optimistic-weather')]
#[Title('Get Optimistic Weather Forecast')]
class CurrentWeatherTool extends Tool
{
    // ...
}
```

ツールの説明は自動的に生成しません。`Description`属性を使用し、意味のある説明を常に提供してください。

```php
use Laravel\Mcp\Server\Attributes\Description;

#[Description('Fetches the current weather forecast for a specified location.')]
class CurrentWeatherTool extends Tool
{
    //
}
```

> [!NOTE]
> 説明はツールのメタデータの重要な部分であり、AIモデルがツールをいつ、どのように効果的に使用するかを理解するのに役立ちます。

<a name="tool-input-schemas"></a>
### ツールの入力スキーマ

ツールは入力スキーマを定義して、AIクライアントから受け入れる引数を指定できます。Laravelの`Illuminate\Contracts\JsonSchema\JsonSchema`ビルダを使用して、ツールの入力要件を定義してください:

```php
<?php

namespace App\Mcp\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Server\Tool;

class CurrentWeatherTool extends Tool
{
    /**
     * ツールの入力スキーマの取得
     *
     * @return array<string, \Illuminate\JsonSchema\Types\Type>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'location' => $schema->string()
                ->description('The location to get the weather for.')
                ->required(),

            'units' => $schema->string()
                ->enum(['celsius', 'fahrenheit'])
                ->description('The temperature units to use.')
                ->default('celsius'),
        ];
    }
}
```

<a name="tool-output-schemas"></a>
### ツールの出力スキーマ

ツールは[出力スキーマ](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#output-schema)を定義して、レスポンスの構造を指定できます。これにより、解析可能なツール結果を必要とするAIクライアントとの連携が向上します。`outputSchema`メソッドを使用してツールの出力構造を定義してください：

```php
<?php

namespace App\Mcp\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Server\Tool;

class CurrentWeatherTool extends Tool
{
    /**
     * Get the tool's output schema.
     *
     * @return array<string, \Illuminate\JsonSchema\Types\Type>
     */
    public function outputSchema(JsonSchema $schema): array
    {
        return [
            'temperature' => $schema->number()
                ->description('Temperature in Celsius')
                ->required(),

            'conditions' => $schema->string()
                ->description('Weather conditions')
                ->required(),

            'humidity' => $schema->integer()
                ->description('Humidity percentage')
                ->required(),
        ];
    }
}
```

<a name="validating-tool-arguments"></a>
### ツール引数のバリデーション

JSON Schema定義はツール引数の基本的な構造を提供しますが、より複雑なバリデーションルールを適用したい場合もあるでしょう。

Laravel MCPは、Laravelの[バリデーション機能](/docs/{{version}}/validation)とシームレスに連携します。ツールの`handle`メソッド内で、受信したツール引数をバリデーションできます。

```php
<?php

namespace App\Mcp\Tools;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class CurrentWeatherTool extends Tool
{
    /**
     * ツールリクエストの処理
     */
    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'location' => 'required|string|max:100',
            'units' => 'in:celsius,fahrenheit',
        ]);

        // バリデーションされた引数を使用して天気データを取得...
    }
}
```

バリデーションが失敗した場合、AIクライアントはあなたが提供するエラーメッセージに基づいて動作します。そのため、明確で実行可能なエラーメッセージを提供することが重要です。

```php
$validated = $request->validate([
    'location' => ['required','string','max:100'],
    'units' => 'in:celsius,fahrenheit',
],[
    'location.required' => 'You must specify a location to get the weather for. For example, "New York City" or "Tokyo".',
    'units.in' => 'You must specify either "celsius" or "fahrenheit" for the units.',
]);
```

<a name="tool-dependency-injection"></a>
#### ツールの依存注入

Laravelの[サービスコンテナ](/docs/{{version}}/container)は、すべてのツールを解決するために使用されます。その結果、コンストラクタでツールが必要とするあらゆる依存関係をタイプヒントで指定できます。宣言された依存関係は自動的に解決され、ツールインスタンスに注入されます。

```php
<?php

namespace App\Mcp\Tools;

use App\Repositories\WeatherRepository;
use Laravel\Mcp\Server\Tool;

class CurrentWeatherTool extends Tool
{
    /**
     * 新しいツールインスタンスの生成
     */
    public function __construct(
        protected WeatherRepository $weather,
    ) {}

    // ...
}
```

コンストラクタインジェクションに加えて、ツールの`handle()`メソッドで依存関係をタイプヒントで指定することもできます。メソッドが呼び出されると、サービスコンテナが自動的に依存関係を解決し、注入します。

```php
<?php

namespace App\Mcp\Tools;

use App\Repositories\WeatherRepository;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class CurrentWeatherTool extends Tool
{
    /**
     * ツールリクエストの処理
     */
    public function handle(Request $request, WeatherRepository $weather): Response
    {
        $location = $request->get('location');

        $forecast = $weather->getForecastFor($location);

        // ...
    }
}
```

<a name="tool-annotations"></a>
### ツールアノテーション

[アノテーション](https://modelcontextprotocol.io/specification/2025-06-18/schema#toolannotations)を使用してツールを拡張し、AIクライアントに追加のメタデータを提供できます。これらのアノテーションは、AIモデルがツールの動作と能力を理解するのに役立ちます。アノテーションはアトリビュートを介してツールに追加されます。

```php
<?php

namespace App\Mcp\Tools;

use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;
use Laravel\Mcp\Server\Tool;

#[IsIdempotent]
#[IsReadOnly]
class CurrentWeatherTool extends Tool
{
    //
}
```

利用可能なアノテーションは次のとおりです。

| アノテーション | タイプ | 説明 |
| ------------------ | ------- | ----------------------------------------------------------------------------------------------- |
| `#[IsReadOnly]` | boolean | ツールがその環境を変更しないことを示します。 |
| `#[IsDestructive]` | boolean | ツールが破壊的な更新を実行する可能性があることを示します（読み取り専用でない場合にのみ意味があります）。 |
| `#[IsIdempotent]` | boolean | 同じ引数で繰り返し呼び出しても追加の効果がないことを示します（読み取り専用でない場合）。 |
| `#[IsOpenWorld]` | boolean | ツールが外部エンティティと対話する可能性があることを示します。 |

アノテーション値は論理引数を使用して明示的に設定できます。

```php
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;
use Laravel\Mcp\Server\Tools\Annotations\IsDestructive;
use Laravel\Mcp\Server\Tools\Annotations\IsOpenWorld;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tool;

#[IsReadOnly(true)]
#[IsDestructive(false)]
#[IsOpenWorld(false)]
#[IsIdempotent(true)]
class CurrentWeatherTool extends Tool
{
    //
}
```

<a name="conditional-tool-registration"></a>
### 条件付きツール登録

ツールクラスに`shouldRegister`メソッドを実装することで、実行時にツールを条件付きで登録できます。このメソッドを使用すると、アプリケーションの状態、設定、またはリクエストパラメータに基づいてツールが利用可能であるべきかどうかを決定できます。

```php
<?php

namespace App\Mcp\Tools;

use Laravel\Mcp\Request;
use Laravel\Mcp\Server\Tool;

class CurrentWeatherTool extends Tool
{
    /**
     * ツールを登録すべきか判定
     */
    public function shouldRegister(Request $request): bool
    {
        return $request?->user()?->subscribed() ?? false;
    }
}
```

ツールの`shouldRegister`メソッドが`false`を返すと、そのツールは利用可能なツールの一覧に表示されず、AIクライアントから呼び出すことはできません。

<a name="tool-responses"></a>
### ツールのレスポンス

ツールは`Laravel\Mcp\Response`のインスタンスを返す必要があります。Responseクラスは、さまざまなタイプのレスポンスを作成するための便利なメソッドをいくつか提供しています。

単純なテキストレスポンスには、`text`メソッドを使用します。

```php
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;

/**
 * ツールリクエストの処理
 */
public function handle(Request $request): Response
{
    // ...

    return Response::text('Weather Summary: Sunny, 72°F');
}
```

ツールの実行中にエラーが発生したことを示すには、`error`メソッドを使用します。

```php
return Response::error('Unable to fetch weather data. Please try again.');
```

画像や音声のコンテンツを返すには、`image`および`audio`メソッドを使用してください。

```php
return Response::image(file_get_contents(storage_path('weather/radar.png')), 'image/png');

return Response::audio(file_get_contents(storage_path('weather/alert.mp3')), 'audio/mp3');
```

また、`fromStorage`メソッドを使用して、Laravelのファイルシステムディスクから画像や音声のコンテンツを直接読み込むこともできます。MIMEタイプはファイルから自動的に判別します。

```php
return Response::fromStorage('weather/radar.png');
```

必要であれば、特定のディスクを指定したり、MIMEタイプを上書きしたりできます。

```php
return Response::fromStorage('weather/radar.png', disk: 's3');

return Response::fromStorage('weather/radar.png', mimeType: 'image/webp');
```

<a name="multiple-content-responses"></a>
#### 複数コンテンツのレスポンス

ツールは`Response`インスタンスの配列を返すことで、複数のコンテンツを返すことができます。

```php
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;

/**
 * ツールリクエストの処理
 *
 * @return array<int, \Laravel\Mcp\Response>
 */
public function handle(Request $request): array
{
    // ...

    return [
        Response::text('Weather Summary: Sunny, 72°F'),
        Response::text("**Detailed Forecast**\n- Morning: 65°F\n- Afternoon: 78°F\n- Evening: 70°F")
    ];
}
```

<a name="structured-responses"></a>
#### 構造化レスポンス

ツールは`structured`メソッドを使用して、[構造化コンテンツ](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#structured-content)を返すことができます。これにより、AIクライアント向けの解析可能なデータを提供しつつ、JSONエンコードされたテキスト表現との下位互換性を維持します。

```php
return Response::structured([
    'temperature' => 22.5,
    'conditions' => 'Partly cloudy',
    'humidity' => 65,
]);
```

構造化コンテンツと共にカスタムテキストを提供する必要がある場合は、レスポンスファクトリの`withStructuredContent`メソッドを使用してください。

```php
return Response::make(
    Response::text('Weather is 22.5°C and sunny')
)->withStructuredContent([
    'temperature' => 22.5,
    'conditions' => 'Sunny',
]);
```

<a name="streaming-responses"></a>
#### ストリーミングレスポンス

長時間の操作やリアルタイムのデータストリーミングの場合、ツールは`handle`メソッドから[ジェネレータ](https://www.php.net/manual/en/language.generators.overview.php)を返すことができます。これにより、最終的なレスポンスの前に中間的な更新をクライアントに送信できます。

```php
<?php

namespace App\Mcp\Tools;

use Generator;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class CurrentWeatherTool extends Tool
{
    /**
     * ツールリクエストの処理
     *
     * @return \Generator<int, \Laravel\Mcp\Response>
     */
    public function handle(Request $request): Generator
    {
        $locations = $request->array('locations');

        foreach ($locations as $index => $location) {
            yield Response::notification('processing/progress', [
                'current' => $index + 1,
                'total' => count($locations),
                'location' => $location,
            ]);

            yield Response::text($this->forecastFor($location));
        }
    }
}
```

Webベースのサーバを使用する場合、ストリーミングレスポンスは自動的にSSE（Server-Sent Events）ストリームを開き、yieldされた各メッセージをイベントとしてクライアントに送信します。

<a name="prompts"></a>
## プロンプト

[プロンプト](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts)を使用すると、AIクライアントが言語モデルと対話するために使用できる、再利用可能なプロンプトテンプレートをサーバで共有できます。これらは、一般的なクエリやインタラクションを構造化するための標準化された方法を提供します。

<a name="creating-prompts"></a>
### プロンプトの作成

プロンプトを作成するには、`make:mcp-prompt` Artisanコマンドを実行します。

```shell
php artisan make:mcp-prompt DescribeWeatherPrompt
```

プロンプトを作成した後、サーバの`$prompts`プロパティに登録します。

```php
<?php

namespace App\Mcp\Servers;

use App\Mcp\Prompts\DescribeWeatherPrompt;
use Laravel\Mcp\Server;

class WeatherServer extends Server
{
    /**
     * このMCPサーバで登録するプロンプト
     *
     * @var array<int, class-string<\Laravel\Mcp\Server\Prompt>>
     */
    protected array $prompts = [
        DescribeWeatherPrompt::class,
    ];
}
```

<a name="prompt-name-title-and-description"></a>
#### プロンプトの名前、タイトル、説明

デフォルトで、プロンプトの名前とタイトルはクラス名から派生します。例えば、`DescribeWeatherPrompt`の名前は`describe-weather`になり、タイトルは`Describe Weather Prompt`になります。これらの値は、`Name`属性と`Title`属性を使用してカスタマイズできます。

```php
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;

#[Name('weather-assistant')]
#[Title('Weather Assistant Prompt')]
class DescribeWeatherPrompt extends Prompt
{
    // ...
}
```

プロンプトの説明は自動的に生成しません。`Description`属性を使用して、意味のある説明を常に提供してください。

```php
use Laravel\Mcp\Server\Attributes\Description;

#[Description('Generates a natural-language explanation of the weather for a given location.')]
class DescribeWeatherPrompt extends Prompt
{
    //
}
```

> [!NOTE]
> 説明はプロンプトのメタデータの重要な部分であり、AIモデルがプロンプトをいつ、どのように最大限に活用するかを理解するのに役立ちます。

<a name="prompt-arguments"></a>
### プロンプト引数

プロンプトは、AIクライアントがプロンプトテンプレートを特定の値でカスタマイズできるようにする引数を定義できます。プロンプトが受け入れる引数を定義するには、`arguments`メソッドを使用します。

```php
<?php

namespace App\Mcp\Prompts;

use Laravel\Mcp\Server\Prompt;
use Laravel\Mcp\Server\Prompts\Argument;

class DescribeWeatherPrompt extends Prompt
{
    /**
     * プロンプトの引数を取得します。
     *
     * @return array<int, \Laravel\Mcp\Server\Prompts\Argument>
     */
    public function arguments(): array
    {
        return [
            new Argument(
                name: 'tone',
                description: 'The tone to use in the weather description (e.g., formal, casual, humorous).',
                required: true,
            ),
        ];
    }
}
```

<a name="validating-prompt-arguments"></a>
### プロンプト引数のバリデーション

プロンプト引数は定義に基づいて自動的にバリデーションされますが、より複雑なバリデーションルールを適用したい場合もあるでしょう。

Laravel MCPは、Laravelの[バリデーション機能](/docs/{{version}}/validation)とシームレスに統合されています。プロンプトの`handle`メソッド内で、受信したプロンプト引数をバリデーションできます。

```php
<?php

namespace App\Mcp\Prompts;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Prompt;

class DescribeWeatherPrompt extends Prompt
{
    /**
     * プロンプトのリクエストを処理します。
     */
    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'tone' => 'required|string|max:50',
        ]);

        $tone = $validated['tone'];

        // 指定されたトーンを使用してプロンプトのレスポンスを生成...
    }
}
```

バリデーションが失敗した場合、AIクライアントはあなたが提供するエラーメッセージに基づいて動作します。そのため、明確で実行可能なエラーメッセージを提供することが重要です。

```php
$validated = $request->validate([
    'tone' => ['required','string','max:50'],
],[
    'tone.*' => 'You must specify a tone for the weather description. Examples include "formal", "casual", or "humorous".',
]);
```

<a name="prompt-dependency-injection"></a>
### プロンプトの依存注入

すべてのプロンプトを解決するために、Laravelの[サービスコンテナ](/docs/{{version}}/container)が使用されます。その結果、プロンプトが必要とする依存関係をコンストラクタでタイプヒントできます。宣言された依存関係は自動的に解決され、プロンプトインスタンスに注入されます。

```php
<?php

namespace App\Mcp\Prompts;

use App\Repositories\WeatherRepository;
use Laravel\Mcp\Server\Prompt;

class DescribeWeatherPrompt extends Prompt
{
    /**
     * 新しいプロンプトインスタンスを作成します。
     */
    public function __construct(
        protected WeatherRepository $weather,
    ) {}

    //
}
```

コンストラクタインジェクションに加えて、プロンプトの`handle`メソッドで依存関係をタイプヒントすることもできます。メソッドが呼び出されると、サービスコンテナは自動的に依存関係を解決して注入します。

```php
<?php

namespace App\Mcp\Prompts;

use App\Repositories\WeatherRepository;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Prompt;

class DescribeWeatherPrompt extends Prompt
{
    /**
     * プロンプトのリクエストを処理します。
     */
    public function handle(Request $request, WeatherRepository $weather): Response
    {
        $isAvailable = $weather->isServiceAvailable();

        // ...
    }
}
```

<a name="conditional-prompt-registration"></a>
### 条件付きプロンプト登録

プロンプトクラスに`shouldRegister`メソッドを実装することで、実行時にプロンプトを条件付きで登録できます。このメソッドを使用すると、アプリケーションの状態、設定、またはリクエストパラメータに基づいてプロンプトが利用可能であるべきかどうかを判断できます。

```php
<?php

namespace App\Mcp\Prompts;

use Laravel\Mcp\Request;
use Laravel\Mcp\Server\Prompt;

class CurrentWeatherPrompt extends Prompt
{
    /**
     * プロンプトを登録すべきか判断します。
     */
    public function shouldRegister(Request $request): bool
    {
        return $request?->user()?->subscribed() ?? false;
    }
}
```

プロンプトの`shouldRegister`メソッドが`false`を返すと、そのプロンプトは利用可能なプロンプトのリストに表示されず、AIクライアントから呼び出すことはできません。

<a name="prompt-responses"></a>
### プロンプトのレスポンス

プロンプトは、単一の`Laravel\Mcp\Response`インスタンス、または`Laravel\Mcp\Response`インスタンスのiterableを返すことができます。これらのレスポンスは、AIクライアントに送信されるコンテンツをカプセル化します。

```php
<?php

namespace App\Mcp\Prompts;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Prompt;

class DescribeWeatherPrompt extends Prompt
{
    /**
     * プロンプトのリクエストを処理します。
     *
     * @return array<int, \Laravel\Mcp\Response>
     */
    public function handle(Request $request): array
    {
        $tone = $request->string('tone');

        $systemMessage = "You are a helpful weather assistant. Please provide a weather description in a {$tone} tone.";

        $userMessage = "What is the current weather like in New York City?";

        return [
            Response::text($systemMessage)->asAssistant(),
            Response::text($userMessage),
        ];
    }
}
```

`asAssistant()`メソッドを使用すると、レスポンスメッセージがAIアシスタントからのものであることを示すことができます。一方、通常のメッセージはユーザー入力として扱われます。

<a name="resources"></a>
## リソース

[リソース](https://modelcontextprotocol.io/specification/2025-06-18/server/resources)を使用すると、AIクライアントが読み取り、言語モデルと対話する際のコンテキストとして使用できるデータやコンテンツをサーバが公開できます。リソースは、ドキュメント、設定、またはAIの応答を形成するのに役立つデータなどの静的または動的な情報を共有する方法を提供します。

<a name="creating-resources"></a>
## リソースの作成

リソースを作成するには、`make:mcp-resource` Artisanコマンドを実行します。

```shell
php artisan make:mcp-resource WeatherGuidelinesResource
```

リソースを作成した後、サーバの`$resources`プロパティに登録します。

```php
<?php

namespace App\Mcp\Servers;

use App\Mcp\Resources\WeatherGuidelinesResource;
use Laravel\Mcp\Server;

class WeatherServer extends Server
{
    /**
     * このMCPサーバで登録するリソース
     *
     * @var array<int, class-string<\Laravel\Mcp\Server\Resource>>
     */
    protected array $resources = [
        WeatherGuidelinesResource::class,
    ];
}
```

<a name="resource-name-title-and-description"></a>
#### リソース名、タイトル、説明

リソースの名前とタイトルはデフォルトで、クラス名から派生します。例えば、`WeatherGuidelinesResource`の名前は`weather-guidelines`になり、タイトルは`Weather Guidelines Resource`になります。これらの値は、`Name`属性と`Title`属性を使用してカスタマイズできます。

```php
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;

#[Name('weather-api-docs')]
#[Title('Weather API Documentation')]
class WeatherGuidelinesResource extends Resource
{
    // ...
}
```

リソースの説明は自動的に生成しません。`Description`属性を使用して、意味のある説明を常に提供してください。

```php
use Laravel\Mcp\Server\Attributes\Description;

#[Description('Comprehensive guidelines for using the Weather API.')]
class WeatherGuidelinesResource extends Resource
{
    //
}
```

> [!NOTE]
> 説明はリソースのメタデータの重要な部分であり、AIモデルがリソースをいつ、どのように効果的に使用するかを理解するのに役立ちます。

<a name="resource-templates"></a>
### リソーステンプレート

[リソーステンプレート](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#resource-templates)を使用すると、変数を含むURIパターンにマッチする動的なリソースをサーバで公開できます。各リソースに対して静的なURIを定義する代わりに、テンプレートパターンに基づいて複数のURIを処理する単一のリソースを作成できます。

<a name="creating-resource-templates"></a>
#### リソーステンプレートの作成

リソーステンプレートを作成するには、リソースクラスで`HasUriTemplate`インターフェイスを実装し、`UriTemplate`インスタンスを返す`uriTemplate`メソッドを定義します。

```php
<?php

namespace App\Mcp\Resources;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\MimeType;
use Laravel\Mcp\Server\Contracts\HasUriTemplate;
use Laravel\Mcp\Server\Resource;
use Laravel\Mcp\Support\UriTemplate;

#[Description('Access user files by ID')]
#[MimeType('text/plain')]
class UserFileResource extends Resource implements HasUriTemplate
{
    /**
     * このリソースのためにURIテンプレートを取得
     */
    public function uriTemplate(): UriTemplate
    {
        return new UriTemplate('file://users/{userId}/files/{fileId}');
    }

    /**
     * リソースリクエストの処理
     */
    public function handle(Request $request): Response
    {
        $userId = $request->get('userId');
        $fileId = $request->get('fileId');

        // ファイルコンテンツの取得とリターン

        return Response::text($content);
    }
}
```

リソースが`HasUriTemplate`インターフェイスを実装すると、静的リソースではなくリソーステンプレートとして登録します。これにより、AIクライアントはテンプレートパターンに一致するURIを使用してリソースをリクエストでき、URI内の変数を自動的に抽出し、リソースの`handle`メソッドで利用可能になります。

<a name="uri-template-syntax"></a>
#### URIテンプレート記法

URIテンプレートは、波括弧で囲んだプレースホルダを使用して、URI内の可変セグメントを定義します。

```php
new UriTemplate('file://users/{userId}');
new UriTemplate('file://users/{userId}/files/{fileId}');
new UriTemplate('https://api.example.com/{version}/{resource}/{id}');
```

<a name="accessing-template-variables"></a>
#### テンプレート変数へのアクセス

URIがリソーステンプレートに一致すると、抽出した変数が自動的にリクエストへマージされ、`get`メソッドを使用してアクセスできます。

```php
<?php

namespace App\Mcp\Resources;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Contracts\HasUriTemplate;
use Laravel\Mcp\Server\Resource;
use Laravel\Mcp\Support\UriTemplate;

class UserProfileResource extends Resource implements HasUriTemplate
{
    public function uriTemplate(): UriTemplate
    {
        return new UriTemplate('file://users/{userId}/profile');
    }

    public function handle(Request $request): Response
    {
        // 抽出済み変数へのアクセス
        $userId = $request->get('userId');

        // 必要であれば、完全なURIの取得
        $uri = $request->uri();

        // ユーザープロファイルの取得

        return Response::text("Profile for user {$userId}");
    }
}
```

`Request`オブジェクトは、抽出した変数とリクエストされた元のURIの両方を提供し、リソースリクエストを処理するための完全なコンテキストを提供します。

<a name="resource-uri-and-mime-type"></a>
### リソースURIとMIMEタイプ

各リソースは一意のURIで識別され、AIクライアントがリソースの形式を理解するのに役立つMIMEタイプが関連付けられています。

デフォルトでは、リソースのURIはリソース名に基づいて生成されるため、`WeatherGuidelinesResource`のURIは`weather://resources/weather-guidelines`になります。デフォルトのMIMEタイプは`text/plain`です。

これらの値は、`Uri`属性と`MimeType`属性を使用してカスタマイズできます。

```php
<?php

namespace App\Mcp\Resources;

use Laravel\Mcp\Server\Attributes\MimeType;
use Laravel\Mcp\Server\Attributes\Uri;
use Laravel\Mcp\Server\Resource;

#[Uri('weather://resources/guidelines')]
#[MimeType('application/pdf')]
class WeatherGuidelinesResource extends Resource
{
}
```

URIとMIMEタイプは、AIクライアントがリソースコンテンツを適切に処理・解釈する方法を決定するのに役立ちます。

<a name="resource-request"></a>
### リソースリクエスト

ツールやプロンプトとは異なり、リソースは入力スキーマや引数を定義できません。しかし、リソースの`handle`メソッド内でリクエストオブジェクトを操作することは可能です：

```php
<?php

namespace App\Mcp\Resources;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Resource;

class WeatherGuidelinesResource extends Resource
{
    /**
     * リソースリクエストの処理
     */
    public function handle(Request $request): Response
    {
        // ...
    }
}
```

<a name="resource-dependency-injection"></a>
### リソースの依存注入

Laravelの[サービスコンテナ](/docs/{{version}}/container)は、すべてのリソースを解決するために使用されます。その結果、リソースが必要とする依存関係をコンストラクタでタイプヒントできます。宣言された依存関係は、自動的に解決され、リソースインスタンスに注入されます：

```php
<?php

namespace App\Mcp\Resources;

use App\Repositories\WeatherRepository;
use Laravel\Mcp\Server\Resource;

class WeatherGuidelinesResource extends Resource
{
    /**
     * 新しいリソースインスタンスを作成
     */
    public function __construct(
        protected WeatherRepository $weather,
    ) {}

    // ...
}
```

コンストラクタインジェクションに加え、リソースの`handle`メソッドで依存関係をタイプヒントすることもできます。メソッドが呼び出されると、サービスコンテナが自動的に依存関係を解決し、注入します：

```php
<?php

namespace App\Mcp\Resources;

use App\Repositories\WeatherRepository;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Resource;

class WeatherGuidelinesResource extends Resource
{
    /**
     * リソースリクエストの処理
     */
    public function handle(WeatherRepository $weather): Response
    {
        $guidelines = $weather->guidelines();

        return Response::text($guidelines);
    }
}
```

<a name="resource-annotations"></a>
### リソースアノテーション

リソースに[アノテーション](https://modelcontextprotocol.io/specification/2025-06-18/schema#resourceannotations)を追加することで、AIクライアントに追加のメタデータを提供できます。アノテーションは属性を使用してリソースへ追加します。

```php
<?php

namespace App\Mcp\Resources;

use Laravel\Mcp\Enums\Role;
use Laravel\Mcp\Server\Annotations\Audience;
use Laravel\Mcp\Server\Annotations\LastModified;
use Laravel\Mcp\Server\Annotations\Priority;
use Laravel\Mcp\Server\Resource;

#[Audience(Role::User)]
#[LastModified('2025-01-12T15:00:58Z')]
#[Priority(0.9)]
class UserDashboardResource extends Resource
{
    //
}
```

利用可能なアノテーションは次のとおりです。

| アノテーション       | タイプ          | 説明                                                                                              |
| ---------------- | -------------- | ----------------------------------------------------------------------------------------------- |
| `#[Audience]`    | ロールか配列  | 対象となるオーディエンス（Role::User、Role::Assistant、またはその両方）を指定します。                    |
| `#[Priority]`    | float          | リソースの重要度を示す、0.0から1.0の範囲の数値。                          |
| `#[LastModified]`| 文字列          | リソースの最終更新日時を示すISO 8601タイムスタンプ。                               |

<a name="conditional-resource-registration"></a>
### 条件付きリソース登録

リソースクラスに`shouldRegister`メソッドを実装することで、実行時にリソースを条件付きで登録できます。このメソッドにより、アプリケーションの状態、設定、またはリクエストパラメータに基づいてリソースを利用可能にすべきかどうかを判断できます：

```php
<?php

namespace App\Mcp\Resources;

use Laravel\Mcp\Request;
use Laravel\Mcp\Server\Resource;

class WeatherGuidelinesResource extends Resource
{
    /**
     * リソースを登録すべきか判定
     */
    public function shouldRegister(Request $request): bool
    {
        return $request?->user()?->subscribed() ?? false;
    }
}
```

リソースの`shouldRegister`メソッドが`false`を返すと、そのリソースは利用可能なリソースのリストに表示されず、AIクライアントからアクセスできなくなります。

<a name="resource-responses"></a>
### リソースレスポンス

リソースは`Laravel\Mcp\Response`のインスタンスを返す必要があります。Responseクラスは、さまざまなタイプのレスポンスを作成するための便利なメソッドをいくつか提供しています：

単純なテキストコンテンツには、`text`メソッドを使用します：

```php
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;

/**
 * リソースリクエストを処理
 */
public function handle(Request $request): Response
{
    // ...

    return Response::text($weatherData);
}
```

<a name="resource-blob-responses"></a>
#### Blobレスポンス

blobコンテンツを返すには、blobコンテンツを指定して`blob`メソッドを使用します：

```php
return Response::blob(file_get_contents(storage_path('weather/radar.png')));
```

blobコンテンツを返す場合、MIMEタイプはリソースへ設定したMIMEタイプにより決定します。

```php
<?php

namespace App\Mcp\Resources;

use Laravel\Mcp\Server\Attributes\MimeType;
use Laravel\Mcp\Server\Resource;

#[MimeType('image/png')]
class WeatherGuidelinesResource extends Resource
{
    //
}
```

<a name="resource-error-responses"></a>
#### エラーレスポンス

リソースの取得中にエラーが発生したことを示すには、`error()`メソッドを使用します：

```php
return Response::error('Unable to fetch weather data for the specified location.');
```

<a name="metadata"></a>
## メタデータ

Laravel MCPは、特定のMCPクライアントや統合で必要となる[MCP仕様](https://modelcontextprotocol.io/specification/2025-06-18/basic#meta)で定義されている`_meta`フィールドもサポートしています。メタデータは、ツール、リソース、プロンプトといった全てのMCPプリミティブ、およびそれらのレスポンスに適用できます。

個々のレスポンスコンテンツにメタデータを添付するには、`withMeta`メソッドを使用します。

```php
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;

/**
 * ツールリクエストの処理
 */
public function handle(Request $request): Response
{
    return Response::text('The weather is sunny.')
        ->withMeta(['source' => 'weather-api', 'cached' => true]);
}
```

レスポンスエンベロープ全体に適用する結果レベルのメタデータは、レスポンスを`Response::make`でラップし、返ってきたレスポンスファクトリインスタンスで`withMeta`を呼び出します。

```php
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;

/**
 * ツールリクエストの処理
 */
public function handle(Request $request): ResponseFactory
{
    return Response::make(
        Response::text('The weather is sunny.')
    )->withMeta(['request_id' => '12345']);
}
```

ツール、リソース、またはプロンプト自体にメタデータを添付するには、クラスへ`$meta`プロパティを定義します。

```php
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description('Fetches the current weather forecast.')]
class CurrentWeatherTool extends Tool
{
    protected ?array $meta = [
        'version' => '2.0',
        'author' => 'Weather Team',
    ];

    // ...
}
```

<a name="authentication"></a>
## 認証

ルートと同様に、ミドルウェアを使用してWeb MCPサーバを認証できます。MCPサーバに認証を追加すると、ユーザーはサーバの機能を利用する前に認証を行う必要があります。

MCPサーバへのアクセス認証には２つの方法があります：[Laravel Sanctum](/docs/{{version}}/sanctum)によるシンプルなトークンベース認証、または`Authorization` HTTPヘッダ経由で渡す任意のトークンによる認証です。あるいは、[Laravel Passport](/docs/{{version}}/passport)を使用したOAuthによる認証も可能です。

<a name="oauth"></a>
### OAuth 2.1

WebベースのMCPサーバを保護する最も堅牢な方法は、[Laravel Passport](/docs/{{version}}/passport)を使用したOAuthです。

OAuth経由でMCPサーバを認証する場合、`routes/ai.php`ファイルで`Mcp::oauthRoutes`メソッドを呼び出し、必要なOAuth2ディスカバリおよびクライアント登録ルートを登録します。次に、`routes/ai.php`ファイル内の`Mcp::web`ルートにPassportの`auth:api`ミドルウェアを適用します。

```php
use App\Mcp\Servers\WeatherExample;
use Laravel\Mcp\Facades\Mcp;

Mcp::oauthRoutes();

Mcp::web('/mcp/weather', WeatherExample::class)
    ->middleware('auth:api');
```

#### 新規Passportインストール

アプリケーションでまだLaravel Passportを使用していない場合は、まずPassportの[インストールとデプロイガイド](/docs/{{version}}/passport#installation)に従ってPassportを追加してください。次に進む前に、`OAuthenticatable`モデル、新しい認証ガード、およびPassportキーを用意しておく必要があります。

次に、Laravel MCPが提供するPassport認可ビューを公開する必要があります：

```shell
php artisan vendor:publish --tag=mcp-views
```

次に、`Passport::authorizationView`メソッドを使用して、このビューを使用するようにPassportに指示します。通常、このメソッドはアプリケーションの`AppServiceProvider`の`boot`メソッドで呼び出す必要があります：

```php
use Laravel\Passport\Passport;

/**
 * アプリケーションサービスを初期起動
 */
public function boot(): void
{
    Passport::authorizationView(function ($parameters) {
        return view('mcp.authorize', $parameters);
    });
}
```

このビューは、AIエージェントの認証試行を拒否または承認するために、認証中にエンドユーザーに表示されます。

![Authorization screen example](data:image/png;base64,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)

> [!NOTE]
> このシナリオでは、OAuth を単純に基盤となる認証可能なモデルへの変換レイヤーとして使用しています。スコープなど、OAuth の多くの側面は無視しています。

#### 既存の Passport インストールの使用

アプリケーションがすでに Laravel Passport を使用している場合、Laravel MCP は既存の Passport インストール内でシームレスに動作するはずですが、OAuth は主に基盤となる認証可能なモデルへの変換レイヤーとして使用されるため、カスタムスコープは現在サポートされていません。

Laravel MCP は、上記で説明した `Mcp::oauthRoutes` メソッドを介して、単一の `mcp:use` スコープを追加、アドバタイズ、および使用します。

#### Passport vs. Sanctum

OAuth2.1 は Model Context Protocol 仕様で文書化された認証メカニズムであり、MCP クライアントの間で最も広くサポートされています。そのため、可能な場合は Passport の使用を推奨します。

アプリケーションがすでに [Sanctum](/docs/{{version}}/sanctum) を使用している場合、Passport を追加することは面倒かもしれません。この場合、OAuth のみをサポートする MCP クライアントを使用する明確で必要な要件が出るまで、Passport なしで Sanctum を使用することを推奨します。

<a name="sanctum"></a>
### Sanctum

[Sanctum](/docs/{{version}}/sanctum) を使用して MCP サーバを保護したい場合は、`routes/ai.php` ファイル内のサーバに Sanctum の認証ミドルウェアを追加するだけです。そして、MCP クライアントが認証を成功させるために `Authorization: Bearer <token>` ヘッダを提供することを確認してください：

```php
use App\Mcp\Servers\WeatherExample;
use Laravel\Mcp\Facades\Mcp;

Mcp::web('/mcp/demo', WeatherExample::class)
    ->middleware('auth:sanctum');
```

<a name="custom-mcp-authentication"></a>
#### カスタムMCP認証

アプリケーションが独自のカスタム API トークンを発行している場合、`Mcp::web`ルートに任意のミドルウェアを割り当てることで MCP サーバを認証できます。カスタムミドルウェアは、`Authorization`ヘッダを手作業で検査して、受信する MCP リクエストを認証できます。

<a name="authorization"></a>
## 認可

`$request->user()`メソッドを介して現在認証されているユーザーにアクセスでき、MCP ツールとリソース内で[認可チェック](/docs/{{version}}/authorization)を実行できます。

```php
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;

/**
 * ツールリクエストの処理
 */
public function handle(Request $request): Response
{
    if (! $request->user()->can('read-weather')) {
        return Response::error('Permission denied.');
    }

    // ...
}
```

<a name="testing-servers"></a>
## サーバのテスト

組み込みの MCPインスペクタ を使用するか、ユニットテストを書くことで MCP サーバをテストできます。

<a name="mcp-inspector"></a>
### MCPインスペクタ

[MCPインスペクタ](https://modelcontextprotocol.io/docs/tools/inspector) は、MCP サーバをテストおよびデバッグするためのインタラクティブなツールです。これを使用してサーバに接続し、認証を確認し、ツール、リソース、プロンプトを試すことができます。

登録されたサーバに対してインスペクターを実行できます。

```shell
# Web server...
php artisan mcp:inspector mcp/weather

# Local server named "weather"...
php artisan mcp:inspector weather
```

このコマンドは MCP Inspector を起動し、MCP クライアントにコピーして全てが正しく設定されていることを確認するために使用できるクライアント設定を提供します。Web サーバが認証ミドルウェアによって保護されている場合は、接続時に `Authorization`ベアラートークンなどの必要なヘッダを含めることを忘れないでください。

<a name="unit-tests"></a>
### Unit Tests

MCPサーバ、ツール、リソース、プロンプトのユニットテストを作成できます。

まず、新しいテストケースを作成し、それを登録しているサーバで目的のプリミティブを呼び出します。例えば、`WeatherServer`上のツールをテストするには、次のようにします：

```php tab=Pest
test('tool', function () {
    $response = WeatherServer::tool(CurrentWeatherTool::class, [
        'location' => 'New York City',
        'units' => 'fahrenheit',
    ]);

    $response
        ->assertOk()
        ->assertSee('The current weather in New York City is 72°F and sunny.');
});
```

```php tab=PHPUnit
/**
 * ツールをテストします。
 */
public function test_tool(): void
{
    $response = WeatherServer::tool(CurrentWeatherTool::class, [
        'location' => 'New York City',
        'units' => 'fahrenheit',
    ]);

    $response
        ->assertOk()
        ->assertSee('The current weather in New York City is 72°F and sunny.');
}
```

同様に、プロンプトやリソースもテストできます：

```php
$response = WeatherServer::prompt(...);
$response = WeatherServer::resource(...);
```

プリミティブを呼び出す前に`actingAs`メソッドをチェーンすることで、認証済みユーザーとして振る舞うことも可能です：

```php
$response = WeatherServer::actingAs($user)->tool(...);
```

レスポンスを受け取ったら、さまざまなアサーションメソッドを使用して、レスポンスの内容とステータスを検証できます。

`assertOk`メソッドを使用すると、レスポンスが成功したことをアサートできます。これはレスポンスにエラーがないことをチェックします：

```php
$response->assertOk();
```

`assertSee`メソッドを使用すると、レスポンスに特定のテキストが含まれていることをアサートできます：

```php
$response->assertSee('The current weather in New York City is 72°F and sunny.');
```

`assertHasErrors`メソッドを使用すると、レスポンスにエラーが含まれていることをアサートできます：

```php
$response->assertHasErrors();

$response->assertHasErrors([
    'Something went wrong.',
]);
```

`assertHasNoErrors`メソッドを使用すると、レスポンスにエラーが含まれていないことをアサートできます：

```php
$response->assertHasNoErrors();
```

`assertName()`、`assertTitle()`、`assertDescription()`メソッドを使用すると、レスポンスに特定のメタデータが含まれていることをアサートできます：

```php
$response->assertName('current-weather');
$response->assertTitle('Current Weather Tool');
$response->assertDescription('Fetches the current weather forecast for a specified location.');
```

`assertSentNotification`および`assertNotificationCount`メソッドを使用すると、通知が送信されたことをアサートできます：

```php
$response->assertSentNotification('processing/progress', [
    'step' => 1,
    'total' => 5,
]);

$response->assertSentNotification('processing/progress', [
    'step' => 2,
    'total' => 5,
]);

$response->assertNotificationCount(5);
```

最後に、生のレスポンス内容を調査したい場合は、`dd`または`dump`メソッドを使用して、デバッグ目的でレスポンスを出力できます：

```php
$response->dd();
$response->dump();
```
