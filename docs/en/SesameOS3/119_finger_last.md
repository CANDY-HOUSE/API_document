---
title: 119. Finger_last
---
# 119. Finger Last

After ssm_touch finishes sending fingerprint data, it sends Finger Last to the phone to indicate that all fingerprint data has been sent.

## Sequence diagram

```mermaid
sequenceDiagram
SesameTouch->>APP: SSM_OS3_FINGERPRINT_LAST(119)
```
## ssm_touch push content
| Byte | 1         | 0    |
|-------|:---------:|:----:|
| Data  | item_code | type |
| Description | Item code | Type |

type : SSM2_OP_CODE_PUBLISH (0x08)

item code : SSM_OS3_FINGERPRINT_LAST (119)