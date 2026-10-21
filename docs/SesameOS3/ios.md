---
title: iOS
---
# iOS SesameSDK

## 下载 App

- Sesame app on <img src="https://img.shields.io/badge/App Store-000000?logo=apple&logoColor=white"/> [https://apps.apple.com/app/id1532692301/](https://apps.apple.com/app/id1532692301/)
- Sesame app on <img src="https://img.shields.io/badge/TestFlight-0D96F6?logo=app-store&logoColor=white"/> [https://testflight.apple.com/join/Rok4GOFD/](https://testflight.apple.com/join/Rok4GOFD/)

## 安裝流程

- <img src="https://img.shields.io/badge/Swift-5.3-FA7343" />
- <img src="https://img.shields.io/badge/Bluetooth-4.0LE +-0082FC" />
- <img src="https://img.shields.io/badge/iOS-12.0 +-000000" /> <img src="https://img.shields.io/badge/macOS-10.15 +-000000" /> <img src="https://img.shields.io/badge/watchOS-7.0 +-000000" /> <img src="https://img.shields.io/badge/iPadOS-12.0 +-000000" />
- <img src="https://img.shields.io/badge/Xcode-11.0 +-1575F9" />

### 1. 安装依赖

- 1. Scheme 切到 **SesameSDK**, 選擇 Any iOS Device
- 2. `command` + `shift` + `k` 清除 product 資料夾
- 3. `command` + `b` 打包 SDK
- 4. 完成後到 Xcode -> SDK project -> `Products` 資料夾底下 找到 SesameSDK.framework 點擊右鍵 選擇在 Finder 打開, 取得 `SesameSDK.framework`.

#### SesameWatchKitSDK

- 1. Scheme 切到 **SesameWatchKitSDK**, 選擇 Any watch OS Device
- 2. `command` + `shift` + `k` 清除 product 資料夾
- 3. `command` + `b` 打包 SDK
- 4. 完成後到 Xcode -> SDK project -> `Products` 資料夾底下 找到 SesameWatchKitSDK.framework 點擊右鍵 選擇在 Finder 打開, 取得 `SesameWatchKitSDK.framework`.

#### Swift Package

[Swift Package Manager](https://www.swift.org/package-manager/)是一個管理 Swift 代碼分發的工具。它與 Swift 構建系統集成，自動執行下載、編譯和鏈接依賴項的過程。

- 使用 Swift 包管理器將 SesameSDK 集成到 Xcode 項目中:

```c

dependencies: [
    .package(url: "https://github.com/CANDY-HOUSE/SesameSDK_iOS_with_DemoApp.git", .branch("master"))
]

```

#### 手動集成

- 如果您不想使用任何依賴項管理器，您可以手動將 SesameSDK 集成到您的項目中。

### 2. 添加授權

```jsx | pure

<key> NSBluetoothAlwaysUsageDescription </key>
<string> To connect Sesame Smart Lock and lock/unlock the door. </string>
<key> NSBluetoothPeripheralUsageDescription </key>
<string>T his app would like to make data available to nearby bluetooth devices even when you're not using the app.
</string>

```

### 3. 初始化

請在適當的時間啓動藍牙掃描

```jsx {5} | pure
CHBluetoothCenter.shared.enableScan { res in }
```

藍牙狀態改變時回調

```jsx {5} | pure
public protocol CHBleStatusDelegate: AnyObject {
    func didScanChange(status: CHScanStatus)
}
```

掃描的芝麻設備列表將以每秒一次的頻率傳回呼叫者。

```jsx {5} | pure
public protocol CHBleManagerDelegate: AnyObject {
    func didDiscoverUnRegisteredCHDevices(_ devices: [CHDevice])
}

```

### 4. 連接設備

在建立連接之前，應首先確認設備狀態爲可連接狀態

```jsx {5} | pure
if sesame5.deviceStatus == .receivedBle() {
    sesame5.connect() { _ in }
}
```

此時，您將收到 Sesame 設備的連接狀態回調

```jsx {5} | pure
public protocol CHDeviceStatusDelegate: AnyObject {
    func onBleDeviceStatusChanged(device: CHDevice, status: CHDeviceStatus, shadowStatus: CHDeviceStatus?)
    func onMechStatus(device: CHDevice)
}
```

### 5. 註冊設備

當連接狀態變爲“準備註冊”時，即可註冊設備完成配對。註冊是綁定設備的必要步驟

```jsx {5} | pure
if device.deviceStatus == .readyToRegister() {
    device.register( _ in )
}
```

註冊完成後，您可以通過 CHDeviceManager 獲取已配對的設備

```jsx {5} | pure
var chDevices = [CHDevice]()
CHDeviceManager.shared.getCHDevices { result in
    if case let .success(devices) = result {
        chDevices = devices.data
    }
}
```

### 6. 開鎖與關鎖

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

### 7. 通讯協議

各指令互動細節詳見 `BlueTooth協議` 說明。

- 查看詳細:[BlueTooth 協議](./bluetooth.md)

### 8. 查看更多詳情

關於 SesameSDK 的設計細節，請參考以下設計圖和流程圖。

## 框架/模組選用

- 註冊登錄: [Amazon Web Services](https://docs.amplify.aws/sdk/auth/getting-started/q/platform/ios/)

- 藍芽: [CoreBluetooth](https://developer.apple.com/documentation/corebluetooth/)

- 本地存儲: [CoreData](https://developer.apple.com/documentation/coredata)

- 使用庫為: [AWSMobileClientXCF](https://aws-amplify.github.io/aws-sdk-ios/docs/reference/AWSMobileClient/index.html)

- Siri Intents:[Intents](https://developer.apple.com/documentation/appintents)
- Intents 參考文章:[appintents](https://medium.com/simform-engineering/how-to-integrate-siri-shortcuts-and-design-custom-v-tutorial-e53285b550cf)

- 手機通知[User Notifications](https://developer.apple.com/documentation/usernotifications)

## 藍牙狀態機

![State Machine](https://raw.githubusercontent.com/CANDY-HOUSE/.github/main/profile/uml/uml_output/p08_statemechine.png)

<!-- ![BleConnect](https://raw.githubusercontent.com/CANDY-HOUSE/.github/main/profile/uml/uml_output/sesame_state_circle.png) -->
