---
title: 130. Pw_mode_set
---
# 130. パスワードモード設定 (Password Mode Set)

携帯電話が新たな指示を送信して ssm_touch が現在新規追加モードなのかパスワード確認モードなのかを取得し、sesame5 が指示の成功とモードを返信します。

## シーケンス図

```mermaid
sequenceDiagram
APP->>SesameTouch: {SSM_OS3_PASSCODE_MODE_SET(122),pw_mode}
SesameTouch-->>APP: {命令成功,pw_mode}
```

## 携帯電話からのデータ送信

| Byte |    1    |     0     |
| ---- | :-----: | :-------: |
| Data | pw_mode | item code |

item code : SSM_OS3_PASSCODE_MODE_SET (130)

## ssm_touch からの返信内容

| Byte |    4    |  3  |     2     |  1   |    0    |
| ---- | :-----: | :-: | :-------: | :--: | :-----: |
| Data | pw mode | res | item code | type | op code |

type : SSM2_OP_CODE_RESPONSE(0x07)

item code : SSM_OS3_PASSCODE_MODE_SET (130)

res : CMD_RESULT_SUCCESS (0x00)

## pw mode

0x00->認証モード

0x01->新規追加モード

## iOS、Android、ESP32 の例
 ## Android の例

```jsx | pure
    override fun keyBoardPassCodeModeSet(mode: Byte, result: CHResult<CHEmpty>) {
        if (checkBle(result)) return
        sendCommand(SesameOS3Payload(SesameItemCode.SSM_OS3_PASSCODE_MODE_SET.value, byteArrayOf(mode))) { res ->
            result.invoke(Result.success(CHResultState.CHResultStateBLE(CHEmpty())))
        }
    }
```

## iOS の例

```jsx | pure
    func passCodeModeSet(mode: UInt8, result: @escaping (CHResult<CHEmpty>)) {
        if (self.checkBle(result)) { return }

        sendCommand(.init(.SSM_OS3_PASSCODE_MODE_SET,Data([mode]))) { _ in
            result(.success(CHResultStateNetworks(input: CHEmpty())))
        }
    }
```

## ESP の例

```jsx | pure

``` 
