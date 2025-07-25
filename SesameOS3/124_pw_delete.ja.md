---
nav: サンプル
group: SESAME API
type:
  title: Bluetooth
  order: 0
title: 124_Password Delete(密码删除)
order: 124
---

# 124 パスワード削除(密码删除)

携帯電話から削除するパスワード ID を送信し、ssm_touch は成功メッセージを返し、指定したパスワードを削除します。

## シーケンス図

<p align="left" >
  <img src="./src/pw_delete/pw_delete.png" alt="" title="">
</p>

## 携帯電話からのデータ送信

| Byte |   1   |     0     |
| ---- | :---: | :-------: |
| Data | pw_id | item code |

item code : SSM_OS3_PASSCODE_DELETE (124)

pw_id : 削除するパスワード ID

## ssm_touch からの返信内容

| Byte |        2         |     1     |      0       |
| ---- | :--------------: | :-------: | :----------: |
| Data |       res        | item_code |     type     |
| 説明 | コマンド処理状態 | 指令番号  | プッシュ種類 |

type : SSM2_OP_CODE_RESPONSE (0x07)

item code : SSM_OS3_PASSCODE_DELETE (124)

res : CMD_RESULT_SUCCESS (0x00)

## iOS、Android、ESP32 の例
 ## Androidの例

```jsx | pure
    override fun keyBoardPassCodeDelete(ID: String, result: CHResult<CHEmpty>) {
        if (checkBle(result)) return
        sendCommand(SesameOS3Payload(SesameItemCode.SSM_OS3_PASSCODE_DELETE.value, ID.hexStringToByteArray())) { res ->
            result.invoke(Result.success(CHResultState.CHResultStateBLE(CHEmpty())))
        }
    }
```

## iOSの例

```jsx | pure
    func passCodeDelete(ID: String, result: @escaping (CHResult<CHEmpty>)) {
        if (self.checkBle(result)) { return }

        sendCommand(.init(.SSM_OS3_PASSCODE_DELETE,ID.hexStringtoData())) { _ in
            result(.success(CHResultStateNetworks(input: CHEmpty())))
        }
    }
```

## ESPの例

```jsx | pure

``` 
