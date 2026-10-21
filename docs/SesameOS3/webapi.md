---
title: Web API
---
# Web API

## API 介紹

爲了使用 Sesame RESTful webAPI，你需要獲取`API KEY`，API 能做的事情包括：

- 獲取 Sesame 的狀態
- 獲取 Sesame 的歷史
- Web API 解鎖

## 獲取`API KEY`的方式如下：[SESAME Biz [開發者頁]](https://biz.candyhouse.co/biz/developer)

## API 接口文檔

## 1、获取 Sesame 的状态

```c
    GET: 'https://app.candyhouse.co/api/sesame2/{sesame2_uuid}'
    Parameters: (name = 'x-api-key'), (location = 'header'), (des = 'your api-key')
    ;(name = 'sesame2_uuid'), (location = 'path'), (des = 'sesame UUID')

```

#### Response

```c

{
   "batteryPercentage":94,             // 電池残量94%
   "batteryVoltage":5.869794721407625, // 電池の電圧, 単位: ボルト(V)
   "position":11,                      // セサミデバイスの角度, 360˚ は 1024
   "CHSesame2Status":"locked",         // locked | unlocked | moved
   "timestamp":1598523693              // Sesame Shadow が更新された時間。 1970/1/1 00:00:00 からミリ秒単位のタイムスタンプ
}

```

## 2、获取 Sesame 的历史

```c

    GET: 'https://app.candyhouse.co/api/sesame2/488ABAAB-164F-7A86-595F-DDD778CB86C3/history?page=0&lg=2'
    Parameters: (name = 'x-api-key'), (location = 'header'), (des = 'your api-key')
    ;(name = 'sesame2_uuid'), (location = 'path')
    ;(name = 'page'),
    (location = 'query'),
    (des =
        'ページ数。ページ数の0から、新→旧の履歴順番で、1ページの中に最多50件の履歴が入ってる。')
    ;(name = 'lg'),
    (location = 'query'),
    (des = '指定されたページの中に、新→旧の履歴順番で取得したい履歴件数。')

```

#### Response

```c

[
  {
    type: 2,
    timeStamp: 1597492862.0, // 1970/1/1 00:00:00 からミリ秒単位のタイムスタンプ
    historyTag: '44OJ44Op44GI44KC44KT', // 鍵に付いてるタグやメモ 0 ~ 21bytes
    recordID: 255, // 連続でない(将来、連続になるように修正する予定)、セサミデバイスが再起動するまで当履歴の唯1つのID、 小→大
    parameter: null, // 解析する予定
  },
  {
    type: 11,
    timeStamp: 1597492864.0,
    historyTag: null,
    recordID: 256,
    parameter: null,
  },
]

```

```c
type :

    0 none.
    1 bleLock.                Sesame 设备收到了上锁的 BLE 命令。
    2 bleUnLock.              Sesame 设备收到了开锁的 BLE 命令。
    3 timeChanged.            Sesame 设备的内部时钟已校准。
    4 autoLockUpdated.        自动上锁的设置已变更。
    5 mechSettingUpdated.     上锁 / 开锁角度的设置已变更。
    6 autoLock.               Sesame 设备已自动上锁。
    7 manualLocked.           手动上锁（从下方情况 2 或情况 3 变为情况 1 时）
    8 manualUnlocked.         手动开锁（从下方情况 1 或情况 3 变为情况 2 时）
    9 manualElse.             旋钮从开锁范围或上锁范围移出时（从下方情况 1 变为情况 3，或从情况 2 变为情况 3 时）
   10 driveLocked.            电机已确实上锁。
   11 driveUnlocked.          电机已确实开锁。
   12 driveFailed.            电机在上锁 / 开锁过程中失败。
   13 bleAdvParameterUpdated. Sesame 设备发出的 BLE 广播的 Interval 和 TXPower 设置已变更。
   14 wm2Lock.                经由 WiFi 模块上锁了 Sesame 设备。
   15 wm2Unlock.              经由 WiFi 模块开锁了 Sesame 设备。
   16 webLock.                经由 Web API 上锁了 Sesame 设备。
   17 webUnlock.              经由 Web API 开锁了 Sesame 设备。


补充 1：目前状态只有以下 3 种。
  ＜情况 1：上锁＞
    旋钮在上锁范围内时，
    上锁　1
    开锁　0
  ＜情况 2：开锁＞
    旋钮在开锁范围内时，
    上锁　0
    开锁　1
  ＜情况 3：其他（※目前在 UI 上显示为「开锁」）＞
    旋钮在以上两个范围之外时，
    上锁　0
    开锁　0
```

## 3、通过 Web API 开锁

用 Sesame 的密钥和时间戳，AES-CMAC 签名。向与 WiFi 模块 2 相连的 Sesame 请求开锁。

- REST 图式
- 获取 Sesame 的状态
- 命令代码列表
  - case lock = 82:關鎖
  - case unlock = 83:開鎖
  - case toggle = 88
  - code for Bot2 / Bot3
    - case RUN_SCRIPT_0 = 170
    - case RUN_SCRIPT_1 = 171
    - case RUN_SCRIPT_2 = 172
    - case RUN_SCRIPT_3 = 173
    - case RUN_SCRIPT_4 = 174
    - case RUN_SCRIPT_5 = 175
    - case RUN_SCRIPT_6 = 176
    - case RUN_SCRIPT_7 = 177
    - case RUN_SCRIPT_8 = 178
    - case RUN_SCRIPT_9 = 179
- AES-CMAC 使用方法

#### REST 图式

```javascript
POST: "https://app.candyhouse.co/api/sesame2/${sesame_id}/cmd"
BODY: {
        cmd: cmd,
        history: base64_history,
        sign: sign
}
Parameters:
    name = "x-api-key", location = "header",des="your api-key"
    name = "sesame2_uuid", location = "path"
    name = "cmd", location = "body",des="开关锁命令代码"
    name = "history", location = "body",des="历史"
    name = "sign", location = "body",des="签名"
```

#### AES-CMAC 使用方法

1. 加密方式：AESCMAC(`key`, `message`)
2. `key` 是用 getkey 获取的 Sesame 钥匙 **_key-secret_**
3. `message` 是时间戳 (SECONDS SINCE JAN 01 1970. (UTC)) --> 2.uint32 (little endian) --> 3.remove most-significant byte

代码用例

```c

const axios = require('axios')
const aesCmac = require('node-aes-cmac').aesCmac

let wm2_cmd = async () => {
  let sesame_id = '3DE4DE72-AAF9-25C1-8D0F-C9E019BB060C'
  let key_secret_hex = 'a13d4b890111676ba8fb36ece7e94f7d'
  let cmd = 88 //(toggle:88,lock:82,unlock:83)
  let base64_history = Buffer.from('test2').toString('base64')

  let sign = generateRandomTag(key_secret_hex)
  let after_cmd = await axios({
    method: 'post',
    url: `https://app.candyhouse.co/api/sesame2/${sesame_id}/cmd`,
    headers: { 'x-api-key': `M10YD4NKnP3BzIraDzINg9vcjOzEc2uP3DWb2HJn` },
    data: {
      cmd: cmd,
      history: base64_history,
      sign: sign,
    },
  })
}

function generateRandomTag(secret) {
  // * key:key-secret_hex to data
  let key = Buffer.from(secret, 'hex')

  // message
  // 1. timestamp  (SECONDS SINCE JAN 01 1970. (UTC))  // 1621854456905
  // 2. timestamp to uint32  (little endian)   //f888ab60
  // 3. remove most-significant byte    //0x88ab60
  const date = Math.floor(Date.now() / 1000)
  const dateDate = Buffer.allocUnsafe(4)
  dateDate.writeUInt32LE(date)
  const message = Buffer.from(dateDate.slice(1, 4))

  return aesCmac(key, message)
}

wm2_cmd()

```

```c

import datetime, base64, requests, json
from Crypto.Hash import CMAC
from Crypto.Cipher import AES

uuid = '3DE4DE72-AAF9-25C1-8D0F-C9E019BB060C'
secret_key = '2ebc2c087c1501480834538ff72139bc'
api_key = 'SrSOEY9mBe6Ndl7bwyVPs5TsTPFTEq9tra8Occad'

cmd = 88  # 88/82/83 = toggle/lock/unlock
history = 'test5'
base64_history = base64.b64encode(bytes(history, 'utf-8')).decode()

print(base64_history)
headers = {'x-api-key': api_key}
cmac = CMAC.new(bytes.fromhex(secret_key), ciphermod=AES)

ts = int(datetime.datetime.now().timestamp())
message = ts.to_bytes(4, byteorder='little')
message = message.hex()[2:8]
cmac = CMAC.new(bytes.fromhex(secret_key), ciphermod=AES)

cmac.update(bytes.fromhex(message))
sign = cmac.hexdigest()
# 鍵の操作
url = f'https://app.candyhouse.co/api/sesame2/{uuid}/cmd'
body = {
    'cmd': cmd,
    'history': base64_history,
    'sign': sign
}
res = requests.post(url, json.dumps(body), headers=headers)
print(res.status_code, res.text)

# certifi==2021.5.30
# chardet==4.0.0
# clr==1.0.3
# idna==2.10
# Naked==0.1.31
# pycryptodome==3.4.3
# PyYAML==5.4.1
# requests==2.25.1
# urllib3==1.26.6

```
