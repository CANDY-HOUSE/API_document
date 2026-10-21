---
title: 112. Card_first
---
# 112. Card First

After receiving `109_card_get`, ssm_touch sends the Card First command to indicate that it is about to start sending card data to the phone (see `110_card_notify`).

## Sequence diagram
```mermaid
sequenceDiagram
SesameTouch->>APP: SSM_OS3_CARD_FIRST(112)
```

## ssm_touch push content
| Byte | 1         | 0    |
|-------|:---------:|:----:|
| Data  | item_code | type |
| Description | Item code | Type |

type : SSM2_OP_CODE_PUBLISH (0x08)

item code : SSM_OS3_CARD_FIRST (112)

