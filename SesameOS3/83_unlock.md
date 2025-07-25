---
nav: 示例
group: SESAME API
type:
  title: Bluetooth
  order: 0
title: 83_Unlock (開鎖)
order: 83
---

# 83 Unlock(開鎖)

手機發送 unlock 指令及歷史標籤，手機回傳指令成功，建立開鎖歷史並開鎖。

## 循序圖

```mermaid
sequenceDiagram
APP->>Sesame5: SSM2_ITEM_CODE_UNLOCK(83),历史标签
Sesame5-->>APP: Success
```


## 手機送出資料

| Byte |  7 ~ 1   |     0     |
| ---- | :------: | :-------: |
| Data | 歷史標籤 | item code |

item code : SSM2_ITEM_CODE_UNLOCK (83)

歷史標籤 : 顯示在 sesame5 歷史列表的標籤

## ssm5 回傳內容

| Byte |      2       |     1     |    0     |
| ---- | :----------: | :-------: | :------: |
| Data |     res      | item_code |   type   |
| 說明 | 命令處裡狀態 | 指令編號  | 推送類型 |

type : SSM2_OP_CODE_RESPONSE (0x07)

item code : SSM2_ITEM_CODE_UNLOCK (82)

res : CMD_RESULT_SUCCESS (0x00)

## iOS、Android、ESP32 範例
 

### Android 範例

```java
    override fun unlock(historytag: ByteArray?, result: CHResult<CHEmpty>) {
        if (deviceStatus.value == CHDeviceLoginStatus.UnLogin && isConnectedByWM2) {
            CHAccountManager.cmdSesame(SesameItemCode.unlock, this, sesame2KeyData!!.hisTagC(historytag), result)
        } else {
            if (checkBle(result)) return
//        L.d("hcia", "[ss5][unlock] historyTag:" + sesame2KeyData!!.createHistagV2(historyTag).toHexString())
            sendCommand(SesameOS3Payload(SesameItemCode.unlock.value, sesame2KeyData!!.createHistagV2(historytag)), DeviceSegmentType.cipher) { res ->
                if (res.cmdResultCode == SesameResultCode.success.value) {
                    result.invoke(Result.success(CHResultState.CHResultStateBLE(CHEmpty())))
                } else {
                    result.invoke(Result.failure(NSError(res.cmdResultCode.toString(), "CBCentralManager", res.cmdResultCode.toInt())))
                }
            }
        }
    }
```

### iOS 範例

```jsx | pure
    public func unlock(historytag: Data?, result: @escaping (CHResult<CHEmpty>))  {
        if deviceShadowStatus != nil,
           deviceStatus.loginStatus == .unlogined {
//            L.d("[ss5][toggle][wm2]")
            CHIoTManager.shared.sendCommandToWM2(.unlock, self) { _ in
                result(.success(CHResultStateNetworks(input: CHEmpty())))
            }
            return
        }
        if (self.checkBle(result)) { return }
        let hisTag = Data.createOS2Histag(historytag ?? self.sesame2KeyData?.historyTag)

        sendCommand(.init(.unlock,hisTag)) { responsePayload in
            if responsePayload.cmdResultCode == .success {
                result(.success(CHResultStateBLE(input: CHEmpty())))
            } else {
                result(.failure(self.errorFromResultCode(responsePayload.cmdResultCode)))
            }
        }
    }
```

### ESP 範例

```jsx | pure
void ssm_lock(uint8_t * tag, uint8_t tag_length) {
    // ESP_LOGI(TAG, "[ssm][ssm_lock][%s]", SSM_STATUS_STR(p_ssms_env->ssm.device_status));
    sesame * ssm = &p_ssms_env->ssm;
    if (ssm->device_status >= SSM_LOGGIN) {
        if (tag_length == 0) {
            tag = tag_esp32;
            tag_length = sizeof(tag_esp32);
        }
        ssm->b_buf[0] = SSM_ITEM_CODE_UNLOCK;
        ssm->b_buf[1] = tag_length;
        ssm->c_offset = tag_length + 2;
        memcpy(ssm->b_buf + 2, tag, tag_length);
        talk_to_ssm(ssm, SSM_SEG_PARSING_TYPE_CIPHERTEXT);
    }
}
```


