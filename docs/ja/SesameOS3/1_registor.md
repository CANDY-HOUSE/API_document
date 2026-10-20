---
title: 1_registor
---
# 1 レジスト（註冊設備）

レジスト（註冊）は APP と Sesame5 がペアリングする行為で、ペアリングした APP だけがその Sesame5 を制御することができます。

暗号化の詳細は `セキュリティレイヤー`を参照してください。

## Sesame(APP)が Sesame5 に登録するシーケンス図

```mermaid
sequenceDiagram
APP->>APP: {公钥A,私密金鑰A}=secp256r1()
APP->>Sesame5: 發送{公钥A,手機timestamp,註冊命令}
Sesame5-->>APP: ssm5是否被註冊?未註冊回復,已註冊不回復
Sesame5->>Sesame5: 使用手機timestamp設定ssm5時間
Sesame5->>Sesame5: {公钥s,私密金鑰s}=secp256r1()
Sesame5->>Sesame5: Secret=secp256r1(公钥s,私密金鑰s),Device secret=Secret前16bytes
Sesame5->>Sesame5: Token=AES_CMAC(Device secret,random code)
Sesame5-->>APP: 回復(註冊成功,機械狀態,機械設定,公钥S)
APP->>APP: 設定ssm5機械狀態,機械設定
APP->>APP: Secret=secp256r1(公開金鑰S,私密金鑰A),Device secret = Secret前16bytes
APP->>APP: Token = AES_CMAC(Device secret, random code)
```

## Sesame(APP)が Sesame5 に登録するアクティビティ図

```mermaid
flowchart TD
    subgraph Sesame5
    a1[設備是否被註冊?]--否-->a4[設備時間timestamp與手機手機timestamp相同]-->a5[secp256r1函數生成publicKeyS,privateKeyS]-->a6[Secret=secp256r1函數,Device secret的前16Bytes]-->a7["Token=AES_CMAC(Device secret,random code)"]-->a8["回復(註冊成功,機械狀態,機械設定,publicKeyS)"]
    a1--是-->a2[回復已註冊]-->a3(結束)
    end
	
    subgraph "Sesame (APP)"
    c1(#9899;)-->c2("secp256r1函數生成公開金鑰與私密金鑰{publicKeyA,privateKeyA} = secp256r1()")
    c2-->c3("發送{發送publicKeyA,手機timestamp,註冊命令}")
    c4[設定設備機械狀態,機械設定]-->c5["Secret = secp256r1(publicKeyS,privateKeyA)"]
    end    
	c3-->a1
	a8-->c4
```

## モバイルからのデータ送信

| バイト |         68 ~ 65          |   64 ~ 1   |     0     |
| ------ | :----------------------: | :--------: | :-------: |
| データ | モバイルのタイムスタンプ | publicKeyA | item_code |

## Sesame5 からのレスポンスデータ（既に登録済み）

| バイト |        2         |     1     |   0    |
| ------ | :--------------: | :-------: | :----: |
| データ |       res        | item_code |  type  |
| 説明   | コマンド処理状態 | 指令番号  | 押送型 |

type : SSM2_OP_CODE_RESPONSE (0x07)

item code : SSM2_ITEM_CODE_LOGIN (1)

res : CMD_RESULT_INVALID_ACTION (0x09)

## Sesame5 からのレスポンスデータ（未登録)

| バイト |       N ~ 3        |        2         |     1     |   0    |
| ------ | :----------------: | :--------------: | :-------: | :----: |
| データ |      payload       |       res        | item_code |  type  |
| 説明   | モバイルへのデータ | コマンド処理状態 | 指令番号  | 押送型 |

type : SSM2_OP_CODE_RESPONSE (0x07)

item code : SSM2_ITEM_CODE_LOGIN (1)

res : CMD_RESULT_SUCCESS (0x00)

payload : 詳細は以下のテーブルを参照

### Payload

| バイト |  76 ~ 13   |   12 ~ 7    |   6 ~ 0    |
| ------ | :--------: | :---------: | :--------: |
| データ | publicKeyS | mechSetting | mechStatus |

## iOS、Android、ESP32 の例

