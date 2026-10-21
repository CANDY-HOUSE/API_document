---
title: "クイックスタート Sesame"
---

# [目的](./quick_start_android.md#目的)
Android開発者向けにSesameSDKのインストールから設定までのクイックガイドです。コピペですぐ使えるサンプルコードを通じてSesameの登録・設定・操作・リセットなどができるアプリを一瞬で作りましょう。
# [準備リスト](./quick_start_android.md#準備リスト)
* Sesame3　デバイス
* Android 5.0以上の端末 (BLE操作可能な端末)

# [フロー](./quick_start_android.md#フロー)
* スマホがあなたのアプリに位置情報サービスの権限を許可
* SesameSDK をインストールする
* SesameSDK を設定する
* BLEスキャンを行う
* 未登録のセサミリストを取得する
* Sesame状態を取得する
* SesameとBLE接続する
* Sesameを登録する
* Sesameの角度を設定する
* Sesameの施錠・解錠する
* 登録済のSesameリストを取得する

# [位置情報サービスの権限の許可](./quick_start_android.md#位置情報サービスの権限の許可)
* [Androidの公式要件により、Bluetoothを使用する場合、必ず端末から位置情報サービスの権限の得なければなりません](https://developer.android.com/guide/topics/connectivity/bluetooth#Permissions)
* アプリが端末から位置情報サービス権限の得るため、サードパーティの[PermissionX](https://github.com/guolindev/PermissionX)を導入します。

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    PermissionX.init(this)
        .permissions(Manifest.permission.ACCESS_FINE_LOCATION)
        .onExplainRequestReason { scope, deniedList ->
            scope.showRequestReasonDialog(deniedList, "for bletooth", "OK", "Cancel")
        }
        .onForwardToSettings { scope, deniedList ->
            scope.showForwardToSettingsDialog(
                deniedList,
                "You need to allow necessary permissions in Settings manually for bluetooth",
                "OK",
                "Cancel"
            )
        }
        .request { allGranted, grantedList, deniedList ->
            if (allGranted) {
                Toast.makeText(this, "ACCESS_FINE_LOCATION are granted", Toast.LENGTH_LONG)
                    .show()
            } else {
                finish()
            }
        }
}
```

# [SesameSDKをインストール](./quick_start_android.md#sesamesdkをインストール)

Gradle 対応。`build.gradle` ファイルを下記のようにの編集します:
*  `plugins` に `kotlin-kapt` を入れる
*  `maven` にソースを追加する `https://github.com/CANDY-HOUSE/SesameSDK_Android/raw/main`
*  下記のように 関連依頼を dependencies に追加します。

```kotlin
plugins {
    // ...
    id 'kotlin-kapt'
}
repositories {
    maven {
        // ...
        url "https://github.com/CANDY-HOUSE/SesameSDK_Android/raw/main"
    }
}
// ...
dependencies {
    // ...
    //bluetooth need location permission
    implementation 'com.permissionx.guolindev:permissionx:1.4.0'

    /** sesame sdk  ==> */
    //sesame sdk
    implementation 'co.candyhouse.jp:sesame:2.0.4@aar'

    //sesame sdk use room save db
    implementation "androidx.room:room-runtime:2.3.0"
    kapt "androidx.room:room-compiler:2.3.0"
    implementation "androidx.room:room-ktx:2.3.0"
    implementation "androidx.room:room-rxjava2:2.3.0"

    //sesame sdk use aws
    implementation "com.amazonaws:aws-android-sdk-apigateway-core:2.19.3"
    implementation 'com.amazonaws:aws-android-sdk-iot:2.19.3'

    /** end sesame sdk  <== */
}
```

# [SesameSDK を設定する](./quick_start_android.md#sesamesdk-を設定する)
* `Application`オブジェクトにて`CHBleManager`を初期化します
* CANDY HOUSEから API_KEY の<a href="https://partners.candyhouse.co" target="_blank">取得</a>は開発段階の時に省略可。サンプルコードのままの API_KEY をご使用ください。
```kotlin
class MyApp : Application() {
    override fun onCreate() {
        super.onCreate()
        CHBleManager(this)
        // CHConfiguration.API_KEY = "xxx"  // defaut demo-API_KEY
    }
}
```

# [BLEのスキャンをオンにする](./quick_start_android.md#bleのスキャンをオンにする)
* `Activity` のライフサイクルの `onResume` にて のBLEスキャンを開始させる  
* `Activity` のライフサイクルの `onPause` にて のBLEスキャンを停止させる
```kotlin
override fun onResume() {
    super.onResume()
    CHBleManager.enableScan {}
}

override fun onPause() {
    super.onPause()
    CHBleManager.disableScan {}
}
```

# [未登録のセサミリストを取得する](./quick_start_android.md#未登録のセサミリストを取得する)
* Android 端末の横に未登録のセサミ3を用意します
* `CHBleManager`の`didDiscoverUnRegisteredCHDevices`から未登録のセサミリスト(delegateイベント)を取得します
* `RSSI`はセサミデバイスが発信しているBLEアドバイタイシングの信号強度

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

# [SesameのBLE状態を取得する](./quick_start_android.md#sesameのble状態を取得する)
* 各操作によりBLE状態変化が異なります。状態一覧は[Sesame状態遷移図](../reference.md#chsesame2status)までご参照ください。
* 登録済のセサミデバイスとBLE接続をする前に、delegateイベントが`CHSesame2Status.ReceivedBle`状態になる必要な場合がございます。

```kotlin
device.delegate = object : CHSesame2Delegate {
    override fun onBleDeviceStatusChanged(
        device: SesameLocker,
        status: CHSesame2Status,
        shadowStatus: CHSesame2ShadowStatus?
    ) {
        updateUI(device)
        if (device.deviceStatus == CHSesame2Status.ReceivedBle) {
            device.connect { }
        }
    }
}
```

# [SesameとBLE接続する](./quick_start_android.md#sesameとble接続する)
* SesameデバイスのBLEアドバタイジングを取得できたら、SesameデバイスとBLE接続するコマンドが使用可能となります。
* SesameデバイスのBLEアドバタイジングを取得できたら、未登録のSesameのdelegateイベントが伝わってきます。未登録のセサミデバイスの初期BLE状態は必ず`CHSesame2Status.ReceivedBle`となります。
* セサミデバイスが接続された瞬間に青いLEDが点灯します。
```kotlin
 device.connect { }
```

# [Sesameを登録する](./quick_start_android.md#sesameを登録する)
*  セサミデバイスとBLE接続する完了後、BLE状態が`CHSesame2Status.ReadyToRegister`に変わります。`register`コマンドを使って、セサミデバイスを登録します。
*  セサミデバイスを登録する際にネット環境が必要です。
*  セサミデバイスの登録が完了後、SesameのBLE状態が`CHSesame2Status.NoSettings`となり、次のステップにてセサミデバイスの施解錠の角度範囲を設定します。
```kotlin
if (device.deviceStatus == CHSesame2Status.ReadyToRegister) {
    device.register {
        it.onSuccess {
            sesame.configureLockPosition(0, 256) {} // 1024 = 360 degree
        }
    }
}
```

# [Sesameの角度設定をする](./quick_start_android.md#sesameの角度設定をする)
*  `configureLockPosition`メソッドを使って、(施錠位置, 解錠位置)との二つのパラメーターを入力します。
*  數值 0 ~ 1024 は 0° ~ 360° を表します。例えば、`sesame.configureLockPosition(0, 256)` は施錠0°、解錠90°の設定となります。

```kotlin
    sesame.configureLockPosition(0, 256) {} // 1024 = 360° degree
```

# [施錠・解錠！](./quick_start_android.md#施錠・解錠)
* 角度の設定が完了後、Sesameの状態が`Locked`/`Unlocked`/`Moved` になります。
* `toggle`コマンドを使って、状態が`Locked`/`Unlocked`に変化します。

```kotlin
  sesame.toggle { }
  sesame.lock { }
  sesame.unlock { }
```

# [次回アプリが開かれる時に登録された所有のセサミデバイスリストを再利用する](./quick_start_android.md#次回アプリが開かれる時に登録された所有のセサミデバイスリストを再利用する)
* アプリが終了して、次回アプリが開かれる時に登録された所有のセサミデバイスリストを再度利用する場合、`CHDeviceManager`から所有のデバイスリストを取得できます。
* SesameデバイスとのBLE接続を行ってから施解除の操作してくださいね。



```kotlin
CHDeviceManager.getCandyDevices {
    it.onSuccess {
        runOnUiThread {
            deviceList.addAll(it.data)
            (recycle.adapter as GenericAdapter<*>).notifyDataSetChanged()
        }
    }
}
```

# GitHub サンプルアプリ

* [SesameSDK_Android_with_DemoApp](https://github.com/CANDY-HOUSE/SesameSDK_Android_with_DemoApp)

前へ [SesameSDK_Android 紹介](../index.md)
次へ [Wifi-Module クイックスタート](./quick_start_wifi_module.md)