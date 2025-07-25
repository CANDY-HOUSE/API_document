---
nav: Example
group: SESAME API
type:
  title: Bluetooth
  order: 0
title: 129_Password Mode Get
order: 129
---

# 129 Password Mode Get

The phone sends a new instruction to obtain the current addition or verification password mode from ssm_touch, and sesame5 responds with the successful instruction and the mode.

## Sequence diagram

<p align="left" >
  <img src="./src/pw_mode_get/pw_mode_get.png" alt="" title="">
</p>

## Data sent by phone

| Byte |     0     |
| ---- | :-------: |
| Data | item code |

item code: SSM_OS3_FINGERPRINT_MODE_GET (121)

## Contents returned by ssm_touch

| Byte |    4    |  3  |     2     |  1   |    0    |
| ---- | :-----: | :-: | :-------: | :--: | :-----: |
| Data | pw mode | res | item code | type | op code |

type: SSM2_OP_CODE_RESPONSE(0x07)

item code: SSM_OS3_FINGERPRINT_MODE_GET (121)

res: CMD_RESULT_SUCCESS (0x00)

### pw mode

0x00-> Verification mode

0x01-> Addition mode

## iOS, Android, ESP32 Examples
 ## Android Example

```jsx | pure
  override fun keyBoardPassCodeModeGet(result: CHResult<Byte>) {
      if (checkBle(result)) return
      sendCommand(SesameOS3Payload(SesameItemCode.SSM_OS3_PASSCODE_MODE_GET.value, byteArrayOf())) { res ->
          result.invoke(Result.success(CHResultState.CHResultStateBLE(res.payload[0])))
      }
  }
```

## iOS Example

```jsx | pure
    func passCodeModeGet(result: @escaping (CHResult<UInt8>)) {
        if (self.checkBle(result)) { return }

        sendCommand(.init(.SSM_OS3_PASSCODE_MODE_GET)) { response in
            result(.success(CHResultStateNetworks(input: response.data[0])))
        }
    }
```

## ESP Example

```jsx | pure

``` 