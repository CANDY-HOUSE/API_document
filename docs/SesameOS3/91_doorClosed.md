---
title: 91_doorClosed
---
# Item: Door Closed (關門)

Open Sensor跟Sesame5配對後，Open Sensor偵測到關門，會通知Sesame5。

## Open Sensor與Sesame5互動循序圖
```mermaid
sequenceDiagram
OpenSensor->>Sesame5: SSM2_ITEM_DOOR_CLOSED(91)
Sesame5-->>OpenSensor: Success
```
## Open Sensor發送訊息

| Byte |     0     |
|------|:---------:|
| Data | item code |

item code : SSM2_ITEM_DOOR_CLOSED (91)

## ssm5 回應訊息

| Byte |   2    |     1     |  0   |
|------|:------:|:---------:|:----:|
| Data |  res   | item_code | type |
| 說明   | 命令處裡狀態 |   指令編號    | 推送類型 |

type : SSM2_OP_CODE_RESPONSE (0x07)

item code : SSM2_ITEM_DOOR_CLOSED (91)

res : CMD_RESULT_SUCCESS (0x00)
