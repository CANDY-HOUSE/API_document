---
title: 127. Pw_last
---
# 127. Password Last

After ssm_touch finishes sending password data, it sends Password Last to the phone to indicate that all password data has been sent.

## Sequence diagram

```mermaid
sequenceDiagram
SesameTouch->>APP: SSM_OS3_PASSCODE_LAST(127)
```
## ssm_touch push content
| Byte | 1         | 0    |
|-------|:---------:|:----:|
| Data  | item_code | type |
| Description | Item code | Type |

type : SSM2_OP_CODE_PUBLISH (0x08)

item code : SSM_OS3_PASSCODE_LAST (127)