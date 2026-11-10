# MCP Integration Guide

::: warning In design, not yet available
This page is a design draft for reviewing the public interface. It may change, and the endpoint is not yet available. The following items are not finalized and appear as placeholders:

| Placeholder | Meaning |
| --- | --- |
| `<MCP_ENDPOINT>` | MCP endpoint URL; also the OAuth resource identifier (`resource`) |
| `<SCOPE_READ>` | Scope name for read-only access |
| `<SCOPE_CONTROL>` | Scope name for control access |
:::

## Overview

With [MCP (Model Context Protocol)](https://modelcontextprotocol.io/), you can use your Sesame devices from AI apps that support remote MCP connectors, such as Claude and ChatGPT:

- View your device list and device status;
- Lock and unlock;
- Create, list, and cancel scheduled lock / unlock actions.

When connecting, you sign in on the CANDY HOUSE sign-in page and approve access. The AI app can only act as you, within the permissions you granted. The AI app never receives your password.

## Connection Details

| Item | Details |
| --- | --- |
| Endpoint | `<MCP_ENDPOINT>` |
| Transport | Streamable HTTP, `POST` only |
| Protocol version | `2026-07-28`; 2025 clients (`2025-06-18`, `2025-11-25`) are also supported |
| State | Stateless: no sessions (`Mcp-Session-Id`) are issued; each request is handled independently |
| Authorization | OAuth 2.1; every request must carry `Authorization: Bearer <access token>` |
| Response | `application/json`, or `text/event-stream` containing a single result; clients must support both |

### Request headers

| Header | Requirement |
| --- | --- |
| `Authorization` | `Bearer <access token>`, required on every request. Never put the token in the URL query string |
| `Content-Type` | `application/json` |
| `Accept` | Must list both `application/json` and `text/event-stream` |
| `MCP-Protocol-Version` | Protocol version, e.g. `2026-07-28`. Must match `io.modelcontextprotocol/protocolVersion` in the request body's `params._meta` |
| `Mcp-Method` | Must match the body's `method` (required in `2026-07-28`) |
| `Mcp-Name` | Must match `params.name` (`tools/call`) or `params.uri` (`resources/read`) (required for these two requests in `2026-07-28`) |

If a header does not match the request body, or a required header is missing, the server returns HTTP `400` with JSON-RPC error `-32020`.

### Supported methods

| Method | Description |
| --- | --- |
| `server/discover` | Get the server's supported protocol versions, capabilities, and identity (`2026-07-28`) |
| `tools/list` | List tools with their input and output schemas |
| `tools/call` | Call a tool |
| `resources/list` / `resources/read` | Read the CANDY HOUSE after-sales and purchase policy (`policy://candyhouse/support-policy`, Markdown) |
| `initialize` / `notifications/initialized` | Handshake for 2025 clients only. The notification returns `202` with no body |

- The tool list is static. The server declares `listChanged: false` and does not provide `subscriptions/listen`.
- `2026-07-28` requests do not go through `initialize`; each request carries the protocol version and client capabilities in `params._meta`.
- `GET` and `DELETE` return `405`. `Mcp-Session-Id` and `Last-Event-ID` headers are ignored.

### Request example

Calling `device_status` with `2026-07-28`:

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

## Connecting from an AI App

The general steps are below. App-specific instructions will be added at launch.

1. In the AI app, add a custom MCP connector with the URL `<MCP_ENDPOINT>`.
2. The AI app opens the CANDY HOUSE sign-in page. Sign in with the account you use in the Sesame app.
3. Review the requested access and approve. The first connection usually grants read-only access (viewing devices and schedules).
4. The first time you ask the AI to lock / unlock or create a schedule, the AI app asks you to grant control access as well.
5. To revoke access, remove or disconnect the connector in the AI app.

## Authorization

This section is for developers building their own MCP clients. Major AI apps already implement this flow.

### Discovering the authorization server

1. A request to `<MCP_ENDPOINT>` without a token returns `401`. The `WWW-Authenticate` header gives the URL of the protected resource metadata (RFC 9728) and the required scope:

   ```http
   HTTP/1.1 401 Unauthorized
   WWW-Authenticate: Bearer resource_metadata="<protected resource metadata URL>", scope="<SCOPE_READ>"
   ```

2. Fetch that metadata, take the authorization server from `authorization_servers`, then fetch the authorization server metadata via RFC 8414 / OpenID Connect Discovery.

### Client registration

- **Client ID Metadata Documents (CIMD)** are the primary method: use the HTTPS URL of a metadata document you host as the `client_id`. The document must include at least `client_id`, `client_name`, and `redirect_uris`. The authorization server metadata has `client_id_metadata_document_supported` set to `true`.
- Whether other registration methods are offered will be announced at launch.

### Obtaining a token

- Use the authorization code flow with PKCE (`S256`).
- Include `resource=<MCP_ENDPOINT>` in both the authorization request and the token request (RFC 8707). Issued tokens are valid only for this endpoint; tokens with a mismatched `aud` are rejected.
- If the authorization response includes an `iss` parameter, compare it with the authorization server's `issuer` before exchanging the code for a token (RFC 9207).

### Scopes

| Scope | Allows | Tools |
| --- | --- | --- |
| `<SCOPE_READ>` | Viewing devices and schedules | `device_list`, `device_status`, `schedule_list` |
| `<SCOPE_CONTROL>` | Changing device state, including scheduled actions | `lock`, `unlock`, `schedule_create`, `schedule_cancel` |

Neither scope includes the other. If you only need to view, request only `<SCOPE_READ>`.

### Insufficient scope and step-up authorization

Calling a control tool with a token that has only `<SCOPE_READ>` returns `403`:

```http
HTTP/1.1 403 Forbidden
WWW-Authenticate: Bearer error="insufficient_scope", scope="<SCOPE_CONTROL>", resource_metadata="<protected resource metadata URL>"
```

The client should combine its existing scopes with the scopes in `scope`, re-authorize, and retry the original request with the new token.

### Using the token

- Send `Authorization: Bearer <access token>` on every request.
- An invalid, expired, or wrong-`aud` token returns `401`; refresh it or re-authorize.
- The token is for `<MCP_ENDPOINT>` only. Do not forward it to other services; this server also rejects tokens issued for other services.

## Tools

- `deviceId` must come from `device_list`, and `scheduleId` from `schedule_list`. Do not construct them yourself.
- You can only act on devices and schedules in your own account. Someone else's ID is treated as "not found", and nothing is executed.
- `tools/list` always lists all 7 tools; scopes are checked when a tool is called.

### Devices

| Tool | Parameters | Required scope | Annotations | Description |
| --- | --- | --- | --- | --- |
| `device_list` | None | `<SCOPE_READ>` | `readOnlyHint` | Device list; devices you hold only a guest key for are excluded |
| `device_status` | `deviceId` | `<SCOPE_READ>` | `readOnlyHint` | Device status: online, lock state, battery, firmware version |
| `lock` | `deviceId` | `<SCOPE_CONTROL>` | `destructiveHint`, `idempotentHint`, `openWorldHint` | Lock; lock devices only |
| `unlock` | `deviceId` | `<SCOPE_CONTROL>` | `destructiveHint`, `idempotentHint`, `openWorldHint` | Unlock; lock devices only |

- A successful `lock` / `unlock` only means the command was accepted and sent; it does not guarantee the device has reached the target state. To confirm, call `device_status`, or use [Webhook](./webhook.md) to receive state change notifications.
- Sending the same action to the same device again within a short time may return `ACTION_IN_PROGRESS`.

### Scheduled actions

| Tool | Parameters | Required scope | Annotations | Description |
| --- | --- | --- | --- | --- |
| `schedule_create` | See below | `<SCOPE_CONTROL>` | `destructiveHint`, `openWorldHint` | Create a scheduled lock / unlock |
| `schedule_list` | None | `<SCOPE_READ>` | `readOnlyHint` | List schedules with their latest run result |
| `schedule_cancel` | `scheduleId` | `<SCOPE_CONTROL>` | `destructiveHint`, `idempotentHint` | Cancel a schedule |

`schedule_create` parameters:

| Parameter | Type | Required when | Description |
| --- | --- | --- | --- |
| `action` | `lock` / `unlock` | Always | Action to run at the scheduled time |
| `deviceId` | string | Always | Target device; must be a lock device |
| `timezone` | string | Always | IANA time zone name, e.g. `Asia/Tokyo`, `America/New_York`. `atIso`, `hour`, and `minute` are interpreted in this time zone |
| `timingType` | `delay` / `at` / `recurring` | Always | Once after a delay / once at a time / recurring |
| `delaySeconds` | integer | `timingType` is `delay` | Seconds from now, 60 to 31536000 |
| `atIso` | string | `timingType` is `at` | ISO 8601 local time without a time zone suffix, e.g. `2026-12-01T08:00:00`; must be in the future. Do not append `Z` or `+09:00` |
| `pattern` | `daily` / `weekdays` / `weekends` / `weekly` / `monthly` | `timingType` is `recurring` | Recurrence pattern |
| `hour` | integer | `timingType` is `recurring` | 0 to 23 |
| `minute` | integer | `timingType` is `recurring` | 0 to 59 |
| `dayOfWeek` | integer | `pattern` is `weekly` | 1 to 7; 1 is Monday, 7 is Sunday |
| `dayOfMonth` | integer | `pattern` is `monthly` | 1 to 31; months without that day are skipped |

- At the scheduled time the server runs the action, after re-checking that the device still belongs to you.
- Results are not pushed to you; check `lastFireStatus` with `schedule_list`.

## Tool Result Format

Tool results follow MCP's `CallToolResult`:

| Field | Description |
| --- | --- |
| `resultType` | Always `complete` |
| `content` | Text content. On success, the JSON serialization of `structuredContent`, for clients that do not read structured results |
| `structuredContent` | Structured result. On success, conforms to the tool's `outputSchema` (available from `tools/list`); on failure, `{ "reason", "message" }` |
| `isError` | `true` means a business failure (e.g. device not found, invalid argument). The AI can use `reason` and `message` to correct itself and retry |

Success example (`device_status`):

```json
{
  "resultType": "complete",
  "content": [{ "type": "text", "text": "{\"deviceId\":\"<DEVICE_ID>\", ...}" }],
  "structuredContent": {
    "deviceId": "<DEVICE_ID>",
    "deviceName": "Front door",
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

Failure example:

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

Main `structuredContent` fields on success:

| Tool | Main fields |
| --- | --- |
| `device_list` | `devices[]`: `deviceId`, `deviceName`, `deviceModel` |
| `device_status` | `deviceId`, `deviceName`, `deviceModel`, `online`, `lockState`, `batteryPercent`, `currentFirmwareVersion`, `latestFirmwareVersion` |
| `lock` / `unlock` | `deviceId`, `deviceName`, `action`, `accepted` |
| `schedule_create` | `scheduleId`, `nextFireAt` (ISO 8601 with offset), `timezone` |
| `schedule_list` | `schedules[]`: `scheduleId`, `action`, `deviceName`, `timingType`, `timezone`, `state`, `nextFireAt`, `lastFiredAt`, `lastFireStatus`, `fireCount` |
| `schedule_cancel` | `scheduleId`, `state` |

`lockState` values: `locked` / `unlocked` / `moved`, the same as `CHSesame2Status` in [Webhook](./webhook.md).

`state` values: `PENDING` (one-time schedule waiting to run), `ACTIVE` (recurring schedule in effect), `COMPLETED`, `FAILED` (one-time schedule has run, succeeded / failed), `CANCELLED`. `lastFireStatus` values: `success`, `failure`; empty if it has not run yet.

`reason` values:

| Value | Meaning |
| --- | --- |
| `INVALID_ARGUMENT` | Invalid argument, e.g. a missing required field, an invalid time zone name, or `atIso` in the past |
| `DEVICE_NOT_FOUND` | Device not found, not yours, or not a lock device |
| `ACTION_IN_PROGRESS` | The same action on the same device is already in progress |
| `SCHEDULE_NOT_FOUND` | Schedule not found, or not yours |
| `SCHEDULE_LIMIT_EXCEEDED` | You have reached the limit of active schedules |
| `UPSTREAM_ERROR` | A downstream service call failed; retry later |
| `INTERNAL_ERROR` | Other server error |

## Error Handling

### HTTP status codes

| Status | When | What to do |
| --- | --- | --- |
| `400` | Header does not match the body or a required header is missing (`-32020`); a required client capability is missing (`-32021`); unsupported protocol version (`-32022`, the response lists supported versions); the body is not a valid JSON-RPC message | Fix the request; for an unsupported version, use one of the listed versions |
| `401` | No token, or the token is invalid, expired, or has a mismatched `aud` | Re-authorize or refresh the token as indicated by `WWW-Authenticate` |
| `403` | Insufficient scope (`error="insufficient_scope"`); the `Origin` header is not allowed | Add scopes via [step-up authorization](#insufficient-scope-and-step-up-authorization) |
| `404` | Method not found (JSON-RPC `-32601`) | Check `method` |
| `405` | A method other than `POST`, such as `GET` or `DELETE` | Use `POST` only |
| `429` | Too many requests (endpoint rate limit or per-account limit) | Retry later; if `Retry-After` is present, wait as indicated |

### JSON-RPC error codes

| `error.code` | Meaning |
| --- | --- |
| `-32700` | The request body is not valid JSON |
| `-32600` | Not a valid JSON-RPC request |
| `-32601` | Method not found |
| `-32602` | Invalid params, e.g. the tool or resource does not exist |
| `-32603` | Internal server error |
| `-32020` | `HeaderMismatch`: headers do not match the body, or a required header is missing |
| `-32021` | `MissingRequiredClientCapability`: a required client capability is missing |
| `-32022` | `UnsupportedProtocolVersion`: the protocol version is not supported |

Business failures during tool execution do not use JSON-RPC errors; they return a tool result with `isError: true`. See [Tool Result Format](#tool-result-format).

## Usage Limits

- You can only access the devices and schedules of the authorized account; devices you hold only a guest key for are excluded.
- Request rates are limited (per endpoint and per account); the values will be published at launch. Exceeding them returns `429`.
- The number of active schedules per account is limited; the value will be published at launch.
- Schedule results are not pushed; check them with `schedule_list`.
- Tool list change notifications are not provided.
- The following are not available through this endpoint: firmware upgrade, help center search, and group operations.
