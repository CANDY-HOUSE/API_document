---
title: Android 版
---
# Android 版 SesameSDK

![Sesame device](https://github.com/CANDY-HOUSE/.github/blob/main/profile/images/SesameSDK.png?raw=true 'Sesame')

## 下載 App

- Sesame app on <img src="https://img.shields.io/badge/Play Store-34A853?logo=googleplay&logoColor=white"/> [https://play.google.com/store/apps/details?id=co.candyhouse.sesame2](https://play.google.com/store/apps/details?id=co.candyhouse.sesame2)
- Sesame app on <img src="https://img.shields.io/badge/Google Drive-1A73E8?logo=googledrive&logoColor=white"/> [https://drive.google.com/file/d/15aRQl6aWBVwJSE4l3ZL-eMisPoe-f2lW/](https://drive.google.com/file/d/15aRQl6aWBVwJSE4l3ZL-eMisPoe-f2lW/)

## 安装流程

### 平台安装要求

- <img src="https://img.shields.io/badge/Kotlin-1.4-7F52FF" />.
- <img src="https://img.shields.io/badge/Bluetooth-4.0LE +-0082FC" />
- <img src="https://img.shields.io/badge/Android-5.0 +-3DDC84" />
- <img src="https://img.shields.io/badge/Android Studio-2022 +-3DDC84" />

### 1. 安装依赖

```jsx {5} | pure
   implementation project(':sesame-sdk')
```

### 2. manifest.xml 中设置 Android 权限

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

### 3. 初始化

```jsx {5} | pure
   override fun onCreate()
   {
    super.onCreate()
    CHBleManager(this)
   }
```

CHBleManager 的初始化可以判断终端的蓝牙是否正常运行，是否从终端获得权限，蓝牙是否启动。如果一切正常，蓝牙扫描就开始了。
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

将 bleScanner 扫描的设备放入 CHDeviceMap。

### 4. 新设备被添加到 ScanNewDeviceFG 对象中，Adapter 被 CHDeviceMap 过滤(it.rssi!=nil)用列表显示数据。

```jsx {5} | pure
    private var mDeviceList = ArrayList<CHDevices>()
    CHBleManager.delegate = object : CHBleManagerDelegate {
            override fun didDiscoverUnRegisteredCHDevices(devices: List<CHDevices>) {
                mDeviceList.clear()
                mDeviceList.addAll(devices.filter { it.rssi != null }
                    .filter { it.rssi!! > -65 }///註冊列表只顯示距離近的
                )
                mDeviceList.sortBy { it.getDistance() }
                mDeviceList.firstOrNull()?.connect { }
                leaderboard_list.post((leaderboard_list.adapter as GenericAdapter<*>)::notifyDataSetChanged)
            }
        }
    }
```

### 5. 与设备的连接顺序是执行 connect，用 onBleDeviceStatusChanged 监视设备的状态。

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
        it.onSuccess { // 登録成功
        }
        it.onFailure { //  登録失敗
        }
       }
   }
```

### 6. 注册成功回调，根据 device.register 注册命令的成功或失败的回调，可以判断所属产品的 device model。

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

### 7. 開鎖與關鎖

獲取已配對的設備，就可以通過 APP 實現關鎖與開鎖

#### 關鎖

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

#### 開鎖

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

### 8. 通讯協議

各指令互動細節詳見 `BlueTooth協議` 說明。

- 查看詳細:[BlueTooth 協議](./bluetooth.md)

### Android 项目结构示例

以下是 Android 项目结构示例，用于组织代码和资源文件。

- `libs/`：文件夹通常用于存放第三方库（libraries）的二进制文件（如.jar、.aar 等）。
- `java/`：存放 Java 代码。按照功能模块划分子包，例如 `activities/` 存放活动类，`adapters/` 存放适配器类等。
- `res/`：存放资源文件，包括布局文件、字符串、图标等。按照资源类型分目录存放，例如 `layout/` 存放布局文件，`drawable/` 存放图片资源，`values/` 存放字符串和样式资源。
- `build.gradle`：应用级别的 Gradle 配置文件，用于配置依赖项、插件和构建设置。
- `proguard-rules.pro`：ProGuard 配置文件，用于代码混淆和优化。这是可选的，适用于发布版本时。

### 藍牙狀態機

![State Machine](https://raw.githubusercontent.com/CANDY-HOUSE/.github/main/profile/uml/uml_output/p08_statemechine.png)

### Sesame 项目框架

- 注册登录:[Amazon Web Services](https://docs.amplify.aws/sdk/auth/getting-started/q/platform/android/)(Mobile)
- 权限框架:[Easypermissions](https://github.com/googlesamples/easypermissions)
- 本地数据库持久化:[Room](https://developer.android.com/training/data-storage/room?hl=zh-cn)
- 云数据托管:[Amazon Web Services](https://docs.aws.amazon.com/iot/latest/developerguide/iot-sdks.html) (IOT)
- 界面导航:[Navigation ](https://developer.android.com/guide/navigation?hl=zh-cn)
- 界面数据管理:[ViewModel](https://developer.android.com/topic/libraries/architecture/viewmodel?hl=zh-cn)
- 固件升级库:[Dfu](https://github.com/NordicSemiconductor/Android-DFU-Library)
- 地图组件:[Maps for Google](https://developers.google.com/maps/documentation/android-sdk/release-notes)
- 本地存储:[Preference](https://developer.android.com/jetpack/androidx/releases/preference?hl=zh-cn)
- 响应式框架:[Rxjava](https://github.com/ReactiveX/RxJava)
- QR 扫描:依赖 libs/qrcodecore\-release.aar&nbsp;&nbsp;&nbsp;[Zxing](https://mvnrepository.com/artifact/com.google.zxing/core)
- 消息传递:[Firebase-messaging](https://firebase.google.com/docs/cloud-messaging/android/client?hl=zh-cn)

### UI 组件库列表

- 下拉刷新: [Swiperefreshlayout](https://developer.android.com/jetpack/androidx/releases/swiperefreshlayout?hl=zh-cn)
- Recyclerview 头部粘贴:[StickyHeaders](https://github.com/ShamylZakariya/StickyHeaders)
- EditText 自适应:[AutoResizeEditText](https://github.com/victorminerva/AutoResizeEditText)
- 轮播图:[LoopView](https://github.com/AWarmHug/androidWheelView)
- 滑动条库:[Indicatorseekbar](https://github.com/warkiz/IndicatorSeekBar)

### App 界面对象说明

**SesameApp:** Application 进程启动  
**MainActivity:** 主应用程序界面  
**ScanQRcodeFG:** 二维码扫描  
**ScanNewDeviceFG:** 添加新设备  
**WM2SettingFG:** WIFI Module 设置界面  
**SSM2SetAngleFG:** SS4、SS2 角度设置界面  
**SSM5SettingFG:** SS5、SS5PRO 设置界面  
**SSM2SettingFG:** SS4、SS2 设置界面  
**SesameBotSettingFG:** SesameBot1 设置界面  
**SesameBikeSettingFG:** BiKeLock1、BiKeLock2 设置界面  
**SesameKeyboardSettingFG:** Sesame5 设置界面  
**SesameOpenSensorNoBLESettingFG:** SSMOpenSensor 设置界面  
**SesameTouchProSettingFG:** SSMTouchPro、SSMTouch、BLEConnector 设置界面  
**SesameKeyboardCards:** NFC 卡片设置界面  
**SSMTouchProFingerprint:** 指纹设置界面  
**SesameKeyboardPassCode:** 数字密码设置界面  
**SSMTouchProSelectLockerListFG:** SSMTouchPro 设备分享界面  
**GuestKeyListFG:** 访客列表界面  
**SSM2NoHandLockFG:** 全自动上锁界面  
**MeFG:** 首页->我的界面  
**MyQrCodeFG:** 首页->我的界面->我的二维码界面  
**LoginMailFG:** 首页->我的界面->注册界面  
**LoginVerifiCodeFG:** 首页->我的界面->注册界面->二维码校验界面
**FriendListFG:** 首页->通讯录界面  
**FriendDetailFG:** 首页->通讯录界面->好友详情界面  
**FriendSelectLockerListFG:** 首页->通讯录界面->好友详情界面->共享设备界面
**DeviceListFG:** 首页->芝麻列表界面  
**MainRoomFG:** 首页->芝麻列表界面->SS4、SS2 设备详情历史记录  
**MainRoomSS5FG:** 首页->芝麻列表界面->SS5、SS5PRO 设备详情历史记录  
**AddMemberFG:** 首页->芝麻列表界面->添加成员界面  
**KeyQrCodeFG:** 首页->芝麻列表界面->分享芝麻二维码 QR 界面  
**WM2ScanSSIDListFG:** 首页->芝麻列表界面->WIFI 详情->WIFI 扫面列表界面  
**WM2SelectLockerListFG:** 首页->芝麻列表界面->WIFI 详情->选择芝麻设备界面

## Android 相关知识

- [Android BLE] (https://developer.android.com/guide/topics/connectivity/bluetooth-le?hl=zh-cn)
- [Android NFC] (https://developer.android.com/guide/topics/connectivity/nfc?hl=zh-cn)
- [Android Jetpack] (https://developer.android.com/jetpack?hl=zh-cn)
