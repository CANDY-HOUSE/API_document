---
title: 112. Card_first
---
# 112. Card First

ssm_touch は `109_card_get` を受信すると Card First コマンドを送信し、これからカードデータをスマホへ送信することを示します（`110_card_notify` を参照）。

## シーケンス図
```mermaid
sequenceDiagram
SesameTouch->>APP: SSM_OS3_CARD_FIRST(112)
```

## ssm_touch が通知する内容
| Byte | 1         | 0    |
|-------|:---------:|:----:|
| Data  | item_code | type |
| 説明 | 命令番号 | 通知種類 |

type : SSM2_OP_CODE_PUBLISH (0x08)

item code : SSM_OS3_CARD_FIRST (112)

