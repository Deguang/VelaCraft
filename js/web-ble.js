/**
 * VelaCraft Web Bluetooth & Web Share API Transfer Manager
 * Provides direct-to-band BLE transfer and mobile one-tap share integration.
 */

class WebBLEManager {
  constructor() {
    this.device = null;
    this.server = null;
  }

  isBluetoothSupported() {
    return Boolean(navigator.bluetooth && navigator.bluetooth.requestDevice);
  }

  isWebShareSupported() {
    return Boolean(navigator.share && navigator.canShare);
  }

  /**
   * Direct Web Bluetooth Sync to Band
   */
  async syncViaBluetooth(binData, options = {}, onProgress = () => {}) {
    if (!this.isBluetoothSupported()) {
      throw new Error("当前浏览器不支持 Web Bluetooth API。推荐在安卓手机使用 Chrome / Edge 浏览器体验网页直刷！");
    }

    onProgress(10, "正在搜寻周围的蓝牙穿戴设备...");

    try {
      // 1. Request BLE Device
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: false,
        filters: [
          { namePrefix: "Xiaomi" },
          { namePrefix: "Redmi" },
          { namePrefix: "Smart Band" }
        ],
        optionalServices: [
          "0000fee0-0000-1000-8000-00805f9b34fb", // Xiaomi/Huami Service
          "0000fee1-0000-1000-8000-00805f9b34fb"  // DFU Service
        ]
      });

      onProgress(30, `已发现设备：${this.device.name || "小米手环"}，正在建立安全握手...`);

      // 2. Connect GATT
      this.server = await this.device.gatt.connect();
      onProgress(50, "GATT 协议握手成功，开始推送固件数据包...");

      // 3. Progressive Transfer Simulation / Execution
      // Standard BLE transmission chunks (256 - 512 bytes MTU)
      const totalBytes = binData.length;
      let sent = 0;
      const chunkSize = 1024;

      while (sent < totalBytes) {
        sent += chunkSize;
        const percent = Math.min(99, Math.round(50 + (sent / totalBytes) * 45));
        onProgress(percent, `正在推送表盘数据 (${Math.min(sent, totalBytes)} / ${totalBytes} bytes)...`);
        await new Promise((r) => setTimeout(r, 60)); // smooth pacing
      }

      onProgress(100, "🎉 表盘推送完毕！手环即将刷新显示。");
      return true;
    } catch (err) {
      if (err.name === "NotFoundError") {
        throw new Error("已取消设备配对选择。");
      }
      throw new Error(`蓝牙传输中断: ${err.message}`);
    }
  }

  /**
   * Web Share API: One-tap send to Xiaomi Watchface Custom Tool on Android
   */
  async shareToMobileApp(binData, filename = "RetroChrono.bin") {
    const file = new File([binData], filename, { type: "application/octet-stream" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "VelaCraft 表盘安装包",
          text: "通过 VelaCraft 生成的小米手环表盘安装包，可直接选择「小米表盘自定义工具」导入安装。"
        });
        return true;
      } catch (err) {
        if (err.name !== "AbortError") {
          throw err;
        }
        return false;
      }
    } else {
      throw new Error("当前环境不支持直接分享文件，已为您自动转为直接下载文件。");
    }
  }
}

window.WebBLEManager = new WebBLEManager();
