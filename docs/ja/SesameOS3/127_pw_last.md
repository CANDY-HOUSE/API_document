---
title: 127. Pw_last
---
# 127. Password Last

ssm_touch はパスワードデータを送り終えると、Password Last をスマホへ送信し、パスワードデータの送信が完了したことを示します。

## シーケンス図

```mermaid
sequenceDiagram
SesameTouch->>APP: SSM_OS3_PASSCODE_LAST(127)
```
## ssm_touch が通知する内容
| Byte | 1         | 0    |
|-------|:---------:|:----:|
| Data  | item_code | type |
| 説明 | 命令番号 | 通知種類 |

type : SSM2_OP_CODE_PUBLISH (0x08)

item code : SSM_OS3_PASSCODE_LAST (127)