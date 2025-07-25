---
nav: Example
group: SESAME API
type:
  title: Bluetooth
  order: 0
title: 124_Password Delete
order: 124
---

# 124 Password Delete

The mobile end sends the password ID to be deleted, and ssm_touch returns a success message, deleting the specified password.

## Sequence diagram

<p align="left" >
  <img src="./src/pw_delete/pw_delete.png" alt="" title="">
</p>

## Mobile send out data

| Byte |   1   |     0     |
| ---- | :---: | :-------: |
| Data | pw_id | item code |

item code : SSM_OS3_PASSCODE_DELETE (124)

pw_id : Password ID to be deleted

## ssm_touch return content

| Byte |      2       |     1     |    0     |
| ---- | :----------: | :-------: | :------: |
| Data |     res      | item_code |   type   |
| Note | Command processing status | Instruction number  | Push type |

type : SSM2_OP_CODE_RESPONSE (0x07)

item code : SSM_OS3_PASSCODE_DELETE (124)

res : CMD_RESULT_SUCCESS (0x00)

## iOS、Android、ESP32 Example
 ## Android Example

```jsx | pure
    override fun keyBoardPassCodeDelete(ID: String, result: CHResult<CHEmpty>) {
        if (checkBle(result)) return
        sendCommand(SesameOS3Payload(SesameItemCode.SSM_OS3_PASSCODE_DELETE.value, ID.hexStringToByteArray())) { res ->
            result.invoke(Result.success(CHResultState.CHResultStateBLE(CHEmpty())))
        }
    }
```

## iOS Example

```jsx | pure
    func passCodeDelete(ID: String, result: @escaping (CHResult<CHEmpty>)) {
        if (self.checkBle(result)) { return }

        sendCommand(.init(.SSM_OS3_PASSCODE_DELETE,ID.hexStringtoData())) { _ in
            result(.success(CHResultStateNetworks(input: CHEmpty())))
        }
    }
```

## ESP Example

```jsx | pure

``` 