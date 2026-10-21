---
title: Android
---
# Android SesameSDK

## アプリのダウンロード

- Sesameアプリ on <img src="https://img.shields.io/badge/Play Store-34A853?logo=googleplay&logoColor=white"/> [https://play.google.com/store/apps/details?id=co.candyhouse.sesame2](https://play.google.com/store/apps/details?id=co.candyhouse.sesame2)
- Sesameアプリ on <img src="https://img.shields.io/badge/Google Drive-1A73E8?logo=googledrive&logoColor=white"/> [https://drive.google.com/file/d/15aRQl6aWBVwJSE4l3ZL-eMisPoe-f2lW/](https://drive.google.com/file/d/15aRQl6aWBVwJSE4l3ZL-eMisPoe-f2lW/)

## インストール手順

### プラットフォームのインストール要件

- <img src="https://img.shields.io/badge/Kotlin-1.4-7F52FF" />
- <img src="https://img.shields.io/badge/Bluetooth-4.0LE +-0082FC" />
- <img src="https://img.shields.io/badge/Android-5.0 +-3DDC84" />
- <img src="https://img.shields.io/badge/Android Studio-2022 +-3DDC84" />

### 1. 依存関係のインストール

```jsx {5} | pure
   implementation project(':sesame-sdk')
```

### 2. manifest.xmlにてAndroid権限の設定

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

### 3. 初期化

```jsx {5} | pure
   override fun onCreate()
   {
    super.onCreate()
    CHBleManager(this)
   }
```

CHBleManagerの初期化により、端末のBluetoothが正常に動作しているか、端末からの権限が得られているか、Bluetoothが起動しているかを判断することができます。すべてが正常であれば、Bluetoothのスキャンが開始されます。
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

bleScannerでスキャンしたデバイスをCHDeviceMapに格納します。

### 4. 新しいデバイスがScanNewDeviceFGオブジェクトに追加され、CHDeviceMapによりAdapterがフィルタリングされ(it.rssi!=nil)リストでデータが表示されます。

```jsx {5} | pure
    private var mDeviceList = ArrayList<CHDevices>()
    CHBleManager.delegate = object : CHBleManagerDelegate {
            override fun didDiscoverUnRegisteredCHDevices(devices: List<CHDevices>) {
                mDeviceList.clear()
                mDeviceList.addAll(devices.filter { it.rssi != null }
                    .filter { it.rssi!! > -65 }///登録リストは近距離だけを表示
                )
                mDeviceList.sortBy { it.getDistance() }
                mDeviceList.firstOrNull()?.connect { }
                leaderboard_list.post((leaderboard_list.adapter as GenericAdapter<*>)::notifyDataSetChanged)
            }
        }
    }
```

### 5. デバイスとの接続はconnectを実行し、onBleDeviceStatusChangedでデバイスの状態を監視します。

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

### 6. 登録成功のコールバックは、device.register登録コマンドの成功または失敗のコールバックにより所属製品のdevice modelを判断できます。

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

### 7. 鍵の開錠と施錠

ペアリング済みのデバイスが取得できれば、APPを通じて施錠と開錠を実現できます。

#### 施錠

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

#### 開錠

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

### 8. 通信プロトコル

各指令の対話詳細は `BlueToothプロトコル` 説明書を参照。

- 詳細を見る:[BlueTooth プロトコル](./bluetooth.md)

### Bluetoothステータスマシン

![State Machine](https://raw.githubusercontent.com/CANDY-HOUSE/.github/main/profile/uml/uml_output/p08_statemechine.png)

## Android関連の知識

- [Android BLE] (https://developer.android.com/guide/topics/connectivity/bluetooth-le?hl=ja)
- [Android NFC] (https://developer.android.com/guide/topics/connectivity/nfc?hl=ja)
- [Android Jetpack] (https://developer.android.com/jetpack?hl=ja)