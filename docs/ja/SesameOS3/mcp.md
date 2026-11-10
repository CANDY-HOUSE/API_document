# MCP 連携ガイド

::: warning 設計中・未公開
このページは公開インターフェースをレビューするための設計稿です。内容は変更される可能性があり、現時点では接続できません。次の項目は未確定のため、プレースホルダーで表記しています。

| プレースホルダー | 意味 |
| --- | --- |
| `<MCP_ENDPOINT>` | MCP エンドポイントの URL。OAuth のリソース識別子（`resource`）も兼ねます |
| `<SCOPE_READ>` | 読み取り権限の scope 名 |
| `<SCOPE_CONTROL>` | 操作権限の scope 名 |
:::

## 概要

[MCP（Model Context Protocol）](https://modelcontextprotocol.io/)を使うと、Claude や ChatGPT などリモート MCP コネクタに対応した AI アプリから、ご自身の Sesame デバイスを利用できます。

- デバイス一覧とデバイスの状態の確認
- 施錠・解錠
- 定時の施錠・解錠の作成・確認・キャンセル

接続時は CANDY HOUSE のログイン画面でログインし、アクセスを許可します。AI アプリはあなたとして、許可された権限の範囲内でのみ操作できます。AI アプリにパスワードが渡ることはありません。

## 接続情報

| 項目 | 内容 |
| --- | --- |
| エンドポイント | `<MCP_ENDPOINT>` |
| トランスポート | Streamable HTTP（`POST` のみ） |
| プロトコルバージョン | `2026-07-28`。2025 年版のクライアント（`2025-06-18`、`2025-11-25`）にも対応 |
| 状態 | ステートレス：セッション（`Mcp-Session-Id`）は発行せず、リクエストごとに独立して処理します |
| 認可 | OAuth 2.1。すべてのリクエストに `Authorization: Bearer <access token>` が必要です |
| レスポンス | `application/json`、または結果を 1 件だけ含む `text/event-stream`。クライアントは両方に対応する必要があります |

### リクエストヘッダー

| ヘッダー | 要件 |
| --- | --- |
| `Authorization` | `Bearer <access token>`。すべてのリクエストで必須。URL のクエリパラメータには入れないでください |
| `Content-Type` | `application/json` |
| `Accept` | `application/json` と `text/event-stream` の両方を列挙 |
| `MCP-Protocol-Version` | プロトコルバージョン（例：`2026-07-28`）。リクエストボディの `params._meta` 内の `io.modelcontextprotocol/protocolVersion` と一致させます |
| `Mcp-Method` | ボディの `method` と一致（`2026-07-28` では必須） |
| `Mcp-Name` | `params.name`（`tools/call`）または `params.uri`（`resources/read`）と一致（`2026-07-28` では、この 2 種類のリクエストで必須） |

ヘッダーとボディが一致しない場合や必須ヘッダーがない場合は、HTTP `400` と JSON-RPC エラー `-32020` を返します。

### 対応メソッド

| メソッド | 説明 |
| --- | --- |
| `server/discover` | サーバーが対応するプロトコルバージョン・機能・識別情報を取得（`2026-07-28`） |
| `tools/list` | ツールと、その入力・出力 schema の一覧 |
| `tools/call` | ツールの呼び出し |
| `resources/list` / `resources/read` | CANDY HOUSE のアフターサポート・ご購入に関するご案内（`policy://candyhouse/support-policy`、Markdown）の取得 |
| `initialize` / `notifications/initialized` | 2025 年版クライアントのハンドシェイク専用。通知には `202`（ボディなし）を返します |

- ツール一覧は固定です。サーバーは `listChanged: false` を宣言し、`subscriptions/listen` は提供しません。
- `2026-07-28` のリクエストは `initialize` を経由せず、各リクエストの `params._meta` にプロトコルバージョンとクライアント機能を含めます。
- `GET` と `DELETE` には `405` を返します。`Mcp-Session-Id` と `Last-Event-ID` ヘッダーは無視します。

### リクエスト例

`2026-07-28` で `device_status` を呼び出す例：

```http
POST <MCP_ENDPOINT>
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
Accept: application/json, text/event-stream
MCP-Protocol-Version: 2026-07-28
Mcp-Method: tools/call
Mcp-Name: device_status

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "device_status",
    "arguments": { "deviceId": "<DEVICE_ID>" },
    "_meta": {
      "io.modelcontextprotocol/protocolVersion": "2026-07-28",
      "io.modelcontextprotocol/clientInfo": { "name": "ExampleClient", "version": "1.0.0" },
      "io.modelcontextprotocol/clientCapabilities": {}
    }
  }
}
```

## AI アプリからの接続

一般的な手順は以下のとおりです。AI アプリごとの具体的な手順は公開時に追記します。

1. AI アプリでカスタム MCP コネクタを追加し、URL に `<MCP_ENDPOINT>` を入力します。
2. AI アプリが CANDY HOUSE のログイン画面を開きます。Sesame アプリで使っているアカウントでログインします。
3. 要求されたアクセス内容を確認して許可します。初回の接続では通常、読み取り権限（デバイスとスケジュールの確認）だけが付与されます。
4. 初めて AI に施錠・解錠やスケジュール作成を依頼したときに、AI アプリから操作権限の追加付与を求められます。
5. アクセスを取り消すには、AI アプリでそのコネクタを削除または切断します。

## 認可

このセクションは、独自に MCP クライアントを開発する方向けです。主要な AI アプリには以下のフローが実装済みです。

### 認可サーバーの検出

1. トークンなしで `<MCP_ENDPOINT>` にアクセスすると `401` が返り、`WWW-Authenticate` ヘッダーで保護リソースメタデータ（RFC 9728）の URL と必要な scope が示されます。

   ```http
   HTTP/1.1 401 Unauthorized
   WWW-Authenticate: Bearer resource_metadata="<保護リソースメタデータの URL>", scope="<SCOPE_READ>"
   ```

2. そのメタデータを取得し、`authorization_servers` から認可サーバーを特定したうえで、RFC 8414 / OpenID Connect Discovery で認可サーバーのメタデータを取得します。

### クライアント登録

- **Client ID Metadata Document（CIMD）** を基本とします。ご自身でホストするメタデータ文書の HTTPS URL を `client_id` として使います。文書には少なくとも `client_id`、`client_name`、`redirect_uris` が必要です。認可サーバーのメタデータでは `client_id_metadata_document_supported` が `true` です。
- その他の登録方式を提供するかどうかは、公開時にお知らせします。

### トークンの取得

- 認可コードフローと PKCE（`S256`）を使います。
- 認可リクエストとトークンリクエストの両方に `resource=<MCP_ENDPOINT>` を含めます（RFC 8707）。発行されたトークンはこのエンドポイントでのみ有効で、`aud` が一致しないトークンは拒否されます。
- 認可レスポンスに `iss` パラメータが含まれる場合は、認可サーバーの `issuer` と照合してから認可コードをトークンに交換します（RFC 9207）。

### 権限（scope）

| scope | 許可される操作 | 対応ツール |
| --- | --- | --- |
| `<SCOPE_READ>` | デバイスとスケジュールの確認 | `device_list`、`device_status`、`schedule_list` |
| `<SCOPE_CONTROL>` | デバイスの状態変更（スケジュール実行を含む） | `lock`、`unlock`、`schedule_create`、`schedule_cancel` |

2 つの scope は互いを含みません。確認だけが必要な場合は `<SCOPE_READ>` のみを要求してください。

### 権限不足時の追加認可

`<SCOPE_READ>` だけのトークンで操作系ツールを呼び出すと `403` が返ります。

```http
HTTP/1.1 403 Forbidden
WWW-Authenticate: Bearer error="insufficient_scope", scope="<SCOPE_CONTROL>", resource_metadata="<保護リソースメタデータの URL>"
```

クライアントは既存の scope と `scope` に示された scope を合わせて再認可し、新しいトークンで元のリクエストを再送してください。

### トークンの扱い

- すべてのリクエストに `Authorization: Bearer <access token>` を付けます。
- 無効・期限切れ・`aud` 不一致のトークンには `401` を返します。トークンを更新するか、再認可してください。
- このトークンは `<MCP_ENDPOINT>` 専用です。他のサービスに転送しないでください。本サービスも、他のサービス向けに発行されたトークンは受け付けません。

## ツール一覧

- `deviceId` は `device_list` から、`scheduleId` は `schedule_list` から取得した値を使ってください。独自に組み立てないでください。
- 操作できるのはご自身のアカウントのデバイスとスケジュールだけです。他人の ID を渡した場合は「見つからない」として扱い、何も実行しません。
- `tools/list` は常に 7 つのツールをすべて返します。scope はツール呼び出し時に確認します。

### デバイス

| ツール | パラメータ | 必要な scope | アノテーション | 説明 |
| --- | --- | --- | --- | --- |
| `device_list` | なし | `<SCOPE_READ>` | `readOnlyHint` | デバイス一覧。ゲストキーのみのデバイスは含みません |
| `device_status` | `deviceId` | `<SCOPE_READ>` | `readOnlyHint` | デバイスの状態：オンラインかどうか、施錠状態、電池残量、ファームウェアバージョン |
| `lock` | `deviceId` | `<SCOPE_CONTROL>` | `destructiveHint`、`idempotentHint`、`openWorldHint` | 施錠。錠前タイプのデバイスのみ |
| `unlock` | `deviceId` | `<SCOPE_CONTROL>` | `destructiveHint`、`idempotentHint`、`openWorldHint` | 解錠。錠前タイプのデバイスのみ |

- `lock` / `unlock` の成功は、指令が受け付けられ送信されたことを意味するだけで、デバイスが目的の状態になったことは保証しません。確認が必要な場合は `device_status` を呼び出すか、[Webhook](./webhook.md) で状態変化の通知を受け取ってください。
- 同じデバイスに同じ動作を短時間に再送すると、`ACTION_IN_PROGRESS` が返る場合があります。

### スケジュール

| ツール | パラメータ | 必要な scope | アノテーション | 説明 |
| --- | --- | --- | --- | --- |
| `schedule_create` | 下表参照 | `<SCOPE_CONTROL>` | `destructiveHint`、`openWorldHint` | 定時の施錠・解錠を作成 |
| `schedule_list` | なし | `<SCOPE_READ>` | `readOnlyHint` | スケジュール一覧と直近の実行結果 |
| `schedule_cancel` | `scheduleId` | `<SCOPE_CONTROL>` | `destructiveHint`、`idempotentHint` | スケジュールのキャンセル |

`schedule_create` のパラメータ：

| パラメータ | 型 | 必須条件 | 説明 |
| --- | --- | --- | --- |
| `action` | `lock` / `unlock` | 必須 | 指定時刻に実行する動作 |
| `deviceId` | string | 必須 | 対象デバイス。錠前タイプのデバイスに限ります |
| `timezone` | string | 必須 | IANA タイムゾーン名（例：`Asia/Tokyo`、`America/New_York`）。`atIso`・`hour`・`minute` はこのタイムゾーンで解釈します |
| `timingType` | `delay` / `at` / `recurring` | 必須 | 遅延して 1 回 / 指定時刻に 1 回 / 繰り返し |
| `delaySeconds` | integer | `timingType` が `delay` | 現在からの遅延秒数。60 ～ 31536000 |
| `atIso` | string | `timingType` が `at` | タイムゾーン接尾辞なしの ISO 8601 ローカル時刻（例：`2026-12-01T08:00:00`）。現在より後である必要があります。`Z` や `+09:00` は付けないでください |
| `pattern` | `daily` / `weekdays` / `weekends` / `weekly` / `monthly` | `timingType` が `recurring` | 繰り返しパターン |
| `hour` | integer | `timingType` が `recurring` | 0 ～ 23 |
| `minute` | integer | `timingType` が `recurring` | 0 ～ 59 |
| `dayOfWeek` | integer | `pattern` が `weekly` | 1 ～ 7（1 が月曜、7 が日曜） |
| `dayOfMonth` | integer | `pattern` が `monthly` | 1 ～ 31。その日がない月はスキップします |

- 指定時刻になるとサーバー側で実行します。実行前に、デバイスが引き続きあなたのものであることを再確認します。
- 実行結果は通知されません。`schedule_list` の `lastFireStatus` で確認してください。

## ツールの返却形式

ツールの結果は MCP の `CallToolResult` に従います。

| フィールド | 説明 |
| --- | --- |
| `resultType` | 常に `complete` |
| `content` | テキスト。成功時は `structuredContent` を JSON 文字列にしたもので、構造化結果を読まないクライアント向けです |
| `structuredContent` | 構造化された結果。成功時はそのツールの `outputSchema`（`tools/list` で取得可能）に従います。失敗時は `{ "reason", "message" }` です |
| `isError` | `true` は業務上の失敗（デバイスが見つからない、パラメータ不正など）を表します。AI は `reason` と `message` をもとに自ら修正して再試行できます |

成功例（`device_status`）：

```json
{
  "resultType": "complete",
  "content": [{ "type": "text", "text": "{\"deviceId\":\"<DEVICE_ID>\", ...}" }],
  "structuredContent": {
    "deviceId": "<DEVICE_ID>",
    "deviceName": "玄関",
    "deviceModel": "sesame_5",
    "online": true,
    "lockState": "locked",
    "batteryPercent": 82,
    "currentFirmwareVersion": "<VERSION>",
    "latestFirmwareVersion": "<VERSION>"
  },
  "isError": false
}
```

失敗例：

```json
{
  "resultType": "complete",
  "content": [{ "type": "text", "text": "Device not found. Call device_list to get a valid deviceId." }],
  "structuredContent": {
    "reason": "DEVICE_NOT_FOUND",
    "message": "Device not found. Call device_list to get a valid deviceId."
  },
  "isError": true
}
```

成功時の `structuredContent` の主なフィールド：

| ツール | 主なフィールド |
| --- | --- |
| `device_list` | `devices[]`：`deviceId`、`deviceName`、`deviceModel` |
| `device_status` | `deviceId`、`deviceName`、`deviceModel`、`online`、`lockState`、`batteryPercent`、`currentFirmwareVersion`、`latestFirmwareVersion` |
| `lock` / `unlock` | `deviceId`、`deviceName`、`action`、`accepted` |
| `schedule_create` | `scheduleId`、`nextFireAt`（時差付き ISO 8601）、`timezone` |
| `schedule_list` | `schedules[]`：`scheduleId`、`action`、`deviceName`、`timingType`、`timezone`、`state`、`nextFireAt`、`lastFiredAt`、`lastFireStatus`、`fireCount` |
| `schedule_cancel` | `scheduleId`、`state` |

`lockState` の値：`locked` / `unlocked` / `moved`。[Webhook](./webhook.md) の `CHSesame2Status` と同じです。

`state` の値：`PENDING`（1 回限りのスケジュールが実行待ち）、`ACTIVE`（繰り返しスケジュールが有効）、`COMPLETED`・`FAILED`（1 回限りのスケジュールが実行済み、成功 / 失敗）、`CANCELLED`。`lastFireStatus` の値：`success`、`failure`。未実行の場合は空です。

`reason` の値：

| 値 | 意味 |
| --- | --- |
| `INVALID_ARGUMENT` | パラメータが不正（必須項目の欠落、無効なタイムゾーン名、`atIso` が過去の時刻など） |
| `DEVICE_NOT_FOUND` | デバイスが見つからない、あなたのデバイスではない、または錠前タイプではない |
| `ACTION_IN_PROGRESS` | 同じデバイスの同じ動作を処理中 |
| `SCHEDULE_NOT_FOUND` | スケジュールが見つからない、またはあなたのスケジュールではない |
| `SCHEDULE_LIMIT_EXCEEDED` | 有効なスケジュール数が上限に達している |
| `UPSTREAM_ERROR` | 下流サービスの呼び出しに失敗。しばらくしてから再試行してください |
| `INTERNAL_ERROR` | その他のサーバーエラー |

## エラー処理

### HTTP ステータスコード

| ステータス | 発生する状況 | 対処 |
| --- | --- | --- |
| `400` | ヘッダーとボディの不一致、または必須ヘッダーの欠落（`-32020`）、必要なクライアント機能の欠落（`-32021`）、非対応のプロトコルバージョン（`-32022`。対応バージョンをレスポンスに列挙）、ボディが正しい JSON-RPC メッセージではない | リクエストを修正。バージョン非対応の場合は列挙されたバージョンを使用 |
| `401` | トークンがない、またはトークンが無効・期限切れ・`aud` 不一致 | `WWW-Authenticate` に従って再認可するか、トークンを更新 |
| `403` | scope 不足（`error="insufficient_scope"`）、または `Origin` ヘッダーが許可されていない | [追加認可](#権限不足時の追加認可)で scope を追加 |
| `404` | メソッドが存在しない（JSON-RPC `-32601`） | `method` を確認 |
| `405` | `GET`・`DELETE` など `POST` 以外のメソッド | `POST` のみを使用 |
| `429` | リクエストが多すぎる（入口のレート制限、またはアカウント単位の制限） | しばらくしてから再試行。`Retry-After` がある場合はその時間だけ待つ |

### JSON-RPC エラーコード

| `error.code` | 意味 |
| --- | --- |
| `-32700` | リクエストボディが正しい JSON ではない |
| `-32600` | 正しい JSON-RPC リクエストではない |
| `-32601` | メソッドが存在しない |
| `-32602` | パラメータが不正（ツールやリソースが存在しないなど） |
| `-32603` | サーバー内部エラー |
| `-32020` | `HeaderMismatch`：ヘッダーとボディの不一致、または必須ヘッダーの欠落 |
| `-32021` | `MissingRequiredClientCapability`：必要なクライアント機能がない |
| `-32022` | `UnsupportedProtocolVersion`：非対応のプロトコルバージョン |

ツール実行中の業務上の失敗には JSON-RPC エラーを使わず、`isError: true` のツール結果を返します。[ツールの返却形式](#ツールの返却形式)を参照してください。

## 利用制限

- アクセスできるのは、認可したアカウント自身のデバイスとスケジュールだけです。ゲストキーのみのデバイスは含みません。
- リクエスト頻度には上限があります（入口単位・アカウント単位）。具体的な値は公開時にお知らせします。超えた場合は `429` を返します。
- アカウントごとの有効なスケジュール数には上限があります。具体的な値は公開時にお知らせします。
- スケジュールの実行結果は通知されません。`schedule_list` で確認してください。
- ツール一覧の変更通知は提供しません。
- 次の機能はこのエンドポイントでは提供しません：ファームウェア更新、ヘルプセンター検索、グループ関連の操作。
