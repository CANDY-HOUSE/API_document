---
title: "クイックスタート WiFi Module2"
---
# [目的](./quick_start_wifi_module.md#目的)
Android開発者向けにSesameSDKのクイックガイドです。コピペですぐ使えるサンプルコードを通じて、WiFi Module経由でセサミを遠隔操作できるアプリを一瞬で作りましょう。

# [準備リスト](./quick_start_wifi_module.md#準備リスト)
* WiFi Moduleデバイス
* Sesameデバイス (登録済)
* Android 5.0以上の端末 (BLE操作可能な端末)

# [フロー](./quick_start_wifi_module.md#フロー)
* *クイックスタートSesame* の通りSesameを登録します
* 未登録のWiFi Moduleを取得する
* WiFi Moduleの状態を取得する
* WiFi ModuleとBLE接続する
* WiFi Moduleを登録する
* WiFi Moduleに近くにある`SSID`リストをスキャンさせる
* WiFi ModuleにWiFiの`SSID`を設定する
* WiFi ModuleにWiFiの`パスワード`を設定する
* WiFi Moduleに設定したWiFiに接続させる
* WiFi ModuleにSesame情報を追加する
* WiFi Module経由でセサミを遠隔操作してみる！

# [クイックスタートSesame 通りSesame を登録する](./quick_start_wifi_module.md#クイックスタートsesame-通りsesame-を登録する)
* WiFi Moduleは登録済のSesameデバイスにのみ対応しますよ
* BLEスキャンは必ずオンにして下さいね

# [未登録のWiFi Moduleを取得する](./quick_start_wifi_module.md#未登録のwifi-moduleを取得する)
* Android 端末の横に未登録の WiFi Moduleデバイスを用意します
* `CHBleManager`の`didDiscoverUnRegisteredCHDevices`から未登録のWiFi Moduleのdelegateイベントを取得します
* `RSSI`はWiFi Moduleデバイスが発信しているBLEアドバイタイシングの信号強度
```kotlin
CHBleManager.delegate = object : CHBleManagerDelegate {
    override fun didDiscoverUnRegisteredCHDevices(devices: List<CHDevices>) {
        devices.forEach {
            if (!deviceList.contains(it) && it.rssi!! > -50) { // limit  -50  rssi near device
                deviceList.add(it)
                runOnUiThread {
                    (recycle.adapter as GenericAdapter<*>).notifyDataSetChanged()
                }
            }
        }
    }
}
```

# [WiFi ModuleのBLE状態を取得する](./quick_start_wifi_module.md#wifi-moduleのble状態を取得する)
* 各操作によりBLE状態変化が異なります。状態一覧は[WiFi Module状態遷移図](../reference.md#chsesame2status)までご参照ください。
* 登録済のWiFi ModuleデバイスとBLE接続をする前に、delegateイベントが`CHSesame2Status.ReceivedBle`状態になる必要な場合がございます。


```kotlin
device.delegate = object : CHWifiModule2Delegate {
    override fun onBleDeviceStatusChanged(
        device: CHWifiModule2,
        status: CHSesame2Status
    ) {
        updateUI(device)
        if (device.deviceStatus == CHSesame2Status.ReceivedBle) {
            device.connect { }
        }
    }

    override fun onNetWorkStatusChanged(
        device: CHWifiModule2,
        settings: CHWifiModule2NetWorkStatus
    ) {
        updateUI(device)
    }

    override fun onAPSettingChanged(
        device: CHWifiModule2,
        settings: CHWifiModule2MechSettings
    ) {
        updateUI(device)
    }

    override fun onScanWifiSID(
        device: CHWifiModule2,
        ssid: String,
        rssi: Short
    ) {
    }
}
```

# [WiFi ModuleとBLE接続する](./quick_start_wifi_module.md#wifi-moduleとble接続する)
* WiFi ModuleデバイスのBLEアドバタイジングを取得できたら、WiFi ModuleとBLE接続するコマンドが使用可能となります。
* WiFi ModuleデバイスのBLEアドバタイジングを取得できたら、未登録のWiFi Moduleのdelegateイベントが伝わってきます。未登録のデバイスの初期BLE状態は必ず`CHSesame2Status.ReceivedBle`となります。
```kotlin
 device.connect { }
```

# [WiFi Module を登録する](./quick_start_wifi_module.md#wifi-module-を登録する)
*  WiFi ModuleデバイスとBLE接続する完了後、WiFi ModuleのBLE状態が`CHSesame2Status.ReadyToRegister`と変わります。`register`コマンドを使って、WiFi Moduleデバイスを登録します。
*  WiFi Moduleデバイスの登録が完了後、WiFi ModuleのBLE状態が`CHSesame2Status.WaitApConnect`に変わり、次のステップにてWiFi Moduleデバイスに Routerの設定をします
*  WiFi ModuleデバイスのLEDは登録前に紫色、登録後は赤色となるので、ご確認下さい
```kotlin
if (device.deviceStatus == CHSesame2Status.ReadyToRegister) {
  device.register {
     it.onSuccess {
         device.configureLockPosition(0, 256) {}//1024 =  360 degree
     }
  }
}
```

# [WiFi Moduleに近くにあるWiFi SSIDリストをスキャンさせる](./quick_start_wifi_module.md#wifi-moduleに近くにあるwifi-ssidリストをスキャンさせる)
* `scanWifiSSID`メソッドを叩き、WiFi Moduleに近くにあるWiFi SSIDリストをスキャンさせる
* `onScanWifiSID` から 2.4GHz WiFi SSID リストのdelegateイベントを取得する
```kotlin
device.scanWifiSSID {}
// ...
object: CHWifiModule2Delegate {
// ...
    override fun onScanWifiSID(device: CHWifiModule2, ssid: String, rssi: Short) {}
}
```

# [WiFi ModuleにWiFiのSSIDを設定する](./quick_start_wifi_module.md#wifi-moduleにwifiのssidを設定する)
*  `setWifiSSID`メソッドを使って`SSID`を入力します
*  もしWiFi Moduleデバイスが入力された`SSID`を検知できない場合、失敗のコールバックが返ってきます
```kotlin
device.setWifiSSID("your-wifi-ssid") { it.onFailure {} }
```

# [WiFi ModuleにWiFiのパスワードを設定する](./quick_start_wifi_module.md#wifi-moduleにwifiのパスワードを設定する)
* `setWifiPassword`メソッドを使って`パスワード`入力します
```kotlin
device.setWifiPassword("your-wifi-ssid-pwk") {}
```

# [WiFi Moduleに設定したWiFiに接続させる](./quick_start_wifi_module.md#wifi-moduleに設定したwifiに接続させる)
* `connectWifi`を使って、WiFi Moduleに設定されたWiFiに接続させます
* CANDY HOUSE Cloudに接続成功後、WiFi Moduleデバイスの青色LEDランプが点灯します
```kotlin
device.connectWifi {
    it.onSuccess {
        deviceList.forEach {
            Log.d("hcia", "CHSesame2 1:" + (it is CHSesame2))
            if (it is CHSesame2) {
                Log.d("hcia", "CHSesame2 2:" + (it is CHSesame2))
                device.insertSesames(it) {
                    it.onSuccess {
                        Log.d("hcia", "CHSesame2 3:" + (it is CHSesame2))
                    }
                }
            }
        }
    }
}
```

# [WiFi ModuleにSesame情報を追加する](./quick_start_wifi_module.md#wifi-moduleにsesame情報を追加する)
* `insertSesames`に(`CHDevices`)パラメーターを入力します。こちらの`CHDevices`は`CHSesame2`型クラス
* WiFi Moduleが`CHSesame2`の鍵オブジェクトを受け取ったら、WiFi ModuleデバイスがSesameデバイスをBLEスキャンすることを行います
* WiFi ModuleがBLEスキャンをしている場合、WiFi Moduleデバイスの赤いLEDランプが3回ずつ点滅します
* 赤いランプが消灯後、`onBleDeviceStatusChanged`の中の`CHSesame2Status`状態が`Locked`から`LockedWm2`に変更し、また`sesame.isConnectedByWM2`が`true`になります


```kotlin
if (it is CHSesame2) {
   device.insertSesames(it) {
      it.onSuccess {
          Log.d("hcia", "CHSesame2:" + (it is CHSesame2))
      }
   }
}
```

# [WiFi Module経由でセサミを遠隔操作!](./quick_start_wifi_module.md#wifi-module経由でセサミを遠隔操作)
* BLE経由でSesameを施解錠するメソッドとは変わりません。BLE 経由でするか、WiFi 経由でするかを SesameSDK が自動的に判断します
* インターネット経由で施解錠をする時に、WiFi Moduleデバイスの赤いLEDランプが一瞬点滅します

```kotlin
device.toggle { }
device.lock { }
device.unlock { }
```

# [GitHub テンプレ](./quick_start_wifi_module.md#github-テンプレ)
* [SesameSDK_Android_Simple_demo](https://github.com/CANDY-HOUSE/SesameSDK_Android_Simple_demo)
* [SesameSDK_Android_with_DemoApp](https://github.com/CANDY-HOUSE/SesameSDK_Android_with_DemoApp)

前へ [SesameSDK_Android クイックスタート](./quick_start_android.md)
次へ [SesameSDK_Android 參考資料](../reference.md)