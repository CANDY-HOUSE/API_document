---
title: 126. Pw_notify
---
# 126. Password Notify

ssm_touch proactively pushes password data to the phone.

## Sequence diagram
```mermaid
sequenceDiagram
SesameTouch->>APP: {Password ID,Password Name}
```
## ssm_touch push content
| Byte | N ~ 2   | 1         | 0    |
|-------|:------:|:---------:|:----:|
| Data  | payload | item_code | type |
| Description | Data sent to the phone | Item code | Type |

type : SSM2_OP_CODE_PUBLISH (0x08)

item code : SSM_OS3_FINGERPRINT_NOTIFY (118)

payload : see the table below

### payload
| Byte | (Password ID Len + Password Name Len + 2)  ~ (Password ID Len + 3) | Password ID Len + 2 | (Password ID Len + 1) ~ 2 | 1           | 0         |
|:----:|:------------------------------------------------------:|:---------------:|:---------------------:|:-----------:|:---------:|
| Data | pw_name                                              | pw_name_len   | pw_id               | pw_id_len | pw_type |

#### Example
pw_id_len = 7

pw_name_len = 8

| Byte | 17 ~ 10   | 9             | 8 ~ 2   | 1           | 0         |
|:----:|:---------:|:-------------:|:-------:|:-----------:|:---------:|
| Data | pw_name | pw_name_len | pw_id | pw_id_len | pw_type |

