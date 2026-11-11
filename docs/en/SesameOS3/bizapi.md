---
title: WebSocket API
---
# WebSocket API

The WebSocket API is the interface that the [Biz3 (biz.candyhouse.co)](https://biz.candyhouse.co/) management console uses to talk to the cloud: device management, device operations, members and permissions, access-control credentials (cards / passcodes), developer settings and more.

::: info Note
This document is compiled from the [Biz3 source code](https://github.com/CANDY-HOUSE/biz.candyhouse.co) (`src/api`, `src/websocket`). Fields reflect what the client actually sends and reads; the server may return more. The interface changes as Biz3 is updated.
:::

## Connection

| Item | Value |
| --- | --- |
| URL | `wss://82q6nuplv0.execute-api.ap-northeast-1.amazonaws.com/public` |
| Protocol | WebSocket (JSON text messages) |

Pass the token as a query parameter when connecting:

```text
wss://82q6nuplv0.execute-api.ap-northeast-1.amazonaws.com/public?token=<JWT>&lang=<language>
```

| Parameter | Description |
| --- | --- |
| `token` | Required. The signed-in user's Cognito ID Token (JWT), URL-encoded |
| `lang` | UI language such as `ja`, `en`, `zh-CN`, `zh-TW`; server messages are returned in this language |

## Authentication

Sign in with a CANDY HOUSE account through Amazon Cognito (user pool) and use the **ID Token (JWT)** as `token`. The JWT's `sub` is the account ID (`subUUID` in Biz). Refresh the token and reconnect when it expires.

## Message format

### Request

Every request is a single JSON message. `action` selects the API category, `op` selects the operation, and the remaining fields are parameters:

```json
{
  "action": "biz3ManageDevice",
  "op": "getDeviceStatus",
  "deviceUUID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

### Response

The server replies with the same `action` (and `op`):

```json
{
  "action": "biz3ManageDevice",
  "op": "getDeviceStatus",
  "success": true,
  "data": {}
}
```

| Field | Description |
| --- | --- |
| `action` / `op` | Same as the request; used to match the request |
| `success` | Whether the request succeeded |
| `data` | Response data; see each API |
| `message` | Error message on failure, e.g. `Limit Exceeded` when the device limit is reached |
| `code` | Error code returned by some APIs (e.g. `406` from the IR remote APIs means no data) |
| `reqContext` | Request parameters echoed back by the server (e.g. `name`, `deviceUUID` from the request); useful for matching a response to its request |

Messages carry no request ID: responses for the same `action` + `op` correspond to requests in the order they were sent. The server may also push messages on its own (e.g. device status changes).

## Heartbeat and reconnection

- Send a heartbeat `{"action": "biz3KeepAlive"}` every 5 minutes; the reply contains `connectionId`. If there is no reply within 3 seconds, treat the connection as dead and reconnect.
- A connection not established within 5 seconds is considered timed out. After a disconnect, reconnect with a 1–10 second backoff; after repeated failures, first check whether the token has expired.
- Messages to be sent while disconnected can be queued and sent after reconnecting; do not resend a previous account's messages after switching accounts.

## API list

| Category | action |
| --- | --- |
| [Devices and history](./bizapi_devices.md) | [`biz3ManageDevice`](./bizapi_devices.md#biz3managedevice), [`biz3GetDeviceHistory`](./bizapi_devices.md#biz3getdevicehistory), [`biz3GetDeviceBatteryRecord`](./bizapi_devices.md#biz3getdevicebatteryrecord), [`biz3GetDeviceEmployeeKeys`](./bizapi_devices.md#biz3getdeviceemployeekeys) |
| [Device operations](./bizapi_control.md) | [`biz3OperateIoT`](./bizapi_control.md#biz3operateiot), [`biz3TriggerLocker`](./bizapi_control.md#biz3triggerlocker), [`biz3InvokeWebAPIs`](./bizapi_control.md#biz3invokewebapis), [`biz3Schedule`](./bizapi_control.md#biz3schedule), [`biz3IRRemote`](./bizapi_control.md#biz3irremote), [`biz3Face3Qr`](./bizapi_control.md#biz3face3qr) |
| [Members and permissions](./bizapi_members.md) | [`biz3GetLoginUser`](./bizapi_members.md#biz3getloginuser), [`biz3ManageCompany`](./bizapi_members.md#biz3managecompany), [`biz3ManageEmployee`](./bizapi_members.md#biz3manageemployee), [`biz3ManageEmployeeGroup`](./bizapi_members.md#biz3manageemployeegroup), [`biz3ManageDeviceGroup`](./bizapi_members.md#biz3managedevicegroup), [`biz3ManageEmployeeDevice`](./bizapi_members.md#biz3manageemployeedevice), [`biz3ManageRole`](./bizapi_members.md#biz3managerole), [`biz3ManageAccessCtlAuthData`](./bizapi_members.md#biz3manageaccessctlauthdata)|
