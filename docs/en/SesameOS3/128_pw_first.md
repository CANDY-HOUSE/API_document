---
title: 128. Pw_first
---
# 128. Password Start

After receiving `125_pw_get`, ssm_touch sends the Password Start command to indicate that it is about to start sending password data to the phone (see `126_pw_notify`).

## Sequence diagram
```mermaid
sequenceDiagram
SesameTouch->>APP: SSM_OS3_PASSCODE_FIRST(128)
```

## ssm_touch push content
| Byte | 1         | 0    |
|-------|:---------:|:----:|
| Data  | item_code | type |
| Description | Item code | Type |

type : SSM2_OP_CODE_PUBLISH (0x08)

item code : SSM_OS3_PASSCODE_FIRST (128)