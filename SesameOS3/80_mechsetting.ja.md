---
nav: サンプル
group: SESAME API
type:
  title: Bluetooth
  order: 0
title: 80_Mech Setting (メカニカル設定)
order: 80
---

# 80 Mech Setting (メカニカル設定)

mechSetting は Sesame5 のメカニカル設定で、autolock の秒数と sesame5 の開錠と閉錠の角度を含んでいます。

mechsetting の状況は、2 つの方法で伝えられます:

- APP 側から Sesame5 への mechSetting のリクエスト。
- Sesame5 からスマホへ mechSetting をプッシュする。

## スマホと ssm5 が mechsetting を交換するインタラクションシーケンス図

APP 側から Sesame5 への mechSetting のリクエスト。

<p align="left" >
  <img src="./src/mechSetting/APP_to_SSM5.png" alt="" title="">
</p>

Sesame5 からスマホへ mechSetting をプッシュする。

<p align="left" >
  <img src="./src/mechSetting/SSM5_to_APP.png" alt="" title="">
</p>

## APP リクエストコマンド

| Byte |    5 ~ 1    |     0     |
| ---- | :---------: | :-------: |
| Data | mechSetting | item code |

item code : SSM2_ITEM_CODE_MECH_SETTING (80)

mechSetting : メカニカル設定

## ssm5 の応答メッセージ

| Byte |        2         |     1     |       0        |
| ---- | :--------------: | :-------: | :------------: |
| Data |       res        | item_code |      type      |
| 説明 | コマンド処理状態 | 設定番号  | プッシュタイプ |

type : SSM2_OP_CODE_RESPONSE (0x07)

item code : SSM2_ITEM_CODE_MECH_SETTING (80)

res : CMD_RESULT_SUCCESS (0x00)

## ssm5 のプッシュ内容

| Byte |        N ~ 2         |     1     |       0        |
| ---- | :------------------: | :-------: | :------------: |
| Data |       payload        | item_code |      type      |
| 説明 | モバイルに送るデータ | 設定番号  | プッシュタイプ |

type : SSM2_OP_CODE_PUBLISH (0x08)

item code : SSM2_ITEM_CODE_MECH_SETTING (80)

payload : 以下の表を参照

### payload

| Bit  |    5 ~ 0    |
| ---- | :---------: |
| Data | mechSetting |

## mechSetting 構造体内容

mechSetting には autolock の秒数と sesame5 の開錠と閉錠の角度が格納されており、以下が mechSetting の構造体内容となります。

| Byte |      5 ~ 4      |  3 ~ 2   |  1 ~ 0   |
| :--: | :-------------: | :------: | :------: |
| Data | autolock_second |  unlock  |   lock   |
| 説明 | 自動ロック時間  | 開錠角度 | 閉錠角度 |

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

## iOS、Android、ESP32 の例
 ## Androidの例

```java
    override fun configureLockPosition(lockTarget: Short, unlockTarget: Short, result: CHResult<CHEmpty>) {
        val cmd = SesameOS3Payload(SesameItemCode.mechSetting.value, lockTarget.toReverseBytes() + unlockTarget.toReverseBytes())
        sendCommand(cmd, DeviceSegmentType.cipher) { res ->
            if (res.cmdResultCode == SesameResultCode.success.value) {
                mechSetting?.lockPosition = lockTarget
                mechSetting?.unlockPosition = unlockTarget
                result.invoke(Result.success(CHResultState.CHResultStateBLE(CHEmpty())))
            } else {
                result.invoke(Result.failure(NSError(res.cmdResultCode.toString(), "CBCentralManager", res.cmdResultCode.toInt())))
            }
        }
    }
```

```java
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

```java
class CHSesame5MechSettings(data: ByteArray) {
    var lockPosition: Short = bytesToShort(data[0], data[1])
    var unlockPosition: Short = bytesToShort(data[2], data[3])
    var autoLockSecond: Short = bytesToShort(data[4], data[5])
}
```

## iOSの例

```jsx | pure
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

```jsx | pure
   public func configureLockPosition(lockTarget: Int16, unlockTarget: Int16,result: @escaping (CHResult<CHEmpty>)) {
        if(checkBle(result)){return}

        var configure = CHSesame5LockPositionConfiguration(lockTarget: lockTarget, unlockTarget: unlockTarget)
        let payload = configure.toData()

        sendCommand(.init(.mechSetting, payload)) { (responsePayload) in
            if responsePayload.cmdResultCode == .success {
                result(.success(CHResultStateBLE(input: CHEmpty())))
            } else {
                result(.failure(self.errorFromResultCode(responsePayload.cmdResultCode)))
            }

        }
    }
```

```jsx | pure
    case .mechSetting:
        guard data.count > 0 else { break }
        mechSetting?.wifiSSID = String(data: data[0..<30], encoding: .utf8)
        mechSetting?.wifiPassword = String(data: data[30..<60], encoding: .utf8)
        (delegate as? CHWifiModule2Delegate)?.onAPSettingChanged(device: self, settings: mechSetting!)
```

## ESPの例

```jsx | pure
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
