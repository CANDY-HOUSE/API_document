---
title: デバイスと履歴
---
# デバイスと履歴

接続方法、メッセージ形式、共通のレスポンスフィールドは [WebSocket API](./bizapi.md) を参照してください。

**API 目次**

| action | 操作 |
| --- | --- |
| [`biz3ManageDevice`](#biz3managedevice) | [getUserDevice](#biz3managedevice-getuserdevice)、[getCompanyDevice](#biz3managedevice-getcompanydevice)、[add](#biz3managedevice-add)、[del](#biz3managedevice-del)、[updateName](#biz3managedevice-updatename)、[updateRelayEnable](#biz3managedevice-updaterelayenable)、[updateDeviceOrderKey](#biz3managedevice-updatedeviceorderkey)、[notifyList](#biz3managedevice-notifylist)、[notifyManage](#biz3managedevice-notifymanage)、[switchRecharge](#biz3managedevice-switchrecharge)、[getDeviceStatus](#biz3managedevice-getdevicestatus) |
| [`biz3GetDeviceHistory`](#biz3getdevicehistory) | [getHistory](#biz3getdevicehistory-gethistory)、[getEnv](#biz3getdevicehistory-getenv)、[makeInvisible](#biz3getdevicehistory-makeinvisible) |
| [`biz3GetDeviceBatteryRecord`](#biz3getdevicebatteryrecord) | [batch-get](#biz3getdevicebatteryrecord-batch-get)、[makeInvisible](#biz3getdevicebatteryrecord-makeinvisible) |
| [`biz3GetDeviceEmployeeKeys`](#biz3getdeviceemployeekeys) | [get](#biz3getdeviceemployeekeys-get)、[getLimited](#biz3getdeviceemployeekeys-getlimited) |

## biz3ManageDevice {#biz3managedevice}

デバイス管理：個人／会社デバイス一覧の取得、デバイスの追加・削除、名称変更、リレー有効化、並び順、プッシュ通知設定、充電池スイッチ、単体デバイス状態の取得。

### getUserDevice {#biz3managedevice-getuserdevice}

ログイン中ユーザーが個人で保有するすべてのデバイス鍵を取得する。

**リクエスト**

追加パラメータはありません。

```json
{
  "action": "biz3ManageDevice",
  "op": "getUserDevice"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `op` | `string ("PubedUserDevice")` | データは op=getUserDevice ではなく op=PubedUserDevice のプッシュメッセージとしてページ単位で届く。 |
| `data.totalPage` | `number (integer)` | 総ページ数。 |
| `data.data.page` | `number (integer, 1-based)` | 現在のページ番号（1 始まり）。 |
| `data.data.list` | `array of device objects` | このページのデバイス一覧。フィールドは device_object 参照。 |

::: info 補足
クライアントは page 1..totalPage を連続して収集し、欠落・順序違い・deviceUUID 重複があればスナップショット全体を破棄する。keyLevel と機種で会社に追加可能なデバイス（オーナー鍵のみ）を絞り込む。旧アプリ WebView（isFromApp かつ AppHome 以外）では強制指定がない限り送信しない。
:::

### getCompanyDevice {#biz3managedevice-getcompanydevice}

会社に登録済みの全デバイスを取得し、サーバーがこの接続をそれらの状態更新に自動購読させる。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `companyID` | `string` | はい | 会社 ID（現在のログイン情報から取得）。 |

```json
{
  "action": "biz3ManageDevice",
  "op": "getCompanyDevice",
  "companyID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `op` | `string ("PubedCompanyDevice")` | データは op=PubedCompanyDevice のプッシュメッセージとしてページ単位で届く。 |
| `data.totalPage` | `number (integer)` | 総ページ数。 |
| `data.data.page` | `number (integer, 1-based)` | 現在のページ番号（1 始まり）。 |
| `data.data.list` | `array of device objects` | このページのデバイス一覧。フィールドは device_object 参照（stateInfo・orderKey を含む）。 |

::: info 補足
コードコメント：デバイス状態の購読は getCompanyDevice / getDeviceStatus 時にサーバー側で自動的に行われる。WebSocket の connectionId が変わる（再接続）とクライアントが再呼び出しして再購読する。ページ収集ルールは getUserDevice と同じ。add・del 成功後にクライアントが再取得する。
:::

### add {#biz3managedevice-add}

1 つ以上のデバイス鍵を会社に登録（または更新）する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `companyID` | `string` | はい | 会社 ID。 |
| `items` | `array of objects` | はい | デバイス鍵オブジェクトの配列。QR コードから解析した場合は {secretKey（hex）, keyIndex（hex）, sesame2PublicKey（hex）, keyLevel（number）, deviceModel（string）, deviceName（string）, deviceUUID（string、大文字）}。他の呼び出し元は getUserDevice/getCompanyDevice のデバイスオブジェクト、またはネイティブアプリが返す鍵オブジェクトをそのまま渡す。 |

```json
{
  "action": "biz3ManageDevice",
  "op": "add",
  "companyID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "items": [
    {
      "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
      "deviceName": "Front door",
      "deviceModel": "sesame_5",
      "keyLevel": 0,
      "secretKey": "<hex>",
      "keyIndex": "<hex>",
      "sesame2PublicKey": "<hex>"
    }
  ]
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成功したかどうか。 |
| `message` | `string` | 失敗メッセージ。"Limit Exceeded" はプランのデバイス数上限に達したことを示す。 |

::: info 補足
デバイス数はプランで制限される（Limit Exceeded）。成功時クライアントは getCompanyDevice を再取得する。AppLockAngle は deviceModel を変更した既存デバイスオブジェクトを add で送って機種を同期しており、既存デバイスに対して更新の意味を持つと推測される（使用箇所からの推測）。選択 UI ではオーナー権限の鍵のみ提示される。
:::

### del {#biz3managedevice-del}

会社からデバイス鍵を削除する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `companyID` | `string` | はい | 会社 ID。 |
| `items` | `array of {deviceUUID: string, subUUID: string}` | はい | 削除する鍵の一覧。各項目はデバイス UUID と保持者の subUUID。 |

```json
{
  "action": "biz3ManageDevice",
  "op": "del",
  "companyID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "items": [
    {
      "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
      "subUUID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    }
  ]
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成功したかどうか。 |
| `message` | `string` | 失敗メッセージ。 |

::: info 補足
成功時クライアントは getCompanyDevice を再取得する。削除してもデバイス自体はリセットされない。アプリ側はそのデバイスのプッシュも無効化する（notifyManage enablePush=false）。
:::

### updateName {#biz3managedevice-updatename}

ユーザーの鍵上のデバイス表示名を変更する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `obj.subUUID` | `string` | はい | 現在のユーザーの subUUID。 |
| `obj.deviceUUID` | `string` | はい | デバイス UUID。 |
| `obj.deviceName` | `string` | はい | 新しい名称（空でないこと）。 |

```json
{
  "action": "biz3ManageDevice",
  "op": "updateName",
  "obj": {
    "subUUID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
    "deviceName": "New name"
  }
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成功したかどうか。 |
| `reqContext.deviceUUID` | `string` | エコーされたデバイス UUID。クライアントはこれでローカル状態を更新する。 |
| `reqContext.deviceName` | `string` | エコーされた新しい名称。 |

::: info 補足
パラメータはトップレベルではなく obj に包まれる。
:::

### updateRelayEnable {#biz3managedevice-updaterelayenable}

Hub3 LTE の各リレーチャネルの有効フラグを設定し、サーバーの hub3_status.relay_info に保存する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `obj.deviceUUID` | `string` | はい | Hub3 のデバイス UUID。 |
| `obj.enable1` | `number (0\|1)` | いいえ | リレー 1 の有効化：1=有効、0=無効。 |
| `obj.enable2` | `number (0\|1)` | いいえ | リレー 2 の有効化：1=有効、0=無効。 |

```json
{
  "action": "biz3ManageDevice",
  "op": "updateRelayEnable",
  "obj": {
    "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
    "enable1": 1
  }
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成功したかどうか（唯一の呼び出し元はコールバックを渡さず、レスポンスを読まない）。 |

::: info 補足
コードコメント：変更するチャネル（enable1 または enable2）のみ送る。読み取り時、stateInfo.relayInfo.enableN が無い場合は有効とみなす。
:::

### updateDeviceOrderKey {#biz3managedevice-updatedeviceorderkey}

ドラッグ＆ドロップ後にユーザーのデバイス一覧内での並び位置を更新する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `obj.subUUID` | `string` | はい | 移動したデバイス鍵の subUUID。 |
| `obj.deviceUUID` | `string` | はい | 移動したデバイスの UUID。 |
| `obj.prevKey` | `string` | いいえ | 新しい位置の直前のデバイスの orderKey。先頭に移動した場合は無し。 |
| `obj.nextKey` | `string` | いいえ | 新しい位置の直後のデバイスの orderKey。末尾に移動した場合は無し。 |

```json
{
  "action": "biz3ManageDevice",
  "op": "updateDeviceOrderKey",
  "obj": {
    "subUUID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
    "prevKey": "<orderKey>",
    "nextKey": "<orderKey>"
  }
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成功したかどうか。成功時クライアントは getCompanyDevice を再取得し、サーバー生成の orderKey を得る。 |

::: info 補足
先頭デバイスに orderKey がある場合のみドラッグ可能。orderKey はサーバーが生成する。
:::

### notifyList {#biz3managedevice-notifylist}

プッシュトークンに対する各デバイスのプッシュ通知オン／オフ状態を取得する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `companyID` | `string` | はい | 会社 ID。 |
| `pushToken` | `string` | はい | ネイティブアプリが提供するプッシュトークン。 |
| `items` | `unknown` | いいえ | フックは対応しているが、唯一の呼び出し元は渡していない（実際は undefined）。 |

```json
{
  "action": "biz3ManageDevice",
  "op": "notifyList",
  "companyID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "pushToken": "<push-token>"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成功したかどうか。 |
| `message` | `string` | 失敗メッセージ。 |
| `data[].deviceUUID` | `string` | デバイス UUID。 |
| `data[].deviceName` | `string` | デバイス名。 |
| `data[].enablePush` | `boolean` | そのデバイスのプッシュが有効かどうか。 |

### notifyManage {#biz3managedevice-notifymanage}

プッシュトークンに対するデバイスのプッシュ通知をオン／オフする。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `companyID` | `string` | はい | 会社 ID。 |
| `pushToken` | `string` | はい | プッシュトークン。 |
| `deviceUUID` | `string` | はい | デバイス UUID。 |
| `enablePush` | `boolean` | はい | true=プッシュ有効、false=無効。 |

```json
{
  "action": "biz3ManageDevice",
  "op": "notifyManage",
  "companyID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "pushToken": "<push-token>",
  "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "enablePush": true
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成功したかどうか。 |
| `message` | `string` | 失敗メッセージ。 |

::: info 補足
デバイス削除（del）後、アプリは enablePush=false でこれを呼ぶ。
:::

### switchRecharge {#biz3managedevice-switchrecharge}

デバイスが充電池を使うかどうかを設定する（電池残量の計算に影響）。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | はい | デバイス UUID。 |
| `isRechargeBattery` | `number (0\|1)` | はい | 1=充電池、0=通常電池（クライアントが boolean から変換）。 |

```json
{
  "action": "biz3ManageDevice",
  "op": "switchRecharge",
  "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "isRechargeBattery": 1
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成功したかどうか。失敗時クライアントはスイッチを元に戻す。 |

::: info 補足
成功時クライアントはデバイス一覧と電池記録（batch-get）を再取得しており、記録がこの設定に依存すると推測される。現在値は stateInfo.isRechargeBattery から読む。
:::

### getDeviceStatus {#biz3managedevice-getdevicestatus}

単一デバイスの詳細と状態を取得し、サーバーがこの接続をその状態更新に購読させる。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | はい | デバイス UUID（空の場合クライアントは送信しない）。 |

```json
{
  "action": "biz3ManageDevice",
  "op": "getDeviceStatus",
  "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `data` | `array of device objects` | クライアントは data[0] のみをデバイス詳細として使う（フィールドは device_object 参照）。空配列はデータ無し。 |

::: info 補足
コードコメント：状態購読は getCompanyDevice / getDeviceStatus 時にサーバーが自動で行う。ファームウェア更新・デバイス設定・電池画面などで、会社一覧にデバイスが無い場合のフォールバックとして使われる。
:::

## biz3GetDeviceHistory {#biz3getdevicehistory}

デバイス操作履歴：履歴のページ取得、履歴レコードの環境スナップショット取得、レコードの非表示化。

### getHistory {#biz3getdevicehistory-gethistory}

1 つ以上のデバイスの操作履歴をページ単位で取得する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `companyID` | `string` | はい | 会社 ID。 |
| `list` | `array of objects` | はい | 取得対象。単一デバイス：[{deviceUUID: string, lastKey: number\|null}]。全デバイス：各項目は {deviceId: string, lastKey: number\|null}（キー名が deviceId である点に注意）。lastKey は前ページ最後のレコードの timestamp、初回は null。 |
| `pageSize` | `number \| null` | いいえ | 1 ページの件数。既定は null（サーバー既定値）、CSV/Excel 出力時は 100。 |

```json
{
  "action": "biz3GetDeviceHistory",
  "op": "getHistory",
  "companyID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "list": [
    {
      "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
      "lastKey": null
    }
  ],
  "pageSize": null
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `data` | `array of history records (single-device form)` | 単一デバイスの場合は履歴レコードの配列。空配列はこれ以上無いことを示す。 |
| `data[].device_id` | `string` | デバイス UUID。 |
| `data[].timestamp` | `number` | 記録時刻（クライアントは new Date(timestamp) で解析、つまりミリ秒）。次ページの lastKey にも使う。 |
| `data[].type` | `number` | 履歴イベント種別（解錠・施錠など。クライアントがアイコンと文言に対応付ける）。 |
| `data[].history_tag` | `string (base64) \| object of byte values` | 操作者タグ。base64 エンコードされた UTF-8 テキスト（バイト値のオブジェクトの場合もある）。無い場合は種別に応じた手動操作の文言を表示。 |
| `data[].record_id` | `number \| string` | レコード ID（リストの key に使用）。 |
| `data[].via` | `unknown` | 操作方法（CSV 出力の列としてのみ参照）。 |
| `data[].botHistoryMode` | `string ('script'\|'widget'\|'manual')` | Bot2/Bot3 履歴のトリガー方式：スクリプト、ウィジェットクリック、手動クリック。 |
| `data[].botAlias` | `string` | Bot スクリプトの別名（botHistoryMode=script のとき表示）。 |
| `data[].botViaType` | `unknown` | Bot のトリガー経路種別。表示コンポーネントに渡される。 |
| `data.items` | `array of history records (multi-device form)` | 全デバイス取得時の統合された履歴レコード（フィールドは上記と同じ）。 |
| `data.deviceLastKeys` | `object {deviceUUID: lastKey}` | デバイスごとの次ページ lastKey。次回リクエストで list に戻す。 |
| `data.hasMore` | `boolean` | さらにレコードがあるかどうか。 |

::: info 補足
レスポンス形式はリクエストにより異なる：単一デバイス（list 項目が deviceUUID）は data 配列、全デバイス（list 項目が deviceId）は data{items, deviceLastKeys, hasMore} を返す。サーバーが両者をどう区別するか（list の長さかキー名か）はコードから不明なため、バックエンドに確認が必要。エクスポートは返却件数が pageSize と等しい間ページングを続ける。
:::

### getEnv {#biz3getdevicehistory-getenv}

履歴レコード発生時の環境スナップショットを取得する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | はい | デバイス UUID（レコードの device_id から）。 |
| `timestamp` | `number` | はい | 履歴レコードの timestamp。 |

```json
{
  "action": "biz3GetDeviceHistory",
  "op": "getEnv",
  "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "timestamp": 1700000000000
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `data` | `array of single-key objects [{key: value}, ...] \| JSON string` | 環境スナップショット：単一キーのオブジェクトの配列で、キーが指標名、値が数値／文字列／配列。JSON 文字列の場合もある。無い場合は {}（データ無し）として扱う。 |

::: info 補足
クライアントは success を確認せず、data を base64 化してスナップショット画面に渡す。具体的なキー名はコードに列挙されていない（i18n の envSnapshot.&lt;key> で翻訳）。
:::

### makeInvisible {#biz3getdevicehistory-makeinvisible}

履歴レコードを非表示にする（一覧から表示を消す）。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | はい | デバイス UUID（レコードの device_id から）。 |
| `timestamp` | `number` | はい | 非表示にするレコードの timestamp。 |

```json
{
  "action": "biz3GetDeviceHistory",
  "op": "makeInvisible",
  "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "timestamp": 1700000000000
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成功時クライアントはその timestamp のレコードを一覧から削除する。 |

::: info 補足
ゲスト鍵（keyLevel=2）では履歴画面の操作が無効化される。論理削除であることは名称（makeInvisible）からの推測。
:::

## biz3GetDeviceBatteryRecord {#biz3getdevicebatteryrecord}

デバイスの電池電圧記録：ページ取得とレコードの非表示化。

### batch-get {#biz3getdevicebatteryrecord-batch-get}

電池グラフ用に、デバイスの電池電圧／残量の記録をページ単位で取得する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | はい | デバイス UUID。 |
| `lastEvaluatedKey` | `any \| null` | いいえ | ページングカーソル。前回レスポンスの data.lastEvaluatedKey をそのまま返す。初回は null。 |
| `pageSize` | `number` | はい | 1 ページの件数：アプリ内は 50、Web は 100。 |

```json
{
  "action": "biz3GetDeviceBatteryRecord",
  "op": "batch-get",
  "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "lastEvaluatedKey": null,
  "pageSize": 100
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `data.records` | `array of objects` | 電池記録の配列（無い場合は空とみなす）。 |
| `data.records[].ts` | `number` | 記録時刻（Unix 秒）。 |
| `data.records[].light` | `number` | 軽負荷時電圧（mV、クライアントは 1000 で割って V 表示）。 |
| `data.records[].heavy` | `number` | 重負荷時電圧（mV）。-1 は値無し。 |
| `data.records[].lightPercentage` | `number` | 軽負荷電圧に対応する電池残量（%）。 |
| `data.records[].heavyPercentage` | `number` | 重負荷電圧に対応する電池残量（%）。 |
| `data.lastEvaluatedKey` | `any \| null` | 次ページのカーソル。空ならこれ以上データ無し。 |

::: info 補足
WiFi モジュール機種では呼ばれない（クライアントは固定のダミーデータを表示）。新しいページは先頭に連結される（より古い記録）。
:::

### makeInvisible {#biz3getdevicebatteryrecord-makeinvisible}

電池記録を 1 件非表示にする。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | はい | デバイス UUID。 |
| `timestamp_second` | `number` | はい | 非表示にするレコードの ts（Unix 秒）。 |

```json
{
  "action": "biz3GetDeviceBatteryRecord",
  "op": "makeInvisible",
  "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "timestamp_second": 1700000000
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 成功したかどうか。 |
| `data.timestamp_second` | `number` | 非表示にしたレコードのタイムスタンプのエコー。クライアントはこれでグラフから点を削除する。 |

::: info 補足
WiFi モジュール機種では呼ばれない。
:::

## biz3GetDeviceEmployeeKeys {#biz3getdeviceemployeekeys}

デバイスの全鍵保持者（従業員とゲスト鍵）を取得する。

### get {#biz3getdeviceemployeekeys-get}

デバイスの鍵保持者一覧を全件取得する（件数制限なし）。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `companyID` | `string` | はい | 会社 ID。 |
| `deviceUUID` | `string` | はい | デバイス UUID。 |
| `limit` | `number (0) \| undefined` | いいえ | 0 または未指定で op=get となる（管理モードは 0、その他の再取得では省略）。 |

```json
{
  "action": "biz3GetDeviceEmployeeKeys",
  "op": "get",
  "companyID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "limit": 0
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `data` | `array of objects` | 鍵保持者の一覧。 |
| `data[].subUUID` | `string` | 保持者の subUUID（ゲスト鍵そのものの項目には無い場合がある）。 |
| `data[].keyLevel` | `number` | 0=オーナー、1=マネージャー、2=ゲスト。 |
| `data[].startAt` | `number` | ゲスト鍵（keyLevel=2）の有効期間開始（Unix 秒）。 |
| `data[].endAt` | `number` | ゲスト鍵の有効期間終了（Unix 秒）。startAt/endAt が無ければ常時利用として表示。 |
| `data[].employeeName` | `string` | ユーザー名。ゲスト鍵ではタイムスタンプ形式の名前の場合があり、クライアントが月日に整形する。 |
| `data[].employeeEmail` | `string` | ユーザーのメールアドレス（任意）。 |
| `data[].guestKeyId` | `string` | ゲスト鍵 ID。空でなければゲスト鍵の項目。 |
| `data[].secretKey` | `string` | あるゲスト鍵の guestKeyId と一致する場合、そのユーザーはそのゲスト鍵経由で取得したことを示す（クライアントはその配下にまとめる）。 |
| `hasMore` | `boolean` | トップレベル：返却分以外にさらに保持者がいるかどうか。 |

::: info 補足
op は limit によりクライアントが決める：limit>0 なら getLimited、それ以外は get。
:::

### getLimited {#biz3getdeviceemployeekeys-getlimited}

デバイスの鍵保持者を先頭 N 件取得する（デバイス詳細でのプレビュー用）。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `companyID` | `string` | はい | 会社 ID。 |
| `deviceUUID` | `string` | はい | デバイス UUID。 |
| `limit` | `number (>0)` | はい | 返却する最大件数。管理モード以外ではクライアントは 5 を送る。 |

```json
{
  "action": "biz3GetDeviceEmployeeKeys",
  "op": "getLimited",
  "companyID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "limit": 5
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `data` | `array of objects` | 鍵保持者の一覧。フィールドは op=get と同じ。 |
| `hasMore` | `boolean` | トップレベル：limit を超える場合 true。クライアントは「もっと見る」を表示する。 |
