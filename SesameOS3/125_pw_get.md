---
nav: 示例
group: SESAME API
type:
  title: Bluetooth
  order: 0
title: 125_Password Get (密码获取)
order: 125
---

# 125 Password Get(密码获取)

手機發送拿密碼指令給 ssm_touch ，ssm_touch 回覆指令成功，之後會將密碼資料傳給手機。

## 循序圖

```mermaid
sequenceDiagram
APP->>SesameTouch: {SSM3_OS3_PASSCODE_GET(125)}
SesameTouch-->>APP: 命令成功
```

## 手機送出資料

| Byte |     0     |
| ---- | :-------: |
| Data | item code |

item code : SSM_OS3_PASSCODE_GET (125)

## ssm_touch 回傳內容

| Byte |      2       |     1     |    0     |
| ---- | :----------: | :-------: | :------: |
| Data |     res      | item_code |   type   |
| 說明 | 命令處裡狀態 | 指令編號  | 推送類型 |

type : SSM2_OP_CODE_RESPONSE (0x07)

item code : SSM_OS3_PASSCODE_GET (125)

res : CMD_RESULT_SUCCESS (0x00)

## iOS、Android、ESP32 範例
 

### Android 範例

```jsx | pure
  override fun keyBoardPassCode(result: CHResult<CHEmpty>) {
      if (checkBle(result)) return
      sendCommand(SesameOS3Payload(SesameItemCode.SSM_OS3_PASSCODE_GET.value, byteArrayOf())) { res ->
          result.invoke(Result.success(CHResultState.CHResultStateBLE(CHEmpty())))
      }
  }
```

### iOS 範例

```jsx | pure
    func passCodes(result: @escaping (CHResult<CHEmpty>)) {
        if (self.checkBle(result)) { return }

        sendCommand(.init(.SSM_OS3_PASSCODE_GET)) { _ in
            L.d("SSM_OS3_PASSCODE_GET ok")
            result(.success(CHResultStateNetworks(input: CHEmpty())))
        }
    }
```

### ESP 範例

```jsx | pure

``` 


