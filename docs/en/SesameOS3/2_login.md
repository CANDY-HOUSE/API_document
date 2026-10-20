---
title: 2_login
---
# 2 Login (Login)

Devices that have already registered with Sesame5 need to log in after connecting in order to control.

Details for the implementation of encryption can be found in the `security layer`.

## Sesame(APP) logging in to Sesame5 activity diagram

APP logs in to Sesame5 ccmKey - only the first 4 Bytes are compared.

```mermaid
flowchart TD
    subgraph "Sesame (APP)"
    c1(#9899;)-->c2["ccmkeyA = AES_CMAC(token,randomcode)"]
    -->c3["发送{登录命令,ccmkey A}"]
    c4["abs(APPtimestamp-ssm5_timestamp)>=3"]
    c4--否-->c5(#128280;)
    c4--是-->c6["发送{手机timestamp}"]
    end    

    subgraph Sesame5
    a1["ccmkeyS=AES_CMAC(token,randomcode)"]
    -->a2["ccmkey A = ccmkey S"]
    a2--否-->a3["登录失败"]
        -->a4(#128280;)
    a2--是-->a5[取出ssm5 timesstamp]
        -->a6["回传(登入成功,ssm5 timestamp)"]
        -->a7["发送ssm5 机械设定"]
        -->a8["发送ssm5 机械状态"]
        -->a9["设定联线状态为Login"]
        -->a10(#128280;)
    a11["更新ssm5 timestamp"]
        -->a12(#128280;)
    end
    c3-->a1
    c6-->a11
```
 
## Sesame(APP) registering to Sesame5 sequence diagram

```mermaid
sequenceDiagram
APP->>Sesame5: 发送{登录命令,ccmkey A}
Sesame5-->>APP: (ccmkeyA==ccmkeyS)?{登录成功,ssm5 timestamp}:{登录失败,ssm5跟手机断线}
```

## Mobile sending out data

| Byte |  4 ~ 1   |     0     |
| ---- | :------: | :-------: |
| Data | ccmkey A | item code |

item code : SSM2_ITEM_CODE_LOGIN (2)

## Sesame5 response message

| Byte |     N ~ 3      |      2       |     1     |    0     |
| ---- | :------------: | :----------: | :-------: | :------: |
| Data |    payload     |     res      | item_code |   type   |
| Description | Data to mobile | Processing status of command  | Command number  | Type of push |

type : SSM2_OP_CODE_RESPONSE (0x07)

item code : SSM2_ITEM_CODE_LOGIN (2)

res : CMD_RESULT_SUCCESS (0x00)

payload : See the following table for details

### payload

| Byte |   3 ~ 0   |
| ---- | :-------: |
| Data | timestamp |

## iOS, Android, ESP32 examples

 