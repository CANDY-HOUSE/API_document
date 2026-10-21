---
title: iOS
---
# iOS SesameSDK

## Appをダウンロード

- Sesame app on <img src="https://img.shields.io/badge/App Store-000000?logo=apple&logoColor=white"/> [https://apps.apple.com/app/id1532692301/](https://apps.apple.com/app/id1532692301/)
- Sesame app on <img src="https://img.shields.io/badge/TestFlight-0D96F6?logo=app-store&logoColor=white"/> [https://testflight.apple.com/join/Rok4GOFD/](https://testflight.apple.com/join/Rok4GOFD/)

## インストール手順

- <img src="https://img.shields.io/badge/Swift-5.3-FA7343" />
- <img src="https://img.shields.io/badge/Bluetooth-4.0LE +-0082FC" />
- <img src="https://img.shields.io/badge/iOS-12.0 +-000000" /> <img src="https://img.shields.io/badge/macOS-10.15 +-000000" /> <img src="https://img.shields.io/badge/watchOS-7.0 +-000000" /> <img src="https://img.shields.io/badge/iPadOS-12.0 +-000000" />
- <img src="https://img.shields.io/badge/Xcode-11.0 +-1575F9" />

### 1. 依存関係のインストール

- 1. Scheme を **SesameSDK** に設定し、任意のiOSデバイスを選択します。
- 2. `command` + `shift` + `k` を押して product フォルダをクリアします。
- 3. `command` + `b` を押して SDK をビルドします。
- 4. ビルドが完了したら、Xcode -> SDK project -> `Products` フォルダの下にある SesameSDK.framework を右クリックし、「Finderで開く」を選択し、`SesameSDK.framework`を取得します。

#### SesameWatchKitSDK

- 1. Scheme を **SesameWatchKitSDK** に設定し、任意のwatch OSデバイスを選択します。
- 2. `command` + `shift` + `k` を押して product フォルダをクリアします。
- 3. `command` + `b` を押して SDK をビルドします。
- 4. ビルドが完了したら、Xcode -> SDK project -> `Products` フォルダ下にある SesameWatchKitSDK.framework を右クリックし、「Finderで開く」を選択し、`SesameWatchKitSDK.framework` を取得します。

#### Swift Package

[Swift Package Manager](https://www.swift.org/package-manager/)は、Swiftのコードの配布を管理するためのツールです。Swiftのビルドシステムに統合されており、依存関係のダウンロード、コンパイル、リンクプロセスを自動で行います。

- プロジェクトにSesameSDKをSwift Package Managerを使って統合します:

```c

dependencies: [
    .package(url: "https://github.com/CANDY-HOUSE/SesameSDK_iOS_with_DemoApp.git", .branch("master"))
]

```

#### 手動統合

- 任何の依存関係マネージャを使用したくない場合は、SesameSDKを手動でプロジェクトに統合することも可能です。

### 2. 認可の追加

```jsx | pure

<key> NSBluetoothAlwaysUsageDescription </key>
<string> セサミスマートロックに接続し、ドアのロック/アンロックを行います。 </string>
<key> NSBluetoothPeripheralUsageDescription </key>
<string> このアプリは、アプリを使用していない時でも、近くのBluetoothデバイスにデータを提供することがあります。
</string>

```

### 3. 初期化

適切なタイミングでBluetoothスキャンを開始します。

```jsx {5} | pure
CHBluetoothCenter.shared.enableScan { res in }
```

Bluetoothのステータスが変わった時のコールバック

```jsx {5} | pure
public protocol CHBleStatusDelegate: AnyObject {
    func didScanChange(status: CHScanStatus)
}
```

スキャンしたセサミデバイスのリストは、1秒ごとの頻度で呼び出し元に渡されます。

```jsx {5} | pure
public protocol CHBleManagerDelegate: AnyObject {
    func didDiscoverUnRegisteredCHDevices(_ devices: [CHDevice])
}

```

### 4. デバイスへの接続

接続を確立する前に、デバイスの状態が接続可能状態であることを確認する必要があります。

```jsx {5} | pure
if sesame5.deviceStatus == .receivedBle() {
    sesame5.connect() { _ in }
}
```

この時点で、Sesameデバイスの接続状態のコールバックを受信します。

```jsx {5} | pure
public protocol CHDeviceStatusDelegate: AnyObject {
    func onBleDeviceStatusChanged(device: CHDevice, status: CHDeviceStatus, shadowStatus: CHDeviceStatus?)
    func onMechStatus(device: CHDevice)
}
```

### 5. デバイスの登録

接続状態が「登録準備完了」になった時点で、デバイスを登録してペアリングを完了させることができます。デバイスの登録は、デバイスとのペアリングを行うために必要な手順です。

```jsx {5} | pure
if device.deviceStatus == .readyToRegister() {
    device.register( _ in )
}
```

登録が完了すると、CHDeviceManagerを使ってペアリング済みのデバイスを取得することができます。

```jsx {5} | pure
var chDevices = [CHDevice]()
CHDeviceManager.shared.getCHDevices { result in
    if case let .success(devices) = result {
        chDevices = devices.data
    }
}
```

### 6. ロック・アンロック

ペアリング済みのデバイスを取得したら、APPを通じてロックとアンロックを実行することが可能になります。

#### ロック

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

#### アンロック

```jsx {5} | pure

    public func unlock(historytag: Data?, result: @escaping (CHResult<CHEmpty>))  {
      if deviceShadowStatus != nil,
         deviceStatus.loginStatus == .unlogined {
          CHIoTManager.shared.sendCommandToWM2(.unlock, self) { _ in
              result(.success(CHResultStateNetworks(input: CHEmpty())))
          }
          return
      }
      if (self.checkBle(result)) { return }
      let hisTag = Data.createOS2Histag(historytag ?? self.sesame2KeyData?.historyTag)

      sendCommand(.init(.unlock,hisTag)) { responsePayload in
          if responsePayload.cmdResultCode == .success {
              result(.success(CHResultStateBLE(input: CHEmpty())))
          } else {
              result(.failure(self.errorFromResultCode(responsePayload.cmdResultCode)))
          }
      }
  }

```

### 7. 通信プロトコル

各命令の詳細は `BlueToothプロトコル` を参照してください。

- 詳細を見る:[BlueTooth プロトコル](./bluetooth.md)

### 8. 詳細を見る

SesameSDKの詳細設計については、以下の設計図とフローチャートを参照してください。

## フレームワーク/モジュールの選択

- ログイン・登録： [Amazon Web Services](https://docs.amplify.aws/sdk/auth/getting-started/q/platform/ios/)

- ブルートゥース： [CoreBluetooth](https://developer.apple.com/documentation/corebluetooth/)

- ローカルストレージ： [CoreData](https://developer.apple.com/documentation/coredata)

- 使用ライブラリ： [AWSMobileClientXCF](https://aws-amplify.github.io/aws-sdk-ios/docs/reference/AWSMobileClient/index.html)

- Siri Intents：[Intents](https://developer.apple.com/documentation/appintents)
- Intents参考記事：[appintents](https://medium.com/simform-engineering/how-to-integrate-siri-shortcuts-and-design-custom-v-tutorial-e53285b550cf)

- 通知：[User Notifications](https://developer.apple.com/documentation/usernotifications)

## Bluetooth状態マシン

![State Machine](https://raw.githubusercontent.com/CANDY-HOUSE/.github/main/profile/uml/uml_output/p08_statemechine.png)

<!-- ![BleConnect](https://raw.githubusercontent.com/CANDY-HOUSE/.github/main/profile/uml/uml_output/sesame_state_circle.png) -->
