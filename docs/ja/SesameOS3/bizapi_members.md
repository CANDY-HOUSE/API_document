---
title: メンバーと権限
---
# メンバーと権限

接続方法、メッセージ形式、共通のレスポンスフィールドは [WebSocket API](./bizapi.md) を参照してください。

**API 目次**

| action | 操作 |
| --- | --- |
| [`biz3GetLoginUser`](#biz3getloginuser) | - |
| [`biz3ManageCompany`](#biz3managecompany) | [get](#biz3managecompany-get)、[add](#biz3managecompany-add)、[delete](#biz3managecompany-delete)、[updateName](#biz3managecompany-updatename) |
| [`biz3ManageEmployee`](#biz3manageemployee) | [get](#biz3manageemployee-get)、[add](#biz3manageemployee-add)、[update](#biz3manageemployee-update)、[delete](#biz3manageemployee-delete)、[order](#biz3manageemployee-order)、[currentInfo](#biz3manageemployee-currentinfo) |
| [`biz3ManageEmployeeGroup`](#biz3manageemployeegroup) | [getGroups](#biz3manageemployeegroup-getgroups)、[add](#biz3manageemployeegroup-add)、[update](#biz3manageemployeegroup-update)、[deleteGroups](#biz3manageemployeegroup-deletegroups)、[addBindUser](#biz3manageemployeegroup-addbinduser)、[removeBindUser](#biz3manageemployeegroup-removebinduser)、[getBindDeviceGroup](#biz3manageemployeegroup-getbinddevicegroup)、[removeBindDeviceGroup](#biz3manageemployeegroup-removebinddevicegroup) |
| [`biz3ManageDeviceGroup`](#biz3managedevicegroup) | [getGroups](#biz3managedevicegroup-getgroups)、[add](#biz3managedevicegroup-add)、[update](#biz3managedevicegroup-update)、[deleteGroups](#biz3managedevicegroup-deletegroups)、[addBindDevice](#biz3managedevicegroup-addbinddevice)、[removeBindDevice](#biz3managedevicegroup-removebinddevice)、[getBindUserGroup](#biz3managedevicegroup-getbindusergroup)、[removeBindUserGroup](#biz3managedevicegroup-removebindusergroup) |
| [`biz3ManageEmployeeDevice`](#biz3manageemployeedevice) | [add](#biz3manageemployeedevice-add)、[del](#biz3manageemployeedevice-del)、[get](#biz3manageemployeedevice-get)、[group](#biz3manageemployeedevice-group)、[updateGuestTag](#biz3manageemployeedevice-updateguesttag)、[generateQRToken](#biz3manageemployeedevice-generateqrtoken)、[redeemQRToken](#biz3manageemployeedevice-redeemqrtoken) |
| [`biz3ManageRole`](#biz3managerole) | [get](#biz3managerole-get)、[post](#biz3managerole-post)、[delete](#biz3managerole-delete) |
| [`biz3ManageAccessCtlAuthData`](#biz3manageaccessctlauthdata) | [getCards](#biz3manageaccessctlauthdata-getcards)、[getPasscodes](#biz3manageaccessctlauthdata-getpasscodes)、[getCardsByStpDevice](#biz3manageaccessctlauthdata-getcardsbystpdevice)、[updateCardName](#biz3manageaccessctlauthdata-updatecardname)、[updatePasscodeName](#biz3manageaccessctlauthdata-updatepasscodename)、[updateCardOwner](#biz3manageaccessctlauthdata-updatecardowner)、[postCards](#biz3manageaccessctlauthdata-postcards)、[postPasscodes](#biz3manageaccessctlauthdata-postpasscodes)、[delCards](#biz3manageaccessctlauthdata-delcards)、[delPasscodes](#biz3manageaccessctlauthdata-delpasscodes)、[clearCards](#biz3manageaccessctlauthdata-clearcards)、[clearPasscodes](#biz3manageaccessctlauthdata-clearpasscodes) |

## biz3GetLoginUser {#biz3getloginuser}

ログインユーザーの指定スペース（会社）における情報とクォータを取得する。

### `biz3GetLoginUser` {#biz3getloginuser-request}

スペースへの入室・切替時に、現在ユーザーの customerInfo（会社 ID・ロール・閲覧可能ページ等）とクォータを取得する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `email` | `string` | はい | 名前は email だが、実際にはログインメール、スペース ID（companyID / URL の spaceID / localStorage の curLogin）、またはアプリ内固定値 'ch_CandyhouseMobile' のいずれかが渡される。 |

```json
{
  "action": "biz3GetLoginUser",
  "email": "<companyID>"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `data.customerInfo` | `object` | このスペースでのユーザー情報。クライアントが読むフィールドは以下。 |
| `data.customerInfo.companyID` | `string` | スペース（会社）ID。以降ほぼ全リクエストで使用し、localStorage 'curLogin' にも保存される。 |
| `data.customerInfo.subUUID` | `string` | 現在ユーザーの UUID。 |
| `data.customerInfo.name` | `string` | スペース名。 |
| `data.customerInfo.employeeEmail` | `string` | 現在ユーザーのメールアドレス。 |
| `data.customerInfo.employeeName` | `string` | 現在ユーザーの表示名。 |
| `data.customerInfo.mainEmail` | `string` | メインメール（自分自身をメンバー追加しないためのチェックに使用）。 |
| `data.customerInfo.tag` | `string[]` | ロール名の配列。tag[0] が 'オーナー' または 'マネージャー' の場合、クライアントは全ページの閲覧権限を付与する。 |
| `data.customerInfo.access` | `string[]` | 閲覧可能ページ名の一覧（例: 'ユーザー'、'デバイス（ドア・認証機器）'、'カード管理'、'全体履歴'、'開発者向け'）。 |
| `data.customerInfo.isSesameApp` | `boolean` | 個人（Sesame App）スペースかどうか。true の場合 '開発者向け' ページが追加される。 |
| `data.customerInfo.isAnonymous` | `boolean` | 匿名／ゲストセッションかどうか（アプリ内で使用）。 |
| `data.customerInfo.isRootUser` | `boolean` | ルートユーザーかどうか（ホーム画面で使用）。 |
| `data.customerInfo.envId` | `string` | 環境 ID（アプリ内で historyTag として使用）。 |
| `data.customerInfo.isCS` | `boolean` | カスタマーサポート用アカウントかどうか（メニュー表示制御）。 |
| `data.quotas` | `object` | クォータ。クライアントは quotas.memberCount（メンバー上限）と quotas.lockCount を読む。 |

::: info 補足
この action には op フィールドがない。応答受信後、クライアントは自動で biz3ManageCompany/get を送信する。
:::

## biz3ManageCompany {#biz3managecompany}

スペース（会社）の一覧取得・作成・削除・名称変更。

### get {#biz3managecompany-get}

現在ユーザーが所属する全スペースを取得する。

**リクエスト**

追加パラメータはありません。

```json
{
  "action": "biz3ManageCompany",
  "op": "get"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 処理が成功したかどうか。 |
| `data` | `array<object>` | スペース一覧（success が true の場合のみ使用）。 |
| `data[].companyID` | `string` | スペース ID。 |
| `data[].name` | `string` | スペース名。 |
| `data[].isSesameApp` | `boolean` | 個人（Sesame App）スペースか。切替時の遷移先（'/' か '/biz'）を決める。 |
| `data[].feeLevel` | `object` | プラン情報。feeLevel.level・feeLevel.isRootUser・feeLevel.subscriptionId を読む。 |
| `data[].tag` | `string[]` | そのスペースでのロール（個人スペースモードで tag[0]==='オーナー' 判定に使用）。 |
| `data[].employeeEmail` | `string` | そのスペースでのユーザーメール。 |

::: info 補足
アプリ外でのみ送信。tag / employeeEmail が常に存在するかはコードから確認できない。
:::

### add {#biz3managecompany-add}

新しいスペース（会社）を作成する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `name` | `string` | はい | 新しいスペース名。 |
| `employeeEmail` | `string` | はい | 作成者のメール（customerInfo.employeeEmail）。 |
| `subUUID` | `string` | はい | 作成者のユーザー UUID（customerInfo.subUUID）。 |

```json
{
  "action": "biz3ManageCompany",
  "op": "add",
  "name": "New Office",
  "employeeEmail": "user@example.com",
  "subUUID": "00000000-0000-4000-8000-000000000001"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 処理が成功したかどうか。 |
| `data` | `object` | 作成されたスペース。一覧に追加される（get の data[] と同形）。 |

### delete {#biz3managecompany-delete}

現在のスペースを削除する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `companyID` | `string` | はい | 削除するスペース ID（priorityCompany.companyID）。 |

```json
{
  "action": "biz3ManageCompany",
  "op": "delete",
  "companyID": "<companyID>"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 処理が成功したかどうか。 |
| `message` | `string` | 失敗時のエラーメッセージ（そのまま表示される）。 |
| `data.deletedCompanyId` | `string` | 削除されたスペース ID。一覧から除去される。 |
| `data.curCompanyID` | `string` | 削除後に切り替えるスペース ID。curLogin に保存し biz3GetLoginUser を再実行する。 |

::: info 補足
UI では削除ボタンはオーナー（tag[0]==='オーナー'）のみに表示。
:::

### updateName {#biz3managecompany-updatename}

スペース名を変更する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `obj` | `object` | はい | 変更パラメータ。 |
| `obj.companyID` | `string` | はい | スペース ID（priorityCompany.companyID）。 |
| `obj.name` | `string` | はい | 新しい名称。 |

```json
{
  "action": "biz3ManageCompany",
  "op": "updateName",
  "obj": {
    "companyID": "<companyID>",
    "name": "Renamed Office"
  }
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 処理が成功したかどうか。 |
| `data.companyID` | `string` | 名称変更されたスペース ID。 |
| `data.name` | `string` | 新しい名称。 |

::: info 補足
UI ではオーナーのみ編集可能。
:::

## biz3ManageEmployee {#biz3manageemployee}

スペースメンバー（連絡先）の取得・追加・更新・削除・並べ替えと現在ユーザー情報。

### get {#biz3manageemployee-get}

メンバー一覧を要求する。一覧はサーバープッシュの 'pubEmployees' メッセージでページ単位に届く。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `companyID` | `string` | はい | スペース ID。 |

```json
{
  "action": "biz3ManageEmployee",
  "op": "get",
  "companyID": "<companyID>"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `(op 'get' reply)` | `-` | op 'get' の直接応答からクライアントは何も読まない。 |
| `pubEmployees: data.totalCount` | `number` | プッシュメッセージ（op='pubEmployees'）内のメンバー総数。 |
| `pubEmployees: data.data.page` | `number` | ページ番号。1 の場合は一覧を置き換え、それ以外は追加。 |
| `pubEmployees: data.data.list` | `array<object>` | メンバーオブジェクト: subUUID、employeeName、employeeEmail、tag（ロール名配列）、department、phone など。 |

::: info 補足
ページ単位のプッシュ。直近 10 秒以内に削除したメンバーはクライアント側で除外される。
:::

### add {#biz3manageemployee-add}

スペースにメンバーを追加する。メール／名前指定（CSV 一括可）またはフレンド QR コード経由。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `items` | `array<object>` | はい | 追加するメンバーの配列。 |
| `items[].companyID` | `string` | はい | スペース ID。 |
| `items[].employeeEmail` | `string` | いいえ | メンバーのメール（メール追加時は必須。オーナーのメールと同一不可）。 |
| `items[].employeeName` | `string` | いいえ | メンバー名（メール追加時は必須）。 |
| `items[].tag` | `string[]` | いいえ | 割り当てるロール名の配列（CSV 取込時にロール一覧から選択、'ゲスト' は除外）。 |
| `items[].phone` | `string` | いいえ | 電話番号（任意）。 |
| `items[].department` | `string` | いいえ | 所属（任意）。 |
| `items[].friendID` | `string` | いいえ | フレンドのユーザー UUID（小文字）。QR コードやアプリから追加する場合に使用し、メール／名前は付けない。 |

```json
{
  "action": "biz3ManageEmployee",
  "op": "add",
  "items": [
    {
      "companyID": "<companyID>",
      "employeeEmail": "member@example.com",
      "employeeName": "Taro",
      "tag": [],
      "phone": "000-0000-0000",
      "department": "Sales"
    }
  ]
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 処理が成功したかどうか。 |
| `message` | `string` | 失敗時のエラーメッセージ（そのまま表示される）。 |

::: info 補足
message が 'Limit Exceeded' の場合はメンバー上限超過。'ユーザーは存在しません' と「メールアドレスとユーザー名必須」のメッセージはローカライズされる。成功後 get を再送する。
:::

### update {#biz3manageemployee-update}

メンバー情報（名前／所属／電話）を更新、または自分のニックネームを変更する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `obj` | `object` | はい | 更新内容。companyID と以下いずれかの形式を含む。 |
| `obj.companyID` | `string` | はい | スペース ID。 |
| `obj.subUUID` | `string` | いいえ | 形式 1: 対象メンバーの UUID。変更するフィールドを 1 つだけ付ける。 |
| `obj.employeeName` | `string` | いいえ | 形式 1: 新しい名前。 |
| `obj.department` | `string` | いいえ | 形式 1: 新しい所属。 |
| `obj.phone` | `string` | いいえ | 形式 1: 新しい電話番号。 |
| `obj.Name` | `string` | いいえ | 形式 2（自分のニックネーム）: 固定値 'name'。 |
| `obj.Value` | `string` | いいえ | 形式 2: 新しいニックネーム。 |

```json
{
  "action": "biz3ManageEmployee",
  "op": "update",
  "obj": {
    "companyID": "<companyID>",
    "subUUID": "00000000-0000-4000-8000-000000000002",
    "department": "Sales"
  }
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 処理が成功したかどうか。 |

::: info 補足
成功後 get を再送する。
:::

### delete {#biz3manageemployee-delete}

スペースからメンバーを削除する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `items` | `array<object>` | はい | 削除するメンバーの配列（一覧の完全なメンバーオブジェクト、または最低限 {subUUID, companyID}）。 |
| `items[].subUUID` | `string` | はい | メンバー UUID。 |
| `items[].companyID` | `string` | いいえ | スペース ID（個人スペースモードで明示的に渡す）。 |

```json
{
  "action": "biz3ManageEmployee",
  "op": "delete",
  "items": [
    {
      "subUUID": "00000000-0000-4000-8000-000000000002",
      "companyID": "<companyID>"
    }
  ]
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 処理が成功したかどうか。 |
| `message` | `string` | 失敗時のエラーメッセージ（そのまま表示される）。 |

::: info 補足
一覧 UI では tag[0]==='オーナー' のメンバーは選択不可、自分自身も削除不可。
:::

### order {#biz3manageemployee-order}

連絡先一覧のドラッグ並べ替え順を保存する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `items` | `array<object>` | はい | 新しい順序の全連絡先。 |
| `items[].friendUUID` | `string` | はい | 連絡先の subUUID。 |
| `items[].rank` | `number` | はい | 順位 = -インデックス（0, -1, -2 ...）。大きいほど上位。 |

```json
{
  "action": "biz3ManageEmployee",
  "op": "order",
  "items": [
    {
      "friendUUID": "00000000-0000-4000-8000-000000000001",
      "rank": 0
    },
    {
      "friendUUID": "00000000-0000-4000-8000-000000000002",
      "rank": -1
    }
  ]
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 処理が成功したかどうか。 |

::: info 補足
失敗時は get を再送する。
:::

### currentInfo {#biz3manageemployee-currentinfo}

ログインユーザー自身のプロフィール（ニックネーム・メール・最近のログイン）を取得する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `excludeLogins` | `boolean` | いいえ | true の場合、最近のログイン記録は不要（true のときのみ付与）。 |

```json
{
  "action": "biz3ManageEmployee",
  "op": "currentInfo",
  "excludeLogins": true
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 処理が成功したかどうか。 |
| `data.name` | `string` | ニックネーム。 |
| `data.email` | `string` | メールアドレス。 |
| `data.sub` | `string` | ユーザー ID（プロフィール画面に表示）。 |
| `data.recentLogins` | `string[]` | 最近のログイン記録。各要素は JSON 文字列で、単一キーオブジェクトの配列にパースされ、'model' と 'collectedAt' を読む。 |

::: info 補足
リクエストに companyID は含まれない。
:::

## biz3ManageEmployeeGroup {#biz3manageemployeegroup}

ユーザーグループの管理と、デバイスグループ（グループ鍵）との紐付け。

### getGroups {#biz3manageemployeegroup-getgroups}

スペース内の全ユーザーグループを取得する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `cid` | `string` | はい | スペース ID。 |

```json
{
  "action": "biz3ManageEmployeeGroup",
  "op": "getGroups",
  "cid": "<companyID>"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `data` | `array<object>` | ユーザーグループ一覧。 |
| `data[].gid` | `string` | ユーザーグループ ID。 |
| `data[].name` | `string` | グループ名。 |
| `data[].uuids` | `string[]` | グループメンバーの subUUID 一覧。 |
| `data[].deviceGroups` | `string[]` | 紐付いたデバイスグループの gid 一覧。 |

### add {#biz3manageemployeegroup-add}

ユーザーグループを作成する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `obj` | `object` | はい | 新規グループのパラメータ。 |
| `obj.cid` | `string` | はい | スペース ID。 |
| `obj.name` | `string` | はい | グループ名。 |
| `obj.uuids` | `string[]` | はい | 初期メンバーの subUUID 一覧。 |

```json
{
  "action": "biz3ManageEmployeeGroup",
  "op": "add",
  "obj": {
    "cid": "<companyID>",
    "name": "Team A",
    "uuids": [
      "00000000-0000-4000-8000-000000000001",
      "00000000-0000-4000-8000-000000000002"
    ]
  }
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `data` | `object` | 作成されたグループ。一覧に追加される（getGroups の data[] と同形）。 |

### update {#biz3manageemployeegroup-update}

ユーザーグループ名を変更する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `obj` | `object` | はい | 更新パラメータ。 |
| `obj.cid` | `string` | はい | スペース ID。 |
| `obj.gid` | `string` | はい | ユーザーグループ ID。 |
| `obj.name` | `string` | はい | 新しいグループ名。 |

```json
{
  "action": "biz3ManageEmployeeGroup",
  "op": "update",
  "obj": {
    "cid": "<companyID>",
    "gid": "<gid>",
    "name": "Team B"
  }
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 処理が成功したかどうか。 |

### deleteGroups {#biz3manageemployeegroup-deletegroups}

ユーザーグループを一括削除する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `cid` | `string` | はい | スペース ID。 |
| `objs` | `string[]` | はい | 削除するグループの gid 一覧（文字列配列）。 |

```json
{
  "action": "biz3ManageEmployeeGroup",
  "op": "deleteGroups",
  "cid": "<companyID>",
  "objs": [
    "<gid>"
  ]
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `(none)` | `-` | フィールドは読まず、getGroups を再送する。 |

::: info 補足
注意: biz3ManageDeviceGroup/deleteGroups と異なり、objs は文字列配列で cid はトップレベル。
:::

### addBindUser {#biz3manageemployeegroup-addbinduser}

ユーザーグループにメンバーを追加する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `cid` | `string` | はい | スペース ID。 |
| `gid` | `string` | はい | ユーザーグループ ID。 |
| `uuids` | `string[]` | はい | 追加前のグループ現メンバーの subUUID 一覧。 |
| `items` | `array<object>` | はい | 追加するメンバー（メンバー一覧の完全なオブジェクト、subUUID を含む）。 |

```json
{
  "action": "biz3ManageEmployeeGroup",
  "op": "addBindUser",
  "cid": "<companyID>",
  "gid": "<gid>",
  "uuids": [
    "00000000-0000-4000-8000-000000000001"
  ],
  "items": [
    {
      "subUUID": "00000000-0000-4000-8000-000000000002",
      "employeeName": "Taro",
      "employeeEmail": "member@example.com"
    }
  ]
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 処理が成功したかどうか。 |

::: info 補足
成功後 getGroups を再送する。サーバーが uuids をどう使うかはクライアントコードからは不明。
:::

### removeBindUser {#biz3manageemployeegroup-removebinduser}

ユーザーグループからメンバーを外す。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `cid` | `string` | はい | スペース ID。 |
| `gid` | `string` | はい | ユーザーグループ ID。 |
| `uuids` | `string[]` | はい | 削除前のグループ現メンバーの subUUID 一覧。 |
| `items` | `array<{subUUID: string}>` | はい | 外すメンバー（subUUID のみ）。 |

```json
{
  "action": "biz3ManageEmployeeGroup",
  "op": "removeBindUser",
  "cid": "<companyID>",
  "gid": "<gid>",
  "uuids": [
    "00000000-0000-4000-8000-000000000001",
    "00000000-0000-4000-8000-000000000002"
  ],
  "items": [
    {
      "subUUID": "00000000-0000-4000-8000-000000000002"
    }
  ]
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 処理が成功したかどうか。 |

::: info 補足
成功後 getGroups を再送する。
:::

### getBindDeviceGroup {#biz3manageemployeegroup-getbinddevicegroup}

ユーザーグループに付与されたデバイスグループ鍵（グループ鍵）を取得する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `gid` | `string` | はい | ユーザーグループ ID。 |

```json
{
  "action": "biz3ManageEmployeeGroup",
  "op": "getBindDeviceGroup",
  "gid": "<gid>"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `data` | `array<object>` | 紐付けレコード一覧。 |
| `data[].mid` | `string` | ユーザー（メンバー）グループ ID。 |
| `data[].did` | `string` | デバイスグループ ID。 |
| `data[].keyLevel` | `number\|string` | 鍵レベル: 0=オーナー、1=マネージャー、2=ゲスト。 |
| `data[].startTime` | `number` | 有効期間開始（Unix 秒）。空なら常時利用。 |
| `data[].endTime` | `number` | 有効期間終了（Unix 秒）。 |

::: info 補足
リクエストに cid は含まれない。
:::

### removeBindDeviceGroup {#biz3manageemployeegroup-removebinddevicegroup}

ユーザーグループとデバイスグループ間のグループ鍵を解除する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `cid` | `string` | はい | スペース ID。 |
| `mid` | `string` | はい | ユーザーグループ ID。 |
| `did` | `string` | はい | デバイスグループ ID。 |
| `keyLevel` | `number\|string` | はい | その紐付けの鍵レベル（getBindDeviceGroup から）。 |

```json
{
  "action": "biz3ManageEmployeeGroup",
  "op": "removeBindDeviceGroup",
  "cid": "<companyID>",
  "mid": "<gid>",
  "did": "<deviceGroupGid>",
  "keyLevel": 1
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 処理が成功したかどうか。 |

## biz3ManageDeviceGroup {#biz3managedevicegroup}

デバイス（ドア）グループの管理と、ユーザーグループ（グループ鍵）との紐付け。

### getGroups {#biz3managedevicegroup-getgroups}

スペース内の全デバイスグループを取得する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `cid` | `string` | はい | スペース ID。 |

```json
{
  "action": "biz3ManageDeviceGroup",
  "op": "getGroups",
  "cid": "<companyID>"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `data` | `array<object>` | デバイスグループ一覧。 |
| `data[].gid` | `string` | デバイスグループ ID。 |
| `data[].name` | `string` | グループ名。 |
| `data[].uuids` | `string[]` | グループ内デバイスの deviceUUID 一覧。 |
| `data[].employeeGroups` | `string[]` | 紐付いたユーザーグループの gid 一覧。 |

### add {#biz3managedevicegroup-add}

デバイスグループを作成する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `obj` | `object` | はい | 新規グループのパラメータ。 |
| `obj.name` | `string` | はい | グループ名。 |
| `obj.cid` | `string` | はい | スペース ID。 |
| `obj.uuids` | `string[]` | はい | 初期デバイスの deviceUUID 一覧。 |

```json
{
  "action": "biz3ManageDeviceGroup",
  "op": "add",
  "obj": {
    "name": "1F Doors",
    "cid": "<companyID>",
    "uuids": [
      "11111111-1111-4111-8111-111111111111",
      "11111111-1111-4111-8111-111111111112"
    ]
  }
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `(none)` | `-` | フィールドは読まず、getGroups を再送する。 |

### update {#biz3managedevicegroup-update}

デバイスグループ名を変更する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `obj` | `object` | はい | 更新パラメータ。 |
| `obj.cid` | `string` | はい | スペース ID。 |
| `obj.gid` | `string` | はい | デバイスグループ ID。 |
| `obj.name` | `string` | はい | 新しいグループ名。 |

```json
{
  "action": "biz3ManageDeviceGroup",
  "op": "update",
  "obj": {
    "cid": "<companyID>",
    "gid": "<deviceGroupGid>",
    "name": "2F Doors"
  }
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 処理が成功したかどうか。 |

### deleteGroups {#biz3managedevicegroup-deletegroups}

デバイスグループを一括削除する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `objs` | `array<{gid: string, cid: string}>` | はい | 削除するグループ。各要素に gid と cid（スペース ID）。 |

```json
{
  "action": "biz3ManageDeviceGroup",
  "op": "deleteGroups",
  "objs": [
    {
      "gid": "<deviceGroupGid>",
      "cid": "<companyID>"
    }
  ]
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `(none)` | `-` | フィールドは読まず、getGroups を再送する。 |

::: info 補足
注意: ユーザーグループの deleteGroups と異なり、objs はオブジェクト配列で cid は各要素内。
:::

### addBindDevice {#biz3managedevicegroup-addbinddevice}

デバイスグループにデバイスを追加する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `cid` | `string` | はい | スペース ID。 |
| `gid` | `string` | はい | デバイスグループ ID。 |
| `uuids` | `string[]` | はい | 追加前のグループ内 deviceUUID 一覧。 |
| `items` | `array<object>` | はい | 追加するデバイス（デバイス一覧の完全なオブジェクト。deviceUUID・deviceName・deviceModel・secretKey・keyLevel・stateInfo など）。 |

```json
{
  "action": "biz3ManageDeviceGroup",
  "op": "addBindDevice",
  "cid": "<companyID>",
  "gid": "<deviceGroupGid>",
  "uuids": [
    "11111111-1111-4111-8111-111111111111"
  ],
  "items": [
    {
      "deviceUUID": "11111111-1111-4111-8111-111111111112",
      "deviceName": "Front door",
      "deviceModel": "<deviceModel>",
      "secretKey": "<secretKeyHex>",
      "keyLevel": 0
    }
  ]
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `(none)` | `-` | フィールドは読まず、コールバックで getGroups を再送する。 |

::: info 補足
items のデバイスオブジェクトのフィールドは biz3ManageDevice の応答に由来し、本書の範囲外。
:::

### removeBindDevice {#biz3managedevicegroup-removebinddevice}

デバイスグループからデバイスを外す。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `cid` | `string` | はい | スペース ID。 |
| `gid` | `string` | はい | デバイスグループ ID。 |
| `uuids` | `string[]` | はい | 削除前のグループ内 deviceUUID 一覧。 |
| `items` | `array<{deviceUUID: string, secretKey: string}>` | はい | 外すデバイス（deviceUUID と secretKey のみ）。 |

```json
{
  "action": "biz3ManageDeviceGroup",
  "op": "removeBindDevice",
  "cid": "<companyID>",
  "gid": "<deviceGroupGid>",
  "uuids": [
    "11111111-1111-4111-8111-111111111111",
    "11111111-1111-4111-8111-111111111112"
  ],
  "items": [
    {
      "deviceUUID": "11111111-1111-4111-8111-111111111112",
      "secretKey": "<secretKeyHex>"
    }
  ]
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `(none)` | `-` | フィールドは読まず、コールバックで getGroups を再送する。 |

### getBindUserGroup {#biz3managedevicegroup-getbindusergroup}

デバイスグループのグループ鍵を持つユーザーグループを取得する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `gid` | `string` | はい | デバイスグループ ID。 |

```json
{
  "action": "biz3ManageDeviceGroup",
  "op": "getBindUserGroup",
  "gid": "<deviceGroupGid>"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `data` | `array<object>` | 紐付けレコード一覧。 |
| `data[].mid` | `string` | ユーザーグループ ID。 |
| `data[].keyLevel` | `number\|string` | 鍵レベル: 0=オーナー、1=マネージャー、2=ゲスト。 |
| `data[].startTime` | `number` | 有効期間開始（Unix 秒）。空なら常時利用。 |
| `data[].endTime` | `number` | 有効期間終了（Unix 秒）。 |

::: info 補足
リクエストに cid は含まれない。
:::

### removeBindUserGroup {#biz3managedevicegroup-removebindusergroup}

デバイスグループとユーザーグループ間のグループ鍵を解除する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `cid` | `string` | はい | スペース ID。 |
| `mid` | `string` | はい | ユーザーグループ ID。 |
| `did` | `string` | はい | デバイスグループ ID。 |
| `keyLevel` | `number\|string` | はい | その紐付けの鍵レベル（getBindUserGroup から）。 |

```json
{
  "action": "biz3ManageDeviceGroup",
  "op": "removeBindUserGroup",
  "cid": "<companyID>",
  "mid": "<gid>",
  "did": "<deviceGroupGid>",
  "keyLevel": 1
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `(none)` | `-` | フィールドは読まず、コールバックで紐付け一覧を再取得する。 |

## biz3ManageEmployeeDevice {#biz3manageemployeedevice}

メンバーのデバイス鍵: 共有・取消・取得・グループ単位共有・ゲスト鍵ラベル・共有 QR コード。

### add {#biz3manageemployeedevice-add}

デバイス鍵を 1 人以上のメンバーに共有する（メンバー×デバイスの組ごとに 1 要素）。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `items` | `array<object>` | はい | 共有する鍵。メンバー×デバイスの組ごとに 1 要素。 |
| `items[].subUUID` | `string` | はい | 鍵を受け取るメンバーの UUID。 |
| `items[].deviceUUID` | `string` | はい | デバイス UUID。 |
| `items[].keyLevel` | `number` | はい | 鍵レベル: 0=オーナー、1=マネージャー、2=ゲスト。 |
| `items[].deviceModel` | `string` | いいえ | デバイスモデル（デバイス一覧の値）。 |
| `items[].deviceName` | `string` | いいえ | デバイス名（デバイス一覧の値）。 |
| `items[].keyIndex` | `string` | いいえ | 鍵インデックス（デバイス一覧の値）。 |
| `items[].secretKey` | `string` | いいえ | デバイスの秘密鍵（デバイス一覧の値）。keyLevel=2 の場合、サーバーが新しいゲストキー ID を生成して置き換えます。 |
| `items[].sesame2PublicKey` | `string` | いいえ | デバイスの公開鍵（デバイス一覧の値）。 |
| `items[].startTime` | `number` | いいえ | ゲストキーの開始時刻（Unix 秒）。keyLevel=2 のときのみ使用。省略すると制限なし。 |
| `items[].endTime` | `number` | いいえ | ゲストキーの終了時刻（Unix 秒）。keyLevel=2 のときのみ使用。省略すると制限なし。 |
| `items[].keyName` | `string` | いいえ | ゲストキー名。keyLevel=2 のときのみ使用。省略すると現在のタイムスタンプ。 |
| `items[].historyTag` | `string` | いいえ | ゲストキーの履歴タグ。keyLevel=2 のときのみ使用。 |

```json
{
  "action": "biz3ManageEmployeeDevice",
  "op": "add",
  "items": [
    {
      "subUUID": "00000000-0000-4000-8000-000000000002",
      "deviceUUID": "11111111-1111-4111-8111-111111111111",
      "keyLevel": 2,
      "deviceModel": "sesame_5",
      "deviceName": "Front door",
      "keyIndex": "<keyIndex>",
      "secretKey": "<secretKey>",
      "sesame2PublicKey": "<sesame2PublicKey>",
      "startTime": 1700000000,
      "endTime": 1700086400
    }
  ]
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 処理が成功したかどうか。 |

::: info 補足
UI では自分がオーナー鍵を持つ場合のみ keyLevel=0 を選択可能。ゲスト鍵のデバイスは共有不可。デバイス一覧での並び順はサーバーが割り当てるため、並び順のフィールドは不要です。
:::

### del {#biz3manageemployeedevice-del}

メンバーのデバイス鍵を取り消す、またはゲスト鍵を削除する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | はい | デバイス UUID。 |
| `subUUID` | `string` | いいえ | 形式 1: 鍵を取り消すメンバーの UUID。 |
| `guestKeyId` | `string` | いいえ | 形式 2: ゲスト鍵 ID（ユーザーに guestKeyId がある場合）。 |
| `randomTag` | `string` | いいえ | 形式 2 で必須: デバイス secretKey で現在 Unix 秒（リトルエンディアン 4 バイトの 1〜3 バイト目）を AES-CMAC し、先頭 8 桁の 16 進文字。 |

```json
{
  "action": "biz3ManageEmployeeDevice",
  "op": "del",
  "subUUID": "00000000-0000-4000-8000-000000000002",
  "deviceUUID": "11111111-1111-4111-8111-111111111111"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 処理が成功したかどうか。 |

### get {#biz3manageemployeedevice-get}

メンバーが持つ全デバイス鍵を取得する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `subUUID` | `string` | はい | メンバー UUID。 |

```json
{
  "action": "biz3ManageEmployeeDevice",
  "op": "get",
  "subUUID": "00000000-0000-4000-8000-000000000002"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 処理が成功したかどうか。 |
| `data` | `array<object>` | 鍵一覧。 |
| `data[].deviceUUID` | `string` | デバイス UUID。 |
| `data[].subUUID` | `string` | 保有者 UUID。 |
| `data[].keyLevel` | `number\|string` | 鍵レベル: 0=オーナー、1=マネージャー、2=ゲスト。 |
| `data[].startAt` | `number` | 有効期間開始（Unix 秒）。endAt と共に値があれば一時鍵。 |
| `data[].endAt` | `number` | 有効期間終了（Unix 秒）。 |

### group {#biz3manageemployeedevice-group}

1 つ以上のデバイスグループの鍵をユーザーグループに共有する（グループ鍵）。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `companyID` | `string` | はい | スペース ID。 |
| `keyLevel` | `string` | はい | 鍵レベル（文字列）: '0'=オーナー、'1'=マネージャー、'2'=ゲスト。 |
| `members` | `string[]` | はい | ユーザーグループメンバーの subUUID 一覧。 |
| `devices` | `string[]` | はい | 選択したデバイスグループ内の全 deviceUUID（重複除去）。 |
| `mid` | `string` | はい | ユーザーグループ gid。 |
| `dids` | `string[]` | はい | 選択したデバイスグループの gid 一覧。 |
| `startTime` | `number\|string` | いいえ | keyLevel='2' の場合のみ: 一時利用開始（Unix 秒）、常時利用は空文字。 |
| `endTime` | `number\|string` | いいえ | keyLevel='2' の場合のみ: 一時利用終了（Unix 秒）、常時利用は空文字。 |

```json
{
  "action": "biz3ManageEmployeeDevice",
  "op": "group",
  "companyID": "<companyID>",
  "keyLevel": "2",
  "members": [
    "00000000-0000-4000-8000-000000000001",
    "00000000-0000-4000-8000-000000000002"
  ],
  "devices": [
    "11111111-1111-4111-8111-111111111111",
    "11111111-1111-4111-8111-111111111112"
  ],
  "mid": "<gid>",
  "dids": [
    "<deviceGroupGid>"
  ],
  "startTime": "",
  "endTime": ""
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `(none)` | `-` | フィールドは読まず、コールバックでローディングを終了するのみ。 |

### updateGuestTag {#biz3manageemployeedevice-updateguesttag}

ゲスト鍵の表示名（タグ）を変更する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | はい | デバイス UUID。 |
| `guestKeyId` | `string` | はい | ゲスト鍵 ID。 |
| `keyName` | `string` | はい | 新しい名称。 |

```json
{
  "action": "biz3ManageEmployeeDevice",
  "op": "updateGuestTag",
  "deviceUUID": "11111111-1111-4111-8111-111111111111",
  "guestKeyId": "<guestKeyId>",
  "keyName": "Visitor"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 処理が成功したかどうか。 |

### generateQRToken {#biz3manageemployeedevice-generateqrtoken}

デバイス鍵共有用の QR コードトークンを生成する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | はい | デバイス UUID。 |
| `keyLevel` | `number` | はい | 鍵レベル: 0=オーナー、1=マネージャー、2=ゲスト。UI では自分のレベル以上のみ選択可。 |
| `guestKeyId` | `string` | いいえ | 既存ゲスト鍵を共有する場合のゲスト鍵 ID。 |
| `name` | `string` | いいえ | 既存ゲスト鍵を共有する場合の鍵名。 |
| `isSecure` | `boolean` | いいえ | セキュアモードを無効にする場合のみ false を送る。省略時はセキュア。 |

```json
{
  "action": "biz3ManageEmployeeDevice",
  "op": "generateQRToken",
  "deviceUUID": "11111111-1111-4111-8111-111111111111",
  "keyLevel": 2
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 処理が成功したかどうか。 |
| `data.qrToken` | `string` | QR コードの内容（URL）。そのまま QR コードとして描画される。 |

### redeemQRToken {#biz3manageemployeedevice-redeemqrtoken}

読み取った QR コード URL をサーバーで引き換え、実際のデバイス鍵情報を得る。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `qrToken` | `string` | はい | 読み取った QR コードの URL。 |

```json
{
  "action": "biz3ManageEmployeeDevice",
  "op": "redeemQRToken",
  "qrToken": "https://example.com/qr?t=..."
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 処理が成功したかどうか。 |
| `message` | `string` | 失敗時のエラーメッセージ（そのまま表示される）。 |
| `data` | `string` | 引き換え後の URL。'sk' パラメータは base64 のデバイス鍵データ（先頭バイトが製品種別、続いて secretKey・公開鍵・keyIndex など）。 |

::: info 補足
アプリ側コードのコメントによると、引き換え時にサーバーがデバイスを紐付け、クライアントは遷移用に機種を解析するのみ。
:::

## biz3ManageRole {#biz3managerole}

スペースのロールと、ロールごとの閲覧可能ページの管理。

### get {#biz3managerole-get}

スペース内の全ロールを取得する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `companyID` | `string` | はい | スペース ID。 |

```json
{
  "action": "biz3ManageRole",
  "op": "get",
  "companyID": "<companyID>"
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 処理が成功したかどうか。 |
| `message` | `string` | 失敗時のエラーメッセージ（そのまま表示される）。 |
| `data` | `array<object>` | ロール一覧。 |
| `data[].tag` | `string` | ロール名。組込みロールは 'オーナー'・'マネージャー'・'ゲスト'。 |
| `data[].access` | `string[]` | 閲覧可能ページ名の一覧。 |
| `data[].companyID` | `string` | スペース ID。 |

::: info 補足
組込みロールは UI で編集不可。オーナーとマネージャーは全ページ、ゲストは '権限なし'。
:::

### post {#biz3managerole-post}

ロールを作成、または既存ロールの閲覧可能ページを上書きする。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `companyID` | `string` | はい | スペース ID。 |
| `tag` | `string` | はい | ロール名。 |
| `access` | `string[]` | はい | 閲覧可能ページ名。値は 'ユーザー'・'デバイス（ドア・認証機器）'・'カード管理'・'全体履歴'・'開発者向け' から選ぶ。 |

```json
{
  "action": "biz3ManageRole",
  "op": "post",
  "companyID": "<companyID>",
  "tag": "Staff",
  "access": [
    "ユーザー",
    "カード管理"
  ]
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 処理が成功したかどうか。 |
| `message` | `string` | 失敗時のエラーメッセージ（そのまま表示される）。 |

::: info 補足
既存ロール編集時はロールオブジェクト全体（tag・access・companyID）を上書きとして送る。成功後 get を再送する。
:::

### delete {#biz3managerole-delete}

ロールを削除する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `companyID` | `string` | はい | スペース ID。 |
| `tag` | `string` | はい | 削除するロール名。 |
| `access` | `string[]` | いいえ | ロールオブジェクトの他フィールドも送られる（access と、クライアント内部用の isShowAdd: true）。 |

```json
{
  "action": "biz3ManageRole",
  "op": "delete",
  "companyID": "<companyID>",
  "tag": "Staff",
  "access": [
    "ユーザー"
  ]
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 処理が成功したかどうか。 |
| `message` | `string` | 失敗時のエラーメッセージ（そのまま表示される）。 |

::: info 補足
組込みロールは UI で削除不可。成功後 get を再送する。
:::

## biz3ManageAccessCtlAuthData {#biz3manageaccessctlauthdata}

認証機器（Sesame Touch など）の NFC カードと暗証番号のサーバー側データ管理。

### getCards {#biz3manageaccessctlauthdata-getcards}

1 台以上の認証機器に現在紐付く NFC カードを要求する。データは機器ごとにページ単位の 'pubCardLinkedIDs' プッシュで届く。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `obj` | `object` | はい | 検索パラメータ。 |
| `obj.devices` | `string` | はい | カンマ区切りの認証機器 deviceUUID。 |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "getCards",
  "obj": {
    "devices": "11111111-1111-4111-8111-111111111111,11111111-1111-4111-8111-111111111112"
  }
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `(op 'getCards' reply)` | `-` | 直接応答はロード完了の目印のみで、フィールドは読まない。 |
| `pubCardLinkedIDs: data.deviceUUID` | `string` | プッシュ（op='pubCardLinkedIDs'）の認証機器 UUID。 |
| `pubCardLinkedIDs: data.page` | `number` | ページ番号。1 はその機器の一覧を置換、それ以外は追加。 |
| `pubCardLinkedIDs: data.list` | `array<object>` | カードレコード。cardID・name・nameUUID・cardType・deviceID（認証機器 UUID）・subUUID（所有メンバー）を読む。 |

::: info 補足
op は定数 AuthDataOpType.getCards = 'getCards'。データは clearCards / delCards で消えるテーブル由来で、機器の現在のカードのみを示す。
:::

### getPasscodes {#biz3manageaccessctlauthdata-getpasscodes}

認証機器に現在紐付く暗証番号を要求する。データは機器ごとにページ単位の 'pubPasscodeLinkedIDs' プッシュで届く。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `obj` | `object` | はい | 検索パラメータ。 |
| `obj.devices` | `string` | はい | カンマ区切りの認証機器 deviceUUID。 |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "getPasscodes",
  "obj": {
    "devices": "11111111-1111-4111-8111-111111111111"
  }
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `(op 'getPasscodes' reply)` | `-` | 直接応答はロード完了の目印のみ。 |
| `pubPasscodeLinkedIDs: data.deviceUUID` | `string` | プッシュの認証機器 UUID。 |
| `pubPasscodeLinkedIDs: data.page` | `number` | ページ番号。1 は置換、それ以外は追加。 |
| `pubPasscodeLinkedIDs: data.list` | `array<object>` | 暗証番号レコード。passwordID・name・nameUUID・passwordType・deviceID（認証機器 UUID）を読む。 |

::: info 補足
op は定数 AuthDataOpType.getPasscodes = 'getPasscodes'。
:::

### getCardsByStpDevice {#biz3manageaccessctlauthdata-getcardsbystpdevice}

認証機器にこれまで登録された全カード（削除済み履歴を含む）をページ単位で取得する。エクスポート用。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `obj` | `object` | はい | 検索パラメータ。 |
| `obj.stpDeviceUUID` | `string` | はい | 認証機器 UUID。 |
| `obj.lastKey` | `string\|null` | いいえ | ページングカーソル。最初は null、以降は前回応答の lastKey。 |
| `obj.pageSize` | `number` | いいえ | 1 ページの件数。既定 500。 |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "getCardsByStpDevice",
  "obj": {
    "stpDeviceUUID": "11111111-1111-4111-8111-111111111111",
    "lastKey": null,
    "pageSize": 500
  }
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 処理が成功したかどうか。 |
| `message` | `string` | 失敗時のエラーメッセージ（そのまま表示される）。 |
| `data.list` | `array<object>` | カードレコード。エクスポートで cardID・cardNameUUID・name・timestamp を読む。 |
| `data.lastKey` | `string\|null` | 不透明カーソル。空なら取得完了。 |
| `data.total` | `number` | 総数（コードコメントに記載、クライアントは読まない）。 |

::: info 補足
op は定数 AuthDataOpType.getCardsByStpDevice。データは追記のみの履歴テーブル由来で、サーバーが cardID で重複除去済み。クライアントは最大 100 ページ、1 ページ 30 秒タイムアウト。
:::

### updateCardName {#biz3manageaccessctlauthdata-updatecardname}

カード名を登録・更新する（新たに読み取ったカードのサーバー保存にも使用）。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `obj` | `object` | はい | カードパラメータ。 |
| `obj.cardID` | `string` | はい | カード ID（16 進文字列）。 |
| `obj.name` | `string` | はい | カード名。 |
| `obj.cardNameUUID` | `string` | はい | カード名 UUID（UUID v4）。 |
| `obj.timestamp` | `number` | はい | クライアントのタイムスタンプ（ミリ秒）。 |
| `obj.cardType` | `string` | はい | カード種別（空文字の場合あり）。 |
| `obj.stpDeviceUUID` | `string` | はい | 認証機器 UUID。 |
| `obj.ownerSubUUID` | `string` | いいえ | 所有メンバー UUID（新規カード登録フローで付与）。 |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "updateCardName",
  "obj": {
    "cardID": "0123456789ABCDEF",
    "name": "Card 1",
    "cardNameUUID": "00000000-0000-4000-8000-000000000001",
    "timestamp": 1700000000000,
    "cardType": "02",
    "stpDeviceUUID": "11111111-1111-4111-8111-111111111111"
  }
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 処理が成功したかどうか。 |
| `reqContext` | `object` | リクエスト obj のエコー。reqContext.stpDeviceUUID・cardID・name・cardNameUUID でローカル一覧を更新する。 |

::: info 補足
既存の nameUUID が UUID v4 でない場合、クライアントはまず IoT（topic 'stp&lt;deviceUUID>cmd'）で認証機器に新しい UUID を書き込み、機器の確認後に本リクエストを送る（15 秒タイムアウト）。
:::

### updatePasscodeName {#biz3manageaccessctlauthdata-updatepasscodename}

暗証番号名を登録・更新する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `obj` | `object` | はい | 暗証番号パラメータ。 |
| `obj.keyBoardPassCode` | `string` | はい | 暗証番号 ID（各桁を 2 桁の 16 進に変換。例 123 -> '010203'）。 |
| `obj.name` | `string` | はい | 暗証番号名。 |
| `obj.keyBoardPassCodeNameUUID` | `string` | はい | 暗証番号名 UUID（UUID v4）。 |
| `obj.timestamp` | `number` | はい | クライアントのタイムスタンプ（ミリ秒）。 |
| `obj.type` | `string` | はい | 暗証番号種別（空文字の場合あり）。 |
| `obj.stpDeviceUUID` | `string` | はい | 認証機器 UUID。 |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "updatePasscodeName",
  "obj": {
    "keyBoardPassCode": "010203040506",
    "name": "Front desk",
    "keyBoardPassCodeNameUUID": "00000000-0000-4000-8000-000000000001",
    "timestamp": 1700000000000,
    "type": "",
    "stpDeviceUUID": "11111111-1111-4111-8111-111111111111"
  }
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `success` | `boolean` | 処理が成功したかどうか。 |
| `reqContext` | `object` | リクエスト obj のエコー。reqContext.stpDeviceUUID・keyBoardPassCode・name・keyBoardPassCodeNameUUID で一覧を更新する。 |

::: info 補足
既存の nameUUID が UUID v4 でない場合、クライアントはまず IoT（topic 'stp&lt;deviceUUID>cmd'）で認証機器に新しい UUID を書き込み、機器の確認後に本リクエストを送る（15 秒タイムアウト）。
:::

### updateCardOwner {#biz3manageaccessctlauthdata-updatecardowner}

カードの所有メンバーを設定・解除する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `obj` | `object` | はい | パラメータ（新規カード登録フローでは updateCardName と同じ完全なオブジェクトを送る）。 |
| `obj.cardID` | `string` | はい | カード ID。 |
| `obj.ownerSubUUID` | `string` | はい | 所有メンバー UUID。空文字で解除。このキーがないとクライアントは送信しない。 |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "updateCardOwner",
  "obj": {
    "cardID": "0123456789ABCDEF",
    "ownerSubUUID": "00000000-0000-4000-8000-000000000002"
  }
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `reqContext.cardID` | `string` | エコーされたカード ID。 |
| `reqContext.ownerSubUUID` | `string` | エコーされた所有者 UUID。全機器上の該当カードの subUUID を更新する。 |

### postCards {#biz3manageaccessctlauthdata-postcards}

CSV 一括取込後、機器に書き込んだカード一覧をサーバーに保存する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | はい | 認証機器 UUID。 |
| `list` | `array<object>` | はい | カード一覧（空不可）。 |
| `list[].cardID` | `string` | はい | カード ID（16 進）。 |
| `list[].name` | `string` | はい | カード名（CSV の 'カード名' / name 列）。 |
| `list[].nameUUID` | `string` | はい | クライアントが新規生成した名前 UUID（小文字・ハイフン付き）。 |
| `list[].cardType` | `string` | はい | カード種別。既定 '02'。 |
| `list[].memberID` | `string` | いいえ | CSV の 'ユーザー' 列に一致したメンバー subUUID。 |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "postCards",
  "deviceUUID": "11111111-1111-4111-8111-111111111111",
  "list": [
    {
      "cardID": "0123456789ABCDEF",
      "name": "Card 1",
      "nameUUID": "00000000-0000-4000-8000-000000000001",
      "cardType": "02"
    }
  ]
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `(none)` | `-` | コールバックが呼ばれるが、ログ出力のみでフィールドは読まない。 |

::: info 補足
クライアントはまず IoT で機器にカードを書き込み、成功後に本リクエストを送る。
:::

### postPasscodes {#biz3manageaccessctlauthdata-postpasscodes}

CSV 一括取込後、機器に書き込んだ暗証番号一覧をサーバーに保存する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | はい | 認証機器 UUID。 |
| `list` | `array<object>` | はい | 暗証番号一覧（空不可）。 |
| `list[].passwordID` | `string` | はい | 暗証番号 ID（各桁を 2 桁 16 進、大文字）。 |
| `list[].name` | `string` | はい | 暗証番号名（CSV の '暗証番号名' 列）。 |
| `list[].nameUUID` | `string` | はい | クライアントが新規生成した名前 UUID（小文字・ハイフン付き）。 |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "postPasscodes",
  "deviceUUID": "11111111-1111-4111-8111-111111111111",
  "list": [
    {
      "passwordID": "010203040506",
      "name": "Front desk",
      "nameUUID": "00000000-0000-4000-8000-000000000001"
    }
  ]
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `(none)` | `-` | コールバックが呼ばれるが、ログ出力のみ。 |

::: info 補足
クライアントはまず IoT で機器に暗証番号を書き込み、その後に本リクエストを送る。
:::

### delCards {#biz3manageaccessctlauthdata-delcards}

機器がカード削除を確認した後、サーバー側のカード紐付けを削除する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `items` | `array<{deviceID: string, cardID: string}>` | はい | 削除するカード。deviceID は認証機器 UUID（IoT topic 'stp&lt;uuid>cmd' から抽出）。 |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "delCards",
  "items": [
    {
      "deviceID": "11111111-1111-4111-8111-111111111111",
      "cardID": "0123456789ABCDEF"
    }
  ]
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `(none)` | `-` | クライアントは応答を処理しない。 |

### delPasscodes {#biz3manageaccessctlauthdata-delpasscodes}

機器が暗証番号削除を確認した後、サーバー側の紐付けを削除する。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `items` | `array<{deviceID: string, passwordID: string}>` | はい | 削除する暗証番号。deviceID は認証機器 UUID。 |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "delPasscodes",
  "items": [
    {
      "deviceID": "11111111-1111-4111-8111-111111111111",
      "passwordID": "010203040506"
    }
  ]
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `(none)` | `-` | クライアントにこの op の応答処理はない。 |

### clearCards {#biz3manageaccessctlauthdata-clearcards}

認証機器のカード紐付けをサーバー側で全消去する（その後 IoT で機器から再取得）。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `obj` | `object` | はい | パラメータ。 |
| `obj.devices` | `string` | はい | 認証機器 UUID（1 台）。 |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "clearCards",
  "obj": {
    "devices": "11111111-1111-4111-8111-111111111111"
  }
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `(none)` | `-` | コールバックが呼ばれるが、フィールドは読まない。 |

::: info 補足
機器が Wi-Fi オンラインの場合のみ呼ばれる。
:::

### clearPasscodes {#biz3manageaccessctlauthdata-clearpasscodes}

認証機器の暗証番号紐付けをサーバー側で全消去する（その後 IoT で再取得）。

**リクエスト**

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `obj` | `object` | はい | パラメータ。 |
| `obj.devices` | `string` | はい | 認証機器 UUID（1 台）。 |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "clearPasscodes",
  "obj": {
    "devices": "11111111-1111-4111-8111-111111111111"
  }
}
```

**レスポンス**

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `(none)` | `-` | コールバックが呼ばれるが、フィールドは読まない。 |

::: info 補足
機器が Wi-Fi オンラインの場合のみ呼ばれる。
:::
