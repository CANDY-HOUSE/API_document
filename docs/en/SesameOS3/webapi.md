---
title: Web API
---
# Web API

## API Introduction

To use Sesame RESTful webAPI, you need to acquire an `API KEY`. The API can do the following:

- Get the status of Sesame
- Get the history of Sesame
- Unlock with Web API

## The method to get `API KEY` is as follows: [SESAME Biz [Developer page]](https://biz.candyhouse.co/)

## API interface documentation

## 1、Get the status of Sesame

```c
    GET: 'https://app.candyhouse.co/api/sesame2/{sesame2_uuid}'
    Parameters: (name = 'x-api-key'), (location = 'header'), (des = 'your api-key')
    ;(name = 'sesame2_uuid'), (location = 'path'), (des = 'sesame UUID')

```

#### Response

```c

{
   "batteryPercentage":94,             // Battery level 94%
   "batteryVoltage":5.869794721407625, // Battery voltage, unit: Volt (V)
   "position":11,                      // Sesame device angle, 360˚ is 1024
   "CHSesame2Status":"locked",         // locked | unlocked | moved
   "timestamp":1598523693              // Time when Sesame Shadow was updated. Timestamp in milliseconds from 1970/1/1 00:00:00
}

```

## 2、Get the history of Sesame

```c

    GET: 'https://app.candyhouse.co/api/sesame2/488ABAAB-164F-7A86-595F-DDD778CB86C3/history?page=0&lg=2'
    Parameters: (name = 'x-api-key'), (location = 'header'), (des = 'your api-key')
    ;(name = 'sesame2_uuid'), (location = 'path')
    ;(name = 'page'),
    (location = 'query'),
    (des =
        'Page number. From page 0, in the order of new → old history, and there are up to 50 histories in one page.')
    ;(name = 'lg'),
    (location = 'query'),
    (des = 'The number of histories you want to get from the specified page, in the order of new → old history.')

```

#### Response

```c

[
  {
    type: 2,
    timeStamp: 1597492862.0, // Timestamp in milliseconds from 1970/1/1 00:00:00
    historyTag: '44OJ44Op44GI44KC44KT', // Tag or memo attached to the key 0 ~ 21bytes
    recordID: 255, // Not continuous (planning to modify to be continuous in the future), unique ID of the current history until the Sesame device restarts, small→big
    parameter: null, // planned for analysis
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

## 3、Unlock with Web API

Use Sesame's key and timestamp to sign with AES-CMAC. Request to unlock Sesame connected to WiFi module 2.

- REST scheme
- Get the status of Sesame
- Command code list
- How to use AES-CMAC

Code example:

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
# Key operations
url = f'https://app.candyhouse.co/api/sesame2/{uuid}/cmd'
body = {
    'cmd': cmd,
    'history': base64_history,
    'sign': sign
}
res = requests.post(url, json.dumps(body), headers=headers)
print(res.status_code, res.text)

```
