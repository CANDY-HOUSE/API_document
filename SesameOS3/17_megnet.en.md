---
nav: Example
group: SESAME API
type:
  title: Bluetooth
  order: 0
title: 17_Megnet (Angle Correction)
order: 17
---

# 17 Megnet (Angle Correction)

The mobile phone sends a sesame5 angle correction command. After the correction is completed, it responds successfully, and the sesame5 actively sends mechstatus (mechanical status)

For details on mechStatus, please refer to the 80_mechStatus description

## Sequence Diagram

<p align="left" >
  <img src="./src/megnet/megnet.png" alt="" title="">
</p>

## Mobile Sends Data

| Byte |     0     |
| ---- | :-------: |
| Data | item code |

item code: SSM2_ITEM_CODE_MAGNET (17)

## ssm5 Response Content

| Byte |      2       |     1     |    0     |
| ---- | :----------: | :-------: | :------: |
| Data |     res      | item_code |   type   |
| Description | Command Handling Status | Instruction Number  | Push Type |

type: SSM2_OP_CODE_RESPONSE (0x07)

item code: SSM2_ITEM_CODE_MAGNET (17)

res: CMD_RESULT_SUCCESS (0x00)

## iOS, Android, ESP32 Examples
 ## Android Example

```java
    override fun magnet(result: CHResult<CHEmpty>) {
        if (checkBle(result)) return
        sendCommand(SesameOS3Payload(SesameItemCode.magnet.value, byteArrayOf()), DeviceSegmentType.cipher) { res ->
            result.invoke(Result.success(CHResultState.CHResultStateBLE(CHEmpty())))
        }
    }
```

## iOS Example

```jsx | pure
    func magnet(result: @escaping (CHResult<CHEmpty>)) {
        if(checkBle(result)){return}

        sendCommand(.init(.magnet)) { responsePayload in
            if responsePayload.cmdResultCode == .success {
                result(.success(CHResultStateBLE(input: CHEmpty())))
            } else {
                result(.failure(self.errorFromResultCode(responsePayload.cmdResultCode)))
            }
        }
    }
```

## ESP Example

```jsx | pure
if (src_id == SSM2_ITEM_CODE_MAGNET) {
        app_ss5_magnet();// measure and update magnet angle
        tell_device_status_to_mobile();// announce the angle again
    }
if (cmd_it_code == SSM2_ITEM_CODE_MAGNET) {
    talk_to_mobile(mobile, SSM2_SEG_PARSING_TYPE_CIPHERTEXT, (uint8_t *) ss5_res,
                                   offsetof(ss5_response, payload));
}
``` 