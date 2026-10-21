---
title: "クラス  リファレンス"
---
下記は SesameSDK の全ての APIの定義 と オブジェクトクラスの詳細です。

# [CHBleManager](./reference.md#chblemanager)
**iOS**
```swift
public class CHBleManager : NSObject {
    public static let shared: SesameSDK.CHBleManager
    weak public var delegate: SesameSDK.CHBleManagerDelegate? 
    // 未登録デバイスリストのdelegateイベントを受け取る
    weak public var statusDelegate: SesameSDK.CHBleStatusDelegate? 
    // 端末のBLE状態のdelegateイベントを受け取る
    public private(set) var scanning: SesameSDK.CHScanStatus 
    // BLEスキャン状態のdelegateイベントを受け取る
    // このメソッドを使用するとCANDY HOUSEのBLEデバイスのBLEアドバタイシングが現れるまた変動がある場合、SesameSDKがアプリUIにdelegateイベントを送る。アプリUIが通知を受け取ったら、セサミデバイスとのオブジェクトが取得できるようになり、オブジェクトの中にセサミデバイスのUUID入っている。
    public func disableScan(result: @escaping (SesameSDK.CHResult<SesameSDK.CHEmpty>)) 
    //BLEスキャンのスイッチをオフする
    public func enableScan(result: @escaping (SesameSDK.CHResult<SesameSDK.CHEmpty>)) 
    //BLEスキャンのスイッチをオンする
    public func disConnectAll(result: @escaping (SesameSDK.CHResult<SesameSDK.CHEmpty>)) 
    //全てのBLEデバイスとアプリとの間のBluetooth接続を切断。
}
```
**Android**
```kotlin
object CHBleManager {
    operator fun invoke(appContext: Context)
    var statusDelegate: CHBleStatusDelegate?
    var delegate: CHBleManagerDelegate?
    var mScanning: CHScanStatus
    fun disableScan(result: CHResult<CHEmpty>)
    fun enableScan(openble: Boolean, result: CHResult<CHEmpty>)
    fun disConnectAll(result: CHResult<CHEmpty>)
}
```

**関連クラス** <br />
[`CHBleManagerDelegate`](./reference.md#chblemanagerdelegate) <br />
[`CHBleStatusDelegate`](./reference.md#chblestatusdelegate) <br />
[`CHScanStatus`](./reference.md#chscanstatus) <br />
[`BleStatus`](./reference.md#blestatus) <br />

# [CHBleManagerDelegate](./reference.md#chblemanagerdelegate)
未登録デバイスリストのdelegateイベントを受け取る<br /><br />
**iOS**
```swift
public protocol CHBleManagerDelegate : AnyObject {
    func didDiscoverUnRegisteredCHDevices(_ devices: [SesameSDK.CHDevice])
}
```
**Android**
```kotlin
interface CHBleManagerDelegate {
    fun didDiscoverUnRegisteredCHDevices(devices: List<CHDevices>)
}
```
**関連クラス** <br />
[`CHBleManager`](./reference.md#chblemanager) <br />
[`CHDevice`](./reference.md#chdevice) <br />

# [CHBleStatus](./reference.md#chblestatus)
端末のBLE状態を表す<br /><br />
**iOS**
```swift
public enum BleStatus : String {
    case opened // オン
    case closed // オフ
}
```
**Android**
```kotlin
enum class CHBleStatus {
    opened,
    closed,
}
```
# [CHBleStatusDelegate](./reference.md#chblestatusdelegate)
端末のBLE状態のdelegateイベントを受け取る<br/>
**iOS**
```swift
public protocol CHBleStatusDelegate : AnyObject {
    func didScanChange(status: SesameSDK.CHScanStatus)
}
```
**Android**
```kotlin
interface CHBleStatusDelegate {
    fun didScanChange(ss: CHScanStatus)
}
```

**関連クラス** <br />
[`CHBleManager`](./reference.md#chblemanager) <br />
[`CHScanStatus`](./reference.md#chscanstatus) <br />

# [CHConfiguration](./reference.md#chconfiguration)
API_KEY, [AppGroups](https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_security_application-groups/)() を設定する。<br/><br />
**iOS**
```swift
final public class CHConfiguration {
    public static let shared: SesameSDK.CHConfiguration
    public var apiKey: String
    public var clientId: String
    public var appGroup: String  // AppGroupsはWidgets(Today Extension)のためにある
}
```
**実装例 iOS** <br />
```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions
        launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
// ...
    CHConfiguration.shared.apiKey = "your-api-key"
    CHConfiguration.shared.clientId = "your-client-id"
    CHConfiguration.shared.appGroup = "your-app-groups-id"
// ...
}
```
**Android**
```kotlin
object CHConfiguration {
    var API_KEY: String?
}
```
**実装例 Android**
```kotlin
class CandyHouseApp : Application() {
    override fun onCreate() {
        // ...
        CHConfiguration.API_KEY = "your-api-key"
        // ..
    }
}
```

# [CHDevice](./reference.md#chdevice)
全てのCANDY HOUSE製品はCHDeviceと言います。<br /><br />
**iOS**
```swift
public protocol CHDevice : AnyObject {
    var rssi: NSNumber? { get } // iOSが受信しているセサミデバイスのBLEアドバタイジング信号強度、単位: dBm
    var deviceId: UUID! { get } // 各セサミデバイスの唯一識別子UUIDで、 セサミデバイスがリセットされて再度登録し直されても、SesameOSがアップデートされても、このUUIDは永遠に変わらない
    var isRegistered: Bool { get } // 既に登録済みか否か
    var txPowerLevel: Int? { get } // セサミデバイスが発信しているBLEアドバタイジングの信号強度、単位: dBm
    var productModel: SesameSDK.CHProductModel { get } // デバイス種類
    var deviceStatus: SesameSDK.CHSesame2Status { get } 
    // BLE接続状況：セサミ発見->接続中->認証済->接続成功など
    func getKey() -> SesameSDK.CHDeviceKey? // SesameSDKの内部データベースに保存されてるこのセサミデバイスの「鍵」オブジェクトを取り出す
    func connect(result: @escaping (SesameSDK.CHResult<SesameSDK.CHEmpty>)) 
    // このセサミデバイスとアプリとの間のBluetooth接続を築く
    func dropKey(result: @escaping (SesameSDK.CHResult<SesameSDK.CHEmpty>)) 
    // SesameSDKの内部データベースに保存されてるこのセサミデバイスの鍵を破棄するだけ。再度何処かから同じ鍵を取ってこれば再度使える状態になる。
    func disconnect(result: @escaping (SesameSDK.CHResult<SesameSDK.CHEmpty>))
    /* disconnect() や disConnectAll()を叩かないと、
      アプリをバックグラウンドに送った時にセサミデバイスとアプリとの間のBluetooth接続がされたのままなので、セサミデバイスとWidgetとの間のBluetooth接続に切り替えできない。
      また同様に、Widgetをバックグラウンドに送った時に、セサミデバイスとアプリとの間のBluetooth接続への切り替えもできない。
    */
    func getVersionTag(result: @escaping (SesameSDK.CHResult<String>))
    //セサミデバイスのSesameOSのバージョンを取得。version + "-" + 機種 + "-" + 「6-digit git commit number」 例: 2.0-1-abcdef
    func updateFirmware(result: @escaping SesameSDK.CHResult<CBPeripheral?>) 
    // SesameOSをBLE経由でアップデート
    func reset(result: @escaping SesameSDK.CHResult<SesameSDK.CHEmpty>)
    /* CANDY HOUSEのサーバーと関係なく、セサミデバイスと接続済であれば使える。
      セサミデバイスを初期化（リセット）し、そしてSesameSDKの内部データベースに保存されてるこのセサミデバイスの鍵を破棄する。
      何処かから同じ鍵を取って来ても再度使えない。再度セサミデバイスを使用したい場合、ユーザーは新規登録にて再度新たなセサミデバイスの鍵を作成する必要がある。
    */
    func register(result: @escaping SesameSDK.CHResult<SesameSDK.CHEmpty>) 
    // CANDY HOUSEサーバーへこのセサミデバイスを登録する
    func createGuestKey(result: @escaping SesameSDK.CHResult<String>) 
    // ゲストキーを作成。ネットとの接続は必須
    func getGuestKeys(result: @escaping SesameSDK.CHResult<[SesameSDK.CHGuestKey]>) 
    // ゲストキーのリストを取得。ネットとの接続は必須。
    func removeGuestKey(_ guestKeyId: String, result: @escaping SesameSDK.CHResult<SesameSDK.CHEmpty>) 
    // ゲストキーを削除。ネットとの接続は必須。
    func updateGuestKey(_ guestKeyId: String, name: String, result: @escaping SesameSDK.CHResult<SesameSDK.CHEmpty>) 
    // ゲストキーのタグをアップデート
}
```
**Android**
```kotlin
interface CHDevices {
    var deviceStatus: CHSesame2Status
    var rssi: Int?
    val txPowerLevel: Int?
    var deviceId: UUID?
    var isRegistered: Boolean
    var productModel: CHProductModel
    fun connect(result: CHResult<CHEmpty>)
    fun disconnect(result: CHResult<CHEmpty>)
    fun getKey(): CHDevice
    fun dropKey(result: CHResult<CHEmpty>)
    fun getVersionTag(result: CHResult<String>)
    fun register(result: CHResult<CHEmpty>)
    fun reset(result: CHResult<CHEmpty>)
    fun updateFirmware(onResponse: CHResult<BluetoothDevice>)
    fun createGuestKey(keyName: String, result: CHResult<CHDevice>)
    fun getGuestKeys(result: CHResult<Array<CHGuestKeyCut>>)
    fun removeGuestKey(guestKeyId: String, result: CHResult<CHEmpty>)
    fun updateGuestKey(guestKeyId: String, name: String, result: CHResult<CHEmpty>)
}
```

**関連クラス** <br />
[`CHProductModel`](./reference.md#chproductmodel) <br />
[`CHSesame2Status`](./reference.md#chsesame2status) <br />
[`CHDeviceKey`](./reference.md#chdevicekey) <br />
[`CHGuestKey`](./reference.md#chguestkey) <br />
[`CHSesame2`](./reference.md#chsesame2) <br />
[`CHSesameBot`](./reference.md#chsesamebot) <br />
[`CHSesameBike`](./reference.md#chsesamebike) <br />
[`CHWifiModule2`](./reference.md#chwifimodule2) <br />

# [CHDeviceKey](./reference.md#chdevicekey)
セサミの鍵とのオブジェクトクラス。getKey()でSesameSDKの内部ローカルデータベースから鍵を取り出す場合や、`CHDeviceManager`で鍵を受け取る場合に使用するオブジェクトクラス。<br/><br/>
**iOS**
```swift
public class CHDeviceKey : NSObject, NSCopying, Codable {
    public var deviceUUID: UUID // 各セサミデバイスの唯一識別子UUIDで、 セサミデバイスがリセットされて再度登録し直されても、SesameOSがアップデートされても、このUUIDは永遠に変わらない
    public var deviceModel: String // Sesame デバイス種類 (sesame_3 , wm_2 , ssmbot_1 , bike_1 , ...)
    public var historyTag: Data?   // history tag
    public var keyIndex: String    // 固定值 0000
    public var secretKey: String   // Sesame の鍵の正体
    public var sesame2PublicKey: String // Sesame の Public Key
    public init(deviceUUID: UUID, deviceModel: String, historyTag: Data?, keyIndex: String, secretKey: String, sesame2PublicKey: String)
    public func copy(with zone: NSZone? = nil) -> Any
}
```
**Android**

```kotlin
data class CHDevice(
    @PrimaryKey var deviceUUID: String,
    val deviceModel: String,
    var historyTag: ByteArray?,
    val keyIndex: String,
    val secretKey: String,
    val sesame2PublicKey: String
)
```

# [CHDeviceLoginStatus](./reference.md#chdeviceloginstatus)
デバイスのBLEログイン状態(Sesameに正しい鍵を挿し込む状態)<br/><br />
**iOS**
```swift
public enum CHDeviceLoginStatus : String {
    case logined   // BLEログイン済み (Sesameに正しい鍵を挿し込み成功)
    case unlogined // 未BLEログイン
}
```
**Android**
```kotlin
enum class CHDeviceLoginStatus {
    Login,
    UnLogin,
}
```
**関連クラス** <br />
[`CHSesame2Status`](./reference.md#chsesame2status) <br />
[`CHSesame2ShadowStatus`](./reference.md#chsesame2shadowstatus) <br />

# [CHDeviceManager](./reference.md#chdevicemanager)
登録済の **セサミオブジェクト** を取り出す。また、外部からシェアされた **セサミの鍵オブジェクト** を受け取る。<br/><br />
**iOS**
```swift
public class CHDeviceManager : NSObject {
    public static let shared: SesameSDK.CHDeviceManager
    public func getCHDevices(result: @escaping (SesameSDK.CHResult<[SesameSDK.CHDevice]>)) 
    //SesameSDKの内部のローカルのデータベースから自分が所有しているセサミデバイスとの鍵のオブジェクトlistを取得します。セサミデバイスがない場合、空の配列が返ってくる。
    public func receiveCHDeviceKeys(_ deviceKeys: [SesameSDK.CHDeviceKey], result: @escaping (SesameSDK.CHResult<[SesameSDK.CHDevice]>))
    public func receiveCHDeviceKeys(_ deviceKeys: SesameSDK.CHDeviceKey..., result: @escaping (SesameSDK.CHResult<[SesameSDK.CHDevice]>)) 
    // このセサミデバイスの鍵をSesameSDKの内部のローカルのデータベースに入れる
}
```
**Android**
```kotlin
object CHDeviceManager {
    fun getCandyDevices(model: CHProductModel? = null, result: CHResult<List<CHDevices>>)
    fun receiveCHDeviceKeys(vararg devicesKeys: CHDevice, result: CHResult<ArrayList<CHDevices>>)
    fun receiveCHDeviceKeys(devicesKeys: List<CHDevice>, result: CHResult<ArrayList<CHDevices>>)
}
```
**関連クラス** <br />
[`CHDevice`](./reference.md#chdevice) <br />
[`CHDeviceKey`](./reference.md#chdevicekey) <br />


# [CHEmpty](./reference.md#chempty)
ヌルを表す抽象クラス<br/><br />
**iOS**
```swift
public class CHEmpty {
}
```
**Android**
```kotlin
class CHEmpty
```

# [CHGuestKey](./reference.md#chguestkey)
ゲストキーのオブジェクトクラス<br/><br />
**iOS**
```swift
public struct CHGuestKey : Codable {
    public let guestKeyId: String // ゲストキー ID
    public var keyName: String    // ゲストキー 名称
}
```
**Android**
```kotlin
data class CHGuestKeyCut(
    var guestKeyId: String,
    var keyName: String
)
```
**関連クラス** <br />
[`CHDevice`](./reference.md#chdevice) <br />

# [CHProductModel](./reference.md#chproductmodel)
CANDY HOUSE製品のオブジェクトクラス<br/><br />
**iOS**
```swift
public enum CHProductModel : UInt16 {
    case sesame2
    case wifiModule2
    case sesameBot
    case bikeLock
    public func productType() -> Int    // Sesame デバイス種類 コード
    public func deviceModel() -> String // Sesame デバイス種類 (sesame_3 , wm_2 , ssmbot_1 , bike_1 , ...)
    public func isLock() -> Bool        // ロックのカテゴリか否か
}
```
**Android**
```kotlin
enum class CHProductModel {
    abstract fun productType(): Int
    abstract fun deviceModel(): String
    abstract fun isLocker(): Boolean
    WM2 {
        override fun productType()
        override fun deviceModel()
        override fun deviceFactory()
        override fun isLocker()
    },
    SS2 {
        override fun productType()
        override fun deviceModel()
        override fun deviceFactory()
        override fun isLocker()
    },
    SesameBot1 {
        override fun productType()
        override fun deviceModel()
        override fun deviceFactory()
        override fun isLocker()
    },
    BiKeLock {
        override fun productType()
        override fun deviceModel()
        override fun deviceFactory()
        override fun isLocker()
    }
}
```
**関連クラス** <br />
[`CHDevice`](./reference.md#chdevice) <br />

# [CHResult](./reference.md#chresult)
メソッドを叩いた結果を表すコールバック<br/><br/>
**iOS** [https://developer.apple.com/documentation/swift/result](https://developer.apple.com/documentation/swift/result)
```swift
public typealias CHResult<T> = (Result<SesameSDK.CHResultState<T>, Error>) -> ()
public class CHResultState<T> {
    public var data: T
}
```
**Android** [https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-result/](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-result/)
```kotlin
typealias CHResult<T> = (Result<CHResultState<T>>) -> Unit
```
**NSError table**
1. [HTTP status codes](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes)
2. [Apple CBManagerState](https://developer.apple.com/documentation/corebluetooth/cbmanagerstate)

| Error type | Domain | Code | Message | 説明 |推薦文言|ユーザーの対処方法|
|:----------:|:------:|:----:|:-------:|:---:|:---:|:---:|
| Internet |  SesameSDK  |  -1009 |The Internet connection appears to be offline ||通信環境が悪いため、情報を取得できません。しばらく時間をおいてから、再度お試しください。|ユーザーが通信環境を確認し、再度試す。|
| Internet |  SesameSDK  |  403   | Forbidden | No API key |サーバーとの接続に失敗しました。|アプリUI側の実装上の問題やSDK/サーバー不具合。ユーザーでは解決できない。|
| Internet |  SesameSDK  |  400   | Bad request | Wrong Server API parameter <br/> (CANDY HOUSE内部問題) |サーバーとの接続に失敗しました。|SDK/サーバー不具合。ユーザーでは解決できない。|
| Internet |  SesameSDK  |  404   | Not found | Wrong URL <br/> (CANDY HOUSE内部問題) |サーバーとの接続に失敗しました。|SDK/サーバー不具合。ユーザーでは解決できない。|
| Internet |  SesameSDK  |  502   | Unknown error | CANDY HOUSE server is probably down <br/> (CANDY HOUSE内部問題) |サーバーとの接続に失敗しました。しばらく時間をおいてもう一度お試しください。|CANDY HOUSEサーバーで障害発生中。しばらくたってから再度試してもらう。|
| Data |  SesameSDK  |  401 | History authentication failed | 捏造された履歴をサーバーに送ろうとしてる時のエラー |エラーが発生しました。|ユーザーでは解決できない。|
| Data |  SesameSDK  |  480 | PARSE_ERROR | History data parsing failed <br/> (CANDY HOUSE内部問題) |エラーが発生しました。|リトライしても発生する場合は、SDK/サーバー不具合。ユーザーでは解決できない。|
| Data |  SesameSDK  |  600 | History tag is longer than 21-byte limit ||エラーが発生しました。|アプリUIの実装の問題。 ユーザーでは解決できない。|
| BLE command <br/> (unlogin) | CBCentralManager |  4  | PoweredOff| Bluetooth of this iOS/Android device is off |スマートフォンのBluetoothがOFFになっています。BluetoothをONにしてから再度お試しください。|BluetoothをONにしてから再度試してもらう。|
| BLE command <br/> (unlogin) | CBCentralManager |  3  | Unauthorized| This app is not authorised to use Bluetooth by this iOS/Android device |Bluetoothを利用する権限ありません。スマートフォンの「設定」から許可してください。|スマホの設定からアプリにBluetoothの権限が付与されているか確認する。|
| BLE command <br/> (unlogin) | CBCentralManager |  2  | Unsupported| This iOS/Android device is not compatible with Bluetooth 4.0 or later |お使いのスマートフォンではBluetooth4.0以上に対応しておりません。他のスマートフォンをご利用ください。|BLE4.0以上に非対応のスマートフォンで利用しているため、別機種で利用してもらう。|
| BLE command <br/> (unlogin) | SesameSDK |  -2 | No BLE signal| セサミデバイスのBluetooth信号が見つからない |セサミデバイスが見つかりません。セサミデバイスに青いランプが点滅していることを確認し、セサミデバイスの近くで再度お試しください。|セサミロック本体のLEDを確認してもらう。点滅しない場合、電池を入れ替える。|
| BLE command <br/> (login) |  SesameSDK  |  -1 | Sesame BLE unlogin| セサミデバイスの鍵を未だセサミデバイスに挿入していない |エラーとしてはユーザに見せずにアプリでBLEの接続を試みる。|アプリUI側の実装上の問題。|
| BLE command <br/> (login) |  SesameSDK  |  1  | Invalid Format||エラーが発生しました。|SDK不具合。ユーザーでは解決できない。|
| BLE command <br/> (login) |  SesameSDK  |  2  | notSupported|そのデバイスが対応していないコマンド|お使いのスマートロックでは本機能はご利用いただけません。||
| BLE command <br/> (login) |  SesameSDK  |  3  | resultStorageFail||||
| BLE command <br/> (login) |  SesameSDK  |  4  | invalidSig||||
| BLE command <br/> (login) |  SesameSDK  |  5  | notFound||||
| BLE command <br/> (login) |  SesameSDK  |  6  | unknown| |||
| BLE command <br/> (login) |  SesameSDK  |  7  | busy| |||
| BLE command <br/> (login) |  SesameSDK  |  8  | invalid Param| |||


| Type of BLE command | items | 説明 |
|:-------------------:|:-----:|:---:|
| BLE command <br/> (login)  | lock(), unlock(), toggle(), <br/> configureLockPosition(), getAutolockSetting(), enableAutolock(), disableAutolock(), updateFirmware(), updateBleAdvParameter(),<br/> disconnect(), resetSesame(),  |セサミデバイスの鍵が必要なBLEコマンド|
| BLE command <br/> (unlogin) |  connect(), registerSesame2(), updateFirmware() |セサミデバイスの鍵が不要なBLEコマンド|


**実装例 iOS**
```swift
sesame2.toggle { result in
    switch result {
       case .success(let chResultState):
           L.d("CHResultState" , chResultState,chResultState.data)
           //["CHResultState", SesameSDK.CHResultStateBLE<SesameSDK.CHEmpty>, SesameSDK.CHEmpty]
       case .failure(let error):
           L.d("error",error)
       }
}
```
**実装例 Android**
``` kotlin
sesame2.toggle() {
    it.onSuccess {

    }
    it.onFailure {
       L.d ("message" + it)
       L.d("code t" + (it as NSError).code)
       L.d("domaon!!!!!:" + (it as NSError).domaon)
       toastMSG(it.message)
    }
}
```


# [CHResultStateBLE](./reference.md#chresultstateble)
CHResultの子クラス。iOS Core Dataに関するコールバック。
```swift
public class CHResultStateBLE<T> : SesameSDK.CHResultState<T> {
}
```

# [CHResultStateCache](./reference.md#chresultstatecache)
CHResultの子クラス。BLEに関するコールバック。
```swift
public class CHResultStateCache<T> : SesameSDK.CHResultState<T> {
}
```

# [CHResultStateNetworks](./reference.md#chresultstatenetworks)
CHResultの子クラス。ネットに関するコールバック。
```swift
public class CHResultStateNetworks<T> : SesameSDK.CHResultState<T> {
}
```

# [CHSSID](./reference.md#chssid)
WiFi ModuleがスキャンしたWiFi SSIDのコールバック
```swift
public struct CHSSID : Equatable {
    public let name: String // SSID 名称
    public let rssi: Int16  // 電波強度
    public static func == (lhs: SesameSDK.SSID, rhs: SesameSDK.SSID) -> Bool
}
```
**関連クラス** <br />
[`CHWifiModule2Delegate`](./reference.md#chwifimodule2delegate) <br />

# [CHScanStatus](./reference.md#chscanstatus)
端末のBluetooth機能の状態を表す<br/><br />
**iOS**
```swift
public enum CHScanStatus : Equatable {
    case enable(bleStatus: SesameSDK.BleStatus = BleStatus.opened)   
    // 端末のBLE 使用可能
    case disable(bleStatus: SesameSDK.BleStatus = BleStatus.opened)  
    // 端末のBLE 使用不可
    case bleClose(bleStatus: SesameSDK.BleStatus = BleStatus.closed) 
    // 端末のBLE オフ
    case error(bleStatus: SesameSDK.BleStatus = BleStatus.opened)    
    // 端末のBLE エラー
    public var bleStatus: SesameSDK.BleStatus { get }                
    // 端末のBLE 状態
    public var plainText: String { get }
}
```
**Android**
```kotlin
enum class CHScanStatus(val value: BleStatus) {
    Enable(BleStatus.opened),
    Disable(BleStatus.opened),
    BleClose(BleStatus.closed),CHScanStatus
    Error(BleStatus.opened),
}
```
**関連クラス** <br />
[`CHBleStatus`](./reference.md#chblestatus) <br />
[`CHBleManager`](./reference.md#chblemanager) <br />
[`CHBleStatusDelegate`](./reference.md#chblestatusdelegate) <br />

# [CHServerError](./reference.md#chservererror)
サーバーエラー
```swift
public class CHServerError : Codable {
    public var message: String // エラーメッセージ
}
```

# [CHSesame2](./reference.md#chsesame2)
セサミのオブジェクトクラス。こちらのインタフェースを使用し、セサミの登録、施解錠、各種の設定などご利用可能。<br/><br/>
**iOS**
```swift
public protocol CHSesame2 : SesameSDK.CHSesameLock {
    override var deviceStatus: SesameSDK.CHSesame2Status { get } 
    // デバイス状態
    var intention: SesameSDK.CHSesame2Intention { get } 
    // locking：現在施錠しようとしている途中 ; unlocking：現在開錠しようとしている途中
    var delegate: SesameSDK.CHSesame2Delegate? { get set } 
    // このDelegateメソッドを使用するとCHSesame2Status/CHSesame2MechStatus/CHSesame2Historyの変化があればSesameSDKがアプリUIにDelegateイベントを送る
    override var mechStatus: SesameSDK.CHSesameProtocolMechStatus? { get } 
    // セサミの解錠・施錠の角度などの機械状態
    var mechSetting: SesameSDK.CHSesame2MechSettings? { get } 
    // セサミの機械設定状態
    var deviceShadowStatus: SesameSDK.CHSesame2ShadowStatus? { get } 
    // セサミのShadowステータス
    override func getVersionTag(result: @escaping (SesameSDK.CHResult<String>)) 
    // SesameOSバージョンを取得
    func getAutolockSetting(result: @escaping (SesameSDK.CHResult<Int>)) 
    // オートロック機能の設定状態を取得
    func lock(historytag: Data?, result: @escaping (SesameSDK.CHResult<SesameSDK.CHEmpty>)) 
    // 施錠する
    func unlock(historytag: Data?, result: @escaping (SesameSDK.CHResult<SesameSDK.CHEmpty>)) 
    // 解錠する
    func toggle(historytag: Data?, result: @escaping (SesameSDK.CHResult<SesameSDK.CHEmpty>)) 
    // 解錠状態の場合は施錠する、施錠状態の場合は解錠する
    func disableAutolock(historytag: Data?, result: @escaping (SesameSDK.CHResult<Int>)) 
    // オートロック機能をオフ
    func getHistories(cursor: UInt?, _ result: @escaping SesameSDK.CHResult<SesameSDK.CHSesameHistoryPayload>)
    // SesameSDK経由で新→旧との順番で履歴を取得する。 履歴が新→旧の順番で、1ページの中に最多50件の履歴が入ってる。
    func getBleAdvParameter(_ result: @escaping SesameSDK.CHResult<SesameSDK.CHSesame2BleAdvParameter>) 
    // セサミデバイスが発信しているBLEアドバタイシング の Interval と TXPower の設定値を取得する。
    func enableAutolock(historytag: Data?, delay: Int, result: @escaping (SesameSDK.CHResult<Int>)) 
    // オートロック機能の秒数を入力しオンにする ; delay: オートロック機能の秒数
    func configureLockPosition(historytag: Data?, lockTarget: Int16, unlockTarget: Int16, result: @escaping (SesameSDK.CHResult<SesameSDK.CHEmpty>))
    // 施解錠の回転位置を設定する。範圍： -32767~0~32767 ; -32768 は意義のないデフォルト值。 例0˚ ⇄ 0 で 360˚ ⇄ 1024
    func updateBleAdvParameter(historytag: Data?, interval: Double, txPower: Int8, _ result: @escaping SesameSDK.CHResult<SesameSDK.CHSesame2BleAdvParameter>)
    /* セサミデバイスが発信しているBLEアドバタイシング の Interval と TXPower を調整する。
      intervalには20ms～10240msまで設定可能ですが、次のいずれかの値の設定がアップル社のAccessory Design Guidelines for Apple Devices 35.5 Advertising Intervalにて推奨されています: [1285.0, 1022.5, 852.5, 760.0, 546.25, 417.5, 318.75, 211.25, 152.5, 20.0] 単位: ms
      txPowerには次のいずれかの値が設定可能。 [4, 3, 0, -4, -8, -12, -16, -20, -40] 単位: dBm
    */
}
```
**Android**
```kotlin
interface CHSesame2 : CHSesameLocker {
    var delegate: CHSesame2Delegate?
    var deviceShadowStatus: CHSesame2ShadowStatus?
    var mechSetting: CHSesame2MechSettings?
    var intention: CHSesame2Intention
    fun lock(historytag: ByteArray? = null, result: CHResult<CHEmpty>)
    fun unlock(historytag: ByteArray? = null, result: CHResult<CHEmpty>)
    fun toggle(historytag: ByteArray? = null, result: CHResult<CHEmpty>)
    fun configureLockPosition(lockTarget: Short, unlockTarget: Short, historytag: ByteArray? = null, result: CHResult<CHEmpty>)
    fun getAutolockSetting(result: CHResult<Int>)
    fun enableAutolock(delay: Int, historytag: ByteArray? = null, result: CHResult<Int>)
    fun disableAutolock(historytag: ByteArray? = null, result: CHResult<Int>)
    fun getHistories(page: Int, result: CHResult<List<CHSesame2History>>)
    fun getBleAdvParameter(result: CHResult<CHSesame2BleAdvParameter>)
    fun updateBleAdvParameter(interval: Double, txPower: Byte, historytag: ByteArray? = null, result: CHResult<CHSesame2BleAdvParameter>)
    fun loginSesame(token: String? = null)
}
```
**関連クラス** <br />
[`CHDevice`](./reference.md#chdevice) <br />
[`CHSesameLock`](./reference.md#chsesamelock) <br />
[`CHSesame2Status`](./reference.md#chsesame2status) <br />
[`CHSesameProtocolMechStatus`](./reference.md#chsesameprotocolmechstatus) <br />
[`CHSesame2MechSettings`](./reference.md#chsesame2mechsettings) <br />
[`CHSesame2Delegate`](./reference.md#chsesame2delegate) <br />
[`CHSesame2ShadowStatus`](./reference.md#chsesame2shadowstatus) <br />
[`CHSesame2History`](./reference.md#chsesame2history) <br />
[`CHSesame2BleAdvParameter`](./reference.md#chsesame2bleadvparameter) <br />
[`CHSesame2Intention`](./reference.md#chsesame2intention) <br />
[`CHSesame2History`](./reference.md#chsesame2history) <br />

# [CHSesame2AutoLockUpdatedHistoryData](./reference.md#chsesame2autolockupdatedhistorydata)
オートロックに関する履歴を表す
```swift
public class CHSesame2AutoLockUpdatedHistoryData : SesameSDK.CHSesame2HistoryData {
    public let enabledBefore: Int16 
    // 設定が変更される前のオートロックの秒数; 0秒はオートロックがオフとの特例。
    public let enabledAfter: Int16  
    // 設定が変更された後のオートロックの秒数
}
```

# [CHSesame2BleAdvParameter](./reference.md#chsesame2bleadvparameter)
BLEアドバタイジング設定のパラメータを表す<br/><br />
**iOS**
```swift
public protocol CHSesame2BleAdvParameter {
    var interval: Double { get }  // 単位: ミリ秒
    var txPower: Int8 { get }     // 単位: dBm
}
/*
1. intervalには20ms～10240msまで設定可能ですが、　次のいずれかの値の設定がアップル社のAccessory Design Guidelines for Apple Devices 35.5 Advertising Intervalに推奨されています: [1285.0, 1022.5, 852.5, 760.0, 546.25(デフォルト), 417.5, 318.75, 211.25, 152.5, 20.0] 単位: ms
2. txPowerには次のいずれかの値が設定可能。 [4, 3, 0(デフォルト), -4, -8, -12, -16, -20, -40] 単位: dBm
3. intervalの値下げる(intervalの幅を縮める)と、セサミデバイスとのBluetooth接続までの時間がより短くなりますが、セサミデバイスの消費電力は増加します。
4. txPowerの値を上げると、セサミデバイスとのBluetooth接続距離が伸びますが、セサミデバイスの消費電力は増加します。
5. 今後intervalとtxPowerの数値の増減によるセサミデバイス電池消費量の数値について公開予定です。
6. あなたのサーバーのビックデータの情報を用いて、ユーザーがよく使用する時間帯にintervalを低くtxPowerを高く設定し、使用が余りない時間帯にintervalを高くtxPowerを低く設定することによって、ユーザーが使用する際には接続速度と距離を優先し、高いユーザーエクスペリエンスと長い電池持ちの両立が可能です。
*/
```
**Android**
```kotlin
class CHSesame2BleAdvParameter(val interval: Double, val txPower: Byte)
```
**関連クラス** <br />
[`CHSesame2`](./reference.md#chsesame2) <br />

# [CHSesame2BleAdvParameterUpdatedHistoryData](./reference.md#chsesame2bleadvparameterupdatedhistorydata)
BLEアドバタイジング設定に関する履歴を表す
```swift
public class CHSesame2BleAdvParameterUpdatedHistoryData : SesameSDK.CHSesame2HistoryData {
    lazy public var intervalBefore: Double 
    // 設定が校正される前の、セサミデバイスが発信しているBLEアドバタイシング の Interval, 単位: ミリ秒
    lazy public var intervalAfter: Double  
    // 設定が校正された後の、セサミデバイスが発信しているBLEアドバタイシング の Interval,
    public let dbmBefore: Int8             
    // 設定が校正される前の、セサミデバイスが発信しているBLEアドバタイシング の TXPower,  単位: dBm
    public let dbmAfter: Int8              
    // 設定が校正された後の、セサミデバイスが発信しているBLEアドバタイシング の TXPower,
}
```

# [CHSesame2Delegate](./reference.md#chsesame2delegate)
セサミデバイスの状態変化のDelegateメソッド。こちらのインタフェースを使用し、デバイスの**機械状態変化**や**新規履歴**のDelegateイベントを受け取る。<br/><br/>
**iOS**
```swift
public protocol CHSesame2Delegate : SesameSDK.CHSesame2StatusDelegate {
    func onMechSettingChanged(device: SesameSDK.CHSesame2, settings: SesameSDK.CHSesame2MechSettings)
    func onHistoryReceived(device: SesameSDK.CHSesame2, result: Result<SesameSDK.CHResultState<[SesameSDK.CHSesame2History]>, Error>)
    func onMechStatusChanged(device: SesameSDK.CHSesame2, status: SesameSDK.SesameProtocolMechStatus, intention: SesameSDK.CHSesame2Intention)
}
```
**Android**
```kotlin
interface CHSesame2Delegate : CHSesameStatusDelegate {
    fun onMechSettingChanged(device: CHSesame2, settings: CHSesame2MechSettings)
    fun onMechStatusChanged(device: CHSesame2, status: CHSesame2MechStatus, intention: CHSesame2Intention)
}
```
**関連クラス** <br />
[`CHSesame2`](./reference.md#chsesame2) <br />
[`CHSesame2StatusDelegate`](./reference.md#chsesame2statusdelegate) <br />
[`CHSesame2MechSettings`](./reference.md#chsesame2mechsettings) <br />
[`CHSesame2History`](./reference.md#chsesame2history) <br />
[`CHSesame2Intention`](./reference.md#chsesame2intention) <br />
[`CHSesameProtocolMechStatus`](./reference.md#chsesameprotocolmechstatus) <br />

# [CHSesame2DriveFailedHistoryData](./reference.md#chsesame2drivefailedhistorydata)
セサミの作動エラーの履歴を表す
```swift
public class CHSesame2DriveFailedHistoryData : SesameSDK.CHSesame2HistoryData {
    public var stoppedPosition: Int16     
    // モーターが施解錠の途中に失敗した時の角度。 360˚ は 1024
    public var fsmRetCode: Int8
    public var deviceStatus: SesameSDK.CHSesame2Status 
    // モーターが施解錠の途中に失敗した時のCHSesame2Status
}
```

# [CHSesameHistoryPayload](./reference.md#chsesamehistorypayload)
```swift
public struct CHSesameHistoryPayload {
    public let histories: [CHSesame2History]
    public var cursor: UInt?
}
```

# [CHSesame2History](./reference.md#chsesame2history)
セサミ履歴のクラス<br/><br/>
**iOS**
```swift
public enum CHSesame2History {
    case manualElse(SesameSDK.CHSesame2HistoryData)    
    // 解錠の範囲または施錠の範囲から、サムターンに動きがあった場合（下記 ケース１からケース３になった場合、またはケース２からケース３になった場合）
    case manualLocked(SesameSDK.CHSesame2HistoryData)  
    // 手動で施錠 (下記 ケース2またケース3 から ケース1 になった場合 )
    case manualUnlocked(SesameSDK.CHSesame2HistoryData)
    // 手動で解錠 (下記 ケース1またケース3 から ケース2 になった場合 )
    case bleLock(SesameSDK.CHSesame2HistoryData)       
    // セサミデバイスが 施錠のBLEコマンド を受付ました
    case bleUnlock(SesameSDK.CHSesame2HistoryData)     
    // セサミデバイスが 解錠のBLEコマンド を受付ました
    case wm2Lock(SesameSDK.CHSesame2HistoryData)
    case wm2Unlock(SesameSDK.CHSesame2HistoryData)
    case webLock(SesameSDK.CHSesame2HistoryData)
    case webUnlock(SesameSDK.CHSesame2HistoryData)
    case autoLock(SesameSDK.CHSesame2HistoryData)      
    // セサミデバイスがオートロックしました
    case autoLockUpdated(SesameSDK.CHSesame2AutoLockUpdatedHistoryData)
    // オートロックの設定が変更されました
    case mechSettingUpdated(SesameSDK.CHSesame2MechSettingUpdatedHistoryData)
    // 施解錠角度の設定が変更されました
    case timeChanged(SesameSDK.CHSesame2TimeChangedHistoryData)
    // セサミデバイスの内部時計が校正されました
    case bleAdvParameterUpdated(SesameSDK.CHSesame2BleAdvParameterUpdatedHistoryData)
    // セサミデバイスが発信しているBLEアドバタイジング の Interval と TXPower の設定が変更されました。
    case driveLocked(SesameSDK.CHSesame2HistoryData)   // モーターが確実に施錠しました
    case driveUnlocked(SesameSDK.CHSesame2HistoryData) // モーターが確実に解錠しました
    case driveClick(SesameSDK.CHSesame2HistoryData)
    case manualClick(SesameSDK.CHSesame2HistoryData)
    case bleClick(SesameSDK.CHSesame2HistoryData)
    case wm2Click(SesameSDK.CHSesame2HistoryData)
    case webClick(SesameSDK.CHSesame2HistoryData)
    case driveFailed(SesameSDK.CHSesame2DriveFailedHistoryData) 
    // モーターが施解錠の途中に失敗しました
    case none(SesameSDK.CHSesame2HistoryData)          
    
}
/*
補足１：現時点では状態は以下の３つのみとなっています。
  ＜ケース１：施錠＞
    サムターンが施錠の範囲にある場合、
    施錠　1
    解錠　0　
  ＜ケース２：解錠＞
    サムターンが解錠の範囲にある場合、
    施錠　0
    解錠　1
  ＜ケース３：それ以外（※現時点では「解錠」とUI上で表示しています。＞
    サムターンが以上の２範囲以外にある場合、
    施錠　0
    解錠　0
*/
```
**Android**
```kotlin
sealed class CHSesame2History(timestamp: Long, val recordID: Int, val historyTag: ByteArray?) {
    var date: Date = Date(timestamp)
    open class DriveLocked(timestamp: Long, recordID: Int, histag: ByteArray?) : CHSesame2History(timestamp, recordID, histag)
    open class DriveUnLocked(timestamp: Long, recordID: Int, histag: ByteArray?) : CHSesame2History(timestamp, recordID, histag)
    open class ManualElse(timestamp: Long, recordID: Int, histag: ByteArray?) : CHSesame2History(timestamp, recordID, histag)
    open class ManualLocked(timestamp: Long, recordID: Int, histag: ByteArray?) : CHSesame2History(timestamp, recordID, histag)
    open class ManualUnlocked(timestamp: Long, recordID: Int, histag: ByteArray?) : CHSesame2History(timestamp, recordID, histag)
    open class BLELock(timestamp: Long, recordID: Int, histag: ByteArray?) : CHSesame2History(timestamp, recordID, histag)
    open class BLEUnlock(timestamp: Long, recordID: Int, histag: ByteArray?) : CHSesame2History(timestamp, recordID, histag)
    open class WM2Unlock(timestamp: Long, recordID: Int, histag: ByteArray?) : CHSesame2History(timestamp, recordID, histag)
    open class WM2Lock(timestamp: Long, recordID: Int, histag: ByteArray?) : CHSesame2History(timestamp, recordID, histag)
    open class WEBUnlock(timestamp: Long, recordID: Int, histag: ByteArray?) : CHSesame2History(timestamp, recordID, histag)
    open class WEBLock(timestamp: Long, recordID: Int, histag: ByteArray?) : CHSesame2History(timestamp, recordID, histag)
    open class AutoLock(timestamp: Long, recordID: Int, histag: ByteArray?) : CHSesame2History(timestamp, recordID, histag)
    open class AutoLockUpdated(timestamp: Long, recordID: Int, histag: ByteArray?, params: ByteArray?) : CHSesame2History(timestamp, recordID, histag)
    open class MechSettingUpdated(timestamp: Long, recordID: Int, histag: ByteArray?, params: ByteArray?) : CHSesame2History(timestamp, recordID, histag)
    open class TimeChanged(timestamp: Long, recordID: Int, histag: ByteArray?, params: ByteArray?) : CHSesame2History(timestamp, recordID, histag)
    open class BLEAdvParamUpdated(timestamp: Long, recordID: Int, histag: ByteArray?, params: ByteArray?) : CHSesame2History(timestamp, recordID, histag)
    open class DriveFailed(timestamp: Long, recordID: Int, histag: ByteArray?, params: ByteArray?) : CHSesame2History(timestamp, recordID, histag)
}
```

# [CHSesame2HistoryData](./reference.md#chsesame2historydata)
セサミ履歴の原始データを表す
```swift
public class CHSesame2HistoryData {
    public let recordID: Int32      // 連続でない(将来、連続になるように修正する予定)、セサミデバイスが再起動するまで当履歴の唯1つのID、 小→大
    public let historyTag: Data?    // 1970/1/1 00:00:00 からミリ秒単位のタイムスタンプ
    public let date: Date           // 鍵に付いてるタグやメモ 0 ~ 21bytes
    public let timestamp: UInt64
}
```

# [CHSesame2Intention](./reference.md#chsesame2intention)
セサミの回転状態を定義
```swift
public enum CHSesame2Intention : String {
    case locking   // 施錠中
    case unlocking // 解錠中
    case movingToUnknownTarget // 状態不明
    case idle      // 靜止
    public var description: String { get }
}
```
```kotlin
enum class CHSesame2Intention {
    movingToUnknownTarget,
    locking,
    unlocking,
    holding,
    idle,
}
```
**関連クラス** <br />
[`CHSesame2`](./reference.md#chsesame2) <br />
[`CHSesameBot`](./reference.md#chsesamebot) <br />
[`CHSesameBike`](./reference.md#chsesamebike) <br />
[`CHSesame2Delegate`](./reference.md#chsesame2delegate) <br />
[`CHSesameBotDelegate`](./reference.md#chsesamebotdelegate) <br />
[`CHSesameBikeDelegate`](./reference.md#chsesamebikedelegate) <br />

# [CHSesame2MechSettingUpdatedHistoryData](./reference.md#chsesame2mechsettingupdatedhistorydata)
セサミの機械設定に関する履歴を表す
```swift
public class CHSesame2MechSettingUpdatedHistoryData : SesameSDK.CHSesame2HistoryData {
    public let lockTargetBefore: Int16   // 設定が変更される前の施錠状態の角度、範囲： -32767~0~32767 ; -32768 は意義のないデフォルト值。 例0˚ ⇄ 0 で 360˚ ⇄ 1024
    public let unlockTargetBefore: Int16 // 設定が変更される前の解錠状態の角度
    public let lockTargetAfter: Int16    // 設定が変更された後の施錠状態の角度
    public let unlockTargetAfter: Int16  // 設定が変更された後の解錠状態の角度
}
```

# [CHSesame2MechSettings](./reference.md#chsesame2mechsettings)
セサミの機械設定の状態を表す<br/><br/>
**iOS**
```swift
public protocol CHSesame2MechSettings {
    var lockPosition: Int16 { get }   // 設定された施錠角度
    var unlockPosition: Int16 { get } // 設定された解錠角度
    func isConfigured() -> Bool // セサミデバイスが登録後、施解錠の角度の設定された事あるか否か? 一度設定(isConfiguredがtrue)になると、セサミデバイスがリセットされるまで継続する。
}
```
**Android**
```kotlin
class CHSesame2MechSettings(data: ByteArray) {
    val lockPosition: Short
    val unlockPosition: Short
    val isConfigured: Boolean
}
```
**関連クラス** <br />
[`CHSesame2`](./reference.md#chsesame2) <br />
[`CHSesame2Delegate`](./reference.md#chsesame2delegate) <br />

# [CHSesame2RetCodeType](./reference.md#chsesame2retcodetype)
セサミデバイスにBLEコマンドを出した後の結果を表すコールバック
```swift
public enum CHSesame2RetCodeType : UInt8 {
    case none          // 待機中
    case success       // 施錠/解錠の動作成功
    case failEngage    
    case failMoveStart // 施錠/解錠が行われる前にモーターが動かない
    case failMove      // 施錠/解錠が行われてる途中、モーターが停止　
    case failCheck  
    case failDetach    
    case failLoosen    
    case aborted       
    public var description: String { get }
}
```
**関連クラス** <br />
[`CHSesameProtocolMechStatus`](./reference.md#chsesameprotocolmechstatus) <br />

# [CHSesame2ShadowStatus](./reference.md#chsesame2shadowstatus)
セサミ現在のShadowステータスを表す<br/><br/>
**iOS**
```swift
public enum CHSesame2ShadowStatus : Equatable {
    case locked(loginStatus: SesameSDK.CHDeviceLoginStatus = .unlogined, desc: String = "locked")     // 下記のケース1。(サーバーに残ったの状態)
    case unlocked(loginStatus: SesameSDK.CHDeviceLoginStatus = .unlogined, desc: String = "unlocked") // 下記のケース2。(サーバーに残ったの状態)
    case moved(loginStatus: SesameSDK.CHDeviceLoginStatus = .unlogined, desc: String = "moved")       // 下記のケース3。(サーバーに残ったの状態)
    case lockedWifiModule2(loginStatus: SesameSDK.CHDeviceLoginStatus = .logined, desc: String = "locked_wm2") 
    // 下記のケース1。(WiFi Module に接続されていて、リアルタイムの状態)
    case unlockedWifiModule2(loginStatus: SesameSDK.CHDeviceLoginStatus = .logined, desc: String = "unlocked_wm2") 
    // 下記のケース2。(WiFi Module に接続されていて、リアルタイムの状態)
    case movedWifiModule2(loginStatus: SesameSDK.CHDeviceLoginStatus = .logined, desc: String = "moved_wm2") 
    // 下記のケース3。(WiFi Module に接続されていて、リアルタイムの状態)
    public func loginStatus() -> SesameSDK.CHDeviceLoginStatus
    public func description() -> String
}

/*
補足１：現時点では状態は以下の３つのみとなっています。
  ＜ケース１：施錠＞
    サムターンが施錠の範囲にある場合、
    施錠　1
    解錠　0　
  ＜ケース２：解錠＞
    サムターンが解錠の範囲にある場合、
    施錠　0
    解錠　1
  ＜ケース３：それ以外（※現時点では「解錠」とUI上で表示しています。＞
    サムターンが以上の２範囲以外にある場合、
    施錠　0
    解錠　0
*/
```
**Android**
```kotlin
enum class CHSesame2ShadowStatus(val value: CHDeviceLoginStatus) {
    Locked(CHDeviceLoginStatus.UnLogin),
    Unlocked(CHDeviceLoginStatus.UnLogin),
    Moved(CHDeviceLoginStatus.UnLogin),
    LockedWm2(CHDeviceLoginStatus.Login),
    UnlockedWm2(CHDeviceLoginStatus.Login),
    MovedWm2(CHDeviceLoginStatus.Login),
}
```
**関連クラス** <br />
[`CHSesame2`](./reference.md#chsesame2) <br />
[`CHSesameBot`](./reference.md#chsesamebot) <br />
[`CHSesameBike`](./reference.md#chsesamebike) <br />
[`CHDeviceLoginStatus`](./reference.md#chdeviceloginstatus) <br />

# [CHSesame2Status](./reference.md#chsesame2status)
セサミに`connect`, `lock`, `unlock`などの操作をする、デバイス状態が変化します。詳しくは[状態遷移図](./flow_charts.md#sesame-状態遷移図)をご参照ください。

<a href="https://docs.google.com/drawings/d/1a7vZAM9WuwPWO6OKUwSEO41QpbavJ21Ey1W6o_kQHq8/edit?usp=sharing"
   target="_blank">
    <img src="https://raw.github.com/CANDY-HOUSE/SesameSDK_iOS_with_DemoApp/assets/CHSesame2StateMachine.png"
         alt="Sesame2 State Machine" title="Sesame2 State Machine"
         style="text-align:center; width: auto; height: 500px;"/>
</a><br/><br/>

**iOS**

```swift
public enum CHSesame2Status : Equatable {
    case noBleSignal(loginStatus: SesameSDK.CHDeviceLoginStatus = .unlogined, desc: String = "noBleSignal")
    // SesameSDKがセサミデバイスのBluetooth Advertisementを未だ見つけていない
    case receivedBle(loginStatus: SesameSDK.CHDeviceLoginStatus = .unlogined, desc: String = "receivedBle")
    // SesameSDKがセサミデバイスのBluetooth Advertisementを見つけました
    case bleConnecting(loginStatus: SesameSDK.CHDeviceLoginStatus = .unlogined, desc: String = "bleConnecting")
    // SesameSDKがセサミデバイスとBluetooth接続しようとしている
    case reset(loginStatus: SesameSDK.CHDeviceLoginStatus = .unlogined, desc: String = "reset")
    // セサミデバイスが Bluetoothコマンドやリセットボタンで リセットされた一瞬のステータスで、その後 noBleSignal に戻る。
    case waitingGatt(loginStatus: SesameSDK.CHDeviceLoginStatus = .unlogined, desc: String = "waitingGatt")
    // SesameSDKがセサミデバイスとBluetooth接続しようとしている途中、Bluetooth GATTの応答を待っています
    case bleLogining(loginStatus: SesameSDK.CHDeviceLoginStatus = .unlogined, desc: String = "bleLogining")
    // SesameSDKがセサミデバイスとBluetooth接続出来て、セサミデバイスも登録済で、セサミデバイスの鍵を挿入している途中
    case readyToRegister(loginStatus: SesameSDK.CHDeviceLoginStatus = .unlogined, desc: String = "readyToRegister")
    // SesameSDKがセサミデバイスとBluetooth接続出来て、セサミデバイスが未登録状態で、registerSesame2()待ちです
    case waitingForAuth(loginStatus: SesameSDK.CHDeviceLoginStatus = .unlogined, desc: String = "waitingForAuth")
    // 等待網路認證 _客人鑰匙_ _註冊_
    case registering(loginStatus: SesameSDK.CHDeviceLoginStatus = .unlogined, desc: String = "registering")
    // SesameSDKがセサミデバイスとBluetooth接続出来て、registerSesame2()処理中です
    case dfumode(loginStatus: SesameSDK.CHDeviceLoginStatus = .unlogined, desc: String = "dfumode") // アップデートモード
    case locked(loginStatus: SesameSDK.CHDeviceLoginStatus = .logined, desc: String = "locked")
    // 下記のケース１。SesameSDKがセサミデバイスとBluetooth接続出来て、セサミデバイスも登録済で、正しいセサミデバイスの鍵も挿入済。
    case unlocked(loginStatus: SesameSDK.CHDeviceLoginStatus = .logined, desc: String = "unlocked")
    // 下記のケース2。SesameSDKがセサミデバイスとBluetooth接続出来て、セサミデバイスも登録済で、正しいセサミデバイスの鍵も挿入済。
    case moved(loginStatus: SesameSDK.CHDeviceLoginStatus = .logined, desc: String = "moved")
    // 下記のケース3。SesameSDKがセサミデバイスとBluetooth接続出来て、セサミデバイスも登録済で、正しいセサミデバイスの鍵も挿入済。
    case noSettings(loginStatus: SesameSDK.CHDeviceLoginStatus = .logined, desc: String = "noSettings")
    // SesameSDKがセサミデバイスとBluetooth接続出来て、セサミデバイスも登録済で、正しいセサミデバイスの鍵も挿入済で、セサミデバイスの施解錠の角度は未だ未設定です
    case waitApConnect(loginStatus: SesameSDK.CHDeviceLoginStatus = .logined, desc: String = "waitApConnect") // 接続完了し_gatt_協議を作成
    case busy(loginStatus: SesameSDK.CHDeviceLoginStatus = .unlogined, desc: String = "busy") // BLEの接続数が上限到達_wifi Module は一度につき1台のスマホのみ接続可_
    case iotConnected(loginStatus: SesameSDK.CHDeviceLoginStatus = .logined, desc: String = "iotConnected") // iot接続中 _wifi Module_
    case iotDisconnected(loginStatus: SesameSDK.CHDeviceLoginStatus = .logined, desc: String = "iotDisconnected") // iot接続中断 _wifi　Module_
    public var description: String { get }
    public var loginStatus: SesameSDK.CHDeviceLoginStatus { get }
}
/*
補足１：現時点では状態は以下の３つのみとなっています。
  ＜ケース１：施錠＞
    サムターンが施錠の範囲にある場合、
    施錠　1
    解錠　0　
  ＜ケース２：解錠＞
    サムターンが解錠の範囲にある場合、
    施錠　0
    解錠　1
  ＜ケース３：それ以外（※現時点では「解錠」とUI上で表示しています。＞
    サムターンが以上の２範囲以外にある場合、
    施錠　0
    解錠　0
*/
```
**Android**
```kotlin
enum class CHSesame2Status(val value: CHDeviceLoginStatus) {
    NoBleSignal(CHDeviceLoginStatus.UnLogin),
    ReceivedBle(CHDeviceLoginStatus.UnLogin),
    BleConnecting(CHDeviceLoginStatus.UnLogin),
    WaitingGatt(CHDeviceLoginStatus.UnLogin),
    BleLogining(CHDeviceLoginStatus.UnLogin),
    Registering(CHDeviceLoginStatus.UnLogin),
    ReadyToRegister(CHDeviceLoginStatus.UnLogin),
    WaitingForAuth(CHDeviceLoginStatus.UnLogin),
    NoSettings(CHDeviceLoginStatus.Login),
    Reset(CHDeviceLoginStatus.UnLogin),
    DfuMode(CHDeviceLoginStatus.UnLogin),
    Busy(CHDeviceLoginStatus.UnLogin),
    Locked(CHDeviceLoginStatus.Login),
    Moved(CHDeviceLoginStatus.Login),
    Unlocked(CHDeviceLoginStatus.Login),
    WaitApConnect(CHDeviceLoginStatus.Login),
    IotConnected(CHDeviceLoginStatus.Login),
    IotDisconnected(CHDeviceLoginStatus.Login),
}
```
**関連クラス** <br />
[`CHDeviceLoginStatus`](./reference.md#chdeviceloginstatus) <br />
[`CHSesame2StatusDelegate`](./reference.md#chsesame2statusdelegate) <br />
[`CHDevice`](./reference.md#chdevice) <br />
[`CHSesame2`](./reference.md#chsesame2) <br />
[`CHWifiModule2Delegate`](./reference.md#chwifimodule2delegate) <br />

# [CHSesame2StatusDelegate](./reference.md#chsesame2statusdelegate)
セサミデバイスの状態変化のDelegateメソッド。こちらのインタフェースを使用し、デバイスの**状態変化**Delegateイベントを受け取る。
```swift
public protocol CHSesame2StatusDelegate : AnyObject {
    func onBleDeviceStatusChanged(device: SesameSDK.SesameLock, status: SesameSDK.CHSesame2Status, shadowStatus: SesameSDK.CHSesame2ShadowStatus?)
}
```
**関連クラス** <br />
[`CHSesameLock`](./reference.md#chsesamelock) <br />
[`CHSesame2`](./reference.md#chsesame2) <br />
[`CHSesameBot`](./reference.md#chsesamebot) <br />
[`CHSesameBike`](./reference.md#chsesamebike) <br />
[`CHSesame2Delegate`](./reference.md#chsesame2delegate) <br />
[`CHSesameBotDelegate`](./reference.md#chsesamebotdelegate) <br />
[`CHSesameBikeDelegate`](./reference.md#chsesamebikedelegate) <br />
[`CHSesame2Status`](./reference.md#chsesame2status) <br />
[`CHSesame2ShadowStatus`](./reference.md#chsesame2shadowstatus) <br />

# [CHSesame2TimeChangedHistoryData](./reference.md#chsesame2timechangedhistorydata)
セサミデバイス内部の時計校正の履歴を表す
```swift
public class CHSesame2TimeChangedHistoryData : SesameSDK.CHSesame2HistoryData {
    public let timeAfter: Date   // 設定が校正された後の、セサミデバイス内部の時計の時刻、例えば、 西暦2020年8月4日15時04分02秒。SesameSDKが裏で自動的にセサミデバイス内部の時計を校正している。
    public let timeBefore: Date  // 設定が校正される前の、セサミデバイス内部の時計の時刻、例えば、 西暦1970年1月1日00時00分06秒
}
}
```

# [CHSesameBike](./reference.md#chsesamebike)
セサミサイクルのオブジェクトクラス。こちらのインタフェースを使用する事でデバイスの操作、セサミバイクでの登録、各種の設定が可能。<br/><br/>
**iOS**

```swift
public protocol CHSesameBike : SesameSDK.CHSesameLock {
    var delegate: SesameSDK.CHSesameBikeDelegate? { get set } 　 // セサミサイクルのDelegateメソッド
    var mechSetting: SesameSDK.CHSesameBikeMechSettings? { get } // 機械設定
    var deviceShadowStatus: SesameSDK.CHSesame2ShadowStatus? { get }
    var intention: SesameSDK.CHSesame2Intention { get }          // 解錠中か靜止
    func unlock(historytag: Data?, result: @escaping (SesameSDK.CHResult<SesameSDK.CHEmpty>)) // 解錠する
}
```
**Android**
```kotlin
interface CHSesameBike :CHSesameLocker {
    var delegate: CHSesameBikeDelegate?
    var mechSetting: CHSesameBotMechSettings?
    var intention: CHSesame2Intention
    var deviceShadowStatus: CHSesame2ShadowStatus?
    fun unlock(historytag: ByteArray? = null, result: CHResult<CHEmpty>)
    fun loginSesame(token: String? = null)
}
```
**関連クラス** <br />
[`CHDevice`](./reference.md#chdevice) <br />
[`CHSesameLock`](./reference.md#chsesamelock) <br />
[`CHSesameBikeDelegate`](./reference.md#chsesamebikedelegate) <br />
[`CHSesameBikeMechSettings`](./reference.md#chsesamebikemechsettings) <br />
[`CHSesame2ShadowStatus`](./reference.md#chsesame2shadowstatus) <br />
[`CHSesame2Intention`](./reference.md#chsesame2intention) <br />

# [CHSesameBikeDelegate](./reference.md#chsesamebikedelegate)
セサミサイクルのDelegateメソッド。こちらのインタフェースを使用し、**機械状態変化**のDelegateイベントを受け取る。
```swift
public protocol CHSesameBikeDelegate : SesameSDK.CHSesame2StatusDelegate {
    func onMechStatusChanged(device: SesameSDK.CHSesameBike, status: SesameSDK.SesameProtocolMechStatus, intention: SesameSDK.CHSesame2Intention)
}
```
**関連クラス** <br />
[`CHSesameBike`](./reference.md#chsesamebike) <br />
[`CHSesame2StatusDelegate`](./reference.md#chsesame2statusdelegate) <br />
[`CHSesameProtocolMechStatus`](./reference.md#chsesameprotocolmechstatus) <br />
[`CHSesame2Intention`](./reference.md#chsesame2intention) <br />

# [CHSesameBikeMechSettings](./reference.md#chsesamebikemechsettings)
```swift
public protocol CHSesameBikeMechSettings {
    var unlockSecs: SesameSDK.CHSesameBikeUnlockSecs { get }
    func isConfigured() -> Bool
}
```
**関連クラス** <br />
[`CHSesameBike`](./reference.md#chsesamebike) <br />

# [CHSesameBikeUnlockSecs](./reference.md#chsesamebikeunlocksecs)
```swift
public struct CHSesameBikeUnlockSecs {
    public private(set) var forward: Float { get }
    public private(set) var hold: Float { get }
    public private(set) var backward: Float { get }
    public init(forward: Float, hold: Float, backward: Float)
}
```
**関連クラス** <br />
[`CHSesameBikeMechSettings`](./reference.md#chsesamebikemechsettings) <br />

# [CHSesameBot](./reference.md#chsesamebot)
セサミボットのオブジェクトクラス。こちらのインタフェースを叩き、セサミボットの登録、作動させること、各種の設定が可能。<br/><br/>
**iOS**
```swift
public protocol CHSesameBot : SesameSDK.CHSesameLock {
    var delegate: SesameSDK.CHSesameBotDelegate? { get set }      // セサミボットのDelegateメソッド
    var mechSetting: SesameSDK.SesameBotMechSettings? { get set } // セサミボットの機械設定
    var deviceShadowStatus: SesameSDK.CHSesame2ShadowStatus? { get } // Shadowステータス
    var intention: SesameSDK.CHSesame2Intention { get }           // セサミボットのアームの動作状態
    func toggle(historytag: Data?, result: @escaping (SesameSDK.CHResult<SesameSDK.CHEmpty>)) // セサミボットのアームを前方、もしくわ後方に転回
    func lock(historytag: Data?, result: @escaping (SesameSDK.CHResult<SesameSDK.CHEmpty>))   // セサミボットのアームを正転する
    func click(historytag: Data?, result: @escaping (SesameSDK.CHResult<SesameSDK.CHEmpty>))  // セサミボットのアームを下に押して離す
    func unlock(historytag: Data?, result: @escaping (SesameSDK.CHResult<SesameSDK.CHEmpty>)) // セサミボットのアームを逆転する
    func updateSetting(historytag: Data?, setting: SesameSDK.SesameBotMechSettings, result: @escaping SesameSDK.CHResult<SesameSDK.CHEmpty>) // セサミボットの設定をアップデート
}
```
**Android**
```kotlin
interface CHSesameBot : CHSesameLocker {
    var delegate: CHSesameBotDelegate?
    var deviceShadowStatus: CHSesame2ShadowStatus?
    var mechSetting: CHSesameBotMechSettings?
    var intention: CHSesame2Intention
    fun updateSetting(setting:CHSesameBotMechSettings,historyTag: ByteArray? = null,result: CHResult<CHEmpty>)
    fun toggle(historyTag: ByteArray? = null, result: CHResult<CHEmpty>)
    fun lock(historyTag: ByteArray? = null, result: CHResult<CHEmpty>)
    fun unlock(historyTag: ByteArray? = null, result: CHResult<CHEmpty>)
    fun click(historyTag: ByteArray? = null, result: CHResult<CHEmpty>)
    fun loginSesame(token: String? = null)
}
```
**関連クラス** <br />
[`CHDevice`](./reference.md#chdevice) <br />
[`CHSesameLock`](./reference.md#chsesamelock) <br />
[`CHSesameBotDelegate`](./reference.md#chsesamebotdelegate) <br />
[`CHSesameBotMechSettings`](./reference.md#chsesamebotmechsettings) <br />
[`CHSesame2ShadowStatus`](./reference.md#chsesame2shadowstatus) <br />
[`CHSesame2Intention`](./reference.md#chsesame2intention) <br />

# [CHSesameBotButtonMode](./reference.md#chsesamebotbuttonmode)
セサミボットの本体ボタンモード
```swift
public enum CHSesameBotButtonMode : UInt8 {
    case click // 往前後返回　前方に回転したあと戻る
    case toggle // 往前或往後 前方か後方に回転
}
```
**関連クラス** <br />
[`CHSesameBotMechSettings`](./reference.md#chsesamebotmechsettings) <br />

# [CHSesameBotDelegate](./reference.md#chsesamebotdelegate)
セサミボットのDelegateメソッド。こちらのインタフェースを使用し、**機械状態変化**のDelegateイベントを受け取る。<br/><br/>
**iOS**
```swift
public protocol CHSesameBotDelegate : SesameSDK.CHSesame2StatusDelegate {
    func onMechStatusChanged(device: SesameSDK.CHSesameBot, status: SesameSDK.SesameProtocolMechStatus, intention: SesameSDK.CHSesame2Intention)
}
```
**Android**
```kotlin
interface CHSesameBotDelegate : CHSesameStatusDelegate {
    fun onMechStatusChanged(device: CHSesameBot, status: CHSesameBotMechStatus, intention: CHSesame2Intention)
}
```
**関連クラス** <br />
[`CHSesameBot`](./reference.md#chsesamebot) <br />
[`CHSesame2StatusDelegate`](./reference.md#chsesame2statusdelegate) <br />
[`CHSesameProtocolMechStatus`](./reference.md#chsesameprotocolmechstatus) <br />
[`CHSesame2Intention`](./reference.md#chsesame2intention) <br />

# [CHSesameBotLockSecondsConfiguration](./reference.md#chsesamebotlocksecondsconfiguration)
セサミボットの作動秒数の詳しい設定
```swift
public struct CHSesameBotLockSecondsConfiguration {
    public var lockSeconds: UInt8 // 前方に回転する時かかる秒数
    public var unlockSeconds: UInt8 // 後方に回転する時かかる秒数
    public var clickLockSeconds: UInt8 // click モードで前方に回転する時かかる秒数
    public var clickHoldSeconds: UInt8 // click モードで静止秒數　
    public var clickUnlockSeconds: UInt8 // click モードで後方に回転する時かかる秒数
}
```
**関連クラス** <br />
[`CHSesameBotMechSettings`](./reference.md#chsesamebotmechsettings) <br />

# [CHSesameBotMechSettings](./reference.md#chsesamebotmechsettings)
セサミボットの機械設定<br/><br/>
**iOS**
```swift
public struct SesameBotMechSettings {
    public var userPrefDir: SesameSDK.CHSesameBotUserPreDir // アームの回転方向
    public var lockSecConfig: SesameSDK.CHSesameBotLockSecondsConfiguration // アームの動作秒数を設定
    public var buttonMode: SesameSDK.CHSesameBotButtonMode // セサミボットのボタンを押す時の操作モード
    public func isConfigured() -> Bool // 設定された事あるか否か　
}
```
**Android**
```kotlin
data class CHSesameBotMechSettings(
    var userPrefDir: Byte,
    var lockSec: Byte,
    var unlockSec: Byte,
    var clickLockSec: Byte,
    var clickHoldSec: Byte,
    var clickUnlockSec: Byte,
    var buttonMode: Byte   // 用以設定按鍵按下時的功能，預設為0(按鍵為click mode),另一值為1(按鍵為toggle mode)
)
```
**関連クラス** <br />
[`CHSesameBot`](./reference.md#chsesamebot) <br />
[`CHSesameBotUserPreDir`](./reference.md#chsesamebotuserpredir) <br />
[`CHSesameBotLockSecondsConfiguration`](./reference.md#chsesamebotlocksecondsconfiguration) <br />
[`CHSesameBotButtonMode`](./reference.md#chsesamebotbuttonmode) <br />

# [CHSesameBotUserPreDir](./reference.md#chsesamebotuserpredir)
セサミボットのアーム回転方向設定
```swift
public enum CHSesameBotUserPreDir : UInt8 {
    case normal // 初期デフォルト方向
    case reversed // 逆方向
}
```
**関連クラス** <br />
[`CHWifiModule2NetworkStatus`](./reference.md#chwifimodule2networkstatus) <br />
[`CHWifiModule2MechSettings`](./reference.md#chwifimodule2mechsettings) <br />

# [CHSesameLock](./reference.md#chsesamelock)

セサミキーのインタフェース、セサミ、セサミボット、セサミサイクルなどを含まれています、Wifi-Moduleは例外です。

```swift
public protocol CHSesameLock : SesameSDK.CHDevice {
    var isConnectedByWM2: Bool { get set } // Wifi モジュールに接続されているかを確認
    var mechStatus: SesameSDK.CHSesameProtocolMechStatus? { get } // 電池の電圧の取得、セサミのリアルタイムの角度の取得、施解錠範囲であるか否かの確認など
    func getHistoryTag() -> Data? // 履歴に、0~21bytesのタグやメモをつける。使用例: 16 bytes のUUID + 1 bytes の 解錠方法(Widget or Apple Watch or 手ぶら解錠) + 4 bytes の 何かの識別子
    func getTimeSignature() -> String // 主にサーバー認証に使用する動的署名スタンプを取得。
    func setHistoryTag(_ tag: Data, result: @escaping (SesameSDK.CHResult<SesameSDK.CHEmpty>)) // 履歴タグを設定
}
extension CHSesameLock {
    public func enableNotification(token: String, name: String, result: @escaping SesameSDK.CHResult<SesameSDK.CHEmpty>) // 通知機能をオンにする
    public func disableNotification(token: String, name: String, result: @escaping SesameSDK.CHResult<SesameSDK.CHEmpty>) // 通知機能をオフにする
    public func isNotificationEnabled(token: String, name: String, result: @escaping SesameSDK.CHResult<Bool>) // 通知機能オンかオフを確認
}
```
**関連クラス** <br />
[`CHSesameProtocolMechStatus`](./reference.md#chsesameprotocolmechstatus) <br />
[`CHSesame2`](./reference.md#chsesame2) <br />
[`CHSesameBot`](./reference.md#chsesamebot) <br />
[`CHSesameBike`](./reference.md#chsesamebike) <br />

# [CHSesameProtocolMechStatus](./reference.md#chsesameprotocolmechstatus)
セサミの機械状態<br/><br/>
**iOS**
```swift
public protocol CHSesameProtocolMechStatus {
    var data: Data { get } // 原始データ
    var position: Int16 { get } // セサミデバイスのリアルタイムの角度。範囲： -32767~0~32767 ; -32768 は意義のないデフォルト值。 例0˚ ⇄ 0 で 360˚ ⇄ 1024
    var target: Int16 { get } // 施錠中/解錠中/静止中
    var isClutchFailed: Bool { get }
    var isInLockRange: Bool { get }   // 施錠範囲であるか否か の判断
    var isInUnlockRange: Bool { get } // 解錠範囲であるか否か の判断
    var isBatteryCritical: Bool { get } // 電池残量低すぎるか否か の判断
    func getBatteryVoltage() -> Float // 電池の電圧の取得、単位: 0V ~ 7.2V
    func getBatteryPrecentage() -> Int // 電池のパーセントを取得
    func retCodeType() -> SesameSDK.CHSesame2RetCodeType // 施錠/解錠結果 (成功もしくは失敗の原因)　
}
```
**Android**
```kotlin
interface CHSesameProtocolMechStatus {
    val data: ByteArray
    val position: Short
    val target: Short
    var isInLockRange: Boolean
    var isInUnlockRange: Boolean
    var isBatteryCritical: Boolean
    fun getBatteryVoltage(): Float
    fun getBatteryPrecentage(): Int
}
```
**関連クラス** <br />
[`CHSesame2Delegate`](./reference.md#chsesame2delegate) <br />
[`CHSesameBotDelegate`](./reference.md#chsesamebotdelegate) <br />
[`CHSesameBikeDelegate`](./reference.md#chsesamebikedelegate) <br />
[`CHSesame2RetCodeType`](./reference.md#chsesame2retcodetype) <br />

# [CHWifiModule2](./reference.md#chwifimodule2)
WiFi Module のオブジェクトクラス。こちらのインタフェースを使い、WiFi Moduleの登録すること、各種の設定、セサミの追加また削除させることが可能。<br/><br/>
**iOS**
```swift
public protocol CHWifiModule2 : SesameSDK.CHDevice {
    var sesame2Keys: [String : String] { get } 
    // WiFi Moduleに登録されているセサミ
    var delegate: SesameSDK.CHWifiModule2Delegate? { get set } 
    // WiFi ModuleのDelegateメソッド
    var mechSetting: SesameSDK.CHWifiModule2MechSettings? { get } 
    // WiFi Moduleに設定されたSSIDの名称とパスワードを取得
    var networkStatus: SesameSDK.CHWifiModule2NetworkStatus? { get } 
    // WiFi Modlue のネット設定
    func scanWifiSSID(result: @escaping SesameSDK.CHResult<SesameSDK.CHEmpty>) 
    // WiFi Moduleに近くにある SSID をスキャンさせる
    func getCHDevices(result: @escaping SesameSDK.CHResult<SesameSDK.CHEmpty>) 
    // スマホがBLE経由でWiFi Moduleから登録されたセサミの情報を取得する(Delegateイベント)
    func connectWifi(result: @escaping (SesameSDK.CHResult<SesameSDK.CHEmpty>)) 
    // WiFi ModuleにCANDY HOUSE Cloudに接続させる
    func setWifiSSID(_ ssid: String, result: @escaping (SesameSDK.CHResult<SesameSDK.CHEmpty>)) 
    // WiFi ModuleにこのSSIDを設定させる
    func removeCHDevice(keyId: String, result: @escaping SesameSDK.CHResult<SesameSDK.CHEmpty>) 
    // WiFi Moduleにこのセサミ情報を削除させる
    func insertCHDevice(_ device: SesameSDK.CHDevice, result: @escaping SesameSDK.CHResult<SesameSDK.CHEmpty>) 
    // WiFi Moduleにこのセサミ情報を登録させる
    func setWifiPassword(_ password: String, result: @escaping (SesameSDK.CHResult<SesameSDK.CHEmpty>)) 
    // WiFi ModuleにこのSSIDのパスワードを設定させる
}
```
**Android**
```kotlin
interface CHWifiModule2 : CHDevices {
    var delegate: CHWifiModule2Delegate?
    var ssm2KeysMap: MutableMap<String, String>
    var networkStatus: CHWifiModule2NetWorkStatus?
    var mechSetting: CHWifiModule2MechSettings?
    fun scanWifiSSID(result: CHResult<CHEmpty>)
    fun setWifiSSID(ssid: String, result: CHResult<CHEmpty>)
    fun setWifiPassword(password: String, result: CHResult<CHEmpty>)
    fun connectWifi(result: CHResult<CHEmpty>)
    fun insertSesames(sesame: CHDevices, result: CHResult<CHEmpty>)
    fun removeSesame(sesameKeyTag: String, result: CHResult<CHEmpty>)
}
```
**関連クラス** <br />
[`CHDevice`](./reference.md#chdevice) <br />
[`CHWifiModule2Delegate`](./reference.md#chwifimodule2delegate) <br />
[`CHWifiModule2MechSettings`](./reference.md#chwifimodule2mechsettings) <br />
[`CHWifiModule2NetworkStatus`](./reference.md#chwifimodule2networkstatus) <br />

# [CHWifiModule2Delegate](./reference.md#chwifimodule2delegate)
WiFiモジュールのDelegateメソッド。こちらのインタフェースを使用し、**WiFiモジュールのBLE状態変化**, **WiFiモジュールに接続されたネット状態の変化**, **WiFiモジュールRouter設定変化**, **WiFi モジュールに登録されたセサミ情報の変化**, **WifiモジュールのOSのアップデートの進捗**, **WiFiモジュールがスキャンして見つけたSSIDリストの変化**のDelegateイベントを受け取る。<br/><br/>
**iOS**
```swift
public protocol CHWifiModule2Delegate : AnyObject {
    func onBleDeviceStatusChanged(device: SesameSDK.CHWifiModule2, status: SesameSDK.CHSesame2Status) 
    // WiFi ModuleのBLE状態変化
    func onNetworkStatusChanged(device: SesameSDK.CHWifiModule2, status: SesameSDK.CHWifiModule2NetworkStatus) 
    // WiFiモジュールに接続されたネット状態の変化
    func onAPSettingChanged(device: SesameSDK.CHWifiModule2, settings: SesameSDK.CHWifiModule2MechSettings) 
    // SSIDの設定変化
    func onSesame2KeysChanged(device: SesameSDK.CHWifiModule2, sesame2keys: [String : String]) 
    // WiFi Moduleに登録されたセサミ情報の変化
    func onOTAProgress(device: SesameSDK.CHWifiModule2, percent: UInt8) 
    // Wifi ModuleのOSアップデートの進捗
    func onScanWifiSID(device: SesameSDK.CHWifiModule2, ssid: SesameSDK.CHSSID) 
    // WiFiモジュールがスキャンして見つけったSSIDリスト
}
```
**Android**
```kotlin
interface CHWifiModule2Delegate {
    fun onAPSettingChanged(device: CHWifiModule2, settings: CHWifiModule2MechSettings)
    fun onNetWorkStatusChanged(device: CHWifiModule2, settings: CHWifiModule2NetWorkStatus)
    fun onSSM2KeysChanged(device: CHWifiModule2, ssm2keys: Map<String, String>)
    fun onBleDeviceStatusChanged(device: CHWifiModule2, status: CHSesame2Status)
    fun onOTAProgress(device: CHWifiModule2, percent: Byte)
    fun onScanWifiSID(device: CHWifiModule2, ssid: String, rssi: Short)
}
```
**関連クラス** <br />
[`CHWifiModule2`](./reference.md#chwifimodule2) <br />
[`CHSesame2Status`](./reference.md#chsesame2status) <br />
[`CHWifiModule2NetworkStatus`](./reference.md#chwifimodule2networkstatus) <br />
[`CHWifiModule2MechSettings`](./reference.md#chwifimodule2mechsettings) <br />
[`CHSSID`](./reference.md#chssid) <br />

# [CHWifiModule2MechSettings](./reference.md#chwifimodule2mechsettings)
スマホがBluetooth経由でWiFiモジュールに設定されたSSID 名称とパスワードを取得<br/><br/>
**iOS**
```swift
public class CHWifiModule2MechSettings {
    public internal(set) var wifiSSID: String? { get }     // SSID 名称
    public internal(set) var wifiPassword: String? { get } // SSID パスワード
}
```
**Android**
```kotlin
class CHWifiModule2MechSettings(var wifiSSID: String?, var wifiPassWord: String?)
```
**関連クラス** <br />
[`CHWifiModule2`](./reference.md#chwifimodule2) <br />
[`CHWifiModule2Delegate`](./reference.md#chwifimodule2delegate) <br />

# [CHWifiModule2NetworkStatus](./reference.md#chwifimodule2networkstatus)
WiFiモジュールのネットワーク状態<br/><br/>
**iOS**
```swift
public class CHWifiModule2NetworkStatus {
    public private(set) var isAPWork: Bool? { get }  // Routerに接続できたか否か
    public private(set) var isNetwork: Bool? { get } // ネットに接続できたか否か
    public private(set) var isIoTWork: Bool? { get } // CANDY HOUSE Cloud に接続できたか否か
    public private(set) var isBindingAPWork: Bool { get }     // Routerに接続中か否か
    public private(set) var isConnectingNetwork: Bool { get } // ネットに接続中か否か
    public private(set) var isConnectingIoT: Bool { get }     // CANDY HOUSE Cloud に接続中か否か
}
```
**Android**
```kotlin
class CHWifiModule2NetWorkStatus(var isAPWork: Boolean?, var isNetWork: Boolean?, var isIOTWork: Boolean?, var isAPConnecting: Boolean, var isConnectingNet: Boolean, var isConnectingIOT: Boolean, var isAPCheck: Boolean?)
```
**関連クラス** <br />
[`CHWifiModule2`](./reference.md#chwifimodule2) <br />
[`CHWifiModule2Delegate`](./reference.md#chwifimodule2delegate) <br />

# [CHWifiModule2Sesame2LockStatus](./reference.md#chwifimodule2sesame2lockstatus)
WiFiモジュールがセサミに対する状態を表す
```swift
public enum CHWifiModule2Sesame2LockStatus : UInt8, CustomStringConvertible {
    case disconnected   // WiFi Moduleとセサミの間のBLE接続が
    case connected      // 接続
    case deviceLoggedIn // セサミにBLEログイン
    public var description: String { get }
}
```
**実装例**
```swift
func onSesame2KeysChanged(device: CHWifiModule2, sesame2keys: [String: String]) {
    wifiModuleDeviceModels = sesame2keys.keys.compactMap { key -> WifiModule2SesameModel? in
        guard let deviceStatus = sesame2keys[key],
                let status = UInt8(deviceStatus),
                let sesmae2LockStatus = WifiModule2Sesame2LockStatus(rawValue: status) else {
            return nil
        }
        return WifiModule2SesameModel(isWifiModule2Connected: sesmae2LockStatus != .disconnected, sesame2Status: sesmae2LockStatus.description, sesame2Key: key)
    }
    executeOnMainThread {
        self.sesame2ListViewHeight.constant = CGFloat(self.wifiModuleDeviceModels.count) * 50
        self.sesame2ListView.reloadData()
        self.refreshUI()
    }
}
```

前へ [WiFi Module クイックスタート](./android/quick_start_wifi_module.md)
