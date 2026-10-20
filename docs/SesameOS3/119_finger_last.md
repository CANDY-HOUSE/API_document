---
title: 119_finger_last
---
# Item: Finger Last

ssm_touch 送完指紋資料後，送Finger Last給手機，表示指紋資料已經送完了。

## 循序圖

```mermaid
sequenceDiagram
SesameTouch->>APP: SSM_OS3_FINGERPRINT_LAST(119)
```
## ssm_touch 推送內容
| Byte | 1         | 0    |
|-------|:---------:|:----:|
| Data  | item_code | type |
| 說明    | 指令編號      | 推送類型 |

type : SSM2_OP_CODE_PUBLISH (0x08)

item code : SSM_OS3_FINGERPRINT_LAST (119)