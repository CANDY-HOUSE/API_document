---
title: RESTful API
---
# RESTful API

## API 介紹

Sesame APP 通過使用 RESTful API 以及 Iot 物聯網技術實現多平臺多設備互聯互通的功能。

## API 接口文檔

## 1、獲取設備的影子【CHIoTManager】

- 方法名：getCHDeviceShadow
- 参数：deviceId
- 网络请求 get, /device/v1/sesame2

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

## 2、向 Wifi Moudle2 發消息

方法名：sendCommandToWM2
参数：cmd history sign
网络请求 post, /device/v1/iot/sesame2/deviceId

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

## 3、註冊單車鎖【CHSesameBikeDevice+Register】

- 方法名：onRegisterStage1
- 参数：[ak:publicKey,sessionToken,e:er,t:bikelock.rawValue]
- 网络请求 post, /device/v1/sesame2/deviceId

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

## 4、上傳歷史【CHSesameDevice+History】

- 方法名：postProcessHistory
- 参数：[ s:deviceId, v:historyData ]
- 网络请求 post, /device/v1/sesame2/historys

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
                    L.d("上傳歷史失敗,掉歷史  : \(error)")
                }
            }
    }
```

## 5、註冊 SesameBot【CHSesameBotDevice+Register】

- 方法名：onRegisterStage1
- 参数：[ak:publicKey,sessionToken,e:er,t:bikelock.rawValue]
- 网络请求 post, /device/v1/sesame2/deviceId

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

## 6、註冊 Sesame2Device【CHSesame2Device+Register】

- 方法名：onRegisterStage1
- 参数：[ak:publicKey,sessionToken,e:er,t:bikelock.rawValue]
- 网络请求 post, /device/v1/sesame2/deviceId

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

## 7、獲取異步時間【CHSesame2Device+Login】

- 方法名：requestSyncTime
- 参数：[st:sessionToken]
- 网络请求 post, device/v1/sesame2/deviceId/time

```c
            let reqBody: NSDictionary = [
                "st": sessionToken.base64EncodedString()
            ]

    func requestSyncTime( _ result: @escaping CHResult<Any>) {
        if let sessionToken = self.cipher?.sessionToken {
            let reqBody: NSDictionary = [
                "st": sessionToken.base64EncodedString()
            ]

            CHAccountManager
                .shared
                .API(request: .init(.post, "/device/v1/sesame2/\(deviceId.uuidString)/time", reqBody)) { response in
                    switch response {
                    case .success(let data):
                        guard let data = data else {
                            L.d("🕒", NSError.noContent)
                            return
                        }
                        // todo kill this parcer
                        guard let dict = try? data.decodeJsonDictionary() as? NSDictionary,
                              let b64Payload = dict["r"] as? String,
                              let payload = Data(base64Encoded: b64Payload) else {
                            L.d("🕒Parse data failed.")
                            return
                        }
                        self.sendSyncTime(payload: payload){ res in
                            result(.success(CHResultStateBLE(input: CHEmpty())))

                        }
                    case .failure(let error):
                        L.d("🕒",error)
                    }
                }
        }
    }
```

## 8、上傳歷史【CHSesame2Device+History】

- 方法名：postProcessHistory
- 参数：[s:deviceId, v:historyData]
- 网络请求 post, /device/v1/sesame2/historys

```c
        let request: CHAPICallObject = .init(.post, "/device/v1/sesame2/historys", [
            "s": self.deviceId.uuidString,
            "v": historyData.toHexString()
        ])

        CHAccountManager
            .shared
            .API(request: request) { result in
                switch result {
                case .success(_):
                    L.d("藍芽", "上傳歷史成功")
                    break
                case .failure(let error):
                    L.d("藍芽", "上傳歷史失敗,掉歷史  : \(error)")
                    break
            }
        }
    }
```

## 9、註冊 Sesame Touch Pro【CHSesameTouchPro+Register】

- 方法名：register
- 参数：[t:productType, pk:sesameToken]
- 网络请求 post, /device/v1/sesame5/deviceId

```c

    let request = CHAPICallObject(.post, "/device/v1/sesame5/\(self.deviceId.uuidString)", [
        "t":advertisement!.productType!.rawValue,
        "pk":self.mSesameToken!.toHexString()
    ] as [String : Any])

```

## 10、註冊 Bike 2【CHSesameBike2Device+Register】

- 方法名：register
- 参数：[t:productType, pk:sesameToken]
- 网络请求 post, /device/v1/sesame5/deviceId

```c
        let request = CHAPICallObject(.post, "/device/v1/sesame5/\(self.deviceId.uuidString)", [
            "t":advertisement!.productType!.rawValue,
            "pk":self.mSesameToken!.toHexString()
        ])
```

## 11、註冊 Sesame 5【CHSesame5Device+Register】

- 方法名：register
- 参数：[t:productType, pk:sesameToken]
- 网络请求 post, /device/v1/sesame5/deviceId

```c

        let request = CHAPICallObject(.post, "/device/v1/sesame5/\(self.deviceId.uuidString)", [
            "t":advertisement!.productType!.rawValue,
            "pk":self.mSesameToken!.toHexString()
        ])
```

## 12、上傳歷史【CHSesame5Device+History】

- 方法名：postProcessHistory
- 参数：[s:deviceId, v:historyData,t:5]
- 网络请求 post, /device/v1/sesame2/historys

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
                    L.d("[ss5][history]藍芽", "上傳歷史成功")
                    break
                case .failure(let error):
                    L.d("[ss5][history]藍芽", "上傳歷史失敗,server掉歷史: \(error)")
                    break
                }
            }
    }
```

## 13、創建客人鑰匙 createGuestKey【CHDevice】

- 方法名：createGuestKey
- 参数：[keyName：name]
- 网络请求 post, /device/v1/sesame2/deviceId/guestkey

```c

    func createGuestKey(result: @escaping CHResult<String>) {
        let encoder = JSONEncoder()
        encoder.outputFormatting = .prettyPrinted
        let deviceKey = getKey() //返回CHDeviceKey
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

## 14、訂閱 IoT 主題前必需調用驗證【CHDevice】

- 方法名：iotCustomVerification
- 参数：[a：getTimeSignature]
- 网络请求 get, /device/v1/iot/sesame2/deviceId

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

## 15、獲取訪客的鑰匙【CHDevice】

- 方法名：getGuestKeys
- 参数：[a：getTimeSignature]
- 网络请求 get, /device/v1/sesame2/deviceId/guestkeys

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

## 16、更新訪客的鑰匙【CHDevice】

- 方法名：updateGuestKey
- 参数：["guestKeyId": guestKeyId, "keyName": name]
- 网络请求 get, /device/v1/sesame2/deviceId/guestkeys

## 17、刪除訪客的鑰匙【CHDevice】

- 方法名：removeGuestKey
- 参数：[ "guestKeyId": guestKeyId, "randomTag": keyCheck[0...3]]
- 网络请求 delete, /device/v1/sesame2/deviceId/guestkeys

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

## 18、打開推送【CHDevice】

- 方法名：enableNotification
- 参数：["token": token,"deviceId":deviceId,"name": name]
- 网络请求 get, /device/v1/token

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

## 19、查詢推送是否開啓【CHDevice】

- 方法名：isNotificationEnabled
- 参数：["deviceId": deviceId, "deviceToken": token, "name": name]
- 网络请求 get, /device/v1/token

## 20、訪客鑰匙調用 signedToken【CHDevice】

// 取 session token 並上傳 server 以 secretKey 簽章後得到 login token

- 方法名：signedToken
- 参数：["deviceId": deviceId., "token": token, "secretKey": keyData.secretKey]
- 网络请求 post, /device/v1/sesame2/sign/

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

## 21、關閉推送【CHDeviceManager】

- 方法名：disableNotification
- 参数：["token": token, "deviceId": deviceId, "name": name]
- 网络请求 delete, /device/v1/token/

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
