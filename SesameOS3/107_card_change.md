---
nav: 示例
group: SESAME API
type:
  title: Bluetooth
  order: 0
title: 107_Card Change (修改)
order: 107
---

# 107 Card Change（修改卡片）

1. ssm_touch 加入新卡，主動推送新卡 ID 及名字給手機。
2. 手機將 id 及新名稱傳給 ssm_touch，ssm_touch 回傳命令接收成功後修改卡片名稱，並主動推送新卡 ID 及名字給手機(名字超過 20Bytes，只取前 20Bytes)。

## 循序圖 (新增卡片)

```mermaid
sequenceDiagram
SesameTouch->>APP: {Card ID,Card Name}
```

## 循序圖 (修改卡片名稱)

```mermaid
sequenceDiagram
APP->>SesameTouch: {SSM_OS3_CARD_CHANGE(107),Card ID,Card Name}
SesameTouch-->>APP: 命令成功
SesameTouch->>APP: {Card ID,Card Name}
```


## 手機送出資料

| Byte |  N ~ 1  |     0     |
| ---- | :-----: | :-------: |
| Data | payload | item code |

item code : SSM_OS3_CARD_CHANGE (107)

payload : 詳見以下表格

### payload

| Byte | (Card Name Len + Card ID Len + 1) ~ (Card ID Len + 2) | Card ID Len + 1 | Card ID Len ~ 1 |      0      |
| :--: | :---------------------------------------------------: | :-------------: | :-------------: | :---------: |
| Data |                       Card Name                       |  Card Name Len  |     Card ID     | Card ID Len |

#### 範例

id_len = 5

name_len = 4

| Byte |  10 ~ 7   |       6       |  5 ~ 1  |      0      |
| :--: | :-------: | :-----------: | :-----: | :---------: |
| Data | Card Name | Card Name Len | Card ID | Card ID Len |

## ssm_touch 回傳內容

| Byte |      2       |     1     |    0     |
| ---- | :----------: | :-------: | :------: |
| Data |     res      | item_code |   type   |
| 說明 | 命令處裡狀態 | 指令編號  | 推送類型 |

type : SSM2_OP_CODE_RESPONSE (0x07)

item code : SSM_OS3_CARD_CHANGE (107)

res : CMD_RESULT_SUCCESS (0x00)

## ssm_touch 推送內容

| Byte |     N ~ 2      |     1     |    0     |
| ---- | :------------: | :-------: | :------: |
| Data |    payload     | item_code |   type   |
| 說明 | 送給手機的資料 | 指令編號  | 推送類型 |

type : SSM2_OP_CODE_PUBLISH (0x08)

item code : SSM_OS3_CARD_CHANGE (107)

payload : 詳見以下表格

### payload

| Byte | (Card Name Len + Card ID Len + 1) ~ (Card ID Len + 2) | Card ID Len + 1 | Card ID Len ~ 1 |      0      |
| :--: | :---------------------------------------------------: | :-------------: | :-------------: | :---------: |
| Data |                       Card Name                       |  Card Name Len  |     Card ID     | Card ID Len |

#### 範例

id_len = 5

name_len = 4

| Byte |  10 ~ 7   |       6       |  5 ~ 1  |      0      |
| :--: | :-------: | :-----------: | :-----: | :---------: |
| Data | Card Name | Card Name Len | Card ID | Card ID Len |

## iOS、Android、ESP32 範例
 

### Android 範例

```jsx | pure
    override fun cardChange(ID: String, name: String, result: CHResult<CHEmpty>) {
        if (checkBle(result)) return
        sendCommand(SesameOS3Payload(SesameItemCode.SSM_OS3_CARD_CHANGE.value, byteArrayOf(ID.hexStringToByteArray().size.toByte()) + ID.hexStringToByteArray() + name.toByteArray())) { res ->
            result.invoke(Result.success(CHResultState.CHResultStateBLE(CHEmpty())))
        }
    }
```

### iOS 範例

```jsx | pure
    func cardsChange(ID: String, name: String, result: @escaping (CHResult<CHEmpty>)) {
        if (self.checkBle(result)) { return }

        let idData = ID.hexStringtoData()
        let payload = Data([UInt8(idData.count)]) + idData + name.bytes
        L.d("TouchDevice",payload.toHexLog())
        sendCommand(.init(.SSM_OS3_CARD_CHANGE, payload)) { _ in
            L.d("[TouchDevice][fingerPrintsChange][ok]")
            result(.success(CHResultStateNetworks(input: CHEmpty())))
        }
    }
```

### ESP 範例

```jsx | pure

``` 

