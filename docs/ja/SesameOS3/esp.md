---
title: ESP32
---
# ESP32 SesameSDK

## プロジェクトコードのダウンロード

- ESP32 on <img src="https://img.shields.io/badge/Github-000000?logo=Github&logoColor=white"/> [https://github.com/CANDY-HOUSE/SesameOS3_esp32c3/](https://github.com/CANDY-HOUSE/SesameOS3_esp32c3)

### プラットフォームのインストール要件

- <img src="https://img.shields.io/badge/windows-10.0-FA7343" />
- <img src="https://img.shields.io/badge/Bluetooth-4.0LE +-0082FC" />
- <img src="https://img.shields.io/badge/ESP 32+-000000" />
- <img src="https://img.shields.io/badge/macOS-10.15 +-000000" />
- <img src="https://img.shields.io/badge/IoT SDK +-000000" />
- <img src="https://img.shields.io/badge/nRF Connect SDK +-1575F9" />

#### ESP32-C3-DevKitM-1 と Sesame5 スイッチ制御の例

このプロジェクトでは、ESP32-C3-DevKitM-1 マイクロコントローラを使用して、Sesame5 スマートロックを登録および制御する方法を示しています。この例では、ESP-IDF 開発フレームワークを使用し、BLE テクノロジーを通じて近くの Sesame5 デバイスを自動的に検出、接続、登録します。ESP32-C3-DevKitM-1 が Sesame5 が開錠位置に達したことを検出すると、自動ロック命令が発行されます。

### インストールと環境設定

1. ESP-IDF の `install.sh` を使用してツールチェーンをインストールしたことを確認してください。
2. テルミナルを開き、ESP-IDF のパスに移動し、環境変数を追加するために `export.sh` を実行します。
3. ESP32-C3-DevKitM-1 を USB 経由でコンピュータに接続します。
4. プロジェクトフォルダーに戻り、`idf.py flash` を実行してコンパイルと書き込みを行います。

使い方：ESP32-C3-DevKitM-1 をフラッシュして再起動した後、未登録の Sesame デバイスを自動的に検索します。接続と登録が完了すると、ESP32-C3-DevKitM-1 は Sesame5 の状態を監視し、適切なタイミングでロックコマンドを送信します。

### 1. 近くの Bluetooth デバイスを検索して接続する

```c

static void ssm_scan_connect(const struct ble_hs_adv_fields * fields, void * disc) {
    ble_addr_t * addr = &((struct ble_gap_disc_desc *) disc)->addr;
    if (((struct ble_gap_disc_desc *) disc)->rssi < -60) { // RSSI threshold
        return;
    }
    if (fields->mfg_data[0] == 0x5A && fields->mfg_data[1] == 0x05) { // is SSM
        if (fields->mfg_data[4] == 0x00) {                            // unregistered SSM
            ESP_LOGW(TAG, "find unregistered SSM[%d]", fields->mfg_data[2]);
            if (p_ssms_env->ssm.device_status == SSM_NOUSE) {
                memcpy(p_ssms_env->ssm.addr, addr->val, 6);
                p_ssms_env->ssm.device_status = SSM_DISCONNECTED;
                p_ssms_env->ssm.conn_id = 0xFF;
            }
        } else { // registered SSM
            ESP_LOGI(TAG, "find registered SSM[%d]", fields->mfg_data[2]);
            return;
        }
    } else {
        return; // not SSM
    }
    ble_gap_disc_cancel(); // stop scan
    ESP_LOGW(TAG, "Connect SSM addr=%s addrType=%d", addr_str(addr->val), addr->type);
    int rc = ble_gap_connect(BLE_OWN_ADDR_PUBLIC, addr, 30000, NULL, ble_gap_connect_event, NULL);
    if (rc != 0) {
        ESP_LOGE(TAG, "Error: Failed to connect to device; rc=%d\n", rc);
        return;
    }
}

```

### 2、Bluetooth デバイスの登録

```c

void send_reg_cmd_to_ssm(sesame * ssm) {
    ESP_LOGW(TAG, "[esp32->ssm][register]");
    uECC_set_rng(crypto_backend_micro_ecc_rng_callback);
    uint8_t ecc_public_esp32[64];
    uECC_make_key_lit(ecc_public_esp32, ecc_private_esp32, uECC_secp256r1());
    ssm->c_offset = sizeof(ecc_public_esp32) + 1;
    ssm->b_buf[0] = SSM_ITEM_CODE_REGISTRATION;
    memcpy(ssm->b_buf + 1, ecc_public_esp32, sizeof(ecc_public_esp32));
    talk_to_ssm(ssm, SSM_SEG_PARSING_TYPE_PLAINTEXT);
}

void handle_reg_data_from_ssm(sesame * ssm) {
    ESP_LOGW(TAG, "[esp32<-ssm][register]");
    memcpy(ssm->public_key, &ssm->b_buf[13], 64);
    uint8_t ecdh_secret_ssm[32];
    uECC_shared_secret_lit(ssm->public_key, ecc_private_esp32, ecdh_secret_ssm, uECC_secp256r1());
    memcpy(ssm->device_secret, ecdh_secret_ssm, 16);
    // ESP_LOG_BUFFER_HEX("deviceSecret", ssm->device_secret, 16);
    AES_CMAC(ssm->device_secret, (const unsigned char *) ssm->cipher.decrypt.random_code, 4, ssm->cipher.token);
    ssm->device_status = SSM_LOGGIN;
    p_ssms_env->ssm_cb__(ssm); // callback: ssm_action_handle() in main.c
}

```

### 3、Bluetooth デバイスの状態の監視

```c

static void ssm_action_handle(sesame * ssm) {
    ESP_LOGI(TAG, "[ssm_action_handle][ssm status: %s]", SSM_STATUS_STR(ssm->device_status));
    if (ssm->device_status == SSM_UNLOCKED) {
        ssm_lock(NULL, 0);
    }
}

```

### 4. 閉鎖と開鎖の例

```c

void ss5_lock(sesame *ss5, uint8_t *tag, uint8_t tag_lg) {
    ss5->c_offset = tag_lg+2;
    ss5->b_buf[0] = SSM2_ITEM_CODE_LOCK;
    ss5->b_buf[1] = tag_lg;
    memcpy(ss5->b_buf + 2, tag, tag_lg);
    talk_to_ssm(ss5, SSM2_SEG_PARSING_TYPE_CIPHERTEXT);
}

void ss5_unlock(sesame *ss5, uint8_t *tag, uint8_t tag_lg) {
    ss5->c_offset = tag_lg+2;
    ss5->b_buf[0] = SSM2_ITEM_CODE_UNLOCK;
    ss5->b_buf[1] = tag_lg;
    memcpy(ss5->b_buf + 2, tag, tag_lg);
    talk_to_ssm(ss5, SSM2_SEG_PARSING_TYPE_CIPHERTEXT);
}

```

### 5. 特長と機能

- **自動的なデバイス検出**：近くの Sesame5 スマートロックを自動的に検索して接続します。
- **自動ロック**：Sesame5が所定の解錠位置に達すると、ESP32-C3-DevKitM-1 からロック指令が発行されます。

#### ソースコードリファレンス

```c

typedef enum {
    SESAME_5 = 5,
    SESAME_BIKE_2 = 6,
    SESAME_5_PRO = 7,
} candy_product_type;

typedef enum {
    SSM_NOUSE = 0,
    SSM_DISCONNECTED = 1,
    SSM_SCANNING = 2,
    SSM_CONNECTING = 3,
    SSM_CONNECTED = 4,
    SSM_LOGGIN = 5,
    SSM_LOCKED = 6,
    SSM_UNLOCKED = 7,
    SSM_MOVED = 8,
} device_status_t;

typedef enum {
    SSM_OP_CODE_RESPONSE = 0x07,
    SSM_OP_CODE_PUBLISH = 0x08,
} ssm_op_code_e;

typedef enum {
    SSM_ITEM_CODE_NONE = 0,
    SSM_ITEM_CODE_REGISTRATION = 1,
    SSM_ITEM_CODE_LOGIN = 2,
    SSM_ITEM_CODE_USER = 3,
    SSM_ITEM_CODE_HISTORY = 4,
    SSM_ITEM_CODE_VERSION_DETAIL = 5,
    SSM_ITEM_CODE_DISCONNECT_REBOOT_NOW = 6,
    SSM_ITEM_CODE_ENABLE_DFU = 7,
    SSM_ITEM_CODE_TIME = 8,
    SSM_ITEM_CODE_INITIAL = 14,
    SSM_ITEM_CODE_MAGNET = 17,
    SSM_ITEM_CODE_MECH_SETTING = 80,
    SSM_ITEM_CODE_MECH_STATUS = 81,
    SSM_ITEM_CODE_LOCK = 82,
    SSM_ITEM_CODE_UNLOCK = 83,
    SSM2_ITEM_OPS_TIMER_SETTING = 92,
} ssm_item_code_e;

```

### 6. 通信プロトコル

各命令の相互作用の詳細は、`Bluetoothプロトコル` の説明をご覧ください。

- 詳細を見る:[Bluetooth プロトコル](./bluetooth.md)

### 7. Bluetooth ステートマシン

![State Machine](https://raw.githubusercontent.com/CANDY-HOUSE/.github/main/profile/uml/uml_output/p08_statemechine.png)

### 8. 追加リソース

- Sesame5 スマートロックに関する詳細情報は、[CANDY HOUSE 公式ウェブサイト](https://jp.candyhouse.co/) をご覧ください。

## ライセンス

このプロジェクトは MIT ライセンスです。詳細は `LICENSE` ファイルをご覧ください。