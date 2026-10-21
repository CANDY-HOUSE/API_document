---
title: RESTful API
---
# RESTful API

::: info Deprecated soon
The RESTful API will be deprecated soon. Refer to [https://github.com/CANDY-HOUSE/biz.candyhouse.co](https://github.com/CANDY-HOUSE/biz.candyhouse.co) as an alternative.
:::

## API Introduction

The Sesame APP uses the RESTful API and IoT technology to achieve multi-platform and multi-device interconnection.

## API Interface Documentation

## 1、Acquire device shadow【CHIoTManager】

- Method name: getCHDeviceShadow
- Parameters: deviceId
- Network request get, /device/v1/sesame2

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

## 2、Send message to Wifi Module2

Method name: sendCommandToWM2
Parameters: cmd history sign
Network request post, /device/v1/iot/sesame2/deviceId

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

## 3、Register bike lock【CHSesameBikeDevice+Register】

- Method name: onRegisterStage1
- Parameters: [ak:publicKey,sessionToken,e:er,t:bikelock.rawValue]
- Network request post, /device/v1/sesame2/deviceId

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

## 4、Upload history【CHSesameDevice+History】

- Method name: postProcessHistory
- Parameters: [ s:deviceId, v:historyData ]
- Network request post, /device/v1/sesame2/historys

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
                    L.d("Failure to upload history: \(error)")
                }
            }
    }
```

## 5、Register SesameBot【CHSesameBotDevice+Register】

- Method name: onRegisterStage1
- Parameters: [ak:publicKey,sessionToken,e:er,t:bikelock.rawValue]
- Network request post, /device/v1/sesame2/deviceId
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
                    // todo kill this parser with json decoder
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

## 6. Registering Sesame2Device【CHSesame2Device+Register】

- Method name: onRegisterStage1
- Parameters: [ak: publicKey, sessionToken, e: er, t: bikelock.rawValue]
- Network request: post, /device/v1/sesame2/deviceId

## 7. Obtaining Asynchronous Time【CHSesame2Device+Login】

- Method name: requestSyncTime
- Parameters: [st: sessionToken]
- Network request: post, device/v1/sesame2/deviceId/time

## 8. Uploading history【CHSesame2Device+History】

- Method name: postProcessHistory
- Parameters: [s: deviceId, v: historyData]
- Network request: post, /device/v1/sesame2/historys

## 9. Registering Sesame Touch Pro【CHSesameTouchPro+Register】

- Method name: register
- Parameters: [t: productType, pk: sesameToken]
- Network request: post, /device/v1/sesame5/deviceId

## 10.Registering Bike 2【CHSesameBike2Device+Register】
  
- Method name: register
- Parameters: [t: productType, pk: sesameToken]
- Network request: post, /device/v1/sesame5/deviceId

## 11.Registering Sesame 5【CHSesame5Device+Register】

- Method name: register
- Parameters: [t: productType, pk: sesameToken]
- Network request: post, /device/v1/sesame5/deviceId

## 12. Uploading history【CHSesame5Device+History】

- Method name: postProcessHistory
- Parameters: [s: deviceId, v: historyData, t:5]
- Network request: post, /device/v1/sesame2/historys```c
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
                    L.d("[ss5][history]Bluetooth", "History upload successful")
                    break
                case .failure(let error):
                    L.d("[ss5][history]Bluetooth", "History upload failed, server dropped history: \(error)")
                    break
                }
            }
    }

## 13、Create Guest Key createGuestKey【CHDevice】

- Method name: createGuestKey
- Parameters: [keyName: name]
- Network request post, /device/v1/sesame2/deviceId/guestkey

```c

    func createGuestKey(result: @escaping CHResult<String>) {
        let encoder = JSONEncoder()
        encoder.outputFormatting = .prettyPrinted
        let deviceKey = getKey() //returns CHDeviceKey
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

## 14、Verification is required before subscribing to IoT topics【CHDevice】

- Method name: iotCustomVerification
- Parameters: [a: getTimeSignature]
- Network request get, /device/v1/iot/sesame2/deviceId

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

## 15、Get Guest Keys【CHDevice】

- Method name: getGuestKeys
- Parameters: [a: getTimeSignature]
- Network request get, /device/v1/sesame2/deviceId/guestkeys

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

## 16、Update Guest Key【CHDevice】

- Method name: updateGuestKey
- Parameters: ["guestKeyId": guestKeyId, "keyName": name]
- Network request get, /device/v1/sesame2/deviceId/guestkeys

## 17、Remove Guest Key【CHDevice】

- Method name: removeGuestKey
- Parameters: [ "guestKeyId": guestKeyId, "randomTag": keyCheck[0...3]]
- Network request delete, /device/v1/sesame2/deviceId/guestkeys

```c
        CHAccountManager.shared.API(request: .init(.delete, "/device/v1/sesame2/\(deviceId.uuidString)/guestkey", [ "guestKeyId": guestKeyId, "randomTag": keyCheck[0...3].toHexString()])) { deleteResult in
            switch deleteResult {
            case .success(_):
                result(.success(.init(input: .init())))
            case .failure(let error):
                result(.failure(error))
            }
        }

## 18、Enable Push Notifications【CHDevice】

- Method name: enableNotification
- Parameters: ["token": token, "deviceId":deviceId, "name": name]
- Network request get, /device/v1/token

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
## 19、Check if push notifications are enabled【CHDevice】

- Method name: isNotificationEnabled
- Parameters: ["deviceId": deviceId, "deviceToken": token, "name": name]
- Network request get, /device/v1/token

## 20、Guest key calls signedToken【CHDevice】

// Gets session token and uploads to server to get a login token signed by secretKey

- Method name: signedToken
- Parameters: ["deviceId": deviceId., "token": token, "secretKey": keyData.secretKey]
- Network request post, /device/v1/sesame2/sign/

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

## 21、Disable Push Notifications【CHDeviceManager】

- Method name: disableNotification
- Parameters: ["token": token, "deviceId": deviceId, "name": name]
- Network request delete, /device/v1/token/

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
