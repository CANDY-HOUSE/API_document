---
title: "クイックスタート WiFi Module2"
---

# [目的](./quick_start_wifi_module.md#目的)

iOS 開発者向けに SesameSDK のクイックガイドです。コピペですぐ使えるサンプルコードを通じて、WiFi Module 経由でセサミを遠隔操作できるアプリを一瞬で作りましょう。

# [準備リスト](./quick_start_wifi_module.md#準備リスト)

- WiFi Module デバイス
- Sesame デバイス(登録済みスマートロック)
- iOS10 以上の端末

# [フロー](./quick_start_wifi_module.md#フロー)

- _クイックスタート Sesame_ の通り Sesame を登録します
- 未登録の WiFi Module を取得する
- WiFi Module の状態を取得する
- WiFi Module と BLE 接続する
- WiFi Module を登録する
- WiFi Module に近くにある`SSID`リストをスキャンさせる
- WiFi Module に WiFi の`SSID`を設定する
- WiFi Module に WiFi の`パスワード`を設定する
- WiFi Module に設定した WiFi に接続させる
- WiFi Module に Sesame 情報を追加する
- WiFi Module 経由でセサミを遠隔操作してみる！

# [クイックスタート Sesame 通り Sesame を登録する](./quick_start_wifi_module.md#クイックスタート-sesame-通り-sesame-を登録する)

- WiFi Module は登録済の Sesame デバイスにのみ対応しますよ
- BLE スキャンは必ずオンにして下さいね

# [未登録の WiFi Module を取得する](./quick_start_wifi_module.md#未登録の-wifi-module-を取得する)

- iOS 端末の横に未登録の WiFi Module デバイスを用意します
- `CHBleManager`の delegate の通知先を`self`に設定します
- `CHBleManagerDelegate`の`didDiscoverUnRegisteredCHDevices(_ devices: [CHDevice])`から未登録の WiFi Module の delegate イベントを取得します

```swift
CHBleManager.shared.delegate = self // delegateの通知先をselfに設定します
extension ViewController: CHBleManagerDelegate {
    func didDiscoverUnRegisteredCHDevices(_ devices: [CHDevice]) {
        // 未登録の WiFi Module を発見します
    }
}
```

# [WiFi Module の BLE 状態を取得する](./quick_start_wifi_module.md#wifi-module-の-ble-状態を取得する)

- BLE スキャンにより WiFi Module の取得後、`CHWifiModule2Delegate` の delegate メソッドを使って、WiFi Module の状態変化の delegate イベントを取得します
- 各操作により BLE 状態変化が異なります。状態一覧は[WiFi Module 状態遷移図](../reference.md#chsesame2status)をご参照ください。

```swift
extension ViewController: CHWifiModule2Delegate {
    func viewDidLoad() {
        super.viewDidLoad()
        self.wifiModule.delegate = self // WiFi Module のdelegateの通知先をselfに設定します
    }

    //  wifi-module の状態変化をdelegate
    func onBleDeviceStatusChanged(device: CHWifiModule2, status: CHSesame2Status) {

    }

    // wifiModule の代理事件
    func onAPSettingChanged(device: CHWifiModule2, settings: CHWifiModule2MechSettings) {

    }

    func onNetworkStatusChanged(device: CHWifiModule2, status: CHWifiModule2NetworkStatus) {

    }

    func onSesame2KeysChanged(device: CHWifiModule2, sesame2keys: [String: String]) {

    }

    func onOTAProgress(device: CHWifiModule2, percent: UInt8) {

    }

    func onScanWifiSID(device: CHWifiModule2, ssid: SSID) {

    }
}
```

# [WiFi Module と BLE 接続する](./quick_start_wifi_module.md#wifi-module-と-ble-接続する)

- WiFi Module デバイスの BLE アドバタイジングを取得できたら、WiFi Module と BLE 接続するコマンドが使用可能となります。
- WiFi Module デバイスの BLE アドバタイジングを取得できたら、未登録の WiFi Module の delegate イベントが伝わってきます。未登録のデバイスの初期 BLE 状態は必ず`receivedBle`となります。

```swift
extension ViewController: CHWifiModule2Delegate {
    func onBleDeviceStatusChanged(device: CHWifiModule2, status: CHSesame2Status) {
        if status == .receivedBle() {
            device.connect() { _ in }  // デバイスのBLE状態が receiveBle になったら、connectコマンドをする。
        }
    }
}
```

# [WiFi Module を登録する](./quick_start_wifi_module.md#wifi-module-を登録する)

- WiFi Module デバイスと BLE 接続する完了後、WiFi Module の BLE 状態が`readyToRegister`と変わります。`register`コマンドを使って、WiFi Module デバイスを登録します。
- WiFi Module デバイスの登録が完了後、WiFi Module の BLE 状態が`waitApConnect`に変わり、次のステップにて WiFi Module デバイスに Router の設定をします
- WiFi Module デバイスの LED は登録前に紫色、登録後は赤色となるので、ご確認下さい

```swift
extension ViewController: CHWifiModule2Delegate {
    func onBleDeviceStatusChanged(device: CHWifiModule2, status: CHSesame2Status) {
        if (wifiModule.deviceStatus == .readyToRegister()) {
            device.register { _ in } // デバイスのBLE状態が receiveBle になったら、registerコマンドをする。
        }
    }
}
```

# [WiFi Module に近くにある WiFi SSID リストをスキャンさせる](./quick_start_wifi_module.md#wifi-module-に近くにある-wifi-ssid-リストをスキャンさせる)

- `scanWifiSSID`メソッドを叩き、WiFi Module に近くにある WiFi SSID リストをスキャンさせる
- `onScanWifiSID` から 2.4GHz WiFi SSID リストの delegate イベントを取得する

```swift
self.wifiModule.scanWifiSSID { _ in } // 近くの SSID をスキャンする.

extension ViewController: CHWifiModule2Delegate {
    func onScanWifiSID(device: CHWifiModule2, ssid: SSID) {
        // 2.4g WiFi SSID リストのコールバックが返ってきます
    }
}
```

# [WiFi Module に WiFi の SSID を設定する](./quick_start_wifi_module.md#wifi-module-に-wifi-の-ssid-を設定する)

- `setWifiSSID`メソッドを使って`SSID`を入力します
- もし WiFi Module デバイスが入力された`SSID`を検知できない場合、失敗のコールバックが返ってきます

```swift
wifiModule2.setWifiSSID("your-ssid") { setResult in
   if case let .failure(error) = setResult {
   }
}
```

# [WiFi Module に WiFi のパスワードを設定する](./quick_start_wifi_module.md#wifi-module-に-wifi-のパスワードを設定する)

- `setWifiPassword`メソッドを使って`パスワード`入力します

```swift
device.setWifiPassword("your-wifi-ssid-password") { _ in }
```

# [WiFi Module に設定した WiFi に接続させる](./quick_start_wifi_module.md#wifi-module-に設定した-wifi-に接続させる)

- `connectWifi`を使って、WiFi Module に設定された WiFi に接続させます
- CANDY HOUSE Cloud に接続成功後、WiFi Module デバイスの青色 LED ランプが点灯します

```swift
wifiModule.connectWifi { _ in }
```

# [WiFi Module に Sesame 情報を追加する](./quick_start_wifi_module.md#wifi-module-に-sesame-情報を追加する)

- `insertCHDevice(device)`に`CHDevice`オブジェクトを入力します。こちらの`CHDevices`は`CHSesame2`型クラス
- WiFi Module が`CHSesame2`の鍵オブジェクトを受け取ったら、WiFi Module デバイスが Sesame デバイスを BLE スキャンすることを行います
- WiFi Module が BLE スキャンをしている場合、WiFi Module デバイスの赤い LED ランプが 3 回ずつ点滅します
- 赤いランプが消灯後、`onBleDeviceStatusChanged`の中の`CHSesame2Status`状態が`Locked`から`LockedWm2`に変更し、また`sesame.isConnectedByWM2`が`true`になります
  - `locked` -> `lockedWifiModule2`
  - `unlocked` -> `unlockedWifiModule2`
  - `moved` -> `movedWifiModule2`
  - `isConnectedByWM2` は `true`

```swift
wifiModule2.insertCHDevice(device) { _ in }
```

# [WiFi Module 経由でセサミを遠隔操作!](./quick_start_wifi_module.md#wifi-module-経由でセサミを遠隔操作)

- BLE 経由で Sesame を施解錠するメソッドとは変わりません。BLE 経由でするか、WiFi 経由でするかを SesameSDK が自動的に判断します
- インターネット経由で施解錠をする時に、WiFi Module デバイスの赤い LED ランプが一瞬点滅します

```swift
device.toggle { _ in } // 施/解錠
device.lock { _ in }   // 施錠
device.unlock { _ in } // 解錠
```

# サンプルプロジェクト

- [SesameSDK_iOS_with_DemoApp](https://github.com/CANDY-HOUSE/SesameSDK_iOS_with_DemoApp)

前へ [SesameSDK_iOS クイックスタート](./quick_start_ios.md)
次へ [SesameSDK_iOS 参考資料](../reference.md)
