---
title: 111_card_last
---
# Item: Card Last

ssm_touch 送完卡片資料後，送Card Last給手機，表示卡片資料已經送完了。

## 循序圖

```mermaid
sequenceDiagram
SesameTouch->>APP:SSM_OS3_CARD_LAST(111)
```

## ssm_touch 推送內容
| Byte | 1         | 0    |
|-------|:---------:|:----:|
| Data  | item_code | type |
| 說明    | 指令編號      | 推送類型 |

type : SSM2_OP_CODE_PUBLISH (0x08)

item code : SSM_OS3_CARD_LAST (111)
