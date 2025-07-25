---
nav: 例示
group: SESAME API
type:
  title: Bluetooth
  order: 0
title: 130_Password Mode Set(パスワードモード設定)
order: 130
---

# 130 パスワードモード設定 (Password Mode Set)

携帯電話が新たな指示を送信して ssm_touch が現在新規追加モードなのかパスワード確認モードなのかを取得し、sesame5 が指示の成功とモードを返信します。

## シーケンス図

<p align="left" >
  <img src="./src/pw_mode_set/pw_mode_set.png" alt="" title="">
</p>

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
