---
title: 118. Finger_notify
---
# 118. Finger Notify

ssm_touch は指紋データをスマホへ通知します。

## シーケンス図

```mermaid
sequenceDiagram

SesameTouch->>APP: {CardID,CardName}

```
## ssm_touch が通知する内容
| Byte | N ~ 2   | 1         | 0    |
|-------|:------:|:---------:|:----:|
| Data  | payload | item_code | type |
| 説明 | スマホへのデータ | 命令番号 | 通知種類 |

type : SSM2_OP_CODE_PUBLISH (0x08)

item code : SSM_OS3_FINGERPRINT_NOTIFY (118)

payload : 下表を参照

### payload
| Byte | (Finger ID Len + Finger Name Len + 2)  ~ (Finger ID Len + 3) | Finger ID Len + 2 | (Finger ID Len + 1) ~ 2 | 1           | 0         |
|:----:|:------------------------------------------------------:|:---------------:|:---------------------:|:-----------:|:---------:|
| Data | finger_name                                              | finger_name_len   | finger_id               | finger_id_len | finger_type |

#### 例
finger_id_len = 7

finger_name_len = 8

| Byte | 17 ~ 10   | 9             | 8 ~ 2   | 1           | 0         |
|:----:|:---------:|:-------------:|:-------:|:-----------:|:---------:|
| Data | finger_name | finger_name_len | finger_id | finger_id_len | finger_type |

