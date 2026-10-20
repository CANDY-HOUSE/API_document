---
title: Android Version
---
# Android Version SesameSDK

![Sesame device](https://github.com/CANDY-HOUSE/.github/blob/main/profile/images/SesameSDK.png?raw=true 'Sesame')

## Download App

- Sesame app on <img src="https://img.shields.io/badge/Play Store-34A853?logo=googleplay&logoColor=white"/> [https://play.google.com/store/apps/details?id=co.candyhouse.sesame2](https://play.google.com/store/apps/details?id=co.candyhouse.sesame2)
- Sesame app on <img src="https://img.shields.io/badge/Google Drive-1A73E8?logo=googledrive&logoColor=white"/> [https://drive.google.com/file/d/15aRQl6aWBVwJSE4l3ZL-eMisPoe-f2lW/](https://drive.google.com/file/d/15aRQl6aWBVwJSE4l3ZL-eMisPoe-f2lW/)

## Installation Process

### Platform Installation Requirements

- <img src="https://img.shields.io/badge/Kotlin-1.4-7F52FF" />.
- <img src="https://img.shields.io/badge/Bluetooth-4.0LE +-0082FC" />
- <img src="https://img.shields.io/badge/Android-5.0 +-3DDC84" />
- <img src="https://img.shields.io/badge/Android Studio-2022 +-3DDC84" />

### 1. Installation Dependencies

```jsx {5} | pure
   implementation project(':sesame-sdk')
```

### 2. Set Android Permissions in manifest.xml

```jsx {5} | pure
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT " />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
```

### 3. Initialization

```jsx {5} | pure
   override fun onCreate()
   {
    super.onCreate()
    CHBleManager(this)
   }
```

CHBleManager initialization can verify if Bluetooth is running normally on the device, if permissions are obtained from the device, and if Bluetooth has been launched. If everything is fine, the Bluetooth scan will begin.
Bluetooth Service Uuid:0000FD81-0000-1000-8000-00805f9b34fb

```jsx {5} | pure
bluetoothAdapter.bluetoothLeScanner.startScan(
  mutableListOf(
    ScanFilter.Builder()
      .setServiceUuid(
        ParcelUuid(UUID.fromString('0000FD81-0000-1000-8000-00805f9b34fb')),
      )
      .build(),
  ),
  ScanSettings.Builder()
    .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
    .build(),
  bleScanner,
);
```

The devices scanned by bleScanner are placed in CHDeviceMap.

### 4. New devices are added to the ScanNewDeviceFG object, and Adapter is filtered by CHDeviceMap (it.rssi!=nil) to display the list data.

```jsx {5} | pure
    private var mDeviceList = ArrayList<CHDevices>()
    CHBleManager.delegate = object : CHBleManagerDelegate {
            override fun didDiscoverUnRegisteredCHDevices(devices: List<CHDevices>) {
                mDeviceList.clear()
                mDeviceList.addAll(devices.filter { it.rssi != null }
                    .filter { it.rssi!! > -65 }///The registration list only shows close distances
                )
                mDeviceList.sortBy { it.getDistance() }
                mDeviceList.firstOrNull()?.connect { }
                leaderboard_list.post((leaderboard_list.adapter as GenericAdapter<*>)::notifyDataSetChanged)
            }
        }
    }
```

### 5. The order of connection with the device is to execute connect, and monitor the status of the device with onBleDeviceStatusChanged.

```jsx {5} | pure

    device.connect { }
    doRegisterDevice(device)
    device.delegate = object : CHDeviceStatusDelegate {
        override fun onBleDeviceStatusChanged(device: CHDevices, status: CHDeviceStatus, shadowStatus: CHDeviceStatus?) {
            if (status == CHDeviceStatus.ReadyToRegister) {
                doRegisterDevice(device)
            }
        }
    }


   fun  doRegisterDevice(device: CHDevices){
       device.register {
        it.onSuccess { // Registration success
        }
        it.onFailure { //  Registration failed
        }
       }
   }
```

### 6. Registration success callback, the device model of the membership product can be judged based on the success or failure callback of the device.register registration command.

```jsx {5} | pure
    (device as? CHWifiModule2)?.let {
        // CHWifiModule2
    }
    (device as? CHSesame2)?.let {
        // CHSesame2
    }
    (device as? CHSesame5)?.let {
        // CHSesame5
    }
    (device as? CHSesameTouchPro)?.let {
        // CHSesameTouchPro
    }

```

### 7. Lock and Unlock

Once you have paired the device, you can lock and unlock it through the APP

#### Lock

```jsx {5} | pure

    public func lock(historytag: Data?, result: @escaping (CHResult<CHEmpty>))  {
      if deviceShadowStatus != nil,
         deviceStatus.loginStatus == .unlogined {
          CHIoTManager.shared.sendCommandToWM2(.lock, self) { _ in
              result(.success(CHResultStateNetworks(input: CHEmpty())))
          }
          return
      }
      if (self.checkBle(result)) { return }
      let hisTag = Data.createOS2Histag(historytag ?? self.sesame2KeyData?.historyTag)

      sendCommand(.init(.lock,hisTag)) { responsePayload in
          if responsePayload.cmdResultCode == .success {
              result(.success(CHResultStateBLE(input: CHEmpty())))
          } else {
              result(.failure(self.errorFromResultCode(responsePayload.cmdResultCode)))
          }
      }
  }

```

#### Unlock

```jsx {5} | pure

    override fun unlock(historytag: ByteArray?, result: CHResult<CHEmpty>) {
      if (deviceStatus.value == CHDeviceLoginStatus.UnLogin && isConnectedByWM2) {
          CHAccountManager.cmdSesame(SesameItemCode.unlock, this, sesame2KeyData!!.hisTagC(historytag), result)
      } else {
          if (checkBle(result)) return
//        L.d("hcia", "[ss5][unlock] historyTag:" + sesame2KeyData!!.createHistagV2(historyTag).toHexString())
          sendCommand(SesameOS3Payload(SesameItemCode.unlock.value, sesame2KeyData!!.createHistagV2(historytag)), DeviceSegmentType.cipher) { res ->
              if (res.cmdResultCode == SesameResultCode.success.value) {
                  result.invoke(Result.success(CHResultState.CHResultStateBLE(CHEmpty())))
              } else {
                  result.invoke(Result.failure(NSError(res.cmdResultCode.toString(), "CBCentralManager", res.cmdResultCode.toInt())))
              }
          }
      }
  }

```

### 8. Communication Protocol

For detailed interaction of each instruction, please refer to the description of `BlueTooth Protocol`.

- Detailed view:[BlueTooth Protocol](./bluetooth.md)

### Android Project Structure Example

The following is an example of an Android project structure used to organize the code and resource files.

- `libs/`: This folder is usually used to store the binary files (such as .jar, .aar, etc.) of third-party libraries (libraries).
- `java/`: Store Java code. Sub-packages are divided according to functional modules, such as `activities/` for storing activity classes, `adapters/` for storing adapter classes, etc.
- `res/`: Store resource files, including layout files, strings, icons, etc. Store in different directories according to the type of resources, for example, `layout/` stores layout files, `drawable/` stores image resources, `values/` stores string and style resources.
- `build.gradle`: The application-level Gradle configuration file is used to configure dependencies, plugins, and build settings.
- `proguard-rules.pro`: ProGuard configuration file, used for code confusion and optimization. This is optional and is applicable when releasing versions.

### Bluetooth State Machine

![State Machine](https://raw.githubusercontent.com/CANDY-HOUSE/.github/main/profile/uml/uml_output/p08_statemechine.png)

### Sesame Project Framework

- Registration login:[Amazon Web Services](https://docs.amplify.aws/sdk/auth/getting-started/q/platform/android/)(Mobile)
- Permission Framework:[Easypermissions](https://github.com/googlesamples/easypermissions)
- Local Database Persistence:[Room](https://developer.android.com/training/data-storage/room?hl=zh-cn)
- Cloud Data Hosting:[Amazon Web Services](https://docs.aws.amazon.com/iot/latest/developerguide/iot-sdks.html) (IOT)
- UI Navigation:[Navigation ](https://developer.android.com/guide/navigation?hl=zh-cn)
- UI Data Management:[ViewModel](https://developer.android.com/topic/libraries/architecture/viewmodel?hl=zh-cn)
- Firmware Update Library:[Dfu](https://github.com/NordicSemiconductor/Android-DFU-Library)
- Map Component:[Maps for Google](https://developers.google.com/maps/documentation/android-sdk/release-notes)
- Local Storage:[Preference](https://developer.android.com/jetpack/androidx/releases/preference?hl=zh-cn)
- Reactive Framework:[Rxjava](https://github.com/ReactiveX/RxJava)
- QR Scanning: Depends on libs/qrcodecore\-release.aar&nbsp;&nbsp;&nbsp;[Zxing](https://mvnrepository.com/artifact/com.google.zxing/core)
- Message Delivery:[Firebase-messaging](https://firebase.google.com/docs/cloud-messaging/android/client?hl=zh-cn)

### UI Component Library List

- Dropdown Refresh: [Swiperefreshlayout](https://developer.android.com/jetpack/androidx/releases/swiperefreshlayout?hl=zh-cn)
- Recyclerview Header Paste:[StickyHeaders](https://github.com/ShamylZakariya/StickyHeaders)
- EditText Adaptation:[AutoResizeEditText](https://github.com/victorminerva/AutoResizeEditText)
- Carousel: [LoopView](https://github.com/AWarmHug/androidWheelView)
- Slider Library:[Indicatorseekbar](https://github.com/warkiz/IndicatorSeekBar)

### App Interface Object Description

**SesameApp:** Application process starts  
**MainActivity:** Main application interface  
**ScanQRcodeFG:** QR code scanning  
**ScanNewDeviceFG:** Add new device  
**WM2SettingFG:** WIFI Module settings interface  
**SSM2SetAngleFG:** SS4, SS2 Angle setting interface  
**SSM5SettingFG:** SS5, SS5PRO Settings interface  
**SSM2SettingFG:** SS4, SS2 setting interface  
**SesameBotSettingFG:** SesameBot1 Setting interface  
**SesameBikeSettingFG:** BiKeLock1, BiKeLock2 set interface  
**SesameKeyboardSettingFG:** Sesame5 Setting interface  
**SesameOpenSensorNoBLESettingFG:** SSMOpenSensor Setting interface  
**SesameTouchProSettingFG:** SSMTouchPro, SSMTouch, BLEConnector Setting interface  
**SesameKeyboardCards:** NFC card setting interface  
**SSMTouchProFingerprint:** Fingerprint setup interface  
**SesameKeyboardPassCode:** Digital password setting interface  
**SSMTouchProSelectLockerListFG:** SSMTouchPro device sharing interface  
**GuestKeyListFG:** Guest list interface  
**SSM2NoHandLockFG:** Fully automatic lock screen  
**MeFG:** Homepage -> My interface  
**MyQrCodeFG:** Homepage -> My interface -> My QR code interface  
**LoginMailFG:** Homepage -> My interface -> Registration interface  
**LoginVerifiCodeFG:** Homepage -> My interface -> Registration interface -> QR code verification interface
**FriendListFG:** Homepage -> Directory interface  
**FriendDetailFG:** Homepage -> Directory interface -> Friend details interface  
**FriendSelectLockerListFG:** Homepage -> Directory interface -> Friend details interface -> Shared device interface
**DeviceListFG:** Homepage -> Sesame list interface  
**MainRoomFG:** Homepage -> Sesame list interface -> SS4, SS2 device details history record  
**MainRoomSS5FG:** Homepage -> Sesame list interface -> SS5, SS5PRO device details history record  
**AddMemberFG:** Homepage -> Sesame list interface -> Add member interface  
**KeyQrCodeFG:** Homepage -> Sesame list interface -> Share sesame QR code QR interface  
**WM2ScanSSIDListFG:** Homepage -> Sesame list interface -> WIFI details -> WIFI scan list interface  
**WM2SelectLockerListFG:** Homepage -> Sesame list interface -> WIFI details -> Select sesame device interface

## Android Related Knowledge

- [Android BLE] (https://developer.android.com/guide/topics/connectivity/bluetooth-le?hl=zh-cn)
- [Android NFC] (https://developer.android.com/guide/topics/connectivity/nfc?hl=zh-cn)
- [Android Jetpack] (https://developer.android.com/jetpack?hl=zh-cn)