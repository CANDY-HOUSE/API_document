---
title: 118_finger_notify
---
# Item: Finger Notify

ssm_touch 主動推送指紋資料給手機。

## 循序圖

```mermaid
sequenceDiagram

SesameTouch->>APP: {CardID,CardName}

```
## ssm_touch 推送內容
| Byte | N ~ 2   | 1         | 0    |
|-------|:------:|:---------:|:----:|
| Data  | payload | item_code | type |
| 說明    | 送給手機的資料 | 指令編號      | 推送類型 |

type : SSM2_OP_CODE_PUBLISH (0x08)

item code : SSM_OS3_FINGERPRINT_NOTIFY (118)

payload : 詳見以下表格

### payload
| Byte | (Finger ID Len + Finger Name Len + 2)  ~ (Finger ID Len + 3) | Finger ID Len + 2 | (Finger ID Len + 1) ~ 2 | 1           | 0         |
|:----:|:------------------------------------------------------:|:---------------:|:---------------------:|:-----------:|:---------:|
| Data | finger_name                                              | finger_name_len   | finger_id               | finger_id_len | finger_type |

#### 範例
finger_id_len = 7

finger_name_len = 8

| Byte | 17 ~ 10   | 9             | 8 ~ 2   | 1           | 0         |
|:----:|:---------:|:-------------:|:-------:|:-----------:|:---------:|
| Data | finger_name | finger_name_len | finger_id | finger_id_len | finger_type |

