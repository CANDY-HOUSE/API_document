---
title: 116. Finger_delete
---
# 116. Finger Delete (Fingerprint Deletion)

The mobile terminal sends the fingerprint ID to be deleted, ssm_touch returns a successful message, deleting the designated fingerprint.

## Sequence Diagram

```mermaid
sequenceDiagram
APP->>SesameTouch: {SSM3_OS3_FINGERPRINT_DELETE(116),ID}
SesameTouch-->>APP: 命令成功
```

## Data sent by the Mobile

| Byte |     1     |     0     |
| ---- | :-------: | :-------: |
| Data | finger_id | item code |

item code : SSM_OS3_FINGERPRINT_DELETE (116)

finger_id : The fingerprint ID to be deleted

## The contents returned by ssm_touch

| Byte |      2       |     1     |    0     |
| ---- | :----------: | :-------: | :------: |
| Data |     res      | item_code |   type   |
| Description | Command processing status | Instruction number  | Push type |

type : SSM2_OP_CODE_RESPONSE (0x07)

item code : SSM_OS3_FINGERPRINT_DELETE (116)

res : CMD_RESULT_SUCCESS (0x00)

## iOS, Android, ESP32 Examples

### Android Example

```kotlin
    override fun cardModeGet(result: CHResult<Byte>) {
      if (checkBle(result)) return
      sendCommand(SesameOS3Payload(SesameItemCode.SSM_OS3_CARD_MODE_GET.value, byteArrayOf())) { res ->
          result.invoke(Result.success(CHResultState.CHResultStateBLE(res.payload[0])))
      }
  }
```

### iOS Example

```swift
    func fingerPrintDelete(ID: String, result: @escaping (CHResult<CHEmpty>)) {
      if (self.checkBle(result)) { return }
      sendCommand(.init(.SSM_OS3_FINGERPRINT_DELETE,ID.hexStringtoData())) { _ in
          result(.success(CHResultStateNetworks(input: CHEmpty())))
      }
  }
```

### ESP Example

```c
    func fingerPrintDelete(ID: String, result: @escaping (CHResult<CHEmpty>)) {
      if (self.checkBle(result)) { return }
      sendCommand(.init(.SSM_OS3_FINGERPRINT_DELETE,ID.hexStringtoData())) { _ in
          result(.success(CHResultStateNetworks(input: CHEmpty())))
      }
  }
```
