---
title: WebSocket API
---
# WebSocket API

WebSocket API 是 [Biz3（biz.candyhouse.co）](https://biz.candyhouse.co/) 管理控制台与云端通信所用的接口：设备管理、设备操作、成员与权限、门禁认证数据（卡片 / 密码）、开发者设置等都通过它完成。

::: info 说明
本文档根据 [Biz3 源码](https://github.com/CANDY-HOUSE/biz.candyhouse.co)（`src/api`、`src/websocket`）整理，字段以客户端代码实际发送和读取的内容为准；服务端可能返回更多字段。接口随 Biz3 更新而变化。
:::

## 连接

| 项目 | 内容 |
| --- | --- |
| 地址 | `wss://82q6nuplv0.execute-api.ap-northeast-1.amazonaws.com/public` |
| 协议 | WebSocket（JSON 文本消息） |

连接时把令牌放在查询参数中：

```text
wss://82q6nuplv0.execute-api.ap-northeast-1.amazonaws.com/public?token=<JWT>&lang=<语言>
```

| 参数 | 说明 |
| --- | --- |
| `token` | 必填。登录用户的 Cognito ID Token（JWT），需 URL 编码 |
| `lang` | 界面语言，如 `ja`、`en`、`zh-CN`、`zh-TW`，服务端返回的提示文字使用该语言 |

## 认证

使用 CANDY HOUSE 账号通过 Amazon Cognito（用户池）登录，取得 **ID Token（JWT）**，作为 `token` 连接。JWT 的 `sub` 即账号 ID（Biz 中的 `subUUID`）。令牌过期后需要刷新并重新连接。

## 消息格式

### 请求

所有请求都是一条 JSON 消息，用 `action` 区分接口类别，用 `op` 区分具体操作，其余为参数：

```json
{
  "action": "biz3ManageDevice",
  "op": "getDeviceStatus",
  "deviceUUID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

### 响应

服务端以同一个 `action`（及 `op`）返回结果：

```json
{
  "action": "biz3ManageDevice",
  "op": "getDeviceStatus",
  "success": true,
  "data": {}
}
```

| 字段 | 说明 |
| --- | --- |
| `action` / `op` | 与请求相同，用于匹配请求 |
| `success` | 是否成功 |
| `data` | 返回数据，结构见各接口 |
| `message` | 失败时的错误信息，例如设备数达到上限时为 `Limit Exceeded` |
| `code` | 部分接口返回的错误码（例如红外遥控接口的 `406` 表示数据为空） |
| `reqContext` | 服务端回传的请求参数（例如请求中的 `name`、`deviceUUID`），可用于把响应对应回请求 |

消息中没有请求 ID：同一 `action` + `op` 的响应按发送顺序对应。服务端也可能主动推送消息（例如设备状态变化）。

## 心跳与重连

- 每 5 分钟发送一次心跳 `{"action": "biz3KeepAlive"}`；服务端回复中含 `connectionId`。3 秒内没有回复时视为连接失效，应重新连接。
- 连接 5 秒内未建立视为超时。断开后按 1～10 秒退避重连；多次失败时先检查令牌是否过期。
- 断线期间待发送的消息可以排队，重连后补发；切换账号后不要补发旧账号的消息。

## 接口一览

| 分类 | action |
| --- | --- |
| [设备与历史](./bizapi_devices.md) | [`biz3ManageDevice`](./bizapi_devices.md#biz3managedevice)、[`biz3GetDeviceHistory`](./bizapi_devices.md#biz3getdevicehistory)、[`biz3GetDeviceBatteryRecord`](./bizapi_devices.md#biz3getdevicebatteryrecord)、[`biz3GetDeviceEmployeeKeys`](./bizapi_devices.md#biz3getdeviceemployeekeys) |
| [设备操作](./bizapi_control.md) | [`biz3OperateIoT`](./bizapi_control.md#biz3operateiot)、[`biz3TriggerLocker`](./bizapi_control.md#biz3triggerlocker)、[`biz3InvokeWebAPIs`](./bizapi_control.md#biz3invokewebapis)、[`biz3Schedule`](./bizapi_control.md#biz3schedule)、[`biz3IRRemote`](./bizapi_control.md#biz3irremote)、[`biz3Face3Qr`](./bizapi_control.md#biz3face3qr) |
| [成员与权限](./bizapi_members.md) | [`biz3GetLoginUser`](./bizapi_members.md#biz3getloginuser)、[`biz3ManageCompany`](./bizapi_members.md#biz3managecompany)、[`biz3ManageEmployee`](./bizapi_members.md#biz3manageemployee)、[`biz3ManageEmployeeGroup`](./bizapi_members.md#biz3manageemployeegroup)、[`biz3ManageDeviceGroup`](./bizapi_members.md#biz3managedevicegroup)、[`biz3ManageEmployeeDevice`](./bizapi_members.md#biz3manageemployeedevice)、[`biz3ManageRole`](./bizapi_members.md#biz3managerole)、[`biz3ManageAccessCtlAuthData`](./bizapi_members.md#biz3manageaccessctlauthdata)|
