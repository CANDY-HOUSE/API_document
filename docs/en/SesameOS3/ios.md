---
title: iOS version
---
# iOS Version SesameSDK

![Sesame device](https://github.com/CANDY-HOUSE/.github/blob/main/profile/images/SesameSDK.png?raw=true 'Sesame')

## Download App

- Sesame app on <img src="https://img.shields.io/badge/App Store-000000?logo=apple&logoColor=white"/> [https://apps.apple.com/app/id1532692301/](https://apps.apple.com/app/id1532692301/)
- Sesame app on <img src="https://img.shields.io/badge/TestFlight-0D96F6?logo=app-store&logoColor=white"/> [https://testflight.apple.com/join/Rok4GOFD/](https://testflight.apple.com/join/Rok4GOFD/)

## Installation Process

- <img src="https://img.shields.io/badge/Swift-5.3-FA7343" />
- <img src="https://img.shields.io/badge/Bluetooth-4.0LE +-0082FC" />
- <img src="https://img.shields.io/badge/iOS-12.0 +-000000" /> <img src="https://img.shields.io/badge/macOS-10.15 +-000000" /> <img src="https://img.shields.io/badge/watchOS-7.0 +-000000" /> <img src="https://img.shields.io/badge/iPadOS-12.0 +-000000" />
- <img src="https://img.shields.io/badge/Xcode-11.0 +-1575F9" />

### 1. Install Dependencies

- 1. Change Scheme to **SesameSDK**, choose Any iOS Device
- 2. `command` + `shift` + `k` to clear the product folder
- 3. `command` + `b` to package SDK
- 4. After completion, go to Xcode -> SDK project -> `Products` folder, find SesameSDK.framework, right-click, choose Open in Finder to get `SesameSDK.framework`.

#### SesameWatchKitSDK

- 1. Change Scheme to **SesameWatchKitSDK**, choose Any watch OS Device
- 2. `command` + `shift` + `k` to clear the product folder
- 3. `command` + `b` to package SDK
- 4. After completion, go to Xcode -> SDK project -> `Products` folder, find SesameWatchKitSDK.framework, right-click, choose Open in Finder to get `SesameWatchKitSDK.framework`.

#### Swift Package

[Swift Package Manager](https://www.swift.org/package-manager/) is a tool for managing the distribution of Swift code. It integrates with the Swift build system and automatically performs the processes of downloading, compiling, and linking dependencies.

- Use Swift Package Manager to integrate SesameSDK into Xcode project:

```c

dependencies: [
    .package(url: "https://github.com/CANDY-HOUSE/SesameSDK_iOS_with_DemoApp.git", .branch("master"))
]

```

![img](https://raw.githubusercontent.com/CANDY-HOUSE/SesameSDK_iOS_with_DemoApp/master/doc/src/resources/spm.png)

#### Manual Integration

- If you don't want to use any dependency managers, you can manually integrate SesameSDK into your project.

![img](https://github.com/CANDY-HOUSE/SesameSDK_iOS_with_DemoApp/raw/master/doc/src/resources/manually.png)

### 2. Add Authorization

```jsx | pure

<key> NSBluetoothAlwaysUsageDescription </key>
<string> To connect Sesame Smart Lock and lock/unlock the door. </string>
<key> NSBluetoothPeripheralUsageDescription </key>
<string>This app would like to make data available to nearby Bluetooth devices even when you're not using the app.
</string>

```

### 3. Initialization

Please start the Bluetooth scan at an appropriate time

```jsx {5} | pure
CHBluetoothCenter.shared.enableScan { res in }
```

Callback when Bluetooth status changes

```jsx {5} | pure
public protocol CHBleStatusDelegate: AnyObject {
    func didScanChange(status: CHScanStatus)
}
```

The list of scanned Sesame devices will be returned to the caller at a frequency of once per second.

```jsx {5} | pure
public protocol CHBleManagerDelegate: AnyObject {
    func didDiscoverUnRegisteredCHDevices(_ devices: [CHDevice])
}

```

### 4. Connect to Devices

Before establishing a connection, you should first confirm that the device status is connectable

```jsx {5} | pure
if sesame5.deviceStatus == .receivedBle() {
    sesame5.connect() { _ in }
}
```

At this point, you will receive the connection status callback of the Sesame device

```jsx {5} | pure
public protocol CHDeviceStatusDelegate: AnyObject {
    func onBleDeviceStatusChanged(device: CHDevice, status: CHDeviceStatus, shadowStatus: CHDeviceStatus?)
    func onMechStatus(device: CHDevice)
}
```

### 5. Device Registration

When the connection status changes to "Ready to Register", you can register the device to complete the pairing. Registration is a necessary step to bind the device

```jsx {5} | pure
if device.deviceStatus == .readyToRegister() {
    device.register( _ in )
}
```

After the registration is completed, you can get the paired devices through CHDeviceManager

```jsx {5} | pure
var chDevices = [CHDevice]()
CHDeviceManager.shared.getCHDevices { result in
    if case let .success(devices) = result {
        chDevices = devices.data
    }
}
```

### 6. Lock and Unlock

After getting the paired devices, you can lock and unlock through the APP

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

### 7. Communication Protocol

For details of interaction between each instruction, please refer to the description of `Bluetooth Protocol`.

- View Details: [Bluetooth Protocol](./bluetooth.md)

### 8. See More Details

For the design details of SesameSDK, please refer to the following design diagrams and flowcharts.

## Framework/Module Selection

- Registration and login: [Amazon Web Services](https://docs.amplify.aws/sdk/auth/getting-started/q/platform/ios/)

- Bluetooth: [CoreBluetooth](https://developer.apple.com/documentation/corebluetooth/)

- Local storage: [CoreData](https://developer.apple.com/documentation/coredata)

- Library used: [AWSMobileClientXCF](https://aws-amplify.github.io/aws-sdk-ios/docs/reference/AWSMobileClient/index.html)

- Siri Intents: [Intents](https://developer.apple.com/documentation/appintents)
- Intents reference article: [appintents](https://medium.com/simform-engineering/how-to-integrate-siri-shortcuts-and-design-custom-v-tutorial-e53285b550cf)

- Mobile notifications: [User Notifications](https://developer.apple.com/documentation/usernotifications)

## BLE Product Code Example Explanation

For details of each `Class`, please refer to the description of `Sesame SDK Class`.

- View Details: [Sesame SDK Class](../index.md)

## Bluetooth State Machine

![State Machine](https://raw.githubusercontent.com/CANDY-HOUSE/.github/main/profile/uml/uml_output/p08_statemechine.png)

<!-- ![BleConnect](https://raw.githubusercontent.com/CANDY-HOUSE/.github/main/profile/uml/uml_output/sesame_state_circle.png) -->

## iOS Class Diagram

![Class_diagram](https://raw.githubusercontent.com/CANDY-HOUSE/.github/main/profile/uml/uml_output/class_diagram.png)
