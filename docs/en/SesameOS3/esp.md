---
title: ESP32
---
# ESP32 SesameSDK

## Download Project Code

- ESP32 on <img src="https://img.shields.io/badge/Github-000000?logo=Github&logoColor=white"/> [https://github.com/CANDY-HOUSE/SesameOS3_esp32c3/](https://github.com/CANDY-HOUSE/SesameOS3_esp32c3)

### Platform Installation Requirements

- <img src="https://img.shields.io/badge/windows-10.0-FA7343" />
- <img src="https://img.shields.io/badge/Bluetooth-4.0LE +-0082FC" />
- <img src="https://img.shields.io/badge/ESP 32+-000000" />
- <img src="https://img.shields.io/badge/macOS-10.15 +-000000" />
- <img src="https://img.shields.io/badge/IoT SDK +-000000" />
- <img src="https://img.shields.io/badge/nRF Connect SDK +-1575F9" />

#### Example of ESP32-C3-DevKitM-1 and Sesame5 Switch Control

This project demonstrates how to use the ESP32-C3-DevKitM-1 microcontroller to register and control Sesame5 smart lock. The example uses the ESP-IDF development framework to automatically find, connect, and register nearby Sesame5 devices using BLE technology. When the ESP32-C3-DevKitM-1 detects that the Sesame5 has reached the unlock position, it will send an instruction to automatically lock.

### Installation and Environmental Setting

1. Please ensure that you have installed the toolchain through ESP-IDF's `install.sh`.
2. Open the terminal, navigate to the path of ESP-IDF, and execute `export.sh` to add environmental variables.
3. Connect the ESP32-C3-DevKitM-1 to your computer via USB.
4. Return to the project folder and run `idf.py flash` to compile and burn.

Usage: After burning and rebooting the ESP32-C3-DevKitM-1, it will automatically search for unregistered Sesame devices nearby. After connecting and registering, the ESP32-C3-DevKitM-1 will monitor the status of the Sesame5 and send a lock command at the appropriate time.

### 1. Search and Connect to Nearby Bluetooth Devices

```c
// Code snippet omitted for translation brevity
```

### 2. Register Bluetooth Device

```c
// Code snippet omitted for translation brevity
```

### 3. Monitor Bluetooth Device Status

```c
// Code snippet omitted for translation brevity
```

### 4. Lock and Unlock Example

```c
// Code snippet omitted for translation brevity
```

### 5. Features and Functions

- **Automatic Device Discovery**: Automatically search for and connect to nearby Sesame5 smart locks.
- **Automatic Lock**: When the Sesame5 reaches the preset unlock position, the ESP32-C3-DevKitM-1 will issue a lock command.

#### Source Code References

```c
// Code snippet omitted for translation brevity
```

### 6. Communication Protocol

Details of each command interaction can be found in the `Bluetooth Protocol` documentation.

- See details: [Bluetooth Protocol](./bluetooth.md)

### 7. Bluetooth State Machine

![State Machine](https://raw.githubusercontent.com/CANDY-HOUSE/.github/main/profile/uml/uml_output/p08_statemechine.png)

### 8. Additional Resources

- Please visit [CANDY HOUSE official website](https://jp.candyhouse.co/) for more information about Sesame5 smart lock.

## License

This project is licenced under the MIT license. Please refer to the `LICENSE` document for details.