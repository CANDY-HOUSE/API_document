# MCP

## 概要

通过 [MCP（Model Context Protocol）](https://modelcontextprotocol.io/)，你可以在 Claude、Codex 等支持远程 MCP 服务器的 AI 应用里使用自己的 SESAME 设备：

- 查看设备列表和设备状态；
- 上锁、开锁、升级固件；
- 创建、查看、取消定时上锁 / 开锁 / 固件升级；
- 查询产品使用方法和售后政策。

接入需要 SESAME Biz 的 API key。连接后，在对话里用 SESAME 账号的邮箱验证码登录，AI 就能以你的身份操作你账号下的设备。AI 应用拿不到你的密码。

## 接入信息

| 项目 | 内容 |
| --- | --- |
| 端点 | `https://jhcr1i3ecb.execute-api.ap-northeast-1.amazonaws.com/prod/mcp` |
| 传输方式 | Streamable HTTP，只接受 `POST` |
| 协议版本 | `2026-07-28`；兼容 `2025-11-25`、`2025-06-18`、`2025-03-26` |
| 状态 | 无状态：不签发会话（`Mcp-Session-Id`），每个请求独立处理 |
| 响应 | `application/json`，或只含一条结果的 `text/event-stream` |

### 请求头

| 请求头 | 必填 | 说明 |
| --- | --- | --- |
| `x-api-key` | 是 | SESAME Biz 的 API key，获取方式见 [SESAME Biz [开发者页]](https://biz.candyhouse.co/biz/developer) |
| `x-mcp-client` | 否 | 区分登录状态的名字，取值为 1～32 位小写字母、数字或 `-`，如 `claude-code`、`codex`。不带这个请求头时为 `default`；带了但为空或不合法时返回 `400` |

### API key 与 `x-mcp-client`

- 登录状态按「API key 所属的 Biz 账号 + `x-mcp-client`」保存，跨对话保留，直到调用 `auth_logout`。
- 同一个 Biz 账号的成员共用一把 API key。**每个成员必须配置不同的 `x-mcp-client`**，否则会共用同一个登录状态，用到别人登录的 SESAME 账号。
- `x-mcp-client` 由客户端自己填写，**不是权限边界**：知道同一把 key 和别人的 `x-mcp-client`，就能使用对方的登录状态。只把 API key 交给可以信任的成员。
- 换 API key 后，旧 key 立即不能调用工具。

## 在 AI 应用中连接

连接后，AI 应用会读取工具列表和服务端的使用说明（`instructions`），按其中的规则调用工具。

### claude.ai（自定义连接器）

1. 在 claude.ai 的连接器设置里选择「添加自定义连接器」。
2. URL 填端点，请求头添加 `x-api-key`，值为你的 API key。
3. 添加后，Claude 手机端与 Claude Code 也会同步使用这个连接器。

::: warning x-mcp-client
claude.ai 的自定义连接器需要经过 claude.ai 审核才能添加 `x-mcp-client`。未配置时为 `default`：同一个 Biz 账号下所有未配置 `x-mcp-client` 的连接共用一个登录状态。多人共用一把 key 时，请其他成员在 Claude Code、Codex 等客户端里配置各自的 `x-mcp-client`。
:::

### Claude Code

用命令行添加：

```bash
claude mcp add --transport http candyhouse \
  https://jhcr1i3ecb.execute-api.ap-northeast-1.amazonaws.com/prod/mcp \
  --header "x-api-key: <YOUR_API_KEY>" \
  --header "x-mcp-client: claude-code"
```

或在项目的 `.mcp.json` 里配置。`headers` 支持 `${VAR}` 引用环境变量，避免把 key 写进仓库：

```json
{
  "mcpServers": {
    "candyhouse": {
      "type": "http",
      "url": "https://jhcr1i3ecb.execute-api.ap-northeast-1.amazonaws.com/prod/mcp",
      "headers": {
        "x-api-key": "${CANDYHOUSE_API_KEY}",
        "x-mcp-client": "claude-code"
      }
    }
  }
}
```

详见 [Claude Code 的 MCP 文档](https://code.claude.com/docs/zh-CN/mcp)。

### Codex

1. 打开「插件」，切换到「MCP」标签，点击「添加」。
2. URL 填端点。
3. 标头添加 `x-api-key`（你的 API key）和 `x-mcp-client`（如 `codex`）。

详见 [Codex 插件文档](https://www.codex-docs.com/docs/plugins)。

### 其他客户端

支持 Streamable HTTP 并能自定义请求头的 MCP 客户端都可以连接。不能自定义请求头的客户端（如 ChatGPT 的连接器）目前不支持。

## 登录

1. 让 AI 查看或操作设备。未登录时，AI 会请你提供 SESAME App 使用的邮箱。
2. AI 调用 `auth_start`，验证码发送到该邮箱。
3. 把验证码告诉 AI，AI 调用 `auth_verify` 完成登录。

- 验证码有有效期，输错的次数也有上限；过期或超过次数后，需要重新调用 `auth_start`。短时间内失败过多时，账号会被暂时锁定，最长约 1 小时。
- 要切换 SESAME 账号，先让 AI 调用 `auth_logout`。

## 工具列表

- `deviceId` 必须来自 `device_list`，`scheduleId` 必须来自 `schedule_list`，不要自行构造。
- 只能操作自己账号下的设备和定时任务，不含访客钥匙（guest）的设备。传入别人的 ID 时按「找不到」处理，不会执行任何操作。

### 登录

| 工具 | 参数 | 说明 |
| --- | --- | --- |
| `auth_start` | `email` | 向邮箱发送验证码 |
| `auth_verify` | `code` | 校验验证码，完成登录 |
| `auth_logout` | 无 | 登出，清除登录状态 |

### 设备（需要登录）

| 工具 | 参数 | 说明 |
| --- | --- | --- |
| `device_list` | 无 | 设备列表 |
| `device_status` | `deviceId` | 设备的最新已知状态：锁状态、在线、电量、固件版本等 |
| `lock` | `deviceId` | 上锁 |
| `unlock` | `deviceId` | 开锁 |
| `upgrade_firmware` | `deviceId` | 开始固件升级 |

- `lock`、`unlock`、`upgrade_firmware` 在指令被接受后就返回，不保证设备已经动作，也不会再推送结果。刚下指令后查到的状态可能还是旧的，几秒后再查。
- 对同一设备调用 `upgrade_firmware` 后 30 秒内再次调用，返回 `ACTION_IN_PROGRESS`。

### 定时任务（需要登录）

| 工具 | 参数 | 说明 |
| --- | --- | --- |
| `schedule_create` | 见下表 | 创建定时任务 |
| `schedule_list` | 无 | 未执行的一次性任务和生效中的循环任务 |
| `schedule_cancel` | `scheduleId` | 取消定时任务；循环任务取消后不再执行 |

`schedule_create` 的参数：

| 参数 | 类型 | 必填条件 | 说明 |
| --- | --- | --- | --- |
| `action` | string | 必填 | `lock`、`unlock` 或 `upgrade_firmware` |
| `deviceId` | string | 必填 | 目标设备 |
| `timingType` | `delay` / `at` / `recurring` | 必填 | 延时一次 / 指定时刻一次 / 循环 |
| `delaySeconds` | integer | `timingType` 为 `delay` | 从现在起延迟的秒数，60～31536000 |
| `atIso` | string | `timingType` 为 `at` | 不带时区后缀的本地时间，如 `2026-12-01T08:00:00`，必须晚于当前时间。不要加 `Z` 或 `+09:00` |
| `pattern` | `daily` / `weekdays` / `weekends` / `weekly` / `monthly` | `timingType` 为 `recurring` | 每天 / 工作日 / 周末 / 每周 / 每月 |
| `hour` | integer | `timingType` 为 `recurring` | 0～23 |
| `minute` | integer | `timingType` 为 `recurring` | 0～59 |
| `dayOfWeek` | integer | `pattern` 为 `weekly` | 1～7，1 为周一，7 为周日 |
| `dayOfMonth` | integer | `pattern` 为 `monthly` | 1～31，当月没有这一天时跳过 |
| `timezone` | string | 可选 | IANA 时区名，如 `America/New_York`。`atIso`、`hour`、`minute` 按这个时区解释；不传时为日本时间（`Asia/Tokyo`）。时区名无效时返回 `PARAMETER_FAILED` |

- 有夏令时的时区：循环任务的时刻在夏令时开始那天不存在时，当天跳过；在夏令时结束那天出现两次时，只执行一次。一次性任务的时刻不存在时，顺延夏令时的时长；出现两次时取第一次。
- 到点后由服务端执行，不会推送执行结果。一次性任务执行后从 `schedule_list` 消失，要确认结果请调用 `device_status`。

### 知识库与售后政策（不需要登录）

| 工具 | 参数 | 说明 |
| --- | --- | --- |
| `knowledge_search` | `query`；可选 `product`、`topK` | 检索帮助中心文章和客服回复，返回相关片段，不生成回答 |
| `support_policy` | 无 | 售后与购买政策全文（保修、维修费、换货退货、适配器价格、发货、收据、取消订单、被锁在门外时的补偿），以及回答政策问题的规则 |

售后政策同时作为 resource 提供：`policy://candyhouse/support-policy`（Markdown），可用 `resources/list`、`resources/read` 读取。

## 工具返回格式

- `content` 只有一条 `text`，内容是工具结果的 JSON 文本，含 `ok`、`message`、`data` 等字段。结果供 AI 阅读，字段结构不保证稳定，请不要在程序里依赖。
- 业务失败（未登录、找不到设备、参数不合法等）时 `isError` 为 `true`，`data.reason` 给出原因。AI 可以据此纠正后重试。

常见的 `data.reason`：

| 值 | 含义 |
| --- | --- |
| `NOT_AUTHENTICATED` | 未登录或登录已失效 |
| `DEVICE_NOT_FOUND` | 找不到设备，或设备不属于你 |
| `SCHEDULE_NOT_FOUND` | 找不到定时任务：已执行、已取消，或不属于你 |
| `PARAMETER_FAILED` | 参数不合法，如时区名无效、`atIso` 早于当前时间、不能定时的 `action` |
| `ACTION_IN_PROGRESS` | 同一设备的固件升级正在进行 |

失败示例（`content[0].text`）：

```json
{
  "ok": false,
  "resultType": "DEVICE_LIST",
  "message": "You are not logged in or your session has expired. Please log in first.",
  "data": { "action": "device_list", "reason": "NOT_AUTHENTICATED", "chatType": "user" }
}
```

## 错误处理

### HTTP 状态码

| 状态码 | 来源 | 场景 | 处理方式 |
| --- | --- | --- | --- |
| `400` | 服务端 | `x-mcp-client` 为空或不合法（`INVALID_MCP_CLIENT`）；批量请求（`BATCH_NOT_SUPPORTED`）；请求不符合 MCP 协议，如请求头与请求体不一致 | 修正请求；批量请求改为逐条发送 |
| `401` | 网关 | 没有 `x-api-key` | 添加请求头 |
| `403` | 网关 | API key 无效 | 检查 key |
| `403` | 服务端 | API key 已被更换（`API_KEY_REJECTED`） | 改用新 key |
| `405` | 服务端 | 使用了 `POST` 以外的方法 | 只用 `POST` |
| `429` | 服务端 | 本月额度已用完（`QUOTA_EXCEEDED`），不带 `Retry-After` | 重试无效，等下月重置或升级套餐 |
| `429` | 网关 | 请求过于频繁 | 稍后重试 |
| `503` | 服务端 | 额度检查暂时不可用（`QUOTA_UNAVAILABLE`） | 稍后重试 |

网关返回的错误不是 JSON-RPC 格式。服务端在处理 MCP 请求前拒绝时，返回 JSON-RPC 错误，`error.data.reason` 区分原因：

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": { "code": -32000, "message": "Monthly API usage quota exceeded", "data": { "reason": "QUOTA_EXCEEDED" } }
}
```

### JSON-RPC 错误码

| `error.code` | 含义 |
| --- | --- |
| `-32600` | 不是合法的请求，包括 `INVALID_MCP_CLIENT`、`BATCH_NOT_SUPPORTED` |
| `-32601` | 方法或工具不存在 |
| `-32602` | 工具参数不符合 `inputSchema` |
| `-32603` | 工具执行时发生服务端错误 |
| `-32000` | 服务端在处理前拒绝，见 `error.data.reason` |

## 额度与限制

- 每次 `tools/call` 计入 API key 的调用额度，与 Web API 共用；`initialize`、`tools/list` 等其他请求不计。额度与套餐见 [SESAME Biz [开发者页]](https://biz.candyhouse.co/biz/developer)。
- 端点有整体的请求频率上限，超出时返回 `429`。
- 不提供：群组相关功能、图片检索、工具清单变更通知。
