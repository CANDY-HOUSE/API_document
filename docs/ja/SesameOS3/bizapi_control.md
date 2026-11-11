---
title: デバイス操作
---
# デバイス操作

接続方法、メッセージ形式、共通のレスポンスフィールドは [WebSocket API](./bizapi.md) を参照してください。

**API 目次**

| action | 操作 |
| --- | --- |
| [`biz3OperateIoT`](#biz3operateiot) | [cmd](#biz3operateiot-cmd)、[&lt;cmdCode number> (Touch Pro)](#biz3operateiot-cmdcode-number-touch-pro) |
| [`biz3TriggerLocker`](#biz3triggerlocker) | [pubDeviceStateChange (server push)](#biz3triggerlocker-pubdevicestatechange-server-push)、[pubUserDeviceChange (server push)](#biz3triggerlocker-pubuserdevicechange-server-push) |
| [`biz3InvokeWebAPIs`](#biz3invokewebapis) | [webapi_ssm_shadow_get](#biz3invokewebapis-webapi-ssm-shadow-get)、[webapi_history_get](#biz3invokewebapis-webapi-history-get)、[webapi_cmd_send](#biz3invokewebapis-webapi-cmd-send) |
| [`biz3Schedule`](#biz3schedule) | [getScheduleList](#biz3schedule-getschedulelist)、[cancelSchedule](#biz3schedule-cancelschedule) |
| [`biz3IRRemote`](#biz3irremote) | [getRemoteList](#biz3irremote-getremotelist)、[getRemoteListVersion](#biz3irremote-getremotelistversion)、[searchRemoteList](#biz3irremote-searchremotelist)、[sendIR](#biz3irremote-sendir)、[updateRemoteState](#biz3irremote-updateremotestate)、[addIRRemote](#biz3irremote-addirremote)、[deleteIRRemote](#biz3irremote-deleteirremote)、[duplicateIRRemote](#biz3irremote-duplicateirremote)、[updateRemoteAlias](#biz3irremote-updateremotealias)、[setRemoteKeyOrder](#biz3irremote-setremotekeyorder)、[getRemoteKeyOrder](#biz3irremote-getremotekeyorder)、[getIRMode](#biz3irremote-getirmode)、[setIRMode](#biz3irremote-setirmode)、[subscribeIRMode](#biz3irremote-subscribeirmode)、[subscribeIRModeRsp (server push)](#biz3irremote-subscribeirmodersp-server-push)、[subscribeIRData](#biz3irremote-subscribeirdata)、[subscribeIRDataRsp (server push)](#biz3irremote-subscribeirdatarsp-server-push)、[unsubscribeIRMode](#biz3irremote-unsubscribeirmode)、[unsubscribeIRData](#biz3irremote-unsubscribeirdata)、[matchRemote](#biz3irremote-matchremote)、[getIRCodes](#biz3irremote-getircodes)、[addIRCode](#biz3irremote-addircode)、[updateIRCode](#biz3irremote-updateircode)、[deleteIRCode](#biz3irremote-deleteircode)、[addRemoteToMatter](#biz3irremote-addremotetomatter) |
| [`biz3Face3Qr`](#biz3face3qr) | [command](#biz3face3qr-command)、[list](#biz3face3qr-list)、[live](#biz3face3qr-live)、[viewer](#biz3face3qr-viewer) |

## biz3OperateIoT {#biz3operateiot}

クラウド経由でデバイスの IoT topic（Hub3 'wm2…cmd' または Touch Pro 'stp…cmd'）へバイナリコマンドを中継し、デバイスの報告は同じ action でプッシュされる。

### cmd {#biz3operateiot-cmd}

Hub3（または Hub3 経由のデバイス）へバイナリ IoT コマンドを送る（ファーム更新、LED 輝度、Sesame 追加/削除、Matter ペアリング、リレー開閉、WiFi SSID 消去）。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3OperateIoT' |
| `op` | `string` | はい | 固定値 'cmd' |
| `topic` | `string` | はい | 'wm2' + hub3TopicId(hub3_id) + 'cmd'。hub3TopicId：UUID が '00000000-055A-FD81-0D00-'（大文字小文字無視）で始まる旧 Hub3 は末尾セグメント（MAC）、Hub3 Pro は UUID 全体。hub3_id 省略時は device_id |
| `payload` | `string (base64)` | はい | base64( sign[4B] ‖ cmd[1B] ‖ UTF-8(device_id) ‖ 追加データ )。sign は Cmac.cmacTime(secretKey) の 16 進 8 文字を 4 バイト化（biz3TriggerLocker.sign と同じアルゴリズム）。cmd 別追加データ：101/103（Sesame 追加/削除）= sesameId[16B] ‖ ssmSecKa[16B、鍵なしは 0×16] ‖ nickName 長[1B] ‖ nickName UTF-8 ‖ productType[1B] ‖ matterProductType[1B]；92（LED）= op[1B: 1=set, 2=get] ‖ duty[1B 0-255]；208（リレー）= relayId[1B: 1/2] ‖ action[1B: 0=OFF, 1=ON]；3・137・153・210 は追加なし |

```json
{
  "action": "biz3OperateIoT",
  "op": "cmd",
  "topic": "wm2xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxcmd",
  "payload": "<base64(sign|cmd|device_id|extra)>"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `action` | `string` | 'biz3OperateIoT' |
| `op` | `number \| string` | リクエストと同じコマンドコード。クライアントは op ごとに登録されたコールバック（registerIotCallback）へ振り分ける |
| `UUID` | `string (optional)` | 報告元デバイスの UUID。touch_id より優先 |
| `touch_id` | `string (optional)` | UUID が無い場合のデバイス識別子 |
| `data` | `object (optional)` | デバイスからの報告データ。存在すればコールバック第 2 引数、無ければメッセージ全体を渡す |
| `data.progress` | `number (cmd 3)` | DFU 進捗（負値は接続/開始などの段階、完了/中断の値を含む） |
| `data.versionTag` | `string (cmd 3)` | 更新完了後の新ファームウェアバージョン |
| `data.UUID` | `string (cmd 3)` | 進捗を報告したデバイスの UUID |
| `data.ledDuty` | `number 0-255 (cmd 92)` | 現在の LED デューティ。クライアントで % に換算 |
| `data.qrCode` | `string (cmd 137)` | Matter ペアリング QR コード内容 |
| `data.manualCode` | `string (cmd 137)` | Matter 手動ペアリングコード |
| `data.statusCode` | `number (cmd 153)` | ペアリングウィンドウを開いた結果。0 = 成功 |

::: info 補足
cmd の値（constants/cmdCode.js）：3 ssmOSUpdate、92 HUB3_ITEM_CODE_LED_DUTY、101 SSM3_ITEM_ADD_SESAME、103 SSM3_ITEM_REMOVE_SESAME、137 HUB3_MATTER_PAIRING_CODE、153 HUB3_MATTER_PAIRING_WINDOW、208 HUB3_ITEM_CODE_RELAY_SWITCH、210 HUB3_ITEM_CODE_CLEAR_WIFI_SSID。コメント：connectionId はクラウド側で自動付与され、クライアントは payload に入れない。コメント：ファームは固定構造で長さを検証するため、Sesame 鍵が無い場合は 0×16 バイトで埋めないとコマンドが黙って破棄される。応答の op はデバイスが返すコマンドコード（数値）で、コード単位でコールバック登録する。101/103 の data は呼び出し元へ素通しで、個別フィールドは読まない。アプリ埋め込み（isAppHome）時は切断中の再送キューに入れない。
:::

### &lt;cmdCode number> (Touch Pro) {#biz3operateiot-cmdcode-number-touch-pro}

Sesame Touch Pro（認証機器）へカード・パスコード関連のバイナリコマンドを送る（取得、モード切替、追加、削除、名称変更、一括アップロード/削除）。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3OperateIoT' |
| `op` | `number` | はい | コマンドコード（payload 先頭バイトと同じ）：109 カード取得、125 パスコード取得、114/130 カード/パスコードモード設定、140 カード追加、138 パスコード追加、108 カード削除、124 パスコード削除、107/123 カード/パスコード名称変更、137 パスコード値変更、182/184 カード/パスコード一括追加、183/185 カード/パスコード一括削除 |
| `topic` | `string` | はい | 'stp' + 認証デバイス UUID + 'cmd' |
| `payload` | `string (base64)` | はい | 先頭バイトはコード。109/125：コードのみ。114/130：[code, mode]、mode 0=認証 1=登録。140/138：41 バイト [code, 0xF0(USED), 種別(カード 0x80=IoT 追加 / パスコード 0x00), idLen, id を 16B に 0 埋め, nameUUIDLen(16), nameUUID 16B, 末尾 0×4]。108/124：[code, id バイト]。107/123：[code, idLen, id, 新 nameUUID 16B]。137：[code, 旧値長, 旧値, 新値]。182/184：分割 [code, offset 下位, offset 上位, total 下位, total 上位, データ...]、1 パケット最大 4910 バイト、データは (idLen, id, nameUUIDLen, nameUUID) の繰り返し。183/185：[code, (len, id)×N] |

```json
{
  "action": "biz3OperateIoT",
  "op": 109,
  "topic": "stpxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxcmd",
  "payload": "bQ=="
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `action` | `string` | 'biz3OperateIoT' |
| `op` | `number \| string` | リクエストと同じコマンドコード。クライアントは op ごとに登録されたコールバック（registerIotCallback）へ振り分ける |
| `UUID` | `string (optional)` | 報告元デバイスの UUID。touch_id より優先 |
| `touch_id` | `string (optional)` | UUID が無い場合のデバイス識別子 |
| `data` | `object (optional)` | デバイスからの報告データ。存在すればコールバック第 2 引数、無ければメッセージ全体を渡す |
| `data.status` | `string (182/184) \| any (114)` | 一括アップロード：'Ok' 完了、'Pending' 待機、それ以外の 'N/...' は N-1 バイト目から再送。114 では data.op と共にカード登録 UI に渡す |
| `data.c` | `string (hex, 107)` | カード情報 16 進文字列。parseHexStrToCardInfo で cardID などを解析 |
| `data.p` | `string (hex, 123)` | パスコード情報 16 進文字列。parseHexStrToPasscodeInfo で解析 |
| `data.stpUUID` | `string (110/126 notify)` | カード/パスコード変更通知のデバイス UUID。再取得をトリガー |
| `data.reqContext` | `object {topic, payload} (183/185)` | 元リクエストの文脈。topic からデバイス ID、payload から削除 ID 一覧を取り出す |
| `data.wifi_state / cards_num / fingerprints_num / keyboards_num` | `any / number (op 81 push)` | 機械状態プッシュ（SSM2_ITEM_CODE_MECH_STATUS）：WiFi 状態とカード/指紋/パスコード数。数が変わると再取得 |

::: info 補足
cmdCode 137 は HUB3_MATTER_PAIRING_CODE と STP_ITEM_CODE_PASSCODE_CHANGE_VALUE が共用し、コールバックは数値 op でグローバル登録されるため衝突しうる。140/138 の nameUUID はクライアントでランダム生成。109/125 の結果はこのハンドラでは読まない（一覧は別 action で取得）。名称変更（107/123）は 15 秒以内に報告が無いとエラー表示。
:::

## biz3TriggerLocker {#biz3triggerlocker}

Sesame 錠/Bot に施錠・解錠・トグル・Bot 動作を実行（時刻署名と履歴タグ付き）。デバイス状態の変化は同じ action でプッシュされる。

### `biz3TriggerLocker` {#biz3triggerlocker-request}

クラウド経由で Sesame デバイスへ施解錠/Bot コマンドを送る。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3TriggerLocker' |
| `cmd` | `number` | いいえ | コマンドコード、既定 88。82 = 施錠、83 = 解錠、88 = トグル、89 = Bot クリック、170 + n = Bot スクリプト n 実行 |
| `sign` | `string (8 hex chars)` | はい | 小文字 16 進 8 文字。アルゴリズム Cmac.cmacTime(secretKey)：現在の Unix 秒を uint32 リトルエンディアン 4 バイトにし、0 バイト目（最下位）を捨てて 1〜3 バイト目の 3 バイトをメッセージとする。デバイス secretKey（16 進文字列→16 バイト、AES-128）で AES-CMAC（RFC 4493 のサブキー/パディング）を計算し、先頭 4 バイトを 16 進化。 |
| `history` | `string (base64)` | はい | base64( hex(prefix + ハイフン除去 uuid) )。prefix：PC ブラウザは '000c'（BIZ 種別）、アプリ埋め込み時は Android '0010'・iOS '0011'（WiFi アイコン種別）。uuid の優先順：envId（バックエンド生成、localStorage 'web_env_id' にキャッシュ）→ subUUID → 'ffffffff-ffff-ffff-ffff-ffffffffffff'。 |
| `device_id` | `string (UUID)` | はい | 対象 Sesame デバイス UUID |

```json
{
  "action": "biz3TriggerLocker",
  "cmd": 88,
  "sign": "xxxxxxxx",
  "history": "<base64(000c + uuid hex)>",
  "device_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**レスポンス**

クライアントはレスポンスの特定フィールドを参照せず、`success` のみで結果を判定します。

::: info 補足
コメント：envId/subUUID が取得できない（ゲスト）場合はプロトコル上オール ff を使い、クラウドでは未ログインユーザーとして表示される。このリクエストへの直接応答は読まず、状態更新は pubDeviceStateChange / pubUserDeviceChange のプッシュで届く。アプリ埋め込み（isAppHome）時は切断中の再送キューに入れない。呼び出し元：デバイススイッチ（VIotSwitch）、一括解錠/施錠（83/82）、Bot スクリプト（170+n）、アプリホスト要求（operation lock/unlock/toggle → 82/83/88、Bot 89、スクリプト Bot は 170+既定スクリプト actionIndex）。注意：クライアント引数名は sescretKey と綴られている。
:::

### pubDeviceStateChange (server push) {#biz3triggerlocker-pubdevicestatechange-server-push}

サーバープッシュ：デバイス状態の変化。

**リクエスト**

追加パラメータはありません。

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `op` | `string` | 'pubDeviceStateChange' |
| `data` | `object {deviceUUID, stateInfo?, ...}` | deviceUUID でローカルのデバイス一覧にマージ。stateInfo は浅いマージ、その他は上書き |

::: info 補足
stateInfo の具体的なフィールドはサーバー定義で、ハンドラは個別に読まない。
:::

### pubUserDeviceChange (server push) {#biz3triggerlocker-pubuserdevicechange-server-push}

サーバープッシュ：ユーザーのデバイス一覧が変化。クライアントは会社デバイスを再取得。

**リクエスト**

追加パラメータはありません。

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `op` | `string` | 'pubUserDeviceChange' |

::: info 補足
data は読まない。
:::

## biz3InvokeWebAPIs {#biz3invokewebapis}

開発者ページ：会社の API キーで Sesame Web API を代理呼び出し（状態取得・履歴取得・コマンド送信）。

### webapi_ssm_shadow_get {#biz3invokewebapis-webapi-ssm-shadow-get}

デバイスの現在状態（shadow）を取得。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3InvokeWebAPIs' |
| `apiKeyId` | `string` | はい | 会社の開発者 API キー ID |
| `op` | `string` | はい | 'webapi_ssm_shadow_get' |
| `query` | `object {device_id: string}` | はい | 対象デバイス UUID |
| `body` | `object` | はい | 常に {} |

```json
{
  "action": "biz3InvokeWebAPIs",
  "op": "webapi_ssm_shadow_get",
  "apiKeyId": "xxxxxxxx",
  "query": {
    "device_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  },
  "body": {}
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `op` | `string` | リクエストと同じ。コールバック照合に使用 |
| `data` | `any` | Web API の生結果。開発者ページで JSON のまま表示 |

::: info 補足
biz3InvokeWebAPIs の応答を受けるたびに gStripe.
:::

### webapi_history_get {#biz3invokewebapis-webapi-history-get}

デバイス履歴を取得（0 ページ目、5 件）。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3InvokeWebAPIs' |
| `apiKeyId` | `string` | はい | 会社の開発者 API キー ID |
| `op` | `string` | はい | 'webapi_history_get' |
| `query` | `object {device_id: string, page: number, lg: number, isBiz: boolean}` | はい | device_id デバイス UUID；page ページ番号（常に 0）；lg 件数（常に 5）；isBiz 常に true |
| `body` | `object` | はい | 常に {} |

```json
{
  "action": "biz3InvokeWebAPIs",
  "op": "webapi_history_get",
  "apiKeyId": "xxxxxxxx",
  "query": {
    "device_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "page": 0,
    "lg": 5,
    "isBiz": true
  },
  "body": {}
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `op` | `string` | リクエストと同じ。コールバック照合に使用 |
| `data` | `any` | Web API の生結果。開発者ページで JSON のまま表示 |

::: info 補足
biz3InvokeWebAPIs の応答を受けるたびに gStripe.
:::

### webapi_cmd_send {#biz3invokewebapis-webapi-cmd-send}

Web API 経由でデバイスへ施解錠/Bot コマンドを送信。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3InvokeWebAPIs' |
| `apiKeyId` | `string` | はい | 会社の開発者 API キー ID |
| `op` | `string` | はい | 'webapi_cmd_send' |
| `query` | `undefined` | いいえ | 送信しない |
| `body` | `object {cmd: number, history: string, sign: string, device_id: string}` | はい | cmd：開発者ページで機種別に 88（トグル、既定）、89（bot_2）、83（ssm_bike2 解錠）；sign は biz3TriggerLocker と同じ AES-CMAC 時刻署名；history = base64(hex('000c' + ハイフン除去 subUUID))；device_id デバイス UUID |

```json
{
  "action": "biz3InvokeWebAPIs",
  "op": "webapi_cmd_send",
  "apiKeyId": "xxxxxxxx",
  "body": {
    "cmd": 88,
    "history": "<base64>",
    "sign": "xxxxxxxx",
    "device_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `op` | `string` | リクエストと同じ。コールバック照合に使用 |
| `data` | `any` | Web API の生結果。開発者ページで JSON のまま表示 |

::: info 補足
biz3InvokeWebAPIs の応答を受けるたびに gStripe.biz3TriggerLocker と異なり、ここでの history は subUUID のみで envId やオール ff へのフォールバックは無い。
:::

## biz3Schedule {#biz3schedule}

現在のユーザーの予約操作（時刻指定の施錠・解錠・ファーム更新など）の一覧取得と取消。

### getScheduleList {#biz3schedule-getschedulelist}

現在のユーザーの予約一覧を取得。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3Schedule' |
| `op` | `string` | はい | 'getScheduleList' |
| `userId` | `string (UUID)` | はい | 現在のユーザー subUUID。空なら送信しない |

```json
{
  "action": "biz3Schedule",
  "op": "getScheduleList",
  "userId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `data` | `array of {scheduleId, deviceName, action, displayTime}` | 予約の配列。scheduleId、deviceName、action（lock・unlock・upgrade_firmware など。その他はキャメルケース/アンダースコアで分割表示）、displayTime（'YYYY-MM-DD HH:mm'・'HH:mm' または任意の文字列） |

::: info 補足
data.length を count として保存。
:::

### cancelSchedule {#biz3schedule-cancelschedule}

予約を 1 件取り消す。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3Schedule' |
| `op` | `string` | はい | 'cancelSchedule' |
| `userId` | `string (UUID)` | はい | 現在のユーザー subUUID。空なら送信しない |
| `scheduleId` | `string` | はい | 取り消す予約の ID |

```json
{
  "action": "biz3Schedule",
  "op": "cancelSchedule",
  "userId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "scheduleId": "xxxxxxxx"
}
```

**レスポンス**

クライアントはレスポンスの特定フィールドを参照せず、`success` のみで結果を判定します。

::: info 補足
ハンドラは cancelSchedule 応答のフィールドを読まない。ページは該当項目を取消中（スピナー）にするが、その後の一覧からの削除方法はコードから不明（サーバーが getScheduleList を再プッシュする可能性）。
:::

## biz3IRRemote {#biz3irremote}

Hub3 赤外線リモコン：コードライブラリ検索、赤外線発射、リモコン・学習キーの CRUD、学習モードとデータ購読、Matter ブリッジ。

### getRemoteList {#biz3irremote-getremotelist}

赤外線種別ごとのリモコン機種一覧をページ単位で取得。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3IRRemote' |
| `op` | `string` | はい | 'getRemoteList' |
| `type` | `string \| number` | はい | 赤外線種別：0x2000 テレビ、0x8000 扇風機、0xC000 エアコン、0xE000 照明、0xFE00 自己学習 |
| `companyID` | `string` | はい | 現在の会社 ID（customerInfo.companyID） |
| `pagination` | `object {page: number, pageSize: number}` | はい | ページ（1 始まり）とページサイズ（既定 200） |

```json
{
  "action": "biz3IRRemote",
  "op": "getRemoteList",
  "type": "8192",
  "companyID": "xxxxxxxx",
  "pagination": {
    "page": 1,
    "pageSize": 200
  }
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否。失敗かつ code≠406 ならエラー表示 |
| `code` | `number` | エラーコード。406 は無通知（データ無し、例：コード表にキーが無い） |
| `message` | `string` | エラーメッセージ |
| `data.data` | `array` | リモコン機種の配列（currentPage=1 なら置換、それ以外は追加） |
| `data.pagination` | `object {currentPage, pageSize, totalCount, hasMore}` | ページ情報。hasMore で追加読み込みを判定 |
| `data.dataVersion` | `string` | ローカルキャッシュ検証用のデータバージョン。ページ送り中に変われば全体を再読込 |

::: info 補足
配列要素は一覧ページで direction のみ参照、他は個別に読まない。
:::

### getRemoteListVersion {#biz3irremote-getremotelistversion}

ローカルキャッシュが古いか判定するため、リモコン一覧のデータバージョンを静かに問い合わせる。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3IRRemote' |
| `op` | `string` | はい | 'getRemoteListVersion' |
| `type` | `string \| number` | はい | 赤外線種別：0x2000 テレビ、0x8000 扇風機、0xC000 エアコン、0xE000 照明、0xFE00 自己学習 |
| `companyID` | `string` | はい | 現在の会社 ID（customerInfo.companyID） |
| `silent` | `boolean` | はい | 常に true。reqContext.silent として返り、クライアントは一覧を変更せずエラーも出さない |

```json
{
  "action": "biz3IRRemote",
  "op": "getRemoteListVersion",
  "type": "8192",
  "companyID": "xxxxxxxx",
  "silent": true
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否。失敗かつ code≠406 ならエラー表示 |
| `code` | `number` | エラーコード。406 は無通知（データ無し、例：コード表にキーが無い） |
| `message` | `string` | エラーメッセージ |
| `data.dataVersion` | `string` | 最新データバージョン |
| `reqContext.silent` | `boolean` | silent フラグの返送 |

### searchRemoteList {#biz3irremote-searchremotelist}

キーワードで赤外線種別のリモコン機種を検索。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3IRRemote' |
| `op` | `string` | はい | 'searchRemoteList' |
| `type` | `string \| number` | はい | 赤外線種別：0x2000 テレビ、0x8000 扇風機、0xC000 エアコン、0xE000 照明、0xFE00 自己学習 |
| `companyID` | `string` | はい | 現在の会社 ID（customerInfo.companyID） |
| `searchTerm` | `string` | はい | 前後空白を除いたキーワード。空なら送信しない |
| `pagination` | `object {page: 1, pageSize: 1000}` | はい | 常に 1 ページ目、最大 1000 件 |

```json
{
  "action": "biz3IRRemote",
  "op": "searchRemoteList",
  "type": "8192",
  "companyID": "xxxxxxxx",
  "searchTerm": "keyword",
  "pagination": {
    "page": 1,
    "pageSize": 1000
  }
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否。失敗かつ code≠406 ならエラー表示 |
| `code` | `number` | エラーコード。406 は無通知（データ無し、例：コード表にキーが無い） |
| `message` | `string` | エラーメッセージ |
| `data.data` | `array` | 検索結果の配列 |

### sendIR {#biz3irremote-sendir}

Hub3 に赤外線コードを発射させる。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3IRRemote' |
| `op` | `string` | はい | 'sendIR' |
| `deviceId` | `string (UUID)` | はい | Hub3 デバイス UUID |
| `command` | `string` | はい | remoteEmit：キーから組み立てた 16 進コマンド文字列；learnEmit：学習キーの keyUUID |
| `operation` | `string` | はい | 'remoteEmit'（コードライブラリ）または 'learnEmit'（自己学習） |
| `irType` | `string \| number` | はい | リモコン type（getRemoteList.type 参照） |
| `companyID` | `string` | はい | 現在の会社 ID（customerInfo.companyID） |
| `irDeviceUUID` | `string` | はい | リモコン UUID。未保存なら空文字 |

```json
{
  "action": "biz3IRRemote",
  "op": "sendIR",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "command": "<hex>",
  "operation": "remoteEmit",
  "irType": "8192",
  "companyID": "xxxxxxxx",
  "irDeviceUUID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否。失敗かつ code≠406 ならエラー表示 |
| `code` | `number` | エラーコード。406 は無通知（データ無し、例：コード表にキーが無い） |
| `message` | `string` | エラーメッセージ |
| `data` | `any` | ログのみ |

::: info 補足
成功時は送信成功を表示。code 406 はコード表にそのキーが無いこと（全体では無通知、エアコン以外のページは個別に通知）。成功後、保存済みリモコンは updateRemoteState を呼ぶ。
:::

### updateRemoteState {#biz3irremote-updateremotestate}

リモコンの最後に送った状態（コマンド文字列）を保存。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3IRRemote' |
| `op` | `string` | はい | 'updateRemoteState' |
| `deviceId` | `string (UUID)` | はい | Hub3 デバイス UUID |
| `uuid` | `string (UUID)` | はい | リモコン UUID |
| `state` | `string` | はい | 最後に送ったコマンド文字列 |
| `companyID` | `string` | はい | 現在の会社 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "updateRemoteState",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "state": "<hex>",
  "companyID": "xxxxxxxx"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否。失敗かつ code≠406 ならエラー表示 |
| `code` | `number` | エラーコード。406 は無通知（データ無し、例：コード表にキーが無い） |
| `message` | `string` | エラーメッセージ |

::: info 補足
ハンドラはログのみ。コールバックはメッセージ全体を受け取る。
:::

### addIRRemote {#biz3irremote-addirremote}

リモコンを Hub3 に保存。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3IRRemote' |
| `op` | `string` | はい | 'addIRRemote' |
| `remote` | `object {uuid, model, state, alias, code, type, deviceUUID, keys: []}` | はい | uuid はクライアント生成；model/alias/code/type は選択機種から；state は現在のコマンド文字列（自己学習は空）；deviceUUID は Hub3 UUID；keys は常に [] |
| `companyID` | `string` | はい | 現在の会社 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "addIRRemote",
  "remote": {
    "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "model": "xxxx",
    "state": "",
    "alias": "xxxx",
    "code": 0,
    "type": "8192",
    "deviceUUID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "keys": []
  },
  "companyID": "xxxxxxxx"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否。失敗かつ code≠406 ならエラー表示 |
| `code` | `number` | エラーコード。406 は無通知（データ無し、例：コード表にキーが無い） |
| `message` | `string` | エラーメッセージ |

::: info 補足
クライアント制限：自己学習以外（type≠0xFE00）は Hub3 あたり最大 3 個。超えると送信せず即失敗コールバック。コードライブラリのリモコン保存成功後は addRemoteToMatter も呼ぶ。
:::

### deleteIRRemote {#biz3irremote-deleteirremote}

Hub3 からリモコンを削除。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3IRRemote' |
| `op` | `string` | はい | 'deleteIRRemote' |
| `hub3DeviceId` | `string (UUID)` | はい | Hub3 デバイス UUID |
| `uuid` | `string (UUID)` | はい | リモコン UUID |
| `companyID` | `string` | はい | 現在の会社 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "deleteIRRemote",
  "hub3DeviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "companyID": "xxxxxxxx"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否。失敗かつ code≠406 ならエラー表示 |
| `code` | `number` | エラーコード。406 は無通知（データ無し、例：コード表にキーが無い） |
| `message` | `string` | エラーメッセージ |

::: info 補足
ハンドラはログのみ。コールバックはメッセージ全体を受け取る。
:::

### duplicateIRRemote {#biz3irremote-duplicateirremote}

リモコンを複製（サーバーが新 UUID を生成。自己学習はキーと赤外線データも複製）。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3IRRemote' |
| `op` | `string` | はい | 'duplicateIRRemote' |
| `hub3DeviceId` | `string (UUID)` | はい | Hub3 デバイス UUID |
| `uuid` | `string (UUID)` | はい | 複製元リモコン UUID |
| `alias` | `string` | はい | 新リモコンの別名。クライアントは元の別名を渡し、空ならサーバーが元を流用 |
| `companyID` | `string` | はい | 現在の会社 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "duplicateIRRemote",
  "hub3DeviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "alias": "xxxx",
  "companyID": "xxxxxxxx"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否。失敗かつ code≠406 ならエラー表示 |
| `code` | `number` | エラーコード。406 は無通知（データ無し、例：コード表にキーが無い） |
| `message` | `string` | エラーメッセージ |
| `data` | `object (new remote: uuid, alias, type, code, ... + duplicatedKeys, skippedKeys)` | 新しいリモコンオブジェクト。data.uuid が無ければ失敗扱い |
| `data.skippedKeys` | `number` | 複製できなかったキー数。>0 で警告 |
| `data.duplicatedKeys` | `any` | 保存前にクライアントが削除 |

::: info 補足
成功後、新リモコンに対して addRemoteToMatter を呼ぶ。
:::

### updateRemoteAlias {#biz3irremote-updateremotealias}

リモコンの別名を変更。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3IRRemote' |
| `op` | `string` | はい | 'updateRemoteAlias' |
| `deviceId` | `string (UUID)` | はい | Hub3 デバイス UUID |
| `uuid` | `string (UUID)` | はい | リモコン UUID |
| `alias` | `string` | はい | 新しい別名 |
| `companyID` | `string` | はい | 現在の会社 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "updateRemoteAlias",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "alias": "xxxx",
  "companyID": "xxxxxxxx"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否。失敗かつ code≠406 ならエラー表示 |
| `code` | `number` | エラーコード。406 は無通知（データ無し、例：コード表にキーが無い） |
| `message` | `string` | エラーメッセージ |

::: info 補足
クライアント関数名は modifyIRRemote。
:::

### setRemoteKeyOrder {#biz3irremote-setremotekeyorder}

リモコンのキー順を保存。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3IRRemote' |
| `op` | `string` | はい | 'setRemoteKeyOrder' |
| `deviceId` | `string (UUID)` | はい | Hub3 デバイス UUID |
| `uuid` | `string (UUID)` | はい | リモコン UUID（保存済みであること） |
| `keyOrder` | `array of string` | はい | キー ID の順序。空配列で既定順に戻す |
| `companyID` | `string` | はい | 現在の会社 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "setRemoteKeyOrder",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "keyOrder": [
    "xxxx",
    "xxxx"
  ],
  "companyID": "xxxxxxxx"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否。失敗かつ code≠406 ならエラー表示 |
| `code` | `number` | エラーコード。406 は無通知（データ無し、例：コード表にキーが無い） |
| `message` | `string` | エラーメッセージ |

::: info 補足
ハンドラはログのみ。コールバックはメッセージ全体を受け取る。
:::

### getRemoteKeyOrder {#biz3irremote-getremotekeyorder}

リモコンのキー順を取得。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3IRRemote' |
| `op` | `string` | はい | 'getRemoteKeyOrder' |
| `deviceId` | `string (UUID)` | はい | Hub3 デバイス UUID |
| `uuid` | `string (UUID)` | はい | リモコン UUID |
| `companyID` | `string` | はい | 現在の会社 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "getRemoteKeyOrder",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "companyID": "xxxxxxxx"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否。失敗かつ code≠406 ならエラー表示 |
| `code` | `number` | エラーコード。406 は無通知（データ無し、例：コード表にキーが無い） |
| `message` | `string` | エラーメッセージ |
| `data` | `object {uuid, keyOrder: array of string}` | 記録が無ければ keyOrder は [] |

### getIRMode {#biz3irremote-getirmode}

Hub3 の現在の赤外線モードを取得。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3IRRemote' |
| `op` | `string` | はい | 'getIRMode' |
| `deviceId` | `string (UUID)` | はい | Hub3 デバイス UUID |
| `companyID` | `string` | はい | 現在の会社 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "getIRMode",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "companyID": "xxxxxxxx"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否。失敗かつ code≠406 ならエラー表示 |
| `code` | `number` | エラーコード。406 は無通知（データ無し、例：コード表にキーが無い） |
| `message` | `string` | エラーメッセージ |
| `data` | `object {ir_mode \| mode} \| number` | モード：0 = CONTROL、1 = LEARN/REGISTER。クライアントは data.ir_mode、data.mode、数値そのものの順に試す |

### setIRMode {#biz3irremote-setirmode}

Hub3 の赤外線モード（学習/制御）を設定。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3IRRemote' |
| `op` | `string` | はい | 'setIRMode' |
| `deviceId` | `string (UUID)` | はい | Hub3 デバイス UUID |
| `mode` | `number` | はい | 0 = CONTROL、1 = REGISTER/LEARN（赤外線信号の学習） |
| `companyID` | `string` | はい | 現在の会社 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "setIRMode",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "mode": 1,
  "companyID": "xxxxxxxx"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否。失敗かつ code≠406 ならエラー表示 |
| `code` | `number` | エラーコード。406 は無通知（データ無し、例：コード表にキーが無い） |
| `message` | `string` | エラーメッセージ |

::: info 補足
学習ページを離れるとクライアントが 0 に戻す。
:::

### subscribeIRMode {#biz3irremote-subscribeirmode}

Hub3 の赤外線モード変化通知を購読。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3IRRemote' |
| `op` | `string` | はい | 'subscribeIRMode' |
| `topic` | `string` | はい | 'hub3/{deviceId}/ir/mode' |
| `deviceId` | `string (UUID)` | はい | Hub3 デバイス UUID |
| `companyID` | `string` | はい | 現在の会社 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "subscribeIRMode",
  "topic": "hub3/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/ir/mode",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "companyID": "xxxxxxxx"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否。失敗かつ code≠406 ならエラー表示 |
| `code` | `number` | エラーコード。406 は無通知（データ無し、例：コード表にキーが無い） |
| `message` | `string` | エラーメッセージ |

::: info 補足
購読確認はログのみ。実際の通知は op 'subscribeIRModeRsp' でプッシュ。
:::

### subscribeIRModeRsp (server push) {#biz3irremote-subscribeirmodersp-server-push}

サーバープッシュ：赤外線モード変化。

**リクエスト**

追加パラメータはありません。

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否。失敗かつ code≠406 ならエラー表示 |
| `code` | `number` | エラーコード。406 は無通知（データ無し、例：コード表にキーが無い） |
| `message` | `string` | エラーメッセージ |
| `data.data.ir_mode` | `number` | 新モード（0 = CONTROL、1 = LEARN/REGISTER） |

::: info 補足
購読中の全デバイスのコールバックに配信（デバイスで絞り込まない）。
:::

### subscribeIRData {#biz3irremote-subscribeirdata}

Hub3 が学習した赤外線データを購読。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3IRRemote' |
| `op` | `string` | はい | 'subscribeIRData' |
| `topic` | `string` | はい | 'hub3/{deviceId}/ir/learned/data' |
| `deviceId` | `string (UUID)` | はい | Hub3 デバイス UUID |
| `companyID` | `string` | はい | 現在の会社 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "subscribeIRData",
  "topic": "hub3/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/ir/learned/data",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "companyID": "xxxxxxxx"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否。失敗かつ code≠406 ならエラー表示 |
| `code` | `number` | エラーコード。406 は無通知（データ無し、例：コード表にキーが無い） |
| `message` | `string` | エラーメッセージ |

::: info 補足
データは op 'subscribeIRDataRsp' でプッシュ。
:::

### subscribeIRDataRsp (server push) {#biz3irremote-subscribeirdatarsp-server-push}

サーバープッシュ：学習した赤外線波形データ。

**リクエスト**

追加パラメータはありません。

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否。失敗かつ code≠406 ならエラー表示 |
| `code` | `number` | エラーコード。406 は無通知（データ無し、例：コード表にキーが無い） |
| `message` | `string` | エラーメッセージ |
| `data.data` | `string (hex)` | 学習した赤外線データ。学習ページはこれでキーを作成（addIRCode）、照合ページは長さ ≤50 を空とみなして待機継続、それ以外は matchRemote に渡す |

::: info 補足
購読中の全デバイスのコールバックに配信。
:::

### unsubscribeIRMode {#biz3irremote-unsubscribeirmode}

赤外線モード通知の購読解除。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3IRRemote' |
| `op` | `string` | はい | 'unsubscribeIRMode' |
| `deviceId` | `string (UUID)` | はい | Hub3 デバイス UUID |
| `topic` | `string` | はい | 'hub3/{deviceId}/ir/mode' |
| `companyID` | `string` | はい | 現在の会社 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "unsubscribeIRMode",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "topic": "hub3/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/ir/mode",
  "companyID": "xxxxxxxx"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否。失敗かつ code≠406 ならエラー表示 |
| `code` | `number` | エラーコード。406 は無通知（データ無し、例：コード表にキーが無い） |
| `message` | `string` | エラーメッセージ |

::: info 補足
ハンドラはログのみ。コールバックはメッセージ全体を受け取る。
:::

### unsubscribeIRData {#biz3irremote-unsubscribeirdata}

学習データの購読解除。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3IRRemote' |
| `op` | `string` | はい | 'unsubscribeIRData' |
| `deviceId` | `string (UUID)` | はい | Hub3 デバイス UUID |
| `topic` | `string` | はい | 'hub3/{deviceId}/ir/learned/data' |
| `companyID` | `string` | はい | 現在の会社 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "unsubscribeIRData",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "topic": "hub3/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/ir/learned/data",
  "companyID": "xxxxxxxx"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否。失敗かつ code≠406 ならエラー表示 |
| `code` | `number` | エラーコード。406 は無通知（データ無し、例：コード表にキーが無い） |
| `message` | `string` | エラーメッセージ |

::: info 補足
ハンドラはログのみ。コールバックはメッセージ全体を受け取る。
:::

### matchRemote {#biz3irremote-matchremote}

学習した赤外線波形をコードライブラリと照合。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3IRRemote' |
| `op` | `string` | はい | 'matchRemote' |
| `irData` | `string (hex)` | はい | subscribeIRDataRsp で受信した赤外線データ |
| `irWaveLength` | `number` | はい | irData.length / 2（バイト数） |
| `irType` | `number` | はい | parseInt(remote.type) |
| `brandName` | `string` | はい | リモコンの model（ブランド） |
| `companyID` | `string` | はい | 現在の会社 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "matchRemote",
  "irData": "<hex>",
  "irWaveLength": 0,
  "irType": 8192,
  "brandName": "xxxx",
  "companyID": "xxxxxxxx"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否。失敗かつ code≠406 ならエラー表示 |
| `code` | `number` | エラーコード。406 は無通知（データ無し、例：コード表にキーが無い） |
| `message` | `string` | エラーメッセージ |
| `data.matches` | `array of {controlType: {model, alias, direction}, companyCode: number, bestMatchPercentage: number}` | 照合結果。companyCode をリモコン code に、bestMatchPercentage を小数 2 桁の % で表示 |

### getIRCodes {#biz3irremote-getircodes}

自己学習リモコンのキー一覧を取得。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3IRRemote' |
| `op` | `string` | はい | 'getIRCodes' |
| `hub3DeviceId` | `string (UUID)` | はい | Hub3 デバイス UUID |
| `remoteId` | `string (UUID)` | はい | リモコン UUID |
| `companyID` | `string` | はい | 現在の会社 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "getIRCodes",
  "hub3DeviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "remoteId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "companyID": "xxxxxxxx"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否。失敗かつ code≠406 ならエラー表示 |
| `code` | `number` | エラーコード。406 は無通知（データ無し、例：コード表にキーが無い） |
| `message` | `string` | エラーメッセージ |
| `data` | `array of {keyUUID, name, uuid, ...}` | キー配列。keyUUID キー ID、name 名称、uuid 所属リモコン UUID |

### addIRCode {#biz3irremote-addircode}

自己学習リモコンにキー（学習した赤外線データ付き）を追加。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3IRRemote' |
| `op` | `string` | はい | 'addIRCode' |
| `irCode` | `object {keyUUID, name, uuid, deviceId, data}` | はい | keyUUID はクライアント生成；name 初期値は空；uuid リモコン UUID；deviceId Hub3 UUID；data 学習した赤外線データ（16 進） |
| `companyID` | `string` | はい | 現在の会社 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "addIRCode",
  "irCode": {
    "keyUUID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "name": "",
    "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "data": "<hex>"
  },
  "companyID": "xxxxxxxx"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否。失敗かつ code≠406 ならエラー表示 |
| `code` | `number` | エラーコード。406 は無通知（データ無し、例：コード表にキーが無い） |
| `message` | `string` | エラーメッセージ |

::: info 補足
結果に関わらず学習モードを終了（setIRMode 0）。
:::

### updateIRCode {#biz3irremote-updateircode}

学習キーの名称を変更。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3IRRemote' |
| `op` | `string` | はい | 'updateIRCode' |
| `hub3DeviceId` | `string (UUID)` | はい | Hub3 デバイス UUID |
| `remoteId` | `string (UUID)` | はい | リモコン UUID |
| `keyUUID` | `string (UUID)` | はい | キー ID |
| `name` | `string` | はい | 新しい名称（前後空白除去、空不可） |
| `companyID` | `string` | はい | 現在の会社 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "updateIRCode",
  "hub3DeviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "remoteId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "keyUUID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "name": "xxxx",
  "companyID": "xxxxxxxx"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否。失敗かつ code≠406 ならエラー表示 |
| `code` | `number` | エラーコード。406 は無通知（データ無し、例：コード表にキーが無い） |
| `message` | `string` | エラーメッセージ |

### deleteIRCode {#biz3irremote-deleteircode}

学習キーを削除。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3IRRemote' |
| `op` | `string` | はい | 'deleteIRCode' |
| `hub3DeviceId` | `string (UUID)` | はい | Hub3 デバイス UUID |
| `remoteId` | `string (UUID)` | はい | リモコン UUID |
| `keyUUID` | `string (UUID)` | はい | キー ID |
| `companyID` | `string` | はい | 現在の会社 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "deleteIRCode",
  "hub3DeviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "remoteId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "keyUUID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "companyID": "xxxxxxxx"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否。失敗かつ code≠406 ならエラー表示 |
| `code` | `number` | エラーコード。406 は無通知（データ無し、例：コード表にキーが無い） |
| `message` | `string` | エラーメッセージ |

### addRemoteToMatter {#biz3irremote-addremotetomatter}

赤外線リモコンを ON/OFF の 2 動作で Matter デバイスとしてブリッジ。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3IRRemote' |
| `op` | `string` | はい | 'addRemoteToMatter' |
| `hub3DeviceId` | `string (UUID)` | はい | Hub3 デバイス UUID |
| `irDeviceType` | `string \| number` | はい | リモコン type |
| `cmdOn` | `string (hex)` | はい | 電源 ON コマンド文字列（コード源で最もカバー率の高い電源キーから生成） |
| `cmdOff` | `string (hex)` | はい | 電源 OFF コマンド文字列 |
| `irDeviceUUID` | `string (UUID)` | はい | リモコン UUID |
| `irDeviceName` | `string` | はい | リモコン別名 |
| `companyID` | `string` | はい | 現在の会社 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "addRemoteToMatter",
  "hub3DeviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "irDeviceType": "8192",
  "cmdOn": "<hex>",
  "cmdOff": "<hex>",
  "irDeviceUUID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "irDeviceName": "xxxx",
  "companyID": "xxxxxxxx"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否。失敗かつ code≠406 ならエラー表示 |
| `code` | `number` | エラーコード。406 は無通知（データ無し、例：コード表にキーが無い） |
| `message` | `string` | エラーメッセージ |

::: info 補足
ハンドラはログのみ。コールバックはメッセージ全体を受け取る。
:::

## biz3Face3Qr {#biz3face3qr}

Face3 ドアホン/顔認証デバイス：バインド済み一覧、コマンド送信（起動）、KVS 視聴資格情報または LiveKit ルームトークンの取得。

### command {#biz3face3qr-command}

Face3 デバイスへコマンドを送る（汎用入口。クラウドが署名してプッシュ）。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3Face3Qr' |
| `op` | `string` | はい | 'command' |
| `deviceId` | `string` | はい | デバイス UUID |
| `cmd` | `string` | はい | 下りコマンド名（デバイス側 action）。コード中で使われる値は 'face3Wake'（デバイスを起こして WebRTC 配信開始）のみ |

```json
{
  "action": "biz3Face3Qr",
  "op": "command",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "cmd": "face3Wake"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否 |
| `code` | `any` | 結果コード（コールバックが受け取るが分岐しない） |
| `message` | `string` | 失敗理由の文字列 |
| `data.deviceId` | `string` | 応答を 'op:deviceId' コールバックへ振り分けるのに使用 |
| `message (failure)` | `string` | device_offline、not_bound、device_identity_rejected、device_not_signable |

::: info 補足
本文には意図的に subUUID を含めない。クラウドは認証済み接続（face3_ws_connections[connectionId]）からユーザーを取得し、デバイスにバインド済みの人だけが操作できる。接続中のみ送信しキューに入れない。切断時は即座に {success:false, message:'ws_disconnected'} をコールバック。 コメント：デバイスは通常電源オフで休眠し、WiFi モジュールが face3Wake を受けてメイン MCU に給電後に転送するため、成功はモジュール到達のみを意味する。その後デバイスは op 'streamState' で {deviceId, state, reason} をプッシュ（例：stopped・reason 'doorbell' はドアホン切断）。
:::

### list {#biz3face3qr-list}

現在のユーザーにバインドされた Face3 デバイスを一覧。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3Face3Qr' |
| `op` | `string` | はい | 'list' |

```json
{
  "action": "biz3Face3Qr",
  "op": "list"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 失敗時は既存一覧を保持 |
| `data.devices` | `array of {deviceUUID, deviceName, stateInfo, ...}` | バインド済みデバイスの配列 |

::: info 補足
subUUID は送らず、クラウドが接続記録からユーザーを特定。このリクエストは切断中キューに入りうる。
:::

### live {#biz3face3qr-live}

LiveKit ルームトークンを取得（複数視聴/多者通話）。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3Face3Qr' |
| `op` | `string` | はい | 'live' |
| `deviceId` | `string` | はい | デバイス UUID |

```json
{
  "action": "biz3Face3Qr",
  "op": "live",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否 |
| `code` | `any` | 結果コード（コールバックが受け取るが分岐しない） |
| `message` | `string` | 失敗理由の文字列 |
| `data.deviceId` | `string` | 応答を 'op:deviceId' コールバックへ振り分けるのに使用 |
| `data.url` | `string` | LiveKit サーバー URL |
| `data.token` | `string` | LiveKit アクセストークン。存在しなければ不可扱い |

::: info 補足
本文には意図的に subUUID を含めない。クラウドは認証済み接続（face3_ws_connections[connectionId]）からユーザーを取得し、デバイスにバインド済みの人だけが操作できる。接続中のみ送信しキューに入れない。切断時は即座に {success:false, message:'ws_disconnected'} をコールバック。 段階的機能：not_bound / not_authenticated は即エラー、その他の失敗やタイムアウトは op 'viewer'（KVS 直結）にフォールバック。
:::

### viewer {#biz3face3qr-viewer}

視聴用一時資格情報を取得（KVS WebRTC、このデバイスのチャネル限定、15 分）。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `action` | `string` | はい | 固定値 'biz3Face3Qr' |
| `op` | `string` | はい | 'viewer' |
| `deviceId` | `string` | はい | デバイス UUID |

```json
{
  "action": "biz3Face3Qr",
  "op": "viewer",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成否 |
| `code` | `any` | 結果コード（コールバックが受け取るが分岐しない） |
| `message` | `string` | 失敗理由の文字列 |
| `data.deviceId` | `string` | 応答を 'op:deviceId' コールバックへ振り分けるのに使用 |
| `data.channelArn` | `string` | KVS シグナリングチャネル ARN |
| `data.region` | `string` | AWS リージョン |
| `data.clientId` | `string` | 視聴側 clientId |
| `data.credentials` | `object {accessKeyId, secretAccessKey, sessionToken}` | AssumeRole で発行された一時資格情報 |
| `data.iceServers` | `array` | ICE サーバー一覧 |
| `message (failure)` | `string` | channel_not_ready（チャネル未作成、クライアントが再試行）、not_bound、invalid_device_id、not_authenticated、device_offline、device_identity_rejected、device_not_signable |

::: info 補足
本文には意図的に subUUID を含めない。クラウドは認証済み接続（face3_ws_connections[connectionId]）からユーザーを取得し、デバイスにバインド済みの人だけが操作できる。接続中のみ送信しキューに入れない。切断時は即座に {success:false, message:'ws_disconnected'} をコールバック。 前提：先にデバイスを起動して配信させる必要がある。ブラウザには長期資格情報を置かない。
:::
