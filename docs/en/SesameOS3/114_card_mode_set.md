---
title: 114. Card_mode_set
---
# 114. Card Mode Set(Mode)

The phone sends a new command to get whether ssm_touch is currently in add or verify card mode, and sesame5 responds with a successful command and mode.

## Sequence Diagram

```mermaid
sequenceDiagram
APP->>SesameTouch: {SSM3_ITEM_REMOVE_SESAME(114),card_mode}
SesameTouch-->>APP: {命令成功,card_mode}
```

## Mobile Sent Data

| Byte |     1     |     0     |
| ---- | :-------: | :-------: |
| Data | card_mode | item code |

item code : SSM_OS3_CARD_MODE_SET (114)

## ssm_touch Return Content

| Byte |     4     |  3  |     2     |  1   |    0    |
| ---- | :-------: | :-: | :-------: | :--: | :-----: |
| Data | card mode | res | item code | type | op code |

type : SSM2_OP_CODE_RESPONSE(0x07)

item code : SSM_OS3_CARD_MODE_SET (114)

res : CMD_RESULT_SUCCESS (0x00)

## card mode

0x00->Verification mode

0x01->Add mode

## iOS, Android, ESP32 Example
 ## Android Example

```jsx | pure
    override fun cardModeSet(mode: Byte, result: CHResult<CHEmpty>) {
        if (checkBle(result)) return
        sendCommand(SesameOS3Payload(SesameItemCode.SSM_OS3_CARD_MODE_SET.value, byteArrayOf(mode))) { res ->
            result.invoke(Result.success(CHResultState.CHResultStateBLE(CHEmpty())))
        }
    }
```

## iOS Example

```jsx | pure
    func cardsModeSet(mode: UInt8, result: @escaping (CHResult<CHEmpty>)) {
        if (self.checkBle(result)) { return }

        sendCommand(.init(.SSM_OS3_CARD_MODE_SET,Data([mode]))) { _ in
            result(.success(CHResultStateNetworks(input: CHEmpty())))
        }
    }
```

## ESP Example

```jsx | pure

``` 