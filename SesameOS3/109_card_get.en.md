---
nav: Example
group: SESAME API
type:
  title: Bluetooth
  order: 0
title: 109_Card Get
order: 109
---

# 109 Card Get

The mobile phone sends a command to pull a card to ssm_touch. After the command is successfully responded, the card data will be sent to the mobile phone.

## Sequence diagram

<p align="left" >
  <img src="./src/card_get/card_get.png" alt="" title="">
</p>

## Data sent by mobile phone

| Byte |     0     |
| ---- | :-------: |
| Data | item code |

item code: SSM_OS3_CARD_GET (109)

## ssm_touch returns

| Byte |      2       |     1     |    0     |
| ---- | :----------: | :-------: | :------: |
| Data |     res      | item_code |   type   |
| Description | Command processing status | Command number  | Push type |

type: SSM2_OP_CODE_RESPONSE (0x07)

item code: SSM_OS3_CARD_GET (109)

res: CMD_RESULT_SUCCESS (0x00)

## iOS, Android, ESP32 examples
 ## Android example

```jsx | pure
    override fun cards(result: CHResult<CHEmpty>) {
        if (checkBle(result)) return
        sendCommand(SesameOS3Payload(SesameItemCode.SSM_OS3_CARD_GET.value, byteArrayOf())) { res ->
            result.invoke(Result.success(CHResultState.CHResultStateBLE(CHEmpty())))
        }
    }
```

## iOS example

```jsx | pure
    func cards(result: @escaping (CHResult<CHEmpty>)) {
        if (self.checkBle(result)) { return }

        sendCommand(.init(.SSM_OS3_CARD_GET)) { _ in
            result(.success(CHResultStateNetworks(input: CHEmpty())))
        }
    }
```

## ESP example

```jsx | pure

``` 