---
nav: 示例
group: SESAME API
type:
  title: Bluetooth
  order: 0
title: 130_Password Mode Set (模式设置)
order: 130
---

# 130 Password Mode Set(Password Mode Set)

手機發送新增指令獲取 ssm_touch 現在處於新增或是驗證密碼模式，sesame5 回覆指令成功及模式。

## 循序圖

```mermaid
sequenceDiagram
APP->>SesameTouch: {SSM_OS3_PASSCODE_MODE_SET(122),pw_mode}
SesameTouch-->>APP: {命令成功,pw_mode}
```


## 手機送出資料

| Byte |    1    |     0     |
| ---- | :-----: | :-------: |
| Data | pw_mode | item code |

item code : SSM_OS3_PASSCODE_MODE_SET (130)

## ssm_touch 回傳內容

| Byte |    4    |  3  |     2     |  1   |    0    |
| ---- | :-----: | :-: | :-------: | :--: | :-----: |
| Data | pw mode | res | item code | type | op code |

type : SSM2_OP_CODE_RESPONSE(0x07)

item code : SSM_OS3_PASSCODE_MODE_SET (130)

res : CMD_RESULT_SUCCESS (0x00)

## pw mode

0x00->驗證模式

0x01->新增模式

## iOS、Android、ESP32 範例
 

### Android 範例

```jsx | pure
    override fun keyBoardPassCodeModeSet(mode: Byte, result: CHResult<CHEmpty>) {
        if (checkBle(result)) return
        sendCommand(SesameOS3Payload(SesameItemCode.SSM_OS3_PASSCODE_MODE_SET.value, byteArrayOf(mode))) { res ->
            result.invoke(Result.success(CHResultState.CHResultStateBLE(CHEmpty())))
        }
    }
```

### iOS 範例

```jsx | pure
    func passCodeModeSet(mode: UInt8, result: @escaping (CHResult<CHEmpty>)) {
        if (self.checkBle(result)) { return }

        sendCommand(.init(.SSM_OS3_PASSCODE_MODE_SET,Data([mode]))) { _ in
            result(.success(CHResultStateNetworks(input: CHEmpty())))
        }
    }
```

### ESP 範例

```jsx | pure

``` 


