---
nav: 例示
group: SESAME API
type:
  title: Bluetooth
  order: 0
title: 14_initial (初期化)
order: 14
---

# 14 初期化

携帯電話と Sesame5 が接続を確立し、通知を開くと、Sesame5 は 4 バイトのランダムコードを返します。

## シーケンス図

<p align="left" >
  <img src="./src/init/init循序圖.png" alt="" title="">
</p>

## ssm5 の返信内容

| バイト |        N ~ 2         |      1       |       0        |
| ------ | :------------------: | :----------: | :------------: |
| データ |       payload        |  item_code   |      type      |
| 説明   | 携帯電話に送るデータ | コマンド番号 | プッシュタイプ |

type : SSM2_OP_CODE_PUBLISH (0x08)

item code : SSM2_ITEM_CODE_INITIAL (14)

### payload

| バイト |          3 ~ 0           |
| ------ | :----------------------: |
| データ | 4 バイトのランダムコード |

## iOS、Android、ESP32 例
 ## Android 例

```java
    override fun onGattSesamePublish(receivePayload: SSM3PublishPayload) {
        if (receivePayload.cmdItCode == SesameItemCode.initial.value) {
            mSesameToken = receivePayload.payload
            L.d("hcia", "isNeedAuthFromServer:" + isNeedAuthFromServer)
            if (isRegistered) {
                if (isNeedAuthFromServer == true) {
                    CHAccountManager.signGuestKey(CHRemoveSignKeyRequest(deviceId.toString().uppercase(), mSesameToken.toHexString(), sesame2KeyData!!.secretKey)) {
                        it.onSuccess {
                            (this as CHDeviceUtil).login(it.data)
                        }
                    }
                } else {
                    (this as CHDeviceUtil).login()
                }
            } else {
                deviceStatus = CHDeviceStatus.ReadyToRegister
            }
        }
    }

```

## iOS 例

```jsx | pure
    func onGattSesamePublish(_ payload: SesameOS3PublishPayload) {
        let itemCode = payload.itemCode
//        L.d("[註冊]itemCode=>",itemCode.rawValue)
        let data = payload.payload
        if(itemCode == .initalization){
            self.mSesameToken = data
            if self.isRegistered {
                if isGuestKey {
                    (self as! CHDevice).sign(token: mSesameToken!.toHexString()) { signResult in
                        if case let .success(signedToken) = signResult {
                            (self as! CHDeviceUtil).login(token: signedToken.data)
                        }
                    }
                } else if deviceStatus == .waitingGatt() {
                    (self as! CHDeviceUtil).login(token: nil)
                }
            } else {
                deviceStatus = .readyToRegister()
            }
        }
    }
```

## ESP 例

```jsx | pure
static void ssm_initial_handle(sesame * ssm, uint8_t cmd_it_code) {
    ssm->cipher.encrypt.nouse = 0; // reset cipher
    ssm->cipher.decrypt.nouse = 0;
    memcpy(ssm->cipher.encrypt.random_code, ssm->b_buf, 4);
    memcpy(ssm->cipher.decrypt.random_code, ssm->b_buf, 4);
    ssm->cipher.encrypt.count = 0;
    ssm->cipher.decrypt.count = 0;

    if (p_ssms_env->ssm.device_secret[0] == 0) {
        ESP_LOGI(TAG, "[ssm][no device_secret]");
        send_reg_cmd_to_ssm(ssm);
        return;
    }
    send_login_cmd_to_ssm(ssm);
}
``` 
