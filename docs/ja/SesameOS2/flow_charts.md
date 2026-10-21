---
title: "フロー図"
---

# [SesameにBLEログイン](./flow_charts.md#sesameにbleログイン)
Sesameに鍵を挿し込み成功。

```plantuml
@startuml

participant Sesame
participant App又WiFi_Module

Sesame -> App又WiFi_Module: 1. **BLEアドバタイジング**
Sesame <- App又WiFi_Module: 2. **BLEコネクト**
Sesame --> App又WiFi_Module: 3. **BLE接続成功**
Sesame <- App又WiFi_Module: 4. **ログイン**

@enduml
```

# [Sesame 登録フロー](./flow_charts.md#sesame-登録フロー)
Sesame 登録/レジスター フロー

```plantuml
@startuml

participant CANDY_HOUSE_Cloud
participant Sesame
participant SesameSDK
participant 自分のアプリ
SesameSDK <- 自分のアプリ: 1. **register()** 登録する
CANDY_HOUSE_Cloud <- SesameSDK: 2. **登録可否を確認**
CANDY_HOUSE_Cloud <- CANDY_HOUSE_Cloud: 3. **確認中**
CANDY_HOUSE_Cloud --> SesameSDK: 4. **OK!**
Sesame <- SesameSDK: 5. BLE指令:**鍵を作ってください**
Sesame -> Sesame: 6. **セサミ鍵を新規作成**
Sesame --> SesameSDK: 7. **セサミ鍵を伝達**
SesameSDK --> 自分のアプリ: 8. **セサミ鍵を伝達。**登録完了
@enduml
```

# [Sesame の角度設定](./flow_charts.md#sesame-の角度設定)

```plantuml
@startuml

participant Sesame
participant SesameSDK
participant App

group Sesame の角度設定を読込
SesameSDK <- App: 1. **角度設定を読込()**
Sesame <- SesameSDK: 2. **角度設定を読込()**
Sesame --> SesameSDK: 3. **設定された角度**
SesameSDK --> App: 4. **設定された角度**
end

group Sesame の角度を設定
SesameSDK <- App: 1. **角度を設定()**
Sesame <- SesameSDK: 2. **角度設定を設定()**
Sesame --> SesameSDK: 3. **設定された角度**
SesameSDK --> App: 4. **設定された角度**
end

@enduml

```

# [Sesame 状態遷移図](./flow_charts.md#sesame-状態遷移図)

<a href="https://docs.google.com/drawings/d/1a7vZAM9WuwPWO6OKUwSEO41QpbavJ21Ey1W6o_kQHq8/edit?usp=sharing"
   target="_blank">
    <img src="https://raw.github.com/CANDY-HOUSE/SesameSDK_iOS_with_DemoApp/assets/CHSesame2StateMachine.png"
         alt="Sesame2 State Machine" title="Sesame2 State Machine"
         style="text-align:center; width: auto; height: 500px;"/>
</a>

**if(!isRegistered) セサミデバイスが未登録の場合の状態遷移表**

<table style="border-collapse:collapse;">
    <thead style="border-color:black;border-style:solid;border-width:1px;">
    <tr>
        <th style="border-color:black;border-style:solid;border-width:1px;padding:10px 5px;">現在状態 →<br />入力 ↓</th>
        <th style="border-color:black;border-style:solid;border-width:1px;padding:10px 5px;">noBleSignal</th>
        <th style="border-color:black;border-style:solid;border-width:1px;padding:10px 5px;">receivedBle</th>
        <th style="border-color:black;border-style:solid;border-width:1px;padding:10px 5px;">bleConnecting</th>
        <th style="border-color:black;border-style:solid;border-width:1px;padding:10px 5px;">waitingGatt</th>
        <th style="border-color:black;border-style:solid;border-width:1px;padding:10px 5px;">readyToRegister</th>
        <th style="border-color:black;border-style:solid;border-width:1px;padding:10px 5px;">registering</th>
        <th style="border-color:black;border-style:solid;border-width:1px;padding:10px 5px;">noSettings</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td style="padding:10px 5px;">セサミデバイスが近くにあれば</td>
        <td style="padding:10px 5px;">receivedBle</td>
        <td />
        <td />
        <td />
        <td />
        <td />
        <td />
    </tr>
    <tr>
        <td style="padding:10px 5px;">connect()</td>
        <td />
        <td style="padding:10px 5px;">bleConnecting</td>
        <td />
        <td />
        <td />
        <td />
        <td />
    </tr>
    <tr>
        <td style="padding:10px 5px;">bleConnecting<br />SDKが自動的に進む</td>
        <td />
        <td />
        <td style="padding:10px 5px;">waitingGatt</td>
        <td />
        <td />
        <td />
        <td />
    </tr>
    <tr>
        <td style="padding:10px 5px;">waitingGatt<br />SDKが自動的に進む</td>
        <td />
        <td />
        <td />
        <td style="padding:10px 5px;">readyToRegister</td>
        <td />
        <td />
        <td />
    </tr>
    <tr>
        <td style="padding:10px 5px;">registerSesame2()</td>
        <td />
        <td />
        <td />
        <td />
        <td style="padding:10px 5px;">registering</td>
        <td />
        <td />
    </tr>
    <tr>
        <td style="padding:10px 5px;">registering<br />SDKが自動的に進む</td>
        <td />
        <td />
        <td />
        <td />
        <td />
        <td style="padding:10px 5px;">noSettings</td>
        <td />
    </tr>
    <tr>
        <td style="padding:10px 5px;">configureLockPosition()</td>
        <td />
        <td />
        <td />
        <td />
        <td />
        <td />
        <td style="padding:10px 5px;">locked/unlocked/moved<br />(isRegistered)</td>
    </tr>
    <tr>
        <td style="padding:10px 5px;">disconnect()</td>
        <td />
        <td />
        <td />
        <td />
        <td />
        <td />
        <td style="padding:10px 5px;">noBleSignal</td>
    </tr>
    </tbody>
</table>

**if(isRegistered) セサミデバイスが登録済の場合の状態遷移表**

<table style="border-collapse:collapse;">
    <thead style="border-color:black;border-style:solid;border-width:1px;">
    <tr>
        <th style="border-color:black;border-style:solid;border-width:1px;padding:10px 5px;">現在状態 →<br />入力 ↓</th>
        <th style="border-color:black;border-style:solid;border-width:1px;padding:10px 5px;">noBleSignal</th>
        <th style="border-color:black;border-style:solid;border-width:1px;padding:10px 5px;">receivedBle</th>
        <th style="border-color:black;border-style:solid;border-width:1px;padding:10px 5px;">bleConnecting</th>
        <th style="border-color:black;border-style:solid;border-width:1px;padding:10px 5px;">waitingGatt</th>
        <th style="border-color:black;border-style:solid;border-width:1px;padding:10px 5px;">readyToRegister</th>
        <th style="border-color:black;border-style:solid;border-width:1px;padding:10px 5px;">registering</th>
        <th style="border-color:black;border-style:solid;border-width:1px;padding:10px 5px;">noSettings</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td style="padding:10px 5px;">セサミデバイスが近くにあれば</td>
        <td style="padding:10px 5px;">receivedBle</td>
        <td />
        <td />
        <td />
        <td />
        <td />
        <td />
    </tr>
    <tr>
        <td style="padding:10px 5px;">connect()</td>
        <td />
        <td style="padding:10px 5px;">bleConnecting</td>
        <td />
        <td />
        <td />
        <td />
        <td />
    </tr>
    <tr>
        <td style="padding:10px 5px;">bleConnecting<br />SDKが自動的に進む</td>
        <td />
        <td />
        <td style="padding:10px 5px;">waitingGatt</td>
        <td />
        <td />
        <td />
        <td />
    </tr>
    <tr>
        <td style="padding:10px 5px;">waitingGatt<br />SDKが自動的に進む</td>
        <td />
        <td />
        <td />
        <td style="padding:10px 5px;">readyToRegister</td>
        <td />
        <td />
        <td />
    </tr>
    <tr>
        <td style="padding:10px 5px;">registerSesame2()</td>
        <td />
        <td />
        <td />
        <td />
        <td style="padding:10px 5px;">registering</td>
        <td />
        <td />
    </tr>
    <tr>
        <td style="padding:10px 5px;">registering<br />SDKが自動的に進む</td>
        <td />
        <td />
        <td />
        <td />
        <td />
        <td style="padding:10px 5px;">noSettings</td>
        <td />
    </tr>
    <tr>
        <td style="padding:10px 5px;">configureLockPosition()</td>
        <td />
        <td />
        <td />
        <td />
        <td />
        <td />
        <td style="padding:10px 5px;">locked/unlocked/moved<br />(isRegistered)</td>
    </tr>
    <tr>
        <td style="padding:10px 5px;">disconnect()</td>
        <td />
        <td />
        <td />
        <td />
        <td />
        <td />
        <td style="padding:10px 5px;">noBleSignal</td>
    </tr>
    </tbody>
</table>


# [Sesame 履歴機能](./flow_charts.md#sesame-履歴機能)

```plantuml
@startuml

participant CANDY_HOUSE_Cloud
participant Sesame
participant SesameSDK
participant App

Sesame <- SesameSDK: 1. BLE指令:**履歴を読込**
Sesame --> SesameSDK: 2. **履歴をコールバック**
CANDY_HOUSE_Cloud <- SesameSDK: 3. **履歴をアップロード**
App <- SesameSDK: 4. **履歴を伝達**
App <- App: 5. **UI表示**

@enduml
```

# [WiFi ModuleにBLEログイン](./flow_charts.md#wifi-moduleにbleログイン)

WiFi Moduleに鍵を挿し込み成功。

```plantuml
@startuml

participant WiFi_Module
participant App

WiFi_Module -> App: 1. **BLEアドバタイジング**
WiFi_Module <- App: 2. **BLEコネクト**
WiFi_Module --> App: 3. **BLE接続成功**
WiFi_Module <- App: 4. **ログイン**

@enduml
```

# [WiFi Module 登録フロー](./flow_charts.md#wifi-module-登録フロー)

WiFi Module 登録/レジスター フロー

```plantuml
@startuml

participant WiFi_Module
participant SesameSDK
participant App

SesameSDK <- App: 1. **register()** で登録する
WiFi_Module <- SesameSDK: 2. BLE指令:**鍵を作ってください**
WiFi_Module -> WiFi_Module: 3. **WiFi Module の鍵を新規作成**
WiFi_Module -> SesameSDK: 4. **WiFi Module の鍵を伝達**
SesameSDK --> App: 5. **WiFi Module の鍵を伝達。**登録完了

@enduml
```


# [WiFi Module のRouter設定](./flow_charts.md#wifi-module-のrouter設定)

```plantuml
@startuml

participant CANDY_HOUSE_Cloud
participant WiFi_Module
participant SesameSDK
participant App

SesameSDK <- App: 1. **WiFi Module に SSID を検索()させる**
WiFi_Module <- SesameSDK: 2. BLE指令:**SSID を検索してください**
WiFi_Module --> SesameSDK: 3. **見つかった 2.4GHz SSIDのリスト**
SesameSDK --> App: 4. **見つかった 2.4GHz SSIDのリスト**
SesameSDK <- App: 5. **SSID 、パスワード**
SesameSDK -> WiFi_Module: 6. BLE指令:**SSID 、パスワードを設定()**
WiFi_Module -> WiFi_Module: 7. **Routerに接続**
CANDY_HOUSE_Cloud <- WiFi_Module: 8. ** CANDY HOUSE Cloud に接続　**
CANDY_HOUSE_Cloud --> WiFi_Module: 9. **OK!**
SesameSDK <-- WiFi_Module: 10. **ネットワーク設定成功**
App <-- SesameSDK: 11. **ネットワーク設定成功**

@enduml
```

# [WiFi Module 状態遷移図](./flow_charts.md#wifi-module-状態遷移図)

<a href="https://docs.google.com/drawings/d/1a7vZAM9WuwPWO6OKUwSEO41QpbavJ21Ey1W6o_kQHq8/edit?usp=sharing"
   target="_blank">
    <img src="https://raw.github.com/CANDY-HOUSE/SesameSDK_iOS_with_DemoApp/assets/CHWifiModule2StateMachine.png"
         alt="Sesame2 State Machine" title="Sesame2 State Machine"
         style="text-align:center; width: auto; height: 500px;"/>
</a>

# [WiFi Module と Sesame のペアリング](./flow_charts.md#wifi-module-と-sesame-のペアリング)

```plantuml
@startuml

participant CANDY_HOUSE_Cloud
participant Sesame
participant WiFi_Module
participant SesameSDK
participant App

SesameSDK <- App: 1. **WiFi ModuleにこのSesameとペアリングさせて**
WiFi_Module <- SesameSDK: 2. BLE指令:**Sesame の情報を伝達**
Sesame <- WiFi_Module: 3. ** SesameにBLE接続し、BLEログインする　**
CANDY_HOUSE_Cloud <- WiFi_Module: 4. **Sesame,WiFi Module の状態を同期(施錠状況, 角度設定)**
SesameSDK <-- WiFi_Module: 5. **Sesame,WiFi Module の状態(施錠状況, 角度設定)**
SesameSDK <-- CANDY_HOUSE_Cloud: 6. **Sesame,WiFi Module の状態(施錠状況, 角度設定)**
App <-- SesameSDK: 7. **Sesame,WiFi Module の状態(施錠状況, 角度設定)**

@enduml
```

# [CANDY HOUSE Cloud と WiFi Module 経由で Sesame を遠隔操作](./flow_charts.md#candy-house-cloud-と-wifi-module-経由で-sesame-を遠隔操作)

```plantuml
@startuml

participant CANDY_HOUSE_Cloud
participant WiFi_Module
participant Sesame
participant SesameSDK
participant App

note over WiFi_Module, Sesame
    BLEコネクト済み、BLEログイン済み　
end note

note over WiFi_Module, CANDY_HOUSE_Cloud
    ネットワーク接続済み
end note

CANDY_HOUSE_Cloud <- App: 1. ** Sesame を操作するコマンド**
CANDY_HOUSE_Cloud -> WiFi_Module: 2. **Sesame を操作するコマンド**
WiFi_Module -> Sesame: 3. **Sesame を操作するコマンド**
WiFi_Module <-- Sesame: 4. **状態(施錠状況、電池状態、角度設定)**
CANDY_HOUSE_Cloud <-- WiFi_Module: 5. **状態(施錠状況、電池状態、角度設定)**
CANDY_HOUSE_Cloud --> SesameSDK: 6: **状態(施錠状況、電池状態、角度設定)**
SesameSDK --> App: 7: **状態(施錠状況、電池状態、角度設定)**

@enduml
```

# [WiFi Module の OSをアップデート](./flow_charts.md#wifi-module-の-osをアップデート)

```plantuml
@startuml

participant CANDY_HOUSE_Cloud
participant WiFi_Module
participant SesameSDK
participant App

note over CANDY_HOUSE_Cloud, WiFi_Module
ネットワーク接続済み
end note

SesameSDK <- App: 1. **WiFi Module の OSをアップデート()**
WiFi_Module <- SesameSDK: 2. BLE指令:**OSをアップデート()**
CANDY_HOUSE_Cloud <- WiFi_Module: 3. **最新版の OSをダウンロードする**
CANDY_HOUSE_Cloud --> WiFi_Module: 4. **最新版の OS**
WiFi_Module -> WiFi_Module:最新版のOSにアップデート
SesameSDK <-- WiFi_Module: 6. BLE:**アップデートの進捗をフィードバック**
App <-- SesameSDK: 7. **アップデートの進捗をフィードバック**
App -> App: 8. **UIを更新**

@enduml
```
