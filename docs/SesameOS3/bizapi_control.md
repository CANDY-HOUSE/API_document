---
title: 设备操作
---
# 设备操作

连接方式、消息格式与通用响应字段见 [WebSocket API](./bizapi.md)。

**接口目录**

| action | 操作 |
| --- | --- |
| [`biz3OperateIoT`](#biz3operateiot) | [cmd](#biz3operateiot-cmd)、[&lt;cmdCode number> (Touch Pro)](#biz3operateiot-cmdcode-number-touch-pro) |
| [`biz3TriggerLocker`](#biz3triggerlocker) | [pubDeviceStateChange (server push)](#biz3triggerlocker-pubdevicestatechange-server-push)、[pubUserDeviceChange (server push)](#biz3triggerlocker-pubuserdevicechange-server-push) |
| [`biz3InvokeWebAPIs`](#biz3invokewebapis) | [webapi_ssm_shadow_get](#biz3invokewebapis-webapi-ssm-shadow-get)、[webapi_history_get](#biz3invokewebapis-webapi-history-get)、[webapi_cmd_send](#biz3invokewebapis-webapi-cmd-send) |
| [`biz3Schedule`](#biz3schedule) | [getScheduleList](#biz3schedule-getschedulelist)、[cancelSchedule](#biz3schedule-cancelschedule) |
| [`biz3IRRemote`](#biz3irremote) | [getRemoteList](#biz3irremote-getremotelist)、[getRemoteListVersion](#biz3irremote-getremotelistversion)、[searchRemoteList](#biz3irremote-searchremotelist)、[sendIR](#biz3irremote-sendir)、[updateRemoteState](#biz3irremote-updateremotestate)、[addIRRemote](#biz3irremote-addirremote)、[deleteIRRemote](#biz3irremote-deleteirremote)、[duplicateIRRemote](#biz3irremote-duplicateirremote)、[updateRemoteAlias](#biz3irremote-updateremotealias)、[setRemoteKeyOrder](#biz3irremote-setremotekeyorder)、[getRemoteKeyOrder](#biz3irremote-getremotekeyorder)、[getIRMode](#biz3irremote-getirmode)、[setIRMode](#biz3irremote-setirmode)、[subscribeIRMode](#biz3irremote-subscribeirmode)、[subscribeIRModeRsp (server push)](#biz3irremote-subscribeirmodersp-server-push)、[subscribeIRData](#biz3irremote-subscribeirdata)、[subscribeIRDataRsp (server push)](#biz3irremote-subscribeirdatarsp-server-push)、[unsubscribeIRMode](#biz3irremote-unsubscribeirmode)、[unsubscribeIRData](#biz3irremote-unsubscribeirdata)、[matchRemote](#biz3irremote-matchremote)、[getIRCodes](#biz3irremote-getircodes)、[addIRCode](#biz3irremote-addircode)、[updateIRCode](#biz3irremote-updateircode)、[deleteIRCode](#biz3irremote-deleteircode)、[addRemoteToMatter](#biz3irremote-addremotetomatter) |
| [`biz3Face3Qr`](#biz3face3qr) | [command](#biz3face3qr-command)、[list](#biz3face3qr-list)、[live](#biz3face3qr-live)、[viewer](#biz3face3qr-viewer) |

## biz3OperateIoT {#biz3operateiot}

通过云端把二进制命令转发到设备的 IoT topic（Hub3 'wm2…cmd' 或 Touch Pro 'stp…cmd'），设备回报以同一 action 推回。

### cmd {#biz3operateiot-cmd}

向 Hub3（或经 Hub3 中转的设备）下发一条二进制 IoT 命令（固件升级、LED 亮度、添加/删除 Sesame、Matter 配网、继电器开关、清除 WiFi SSID）。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3OperateIoT' |
| `op` | `string` | 是 | 固定为 'cmd' |
| `topic` | `string` | 是 | 'wm2' + hub3TopicId(hub3_id) + 'cmd'。hub3TopicId：UUID 以 '00000000-055A-FD81-0D00-'（大小写无关）开头的旧 Hub3 取末段 MAC，Hub3 Pro 取完整 UUID。hub3_id 缺省为 device_id |
| `payload` | `string (base64)` | 是 | base64( sign[4B] ‖ cmd[1B] ‖ UTF-8(device_id) ‖ 附加数据 )。sign 为 Cmac.cmacTime(secretKey) 的 8 位十六进制转 4 字节（算法同 biz3TriggerLocker.sign）。附加数据按 cmd：101/103（添加/删除 Sesame）= sesameId[16B] ‖ ssmSecKa[16B，无钥匙时 16 字节 0] ‖ nickName 长度[1B] ‖ nickName UTF-8 ‖ productType[1B] ‖ matterProductType[1B]；92（LED）= op[1B: 1=set,2=get] ‖ duty[1B 0-255]；208（继电器）= relayId[1B: 1/2] ‖ action[1B: 0=关,1=开]；3、137、153、210 无附加数据 |

```json
{
  "action": "biz3OperateIoT",
  "op": "cmd",
  "topic": "wm2xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxcmd",
  "payload": "<base64(sign|cmd|device_id|extra)>"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `action` | `string` | 'biz3OperateIoT' |
| `op` | `number \| string` | 与请求相同的命令码；前端按 op 分发到已注册的回调（registerIotCallback） |
| `UUID` | `string (optional)` | 上报设备 UUID；与 touch_id 二选一，优先 UUID |
| `touch_id` | `string (optional)` | 无 UUID 时用作设备标识 |
| `data` | `object (optional)` | 设备回报数据；存在时作为回调第二参数，否则整条 message 作为第二参数 |
| `data.progress` | `number (cmd 3)` | 固件升级进度（负数为连接/启动等阶段，含完成/中止标记） |
| `data.versionTag` | `string (cmd 3)` | 升级完成后的新固件版本 |
| `data.UUID` | `string (cmd 3)` | 上报进度的设备 UUID |
| `data.ledDuty` | `number 0-255 (cmd 92)` | 当前 LED 占空比，前端换算为百分比 |
| `data.qrCode` | `string (cmd 137)` | Matter 配网二维码内容 |
| `data.manualCode` | `string (cmd 137)` | Matter 手动配对码 |
| `data.statusCode` | `number (cmd 153)` | 打开配网窗口结果，0 = 成功 |

::: info 说明
cmd 取值见 constants/cmdCode.js：3 ssmOSUpdate、92 HUB3_ITEM_CODE_LED_DUTY、101 SSM3_ITEM_ADD_SESAME、103 SSM3_ITEM_REMOVE_SESAME、137 HUB3_MATTER_PAIRING_CODE、153 HUB3_MATTER_PAIRING_WINDOW、208 HUB3_ITEM_CODE_RELAY_SWITCH、210 HUB3_ITEM_CODE_CLEAR_WIFI_SSID。注释：connectionId 由云端自动附加，前端不放入 payload。注释：固件按固定结构校验长度，Sesame 无钥匙时必须补 16 字节 0，否则命令被静默丢弃。响应的 op 为设备回报的命令码（数字），前端按命令码注册回调；101/103 的回报 data 只透传给调用方，不读取具体字段。APP 内嵌（isAppHome）时不进入断线重发队列。
:::

### &lt;cmdCode number> (Touch Pro) {#biz3operateiot-cmdcode-number-touch-pro}

向 Sesame Touch Pro / 认证机器下发卡片、密码相关二进制命令（查询、模式切换、添加、删除、改名、批量上传/删除）。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3OperateIoT' |
| `op` | `number` | 是 | 命令码，与 payload 第 1 字节相同：109 卡片取得、125 密码取得、114/130 卡片/密码模式设置、140 卡片添加、138 密码添加、108 卡片删除、124 密码删除、107/123 卡片/密码改名、137 密码值修改、182/184 卡片/密码批量添加、183/185 卡片/密码批量删除 |
| `topic` | `string` | 是 | 'stp' + 认证设备 UUID + 'cmd' |
| `payload` | `string (base64)` | 是 | 第 1 字节为命令码。109/125：仅命令码。114/130：[code, mode]，mode 0=验证 1=录入。140/138：41 字节 [code, 0xF0(USED), 类型(卡 0x80 表示 IoT 添加 / 密码 0x00), idLen, id 补零至 16B, nameUUIDLen(16), nameUUID 16B, 末尾 4 字节 0]。108/124：[code, id 字节]。107/123：[code, idLen, id, 新 nameUUID 16B]。137：[code, 旧值长度, 旧值, 新值]。182/184：分片 [code, offset 低, offset 高, total 低, total 高, 数据...]，单包上限 4910 字节，数据为重复的 (idLen, id, nameUUIDLen, nameUUID)。183/185：[code, (len, id)×N] |

```json
{
  "action": "biz3OperateIoT",
  "op": 109,
  "topic": "stpxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxcmd",
  "payload": "bQ=="
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `action` | `string` | 'biz3OperateIoT' |
| `op` | `number \| string` | 与请求相同的命令码；前端按 op 分发到已注册的回调（registerIotCallback） |
| `UUID` | `string (optional)` | 上报设备 UUID；与 touch_id 二选一，优先 UUID |
| `touch_id` | `string (optional)` | 无 UUID 时用作设备标识 |
| `data` | `object (optional)` | 设备回报数据；存在时作为回调第二参数，否则整条 message 作为第二参数 |
| `data.status` | `string (182/184) \| any (114)` | 批量上传：'Ok' 完成，'Pending' 等待，其他形如 'N/...' 表示从第 N-1 字节处重发；114 时与 data.op 一起传给录卡界面 |
| `data.c` | `string (hex, 107)` | 卡片信息十六进制串，由 parseHexStrToCardInfo 解析出 cardID 等 |
| `data.p` | `string (hex, 123)` | 密码信息十六进制串，由 parseHexStrToPasscodeInfo 解析 |
| `data.stpUUID` | `string (110/126 notify)` | 卡片/密码变更通知的设备 UUID，触发重新拉取 |
| `data.reqContext` | `object {topic, payload} (183/185)` | 原请求上下文；从 topic 截出设备 ID，从 payload 解析被删除的 ID 列表 |
| `data.wifi_state / cards_num / fingerprints_num / keyboards_num` | `any / number (op 81 push)` | 机械状态推送（SSM2_ITEM_CODE_MECH_STATUS）：WiFi 状态与卡片/指纹/密码数量；数量变化时重新拉取 |

::: info 说明
cmdCode 137 同时被 HUB3_MATTER_PAIRING_CODE 和 STP_ITEM_CODE_PASSCODE_CHANGE_VALUE 使用，回调按 op 数字全局注册，存在冲突可能。140/138 的 nameUUID 由前端随机生成。109/125 的结果数据不经此处理器读取（列表由其他 action 获取）。改名（107/123）在 15 秒内无回报时提示检查认证机器与 Hub3 的连接。
:::

## biz3TriggerLocker {#biz3triggerlocker}

对 Sesame 锁/Bot 执行开锁、上锁、切换或 Bot 动作，带时间签名与历史标签；设备状态变化以同一 action 推送。

### `biz3TriggerLocker` {#biz3triggerlocker-request}

通过云端向 Sesame 设备下发开关锁/Bot 命令。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3TriggerLocker' |
| `cmd` | `number` | 否 | 命令码，缺省 88。82 = 上锁，83 = 开锁，88 = 切换（toggle），89 = Bot 点击，170 + n = 执行 Bot 第 n 号脚本 |
| `sign` | `string (8 hex chars)` | 是 | 8 位小写十六进制串。算法 Cmac.cmacTime(secretKey)：取当前 Unix 秒数，按 uint32 小端写成 4 字节，丢弃第 0 字节（最低位），取第 1–3 字节共 3 字节作为消息；以设备 secretKey（十六进制串 → 16 字节，AES-128）计算 AES-CMAC（RFC 4493 子密钥/填充），结果取前 4 字节转十六进制。 |
| `history` | `string (base64)` | 是 | base64( hex(prefix + uuid 去掉连字符) )。prefix：PC 浏览器默认 '000c'（BIZ 类型）；APP 内嵌时 Android '0010'、iOS '0011'（WiFi 图标类型）。uuid 优先级：envId（后端生成并缓存在 localStorage 'web_env_id'）→ subUUID → 'ffffffff-ffff-ffff-ffff-ffffffffffff'。 |
| `device_id` | `string (UUID)` | 是 | 目标 Sesame 设备 UUID |

```json
{
  "action": "biz3TriggerLocker",
  "cmd": 88,
  "sign": "xxxxxxxx",
  "history": "<base64(000c + uuid hex)>",
  "device_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**响应**

客户端不读取 `data` 以外的特定字段，仅依据 `success` 判断结果。

::: info 说明
注释：未取得 envId/subUUID（访客）时按协议使用全 ff，云端显示为“未登入用户”。请求本身没有被读取的直接响应；状态更新通过 pubDeviceStateChange / pubUserDeviceChange 推送。APP 内嵌（isAppHome）时不进入断线重发队列。调用来源：设备开关（VIotSwitch）、批量开/上锁（83/82）、Bot 脚本（170+n）、APP 宿主请求（operation lock/unlock/toggle → 82/83/88，Bot 89，脚本 Bot 170+默认脚本 actionIndex）。注意：前端参数名拼写为 sescretKey。
:::

### pubDeviceStateChange (server push) {#biz3triggerlocker-pubdevicestatechange-server-push}

服务器推送：某设备状态变化。

**请求**

无额外参数。

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `op` | `string` | 'pubDeviceStateChange' |
| `data` | `object {deviceUUID, stateInfo?, ...}` | 按 deviceUUID 合并到本地设备列表；stateInfo 浅合并，其余字段覆盖 |

::: info 说明
stateInfo 的具体字段由服务器决定，此处理器不逐一读取。
:::

### pubUserDeviceChange (server push) {#biz3triggerlocker-pubuserdevicechange-server-push}

服务器推送：用户设备列表变化，前端重新拉取公司设备。

**请求**

无额外参数。

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `op` | `string` | 'pubUserDeviceChange' |

::: info 说明
不读取 data。
:::

## biz3InvokeWebAPIs {#biz3invokewebapis}

开发者页面：以公司 API Key 代理调用 Sesame Web API（取状态、取历史、发命令）。

### webapi_ssm_shadow_get {#biz3invokewebapis-webapi-ssm-shadow-get}

取得设备当前状态（shadow）。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3InvokeWebAPIs' |
| `apiKeyId` | `string` | 是 | 当前公司开发者 API Key 的 ID |
| `op` | `string` | 是 | 'webapi_ssm_shadow_get' |
| `query` | `object {device_id: string}` | 是 | 目标设备 UUID |
| `body` | `object` | 是 | 固定为 {} |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `op` | `string` | 与请求相同，用于匹配回调 |
| `data` | `any` | Web API 原始结果，开发者页面以 JSON 原样显示 |

::: info 说明
收到任何 biz3InvokeWebAPIs 响应后都会重新调用 gStripe.
:::

### webapi_history_get {#biz3invokewebapis-webapi-history-get}

取得设备操作历史（第 0 页，5 条）。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3InvokeWebAPIs' |
| `apiKeyId` | `string` | 是 | 当前公司开发者 API Key 的 ID |
| `op` | `string` | 是 | 'webapi_history_get' |
| `query` | `object {device_id: string, page: number, lg: number, isBiz: boolean}` | 是 | device_id 设备 UUID；page 页码（前端固定 0）；lg 条数（固定 5）；isBiz 固定 true |
| `body` | `object` | 是 | 固定为 {} |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `op` | `string` | 与请求相同，用于匹配回调 |
| `data` | `any` | Web API 原始结果，开发者页面以 JSON 原样显示 |

::: info 说明
收到任何 biz3InvokeWebAPIs 响应后都会重新调用 gStripe.
:::

### webapi_cmd_send {#biz3invokewebapis-webapi-cmd-send}

通过 Web API 向设备发送开关锁/Bot 命令。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3InvokeWebAPIs' |
| `apiKeyId` | `string` | 是 | 当前公司开发者 API Key 的 ID |
| `op` | `string` | 是 | 'webapi_cmd_send' |
| `query` | `undefined` | 否 | 不发送 |
| `body` | `object {cmd: number, history: string, sign: string, device_id: string}` | 是 | cmd：开发者页面按机型选 88（切换，默认）、89（bot_2）、83（ssm_bike2 开锁）；sign 与 biz3TriggerLocker 相同的 AES-CMAC 时间签名；history = base64(hex('000c' + subUUID 去连字符))；device_id 设备 UUID |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `op` | `string` | 与请求相同，用于匹配回调 |
| `data` | `any` | Web API 原始结果，开发者页面以 JSON 原样显示 |

::: info 说明
收到任何 biz3InvokeWebAPIs 响应后都会重新调用 gStripe.与 biz3TriggerLocker 不同，这里 history 只用 subUUID，没有 envId 或全 ff 回退。
:::

## biz3Schedule {#biz3schedule}

查询与取消当前用户的定时操作（如定时上锁/开锁/固件升级）。

### getScheduleList {#biz3schedule-getschedulelist}

取得当前用户的定时任务列表。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3Schedule' |
| `op` | `string` | 是 | 'getScheduleList' |
| `userId` | `string (UUID)` | 是 | 当前用户 subUUID；为空时不发送 |

```json
{
  "action": "biz3Schedule",
  "op": "getScheduleList",
  "userId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data` | `array of {scheduleId, deviceName, action, displayTime}` | 定时任务数组；scheduleId 任务 ID，deviceName 设备名，action 动作（如 lock、unlock、upgrade_firmware，其他值按驼峰/下划线拆词显示），displayTime 显示时间（'YYYY-MM-DD HH:mm'、'HH:mm' 或任意文字） |

::: info 说明
data.length 作为 count 保存。
:::

### cancelSchedule {#biz3schedule-cancelschedule}

取消一个定时任务。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3Schedule' |
| `op` | `string` | 是 | 'cancelSchedule' |
| `userId` | `string (UUID)` | 是 | 当前用户 subUUID；为空时不发送 |
| `scheduleId` | `string` | 是 | 要取消的任务 ID |

```json
{
  "action": "biz3Schedule",
  "op": "cancelSchedule",
  "userId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "scheduleId": "xxxxxxxx"
}
```

**响应**

客户端不读取 `data` 以外的特定字段，仅依据 `success` 判断结果。

::: info 说明
处理器不读取 cancelSchedule 响应的任何字段；页面先把该项标记为取消中（显示加载图标），之后如何从列表移除代码中不明确（可能依赖服务器再推送 getScheduleList）。
:::

## biz3IRRemote {#biz3irremote}

Hub3 红外遥控器：码库查询、发射红外码、遥控器与自学习按键的增删改、学习模式与数据订阅、Matter 桥接。

### getRemoteList {#biz3irremote-getremotelist}

分页取得某红外类型的遥控器型号列表。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3IRRemote' |
| `op` | `string` | 是 | 'getRemoteList' |
| `type` | `string \| number` | 是 | 红外类型：0x2000 电视、0x8000 风扇、0xC000 空调、0xE000 灯、0xFE00 自学习 |
| `companyID` | `string` | 是 | 当前公司 ID（customerInfo.companyID） |
| `pagination` | `object {page: number, pageSize: number}` | 是 | 页码（从 1 开始）与每页数量（默认 200） |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功；失败且 code≠406 时弹出错误提示 |
| `code` | `number` | 错误码；406 静默处理（数据为空，如码表中无该键） |
| `message` | `string` | 错误信息 |
| `data.data` | `array` | 遥控器型号数组（currentPage=1 时替换，否则追加） |
| `data.pagination` | `object {currentPage, pageSize, totalCount, hasMore}` | 分页信息；hasMore 决定是否继续加载 |
| `data.dataVersion` | `string` | 列表数据版本，用于本地缓存校验；翻页途中版本变化则整体重载 |

::: info 说明
数组元素字段在列表页仅见 direction，其他字段代码中未逐一读取。
:::

### getRemoteListVersion {#biz3irremote-getremotelistversion}

静默查询遥控器列表数据版本，用于判断本地缓存是否过期。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3IRRemote' |
| `op` | `string` | 是 | 'getRemoteListVersion' |
| `type` | `string \| number` | 是 | 红外类型：0x2000 电视、0x8000 风扇、0xC000 空调、0xE000 灯、0xFE00 自学习 |
| `companyID` | `string` | 是 | 当前公司 ID（customerInfo.companyID） |
| `silent` | `boolean` | 是 | 固定 true；服务器在 reqContext.silent 回传，前端据此不改列表、不弹错误 |

```json
{
  "action": "biz3IRRemote",
  "op": "getRemoteListVersion",
  "type": "8192",
  "companyID": "xxxxxxxx",
  "silent": true
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功；失败且 code≠406 时弹出错误提示 |
| `code` | `number` | 错误码；406 静默处理（数据为空，如码表中无该键） |
| `message` | `string` | 错误信息 |
| `data.dataVersion` | `string` | 最新数据版本 |
| `reqContext.silent` | `boolean` | 静默标记回传 |

### searchRemoteList {#biz3irremote-searchremotelist}

按关键词搜索某红外类型的遥控器型号。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3IRRemote' |
| `op` | `string` | 是 | 'searchRemoteList' |
| `type` | `string \| number` | 是 | 红外类型：0x2000 电视、0x8000 风扇、0xC000 空调、0xE000 灯、0xFE00 自学习 |
| `companyID` | `string` | 是 | 当前公司 ID（customerInfo.companyID） |
| `searchTerm` | `string` | 是 | 去除首尾空白的关键词；为空时前端不发送 |
| `pagination` | `object {page: 1, pageSize: 1000}` | 是 | 固定第 1 页，最多 1000 条 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功；失败且 code≠406 时弹出错误提示 |
| `code` | `number` | 错误码；406 静默处理（数据为空，如码表中无该键） |
| `message` | `string` | 错误信息 |
| `data.data` | `array` | 搜索结果数组 |

### sendIR {#biz3irremote-sendir}

让 Hub3 发射一个红外码。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3IRRemote' |
| `op` | `string` | 是 | 'sendIR' |
| `deviceId` | `string (UUID)` | 是 | Hub3 设备 UUID |
| `command` | `string` | 是 | remoteEmit：前端按键构建的十六进制命令串；learnEmit：自学习按键的 keyUUID |
| `operation` | `string` | 是 | 'remoteEmit'（码库遥控器）或 'learnEmit'（自学习遥控器） |
| `irType` | `string \| number` | 是 | 遥控器 type（见 getRemoteList.type） |
| `companyID` | `string` | 是 | 当前公司 ID（customerInfo.companyID） |
| `irDeviceUUID` | `string` | 是 | 遥控器 UUID；未保存的遥控器为空串 |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功；失败且 code≠406 时弹出错误提示 |
| `code` | `number` | 错误码；406 静默处理（数据为空，如码表中无该键） |
| `message` | `string` | 错误信息 |
| `data` | `any` | 仅记录日志 |

::: info 说明
成功时显示“发送成功”。code 406 表示码表中没有该键的码（全局静默，非空调页面单独提示）。成功后若遥控器已保存，页面接着调用 updateRemoteState。
:::

### updateRemoteState {#biz3irremote-updateremotestate}

保存遥控器最后一次发送的状态（命令串）。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3IRRemote' |
| `op` | `string` | 是 | 'updateRemoteState' |
| `deviceId` | `string (UUID)` | 是 | Hub3 设备 UUID |
| `uuid` | `string (UUID)` | 是 | 遥控器 UUID |
| `state` | `string` | 是 | 最后发送的命令串 |
| `companyID` | `string` | 是 | 当前公司 ID（customerInfo.companyID） |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功；失败且 code≠406 时弹出错误提示 |
| `code` | `number` | 错误码；406 静默处理（数据为空，如码表中无该键） |
| `message` | `string` | 错误信息 |

::: info 说明
处理器只记录日志；回调收到整条消息。
:::

### addIRRemote {#biz3irremote-addirremote}

把一个遥控器保存到 Hub3。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3IRRemote' |
| `op` | `string` | 是 | 'addIRRemote' |
| `remote` | `object {uuid, model, state, alias, code, type, deviceUUID, keys: []}` | 是 | uuid 前端生成；model/alias/code/type 来自所选型号；state 当前命令串（自学习为空串）；deviceUUID 为 Hub3 UUID；keys 固定 [] |
| `companyID` | `string` | 是 | 当前公司 ID（customerInfo.companyID） |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功；失败且 code≠406 时弹出错误提示 |
| `code` | `number` | 错误码；406 静默处理（数据为空，如码表中无该键） |
| `message` | `string` | 错误信息 |

::: info 说明
前端限制：非自学习（type≠0xFE00）的遥控器每台 Hub3 最多 3 个，超出时不发送并直接回调失败。码库遥控器保存成功后还会调用 addRemoteToMatter。
:::

### deleteIRRemote {#biz3irremote-deleteirremote}

从 Hub3 删除一个遥控器。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3IRRemote' |
| `op` | `string` | 是 | 'deleteIRRemote' |
| `hub3DeviceId` | `string (UUID)` | 是 | Hub3 设备 UUID |
| `uuid` | `string (UUID)` | 是 | 遥控器 UUID |
| `companyID` | `string` | 是 | 当前公司 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "deleteIRRemote",
  "hub3DeviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "companyID": "xxxxxxxx"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功；失败且 code≠406 时弹出错误提示 |
| `code` | `number` | 错误码；406 静默处理（数据为空，如码表中无该键） |
| `message` | `string` | 错误信息 |

::: info 说明
处理器只记录日志；回调收到整条消息。
:::

### duplicateIRRemote {#biz3irremote-duplicateirremote}

复制遥控器（服务器生成新 UUID；自学习遥控器同时复制按键与红外数据）。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3IRRemote' |
| `op` | `string` | 是 | 'duplicateIRRemote' |
| `hub3DeviceId` | `string (UUID)` | 是 | Hub3 设备 UUID |
| `uuid` | `string (UUID)` | 是 | 源遥控器 UUID |
| `alias` | `string` | 是 | 新遥控器别名；前端传源别名，空时服务器沿用源别名 |
| `companyID` | `string` | 是 | 当前公司 ID（customerInfo.companyID） |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功；失败且 code≠406 时弹出错误提示 |
| `code` | `number` | 错误码；406 静默处理（数据为空，如码表中无该键） |
| `message` | `string` | 错误信息 |
| `data` | `object (new remote: uuid, alias, type, code, ... + duplicatedKeys, skippedKeys)` | 新遥控器对象；data.uuid 必须存在才算成功 |
| `data.skippedKeys` | `number` | 未能复制的按键数，>0 时提示警告 |
| `data.duplicatedKeys` | `any` | 前端删除此字段后保存 |

::: info 说明
成功后前端为新遥控器补一次 addRemoteToMatter。
:::

### updateRemoteAlias {#biz3irremote-updateremotealias}

修改遥控器别名。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3IRRemote' |
| `op` | `string` | 是 | 'updateRemoteAlias' |
| `deviceId` | `string (UUID)` | 是 | Hub3 设备 UUID |
| `uuid` | `string (UUID)` | 是 | 遥控器 UUID |
| `alias` | `string` | 是 | 新别名 |
| `companyID` | `string` | 是 | 当前公司 ID（customerInfo.companyID） |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功；失败且 code≠406 时弹出错误提示 |
| `code` | `number` | 错误码；406 静默处理（数据为空，如码表中无该键） |
| `message` | `string` | 错误信息 |

::: info 说明
前端函数名为 modifyIRRemote。
:::

### setRemoteKeyOrder {#biz3irremote-setremotekeyorder}

保存遥控器按键排序。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3IRRemote' |
| `op` | `string` | 是 | 'setRemoteKeyOrder' |
| `deviceId` | `string (UUID)` | 是 | Hub3 设备 UUID |
| `uuid` | `string (UUID)` | 是 | 遥控器 UUID（必须已保存） |
| `keyOrder` | `array of string` | 是 | 按键 ID 顺序；空数组表示恢复默认 |
| `companyID` | `string` | 是 | 当前公司 ID（customerInfo.companyID） |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功；失败且 code≠406 时弹出错误提示 |
| `code` | `number` | 错误码；406 静默处理（数据为空，如码表中无该键） |
| `message` | `string` | 错误信息 |

::: info 说明
处理器只记录日志；回调收到整条消息。
:::

### getRemoteKeyOrder {#biz3irremote-getremotekeyorder}

取得遥控器按键排序。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3IRRemote' |
| `op` | `string` | 是 | 'getRemoteKeyOrder' |
| `deviceId` | `string (UUID)` | 是 | Hub3 设备 UUID |
| `uuid` | `string (UUID)` | 是 | 遥控器 UUID |
| `companyID` | `string` | 是 | 当前公司 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "getRemoteKeyOrder",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "companyID": "xxxxxxxx"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功；失败且 code≠406 时弹出错误提示 |
| `code` | `number` | 错误码；406 静默处理（数据为空，如码表中无该键） |
| `message` | `string` | 错误信息 |
| `data` | `object {uuid, keyOrder: array of string}` | 无记录时 keyOrder 为 [] |

### getIRMode {#biz3irremote-getirmode}

取得 Hub3 当前红外模式。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3IRRemote' |
| `op` | `string` | 是 | 'getIRMode' |
| `deviceId` | `string (UUID)` | 是 | Hub3 设备 UUID |
| `companyID` | `string` | 是 | 当前公司 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "getIRMode",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "companyID": "xxxxxxxx"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功；失败且 code≠406 时弹出错误提示 |
| `code` | `number` | 错误码；406 静默处理（数据为空，如码表中无该键） |
| `message` | `string` | 错误信息 |
| `data` | `object {ir_mode \| mode} \| number` | 模式值：0 = CONTROL，1 = LEARN/REGISTER；前端依次尝试 data.ir_mode、data.mode 或直接数字 |

### setIRMode {#biz3irremote-setirmode}

设置 Hub3 红外模式（学习/控制）。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3IRRemote' |
| `op` | `string` | 是 | 'setIRMode' |
| `deviceId` | `string (UUID)` | 是 | Hub3 设备 UUID |
| `mode` | `number` | 是 | 0 = CONTROL，1 = REGISTER/LEARN（学习红外信号） |
| `companyID` | `string` | 是 | 当前公司 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "setIRMode",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "mode": 1,
  "companyID": "xxxxxxxx"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功；失败且 code≠406 时弹出错误提示 |
| `code` | `number` | 错误码；406 静默处理（数据为空，如码表中无该键） |
| `message` | `string` | 错误信息 |

::: info 说明
离开学习页面时前端会设回 0。
:::

### subscribeIRMode {#biz3irremote-subscribeirmode}

订阅 Hub3 红外模式变化通知。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3IRRemote' |
| `op` | `string` | 是 | 'subscribeIRMode' |
| `topic` | `string` | 是 | 'hub3/{deviceId}/ir/mode' |
| `deviceId` | `string (UUID)` | 是 | Hub3 设备 UUID |
| `companyID` | `string` | 是 | 当前公司 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "subscribeIRMode",
  "topic": "hub3/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/ir/mode",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "companyID": "xxxxxxxx"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功；失败且 code≠406 时弹出错误提示 |
| `code` | `number` | 错误码；406 静默处理（数据为空，如码表中无该键） |
| `message` | `string` | 错误信息 |

::: info 说明
订阅确认只记录日志；实际通知以 op 'subscribeIRModeRsp' 推送。
:::

### subscribeIRModeRsp (server push) {#biz3irremote-subscribeirmodersp-server-push}

服务器推送：红外模式变化。

**请求**

无额外参数。

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功；失败且 code≠406 时弹出错误提示 |
| `code` | `number` | 错误码；406 静默处理（数据为空，如码表中无该键） |
| `message` | `string` | 错误信息 |
| `data.data.ir_mode` | `number` | 新模式（0 = CONTROL，1 = LEARN/REGISTER） |

::: info 说明
分发给所有已订阅设备的回调（不按设备过滤）。
:::

### subscribeIRData {#biz3irremote-subscribeirdata}

订阅 Hub3 学习到的红外数据。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3IRRemote' |
| `op` | `string` | 是 | 'subscribeIRData' |
| `topic` | `string` | 是 | 'hub3/{deviceId}/ir/learned/data' |
| `deviceId` | `string (UUID)` | 是 | Hub3 设备 UUID |
| `companyID` | `string` | 是 | 当前公司 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "subscribeIRData",
  "topic": "hub3/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/ir/learned/data",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "companyID": "xxxxxxxx"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功；失败且 code≠406 时弹出错误提示 |
| `code` | `number` | 错误码；406 静默处理（数据为空，如码表中无该键） |
| `message` | `string` | 错误信息 |

::: info 说明
实际数据以 op 'subscribeIRDataRsp' 推送。
:::

### subscribeIRDataRsp (server push) {#biz3irremote-subscribeirdatarsp-server-push}

服务器推送：学习到的红外波形数据。

**请求**

无额外参数。

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功；失败且 code≠406 时弹出错误提示 |
| `code` | `number` | 错误码；406 静默处理（数据为空，如码表中无该键） |
| `message` | `string` | 错误信息 |
| `data.data` | `string (hex)` | 学习到的红外数据；自学习页以此创建按键（addIRCode），匹配页长度 ≤50 视为空并继续等待，否则交给 matchRemote |

::: info 说明
分发给所有已订阅设备的回调。
:::

### unsubscribeIRMode {#biz3irremote-unsubscribeirmode}

取消红外模式订阅。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3IRRemote' |
| `op` | `string` | 是 | 'unsubscribeIRMode' |
| `deviceId` | `string (UUID)` | 是 | Hub3 设备 UUID |
| `topic` | `string` | 是 | 'hub3/{deviceId}/ir/mode' |
| `companyID` | `string` | 是 | 当前公司 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "unsubscribeIRMode",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "topic": "hub3/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/ir/mode",
  "companyID": "xxxxxxxx"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功；失败且 code≠406 时弹出错误提示 |
| `code` | `number` | 错误码；406 静默处理（数据为空，如码表中无该键） |
| `message` | `string` | 错误信息 |

::: info 说明
处理器只记录日志；回调收到整条消息。
:::

### unsubscribeIRData {#biz3irremote-unsubscribeirdata}

取消学习数据订阅。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3IRRemote' |
| `op` | `string` | 是 | 'unsubscribeIRData' |
| `deviceId` | `string (UUID)` | 是 | Hub3 设备 UUID |
| `topic` | `string` | 是 | 'hub3/{deviceId}/ir/learned/data' |
| `companyID` | `string` | 是 | 当前公司 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "unsubscribeIRData",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "topic": "hub3/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/ir/learned/data",
  "companyID": "xxxxxxxx"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功；失败且 code≠406 时弹出错误提示 |
| `code` | `number` | 错误码；406 静默处理（数据为空，如码表中无该键） |
| `message` | `string` | 错误信息 |

::: info 说明
处理器只记录日志；回调收到整条消息。
:::

### matchRemote {#biz3irremote-matchremote}

用学习到的红外波形匹配码库中的遥控器型号。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3IRRemote' |
| `op` | `string` | 是 | 'matchRemote' |
| `irData` | `string (hex)` | 是 | subscribeIRDataRsp 收到的红外数据 |
| `irWaveLength` | `number` | 是 | irData.length / 2（字节数） |
| `irType` | `number` | 是 | parseInt(remote.type) |
| `brandName` | `string` | 是 | 遥控器 model（品牌/型号） |
| `companyID` | `string` | 是 | 当前公司 ID（customerInfo.companyID） |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功；失败且 code≠406 时弹出错误提示 |
| `code` | `number` | 错误码；406 静默处理（数据为空，如码表中无该键） |
| `message` | `string` | 错误信息 |
| `data.matches` | `array of {controlType: {model, alias, direction}, companyCode: number, bestMatchPercentage: number}` | 匹配结果；companyCode 作为遥控器 code，bestMatchPercentage 以两位小数百分比显示 |

### getIRCodes {#biz3irremote-getircodes}

取得自学习遥控器的按键列表。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3IRRemote' |
| `op` | `string` | 是 | 'getIRCodes' |
| `hub3DeviceId` | `string (UUID)` | 是 | Hub3 设备 UUID |
| `remoteId` | `string (UUID)` | 是 | 遥控器 UUID |
| `companyID` | `string` | 是 | 当前公司 ID（customerInfo.companyID） |

```json
{
  "action": "biz3IRRemote",
  "op": "getIRCodes",
  "hub3DeviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "remoteId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "companyID": "xxxxxxxx"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功；失败且 code≠406 时弹出错误提示 |
| `code` | `number` | 错误码；406 静默处理（数据为空，如码表中无该键） |
| `message` | `string` | 错误信息 |
| `data` | `array of {keyUUID, name, uuid, ...}` | 按键数组；keyUUID 按键 ID，name 名称，uuid 所属遥控器 UUID |

### addIRCode {#biz3irremote-addircode}

为自学习遥控器新增一个按键（含学习到的红外数据）。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3IRRemote' |
| `op` | `string` | 是 | 'addIRCode' |
| `irCode` | `object {keyUUID, name, uuid, deviceId, data}` | 是 | keyUUID 前端生成；name 初始空串；uuid 遥控器 UUID；deviceId Hub3 UUID；data 学习到的红外数据（hex） |
| `companyID` | `string` | 是 | 当前公司 ID（customerInfo.companyID） |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功；失败且 code≠406 时弹出错误提示 |
| `code` | `number` | 错误码；406 静默处理（数据为空，如码表中无该键） |
| `message` | `string` | 错误信息 |

::: info 说明
无论成败之后都退出学习模式（setIRMode 0）。
:::

### updateIRCode {#biz3irremote-updateircode}

修改自学习按键名称。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3IRRemote' |
| `op` | `string` | 是 | 'updateIRCode' |
| `hub3DeviceId` | `string (UUID)` | 是 | Hub3 设备 UUID |
| `remoteId` | `string (UUID)` | 是 | 遥控器 UUID |
| `keyUUID` | `string (UUID)` | 是 | 按键 ID |
| `name` | `string` | 是 | 新名称（去除首尾空白，不能为空） |
| `companyID` | `string` | 是 | 当前公司 ID（customerInfo.companyID） |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功；失败且 code≠406 时弹出错误提示 |
| `code` | `number` | 错误码；406 静默处理（数据为空，如码表中无该键） |
| `message` | `string` | 错误信息 |

### deleteIRCode {#biz3irremote-deleteircode}

删除自学习按键。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3IRRemote' |
| `op` | `string` | 是 | 'deleteIRCode' |
| `hub3DeviceId` | `string (UUID)` | 是 | Hub3 设备 UUID |
| `remoteId` | `string (UUID)` | 是 | 遥控器 UUID |
| `keyUUID` | `string (UUID)` | 是 | 按键 ID |
| `companyID` | `string` | 是 | 当前公司 ID（customerInfo.companyID） |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功；失败且 code≠406 时弹出错误提示 |
| `code` | `number` | 错误码；406 静默处理（数据为空，如码表中无该键） |
| `message` | `string` | 错误信息 |

### addRemoteToMatter {#biz3irremote-addremotetomatter}

把红外遥控器以开/关两个动作桥接为 Matter 设备。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3IRRemote' |
| `op` | `string` | 是 | 'addRemoteToMatter' |
| `hub3DeviceId` | `string (UUID)` | 是 | Hub3 设备 UUID |
| `irDeviceType` | `string \| number` | 是 | 遥控器 type |
| `cmdOn` | `string (hex)` | 是 | 开机命令串（按码源挑选覆盖率最高的电源键生成） |
| `cmdOff` | `string (hex)` | 是 | 关机命令串 |
| `irDeviceUUID` | `string (UUID)` | 是 | 遥控器 UUID |
| `irDeviceName` | `string` | 是 | 遥控器别名 |
| `companyID` | `string` | 是 | 当前公司 ID（customerInfo.companyID） |

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

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功；失败且 code≠406 时弹出错误提示 |
| `code` | `number` | 错误码；406 静默处理（数据为空，如码表中无该键） |
| `message` | `string` | 错误信息 |

::: info 说明
处理器只记录日志；回调收到整条消息。
:::

## biz3Face3Qr {#biz3face3qr}

Face3 门铃/人脸设备：列出已绑定设备、下发命令（唤醒）、取得 KVS 观看凭证或 LiveKit 房间 token。

### command {#biz3face3qr-command}

给 Face3 设备下发一条命令（通用入口，云端签名后推给设备）。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3Face3Qr' |
| `op` | `string` | 是 | 'command' |
| `deviceId` | `string` | 是 | 设备 UUID |
| `cmd` | `string` | 是 | 下行命令名（设备侧 action）。代码中唯一使用的值为 'face3Wake'（唤醒设备开始 WebRTC 推流） |

```json
{
  "action": "biz3Face3Qr",
  "op": "command",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "cmd": "face3Wake"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功 |
| `code` | `any` | 结果码（回调收到，前端未分支判断） |
| `message` | `string` | 失败原因字符串 |
| `data.deviceId` | `string` | 用于把响应路由到 'op:deviceId' 回调 |
| `message (failure)` | `string` | device_offline、not_bound、device_identity_rejected、device_not_signable |

::: info 说明
请求体刻意不带 subUUID：云端从已鉴权连接（face3_ws_connections[connectionId]）取当前用户，只有绑定过该设备的人能操作。只在连接可用时发送，不进断线队列；断线时立即回调 {success:false, message:'ws_disconnected'}。 注释：设备平时断电休眠，WiFi 模块收到 face3Wake 后给主控上电再补发，故“发送成功”只代表命令到达模块。设备随后以 op 'streamState' 推送 {deviceId, state, reason}（如 stopped / reason 'doorbell' 表示门铃挂断）。
:::

### list {#biz3face3qr-list}

列出当前登录用户绑定的 Face3 设备。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3Face3Qr' |
| `op` | `string` | 是 | 'list' |

```json
{
  "action": "biz3Face3Qr",
  "op": "list"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 失败时保留旧列表不清空 |
| `data.devices` | `array of {deviceUUID, deviceName, stateInfo, ...}` | 已绑定设备数组 |

::: info 说明
不带 subUUID，云端从连接记录取用户。此请求允许进入断线队列。
:::

### live {#biz3face3qr-live}

取得 LiveKit 房间 token（多人观看/多方通话）。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3Face3Qr' |
| `op` | `string` | 是 | 'live' |
| `deviceId` | `string` | 是 | 设备 UUID |

```json
{
  "action": "biz3Face3Qr",
  "op": "live",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功 |
| `code` | `any` | 结果码（回调收到，前端未分支判断） |
| `message` | `string` | 失败原因字符串 |
| `data.deviceId` | `string` | 用于把响应路由到 'op:deviceId' 回调 |
| `data.url` | `string` | LiveKit 服务器 URL |
| `data.token` | `string` | LiveKit 访问 token；存在才视为可用 |

::: info 说明
请求体刻意不带 subUUID：云端从已鉴权连接（face3_ws_connections[connectionId]）取当前用户，只有绑定过该设备的人能操作。只在连接可用时发送，不进断线队列；断线时立即回调 {success:false, message:'ws_disconnected'}。 灰度功能：not_bound / not_authenticated 直接报错，其他失败或超时则回退到 op 'viewer'（KVS 直连）。
:::

### viewer {#biz3face3qr-viewer}

取得观看端临时凭证（KVS WebRTC，仅限该设备频道，15 分钟）。

**请求**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `action` | `string` | 是 | 固定为 'biz3Face3Qr' |
| `op` | `string` | 是 | 'viewer' |
| `deviceId` | `string` | 是 | 设备 UUID |

```json
{
  "action": "biz3Face3Qr",
  "op": "viewer",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**响应**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | `boolean` | 是否成功 |
| `code` | `any` | 结果码（回调收到，前端未分支判断） |
| `message` | `string` | 失败原因字符串 |
| `data.deviceId` | `string` | 用于把响应路由到 'op:deviceId' 回调 |
| `data.channelArn` | `string` | KVS 信令频道 ARN |
| `data.region` | `string` | AWS 区域 |
| `data.clientId` | `string` | 观看端 clientId |
| `data.credentials` | `object {accessKeyId, secretAccessKey, sessionToken}` | AssumeRole 签发的临时凭证 |
| `data.iceServers` | `array` | ICE 服务器列表 |
| `message (failure)` | `string` | channel_not_ready（频道未建，前端定时重试）、not_bound、invalid_device_id、not_authenticated、device_offline、device_identity_rejected、device_not_signable |

::: info 说明
请求体刻意不带 subUUID：云端从已鉴权连接（face3_ws_connections[connectionId]）取当前用户，只有绑定过该设备的人能操作。只在连接可用时发送，不进断线队列；断线时立即回调 {success:false, message:'ws_disconnected'}。 前提：设备须先被唤醒并推流。浏览器不保存长期凭证。
:::
