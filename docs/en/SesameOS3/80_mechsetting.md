---
title: 80. Mechsetting
---
# 80. Mech Setting (Mechanical Settings)

MechSetting is the mechanical setting of Sesame5, including the number of autolock seconds and the angles of unlocking and locking in Sesame5.

There are two situations for transmitting MechSetting:

- The APP actively requests MechSetting from Sesame5.
- Sesame5 actively pushes MechSetting to the mobile phone.

## Sequence diagram of the interaction between the mobile phone and ssm5 transmitting mechsetting

The APP actively requests MechSetting from Sesame5.

```mermaid
sequenceDiagram
APP->>Sesame5: 请求mechSetting
Sesame5-->>APP: 请求成功
Sesame5->>APP: mechSetting
```

Sesame5 actively pushes MechSetting to the mobile phone.

```mermaid
sequenceDiagram
Sesame5->>APP: mechSetting
```

## APP request command

| Byte |    5 ~ 1    |     0     |
| ---- | :---------: | :-------: |
| Data | mechSetting | item code |

item code : SSM2_ITEM_CODE_MECH_SETTING (80)

mechSetting : Mechanical settings

## ssm5 response message

| Byte |      2       |     1     |    0     |
| ---- | :----------: | :-------: | :------: |
| Data |     res      | item_code |   type   |
| Description | Command Processing Status | Command Number  | Push Type |

type : SSM2_OP_CODE_RESPONSE (0x07)

item code : SSM2_ITEM_CODE_MECH_SETTING (80)

res : CMD_RESULT_SUCCESS (0x00)

## ssm5 push content

| Byte |     N ~ 2      |     1     |    0     |
| ---- | :------------: | :-------: | :------: |
| Data |    payload     | item_code |   type   |
| Description | Data sent to mobile phone | Command Number  | Push Type |

type : SSM2_OP_CODE_PUBLISH (0x08)

item code : SSM2_ITEM_CODE_MECH_SETTING (80)

payload : See the following table for details

### payload

| Bit  |    5 ~ 0    |
| ---- | :---------: |
| Data | mechSetting |

## mechSetting Structure Content

MechSetting stores the number of autolock seconds and the angles of unlocking and locking in Sesame5. Below is the structure content of MechSetting:

| Byte |      5 ~ 4      |  3 ~ 2   |  1 ~ 0   |
| :--: | :-------------: | :------: | :------: |
| Data | autolock_second |  unlock  |   lock   |
| Description |  Auto-lock Time   | Unlock Angle | Lock Angle |

```c
typedef struct door_lock_unlock_s {
    int16_t lock;
    int16_t unlock;
} door_lock_unlock_t;

typedef struct mech_setting_s {
    door_lock_unlock_t lock_unlock;
    uint16_t auto_lock_second;
} mech_setting_t;
```

## iOS, Android, ESP32 examples

### Android Example

```kotlin
    override fun onGattSesamePublish(receivePayload: SSM3PublishPayload) {
      super.onGattSesamePublish(receivePayload)
//        L.d("hcia", "[ss5] " + receivePayload.cmdItCode)
      if (receivePayload.cmdItCode == SesameItemCode.mechStatus.value) {
          mechStatus = CHSesame5MechStatus(receivePayload.payload)
          deviceStatus = if (mechStatus!!.isInLockRange) CHDeviceStatus.Locked else CHDeviceStatus.Unlocked
          readHistoryCommand()
      }
      if (receivePayload.cmdItCode == SesameItemCode.mechSetting.value) {
          mechSetting = CHSesame5MechSettings(receivePayload.payload)
      }
  }
```

### iOS Example

```swift
    super.onGattSesamePublish(payload)
    let itemCode = payload.itemCode
    let data = payload.payload
    switch itemCode {
        case .mechStatus:
            mechStatus = Sesame5MechStatus.fromData(data)!
            self.readHistoryCommand(){_ in}
            self.deviceStatus = mechStatus!.isInLockRange  ? .locked() :.unlocked()
        case .mechSetting:
            mechSetting = CHSesame5MechSettings.fromData(data)!
        case .OPS_CONTROL:
            opsSetting = CHSesame5OpsSettings.fromData(data)!
        L.d("[ops]收到上鎖秒數UInt16",opsSetting!.opsLockSecond)
    default:
        L.d("!![ss5][pub][\(itemCode.rawValue)]")
    }
```

### ESP Example

```c
if (cmd_it_code == SSM2_ITEM_CODE_MECH_SETTING) {
      log_info_array_ex("mech_setting", ss5->b_buf, ss5->c_offset)
      memcpy(&ss5->mechSetting, ss5->b_buf, 6);   //mech_setting 6bytes
  }

static void ssm_set_angle(sesame *ssm) {
  if (ssm->ss2_device_status >= SSM2_LOGGIN) {
      log_info("[ss5][ss5_set_angle]")
      ssm->c_offset = 7;
      ssm->b_buf[0] = SSM2_ITEM_CODE_MECH_SETTING;
      memcpy(ssm->b_buf + 1, ssm->mechSetting, 6);
      talk_to_ssm(ssm, SSM2_SEG_PARSING_TYPE_CIPHERTEXT);
  }
}
void tell_mobile_mech_setting(mobile_app *mobile) {
  ss5_publish *ss5_pub = (ss5_publish *) ble_tx_buf;
  ss5_pub->type = SSM2_OP_CODE_PUBLISH;
  ss5_pub->it = SSM2_ITEM_CODE_MECH_SETTING;
  ss5_pub->payload.mech_setting = g_device_config.mech_setting;
//    memcpy(&ble_tx_buf[2], &g_device_config.mech_setting, sizeof(mech_setting_t));
  talk_to_mobile(mobile, SSM2_SEG_PARSING_TYPE_CIPHERTEXT, (uint8_t *) ss5_pub,
                 (sizeof(mech_setting_t) + offsetof(ss5_publish, payload)));
}
```
