---
title: 设备与历史
---
# 设备与历史

连接方式、消息格式与通用响应字段见 [WebSocket API](./bizapi.md)。

**接口目录**

| action | 操作 |
| --- | --- |
| [`biz3ManageDevice`](#biz3managedevice) | [getUserDevice](#biz3managedevice-getuserdevice)、[getCompanyDevice](#biz3managedevice-getcompanydevice)、[add](#biz3managedevice-add)、[del](#biz3managedevice-del)、[updateName](#biz3managedevice-updatename)、[updateRelayEnable](#biz3managedevice-updaterelayenable)、[updateDeviceOrderKey](#biz3managedevice-updatedeviceorderkey)、[notifyList](#biz3managedevice-notifylist)、[notifyManage](#biz3managedevice-notifymanage)、[switchRecharge](#biz3managedevice-switchrecharge)、[getDeviceStatus](#biz3managedevice-getdevicestatus) |
| [`biz3GetDeviceHistory`](#biz3getdevicehistory) | [getHistory](#biz3getdevicehistory-gethistory)、[getEnv](#biz3getdevicehistory-getenv)、[makeInvisible](#biz3getdevicehistory-makeinvisible) |
| [`biz3GetDeviceBatteryRecord`](#biz3getdevicebatteryrecord) | [batch-get](#biz3getdevicebatteryrecord-batch-get)、[makeInvisible](#biz3getdevicebatteryrecord-makeinvisible) |
| [`biz3GetDeviceEmployeeKeys`](#biz3getdeviceemployeekeys) | [get](#biz3getdeviceemployeekeys-get)、[getLimited](#biz3getdeviceemployeekeys-getlimited) |

## biz3ManageDevice {#biz3managedevice}

设备管理：获取个人/公司设备列表、添加/移除设备、改名、继电器使能、排序、推送通知设置、充电电池开关、获取单设备状态。

### getUserDevice {#biz3managedevice-getuserdevice}

获取当前登录用户个人持有的所有设备钥匙。

**请求**

无额外参数。

```json
{
  "action": "biz3ManageDevice",
  "op": "getUserDevice"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `op` | `string ("PubedUserDevice")` | 数据以 op=PubedUserDevice 的推送消息分页返回，而不是 op=getUserDevice。 |
| `data.totalPage` | `number (integer)` | 总页数。 |
| `data.data.page` | `number (integer, 1-based)` | 当前页码，从 1 开始。 |
| `data.data.list` | `array of device objects` | 本页设备列表，字段见 device_object。 |

::: info 说明
客户端按 page 1..totalPage 连续收集，缺页、乱序或 deviceUUID 重复时丢弃整批快照。客户端用 keyLevel 和机型筛选出可加入公司的设备（仅所有者钥匙）。在旧 App WebView 中（isFromApp 且非 AppHome）客户端默认不发送，除非强制。
:::

### getCompanyDevice {#biz3managedevice-getcompanydevice}

获取公司下已登记的所有设备，并由服务端自动订阅这些设备的状态推送。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `companyID` | `string` | 是 | 公司 ID（取自当前登录信息）。 |

```json
{
  "action": "biz3ManageDevice",
  "op": "getCompanyDevice",
  "companyID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `op` | `string ("PubedCompanyDevice")` | 数据以 op=PubedCompanyDevice 的推送消息分页返回。 |
| `data.totalPage` | `number (integer)` | 总页数。 |
| `data.data.page` | `number (integer, 1-based)` | 当前页码，从 1 开始。 |
| `data.data.list` | `array of device objects` | 本页设备列表，字段见 device_object（含 stateInfo、orderKey）。 |

::: info 说明
代码注释：设备状态订阅由服务端在 getCompanyDevice / getDeviceStatus 时自动完成；WebSocket connectionId 变化（重连）后客户端重新调用以重新订阅。分页收集规则同 getUserDevice。add、del 成功后客户端会自动重新拉取。
:::

### add {#biz3managedevice-add}

将一个或多个设备钥匙登记（或更新）到公司。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `companyID` | `string` | 是 | 公司 ID。 |
| `items` | `array of objects` | 是 | 设备钥匙对象数组。由二维码解析时字段为 {secretKey(hex), keyIndex(hex), sesame2PublicKey(hex), keyLevel(number), deviceModel(string), deviceName(string), deviceUUID(string, 大写)}；其他调用方直接传入 getUserDevice/getCompanyDevice 返回的设备对象，或 App 原生侧返回的钥匙对象。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功。 |
| `message` | `string` | 失败信息；为 "Limit Exceeded" 时表示设备数达到套餐上限。 |

::: info 说明
设备数受套餐限制（Limit Exceeded）。成功后客户端重新调用 getCompanyDevice。AppLockAngle 用 add 提交修改了 deviceModel 的现有设备对象来同步机型，说明 add 对已存在设备具有更新语义（推断自用法）。用户选择列表时只允许 keyLevel 为所有者的钥匙。
:::

### del {#biz3managedevice-del}

从公司中移除设备钥匙。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `companyID` | `string` | 是 | 公司 ID。 |
| `items` | `array of {deviceUUID: string, subUUID: string}` | 是 | 要移除的钥匙列表，每项为设备 UUID 与持有者 subUUID。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功。 |
| `message` | `string` | 失败信息。 |

::: info 说明
成功后客户端重新调用 getCompanyDevice。移除不会重置设备本身；App 端还会关闭该设备的推送（notifyManage enablePush=false）。
:::

### updateName {#biz3managedevice-updatename}

修改设备在用户钥匙上的显示名称。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `obj.subUUID` | `string` | 是 | 当前用户的 subUUID。 |
| `obj.deviceUUID` | `string` | 是 | 设备 UUID。 |
| `obj.deviceName` | `string` | 是 | 新名称（非空）。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功。 |
| `reqContext.deviceUUID` | `string` | 回显的设备 UUID，客户端据此更新本地状态。 |
| `reqContext.deviceName` | `string` | 回显的新名称。 |

::: info 说明
参数包在 obj 中，而非顶层。
:::

### updateRelayEnable {#biz3managedevice-updaterelayenable}

设置 Hub3 LTE 继电器各路的使能状态，写入服务端 hub3_status.relay_info。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `obj.deviceUUID` | `string` | 是 | Hub3 设备 UUID。 |
| `obj.enable1` | `number (0\|1)` | 否 | 第 1 路继电器使能，1=启用，0=停用。 |
| `obj.enable2` | `number (0\|1)` | 否 | 第 2 路继电器使能，1=启用，0=停用。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功（唯一调用方未传回调，不读取响应）。 |

::: info 说明
代码注释：只传需要改动的那一路（enable1 或 enable2）。读取时 stateInfo.relayInfo.enableN 缺失视为启用。
:::

### updateDeviceOrderKey {#biz3managedevice-updatedeviceorderkey}

拖拽后更新某个设备在用户设备列表中的排序位置。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `obj.subUUID` | `string` | 是 | 被移动设备钥匙的 subUUID。 |
| `obj.deviceUUID` | `string` | 是 | 被移动设备的 UUID。 |
| `obj.prevKey` | `string` | 否 | 新位置前一个设备的 orderKey；移到最前时为空。 |
| `obj.nextKey` | `string` | 否 | 新位置后一个设备的 orderKey；移到最后时为空。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功；成功后客户端重新拉取 getCompanyDevice 以获得服务端生成的新 orderKey。 |

::: info 说明
仅当设备列表首项带有 orderKey 时才允许拖拽。orderKey 由服务端生成。
:::

### notifyList {#biz3managedevice-notifylist}

获取某推送令牌下各设备的推送通知开关状态。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `companyID` | `string` | 是 | 公司 ID。 |
| `pushToken` | `string` | 是 | App 原生侧提供的推送令牌。 |
| `items` | `unknown` | 否 | hook 支持该字段，但唯一调用方未传（实际为 undefined）。 |

```json
{
  "action": "biz3ManageDevice",
  "op": "notifyList",
  "companyID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "pushToken": "<push-token>"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功。 |
| `message` | `string` | 失败信息。 |
| `data[].deviceUUID` | `string` | 设备 UUID。 |
| `data[].deviceName` | `string` | 设备名称。 |
| `data[].enablePush` | `boolean` | 该设备推送是否开启。 |

### notifyManage {#biz3managedevice-notifymanage}

开启或关闭某设备对某推送令牌的推送通知。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `companyID` | `string` | 是 | 公司 ID。 |
| `pushToken` | `string` | 是 | 推送令牌。 |
| `deviceUUID` | `string` | 是 | 设备 UUID。 |
| `enablePush` | `boolean` | 是 | true=开启推送，false=关闭。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功。 |
| `message` | `string` | 失败信息。 |

::: info 说明
移除设备（del）后 App 端会以 enablePush=false 调用此接口。
:::

### switchRecharge {#biz3managedevice-switchrecharge}

设置设备是否使用充电电池（影响电量计算）。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | 是 | 设备 UUID。 |
| `isRechargeBattery` | `number (0\|1)` | 是 | 1=充电电池，0=普通电池（客户端由布尔值转换）。 |

```json
{
  "action": "biz3ManageDevice",
  "op": "switchRecharge",
  "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "isRechargeBattery": 1
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功；失败时客户端回滚开关。 |

::: info 说明
成功后客户端重新拉取设备列表与电池记录（batch-get），推断电池记录会随此设置变化。当前值读自 stateInfo.isRechargeBattery。
:::

### getDeviceStatus {#biz3managedevice-getdevicestatus}

获取单个设备的详情与状态，并由服务端订阅其状态推送。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | 是 | 设备 UUID（为空时客户端不发送）。 |

```json
{
  "action": "biz3ManageDevice",
  "op": "getDeviceStatus",
  "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data` | `array of device objects` | 客户端只取 data[0] 作为设备详情（字段见 device_object）；空数组表示无数据。 |

::: info 说明
代码注释：状态订阅由服务端在 getCompanyDevice / getDeviceStatus 时自动完成。用于固件升级页、设备设置、电池页等，当设备不在公司列表中时作为后备。
:::

## biz3GetDeviceHistory {#biz3getdevicehistory}

设备操作历史：分页获取历史、获取某条历史的环境快照、隐藏某条历史。

### getHistory {#biz3getdevicehistory-gethistory}

分页获取一个或多个设备的操作历史。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `companyID` | `string` | 是 | 公司 ID。 |
| `list` | `array of objects` | 是 | 查询目标。单设备查询时为 [{deviceUUID: string, lastKey: number\|null}]；全部设备查询时每项为 {deviceId: string, lastKey: number\|null}（注意键名为 deviceId）。lastKey 为上一页最后一条记录的 timestamp，首页为 null。 |
| `pageSize` | `number \| null` | 否 | 每页条数；默认发送 null（服务端默认值），CSV/Excel 导出时为 100。 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data` | `array of history records (single-device form)` | 单设备查询时为历史记录数组；空数组表示没有更多。 |
| `data[].device_id` | `string` | 设备 UUID。 |
| `data[].timestamp` | `number` | 记录时间（客户端以 new Date(timestamp) 解析，即毫秒）；也用作下一页的 lastKey。 |
| `data[].type` | `number` | 历史事件类型（开锁、关锁等，客户端映射为状态图标与文案）。 |
| `data[].history_tag` | `string (base64) \| object of byte values` | 操作者标签，base64 编码的 UTF-8 文本（也可能是字节对象）；缺失时显示类型对应的手动操作文案。 |
| `data[].record_id` | `number \| string` | 记录 ID（用作列表 key）。 |
| `data[].via` | `unknown` | 操作方式（仅在 CSV 导出表头中引用）。 |
| `data[].botHistoryMode` | `string ('script'\|'widget'\|'manual')` | Bot2/Bot3 历史的触发方式：脚本、小组件点击、手动点击。 |
| `data[].botAlias` | `string` | Bot 脚本别名（botHistoryMode=script 时显示）。 |
| `data[].botViaType` | `unknown` | Bot 触发途径类型，传给显示组件。 |
| `data.items` | `array of history records (multi-device form)` | 全部设备查询时的合并历史记录（字段同上）。 |
| `data.deviceLastKeys` | `object {deviceUUID: lastKey}` | 各设备的下一页 lastKey，下次请求时回填到 list。 |
| `data.hasMore` | `boolean` | 是否还有更多记录。 |

::: info 说明
响应形态取决于请求：单设备（list 项使用 deviceUUID）返回 data 数组；全部设备（list 项使用 deviceId）返回 data{items, deviceLastKeys, hasMore}。代码未说明服务端如何区分两者（可能依据 list 长度或键名），需与后端确认。导出时以 "返回条数 == pageSize" 判断是否继续翻页。
:::

### getEnv {#biz3getdevicehistory-getenv}

获取某条历史记录发生时的环境快照。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | 是 | 设备 UUID（取自记录的 device_id）。 |
| `timestamp` | `number` | 是 | 历史记录的 timestamp。 |

```json
{
  "action": "biz3GetDeviceHistory",
  "op": "getEnv",
  "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "timestamp": 1700000000000
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data` | `array of single-key objects [{key: value}, ...] \| JSON string` | 环境快照：由单键对象组成的数组，每项的键为指标名、值为数值/字符串/数组；也可能直接是 JSON 字符串。缺失时视为 {}（无数据）。 |

::: info 说明
客户端不检查 success，直接将 data 进行 base64 编码后传给快照页面展示。具体键名代码未列出（通过 i18n envSnapshot.&lt;key> 翻译）。
:::

### makeInvisible {#biz3getdevicehistory-makeinvisible}

隐藏（从列表中删除显示）一条历史记录。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | 是 | 设备 UUID（取自记录的 device_id）。 |
| `timestamp` | `number` | 是 | 要隐藏的记录的 timestamp。 |

```json
{
  "action": "biz3GetDeviceHistory",
  "op": "makeInvisible",
  "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "timestamp": 1700000000000
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 成功时客户端从列表中移除该 timestamp 的记录。 |

::: info 说明
访客钥匙（keyLevel=2）的历史页面禁用交互。是否为软删除由名称推断（makeInvisible）。
:::

## biz3GetDeviceBatteryRecord {#biz3getdevicebatteryrecord}

设备电池电压记录：分页获取与隐藏单条记录。

### batch-get {#biz3getdevicebatteryrecord-batch-get}

分页获取设备的电池电压/电量历史记录，用于绘制电池曲线。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | 是 | 设备 UUID。 |
| `lastEvaluatedKey` | `any \| null` | 否 | 分页游标，原样回传上一次响应中的 data.lastEvaluatedKey；首页为 null。 |
| `pageSize` | `number` | 是 | 每页条数：App 内为 50，网页为 100。 |

```json
{
  "action": "biz3GetDeviceBatteryRecord",
  "op": "batch-get",
  "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "lastEvaluatedKey": null,
  "pageSize": 100
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data.records` | `array of objects` | 电池记录数组（缺失时视为空）。 |
| `data.records[].ts` | `number` | 记录时间，Unix 秒。 |
| `data.records[].light` | `number` | 轻负载电压，单位 mV（客户端除以 1000 显示为 V）。 |
| `data.records[].heavy` | `number` | 重负载电压，单位 mV；-1 表示无此值。 |
| `data.records[].lightPercentage` | `number` | 轻负载电压对应的电量百分比。 |
| `data.records[].heavyPercentage` | `number` | 重负载电压对应的电量百分比。 |
| `data.lastEvaluatedKey` | `any \| null` | 下一页游标；为空表示没有更多数据。 |

::: info 说明
WiFi 模块机型不调用此接口（客户端显示固定的示意数据）。新页数据被前置拼接（更早的记录）。
:::

### makeInvisible {#biz3getdevicebatteryrecord-makeinvisible}

隐藏一条电池记录。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | 是 | 设备 UUID。 |
| `timestamp_second` | `number` | 是 | 要隐藏的记录的 ts（Unix 秒）。 |

```json
{
  "action": "biz3GetDeviceBatteryRecord",
  "op": "makeInvisible",
  "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "timestamp_second": 1700000000
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功。 |
| `data.timestamp_second` | `number` | 回显被隐藏记录的时间戳，客户端据此从图表中移除该点。 |

::: info 说明
WiFi 模块机型不调用此接口。
:::

## biz3GetDeviceEmployeeKeys {#biz3getdeviceemployeekeys}

获取某设备的所有钥匙持有者（员工与访客钥匙）。

### get {#biz3getdeviceemployeekeys-get}

获取设备的全部钥匙持有者列表（不限条数）。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `companyID` | `string` | 是 | 公司 ID。 |
| `deviceUUID` | `string` | 是 | 设备 UUID。 |
| `limit` | `number (0) \| undefined` | 否 | 为 0 或未传时 op 为 get（管理模式传 0，其他刷新场景不传）。 |

```json
{
  "action": "biz3GetDeviceEmployeeKeys",
  "op": "get",
  "companyID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "limit": 0
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data` | `array of objects` | 钥匙持有者列表。 |
| `data[].subUUID` | `string` | 持有者用户的 subUUID（访客钥匙本身可能没有）。 |
| `data[].keyLevel` | `number` | 0=所有者，1=管理者，2=访客。 |
| `data[].startAt` | `number` | 访客钥匙（keyLevel=2）有效期开始，Unix 秒。 |
| `data[].endAt` | `number` | 访客钥匙有效期结束，Unix 秒；与 startAt 都缺失时显示为常时可用。 |
| `data[].employeeName` | `string` | 用户名；访客钥匙时可能是时间戳形式的名称（客户端会格式化为月日）。 |
| `data[].employeeEmail` | `string` | 用户邮箱（可选）。 |
| `data[].guestKeyId` | `string` | 访客钥匙 ID；非空表示这是一把访客钥匙。 |
| `data[].secretKey` | `string` | 与某访客钥匙 guestKeyId 相同时，表示该用户是通过此访客钥匙获得的（客户端将其归组到该访客钥匙下）。 |
| `hasMore` | `boolean` | 顶层字段：是否还有更多持有者未返回。 |

::: info 说明
op 由客户端根据 limit 决定：limit>0 用 getLimited，否则用 get。
:::

### getLimited {#biz3getdeviceemployeekeys-getlimited}

获取设备的前 N 个钥匙持有者（用于设备详情的预览）。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `companyID` | `string` | 是 | 公司 ID。 |
| `deviceUUID` | `string` | 是 | 设备 UUID。 |
| `limit` | `number (>0)` | 是 | 最多返回条数；非管理模式下客户端传 5。 |

```json
{
  "action": "biz3GetDeviceEmployeeKeys",
  "op": "getLimited",
  "companyID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "limit": 5
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data` | `array of objects` | 钥匙持有者列表，字段同 op=get。 |
| `hasMore` | `boolean` | 顶层字段：超出 limit 时为 true，客户端据此显示“更多”。 |
