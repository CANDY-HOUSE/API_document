---
title: Web API
---
# Web API

## API 介紹

爲了使用 Sesame RESTful webAPI，你需要獲取`API KEY`，API 能做的事情包括：

- 獲取 Sesame 的狀態
- 獲取 Sesame 的歷史
- Web API 解鎖

## 獲取`API KEY`的方式如下：[SESAME Biz [開發者頁]](https://biz.candyhouse.co/)

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

## 3、通过 Web API 开锁

用 Sesame 的密钥和时间戳，AES-CMAC 签名。向与 WiFi 模块 2 相连的 Sesame 请求开锁。

- REST 图式
- 获取 Sesame 的状态
- 命令代码列表
- AES-CMAC 使用方法

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

```
