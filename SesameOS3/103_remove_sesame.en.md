---
nav: Example
group: SESAME API
type:
  title: Bluetooth
  order: 0
title: 103_Remove Sesame (Delete)
order: 103
---

# 103 Remove Sesame (Delete Device)

The phone sends a delete command and device name, sesame5 responds that the command is successful, and ssm_touch actively pushes the Sesame list to the phone. (For details on the Sesame list, see `102_pub_ssm_key`.)

## Sequence Diagram

<p align="left">
  <img src="./src/rm_sesame/rm_sesame.png" alt="" title="">
</p>

## Data Sent by Phone

| Byte |   16 ~ 1    |     0     |
| ---- | :---------: | :-------: |
| Data | device_name | item code |

item code : SSM3_ITEM_REMOVE_SESAME (103)

## Returned Content from ssm_touch

| Byte |      2       |     1     |    0     |
| ---- | :----------: | :-------: | :------: |
| Data |     res      | item_code |   type   |
| Explanation | Command processing status | Instruction number  | Push type |

type: SSM2_OP_CODE_RESPONSE (0x07)

item code: SSM3_ITEM_REMOVE_SESAME (103)

res: CMD_RESULT_SUCCESS (0x00)

## Examples for iOS, Android, and ESP32
 ## Android Example

```jsx | pure
  override fun removeSesame(tag: String, result: CHResult<CHEmpty>) {
      if (checkBle(result)) return
      if (ssm2KeysMap.get(tag)!!.get(0).toInt() == 0x04) {// ss4
          val noDashUUID = tag.replace("-", "")
          val b64k = noDashUUID.hexStringToByteArray().base64Encode().replace("=", "")
          val ssmIRData = b64k.toByteArray()
          sendCommand(SesameOS3Payload(SesameItemCode.REMOVE_SESAME.value, ssmIRData)) { ssm2ResponsePayload ->
              result.invoke(Result.success(CHResultState.CHResultStateBLE(CHEmpty())))
          }
      } else {//ss5
          val noDashUUID = tag.replace("-", "")
          sendCommand(SesameOS3Payload(SesameItemCode.REMOVE_SESAME.value, noDashUUID.hexStringToByteArray())) { ssm2ResponsePayload ->
              result.invoke(Result.success(CHResultState.CHResultStateBLE(CHEmpty())))
          }
      }
  }
```

## iOS Example

```jsx | pure
    func removeSesame(tag: String, result: @escaping CHResult<CHEmpty>) {
        if (self.checkBle(result)) { return }
        L.d("[hub3][removeSesame]",tag)
        let noDashUUID = tag.replacingOccurrences(of: "-", with: "", options: [], range: nil)
        sendCommand(.init(.removeSesame,noDashUUID.hexStringtoData())) { (response) in
            result(.success(CHResultStateNetworks(input: CHEmpty())))
        }
    }
```

## ESP Example

```jsx | pure
        log_info_array_ex("[main][SSM3_ITEM_REMOVE_SESAME]", p_param->data, p_param->length)
        appm_stop_init();
        co_timer_set(&dis_timer, 1, TIMER_ONE_SHOT, delay_disconnect_all_ssm, NULL);

        talk_to_mob(p_param->conidx, SSM2_SEG_PARSING_TYPE_CIPHERTEXT, ble_tx_buf, 3);
        ssm_remove_key(p_param->data, p_param->length);
        publish_ssm_keys(p_param->conidx);
``` 