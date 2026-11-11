---
title: 成员与权限
---
# 成员与权限

连接方式、消息格式与通用响应字段见 [WebSocket API](./bizapi.md)。

**接口目录**

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

获取当前登录用户在指定空间（公司）中的身份信息与配额。

### `biz3GetLoginUser` {#biz3getloginuser-request}

切换/进入空间时获取当前用户的 customerInfo（公司 ID、角色、可访问页面等）和配额。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `email` | `string` | 是 | 名称为 email，但实际传入的值可能是：登录邮箱、空间 ID（companyID / URL 中的 spaceID / localStorage 的 curLogin）或 App 内固定值 'ch_CandyhouseMobile'。 |

```json
{
  "action": "biz3GetLoginUser",
  "email": "<companyID>"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data.customerInfo` | `object` | 当前用户在该空间的信息，前端读取的字段见下。 |
| `data.customerInfo.companyID` | `string` | 空间（公司）ID，之后几乎所有请求都会带上它；同时写入 localStorage 'curLogin'。 |
| `data.customerInfo.subUUID` | `string` | 当前用户的用户 UUID。 |
| `data.customerInfo.name` | `string` | 空间名称。 |
| `data.customerInfo.employeeEmail` | `string` | 当前用户邮箱。 |
| `data.customerInfo.employeeName` | `string` | 当前用户名称。 |
| `data.customerInfo.mainEmail` | `string` | 主邮箱（添加成员时用于防止添加自己）。 |
| `data.customerInfo.tag` | `string[]` | 角色名数组；tag[0] 为 'オーナー'（所有者）或 'マネージャー'（管理者）时前端授予全部页面权限。 |
| `data.customerInfo.access` | `string[]` | 可访问页面名列表（如 'ユーザー'、'デバイス（ドア・認証機器）'、'カード管理'、'全体履歴'、'開発者向け'）。 |
| `data.customerInfo.isSesameApp` | `boolean` | 是否为个人（Sesame App）空间；为 true 时前端追加 '開発者向け' 页面权限。 |
| `data.customerInfo.isAnonymous` | `boolean` | 是否为匿名/访客会话（App 内使用）。 |
| `data.customerInfo.isRootUser` | `boolean` | 是否为根用户（首页显示用）。 |
| `data.customerInfo.envId` | `string` | 环境 ID（App 内作为 historyTag 使用）。 |
| `data.customerInfo.isCS` | `boolean` | 是否为客服账号（控制菜单显示）。 |
| `data.quotas` | `object` | 配额；前端读取 quotas.memberCount（成员上限）和 quotas.lockCount。 |

::: info 说明
此 action 没有 op 字段。收到响应后前端会自动发送 biz3ManageCompany/get。
:::

## biz3ManageCompany {#biz3managecompany}

空间（公司）的列表、创建、删除与改名。

### get {#biz3managecompany-get}

获取当前用户所属的全部空间列表。

**请求**

无额外参数。

```json
{
  "action": "biz3ManageCompany",
  "op": "get"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 操作是否成功。 |
| `data` | `array<object>` | 空间列表（仅 success 为 true 时使用）。 |
| `data[].companyID` | `string` | 空间 ID。 |
| `data[].name` | `string` | 空间名称。 |
| `data[].isSesameApp` | `boolean` | 是否为个人（Sesame App）空间；切换时决定跳转到 '/' 还是 '/biz'。 |
| `data[].feeLevel` | `object` | 套餐信息；前端读取 feeLevel.level、feeLevel.isRootUser、feeLevel.subscriptionId。 |
| `data[].tag` | `string[]` | 该空间中的角色（个人空间模式下用于判断 tag[0]==='オーナー'）。 |
| `data[].employeeEmail` | `string` | 该空间中的用户邮箱。 |

::: info 说明
前端仅在非 App 环境下发送。tag/employeeEmail 是否总是存在，代码无法确认。
:::

### add {#biz3managecompany-add}

新建一个空间（公司）。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | 是 | 新空间名称。 |
| `employeeEmail` | `string` | 是 | 创建者邮箱（取自 customerInfo.employeeEmail）。 |
| `subUUID` | `string` | 是 | 创建者用户 UUID（取自 customerInfo.subUUID）。 |

```json
{
  "action": "biz3ManageCompany",
  "op": "add",
  "name": "New Office",
  "employeeEmail": "user@example.com",
  "subUUID": "00000000-0000-4000-8000-000000000001"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 操作是否成功。 |
| `data` | `object` | 新建的空间对象，直接追加到空间列表（结构同 get 的 data[]）。 |

### delete {#biz3managecompany-delete}

删除当前空间。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `companyID` | `string` | 是 | 要删除的空间 ID（priorityCompany 的 companyID）。 |

```json
{
  "action": "biz3ManageCompany",
  "op": "delete",
  "companyID": "<companyID>"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 操作是否成功。 |
| `message` | `string` | 失败时的错误信息（前端直接显示）。 |
| `data.deletedCompanyId` | `string` | 已删除的空间 ID，从列表移除。 |
| `data.curCompanyID` | `string` | 删除后应切换到的空间 ID；前端写入 curLogin 并重新调用 biz3GetLoginUser。 |

::: info 说明
UI 仅对所有者（tag[0]==='オーナー'）显示删除按钮。
:::

### updateName {#biz3managecompany-updatename}

修改空间名称。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `obj` | `object` | 是 | 改名参数。 |
| `obj.companyID` | `string` | 是 | 空间 ID（priorityCompany 的 companyID）。 |
| `obj.name` | `string` | 是 | 新名称。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 操作是否成功。 |
| `data.companyID` | `string` | 被改名的空间 ID。 |
| `data.name` | `string` | 新名称。 |

::: info 说明
UI 仅允许所有者编辑。
:::

## biz3ManageEmployee {#biz3manageemployee}

空间成员（联系人）的增删改查、排序与当前用户信息。

### get {#biz3manageemployee-get}

请求空间成员列表；列表通过服务器推送的 pubEmployees 消息分页返回。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `companyID` | `string` | 是 | 空间 ID。 |

```json
{
  "action": "biz3ManageEmployee",
  "op": "get",
  "companyID": "<companyID>"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `(op 'get' reply)` | `-` | 对 op 'get' 的直接回复前端不读取任何字段。 |
| `pubEmployees: data.totalCount` | `number` | 推送消息（op='pubEmployees'）中的成员总数。 |
| `pubEmployees: data.data.page` | `number` | 页码；为 1 时前端重置列表，否则追加。 |
| `pubEmployees: data.data.list` | `array<object>` | 成员对象：subUUID、employeeName、employeeEmail、tag（角色名数组）、department、phone 等。 |

::: info 说明
分页推送；前端会把最近 10 秒内删除的成员从推送结果中过滤掉。
:::

### add {#biz3manageemployee-add}

向空间添加成员：按邮箱/姓名添加（可 CSV 批量），或通过好友 QR 码添加。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `items` | `array<object>` | 是 | 要添加的成员数组。 |
| `items[].companyID` | `string` | 是 | 空间 ID。 |
| `items[].employeeEmail` | `string` | 否 | 成员邮箱（按邮箱添加时必填；不可与所有者邮箱相同）。 |
| `items[].employeeName` | `string` | 否 | 成员名称（按邮箱添加时必填）。 |
| `items[].tag` | `string[]` | 否 | 分配的角色名数组（CSV 导入时从角色列表选择，不含 'ゲスト'）。 |
| `items[].phone` | `string` | 否 | 电话（可选）。 |
| `items[].department` | `string` | 否 | 所属部门（可选）。 |
| `items[].friendID` | `string` | 否 | 好友的用户 UUID（小写）；通过 QR 码或 App 添加联系人时使用，此时不带邮箱/姓名。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 操作是否成功。 |
| `message` | `string` | 失败时的错误信息（前端直接显示）。 |

::: info 说明
message 为 'Limit Exceeded' 表示超过成员上限；'ユーザーは存在しません'（用户不存在）与 '必ず【メールアドレス】と【ユーザー名】を含めてください。'（缺少邮箱/姓名）会被本地化。成功后前端重新发送 get。
:::

### update {#biz3manageemployee-update}

更新成员资料（名称/部门/电话），或修改当前用户自己的昵称。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `obj` | `object` | 是 | 更新内容；包含 companyID 及以下两种形式之一。 |
| `obj.companyID` | `string` | 是 | 空间 ID。 |
| `obj.subUUID` | `string` | 否 | 形式一：目标成员 UUID，同时只带一个要修改的字段。 |
| `obj.employeeName` | `string` | 否 | 形式一：新名称。 |
| `obj.department` | `string` | 否 | 形式一：新部门。 |
| `obj.phone` | `string` | 否 | 形式一：新电话。 |
| `obj.Name` | `string` | 否 | 形式二（修改自己的昵称）：固定为 'name'。 |
| `obj.Value` | `string` | 否 | 形式二：新昵称。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 操作是否成功。 |

::: info 说明
成功后前端重新发送 get。
:::

### delete {#biz3manageemployee-delete}

从空间删除成员。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `items` | `array<object>` | 是 | 要删除的成员对象数组（列表中的完整成员对象，或至少 {subUUID, companyID}）。 |
| `items[].subUUID` | `string` | 是 | 成员 UUID。 |
| `items[].companyID` | `string` | 否 | 空间 ID（个人空间模式下显式传入）。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 操作是否成功。 |
| `message` | `string` | 失败时的错误信息（前端直接显示）。 |

::: info 说明
列表 UI 不允许选择 tag[0]==='オーナー' 的成员；不能删除自己。
:::

### order {#biz3manageemployee-order}

保存联系人列表的拖拽排序。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `items` | `array<object>` | 是 | 按新顺序排列的全部联系人。 |
| `items[].friendUUID` | `string` | 是 | 联系人的 subUUID。 |
| `items[].rank` | `number` | 是 | 排序值 = -索引（0, -1, -2 ...），越大越靠前。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 操作是否成功。 |

::: info 说明
失败时前端重新发送 get。
:::

### currentInfo {#biz3manageemployee-currentinfo}

获取当前登录用户自己的资料（昵称、邮箱、最近登录记录）。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `excludeLogins` | `boolean` | 否 | 为 true 时不需要最近登录记录（只在需要时附带）。 |

```json
{
  "action": "biz3ManageEmployee",
  "op": "currentInfo",
  "excludeLogins": true
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 操作是否成功。 |
| `data.name` | `string` | 昵称。 |
| `data.email` | `string` | 邮箱。 |
| `data.sub` | `string` | 用户 ID（个人页显示）。 |
| `data.recentLogins` | `string[]` | 最近登录记录；每项是 JSON 字符串，解析后为单键对象数组，前端读取其中的 'model' 与 'collectedAt'。 |

::: info 说明
请求不带 companyID。
:::

## biz3ManageEmployeeGroup {#biz3manageemployeegroup}

用户组的管理，以及用户组与设备组（组钥匙）的绑定关系。

### getGroups {#biz3manageemployeegroup-getgroups}

获取空间内的全部用户组。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `cid` | `string` | 是 | 空间 ID。 |

```json
{
  "action": "biz3ManageEmployeeGroup",
  "op": "getGroups",
  "cid": "<companyID>"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data` | `array<object>` | 用户组列表。 |
| `data[].gid` | `string` | 用户组 ID。 |
| `data[].name` | `string` | 用户组名称。 |
| `data[].uuids` | `string[]` | 组内成员的 subUUID 列表。 |
| `data[].deviceGroups` | `string[]` | 已绑定的设备组 gid 列表。 |

### add {#biz3manageemployeegroup-add}

新建用户组。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `obj` | `object` | 是 | 新组参数。 |
| `obj.cid` | `string` | 是 | 空间 ID。 |
| `obj.name` | `string` | 是 | 组名。 |
| `obj.uuids` | `string[]` | 是 | 初始成员的 subUUID 列表。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data` | `object` | 新建的用户组对象，直接追加到用户组列表（结构同 getGroups 的 data[]）。 |

### update {#biz3manageemployeegroup-update}

修改用户组名称。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `obj` | `object` | 是 | 更新参数。 |
| `obj.cid` | `string` | 是 | 空间 ID。 |
| `obj.gid` | `string` | 是 | 用户组 ID。 |
| `obj.name` | `string` | 是 | 新组名。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 操作是否成功。 |

### deleteGroups {#biz3manageemployeegroup-deletegroups}

批量删除用户组。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `cid` | `string` | 是 | 空间 ID。 |
| `objs` | `string[]` | 是 | 要删除的用户组 gid 列表（纯字符串数组）。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `(none)` | `-` | 前端不读取字段，收到后重新发送 getGroups。 |

::: info 说明
注意：与 biz3ManageDeviceGroup/deleteGroups 不同，这里 objs 是字符串数组且 cid 在顶层。
:::

### addBindUser {#biz3manageemployeegroup-addbinduser}

向用户组添加成员。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `cid` | `string` | 是 | 空间 ID。 |
| `gid` | `string` | 是 | 用户组 ID。 |
| `uuids` | `string[]` | 是 | 该组当前已有成员的 subUUID 列表（添加前的状态）。 |
| `items` | `array<object>` | 是 | 要加入的成员对象（成员列表中的完整对象，含 subUUID 等）。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 操作是否成功。 |

::: info 说明
成功后前端重新发送 getGroups。服务器如何使用 uuids 代码中不可见。
:::

### removeBindUser {#biz3manageemployeegroup-removebinduser}

从用户组移除成员。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `cid` | `string` | 是 | 空间 ID。 |
| `gid` | `string` | 是 | 用户组 ID。 |
| `uuids` | `string[]` | 是 | 该组当前已有成员的 subUUID 列表（移除前）。 |
| `items` | `array<{subUUID: string}>` | 是 | 要移除的成员，仅含 subUUID。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 操作是否成功。 |

::: info 说明
成功后前端重新发送 getGroups。
:::

### getBindDeviceGroup {#biz3manageemployeegroup-getbinddevicegroup}

获取某用户组被授予的设备组钥匙（组钥匙）。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `gid` | `string` | 是 | 用户组 ID。 |

```json
{
  "action": "biz3ManageEmployeeGroup",
  "op": "getBindDeviceGroup",
  "gid": "<gid>"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data` | `array<object>` | 绑定记录列表。 |
| `data[].mid` | `string` | 用户组 ID（member group）。 |
| `data[].did` | `string` | 设备组 ID（device group）。 |
| `data[].keyLevel` | `number\|string` | 钥匙等级：0=所有者、1=管理者、2=访客。 |
| `data[].startTime` | `number` | 有效期开始（Unix 秒）；为空表示常时可用。 |
| `data[].endTime` | `number` | 有效期结束（Unix 秒）。 |

::: info 说明
请求不带 cid。
:::

### removeBindDeviceGroup {#biz3manageemployeegroup-removebinddevicegroup}

解除用户组与某设备组之间的组钥匙。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `cid` | `string` | 是 | 空间 ID。 |
| `mid` | `string` | 是 | 用户组 ID。 |
| `did` | `string` | 是 | 设备组 ID。 |
| `keyLevel` | `number\|string` | 是 | 该绑定记录的钥匙等级（取自 getBindDeviceGroup）。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 操作是否成功。 |

## biz3ManageDeviceGroup {#biz3managedevicegroup}

设备组（门组）的管理，以及设备组与用户组（组钥匙）的绑定关系。

### getGroups {#biz3managedevicegroup-getgroups}

获取空间内的全部设备组。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `cid` | `string` | 是 | 空间 ID。 |

```json
{
  "action": "biz3ManageDeviceGroup",
  "op": "getGroups",
  "cid": "<companyID>"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data` | `array<object>` | 设备组列表。 |
| `data[].gid` | `string` | 设备组 ID。 |
| `data[].name` | `string` | 设备组名称。 |
| `data[].uuids` | `string[]` | 组内设备的 deviceUUID 列表。 |
| `data[].employeeGroups` | `string[]` | 已绑定的用户组 gid 列表。 |

### add {#biz3managedevicegroup-add}

新建设备组。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `obj` | `object` | 是 | 新组参数。 |
| `obj.name` | `string` | 是 | 组名。 |
| `obj.cid` | `string` | 是 | 空间 ID。 |
| `obj.uuids` | `string[]` | 是 | 初始设备的 deviceUUID 列表。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `(none)` | `-` | 前端不读取字段，收到后重新发送 getGroups。 |

### update {#biz3managedevicegroup-update}

修改设备组名称。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `obj` | `object` | 是 | 更新参数。 |
| `obj.cid` | `string` | 是 | 空间 ID。 |
| `obj.gid` | `string` | 是 | 设备组 ID。 |
| `obj.name` | `string` | 是 | 新组名。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 操作是否成功。 |

### deleteGroups {#biz3managedevicegroup-deletegroups}

批量删除设备组。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `objs` | `array<{gid: string, cid: string}>` | 是 | 要删除的设备组，每项含 gid 和 cid（空间 ID）。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `(none)` | `-` | 前端不读取字段，收到后重新发送 getGroups。 |

::: info 说明
注意：与用户组的 deleteGroups 不同，这里 objs 是对象数组，cid 在每个对象中。
:::

### addBindDevice {#biz3managedevicegroup-addbinddevice}

向设备组添加设备。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `cid` | `string` | 是 | 空间 ID。 |
| `gid` | `string` | 是 | 设备组 ID。 |
| `uuids` | `string[]` | 是 | 该组当前已有设备的 deviceUUID 列表（添加前）。 |
| `items` | `array<object>` | 是 | 要加入的设备对象（设备列表中的完整对象，如 deviceUUID、deviceName、deviceModel、secretKey、keyLevel、stateInfo 等）。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `(none)` | `-` | 前端不读取字段，回调中重新发送 getGroups。 |

::: info 说明
items 中设备对象的字段由 biz3ManageDevice 返回，不属于本文档范围。
:::

### removeBindDevice {#biz3managedevicegroup-removebinddevice}

从设备组移除设备。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `cid` | `string` | 是 | 空间 ID。 |
| `gid` | `string` | 是 | 设备组 ID。 |
| `uuids` | `string[]` | 是 | 该组当前已有设备的 deviceUUID 列表（移除前）。 |
| `items` | `array<{deviceUUID: string, secretKey: string}>` | 是 | 要移除的设备，仅含 deviceUUID 与 secretKey。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `(none)` | `-` | 前端不读取字段，回调中重新发送 getGroups。 |

### getBindUserGroup {#biz3managedevicegroup-getbindusergroup}

获取某设备组授予了组钥匙的用户组。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `gid` | `string` | 是 | 设备组 ID。 |

```json
{
  "action": "biz3ManageDeviceGroup",
  "op": "getBindUserGroup",
  "gid": "<deviceGroupGid>"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data` | `array<object>` | 绑定记录列表。 |
| `data[].mid` | `string` | 用户组 ID。 |
| `data[].keyLevel` | `number\|string` | 钥匙等级：0=所有者、1=管理者、2=访客。 |
| `data[].startTime` | `number` | 有效期开始（Unix 秒）；为空表示常时可用。 |
| `data[].endTime` | `number` | 有效期结束（Unix 秒）。 |

::: info 说明
请求不带 cid。
:::

### removeBindUserGroup {#biz3managedevicegroup-removebindusergroup}

解除设备组与某用户组之间的组钥匙。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `cid` | `string` | 是 | 空间 ID。 |
| `mid` | `string` | 是 | 用户组 ID。 |
| `did` | `string` | 是 | 设备组 ID。 |
| `keyLevel` | `number\|string` | 是 | 该绑定记录的钥匙等级（取自 getBindUserGroup）。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `(none)` | `-` | 前端不读取字段，回调中重新获取绑定列表。 |

## biz3ManageEmployeeDevice {#biz3manageemployeedevice}

成员的设备钥匙：分享、撤销、查询、按组分享、访客钥匙标签与分享 QR 码。

### add {#biz3manageemployeedevice-add}

把设备钥匙分享给一个或多个成员（成员×设备 的组合逐条列出）。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `items` | `array<object>` | 是 | 要分享的钥匙，每项对应一个「成员 × 设备」。 |
| `items[].subUUID` | `string` | 是 | 接收钥匙的成员 UUID。 |
| `items[].deviceUUID` | `string` | 是 | 设备 UUID。 |
| `items[].keyLevel` | `number` | 是 | 钥匙等级：0=所有者（オーナー）、1=管理者（マネージャー）、2=访客（ゲスト）。 |
| `items[].deviceModel` | `string` | 否 | 设备型号（取自设备列表）。 |
| `items[].deviceName` | `string` | 否 | 设备名称（取自设备列表）。 |
| `items[].keyIndex` | `string` | 否 | 钥匙索引（取自设备列表）。 |
| `items[].secretKey` | `string` | 否 | 设备密钥（取自设备列表）。keyLevel=2 时服务端会改为生成新的访客钥匙 ID。 |
| `items[].sesame2PublicKey` | `string` | 否 | 设备公钥（取自设备列表）。 |
| `items[].startTime` | `number` | 否 | 访客钥匙的生效开始时间（Unix 秒），仅 keyLevel=2 时使用；不填则不限。 |
| `items[].endTime` | `number` | 否 | 访客钥匙的生效结束时间（Unix 秒），仅 keyLevel=2 时使用；不填则不限。 |
| `items[].keyName` | `string` | 否 | 访客钥匙名称，仅 keyLevel=2 时使用；不填则用当前时间戳。 |
| `items[].historyTag` | `string` | 否 | 访客钥匙的历史记录标签，仅 keyLevel=2 时使用。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 操作是否成功。 |

::: info 说明
UI 中只有当前用户持有所有者钥匙时才提供 keyLevel=0 选项；访客钥匙设备不能再分享。设备列表中的排序由服务端分配，无需传排序字段。
:::

### del {#biz3manageemployeedevice-del}

撤销成员的设备钥匙，或删除访客钥匙。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | 是 | 设备 UUID。 |
| `subUUID` | `string` | 否 | 形式一：要撤销钥匙的成员 UUID。 |
| `guestKeyId` | `string` | 否 | 形式二：访客钥匙 ID（用户带 guestKeyId 时使用）。 |
| `randomTag` | `string` | 否 | 形式二必填：用设备 secretKey 对当前 Unix 秒（小端 4 字节的第 1~3 字节）做 AES-CMAC 后取前 8 个十六进制字符。 |

```json
{
  "action": "biz3ManageEmployeeDevice",
  "op": "del",
  "subUUID": "00000000-0000-4000-8000-000000000002",
  "deviceUUID": "11111111-1111-4111-8111-111111111111"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 操作是否成功。 |

### get {#biz3manageemployeedevice-get}

获取某成员持有的全部设备钥匙。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `subUUID` | `string` | 是 | 成员 UUID。 |

```json
{
  "action": "biz3ManageEmployeeDevice",
  "op": "get",
  "subUUID": "00000000-0000-4000-8000-000000000002"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 操作是否成功。 |
| `data` | `array<object>` | 钥匙列表。 |
| `data[].deviceUUID` | `string` | 设备 UUID。 |
| `data[].subUUID` | `string` | 持有者 UUID。 |
| `data[].keyLevel` | `number\|string` | 钥匙等级：0=所有者（オーナー）、1=管理者（マネージャー）、2=访客（ゲスト）。 |
| `data[].startAt` | `number` | 有效期开始（Unix 秒）；与 endAt 都有值时为临时钥匙。 |
| `data[].endAt` | `number` | 有效期结束（Unix 秒）。 |

### group {#biz3manageemployeedevice-group}

把一组设备组的钥匙分享给一个用户组（组钥匙）。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `companyID` | `string` | 是 | 空间 ID。 |
| `keyLevel` | `string` | 是 | 钥匙等级字符串：'0'=所有者、'1'=管理者、'2'=访客。 |
| `members` | `string[]` | 是 | 用户组成员的 subUUID 列表。 |
| `devices` | `string[]` | 是 | 所选设备组中全部设备的 deviceUUID（去重）。 |
| `mid` | `string` | 是 | 用户组 gid。 |
| `dids` | `string[]` | 是 | 所选设备组 gid 列表。 |
| `startTime` | `number\|string` | 否 | 仅 keyLevel='2' 时发送：临时使用开始（Unix 秒），常时使用为空字符串。 |
| `endTime` | `number\|string` | 否 | 仅 keyLevel='2' 时发送：临时使用结束（Unix 秒），常时使用为空字符串。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `(none)` | `-` | 前端不读取字段，仅在回调中结束加载状态。 |

### updateGuestTag {#biz3manageemployeedevice-updateguesttag}

修改访客钥匙的显示名称（标签）。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | 是 | 设备 UUID。 |
| `guestKeyId` | `string` | 是 | 访客钥匙 ID。 |
| `keyName` | `string` | 是 | 新名称。 |

```json
{
  "action": "biz3ManageEmployeeDevice",
  "op": "updateGuestTag",
  "deviceUUID": "11111111-1111-4111-8111-111111111111",
  "guestKeyId": "<guestKeyId>",
  "keyName": "Visitor"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 操作是否成功。 |

### generateQRToken {#biz3manageemployeedevice-generateqrtoken}

生成用于分享设备钥匙的 QR 码 token。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | 是 | 设备 UUID。 |
| `keyLevel` | `number` | 是 | 钥匙等级：0=所有者（オーナー）、1=管理者（マネージャー）、2=访客（ゲスト）。UI 只允许 ≥ 自己的等级。 |
| `guestKeyId` | `string` | 否 | 分享已有访客钥匙时的访客钥匙 ID。 |
| `name` | `string` | 否 | 分享已有访客钥匙时的钥匙名称。 |
| `isSecure` | `boolean` | 否 | 仅在关闭安全模式时发送 false；省略即为安全模式。 |

```json
{
  "action": "biz3ManageEmployeeDevice",
  "op": "generateQRToken",
  "deviceUUID": "11111111-1111-4111-8111-111111111111",
  "keyLevel": 2
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 操作是否成功。 |
| `data.qrToken` | `string` | QR 码内容（URL），前端直接渲染为二维码。 |

### redeemQRToken {#biz3manageemployeedevice-redeemqrtoken}

用扫描到的 QR 码 URL 向服务器兑换真实的设备钥匙内容。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `qrToken` | `string` | 是 | 扫描得到的二维码 URL。 |

```json
{
  "action": "biz3ManageEmployeeDevice",
  "op": "redeemQRToken",
  "qrToken": "https://example.com/qr?t=..."
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 操作是否成功。 |
| `message` | `string` | 失败时的错误信息（前端直接显示）。 |
| `data` | `string` | 兑换后的 URL，其 'sk' 参数为 base64 的设备钥匙数据（首字节为产品类型，后续含 secretKey、公钥、keyIndex 等）。 |

::: info 说明
App 内代码注释说明：兑换时服务器已完成设备绑定，客户端只解析型号用于跳转。
:::

## biz3ManageRole {#biz3managerole}

空间角色（ロール）及其可访问页面的管理。

### get {#biz3managerole-get}

获取空间内的全部角色。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `companyID` | `string` | 是 | 空间 ID。 |

```json
{
  "action": "biz3ManageRole",
  "op": "get",
  "companyID": "<companyID>"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 操作是否成功。 |
| `message` | `string` | 失败时的错误信息（前端直接显示）。 |
| `data` | `array<object>` | 角色列表。 |
| `data[].tag` | `string` | 角色名；内置角色为 'オーナー'、'マネージャー'、'ゲスト'。 |
| `data[].access` | `string[]` | 可访问页面名列表。 |
| `data[].companyID` | `string` | 空间 ID。 |

::: info 说明
内置角色在 UI 中不可编辑：所有者与管理者固定为全部页面，访客显示为 '権限なし'。
:::

### post {#biz3managerole-post}

新建角色或覆盖已有角色的可访问页面。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `companyID` | `string` | 是 | 空间 ID。 |
| `tag` | `string` | 是 | 角色名。 |
| `access` | `string[]` | 是 | 可访问页面名列表，取值来自：'ユーザー'、'デバイス（ドア・認証機器）'、'カード管理'、'全体履歴'、'開発者向け'。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 操作是否成功。 |
| `message` | `string` | 失败时的错误信息（前端直接显示）。 |

::: info 说明
编辑已有角色时，前端发送整个角色对象（tag、access、companyID）作为覆盖。成功后重新发送 get。
:::

### delete {#biz3managerole-delete}

删除角色。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `companyID` | `string` | 是 | 空间 ID。 |
| `tag` | `string` | 是 | 要删除的角色名。 |
| `access` | `string[]` | 否 | 角色对象中的其他字段也会一并发送（access，以及前端内部的 isShowAdd: true）。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 操作是否成功。 |
| `message` | `string` | 失败时的错误信息（前端直接显示）。 |

::: info 说明
内置角色在 UI 中不可删除。成功后重新发送 get。
:::

## biz3ManageAccessCtlAuthData {#biz3manageaccessctlauthdata}

认证设备（Sesame Touch 等）上 NFC 卡片与密码的服务器端数据管理。

### getCards {#biz3manageaccessctlauthdata-getcards}

请求一台或多台认证设备当前关联的 NFC 卡片；数据通过推送消息 pubCardLinkedIDs 按设备分页返回。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `obj` | `object` | 是 | 查询参数。 |
| `obj.devices` | `string` | 是 | 以逗号分隔的认证设备 deviceUUID。 |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "getCards",
  "obj": {
    "devices": "11111111-1111-4111-8111-111111111111,11111111-1111-4111-8111-111111111112"
  }
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `(op 'getCards' reply)` | `-` | 直接回复仅用于标记加载完成，不读取字段。 |
| `pubCardLinkedIDs: data.deviceUUID` | `string` | 推送（op='pubCardLinkedIDs'）所属的认证设备 UUID。 |
| `pubCardLinkedIDs: data.page` | `number` | 页码；1 表示替换该设备的列表，其余追加。 |
| `pubCardLinkedIDs: data.list` | `array<object>` | 卡片记录；前端读取 cardID、name、nameUUID、cardType、deviceID（认证设备 UUID）、subUUID（持有成员）。 |

::: info 说明
op 值来自常量 AuthDataOpType.getCards = 'getCards'。该数据来自会被 clearCards/delCards 清除的表，只反映设备当前卡片。
:::

### getPasscodes {#biz3manageaccessctlauthdata-getpasscodes}

请求认证设备当前关联的密码；数据通过推送消息 pubPasscodeLinkedIDs 按设备分页返回。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `obj` | `object` | 是 | 查询参数。 |
| `obj.devices` | `string` | 是 | 以逗号分隔的认证设备 deviceUUID。 |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "getPasscodes",
  "obj": {
    "devices": "11111111-1111-4111-8111-111111111111"
  }
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `(op 'getPasscodes' reply)` | `-` | 直接回复仅用于标记加载完成。 |
| `pubPasscodeLinkedIDs: data.deviceUUID` | `string` | 推送所属的认证设备 UUID。 |
| `pubPasscodeLinkedIDs: data.page` | `number` | 页码；1 表示替换，其余追加。 |
| `pubPasscodeLinkedIDs: data.list` | `array<object>` | 密码记录；前端读取 passwordID、name、nameUUID、passwordType、deviceID（认证设备 UUID）。 |

::: info 说明
op 值来自常量 AuthDataOpType.getPasscodes = 'getPasscodes'。
:::

### getCardsByStpDevice {#biz3manageaccessctlauthdata-getcardsbystpdevice}

分页查询某认证设备上曾经登录过的全部卡片（含已删除的历史记录），用于导出。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `obj` | `object` | 是 | 查询参数。 |
| `obj.stpDeviceUUID` | `string` | 是 | 认证设备 UUID。 |
| `obj.lastKey` | `string\|null` | 否 | 分页游标；首页为 null，之后传上次响应的 lastKey。 |
| `obj.pageSize` | `number` | 否 | 每页数量，默认 500。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 操作是否成功。 |
| `message` | `string` | 失败时的错误信息（前端直接显示）。 |
| `data.list` | `array<object>` | 卡片记录；导出时读取 cardID、cardNameUUID、name、timestamp。 |
| `data.lastKey` | `string\|null` | 不透明游标；为空表示已取完。 |
| `data.total` | `number` | 总数（代码注释中给出，前端未读取）。 |

::: info 说明
op 值来自常量 AuthDataOpType.getCardsByStpDevice。数据来自只写不删的历史表，后端已按 cardID 去重；前端最多翻 100 页、每页超时 30 秒。
:::

### updateCardName {#biz3manageaccessctlauthdata-updatecardname}

登记或更新一张卡片的名称（也用于新卡片读入后写入服务器）。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `obj` | `object` | 是 | 卡片参数。 |
| `obj.cardID` | `string` | 是 | 卡片 ID（十六进制字符串）。 |
| `obj.name` | `string` | 是 | 卡片名称。 |
| `obj.cardNameUUID` | `string` | 是 | 卡片名称 UUID（UUID v4）。 |
| `obj.timestamp` | `number` | 是 | 客户端时间戳（毫秒）。 |
| `obj.cardType` | `string` | 是 | 卡片类型（可能为空字符串）。 |
| `obj.stpDeviceUUID` | `string` | 是 | 认证设备 UUID。 |
| `obj.ownerSubUUID` | `string` | 否 | 持有成员 UUID（新卡片登记流程中会附带）。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 操作是否成功。 |
| `reqContext` | `object` | 回显的请求 obj；前端用 reqContext.stpDeviceUUID、cardID、name、cardNameUUID 更新本地列表。 |

::: info 说明
如果现有 nameUUID 不是 UUID v4，前端会先通过 IoT 向认证设备（topic 'stp&lt;deviceUUID>cmd'）下发命令写入新的 UUID，设备确认后再发送本请求（15 秒超时）。
:::

### updatePasscodeName {#biz3manageaccessctlauthdata-updatepasscodename}

登记或更新一个密码的名称。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `obj` | `object` | 是 | 密码参数。 |
| `obj.keyBoardPassCode` | `string` | 是 | 密码 ID（每位数字编码为两位十六进制，如 123 -> '010203'）。 |
| `obj.name` | `string` | 是 | 密码名称。 |
| `obj.keyBoardPassCodeNameUUID` | `string` | 是 | 密码名称 UUID（UUID v4）。 |
| `obj.timestamp` | `number` | 是 | 客户端时间戳（毫秒）。 |
| `obj.type` | `string` | 是 | 密码类型（可能为空字符串）。 |
| `obj.stpDeviceUUID` | `string` | 是 | 认证设备 UUID。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 操作是否成功。 |
| `reqContext` | `object` | 回显的请求 obj；前端用 reqContext.stpDeviceUUID、keyBoardPassCode、name、keyBoardPassCodeNameUUID 更新本地列表。 |

::: info 说明
如果现有 nameUUID 不是 UUID v4，前端会先通过 IoT 向认证设备（topic 'stp&lt;deviceUUID>cmd'）下发命令写入新的 UUID，设备确认后再发送本请求（15 秒超时）。
:::

### updateCardOwner {#biz3manageaccessctlauthdata-updatecardowner}

设置或解除卡片的持有成员。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `obj` | `object` | 是 | 参数（新卡片登记流程中会发送与 updateCardName 相同的完整对象）。 |
| `obj.cardID` | `string` | 是 | 卡片 ID。 |
| `obj.ownerSubUUID` | `string` | 是 | 持有成员 UUID；空字符串表示解除绑定。必须存在此键，否则前端不发送。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `reqContext.cardID` | `string` | 回显的卡片 ID。 |
| `reqContext.ownerSubUUID` | `string` | 回显的持有者 UUID；前端据此更新所有设备上该卡片的 subUUID。 |

### postCards {#biz3manageaccessctlauthdata-postcards}

批量导入（CSV）卡片后，把已写入设备的卡片列表保存到服务器。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | 是 | 认证设备 UUID。 |
| `list` | `array<object>` | 是 | 卡片列表（不能为空）。 |
| `list[].cardID` | `string` | 是 | 卡片 ID（十六进制）。 |
| `list[].name` | `string` | 是 | 卡片名称（CSV 'カード名'/name 列）。 |
| `list[].nameUUID` | `string` | 是 | 前端新生成的名称 UUID（小写、带连字符）。 |
| `list[].cardType` | `string` | 是 | 卡片类型，默认 '02'。 |
| `list[].memberID` | `string` | 否 | CSV 'ユーザー' 列匹配到的成员 subUUID。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `(none)` | `-` | 触发回调，前端只记录日志，不读取字段。 |

::: info 说明
前端先通过 IoT 把卡片批量写入设备，成功后才发送本请求。
:::

### postPasscodes {#biz3manageaccessctlauthdata-postpasscodes}

批量导入（CSV）密码后，把已写入设备的密码列表保存到服务器。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | 是 | 认证设备 UUID。 |
| `list` | `array<object>` | 是 | 密码列表（不能为空）。 |
| `list[].passwordID` | `string` | 是 | 密码 ID（每位数字编码为两位十六进制，大写）。 |
| `list[].name` | `string` | 是 | 密码名称（CSV '暗証番号名' 列）。 |
| `list[].nameUUID` | `string` | 是 | 前端新生成的名称 UUID（小写、带连字符）。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `(none)` | `-` | 触发回调，前端只记录日志。 |

::: info 说明
前端先通过 IoT 把密码写入设备，成功后才发送本请求。
:::

### delCards {#biz3manageaccessctlauthdata-delcards}

设备确认删除卡片后，同步删除服务器端的卡片关联。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `items` | `array<{deviceID: string, cardID: string}>` | 是 | 要删除的卡片；deviceID 为认证设备 UUID（从 IoT topic 'stp&lt;uuid>cmd' 截取）。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `(none)` | `-` | 前端不处理响应。 |

### delPasscodes {#biz3manageaccessctlauthdata-delpasscodes}

设备确认删除密码后，同步删除服务器端的密码关联。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `items` | `array<{deviceID: string, passwordID: string}>` | 是 | 要删除的密码；deviceID 为认证设备 UUID。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `(none)` | `-` | 前端没有对应的响应处理分支。 |

### clearCards {#biz3manageaccessctlauthdata-clearcards}

清空服务器端某认证设备的卡片关联（随后前端通过 IoT 重新读取设备卡片）。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `obj` | `object` | 是 | 参数。 |
| `obj.devices` | `string` | 是 | 单个认证设备 UUID。 |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "clearCards",
  "obj": {
    "devices": "11111111-1111-4111-8111-111111111111"
  }
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `(none)` | `-` | 触发回调，前端不读取字段。 |

::: info 说明
仅在设备 Wi-Fi 在线时调用。
:::

### clearPasscodes {#biz3manageaccessctlauthdata-clearpasscodes}

清空服务器端某认证设备的密码关联（随后前端通过 IoT 重新读取）。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `obj` | `object` | 是 | 参数。 |
| `obj.devices` | `string` | 是 | 单个认证设备 UUID。 |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "clearPasscodes",
  "obj": {
    "devices": "11111111-1111-4111-8111-111111111111"
  }
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `(none)` | `-` | 触发回调，前端不读取字段。 |

::: info 说明
仅在设备 Wi-Fi 在线时调用。
:::
