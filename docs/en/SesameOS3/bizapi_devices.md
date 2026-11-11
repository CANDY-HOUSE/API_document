---
title: Devices and History
---
# Devices and History

See [WebSocket API](./bizapi.md) for the connection, message format and common response fields.

**API index**

| action | Operations |
| --- | --- |
| [`biz3ManageDevice`](#biz3managedevice) | [getUserDevice](#biz3managedevice-getuserdevice), [getCompanyDevice](#biz3managedevice-getcompanydevice), [add](#biz3managedevice-add), [del](#biz3managedevice-del), [updateName](#biz3managedevice-updatename), [updateRelayEnable](#biz3managedevice-updaterelayenable), [updateDeviceOrderKey](#biz3managedevice-updatedeviceorderkey), [notifyList](#biz3managedevice-notifylist), [notifyManage](#biz3managedevice-notifymanage), [switchRecharge](#biz3managedevice-switchrecharge), [getDeviceStatus](#biz3managedevice-getdevicestatus) |
| [`biz3GetDeviceHistory`](#biz3getdevicehistory) | [getHistory](#biz3getdevicehistory-gethistory), [getEnv](#biz3getdevicehistory-getenv), [makeInvisible](#biz3getdevicehistory-makeinvisible) |
| [`biz3GetDeviceBatteryRecord`](#biz3getdevicebatteryrecord) | [batch-get](#biz3getdevicebatteryrecord-batch-get), [makeInvisible](#biz3getdevicebatteryrecord-makeinvisible) |
| [`biz3GetDeviceEmployeeKeys`](#biz3getdeviceemployeekeys) | [get](#biz3getdeviceemployeekeys-get), [getLimited](#biz3getdeviceemployeekeys-getlimited) |

## biz3ManageDevice {#biz3managedevice}

Device management: list personal/company devices, add/remove devices, rename, relay enable, ordering, push-notification settings, rechargeable-battery switch, and single-device status.

### getUserDevice {#biz3managedevice-getuserdevice}

Fetch all device keys personally held by the signed-in user.

**Request**

No additional parameters.

```json
{
  "action": "biz3ManageDevice",
  "op": "getUserDevice"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `op` | `string ("PubedUserDevice")` | Data arrives as pushed messages with op=PubedUserDevice (paged), not op=getUserDevice. |
| `data.totalPage` | `number (integer)` | Total number of pages. |
| `data.data.page` | `number (integer, 1-based)` | Current page number, starting at 1. |
| `data.data.list` | `array of device objects` | Devices in this page; fields per device_object. |

::: info Note
The client collects pages 1..totalPage contiguously; a missing/out-of-order page or duplicate deviceUUID discards the whole snapshot. The client filters by keyLevel and model to find devices that can be added to the company (owner keys only). In the legacy app WebView (isFromApp and not AppHome) the client skips sending unless forced.
:::

### getCompanyDevice {#biz3managedevice-getcompanydevice}

Fetch all devices registered to the company; the server also subscribes this connection to their status updates.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `companyID` | `string` | Yes | Company ID (from the current login info). |

```json
{
  "action": "biz3ManageDevice",
  "op": "getCompanyDevice",
  "companyID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `op` | `string ("PubedCompanyDevice")` | Data arrives as pushed messages with op=PubedCompanyDevice (paged). |
| `data.totalPage` | `number (integer)` | Total number of pages. |
| `data.data.page` | `number (integer, 1-based)` | Current page number, starting at 1. |
| `data.data.list` | `array of device objects` | Devices in this page; fields per device_object (including stateInfo, orderKey). |

::: info Note
Code comment: device-status subscription is done automatically by the server on getCompanyDevice / getDeviceStatus; the client re-calls it after the WebSocket connectionId changes (reconnect) to resubscribe. Page-collection rules as for getUserDevice. The client re-fetches after successful add/del.
:::

### add {#biz3managedevice-add}

Register (or update) one or more device keys to the company.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `companyID` | `string` | Yes | Company ID. |
| `items` | `array of objects` | Yes | Array of device-key objects. When parsed from a QR code: {secretKey (hex), keyIndex (hex), sesame2PublicKey (hex), keyLevel (number), deviceModel (string), deviceName (string), deviceUUID (string, upper-case)}; other callers pass device objects from getUserDevice/getCompanyDevice, or key objects returned by the native app. |

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

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether it succeeded. |
| `message` | `string` | Failure message; "Limit Exceeded" means the plan's device limit was reached. |

::: info Note
Device count is limited by plan (Limit Exceeded). The client re-fetches getCompanyDevice on success. AppLockAngle re-submits an existing device object with a changed deviceModel via add to sync the model, implying update semantics for existing devices (inferred from usage). The selection UI only offers owner-level keys.
:::

### del {#biz3managedevice-del}

Remove device keys from the company.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `companyID` | `string` | Yes | Company ID. |
| `items` | `array of {deviceUUID: string, subUUID: string}` | Yes | Keys to remove; each item is the device UUID and the holder's subUUID. |

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

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether it succeeded. |
| `message` | `string` | Failure message. |

::: info Note
The client re-fetches getCompanyDevice on success. Removal does not reset the device itself; the app also turns off push for that device (notifyManage enablePush=false).
:::

### updateName {#biz3managedevice-updatename}

Rename a device on the user's key.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `obj.subUUID` | `string` | Yes | Current user's subUUID. |
| `obj.deviceUUID` | `string` | Yes | Device UUID. |
| `obj.deviceName` | `string` | Yes | New name (non-empty). |

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

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether it succeeded. |
| `reqContext.deviceUUID` | `string` | Echoed device UUID; the client updates local state with it. |
| `reqContext.deviceName` | `string` | Echoed new name. |

::: info Note
Parameters are wrapped in obj, not top-level.
:::

### updateRelayEnable {#biz3managedevice-updaterelayenable}

Set the enable flag of each Hub3 LTE relay channel, stored in the server's hub3_status.relay_info.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `obj.deviceUUID` | `string` | Yes | Hub3 device UUID. |
| `obj.enable1` | `number (0\|1)` | No | Relay channel 1 enable: 1=on, 0=off. |
| `obj.enable2` | `number (0\|1)` | No | Relay channel 2 enable: 1=on, 0=off. |

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

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether it succeeded (the only caller passes no callback and reads nothing). |

::: info Note
Code comment: send only the channel being changed (enable1 or enable2). When reading, a missing stateInfo.relayInfo.enableN is treated as enabled.
:::

### updateDeviceOrderKey {#biz3managedevice-updatedeviceorderkey}

Update a device's position in the user's device list after drag-and-drop.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `obj.subUUID` | `string` | Yes | subUUID of the moved device key. |
| `obj.deviceUUID` | `string` | Yes | UUID of the moved device. |
| `obj.prevKey` | `string` | No | orderKey of the device now before it; absent when moved to the top. |
| `obj.nextKey` | `string` | No | orderKey of the device now after it; absent when moved to the end. |

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

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether it succeeded; on success the client re-fetches getCompanyDevice to get the server-generated orderKeys. |

::: info Note
Dragging is only enabled when the first device has an orderKey. orderKeys are generated by the server.
:::

### notifyList {#biz3managedevice-notifylist}

Get each device's push-notification on/off state for a push token.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `companyID` | `string` | Yes | Company ID. |
| `pushToken` | `string` | Yes | Push token supplied by the native app. |
| `items` | `unknown` | No | Supported by the hook, but the only caller does not pass it (undefined in practice). |

```json
{
  "action": "biz3ManageDevice",
  "op": "notifyList",
  "companyID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "pushToken": "<push-token>"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether it succeeded. |
| `message` | `string` | Failure message. |
| `data[].deviceUUID` | `string` | Device UUID. |
| `data[].deviceName` | `string` | Device name. |
| `data[].enablePush` | `boolean` | Whether push is enabled for the device. |

### notifyManage {#biz3managedevice-notifymanage}

Turn push notifications for a device on or off for a push token.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `companyID` | `string` | Yes | Company ID. |
| `pushToken` | `string` | Yes | Push token. |
| `deviceUUID` | `string` | Yes | Device UUID. |
| `enablePush` | `boolean` | Yes | true=enable push, false=disable. |

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

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether it succeeded. |
| `message` | `string` | Failure message. |

::: info Note
After removing a device (del) the app calls this with enablePush=false.
:::

### switchRecharge {#biz3managedevice-switchrecharge}

Set whether the device uses a rechargeable battery (affects battery level calculation).

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | Yes | Device UUID. |
| `isRechargeBattery` | `number (0\|1)` | Yes | 1=rechargeable, 0=regular battery (converted from a boolean by the client). |

```json
{
  "action": "biz3ManageDevice",
  "op": "switchRecharge",
  "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "isRechargeBattery": 1
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether it succeeded; on failure the client reverts the switch. |

::: info Note
On success the client re-fetches the device list and battery records (batch-get), suggesting records depend on this setting. The current value is read from stateInfo.isRechargeBattery.
:::

### getDeviceStatus {#biz3managedevice-getdevicestatus}

Fetch a single device's detail and status; the server also subscribes this connection to its status updates.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | Yes | Device UUID (the client does not send when empty). |

```json
{
  "action": "biz3ManageDevice",
  "op": "getDeviceStatus",
  "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `data` | `array of device objects` | The client takes only data[0] as the device detail (fields per device_object); an empty array means none. |

::: info Note
Code comment: status subscription is done automatically by the server on getCompanyDevice / getDeviceStatus. Used by firmware upgrade, device settings, battery pages, etc., as a fallback when the device is not in the company list.
:::

## biz3GetDeviceHistory {#biz3getdevicehistory}

Device operation history: paged history retrieval, environment snapshot of a record, and hiding a record.

### getHistory {#biz3getdevicehistory-gethistory}

Fetch paged operation history for one or more devices.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `companyID` | `string` | Yes | Company ID. |
| `list` | `array of objects` | Yes | Query targets. Single-device: [{deviceUUID: string, lastKey: number\|null}]; all-devices: each item is {deviceId: string, lastKey: number\|null} (note the key name deviceId). lastKey is the timestamp of the last record of the previous page, null for the first page. |
| `pageSize` | `number \| null` | No | Page size; null by default (server default), 100 when exporting CSV/Excel. |

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

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `data` | `array of history records (single-device form)` | For single-device queries, an array of history records; empty means no more. |
| `data[].device_id` | `string` | Device UUID. |
| `data[].timestamp` | `number` | Record time (parsed by the client as new Date(timestamp), i.e. milliseconds); also used as the next page's lastKey. |
| `data[].type` | `number` | History event type (unlock, lock, etc.; mapped by the client to an icon and label). |
| `data[].history_tag` | `string (base64) \| object of byte values` | Operator tag: base64-encoded UTF-8 text (may also be an object of byte values); when absent the client shows the manual-operation label for the type. |
| `data[].record_id` | `number \| string` | Record ID (used as a list key). |
| `data[].via` | `unknown` | Operation method (referenced only as a CSV export column). |
| `data[].botHistoryMode` | `string ('script'\|'widget'\|'manual')` | Bot2/Bot3 history trigger mode: script, widget click, manual click. |
| `data[].botAlias` | `string` | Bot script alias (shown when botHistoryMode=script). |
| `data[].botViaType` | `unknown` | Bot trigger-via type, passed to the display component. |
| `data.items` | `array of history records (multi-device form)` | Merged history records for all-devices queries (same fields as above). |
| `data.deviceLastKeys` | `object {deviceUUID: lastKey}` | Per-device next-page lastKey, fed back into list on the next request. |
| `data.hasMore` | `boolean` | Whether more records exist. |

::: info Note
Response shape depends on the request: single-device (list items use deviceUUID) returns a data array; all-devices (list items use deviceId) returns data{items, deviceLastKeys, hasMore}. The code does not show how the server distinguishes the two (list length or key name); confirm with the backend. Export keeps paging while the returned count equals pageSize.
:::

### getEnv {#biz3getdevicehistory-getenv}

Fetch the environment snapshot captured with a history record.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | Yes | Device UUID (from the record's device_id). |
| `timestamp` | `number` | Yes | The history record's timestamp. |

```json
{
  "action": "biz3GetDeviceHistory",
  "op": "getEnv",
  "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "timestamp": 1700000000000
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `data` | `array of single-key objects [{key: value}, ...] \| JSON string` | Environment snapshot: an array of single-key objects, each key a metric name and value a number/string/array; may also be a JSON string. Treated as {} (no data) when missing. |

::: info Note
The client does not check success; it base64-encodes data and passes it to the snapshot page. Concrete key names are not listed in code (translated via i18n envSnapshot.&lt;key>).
:::

### makeInvisible {#biz3getdevicehistory-makeinvisible}

Hide (remove from display) a history record.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | Yes | Device UUID (from the record's device_id). |
| `timestamp` | `number` | Yes | timestamp of the record to hide. |

```json
{
  "action": "biz3GetDeviceHistory",
  "op": "makeInvisible",
  "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "timestamp": 1700000000000
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | On success the client removes the record with that timestamp from the list. |

::: info Note
The history page disables interaction for guest keys (keyLevel=2). Soft-delete semantics are inferred from the name (makeInvisible).
:::

## biz3GetDeviceBatteryRecord {#biz3getdevicebatteryrecord}

Device battery voltage records: paged retrieval and hiding a record.

### batch-get {#biz3getdevicebatteryrecord-batch-get}

Fetch paged battery voltage/percentage records of a device for the battery chart.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | Yes | Device UUID. |
| `lastEvaluatedKey` | `any \| null` | No | Pagination cursor: pass back the previous response's data.lastEvaluatedKey unchanged; null for the first page. |
| `pageSize` | `number` | Yes | Page size: 50 in the app, 100 on the web. |

```json
{
  "action": "biz3GetDeviceBatteryRecord",
  "op": "batch-get",
  "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "lastEvaluatedKey": null,
  "pageSize": 100
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `data.records` | `array of objects` | Battery records (treated as empty when missing). |
| `data.records[].ts` | `number` | Record time, Unix seconds. |
| `data.records[].light` | `number` | Light-load voltage in mV (client divides by 1000 to show V). |
| `data.records[].heavy` | `number` | Heavy-load voltage in mV; -1 means not available. |
| `data.records[].lightPercentage` | `number` | Battery percentage corresponding to the light-load voltage. |
| `data.records[].heavyPercentage` | `number` | Battery percentage corresponding to the heavy-load voltage. |
| `data.lastEvaluatedKey` | `any \| null` | Next-page cursor; empty means no more data. |

::: info Note
Not called for WiFi-module models (the client shows fixed placeholder data). Each new page is prepended (older records).
:::

### makeInvisible {#biz3getdevicebatteryrecord-makeinvisible}

Hide a single battery record.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | Yes | Device UUID. |
| `timestamp_second` | `number` | Yes | ts of the record to hide (Unix seconds). |

```json
{
  "action": "biz3GetDeviceBatteryRecord",
  "op": "makeInvisible",
  "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "timestamp_second": 1700000000
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether it succeeded. |
| `data.timestamp_second` | `number` | Echoed timestamp of the hidden record; the client removes that point from the chart. |

::: info Note
Not called for WiFi-module models.
:::

## biz3GetDeviceEmployeeKeys {#biz3getdeviceemployeekeys}

Get all key holders (employees and guest keys) of a device.

### get {#biz3getdeviceemployeekeys-get}

Get the full list of the device's key holders (no limit).

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `companyID` | `string` | Yes | Company ID. |
| `deviceUUID` | `string` | Yes | Device UUID. |
| `limit` | `number (0) \| undefined` | No | 0 or omitted selects op=get (manage mode sends 0; other refreshes omit it). |

```json
{
  "action": "biz3GetDeviceEmployeeKeys",
  "op": "get",
  "companyID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "limit": 0
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `data` | `array of objects` | List of key holders. |
| `data[].subUUID` | `string` | Holder's subUUID (a guest key entry itself may lack it). |
| `data[].keyLevel` | `number` | 0=owner, 1=manager, 2=guest. |
| `data[].startAt` | `number` | Validity start for guest keys (keyLevel=2), Unix seconds. |
| `data[].endAt` | `number` | Validity end for guest keys, Unix seconds; if startAt/endAt are absent it is shown as always valid. |
| `data[].employeeName` | `string` | User name; for guest keys it may be a timestamp-like name (the client formats it as month/day). |
| `data[].employeeEmail` | `string` | User email (optional). |
| `data[].guestKeyId` | `string` | Guest key ID; non-empty means the entry is a guest key. |
| `data[].secretKey` | `string` | When equal to a guest key's guestKeyId, the user obtained access via that guest key (the client groups them under it). |
| `hasMore` | `boolean` | Top-level: whether more holders exist beyond those returned. |

::: info Note
The client picks op from limit: getLimited when limit>0, otherwise get.
:::

### getLimited {#biz3getdeviceemployeekeys-getlimited}

Get the first N key holders of a device (preview on the device detail page).

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `companyID` | `string` | Yes | Company ID. |
| `deviceUUID` | `string` | Yes | Device UUID. |
| `limit` | `number (>0)` | Yes | Maximum number to return; the client sends 5 outside manage mode. |

```json
{
  "action": "biz3GetDeviceEmployeeKeys",
  "op": "getLimited",
  "companyID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "deviceUUID": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  "limit": 5
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `data` | `array of objects` | Key holders; same fields as op=get. |
| `hasMore` | `boolean` | Top-level: true when more than limit exist; the client shows a "more" control. |
