---
nav: Example
group: SESAME API
type:
  title: Bluetooth
  order: 0
title: 11_Autolock (Automatic Lock)
order: 11
---

# 11 Autolock (Automatic Lock)

The phone actively sends the update time (item_code:11) command and autolock seconds. SSM5 starts the autolock timer and returns success.

## Sequence Diagram

<p align="left" >
  <img src="./src/autolock/autolock循序圖.png" alt="" title="">
</p>

## Data Sent by Mobile Phone

| Byte |      2 ~ 1       |     0     |
| ---- | :--------------: | :-------: |
| Data | autolock seconds | item code |

item code : SSM2_ITEM_CODE_AUTOLOCK (11)

## Response from SSM5

| Byte        |            2             |       1        |     0     |
| ----------- | :----------------------: | :------------: | :-------: |
| Data        |           res            |   item_code    |   type    |
| Description | Command processing state | Command number | Push type |

type: SSM2_OP_CODE_RESPONSE (0x07)

item code: SSM2_ITEM_CODE_AUTOLOCK (11)

res: CMD_RESULT_SUCCESS (0x00)

## iOS, Android, ESP32 Examples
 ## Android Example

```java
    override fun autolock(delay: Int, result: CHResult<Int>) {
        if (checkBle(result)) return
        sendCommand(SesameOS3Payload(SesameItemCode.autolock.value, delay.toShort().toReverseBytes()), DeviceSegmentType.cipher) { res ->
            mechSetting?.autoLockSecond = delay.toShort()
            result.invoke(Result.success(CHResultState.CHResultStateBLE(delay)))
        }
    }
```

## iOS Example

```jsx | pure
    public func autolock(historytag: Data?, delay: Int, result: @escaping (CHResult<Int>))  {
        if(checkBle(result)){return}

        var autolockSet = Sesame2Autolock(Int16(delay))
        let payload = autolockSet.toData()

        return sendCommand(.init( .autolock, payload)) { (payload) in
            if payload.cmdResultCode == .success {
                result(.success(CHResultStateBLE(input: delay)))
            }
        }
    }
```

## ESP Example

```jsx | pure
void autolock_sentence(void) {
    //    log_info("autolock_sentence")
    if (g_device_config.mech_setting.auto_lock_second != 0) {
        //        if (g_device_config.mech_status.is_low_battery == false) {/// Low battery does not trigger automatic lockdown
        if (UNLOCKERED) {
            log_info("[autolock][go][%ds]", g_device_config.mech_setting.auto_lock_second)
                    co_timer_set(&autolock_timer, g_device_config.mech_setting.auto_lock_second * 1000,
                            TIMER_ONE_SHOT, autolock_trigger, NULL);
        }
        //        }
    }
}
``` 
