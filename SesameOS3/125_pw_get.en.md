---
nav: Example
group: SESAME API
type:
  title: Bluetooth
  order: 0
title: 125_Password Get
order: 125
---

# 125 Password Get

The phone sends a get password command to ssm_touch, ssm_touch replies with a successful command, and then sends the password data to the phone.

## Sequence Diagram

<p align="left" >
  <img src="./src/pw_get/pw_get.png" alt="" title="">
</p>

## Data Sent from Phone

| Byte |     0     |
| ---- | :-------: |
| Data | item code |

item code : SSM_OS3_PASSCODE_GET (125)

## Return content of ssm_touch

| Byte |      2       |     1     |    0     |
| ---- |:----------: |:-------: |:------: |
| Data |     res      | item_code |   type   |
| Description | Command handling status | Command number | Push type |

type: SSM2_OP_CODE_RESPONSE (0x07)

item code: SSM_OS3_PASSCODE_GET (125)

res: CMD_RESULT_SUCCESS (0x00)

## iOS, Android, ESP32 Examples
 ## Android Example

```jsx | pure
  override fun keyBoardPassCode(result: CHResult<CHEmpty>) {
      if (checkBle(result)) return
      sendCommand(SesameOS3Payload(SesameItemCode.SSM_OS3_PASSCODE_GET.value, byteArrayOf())) { res ->
          result.invoke(Result.success(CHResultState.CHResultStateBLE(CHEmpty())))
      }
  }
```

## iOS Example

```jsx | pure
    func passCodes(result: @escaping (CHResult<CHEmpty>)) {
        if (self.checkBle(result)) { return }

        sendCommand(.init(.SSM_OS3_PASSCODE_GET)) { _ in
            L.d("SSM_OS3_PASSCODE_GET ok")
            result(.success(CHResultStateNetworks(input: CHEmpty())))
        }
    }
```

## ESP Example

```jsx | pure

``` 