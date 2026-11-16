# MCP

## Overview

With [MCP (Model Context Protocol)](https://modelcontextprotocol.io/), you can use your own SESAME devices from AI apps that support remote MCP servers, such as Claude and Codex:

- View your device list and device status;
- Lock, unlock, and update firmware;
- Create, view, and cancel scheduled lock / unlock / firmware updates;
- Look up product usage and the after-sales policy.

You need a SESAME Biz API key to connect. After connecting, sign in to your SESAME account in the conversation with a verification code sent to your email, and the AI can then operate the devices in your account on your behalf. The AI app never receives your password.

## Connection details

| Item | Value |
| --- | --- |
| Endpoint | `https://jhcr1i3ecb.execute-api.ap-northeast-1.amazonaws.com/prod/mcp` |
| Transport | Streamable HTTP, `POST` only |
| Protocol version | `2026-07-28`; also compatible with `2025-11-25`, `2025-06-18`, `2025-03-26` |
| State | Stateless: no session is issued (`Mcp-Session-Id`); each request is handled independently |
| Response | `application/json`, or `text/event-stream` containing a single result |

### Request headers

| Header | Required | Description |
| --- | --- | --- |
| `x-api-key` | Yes | Your SESAME Biz API key. Get it from [SESAME Biz [Developer page]](https://biz.candyhouse.co/biz/developer) |
| `x-mcp-client` | No | A name that separates sign-in states: 1–32 lowercase letters, digits, or `-`, such as `claude-code` or `codex`. Without this header it is `default`; if present but empty or invalid, the request returns `400` |

### API key and `x-mcp-client`

- Sign-in state is stored per "Biz account that owns the API key + `x-mcp-client`". It persists across conversations until `auth_logout` is called.
- Members of the same Biz account share one API key. **Each member must set a different `x-mcp-client`**; otherwise they share one sign-in state and end up using a SESAME account someone else signed in with.
- `x-mcp-client` is set by the client itself and is **not a permission boundary**: anyone who has the same key and knows another member's `x-mcp-client` can use that member's sign-in state. Only give the API key to members you trust.
- After you change your API key, the old key can no longer call tools.

## Connecting from an AI app

After connecting, the AI app reads the tool list and the server's usage instructions (`instructions`) and calls tools according to those rules.

### claude.ai (custom connector)

1. In claude.ai's connector settings, choose "Add custom connector".
2. Enter the endpoint as the URL, and add an `x-api-key` request header with your API key.
3. Once added, the connector is also available in the Claude mobile app and Claude Code.

::: warning x-mcp-client
Adding `x-mcp-client` to a claude.ai custom connector requires review by claude.ai. Without it, the value is `default`: every connection under the same Biz account that has no `x-mcp-client` shares one sign-in state. If several people share a key, have the other members set their own `x-mcp-client` in clients such as Claude Code or Codex.
:::

### Claude Code

Add it from the command line:

```bash
claude mcp add --transport http candyhouse \
  https://jhcr1i3ecb.execute-api.ap-northeast-1.amazonaws.com/prod/mcp \
  --header "x-api-key: <YOUR_API_KEY>" \
  --header "x-mcp-client: claude-code"
```

Or configure it in the project's `.mcp.json`. `headers` supports `${VAR}` environment variable references, so the key stays out of the repository:

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

See the [Claude Code MCP documentation](https://code.claude.com/docs/en/mcp) for details.

### Codex

1. Open "Plugins", switch to the "MCP" tab, and click "Add".
2. Enter the endpoint as the URL.
3. Add the headers `x-api-key` (your API key) and `x-mcp-client` (such as `codex`).

See the [Codex plugins documentation](https://www.codex-docs.com/docs/plugins) for details.

### Other clients

Any MCP client that supports Streamable HTTP and custom request headers can connect. Clients that cannot set custom headers (such as ChatGPT connectors) are not supported at this time.

## Signing in

1. Ask the AI to view or operate a device. If you are not signed in, the AI asks for the email address you use in the SESAME app.
2. The AI calls `auth_start`, and a verification code is sent to that address.
3. Tell the AI the code; it calls `auth_verify` to complete sign-in.

- The verification code expires, and the number of incorrect attempts is limited. After it expires or the limit is reached, call `auth_start` again. After too many failures in a short time, the account is temporarily locked for up to about an hour.
- To switch SESAME accounts, have the AI call `auth_logout` first.

## Tools

- `deviceId` must come from `device_list`, and `scheduleId` from `schedule_list`. Do not construct them yourself.
- You can only operate devices and schedules in your own account; devices you hold a guest key for are not included. Passing someone else's ID is treated as "not found", and nothing is executed.

### Sign-in

| Tool | Parameters | Description |
| --- | --- | --- |
| `auth_start` | `email` | Send a verification code to the email address |
| `auth_verify` | `code` | Check the code and complete sign-in |
| `auth_logout` | None | Sign out and clear the sign-in state |

### Devices (sign-in required)

| Tool | Parameters | Description |
| --- | --- | --- |
| `device_list` | None | Device list |
| `device_status` | `deviceId` | Latest known device status: lock state, online, battery, firmware version, etc. |
| `lock` | `deviceId` | Lock |
| `unlock` | `deviceId` | Unlock |
| `upgrade_firmware` | `deviceId` | Start a firmware update |

- `lock`, `unlock`, and `upgrade_firmware` return as soon as the command is accepted. They do not guarantee the device has moved, and no result is pushed afterwards. The status right after a command may still be the old one; check again after a few seconds.
- Calling `upgrade_firmware` again on the same device within 30 seconds returns `ACTION_IN_PROGRESS`.

### Schedules (sign-in required)

| Tool | Parameters | Description |
| --- | --- | --- |
| `schedule_create` | See below | Create a schedule |
| `schedule_list` | None | One-time schedules not yet fired, and active recurring schedules |
| `schedule_cancel` | `scheduleId` | Cancel a schedule; a cancelled recurring schedule stops firing |

`schedule_create` parameters:

| Parameter | Type | Required when | Description |
| --- | --- | --- | --- |
| `action` | string | Always | `lock`, `unlock`, or `upgrade_firmware` |
| `deviceId` | string | Always | Target device |
| `timingType` | `delay` / `at` / `recurring` | Always | Once after a delay / once at a time / recurring |
| `delaySeconds` | integer | `timingType` is `delay` | Seconds from now, 60–31536000 |
| `atIso` | string | `timingType` is `at` | Local time without a time zone suffix, such as `2026-12-01T08:00:00`; must be in the future. Do not append `Z` or `+09:00` |
| `pattern` | `daily` / `weekdays` / `weekends` / `weekly` / `monthly` | `timingType` is `recurring` | Every day / weekdays / weekends / weekly / monthly |
| `hour` | integer | `timingType` is `recurring` | 0–23 |
| `minute` | integer | `timingType` is `recurring` | 0–59 |
| `dayOfWeek` | integer | `pattern` is `weekly` | 1–7, 1 is Monday and 7 is Sunday |
| `dayOfMonth` | integer | `pattern` is `monthly` | 1–31; skipped in months without that day |
| `timezone` | string | Optional | IANA time zone name, such as `America/New_York`. `atIso`, `hour`, and `minute` are interpreted in this zone; if omitted, Japan time (`Asia/Tokyo`). An invalid name returns `PARAMETER_FAILED` |

- Time zones with daylight saving time: if a recurring schedule's time does not exist on the day DST starts, that day is skipped; if it occurs twice on the day DST ends, it fires once. If a one-time schedule's time does not exist, it moves forward by the DST shift; if it occurs twice, the first one is used.
- The server executes the action at the scheduled time and does not push the result. A fired one-time schedule disappears from `schedule_list`; call `device_status` to check the outcome.

### Knowledge base and after-sales policy (no sign-in required)

| Tool | Parameters | Description |
| --- | --- | --- |
| `knowledge_search` | `query`; optional `product`, `topK` | Search help center articles and support replies; returns relevant snippets, not an answer |
| `support_policy` | None | Full after-sales and purchase policy (warranty, repair fees, exchanges and returns, adapter prices, shipping, receipts, order cancellation, lockout compensation), plus rules for answering policy questions |

The after-sales policy is also available as a resource: `policy://candyhouse/support-policy` (Markdown), readable with `resources/list` and `resources/read`.

## Tool result format

- `content` has a single `text` item: the tool result as JSON text, with fields such as `ok`, `message`, and `data`. The result is meant for the AI to read; its field structure is not guaranteed to be stable, so do not depend on it in code.
- On a business failure (not signed in, device not found, invalid parameters, etc.), `isError` is `true` and `data.reason` gives the reason. The AI can correct the call and retry.

Common `data.reason` values:

| Value | Meaning |
| --- | --- |
| `NOT_AUTHENTICATED` | Not signed in, or the sign-in has expired |
| `DEVICE_NOT_FOUND` | Device not found, or not yours |
| `SCHEDULE_NOT_FOUND` | Schedule not found: already fired, cancelled, or not yours |
| `PARAMETER_FAILED` | Invalid parameters, such as an invalid time zone name, an `atIso` in the past, or an `action` that cannot be scheduled |
| `ACTION_IN_PROGRESS` | A firmware update on the same device is in progress |

Failure example (`content[0].text`):

```json
{
  "ok": false,
  "resultType": "DEVICE_LIST",
  "message": "You are not logged in or your session has expired. Please log in first.",
  "data": { "action": "device_list", "reason": "NOT_AUTHENTICATED", "chatType": "user" }
}
```

## Error handling

### HTTP status codes

| Status | Source | Situation | What to do |
| --- | --- | --- | --- |
| `400` | Server | `x-mcp-client` is empty or invalid (`INVALID_MCP_CLIENT`); batch request (`BATCH_NOT_SUPPORTED`); request violates the MCP protocol, such as headers not matching the body | Fix the request; send batch items one at a time |
| `401` | Gateway | No `x-api-key` | Add the header |
| `403` | Gateway | Invalid API key | Check the key |
| `403` | Server | The API key has been replaced (`API_KEY_REJECTED`) | Use the new key |
| `405` | Server | A method other than `POST` | Use `POST` only |
| `429` | Server | Monthly quota used up (`QUOTA_EXCEEDED`); no `Retry-After` | Retrying will not help; wait for the monthly reset or upgrade your plan |
| `429` | Gateway | Too many requests | Retry later |
| `503` | Server | Quota check temporarily unavailable (`QUOTA_UNAVAILABLE`) | Retry later |

Gateway errors are not in JSON-RPC format. When the server rejects a request before processing it as MCP, it returns a JSON-RPC error, with `error.data.reason` giving the reason:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": { "code": -32000, "message": "Monthly API usage quota exceeded", "data": { "reason": "QUOTA_EXCEEDED" } }
}
```

### JSON-RPC error codes

| `error.code` | Meaning |
| --- | --- |
| `-32600` | Invalid request, including `INVALID_MCP_CLIENT` and `BATCH_NOT_SUPPORTED` |
| `-32601` | Method or tool not found |
| `-32602` | Tool arguments do not match the `inputSchema` |
| `-32603` | Server error while running the tool |
| `-32000` | Rejected by the server before processing; see `error.data.reason` |

## Quota and limits

- Each `tools/call` counts toward the API key's usage quota, shared with the Web API; other requests such as `initialize` and `tools/list` do not count. See [SESAME Biz [Developer page]](https://biz.candyhouse.co/biz/developer) for quotas and plans.
- The endpoint has an overall request rate limit; exceeding it returns `429`.
- Not provided: group features, image search, tool list change notifications.
