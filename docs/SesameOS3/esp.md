---
title: ESP32
---
# ESP32 SesameSDK

## 下載 项目代碼

- ESP32 on <img src="https://img.shields.io/badge/Github-000000?logo=Github&logoColor=white"/> [https://github.com/CANDY-HOUSE/SesameOS3_esp32c3/](https://github.com/CANDY-HOUSE/SesameOS3_esp32c3)

### 平台安装要求

- <img src="https://img.shields.io/badge/windows-10.0-FA7343" />
- <img src="https://img.shields.io/badge/Bluetooth-4.0LE +-0082FC" />
- <img src="https://img.shields.io/badge/ESP 32+-000000" />
- <img src="https://img.shields.io/badge/macOS-10.15 +-000000" />
- <img src="https://img.shields.io/badge/IoT SDK +-000000" />
- <img src="https://img.shields.io/badge/nRF Connect SDK +-1575F9" />

#### ESP32-C3-DevKitM-1 與 Sesame5 開關控制範例

這個專案展示了如何使用 ESP32-C3-DevKitM-1 微控制器來註冊和控制 Sesame5 智能鎖。本範例使用 ESP-IDF 開發框架，透過 BLE 技術自動尋找、連接並註冊附近的 Sesame5 設備。當 ESP32-C3-DevKitM-1 偵測到 Sesame5 達到開鎖位置時，會發出指令自動上鎖。

### 安裝與環境設定

1. 請確保您已經通過 ESP-IDF 的 `install.sh` 安裝了工具鏈。
2. 開啟終端機，導航到 ESP-IDF 的路徑，並執行 `export.sh` 加入環境變數。
3. 將 ESP32-C3-DevKitM-1 透過 USB 連接到您的電腦。
4. 回到專案資料夾，運行 `idf.py flash` 進行編譯和燒錄。

使用方法：燒錄並重啟 ESP32-C3-DevKitM-1 後，它會自動搜尋附近的未註冊的 Sesame 設備。在連接並註冊後，ESP32-C3-DevKitM-1 會監聽 Sesame5 的狀態，並在適當的時機發送上鎖指令。

### 1、搜尋附近的藍牙設備並連接

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

### 2、註冊藍芽設備

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

### 3、監聽藍牙設備狀態

```c

static void ssm_action_handle(sesame * ssm) {
    ESP_LOGI(TAG, "[ssm_action_handle][ssm status: %s]", SSM_STATUS_STR(ssm->device_status));
    if (ssm->device_status == SSM_UNLOCKED) {
        ssm_lock(NULL, 0);
    }
}

```

### 4. 關鎖和開鎖範例

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

### 5. 特色與功能

- **自動設備探索**：自動搜尋和連接附近的 Sesame5 智能鎖。
- **自動上鎖**：當 Sesame5 達到預設開鎖位置時，ESP32-C3-DevKitM-1 會發出上鎖指令。

#### 原始碼參考

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

### 6. 通讯協議

各指令互動細節詳見 `BlueTooth協議` 說明。

- 查看詳细:[BlueTooth 協議](./bluetooth.md)

### 7. 藍牙狀態機

![State Machine](https://raw.githubusercontent.com/CANDY-HOUSE/.github/main/profile/uml/uml_output/p08_statemechine.png)

### 8. 額外資源

- 請訪問 [CANDY HOUSE 官方網站](https://jp.candyhouse.co/) 了解更多關於 Sesame5 智能鎖的信息。

## 許可證

本專案採用 MIT 許可證。詳情請參見 `LICENSE` 文件。
