# Webhook Integration Guide

## Overview

When the state (locked / unlocked) of a device registered in your space changes, a notification is sent to the URL you specify via HTTPS POST. Requests are signed with the space's API Key, so there is no separate secret to manage.

### Setup

1. Open the [Biz3 developer page](https://biz.candyhouse.co/biz/developer), and under "Webhook", click 「編集」 (Edit) next to 「通知先 URL」 (Notification URL). Only the owner of the space can do this.
2. Enter the receiving URL (must be https, up to 2048 characters) and click 「保存」 (Save).
3. To stop notifications, clear the URL and click 「保存」 (Save).

Only devices registered in that space are notified.

## Request Specification

Requests are sent as `POST` to the registered URL. Header names are case-insensitive; reading them in lowercase on the receiving side is the safest approach.

| Header | Value |
| --- | --- |
| `Content-Type` | `application/json` |
| `User-Agent` | `CANDYHOUSE-Webhook/1.0` |
| `X-Candyhouse-Event-Id` | Unique event ID (for deduplication) |
| `X-Candyhouse-Timestamp` | Send time (Unix seconds) |
| `X-Candyhouse-Key-Id` | ID of the API Key used for signing (not secret) |
| `X-Candyhouse-Signature` | `sha256=<hex signature>` |

### Request Body Example (Locked)

```json
{
  "id": "d99b9556-5b87-4bd7-b6eb-fe61a6fbf592",
  "type": "device.state_changed",
  "createdAt": 1792142922891,
  "companyID": "cus_XXXXXXXXXXXXXX",
  "data": {
    "deviceUUID": "51533933-3141-463A-45FF-FFFFFFFFFFFF",
    "stateInfo": {
      "CHSesame2Status": "locked",
      "position": 8,
      "batteryPercentage": 100,
      "batteryVoltage": 5.933,
      "isRechargeBattery": 0,
      "wm2State": true,
      "wm2UUID": "00000000-055A-FD81-0D00-F48518F94B55",
      "timestamp": ""
    }
  }
}
```

### Main stateInfo Fields

| Field | Description |
| --- | --- |
| `CHSesame2Status` | Lock state: `locked` / `unlocked` / `moved` |
| `position` | Motor angle |
| `batteryPercentage` | Battery level (%) |
| `batteryVoltage` | Battery voltage (V) |
| `wm2State` | Whether the device is online via a Hub |
| `wm2UUID` | UUID of the currently connected Hub |

Other fields may also be included. Ignore any fields you don't recognize.

## Signature Verification

Follow these steps to confirm that a request came from CANDY HOUSE and was not tampered with.

1. **Get the raw request body**: use the received string as is. If you parse the JSON and serialize it again, the signature will not match.
2. **Compute the signature** with the formula below. The key is the API Key shown on the developer page, and `timestamp` is the value of the `X-Candyhouse-Timestamp` header.
3. **Compare**: compare the result, prefixed with `sha256=`, against `X-Candyhouse-Signature` using a constant-time function (such as `hmac.compare_digest`). If they differ, return `401`.
4. **Check the time**: reject any request whose `X-Candyhouse-Timestamp` differs from the current time by more than 300 seconds (replay protection).
5. **Deduplicate**: process each `X-Candyhouse-Event-Id` only once.

```text
signature = hex( HMAC-SHA256( API key, timestamp + "." + rawBody ) )
```

Because the timestamp is part of the signature, tampering with the time in the header makes verification fail. Combined with the time check, this prevents old requests from being replayed.

## Response and Notes

Return **HTTP 200 within 5 seconds** of receiving a request. Any status other than 200 (including other 2xx codes such as 204) and timeouts are treated as failures. Only the HTTP status code is checked; the response body can be anything (including empty).

- **No retries.** Failed notifications are discarded. Put time-consuming work in a queue and return 200 immediately.
- **One operation produces multiple notifications.** While locking or unlocking, a notification is sent every time `position` changes. If you only care about the lock state, compare against the previous `CHSesame2Status`.
- **After you rotate the API Key, signatures use the new key.**
- **Keep the API Key safe (for example, in an environment variable on the receiving server).** The same key is used for [Web API](./webapi.md) authentication, so a leaked key could be used to operate your devices. If it leaks, rotate it on the developer page immediately.

## Implementation Example

A minimal implementation of "verify signature → check time → process → return 200". The API Key is set in the `CANDYHOUSE_API_KEY` environment variable.

### Python (Flask)

```python
import hashlib
import hmac
import os
import time

from flask import Flask, request

app = Flask(__name__)
API_KEY = os.environ["CANDYHOUSE_API_KEY"].encode()
TOLERANCE_SEC = 300


@app.post("/webhook")
def webhook():
    ts = request.headers.get("X-Candyhouse-Timestamp", "")
    sig = request.headers.get("X-Candyhouse-Signature", "")
    raw = request.get_data()  # raw bytes as received

    # 1. Verify the signature
    expected = "sha256=" + hmac.new(API_KEY, ts.encode() + b"." + raw, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, sig):
        return "invalid signature", 401

    # 2. Check the time (replay protection)
    if not ts.isdigit() or abs(time.time() - int(ts)) > TOLERANCE_SEC:
        return "stale timestamp", 401

    # 3. Process (deduplicate by X-Candyhouse-Event-Id)
    event = request.get_json()
    if event["type"] == "device.state_changed":
        data = event["data"]
        print(data["deviceUUID"], data["stateInfo"].get("CHSesame2Status"))

    # 4. Return 200 within 5 seconds (only the status code matters; the body can be empty)
    return "", 200
```
