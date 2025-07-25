---
nav: 例示
group: SESAME API
type:
  title: Bluetooth
  order: 0
title: 110_Card Notify (通知)
order: 110
---

# 110 Card Notify （通知カード）

ssm_touch はカード情報をスマートフォンに積極的に通知します。

## シーケンス図

<p align="left" >
  <img src="./src/card_notify/card_notify.png" alt="" title="">
</p>

## ssm_touch が通知する内容

| Byte |      N ~ 2       |     1     |    0     |
| ---- | :--------------: | :-------: | :------: |
| Data |     payload      | item_code |   type   |
| 説明 | スマホへのデータ | 命令番号  | 通知種類 |

type : SSM2_OP_CODE_PUBLISH (0x08)

item code : SSM2_ITEM_CODE_INITIAL (102)

payload : 下表を参照

### payload

| Byte | (Card ID Len + Card Name Len + 2) ~ (Card ID Len + 3) | Card ID Len + 2 | (Card ID Len + 1) ~ 2 |      1      |     0     |
| :--: | :---------------------------------------------------: | :-------------: | :-------------------: | :---------: | :-------: |
| Data |                       card_name                       |  card_name_len  |        card_id        | card_id_len | card_type |

#### 例

card_id_len = 7

card_name_len = 8

| Byte |  17 ~ 10  |       9       |  8 ~ 2  |      1      |     0     |
| :--: | :-------: | :-----------: | :-----: | :---------: | :-------: |
| Data | card_name | card_name_len | card_id | card_id_len | card_type |

## iOS、Android、ESP32 の例
 ## Androidの例

```jsx | pure
if (receivePayload.cmdItCode == SesameItemCode.SSM_OS3_CARD_NOTIFY.value) {
            val card = CHSesameTouchCard(receivePayload.payload)
            (delegate as? CHSesameTouchProDelegate)?.onCardReceive(this, card.cardID, card.cardName, card.cardType)
}
```

## iOSの例

```jsx | pure
    case .SSM_OS3_CARD_NOTIFY:
        let card = CHSesameTouchCard(data:data)
        (self.delegate as? CHSesameTouchProDelegate)?.onCardReceive(device:self, id: card.cardID, name: card.cardName, type: card.cardType)
```

廃止 
