---
nav: 例示
group: SESAME API
type:
  title: Bluetooth
  order: 0
title: 108_Card Delete (削除)
order: 108
---

# 108 Card Delete （カードの削除）

モバイル端末から削除命令とカード ID が送られ、ssm_touch は成功指示を返信し指定されたカードを削除します。

## シーケンス図

<p align="left" >
  <img src="./src/card_delete/card_delete.png" alt="" title="">
</p>

## モバイルからのデータ送信

| Byte | 16 ~ 1  |     0     |
| ---- | :-----: | :-------: |
| Data | Card ID | item code |

item code : SSM_OS3_CARD_DELETE (108)

## ssm_touch からの返信内容

| Byte |       2        |     1     |     0      |
| ---- | :------------: | :-------: | :--------: |
| Data |      res       | item_code |    type    |
| 説明 | 命令の処理状態 | 命令番号  | 送信タイプ |

type : SSM2_OP_CODE_RESPONSE (0x07)

item code : SSM_OS3_CARD_DELETE (108)

res : CMD_RESULT_SUCCESS (0x00)

## iOS、Android、ESP32 の例
 ## Androidの例

```jsx | pure
  override fun cardDelete(ID: String, result: CHResult<CHEmpty>) {
      if (checkBle(result)) return
      sendCommand(SesameOS3Payload(SesameItemCode.SSM_OS3_CARD_DELETE.value, ID.hexStringToByteArray())) { res ->
          L.d("hcia", "[cardDelete][ID]" + ID)
          result.invoke(Result.success(CHResultState.CHResultStateBLE(CHEmpty())))
      }
  }
```

## iOSの例

```jsx | pure
  func cardsDelete(ID: String, result: @escaping (CHResult<CHEmpty>)) {
        if (self.checkBle(result)) { return }

        sendCommand(.init(.SSM_OS3_CARD_DELETE,ID.hexStringtoData())) { _ in
            result(.success(CHResultStateNetworks(input: CHEmpty())))
        }
    }
```

## ESPの例

```jsx | pure

``` 
