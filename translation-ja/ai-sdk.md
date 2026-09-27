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
    - [遅延ツールロード](#deferred-tool-loading)
    - [ファイル保存域ツール](#file-storage-tools)
    - [MCPツール](#mcp-tools)
    - [プロバイダツール](#provider-tools)
    - [サブエージェント](#sub-agents)
    - [ミドルウェア](#middleware)
    - [匿名エージェント](#anonymous-agents)
    - [エージェント設定](#agent-configuration)
    - [プロバイダオプション](#provider-options)
    - [プロンプトキャッシュ](#prompt-caching)
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
- [等級付け](#classification)
- [ファイル](#files)
- [ベクトルストア](#vector-stores)
    - [ストアへのファイル追加](#adding-files-to-stores)
- [消費量](#usage)
- [フェイルオーバ](#failover)
- [テスト](#testing)
    - [エージェント](#testing-agents)
    - [画像](#testing-images)
    - [音声](#testing-audio)
    - [文字起こし](#testing-transcriptions)
    - [埋め込み](#testing-embeddings)
    - [リランク](#testing-reranking)
    - [等級付け](#testing-classification)
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
TYPESAFE_API_KEY=
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

設定内で`headers`配列を定義し、プロバイダ宛ての送信リクエストすべてにカスタムHTTPヘッダを追加できます。これは、Bearerトークンに加え、識別用や認証用のヘッダをエンドポイントが必要とする場合に役立ちます。

```php
'local' => [
    'driver' => 'openai-compatible',
    'url' => env('LOCAL_AI_URL'),
    'key' => env('LOCAL_AI_API_KEY'),
    'headers' => [
        'X-Tenant-Id' => env('LOCAL_AI_TENANT_ID'),
    ],
],
```

OpenAI互換プロバイダは、テキスト生成、ストリーミング、ツール、構造化出力、画像添付、埋め込み、文字起こしをサポートしています。エンドポイントが追加のリクエストボディフィールドを必要とする場合は、[プロバイダオプション](#provider-options)を使用して渡してください。

<a name="openai-compatible-embeddings"></a>
#### OpenAI互換の埋め込み

任意のエンドポイントには既知のモデルがないため、OpenAI互換プロバイダで`embeddings()`を使うには、デフォルトの埋め込みモデルを設定する必要があります。固定の次元値を設定することもできます。省略した場合、`dimensions`パラメータなしでリクエストを送信し、モデル固有の次元を使用します。

```php
'local' => [
    'driver' => 'openai-compatible',
    'url' => env('LOCAL_AI_URL'),
    'key' => env('LOCAL_AI_API_KEY'),
    'models' => [
        'embeddings' => [
            'default' => 'text-embedding-qwen3-embedding-0.6b',
            'dimensions' => 1024, // optional
        ],
    ],
],
```

<a name="openai-compatible-transcriptions"></a>
#### OpenAI互換の文字起こし

同様に、OpenAI互換プロバイダで`Transcription`を使用するには、デフォルトの文字起こしモデルを設定する必要があります。音声は標準のマルチパートリクエストとしてエンドポイントの`/audio/transcriptions`ルートへアップロードします。

```php
'local' => [
    'driver' => 'openai-compatible',
    'url' => env('LOCAL_AI_URL'),
    'key' => env('LOCAL_AI_API_KEY'),
    'models' => [
        'transcription' => [
            'default' => 'whisper-1',
        ],
    ],
],
```

> [!NOTE]
> OpenAI互換プロバイダとGroqプロバイダは、話者分離(diarization)をサポートしていません。これらのプロバイダを使用時に`diarize`メソッドを呼び出すと、例外を投げます。

<a name="provider-support"></a>
### プロバイダのサポート

AI SDKは、その機能全体でさまざまなプロバイダをサポートしています。以下の表は、各機能で利用可能なプロバイダをまとめたものです。

<div class="overflow-auto">

| 機能 | プロバイダ |
|---|---|
| テキスト | OpenAI, OpenAI Compatible, Anthropic, Gemini, Azure, Bedrock, Groq, xAI, DeepSeek, Mistral, Ollama, OpenRouter |
| 画像 | OpenAI, Gemini, xAI, Azure, Bedrock, OpenRouter |
| TTS | OpenAI, ElevenLabs, Gemini, Mistral, OpenRouter |
| STT | OpenAI, OpenAI Compatible, ElevenLabs, Groq, Mistral, Gemini, OpenRouter |
| 埋め込み | OpenAI, OpenAI Compatible, Gemini, Azure, Bedrock, Cohere, Mistral, Jina, VoyageAI, Ollama, OpenRouter |
| リランク | Cohere, Jina, VoyageAI, Bedrock, OpenRouter |
| 等級付け | TypeSafe, OpenRouter |
| ファイル | OpenAI, Anthropic, Gemini, Azure, OpenRouter |

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

<a name="raw-http-responses"></a>
#### 生HTTPレスポンス

テキスト生成エージェントから返すレスポンスはすべて、`raw`プロパティを介して元となるプロバイダAPI呼び出しからの生HTTPレスポンスを公開します。これにより、レート制限ヘッダやリクエストID、その他の正確なペイロードフィールドなど、AI SDKの汎用レスポンスには含まれていないプロバイダ固有の情報へアクセスできます。

```php
$response = (new SalesCoach)->prompt('Analyze this sales transcript...');

$response->raw; // Illuminate\Http\Client\Response|null

$response->raw->header('X-RateLimit-Remaining-Requests');
$response->raw->json('id');
```

ツール呼び出しループ内では、各ステップが自身のリクエストの生レスポンスを保持します。

```php
foreach ($response->steps as $step) {
    $step->raw?->header('X-RateLimit-Remaining-Requests');
}
```

> **注意：** レスポンスのストリーミング時、（HTTPクライアントの代わりに、AWS SDK経由でAPI呼び出しを実行する）Bedrockプロバイダを使用する場合、および`withRawResponse`で明示的に提示しない限りフェイクレスポンスでは、`raw`プロパティは`null`になります。

<a name="conversation-context"></a>
### 会話コンテキスト

エージェントが`Conversational`インターフェイスを実装している場合、`messages`メソッドを使用して、該当する以前の会話コンテキストを返せます。

```php
/**
 * これまでの会話を構成するメッセージリストを取得
 */
public function messages(): iterable
{
    return $this->user->history()
        ->latest()
        ->limit(50)
        ->get()
        ->reverse()
        ->map(fn ($message) => new Message(
            $message->role, $message->content,
        ))->all();
}
```

エージェントが、`Conversational`インターフェイスを実装していない場合は、`withMessages`メソッドを使用して、アプリケーションのフロントエンドから投稿した履歴など、単一の実行に対する会話履歴を提供できます。

```php
use Laravel\Ai\Messages\Message;

$response = (new SalesCoach)
    ->withMessages([
        new Message('user', 'Analyze this sales transcript...'),
        new Message('assistant', 'The rep never asked for the close.'),
    ])
    ->prompt('What should they say next time?');
```

`Conversational`インターフェイスを実装するエージェントは自身の履歴をロードするため、これら２つのアプローチを組み合わせると、`LogicException`を投げます。

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

`continueOrStart`メソッドは、指定した会話を継続するか、指定したIDが`null`の場合には新しい会話を開始するために使用します。

```php
$response = (new SalesCoach)
    ->continueOrStart($conversationId, as: $user)
    ->prompt('Hello!');
```

`RemembersConversations`トレイトを使用する場合、プロンプト実行時に以前のメッセージを自動的にロードして会話コンテキストへ含めます。新しいメッセージ（ユーザーとアシスタントの両方）は、やり取りごとに自動的に保存します。各レスポンスには、保存した会話とメッセージのIDも含まれます。

```php
$response->conversationId;
$response->userMessageId;
$response->assistantMessageId;
```

<a name="conversation-participants"></a>
#### 会話の参加者

通常、ユーザーが最も一般的な会話の参加者ですが、会話は任意のEloquentモデルに属することができます。別のタイプのモデルの会話を開始するには、`forParticipant`メソッドを使用します。

```php
$response = (new SalesCoach)
    ->forParticipant($team)
    ->prompt('Review our latest sales results.');
```

参加者のモーフクラスと主キーは会話と一緒に保存します。そのため、`User` ID `1` と `Team` ID `1` のように同じ主キーを持つ異なるタイプのモデルであっても、別々の会話履歴を保持します。`forUser`メソッドは `forParticipant` のエイリアスです。

`continueLastConversation`メソッドを使用して、参加者の最新の会話を続行できます。会話はエージェントごとに限定するため、そのエージェントが参加した会話のみを継続します。

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
> `continue`メソッドおよび`continueOrStart`メソッドは、指定した参加者が会話を所有しているかどうかを検証しません。アプリケーションは会話を継続する前に、会話へのアクセスを承認する必要があります。

<a name="inspecting-stored-conversations"></a>
#### 保存済み会話の調査

会話をユーザーに表示する際、メッセージID、タイムスタンプ、ツール呼び出しなどの詳細が必要になることがよくあります。AI SDKのテーブルを直接クエリすることなく、サービスコンテナから会話ストアを解決して、保存されたメッセージを読み取ることができます。

```php
use Laravel\Ai\Contracts\ConversationStore;

$store = app(ConversationStore::class);
```

メッセージはカーソルを使用して最新のものから順にペジネーションし、各メッセージのID、タイムスタンプ、消費量、メタデータ、添付ファイルを含む`StoredMessage`インスタンスとして返します。

```php
$messages = $store->paginateConversationMessages($conversationId, perPage: 25);

foreach ($messages as $message) {
    $message->id;
    $message->role;
    $message->content;
    $message->createdAt;
    $message->usage;
    $message->status;
}
```

ユーザーのプロンプトとアシスタントの返答で構成する各ターンは、ステップのリストとして保存します。ステップはプロバイダへの単一のリクエストであるため、モデルがツールを呼び出すターンには複数のステップが含まれます。各ツールの結果は、それを生成したツール呼び出しに記録します。`toolCalls`、`providerToolCalls`、`toolResults`メソッドは、これらのステップを順番に一次元化するため、自分で巡回する必要はありません。

```php
$message->steps;

$message->toolCalls();
$message->providerToolCalls();
$message->toolResults();
```

ツール呼び出しを実行すれば、`result`を持ちます。`approval_reason`を含み、`result`を含まないツール呼び出しは、引き続き[ツール承認](#human-tool-approval)として待機しています。

`status`プロパティは、`Laravel\Ai\Enums\MessageStatus`インスタンスを含みます。途中で失敗したターンは、すでに完了したステップとともに`Failed`として保存するため、失敗前に実行されたツール呼び出しは履歴に残ります。会話を継続する際、記録済みの結果がないツール呼び出しは、Laravelが実行したかを判断できないため、中断されたとしてマークしてモデルへ送信します。

アプリケーションのフロントエンドが提供したIDを介して会話を継続する前に、指定した参加者のために会話を保存したことを確認する必要があります。

```php
abort_unless($store->conversationBelongsTo(
    $conversationId, $user->getMorphClass(), $user->getKey()
), 403);
```

最新のターンが[ツール承認](#human-tool-approval)を待って一時停止している場合、実行を再開せずにページの再読み込み後に保留中のツール呼び出しをレンダできます。

```php
foreach ($store->pendingApprovalsFor($conversationId) as $approval) {
    // $approval->id, $approval->tool, $approval->arguments, $approval->reason...
}
```

これらのメソッドは、`PaginatesConversations`、`VerifiesConversationOwnership`、`ResolvesPendingApprovals`の各コントラクトで定義しています。組み込みのデータベースストアは3つすべてを実装していますが、カスタムストアでは必要なコントラクトのみを実装できます。

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
    '添付したセールスの文字起こしを分析して...',
    attachments: [
        Files\Document::fromStorage('transcript.pdf'), // ファイルシステムディスクからドキュメントを添付
        Files\Document::fromPath('/home/laravel/transcript.md'), // ローカルパスからドキュメントを添付
        $request->file('transcript'), // アップロードしたファイルを添付
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
        Files\Image::fromStorage('photo.jpg'), // ファイルシステムディスクから画像を添付
        Files\Image::fromPath('/home/laravel/photo.jpg'), // ローカルパスから画像を添付
        $request->file('photo'), // アップロードしたファイルを添付
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

`RemembersConversations`トレイトを使用する場合、レスポンスはモデルの論理的思考（reasoning）および参照したソースも含まれます。

```php
use Laravel\Ai\Responses\StreamedAgentResponse;

(new SalesCoach)
    ->stream('Analyze this sales transcript...')
    ->then(function (StreamedAgentResponse $response) {
        $response->reasoning; // '' unless the model returned reasoning text...
        $response->meta->citations;
    });
```

論理的思考は、`prompt`メソッドが返すレスポンスでも利用できます。

<a name="streaming-using-the-vercel-ai-sdk-protocol"></a>
<a name="stream-protocols"></a>
#### ストリームプロトコル

ストリームしたレスポンスはデフォルトで、AI SDK独自のイベント形式を使用します。ただし、代わりにフロントエンドのストリーミングプロトコルを使用することもできます。これにより、独自に構築するのではなく、既存のチャットインターフェイスとエージェントを組み合わせられます。

ストリーミング可能なレスポンスで`usingVercelDataProtocol`メソッドを呼び出すことで、[Vercel AI SDKストリームプロトコル](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol)を使用してイベントをストリーミングできます。

```php
use App\Ai\Agents\SalesCoach;

Route::get('/coach', function () {
    return (new SalesCoach)
        ->stream('このセールスの文字起こしを分析して...')
        ->usingVercelDataProtocol();
});
```

アプリケーションのフロントエンドが独自のメッセージIDを割り当てる場合は、そのメッセージIDを渡します。

```php
->usingVercelDataProtocol($request->string('messageId'));
```

あるいは、`usingAgentUserInteractionProtocol`メソッドを使用して、[Agent User Interaction (AG-UI)プロトコル](https://docs.ag-ui.com)でストリーミング配信できます。

```php
Route::post('/coach', function (Request $request) {
    return (new SalesCoach)
        ->forUser($request->user())
        ->stream($request->string('prompt'))
        ->usingAgentUserInteractionProtocol();
});
```

`threadId`および`runId`引数は任意であり、会話IDと呼び出しIDがデフォルトです。

```php
->usingAgentUserInteractionProtocol(
    threadId: $request->input('threadId'),
    runId: $request->input('runId'),
);
```

AI SDKが実装していないプロトコルを使用するには、独自の`Laravel\Ai\Streaming\Protocols\StreamProtocol`実装を`usingProtocol`メソッドに渡せます。

```php
use App\Ai\Protocols\CustomProtocol;

return (new SalesCoach)
    ->stream('Analyze this sales transcript...')
    ->usingProtocol(new CustomProtocol);
```

<a name="chat-requests"></a>
<a name="frontend-integration"></a>
#### フロントエンド統合

Vercelの`useChat`やCopilotKitのようなライブラリで構築するチャットインターフェイスは、メッセージ、ツール呼び出し、承認プロンプトを予めレンダするため、アプリケーションではこれらが送信するリクエストのみを処理するだけです。各リクエストには、会話履歴、最新のユーザーメッセージ、ツール承認レスポンスが含まれます。

`Vercel::chat`メソッドと`AgentUserInteraction::chat`メソッドは、そのようなリクエストをエージェントの`stream`メソッドに直接渡せるオブジェクトに変換します。

```php
use Laravel\Ai\Vercel\Vercel;

Route::post('/chat', function (Request $request) {
    $chat = Vercel::chat($request);

    return (new SupportAgent)
        ->withMessages($chat->history())
        ->stream($chat)
        ->usingProtocol($chat->protocol());
});
```

リクエストに[承認決定](#human-tool-approval)が含まれている場合、エージェントはそれらの決定を使用して再開します。そうでない場合、リクエストの最新のユーザーメッセージと添付ファイルをエージェントへ渡します。`protocol`メソッドは、クライアントが使用するプロトコルを返します。

> [!NOTE]
> `Conversational`インターフェイスを実装するエージェントは、自身の履歴をロードするので`withMessages`メソッドを省略できます。

`AgentUserInteraction::chat`メソッドは、リクエストのスレッドIDと実行IDに加えて、AG-UIクライアントに同じAPIを提供します。

```php
use Laravel\Ai\AgentUserInteraction\AgentUserInteraction;

$chat = AgentUserInteraction::chat($request);

$chat->threadId();
$chat->runId();
```

保存したメッセージをクライアントが期待する形式に戻す変換も可能で、ページの再読み込み後などにクライアントが以前の会話を表示できるようになります。

```php
$messages = $conversation->messages()->oldest()->get();

return ['messages' => Vercel::toUiMessages($messages)];
```

`AgentUserInteraction::toClientState`メソッドは、保留中の承認中断を返すことに加え、AG-UIクライアントに対して同様の変換を実行します。

```php
return AgentUserInteraction::toClientState($messages);
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
    'このセールスの文字起こしを分析して...',
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

<a name="runtime-tool-overrides"></a>
#### ツールの実行時オーバーライド

`withTools`メソッドを使用して、エージェントインスタンスが宣言しているツールを置き換えることができます。これは、テナントごとやフィーチャーフラグによるツールセットに便利です。

```php
$response = (new SupportAgent)
    ->withTools([new LookupOrder])
    ->prompt('Where is order 12345?');
```

また、エージェントが宣言しているツールを受け取るクロージャを渡して、追加やフィルタリングを行うこともできます。

```php
$response = (new SupportAgent)
    ->withTools(fn (array $tools) => [...$tools, new LookupOrder])
    ->prompt('Where is order 12345?');
```

<a name="validating-tool-arguments"></a>
#### ツール引数のバリデーション

ツールのスキーマによりモデルが提供できる引数は制限されますが、リクエストの`validate`メソッドを使用して受け取る引数をバリデートできます。

```php
public function handle(Request $request): Stringable|string
{
    $validated = $request->validate([
        'city' => 'required|string',
        'days' => 'required|integer|max:7',
    ]);

    return $this->forecast($validated['city'], $validated['days']);
}
```

バリデーションに失敗すると、モデルにツールの結果としてバリデーションメッセージを返すため、モデルは引数を修正してツールを再呼び出しできます。

<a name="repairing-tool-calls"></a>
#### ツール呼び出しの修復

モデルが不明なローカルツールを呼び出したときに、エージェントを復旧させるには、`RepairToolCalls`属性を使用します。Laravelは失敗した呼び出しを利用可能なローカルツール名とともにモデルへ返し、呼び出しを修正できるようにします。

```php
use Laravel\Ai\Attributes\RepairToolCalls;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Promptable;

#[RepairToolCalls]
class SupportAgent implements Agent, HasTools
{
    use Promptable;

    // ...
}
```

Laravelが自動的に最大ステップ数を算出する場合、この属性は修復した呼び出しのためにステップを１つ追加します。明示的な`MaxSteps`の制限は変更しません。

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

<a name="deferred-tool-loading"></a>
### 遅延ツールロード

エージェントが公開するすべてのツールをデフォルトでは、リクエストごとにプロバイダへ送信します。エージェントが多数のツールを提供する場合、これはトークンを消費し、モデルのツール選択の精度を低下させる可能性があります。OpenAIまたはAnthropicで`ToolSearch`プロバイダツールを使用すると、ツールの定義を遅延させ、プロバイダが必要なときにのみ読み込むようにできます。

```php
use App\Ai\Tools\RefundOrder;
use App\Ai\Tools\SearchInvoices;
use App\Ai\Tools\Weather;
use Laravel\Ai\Providers\Tools\ToolSearch;

public function tools(): iterable
{
    return [
        new Weather,
        new ToolSearch(tools: [
            new SearchInvoices,
            new RefundOrder,
        ]),
    ];
}
```

ラップしたツールを変更する必要はありません。プロバイダは、それらがプロンプトに関連する場合に検索して読み込み、その後エージェントは他のツールと同様にそれらを呼び出せます。

Anthropicを使用する場合、プロバイダが遅延ツールをどのように検索するかを決定するために`strategy`引数を使用できます。サポートしているストラテジーは`regex`（デフォルト）と`bm25`です。

```php
new ToolSearch(tools: [new SearchInvoices], strategy: 'bm25'),
```

Anthropicを使用する場合、`withProviderOptions`メソッドを使用して、追加のプロバイダ固有のオプションを検索ツールへ渡してください。

```php
(new ToolSearch(tools: [new SearchInvoices]))
    ->withProviderOptions(['cache_control' => ['type' => 'ephemeral']]),
```

> [!WARNING]
> ツール検索をサポートしていないプロバイダは、遅延ツールを暗黙的に破棄するのではなく、例外を投げます。さらに、Anthropicでは`ToolSearch`ラッパーの外側に少なくとも１つのツールを提供する必要があります。

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

**サポートしているプロバイダ：** Anthropic、OpenAI、Azure、Gemini、xAI、OpenRouter

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

**サポートしているプロバイダ：** Anthropic、Gemini、OpenRouter

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

**サポートしているプロバイダ：** OpenAI、Gemini、xAI

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

<a name="code-execution"></a>
#### コード実行

`CodeExecution`プロバイダツールを使用すると、エージェントはAIプロバイダがホストするサンドボックス内でコードを実行できます。これは、計算の実行やデータの分析に便利です。

**サポートしているプロバイダ：** Anthropic、OpenAI、Azure、Gemini、xAI

```php
use Laravel\Ai\Providers\Tools\CodeExecution;

public function tools(): iterable
{
    return [new CodeExecution];
}
```

OpenAIまたはAzureを使用する場合、プロバイダオプションを介して[保存したファイル](#files)をサンドボックス内で利用可能にできます。

```php
(new CodeExecution)->withProviderOptions([
    'container' => ['type' => 'auto', 'file_ids' => ['file_123']],
]);
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
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Contracts\CanActAsTool;
use Laravel\Ai\Enums\Lab;

#[Provider(Lab::Anthropic)]
class RefundsAgent implements Agent, CanActAsTool, HasTools
{
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

    // ...
}
```

サブエージェントが`CanActAsTool`を実装していない場合、Laravelはエージェントのクラスのベース名をツール名として使用し、親エージェントに明確で自己完結したタスクの説明を渡すよう求める汎用的な説明を使用します。各サブエージェントの呼び出しは分離して実行し、親エージェントの会話履歴は受け取りません。

親エージェントが[ストリーミング](#streaming)している場合、そのサブエージェントも同様にストリーミングします。親エージェントは、サブエージェントがこれまでに生成したテキストを含む`ToolResult`イベントを発行します。これらのイベントは予備的なものとしてマークし、その後にツール呼び出しの最終結果が続くため、イベントを手作業で反復処理する際にスキップできます。

```php
use Laravel\Ai\Streaming\Events\ToolResult;

foreach ($stream as $event) {
    if ($event instanceof ToolResult && $event->preliminary) {
        continue;
    }

    // ...
}
```

`text`、`usage`、`toolResults`などのレスポンス値は予備イベントを無視します。[Vercelプロトコル](#stream-protocols)はこれらをネイティブのストリーミングツール出力として描画するため、`useChat` はカスタムコードなしで進行状況を表示し、AG-UIプロトコルはアクティビティのスナップショットとして報告します。完了したレスポンスのテキスト、論理的思考、参照、使用量には、サブエージェントのものが含まれます。

<a name="middleware"></a>
### ミドルウェア

エージェントはミドルウェアをサポートしており、プロバイダに送信される前に各生成ステップを割り込んで変更できます。ミドルウェアはステップごとに１回呼び出されるため、３ステップかかる実行では３回呼び出されます。ミドルウェアは`make:agent-middleware` Artisanコマンドを使用して作成できます。

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

各ミドルウェアクラスは、`PendingStep`と、次のミドルウェアにステップを渡す`Closure`を受け取る`handle`メソッドを定義する必要があります。

```php
<?php

namespace App\Ai\Middleware;

use Closure;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\PendingStep;

class LogPrompts
{
    /**
     * 保留中の生成ステップを処理
     */
    public function handle(PendingStep $step, Closure $next)
    {
        Log::info('Prompting agent', ['model' => $step->model]);

        return $next($step);
    }
}
```

送信しようとしている`provider`、`model`、`instructions`、`messages`、`tools`に加えて、ステップはすでに完了したステップ、その組み合わせた使用量、実行の進行状況を提供します。

```php
$step->steps;
$step->usage;

$step->number;
$step->isFirstStep();
$step->isFinalStep;
```

`withModel`、`withInstructions`、`withMessages`、`withTools`、`onlyTools`、`withoutTools`、`withToolChoice`、`withMaxTokens`、`withProviderOptions`の各メソッドは、それぞれステップのコピーを返します。たとえば、高コストなツールを一回だけ使ったあと、次回に取り除くことができます。

```php
public function handle(PendingStep $step, Closure $next)
{
    if (! $step->isFirstStep()) {
        $step = $step->withoutTools('SearchDocumentation');
    }

    return $next($step);
}
```

あるいは、会話の中間部分を要約することで、コンテキストウィンドウ内に長いツール呼び出しループを保持できます。

```php
use App\Ai\Agents\Summarizer;
use Laravel\Ai\Messages\UserMessage;

public function handle(PendingStep $step, Closure $next)
{
    if (count($step->messages) > 40) {
        $summary = (new Summarizer)->prompt(
            collect(array_slice($step->messages, 1, -10))->map->content->implode("\n"),
        )->text;

        $step = $step->withMessages([
            $step->messages[0],
            new UserMessage("Summary of the conversation so far: {$summary}"),
            ...array_slice($step->messages, -10),
        ]);
    }

    return $next($step);
}
```

`withMessages`メソッドに渡したメッセージは、現在のステップで送信するもののみを変更します。以降のステップや保存した会話では、要約していない完全な履歴を継続して使用します。

モデルがステップに回答した後、そのツール呼び出しを実行する前にコードを実行するには、`then`メソッドを使用します。これは同期レスポンスとストリーミングレスポンスの両方で機能します。

```php
use Laravel\Ai\Gateway\StepResponse;

public function handle(PendingStep $step, Closure $next)
{
    return $next($step)->then(function (StepResponse $response) {
        Log::info('エージェントが応答しました', ['text' => $response->text]);
    });
}
```

ミドルウェアは、`$next`の結果を返すか、キャッシュしたレスポンスを返す場合などモデルを呼び出さずにステップに回答するための独自の`StepResponse`を返さなければなりません。他の値を返すと、`LogicException`を投げます。

<a name="anonymous-agents"></a>
### 匿名エージェント

専用のエージェントクラスを作成せずに、モデルと素早くやり取りしたい場合があります。`agent`関数を使用して、アドホックな匿名エージェントを作成できます。

```php
use function Laravel\Ai\{agent};

$response = agent(
    instructions: 'あなたはソフトウェア開発のエキスパートです。',
    messages: [],
    tools: [],
)->prompt('Laravelについて教えてください');
```

匿名エージェントも構造化出力を生成できます。

```php
use Illuminate\Contracts\JsonSchema\JsonSchema;

use function Laravel\Ai\{agent};

$response = agent(
    schema: fn (JsonSchema $schema) => [
        'number' => $schema->integer()->required(),
    ],
)->prompt('100未満の乱数を生成して');
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

上記のAnthropicの例でも、`cache_control`を介して[プロンプトキャッシュ](#prompt-caching)を有効にしています。

[画像](#images)、[音声](#audio)、[文字起こし](#transcription)、[埋め込み](#embeddings)、[リランク](#reranking)ビルダもプロバイダオプションを受け付けます。

```php
use Laravel\Ai\Audio;

$audio = Audio::of('I love coding with Laravel.')
    ->withProviderOptions(['speed' => 1.25])
    ->generate();
```

配列の代わりにクロージャを渡すこともでき、現在使用しているプロバイダを受け取ります。

<a name="custom-http-headers"></a>
#### カスタムHTTPヘッダ

アプリケーションの `config/ai.php`設定ファイル内でプロバイダ用に構成したヘッダは、そのプロバイダが行うすべてのリクエストと一緒に送信します。AIゲートウェイが使用するメタデータなど、リクエスト単位でヘッダを送信するには、画像、音声、文字起こし、エンベディング、リランクの各ビルダや[ファイルアップロード](#files)で利用できる、`withHeaders`メソッドを使用します。

```php
use Laravel\Ai\Embeddings;

$embeddings = Embeddings::for($chunks)
    ->withHeaders(['cf-aig-metadata' => json_encode(['team' => $team->id])])
    ->withProviderOptions(['dimensions' => 1024])
    ->generate();
```

ヘッダは、現在使用しているプロバイダを受け取るクロージャとして渡すこともできます。ヘッダはリクエストボディに含まれず、[エンベディングキャッシュキー](#caching-embeddings)に影響を与えません。

<a name="prompt-caching"></a>
### プロンプトキャッシュ

ほとんどのプロバイダは、繰り返されるプロンプトプレフィックスを自動的にキャッシュし、キャッシュされた部分を割引価格で請求します。OpenAI、Gemini、Groq、DeepSeek、xAIは設定を必要とせず、レスポンスのusageを介して節約状況を確認できます。

```php
$response->usage->cacheReadInputTokens;
$response->usage->cacheWriteInputTokens;
```

これらのカウントはいずれも入力トークン合計のサブセットであり、これについては[消費量のドキュメント](#usage)で詳しく解説しています。

`anthropic`および`bedrock`プロバイダは、要求された場合のみキャッシュします。`CacheInstructions`と`CacheToolDefinitions`属性は、エージェントの指示とツール定義の末尾にキャッシュブレークポイントを配置するため、すべての会話は再度書き込む代わりに、キャッシュからそのプレフィックスを読み取ります。

```php
use Laravel\Ai\Attributes\CacheInstructions;
use Laravel\Ai\Attributes\CacheToolDefinitions;

#[CacheInstructions]
#[CacheToolDefinitions]
class SalesCoach implements Agent
{
    use Promptable;

    // ...
}
```

現在の日付を埋め込む場合など、リクエストごとに指示が変わる場合は、`CacheToolDefinitions`のみを使用してください。リクエストごとに変化するプレフィックスをキャッシュすると、毎回新しいキャッシュエントリが作成されるため、再利用することなくキャッシュへの書き込み費用を支払うことになります。

これらの属性をサポートしていないプロバイダは属性を無視するため、エージェントは[フェイルオーバ](#failover)を使用しながらでも安全に属性を宣言できます。

キャッシュしたプレフィックスは、デフォルトで5分間保持されます。属性にTTLを渡すと、Anthropicは1時間保持できます。

```php
#[CacheInstructions('1h')]
#[CacheToolDefinitions('1h')]
```

あるいは、トップレベルの`cache_control` [プロバイダオプション](#provider-options)を介して、Anthropicの自動キャッシュを有効にできます。これにより、リクエストの最後のブロックの後に単一のブレークポイントが配置されるため、会話が進むにつれてブレークポイントも前進し、各ターンは前のターンをキャッシュから読み取ります。両方のメカニズムを組み合わせることも可能です。

> [!WARNING]
> プロバイダはツール、指示、メッセージの順にプロンプトを構築するため、指示を1時間キャッシュするには、ツール定義も1時間キャッシュする必要があります。両者を混在させると、`InvalidArgumentException`を投げます。

<a name="human-tool-approval"></a>
## 人間によるツールの承認

> [!WARNING]
> ツールの承認には、実行を再開するときに、一時停止したターンの履歴が利用可能になっている必要があります。`RemembersConversations`トレイトを使用するような`Conversational`エージェントを使用するか、[`withMessages`メソッド](#conversation-context)を使用してアプリケーションのフロントエンドから履歴を提供する必要があります。どちらも行わないと、ツールが一時停止したときにエージェントは、`ApprovalNotResumableException`を投げます。

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

> [!IMPORTANT]
> 一時停止したターンは、一時停止した参加者ではなく、会話と保留中のツール呼び出しによって照合します。したがって、[完全な承認フロー](#complete-approval-flow)で示したように再開前に会話へのアクセスを承認するか、会話ストアの`conversationBelongsTo`メソッドを使用してアクセスを検証する必要があります。

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

ストリーミングやブロードキャスト中、一時停止を`tool_approval_request`イベントで表現します。[Vercel AI SDKストリームプロトコル](#stream-protocols)を使用している場合、承認リクエストと結果はプロトコルのネイティブなツール承認パーツを使用して発行され、Agent User Interactionプロトコルはこれらを中断として報告します。

いずれかのプロトコルを使用するクライアントは、残りの会話とともにその決定を投稿するため、[チャットリクエスト](#frontend-integration)をエージェントに直接渡せます。

```php
$chat = Vercel::chat($request);

return (new FileAssistant)
    ->continue($conversationId, as: $request->user())
    ->stream($chat)
    ->usingProtocol($chat->protocol());
```

一時停止したターンを再開すると、再開したステップはそのターンにマージされるため、各ターンは単一のアシスタントメッセージとして保存されます。レスポンスの`assistantMessageId`は一時停止したメッセージのIDが含まれ、そのメッセージの使用量には一時停止と再開の両方が含まれます。

キュー投入したエージェントの場合、結果のレスポンスを`then`コールバックに渡し、Laravelは`ToolApprovalRequested`イベントも発行します。

Laravelはモデルに継続を要求する前に、承認されたツールの結果を保存します。その後生成に失敗した場合、その承認はすでに解決済みです。同じ承認決定を再度送信する代わりに、通常のテキストプロンプトで会話を継続してください。

<a name="complete-approval-flow"></a>
### 完全な承認フロー

以下のルートは、新しいテキストプロンプトまたはチャット画面からの承認決定を受け取る、完全な承認フローを示しています。この例では、アプリケーションの`User`モデルが`HasConversations`トレイトを使用していることを前提としています。

```php
use App\Ai\Agents\FileAssistant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\Rule;
use Laravel\Ai\Approvals\Decision;
use Laravel\Ai\Approvals\Decisions;
use Laravel\Ai\Models\Conversation;

Route::post('/chat/{conversation}', function (Request $request, Conversation $conversation) {
    Gate::authorize('view', $conversation);

    $validated = $request->validate([
        'message' => ['nullable', 'string', 'required_without:decisions', 'prohibits:decisions'],
        'decisions' => ['nullable', 'array', 'required_without:message', 'prohibits:message'],
        'decisions.*.action' => ['required_with:decisions', Rule::in(['approve', 'reject'])],
        'decisions.*.result' => ['nullable', 'string'],
    ]);

    $prompt = isset($validated['decisions'])
        ? Decisions::from(collect($validated['decisions'])->map(
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

レスポンスステータスが`awaiting_approval`の場合、チャット画面は保留中の承認を描画し、各決定のキーとしてツール呼び出しIDを使用して、同じエンドポイントにユーザーの選択を送信する必要があります。それ以外の場合、画面は単純な`message`値を送信します。

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

プロバイダによっては、１回のリクエストで複数の画像を生成する場合があります。OpenAI、Azure、xAIは、`n`[プロバイダオプション](#provider-options)を受け付け、すべての画像を含んだレスポンスを返します。

```php
$response = Image::of('A donut sitting on the kitchen counter')
    ->withProviderOptions(['n' => 4])
    ->generate();

count($response);           // 4
$response->images;          // A collection of generated images...
$response->firstImage();    // The first generated image...
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

埋め込みを生成したら、通常は後でクエリするためにデータベースの`vector`カラムに保存します。Laravelは、`pgvector`拡張機能を介してPostgreSQLのベクトルカラムとMariaDBをネイティブにサポートしています。開始するには、マイグレーションで`vector`カラムを定義し、次元数を指定します。

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

Eloquentモデルでは、ベクトルカラムを`AsVector`を使用し、キャストしてください。

```php
use Illuminate\Database\Eloquent\Casts\AsVector;

protected function casts(): array
{
    return [
        'embedding' => AsVector::class,
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
> ベクトルクエリは現在、`pgvector`拡張機能を使用しているPostgreSQL接続とMariaDB11.7以降をサポートしています。

<a name="caching-embeddings"></a>
### 埋め込みのキャッシュ

埋め込み生成をキャッシュして、同一の入力に対する冗長なAPI呼び出しを回避できます。キャッシュを有効にするには、`ai.caching.embeddings.cache`設定オプションを`true`に設定してください。

```php
'caching' => [
    'embeddings' => [
        'cache' => true,
        'store' => env('CACHE_STORE', 'database'),
        'individually' => true,
        // ...
    ],
],
```

キャッシュが有効な場合、埋め込みを３０日間キャッシュします。キャッシュキーは、プロバイダ、モデル、次元数、および入力内容に基づいており、同一のリクエストはキャッシュされた結果を返し、異なる設定の場合は新しい埋め込みを生成することを保証します。

デフォルトでは、各入力の埋め込みを独自のキーでキャッシュするため、入力のセットや順序が変更された場合でも、後続リクエストは以前に検出した入力のキャッシュにヒットします。代わりに、入力セット全体を単一のキーでキャッシュするには、`ai.caching.embeddings.individually`設定オプションを`false`に設定してください。

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

`limit`メソッドを使用して返される結果の数を制限できます。また、`timeout`メソッドを使用してHTTPタイムアウトを秒単位で指定できます。（デフォルトは30秒）

```php
$response = Reranking::of($documents)
    ->limit(5)
    ->timeout(60)
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
    provider: Lab::Cohere,
    timeout: 60,
);
```

<a name="classification"></a>
## 等級付け

> [!WARNING]
> 等級付けは現在実験的導入中であり、そのAPIはAI SDKの将来のマイナーリリースで変更される可能性があります。

等級付けにより、指定した文字列やデータ配列に対して定義済みの質問セットを投げかけ、自由形式のテキストの代わりに、確率に裏付けられた型付け済みの回答を取得できます。これはルーティング、モデレーション、スコアリングに便利で、回答を閾値と比較したり、テスト内でアサーションを行ったりする場合に活用できます。

`Laravel\Ai\Classification`クラスを使用してコンテンツを等級付けします。各質問にはキーを付与し、そのキーを使用してレスポンスから対応する回答を取得します。

```php
use Laravel\Ai\Classification;
use Laravel\Ai\Classification\Boolean;
use Laravel\Ai\Classification\Choice;
use Laravel\Ai\Classification\Score;

$result = Classification::of($supportRequest)
    ->questions([
        'urgent' => new Boolean('Does this request need an immediate response?', [
            'true' => 'Explicitly time-sensitive',
            'false' => 'No urgency expressed',
        ]),
        'department' => new Choice('Which team should handle this request?', [
            'billing' => 'Payments, invoices, and refunds',
            'technical' => 'Bugs, outages, and integrations',
            'sales' => 'Pricing, plans, and upgrades',
        ]),
        'frustration' => new Score('How frustrated is the customer?', [
            'Calm',
            'Frustrated',
            'Very angry',
        ]),
    ])
    ->classify();
```

`Boolean`質問は、回答が"true"である確率を返します。`isTrue`メソッドを使用して、その確率が指定した閾値（デフォルトは `0.5`）を満たしているかどうかを判定できます。

```php
$result['urgent']->probability;             // 0.94
$result['urgent']->isTrue(threshold: 0.8);  // true
```

`Choice`質問は、指定した選択肢の1つと、各選択肢の確率を返します。`confidence`プロパティは、確率の全セットにわたってプロバイダがどの程度確実であるかを示し、プロバイダが測定できない場合は、`null`になります。

```php
$result['department']->choice;                      // 'technical'
$result['department']->probabilityOf('technical');  // 0.87
$result['department']->probabilities;               // ['billing' => 0.08, 'technical' => 0.87, 'sales' => 0.05]
$result['department']->confidence;                  // 0.82
```

`Score`質問は、提供された順序付きレベル内の位置を返します。`score`プロパティは確率加重され、２つのレベルの間に収まる可能性があります。一方、`level`メソッドと`label`メソッドは最も可能性の高いレベルを表します。

```php
$result['frustration']->score;          // 1.24, the probability-weighted level
$result['frustration']->level();        // 1, the most probable level
$result['frustration']->label();        // 'Frustrated'
$result['frustration']->normalized();   // 0.62, the score as a fraction of the highest level
$result['frustration']->probabilities;  // [0.12, 0.52, 0.36]
```

`Boolean`質問に与える条件、`Choice`質問に与える選択肢の説明、`Score`質問に与えるレベルは、単一の文では不十分な場合、それぞれ配列にできます。`Choice`質問には少なくとも２つの選択肢が必要であり、`Score`質問には少なくとも２つのレベルが必要です。

レスポンスは反復処理、カウント、配列としてのアクセスが可能です。さらに、`answer`メソッドを使用して単一の回答を取得できます。一方、`collect`メソッドはすべての回答を[コレクション](/docs/{{version}}/collections)として返します。

```php
$result->answer('urgent');
$result->collect();

$result->usage;
$result->meta->provider;
```

単一のはい／いいえの決定には、Laravelの`Stringable`クラスで利用できる`decide`メソッドを使用できます。これは完全なレスポンスの代わりに真偽値を返します。「はい」と「いいえ」の意味を説明し、回答が達する必要がある確率（デフォルトは `0.5`）を指定できます。

```php
use Illuminate\Support\Str;

if (Str::of($message)->decide('Is this spam?')) {
    // ...
}

$spam = Str::of($message)->decide('Is this spam?', criteria: [
    'true' => 'Unsolicited bulk mail.',
    'false' => 'A genuine message from a customer.',
], threshold: 0.9);
```

等級付けはデフォルトで、[TypeSafe](https://typesafe.ai)により実行します。アプリケーションの`config/ai.php`設定ファイル内の`default_for_classification`オプションを使用してこれを変更できます。分類時にプロバイダとモデルを指定することもできます。

```php
use Laravel\Ai\Enums\Lab;

$result = Classification::of($supportRequest)
    ->questions($questions)
    ->classify(Lab::OpenRouter, 'model-name');
```

`timeout`メソッドを使用してHTTPタイムアウトを秒単位で指定できます。（デフォルトは30秒）[プロバイダオプション](#provider-options)やカスタムヘッダも指定できます。

```php
$result = Classification::of($supportRequest)
    ->questions($questions)
    ->timeout(60)
    ->withProviderOptions(['temperature' => 0])
    ->classify();
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
    '添付されたセールスの文字起こしを分析して...',
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

Geminiストアにファイルを追加すると、呼び出しから制御が戻った時点でドキュメントを検索できるように、Laravelはインポートが完了するまで待機します。インポートが失敗したか、5分を超えた場合は、`Laravel\Ai\Exceptions\AiException`を投げるため、[キュー投入ジョブ](/docs/{{version}}/queues)からGeminiファイルを追加することをお勧めします。

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

<a name="usage"></a>
## 消費量

すべてのレスポンスは、プロバイダが報告したトークン数を含む、`usage`プロパティを含んでいます。入力数と出力数は合計であるため、キャッシュされたトークンや推論トークンとしてカウントされたトークンも、それらが属する合計に含まれます。

```php
$response = (new SalesCoach)->prompt('Analyze this sales transcript...');

$response->usage->inputTokens;
$response->usage->outputTokens;
$response->usage->totalTokens();
```

テキスト生成は `Laravel\Ai\Responses\Data\TextUsage`インスタンスを返し、これらの合計をさらに細分化します。プロバイダが報告しない場合、これらの各値は`0`ではなく`null`になります。

```php
$response->usage->cacheReadInputTokens; // プロンプトキャッシュから読み取った入力トークンのサブセット
$response->usage->cacheWriteInputTokens; // プロンプトキャッシュに書き込んだ入力トークンのサブセット
$response->usage->reasoningTokens; // 推論に使用した出力トークンのサブセット

$response->usage->uncachedInputTokens(); // キャッシュへの書き込みも読み取りも行わなかった入力トークン
```

キャッシュ読み取り、キャッシュ書き込み、キャッシュなし入力はそれぞれ異なる料金で請求されるため、入力の合計だけを使用するのではなく、これら３つのカウントを個別に価格算出する必要があります。

残りの機能は、各機能に固有のカウントを含む消費量オブジェクトを返します。

<div class="overflow-auto">

| 機能 | 消費量オブジェクト | 追加項目 |
|---|---|---|
| テキスト、等級付け | `TextUsage` | キャッシュ読み取り、キャッシュ書き込み、推論トークン |
| 画像 | `ImageUsage` | `imageInputTokens`、`imageOutputTokens` |
| 文字起こし | `TranscriptionUsage` | `audioSeconds`, 文字起こしした音声の長さ |
| リランク | `RerankingUsage` | `searchUnits`、一部のプロバイダがトークンの代わりに請求 |
| 音声、埋め込み | `Usage` | |

</div>

すべてのプロバイダがすべてのカウントを報告するわけではなく、プロバイダが報告しないカウントは`null`になります。

```php
use Laravel\Ai\Image;
use Laravel\Ai\Transcription;

Image::of('A donut sitting on the kitchen counter')->generate()->usage->imageOutputTokens;

Transcription::fromPath('/home/laravel/meeting.mp3')->generate()->usage->audioSeconds;
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

キュー投入済みの画像、音声、文字起こし、埋め込み生成をフェイクする場合、そのキュー投入済み生成に登録した`then`コールバックは、フェイクしたレスポンスで呼び出すため、コールバックが含むロジックをテストできます。これらのコールバックを呼び出したくない場合は、同様に`Queue::fake()`を使用してキューをフェイクできます。

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

さらに、推論を含むレスポンスをFakeすることもできます。Fakeは推論イベントを発行するため、ストリーミング実行時にも推論を報告します。

```php
use Laravel\Ai\Responses\AgentResponse;

SalesCoach::fake([
    AgentResponse::fakeWithReasoning('They asked about pricing.', 'Plans start at $10.'),
]);

$response = (new SalesCoach)->stream('What does it cost?');

foreach ($response as $event) {
    // ...
}

$response->reasoning; // 'They asked about pricing.'
```

> **注意：** 構造化出力を返すエージェントに対して`Agent::fake()`を呼び出し、かつ擬装出力を明示的に指定しなかった場合、Laravelはエージェントが定義している出力スキーマに一致する擬装データを自動的に生成します。

エージェントにプロンプトを送った後、受け取ったプロンプトについてアサートできます。

```php
use Laravel\Ai\Prompts\AgentPrompt;

SalesCoach::assertPrompted('これを分析して...');

SalesCoach::assertPrompted(function (AgentPrompt $prompt) {
    return $prompt->contains('分析');
});

SalesCoach::assertPromptedTimes(3);

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

<a name="testing-classification"></a>
### 等級付け

等級付けは、`Classification`クラスの`fake`メソッドを呼び出してFakeします。カスタムレスポンスを指定しない場合、Laravelは各質問の形式に一致する回答を自動的に生成します。

```php
use Laravel\Ai\Classification;
use Laravel\Ai\Prompts\ClassificationPrompt;
use Laravel\Ai\Responses\Data\BooleanAnswer;
use Laravel\Ai\Responses\Data\ChoiceAnswer;

// フェイク回答を自動生成
Classification::fake();

// 特定の質問に対する回答を指定
Classification::fake([
    [
        'urgent' => new BooleanAnswer(0.94),
        'department' => new ChoiceAnswer('technical', [
            'billing' => 0.08,
            'technical' => 0.87,
            'sales' => 0.05,
        ], confidence: 0.82),
    ],
]);

// プロンプトから回答を構築
Classification::fake(fn (ClassificationPrompt $prompt) => [
    'urgent' => new BooleanAnswer($prompt->contains('ASAP') ? 1.0 : 0.0),
]);
```

Fakeレスポンスから省略した質問にも生成済みの回答が届くため、テストでアサートを行う回答のみを指定するだけで済みます。

等級付け後、実行した操作についてアサートを行います。

```php
Classification::assertClassified(function (ClassificationPrompt $prompt) {
    return $prompt->contains('refund') && $prompt->asks('department');
});

Classification::assertNotClassified(
    fn (ClassificationPrompt $prompt) => $prompt->asks('sentiment')
);

Classification::assertNothingClassified();
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
        $file->mimeType() === 'text/plain'
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
- `AgentFailed`
- `AgentFailedOver`
- `AgentPrompted`
- `AgentStreamed`
- `AudioGenerated`
- `Classified`
- `Classifying`
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
- `ProviderFailedOver`
- `RemovingFileFromStore`
- `Reranked`
- `Reranking`
- `StartingStep`
- `StepCompleted`
- `StepFailed`
- `StoreCreated`
- `StoreDeleted`
- `StoringFile`
- `StreamingAgent`
- `ToolApprovalRequested`
- `ToolApprovalResolved`
- `ToolFailed`
- `ToolInvoked`
- `TranscriptionGenerated`

これらのイベントをリスニングして、AI SDKの使用情報をログに記録したり保存したりできます。
