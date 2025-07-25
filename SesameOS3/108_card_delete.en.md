---
nav: Example
group: SESAME API
type:
  title: Bluetooth
  order: 0
title: 108_Card Delete
order: 108
---

# 108 Card Delete

The phone sends a delete command and card ID, ssm_touch responds successfully and deletes the specified card.

## Sequence diagram

<p align="left">
  <img src="./src/card_delete/card_delete.png" alt="" title="">
</p>

## Mobile phone sends data

| Byte | 16 ~ 1  |     0     |
| ---- | :-----: | :-------: |
| Data | Card ID | item code |

item code : SSM_OS3_CARD_DELETE (108)

## ssm_touch returns content

| Byte |      2       |     1     |    0     |
| ---- | :----------: | :-------: | :------: |
| Data |     res      | item_code |   type   |
| Description | Command processing status | Instruction number  | Push type |

type : SSM2_OP_CODE_RESPONSE (0x07)

item code : SSM_OS3_CARD_DELETE (108)

res : CMD_RESULT_SUCCESS (0x00)

## iOS, Android, ESP32 example
 ## Android example

```jsx | pure
  override fun cardDelete(ID: String, result: CHResult<CHEmpty>) {
      if (checkBle(result)) return
      sendCommand(SesameOS3Payload(SesameItemCode.SSM_OS3_CARD_DELETE.value, ID.hexStringToByteArray())) { res ->
          L.d("hcia", "[cardDelete][ID]" + ID)
          result.invoke(Result.success(CHResultState.CHResultStateBLE(CHEmpty())))
      }
  }
```

## iOS example

```jsx | pure
  func cardsDelete(ID: String, result: @escaping (CHResult<CHEmpty>)) {
        if (self.checkBle(result)) { return }

        sendCommand(.init(.SSM_OS3_CARD_DELETE,ID.hexStringtoData())) { _ in
            result(.success(CHResultStateNetworks(input: CHEmpty())))
        }
    }
```

## ESP example

```jsx | pure

``` 