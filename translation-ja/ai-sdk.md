# Laravel AI SDK

- [導入](#introduction)
- [インストール](#installation)
    - [設定](#configuration)
    - [カスタムベースURL](#custom-base-urls)
    - [OpenAI互換プロバイダ](#openai-compatible-providers)
    - [プロバイダのサポート](#provider-support)
- [エージェント](#agents)
    - [プロンプト](#prompting)
    - [会話コンテキスト](#conversation-context)
    - [構造化出力](#structured-output)
    - [添付ファイル](#attachments)
    - [ストリーミング](#streaming)
    - [ブロードキャスト](#broadcasting)
    - [キューイング](#queueing)
    - [ツール](#tools)
    - [ファイル保存域ツール](#file-storage-tools)
    - [MCPツール](#mcp-tools)
    - [プロバイダツール](#provider-tools)
    - [サブエージェント](#sub-agents)
    - [ミドルウェア](#middleware)
    - [匿名エージェント](#anonymous-agents)
    - [エージェント設定](#agent-configuration)
    - [プロバイダオプション](#provider-options)
- [人間によるツールの承認](#human-tool-approval)
    - [完全な承認フロー](#complete-approval-flow)
- [画像](#images)
- [音声 (TTS)](#audio)
- [文字起こし (STT)](#transcription)
- [テキスト要約](#text-summarization)
- [埋め込み](#embeddings)
    - [マルチモーダルの埋め込み](#multimodal-embeddings)
    - [埋め込みのクエリ](#querying-embeddings)
    - [埋め込みのキャッシュ](#caching-embeddings)
- [リランク](#reranking)
- [ファイル](#files)
- [ベクトルストア](#vector-stores)
    - [ストアへのファイル追加](#adding-files-to-stores)
- [フェイルオーバ](#failover)
- [テスト](#testing)
    - [エージェント](#testing-agents)
    - [画像](#testing-images)
    - [音声](#testing-audio)
    - [文字起こし](#testing-transcriptions)
    - [埋め込み](#testing-embeddings)
    - [リランク](#testing-reranking)
    - [ファイル](#testing-files)
    - [ベクトルストア](#testing-vector-stores)
- [イベント](#events)

<a name="introduction"></a>
## 導入

[Laravel AI SDK](https://github.com/laravel/ai)は、OpenAI、Anthropic、GeminiなどのAIプロバイダとやり取りするための、統一された表現力豊かなAPIを提供します。AI SDKを使用すると、ツールや構造化出力を備えたインテリジェントなエージェントの構築、画像の生成、音声の合成と文字起こし、ベクトル埋め込みの作成などを、すべてLaravelフレンドリーな一貫したインターフェイスで行えます。

<a name="installation"></a>
## インストール

Composerを使い、Laravel AI SDKをインストールできます。

```shell
composer require laravel/ai
```

次に、`vendor:publish` Artisanコマンドを使用して、AI SDKの設定ファイルとマイグレーションファイルをリソース公開してください。

```shell
php artisan vendor:publish --provider="Laravel\Ai\AiServiceProvider"
```

最後に、アプリケーションのデータベースマイグレーションを実行してください。これにより、AI SDKが会話の保存に使用する`agent_conversations`テーブルと`agent_conversation_messages`テーブルが作成されます。

```shell
php artisan migrate
```

<a name="configuration"></a>
### 設定

AIプロバイダの認証情報は、アプリケーションの`config/ai.php`設定ファイル、またはアプリケーションの`.env`ファイル内の環境変数として定義できます。

```ini
ANTHROPIC_API_KEY=
AZURE_OPENAI_API_KEY=
COHERE_API_KEY=
DEEPSEEK_API_KEY=
ELEVENLABS_API_KEY=
GEMINI_API_KEY=
GROQ_API_KEY=
MISTRAL_API_KEY=
OLLAMA_API_KEY=
OPENAI_API_KEY=
OPENAI_COMPATIBLE_API_KEY=
OPENAI_COMPATIBLE_URL=
OPENROUTER_API_KEY=
JINA_API_KEY=
VOYAGEAI_API_KEY=
XAI_API_KEY=
```

テキスト、画像、音声、文字起こし、埋め込みに使用されるデフォルトのモデルも、アプリケーションの`config/ai.php`設定ファイルで設定できます。

<a name="custom-base-urls"></a>
### カスタムベースURL

デフォルトでは、Laravel AI SDKは各プロバイダの公開APIエンドポイントへ直接接続します。しかし、APIキー管理の集約、レート制限の実装、または企業ゲートウェイを介したトラフィックのルーティングのためにプロキシサービスを使用する場合など、別のエンドポイントを介してリクエストをルーティングする必要があるかもしれません。

プロバイダ設定に`url`パラメータを追加すると、カスタムベースURLを設定できます。

```php
'providers' => [
    'openai' => [
        'driver' => 'openai',
        'key' => env('OPENAI_API_KEY'),
        'url' => env('OPENAI_URL'),
    ],

    'anthropic' => [
        'driver' => 'anthropic',
        'key' => env('ANTHROPIC_API_KEY'),
        'url' => env('ANTHROPIC_BASE_URL'),
    ],
],
```

これは、プロキシサービス（LiteLLMやAzure OpenAI Gatewayなど）を介してリクエストをルーティングする場合や、代替エンドポイントを使用する場合に便利です。

カスタムベースURLは、OpenAI、Anthropic、Gemini、Groq、Cohere、DeepSeek、xAI、OpenRouterのプロバイダでサポートしています。

<a name="openai-compatible-providers"></a>
### OpenAI互換プロバイダ

LM Studio、vLLM、Together、Fireworks、ローカルゲートウェイなど、OpenAI互換APIを使用している場合は、`openai-compatible`ドライバを設定してください。`url`オプションは必須ですが、`key`オプションは任意であり、存在する場合はベアラートークンとして送信します。

```php
'providers' => [
    'local' => [
        'driver' => 'openai-compatible',
        'url' => env('LOCAL_AI_URL'),
        'key' => env('LOCAL_AI_API_KEY'),
    ],
],
```

設定を完了すれば、他のプロバイダと同様に名前付きプロバイダを使用できます。

```php
agent()->prompt('What is Laravel?', provider: 'local', model: 'local-model');
```

明示的にモデルを渡す必要がないように、プロバイダのデフォルトテキストモデルを設定することもできます。

```php
'local' => [
    'driver' => 'openai-compatible',
    'url' => env('LOCAL_AI_URL'),
    'key' => env('LOCAL_AI_API_KEY'),
    'models' => [
        'text' => [
            'default' => env('LOCAL_AI_MODEL'),
        ],
    ],
],
```

OpenAI互換プロバイダは、テキスト生成、ストリーミング、ツール、構造化出力、および画像添付をサポートしています。エンドポイントが追加のリクエストボディフィールドを必要とする場合は、[プロバイダオプション](#provider-options)を使用して指定してください。

<a name="provider-support"></a>
### プロバイダのサポート

AI SDKは、その機能全体でさまざまなプロバイダをサポートしています。以下の表は、各機能で利用可能なプロバイダをまとめたものです。

<div class="overflow-auto">

| 機能 | プロバイダ |
|---|---|
| Text | OpenAI, OpenAI Compatible, Anthropic, Gemini, Azure, Bedrock, Groq, xAI, DeepSeek, Mistral, Ollama, OpenRouter |
| 画像 | OpenAI, Gemini, xAI, Azure, Bedrock, OpenRouter |
| TTS | OpenAI, ElevenLabs, Gemini |
| STT | OpenAI, ElevenLabs, Mistral, Gemini |
| 埋め込み | OpenAI, Gemini, Azure, Bedrock, Cohere, Mistral, Jina, VoyageAI, Ollama, OpenRouter |
| リランク | Cohere, Jina, VoyageAI |
| Files | OpenAI, Anthropic, Gemini, Azure |

</div>

`Laravel\Ai\Enums\Lab`列挙型（enum）は、プレーンな文字列を使用する代わりに、コード全体でプロバイダを参照するために使用できます。

```php
use Laravel\Ai\Enums\Lab;

Lab::Anthropic;
Lab::OpenAI;
Lab::OpenAiCompatible;
Lab::Gemini;
// ...
```

<a name="agents"></a>
## エージェント

エージェントは、Laravel AI SDKでAIプロバイダとやり取りするための基本的な構成要素です。各エージェントは、大規模言語モデルとやり取りするために必要な指示、会話コンテキスト、ツール、および出力スキーマをカプセル化した専用のPHPクラスです。エージェントを、セールスコーチ、ドキュメントアナライザー、サポートボットなどの特殊なアシスタントとして考えてください。一度設定すれば、アプリケーション全体で必要に応じてプロンプトを送れます。

`make:agent` Artisanコマンドを使用して、エージェントを作成できます。

```shell
php artisan make:agent SalesCoach

php artisan make:agent SalesCoach --structured
```

生成されたエージェントクラス内で、システムプロンプト／指示、メッセージコンテキスト、利用可能なツール、および出力スキーマ（該当する場合）を定義できます。

```php
<?php

namespace App\Ai\Agents;

use App\Ai\Tools\RetrievePreviousTranscripts;
use App\Models\History;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use Stringable;

class SalesCoach implements Agent, Conversational, HasTools, HasStructuredOutput
{
    use Promptable;

    public function __construct(public User $user) {}

    /**
     * エージェントが従うべき指示を取得
     */
    public function instructions(): Stringable|string
    {
        return 'あなたはセールスコーチです。文字起こしを分析し、フィードバックと総合的なセールス強度スコアを提供してください。';
    }

    /**
     * これまでの会話を構成するメッセージリストを取得
     */
    public function messages(): iterable
    {
        return History::where('user_id', $this->user->id)
            ->latest()
            ->limit(50)
            ->get()
            ->reverse()
            ->map(function ($message) {
                return new Message($message->role, $message->content);
            })->all();
    }

    /**
     * エージェントが利用可能なツールを取得
     *
     * @return Tool[]
     */
    public function tools(): iterable
    {
        return [
            new RetrievePreviousTranscripts,
        ];
    }

    /**
     * エージェントの構造化出力スキーマ定義を取得
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'feedback' => $schema->string()->required(),
            'score' => $schema->integer()->min(1)->max(10)->required(),
        ];
    }
}
```

<a name="prompting"></a>
### プロンプト

エージェントにプロンプトを送るには、まず`make`メソッドまたは標準的なインスタンス化を使用してインスタンスを作成し、次に`prompt`を呼び出します。

```php
$response = (new SalesCoach)
    ->prompt('このセールスの文字起こしを分析して...');

return (string) $response;
```

`make`メソッドはサービスコンテナからエージェントを解決するため、自動的な依存注入が可能です。エージェントのコンストラクタに引数を渡すこともできます。

```php
$agent = SalesCoach::make(user: $user);
```

`prompt`メソッドに追加の引数を渡すことで、プロンプト送信時にデフォルトのプロバイダ、モデル、またはHTTPタイムアウトをオーバーライドできます。

```php
$response = (new SalesCoach)->prompt(
    'このセールスの文字起こしを分析して...',
    provider: Lab::Anthropic,
    model: 'claude-sonnet-5',
    timeout: 120,
);
```

<a name="conversation-context"></a>
### 会話コンテキスト

エージェントが`Conversational`インターフェイスを実装している場合、`messages`メソッドを使用して、該当する以前の会話コンテキストを返せます。

```php
use App\Models\History;
use Laravel\Ai\Messages\Message;

/**
 * これまでの会話を構成するメッセージリストを取得
 */
public function messages(): iterable
{
    return History::where('user_id', $this->user->id)
        ->latest()
        ->limit(50)
        ->get()
        ->reverse()
        ->map(function ($message) {
            return new Message($message->role, $message->content);
        })->all();
}
```

<a name="remembering-conversations"></a>
#### 会話の記憶

> **注意：** `RemembersConversations`トレイトを使用する前に、`vendor:publish` Artisanコマンドを使用してAI SDKのマイグレーションを公開し、実行する必要があります。これらのマイグレーションにより、会話を保存するために必要なデータベーステーブルが作成されます。

Laravelでエージェントの会話履歴を自動的に保存および取得したい場合は、`RemembersConversations`トレイトを使用します。このトレイトは、`Conversational`インターフェイスを手作業で実装しなくても、会話メッセージをデータベースへ永続化する簡単な方法を提供しています。

```php
<?php

namespace App\Ai\Agents;

use Laravel\Ai\Concerns\RemembersConversations;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Promptable;

class SalesCoach implements Agent, Conversational
{
    use Promptable, RemembersConversations;

    /**
     * エージェントが従うべき指示を取得
     */
    public function instructions(): string
    {
        return 'あなたはセールスコーチです...';
    }
}
```

`RemembersConversations`トレイトを使用する場合、エージェントクラス内で`messages`メソッドを自分で定義しないでください。`messages`メソッドが存在すると、トレイトの実装よりも優先され、データベースから会話履歴が読み込まれなくなります。

あるユーザーで新しい会話を開始するには、プロンプトを送る前に`forUser`メソッドを呼び出してください。

```php
$response = (new SalesCoach)->forUser($user)->prompt('こんにちは！');

$conversationId = $response->conversationId;
```

レスポンスは会話IDを返すため、今後の参照のため保存できます。Eloquentを使用してユーザーのすべての会話を取得したい場合は、ユーザーモデルに`HasConversations`トレイトを追加してください。

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Ai\Concerns\HasConversations;

class User extends Authenticatable
{
    use HasConversations;
}
```

モデルにトレイトを追加すれば、`conversations`リレーションを介してユーザーの会話を取得し、クエリを実行できます。

```php
$conversations = $user->conversations()
    ->latest('updated_at')
    ->paginate(20);
```

既存の会話を継続するには、`continue`メソッドを使用してください。

```php
$response = (new SalesCoach)
    ->continue($conversationId, as: $user)
    ->prompt('それについて詳しく教えてください。');
```

`RemembersConversations`トレイトを使用すると、プロンプト送信時に以前のメッセージを自動的にロードし、会話コンテキストに含めます。新しいメッセージ（ユーザーとアシスタントの両方）は、各やり取りの後に自動的に保存します。

<a name="conversation-participants"></a>
#### 会話の参加者

通常、ユーザーが最も一般的な会話の参加者ですが、会話は任意のEloquentモデルに属することができます。別のタイプのモデルの会話を開始するには、`forParticipant`メソッドを使用します。

```php
$response = (new SalesCoach)
    ->forParticipant($team)
    ->prompt('Review our latest sales results.');
```

参加者のモーフクラスと主キーは会話と一緒に保存します。そのため、`User` ID `1` と `Team` ID `1` のように同じ主キーを持つ異なるタイプのモデルであっても、別々の会話履歴を保持します。`forUser`メソッドは `forParticipant` のエイリアスです。

`continueLastConversation`メソッドを使用すると、参加者の直近の会話を継続できます。

```php
$response = (new SalesCoach)
    ->continueLastConversation($team)
    ->prompt('Tell me more about that.');
```

特定の会話を継続する場合は、`continue`メソッドに参加者を渡します。

```php
$response = (new SalesCoach)
    ->continue($conversationId, as: $team)
    ->prompt('Tell me more about that.');
```

`HasConversations`トレイトは、会話に参加する任意のEloquentモデルへ追加できます。結果として得られる`conversations`リレーションは、そのモデルのタイプと主キーでスコープしたポリモーフィックリレーションです。また、その逆のリレーションを通じて、会話を所有する参加者にアクセスすることもできます。

```php
$conversations = $team->conversations;

$participant = $conversation->participant;
```

アプリケーションで複数の参加者モデルタイプを使用する場合は、保存する参加者タイプがモデルのクラス名と結合しないよう、[Eloquentモーフマップ](/docs/{{version}}/eloquent-relationships#custom-polymorphic-types)を定義することを検討すべきです。

> [!WARNING]
> `continue`メソッドは、指定した参加者が会話を所有しているかどうかを検証しません。アプリケーションは会話を継続する前に、会話へのアクセスを認可する必要があります。

<a name="structured-output"></a>
### 構造化出力

エージェントから造化出力を返す場合は、`HasStructuredOutput`インターフェイスを実装してください。それには、エージェントで`schema`メソッドを定義する必要があります。

```php
<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;

class SalesCoach implements Agent, HasStructuredOutput
{
    use Promptable;

    // ...

    /**
     * エージェントの構造化出力スキーマ定義を取得
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'score' => $schema->integer()->required(),
        ];
    }
}
```

構造化出力を返すエージェントにプロンプトを送る場合、返ってきた`StructuredAgentResponse`へ配列のようにアクセスできます。

```php
$response = (new SalesCoach)->prompt('このセールスの文字起こしを分析して...');

return $response['score'];
```

<a name="structured-output-nested-objects"></a>
#### ネストしたオブジェクト

ネストした構造化出力を定義するには、クロージャと一緒に`object`メソッドを使用します。

```php
<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;

class SalesCoach implements Agent, HasStructuredOutput
{
    use Promptable;

    // ...

    /**
     * エージェントの構造化出力スキーマ定義を取得
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'score' => $schema->integer()->required(),
            'metadata' => $schema->object(fn ($schema) => [
                'confidence' => $schema->string()->enum(['low', 'medium', 'high'])->required(),
                'language' => $schema->string()->required(),
            ])->required(),
        ];
    }
}
```

<a name="structured-output-arrays-of-objects"></a>
#### オブジェクトの配列

エージェントが構造化したアイテムのリストを返す必要がある場合は、`array`メソッドと`object`メソッドを組み合わせます。

```php
public function schema(JsonSchema $schema): array
{
    return [
        'feedback' => $schema->array()
            ->items(
                $schema->object(fn ($schema) => [
                    'comment' => $schema->string()->required(),
                    'score' => $schema->integer()->required(),
                ])
            )
            ->required(),
    ];
}
```

値が複数のスキーマのいずれかに一致する可能性がある場合は、`anyOf`メソッドを使用します。

```php
public function schema(JsonSchema $schema): array
{
    return [
        'content' => $schema->anyOf([
            $schema->object(fn ($schema) => [
                'type' => $schema->string()->enum(['article'])->required(),
                'title' => $schema->string()->required(),
            ]),
            $schema->object(fn ($schema) => [
                'type' => $schema->string()->enum(['image'])->required(),
                'url' => $schema->string()->required(),
            ]),
        ])->required(),
    ];
}
```

<a name="attachments"></a>
### 添付ファイル

プロンプトを送信する際、モデルが画像やドキュメントを検査できるように添付ファイルを渡すこともできます。

```php
use App\Ai\Agents\SalesCoach;
use Laravel\Ai\Files;

$response = (new SalesCoach)->prompt(
    '添付されたセールスの文字起こしを分析して...',
    attachments: [
        Files\Document::fromStorage('transcript.pdf') // ファイルシステムディスクからドキュメントを添付
        Files\Document::fromPath('/home/laravel/transcript.md') // ローカルパスからドキュメントを添付
        $request->file('transcript'), // アップロードされたファイルを添付
    ]
);
```

同様に、`Laravel\Ai\Files\Image`クラスを使用してプロンプトに画像を添付できます。

```php
use App\Ai\Agents\ImageAnalyzer;
use Laravel\Ai\Files;

$response = (new ImageAnalyzer)->prompt(
    'この画像には何が写っていますか？',
    attachments: [
        Files\Image::fromStorage('photo.jpg') // ファイルシステムディスクから画像を添付
        Files\Image::fromPath('/home/laravel/photo.jpg') // ローカルパスから画像を添付
        $request->file('photo'), // アップロードされたファイルを添付
    ]
);
```

<a name="streaming"></a>
### ストリーミング

`stream`メソッドを呼び出すことで、エージェントのレスポンスをストリーミングできます。返ってきた`StreamableAgentResponse`をルートから返すと、ストリーミングレスポンス（SSE）をクライアントへ自動的に送信します。

```php
use App\Ai\Agents\SalesCoach;

Route::get('/coach', function () {
    return (new SalesCoach)->stream('このセールスの文字起こしを分析して...');
});
```

レスポンス全体がクライアントへストリーミングされたときに呼び出されるクロージャを指定するには、`then`メソッドを使用します。

```php
use App\Ai\Agents\SalesCoach;
use Laravel\Ai\Responses\StreamedAgentResponse;

Route::get('/coach', function () {
    return (new SalesCoach)
        ->stream('このセールスの文字起こしを分析して...')
        ->then(function (StreamedAgentResponse $response) {
            // $response->text, $response->events, $response->usage…
        });
});
```

あるいは、ストリーミングされたイベントを手作業で反復処理することもできます。

```php
$stream = (new SalesCoach)->stream('このセールスの文字起こしを分析して...');

foreach ($stream as $event) {
    // ...
}
```

<a name="streaming-using-the-vercel-ai-sdk-protocol"></a>
#### Vercel AI SDKプロトコルを使用したストリーミング

ストリーミング可能なレスポンスで`usingVercelDataProtocol`メソッドを呼び出すことで、[Vercel AI SDKストリームプロトコル](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol)を使用してイベントをストリーミングできます。

```php
use App\Ai\Agents\SalesCoach;

Route::get('/coach', function () {
    return (new SalesCoach)
        ->stream('このセールスの文字起こしを分析して...')
        ->usingVercelDataProtocol();
});
```

<a name="broadcasting"></a>
### ブロードキャスト

ストリーミングされたイベントをいくつかの方法でブロードキャストできます。まず、ストリーミングされたイベントで`broadcast`または`broadcastNow`メソッドを呼び出すだけです。

```php
use App\Ai\Agents\SalesCoach;
use Illuminate\Broadcasting\Channel;

$stream = (new SalesCoach)->stream('このセールスの文字起こしを分析して...');

foreach ($stream as $event) {
    $event->broadcast(new Channel('channel-name'));
}
```

または、エージェントの`broadcastOnQueue`メソッドを呼び出してエージェントの操作をキューに入れ、ストリーミングされたイベントが利用可能になり次第ブロードキャストできます。

```php
(new SalesCoach)->broadcastOnQueue(
    'このセールスの文字起こしを分析して...'
    new Channel('channel-name'),
);
```

<a name="skipping-oversized-events"></a>
#### 過大イベントのスキップ

ブロードキャストプラットフォームによっては、WebSocketメッセージを１０ＫＢ前後に制限している場合があります。大きなツールの結果など、データ量の多いストリームイベントは、この制限を超えてブロードキャストに失敗することがあります。`WithoutBroadcasting`属性を使用すれば、特定のイベントタイプをブロードキャストから除外できます。

```php
<?php

namespace App\Ai\Agents;

use Laravel\Ai\Attributes\WithoutBroadcasting;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Promptable;
use Laravel\Ai\Streaming\Events\ToolCall;
use Laravel\Ai\Streaming\Events\ToolResult;

#[WithoutBroadcasting(ToolCall::class, ToolResult::class)]
class SearchAgent implements Agent, HasTools
{
    use Promptable;

    // ...
}
```

除外したイベントはブロードキャストしませんが、`agent_conversation_messages`テーブルには保存するため、ストリームの完了後にフロントエンドで完全なツールデータをロードできます。これは、キュー投入するブロードキャスト（`broadcastOnQueue`）と、同期ブロードキャスト（`broadcast`／`broadcastNow`）のどちらでも機能します。

<a name="queueing"></a>
### キューイング

エージェントの`queue`メソッドを使用すると、エージェントにプロンプトを送りますが、レスポンスの処理をバックグラウンドで行わせることができ、アプリケーションの高速でレスポンシブな操作感を維持できます。`then`および`catch`メソッドを使用して、レスポンスが利用可能になったとき、または例外が発生したときに呼び出されるクロージャを登録できます。

```php
use Illuminate\Http\Request;
use Laravel\Ai\Responses\AgentResponse;
use Throwable;

Route::post('/coach', function (Request $request) {
    (new SalesCoach)
        ->queue($request->input('transcript'))
        ->then(function (AgentResponse $response) {
            // ...
        })
        ->catch(function (Throwable $e) {
            // ...
        });

    return back();
});
```

<a name="tools"></a>
### ツール

ツールを使用すると、プロンプトへの応答中にエージェントが利用できる追加機能をエージェントに与えることができます。ツールは、`make:tool` Artisanコマンドを使用して作成できます。

```shell
php artisan make:tool RandomNumberGenerator
```

生成したツールは、アプリケーションの`app/Ai/Tools`ディレクトリへ配置します。各ツールには、エージェントがツールを利用する必要があるときに呼び出す`handle`メソッドを含みます。

```php
<?php

namespace App\Ai\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class RandomNumberGenerator implements Tool
{
    /**
     * ツールの目的の説明を取得
     */
    public function description(): Stringable|string
    {
        return 'このツールは、暗号学的に安全な乱数を生成するために使用できます。';
    }

    /**
     * ツールを実行
     */
    public function handle(Request $request): Stringable|string
    {
        return (string) random_int($request['min'], $request['max']);
    }

    /**
     * ツールのスキーマ定義を取得
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'min' => $schema->integer()->min(0)->required(),
            'max' => $schema->integer()->required(),
        ];
    }
}
```

ツールを定義したら、エージェントの`tools`メソッドからそれを返します。

```php
use App\Ai\Tools\RandomNumberGenerator;

/**
 * エージェントが利用可能なツールを取得
 *
 * @return Tool[]
 */
public function tools(): iterable
{
    return [
        new RandomNumberGenerator,
    ];
}
```

<a name="similarity-search"></a>
#### 類似性検索

`SimilaritySearch`ツールを使用すると、エージェントはデータベースに保存されているベクトル埋め込みを使用して、特定のクエリに類似したドキュメントを検索できます。これは、エージェントにアプリケーションのデータを検索するアクセス権を与えたい場合の検索拡張生成（RAG）に役立ちます。

類似性検索ツールを作成する最も簡単な方法は、ベクトル埋め込みを持つEloquentモデルで`usingModel`メソッドを使用することです。

```php
use App\Models\Document;
use Laravel\Ai\Tools\SimilaritySearch;

public function tools(): iterable
{
    return [
        SimilaritySearch::usingModel(Document::class, 'embedding'),
    ];
}
```

最初の引数はEloquentモデルクラス、２番目の引数はベクトル埋め込みを含むカラムです。

`0.0`から`1.0`の間の最小類似度しきい値や、クエリをカスタマイズするためのクロージャを指定することもできます。

```php
SimilaritySearch::usingModel(
    model: Document::class,
    column: 'embedding',
    minSimilarity: 0.7,
    limit: 10,
    query: fn ($query) => $query->where('published', true),
),
```

より詳細に制御するには、検索結果を返すカスタムクロージャを使用して類似性検索ツールを作成します。

```php
use App\Models\Document;
use Laravel\Ai\Tools\SimilaritySearch;

public function tools(): iterable
{
    return [
        new SimilaritySearch(using: function (string $query) {
            return Document::query()
                ->where('user_id', $this->user->id)
                ->whereVectorSimilarTo('embedding', $query)
                ->limit(10)
                ->get();
        }),
    ];
}
```

`withDescription`メソッドを使用して、ツールの説明をカスタマイズできます。

```php
SimilaritySearch::usingModel(Document::class, 'embedding')
    ->withDescription('関連する記事をナレッジベースで検索します。'),
```

<a name="file-storage-tools"></a>
### ファイル保存域ツール

`FileStorage`ツールファクトリを使用すると、エージェントにLaravelの[ファイルシステムディスク](/docs/{{version}}/filesystem)へのアクセス権を与えられます。`all`メソッドは、エージェントが指定のディスク上のファイルを一覧表示、読み取り、検査、URL生成、書き込み、削除、コピーできるようにするツールを返します。

```php
use Laravel\Ai\Tools\FileStorage;

public function tools(): iterable
{
    return FileStorage::all('local');
}
```

エージェントにファイルの検査のみを許可する場合は、`readOnly`メソッドを使用します。

```php
return FileStorage::readOnly('local');
```

これらのメソッドは`Illuminate\Support\Collection`を返すため、エージェントに提供するツールをさらにフィルタリングできます。

```php
use Laravel\Ai\Tools\Filesystem\DeleteFile;

return FileStorage::all('s3')
    ->reject(fn ($tool) => $tool instanceof DeleteFile);
```

<a name="mcp-tools"></a>
### MCPツール

アプリケーションで [Laravel MCP](/docs/{{version}}/mcp)を使用している場合、[Model Context Protocol](https://modelcontextprotocol.io)サーバが公開しているツールをエージェントへ与えることができます。[Laravel MCPクライアント](/docs/{{version}}/mcp#client)を使用して、リモートまたはローカルのMCPサーバに接続し、そのツールをエージェントへ直接渡すことができます。

> [!NOTE]
> MCPツールを使用するには、アプリケーションに[Laravel MCP](/docs/{{version}}/mcp)パッケージをインストールしている必要があります。

MCPクライアントの `tools` メソッドはコレクションを返すため、`...` オペレータを使用してエージェントの `tools` 配列に展開してください。

```php
use App\Ai\Tools\RandomNumberGenerator;
use Laravel\Mcp\Client;

/**
 * エージェントが利用可能なツールを取得
 *
 * @return Tool[]
 */
public function tools(): iterable
{
    return [
        ...Client::web('https://mcp.example.com')
            ->withToken($token)
            ->tools(),

        new RandomNumberGenerator,
    ];
}
```

AI SDKは各MCPツールを自動的にラップするため、エージェントは他のツールと同様にそれらを呼び出せます。[名前付きMCPクライアント](/docs/{{version}}/mcp#named-clients)を使用することも可能です。

```php
use Laravel\Mcp\Facades\Mcp;

public function tools(): iterable
{
    return [
        ...Mcp::client('github')->tools(),
    ];
}
```

または、[ローカルMCPサーバ](/docs/{{version}}/mcp#client-connecting)へ接続します。

```php
use Laravel\Mcp\Client;

public function tools(): iterable
{
    return [
        ...Client::local('php', ['artisan', 'mcp:start'])->tools(),
    ];
}
```

ベアラートークンやOAuthを含む、MCPクライアントの作成と認証に関する詳細については、[MCPクライアントのドキュメント](/docs/{{version}}/mcp#client)を参照してください。

<a name="provider-tools"></a>
### プロバイダツール

プロバイダツールは、各AIプロバイダがネイティブに実装している特別なツールで、Web検索、URLフェッチ、ファイル検索などの機能を提供します。通常のツールとは異なり、プロバイダツールはアプリケーションではなくプロバイダ自身にが実行します。

プロバイダツールは、エージェントの`tools`メソッドから返します。

<a name="web-search"></a>
#### Web検索

`WebSearch`プロバイダツールを使用すると、エージェントはWebを検索してリアルタイムの情報を取得できます。これは、時事問題、最近のデータ、またはモデルのトレーニングカットオフ以降に変更された可能性のあるトピックに関する質問に答えるのに役立ちます。

**サポートしているプロバイダ：** Anthropic, OpenAI, Gemini

```php
use Laravel\Ai\Providers\Tools\WebSearch;

public function tools(): iterable
{
    return [
        new WebSearch,
    ];
}
```

Web検索ツールを設定して、検索数を制限したり、結果を特定のドメインに制限したりできます。

```php
(new WebSearch)->max(5)->allow(['laravel.com', 'php.net']),
```

ユーザーの場所に基づいて検索結果を絞り込むには、`location`メソッドを使用してください。

```php
(new WebSearch)->location(
    city: 'New York',
    region: 'NY',
    country: 'US'
);
```

<a name="web-fetch"></a>
#### Webフェッチ

`WebFetch`プロバイダツールを使用すると、エージェントはWebページの内容を取得して読み取ることができます。これは、エージェントに特定のURLを分析させたり、既知のWebページから詳細な情報を取得させたりする必要がある場合に便利です。

**サポートしているプロバイダ：** Anthropic, Gemini

```php
use Laravel\Ai\Providers\Tools\WebFetch;

public function tools(): iterable
{
    return [
        new WebFetch,
    ];
}
```

Webフェッチツールを設定して、フェッチ数を制限したり、特定のドメインに制限したりできます。

```php
(new WebFetch)->max(3)->allow(['docs.laravel.com']),
```

<a name="file-search"></a>
#### ファイル検索

`FileSearch`プロバイダツールを使用すると、エージェントは[ベクトルストア](#vector-stores)に保存されている[ファイル](#files)内を検索できます。これにより、エージェントがアップロード済みのドキュメントから関連情報を検索できるようになり、検索拡張生成（RAG）が可能になります。

**サポートしているプロバイダ：** OpenAI, Gemini

```php
use Laravel\Ai\Providers\Tools\FileSearch;

public function tools(): iterable
{
    return [
        new FileSearch(stores: ['store_id']),
    ];
}
```

複数のストアにまたがって検索するには、複数のベクトルストアIDを指定します。

```php
new FileSearch(stores: ['store_1', 'store_2']);
```

ファイルに[メタデータ](#adding-files-to-stores)がある場合、`where`引数を指定して検索結果をフィルタリングできます。単純な等値フィルタの場合は、配列を渡します。

```php
new FileSearch(stores: ['store_id'], where: [
    'author' => 'Taylor Otwell',
    'year' => 2026,
]);
```

より複雑なフィルタの場合は、`FileSearchQuery`インスタンスを受け取るクロージャを渡します。

```php
use Laravel\Ai\Providers\Tools\FileSearchQuery;

new FileSearch(stores: ['store_id'], where: fn (FileSearchQuery $query) =>
    $query->where('author', 'Taylor Otwell')
        ->whereNot('status', 'draft')
        ->whereIn('category', ['news', 'updates'])
);
```

<a name="sub-agents"></a>
### サブエージェント

エージェントは、別のエージェントの`tools`メソッドから返すこともできます。エージェントをツールとして返すと、親エージェントは特定のタスクをサブエージェントに委任し、元のプロンプトに回答する際にサブエージェントのレスポンスを利用できます。これは、汎用エージェントが、独自の指示、ツール、モデル設定、またはプロバイダの優先設定を持つ専門特化型エージェントにアクセスする必要がある場合に便利です。

たとえば、カスタマーサポートエージェントは、返金の資格に関する質問を専用の返金エージェントに委任できます。

```php
<?php

namespace App\Ai\Agents;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Promptable;

class CustomerSupportAgent implements Agent, HasTools
{
    use Promptable;

    /**
     * エージェントが従うべき指示を取得
     */
    public function instructions(): string
    {
        return 'You help customers with account, order, and billing questions. Delegate refund policy questions to the refunds specialist.';
    }

    /**
     * エージェントが利用可能なツールを取得
     *
     * @return Tool[]
     */
    public function tools(): iterable
    {
        return [
            new RefundsAgent,
        ];
    }
}
```

サブエージェントを親エージェントに公開する方法をカスタマイズするには、サブエージェントに`CanActAsTool`インターフェイスを実装し、ツールとしての名前と説明を定義します。

```php
<?php

namespace App\Ai\Agents;

use App\Ai\Tools\LookupOrder;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\CanActAsTool;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;

#[Provider(Lab::Anthropic)]
class RefundsAgent implements Agent, CanActAsTool, HasTools
{
    use Promptable;

    /**
     * エージェントが従うべき指示を取得
     */
    public function instructions(): string
    {
        return 'You are a refunds specialist. Use order details and the refund policy to give concise eligibility guidance.';
    }

    /**
     * エージェントのツール名を取得
     */
    public function name(): string
    {
        return 'refunds_specialist';
    }

    /**
     * エージェントのツールの説明を取得
     */
    public function description(): string
    {
        return 'Determine whether an order is eligible for a refund and explain the next step.';
    }

    /**
     * ージェントが利用可能なツールを取得
     *
     * @return Tool[]
     */
    public function tools(): iterable
    {
        return [
            new LookupOrder,
        ];
    }
}
```

サブエージェントが`CanActAsTool`を実装していない場合、Laravelはエージェントのクラスのベース名をツール名として使用し、親エージェントに明確で自己完結したタスクの説明を渡すよう求める汎用的な説明を使用します。各サブエージェントの呼び出しは分離して実行し、親エージェントの会話履歴は受け取りません。

<a name="middleware"></a>
### ミドルウェア

エージェントはミドルウェアをサポートしており、プロバイダへ送信する前にプロンプトを傍受して変更できます。ミドルウェアは、`make:agent-middleware` Artisanコマンドを使用して作成できます。

```shell
php artisan make:agent-middleware LogPrompts
```

生成したミドルウェアは、アプリケーションの`app/Ai/Middleware`ディレクトリに配置されます。エージェントにミドルウェアを追加するには、`HasMiddleware`インターフェイスを実装し、ミドルウェアクラスの配列を返す`middleware`メソッドを定義します。

```php
<?php

namespace App\Ai\Agents;

use App\Ai\Middleware\LogPrompts;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasMiddleware;
use Laravel\Ai\Promptable;

class SalesCoach implements Agent, HasMiddleware
{
    use Promptable;

    // ...

    /**
     * エージェントのミドルウェアを取得
     */
    public function middleware(): array
    {
        return [
            new LogPrompts,
        ];
    }
}
```

各ミドルウェアクラスは、`AgentPrompt`と、プロンプトを次のミドルウェアに渡すための`Closure`を受け取る`handle`メソッドを定義する必要があります。

```php
<?php

namespace App\Ai\Middleware;

use Closure;
use Laravel\Ai\Prompts\AgentPrompt;

class LogPrompts
{
    /**
     * 送信されてきたプロンプトを処理
     */
    public function handle(AgentPrompt $prompt, Closure $next)
    {
        Log::info('エージェントにプロンプトを送信中', ['prompt' => $prompt->prompt]);

        return $next($prompt);
    }
}
```

レスポンスで`then`メソッドを使用して、エージェントが処理を終えた後にコードを実行できます。これは、同期レスポンスとストリーミングレスポンスの両方で機能します。

```php
public function handle(AgentPrompt $prompt, Closure $next)
{
    return $next($prompt)->then(function (AgentResponse $response) {
        Log::info('エージェントが応答しました', ['text' => $response->text]);
    });
}
```

<a name="anonymous-agents"></a>
### 匿名エージェント

専用のエージェントクラスを作成せずに、モデルと素早くやり取りしたい場合があります。`agent`関数を使用して、アドホックな匿名エージェントを作成できます。

```php
use function Laravel\Ai\{agent};

$response = agent(
    instructions: 'あなたはソフトウェア開発のエキスパートです。',
    messages: [],
    tools: [],
)->prompt('Laravelについて教えてください')
```

匿名エージェントも構造化出力を生成できます。

```php
use Illuminate\Contracts\JsonSchema\JsonSchema;

use function Laravel\Ai\{agent};

$response = agent(
    schema: fn (JsonSchema $schema) => [
        'number' => $schema->integer()->required(),
    ],
)->prompt('100未満の乱数を生成して')
```

<a name="agent-configuration"></a>
### エージェント設定

PHP属性を使用して、エージェントのテキスト生成オプションを設定できます。以下の属性が利用可能です。

- `MaxSteps`: ツールを使用する際にエージェントが実行できる最大ステップ数
- `MaxTokens`: モデルが生成できる最大トークン数
- `Model`: エージェントが使用すべきモデル
- `Provider`: エージェントに使用するAIプロバイダ（またはフェイルオーバ用のプロバイダ）
- `Temperature`: 生成に使用するサンプリング温度（0.0～1.0）
- `Timeout`: エージェントリクエストのHTTPタイムアウト（秒単位、デフォルトは60）
-  `TopP`: 生成に使用するニュークリアスサンプリングの確率 (0.0～1.0)
- `UseCheapestModel`: コスト最適化のため、プロバイダの最も安価なテキストモデルを使用
- `UseSmartestModel`: 複雑なタスクのため、プロバイダの最も有能なテキストモデルを使用

```php
<?php

namespace App\Ai\Agents;

use Laravel\Ai\Attributes\MaxSteps;
use Laravel\Ai\Attributes\MaxTokens;
use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Attributes\Temperature;
use Laravel\Ai\Attributes\Timeout;
use Laravel\Ai\Attributes\TopP;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;

#[Provider(Lab::Anthropic)]
#[Model('claude-sonnet-5')]
#[MaxSteps(10)]
#[MaxTokens(4096)]
#[Temperature(0.7)]
#[Timeout(120)]
#[TopP(0.9)]
class SalesCoach implements Agent
{
    use Promptable;

    // ...
}
```

`UseCheapestModel`属性と`UseSmartestModel`属性を使用すると、モデル名を指定せずに、特定のプロバイダに対して最もコスト効率の高いモデル、または最も有能なモデルを自動的に選択できます。これは、異なるプロバイダ間でコストや能力を最適化したい場合に便利です。

```php
use Laravel\Ai\Attributes\UseCheapestModel;
use Laravel\Ai\Attributes\UseSmartestModel;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;

#[UseCheapestModel]
class SimpleSummarizer implements Agent
{
    use Promptable;

    // 最も安価なモデル（例：Haiku）を使用
}

#[UseSmartestModel]
class ComplexReasoner implements Agent
{
    use Promptable;

    // 最も有能なモデル（例：Opus）を使用
}
```

> [!NOTE]
> プロバイダが新しいモデルをリリースするのに伴い、Laravel AI SDKのリリース間で`UseCheapestModel`や`UseSmartestModel`が選択する基底モデルが変わる可能性があります。モデルを切り替えると、動作の変化、非推奨のパラメータ、大幅な価格差が生じる場合があります。安定性、予測可能なモデルと価格設定が必要な場合は、`Model`属性を使用して明示的にモデルを指定してください。

<a name="provider-options"></a>
### プロバイダオプション

エージェントへプロバイダ固有のオプション（OpenAIのreasoning effortやpenalty設定など）を渡す必要がある場合は、`HasProviderOptions`インターフェイスを実装し、`providerOptions`メソッドを定義します。

```php
<?php

namespace App\Ai\Agents;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasProviderOptions;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;

class SalesCoach implements Agent, HasProviderOptions
{
    use Promptable;

    // ...

    /**
     * プロバイダ固有の生成オプションを取得
     */
    public function providerOptions(Lab|string $provider): array
    {
        return match ($provider) {
            Lab::OpenAI => [
                'reasoning' => ['effort' => 'low'],
                'frequency_penalty' => 0.5,
                'presence_penalty' => 0.3,
            ],
            Lab::Anthropic => [
                'thinking' => ['budget_tokens' => 1024],
                'cache_control' => ['type' => 'ephemeral'],
            ],
            default => [],
        };
    }
}
```

`providerOptions`メソッドは、現在使用しているプロバイダ（`Lab`列挙型または文字列）を受け取るため、プロバイダごとに異なるオプションを返せます。これは[フェイルオーバ](#failover)を使用する場合、各フォールバックプロバイダが独自の構成を受け取れるため、特に便利です。

上記のAnthropicの例では、`cache_control`を介して[プロンプトキャッシュ](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)も有効にしています。

<a name="human-tool-approval"></a>
## 人間によるツールの承認

> [!WARNING]
> ツールの承認には、中断した呼び出しを再開できるように会話履歴を保存する`Conversational`エージェントが必要です。`RemembersConversations`トレイトが必要な永続性を提供しています。

センシティブまたは不可逆的なアクションを実行するツールは、実行前に人間の承認を必要とするでしょう。ツールを承認可能にするには、`Approvable`コントラクトを実装し、`InteractsWithApprovals`トレイトを使用します。承認可能なツールはデフォルトで承認を必要とします。

```php
<?php

namespace App\Ai\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Storage;
use Laravel\Ai\Concerns\InteractsWithApprovals;
use Laravel\Ai\Contracts\Approvable;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class DeleteFile implements Approvable, Tool
{
    use InteractsWithApprovals;

    /**
     * ツールの目的の説明を取得
     */
    public function description(): Stringable|string
    {
        return 'Delete a file from storage.';
    }

    /**
     * ツールを実行
     */
    public function handle(Request $request): Stringable|string
    {
        Storage::delete($request['path']);

        return "Deleted [{$request['path']}].";
    }

    /**
     * ツールのスキーマ定義を取得
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'path' => $schema->string()->required(),
        ];
    }
}
```

ツール呼び出しの引数に基づいて承認が必要かどうかを判定するには、ツール上に`needsApproval`メソッドを定義します。このメソッドはブール値、または承認リクエストの理由を含む`Approval`インスタンスを返すことができます。

```php
use Laravel\Ai\Approvals\Approval;

/**
 * 指定したリクエストに対してツールが承認を必要とするか判定
 */
protected function needsApproval(Request $request): Approval|bool
{
    return str_starts_with($request['path'], 'temporary/')
        ? false
        : Approval::required('This will permanently delete a file.');
}
```

エージェントの`tools`メソッドからツールを返すときに、ツールの承認要件をオーバーライドできます。

```php
public function tools(): iterable
{
    return [
        (new SendNotification)->withoutApproval(),
        (new DeleteFile)->requireApproval('Deletion review required.'),
    ];
}
```

承認可能なツールを呼び出すと、エージェントはツールを実行する前に一時停止します。レスポンスの保留中の承認を調査できます。これには各ツール呼び出しのID、ツール名、引数、承認理由が含まれます。

```php
$response = (new FileAssistant)
    ->forUser($user)
    ->prompt('Delete the old invoice.');

if ($response->hasPendingApprovals()) {
    foreach ($response->pendingApprovals as $approval) {
        // $approval->id
        // $approval->tool
        // $approval->arguments
        // $approval->reason
    }
}
```

エージェントを再開するため、会話を継続し、保留中の各ツール呼び出しに対する決定を含む`Decisions`インスタンスを提供します。Dicisionsは、実行前に呼び出しを承認、拒否、または引数を編集できます。

```php
use Laravel\Ai\Approvals\Decision;
use Laravel\Ai\Approvals\Decisions;

$response = (new FileAssistant)
    ->continue($conversationId, as: $user)
    ->prompt(Decisions::from([
        'call_abc' => Decision::approve(),
        'call_ghi' => Decision::reject('The invoice must be retained.'),
    ]));
```

ブール値の`true`と`false`を承認と拒否の省略形として使用できます。保留中のすべてのツール呼び出しは決定を受け取る必要があります。不明、不足、または以前に解決済みのツール呼び出しIDは、`ApprovalMismatchException`を投げます。`approveRemaining`または`rejectRemaining`メソッドを使用して、明示的な決定がない呼び出しのデフォルトを提供できます。

```php
$decisions = Decisions::from([
    'call_abc' => true,
])->rejectRemaining('Not approved.');

$response = (new FileAssistant)
    ->continue($conversationId, as: $user)
    ->prompt($decisions);
```

`Decision::reject('Not approved.')`のように結果を伴う拒否はモデルに返され、モデルは応答を継続できます。結果を伴わない拒否は、拒否を記録した後に生成ループを停止します。

ツールの承認は、`prompt`、`stream`、`queue`、`broadcast`、`broadcastNow`、`broadcastOnQueue`メソッドでサポートしています。

ストリーミングおよびブロードキャスト中、一時停止は`tool_approval_request`イベントで表します。[Vercel AI SDKストリームプロトコル](#streaming-using-the-vercel-ai-sdk-protocol)を使用する場合、承認リクエストと結果はプロトコルのネイティブツール承認パーツを使用して送信します。

キュー投入したエージェントの場合、結果のレスポンスを`then`コールバックに渡し、Laravelは`ToolApprovalRequested`イベントも発行します。

Laravelはモデルに継続を要求する前に、承認されたツールの結果を保存します。その後生成に失敗した場合、その承認はすでに解決済みです。同じ承認決定を再度送信する代わりに、通常のテキストプロンプトで会話を継続してください。

<a name="complete-approval-flow"></a>
### 完全な承認フロー

以下のルートは完全な承認フローを示しています。`GET`ルートはチャット画面を返し、`POST`ルートは新しいテキストプロンプトまたはチャット画面からの承認決定を受け入れます。この例では、アプリケーションの`User`モデルが`HasConversations`トレイトを使用していることを前提としています。

```php
use App\Ai\Agents\FileAssistant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\Rule;
use Laravel\Ai\Approvals\Decision;
use Laravel\Ai\Approvals\Decisions;
use Laravel\Ai\Models\Conversation;

Route::get('/chat/{conversation}', function (Request $request, Conversation $conversation) {
    Gate::authorize('view', $conversation);

    return view('chat', [
        'conversation' => $conversation,
    ]);
})->middleware('auth');

Route::post('/chat/{conversation}', function (Request $request, Conversation $conversation) {
    Gate::authorize('view', $conversation);

    $validated = $request->validate([
        'message' => ['nullable', 'string', 'required_without:decisions', 'prohibited_with:decisions'],
        'decisions' => ['nullable', 'array', 'required_without:message', 'prohibited_with:message'],
        'decisions.*.action' => ['required_with:decisions', Rule::in(['approve', 'reject'])],
        'decisions.*.result' => ['nullable', 'string'],
    ]);

    $prompt = isset($validated['decisions'])
        ? Decisions::from($validated->collect('decisions')->map(
            fn (array $decision) => match ($decision['action']) {
                'approve' => Decision::approve(),
                'reject' => Decision::reject($decision['result'] ?? null),
            }
        )->all())
        : $validated['message'];

    $response = (new FileAssistant)
        ->continue($conversation->id, as: $request->user())
        ->prompt($prompt);

    return [
        'conversation_id' => $response->conversationId,
        'status' => $response->hasPendingApprovals() ? 'awaiting_approval' : 'complete',
        'message' => $response->text,
        'approvals' => $response->pendingApprovals,
    ];
})->middleware('auth');
```

レスポンスのステータスが`awaiting_approval`の場合、チャット画面は保留中の承認をレンダリングし、各決定のキーとしてツール呼び出しIDを使用してユーザーの選択を同じエンドポイントへ送信する必要があります。

```json
{
    "decisions": {
        "call_abc": {
            "action": "approve"
        },
        "call_def": {
            "action": "reject",
            "result": "The invoice must be retained."
        }
    }
}
```

通常のチャットメッセージの場合、画面は代わりに`message`値を送信できます。

```json
{
    "message": "Delete the old invoice."
}
```

<a name="images"></a>
## 画像

`Laravel\Ai\Image`クラスを使用して、`openai`、`gemini`、または`xai`プロバイダを用いた画像生成を行えます。

```php
use Laravel\Ai\Image;

$image = Image::of('キッチンカウンターに置いてあるドーナツ')->generate();

$rawContent = (string) $image;
```

`square`、`portrait`、`landscape`メソッドで画像の比率を制御でき、`quality`メソッドで最終的な画質（`high`、`medium`、`low`）をモデルに指示できます。`timeout`メソッドを使用して、HTTPタイムアウトを秒単位で指定できます。

```php
use Laravel\Ai\Image;

$image = Image::of('キッチンカウンターに置いてあるドーナツ')
    ->quality('high')
    ->landscape()
    ->timeout(120)
    ->generate();
```

`attachments`メソッドを使用して参照画像を添付できます。

```php
use Laravel\Ai\Files;
use Laravel\Ai\Image;

$image = Image::of('この私の写真を印象派の絵画のようなスタイルに更新して。')
    ->attachments([
        Files\Image::fromStorage('photo.jpg'),
        // Files\Image::fromPath('/home/laravel/photo.jpg'),
        // Files\Image::fromUrl('[https://example.com/photo.jpg](https://example.com/photo.jpg)'),
        // $request->file('photo'),
    ])
    ->landscape()
    ->generate();
```

生成された画像は、アプリケーションの`config/filesystems.php`設定ファイルで設定しているデフォルトのディスクへ簡単に保存できます。

```php
$image = Image::of('キッチンカウンターに置いてあるドーナツ');

$path = $image->store();
$path = $image->storeAs('image.jpg');
$path = $image->storePublicly();
$path = $image->storePubliclyAs('image.jpg');
```

画像生成をキューへ投入することもできます。

```php
use Laravel\Ai\Image;
use Laravel\Ai\Responses\ImageResponse;

Image::of('キッチンカウンターに置いてあるドーナツ')
    ->portrait()
    ->queue()
    ->then(function (ImageResponse $image) {
        $path = $image->store();

        // ...
    });
```

<a name="audio"></a>
## 音声

`Laravel\Ai\Audio`クラスを使用して、指定したテキストから音声を生成できます。

```php
use Laravel\Ai\Audio;

$audio = Audio::of('Laravelでコーディングするのが大好きです。')->generate();

$rawContent = (string) $audio;
```

Laravelの`Stringable`クラスで利用できる`toAudio`メソッドを使用して、文字列から音声を生成することもできます。

```php
use Illuminate\Support\Str;

$audio = Str::of('I love coding with Laravel.')->toAudio();
```

`male`、`female`、`voice`メソッドを使用して、生成される音声の声を決定できます。

```php
$audio = Audio::of('Laravelでコーディングするのが大好きです。')
    ->female()
    ->generate();

$audio = Audio::of('Laravelでコーディングするのが大好きです。')
    ->voice('voice-id-or-name')
    ->generate();
```

同様に、`instructions`メソッドを使用して、生成される音声がどのように聞こえるべきかを動的にモデルにコーチングできます。

```php
$audio = Audio::of('Laravelでコーディングするのが大好きです。')
    ->female()
    ->instructions('海賊のように話して')
    ->generate();
```

生成された音声は、アプリケーションの`config/filesystems.php`設定ファイルで設定したデフォルトのディスクへ単に保存できます。

```php
$audio = Audio::of('Laravelでコーディングするのが大好きです。')->generate();

$path = $audio->store();
$path = $audio->storeAs('audio.mp3');
$path = $audio->storePublicly();
$path = $audio->storePubliclyAs('audio.mp3');
```

音声生成もキューに投入できます。

```php
use Laravel\Ai\Audio;
use Laravel\Ai\Responses\AudioResponse;

Audio::of('Laravelでコーディングするのが大好きです。')
    ->queue()
    ->then(function (AudioResponse $audio) {
        $path = $audio->store();

        // ...
    });
```

<a name="transcription"></a>
## 文字起こし

`Laravel\Ai\Transcription`クラスを使用して、指定した音声の文字起こしを生成できます。

```php
use Laravel\Ai\Transcription;

$transcript = Transcription::fromPath('/home/laravel/audio.mp3')->generate();
$transcript = Transcription::fromStorage('audio.mp3')->generate();
$transcript = Transcription::fromUpload($request->file('audio'))->generate();

return (string) $transcript;
```

`diarize`メソッドを使用して、生のテキストの文字起こしに加えてダイアリゼーション（話者分離）された文字起こしをレスポンスに含めるように指示でき、話者ごとに区切られた文字起こしにアクセスできるようになります。

```php
$transcript = Transcription::fromStorage('audio.mp3')
    ->diarize()
    ->generate();
```

文字起こしの生成もキューに入れることができます。

```php
use Laravel\Ai\Transcription;
use Laravel\Ai\Responses\TranscriptionResponse;

Transcription::fromStorage('audio.mp3')
    ->queue()
    ->then(function (TranscriptionResponse $transcript) {
        // ...
    });
```

<a name="text-summarization"></a>
## テキスト要約

Laravelの`Stringable`クラスで利用可能な`summarize`メソッドを使用して、テキストを要約できます。デフォルトでは、要約は3文以内で構成され、設定されているプロバイダの最も安価なテキストモデルを使用して生成します。

```php
use Illuminate\Support\Str;

$summary = Str::of($article)->summarize();
```

要約の生成に使用する最大文数、プロバイダ、モデル、タイムアウトを指定できます。`Str`クラスもこのメソッドの静的バージョンを提供しています。

```php
use Laravel\Ai\Enums\Lab;

$summary = Str::of($article)->summarize(
    sentences: 4,
    provider: Lab::Anthropic,
    model: 'claude-sonnet-5',
    timeout: 30,
);

$summary = Str::summarize($article, sentences: 4);
```

<a name="embeddings"></a>
## 埋め込み

Laravelの`Stringable`クラスで利用可能な新しい`toEmbeddings`メソッドを使用して、任意の文字列のベクトル埋め込みを簡単に生成できます。

```php
use Illuminate\Support\Str;

$embeddings = Str::of('ナパバレーには素晴らしいワインがあります。')->toEmbeddings();
```

あるいは、`Embeddings`クラスを使用して、複数の入力に対して一度に埋め込みを生成することもできます。

```php
use Laravel\Ai\Embeddings;

$response = Embeddings::for([
    'ナパバレーには素晴らしいワインがあります。',
    'LaravelはPHPのフレームワークです。',
])->generate();

$response->embeddings; // [[0.123, 0.456, ...], [0.789, 0.012, ...]]
```

埋め込みの次元数とプロバイダを指定できます。

```php
$response = Embeddings::for(['ナパバレーには素晴らしいワインがあります。'])
    ->dimensions(1536)
    ->generate(Lab::OpenAI, 'text-embedding-3-small');
```

<a name="multimodal-embeddings"></a>
### マルチモーダル埋め込み

`Embeddings::for`メソッドは文字列に加えて画像、音声、ドキュメント、動画入力を受け付け、テキスト以外のコンテンツに対しても埋め込みを生成できます。Geminiは画像、音声、ドキュメント、動画の埋め込みをサポートし、VoyageAIは画像と動画の埋め込みをサポートしています。

```php
use Laravel\Ai\Embeddings;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Files\Image;
use Laravel\Ai\Files\Video;

$response = Embeddings::for([
    'A vineyard at sunset.',
    Image::fromStorage('vineyard.jpg'),
    Video::fromPath('/home/laravel/tour.mp4'),
])->generate(Lab::Gemini);
```

マルチモーダル入力は[添付ファイルに使用するファイルクラス](#attachments)と同じものを使用します。これらのファイルはローカルパス、ファイルシステムディスク、リモートURL、またはBase64エンコード済みコンテンツから作成できます。画像、ドキュメント、動画はアップロードしたファイルからも作成でき、ドキュメントは生の文字列コンテンツから作成することも可能です。

```php
use Laravel\Ai\Files\Audio;
use Laravel\Ai\Files\Document;
use Laravel\Ai\Files\Image;
use Laravel\Ai\Files\Video;

Image::fromPath('/home/laravel/photo.jpg');
Image::fromStorage('photo.jpg');
Image::fromUpload($request->file('photo'));

Audio::fromPath('/home/laravel/clip.mp3');
Audio::fromStorage('clip.mp3');
Audio::fromUpload($request->file('clip.mp3'));

Video::fromPath('/home/laravel/video.mp4');
Video::fromStorage('video.mp4');
Video::fromUpload($request->file('video'));

Document::fromUrl('https://example.com/report.pdf');
Document::fromString('Laravel is a PHP framework.', 'text/plain');
Document::fromUpload($request->file('report'));
```

> [!NOTE]
> VoyageAIはリモートURLメディアとBase64エンコード済みメディアを単一のリクエストで混在させることを許可していません。ローカルファイル、ストレージに保存したファイル、アップロードしたファイルはBase64エンコード済みコンテンツとして送信され、テキスト入力はいずれのメディアソースとも組み合わせられます。利用可能なマルチモーダルモデルと入力については、プロバイダのドキュメントを参照してください。

<a name="querying-embeddings"></a>
### 埋め込みのクエリ

埋め込みを生成したら、通常は後でクエリするためにデータベースの`vector`カラムに保存します。Laravelは、`pgvector`拡張機能を介してPostgreSQLのベクトルカラムをネイティブにサポートしています。開始するには、マイグレーションで`vector`カラムを定義し、次元数を指定します。

```php
Schema::ensureVectorExtensionExists();

Schema::create('documents', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('content');
    $table->vector('embedding', dimensions: 1536);
    $table->timestamps();
});
```

類似性検索を高速化するために、ベクトルインデックスを追加することもできます。ベクトルカラムで`index`を呼び出すと、Laravelはコサイン距離を使用したHNSWインデックスを自動的に作成します。

```php
$table->vector('embedding', dimensions: 1536)->index();
```

Eloquentモデルでは、ベクトルカラムを`array`にキャストしてください。

```php
protected function casts(): array
{
    return [
        'embedding' => 'array',
    ];
}
```

類似したレコードを検索するには、`whereVectorSimilarTo`メソッドを使用します。このメソッドは、最小コサイン類似度（`0.0`から`1.0`の間。`1.0`は同一）で結果をフィルタリングし、類似度順に結果を並べ替えます。

```php
use App\Models\Document;

$documents = Document::query()
    ->whereVectorSimilarTo('embedding', $queryEmbedding, minSimilarity: 0.4)
    ->limit(10)
    ->get();
```

`$queryEmbedding`は浮動小数点数の配列、またはプレーンな文字列です。文字列が指定された場合、Laravelはその文字列の埋め込みを自動的に生成します。

```php
$documents = Document::query()
    ->whereVectorSimilarTo('embedding', 'ナパバレーで最高のワイナリー')
    ->limit(10)
    ->get();
```

より詳細な制御が必要な場合は、低レベルの`whereVectorDistanceLessThan`、`selectVectorDistance`、`orderByVectorDistance`メソッドを独立して使用できます。

```php
$documents = Document::query()
    ->select('*')
    ->selectVectorDistance('embedding', $queryEmbedding, as: 'distance')
    ->whereVectorDistanceLessThan('embedding', $queryEmbedding, maxDistance: 0.3)
    ->orderByVectorDistance('embedding', $queryEmbedding)
    ->limit(10)
    ->get();
```

エージェントにツールとして類似性検索を実行する能力を与えたい場合は、[類似性検索](#similarity-search)ツールのドキュメントを確認してください。

> [!NOTE]
> ベクトルクエリは現在、`pgvector`拡張機能を使用しているPostgreSQL接続でのみサポートしています。

<a name="caching-embeddings"></a>
### 埋め込みのキャッシュ

埋め込み生成をキャッシュして、同一の入力に対する冗長なAPI呼び出しを回避できます。キャッシュを有効にするには、`ai.caching.embeddings.cache`設定オプションを`true`に設定してください。

```php
'caching' => [
    'embeddings' => [
        'cache' => true,
        'store' => env('CACHE_STORE', 'database'),
        // ...
    ],
],
```

キャッシュが有効な場合、埋め込みを３０日間キャッシュします。キャッシュキーは、プロバイダ、モデル、次元数、および入力内容に基づいており、同一のリクエストはキャッシュされた結果を返し、異なる設定の場合は新しい埋め込みを生成することを保証します。

グローバルキャッシュが無効な場合でも、`cache`メソッドを使用して特定のリクエストに対してキャッシュを有効にできます。

```php
$response = Embeddings::for(['ナパバレーには素晴らしいワインがあります。'])
    ->cache()
    ->generate();
```

カスタムのキャッシュ期間を秒単位で指定できます。

```php
$response = Embeddings::for(['ナパバレーには素晴らしいワインがあります。'])
    ->cache(seconds: 3600) // 1時間キャッシュ
    ->generate();
```

`toEmbeddings` Stringableメソッドも`cache`引数を受け入れます。

```php
// デフォルト期間でキャッシュ...
$embeddings = Str::of('ナパバレーには素晴らしいワインがあります。')->toEmbeddings(cache: true);

// 特定の期間でキャッシュ...
$embeddings = Str::of('ナパバレーには素晴らしいワインがあります。')->toEmbeddings(cache: 3600);
```

<a name="reranking"></a>
## リランク

リランクを使用すると、特定のクエリとの関連性に基づいてドキュメントのリストを並べ替えることができます。これは、セマンティックな理解を使用して検索結果を改善するのに役立ちます。

`Laravel\Ai\Reranking`クラスを使用して、ドキュメントをリランクできます。

```php
use Laravel\Ai\Reranking;

$response = Reranking::of([
    'DjangoはPythonのWebフレームワークです。',
    'LaravelはPHPのWebアプリケーションフレームワークです。',
    'Reactはユーザーインターフェイスを構築するためのJavaScriptライブラリです。',
])->rerank('PHPフレームワーク');

// 最上位の結果にアクセス...
$response->first()->document; // "LaravelはPHPのWebアプリケーションフレームワークです。"
$response->first()->score;    // 0.95
$response->first()->index;    // 1 (元の位置)
```

`limit`メソッドを使用して、返される結果の数を制限できます。

```php
$response = Reranking::of($documents)
    ->limit(5)
    ->rerank('検索クエリ');
```

<a name="reranking-collections"></a>
### コレクションのリランク

利便性のために、Laravelコレクションは`rerank`マクロを使用してリランクできます。最初の引数はリランクに使用するフィールドを指定し、2番目の引数はクエリです。

```php
// 単一のフィールドでリランク
$posts = Post::all()
    ->rerank('body', 'Laravelのチュートリアル');

// 複数のフィールドでリランク（JSONとして送信）
$reranked = $posts->rerank(['title', 'body'], 'Laravelのチュートリアル');

// クロージャを使用してドキュメントを構築し、リランク
$reranked = $posts->rerank(
    fn ($post) => $post->title.': '.$post->body,
    'Laravelのチュートリアル'
);
```

結果の数を制限したり、プロバイダを指定したりすることもできます。

```php
$reranked = $posts->rerank(
    by: 'content',
    query: 'Laravelのチュートリアル',
    limit: 10,
    provider: Lab::Cohere
);
```

<a name="files"></a>
## ファイル

`Laravel\Ai\Files`クラス、または個別のファイルクラスを使用して、後で会話で使用するためにAIプロバイダにファイルを保存できます。これは、再アップロードせずに複数回参照したい大きなドキュメントやファイルに便利です。

```php
use Laravel\Ai\Files\Document;
use Laravel\Ai\Files\Image;

// ローカルパスからファイルを保存
$response = Document::fromPath('/home/laravel/document.pdf')->put();
$response = Image::fromPath('/home/laravel/photo.jpg')->put();

// ファイルシステムディスクに保存されているファイルを保存
$response = Document::fromStorage('document.pdf', disk: 'local')->put();
$response = Image::fromStorage('photo.jpg', disk: 'local')->put();

// リモートURLに保存されているファイルを保存
$response = Document::fromUrl('[https://example.com/document.pdf')-](https://example.com/document.pdf')-)>put();
$response = Image::fromUrl('[https://example.com/photo.jpg')-](https://example.com/photo.jpg')-)>put();

return $response->id;
```

生のコンテンツやアップロード済みファイルを保存することもできます。

```php
use Laravel\Ai\Files;
use Laravel\Ai\Files\Document;

// 生のコンテンツを保存
$stored = Document::fromString('Hello, World!', 'text/plain')->put();

// アップロード済みファイルを保存
$stored = Document::fromUpload($request->file('document'))->put();
```

ファイルを保存すると、ファイルを再アップロードする代わりに、エージェントを介してテキストを生成する際にそのファイルを参照できます。

```php
use App\Ai\Agents\SalesCoach;
use Laravel\Ai\Files;

$response = (new SalesCoach)->prompt(
    '添付されたセールスの文字起こしを分析して...'
    attachments: [
        Files\Document::fromId('file-id') // 保存済みのドキュメントを添付
    ]
);
```

以前に保存したファイルを取得するには、ファイルインスタンスで`get`メソッドを使用します。

```php
use Laravel\Ai\Files\Document;

$file = Document::fromId('file-id')->get();

$file->id;
$file->mimeType();
```

プロバイダからファイルを削除するには、`delete`メソッドを使用します。

```php
Document::fromId('file-id')->delete();
```

デフォルトでは、`Files`クラスはアプリケーションの`config/ai.php`設定ファイルで設定しているデフォルトのAIプロバイダを使用します。ほとんどの操作において、`provider`引数を使用して別のプロバイダを指定できます。

```php
$response = Document::fromPath(
    '/home/laravel/document.pdf'
)->put(provider: Lab::Anthropic);
```

`withProviderOptions`メソッドを使い、プロバイダ固有のアップロードオプションを渡すこともできます。たとえば、OpenAIのファイルの`purpose`を設定できます。

```php
use Laravel\Ai\Files\Document;

$response = Document::fromPath('/home/laravel/knowledge.txt')
    ->withProviderOptions(['purpose' => 'assistants'])
    ->put();
```

プロバイダごとにオプションの範囲を限定するには、現在のプロバイダを受け取るクロージャを渡します。

```php
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Files\Document;

$response = Document::fromPath('/home/laravel/training.jsonl')
    ->withProviderOptions(fn (Lab|string $provider) => match ($provider) {
        Lab::OpenAI => ['purpose' => 'fine-tune'],
        default => [],
    })
    ->put();
```

<a name="using-stored-files-in-conversations"></a>
### 会話での保存済みファイルの使用

プロバイダにファイルを保存したら、`Document`または`Image`クラスの`fromId`メソッドを使用して、エージェントの会話でそれを参照できます。

```php
use App\Ai\Agents\DocumentAnalyzer;
use Laravel\Ai\Files;
use Laravel\Ai\Files\Document;

$stored = Document::fromPath('/path/to/report.pdf')->put();

$response = (new DocumentAnalyzer)->prompt(
    'このドキュメントを要約して。',
    attachments: [
        Document::fromId($stored->id),
    ],
);
```

同様に、保存された画像は`Image`クラスを使用して参照できます。

```php
use Laravel\Ai\Files;
use Laravel\Ai\Files\Image;

$stored = Image::fromPath('/path/to/photo.jpg')->put();

$response = (new ImageAnalyzer)->prompt(
    'この画像には何が写っていますか？',
    attachments: [
        Image::fromId($stored->id),
    ],
);
```

<a name="vector-stores"></a>
## ベクトルストア

ベクトルストアを使用すると、検索拡張生成（RAG）に使用できる検索可能なファイルのコレクションを作成できます。`Laravel\Ai\Stores`クラスは、ベクトルストアの作成、取得、および削除のためのメソッドを提供します。

```php
use Laravel\Ai\Stores;

// 新しいベクトルストアを作成...
$store = Stores::create('ナレッジベース');

// 追加オプションを指定してストアを作成...
$store = Stores::create(
    name: 'ナレッジベース',
    description: 'ドキュメントと参照資料。',
    expiresWhenIdleFor: days(30),
);

return $store->id;
```

IDを指定して既存のベクトルストアを取得するには、`get`メソッドを使用します。

```php
use Laravel\Ai\Stores;

$store = Stores::get('store_id');

$store->id;
$store->name;
$store->fileCounts;
$store->ready;
```

ベクトルストアを削除するには、`Stores`クラスまたはストアインスタンスで`delete`メソッドを使用します。

```php
use Laravel\Ai\Stores;

// IDで削除...
Stores::delete('store_id');

// またはストアインスタンスを介して削除...
$store = Stores::get('store_id');

$store->delete();
```

<a name="adding-files-to-stores"></a>
### ストアへのファイル追加

ベクトルストアを作成したら、`add`メソッドを使用してそれに[ファイル](#files)を追加できます。ストアに追加されたファイルは、[ファイル検索プロバイダツール](#file-search)を使用したセマンティック検索のために自動的にインデックス化されます。

```php
use Laravel\Ai\Files\Document;
use Laravel\Ai\Stores;

$store = Stores::get('store_id');

// プロバイダに保存済みのファイルを追加
$document = $store->add('file_id');
$document = $store->add(Document::fromId('file_id'));

// または、保存と追加を1ステップで実行
$document = $store->add(Document::fromPath('/path/to/document.pdf'));
$document = $store->add(Document::fromStorage('manual.pdf'));
$document = $store->add($request->file('document'));

$document->id;
$document->fileId;
```

> **注意：** 通常、以前に保存されたファイルをベクトルストアに追加する場合、返されるドキュメントIDは、以前に割り当てられたファイルのIDと一致します。ただし、一部のベクトルストレージプロバイダは、新しく異なる「ドキュメントID」を返す場合があります。したがって、将来の参照のために両方のIDをデータベースに保存しておくことをお勧めします。

ファイルをストアに追加する際にメタデータを添付できます。このメタデータは、後で[ファイル検索プロバイダツール](#file-search)を使用する際に検索結果をフィルタリングするために使用できます。

```php
$store->add(Document::fromPath('/path/to/document.pdf'), metadata: [
    'author' => 'Taylor Otwell',
    'department' => 'Engineering',
    'year' => 2026,
]);
```

ストアからファイルを削除するには、`remove`メソッドを使用します。

```php
$store->remove('file_id');
```

ベクトルストアからファイルを削除しても、プロバイダの[ファイルストレージ](#files)からは削除されません。ベクトルストアからファイルを削除し、ファイルストレージからも完全に削除するには、`deleteFile`引数を使用してください。

```php
$store->remove('file_abc123', deleteFile: true);
```

<a name="failover"></a>
## フェイルオーバ

プロンプト送信や他のメディア生成を行う際、プロバイダ／モデルの配列を指定することで、プライマリプロバイダでサービスの中断やレート制限が発生した場合に、バックアップのプロバイダ／モデルへ自動的にフェイルオーバできます。

```php
use App\Ai\Agents\SalesCoach;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Image;

$response = (new SalesCoach)->prompt(
    'このセールスの文字起こしを分析して...',
    provider: [Lab::OpenAI, Lab::Anthropic],
);

$image = Image::of('キッチンカウンターに置いてあるドーナツ')
    ->generate(provider: [Lab::Gemini, Lab::xAI]);
```

フェイルオーバは、レート制限（`RateLimitedException`）、過負荷または利用不可能なプロバイダ（`ProviderOverloadedException`）、不十分なクレジット（`InsufficientCreditsException`）などの`FailoverableException`が投げられた場合にのみ行われます。バリデーションや不正なリクエストエラーのような通常のエラーでは、フェイルオーバをトリガーしません。

`[Lab::OpenAI, Lab::Anthropic]`のようにプロバイダのプレーンなリストを渡す場合、各プロバイダはデフォルトのモデルを使用します。フェイルオーバチェーン内の各プロバイダへ特定のモデルを指定するには、連想配列を渡します。その際、PHPの配列キーにEnumの列挙子が直接使用できないため、配列のキーはプロバイダーを表す`Lab` Enum値の`value`をキーとして使用してください。

```php
use Laravel\Ai\Enums\Lab;

$response = (new SalesCoach)->prompt(
    'Analyze this sales transcript...',
    provider: [
        Lab::Gemini->value => 'gemini-3-flash-preview',
        Lab::DeepSeek->value => 'deepseek-v4-pro',
    ],
);
```

<a name="testing"></a>
## テスト

<a name="testing-agents"></a>
### エージェント

テスト中にエージェントのレスポンスをFakeするには、エージェントクラスで`fake`メソッドを呼び出します。オプションで、レスポンスの配列またはクロージャを指定できます。

```php
use App\Ai\Agents\SalesCoach;
use Laravel\Ai\Prompts\AgentPrompt;

// すべてのプロンプトに対して、固定のレスポンスを自動的に生成
SalesCoach::fake();

// プロンプトレスポンスのリストを提供
SalesCoach::fake([
    '最初のレスポンス',
    '2番目のレスポンス',
]);

// 入ってきたプロンプトに基づいて、プロンプトレスポンスを動的に処理
SalesCoach::fake(function (AgentPrompt $prompt) {
    return 'レスポンス内容: '.$prompt->prompt;
});
```

構造化出力を返すエージェントをfakeする場合、レスポンスに配列を指定できます。エージェントは、指定したデータを含む構造化レスポンスを返します。

```php
SalesCoach::fake([
    ['score' => 87],
]);
```

ツールの承認を待機しているレスポンスをFakeすることもできます。

```php
use Laravel\Ai\Approvals\PendingApproval;
use Laravel\Ai\Responses\AgentResponse;

FileAssistant::fake([
    AgentResponse::fakeWithPendingApprovals([
        new PendingApproval(
            id: 'call_abc',
            tool: 'DeleteFile',
            arguments: ['path' => 'invoice.pdf'],
            reason: 'This will permanently delete a file.',
        ),
    ]),
]);

$response = (new FileAssistant)->prompt('Delete the invoice.');

$response->hasPendingApprovals(); // true
```

> **注意：** 構造化出力を返すエージェントに対して`Agent::fake()`を呼び出し、かつ擬装出力を明示的に指定しなかった場合、Laravelはエージェントが定義している出力スキーマに一致する擬装データを自動的に生成します。

エージェントにプロンプトを送った後、受け取ったプロンプトについてアサートできます。

```php
use Laravel\Ai\Prompts\AgentPrompt;

SalesCoach::assertPrompted('これを分析して...');

SalesCoach::assertPrompted(function (AgentPrompt $prompt) {
    return $prompt->contains('分析');
});

SalesCoach::assertNotPrompted('存在しないプロンプト');

SalesCoach::assertNeverPrompted();
```

承認の継続をアサートする場合、プロンプトの承認決定を検査できます。

```php
use Laravel\Ai\Approvals\Decisions;
use Laravel\Ai\Prompts\AgentPrompt;

FileAssistant::fake();

(new FileAssistant)->prompt(Decisions::from([
    'call_abc' => true,
]));

FileAssistant::assertPrompted(function (AgentPrompt $prompt) {
    return $prompt->hasApprovalDecisions()
        && $prompt->approvalDecisions->get('call_abc')->isApproved();
});
```

キュー投入したエージェント呼び出しについては、キュー用のアサートメソッドを使用してください。

```php
use Laravel\Ai\QueuedAgentPrompt;

SalesCoach::assertQueued('これを分析して...');

SalesCoach::assertQueued(function (QueuedAgentPrompt $prompt) {
    return $prompt->contains('分析');
});

SalesCoach::assertNotQueued('存在しないプロンプト');

SalesCoach::assertNeverQueued();
```

すべてのエージェント呼び出しに対応するフェイクレスポンスがあることを確認するには、`preventStrayPrompts`を使用できます。フェイクレスポンスが定義されていない状態でエージェントを呼び出すと、例外を投げます。

```php
SalesCoach::fake()->preventStrayPrompts();
```

<a name="testing-images"></a>
### 画像

画像生成は、`Image`クラスの`fake`メソッドを呼び出すことでFakeにできます。画像をFakeにしたら、記録済みの画像生成プロンプトに対してさまざまなアサートを実行できます。

```php
use Laravel\Ai\Image;
use Laravel\Ai\Prompts\ImagePrompt;
use Laravel\Ai\Prompts\QueuedImagePrompt;

// すべてのプロンプトに対して、固定のレスポンスを自動的に生成
Image::fake();

// プロンプトレスポンスのリストを提供
Image::fake([
    base64_encode($firstImage),
    base64_encode($secondImage),
]);

// 入ってきたプロンプトに基づいて、プロンプトレスポンスを動的に処理
Image::fake(function (ImagePrompt $prompt) {
    return base64_encode('...');
});
```

画像を生成した後、受け取ったプロンプトについてアサートを行えます。

```php
Image::assertGenerated(function (ImagePrompt $prompt) {
    return $prompt->contains('夕焼け') && $prompt->isLandscape();
});

Image::assertNotGenerated('存在しないプロンプト');

Image::assertNothingGenerated();
```

キューに投入した画像生成については、キュー用のアサートメソッドを使用してください。

```php
Image::assertQueued(
    fn (QueuedImagePrompt $prompt) => $prompt->contains('夕焼け')
);

Image::assertNotQueued('存在しないプロンプト');

Image::assertNothingQueued();
```

すべての画像生成に対応するフェイクレスポンスがあることを確認するには、`preventStrayImages`を使用できます。フェイクレスポンスが定義されていない状態で画像を生成すると、例外を投げます。

```php
Image::fake()->preventStrayImages();
```

<a name="testing-audio"></a>
### 音声

音声生成は、`Audio`クラスの`fake`メソッドを呼び出すことでFakeにできます。音声をFakeにしたら、記録済みの音声生成プロンプトに対してさまざまなアサートを実行できます。

```php
use Laravel\Ai\Audio;
use Laravel\Ai\Prompts\AudioPrompt;
use Laravel\Ai\Prompts\QueuedAudioPrompt;

// すべてのプロンプトに対して、固定のレスポンスを自動的に生成
Audio::fake();

// プロンプトレスポンスのリストを提供
Audio::fake([
    base64_encode($firstAudio),
    base64_encode($secondAudio),
]);

// 入ってきたプロンプトに基づいて、プロンプトレスポンスを動的に処理
Audio::fake(function (AudioPrompt $prompt) {
    return base64_encode('...');
});
```

音声を生成した後、受け取ったプロンプトについてアサートできます。

```php
Audio::assertGenerated(function (AudioPrompt $prompt) {
    return $prompt->contains('こんにちは') && $prompt->isFemale();
});

Audio::assertNotGenerated('存在しないプロンプト');

Audio::assertNothingGenerated();
```

キューに投入した音声生成については、キュー用のアサートメソッドを使用してください。

```php
Audio::assertQueued(
    fn (QueuedAudioPrompt $prompt) => $prompt->contains('こんにちは')
);

Audio::assertNotQueued('存在しないプロンプト');

Audio::assertNothingQueued();
```

すべての音声生成に対応するフェイクレスポンスがあることを確認するには、`preventStrayAudio`を使用できます。フェイクレスポンスが定義されていない状態で音声を生成すると、例外を投げます。

```php
Audio::fake()->preventStrayAudio();
```

<a name="testing-transcriptions"></a>
### 文字起こし

文字起こしの生成は、`Transcription`クラスの`fake`メソッドを呼び出すことでFakeできます。文字起こしをFakeにしたら、記録済みの文字起こし生成プロンプトに対してさまざまなアサートを実行できます。

```php
use Laravel\Ai\Transcription;
use Laravel\Ai\Prompts\TranscriptionPrompt;
use Laravel\Ai\Prompts\QueuedTranscriptionPrompt;

// すべてのプロンプトに対して、固定のレスポンスを自動的に生成
Transcription::fake();

// プロンプトレスポンスのリストを提供
Transcription::fake([
    '最初の文字起こしテキスト。',
    '2番目の文字起こしテキスト。',
]);

// 入ってきたプロンプトに基づいて、プロンプトレスポンスを動的に処理
Transcription::fake(function (TranscriptionPrompt $prompt) {
    return '文字起こしされたテキスト...';
});
```

文字起こしを生成した後、受け取ったプロンプトについてアサートを行えます。

```php
Transcription::assertGenerated(function (TranscriptionPrompt $prompt) {
    return $prompt->language === 'en' && $prompt->isDiarized();
});

Transcription::assertNotGenerated(
    fn (TranscriptionPrompt $prompt) => $prompt->language === 'fr'
);

Transcription::assertNothingGenerated();
```

キュー投入した文字起こし生成については、キュー用のアサートメソッドを使用してください。

```php
Transcription::assertQueued(
    fn (QueuedTranscriptionPrompt $prompt) => $prompt->isDiarized()
);

Transcription::assertNotQueued(
    fn (QueuedTranscriptionPrompt $prompt) => $prompt->language === 'fr'
);

Transcription::assertNothingQueued();
```

すべての文字起こし生成に対応するフェイクレスポンスがあることを確認するには、`preventStrayTranscriptions`を使用できます。フェイクレスポンスが定義されていない状態で文字起こしを生成する、例外を投げます。

```php
Transcription::fake()->preventStrayTranscriptions();
```

<a name="testing-embeddings"></a>
### 埋め込み

埋め込み生成は、`Embeddings`クラスの`fake`メソッドを呼び出すことでFakeにできます。埋め込みをFakeにしたら、記録済みの埋め込み生成プロンプトに対してさまざまなアサートを実行できます。

```php
use Laravel\Ai\Embeddings;
use Laravel\Ai\Prompts\EmbeddingsPrompt;
use Laravel\Ai\Prompts\QueuedEmbeddingsPrompt;

// すべてのプロンプトに対して、適切な次元のフェイク埋め込みを自動的に生成
Embeddings::fake();

// プロンプトレスポンスのリストを提供
Embeddings::fake([
    [$firstEmbeddingVector],
    [$secondEmbeddingVector],
]);

// 入ってきたプロンプトに基づいて、プロンプトレスポンスを動的に処理
Embeddings::fake(function (EmbeddingsPrompt $prompt) {
    return array_map(
        fn () => Embeddings::fakeEmbedding($prompt->dimensions),
        $prompt->inputs
    );
});
```

埋め込みを生成した後、受け取ったプロンプトについてアサートを行えます。

```php
Embeddings::assertGenerated(function (EmbeddingsPrompt $prompt) {
    return $prompt->contains('Laravel') && $prompt->dimensions === 1536;
});

Embeddings::assertNotGenerated(
    fn (EmbeddingsPrompt $prompt) => $prompt->contains('Other')
);

Embeddings::assertNothingGenerated();
```

キュー投入した埋め込み生成については、キュー用のアサートメソッドを使用してください。

```php
Embeddings::assertQueued(
    fn (QueuedEmbeddingsPrompt $prompt) => $prompt->contains('Laravel')
);

Embeddings::assertNotQueued(
    fn (QueuedEmbeddingsPrompt $prompt) => $prompt->contains('Other')
);

Embeddings::assertNothingQueued();
```

すべての埋め込み生成に対応するフェイクレスポンスがあることを確認するには、`preventStrayEmbeddings`を使用できます。フェイクレスポンスが定義されていない状態で埋め込みを生成する、例外を投げます。

```php
Embeddings::fake()->preventStrayEmbeddings();
```

<a name="testing-reranking"></a>
### リランク

リランク操作は、`Reranking`クラスの`fake`メソッドを呼び出すことでFフェイクにできます。

```php
use Laravel\Ai\Reranking;
use Laravel\Ai\Prompts\RerankingPrompt;
use Laravel\Ai\Responses\Data\RankedDocument;

// フェイクのリランクレスポンスを自動的に生成
Reranking::fake();

// カスタムレスポンスを提供
Reranking::fake([
    [
        new RankedDocument(index: 0, document: '最初', score: 0.95),
        new RankedDocument(index: 1, document: '2番目', score: 0.80),
    ],
]);
```

リランク後、実行された操作についてアサートを行えます。

```php
Reranking::assertReranked(function (RerankingPrompt $prompt) {
    return $prompt->contains('Laravel') && $prompt->limit === 5;
});

Reranking::assertNotReranked(
    fn (RerankingPrompt $prompt) => $prompt->contains('Django')
);

Reranking::assertNothingReranked();
```

<a name="testing-files"></a>
### ファイル

ファイル操作は、`Files`クラスの`fake`メソッドを呼び出すことでFakeにできます。

```php
use Laravel\Ai\Files;

Files::fake();
```

ファイル操作をFakeにした後、発生したアップロードや削除についてアサートを行えます。

```php
use Laravel\Ai\Contracts\Files\StorableFile;
use Laravel\Ai\Files\Document;

// ファイルを保存
Document::fromString('Hello, Laravel!', mimeType: 'text/plain')
    ->as('hello.txt')
    ->put();

// アサートを実行
Files::assertStored(fn (StorableFile $file) =>
    (string) $file === 'Hello, Laravel!' &&
        $file->mimeType() === 'text/plain';
);

Files::assertNotStored(fn (StorableFile $file) =>
    (string) $file === 'Hello, World!'
);

Files::assertNothingStored();
```

ファイルの削除に対するアサートでは、ファイルIDを渡せます。

```php
Files::assertDeleted('file-id');
Files::assertNotDeleted('file-id');
Files::assertNothingDeleted();
```

<a name="testing-vector-stores"></a>
### ベクトルストア

ベクトルストアの操作は、`Stores`クラスの`fake`メソッドを呼び出すことでFakeにできます。ストアをFakeにすると、[ファイル操作](#files)も自動的にFakeになります。

```php
use Laravel\Ai\Stores;

Stores::fake();
```

ストア操作をFakeにした後、作成または削除したストアについてアサートを行えます。

```php
use Laravel\Ai\Stores;

// ストアを作成
$store = Stores::create('ナレッジベース');

// アサートを実行
Stores::assertCreated('ナレッジベース');

Stores::assertCreated(fn (string $name, ?string $description) =>
    $name === 'ナレッジベース'
);

Stores::assertNotCreated('別のストア');

Stores::assertNothingCreated();
```

ストアの削除に対するアサートでは、ストアIDを指定できます。

```php
Stores::assertDeleted('store_id');
Stores::assertNotDeleted('other_store_id');
Stores::assertNothingDeleted();
```

ファイルをストアに追加または削除したことをアサートするには、指定した`Store`インスタンスのアサートメソッドを使用します。

```php
Stores::fake();

$store = Stores::get('store_id');

// ファイルを追加／削除
$store->add('added_id');
$store->remove('removed_id');

// アサートを実行
$store->assertAdded('added_id');
$store->assertRemoved('removed_id');

$store->assertNotAdded('other_file_id');
$store->assertNotRemoved('other_file_id');
```

ファイルをプロバイダの[ファイルストレージ](#files)に保存し、同じリクエスト内でベクトルストアに追加した場合、ファイルのプロバイダIDがわからないことがあります。この場合、`assertAdded`メソッドにクロージャを渡し、追加したファイルの内容に対してアサートを実行できます。

```php
use Laravel\Ai\Contracts\Files\StorableFile;
use Laravel\Ai\Files\Document;

$store->add(Document::fromString('Hello, World!', 'text/plain')->as('hello.txt'));

$store->assertAdded(fn (StorableFile $file) => $file->name() === 'hello.txt');
$store->assertAdded(fn (StorableFile $file) => $file->content() === 'Hello, World!');
```

<a name="events"></a>
## イベント

Laravel AI SDKは、以下を含むさまざまな[イベント](/docs/{{version}}/events)をディスパッチします。

- `AddingFileToStore`
- `AgentPrompted`
- `AgentStreamed`
- `AudioGenerated`
- `CreatingStore`
- `EmbeddingsGenerated`
- `FileAddedToStore`
- `FileDeleted`
- `FileRemovedFromStore`
- `FileStored`
- `GeneratingAudio`
- `GeneratingEmbeddings`
- `GeneratingImage`
- `GeneratingTranscription`
- `ImageGenerated`
- `InvokingTool`
- `PromptingAgent`
- `RemovingFileFromStore`
- `Reranked`
- `Reranking`
- `StoreCreated`
- `StoringFile`
- `StreamingAgent`
- `ToolApprovalRequested`
- `ToolApprovalResolved`
- `ToolInvoked`
- `TranscriptionGenerated`

これらのイベントをリスニングして、AI SDKの使用情報をログに記録したり保存したりできます。
