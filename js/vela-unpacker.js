/**
 * VelaCraft Pure JavaScript Watchface Binary (.bin) Unpacker
 * Parses VelaOS / Xiaomi Watch binary watchface files,
 * decompresses RLE v10/v11 image streams, and extracts layers & metadata.
 */

class VelaUnpacker {
  constructor() {
    this.MAGIC = 0x1234A55A; // [0x5A, 0xA5, 0x34, 0x12]
  }

  /**
   * Check if buffer is a valid Xiaomi / VelaOS watchface binary
   */
  isValidBin(buffer) {
    if (!buffer || buffer.byteLength < 168) return false;
    const view = new DataView(buffer);
    const magic = view.getUint32(0, true);
    return magic === this.MAGIC;
  }

  /**
   * Decode RLE v10 compressed byte stream into 32-bit RGBA pixels
   * Port of XiaomiWatch.Common.Decompress.RleDecoder.UncompressRLEv10
   */
  decompressRLEv10(cdata, width, height) {
    const destLen = width * height * 4;
    const out = new Uint8Array(destLen);
    const recordSize = 4;
    let num = 0;
    let num2 = 0;

    while (num < cdata.length && num2 < destLen) {
      const b = cdata[num++];
      if ((b & 0x80) === 0) {
        // Run of identical pixel
        if (num > cdata.length - recordSize) break;
        const count = b & 0x7F;
        const p0 = cdata[num++];
        const p1 = cdata[num++];
        const p2 = cdata[num++];
        const p3 = cdata[num++];

        for (let i = 0; i < count; i++) {
          if (num2 + 4 <= destLen) {
            out[num2++] = p0;
            out[num2++] = p1;
            out[num2++] = p2;
            out[num2++] = p3;
          }
        }
      } else {
        // Stream of distinct pixels
        const count = b & 0x7F;
        for (let j = 0; j < count; j++) {
          if (num + 4 <= cdata.length && num2 + 4 <= destLen) {
            out[num2++] = cdata[num++];
            out[num2++] = cdata[num++];
            out[num2++] = cdata[num++];
            out[num2++] = cdata[num++];
          }
        }
      }
    }

    return out;
  }

  /**
   * Convert raw RGBA byte array to HTML5 Canvas and DataURL
   */
  rgbaToDataUrl(rgbaBytes, width, height) {
    if (typeof document === 'undefined') return null; // Node.js test environment
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(width, height);
    imgData.data.set(rgbaBytes);
    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/png');
  }

  /**
   * Detect device model, screen shape, and dimensions from binary metadata
   */
  detectDevice(idString, width, height) {
    // Check known IDs or dimensions
    if (idString.startsWith('467') || idString.startsWith('1210')) {
      return { deviceType: '467', name: '小米手环 10 Pro', width: 336, height: 480, shape: 'rect' };
    }
    if (idString.startsWith('367') || idString.startsWith('1209')) {
      return { deviceType: '367', name: '小米手环 9 Pro', width: 336, height: 480, shape: 'rect' };
    }
    if (idString.startsWith('466')) {
      return { deviceType: '466', name: '小米手环 10', width: 212, height: 520, shape: 'pill' };
    }
    if (idString.startsWith('366')) {
      return { deviceType: '366', name: '小米手环 9', width: 192, height: 490, shape: 'pill' };
    }
    if (idString.startsWith('11')) {
      return { deviceType: '11', name: '小米手环 8 Pro', width: 336, height: 480, shape: 'rect' };
    }
    if (idString.startsWith('9')) {
      return { deviceType: '9', name: '小米手环 8', width: 192, height: 490, shape: 'pill' };
    }

    // Fallback by preview or canvas dimension
    if (width === 192 || height === 490) {
      return { deviceType: '366', name: '小米手环 8/9', width: 192, height: 490, shape: 'pill' };
    }
    if (width === 212 || height === 520) {
      return { deviceType: '466', name: '小米手环 10', width: 212, height: 520, shape: 'pill' };
    }
    return { deviceType: '467', name: '小米手环 Pro 系列', width: 336, height: 480, shape: 'rect' };
  }

  /**
   * Unpack .bin ArrayBuffer into structured project representation
   */
  unpack(arrayBuffer) {
    if (!this.isValidBin(arrayBuffer)) {
      throw new Error('不是有效的小米手环 / VelaOS 表盘固件二进制包 (Magic 校验失败)');
    }

    const data = new Uint8Array(arrayBuffer);
    const view = new DataView(arrayBuffer);

    // 1. Read Header (168 bytes)
    const version = view.getUint32(16, true);
    const faceCount = data[28];
    const previewOffset = view.getUint32(32, true);

    // Project ID (byte 40..103)
    const idBytes = data.subarray(40, 104);
    let idEnd = idBytes.indexOf(0);
    if (idEnd === -1) idEnd = idBytes.length;
    const idString = new TextDecoder('utf-8').decode(idBytes.subarray(0, idEnd)).trim();

    // Watchface Name (byte 104..167)
    const nameBytes = data.subarray(104, 168);
    let nameEnd = nameBytes.indexOf(0);
    if (nameEnd === -1) nameEnd = nameBytes.length;
    const title = new TextDecoder('utf-8').decode(nameBytes.subarray(0, nameEnd)).trim() || '未命名表盘';

    // 2. Unpack Preview Image
    let preview = null;
    if (previewOffset > 0 && previewOffset + 12 < data.length) {
      const pw = view.getUint16(previewOffset + 4, true);
      const ph = view.getUint16(previewOffset + 6, true);
      const pcsize = view.getUint32(previewOffset + 8, true);
      const pcdata = data.subarray(previewOffset + 12, previewOffset + 12 + pcsize);
      const prgba = this.decompressRLEv10(pcdata, pw, ph);
      const pDataUrl = this.rgbaToDataUrl(prgba, pw, ph);

      preview = {
        width: pw,
        height: ph,
        compressedSize: pcsize,
        dataUrl: pDataUrl,
        rgbaBytes: prgba
      };
    }

    // Detect device target
    const targetWidth = preview ? preview.width : 336;
    const targetHeight = preview ? preview.height : 480;
    const device = this.detectDevice(idString, targetWidth, targetHeight);

    // 3. Unpack Face 0 (Main Watchface Screen)
    const faceBase = 168;
    const images = [];
    const elements = [];

    if (data.length >= faceBase + 88) {
      // Image Table
      const imgCount = view.getUint32(faceBase + 24, true);
      const imgTableOff = view.getUint32(faceBase + 28, true);

      if (imgTableOff > 0 && imgTableOff < data.length) {
        for (let i = 0; i < imgCount; i++) {
          const entryOff = imgTableOff + i * 16;
          if (entryOff + 16 > data.length) break;

          const imgId = view.getUint32(entryOff, true);
          const imgDataOff = view.getUint32(entryOff + 8, true);
          const imgSize = view.getUint32(entryOff + 12, true);

          if (imgDataOff > 0 && imgDataOff + 12 <= data.length) {
            const iw = view.getUint16(imgDataOff + 4, true);
            const ih = view.getUint16(imgDataOff + 6, true);
            const icSize = view.getUint32(imgDataOff + 8, true);
            const icData = data.subarray(imgDataOff + 12, imgDataOff + 12 + icSize);
            const irgba = this.decompressRLEv10(icData, iw, ih);
            const dataUrl = this.rgbaToDataUrl(irgba, iw, ih);

            images.push({
              index: i,
              id: imgId,
              width: iw,
              height: ih,
              compressedSize: icSize,
              dataUrl: dataUrl,
              rgbaBytes: irgba
            });
          }
        }
      }

      // Elements Table
      const elemCount = view.getUint32(faceBase + 8, true);
      const elemTableOff = view.getUint32(faceBase + 12, true);

      if (elemTableOff > 0 && elemTableOff < data.length) {
        for (let i = 0; i < elemCount; i++) {
          const entryOff = elemTableOff + i * 16;
          if (entryOff + 16 > data.length) break;

          const eid = view.getUint32(entryOff, true);
          const dataOff = view.getUint32(entryOff + 8, true);
          const size = view.getUint32(entryOff + 12, true);

          if (dataOff > 0 && dataOff + 8 <= data.length) {
            const targetId = view.getUint32(dataOff, true);
            const x = view.getUint16(dataOff + 4, true);
            const y = view.getUint16(dataOff + 6, true);

            elements.push({
              index: i,
              elementId: eid,
              targetId: targetId,
              x: x,
              y: y
            });
          }
        }
      }
    }

    return {
      success: true,
      title: title,
      projectId: idString,
      version: version,
      faceCount: faceCount,
      device: device,
      preview: preview,
      images: images,
      elements: elements,
      fileSize: arrayBuffer.byteLength
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VelaUnpacker;
} else {
  window.VelaUnpacker = new VelaUnpacker();
}
