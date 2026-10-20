---
title: Web API
---
# Web API

## API 介紹

Sesame RESTful webAPI を利用するためには、`API KEY`が必要です。API を使用して以下のことができます：

- Sesame のステータスを取得
- Sesame の履歴を取得
- Web API で解錠

## `API KEY`の取得方法はこちら：[SESAME Biz [開発者向けページ]](https://biz.candyhouse.co/)

## API インターフェースドキュメント

## 1、Sesame ステータスの取得

```c
    GET: 'https://app.candyhouse.co/api/sesame2/{sesame2_uuid}'
    Parameters: (name = 'x-api-key'), (location = 'header'), (des = 'your api-key')
                (name = 'sesame2_uuid'), (location = 'path'), (des = 'sesame UUID')

```

#### レスポンス

```c

{
   "batteryPercentage":94,             // バッテリー残量94%
   "batteryVoltage":5.869794721407625, // バッテリー電圧、単位：ボルト(V)
   "position":11,                      // セサミデバイスの角度、360度は1024となる
   "CHSesame2Status":"locked",         // locked | unlocked | moved
   "timestamp":1598523693              // Sesame Shadowの更新時刻。1970/1/1 00:00:00を基準にミリ秒単位のタイムスタンプ
}

```

## 2、Sesame 履歴の取得

```c

    GET: 'https://app.candyhouse.co/api/sesame2/488ABAAB-164F-7A86-595F-DDD778CB86C3/history?page=0&lg=2'
    Parameters: (name = 'x-api-key'), (location = 'header'), (des = 'your api-key')
                (name = 'sesame2_uuid'), (location = 'path')
                (name = 'page'), (location = 'query'),
                (des = 'ページ数。ページ数は0から始まり、新しいものから古いものへの履歴の順番で、1ページに最大50件の履歴が含まれる。')
                (name = 'lg'), (location = 'query'),
                (des = '取得したい履歴のコンテンツ数。必要に応じて、新しいものから古いものへの履歴の順番で指定する。')

```

#### レスポンス

```c

[
  {
    type: 2,
    timeStamp: 1597492862.0, // 1970/1/1 00:00:00を基準にミリ秒単位のタイムスタンプ
    historyTag: '44OJ44Op44GI44KC44KT', // 鍵に付けられたタグやメモ 0 ~ 21bytes
    recordID: 255, // 非連続（将来的には連続になる予定）、セサミデバイスが再起動するまでの履歴の一意のID、 小→大
    parameter: null, // 解析予定
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

## 3、Web API で開錠

Sesame の秘密鍵とタイムスタンプを使用し、AES-CMAC で署名。WiFi モジュール 2 に接続されている Sesame に対して開錠をリクエスト。

- REST スキーマ
- Sesame ステータスの取得
- コマンドコードリスト
- AES-CMAC の使用方法

コード例

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

cmd = 88  // 88/82/83 = toggle/lock/unlock
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
// 鍵の操作
url = f'https://app.candyhouse.co/api/sesame2/{uuid}/cmd'
body = {
    'cmd': cmd,
    'history': base64_history,
    'sign': sign
}
res = requests.post(url, json.dumps(body), headers=headers)
print(res.status_code, res.text)

```
