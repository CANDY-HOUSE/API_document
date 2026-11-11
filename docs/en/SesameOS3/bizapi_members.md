---
title: Members and Permissions
---
# Members and Permissions

See [WebSocket API](./bizapi.md) for the connection, message format and common response fields.

**API index**

| action | Operations |
| --- | --- |
| [`biz3GetLoginUser`](#biz3getloginuser) | - |
| [`biz3ManageCompany`](#biz3managecompany) | [get](#biz3managecompany-get), [add](#biz3managecompany-add), [delete](#biz3managecompany-delete), [updateName](#biz3managecompany-updatename) |
| [`biz3ManageEmployee`](#biz3manageemployee) | [get](#biz3manageemployee-get), [add](#biz3manageemployee-add), [update](#biz3manageemployee-update), [delete](#biz3manageemployee-delete), [order](#biz3manageemployee-order), [currentInfo](#biz3manageemployee-currentinfo) |
| [`biz3ManageEmployeeGroup`](#biz3manageemployeegroup) | [getGroups](#biz3manageemployeegroup-getgroups), [add](#biz3manageemployeegroup-add), [update](#biz3manageemployeegroup-update), [deleteGroups](#biz3manageemployeegroup-deletegroups), [addBindUser](#biz3manageemployeegroup-addbinduser), [removeBindUser](#biz3manageemployeegroup-removebinduser), [getBindDeviceGroup](#biz3manageemployeegroup-getbinddevicegroup), [removeBindDeviceGroup](#biz3manageemployeegroup-removebinddevicegroup) |
| [`biz3ManageDeviceGroup`](#biz3managedevicegroup) | [getGroups](#biz3managedevicegroup-getgroups), [add](#biz3managedevicegroup-add), [update](#biz3managedevicegroup-update), [deleteGroups](#biz3managedevicegroup-deletegroups), [addBindDevice](#biz3managedevicegroup-addbinddevice), [removeBindDevice](#biz3managedevicegroup-removebinddevice), [getBindUserGroup](#biz3managedevicegroup-getbindusergroup), [removeBindUserGroup](#biz3managedevicegroup-removebindusergroup) |
| [`biz3ManageEmployeeDevice`](#biz3manageemployeedevice) | [add](#biz3manageemployeedevice-add), [del](#biz3manageemployeedevice-del), [get](#biz3manageemployeedevice-get), [group](#biz3manageemployeedevice-group), [updateGuestTag](#biz3manageemployeedevice-updateguesttag), [generateQRToken](#biz3manageemployeedevice-generateqrtoken), [redeemQRToken](#biz3manageemployeedevice-redeemqrtoken) |
| [`biz3ManageRole`](#biz3managerole) | [get](#biz3managerole-get), [post](#biz3managerole-post), [delete](#biz3managerole-delete) |
| [`biz3ManageAccessCtlAuthData`](#biz3manageaccessctlauthdata) | [getCards](#biz3manageaccessctlauthdata-getcards), [getPasscodes](#biz3manageaccessctlauthdata-getpasscodes), [getCardsByStpDevice](#biz3manageaccessctlauthdata-getcardsbystpdevice), [updateCardName](#biz3manageaccessctlauthdata-updatecardname), [updatePasscodeName](#biz3manageaccessctlauthdata-updatepasscodename), [updateCardOwner](#biz3manageaccessctlauthdata-updatecardowner), [postCards](#biz3manageaccessctlauthdata-postcards), [postPasscodes](#biz3manageaccessctlauthdata-postpasscodes), [delCards](#biz3manageaccessctlauthdata-delcards), [delPasscodes](#biz3manageaccessctlauthdata-delpasscodes), [clearCards](#biz3manageaccessctlauthdata-clearcards), [clearPasscodes](#biz3manageaccessctlauthdata-clearpasscodes) |

## biz3GetLoginUser {#biz3getloginuser}

Fetch the signed-in user's profile within a space (company) plus quotas.

### `biz3GetLoginUser` {#biz3getloginuser-request}

Load the current user's customerInfo (company ID, role, accessible pages, etc.) and quotas when entering or switching a space.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `email` | `string` | Yes | Named 'email', but callers pass either the login email, a space ID (companyID / spaceID from the URL / 'curLogin' from localStorage), or the fixed value 'ch_CandyhouseMobile' inside the app. |

```json
{
  "action": "biz3GetLoginUser",
  "email": "<companyID>"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `data.customerInfo` | `object` | The user's info in this space; fields read by the client are listed below. |
| `data.customerInfo.companyID` | `string` | Space (company) ID used by almost all later requests; also saved to localStorage 'curLogin'. |
| `data.customerInfo.subUUID` | `string` | Current user's UUID. |
| `data.customerInfo.name` | `string` | Space name. |
| `data.customerInfo.employeeEmail` | `string` | Current user's email. |
| `data.customerInfo.employeeName` | `string` | Current user's display name. |
| `data.customerInfo.mainEmail` | `string` | Main email (used to prevent adding yourself as a member). |
| `data.customerInfo.tag` | `string[]` | Role names; if tag[0] is 'オーナー' (owner) or 'マネージャー' (manager) the client grants access to all pages. |
| `data.customerInfo.access` | `string[]` | Accessible page names (e.g. 'ユーザー', 'デバイス（ドア・認証機器）', 'カード管理', '全体履歴', '開発者向け'). |
| `data.customerInfo.isSesameApp` | `boolean` | Whether this is a personal (Sesame App) space; if true the client adds the '開発者向け' page. |
| `data.customerInfo.isAnonymous` | `boolean` | Whether this is an anonymous/guest session (used in the app). |
| `data.customerInfo.isRootUser` | `boolean` | Whether the user is the root user (used on the home page). |
| `data.customerInfo.envId` | `string` | Environment ID (used as historyTag inside the app). |
| `data.customerInfo.isCS` | `boolean` | Whether this is a customer-support account (controls menu items). |
| `data.quotas` | `object` | Quotas; the client reads quotas.memberCount (member limit) and quotas.lockCount. |

::: info Note
This action has no 'op' field. After the response the client automatically sends biz3ManageCompany/get.
:::

## biz3ManageCompany {#biz3managecompany}

List, create, delete and rename spaces (companies).

### get {#biz3managecompany-get}

List all spaces the current user belongs to.

**Request**

No additional parameters.

```json
{
  "action": "biz3ManageCompany",
  "op": "get"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the operation succeeded. |
| `data` | `array<object>` | Space list (used only when success is true). |
| `data[].companyID` | `string` | Space ID. |
| `data[].name` | `string` | Space name. |
| `data[].isSesameApp` | `boolean` | Whether it is a personal (Sesame App) space; decides navigation to '/' or '/biz' on switch. |
| `data[].feeLevel` | `object` | Plan info; the client reads feeLevel.level, feeLevel.isRootUser and feeLevel.subscriptionId. |
| `data[].tag` | `string[]` | User's roles in that space (in personal-space mode used to check tag[0]==='オーナー'). |
| `data[].employeeEmail` | `string` | User's email in that space. |

::: info Note
Only sent outside the app. Whether tag/employeeEmail are always present cannot be confirmed from the code.
:::

### add {#biz3managecompany-add}

Create a new space (company).

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | `string` | Yes | New space name. |
| `employeeEmail` | `string` | Yes | Creator's email (from customerInfo.employeeEmail). |
| `subUUID` | `string` | Yes | Creator's user UUID (from customerInfo.subUUID). |

```json
{
  "action": "biz3ManageCompany",
  "op": "add",
  "name": "New Office",
  "employeeEmail": "user@example.com",
  "subUUID": "00000000-0000-4000-8000-000000000001"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the operation succeeded. |
| `data` | `object` | The created space, appended to the space list (same shape as get's data[]). |

### delete {#biz3managecompany-delete}

Delete the current space.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `companyID` | `string` | Yes | ID of the space to delete (priorityCompany.companyID). |

```json
{
  "action": "biz3ManageCompany",
  "op": "delete",
  "companyID": "<companyID>"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the operation succeeded. |
| `message` | `string` | Error message on failure (shown to the user as-is). |
| `data.deletedCompanyId` | `string` | ID of the deleted space; removed from the list. |
| `data.curCompanyID` | `string` | Space to switch to after deletion; the client stores it as curLogin and calls biz3GetLoginUser again. |

::: info Note
The UI only shows the delete button to the owner (tag[0]==='オーナー').
:::

### updateName {#biz3managecompany-updatename}

Rename a space.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `obj` | `object` | Yes | Rename parameters. |
| `obj.companyID` | `string` | Yes | Space ID (priorityCompany.companyID). |
| `obj.name` | `string` | Yes | New name. |

```json
{
  "action": "biz3ManageCompany",
  "op": "updateName",
  "obj": {
    "companyID": "<companyID>",
    "name": "Renamed Office"
  }
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the operation succeeded. |
| `data.companyID` | `string` | ID of the renamed space. |
| `data.name` | `string` | New name. |

::: info Note
Only editable by the owner in the UI.
:::

## biz3ManageEmployee {#biz3manageemployee}

Space members (contacts): list, add, update, delete, reorder, and current-user info.

### get {#biz3manageemployee-get}

Request the member list; members arrive in paged server-pushed 'pubEmployees' messages.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `companyID` | `string` | Yes | Space ID. |

```json
{
  "action": "biz3ManageEmployee",
  "op": "get",
  "companyID": "<companyID>"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `(op 'get' reply)` | `-` | The client reads nothing from the direct 'get' reply. |
| `pubEmployees: data.totalCount` | `number` | Total member count in the pushed message (op='pubEmployees'). |
| `pubEmployees: data.data.page` | `number` | Page number; page 1 replaces the list, later pages are appended. |
| `pubEmployees: data.data.list` | `array<object>` | Member object: subUUID, employeeName, employeeEmail, tag (role names), department, phone, etc. |

::: info Note
Paged push; the client filters out members deleted within the last 10 seconds.
:::

### add {#biz3manageemployee-add}

Add members to the space: by email/name (CSV bulk supported) or via a friend QR code.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `items` | `array<object>` | Yes | Members to add. |
| `items[].companyID` | `string` | Yes | Space ID. |
| `items[].employeeEmail` | `string` | No | Member email (required for email-based add; must differ from the owner's email). |
| `items[].employeeName` | `string` | No | Member name (required for email-based add). |
| `items[].tag` | `string[]` | No | Role names to assign (chosen from the role list on CSV import; 'ゲスト' excluded). |
| `items[].phone` | `string` | No | Phone (optional). |
| `items[].department` | `string` | No | Department (optional). |
| `items[].friendID` | `string` | No | Friend's user UUID (lowercase); used when adding via QR code or from the app, without email/name. |

```json
{
  "action": "biz3ManageEmployee",
  "op": "add",
  "items": [
    {
      "companyID": "<companyID>",
      "employeeEmail": "member@example.com",
      "employeeName": "Taro",
      "tag": [],
      "phone": "000-0000-0000",
      "department": "Sales"
    }
  ]
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the operation succeeded. |
| `message` | `string` | Error message on failure (shown to the user as-is). |

::: info Note
message 'Limit Exceeded' means the member limit was reached; 'ユーザーは存在しません' (user not found) and the 'must include email and user name' message are localized. On success the client re-sends get.
:::

### update {#biz3manageemployee-update}

Update a member's profile (name/department/phone), or change the current user's own nickname.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `obj` | `object` | Yes | Update payload; contains companyID plus one of the two forms below. |
| `obj.companyID` | `string` | Yes | Space ID. |
| `obj.subUUID` | `string` | No | Form 1: target member UUID, sent with exactly one field to change. |
| `obj.employeeName` | `string` | No | Form 1: new name. |
| `obj.department` | `string` | No | Form 1: new department. |
| `obj.phone` | `string` | No | Form 1: new phone. |
| `obj.Name` | `string` | No | Form 2 (own nickname): always 'name'. |
| `obj.Value` | `string` | No | Form 2: new nickname. |

```json
{
  "action": "biz3ManageEmployee",
  "op": "update",
  "obj": {
    "companyID": "<companyID>",
    "subUUID": "00000000-0000-4000-8000-000000000002",
    "department": "Sales"
  }
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the operation succeeded. |

::: info Note
On success the client re-sends get.
:::

### delete {#biz3manageemployee-delete}

Remove members from the space.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `items` | `array<object>` | Yes | Members to delete (full member objects from the list, or at least {subUUID, companyID}). |
| `items[].subUUID` | `string` | Yes | Member UUID. |
| `items[].companyID` | `string` | No | Space ID (passed explicitly in personal-space mode). |

```json
{
  "action": "biz3ManageEmployee",
  "op": "delete",
  "items": [
    {
      "subUUID": "00000000-0000-4000-8000-000000000002",
      "companyID": "<companyID>"
    }
  ]
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the operation succeeded. |
| `message` | `string` | Error message on failure (shown to the user as-is). |

::: info Note
The list UI does not allow selecting members whose tag[0] is 'オーナー', nor deleting yourself.
:::

### order {#biz3manageemployee-order}

Persist the drag-and-drop order of the contact list.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `items` | `array<object>` | Yes | All contacts in the new order. |
| `items[].friendUUID` | `string` | Yes | The contact's subUUID. |
| `items[].rank` | `number` | Yes | Rank = -index (0, -1, -2 ...); higher sorts first. |

```json
{
  "action": "biz3ManageEmployee",
  "op": "order",
  "items": [
    {
      "friendUUID": "00000000-0000-4000-8000-000000000001",
      "rank": 0
    },
    {
      "friendUUID": "00000000-0000-4000-8000-000000000002",
      "rank": -1
    }
  ]
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the operation succeeded. |

::: info Note
On failure the client re-sends get.
:::

### currentInfo {#biz3manageemployee-currentinfo}

Get the signed-in user's own profile (nickname, email, recent logins).

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `excludeLogins` | `boolean` | No | When true, recent-login records are not needed (only sent when true). |

```json
{
  "action": "biz3ManageEmployee",
  "op": "currentInfo",
  "excludeLogins": true
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the operation succeeded. |
| `data.name` | `string` | Nickname. |
| `data.email` | `string` | Email. |
| `data.sub` | `string` | User ID (shown on the profile page). |
| `data.recentLogins` | `string[]` | Recent logins; each entry is a JSON string that parses to an array of single-key objects, from which the client reads 'model' and 'collectedAt'. |

::: info Note
The request carries no companyID.
:::

## biz3ManageEmployeeGroup {#biz3manageemployeegroup}

Manage user groups and their bindings to device groups (group keys).

### getGroups {#biz3manageemployeegroup-getgroups}

List all user groups in the space.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `cid` | `string` | Yes | Space ID. |

```json
{
  "action": "biz3ManageEmployeeGroup",
  "op": "getGroups",
  "cid": "<companyID>"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `data` | `array<object>` | User group list. |
| `data[].gid` | `string` | User group ID. |
| `data[].name` | `string` | Group name. |
| `data[].uuids` | `string[]` | subUUIDs of the group's members. |
| `data[].deviceGroups` | `string[]` | gids of the bound device groups. |

### add {#biz3manageemployeegroup-add}

Create a user group.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `obj` | `object` | Yes | New group parameters. |
| `obj.cid` | `string` | Yes | Space ID. |
| `obj.name` | `string` | Yes | Group name. |
| `obj.uuids` | `string[]` | Yes | subUUIDs of the initial members. |

```json
{
  "action": "biz3ManageEmployeeGroup",
  "op": "add",
  "obj": {
    "cid": "<companyID>",
    "name": "Team A",
    "uuids": [
      "00000000-0000-4000-8000-000000000001",
      "00000000-0000-4000-8000-000000000002"
    ]
  }
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `data` | `object` | The created group, appended to the group list (same shape as getGroups data[]). |

### update {#biz3manageemployeegroup-update}

Rename a user group.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `obj` | `object` | Yes | Update parameters. |
| `obj.cid` | `string` | Yes | Space ID. |
| `obj.gid` | `string` | Yes | User group ID. |
| `obj.name` | `string` | Yes | New group name. |

```json
{
  "action": "biz3ManageEmployeeGroup",
  "op": "update",
  "obj": {
    "cid": "<companyID>",
    "gid": "<gid>",
    "name": "Team B"
  }
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the operation succeeded. |

### deleteGroups {#biz3manageemployeegroup-deletegroups}

Delete user groups in bulk.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `cid` | `string` | Yes | Space ID. |
| `objs` | `string[]` | Yes | gids of the groups to delete (plain string array). |

```json
{
  "action": "biz3ManageEmployeeGroup",
  "op": "deleteGroups",
  "cid": "<companyID>",
  "objs": [
    "<gid>"
  ]
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `(none)` | `-` | No fields read; the client re-sends getGroups. |

::: info Note
Note: unlike biz3ManageDeviceGroup/deleteGroups, objs here is a string array and cid is top-level.
:::

### addBindUser {#biz3manageemployeegroup-addbinduser}

Add members to a user group.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `cid` | `string` | Yes | Space ID. |
| `gid` | `string` | Yes | User group ID. |
| `uuids` | `string[]` | Yes | subUUIDs of the group's current members (before the addition). |
| `items` | `array<object>` | Yes | Members to add (full member objects from the member list, including subUUID). |

```json
{
  "action": "biz3ManageEmployeeGroup",
  "op": "addBindUser",
  "cid": "<companyID>",
  "gid": "<gid>",
  "uuids": [
    "00000000-0000-4000-8000-000000000001"
  ],
  "items": [
    {
      "subUUID": "00000000-0000-4000-8000-000000000002",
      "employeeName": "Taro",
      "employeeEmail": "member@example.com"
    }
  ]
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the operation succeeded. |

::: info Note
On success the client re-sends getGroups. How the server uses 'uuids' is not visible in the client code.
:::

### removeBindUser {#biz3manageemployeegroup-removebinduser}

Remove members from a user group.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `cid` | `string` | Yes | Space ID. |
| `gid` | `string` | Yes | User group ID. |
| `uuids` | `string[]` | Yes | subUUIDs of the group's current members (before removal). |
| `items` | `array<{subUUID: string}>` | Yes | Members to remove, subUUID only. |

```json
{
  "action": "biz3ManageEmployeeGroup",
  "op": "removeBindUser",
  "cid": "<companyID>",
  "gid": "<gid>",
  "uuids": [
    "00000000-0000-4000-8000-000000000001",
    "00000000-0000-4000-8000-000000000002"
  ],
  "items": [
    {
      "subUUID": "00000000-0000-4000-8000-000000000002"
    }
  ]
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the operation succeeded. |

::: info Note
On success the client re-sends getGroups.
:::

### getBindDeviceGroup {#biz3manageemployeegroup-getbinddevicegroup}

Get the device-group keys (group keys) granted to a user group.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `gid` | `string` | Yes | User group ID. |

```json
{
  "action": "biz3ManageEmployeeGroup",
  "op": "getBindDeviceGroup",
  "gid": "<gid>"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `data` | `array<object>` | Binding records. |
| `data[].mid` | `string` | User (member) group ID. |
| `data[].did` | `string` | Device group ID. |
| `data[].keyLevel` | `number\|string` | Key level: 0=owner, 1=manager, 2=guest. |
| `data[].startTime` | `number` | Validity start (Unix seconds); empty means always available. |
| `data[].endTime` | `number` | Validity end (Unix seconds). |

::: info Note
The request carries no cid.
:::

### removeBindDeviceGroup {#biz3manageemployeegroup-removebinddevicegroup}

Revoke a group key between a user group and a device group.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `cid` | `string` | Yes | Space ID. |
| `mid` | `string` | Yes | User group ID. |
| `did` | `string` | Yes | Device group ID. |
| `keyLevel` | `number\|string` | Yes | Key level of the binding (from getBindDeviceGroup). |

```json
{
  "action": "biz3ManageEmployeeGroup",
  "op": "removeBindDeviceGroup",
  "cid": "<companyID>",
  "mid": "<gid>",
  "did": "<deviceGroupGid>",
  "keyLevel": 1
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the operation succeeded. |

## biz3ManageDeviceGroup {#biz3managedevicegroup}

Manage device (door) groups and their bindings to user groups (group keys).

### getGroups {#biz3managedevicegroup-getgroups}

List all device groups in the space.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `cid` | `string` | Yes | Space ID. |

```json
{
  "action": "biz3ManageDeviceGroup",
  "op": "getGroups",
  "cid": "<companyID>"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `data` | `array<object>` | Device group list. |
| `data[].gid` | `string` | Device group ID. |
| `data[].name` | `string` | Group name. |
| `data[].uuids` | `string[]` | deviceUUIDs in the group. |
| `data[].employeeGroups` | `string[]` | gids of bound user groups. |

### add {#biz3managedevicegroup-add}

Create a device group.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `obj` | `object` | Yes | New group parameters. |
| `obj.name` | `string` | Yes | Group name. |
| `obj.cid` | `string` | Yes | Space ID. |
| `obj.uuids` | `string[]` | Yes | deviceUUIDs of the initial devices. |

```json
{
  "action": "biz3ManageDeviceGroup",
  "op": "add",
  "obj": {
    "name": "1F Doors",
    "cid": "<companyID>",
    "uuids": [
      "11111111-1111-4111-8111-111111111111",
      "11111111-1111-4111-8111-111111111112"
    ]
  }
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `(none)` | `-` | No fields read; the client re-sends getGroups. |

### update {#biz3managedevicegroup-update}

Rename a device group.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `obj` | `object` | Yes | Update parameters. |
| `obj.cid` | `string` | Yes | Space ID. |
| `obj.gid` | `string` | Yes | Device group ID. |
| `obj.name` | `string` | Yes | New group name. |

```json
{
  "action": "biz3ManageDeviceGroup",
  "op": "update",
  "obj": {
    "cid": "<companyID>",
    "gid": "<deviceGroupGid>",
    "name": "2F Doors"
  }
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the operation succeeded. |

### deleteGroups {#biz3managedevicegroup-deletegroups}

Delete device groups in bulk.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `objs` | `array<{gid: string, cid: string}>` | Yes | Groups to delete; each has gid and cid (space ID). |

```json
{
  "action": "biz3ManageDeviceGroup",
  "op": "deleteGroups",
  "objs": [
    {
      "gid": "<deviceGroupGid>",
      "cid": "<companyID>"
    }
  ]
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `(none)` | `-` | No fields read; the client re-sends getGroups. |

::: info Note
Note: unlike the user-group deleteGroups, objs here are objects and cid is inside each object.
:::

### addBindDevice {#biz3managedevicegroup-addbinddevice}

Add devices to a device group.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `cid` | `string` | Yes | Space ID. |
| `gid` | `string` | Yes | Device group ID. |
| `uuids` | `string[]` | Yes | deviceUUIDs currently in the group (before the addition). |
| `items` | `array<object>` | Yes | Devices to add (full device objects from the device list, e.g. deviceUUID, deviceName, deviceModel, secretKey, keyLevel, stateInfo). |

```json
{
  "action": "biz3ManageDeviceGroup",
  "op": "addBindDevice",
  "cid": "<companyID>",
  "gid": "<deviceGroupGid>",
  "uuids": [
    "11111111-1111-4111-8111-111111111111"
  ],
  "items": [
    {
      "deviceUUID": "11111111-1111-4111-8111-111111111112",
      "deviceName": "Front door",
      "deviceModel": "<deviceModel>",
      "secretKey": "<secretKeyHex>",
      "keyLevel": 0
    }
  ]
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `(none)` | `-` | No fields read; the callback re-sends getGroups. |

::: info Note
Device-object fields in items come from biz3ManageDevice and are outside this document's scope.
:::

### removeBindDevice {#biz3managedevicegroup-removebinddevice}

Remove devices from a device group.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `cid` | `string` | Yes | Space ID. |
| `gid` | `string` | Yes | Device group ID. |
| `uuids` | `string[]` | Yes | deviceUUIDs currently in the group (before removal). |
| `items` | `array<{deviceUUID: string, secretKey: string}>` | Yes | Devices to remove, with only deviceUUID and secretKey. |

```json
{
  "action": "biz3ManageDeviceGroup",
  "op": "removeBindDevice",
  "cid": "<companyID>",
  "gid": "<deviceGroupGid>",
  "uuids": [
    "11111111-1111-4111-8111-111111111111",
    "11111111-1111-4111-8111-111111111112"
  ],
  "items": [
    {
      "deviceUUID": "11111111-1111-4111-8111-111111111112",
      "secretKey": "<secretKeyHex>"
    }
  ]
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `(none)` | `-` | No fields read; the callback re-sends getGroups. |

### getBindUserGroup {#biz3managedevicegroup-getbindusergroup}

Get the user groups that hold group keys for a device group.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `gid` | `string` | Yes | Device group ID. |

```json
{
  "action": "biz3ManageDeviceGroup",
  "op": "getBindUserGroup",
  "gid": "<deviceGroupGid>"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `data` | `array<object>` | Binding records. |
| `data[].mid` | `string` | User group ID. |
| `data[].keyLevel` | `number\|string` | Key level: 0=owner, 1=manager, 2=guest. |
| `data[].startTime` | `number` | Validity start (Unix seconds); empty means always available. |
| `data[].endTime` | `number` | Validity end (Unix seconds). |

::: info Note
The request carries no cid.
:::

### removeBindUserGroup {#biz3managedevicegroup-removebindusergroup}

Revoke a group key between a device group and a user group.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `cid` | `string` | Yes | Space ID. |
| `mid` | `string` | Yes | User group ID. |
| `did` | `string` | Yes | Device group ID. |
| `keyLevel` | `number\|string` | Yes | Key level of the binding (from getBindUserGroup). |

```json
{
  "action": "biz3ManageDeviceGroup",
  "op": "removeBindUserGroup",
  "cid": "<companyID>",
  "mid": "<gid>",
  "did": "<deviceGroupGid>",
  "keyLevel": 1
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `(none)` | `-` | No fields read; the callback re-fetches the bindings. |

## biz3ManageEmployeeDevice {#biz3manageemployeedevice}

Member device keys: share, revoke, list, share by group, guest-key labels and share QR codes.

### add {#biz3manageemployeedevice-add}

Share device keys with one or more members (one item per member x device pair).

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `items` | `array<object>` | Yes | Keys to share; one item per member × device pair. |
| `items[].subUUID` | `string` | Yes | UUID of the member receiving the key. |
| `items[].deviceUUID` | `string` | Yes | Device UUID. |
| `items[].keyLevel` | `number` | Yes | Key level: 0=owner, 1=manager, 2=guest. |
| `items[].deviceModel` | `string` | No | Device model (from the device list). |
| `items[].deviceName` | `string` | No | Device name (from the device list). |
| `items[].keyIndex` | `string` | No | Key index (from the device list). |
| `items[].secretKey` | `string` | No | Device secret key (from the device list). For keyLevel=2 the server generates a new guest key ID instead. |
| `items[].sesame2PublicKey` | `string` | No | Device public key (from the device list). |
| `items[].startTime` | `number` | No | Guest key start time (Unix seconds); used only when keyLevel=2. Omit for no limit. |
| `items[].endTime` | `number` | No | Guest key end time (Unix seconds); used only when keyLevel=2. Omit for no limit. |
| `items[].keyName` | `string` | No | Guest key name; used only when keyLevel=2. Defaults to the current timestamp. |
| `items[].historyTag` | `string` | No | History tag for the guest key; used only when keyLevel=2. |

```json
{
  "action": "biz3ManageEmployeeDevice",
  "op": "add",
  "items": [
    {
      "subUUID": "00000000-0000-4000-8000-000000000002",
      "deviceUUID": "11111111-1111-4111-8111-111111111111",
      "keyLevel": 2,
      "deviceModel": "sesame_5",
      "deviceName": "Front door",
      "keyIndex": "<keyIndex>",
      "secretKey": "<secretKey>",
      "sesame2PublicKey": "<sesame2PublicKey>",
      "startTime": 1700000000,
      "endTime": 1700086400
    }
  ]
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the operation succeeded. |

::: info Note
The UI only offers keyLevel=0 when the current user holds an owner key; devices held with a guest key cannot be shared. The order in the member's device list is assigned by the server; no ordering field is needed.
:::

### del {#biz3manageemployeedevice-del}

Revoke a member's device key, or delete a guest key.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | Yes | Device UUID. |
| `subUUID` | `string` | No | Form 1: UUID of the member whose key is revoked. |
| `guestKeyId` | `string` | No | Form 2: guest key ID (used when the user entry has a guestKeyId). |
| `randomTag` | `string` | No | Required with form 2: first 8 hex chars of AES-CMAC(device secretKey, bytes 1..3 of the little-endian 4-byte current Unix time). |

```json
{
  "action": "biz3ManageEmployeeDevice",
  "op": "del",
  "subUUID": "00000000-0000-4000-8000-000000000002",
  "deviceUUID": "11111111-1111-4111-8111-111111111111"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the operation succeeded. |

### get {#biz3manageemployeedevice-get}

List all device keys held by a member.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `subUUID` | `string` | Yes | Member UUID. |

```json
{
  "action": "biz3ManageEmployeeDevice",
  "op": "get",
  "subUUID": "00000000-0000-4000-8000-000000000002"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the operation succeeded. |
| `data` | `array<object>` | Key list. |
| `data[].deviceUUID` | `string` | Device UUID. |
| `data[].subUUID` | `string` | Holder UUID. |
| `data[].keyLevel` | `number\|string` | Key level: 0=owner, 1=manager, 2=guest. |
| `data[].startAt` | `number` | Validity start (Unix seconds); temporary key when both startAt and endAt are set. |
| `data[].endAt` | `number` | Validity end (Unix seconds). |

### group {#biz3manageemployeedevice-group}

Share the keys of one or more device groups with a user group (group key).

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `companyID` | `string` | Yes | Space ID. |
| `keyLevel` | `string` | Yes | Key level as a string: '0'=owner, '1'=manager, '2'=guest. |
| `members` | `string[]` | Yes | subUUIDs of the user group's members. |
| `devices` | `string[]` | Yes | Deduplicated deviceUUIDs of all devices in the selected device groups. |
| `mid` | `string` | Yes | User group gid. |
| `dids` | `string[]` | Yes | gids of the selected device groups. |
| `startTime` | `number\|string` | No | Only when keyLevel='2': temporary-use start (Unix seconds), empty string for always-available. |
| `endTime` | `number\|string` | No | Only when keyLevel='2': temporary-use end (Unix seconds), empty string for always-available. |

```json
{
  "action": "biz3ManageEmployeeDevice",
  "op": "group",
  "companyID": "<companyID>",
  "keyLevel": "2",
  "members": [
    "00000000-0000-4000-8000-000000000001",
    "00000000-0000-4000-8000-000000000002"
  ],
  "devices": [
    "11111111-1111-4111-8111-111111111111",
    "11111111-1111-4111-8111-111111111112"
  ],
  "mid": "<gid>",
  "dids": [
    "<deviceGroupGid>"
  ],
  "startTime": "",
  "endTime": ""
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `(none)` | `-` | No fields read; the callback only ends the loading state. |

### updateGuestTag {#biz3manageemployeedevice-updateguesttag}

Rename (relabel) a guest key.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | Yes | Device UUID. |
| `guestKeyId` | `string` | Yes | Guest key ID. |
| `keyName` | `string` | Yes | New name. |

```json
{
  "action": "biz3ManageEmployeeDevice",
  "op": "updateGuestTag",
  "deviceUUID": "11111111-1111-4111-8111-111111111111",
  "guestKeyId": "<guestKeyId>",
  "keyName": "Visitor"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the operation succeeded. |

### generateQRToken {#biz3manageemployeedevice-generateqrtoken}

Generate a QR-code token for sharing a device key.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | Yes | Device UUID. |
| `keyLevel` | `number` | Yes | Key level: 0=owner, 1=manager, 2=guest. The UI only allows levels >= the user's own. |
| `guestKeyId` | `string` | No | Guest key ID when sharing an existing guest key. |
| `name` | `string` | No | Key name when sharing an existing guest key. |
| `isSecure` | `boolean` | No | Sent as false only when secure mode is turned off; omitted means secure. |

```json
{
  "action": "biz3ManageEmployeeDevice",
  "op": "generateQRToken",
  "deviceUUID": "11111111-1111-4111-8111-111111111111",
  "keyLevel": 2
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the operation succeeded. |
| `data.qrToken` | `string` | QR content (a URL) rendered directly as a QR code. |

### redeemQRToken {#biz3manageemployeedevice-redeemqrtoken}

Redeem a scanned QR-code URL on the server for the actual device-key content.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `qrToken` | `string` | Yes | The QR-code URL that was scanned. |

```json
{
  "action": "biz3ManageEmployeeDevice",
  "op": "redeemQRToken",
  "qrToken": "https://example.com/qr?t=..."
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the operation succeeded. |
| `message` | `string` | Error message on failure (shown to the user as-is). |
| `data` | `string` | Redeemed URL whose 'sk' parameter is base64 device-key data (first byte = product type, followed by secretKey, public key, keyIndex, etc.). |

::: info Note
An app-side code comment states the server now binds the device during redemption; the client only parses the model for navigation.
:::

## biz3ManageRole {#biz3managerole}

Manage space roles and the pages each role may access.

### get {#biz3managerole-get}

List all roles in the space.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `companyID` | `string` | Yes | Space ID. |

```json
{
  "action": "biz3ManageRole",
  "op": "get",
  "companyID": "<companyID>"
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the operation succeeded. |
| `message` | `string` | Error message on failure (shown to the user as-is). |
| `data` | `array<object>` | Role list. |
| `data[].tag` | `string` | Role name; built-in roles are 'オーナー', 'マネージャー', 'ゲスト'. |
| `data[].access` | `string[]` | Accessible page names. |
| `data[].companyID` | `string` | Space ID. |

::: info Note
Built-in roles are not editable in the UI: owner and manager always get all pages, guest shows as '権限なし'.
:::

### post {#biz3managerole-post}

Create a role or overwrite an existing role's accessible pages.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `companyID` | `string` | Yes | Space ID. |
| `tag` | `string` | Yes | Role name. |
| `access` | `string[]` | Yes | Accessible page names, from: 'ユーザー', 'デバイス（ドア・認証機器）', 'カード管理', '全体履歴', '開発者向け'. |

```json
{
  "action": "biz3ManageRole",
  "op": "post",
  "companyID": "<companyID>",
  "tag": "Staff",
  "access": [
    "ユーザー",
    "カード管理"
  ]
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the operation succeeded. |
| `message` | `string` | Error message on failure (shown to the user as-is). |

::: info Note
When editing an existing role the client sends the whole role object (tag, access, companyID) as an overwrite. On success it re-sends get.
:::

### delete {#biz3managerole-delete}

Delete a role.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `companyID` | `string` | Yes | Space ID. |
| `tag` | `string` | Yes | Role name to delete. |
| `access` | `string[]` | No | The rest of the role object is sent too (access, plus the client-internal isShowAdd: true). |

```json
{
  "action": "biz3ManageRole",
  "op": "delete",
  "companyID": "<companyID>",
  "tag": "Staff",
  "access": [
    "ユーザー"
  ]
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the operation succeeded. |
| `message` | `string` | Error message on failure (shown to the user as-is). |

::: info Note
Built-in roles cannot be deleted in the UI. On success the client re-sends get.
:::

## biz3ManageAccessCtlAuthData {#biz3manageaccessctlauthdata}

Server-side data for NFC cards and passcodes on access-control devices (e.g. Sesame Touch).

### getCards {#biz3manageaccessctlauthdata-getcards}

Request the NFC cards currently linked to one or more auth devices; data arrives per device in paged 'pubCardLinkedIDs' pushes.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `obj` | `object` | Yes | Query parameters. |
| `obj.devices` | `string` | Yes | Comma-separated auth-device deviceUUIDs. |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "getCards",
  "obj": {
    "devices": "11111111-1111-4111-8111-111111111111,11111111-1111-4111-8111-111111111112"
  }
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `(op 'getCards' reply)` | `-` | The direct reply only marks loading as done; no fields read. |
| `pubCardLinkedIDs: data.deviceUUID` | `string` | Auth-device UUID of the push (op='pubCardLinkedIDs'). |
| `pubCardLinkedIDs: data.page` | `number` | Page number; 1 replaces that device's list, others append. |
| `pubCardLinkedIDs: data.list` | `array<object>` | Card records; the client reads cardID, name, nameUUID, cardType, deviceID (auth-device UUID), subUUID (owning member). |

::: info Note
op comes from the constant AuthDataOpType.getCards = 'getCards'. The data comes from a table that clearCards/delCards wipe, so it reflects only the device's current cards.
:::

### getPasscodes {#biz3manageaccessctlauthdata-getpasscodes}

Request the passcodes currently linked to auth devices; data arrives per device in paged 'pubPasscodeLinkedIDs' pushes.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `obj` | `object` | Yes | Query parameters. |
| `obj.devices` | `string` | Yes | Comma-separated auth-device deviceUUIDs. |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "getPasscodes",
  "obj": {
    "devices": "11111111-1111-4111-8111-111111111111"
  }
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `(op 'getPasscodes' reply)` | `-` | The direct reply only marks loading as done. |
| `pubPasscodeLinkedIDs: data.deviceUUID` | `string` | Auth-device UUID of the push. |
| `pubPasscodeLinkedIDs: data.page` | `number` | Page number; 1 replaces, others append. |
| `pubPasscodeLinkedIDs: data.list` | `array<object>` | Passcode records; the client reads passwordID, name, nameUUID, passwordType, deviceID (auth-device UUID). |

::: info Note
op comes from the constant AuthDataOpType.getPasscodes = 'getPasscodes'.
:::

### getCardsByStpDevice {#biz3manageaccessctlauthdata-getcardsbystpdevice}

Page through every card ever registered on an auth device (including deleted history), used for export.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `obj` | `object` | Yes | Query parameters. |
| `obj.stpDeviceUUID` | `string` | Yes | Auth-device UUID. |
| `obj.lastKey` | `string\|null` | No | Paging cursor; null for the first page, then the previous response's lastKey. |
| `obj.pageSize` | `number` | No | Page size, default 500. |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "getCardsByStpDevice",
  "obj": {
    "stpDeviceUUID": "11111111-1111-4111-8111-111111111111",
    "lastKey": null,
    "pageSize": 500
  }
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the operation succeeded. |
| `message` | `string` | Error message on failure (shown to the user as-is). |
| `data.list` | `array<object>` | Card records; the export reads cardID, cardNameUUID, name and timestamp. |
| `data.lastKey` | `string\|null` | Opaque cursor; empty means no more pages. |
| `data.total` | `number` | Total (documented in a code comment; not read by the client). |

::: info Note
op comes from AuthDataOpType.getCardsByStpDevice. Data comes from an append-only history table, deduplicated by cardID on the server; the client pages at most 100 times with a 30 s timeout per page.
:::

### updateCardName {#biz3manageaccessctlauthdata-updatecardname}

Register or update a card's name (also used to save a newly read card to the server).

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `obj` | `object` | Yes | Card parameters. |
| `obj.cardID` | `string` | Yes | Card ID (hex string). |
| `obj.name` | `string` | Yes | Card name. |
| `obj.cardNameUUID` | `string` | Yes | Card name UUID (UUID v4). |
| `obj.timestamp` | `number` | Yes | Client timestamp (milliseconds). |
| `obj.cardType` | `string` | Yes | Card type (may be an empty string). |
| `obj.stpDeviceUUID` | `string` | Yes | Auth-device UUID. |
| `obj.ownerSubUUID` | `string` | No | Owning member UUID (included in the new-card flow). |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "updateCardName",
  "obj": {
    "cardID": "0123456789ABCDEF",
    "name": "Card 1",
    "cardNameUUID": "00000000-0000-4000-8000-000000000001",
    "timestamp": 1700000000000,
    "cardType": "02",
    "stpDeviceUUID": "11111111-1111-4111-8111-111111111111"
  }
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the operation succeeded. |
| `reqContext` | `object` | Echo of the request obj; the client uses reqContext.stpDeviceUUID, cardID, name and cardNameUUID to update its local list. |

::: info Note
If the existing nameUUID is not a UUID v4, the client first sends an IoT command to the auth device (topic 'stp&lt;deviceUUID>cmd') to write a new UUID, and sends this request only after the device confirms (15 s timeout).
:::

### updatePasscodeName {#biz3manageaccessctlauthdata-updatepasscodename}

Register or update a passcode's name.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `obj` | `object` | Yes | Passcode parameters. |
| `obj.keyBoardPassCode` | `string` | Yes | Passcode ID (each digit encoded as two hex chars, e.g. 123 -> '010203'). |
| `obj.name` | `string` | Yes | Passcode name. |
| `obj.keyBoardPassCodeNameUUID` | `string` | Yes | Passcode name UUID (UUID v4). |
| `obj.timestamp` | `number` | Yes | Client timestamp (milliseconds). |
| `obj.type` | `string` | Yes | Passcode type (may be empty). |
| `obj.stpDeviceUUID` | `string` | Yes | Auth-device UUID. |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "updatePasscodeName",
  "obj": {
    "keyBoardPassCode": "010203040506",
    "name": "Front desk",
    "keyBoardPassCodeNameUUID": "00000000-0000-4000-8000-000000000001",
    "timestamp": 1700000000000,
    "type": "",
    "stpDeviceUUID": "11111111-1111-4111-8111-111111111111"
  }
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the operation succeeded. |
| `reqContext` | `object` | Echo of the request obj; the client uses reqContext.stpDeviceUUID, keyBoardPassCode, name and keyBoardPassCodeNameUUID to update its list. |

::: info Note
If the existing nameUUID is not a UUID v4, the client first sends an IoT command to the auth device (topic 'stp&lt;deviceUUID>cmd') to write a new UUID, and sends this request only after the device confirms (15 s timeout).
:::

### updateCardOwner {#biz3manageaccessctlauthdata-updatecardowner}

Set or clear the member who owns a card.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `obj` | `object` | Yes | Parameters (the new-card flow sends the same full object as updateCardName). |
| `obj.cardID` | `string` | Yes | Card ID. |
| `obj.ownerSubUUID` | `string` | Yes | Owning member UUID; empty string clears it. The key must be present or the client sends nothing. |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "updateCardOwner",
  "obj": {
    "cardID": "0123456789ABCDEF",
    "ownerSubUUID": "00000000-0000-4000-8000-000000000002"
  }
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `reqContext.cardID` | `string` | Echoed card ID. |
| `reqContext.ownerSubUUID` | `string` | Echoed owner UUID; the client updates the card's subUUID on every device. |

### postCards {#biz3manageaccessctlauthdata-postcards}

After a bulk (CSV) card import, save the list of cards written to the device to the server.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | Yes | Auth-device UUID. |
| `list` | `array<object>` | Yes | Card list (must not be empty). |
| `list[].cardID` | `string` | Yes | Card ID (hex). |
| `list[].name` | `string` | Yes | Card name (CSV 'カード名'/name column). |
| `list[].nameUUID` | `string` | Yes | Name UUID freshly generated by the client (lowercase, hyphenated). |
| `list[].cardType` | `string` | Yes | Card type, default '02'. |
| `list[].memberID` | `string` | No | Member subUUID matched from the CSV 'ユーザー' column. |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "postCards",
  "deviceUUID": "11111111-1111-4111-8111-111111111111",
  "list": [
    {
      "cardID": "0123456789ABCDEF",
      "name": "Card 1",
      "nameUUID": "00000000-0000-4000-8000-000000000001",
      "cardType": "02"
    }
  ]
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `(none)` | `-` | Triggers the callback; the client only logs it. |

::: info Note
The client first writes the cards to the device via IoT and sends this request only after that succeeds.
:::

### postPasscodes {#biz3manageaccessctlauthdata-postpasscodes}

After a bulk (CSV) passcode import, save the passcodes written to the device to the server.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `deviceUUID` | `string` | Yes | Auth-device UUID. |
| `list` | `array<object>` | Yes | Passcode list (must not be empty). |
| `list[].passwordID` | `string` | Yes | Passcode ID (each digit as two hex chars, uppercase). |
| `list[].name` | `string` | Yes | Passcode name (CSV '暗証番号名' column). |
| `list[].nameUUID` | `string` | Yes | Name UUID freshly generated by the client (lowercase, hyphenated). |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "postPasscodes",
  "deviceUUID": "11111111-1111-4111-8111-111111111111",
  "list": [
    {
      "passwordID": "010203040506",
      "name": "Front desk",
      "nameUUID": "00000000-0000-4000-8000-000000000001"
    }
  ]
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `(none)` | `-` | Triggers the callback; the client only logs it. |

::: info Note
The client first writes the passcodes to the device via IoT and sends this request only after that.
:::

### delCards {#biz3manageaccessctlauthdata-delcards}

After the device confirms card deletion, delete the card links on the server.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `items` | `array<{deviceID: string, cardID: string}>` | Yes | Cards to delete; deviceID is the auth-device UUID (cut from the IoT topic 'stp&lt;uuid>cmd'). |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "delCards",
  "items": [
    {
      "deviceID": "11111111-1111-4111-8111-111111111111",
      "cardID": "0123456789ABCDEF"
    }
  ]
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `(none)` | `-` | The client does not handle the response. |

### delPasscodes {#biz3manageaccessctlauthdata-delpasscodes}

After the device confirms passcode deletion, delete the passcode links on the server.

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `items` | `array<{deviceID: string, passwordID: string}>` | Yes | Passcodes to delete; deviceID is the auth-device UUID. |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "delPasscodes",
  "items": [
    {
      "deviceID": "11111111-1111-4111-8111-111111111111",
      "passwordID": "010203040506"
    }
  ]
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `(none)` | `-` | The client has no handler branch for this op. |

### clearCards {#biz3manageaccessctlauthdata-clearcards}

Clear an auth device's card links on the server (the client then re-reads the cards from the device via IoT).

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `obj` | `object` | Yes | Parameters. |
| `obj.devices` | `string` | Yes | A single auth-device UUID. |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "clearCards",
  "obj": {
    "devices": "11111111-1111-4111-8111-111111111111"
  }
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `(none)` | `-` | Triggers the callback; no fields read. |

::: info Note
Only called when the device is online over Wi-Fi.
:::

### clearPasscodes {#biz3manageaccessctlauthdata-clearpasscodes}

Clear an auth device's passcode links on the server (the client then re-reads via IoT).

**Request**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `obj` | `object` | Yes | Parameters. |
| `obj.devices` | `string` | Yes | A single auth-device UUID. |

```json
{
  "action": "biz3ManageAccessCtlAuthData",
  "op": "clearPasscodes",
  "obj": {
    "devices": "11111111-1111-4111-8111-111111111111"
  }
}
```

**Response**

| Field | Type | Description |
| --- | --- | --- |
| `(none)` | `-` | Triggers the callback; no fields read. |

::: info Note
Only called when the device is online over Wi-Fi.
:::
