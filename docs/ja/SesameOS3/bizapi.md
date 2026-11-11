---
title: WebSocket API
---
# WebSocket API

WebSocket API は、[Biz3（biz.candyhouse.co）](https://biz.candyhouse.co/) 管理コンソールがクラウドと通信するためのインターフェースです。デバイス管理、デバイス操作、メンバーと権限、入退室認証データ（カード / パスコード）、開発者設定などをこのインターフェースで行います。

::: info 説明
本ドキュメントは [Biz3 のソースコード](https://github.com/CANDY-HOUSE/biz.candyhouse.co)（`src/api`、`src/websocket`）をもとに作成しています。フィールドはクライアントが実際に送信・参照する内容に基づきます。サーバーはより多くのフィールドを返す場合があります。インターフェースは Biz3 の更新に伴い変わります。
:::

## 接続

| 項目 | 内容 |
| --- | --- |
| URL | `wss://82q6nuplv0.execute-api.ap-northeast-1.amazonaws.com/public` |
| プロトコル | WebSocket（JSON テキストメッセージ） |

接続時にトークンをクエリパラメータで渡します：

```text
wss://82q6nuplv0.execute-api.ap-northeast-1.amazonaws.com/public?token=<JWT>&lang=<言語>
```

| パラメータ | 説明 |
| --- | --- |
| `token` | 必須。ログインユーザーの Cognito ID トークン（JWT）。URL エンコードが必要 |
| `lang` | 表示言語（`ja`、`en`、`zh-CN`、`zh-TW` など）。サーバーからのメッセージはこの言語で返されます |

## 認証

CANDY HOUSE アカウントで Amazon Cognito（ユーザープール）にサインインし、取得した **ID トークン（JWT）** を `token` として接続します。JWT の `sub` がアカウント ID（Biz の `subUUID`）です。トークンの有効期限が切れたら更新して再接続します。

## メッセージ形式

### リクエスト

すべてのリクエストは 1 つの JSON メッセージです。`action` で API の種類、`op` で操作を指定し、残りはパラメータです：

```json
{
  "action": "biz3ManageDevice",
  "op": "getDeviceStatus",
  "deviceUUID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

### レスポンス

サーバーは同じ `action`（および `op`）で結果を返します：

```json
{
  "action": "biz3ManageDevice",
  "op": "getDeviceStatus",
  "success": true,
  "data": {}
}
```

| フィールド | 説明 |
| --- | --- |
| `action` / `op` | リクエストと同じ。リクエストとの対応付けに使用 |
| `success` | 成功したかどうか |
| `data` | 返却データ。構造は各 API を参照 |
| `message` | 失敗時のエラーメッセージ（例：デバイス数の上限に達した場合は `Limit Exceeded`） |
| `code` | 一部の API が返すエラーコード（例：赤外線リモコン API の `406` はデータなし） |
| `reqContext` | サーバーが返すリクエストパラメータ（例：リクエストの `name`、`deviceUUID`）。レスポンスとリクエストの対応付けに使用できます |

メッセージにリクエスト ID はありません。同じ `action` + `op` のレスポンスは送信順に対応します。サーバーから能動的に通知されるメッセージもあります（例：デバイス状態の変化）。

## ハートビートと再接続

- 5 分ごとにハートビート `{"action": "biz3KeepAlive"}` を送信します。応答には `connectionId` が含まれます。3 秒以内に応答がなければ接続が無効になったとみなし、再接続します。
- 5 秒以内に接続が確立しない場合はタイムアウトとします。切断後は 1～10 秒のバックオフで再接続し、何度も失敗する場合はまずトークンの有効期限を確認します。
- 切断中に送信するメッセージはキューに入れ、再接続後に送信できます。アカウントを切り替えた後は、前のアカウントのメッセージを再送しないでください。

## API 一覧

| 分類 | action |
| --- | --- |
| [デバイスと履歴](./bizapi_devices.md) | [`biz3ManageDevice`](./bizapi_devices.md#biz3managedevice)、[`biz3GetDeviceHistory`](./bizapi_devices.md#biz3getdevicehistory)、[`biz3GetDeviceBatteryRecord`](./bizapi_devices.md#biz3getdevicebatteryrecord)、[`biz3GetDeviceEmployeeKeys`](./bizapi_devices.md#biz3getdeviceemployeekeys) |
| [デバイス操作](./bizapi_control.md) | [`biz3OperateIoT`](./bizapi_control.md#biz3operateiot)、[`biz3TriggerLocker`](./bizapi_control.md#biz3triggerlocker)、[`biz3InvokeWebAPIs`](./bizapi_control.md#biz3invokewebapis)、[`biz3Schedule`](./bizapi_control.md#biz3schedule)、[`biz3IRRemote`](./bizapi_control.md#biz3irremote)、[`biz3Face3Qr`](./bizapi_control.md#biz3face3qr) |
| [メンバーと権限](./bizapi_members.md) | [`biz3GetLoginUser`](./bizapi_members.md#biz3getloginuser)、[`biz3ManageCompany`](./bizapi_members.md#biz3managecompany)、[`biz3ManageEmployee`](./bizapi_members.md#biz3manageemployee)、[`biz3ManageEmployeeGroup`](./bizapi_members.md#biz3manageemployeegroup)、[`biz3ManageDeviceGroup`](./bizapi_members.md#biz3managedevicegroup)、[`biz3ManageEmployeeDevice`](./bizapi_members.md#biz3manageemployeedevice)、[`biz3ManageRole`](./bizapi_members.md#biz3managerole)、[`biz3ManageAccessCtlAuthData`](./bizapi_members.md#biz3manageaccessctlauthdata)|
