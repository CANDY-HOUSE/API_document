---
nav: Example
group: SESAME API
type:
  title: Bluetooth
  order: 0
title: 107_Card Change (Modification)
order: 107
---

# 107 Card Change (Modification)

1. ssm_touch adds a new card, proactively pushing the new card ID and name to the mobile phone.
2. The mobile phone sends id and new name to ssm_touch, ssm_touch returns the command received successfully, modifies the card name, and actively pushes the new card ID and name to the mobile phone (If the name exceeds 20Bytes, only the first 20Bytes is taken).

## Sequence Diagram (Add new card)

<p align="left" >
  <img src="./src/card_change/card_change.png" alt="" title="">
</p>

## Sequence Diagram (Modify card name)

<p align="left" >
  <img src="./src/card_change/card_change_name.png" alt="" title="">
</p>

## Mobile Phone Submit Data

| Byte |  N ~ 1  |     0     |
| ---- | :-----: | :-------: |
| Data | payload | item code |

item code: SSM_OS3_CARD_CHANGE (107)

payload: See the table below for details

### payload

| Byte | (Card Name Len + Card ID Len + 1) ~ (Card ID Len + 2) | Card ID Len + 1 | Card ID Len ~ 1 |      0      |
| :--: | :---------------------------------------------------: | :-------------: | :-------------: | :---------: |
| Data |                       Card Name                       |  Card Name Len  |     Card ID     | Card ID Len |

#### Example

id_len = 5

name_len = 4

| Byte |  10 ~ 7   |       6       |  5 ~ 1  |      0      |
| :--: | :-------: | :-----------: | :-----: | :---------: |
| Data | Card Name | Card Name Len | Card ID | Card ID Len |

## ssm_touch Return Content

| Byte |      2       |     1     |    0     |
| ---- | :----------: | :-------: | :------: |
| Data |     res      | item_code |   type   |
| Description | Command Processing Status | Instruction Number | Push Type |

type: SSM2_OP_CODE_RESPONSE (0x07)

item code: SSM_OS3_CARD_CHANGE (107)

res: CMD_RESULT_SUCCESS (0x00)

## ssm_touch Push Content

| Byte |     N ~ 2      |     1     |    0     |
| ---- | :------------: | :-------: | :------: |
| Data |    payload     | item_code |   type   |
| Description | Data sent to mobile phone | Instruction Number | Push Type |

type: SSM2_OP_CODE_PUBLISH (0x08)

item code: SSM_OS3_CARD_CHANGE (107)

payload: See the table below for details

### payload

| Byte | (Card Name Len + Card ID Len + 1) ~ (Card ID Len + 2) | Card ID Len + 1 | Card ID Len ~ 1 |      0      |
| :--: | :---------------------------------------------------: | :-------------: | :-------------: | :---------: |
| Data |                       Card Name                       |  Card Name Len  |     Card ID     | Card ID Len |

#### Example

id_len = 5

name_len = 4

| Byte |  10 ~ 7   |       6       |  5 ~ 1  |      0      |
| :--: | :-------: | :-----------: | :-----: | :---------: |
| Data | Card Name | Card Name Len | Card ID | Card ID Len |

## Examples for iOS, Android, ESP32
 ## Android Example

```jsx | pure
    override fun cardChange(ID: String, name: String, result: CHResult<CHEmpty>) {
        if (checkBle(result)) return
        sendCommand(SesameOS3Payload(SesameItemCode.SSM_OS3_CARD_CHANGE.value, byteArrayOf(ID.hexStringToByteArray().size.toByte()) + ID.hexStringToByteArray() + name.toByteArray())) { res ->
            result.invoke(Result.success(CHResultState.CHResultStateBLE(CHEmpty())))
        }
    }
```

## iOS Example

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

## ESP Example

```jsx | pure

``` 