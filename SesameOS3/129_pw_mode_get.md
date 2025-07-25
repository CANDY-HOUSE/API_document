---
nav: 示例
group: SESAME API
type:
  title: Bluetooth
  order: 0
title: 129_Password Mode Get(获取密码模式)
order: 129
---

# 129 Password Mode Get(获取密码模式)

手機發送新增指令獲取 ssm_touch 現在處於新增或是驗證密碼模式，sesame5 回覆指令成功及模式。

## 循序圖

```mermaid
sequenceDiagram
APP->>SesameTouch: {SSM_OS3_PASSCODE_MODE_GET(121),pw_mode}
SesameTouch-->>APP: {命令成功, pw_mode}
```

## 手機送出資料

| Byte |     0     |
| ---- | :-------: |
| Data | item code |

item code : SSM_OS3_FINGERPRINT_MODE_GET (121)

## ssm_touch 回傳內容

| Byte |    4    |  3  |     2     |  1   |    0    |
| ---- | :-----: | :-: | :-------: | :--: | :-----: |
| Data | pw mode | res | item code | type | op code |

type : SSM2_OP_CODE_RESPONSE(0x07)

item code : SSM_OS3_FINGERPRINT_MODE_GET (121)

res : CMD_RESULT_SUCCESS (0x00)

### pw mode

0x00->驗證模式

0x01->新增模式

## iOS、Android、ESP32 範例
 

### Android 範例

```jsx | pure
  override fun keyBoardPassCodeModeGet(result: CHResult<Byte>) {
      if (checkBle(result)) return
      sendCommand(SesameOS3Payload(SesameItemCode.SSM_OS3_PASSCODE_MODE_GET.value, byteArrayOf())) { res ->
          result.invoke(Result.success(CHResultState.CHResultStateBLE(res.payload[0])))
      }
  }
```

### iOS 範例

```jsx | pure
    func passCodeModeGet(result: @escaping (CHResult<UInt8>)) {
        if (self.checkBle(result)) { return }

        sendCommand(.init(.SSM_OS3_PASSCODE_MODE_GET)) { response in
            result(.success(CHResultStateNetworks(input: response.data[0])))
        }
    }
```

### ESP 範例

```jsx | pure

``` 


