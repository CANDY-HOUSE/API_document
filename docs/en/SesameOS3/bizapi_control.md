---
title: Device Operations
---
# Device Operations

See [WebSocket API](./bizapi.md) for the connection, message format and common response fields.

**API index**

| action | Operations |
| --- | --- |
| [`biz3OperateIoT`](#biz3operateiot) | [cmd](#biz3operateiot-cmd), [&lt;cmdCode number> (Touch Pro)](#biz3operateiot-cmdcode-number-touch-pro) |
| [`biz3TriggerLocker`](#biz3triggerlocker) | [pubDeviceStateChange (server push)](#biz3triggerlocker-pubdevicestatechange-server-push), [pubUserDeviceChange (server push)](#biz3triggerlocker-pubuserdevicechange-server-push) |
| [`biz3InvokeWebAPIs`](#biz3invokewebapis) | [webapi_ssm_shadow_get](#biz3invokewebapis-webapi-ssm-shadow-get), [webapi_history_get](#biz3invokewebapis-webapi-history-get), [webapi_cmd_send](#biz3invokewebapis-webapi-cmd-send) |
| [`biz3Schedule`](#biz3schedule) | [getScheduleList](#biz3schedule-getschedulelist), [cancelSchedule](#biz3schedule-cancelschedule) |
| [`biz3IRRemote`](#biz3irremote) | [getRemoteList](#biz3irremote-getremotelist), [getRemoteListVersion](#biz3irremote-getremotelistversion), [searchRemoteList](#biz3irremote-searchremotelist), [sendIR](#biz3irremote-sendir), [updateRemoteState](#biz3irremote-updateremotestate), [addIRRemote](#biz3irremote-addirremote), [deleteIRRemote](#biz3irremote-deleteirremote), [duplicateIRRemote](#biz3irremote-duplicateirremote), [updateRemoteAlias](#biz3irremote-updateremotealias), [setRemoteKeyOrder](#biz3irremote-setremotekeyorder), [getRemoteKeyOrder](#biz3irremote-getremotekeyorder), [getIRMode](#biz3irremote-getirmode), [setIRMode](#biz3irremote-setirmode), [subscribeIRMode](#biz3irremote-subscribeirmode), [subscribeIRModeRsp (server push)](#biz3irremote-subscribeirmodersp-server-push), [subscribeIRData](#biz3irremote-subscribeirdata), [subscribeIRDataRsp (server push)](#biz3irremote-subscribeirdatarsp-server-push), [unsubscribeIRMode](#biz3irremote-unsubscribeirmode), [unsubscribeIRData](#biz3irremote-unsubscribeirdata), [matchRemote](#biz3irremote-matchremote), [getIRCodes](#biz3irremote-getircodes), [addIRCode](#biz3irremote-addircode), [updateIRCode](#biz3irremote-updateircode), [deleteIRCode](#biz3irremote-deleteircode), [addRemoteToMatter](#biz3irremote-addremotetomatter) |
| [`biz3Face3Qr`](#biz3face3qr) | [command](#biz3face3qr-command), [list](#biz3face3qr-list), [live](#biz3face3qr-live), [viewer](#biz3face3qr-viewer) |

## biz3OperateIoT {#biz3operateiot}

Relay a binary command through the cloud to a device IoT topic (Hub3 'wm2…cmd' or Touch Pro 'stp…cmd'); device reports are pushed back with the same action.

### cmd {#biz3operateiot-cmd}

Send a binary IoT command to a Hub3 (or a device behind a Hub3): firmware update, LED duty, add/remove Sesame, Matter pairing, relay switch, clear WiFi SSID.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3OperateIoT' |
| `op` | `string` | Yes | Always 'cmd' |
| `topic` | `string` | Yes | 'wm2' + hub3TopicId(hub3_id) + 'cmd'. hub3TopicId: legacy Hub3 (UUID starts with '00000000-055A-FD81-0D00-', case-insensitive) uses the last segment (MAC); Hub3 Pro uses the full UUID. hub3_id defaults to device_id |
| `payload` | `string (base64)` | Yes | base64( sign[4B] ‖ cmd[1B] ‖ UTF-8(device_id) ‖ extra ). sign is Cmac.cmacTime(secretKey) (8 hex chars → 4 bytes; same algorithm as biz3TriggerLocker.sign). Extra by cmd: 101/103 (add/remove Sesame) = sesameId[16B] ‖ ssmSecKa[16B, 16 zero bytes if no key] ‖ nickName length[1B] ‖ nickName UTF-8 ‖ productType[1B] ‖ matterProductType[1B]; 92 (LED) = op[1B: 1=set, 2=get] ‖ duty[1B 0-255]; 208 (relay) = relayId[1B: 1/2] ‖ action[1B: 0=off, 1=on]; 3, 137, 153, 210 carry no extra |

```json
{
  "action": "biz3OperateIoT",
  "op": "cmd",
  "topic": "wm2xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxcmd",
  "payload": "<base64(sign|cmd|device_id|extra)>"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `action` | `string` | 'biz3OperateIoT' |
| `op` | `number \| string` | Same command code as the request; the client dispatches to the callback registered for this op (registerIotCallback) |
| `UUID` | `string (optional)` | Reporting device UUID; UUID takes precedence over touch_id |
| `touch_id` | `string (optional)` | Used as the device id when UUID is absent |
| `data` | `object (optional)` | Device report; passed to the callback as the 2nd argument when present, otherwise the whole message is passed |
| `data.progress` | `number (cmd 3)` | DFU progress (negative values are connecting/starting phases; includes completed/aborted markers) |
| `data.versionTag` | `string (cmd 3)` | New firmware version after the update completes |
| `data.UUID` | `string (cmd 3)` | UUID of the device reporting progress |
| `data.ledDuty` | `number 0-255 (cmd 92)` | Current LED duty; the client converts it to a percentage |
| `data.qrCode` | `string (cmd 137)` | Matter pairing QR code payload |
| `data.manualCode` | `string (cmd 137)` | Matter manual pairing code |
| `data.statusCode` | `number (cmd 153)` | Result of opening the pairing window; 0 = success |

::: info Note
cmd values (constants/cmdCode.js): 3 ssmOSUpdate, 92 HUB3_ITEM_CODE_LED_DUTY, 101 SSM3_ITEM_ADD_SESAME, 103 SSM3_ITEM_REMOVE_SESAME, 137 HUB3_MATTER_PAIRING_CODE, 153 HUB3_MATTER_PAIRING_WINDOW, 208 HUB3_ITEM_CODE_RELAY_SWITCH, 210 HUB3_ITEM_CODE_CLEAR_WIFI_SSID. Comment: connectionId is added by the cloud automatically, not by the client. Comment: firmware validates a fixed structure length; when there is no Sesame key, 16 zero bytes must be padded or the command is silently dropped. Responses carry the device's command code (number) as op; callbacks are registered per code. For 101/103 the data is passed through to the caller without reading specific fields. When embedded in the app (isAppHome) the message is not queued for resend while disconnected.
:::

### &lt;cmdCode number> (Touch Pro) {#biz3operateiot-cmdcode-number-touch-pro}

Send card/passcode binary commands to a Sesame Touch Pro (auth device): fetch, mode switch, add, delete, rename, batch upload/delete.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3OperateIoT' |
| `op` | `number` | Yes | Command code, equal to payload byte 0: 109 get cards, 125 get passcodes, 114/130 card/passcode mode set, 140 add card, 138 add passcode, 108 delete card, 124 delete passcode, 107/123 card/passcode rename, 137 change passcode value, 182/184 batch add cards/passcodes, 183/185 batch delete cards/passcodes |
| `topic` | `string` | Yes | 'stp' + auth device UUID + 'cmd' |
| `payload` | `string (base64)` | Yes | Byte 0 is the code. 109/125: code only. 114/130: [code, mode], mode 0=verify 1=enroll. 140/138: 41 bytes [code, 0xF0 (USED), type (card 0x80 = added from IoT / passcode 0x00), idLen, id zero-padded to 16B, nameUUIDLen (16), nameUUID 16B, 4 trailing zero bytes]. 108/124: [code, id bytes]. 107/123: [code, idLen, id, new nameUUID 16B]. 137: [code, oldLen, old, new]. 182/184: chunked [code, offsetLo, offsetHi, totalLo, totalHi, data...], max 4910 bytes per packet; data is repeated (idLen, id, nameUUIDLen, nameUUID). 183/185: [code, (len, id)×N] |

```json
{
  "action": "biz3OperateIoT",
  "op": 109,
  "topic": "stpxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxcmd",
  "payload": "bQ=="
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `action` | `string` | 'biz3OperateIoT' |
| `op` | `number \| string` | Same command code as the request; the client dispatches to the callback registered for this op (registerIotCallback) |
| `UUID` | `string (optional)` | Reporting device UUID; UUID takes precedence over touch_id |
| `touch_id` | `string (optional)` | Used as the device id when UUID is absent |
| `data` | `object (optional)` | Device report; passed to the callback as the 2nd argument when present, otherwise the whole message is passed |
| `data.status` | `string (182/184) \| any (114)` | Batch upload: 'Ok' done, 'Pending' wait, otherwise 'N/...' means resend from byte N-1; for 114 it is passed to the card-enroll UI together with data.op |
| `data.c` | `string (hex, 107)` | Card info hex string, parsed by parseHexStrToCardInfo (cardID etc.) |
| `data.p` | `string (hex, 123)` | Passcode info hex string, parsed by parseHexStrToPasscodeInfo |
| `data.stpUUID` | `string (110/126 notify)` | Device UUID in card/passcode change notifications; triggers a refetch |
| `data.reqContext` | `object {topic, payload} (183/185)` | Original request context; device id is cut from topic and deleted ids parsed from payload |
| `data.wifi_state / cards_num / fingerprints_num / keyboards_num` | `any / number (op 81 push)` | Mech status push (SSM2_ITEM_CODE_MECH_STATUS): WiFi state and card/fingerprint/passcode counts; a count change triggers a refetch |

::: info Note
cmdCode 137 is shared by HUB3_MATTER_PAIRING_CODE and STP_ITEM_CODE_PASSCODE_CHANGE_VALUE; callbacks are registered globally by numeric op, so they may collide. For 140/138 the nameUUID is generated randomly by the client. Results of 109/125 are not read in this handler (lists come from another action). Rename (107/123) shows an error if no report arrives within 15 s.
:::

## biz3TriggerLocker {#biz3triggerlocker}

Lock, unlock, toggle or run a Bot action on a Sesame device with a time-based signature and history tag; device state changes are pushed with the same action.

### `biz3TriggerLocker` {#biz3triggerlocker-request}

Send a lock/unlock/Bot command to a Sesame device via the cloud.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3TriggerLocker' |
| `cmd` | `number` | No | Command code, default 88. 82 = lock, 83 = unlock, 88 = toggle, 89 = Bot click, 170 + n = run Bot script n |
| `sign` | `string (8 hex chars)` | Yes | 8 lowercase hex chars. Algorithm Cmac.cmacTime(secretKey): take current Unix seconds, write as uint32 little-endian (4 bytes), drop byte 0 (least significant) and use bytes 1–3 (3 bytes) as the message; compute AES-CMAC (RFC 4493 subkeys/padding) with the device secretKey (hex string → 16 bytes, AES-128); output the first 4 bytes as hex. |
| `history` | `string (base64)` | Yes | base64( hex(prefix + uuid without dashes) ). prefix: '000c' (BIZ type) in a PC browser; inside the app Android '0010', iOS '0011' (WiFi icon type). uuid priority: envId (backend-generated, cached in localStorage 'web_env_id') → subUUID → 'ffffffff-ffff-ffff-ffff-ffffffffffff'. |
| `device_id` | `string (UUID)` | Yes | Target Sesame device UUID |

```json
{
  "action": "biz3TriggerLocker",
  "cmd": 88,
  "sign": "xxxxxxxx",
  "history": "<base64(000c + uuid hex)>",
  "device_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**Response**

The client does not read specific fields from the response; it only checks `success`.

::: info Note
Comment: when envId/subUUID is not available (guest), the protocol uses all-ff and the cloud shows the entry as a not-logged-in user. No direct response to this request is read; state updates arrive via pubDeviceStateChange / pubUserDeviceChange pushes. Inside the app (isAppHome) it is not queued for resend while disconnected. Callers: device switch (VIotSwitch), bulk unlock/lock (83/82), Bot scripts (170+n), app host requests (operation lock/unlock/toggle → 82/83/88, Bot 89, scripted Bot 170 + default script actionIndex). Note: the client argument is spelled sescretKey.
:::

### pubDeviceStateChange (server push) {#biz3triggerlocker-pubdevicestatechange-server-push}

Server push: a device's state changed.

**Request**

No additional parameters.

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `op` | `string` | 'pubDeviceStateChange' |
| `data` | `object {deviceUUID, stateInfo?, ...}` | Merged into the local device list by deviceUUID; stateInfo is shallow-merged, other fields overwrite |

::: info Note
Exact stateInfo fields are server-defined; the handler does not read them individually.
:::

### pubUserDeviceChange (server push) {#biz3triggerlocker-pubuserdevicechange-server-push}

Server push: the user's device list changed; the client refetches company devices.

**Request**

No additional parameters.

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `op` | `string` | 'pubUserDeviceChange' |

::: info Note
data is not read.
:::

## biz3InvokeWebAPIs {#biz3invokewebapis}

Developer page: proxy-call the Sesame Web API with the company API key (get state, get history, send command).

### webapi_ssm_shadow_get {#biz3invokewebapis-webapi-ssm-shadow-get}

Get the device's current state (shadow).

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3InvokeWebAPIs' |
| `apiKeyId` | `string` | Yes | ID of the company's developer API key |
| `op` | `string` | Yes | 'webapi_ssm_shadow_get' |
| `query` | `object {device_id: string}` | Yes | Target device UUID |
| `body` | `object` | Yes | Always {} |

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

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `op` | `string` | Same as request; used to match the callback |
| `data` | `any` | Raw Web API result; the developer page shows it as JSON |

::: info Note
Any biz3InvokeWebAPIs response triggers gStripe.
:::

### webapi_history_get {#biz3invokewebapis-webapi-history-get}

Get device history (page 0, 5 items).

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3InvokeWebAPIs' |
| `apiKeyId` | `string` | Yes | ID of the company's developer API key |
| `op` | `string` | Yes | 'webapi_history_get' |
| `query` | `object {device_id: string, page: number, lg: number, isBiz: boolean}` | Yes | device_id device UUID; page index (client always 0); lg item count (always 5); isBiz always true |
| `body` | `object` | Yes | Always {} |

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

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `op` | `string` | Same as request; used to match the callback |
| `data` | `any` | Raw Web API result; the developer page shows it as JSON |

::: info Note
Any biz3InvokeWebAPIs response triggers gStripe.
:::

### webapi_cmd_send {#biz3invokewebapis-webapi-cmd-send}

Send a lock/unlock/Bot command to a device via the Web API.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3InvokeWebAPIs' |
| `apiKeyId` | `string` | Yes | ID of the company's developer API key |
| `op` | `string` | Yes | 'webapi_cmd_send' |
| `query` | `undefined` | No | Not sent |
| `body` | `object {cmd: number, history: string, sign: string, device_id: string}` | Yes | cmd: chosen by model on the developer page: 88 (toggle, default), 89 (bot_2), 83 (ssm_bike2 unlock); sign is the same AES-CMAC time signature as biz3TriggerLocker; history = base64(hex('000c' + subUUID without dashes)); device_id device UUID |

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

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `op` | `string` | Same as request; used to match the callback |
| `data` | `any` | Raw Web API result; the developer page shows it as JSON |

::: info Note
Any biz3InvokeWebAPIs response triggers gStripe.Unlike biz3TriggerLocker, history uses only subUUID here, with no envId or all-ff fallback.
:::

## biz3Schedule {#biz3schedule}

List and cancel the current user's scheduled operations (e.g. timed lock/unlock/firmware upgrade).

### getScheduleList {#biz3schedule-getschedulelist}

Get the current user's schedule list.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3Schedule' |
| `op` | `string` | Yes | 'getScheduleList' |
| `userId` | `string (UUID)` | Yes | Current user's subUUID; not sent when empty |

```json
{
  "action": "biz3Schedule",
  "op": "getScheduleList",
  "userId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `data` | `array of {scheduleId, deviceName, action, displayTime}` | Array of schedules; scheduleId, deviceName, action (e.g. lock, unlock, upgrade_firmware; other values are split by camelCase/underscores for display), displayTime ('YYYY-MM-DD HH:mm', 'HH:mm' or free text) |

::: info Note
data.length is stored as count.
:::

### cancelSchedule {#biz3schedule-cancelschedule}

Cancel one scheduled task.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3Schedule' |
| `op` | `string` | Yes | 'cancelSchedule' |
| `userId` | `string (UUID)` | Yes | Current user's subUUID; not sent when empty |
| `scheduleId` | `string` | Yes | ID of the schedule to cancel |

```json
{
  "action": "biz3Schedule",
  "op": "cancelSchedule",
  "userId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "scheduleId": "xxxxxxxx"
}
```

**Response**

The client does not read specific fields from the response; it only checks `success`.

::: info Note
The handler reads no fields of the cancelSchedule response; the page marks the item as cancelling (spinner). How it is then removed from the list is not clear from the code (possibly a server-pushed getScheduleList).
:::

## biz3IRRemote {#biz3irremote}

Hub3 IR remotes: code-library lookup, IR emission, CRUD of remotes and learned keys, learn mode and data subscriptions, Matter bridging.

### getRemoteList {#biz3irremote-getremotelist}

Get the paginated remote model list for an IR type.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3IRRemote' |
| `op` | `string` | Yes | 'getRemoteList' |
| `type` | `string \| number` | Yes | IR type: 0x2000 TV, 0x8000 fan, 0xC000 air conditioner, 0xE000 light, 0xFE00 self-learning |
| `companyID` | `string` | Yes | Current company ID (customerInfo.companyID) |
| `pagination` | `object {page: number, pageSize: number}` | Yes | Page (1-based) and page size (default 200) |

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

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag; on failure with code≠406 an error snackbar is shown |
| `code` | `number` | Error code; 406 is handled silently (empty data, e.g. key missing in code table) |
| `message` | `string` | Error message |
| `data.data` | `array` | Remote model array (replaces the list when currentPage=1, otherwise appends) |
| `data.pagination` | `object {currentPage, pageSize, totalCount, hasMore}` | Pagination; hasMore controls further loading |
| `data.dataVersion` | `string` | List data version for local cache validation; a change mid-paging triggers a full reload |

::: info Note
Array item fields: only direction is read on the list page; others are not read individually.
:::

### getRemoteListVersion {#biz3irremote-getremotelistversion}

Silently query the remote list data version to check whether the local cache is stale.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3IRRemote' |
| `op` | `string` | Yes | 'getRemoteListVersion' |
| `type` | `string \| number` | Yes | IR type: 0x2000 TV, 0x8000 fan, 0xC000 air conditioner, 0xE000 light, 0xFE00 self-learning |
| `companyID` | `string` | Yes | Current company ID (customerInfo.companyID) |
| `silent` | `boolean` | Yes | Always true; echoed back as reqContext.silent so the client leaves the list alone and shows no error |

```json
{
  "action": "biz3IRRemote",
  "op": "getRemoteListVersion",
  "type": "8192",
  "companyID": "xxxxxxxx",
  "silent": true
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag; on failure with code≠406 an error snackbar is shown |
| `code` | `number` | Error code; 406 is handled silently (empty data, e.g. key missing in code table) |
| `message` | `string` | Error message |
| `data.dataVersion` | `string` | Latest data version |
| `reqContext.silent` | `boolean` | Echoed silent flag |

### searchRemoteList {#biz3irremote-searchremotelist}

Search remote models of an IR type by keyword.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3IRRemote' |
| `op` | `string` | Yes | 'searchRemoteList' |
| `type` | `string \| number` | Yes | IR type: 0x2000 TV, 0x8000 fan, 0xC000 air conditioner, 0xE000 light, 0xFE00 self-learning |
| `companyID` | `string` | Yes | Current company ID (customerInfo.companyID) |
| `searchTerm` | `string` | Yes | Trimmed keyword; not sent when empty |
| `pagination` | `object {page: 1, pageSize: 1000}` | Yes | Always page 1, up to 1000 items |

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

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag; on failure with code≠406 an error snackbar is shown |
| `code` | `number` | Error code; 406 is handled silently (empty data, e.g. key missing in code table) |
| `message` | `string` | Error message |
| `data.data` | `array` | Search result array |

### sendIR {#biz3irremote-sendir}

Make the Hub3 emit an IR code.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3IRRemote' |
| `op` | `string` | Yes | 'sendIR' |
| `deviceId` | `string (UUID)` | Yes | Hub3 device UUID |
| `command` | `string` | Yes | remoteEmit: hex command string built from the key; learnEmit: keyUUID of the learned key |
| `operation` | `string` | Yes | 'remoteEmit' (code-library remote) or 'learnEmit' (self-learned remote) |
| `irType` | `string \| number` | Yes | Remote type (see getRemoteList.type) |
| `companyID` | `string` | Yes | Current company ID (customerInfo.companyID) |
| `irDeviceUUID` | `string` | Yes | Remote UUID; empty string for an unsaved remote |

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

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag; on failure with code≠406 an error snackbar is shown |
| `code` | `number` | Error code; 406 is handled silently (empty data, e.g. key missing in code table) |
| `message` | `string` | Error message |
| `data` | `any` | Logged only |

::: info Note
Shows a success toast. code 406 means the key has no code in the table (silent globally; non-AC page shows its own notice). After success, saved remotes call updateRemoteState.
:::

### updateRemoteState {#biz3irremote-updateremotestate}

Save the remote's last sent state (command string).

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3IRRemote' |
| `op` | `string` | Yes | 'updateRemoteState' |
| `deviceId` | `string (UUID)` | Yes | Hub3 device UUID |
| `uuid` | `string (UUID)` | Yes | Remote UUID |
| `state` | `string` | Yes | Last sent command string |
| `companyID` | `string` | Yes | Current company ID (customerInfo.companyID) |

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

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag; on failure with code≠406 an error snackbar is shown |
| `code` | `number` | Error code; 406 is handled silently (empty data, e.g. key missing in code table) |
| `message` | `string` | Error message |

::: info Note
The handler only logs; the callback receives the whole message.
:::

### addIRRemote {#biz3irremote-addirremote}

Save a remote to a Hub3.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3IRRemote' |
| `op` | `string` | Yes | 'addIRRemote' |
| `remote` | `object {uuid, model, state, alias, code, type, deviceUUID, keys: []}` | Yes | uuid generated by client; model/alias/code/type from the chosen model; state current command string (empty for self-learning); deviceUUID is the Hub3 UUID; keys always [] |
| `companyID` | `string` | Yes | Current company ID (customerInfo.companyID) |

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

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag; on failure with code≠406 an error snackbar is shown |
| `code` | `number` | Error code; 406 is handled silently (empty data, e.g. key missing in code table) |
| `message` | `string` | Error message |

::: info Note
Client limit: at most 3 non-self-learning remotes (type≠0xFE00) per Hub3; beyond that nothing is sent and the callback fails immediately. After saving a code-library remote, addRemoteToMatter is called.
:::

### deleteIRRemote {#biz3irremote-deleteirremote}

Delete a remote from a Hub3.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3IRRemote' |
| `op` | `string` | Yes | 'deleteIRRemote' |
| `hub3DeviceId` | `string (UUID)` | Yes | Hub3 device UUID |
| `uuid` | `string (UUID)` | Yes | Remote UUID |
| `companyID` | `string` | Yes | Current company ID (customerInfo.companyID) |

```json
{
  "action": "biz3IRRemote",
  "op": "deleteIRRemote",
  "hub3DeviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "companyID": "xxxxxxxx"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag; on failure with code≠406 an error snackbar is shown |
| `code` | `number` | Error code; 406 is handled silently (empty data, e.g. key missing in code table) |
| `message` | `string` | Error message |

::: info Note
The handler only logs; the callback receives the whole message.
:::

### duplicateIRRemote {#biz3irremote-duplicateirremote}

Duplicate a remote (server generates a new UUID; self-learned remotes also copy keys and IR data).

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3IRRemote' |
| `op` | `string` | Yes | 'duplicateIRRemote' |
| `hub3DeviceId` | `string (UUID)` | Yes | Hub3 device UUID |
| `uuid` | `string (UUID)` | Yes | Source remote UUID |
| `alias` | `string` | Yes | Alias for the new remote; client passes the source alias, server defaults to it when empty |
| `companyID` | `string` | Yes | Current company ID (customerInfo.companyID) |

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

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag; on failure with code≠406 an error snackbar is shown |
| `code` | `number` | Error code; 406 is handled silently (empty data, e.g. key missing in code table) |
| `message` | `string` | Error message |
| `data` | `object (new remote: uuid, alias, type, code, ... + duplicatedKeys, skippedKeys)` | New remote object; success requires data.uuid |
| `data.skippedKeys` | `number` | Number of keys that could not be copied; >0 shows a warning |
| `data.duplicatedKeys` | `any` | Removed by the client before storing |

::: info Note
After success the client calls addRemoteToMatter for the new remote.
:::

### updateRemoteAlias {#biz3irremote-updateremotealias}

Rename a remote.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3IRRemote' |
| `op` | `string` | Yes | 'updateRemoteAlias' |
| `deviceId` | `string (UUID)` | Yes | Hub3 device UUID |
| `uuid` | `string (UUID)` | Yes | Remote UUID |
| `alias` | `string` | Yes | New alias |
| `companyID` | `string` | Yes | Current company ID (customerInfo.companyID) |

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

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag; on failure with code≠406 an error snackbar is shown |
| `code` | `number` | Error code; 406 is handled silently (empty data, e.g. key missing in code table) |
| `message` | `string` | Error message |

::: info Note
Client function name is modifyIRRemote.
:::

### setRemoteKeyOrder {#biz3irremote-setremotekeyorder}

Save the remote's key order.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3IRRemote' |
| `op` | `string` | Yes | 'setRemoteKeyOrder' |
| `deviceId` | `string (UUID)` | Yes | Hub3 device UUID |
| `uuid` | `string (UUID)` | Yes | Remote UUID (must already be saved) |
| `keyOrder` | `array of string` | Yes | Key IDs in order; empty array restores default order |
| `companyID` | `string` | Yes | Current company ID (customerInfo.companyID) |

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

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag; on failure with code≠406 an error snackbar is shown |
| `code` | `number` | Error code; 406 is handled silently (empty data, e.g. key missing in code table) |
| `message` | `string` | Error message |

::: info Note
The handler only logs; the callback receives the whole message.
:::

### getRemoteKeyOrder {#biz3irremote-getremotekeyorder}

Get the remote's key order.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3IRRemote' |
| `op` | `string` | Yes | 'getRemoteKeyOrder' |
| `deviceId` | `string (UUID)` | Yes | Hub3 device UUID |
| `uuid` | `string (UUID)` | Yes | Remote UUID |
| `companyID` | `string` | Yes | Current company ID (customerInfo.companyID) |

```json
{
  "action": "biz3IRRemote",
  "op": "getRemoteKeyOrder",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "companyID": "xxxxxxxx"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag; on failure with code≠406 an error snackbar is shown |
| `code` | `number` | Error code; 406 is handled silently (empty data, e.g. key missing in code table) |
| `message` | `string` | Error message |
| `data` | `object {uuid, keyOrder: array of string}` | keyOrder is [] when no record exists |

### getIRMode {#biz3irremote-getirmode}

Get the Hub3's current IR mode.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3IRRemote' |
| `op` | `string` | Yes | 'getIRMode' |
| `deviceId` | `string (UUID)` | Yes | Hub3 device UUID |
| `companyID` | `string` | Yes | Current company ID (customerInfo.companyID) |

```json
{
  "action": "biz3IRRemote",
  "op": "getIRMode",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "companyID": "xxxxxxxx"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag; on failure with code≠406 an error snackbar is shown |
| `code` | `number` | Error code; 406 is handled silently (empty data, e.g. key missing in code table) |
| `message` | `string` | Error message |
| `data` | `object {ir_mode \| mode} \| number` | Mode: 0 = CONTROL, 1 = LEARN/REGISTER; the client tries data.ir_mode, data.mode, or a bare number |

### setIRMode {#biz3irremote-setirmode}

Set the Hub3's IR mode (learn/control).

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3IRRemote' |
| `op` | `string` | Yes | 'setIRMode' |
| `deviceId` | `string (UUID)` | Yes | Hub3 device UUID |
| `mode` | `number` | Yes | 0 = CONTROL, 1 = REGISTER/LEARN (capture IR signals) |
| `companyID` | `string` | Yes | Current company ID (customerInfo.companyID) |

```json
{
  "action": "biz3IRRemote",
  "op": "setIRMode",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "mode": 1,
  "companyID": "xxxxxxxx"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag; on failure with code≠406 an error snackbar is shown |
| `code` | `number` | Error code; 406 is handled silently (empty data, e.g. key missing in code table) |
| `message` | `string` | Error message |

::: info Note
The client resets to 0 when leaving the learn page.
:::

### subscribeIRMode {#biz3irremote-subscribeirmode}

Subscribe to the Hub3's IR mode change notifications.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3IRRemote' |
| `op` | `string` | Yes | 'subscribeIRMode' |
| `topic` | `string` | Yes | 'hub3/{deviceId}/ir/mode' |
| `deviceId` | `string (UUID)` | Yes | Hub3 device UUID |
| `companyID` | `string` | Yes | Current company ID (customerInfo.companyID) |

```json
{
  "action": "biz3IRRemote",
  "op": "subscribeIRMode",
  "topic": "hub3/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/ir/mode",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "companyID": "xxxxxxxx"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag; on failure with code≠406 an error snackbar is shown |
| `code` | `number` | Error code; 406 is handled silently (empty data, e.g. key missing in code table) |
| `message` | `string` | Error message |

::: info Note
The confirmation is only logged; notifications arrive as op 'subscribeIRModeRsp'.
:::

### subscribeIRModeRsp (server push) {#biz3irremote-subscribeirmodersp-server-push}

Server push: IR mode changed.

**Request**

No additional parameters.

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag; on failure with code≠406 an error snackbar is shown |
| `code` | `number` | Error code; 406 is handled silently (empty data, e.g. key missing in code table) |
| `message` | `string` | Error message |
| `data.data.ir_mode` | `number` | New mode (0 = CONTROL, 1 = LEARN/REGISTER) |

::: info Note
Dispatched to every subscribed device's callback (not filtered per device).
:::

### subscribeIRData {#biz3irremote-subscribeirdata}

Subscribe to IR data learned by the Hub3.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3IRRemote' |
| `op` | `string` | Yes | 'subscribeIRData' |
| `topic` | `string` | Yes | 'hub3/{deviceId}/ir/learned/data' |
| `deviceId` | `string (UUID)` | Yes | Hub3 device UUID |
| `companyID` | `string` | Yes | Current company ID (customerInfo.companyID) |

```json
{
  "action": "biz3IRRemote",
  "op": "subscribeIRData",
  "topic": "hub3/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/ir/learned/data",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "companyID": "xxxxxxxx"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag; on failure with code≠406 an error snackbar is shown |
| `code` | `number` | Error code; 406 is handled silently (empty data, e.g. key missing in code table) |
| `message` | `string` | Error message |

::: info Note
Data arrives as op 'subscribeIRDataRsp'.
:::

### subscribeIRDataRsp (server push) {#biz3irremote-subscribeirdatarsp-server-push}

Server push: learned IR waveform data.

**Request**

No additional parameters.

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag; on failure with code≠406 an error snackbar is shown |
| `code` | `number` | Error code; 406 is handled silently (empty data, e.g. key missing in code table) |
| `message` | `string` | Error message |
| `data.data` | `string (hex)` | Learned IR data; the learn page creates a key from it (addIRCode); the match page treats length ≤50 as empty and keeps waiting, otherwise passes it to matchRemote |

::: info Note
Dispatched to every subscribed device's callback.
:::

### unsubscribeIRMode {#biz3irremote-unsubscribeirmode}

Unsubscribe from IR mode notifications.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3IRRemote' |
| `op` | `string` | Yes | 'unsubscribeIRMode' |
| `deviceId` | `string (UUID)` | Yes | Hub3 device UUID |
| `topic` | `string` | Yes | 'hub3/{deviceId}/ir/mode' |
| `companyID` | `string` | Yes | Current company ID (customerInfo.companyID) |

```json
{
  "action": "biz3IRRemote",
  "op": "unsubscribeIRMode",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "topic": "hub3/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/ir/mode",
  "companyID": "xxxxxxxx"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag; on failure with code≠406 an error snackbar is shown |
| `code` | `number` | Error code; 406 is handled silently (empty data, e.g. key missing in code table) |
| `message` | `string` | Error message |

::: info Note
The handler only logs; the callback receives the whole message.
:::

### unsubscribeIRData {#biz3irremote-unsubscribeirdata}

Unsubscribe from learned IR data.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3IRRemote' |
| `op` | `string` | Yes | 'unsubscribeIRData' |
| `deviceId` | `string (UUID)` | Yes | Hub3 device UUID |
| `topic` | `string` | Yes | 'hub3/{deviceId}/ir/learned/data' |
| `companyID` | `string` | Yes | Current company ID (customerInfo.companyID) |

```json
{
  "action": "biz3IRRemote",
  "op": "unsubscribeIRData",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "topic": "hub3/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/ir/learned/data",
  "companyID": "xxxxxxxx"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag; on failure with code≠406 an error snackbar is shown |
| `code` | `number` | Error code; 406 is handled silently (empty data, e.g. key missing in code table) |
| `message` | `string` | Error message |

::: info Note
The handler only logs; the callback receives the whole message.
:::

### matchRemote {#biz3irremote-matchremote}

Match learned IR waveform data against the code library.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3IRRemote' |
| `op` | `string` | Yes | 'matchRemote' |
| `irData` | `string (hex)` | Yes | IR data received from subscribeIRDataRsp |
| `irWaveLength` | `number` | Yes | irData.length / 2 (byte count) |
| `irType` | `number` | Yes | parseInt(remote.type) |
| `brandName` | `string` | Yes | Remote model (brand) |
| `companyID` | `string` | Yes | Current company ID (customerInfo.companyID) |

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

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag; on failure with code≠406 an error snackbar is shown |
| `code` | `number` | Error code; 406 is handled silently (empty data, e.g. key missing in code table) |
| `message` | `string` | Error message |
| `data.matches` | `array of {controlType: {model, alias, direction}, companyCode: number, bestMatchPercentage: number}` | Match results; companyCode becomes the remote code, bestMatchPercentage is shown as a percentage with 2 decimals |

### getIRCodes {#biz3irremote-getircodes}

Get the key list of a self-learned remote.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3IRRemote' |
| `op` | `string` | Yes | 'getIRCodes' |
| `hub3DeviceId` | `string (UUID)` | Yes | Hub3 device UUID |
| `remoteId` | `string (UUID)` | Yes | Remote UUID |
| `companyID` | `string` | Yes | Current company ID (customerInfo.companyID) |

```json
{
  "action": "biz3IRRemote",
  "op": "getIRCodes",
  "hub3DeviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "remoteId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "companyID": "xxxxxxxx"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag; on failure with code≠406 an error snackbar is shown |
| `code` | `number` | Error code; 406 is handled silently (empty data, e.g. key missing in code table) |
| `message` | `string` | Error message |
| `data` | `array of {keyUUID, name, uuid, ...}` | Key array; keyUUID key id, name, uuid owning remote UUID |

### addIRCode {#biz3irremote-addircode}

Add a key (with learned IR data) to a self-learned remote.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3IRRemote' |
| `op` | `string` | Yes | 'addIRCode' |
| `irCode` | `object {keyUUID, name, uuid, deviceId, data}` | Yes | keyUUID generated by client; name initially ''; uuid remote UUID; deviceId Hub3 UUID; data learned IR data (hex) |
| `companyID` | `string` | Yes | Current company ID (customerInfo.companyID) |

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

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag; on failure with code≠406 an error snackbar is shown |
| `code` | `number` | Error code; 406 is handled silently (empty data, e.g. key missing in code table) |
| `message` | `string` | Error message |

::: info Note
The learn mode is exited (setIRMode 0) afterwards regardless of result.
:::

### updateIRCode {#biz3irremote-updateircode}

Rename a learned key.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3IRRemote' |
| `op` | `string` | Yes | 'updateIRCode' |
| `hub3DeviceId` | `string (UUID)` | Yes | Hub3 device UUID |
| `remoteId` | `string (UUID)` | Yes | Remote UUID |
| `keyUUID` | `string (UUID)` | Yes | Key ID |
| `name` | `string` | Yes | New name (trimmed, non-empty) |
| `companyID` | `string` | Yes | Current company ID (customerInfo.companyID) |

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

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag; on failure with code≠406 an error snackbar is shown |
| `code` | `number` | Error code; 406 is handled silently (empty data, e.g. key missing in code table) |
| `message` | `string` | Error message |

### deleteIRCode {#biz3irremote-deleteircode}

Delete a learned key.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3IRRemote' |
| `op` | `string` | Yes | 'deleteIRCode' |
| `hub3DeviceId` | `string (UUID)` | Yes | Hub3 device UUID |
| `remoteId` | `string (UUID)` | Yes | Remote UUID |
| `keyUUID` | `string (UUID)` | Yes | Key ID |
| `companyID` | `string` | Yes | Current company ID (customerInfo.companyID) |

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

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag; on failure with code≠406 an error snackbar is shown |
| `code` | `number` | Error code; 406 is handled silently (empty data, e.g. key missing in code table) |
| `message` | `string` | Error message |

### addRemoteToMatter {#biz3irremote-addremotetomatter}

Bridge an IR remote to Matter as an on/off device.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3IRRemote' |
| `op` | `string` | Yes | 'addRemoteToMatter' |
| `hub3DeviceId` | `string (UUID)` | Yes | Hub3 device UUID |
| `irDeviceType` | `string \| number` | Yes | Remote type |
| `cmdOn` | `string (hex)` | Yes | Power-on command string (built from the best-covered power key for the code source) |
| `cmdOff` | `string (hex)` | Yes | Power-off command string |
| `irDeviceUUID` | `string (UUID)` | Yes | Remote UUID |
| `irDeviceName` | `string` | Yes | Remote alias |
| `companyID` | `string` | Yes | Current company ID (customerInfo.companyID) |

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

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag; on failure with code≠406 an error snackbar is shown |
| `code` | `number` | Error code; 406 is handled silently (empty data, e.g. key missing in code table) |
| `message` | `string` | Error message |

::: info Note
The handler only logs; the callback receives the whole message.
:::

## biz3Face3Qr {#biz3face3qr}

Face3 doorbell/face device: list bound devices, send commands (wake), get KVS viewer credentials or a LiveKit room token.

### command {#biz3face3qr-command}

Send a command to a Face3 device (generic entry; the cloud signs and pushes it).

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3Face3Qr' |
| `op` | `string` | Yes | 'command' |
| `deviceId` | `string` | Yes | Device UUID |
| `cmd` | `string` | Yes | Downlink command name (device-side action). The only value used in the code is 'face3Wake' (wake the device to start WebRTC streaming) |

```json
{
  "action": "biz3Face3Qr",
  "op": "command",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "cmd": "face3Wake"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag |
| `code` | `any` | Result code (received by the callback, not branched on) |
| `message` | `string` | Failure reason string |
| `data.deviceId` | `string` | Used to route the response to the 'op:deviceId' callback |
| `message (failure)` | `string` | device_offline, not_bound, device_identity_rejected, device_not_signable |

::: info Note
The body intentionally omits subUUID: the cloud takes the user from the authenticated connection (face3_ws_connections[connectionId]); only users bound to the device may act. Sent only while connected, never queued; when disconnected the callback immediately gets {success:false, message:'ws_disconnected'}. Comment: the device normally sleeps powered off; the WiFi module powers up the main MCU on face3Wake and forwards the command, so success only means the module received it. The device then pushes op 'streamState' with {deviceId, state, reason} (e.g. stopped with reason 'doorbell' = doorbell hung up).
:::

### list {#biz3face3qr-list}

List Face3 devices bound to the current user.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3Face3Qr' |
| `op` | `string` | Yes | 'list' |

```json
{
  "action": "biz3Face3Qr",
  "op": "list"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | On failure the existing list is kept |
| `data.devices` | `array of {deviceUUID, deviceName, stateInfo, ...}` | Bound device array |

::: info Note
No subUUID is sent; the cloud resolves the user from the connection. This request may be queued while disconnected.
:::

### live {#biz3face3qr-live}

Get a LiveKit room token (multi-viewer / multi-party call).

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3Face3Qr' |
| `op` | `string` | Yes | 'live' |
| `deviceId` | `string` | Yes | Device UUID |

```json
{
  "action": "biz3Face3Qr",
  "op": "live",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag |
| `code` | `any` | Result code (received by the callback, not branched on) |
| `message` | `string` | Failure reason string |
| `data.deviceId` | `string` | Used to route the response to the 'op:deviceId' callback |
| `data.url` | `string` | LiveKit server URL |
| `data.token` | `string` | LiveKit access token; required for success |

::: info Note
The body intentionally omits subUUID: the cloud takes the user from the authenticated connection (face3_ws_connections[connectionId]); only users bound to the device may act. Sent only while connected, never queued; when disconnected the callback immediately gets {success:false, message:'ws_disconnected'}. Gradual rollout: not_bound / not_authenticated fail immediately; other failures or timeout fall back to op 'viewer' (direct KVS).
:::

### viewer {#biz3face3qr-viewer}

Get temporary viewer credentials (KVS WebRTC, scoped to this device's channel, 15 minutes).

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | `string` | Yes | Always 'biz3Face3Qr' |
| `op` | `string` | Yes | 'viewer' |
| `deviceId` | `string` | Yes | Device UUID |

```json
{
  "action": "biz3Face3Qr",
  "op": "viewer",
  "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Success flag |
| `code` | `any` | Result code (received by the callback, not branched on) |
| `message` | `string` | Failure reason string |
| `data.deviceId` | `string` | Used to route the response to the 'op:deviceId' callback |
| `data.channelArn` | `string` | KVS signaling channel ARN |
| `data.region` | `string` | AWS region |
| `data.clientId` | `string` | Viewer clientId |
| `data.credentials` | `object {accessKeyId, secretAccessKey, sessionToken}` | Temporary credentials issued via AssumeRole |
| `data.iceServers` | `array` | ICE server list |
| `message (failure)` | `string` | channel_not_ready (channel not yet created; client retries), not_bound, invalid_device_id, not_authenticated, device_offline, device_identity_rejected, device_not_signable |

::: info Note
The body intentionally omits subUUID: the cloud takes the user from the authenticated connection (face3_ws_connections[connectionId]); only users bound to the device may act. Sent only while connected, never queued; when disconnected the callback immediately gets {success:false, message:'ws_disconnected'}. Precondition: the device must be woken and streaming first. No long-term credentials are kept in the browser.
:::
