# Webhook 導入ガイド

## 概要

スペースに登録されたデバイスの状態（施錠・解錠）が変化すると、指定した URL に HTTPS POST で通知します。署名にはそのスペースの API Key を使用するため、別途シークレットを管理する必要はありません。

### 設定方法

1. [Biz3 の開発者ページ](https://biz.candyhouse.co/biz/developer)を開き、「Webhook」の「通知先 URL」で「編集」をクリックします（スペースのオーナーのみ操作できます）。
2. 受信用の URL（https 必須、2048 文字以内）を入力し、「保存」をクリックします。
3. 通知を停止する場合は、URL を空にして「保存」をクリックします。

通知対象は、そのスペースに登録されたデバイスのみです。

## リクエスト仕様

登録された URL に `POST` で送信します。ヘッダー名は大文字・小文字を区別しないため、受信側では小文字に統一して読み取るのが確実です。

| ヘッダー | 内容 |
| --- | --- |
| `Content-Type` | `application/json` |
| `User-Agent` | `CANDYHOUSE-Webhook/1.0` |
| `X-Candyhouse-Event-Id` | イベントの一意な ID（重複排除用） |
| `X-Candyhouse-Timestamp` | 送信時刻（Unix 秒） |
| `X-Candyhouse-Key-Id` | 署名に使用した API Key の ID（機密ではありません） |
| `X-Candyhouse-Signature` | `sha256=<16 進数の署名>` |

### リクエストボディの例（施錠時）

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

### stateInfo の主なフィールド

| フィールド | 内容 |
| --- | --- |
| `CHSesame2Status` | 錠の状態：`locked` / `unlocked` / `moved` |
| `position` | モーターの角度 |
| `batteryPercentage` | 電池残量（%） |
| `batteryVoltage` | 電池電圧（V） |
| `wm2State` | Hub 経由でオンラインかどうか |
| `wm2UUID` | 現在接続している Hub の UUID |

上記以外のフィールドが含まれる場合があります。未知のフィールドは無視してください。

## 署名の検証

以下の手順で、受信したリクエストが CANDY HOUSE から送信され、改ざんされていないことを確認してください。

1. **生のリクエストボディを取得**：受信した文字列をそのまま使用します。JSON をパースしてから文字列に戻すと、署名が一致しなくなります。
2. **署名を計算**：以下の式で計算します。鍵は開発者ページに表示される API Key、`timestamp` は `X-Candyhouse-Timestamp` ヘッダーの値です。
3. **比較**：計算結果に `sha256=` を付けたものと `X-Candyhouse-Signature` を、タイミング攻撃に耐性のある関数（`hmac.compare_digest` など）で比較します。一致しなければ `401` を返します。
4. **時刻を確認**：`X-Candyhouse-Timestamp` と現在時刻の差が 300 秒を超えるリクエストはすべて拒否します（リプレイ攻撃対策）。
5. **重複排除**：同じ `X-Candyhouse-Event-Id` は一度だけ処理します。

```text
signature = hex( HMAC-SHA256( API key, timestamp + "." + rawBody ) )
```

署名にはタイムスタンプが含まれるため、ヘッダーの時刻を改ざんすると検証に失敗します。時刻の確認と組み合わせることで、古いリクエストの再送を防げます。

## レスポンスと注意事項

受信後 **5 秒以内に HTTP 200 を返してください**。200 以外のステータスコード（204 などの他の 2xx も含む）やタイムアウトは失敗とみなされます。判定は HTTP ステータスコードのみで、レスポンスボディの内容は問いません（空でも構いません）。

- **再送はありません**。失敗した通知は破棄されます。時間のかかる処理はキューに入れ、すぐに 200 を返してください。
- **1 回の操作で複数の通知が届きます**。施錠・解錠の途中、`position` が変化するたびに通知されます。錠の状態だけが必要な場合は、前回の `CHSesame2Status` と比較してください。
- **API Key を変更すると、署名も新しい Key で行われます**。
- **API Key は安全に保管してください（受信サーバーの環境変数に置くなど）**。この Key は [Web API](./webapi.md) の認証にも使われるため、漏洩するとデバイスを操作される恐れがあります。漏洩した場合は、すぐに開発者ページで変更してください。

## 実装例

「署名検証 → 時刻確認 → 処理 → 200 を返す」の最小実装です。API Key は環境変数 `CANDYHOUSE_API_KEY` に設定します。

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
    raw = request.get_data()  # 受信したままのバイト列

    # 1. 署名を検証
    expected = "sha256=" + hmac.new(API_KEY, ts.encode() + b"." + raw, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, sig):
        return "invalid signature", 401

    # 2. 時刻を確認（リプレイ攻撃対策）
    if not ts.isdigit() or abs(time.time() - int(ts)) > TOLERANCE_SEC:
        return "stale timestamp", 401

    # 3. 処理（X-Candyhouse-Event-Id で重複排除してください）
    event = request.get_json()
    if event["type"] == "device.state_changed":
        data = event["data"]
        print(data["deviceUUID"], data["stateInfo"].get("CHSesame2Status"))

    # 4. 5 秒以内に 200 を返す（ステータスコードのみ判定、ボディは空でも可）
    return "", 200
```
