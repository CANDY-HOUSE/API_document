---
title: 119. Finger_last
---
# 119. Finger Last

ssm_touch は指紋データを送り終えると、Finger Last をスマホへ送信し、指紋データの送信が完了したことを示します。

## シーケンス図

```mermaid
sequenceDiagram
SesameTouch->>APP: SSM_OS3_FINGERPRINT_LAST(119)
```
## ssm_touch が通知する内容
| Byte | 1         | 0    |
|-------|:---------:|:----:|
| Data  | item_code | type |
| 説明 | 命令番号 | 通知種類 |

type : SSM2_OP_CODE_PUBLISH (0x08)

item code : SSM_OS3_FINGERPRINT_LAST (119)