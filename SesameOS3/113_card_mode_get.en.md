---
nav: Example
group: SESAME API
type:
  title: Bluetooth
  order: 0
title: 113_Card Mode Get (Card Mode)
order: 113
---

# 113 Card Mode Get(Card Mode)

A mobile phone sends a new command to get whether ssm_touch is currently in the add or card verification mode, and sesame5 replies with the successful command and mode.

## Sequence Diagram

<p align="left" >
  <img src="./src/card_mode_get/card_mode_get.png" alt="" title="">
</p>

## Mobile Sends Out Data

| Byte |     0     |
| ---- | :-------: |
| Data | item code |

item code : SSM_OS3_CARD_MODE_GET (113)

## ssm_touch Return Content

| Byte |     4     |  3  |     2     |  1   |    0    |
| ---- | :-------: | :-: | :-------: | :--: | :-----: |
| Data | card mode | res | item code | type | op code |

type : SSM2_OP_CODE_RESPONSE(0x07)

item code : SSM_OS3_CARD_MODE_GET (113)

res : CMD_RESULT_SUCCESS (0x00)

### card mode

0x00->Verification Mode

0x01->Add Mode

## iOS, Android, ESP32 Examples
 ## Android Example

```jsx | pure
  override fun cardModeGet(result: CHResult<Byte>) {
      if (checkBle(result)) return
      sendCommand(SesameOS3Payload(SesameItemCode.SSM_OS3_CARD_MODE_GET.value, byteArrayOf())) { res ->
          result.invoke(Result.success(CHResultState.CHResultStateBLE(res.payload[0])))
      }
  }
```

## iOS Example

```jsx | pure
    func cardsModeGet(result: @escaping (CHResult<UInt8>)) {
        if (self.checkBle(result)) { return }

        sendCommand(.init(.SSM_OS3_CARD_MODE_GET)) { response in
            result(.success(CHResultStateNetworks(input: response.data[0])))
        }
    }
```

Deprecated 