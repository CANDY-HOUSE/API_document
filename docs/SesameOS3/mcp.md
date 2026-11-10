# MCP 接入指南

::: warning 设计中，尚未上线
本页是设计稿，用于评审对外接口，内容可能变化，目前还不能连接。下列项尚未确定，文中用占位符表示：

| 占位符 | 含义 |
| --- | --- |
| `<MCP_ENDPOINT>` | MCP 端点 URL，同时也是 OAuth 的资源标识（`resource`） |
| `<SCOPE_READ>` | 只读权限的 scope 名称 |
| `<SCOPE_CONTROL>` | 控制权限的 scope 名称 |
:::

## 概要

通过 [MCP（Model Context Protocol）](https://modelcontextprotocol.io/)，你可以在 Claude、ChatGPT 等支持远程 MCP 连接器的 AI 应用里使用自己的 Sesame 设备：

- 查看设备列表和设备状态；
- 上锁、开锁；
- 创建、查看、取消定时上锁 / 开锁。

连接时，你在 CANDY HOUSE 的登录页登录并同意授权，AI 应用只能以你的身份、在你授予的权限范围内操作你的设备。AI 应用不会拿到你的密码。

## 接入信息

| 项目 | 内容 |
| --- | --- |
| 端点 | `<MCP_ENDPOINT>` |
| 传输方式 | Streamable HTTP，只接受 `POST` |
| 协议版本 | `2026-07-28`；同时兼容 2025 版客户端（`2025-06-18`、`2025-11-25`） |
| 状态 | 无状态：不签发会话（`Mcp-Session-Id`），每个请求独立处理 |
| 鉴权 | OAuth 2.1，每个请求都要带 `Authorization: Bearer <access token>` |
| 响应 | `application/json`，或只含一条结果的 `text/event-stream`，客户端需要两种都支持 |

### 请求头

| 请求头 | 要求 |
| --- | --- |
| `Authorization` | `Bearer <access token>`，所有请求必填。不得放在 URL 查询参数里 |
| `Content-Type` | `application/json` |
| `Accept` | 同时列出 `application/json` 和 `text/event-stream` |
| `MCP-Protocol-Version` | 协议版本，如 `2026-07-28`。必须与请求体 `params._meta` 里的 `io.modelcontextprotocol/protocolVersion` 一致 |
| `Mcp-Method` | 与请求体的 `method` 一致（`2026-07-28` 版必填） |
| `Mcp-Name` | 与 `params.name`（`tools/call`）或 `params.uri`（`resources/read`）一致（`2026-07-28` 版，这两种请求必填） |

请求头与请求体不一致、或缺少必填的请求头时，返回 HTTP `400` 和 JSON-RPC 错误 `-32020`。

### 支持的方法

| 方法 | 说明 |
| --- | --- |
| `server/discover` | 获取服务端支持的协议版本、能力和身份信息（`2026-07-28` 版） |
| `tools/list` | 列出工具及其参数和输出 schema |
| `tools/call` | 调用工具 |
| `resources/list` / `resources/read` | 读取 CANDY HOUSE 售后与购买政策（`policy://candyhouse/support-policy`，Markdown） |
| `initialize` / `notifications/initialized` | 仅供 2025 版客户端握手。通知返回 `202`，无响应体 |

- 工具清单是固定的，服务端声明 `listChanged: false`，不提供 `subscriptions/listen`。
- `2026-07-28` 版的请求不经过 `initialize`，每个请求在 `params._meta` 里带协议版本和客户端能力。
- `GET` 和 `DELETE` 返回 `405`；请求里的 `Mcp-Session-Id` 和 `Last-Event-ID` 会被忽略。

### 请求示例

`2026-07-28` 版调用 `device_status`：

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

## 在 AI 应用中连接

一般步骤如下。各 AI 应用的具体操作在上线时补充。

1. 在 AI 应用里添加自定义 MCP 连接器，URL 填 `<MCP_ENDPOINT>`。
2. AI 应用会打开 CANDY HOUSE 的登录页。用你在 Sesame App 里使用的账号登录。
3. 确认授权内容并同意。首次连接通常只授予只读权限（查看设备和定时任务）。
4. 第一次让 AI 开关锁或创建定时任务时，AI 应用会请你追加授予控制权限。
5. 要撤销授权，在 AI 应用里删除或断开该连接器。

## 授权说明

本节面向自行开发 MCP 客户端的开发者。主流 AI 应用已内置以下流程。

### 发现授权服务器

1. 不带 token 访问 `<MCP_ENDPOINT>`，返回 `401`，并在 `WWW-Authenticate` 头里给出受保护资源元数据（RFC 9728）的地址和所需 scope：

   ```http
   HTTP/1.1 401 Unauthorized
   WWW-Authenticate: Bearer resource_metadata="<受保护资源元数据 URL>", scope="<SCOPE_READ>"
   ```

2. 获取该元数据，从 `authorization_servers` 得到授权服务器，再按 RFC 8414 / OpenID Connect Discovery 获取授权服务器元数据。

### 客户端注册

- 以 **Client ID Metadata Document（CIMD）** 为主：用你托管的元数据文档的 HTTPS URL 作为 `client_id`，文档里至少要有 `client_id`、`client_name`、`redirect_uris`。授权服务器元数据里的 `client_id_metadata_document_supported` 为 `true`。
- 其他注册方式是否提供，上线时另行说明。

### 获取 token

- 使用授权码模式加 PKCE（`S256`）。
- 授权请求和 token 请求都要带 `resource=<MCP_ENDPOINT>`（RFC 8707）。签发的 token 只对这个端点有效，`aud` 不符的 token 会被拒绝。
- 授权响应带有 `iss` 参数时，客户端要先与授权服务器的 `issuer` 比对，一致才能用授权码换 token（RFC 9207）。

### 权限范围（scope）

| scope | 允许的操作 | 对应工具 |
| --- | --- | --- |
| `<SCOPE_READ>` | 查看设备和定时任务 | `device_list`、`device_status`、`schedule_list` |
| `<SCOPE_CONTROL>` | 改变设备状态，包括定时执行 | `lock`、`unlock`、`schedule_create`、`schedule_cancel` |

两个 scope 互不包含。只需要查看时，只申请 `<SCOPE_READ>`。

### 权限不足时的增量授权

用只有 `<SCOPE_READ>` 的 token 调用控制类工具，返回 `403`：

```http
HTTP/1.1 403 Forbidden
WWW-Authenticate: Bearer error="insufficient_scope", scope="<SCOPE_CONTROL>", resource_metadata="<受保护资源元数据 URL>"
```

客户端应把已有的 scope 与 `scope` 里给出的 scope 合并，重新发起授权，拿到新 token 后重试原请求。

### token 的使用

- 每个请求都带 `Authorization: Bearer <access token>`。
- token 无效、过期或 `aud` 不符时返回 `401`，需要刷新或重新授权。
- 这个 token 只用于 `<MCP_ENDPOINT>`，不得转发给其他服务；本服务也不接受为其他服务签发的 token。

## 工具列表

- `deviceId` 必须来自 `device_list`，`scheduleId` 必须来自 `schedule_list`，不要自行构造。
- 只能操作你自己账号下的设备和定时任务。传入别人的 ID 时，按「找不到」处理，不会执行任何操作。
- `tools/list` 总是列出全部 7 个工具；调用时才检查 scope。

### 设备

| 工具 | 参数 | 所需 scope | 注解 | 说明 |
| --- | --- | --- | --- | --- |
| `device_list` | 无 | `<SCOPE_READ>` | `readOnlyHint` | 设备列表，不含访客钥匙（guest）的设备 |
| `device_status` | `deviceId` | `<SCOPE_READ>` | `readOnlyHint` | 设备状态：是否在线、锁状态、电量、固件版本 |
| `lock` | `deviceId` | `<SCOPE_CONTROL>` | `destructiveHint`、`idempotentHint`、`openWorldHint` | 上锁，仅限锁类设备 |
| `unlock` | `deviceId` | `<SCOPE_CONTROL>` | `destructiveHint`、`idempotentHint`、`openWorldHint` | 开锁，仅限锁类设备 |

- `lock` / `unlock` 成功只表示指令已被接受并下发，不保证设备已经到达目标状态。需要确认时，再调用 `device_status`，或使用 [Webhook](./webhook.md) 接收状态变化通知。
- 短时间内对同一设备重复发送同一动作，可能返回 `ACTION_IN_PROGRESS`。

### 定时任务

| 工具 | 参数 | 所需 scope | 注解 | 说明 |
| --- | --- | --- | --- | --- |
| `schedule_create` | 见下表 | `<SCOPE_CONTROL>` | `destructiveHint`、`openWorldHint` | 创建定时上锁 / 开锁 |
| `schedule_list` | 无 | `<SCOPE_READ>` | `readOnlyHint` | 定时任务列表及最近一次执行结果 |
| `schedule_cancel` | `scheduleId` | `<SCOPE_CONTROL>` | `destructiveHint`、`idempotentHint` | 取消定时任务 |

`schedule_create` 的参数：

| 参数 | 类型 | 必填条件 | 说明 |
| --- | --- | --- | --- |
| `action` | `lock` / `unlock` | 必填 | 到时执行的动作 |
| `deviceId` | string | 必填 | 目标设备，须为锁类设备 |
| `timezone` | string | 必填 | IANA 时区名，如 `Asia/Tokyo`、`America/New_York`。`atIso`、`hour`、`minute` 都按这个时区解释 |
| `timingType` | `delay` / `at` / `recurring` | 必填 | 延时一次 / 指定时刻一次 / 循环 |
| `delaySeconds` | integer | `timingType` 为 `delay` | 从现在起延迟的秒数，60 ～ 31536000 |
| `atIso` | string | `timingType` 为 `at` | 不带时区后缀的 ISO 8601 本地时间，如 `2026-12-01T08:00:00`，必须晚于当前时间。不要加 `Z` 或 `+09:00` |
| `pattern` | `daily` / `weekdays` / `weekends` / `weekly` / `monthly` | `timingType` 为 `recurring` | 循环模式 |
| `hour` | integer | `timingType` 为 `recurring` | 0 ～ 23 |
| `minute` | integer | `timingType` 为 `recurring` | 0 ～ 59 |
| `dayOfWeek` | integer | `pattern` 为 `weekly` | 1 ～ 7，1 为周一，7 为周日 |
| `dayOfMonth` | integer | `pattern` 为 `monthly` | 1 ～ 31，当月没有这一天时跳过当月 |

- 到点后由服务端执行，执行前会再次确认设备仍属于你。
- 执行结果不会主动推送，可以用 `schedule_list` 查看 `lastFireStatus`。

## 工具返回格式

工具结果遵循 MCP 的 `CallToolResult`：

| 字段 | 说明 |
| --- | --- |
| `resultType` | 固定为 `complete` |
| `content` | 文本内容。成功时是 `structuredContent` 的 JSON 序列化，方便不读结构化结果的客户端 |
| `structuredContent` | 结构化结果。成功时符合该工具的 `outputSchema`（可从 `tools/list` 获取）；失败时为 `{ "reason", "message" }` |
| `isError` | `true` 表示业务失败（如找不到设备、参数不合法）。AI 可以根据 `reason` 和 `message` 自行纠正后重试 |

成功示例（`device_status`）：

```json
{
  "resultType": "complete",
  "content": [{ "type": "text", "text": "{\"deviceId\":\"<DEVICE_ID>\", ...}" }],
  "structuredContent": {
    "deviceId": "<DEVICE_ID>",
    "deviceName": "玄关",
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

失败示例：

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

各工具成功时 `structuredContent` 的主要字段：

| 工具 | 主要字段 |
| --- | --- |
| `device_list` | `devices[]`：`deviceId`、`deviceName`、`deviceModel` |
| `device_status` | `deviceId`、`deviceName`、`deviceModel`、`online`、`lockState`、`batteryPercent`、`currentFirmwareVersion`、`latestFirmwareVersion` |
| `lock` / `unlock` | `deviceId`、`deviceName`、`action`、`accepted` |
| `schedule_create` | `scheduleId`、`nextFireAt`（带时差的 ISO 8601）、`timezone` |
| `schedule_list` | `schedules[]`：`scheduleId`、`action`、`deviceName`、`timingType`、`timezone`、`state`、`nextFireAt`、`lastFiredAt`、`lastFireStatus`、`fireCount` |
| `schedule_cancel` | `scheduleId`、`state` |

`lockState` 取值：`locked` / `unlocked` / `moved`，与 [Webhook](./webhook.md) 的 `CHSesame2Status` 相同。

`state` 取值：`PENDING`（一次性任务待执行）、`ACTIVE`（循环任务生效中）、`COMPLETED`、`FAILED`（一次性任务已执行，成功 / 失败）、`CANCELLED`。`lastFireStatus` 取值：`success`、`failure`，尚未执行时为空。

`reason` 取值：

| 值 | 含义 |
| --- | --- |
| `INVALID_ARGUMENT` | 参数不合法，如缺少必填项、时区名无效、`atIso` 早于当前时间 |
| `DEVICE_NOT_FOUND` | 找不到设备，或设备不属于你、不是锁类设备 |
| `ACTION_IN_PROGRESS` | 同一设备的同一动作正在处理中 |
| `SCHEDULE_NOT_FOUND` | 找不到定时任务，或任务不属于你 |
| `SCHEDULE_LIMIT_EXCEEDED` | 有效定时任务数达到上限 |
| `UPSTREAM_ERROR` | 调用下游服务失败，可稍后重试 |
| `INTERNAL_ERROR` | 其他服务端错误 |

## 错误处理

### HTTP 状态码

| 状态码 | 场景 | 处理方式 |
| --- | --- | --- |
| `400` | 请求头与请求体不一致或缺少必填请求头（`-32020`）；缺少必需的客户端能力（`-32021`）；不支持的协议版本（`-32022`，响应里列出支持的版本）；请求体不是合法 JSON-RPC | 修正请求；版本不支持时改用列出的版本 |
| `401` | 没有 token，或 token 无效、过期、`aud` 不符 | 按 `WWW-Authenticate` 重新授权或刷新 token |
| `403` | scope 不足（`error="insufficient_scope"`）；`Origin` 请求头不被允许 | 按[增量授权](#权限不足时的增量授权)追加 scope |
| `404` | 方法不存在（JSON-RPC `-32601`） | 检查 `method` |
| `405` | 使用了 `GET`、`DELETE` 等 `POST` 以外的方法 | 只用 `POST` |
| `429` | 请求过于频繁（入口限速或按账号限流） | 稍后重试；有 `Retry-After` 时按它等待 |

### JSON-RPC 错误码

| `error.code` | 含义 |
| --- | --- |
| `-32700` | 请求体不是合法 JSON |
| `-32600` | 不是合法的 JSON-RPC 请求 |
| `-32601` | 方法不存在 |
| `-32602` | 参数不合法，如工具或 resource 不存在 |
| `-32603` | 服务端内部错误 |
| `-32020` | `HeaderMismatch`：请求头与请求体不一致，或缺少必填请求头 |
| `-32021` | `MissingRequiredClientCapability`：缺少必需的客户端能力 |
| `-32022` | `UnsupportedProtocolVersion`：不支持该协议版本 |

工具执行中的业务失败不使用 JSON-RPC 错误，而是返回 `isError: true` 的工具结果，见[工具返回格式](#工具返回格式)。

## 使用限制

- 只能访问授权账号自己的设备和定时任务；不含访客钥匙（guest）的设备。
- 请求频率有上限（按入口和按账号），具体数值上线时公布。超出时返回 `429`。
- 每个账号的有效定时任务数有上限，具体数值上线时公布。
- 定时任务的执行结果不主动推送，请用 `schedule_list` 查看。
- 不提供工具清单变更通知。
- 以下功能不通过本端点提供：固件升级、帮助中心检索、群组相关操作。
