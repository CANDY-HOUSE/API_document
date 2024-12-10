---
nav: Example
group: SESAME API
type:
  title: Bluetooth
  order: 0
title: 4_history (History)
order: 4
---

# 4 History (History)

The mobile phone sends a history request command, Sesame5 responds with the oldest history in the flash, and deletes that history from the flash.

<!-- In Sesame5 broadcasts, it will let you know whether there is a historical tag that needs to be read, refer to ⦿ advertising field instructions. -->

## Sequential diagram

<p align="left" >
  <img src="./src/history/history.png" alt="" title="">
</p>

## Mobile sends data

| Byte |    1    |     0     |
| ---- | :-----: | :-------: |
| Data | is peek | item code |

item code : SSM2_ITEM_CODE_HISTORY (4)

is peek == true : check the latest history, do not delete history

is peek == false : pop out the oldest history, and delete history

## ssm5 returns content

### if (is peek == true || (is peek == true && there is history in flash))

| Byte |     N ~ 3      |      2       |     1     |    0     |
| ---- | :------------: | :----------: | :-------: | :------: |
| Data |    payload     |     res      | item_code |   type   |
| instructions | data sent to mobile phone | command processing status | instruction number  | push type |

type : SSM2_OP_CODE_RESPONSE (0x07)

item code : SSM2_ITEM_CODE_HISTORY(4)

res : CMD_RESULT_SUCCESS (0x00)

payload(History): the following is the data format of History

#### payload

| Byte |     N ~ 16     |   15 ~ 9    |   8 ~ 5   |    4     |   3 ~ 0    |
| ---- | :------------: | :---------: | :-------: | :------: | :--------: |
| Data |     param      | mech_status |    ts     |   type   |     id     |
| instructions | historical tag, length |  mechanical status   | timestamp | type of history | which history |

#### param

| Byte |  32 ~ 1  |      0      |
| ---- | :------: | :---------: |
| Data |   data   | data_length |
| instructions | history tag |  tag length   |

### if (is peek == true && there is no history in flash)

| Byte |      2       |     1     |    0     |
| ---- | :----------: | :-------: | :------: |
| Data |     res      | item_code |   type   |
| instructions | command processing status | instruction number  | push type |

type : SSM2_OP_CODE_RESPONSE (0x07)

item code : SSM2_ITEM_CODE_HISTORY(4)

res : CMD_RESULT_NOT_FOUND (0x05)

```c

#pragma pack(1)
union ss5_his_param {
    int8_t data_length;
    int8_t data[32];
};
#pragma pack()

#pragma pack(1)
typedef struct {
    uint32_t id;                    /// 4 Bytes
    uint8_t type;                   /// 1 Bytes
    uint32_t ts;                    /// 4 Bytes
    mech_status_t mech_status;      /// 7 Bytes
    union ss5_his_param param;      /// 32 Bytes
} ssm_history;                      /// 4+1+4+7+32 = 48 Bytes
#pragma pack()

```

## iOS、Android、ESP32 example

 <CustomBashOSPlatformHistory ios='true' android='true'  esp32='true'/>

<!-- ## Android example

```jsx | pure
    private fun readHistoryCommand(result: CHResult<CHEmpty>) {
        if (checkBle(result)) return

        sendEncryptCommand(SSM2Payload(SSM2OpCode.read, SesameItemCode.history, if (isInternetAvailable()) byteArrayOf(0x01) else byteArrayOf(0x00))) { res ->
            if (res.cmdResultCode == SesameResultCode.success.value) {
                if (isInternetAvailable()) {
//                    L.d("hcia", "deviceId.toString().uppercase():" + deviceId.toString().uppercase())
                    CHAccountManager.postSS2History(deviceId.toString().uppercase(), res.payload.toHexString()) {}
                }
                val recordId = res.payload.sliceArray(0..3).toBigLong().toInt()
                var historyType = Sesame2HistoryTypeEnum.getByValue(res.payload[4]) ?: Sesame2HistoryTypeEnum.NONE
                val newTime = res.payload.sliceArray(5..12).toBigLong() //4
//                L.d("hcia", "newTime:" + newTime)
                val historyContent = res.payload.sliceArray(13..res.payload.count() - 1)

                if (historyType == Sesame2HistoryTypeEnum.BLE_LOCK) {
                    val payload22 = historyContent.sliceArray(18..39)
                    val locktype = payload22[0] / 30
                    if (locktype == 1) {
                        historyType = Sesame2HistoryTypeEnum.WEB_LOCK
                    }
                    if (locktype == 2) {
                        historyType = Sesame2HistoryTypeEnum.WEB_LOCK
                    }
                    historyContent[18] = (payload22[0] % 30).toByte()

                }
                if (historyType == Sesame2HistoryTypeEnum.BLE_UNLOCK) {
                    val payload22 = historyContent.sliceArray(18..39)
                    val locktype = payload22[0] / 30
                    if (locktype == 1) {
                        historyType = Sesame2HistoryTypeEnum.WEB_UNLOCK
                    }
                    if (locktype == 2) {
                        historyType = Sesame2HistoryTypeEnum.WEB_UNLOCK
                    }
                    historyContent[18] = (payload22[0] % 30).toByte()
                }

                val chHistoryEvent: CHHistoryEvent = parseHistoryContent(historyType, historyContent, newTime, recordId)
                val historyEventToUpload: ArrayList<CHHistoryEvent> = ArrayList()

                historyEventToUpload.add(chHistoryEvent)
                val chHistorysToUI = ArrayList<CHSesame2History>()
                historyEventToUpload.forEach {
                    val ss2historyType = Sesame2HistoryTypeEnum.getByValue(it.type) ?: Sesame2HistoryTypeEnum.NONE
                    val ts = it.timeStamp
                    val recordID = it.recordID
                    val histag = it.historyTag?.base64decodeByteArray()
                    val tmphis = eventToHistory(ss2historyType, ts, recordID, histag)
                    if (tmphis != null) {
                        chHistorysToUI.add(tmphis)
                    }
                }

                historyCallback?.invoke(Result.success(CHResultState.CHResultStateBLE(Pair(chHistorysToUI.toList(), null))))
                if (isInternetAvailable()) {
                    this.readHistoryCommand {}
                }
            } else {
                historyCallback?.invoke(Result.failure(NSError(res.cmdResultCode.toString(), "CBCentralManager", res.cmdResultCode.toInt())))
            }
        }
    }

```

## iOS example
## English Translation

```jsx | pure
func readHistoryCommand(_ result: @escaping (CHResult<CHEmpty>))  {
    if (self.checkBle(result)) { return }
//        L.d("🌇 Reading history")
    URLSession.isInternetReachable { isInternetReachable in
        let deleteHistory = isInternetReachable == true ? "01":"00"

        self.sendCommand(.init(.read, .history, deleteHistory.hexStringtoData())) { (result) in

            if result.cmdResultCode == .success {
                
                let histitem = result.data.copyData

                guard let recordId = histitem[safeBound: 0...3]?.copyData,
                      let type = histitem[safeBound: 4...4]?.copyData,
                      let timeData = histitem[safeBound: 5...12]?.copyData else {
                    return
                }
                let hisContent = histitem[13...].copyData

                let record_Id_Int32: Int32 = recordId.withUnsafeBytes({ $0.bindMemory(to: Int32.self).first! })
                let timestampInt64: UInt64 = timeData.withUnsafeBytes({ $0.bindMemory(to: UInt64.self).first! })

                guard var historyType: Sesame2HistoryTypeEnum = Sesame2HistoryTypeEnum(rawValue: type.bytes[0]) else {
                    return
                }

                var historyContent = hisContent

                if historyType == .BLE_LOCK || historyType == .BLE_UNLOCK {
                    let histag = hisContent[18...]
                    let tagcount_historyTag = histag.copyData
                    let tagcount = UInt8(tagcount_historyTag[0])

                    // Parse lock types
                    let originalTagCount = tagcount % Sesame2HistoryLockOpType.BASE.rawValue
                    let historyOpType = Sesame2HistoryLockOpType(rawValue: tagcount / Sesame2HistoryLockOpType.BASE.rawValue)
                    
                    if historyType == .BLE_LOCK, historyOpType == .WM2 {
                        historyType = Sesame2HistoryTypeEnum.WM2_LOCK
                    } else if historyType == .BLE_LOCK, historyOpType == .WEB {
                        historyType = Sesame2HistoryTypeEnum.WEB_LOCK
                    } else if historyType == .BLE_UNLOCK, historyOpType == .WM2 {
                        historyType = Sesame2HistoryTypeEnum.WM2_UNLOCK
                    } else if historyType == .BLE_UNLOCK, historyOpType == .WEB {
                        historyType = Sesame2HistoryTypeEnum.WEB_UNLOCK
                    }

                    if historyOpType == .WEB || historyOpType == .WM2 {
                        if let type = Sesame2HistoryTypeEnum(rawValue: tagcount / 30) {
                            historyType = type
                        } else {
                            historyType = .NONE
                        }
                    }

                    historyContent = hisContent[...17].copyData + originalTagCount.data + hisContent[19...].copyData
                }
                
                if isInternetReachable == true {
                    self.readHistoryCommand() { _ in }
                }
            } else {
            }
        }
    }
}

## ESP Example

```jsx | pure
void send_read_history_cmd_to_ssm(sesame * ssm) {
    ESP_LOGI(TAG, "[send_read_history_cmd_to_ssm]");
    ssm->c_offset = 2;
    ssm->b_buf[0] = SSM_ITEM_CODE_HISTORY;
    ssm->b_buf[1] = 1;
    talk_to_ssm(ssm, SSM_SEG_PARSING_TYPE_CIPHERTEXT);
}
```