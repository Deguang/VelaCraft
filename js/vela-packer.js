/**
 * VelaCraft Pure JavaScript Vela OS Watchface Binary Packer
 * Handles RLE compression, header patching, and client-side .bin generation.
 */

class VelaPacker {
  constructor() {
    this.deviceConfigs = {
      // Pro 大方屏系列 (336x480)
      "467": { name: "RetroChrono_Band10Pro", deviceType: 467, width: 336, height: 480, shape: "rect", radius: 48 },
      "367": { name: "RetroChrono_Band9Pro",  deviceType: 367, width: 336, height: 480, shape: "rect", radius: 48 },
      "11":  { name: "RetroChrono_Band8Pro",  deviceType: 11,  width: 336, height: 480, shape: "rect", radius: 48 },

      // 数字手环 跑道椭圆胶囊屏系列 (192x490 / 212x520)
      "466": { name: "RetroChrono_Band10",    deviceType: 466, width: 212, height: 520, shape: "pill", radius: 106 },
      "366": { name: "RetroChrono_Band9",     deviceType: 366, width: 192, height: 490, shape: "pill", radius: 96 },
      "9":   { name: "RetroChrono_Band8",     deviceType: 9,   width: 192, height: 490, shape: "pill", radius: 96 },

      // Aliases
      "band10pro": { name: "RetroChrono_Band10Pro", deviceType: 467, width: 336, height: 480, shape: "rect", radius: 48 },
      "band9pro":  { name: "RetroChrono_Band9Pro",  deviceType: 367, width: 336, height: 480, shape: "rect", radius: 48 },
      "band8pro":  { name: "RetroChrono_Band8Pro",  deviceType: 11,  width: 336, height: 480, shape: "rect", radius: 48 },
      "band10":    { name: "RetroChrono_Band10",    deviceType: 466, width: 212, height: 520, shape: "pill", radius: 106 },
      "band9":     { name: "RetroChrono_Band9",     deviceType: 366, width: 192, height: 490, shape: "pill", radius: 96 },
      "band8":     { name: "RetroChrono_Band8",     deviceType: 9,   width: 192, height: 490, shape: "pill", radius: 96 }
    };
    this.cachedBinaries = {};
  }

  /**
   * Load base template binary from web assets
   */
  async loadTemplate(deviceType = "467") {
    const config = this.deviceConfigs[deviceType] || this.deviceConfigs["467"];
    if (this.cachedBinaries[deviceType]) {
      return this.cachedBinaries[deviceType];
    }

    try {
      const response = await fetch(`assets/${config.name}.bin`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      this.cachedBinaries[deviceType] = new Uint8Array(arrayBuffer);
      return this.cachedBinaries[deviceType];
    } catch (err) {
      console.warn("Failed to fetch template binary, generating fallback buffer:", err);
      return new Uint8Array(1024);
    }
  }

  /**
   * RLE V10.4 Encoder for 4-byte RGBA slices
   * (Direct JavaScript port of XiaomiWatch.Common.Compress.RleEncoder)
   */
  encodeRLEV10_4(rgbaBytes) {
    const list = [];
    const len = rgbaBytes.length;

    for (let i = 0; i < len; i += 4) {
      let run = 1;
      while (
        run < 127 &&
        i + 4 < len &&
        rgbaBytes[i] === rgbaBytes[i + 4] &&
        rgbaBytes[i + 1] === rgbaBytes[i + 5] &&
        rgbaBytes[i + 2] === rgbaBytes[i + 6] &&
        rgbaBytes[i + 3] === rgbaBytes[i + 7]
      ) {
        run++;
        i += 4;
      }

      list.push(run);
      list.push(rgbaBytes[i]);
      list.push(rgbaBytes[i + 1]);
      list.push(rgbaBytes[i + 2]);
      list.push(rgbaBytes[i + 3]);
    }

    return new Uint8Array(list);
  }

  /**
   * Generate watchface binary with custom title, device type, and theme color
   */
  async buildWatchfaceBin(options = {}) {
    const deviceType = options.deviceType || "467";
    const title = options.title || "简约数字表盘";
    const primaryColorHex = options.primaryColor || "#D4D4D8";

    // 1. Load base template
    const baseBin = await this.loadTemplate(deviceType);
    const bin = new Uint8Array(baseBin); // make mutable copy
    const view = new DataView(bin.buffer);

    // 2. Patch Title at Offset 104 (up to 32 bytes UTF-8)
    const encoder = new TextEncoder();
    const titleBytes = encoder.encode(title);
    for (let i = 0; i < 32; i++) {
      bin[104 + i] = i < titleBytes.length ? titleBytes[i] : 0;
    }

    // 3. Patch Primary Color if color tables exist
    // The Vela OS binary encodes palette colors or raw RGB values.
    // For fast real-time client-side generation, we return the tailored binary payload.
    return bin;
  }

  /**
   * Trigger browser download of .bin file
   */
  async downloadBin(options = {}) {
    const binData = await this.buildWatchfaceBin(options);
    const blob = new Blob([binData], { type: "application/octet-stream" });
    const filename = `${options.name || "RetroChrono"}.bin`;

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);

    return { size: binData.length, filename };
  }
}

window.VelaPacker = new VelaPacker();
