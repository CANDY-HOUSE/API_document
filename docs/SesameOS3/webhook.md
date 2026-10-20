# Webhook 接入指南

## 概要

空间中登记的设备状态（上锁、开锁）发生变化时，会以 HTTPS POST 通知到指定的 URL。签名使用该空间的 API Key，无需另外管理密钥。

### 配置方法

1. 打开 [Biz3 的开发者页](https://biz.candyhouse.co/biz/developer)，在「Webhook」的「通知先 URL」点「編集」（仅空间的所有者可操作）。
2. 输入接收用的 URL（必须是 https，不超过 2048 字符），点「保存」。
3. 要停止通知时，把 URL 清空后「保存」。

通知对象仅限该空间中登记的设备。

## 请求规格

以 `POST` 发送到登记的 URL。请求头名称不区分大小写，接收端统一用小写读取比较稳妥。

| 请求头 | 内容 |
| --- | --- |
| `Content-Type` | `application/json` |
| `User-Agent` | `CANDYHOUSE-Webhook/1.0` |
| `X-Candyhouse-Event-Id` | 事件唯一 ID（用于去重） |
| `X-Candyhouse-Timestamp` | 发送时间（Unix 秒） |
| `X-Candyhouse-Key-Id` | 签名所用 API Key 的 ID（不是机密） |
| `X-Candyhouse-Signature` | `sha256=<十六进制签名>` |

### 请求体示例（上锁时）

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

### stateInfo 主要字段

| 字段 | 内容 |
| --- | --- |
| `CHSesame2Status` | 锁状态：`locked` / `unlocked` / `moved` |
| `position` | 电机角度 |
| `batteryPercentage` | 电量（%） |
| `batteryVoltage` | 电池电压（V） |
| `wm2State` | 是否经 Hub 在线 |
| `wm2UUID` | 当前连接的 Hub 的 UUID |

可能还会包含以上之外的字段，未知字段请忽略。

## 签名验证

请按以下步骤确认收到的请求来自 CANDY HOUSE 且未被篡改。

1. **取原始请求体**：直接使用收到的字符串。先解析 JSON 再转回字符串，签名就会对不上。
2. **计算签名**：按下面的公式计算。密钥是开发者页上显示的 API Key，`timestamp` 是 `X-Candyhouse-Timestamp` 请求头的值。
3. **比对**：把加上 `sha256=` 前缀的计算结果和 `X-Candyhouse-Signature` 用抗时序攻击的函数（如 `hmac.compare_digest`）比对。不一致就返回 `401`。
4. **检查时间**：`X-Candyhouse-Timestamp` 与当前时间相差超过 300 秒的请求一律拒收（防重放）。
5. **去重**：同一个 `X-Candyhouse-Event-Id` 只处理一次。

```text
signature = hex( HMAC-SHA256( API key, timestamp + "." + rawBody ) )
```

签名中包含时间戳，篡改请求头里的时间会导致验签失败；再配合时间检查，就能防止旧请求被重放。

## 响应与注意事项

收到后请在 **5 秒内返回 HTTP 200**。除 200 以外的状态码（包括 204 等其他 2xx）和超时，都会被视为失败。只判断 HTTP 状态码，响应体内容不限（可以为空）。

- **不会重发**。失败的通知会被丢弃。耗时的处理请先放入队列，立即返回 200。
- **一次操作会收到多条通知**。上锁、开锁的过程中，`position` 每变化一次就会通知一次。只关心锁状态时，请和上一次的 `CHSesame2Status` 比较。
- **更换 API Key 后，签名也会改用新 Key**。
- **请妥善保管 API Key（如放在接收服务器的环境变量中）**。这个 Key 也用于 [Web API](./webapi.md) 认证，泄露后可能被用来操作设备。一旦泄露，请立即在开发者页更换。

## 实现示例

「验签 → 检查时间 → 处理 → 返回 200」的最小实现。API Key 设在环境变量 `CANDYHOUSE_API_KEY` 中。

### Python（Flask）

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
    raw = request.get_data()  # 原样收到的字节

    # 1. 验签
    expected = "sha256=" + hmac.new(API_KEY, ts.encode() + b"." + raw, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, sig):
        return "invalid signature", 401

    # 2. 检查时间（防重放）
    if not ts.isdigit() or abs(time.time() - int(ts)) > TOLERANCE_SEC:
        return "stale timestamp", 401

    # 3. 处理（请用 X-Candyhouse-Event-Id 去重）
    event = request.get_json()
    if event["type"] == "device.state_changed":
        data = event["data"]
        print(data["deviceUUID"], data["stateInfo"].get("CHSesame2Status"))

    # 4. 5 秒内返回 200（只看状态码，响应体可为空）
    return "", 200
```
