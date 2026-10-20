---
title: RESTful API
---
# RESTful API

## API の紹介

Sesame APP は、RESTful API と Iot 物連技術を利用して、マルチプラットフォームとマルチデバイス間に相互の連携とコミュニケーションを実現します。

## API インターフェースのドキュメンテーション

## 1、デバイスのシャドウの取得【CHIoTManager】

- メソッド名：getCHDeviceShadow
- パラメータ：deviceId
- ネットワークリクエスト get, /device/v1/sesame2

```c
       func getCHDeviceShadow(_ sesameLock: CHSesameLock, onResponse: (CHResult<CHDeviceShadow>)? = nil) {
        func getShadow() {
            CHAccountManager.shared.API(request: .init(.get, "/device/v1/sesame2/\(sesameLock.deviceId.uuidString)")) { apiResult in
                switch apiResult {
                case .success(let data):
                    L.d("⌚️ API getShadow ok",data)

                    if let shadow = CHDeviceShadow.fromRESTFulData(data!) {
                        onResponse?(.success(.init(input: shadow)))
                    }
                case .failure(let error):
                    L.d("⌚️ API error",error )
                    onResponse?(.failure(error))
                }
            }
        }
        getShadow()
    }
```

## 2、Wifi Moudle2 にメッセージを送信する

メソッド名：sendCommandToWM2
パラメータ：cmd history sign
ネットワークリクエスト post, /device/v1/iot/sesame2/deviceId

```c

    let parameter = [
        "cmd": command.rawValue,
        "history": keyData.historyTag!.base64EncodedString(),
            "sign": keyCheck[0...3].toHexString()
    ] as [String : Any]

    func sendCommandToWM2(_ command: SesameItemCode, _ device: CHDevice, onResponse: @escaping (CHResult<CHEmpty>)) {
        guard let keyData = device.getKey() else {
            return
        }
        if keyData.historyTag == nil {
            keyData.historyTag = Data()
        }
        var data = command.rawValue.data
        data += device.deviceId.uuidString.data(using: .utf8)!
        data += Data.createOS2Histag(keyData.historyTag)
        var timestamp: UInt32 = UInt32(Date().timeIntervalSince1970)
        let timestampData = Data(bytes: &timestamp,
                                 count: MemoryLayout.size(ofValue: timestamp))
        let randomTag = Data(timestampData.arrayOfBytes()[1...3])

        let keyCheck = CC.CMAC.AESCMAC(randomTag,
                                       key: keyData.secretKey.hexStringtoData())
        data = keyCheck[0...3] + data
        let parameter = [
            "cmd": command.rawValue,
            "history": keyData.historyTag!.base64EncodedString(),
            "sign": keyCheck[0...3].toHexString()
        ] as [String : Any]

        CHAccountManager.shared.API(request: .init(.post, "/device/v1/iot/sesame2/\(device.deviceId.uuidString)",
                                                   parameter)) { apiResult in
            if case let .failure(error) = apiResult {
                onResponse(.failure(error))
            } else {
                onResponse(.success(.init(input: .init())))
            }
        }

    }

```

## 3、自転車ロックの登録【CHSesameBikeDevice+Register】

- メソッド名：onRegisterStage1
- パラメータ：[ak:publicKey,sessionToken,e:er,t:bikelock.rawValue]
- ネットワークリクエスト post, /device/v1/sesame2/deviceId

```c
[
            "s1": [
                "ak": (Data(appKeyPair.publicKey).base64EncodedString()),
                "n": bikeLockSessionToken!.base64EncodedString(),
                "e": er,
                "t": CHProductModel.bikeLock.rawValue
            ]
            ]
```

```c
    func onRegisterStage1(er: String, result: @escaping CHResult<CHEmpty>) {

        L.d("[bike][register]onRegisterStage1")

        let request = CHAPICallObject(.post, "/device/v1/sesame2/\(self.deviceId.uuidString)", [
            "s1": [
                "ak": (Data(appKeyPair.publicKey).base64EncodedString()),
                "n": bikeLockSessionToken!.base64EncodedString(),
                "e": er,
                "t": CHProductModel.bikeLock.rawValue
            ]
            ]
        )

        CHAccountManager
            .shared
            .API(request: request) { response in
                switch response {
                case .success(let data):
                    L.d("[bike][request]success")

                    guard let data = data else {
                        result(.failure(NSError.noContent))
                        return
                    }
                    // todo kill this parcer with json decoder
                    if let dict = try? data.decodeJsonDictionary() as? [String: String],
//                        let b64PayloadTime = dict["r"],
//                        let timePayload = Data(base64Encoded: b64PayloadTime) ,
                        let b64Sig1 = dict["sig1"],
                        let b64ServerToken = dict["st"],
                        let b64SesamePublicKey = dict["pubkey"],
                        let sig1 = Data(base64Encoded: b64Sig1),
                        let serverToken = Data(base64Encoded: b64ServerToken),
                        let sesamePublicKey = Data(base64Encoded: b64SesamePublicKey) {

                        self.deviceStatus = .registering()

                        self.onRegisterStage2(
                            appKey: self.appKeyPair,
                            sig1: sig1,
                            serverToken: serverToken,
                            sesame2PublicKey: sesamePublicKey,
                            result: result
                        )
                    } else {
                        result(.failure(NSError.parseError))
                        self.deviceStatus = .readyToRegister()
                    }
                case .failure(let error):
                    result(.failure(error))
                }
        }
    }
```

## 4、履歴のアップロード【CHSesameDevice+History】

- メソッド名：postProcessHistory
- パラメータ：[ s:deviceId, v:historyData ]
- ネットワークリクエスト post, /device/v1/sesame2/historys

```c
    func postProcessHistory(_ historyData: Data) {
        let request: CHAPICallObject = .init(.post, "/device/v1/sesame2/historys", [
            "s": self.deviceId.uuidString,
            "v": historyData.toHexString()
        ])

        CHAccountManager
            .shared
            .API(request: request) { result in
                switch result {
                case .success(_): break

                case .failure(let error):
                    L.d("履歴のアップロードに失敗 : \(error)")
                }
            }
    }
```

## 5、SesameBot の登録【CHSesameBotDevice+Register】

- メソッド名：onRegisterStage1
- パラメータ：[ak:publicKey,sessionToken,e:er,t:bikelock.rawValue]
- ネットワークリクエスト post, /device/v1/sesame2/deviceId

```c
func onRegisterStage1(er: String, result: @escaping CHResult<CHEmpty>) {

        let request = CHAPICallObject(.post, "/device/v1/sesame2/\(self.deviceId.uuidString)", [
            "s1": [
                "ak": (Data(appKeyPair.publicKey).base64EncodedString()),
                "n": self.sesameBotSessionToken!.base64EncodedString(),
                "e": er,
                "t": CHProductModel.sesameBot.rawValue
            ]
        ]
        )

        CHAccountManager
            .shared
            .API(request: request) { response in
                switch response {
                case .success(let data):

                    guard let data = data else {
                        result(.failure(NSError.noContent))
                        return
                    }
                    // todo kill this parcer with json decoder
                    if let dict = try? data.decodeJsonDictionary() as? [String: String],
                       let b64Sig1 = dict["sig1"],
                       let b64ServerToken = dict["st"],
                       let b64SesamePublicKey = dict["pubkey"],
                       let sig1 = Data(base64Encoded: b64Sig1),
                       let serverToken = Data(base64Encoded: b64ServerToken),
                       let sesamePublicKey = Data(base64Encoded: b64SesamePublicKey) {

                        self.deviceStatus = .registering()

                        self.onRegisterStage2(
                            appKey: self.appKeyPair,
                            sig1: sig1,
                            serverToken: serverToken,
                            sesame2PublicKey: sesamePublicKey,
                            result: result
                        )
                    } else {
                        result(.failure(NSError.parseError))
                        self.deviceStatus = .readyToRegister()
                    }
                case .failure(let error):
                    result(.failure(error))
                }
            }
    }

```

## 6、Sesame2Device を登録する【CHSesame2Device+Register】

- メソッド名：onRegisterStage1
- パラメタ：[ak:publicKey,sessionToken,e:er,t:bikelock.rawValue]
- ネットワークリクエスト post, /device/v1/sesame2/deviceId

```c
        let request = CHAPICallObject(.post, "/device/v1/sesame2/\(self.deviceId.uuidString)", [
            "s1": [
                "ak": (Data(appKeyPair.publicKey).base64EncodedString()),
                "n": self.sesameBotSessionToken!.base64EncodedString(),
                "e": er,
                "t": CHProductModel.sesameBot.rawValue
            ]
        ]
        )

```

## 7、非同期時間の取得【CHSesame2Device+Login】

- メソッド名：requestSyncTime
- パラメタ：[st:sessionToken]
- ネットワークリクエスト post, device/v1/sesame2/deviceId/time

```c

            let reqBody: NSDictionary = [
                "st": sessionToken.base64EncodedString()
            ]

```

## 8、履歴のアップロード【CHSesame2Device+History】

- メソッド名：postProcessHistory
- パラメタ：[s:deviceId, v:historyData]
- ネットワークリクエスト post, /device/v1/sesame2/historys

```c

        let request: CHAPICallObject = .init(.post, "/device/v1/sesame2/historys", [
            "s": self.deviceId.uuidString,
            "v": historyData.toHexString()
        ])

```

## 9、Sesame Touch Pro の登録【CHSesameTouchPro+Register】

- メソッド名：register
- パラメタ：[t:productType, pk:sesameToken]
- ネットワークリクエスト post, /device/v1/sesame5/deviceId

```c

    let request = CHAPICallObject(.post, "/device/v1/sesame5/\(self.deviceId.uuidString)", [
        "t":advertisement!.productType!.rawValue,
        "pk":self.mSesameToken!.toHexString()
    ] as [String : Any])

```

## 10、Bike 2 の登録【CHSesameBike2Device+Register】

- メソッド名：register
- パラメタ：[t:productType, pk:sesameToken]
- ネットワークリクエスト post, /device/v1/sesame5/deviceId

```c

        let request = CHAPICallObject(.post, "/device/v1/sesame5/\(self.deviceId.uuidString)", [
            "t":advertisement!.productType!.rawValue,
            "pk":self.mSesameToken!.toHexString()
        ])

```

## 11、Sesame 5 の登録【CHSesame5Device+Register】

- メソッド名：register
- パラメタ：[t:productType, pk:sesameToken]
- ネットワークリクエスト post, /device/v1/sesame5/deviceId

```c

        let request = CHAPICallObject(.post, "/device/v1/sesame5/\(self.deviceId.uuidString)", [
            "t":advertisement!.productType!.rawValue,
            "pk":self.mSesameToken!.toHexString()
        ])

```

## 12、履歴のアップロード【CHSesame5Device+History】

- メソッド名：postProcessHistory
- パラメタ：[s:deviceId, v:historyData,t:5]
- ネットワークリクエスト post, /device/v1/sesame2/historys

```c
        let request: CHAPICallObject = .init(.post, "/device/v1/sesame2/historys", [
            "s": self.deviceId.uuidString,
            "v": historyData.toHexString(),
            "t":"5",
        ])

        CHAccountManager
            .shared
            .API(request: request) { result in
                switch result {
                case .success(_):
                    L.d("[ss5][history]Bluetooth", "履歴のアップロードに成功しました")
                    break
                case .failure(let error):
                    L.d("[ss5][history]Bluetooth", "履歴のアップロードに失敗しました。サーバーが落ちました: \(error)")
                    break
                }
            }
    }
```

## 13、ゲストキーの作成 createGuestKey【CHDevice】

- メソッド名：createGuestKey
- パラメータ：[keyName：name]
- ネットワークリクエスト post, /device/v1/sesame2/deviceId/guestkey

```c

    func createGuestKey(result: @escaping CHResult<String>) {
        let encoder = JSONEncoder()
        encoder.outputFormatting = .prettyPrinted
        let deviceKey = getKey() //CHDeviceKeyを返します
        let jsonData = try! encoder.encode(deviceKey)
        var data = try! JSONSerialization.jsonObject(with: jsonData, options: []) as! [String: Any]
        let date = Date()
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "MM/dd HH:mm"
        dateFormatter.locale = Locale(identifier: "ja_JP")
        data["keyName"] = dateFormatter.string(from: date)
        CHAccountManager.shared.API(request: .init(.post, "/device/v1/sesame2/\(deviceId.uuidString)/guestkey", data)) { postResult in
            switch postResult {
            case .success(let data):
                let decoder = JSONDecoder()
                let guestKey = try! decoder.decode(String.self, from: data!)
                result(.success(.init(input: guestKey)))
            case .failure(let error):
                result(.failure(error))
            }
        }
    }

```

## 14、IoT のトピックを購読する前に認証が必要【CHDevice】

- メソッド名：iotCustomVerification
- パラメータ：[a：getTimeSignature]
- ネットワークリクエスト get, /device/v1/iot/sesame2/deviceId

```c

    func iotCustomVerification(result: @escaping CHResult<CHEmpty>) {
        CHAccountManager.shared.API(request: .init(.get, "/device/v1/iot/sesame2/\(deviceId.uuidString)", queryParameters: ["a": getTimeSignature()])) { verifyResult in
            switch verifyResult {
            case .success(_):
                result(.success(.init(input: .init())))
            case .failure(let error):
                result(.failure(error))
            }
        }
    }

```

## 15、ゲストのキーを取得する【CHDevice】

- メソッド名：getGuestKeys
- パラメータ：[a：getTimeSignature]
- ネットワークリクエスト get, /device/v1/sesame2/deviceId/guestkeys

```c
    func getGuestKeys(result: @escaping CHResult<[CHGuestKey]>) {
        CHAccountManager.shared.API(request: .init(.get, "/device/v1/sesame2/\(deviceId.uuidString)/guestkeys")) { getResult in
            switch getResult {
            case .success(let data):
                let guestKeys = try! JSONDecoder().decode([CHGuestKey].self, from: data!)
                result(.success(.init(input: guestKeys)))
            case .failure(let error):
                result(.failure(error))
            }
        }
    }
```

## 16、ゲストのキーを更新する【CHDevice】

- メソッド名：updateGuestKey
- パラメータ：["guestKeyId": guestKeyId, "keyName": name]
- ネットワークリクエスト get, /device/v1/sesame2/deviceId/guestkeys

## 17、ゲストのキーを削除する【CHDevice】

- メソッド名：removeGuestKey
- パラメータ：[ "guestKeyId": guestKeyId, "randomTag": keyCheck[0...3]]
- ネットワークリクエスト delete, /device/v1/sesame2/deviceId/guestkeys

```c
        CHAccountManager.shared.API(request: .init(.delete, "/device/v1/sesame2/\(deviceId.uuidString)/guestkey", [ "guestKeyId": guestKeyId, "randomTag": keyCheck[0...3].toHexString()])) { deleteResult in
            switch deleteResult {
            case .success(_):
                result(.success(.init(input: .init())))
            case .failure(let error):
                result(.failure(error))
            }
        }

```

## 18、通知を有効にする【CHDevice】

- メソッド名：enableNotification
- パラメータ：["token": token,"deviceId":deviceId,"name": name]
- ネットワークリクエスト get, /device/v1/token

```c
    func enableNotification(token: String, name: String, result: @escaping CHResult<CHEmpty>) {
        CHAccountManager.shared.API(request: .init(.post, "/device/v1/token",
                                                   ["token": token,
                                                    "deviceId":deviceId.uuidString,
                                                    "name": name])) { createResult in
            if case let .failure(error) = createResult {
                result(.failure(error))
            } else {
                result(.success(.init(input: .init())))
            }
        }
    }
```

## 19、通知が有効かどうかを確認する【CHDevice】

- メソッド名：isNotificationEnabled
- パラメータ：["deviceId": deviceId, "deviceToken": token, "name": name]
- ネットワークリクエスト get, /device/v1/token

## 20、ゲストキーは signedToken を呼び出す【CHDevice】

// session token を取得し、server にアップロードする。その後、secretKey で署名を行い、login token を得る

- メソッド名：signedToken
- パラメータ：["deviceId": deviceId., "token": token, "secretKey": keyData.secretKey]
- ネットワークリクエスト post, /device/v1/sesame2/sign/

```c
    func sign(token: String, result: @escaping CHResult<String>) {
        guard let keyData = getKey() else {
            return
        }
        L.d("API:/device/v1/sesame2/sign",token, deviceId.uuidString,keyData.secretKey)

        CHAccountManager.shared.API(request: .init(.post, "/device/v1/sesame2/sign", ["deviceId": deviceId.uuidString, "token": token, "secretKey": keyData.secretKey])) { serverResult in
            switch serverResult {
            case .success(let data):
                let signedToken = String(data: data!, encoding: .utf8)!
                //                L.d("sign ok:",signedToken)
                result(.success(.init(input: signedToken)))
            case .failure(let error):
                L.d("sign error!")

                result(.failure((error)))
            }
        }
    }
```

## 21、通知を無効にする【CHDeviceManager】

- メソッド名：disableNotification
- パラメータ：["token": token, "deviceId": deviceId, "name": name]
- ネットワークリクエスト delete, /device/v1/token/

```c
    public func disableNotification(deviceId: String, token: String, name: String, result: @escaping CHResult<CHEmpty>) {
        CHAccountManager.shared.API(request: .init(.delete, "/device/v1/token", ["token": token, "deviceId": deviceId, "name": name])) { deleteResult in
            switch deleteResult {
            case .success(_):
                result(.success(.init(input: .init())))
            case .failure(let error):
                result(.failure(error))
            }
        }
    }

```
