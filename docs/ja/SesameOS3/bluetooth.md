---
title: 概観
---
# はじめに

- ブルートゥース通信のプログラミングは物理層にとても近く、物理世界に近いほど完璧な抽象プログラミングの概念から遠くなります。
  これらのブルートゥース命令を処理することは実際にとても煩雑で、SesameSDK と呼ばれるものは、これらの複雑な操作を優れた実装にし、開源ライブラリとして包装して利用しやすくしています。
- この一連のブルートゥースプロトコルは、CANDY HOUSE の三世代のエンジニアたちが 10 年以上（2014〜2016、2017〜2019、2020 年〜現在）の努力と知識を結集した結果であり、その無料でのオープンソース化は"安物買いの銭失い"ではなく、逆に、私たちが完璧だと思うこの作品が「生きた」ブルートゥースプロトコルとして、その中心思想を世界的に伝播し発展させることができることを願っています。
- ブルートゥースの操作には主に二つの部分が関わっています: ブルートゥース広告(BLE Advertising)とブルートゥースデータ伝送(BLE Data Transmission)。以下ではこれらについて詳しく説明します。

<hr>

## ブルートゥース広告（BLE Advertising）

<p align="left"><a href="https://docs.google.com/drawings/d/1ntw26Zpr8aQMhy19h0SP__Wemjn_1UFzR4I--jwEfSg/"><img src="https://raw.githubusercontent.com/CANDY-HOUSE/.github/main/profile/images/BLEadvertisingSesameOS3.svg" alt="BLEadvertisingSesameOS3" title="SesameOS3のブルートゥース広告"></a></p>

- Bluetooth LE 4.0 advertising の長さは最大でも 31 Bytes です。
- <span style="background-color: #fdea8e;color:#000000">黄色い背景</span>または<span style="background-color: #e4dc7f;color:#000000">黄色い背景</span>のマークは CANDY HOUSE が定義したプロトコルを示しています。<br>
- それ以外の白い背景部分はすべて Bluetooth SIG の規格に従った強制的な宣言である。

### Bluetooth SIG 公式 ID

- https://www.bluetooth.com/specifications/assigned-numbers/
- CANDY HOUSE が Bluetooth SIG に登録した公式の識別子：

|                  | 十進数 | 16 進数 |
| :--------------: | :----: | :-----: |
| BLE Service UUID | 64897  | 0xFD81  |
|    Company ID    |  1370  | 0x055A  |

### 機種 Product Model

- ブルートゥース広告の 8th 9th Bytes は機種を表しています

| 8th 9th Bytes |            機種            |
| :-----------: | :------------------------: |
|       0       |         Sesame 3         |
|       1       |      WiFi Module 2       |
|       2       |       Sesame Bot 1       |
|       3       |      Sesame Bike 1       |
|       4       |         Sesame 4         |
|       5       |         Sesame 5         |
|       6       |      Sesame Bike 2       |
|       7       |       Sesame 5 Pro       |
|       8       |      Open Sensor 1       |
|       9       |    Sesame Touch 1 Pro    |
|       10      |      Sesame Touch 1      |
|       11      |     BLE Connector 1      |
|       13      |          Hub 3           |
|       14      |          Remote          |
|       15      |       Remote Nano        |
|       16      |       Sesame 5 US        |
|       17      |       Sesame Bot 2       |
|       18      |    Sesame Face 1 Pro     |
|       19      |      Sesame Face 1       |
|       20      |         Sesame 6         |
|       21      |       Sesame 6 Pro       |
|       22      |   Sesame Face 1 Pro AI   |
|       23      |     Sesame Face 1 AI     |
|       24      |      Open Sensor 2       |
|       25      |      Sesame Touch 2      |
|       26      |    Sesame Touch 2 Pro    |
|       27      |      Sesame Face 2       |
|       28      |    Sesame Face 2 Pro     |
|       30      |     Sesame Face 2 AI     |
|       31      |   Sesame Face 2 Pro AI   |
|       32      | Sesame 6 Pro SlidingDoor |

### デバイスステータス Device Status

- ブルートゥースの広告内の 10 番目のバイトは 8 つのビットに分割され、各ビットはデバイスの各状態を表しています。
<table>
  <tbody>
    <tr>
      <td rowspan="2" style="text-align: center;">10番目のバイトの8ビット</td>
      <td colspan="2" style="text-align: center;">デバイスの状態</td>
    </tr>
    <tr>
      <td style="text-align: center;">0</td>
      <td style="text-align: center;">1</td>
    </tr>
    <tr>
      <td style="text-align: center;">1st bit</td>
      <td style="text-align: center;">登録されていません</td>
      <td style="text-align: center;">登録済み</td>
    </tr>
    <tr>
      <td style="text-align: center;">2nd bit</td>
      <td style="text-align: center;"></td>
      <td style="text-align: center;"></td>
    </tr>
    <tr>
      <td style="text-align: center;">3rd bit</td>
      <td style="text-align: center;"></td>
      <td style="text-align: center;"></td>
    </tr>
    <tr>
      <td style="text-align: center;">4th bit</td>
      <td style="text-align: center;"></td>
      <td style="text-align: center;"></td>
    </tr>
    <tr>
      <td style="text-align: center;">5th bit</td>
      <td style="text-align: center;"></td>
      <td style="text-align: center;"></td>
    </tr>
    <tr>
      <td style="text-align: center;">6th bit</td>
      <td style="text-align: center;"></td>
      <td style="text-align: center;"></td>
    </tr>
    <tr>
      <td style="text-align: center;">7th bit</td>
      <td style="text-align: center;"></td>
      <td style="text-align: center;"></td>
    </tr>
    <tr>
      <td style="text-align: center;">8th bit</td>
      <td style="text-align: center;"></td>
      <td style="text-align: center;"></td>
    </tr>
  </tbody>
</table>

#### Apple デバイスのアクセサリ設計ガイドラインを遵守する

- 49.2 Advertising Channels
  アクセサリは、各広告イベントで `すべての3つの広告チャンネル（37、38、39）`で広告を行うべきです。Bluetooth 4.0 の仕様書をご覧ください。Volumn 6, Part B, 節 4.4.2.1.
- https://developer.apple.com/accessories/Accessory-Design-Guidelines.pdf Release R21

#### Sesame BLE adv をよく知るために nRF Connect app を使うことをお勧めします

<p align="left"><a href="https://docs.google.com/drawings/d/1HXljFMZW53Rwn7eOhT03Sc2oP_C_Y6lPCpO2FyVkVmE/"><img src="https://raw.githubusercontent.com/CANDY-HOUSE/.github/main/profile/images/nrfConnect_Demo_SesameOS3_adv.svg" alt="nrfConnect_Demo_SesameOS3_adv.svg" title="nRF Connect appを使ってSesameOS3 advをよく知る"></a></p>

- Sesame BLE adv を評価し、理解するために、nRF Connect app を使用することをお勧めします。
- https://play.google.com/store/apps/details?id=no.nordicsemi.android.mcp
- https://apps.apple.com/app/id1054362403

<hr>

### ブルートゥースデータ伝送(BLE Data Transmission)

<p align="left"><a href="https://docs.google.com/presentation/d/1TwGJjAWVgVVkeVxlmVibuQFGrb2XYEdaUk1yMW0V6h4/edit#slide=id.g38d4ff6190_0_158"><img src="https://raw.githubusercontent.com/CANDY-HOUSE/.github/main/profile/uml/uml_output/communication_layer.png" alt="BLEcommunication4Layers.jpg" title="ブルートゥース通信の4つのレイヤー"></a></p>

- TCP/IP モデルから着想を得て、私たちはブルートゥース通信を 4 つのレイヤーに分けています。
- `平文で記述された任意の形式の情報`を`暗号化`し、`分割`して`Bluetooth GATTにより受信・送信`します。これら 4 つの状態はそれぞれ、  
   <u>Application Layer</u>、<u>Security Layer</u>、<u>Transport Layer</u>、<u>Gatt Bearer Layer</u>と呼ばれています。
- この情報の分割の方法により、無限の長さの任意の形式の情報を送信することができます。

### 伝送プロトコル：リクエスト、レスポンス、パブリッシュ（Request, Response and Publish）

![Sesame](https://raw.githubusercontent.com/CANDY-HOUSE/.github/main/profile/uml/uml_output/request_response_publish.png)

- RESTful API を用いてデータベースにデータを POST（追加、削除、参照、編集）することに着想を得て、私たちは `BLE write without response`に基づいて 1 つのコマンドメソッドを包括しました。<br><span style="background-color: #fdea8e;color:#000000">・リクエスト Request</span>
- RESTful API の async/sync に着想を得て、私たちは `BLE notify` を 2 つのコールバックメソッドに包括しました。<br><span style="background-color: #fdea8e;color:#000000">・レスポンス Response</span><br><span style="background-color: #fdea8e;color:#000000">・パブリッシュ Publish</span>
- `レスポンス`メソッドと <u>BLE write without 'レスポンス'</u> は同名ですが全く関係ありません。これにより混乱が生じることを私たちは深くお詫び申し上げます。
- すべての `リクエスト`にはすぐに一度 `レスポンス`が反応します。実行の結果を得るために実行時間が必要な情報は `パブリッシュ` で反応します。

### ブルートゥース情報の送受信には 2 つの BLE Characteristics だけが使用されます

- リクエスト、レスポンス、パブリッシュメソッドを使用してブルートゥース情報を送受信する際、Sesame BLE Service(0xFD81) の 2 つの BLE Characteristics だけが使用されます。
- UUID 1686000<b>2</b>-a5ae-9856-b6d3-dbb4c676993e の Characteristics は BLE commands を write without response するために使われます。
- UUID 1686000<b>3</b>-a5ae-9856-b6d3-dbb4c676993e の Characteristics は BLE Notify の受信に使われます。
<p align="left"><a href="https://docs.google.com/drawings/d/1E8PNgi7bTOfxj_APXK-yBPA2bjA4bNWQju8qv9Nx4SI/"><img src="https://raw.githubusercontent.com/CANDY-HOUSE/.github/main/profile/images/nrfConnect_Demo_Sesame_BLE_Characteristics.svg" alt="nrfConnect_Demo_Sesame_BLE_Characteristics.svg" title="nRF Connect appを使ってSesameOS3 BLE Characteristicsに慣れる"></a></p>

## アプリケーションレイヤーのビジネスコンテンツ

### 1. セサミ「登録」のアクティビティ図

![Sesame](https://raw.githubusercontent.com/CANDY-HOUSE/.github/main/profile/uml/uml_output/p01_register.png)

### 2. セサミ「登録」のシーケンス図

![Sesame](https://raw.githubusercontent.com/CANDY-HOUSE/.github/main/profile/uml/uml_output/p02_login.png)

### 3. セサミ「ログイン」のシーケンス図

![Sesame](https://raw.githubusercontent.com/CANDY-HOUSE/.github/main/profile/uml/uml_output/p09_login.png)

### 4. セサミ「コマンド送信」のシーケンス図

![Sesame](https://raw.githubusercontent.com/CANDY-HOUSE/.github/main/profile/uml/uml_output/p10_command.png)

### 5. スマホ向けの SesameSDK のステートマシン

![Sesame](https://raw.githubusercontent.com/CANDY-HOUSE/.github/main/profile/uml/uml_output/p08_statemechine.png)

### 6. セサミのタイムシーケンス図

![Sequence_diagram](https://raw.githubusercontent.com/CANDY-HOUSE/.github/main/profile/uml/uml_output/sequence_diagram.png)

## スマートフォンのブルートゥースとセサミとの 2 種類の通信方法

- 一つ目は <span style="background-color: #fdea8e;color:#000000">パブリッシュ Publish</span>で、セサミが主導してメッセージを携帯電話に送信します。
- 二つ目は <span style="background-color: #fdea8e;color:#000000">リクエスト Request</span>で、携帯電話がセサミに仕事を頼み、セサミが結果を<span style="background-color: #fdea8e;color:#000000">レスポンス Response</span>で応答します。

### 1. パブリッシュ【Sesame->スマートフォン】

NotifyEnable = `True` のときに有効となり、セサミが主導して設定したメッセージをスマートフォンに送信します。例えば、[「応答コマンド表」](#応答コマンド表) の `81_ギミックの状態`が挙げられます。

| バイトのインデックス |   0    |      1       |       2 \~ N       |
| :------------------: | :----: | :----------: | :----------------: |
|        データ        | タイプ | コマンド番号 | 携帯電話へのデータ |

### 2. リクエスト【スマートフォン->Sesame】およびレスポンス【Sesame->スマートフォン】

携帯電話からセサミにコマンドをリクエストし、セサミが確認やインタプリタの応答を行います。

| バイトのインデックス |   0    |      1       |        2 \~ N        |
| :------------------: | :----: | :----------: | :------------------: |
|        データ        | タイプ | コマンド番号 | 携帯電話からのデータ |

### 3. レスポンス【Sesame->スマートホン】

セサミがそのリクエストを受領したことを確認し、コールバック情報を発行します。

| バイトのインデックス |   0    |      1       |   2    |     3      |       4 \~ N       |
| :------------------: | :----: | :----------: | :----: | :--------: | :----------------: |
|        データ        | タイプ | コマンド番号 | フラグ | ステータス | 携帯電話へのデータ |

### コマンドインタプリタのフラグとステータス

インタプリタが成功のステータスである場合、フラグ=0x00, ステータス=0x00。

| バイトのインデックス |       データ       |        説明        |
| :------------------: | :----------------: | :----------------: |
|          0           |        0x02        |       タイプ       |
|          1           |    コマンド番号    |    コマンド番号    |
|          2           |        0x00        |       フラグ       |
|          3           |        0x00        |   成功ステータス   |
|        4 ~ N         | セサミからのデータ | セサミからのデータ |

インタプリタがエラーのステータスである場合、フラグ=0x80, ステータス=エラーコード。

| バイトのインデックス |       データ       |        説明        |
| :------------------: | :----------------: | :----------------: | ---- |
|          0           |        0x02        |       タイプ       |
|          1           |    コマンド番号    |    コマンド番号    |
|          2           |        0x80        |       フラグ       |
|          3           |    エラーコード    | 失敗用のステータス |
|        4 ~ N         | セサミからのデータ | セサミからのデータ | ```c |

typedef struct {
uint8_t type; /// プッシュタイプ：publish
uint8_t item_code; /// コマンドの item_code
union ss5_payload payload; /// モバイルに送信するデータ
} ss5_publish;

````

### 2. リクエスト【携帯端末->Sesame】

- `Request` は携帯が Sesame に処理を要請し、Sesame は受信状態を返答します。例えば「命令コード対照表」82_ロックのように。
- 混乱を避けるために、同期シリアル送信をサポートする順序付けられたキューが必要です。BLE は下位機として、特性値`Characteristics`を読み書きします。読み書きの操作はプロトコルの内容を送信する方法です。

| バイトインデックス |     0     |       1 ~ N        |
| :------: | :-------: | :----------------: |
|   データ   | item_code |      ペイロード       |
|   説明   | コマンド番号  |  Sesameに送信されるデータ |

```c

typedef struct {
    uint8_t item_code;              /// コマンド（item_codeに詳しい）
    union ss5_payload payload;      /// Sesame5に送信されるデータ
} ss5_request;

````

```c
typedef enum {
    ITEM_CODE_NONE = 0,
    ITEM_CODE_REGISTRATION = 1,
    ITEM_CODE_LOGIN = 2,
    ITEM_CODE_HISTORY = 4,
    ITEM_CODE_VERSION_DETAIL = 5,
    ITEM_CODE_TIME = 8,
    ITEM_CODE_AUTOLOCK = 11,
    ITEM_CODE_INITIAL = 14,
    ITEM_CODE_IRER = 15,
    ITEM_CODE_MAGNET = 17,
    ITEM_CODE_MECH_SETTING = 80,
    ITEM_CODE_MECH_STATUS = 81,
    ITEM_CODE_LOCK = 82,
    ITEM_CODE_UNLOCK = 83,

    SSM3_ITEM_RESET = 104
} item_code_e;
```

#### 2.1. レスポンス応答コマンドデータフォーマット

| バイトインデックス |       0        |      1       |        2         |          3 ～ N          |
| :----------------: | :------------: | :----------: | :--------------: | :----------------------: |
|       データ       |      type      |  item_code   |       res        |         payload          |
|        説明        | プッシュの種類 | コマンド番号 | コマンド処理状態 | モバイルに送信するデータ |

```c
typedef struct {
    uint8_t type;                   /// プッシュタイプ:Response
    uint8_t item_code;              /// コマンド(item_code)
    uint8_t res;                    /// コマンド処理状態 (常にsuccessを返す)
    union ss5_payload payload;      /// モバイルに送信するデータ
} ss5_response;

```

#### 結果 処理状態

```c
typedef enum {
    CMD_RESULT_SUCCESS = 0,         /// 手機からのコマンドに対してSesame5は常に成功を返す
    CMD_RESULT_INVALID_ACTION = 9,  /// 既に登録されているのに登録コマンドが下された
} cmd_result_e;
```

#### 2.2 タイプ プッシュの種類

`0x07`のマークは通常のレスポンス`response`、`0x08`はプッシュ`publish`を示します。

```c
typedef enum {
    OP_CODE_RESPONSE = 0x07,
    OP_CODE_PUBLISH = 0x08,
} op_code_e;
```

## リクエストコマンド一覧表

|                    バイトインデックス                     |      0       |                 1 ~ N                  |             N+              |
| :-------------------------------------------------------: | :----------: | :------------------------------------: | :-------------------------: |
|                          データ                           |  item_code   |                payload                 |       その他のデータ        |
|                           説明                            | コマンド番号 |        Sesame に送信するデータ         |       その他のデータ        |
|                 [登録](./1_registor.md)                  |      1       |           1-64【publicKeyA】           |     65-68【timestamp】      |
|                 [ログイン](./2_login.md)                 |      2       |             1-4【ccmkeyA】             |
|                  [履歴](./4_history.md)                  |      4       |              1【is peek】              |   ispeek=true 削除しない    |
|           [バージョン](./5_version_detail.md)            |      5       |                  none                  |
|                 [時間更新](./8_time.md)                  |      8       |            1-4【timestamp】            |
|              [自動ロック](./11_autolock.md)              |      11      |              1-2【秒数】               |
|                [角度調整](./17_megnet.md)                |      17      |                  none                  |
|             [機器設定](./80_mechsetting.md)              |      80      |        1-5【autolock+開閉角度】        |
|              [機器状態](./81_mechstatus.md)              |      81      |                  none                  |          No Response          |
|                  [ロック](./82_lock.md)                  |      82      |            1-7【履歴タグ】             |
|               [アンロック](./83_unlock.md)               |      83      |            1-7【履歴タグ】             |
|                [開ける](../../SesameOS3/90_doorOpen.md)                |      90      |                  none                  |
|               [閉じる](../../SesameOS3/91_doorClosed.md)               |      91      |                  none                  |
|          [自動ロック](../../SesameOS3/92_opsTimerSetting.md)           |      92      |                  none                  |
|                [リセット](./104_reset.md)                |     104      |                  none                  |
|       [Sesame 追加「touch」](./101_add_sesame.md)        |     101      |           1-16【デバイス名】           |     17-32【secretKey】      |
|      [Sesame 削除「touch」](./103_remove_sesame.md)      |     103      |           1-16【デバイス名】           |
|       [カード更新「touch」](./107_card_change.md)        |     107      | 0【カード ID 長】1-id_len【カード ID】 | CardIDLen+1【カード名長】等 |
|       [カード削除「touch」](./108_card_delete.md)        |     108      |           1-16【カード ID】            |
|      [カード取得「touch」](./113_card_mode_get.md)       |     113      |                  none                  |
|          [カードモード](./114_card_mode_set.md)          |     114      |                  none                  |
|     [フィンガープリント更新](./115_finger_change.md)     |     115      |            0【FingerIDLen】            |     1-Len【FingerID】】     |
|     [フィンガープリント削除](./116_finger_delete.md)     |     116      |             1【FingerID】              |
|      [フィンガープリント取得](./117_finger_get.md)       |     117      |                  none                  |
|   [フィンガープリントモード](./121_finger_mode_get.md)   |     121      |                  none                  |
| [フィンガープリントモード設定](./122_finger_mode_set.md) |     122      |                  none                  |
|           [パスワード更新](./123_pw_change.md)           |     123      |              0【PwIDlen】              |   1-pwLen【パスワード】】   |
|           [パスワード削除](./124_pw_delete.md)           |     124      |                  none                  |
|            [パスワード取得](./125_pw_get.md)             |     125      |                  none                  |
|       [パスワードモード取得](./129_pw_mode_get.md)       |     129      |                  none                  |
|       [パスワードモード設定](./130_pw_mode_set.md)       |     130      |           0 認証 1 新規記入            |

## 応答コマンド一覽表

|                     バイトインデックス                      |       0        |      1       |        2         |           3 ～ N           |             N+             |            N++             |
| :---------------------------------------------------------: | :------------: | :----------: | :--------------: | :------------------------: | :------------------------: | :------------------------: |
|                           データ                            |      type      |  item_code   |       res        |          payload           |          payload           |          payload           |
|                            説明                             | プッシュの種類 | コマンド番号 | コマンド処理状態 | モバイルに送信するデータ 1 | モバイルに送信するデータ 2 | モバイルに送信するデータ 3 |
|                  [初期化](./14_initial.md)                  |       8        |      14      |        0         |     0-3【random code】     |            none            |
|                  [登録](./1_registor.md)                   |       7        |      1       |        0         |     0-6【mechStatus】      |   7-12【mechSetting】】    |   13~76【publicKeyS】】    |
|                  [ログイン](./2_login.md)                  |       7        |      2       |        0         |      0-3【timestamp】      |
|                   [履歴](./4_history.md)                   |       7        |      4       |        0         |        0-3【id】】         |         4【type】          |      5-8【timestamp】      |
|            [バージョン](./5_version_detail.md)             |       7        |      5       |        0         |      0-11【version】       |
|              [機器設定](./80_mechsetting.md)               |       8        |      80      |        0         |        0-1【lock】         |      2-3【unlock】】       |   4-5【autolock_second】   |
|               [機器状態](./81_mechstatus.md)               |       8        |      81      |        0         |     0-3【random code】     |
|       [Sesame キーのプッシュ](../../SesameOS3/102_pub_ssm_key.md)        |       8        |     102      |        0         |     0-21【ssm0-name】      |     22【ssm0-status】      |    23-44【ssm1_name】等    |
|           [Sesame キーの取得](./109_card_get.md)           |       7        |     109      |        0         |       0-3【CardID】        |
|      [フィンガープリントの取得](./117_finger_get.md)       |       7        |     117      |        0         |      0-3【FingerID】       |
| [フィンガープリントモードの取得](./121_finger_mode_get.md) |       8        |     121      |        0         |     0-3【random code】     |

## セキュリティ層 Security Layer

セキュリティ層 Security Layer は 携帯の Bluetooth と Sesame5 間のデータパススルー実装の暗号化転送プロトコルです。

### 1. 4 バイトのランダムコード

Sesame デバイスの Bluetooth を探し、接続して特性値が`0xFD81`の`notify`を開くと、Sesame デバイスは主動的に`publish`送信し、4 バイトのランダムコード/セッショントークンを送信します。（詳細は`14_初期化`参照）

### 2. デバイスシークレット

登録時、アプリと Sesame5 は両方とも `secp256r1` を使用して `public key` と `private key` を生成し、共有して `Device secret` を生成します。

- `publicKey` : 64 バイト
- `privateKey` : 32 バイト

シークレット : 32 バイト

#### ステップ :

- 1. sesame5 は `secp256r1` を使用して `publicKeyS`と`privateKeyS` を生成する
- 2. アプリは `secp256r1` を使用することで `publicKeyA`と`privateKeyA` を生成する
- 3. 両方の `publicKey` を交換する
- 4. sesame5 は `privateKeyS`と`publicKeyA`を使用して `secret S`を生成する
- 5. アプリは `privateKeyA`と`publicKeyS`を使用して `secret A` を生成する
- 6. `secret S`は `secret A`と等しい
- 7. 両方のシークレットの上位 16 バイトをキーとして使用する`デバイスシークレット`。

#### トークンの使用

- 1. ログイン認証（詳細は：`2_ログイン`）
- 2. `aes_ccm`を使用してデータを暗号化する際、キーとしてトークンを使用。

#### 生成方法

`Device secret`を使用して、AES_CMAC アルゴリズムを使用して 4Bytes のランダムコードに署名すると、`Token`を生成できます。
`device_secret`：16 Bytes
`random_code`：4 Bytes
`Token`：16 Bytes

```c

AES_CMAC(key:device_secret, input:random_code, input_size:4, output:Token);

```

### 3. データの暗号化と復号化

#### 暗号化パラメータ：初期化ベクトル(`CCM_IV`)）

- 1.  count：8 バイト、起動時に 0 に初期化し、暗号化を行うたびに count が 1 増える
- 2.  nouse：1 バイト、デフォルト値は 0
- 3.  random_code：4 バイト、デバイスへの接続後に`random_code`を更新

```c

typedef struct {
    int64_t count;///8 byte
    uint8_t nouse;///1 byte = 0
    uint8_t random_code[4];///4 byte
} CCM_IV;

```

#### aes_ccm のパラメータ

入力：

- 1.  key：暗号キー、AES-CCM 操作に使用
- 2.  iv：初期化ベクトル(CCM_IV)
- 3.  iv length：AES-CCM は IV として 13 バイト（104 ビット）を使用
- 4.  add：追加認証データ
- 5.  add length：追加認証データの長さ
- 6.  input：暗号化する入力データ
- 7.  input length：暗号化するデータの長さ
- 8.  tag length：認証タグ（MAC）を保存するバッファとタグの長さ

出力:

- 1. tag：ccm_tag
- 2. output：ccm_ecrrypt_data d 暗号化したデータ

#### C 言語の暗号化例

```c
aes_ccm_encrypt_and_tag(
                        key:ccm_key,
                        iv:CCM_IV,
                        iv_length:13,
                        add:0x00,
                        add_length:1,
                        input:p_data,
                        add_length:length,
                        output:ccm_ecrrypt_data,
                        tag:ccm_tag,
                        tag_length:4
                        );
CCM_IV.count ++;
```

AES は対称暗号化アルゴリズムであり、その方法名は`aes_ccm_auth_decrypt`で、パラメータは暗号化と対応しています。

#### C 言語の復号化例

```c
aes_ccm_auth_decrypt(
                    key:ccm_key,
                    iv:CCM_IV,
                    iv_length:13,
                    add:0x00,
                    add_length:1,
                    input:ccm_ecrrypt_data,
                    add_length:length,
                    output:ans_data,
                    tag:ccm_tag, tag_length:4
                    );
CCM_IV.count ++;
```

::: info 注意
データの暗号化と復号化で使用する CCM_IV には、暗号化の回数を記録する count が含まれています。暗号化と復号化のエンドで count が一致しないと、復号化が失敗します。
:::

## セグメントレイヤ

セグメントレイヤは 2 つの作業をします。

- 1. Sesame5 とスマホの通信時、パケットの最大長は 20Bytes に制限されており、長いメッセージを送るにはデータを分割し、受信端では再組み立てる必要があります。
- 2. 送信データが暗号化されているかどうかを示すマーク、3 種類の長さの平文暗号文パケットの方式を示す。

### 1. マークの対照表

セグメントレイヤはパケットヘッダの中のマークでこのパケットが分割されているか暗号化されているかを示し、受信端はこのマークに従って対応する処理を行い、パケットを元のデータに復元します。以下はセグメントレイヤのマークの対照表です。

セグメントレイヤのマークは 8 ビットあり、うちビット 7 ~ 1 は終了パケットであるかデータが暗号化されているかを示し、ビット 0 はそのパケットが一つのデータの開始パケットであるかを示します。

| ビット 7 ~ 1 |    終了    | ビット |     開始     |
| :----------: | :--------: | :----: | :----------: |
|   b0000000   | 終了しない |   0    | 開始ではない |
|   b0000000   | 終了しない |   1    |     開始     |
|   b0000001   |  平文終了  |   0    | 開始ではない |
|   b0000001   |  平文終了  |   1    |     開始     |
|   b0000010   | 暗号化終了 |   0    | 開始ではない |
|   b0000010   | 暗号化終了 |   1    |     開始     |

#### 16 進数表示でのマーキング

0 はそのパケットが開始パケットでも終了パケットでもないことを示す

1 はそのパケットが終了パケットではない開始パケットであることを示す

2 はそのパケットが開始パケットではなく、終了パケットであり、組み合わせたデータが平文であることを示す

3 はそのパケットが開始パケットであり終了パケットであることを示す。そしてそのデータは平文であり、データは分割されておらず、組み合わせる必要はありません。

4 はそのパケットが開始パケットではないが、終了パケットであり、組み合わせたデータが暗号文であることを示す

5 はそのパケットが開始パケットであり終了パケットであることを示す。そしてそのデータは暗号文であり、データは分割されておらず、組み合わせる必要はありません。

| マーク |     開始     |    終了    |
| :----: | :----------: | :--------: |
|  0x00  | 開始ではない | 終了しない |
|  0x01  |     開始     | 終了しない |
|  0x02  | 開始ではない |  平文終了  |
|  0x03  |     開始     |  平文終了  |
|  0x04  | 開始ではない | 暗号化終了 |
|  0x05  |     開始     | 暗号化終了 |

#### 例

あるパケットが 4 バイトのデータを格納でき、4 バイトを超えると分割が必要であるとします(実際は 20 バイトです)。

### 2. 3 種類の長さの平文暗号パケットの方式

#### 2.1 短い平文パケット

データ: A A B B

送信：

    1. データを受け取る : A A B B
    2. データ : A A B B
    3. パケットヘッダを付加 : 3 A A B B

受信：

    4. 受け取る : 3 A A B B
    5. パケットヘッダを除去し、元のデータを復元 : A A B B

#### 2.2 中程度の長さの平文パケット

データ: A A A A B B B B

送信:

    1. データを受け取る : A A A A B B B B
    2. データを分割 : A A A A
    3. パケットヘッダを付加 : 1 A A A A
    4. データを分割 : B B B B
    5. パケットヘッダを付加 : 2 B B B B

受信:

    6. 受け取る : 1 A A A A
    7. データがまだ終わっていないと判断し、次のパケットを待つ
    8. 受け取る : 2 B B B B
    9. データの受信が完了し、パケットを組み合わせる
    10. パケットヘッダを除去し、元のデータを復元 : A A A A B B B B

#### 2.3 長い平文パケット

データ: A A A A B B B B C C C C

送信:

    1. データを受け取る: A A A A B B B B C C C C
    2. データを分割: A A A A
    3. パケットヘッダを付加: 1 A A A A
    4. データを分割: B B B B
    5. パケットヘッダを付加: 0 B B B B
    6. データを分割: C C C C
    7. パケットヘッダを付加: 2 C C C C

受信:

    8. 受け取る: 1 A A A A
    9. データがまだ終わっていないと判断し、次のパケットを待つ
    10. 受け取る: 0 B B B B
    11. データがまだ終わっていないと判断し、次のパケットを待つ
    12. 受け取る: 2 C C C C
    13. データの受信が完了し、パケットを組み合わせる
    14. パケットヘッダを除去し、元のデータを復元 : A A A A B B B B C C C C

#### 2.4 短い暗号パケット

データ: A A B B

暗号化後のデータ: X X Y Y

送信:

    1. データを受け取る: A A B B
    2. データを暗号化: X X Y Y
    3. パケットヘッダを付加: 5 X X Y Y

受信:

    4. 受け取る: 5 X X Y Y
    5. パケットヘッダを除去し、元のデータを復元: X X Y Y
    6. 復号化: A A B B

#### 2.5 中程度の長さの暗号パケット

データ: A A A A B B B B

暗号化後のデータ: X X X X Y Y Y Y

送信:

    1. データを受け取る: A A A A B B B B
    2. データを暗号化: X X X X Y Y Y Y
    3. データを分割: X X X X
    4. パケットヘッダを付加: 1 X X X X
    5. データを分割: Y Y Y Y
    6. パケットヘッダを付加: 4 Y Y Y Y

受信:

    7. 受け取る: 1 X X X X
    8. データがまだ終わっていないと判断し、次のパケットを待つ
    9. 受け取る: 4 Y Y Y Y
    10. データの受信が完了し、パケットを組み合わせる
    11. パケットヘッダを除去し、元のデータを復元: X X X X Y Y Y Y
    12. データを復号化: A A A A B B B B

#### 2.6 長い暗号パケット

データ: A A A A B B B B C C C C

暗号化後のデータ: X X X X Y Y Y Y Z Z Z Z

送信:

    1. データを受け取る: A A A A B B B B C C C C
    2. データを暗号化: X X X X Y Y Y Y Z Z Z Z
    3. データを分割: X X X X
    4. パケットヘッダを付加: 1 X X X X
    5. データを分割: Y Y Y Y
    6. パケットヘッダを付加: 0 Y Y Y Y
    7. データを分割: Z Z Z Z
    8. パケットヘッダを付加: 4 Z Z Z Z

受信:

    9. 受け取る: 1 X X X X
    10. データがまだ終わっていないと判断し、次のパケットを待つ
    11. 受け取る: 0 Y Y Y Y
    12. データがまだ終わっていないと判断し、次のパケットを待つ
    13. 受け取る: 4 Z Z Z Z
    14. データの受信が完了し、パケットを組み合わせる
    15. パケットヘッダを除去し、元のデータを復元: X X X X Y Y Y Y Z Z Z Z
    16. データを復号化: A A A A B B B B C C C C

::: info 注意
データは AES_CCM で暗号化されると、暗号文だけでなく、復号化に使用する 4 バイトの ccm_tag も生成されます。暗号文と ccm_tag は双方とも受信端に送信する必要があり、そのため暗号化後のデータは 4 バイト増加します。詳細は `security_Layer` をご覧ください。
:::
