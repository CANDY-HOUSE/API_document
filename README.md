| 中文版 | [日本語版 ](./README.ja.md) |[ English Version](./README.en.md) |

# Sesame概述

- SesameSDK 是一个简单、强大且免费的蓝牙/物联网（物联网）库，适用于 iOS & Android 应用程序。Sesame 官方应用程序也是使用这个 SesameSDK 构建的，芝麻应用程序的所有功能都可以通过这个 SesameSDK 实现。SesameSDK 允许您：

- 注册 Sesame 设备（Sesame 5、Sesame 5 Pro、Sesame Bike2、Sesame BLE Connector1、Sesame open sensor、Sesame Touch 1 Pro、 Sesame Touch 1 、WIFI Module2）
- 锁定和解锁
- 获取历史记录
- 更新 SesameOS3
- SesameOS3 设备的各种设置
- 获取电池电量
- 项目 SesameOs3 主要解决硬件设备 Sesame 5、Sesame 5 Pro、Sesame Bike2、Sesame BLE Connector1、Sesame open sensor、Sesame Touch 1 ProCHBluetoothCenter 類別說明、 Sesame Touch 1 、WIFI Module2 等产品通过蓝牙连接。帮助用户通过 iOS 应用软件智能操作硬件。
  
## Sesame智能门锁图示 
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


# 1. 项目依赖

- [Sesame 5] :该实例对象应用于 Sesame5 、Sesame5 Pro 产品
- [Sesame Bike 2] : 该实例对象应用于 Sesame Bike 2 产品
- [Sesame WiFi Module 2]:该实例对象应用于 Sesame WiFi Module 2 产品
- [Sesame Touch Pro]:该实例对象应用于 Sesame BLE Connector1、 Sesame Touch 1 Pro 、 Sesame Touch 1 产品
- [Sesame Open Sensor 1]:该实例对象应用于 Sesame Open Sensor 1 产品
- [Class 对象]

# 2、SesameSDK安装要求
* 支持iOS 12以上的苹果设备
1. Scheme 切到 **SesameSDK**, 選擇 Any iOS Device
2. `command` + `shift` + `k` 清除 product 資料夾
3. `command` + `b` 打包 SDK
4. 完成後到 Xcode -> SDK project -> `Products` 資料夾底下 找到 SesameSDK.framework 點擊右鍵 選擇在 Finder 打開, 取得 `SesameSDK.framework`.

* SesameWatchKitSDK
1. Scheme 切到 **SesameWatchKitSDK**, 選擇 Any watch OS Device
2. `command` + `shift` + `k` 清除 product 資料夾
3. `command` + `b` 打包 SDK
4. 完成後到 Xcode -> SDK project -> `Products` 資料夾底下 找到 SesameWatchKitSDK.framework 點擊右鍵 選擇在 Finder 打開, 取得 `SesameWatchKitSDK.framework`.

# 3、SesameSDK集成方式
- [iOS版](./SesameOS3/ios.md)
- [Android版](./SesameOS3/android.md)
- [ESP32版](./SesameOS3/esp.md)


# 4、Sesame BLE通讯

[进入SesameBLE通讯](./SesameOS3/bluetooth.md)

# 5、Sesame API 接口文档

[进入Sesame API 接口文档](./SesameOS3/index.md)

# 6、APP更多详细解读

CHBluetoothCenter 類別說明
此 APP 的 Core Data 本地儲存管理中心，以`shared` 建立單例，用來緩存數據以提高性能。將`CHDeviceKey` 存入 Core Data 前須轉換為 `CHDeviceMO`(MO = manage object)。 `CHDeviceMO` 即代表本地數據庫中的 Sesame 設備。

## 屬性

* `backgroundContext` 一個 Core Data 的 `NSManagedObjectContext`，允許在背景執行緒中執行數據操作。
* `persistentContainer`
* `cacheDevices` 存`CHDeviceMO` 用的陣列

## 初始化

- iOS 在背景列獲取設備

## 方法

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
# 7、CHDevice 協議

所有 Sesame 裝置都需要實現這些屬性和方法

## 屬性

- `delegate`: 這是 `CHDeviceStatusDelegate` 的代理，用於監聽裝置狀態的變化
- `rssi` : 接收藍芽信號強度指示符 (RSSI) = Sesame 與手機的距離
- `deviceId`: Sesame 唯一識別碼(UUID)
- `isRegistered`:該 Sesame 是否已被註冊
- `txPowerLevel`: Sesame 的藍芽功率等級
- `productModel`: Sesame 產品型號
- `deviceStatus`: `CHDeviceStatus` 的值，表示裝置的當前狀態
- `deviceShadowStatus` : AWS Iot 影子狀態(Optional)
- `mechStatus` : Sesame 機械狀態(Optional)

## 方法

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


## 方法

```Swift
getFirZip() -> URL: 取得Sesame的固件壓縮檔的 URL
errorFromResultCode(_ resultCode: SesameResultCode) -> Error: 將 SesameResultCode 轉換為 Error。
```

## 開關型產品

Sesame3/4/5/5 Pro, Bot1, Bike1/2

```Swift
public protocol CHSesameLock: CHDevice {
    var mechStatus: CHSesameProtocolMechStatus? { get set }
    func getHistoryTag() -> Data?
    func setHistoryTag(\_ tag: Data, result: @escaping (CHResult<CHEmpty>))
}
```

## 連接型產品

Wifi2, Sesame Touch/Touch Pro, Open Sensor ,Ble Connector

```Swift
public protocol CHSesameConnector {
    var sesame2Keys: [String: String] { get }
    func insertSesame(_ device: CHDevice, result: @escaping CHResult<CHEmpty>)
    func removeSesame(tag: String, result: @escaping CHResult<CHEmpty>)
}
```


## 重点数据结构
https://github.com/CANDY-HOUSE/SesameSDK_iOS_with_DemoApp/tree/master/doc/重點數據結構


# 8、APP框架/模组选用

- 藍芽: CoreBluetooth

https://developer.apple.com/documentation/corebluetooth

- 本地存儲: CoreData

https://developer.apple.com/documentation/coredata

- Server 端: AWS SDK for iOS Swift Package Manager

- 使用庫為 AWSMobileClientXCF
  https://aws-amplify.github.io/aws-sdk-ios/docs/reference/AWSMobileClient/index.html

- Siri & Short cut: Intents

官方文檔 https://developer.apple.com/documentation/appintents
參考文章 https://medium.com/simform-engineering/how-to-integrate-siri-shortcuts-and-design-custom-intents-tutorial-e53285b550cf


- 手機通知

https://developer.apple.com/documentation/usernotifications
