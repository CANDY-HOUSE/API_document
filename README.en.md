| [中文版](./README.md) | [日本語版 ](./README.ja.md) | English Version |

# Sesame Overview

- SesameSDK is a simple, powerful, and free Bluetooth/IoT library for iOS & Android applications. The official Sesame app is also built using this SesameSDK, and all features of the Sesame app can be implemented through this SesameSDK. SesameSDK allows you to:

- Register Sesame devices (Sesame 5, Sesame 5 Pro, Sesame Bike2, Sesame BLE Connector1, Sesame open sensor, Sesame Touch 1 Pro, Sesame Touch 1, WIFI Module2)
- Lock and unlock
- Get history records 
- Update SesameOS3
- Various settings for SesameOS3 devices
- Get battery level
- Project SesameOs3 mainly solves the Bluetooth connection for hardware devices like Sesame 5, Sesame 5 Pro, Sesame Bike2, Sesame BLE Connector1, Sesame open sensor, Sesame Touch 1 Pro, Sesame Touch 1, WIFI Module2, etc. It helps users operate hardware intelligently through iOS applications.

  
## Sesame Smart Lock Diagram 
```mermaid
block-beta
	columns 5
	space space bike["Bike"]space  finger(["Finger, Card,\nPw, +Face"])
	space:5
	wifi["Wifi Module2"] space sesame["Sesame 4/5"] space touch["Touch/Touch Pro"]
	space:5
	bot["Bot"] space mobile["Mobile Phone"] space open["Open Sensor"]
	
	bike-->sesame
	finger-->touch
	wifi-->sesame
	sesame-->touch touch-->sesame
	bot-->mobile mobile-->bot
	mobile-->open open-->mobile
	
	wifi-->bot bot-->wifi
	wifi-->mobile mobile-->wifi
	sesame-->mobile mobile-->sesame
	
	sesame-->open open-->sesame
	touch-->mobile mobile-->touch
	
	
	style sesame fill:#90EE90
```
```mermaid
flowchart TB
    A(((New Arrival)))
    B[Sesame USA]
    C[A1 + C1 mini]
    D[Wifi Module 2]
    E[Bot2]
    style A fill:#bbf,stroke:#f66,stroke-width:2px,color:#fff,stroke-dasharray: 5 5
    classDef back fill:#969,stroke:#333,stroke-dasharray: 5 5
    class B,C,D,E back
```


# 1. Project Dependencies

- [Sesame 5]: This instance object applies to Sesame5 and Sesame5 Pro products
- [Sesame Bike 2]: This instance object applies to Sesame Bike 2 product
- [Sesame WiFi Module 2]: This instance object applies to Sesame WiFi Module 2 product
- [Sesame Touch Pro]: This instance object applies to Sesame BLE Connector1, Sesame Touch 1 Pro, and Sesame Touch 1 products
- [Sesame Open Sensor 1]: This instance object applies to Sesame Open Sensor 1 product
- [Class Objects]


# 2. SesameSDK Installation Requirements
* Supports Apple devices with iOS 12 and above
1. Switch Scheme to **SesameSDK**, select Any iOS Device
2. Use `command` + `shift` + `k` to clear product folder
3. Use `command` + `b` to build SDK
4. After completion, go to Xcode -> SDK project -> `Products` folder, find SesameSDK.framework, right-click and select Open in Finder to get `SesameSDK.framework`.

* SesameWatchKitSDK
1. Switch Scheme to **SesameWatchKitSDK**, select Any watch OS Device
2. Use `command` + `shift` + `k` to clean the product folder
3. Use `command` + `b` to build the SDK
4. After completion, go to Xcode -> SDK project -> `Products` folder, find SesameWatchKitSDK.framework, right-click and select "Show in Finder" to get `SesameWatchKitSDK.framework`.

# 3. SesameSDK Integration Methods
- [iOS版](./SesameOS3/ios.en.md)
- [Android版](./SesameOS3/android.en.md)
- [ESP32版](./SesameOS3/esp.en.md)

# 4. SesameBLE Communication

[Go to SesameBLE Communication](./SesameOS3/bluetooth.en.md)



# 5. Sesame API Interface Documentation

[Go to Sesame API Interface Documentation](./SesameOS3/index.en.md)

# 6. More Detailed App Interpretation

CHBluetoothCenter Class Description
This is the Core Data local storage management center of the APP, using `shared` to create a singleton for caching data to improve performance. Before storing `CHDeviceKey` into Core Data, it needs to be converted to `CHDeviceMO` (MO = manage object). `CHDeviceMO` represents the Sesame device in the local database.

## Properties

* `backgroundContext` - A Core Data `NSManagedObjectContext` that allows data operations in background threads.
* `persistentContainer`
* `cacheDevices` - Array for storing `CHDeviceMO`

## Initialization

- iOS device acquisition in background queue

## Methods

```Swift
//---初始化---
func initDevices()
// 從 Core Data 中提取所有的 CHDeviceMO 並將它們儲存到 cacheDevices

private init()
//設置 Core Data 的存儲、獲取數據模型、轉換名稱、設置存儲的位置等。
//---

func appendDevice(_ CHDeviceKey: CHDeviceKey)
//把`CHDeviceKey`轉成`CHDeviceMO`，並添加到 Core Data 和快取中。

func getDevice(deviceID: UUID?) -> CHDeviceMO?
//根據設備 UUID 在緩存中搜尋特定 CHDeviceMO 對象

func deleteDevice(_ device: CHDeviceMO)
// 刪除指定`DeviceMO`

func saveifNeed()
//如果有任何未保存的變更，則保存到 Core Data

func lastCachedevices() -> [CHDeviceMO]
//從 Core Data 中抓到所有`DeviceMO`

func logout()
//刪除所有` CHDeviceMO` 對象並清空緩存
```
# 7. CHDevice Protocol

All Sesame devices need to implement these properties and methods

## Properties

- `delegate`: A `CHDeviceStatusDelegate` proxy for monitoring device status changes
- `rssi`: Received Signal Strength Indicator (RSSI) = Distance between Sesame and phone
- `deviceId`: Unique identifier (UUID) for Sesame
- `isRegistered`: Whether the Sesame is registered
- `txPowerLevel`: Bluetooth power level of Sesame
- `productModel`: Sesame product model
- `deviceStatus`: Value of `CHDeviceStatus`, indicating current device status
- `deviceShadowStatus`: AWS IoT shadow status (Optional)
- `mechStatus`: Sesame mechanical status (Optional)

## Methods

```Swift
- getKey() -> CHDeviceKey? //如果裝置已註冊，則會返回鑰匙；否則，會返回 nil

- connect(result: @escaping (CHResult<CHEmpty>))// 建立藍芽連線到裝置

- dropKey(result: @escaping (CHResult<CHEmpty>)): // 刪除鑰匙

- disconnect(result: @escaping (CHResult<CHEmpty>))// 斷開與Sesame藍芽連線

- getVersionTag(result: @escaping (CHResult<String>)) // 取得固件版本號

- updateFirmware(result: @escaping CHResult<CBPeripheral?>) // 更新Sesame固件

- getTimeSignature() -> String //???

- reset(result: @escaping CHResult<CHEmpty>) //(循序圖)
- register(result: @escaping CHResult<CHEmpty>) //(循序圖)

- createGuestKey(result: @escaping CHResult<String>) // (循序圖)

- getGuestKeys(result: @escaping CHResult<[CHGuestKey]>) // (循序圖)

- removeGuestKey(_ guestKeyId: String, result: @escaping CHResult<CHEmpty>) // 移除(revoke?)訪客鑰匙

- updateGuestKey(_ guestKeyId: String, name: String, result: @escaping CHResult<CHEmpty>)

```


## Methods

```Swift
getFirZip() -> URL: 取得Sesame的固件壓縮檔的 URL
errorFromResultCode(_ resultCode: SesameResultCode) -> Error: 將 SesameResultCode 轉換為 Error。
```

## Switch-type Products

Sesame3/4/5/5 Pro, Bot1, Bike1/2

```Swift
public protocol CHSesameLock: CHDevice {
    var mechStatus: CHSesameProtocolMechStatus? { get set }
    func getHistoryTag() -> Data?
    func setHistoryTag(\_ tag: Data, result: @escaping (CHResult<CHEmpty>))
}
```

## Connector-type Products

Wifi2, Sesame Touch/Touch Pro, Open Sensor, Ble Connector

```Swift
public protocol CHSesameConnector {
    var sesame2Keys: [String: String] { get }
    func insertSesame(_ device: CHDevice, result: @escaping CHResult<CHEmpty>)
    func removeSesame(tag: String, result: @escaping CHResult<CHEmpty>)
}
```


## Key Data Structures
https://github.com/CANDY-HOUSE/SesameSDK_iOS_with_DemoApp/tree/master/doc/重點數據結構


# 8. APP Framework/Module Selection

- Bluetooth: CoreBluetooth
https://developer.apple.com/documentation/corebluetooth

- Local Storage: CoreData
https://developer.apple.com/documentation/coredata

- Server Side: AWS SDK for iOS Swift Package Manager
- Using library: AWSMobileClientXCF
https://aws-amplify.github.io/aws-sdk-ios/docs/reference/AWSMobileClient/index.html

- Siri & Shortcut: Intents
Official Documentation: https://developer.apple.com/documentation/appintents
Reference Article: https://medium.com/simform-engineering/how-to-integrate-siri-shortcuts-and-design-custom-intents-tutorial-e53285b550cf

- Mobile Notifications
https://developer.apple.com/documentation/usernotifications