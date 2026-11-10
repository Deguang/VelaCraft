/**
 * VelaCraft Multi-Device Canvas Watchface Renderer & Layer Engine
 * Supports:
 * - Pro 系列: 小米手环 10 Pro / 9 Pro / 8 Pro (336 × 480 大方屏)
 * - 数字手环系列: 小米手环 10 (212 × 520) / 小米手环 9 (192 × 490) / 小米手环 8 (192 × 490) 经典跑道圆
 * Features object-based layers, direct canvas manipulation, gizmo transforms, and asset pipeline.
 */

class WatchfaceRenderer {
  constructor() {
    this.canvas = document.getElementById("watchCanvas");
    this.ctx = this.canvas.getContext("2d");

    // Multi-Device Specs
    this.deviceConfigs = {
      // Pro 系列 (336x480 大方屏)
      "467": { name: "小米手环 10 Pro", deviceType: "467", width: 336, height: 480, shape: "rect", radius: 48, ppi: "336 PPI", tag: "矩形大屏" },
      "367": { name: "小米手环 9 Pro",  deviceType: "367", width: 336, height: 480, shape: "rect", radius: 48, ppi: "336 PPI", tag: "矩形大屏" },
      "11":  { name: "小米手环 8 Pro",  deviceType: "11",  width: 336, height: 480, shape: "rect", radius: 48, ppi: "336 PPI", tag: "矩形大屏" },

      // 数字手环系列 (经典跑道椭圆胶囊屏)
      "366": { name: "小米手环 9",      deviceType: "366", width: 192, height: 490, shape: "pill", radius: 96, ppi: "326 PPI", tag: "跑道胶囊" },
      "9":   { name: "小米手环 8",      deviceType: "9",   width: 192, height: 490, shape: "pill", radius: 96, ppi: "326 PPI", tag: "跑道胶囊" },
      "466": { name: "小米手环 10",     deviceType: "466", width: 212, height: 520, shape: "pill", radius: 106, ppi: "326 PPI", tag: "跑道胶囊" },

      // Aliases for compatibility
      "band10pro": { name: "小米手环 10 Pro", deviceType: "467", width: 336, height: 480, shape: "rect", radius: 48, ppi: "336 PPI", tag: "矩形大屏" },
      "band9pro":  { name: "小米手环 9 Pro",  deviceType: "367", width: 336, height: 480, shape: "rect", radius: 48, ppi: "336 PPI", tag: "矩形大屏" },
      "band8pro":  { name: "小米手环 8 Pro",  deviceType: "11",  width: 336, height: 480, shape: "rect", radius: 48, ppi: "336 PPI", tag: "矩形大屏" },
      "band9":     { name: "小米手环 9",      deviceType: "366", width: 192, height: 490, shape: "pill", radius: 96, ppi: "326 PPI", tag: "跑道胶囊" },
      "band8":     { name: "小米手环 8",      deviceType: "9",   width: 192, height: 490, shape: "pill", radius: 96, ppi: "326 PPI", tag: "跑道胶囊" },
      "band10":    { name: "小米手环 10",     deviceType: "466", width: 212, height: 520, shape: "pill", radius: 106, ppi: "326 PPI", tag: "跑道胶囊" }
    };

    this.currentDevice = "467";
    this.width = 336;
    this.height = 480;
    this.shape = "rect";

    // Global Watchface State
    this.state = {
      fontFamily: "ChillDIN",
      iconStyle: "color", // 'color' or 'mono'
      primaryColor: "#D4D4D8",
      presetColors: {
        analog: "#FF3344",
        gallery: "#FFFFFF",
        cyber: "#00E5FF",
        bauhaus: "#E63946"
      },
      analogDial: "titanium", // 'titanium', 'sunburst_blue', 'emerald', 'cream'
      galleryTheme: "sunset", // 'sunset', 'aurora', 'cybercity', 'forest', 'sakura'
      galleryCustomImage: null,
      isLiveTime: true,
      isAOD: false,
      title: "简约数字表盘",
      currentPreset: "retro_chrono" // 'retro_chrono', 'analog_luxe', 'gallery_photo', 'cyber_hud', 'bauhaus_minimal'
    };

    // Preload Default SVG Icon Sets
    this.svgIcons = {
      color: {
        sun: this.loadImg("assets/icons/color/sun.svg"),
        heart: this.loadImg("assets/icons/color/heart.svg"),
        flame: this.loadImg("assets/icons/color/flame.svg"),
        footprint: this.loadImg("assets/icons/color/footprint.svg"),
        battery: this.loadImg("assets/icons/color/battery.svg")
      },
      mono: {
        sun: this.loadImg("assets/icons/mono/sun.svg"),
        heart: this.loadImg("assets/icons/mono/heart.svg"),
        flame: this.loadImg("assets/icons/mono/flame.svg"),
        footprint: this.loadImg("assets/icons/mono/footprint.svg"),
        battery: this.loadImg("assets/icons/mono/battery.svg"),
        crosshair: this.loadImg("assets/icons/mono/crosshair.svg")
      }
    };

    // Palettes
    this.palettes = {
      muted_white: { name: "高级暗白", hex: "#D4D4D8" },
      amber:       { name: "经典琥珀金", hex: "#F59E0B" },
      blue:        { name: "赛博青蓝", hex: "#00E5FF" },
      green:       { name: "荧光青绿", hex: "#CCFF00" },
      white:       { name: "纯粹冷白", hex: "#FFFFFF" },
      orange:      { name: "活力霓虹橙", hex: "#FF6B00" },
      red:         { name: "竞速赤红", hex: "#FF3344" },
      purple:      { name: "幻影紫", hex: "#AF52DE" }
    };

    // ================= Layer System Definitions =================
    this.layers = [
      {
        id: "bg",
        name: "表盘背景 (Wallpaper)",
        type: "bg",
        color: "#000000",
        customImage: null,
        opacity: 1.0,
        visible: true,
        locked: false
      },
      {
        id: "time",
        name: "核心时钟 (Digital Clock)",
        type: "time",
        x: 168,
        y: 154,
        scaleX: 0.95,
        scaleY: 1.25,
        fontSize: 136,
        fontFamily: "ChillDIN",
        color: "#D4D4D8",
        visible: true,
        locked: false,
        bounds: { x: 23, y: 88, width: 290, height: 132 }
      },
      {
        id: "weather",
        name: "天气指示 (Weather)",
        type: "weather",
        x: 14,
        y: 27,
        fontSize: 28,
        color: "#F0F0F5",
        customIcon: null,
        visible: true,
        locked: false,
        bounds: { x: 14, y: 27, width: 86, height: 28 }
      },
      {
        id: "battery",
        name: "电量状态 (Battery)",
        type: "battery",
        x: 258,
        y: 27,
        fontSize: 28,
        color: "#F0F0F5",
        customIcon: null,
        visible: true,
        locked: false,
        bounds: { x: 258, y: 27, width: 68, height: 28 }
      },
      {
        id: "ribbon",
        name: "日期星期 (Date & Week)",
        type: "ribbon",
        x: 14,
        y: 270,
        color: "#F0F0F5",
        accentColor: "#F5B432",
        visible: true,
        locked: false,
        bounds: { x: 14, y: 270, width: 308, height: 42 }
      },
      {
        id: "steps",
        name: "运动步数 (Steps)",
        type: "steps",
        x: 14,
        y: 344,
        color: "#00E5FF",
        customIcon: null,
        visible: true,
        locked: false,
        bounds: { x: 14, y: 344, width: 90, height: 96 }
      },
      {
        id: "hrm",
        name: "心率测量 (Heart Rate)",
        type: "hrm",
        x: 136,
        y: 344,
        bigHrm: true,
        color: "#FF3344",
        customIcon: null,
        visible: true,
        locked: false,
        bounds: { x: 136, y: 344, width: 90, height: 96 }
      },
      {
        id: "cal",
        name: "卡路里 (Calories)",
        type: "cal",
        x: 238,
        y: 344,
        color: "#FF7000",
        customIcon: null,
        visible: true,
        locked: false,
        bounds: { x: 238, y: 344, width: 90, height: 96 }
      }
    ];

    // Interaction & Gizmo State
    this.selectedLayerId = "time";
    this.isDragging = false;
    this.dragStartPos = { x: 0, y: 0 };
    this.layerInitialPos = { x: 0, y: 0 };
    this.snapGuideX = null;
    this.snapGuideY = null;
    this.onSelectionChange = null;

    this.init();
  }

  loadImg(src) {
    const img = new Image();
    img.src = src;
    return img;
  }

  async init() {
    try {
      await document.fonts.load('16px "ChillDIN"');
    } catch (e) {
      console.warn("Font loading wait skipped:", e);
    }
    this.startLoop();
  }

  startLoop() {
    const render = () => {
      this.draw();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  // ================= Multi-Device Form Factor Switching =================
  setDevice(deviceType) {
    const conf = this.deviceConfigs[deviceType] || this.deviceConfigs["467"];
    this.currentDevice = conf.deviceType || deviceType;
    this.width = conf.width;
    this.height = conf.height;
    this.shape = conf.shape;
    this.radius = conf.radius;
    this.canvas.width = conf.width;
    this.canvas.height = conf.height;

    this.applyDeviceDefaultLayout(conf.shape);
    this.draw();
  }

  applyDeviceDefaultLayout(shape) {
    const isPill = shape === "pill";
    const w = this.width;
    const cx = Math.round(w / 2);

    const defaults = isPill
      ? {
          time:    { x: cx,  y: 175, scaleX: 0.88, scaleY: 1.25, fontSize: 66, bounds: { x: 12, y: 130, width: w - 24, height: 90 } },
          weather: { x: 26,  y: 44,  fontSize: 22, bounds: { x: 26, y: 44, width: 64, height: 24 } },
          battery: { x: 104, y: 44,  fontSize: 22, bounds: { x: 104, y: 44, width: 62, height: 24 } },
          ribbon:  { x: 16,  y: 264, bounds: { x: 16, y: 264, width: w - 32, height: 38 } },
          steps:   { x: 20,  y: 318, bounds: { x: 20, y: 318, width: w - 40, height: 42 } },
          hrm:     { x: 20,  y: 372, bigHrm: false, bounds: { x: 20, y: 372, width: w - 40, height: 42 } },
          cal:     { x: 20,  y: 424, bounds: { x: 20, y: 424, width: w - 40, height: 42 } }
        }
      : {
          time:    { x: 168, y: 154, scaleX: 0.95, scaleY: 1.25, fontSize: 136, bounds: { x: 23, y: 88, width: 290, height: 132 } },
          weather: { x: 14,  y: 27,  fontSize: 28, bounds: { x: 14, y: 27, width: 86, height: 28 } },
          battery: { x: 258, y: 27,  fontSize: 28, bounds: { x: 258, y: 27, width: 68, height: 28 } },
          ribbon:  { x: 14,  y: 270, bounds: { x: 14, y: 270, width: 308, height: 42 } },
          steps:   { x: 14,  y: 344, bounds: { x: 14, y: 344, width: 90, height: 96 } },
          hrm:     { x: 136, y: 344, bigHrm: true, bounds: { x: 136, y: 344, width: 90, height: 96 } },
          cal:     { x: 238, y: 344, bounds: { x: 238, y: 344, width: 90, height: 96 } }
        };

    Object.entries(defaults).forEach(([id, props]) => {
      const layer = this.getLayer(id);
      if (layer) {
        Object.assign(layer, props);
      }
    });

    if (typeof this.onSelectionChange === "function") {
      this.onSelectionChange(this.getSelectedLayer());
    }
  }

  // ================= Watchface Presets =================
  setPreset(presetName) {
    this.state.currentPreset = presetName;
    this.state.isAOD = false; // Always disengage AOD when loading a new preset

    if (presetName === "retro_chrono") {
      this.state.fontFamily = "ChillDIN";
      this.state.primaryColor = "#D4D4D8";
      this.applyDeviceDefaultLayout(this.shape);
      this.selectLayer("time");
    } else {
      this.selectedLayerId = null;
      if (typeof this.onSelectionChange === "function") {
        this.onSelectionChange(null);
      }
    }
    this.draw();
  }

  // ================= Layer Query & Mutation =================
  getLayer(id) {
    return this.layers.find((l) => l.id === id);
  }

  getSelectedLayer() {
    return this.getLayer(this.selectedLayerId);
  }

  selectLayer(id) {
    if (this.selectedLayerId !== id) {
      this.selectedLayerId = id;
      if (typeof this.onSelectionChange === "function") {
        this.onSelectionChange(this.getSelectedLayer());
      }
    }
  }

  setLayerPosition(id, x, y) {
    const layer = this.getLayer(id);
    if (!layer || layer.locked) return;
    layer.x = Math.round(x);
    layer.y = Math.round(y);
    this.updateLayerBounds(layer);
  }

  alignLayer(id, alignment) {
    const layer = this.getLayer(id);
    if (!layer || layer.type === "bg") return;

    const b = layer.bounds || { width: 80, height: 40 };
    const screenW = this.width;
    const screenH = this.height;

    switch (alignment) {
      case "left":
        layer.x = this.shape === "pill" ? 18 : 14;
        break;
      case "centerX":
        if (layer.type === "time") {
          layer.x = Math.round(screenW / 2);
        } else {
          layer.x = Math.round((screenW - b.width) / 2);
        }
        break;
      case "right":
        layer.x = Math.round(screenW - (this.shape === "pill" ? 18 : 14) - b.width);
        break;
      case "top":
        layer.y = this.shape === "pill" ? 40 : 24;
        break;
      case "centerY":
        if (layer.type === "time") {
          layer.y = Math.round(screenH / 2);
        } else {
          layer.y = Math.round((screenH - b.height) / 2);
        }
        break;
      case "bottom":
        layer.y = Math.round(screenH - (this.shape === "pill" ? 40 : 24) - b.height);
        break;
      case "reset":
        this.resetLayer(id);
        break;
    }
    this.updateLayerBounds(layer);
  }

  resetLayer(id) {
    this.applyDeviceDefaultLayout(this.shape);
  }

  updateLayerBounds(layer) {
    if (!layer) return;
    if (layer.type === "time") {
      const halfW = this.shape === "pill" ? 80 : 145;
      const halfH = this.shape === "pill" ? 45 : 66;
      layer.bounds = {
        x: Math.round(layer.x - halfW),
        y: Math.round(layer.y - halfH),
        width: halfW * 2,
        height: halfH * 2
      };
    } else if (layer.type === "custom_image" || layer.type === "custom_text") {
      layer.bounds = {
        x: Math.round(layer.x),
        y: Math.round(layer.y),
        width: layer.width || 60,
        height: layer.height || 40
      };
    } else {
      if (!layer.bounds) layer.bounds = { width: 80, height: 40 };
      layer.bounds.x = layer.x;
      layer.bounds.y = layer.y;
    }
  }

  // ================= Asset Replacement Methods =================
  setLayerCustomAsset(id, dataUrlOrImg) {
    const layer = this.getLayer(id);
    if (!layer) return;

    if (typeof dataUrlOrImg === "string") {
      const img = new Image();
      img.onload = () => {
        if (layer.type === "bg") {
          layer.customImage = img;
        } else {
          layer.customIcon = img;
        }
      };
      img.src = dataUrlOrImg;
    } else {
      if (layer.type === "bg") {
        layer.customImage = dataUrlOrImg;
      } else {
        layer.customIcon = dataUrlOrImg;
      }
    }
  }

  clearLayerCustomAsset(id) {
    const layer = this.getLayer(id);
    if (!layer) return;
    if (layer.type === "bg") {
      layer.customImage = null;
    } else {
      layer.customIcon = null;
    }
  }

  addCustomImageLayer(dataUrl, name = "自定义贴纸", onComplete = null) {
    const img = new Image();
    img.onload = () => {
      const id = "custom_img_" + Date.now();
      let w = img.naturalWidth || img.width || 64;
      let h = img.naturalHeight || img.height || 64;
      if (w > 72 || h > 72) {
        const scale = Math.min(72 / w, 72 / h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
      const newLayer = {
        id,
        name,
        type: "custom_image",
        x: Math.round((this.width - w) / 2),
        y: Math.round((this.height - h) / 2),
        width: w,
        height: h,
        img,
        opacity: 1.0,
        visible: true,
        locked: false,
        bounds: { x: Math.round((this.width - w) / 2), y: Math.round((this.height - h) / 2), width: w, height: h }
      };
      this.layers.push(newLayer);
      this.selectLayer(id);
      if (typeof onComplete === "function") {
        onComplete(newLayer);
      }
    };
    img.onerror = (e) => {
      console.warn("Failed to load sticker:", e);
    };
    img.src = dataUrl;
  }

  addCustomTextLayer(text = "VELA CRAFT", name = "自定义文本") {
    const id = "custom_txt_" + Date.now();
    const newLayer = {
      id,
      name,
      type: "custom_text",
      x: Math.round(this.width / 2 - 50),
      y: Math.round(this.height / 2 - 12),
      width: 100,
      height: 24,
      text,
      fontSize: 14,
      fontFamily: "Space Mono",
      color: "#00E5FF",
      opacity: 1.0,
      visible: true,
      locked: false,
      bounds: { x: Math.round(this.width / 2 - 50), y: Math.round(this.height / 2 - 12), width: 100, height: 24 }
    };
    this.layers.push(newLayer);
    this.selectLayer(id);
  }

  deleteLayer(id) {
    const index = this.layers.findIndex((l) => l.id === id);
    if (index !== -1 && (this.layers[index].type === "custom_image" || this.layers[index].type === "custom_text")) {
      this.layers.splice(index, 1);
      this.selectLayer("time");
    }
  }

  // ================= Hit Testing =================
  hitTest(x, y) {
    if (this.state.currentPreset !== "retro_chrono") {
      // In specialized full-dial presets, only custom stickers/texts can be hit-tested
      for (let i = this.layers.length - 1; i >= 0; i--) {
        const layer = this.layers[i];
        if (!layer.visible || layer.locked) continue;
        if (layer.type === "custom_image" || layer.type === "custom_text") {
          const b = layer.bounds;
          if (b && x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) {
            return layer.id;
          }
        }
      }
      return null;
    }

    for (let i = this.layers.length - 1; i >= 0; i--) {
      const layer = this.layers[i];
      if (!layer.visible || layer.locked) continue;
      if (layer.type === "bg") continue;

      const b = layer.bounds;
      if (b && x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) {
        return layer.id;
      }
    }
    return "bg";
  }

  // ================= Main Render Cycle =================
  getTimeData() {
    if (!this.state.isLiveTime) {
      return {
        hours: "10",
        minutes: "42",
        seconds: "58",
        month: "11",
        day: "05",
        week: "THU",
        steps: "8420",
        hrm: "78",
        cal: "465",
        temp: "24",
        battery: "85"
      };
    }

    const now = new Date();
    const weeks = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return {
      hours: String(now.getHours()).padStart(2, "0"),
      minutes: String(now.getMinutes()).padStart(2, "0"),
      seconds: String(now.getSeconds()).padStart(2, "0"),
      month: String(now.getMonth() + 1).padStart(2, "0"),
      day: String(now.getDate()).padStart(2, "0"),
      week: weeks[now.getDay()],
      steps: "8420",
      hrm: "78",
      cal: "465",
      temp: "24",
      battery: "85"
    };
  }

  draw() {
    const ctx = this.ctx;
    const d = this.getTimeData();

    // AMOLED Pill Semicircular clipping if in pill mode
    ctx.save();
    if (this.shape === "pill") {
      ctx.beginPath();
      ctx.roundRect(0, 0, this.width, this.height, this.radius || 96);
      ctx.clip();
    }

    // 1. Draw Background
    this.renderBackground(ctx);

    if (this.state.isAOD) {
      if (this.state.currentPreset === "analog_luxe") {
        this.renderAnalogPreset(ctx, d, true);
      } else if (this.state.currentPreset === "gallery_photo") {
        this.renderGalleryPresetAOD(ctx, d);
      } else if (this.state.currentPreset === "cyber_hud") {
        this.renderCyberPresetAOD(ctx, d);
      } else if (this.state.currentPreset === "bauhaus_minimal") {
        this.renderBauhausPresetAOD(ctx, d);
      } else {
        this.drawAOD(ctx, d);
      }
      ctx.restore();
      this.renderGizmo(ctx);
      return;
    }

    // 2. Render preset or standard active layers
    if (this.state.currentPreset === "analog_luxe") {
      this.renderAnalogPreset(ctx, d);
    } else if (this.state.currentPreset === "gallery_photo") {
      this.renderGalleryPreset(ctx, d);
    } else if (this.state.currentPreset === "cyber_hud") {
      this.renderCyberPreset(ctx, d);
    } else if (this.state.currentPreset === "bauhaus_minimal") {
      this.renderBauhausPreset(ctx, d);
    } else {
      this.layers.forEach((layer) => {
        if (!layer.visible) return;

        switch (layer.type) {
          case "time":
            this.renderTime(ctx, layer, d);
            break;
          case "weather":
            this.renderWeather(ctx, layer, d);
            break;
          case "battery":
            this.renderBattery(ctx, layer, d);
            break;
          case "ribbon":
            this.renderRibbon(ctx, layer, d);
            break;
          case "steps":
            this.renderSteps(ctx, layer, d);
            break;
          case "hrm":
            this.renderHRM(ctx, layer, d);
            break;
          case "cal":
            this.renderCal(ctx, layer, d);
            break;
        }
      });
    }

    // Always render custom stickers or texts on top
    this.layers.forEach((layer) => {
      if (!layer.visible) return;
      if (layer.type === "custom_image") {
        this.renderCustomImage(ctx, layer);
      } else if (layer.type === "custom_text") {
        this.renderCustomText(ctx, layer);
      }
    });

    ctx.restore();

    // 3. Render Gizmo & Selection Overlay
    this.renderGizmo(ctx);
  }

  // ================= Layer Renderers =================
  renderBackground(ctx) {
    const bg = this.getLayer("bg");
    ctx.save();
    if (bg && bg.customImage && bg.customImage.complete) {
      ctx.globalAlpha = bg.opacity || 1.0;
      const img = bg.customImage;
      const hRatio = this.width / img.width;
      const vRatio = this.height / img.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShiftX = (this.width - img.width * ratio) / 2;
      const centerShiftY = (this.height - img.height * ratio) / 2;
      ctx.drawImage(img, 0, 0, img.width, img.height, centerShiftX, centerShiftY, img.width * ratio, img.height * ratio);
    } else {
      ctx.fillStyle = bg ? bg.color : "#000000";
      ctx.fillRect(0, 0, this.width, this.height);
    }
    ctx.restore();
  }

  // ================= Watchface Presets Renderers =================

  // 1. Realistic Skeuomorphic Analog Chronometer
  renderAnalogPreset(ctx, d, isAOD = false) {
    const cx = Math.round(this.width / 2);
    const cy = Math.round(this.height / 2);
    const R = Math.round(Math.min(this.width, this.height) * (this.shape === "pill" ? 0.44 : 0.45));
    const dial = this.state.analogDial || "titanium";
    const accentColor = this.state.presetColors?.analog || "#FF3344";

    ctx.save();

    // Dial Face Background & Theme Gradients
    const dialGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, R);
    let tickColor = "#FFFFFF";
    let tickSubColor = "rgba(255, 255, 255, 0.28)";
    let numColor = "#E4E4E7";
    let brandColor = "rgba(255, 255, 255, 0.6)";
    let bezelColor = "rgba(255, 255, 255, 0.18)";

    if (dial === "sunburst_blue") {
      dialGrad.addColorStop(0, "#1d4ed8");
      dialGrad.addColorStop(0.55, "#0f2042");
      dialGrad.addColorStop(1, "#070e1c");
      bezelColor = "rgba(96, 165, 250, 0.25)";
    } else if (dial === "emerald") {
      dialGrad.addColorStop(0, "#059669");
      dialGrad.addColorStop(0.55, "#064e3b");
      dialGrad.addColorStop(1, "#022c22");
      bezelColor = "rgba(52, 211, 153, 0.25)";
    } else if (dial === "cream") {
      dialGrad.addColorStop(0, "#fafaf9");
      dialGrad.addColorStop(0.7, "#f5f5f4");
      dialGrad.addColorStop(1, "#e7e5e4");
      tickColor = "#18181b";
      tickSubColor = "rgba(24, 24, 27, 0.35)";
      numColor = "#18181b";
      brandColor = "rgba(24, 24, 27, 0.75)";
      bezelColor = "rgba(0, 0, 0, 0.25)";
    } else {
      // Titanium dark brushed (default)
      dialGrad.addColorStop(0, "#22252b");
      dialGrad.addColorStop(0.7, "#14161a");
      dialGrad.addColorStop(1, "#0a0b0d");
    }

    ctx.fillStyle = dialGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();

    // Metallic Outer Bezel
    ctx.strokeStyle = bezelColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 60 Minute & Hour Ticks
    for (let i = 0; i < 60; i++) {
      const angle = (i * 6 * Math.PI) / 180;
      const isHour = i % 5 === 0;
      const innerR = isHour ? R - (this.shape === "pill" ? 14 : 18) : R - 8;
      const outerR = R - 3;

      const x1 = cx + Math.sin(angle) * innerR;
      const y1 = cy - Math.cos(angle) * innerR;
      const x2 = cx + Math.sin(angle) * outerR;
      const y2 = cy - Math.cos(angle) * outerR;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = isHour ? tickColor : tickSubColor;
      ctx.lineWidth = isHour ? 2.5 : 1;
      ctx.stroke();
    }

    // Hour Numbers (12, 1, 2, ... 11)
    ctx.font = `bold ${this.shape === "pill" ? 13 : 17}px "ChillDIN", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = numColor;

    const numR = R - (this.shape === "pill" ? 26 : 32);
    for (let h = 1; h <= 12; h++) {
      if (h === 3) continue; // Reserve 3 o'clock for Date window
      const angle = (h * 30 * Math.PI) / 180;
      const nx = cx + Math.sin(angle) * numR;
      const ny = cy - Math.cos(angle) * numR;
      ctx.fillText(String(h), nx, ny);
    }

    // Date Window at 3 o'clock
    const dwX = cx + Math.round(R * 0.44);
    const dwY = cy - 10;
    ctx.fillStyle = dial === "cream" ? "#e7e5e4" : "#18181b";
    ctx.fillRect(dwX, dwY, 28, 20);
    ctx.strokeStyle = dial === "cream" ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(dwX, dwY, 28, 20);

    ctx.font = `bold 12px "ChillDIN", sans-serif`;
    ctx.fillStyle = dial === "cream" ? "#18181b" : "#FFFFFF";
    ctx.fillText(d.day, dwX + 14, dwY + 11);

    // Brand text at 12 o'clock
    ctx.font = `bold 10px sans-serif`;
    ctx.letterSpacing = "2px";
    ctx.fillStyle = brandColor;
    ctx.fillText("VELACRAFT", cx, cy - Math.round(R * 0.42));
    ctx.font = `7px sans-serif`;
    ctx.fillStyle = dial === "cream" ? "rgba(24, 24, 27, 0.45)" : "rgba(255, 255, 255, 0.35)";
    ctx.fillText("AUTOMATIC 60HZ", cx, cy - Math.round(R * 0.42) + 12);

    // Sub-dial at 6 o'clock (Steps count)
    const subCy = cy + Math.round(R * 0.42);
    const subR = this.shape === "pill" ? 22 : 28;
    ctx.beginPath();
    ctx.arc(cx, subCy, subR, 0, Math.PI * 2);
    ctx.fillStyle = dial === "cream" ? "rgba(0, 0, 0, 0.08)" : "rgba(0, 0, 0, 0.4)";
    ctx.fill();
    ctx.strokeStyle = dial === "cream" ? "rgba(0, 0, 0, 0.15)" : "rgba(255, 255, 255, 0.15)";
    ctx.stroke();

    ctx.font = `bold 8px "ChillDIN", sans-serif`;
    ctx.fillStyle = accentColor;
    ctx.fillText(`${d.steps} 步`, cx, subCy);

    // Hand Angles
    const hr = Number(d.hours) % 12;
    const mn = Number(d.minutes);
    const sc = Number(d.seconds);

    const hrAngle = ((hr + mn / 60) * 30 * Math.PI) / 180;
    const mnAngle = ((mn + sc / 60) * 6 * Math.PI) / 180;
    const scAngle = (sc * 6 * Math.PI) / 180;

    // Drop Shadow for hands
    ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;

    // Hour Hand
    const hrLen = R * 0.52;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(hrAngle);
    ctx.fillStyle = dial === "cream" ? "#27272a" : "#D4D4D8";
    ctx.beginPath();
    ctx.moveTo(-4, 10);
    ctx.lineTo(-3, -hrLen);
    ctx.lineTo(0, -hrLen - 4);
    ctx.lineTo(3, -hrLen);
    ctx.lineTo(4, 10);
    ctx.closePath();
    ctx.fill();

    // Luminous center slot in hour hand
    ctx.fillStyle = dial === "cream" ? "#f4f4f5" : "#FFFFFF";
    ctx.fillRect(-1.5, -hrLen + 10, 3, hrLen - 22);
    ctx.restore();

    // Minute Hand
    const mnLen = R * 0.78;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(mnAngle);
    ctx.fillStyle = dial === "cream" ? "#18181b" : "#F4F4F5";
    ctx.beginPath();
    ctx.moveTo(-3, 12);
    ctx.lineTo(-2, -mnLen);
    ctx.lineTo(0, -mnLen - 5);
    ctx.lineTo(2, -mnLen);
    ctx.lineTo(3, 12);
    ctx.closePath();
    ctx.fill();

    // Luminous center slot in minute hand
    ctx.fillStyle = dial === "cream" ? "#f4f4f5" : "#FFFFFF";
    ctx.fillRect(-1, -mnLen + 12, 2, mnLen - 26);
    ctx.restore();

    // Accent Second Hand (hide in AOD)
    if (!this.state.isAOD) {
      const scLen = R * 0.86;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(scAngle);
      ctx.shadowColor = accentColor + "66";
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(0, R * 0.22);
      ctx.lineTo(0, -scLen);
      ctx.stroke();

      // Circular counterweight
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(0, R * 0.14, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Center Pivot Cap
    ctx.shadowColor = "transparent";
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = dial === "cream" ? "#71717a" : "#A1A1AA";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = accentColor;
    ctx.fill();

    // Pill mode auxiliary complication telemetry
    if (this.shape === "pill" && !this.state.isAOD && !isAOD) {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = 'bold 12px "ChillDIN", sans-serif';
      ctx.fillStyle = dial === "cream" ? "rgba(24, 24, 27, 0.85)" : "rgba(255, 255, 255, 0.75)";
      ctx.fillText(`${d.month}/${d.day} ${d.week}  ·  ⚡ ${d.battery}%`, cx, 58);

      ctx.font = 'bold 11px "ChillDIN", sans-serif';
      ctx.fillStyle = accentColor;
      ctx.fillText(`👟 ${d.steps}  ·  ❤️ ${d.hrm} BPM`, cx, this.height - 56);
    }

    ctx.restore();
  }

  setAnalogDial(dialName) {
    this.state.analogDial = dialName;
    this.draw();
  }

  // Gallery Preset AOD
  renderGalleryPresetAOD(ctx, d) {
    const cx = Math.round(this.width / 2);
    const cy = Math.round(this.height / 2);
    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${this.shape === "pill" ? 54 : 76}px "ChillDIN", sans-serif`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
    ctx.fillText(`${d.hours}:${d.minutes}`, cx, cy - 20);

    ctx.font = '13px sans-serif';
    ctx.fillStyle = "rgba(255, 107, 107, 0.65)";
    ctx.fillText(`${d.month}月${d.day}日 · ${d.week}`, cx, cy + 28);
    ctx.restore();
  }

  // Cyber HUD AOD
  renderCyberPresetAOD(ctx, d) {
    const cx = Math.round(this.width / 2);
    const cy = Math.round(this.height / 2);
    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${this.shape === "pill" ? 52 : 72}px "ChillDIN", sans-serif`;
    ctx.fillStyle = this.state.presetColors?.cyber ? `${this.state.presetColors.cyber}BF` : "rgba(0, 229, 255, 0.75)";
    ctx.fillText(`${d.hours}:${d.minutes}`, cx, cy - 10);

    ctx.font = '11px monospace';
    ctx.fillStyle = "rgba(245, 158, 11, 0.7)";
    ctx.fillText(`AOD.STANDBY // BAT ${d.battery}%`, cx, cy + 34);
    ctx.restore();
  }

  // Bauhaus AOD
  renderBauhausPresetAOD(ctx, d) {
    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = this.state.presetColors?.bauhaus || "#E63946";
    ctx.fillRect(16, 24, 6, this.height - 48);

    ctx.font = `bold ${this.shape === "pill" ? 76 : 110}px "ChillDIN", sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "rgba(241, 250, 238, 0.7)";
    ctx.fillText(d.hours, 36, this.shape === "pill" ? 64 : 48);
    ctx.fillStyle = "rgba(244, 162, 97, 0.7)";
    ctx.fillText(d.minutes, 36, this.shape === "pill" ? 170 : 180);
    ctx.restore();
  }

  // ================= Gallery Photo Methods =================
  setGalleryTheme(themeName) {
    if (!this.state.galleryTheme) this.state.galleryTheme = "sunset";
    this.state.galleryTheme = themeName;
    this.state.galleryCustomImage = null;
    this.galleryCustomImgObj = null;
    this.draw();
  }

  setGalleryCustomImage(dataUrl) {
    if (!dataUrl) {
      this.state.galleryCustomImage = null;
      this.galleryCustomImgObj = null;
      this.draw();
      return;
    }
    this.state.galleryCustomImage = dataUrl;
    const img = new Image();
    img.onload = () => {
      this.galleryCustomImgObj = img;
      this.draw();
    };
    img.src = dataUrl;
  }

  // 2. Photo Gallery & Glassmorphism Preset
  renderGalleryPreset(ctx, d) {
    const cx = Math.round(this.width / 2);
    const cy = Math.round(this.height / 2);

    ctx.save();

    // 1. User Custom Photo Background (Object-fit: cover)
    if (this.galleryCustomImgObj && this.galleryCustomImgObj.complete) {
      const img = this.galleryCustomImgObj;
      const imgW = img.naturalWidth || img.width || this.width;
      const imgH = img.naturalHeight || img.height || this.height;
      const scale = Math.max(this.width / imgW, this.height / imgH);
      const dw = Math.round(imgW * scale);
      const dh = Math.round(imgH * scale);
      const dx = Math.round((this.width - dw) / 2);
      const dy = Math.round((this.height - dh) / 2);
      ctx.drawImage(img, dx, dy, dw, dh);

      // Subtle atmospheric vignette for contrast
      const vig = ctx.createLinearGradient(0, 0, 0, this.height);
      vig.addColorStop(0, "rgba(0, 0, 0, 0.4)");
      vig.addColorStop(0.5, "rgba(0, 0, 0, 0.15)");
      vig.addColorStop(1, "rgba(0, 0, 0, 0.6)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, this.width, this.height);
    } else {
      // 2. Curated Wallpapers
      const theme = this.state.galleryTheme || "sunset";

      if (theme === "aurora") {
        // Deep Night Sky & Emerald Aurora
        const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
        skyGrad.addColorStop(0, "#05051a");
        skyGrad.addColorStop(0.35, "#0b1a3a");
        skyGrad.addColorStop(0.7, "#0d3b66");
        skyGrad.addColorStop(1, "#03071e");
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Aurora waves
        const aurora = ctx.createRadialGradient(cx, cy * 0.7, 20, cx, cy * 0.7, this.width * 0.8);
        aurora.addColorStop(0, "rgba(0, 245, 212, 0.45)");
        aurora.addColorStop(0.5, "rgba(114, 9, 183, 0.3)");
        aurora.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = aurora;
        ctx.fillRect(0, 0, this.width, this.height);

        // Stars
        ctx.fillStyle = "#ffffff";
        const stars = [[30, 40], [80, 25], [180, 35], [260, 50], [290, 80], [60, 110], [cx, 75]];
        stars.forEach(([sx, sy]) => {
          ctx.beginPath();
          ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
          ctx.fill();
        });

        // Snowy peak silhouette
        ctx.fillStyle = "#070d18";
        ctx.beginPath();
        ctx.moveTo(0, cy + 45);
        ctx.lineTo(cx * 0.6, cy + 15);
        ctx.lineTo(cx, cy + 30);
        ctx.lineTo(cx * 1.4, cy + 10);
        ctx.lineTo(this.width, cy + 40);
        ctx.lineTo(this.width, this.height);
        ctx.lineTo(0, this.height);
        ctx.closePath();
        ctx.fill();

      } else if (theme === "cybercity") {
        // Cyberpunk Night
        const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
        skyGrad.addColorStop(0, "#0a001a");
        skyGrad.addColorStop(0.4, "#190033");
        skyGrad.addColorStop(0.75, "#2b0938");
        skyGrad.addColorStop(1, "#000000");
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Neon grid lines
        ctx.strokeStyle = "rgba(0, 240, 255, 0.18)";
        ctx.lineWidth = 1;
        for (let i = 0; i < this.width; i += 28) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, this.height);
          ctx.stroke();
        }
        for (let j = 0; j < this.height; j += 28) {
          ctx.beginPath();
          ctx.moveTo(0, j);
          ctx.lineTo(this.width, j);
          ctx.stroke();
        }

        // Cyber buildings
        ctx.fillStyle = "#0d0221";
        ctx.fillRect(20, cy + 20, 50, this.height);
        ctx.fillRect(80, cy - 10, 60, this.height);
        ctx.fillRect(150, cy + 30, 70, this.height);
        ctx.fillRect(230, cy + 5, 55, this.height);
        ctx.fillRect(295, cy + 25, 40, this.height);

        // Building neon accents
        ctx.fillStyle = "#ff007f";
        ctx.fillRect(84, cy - 8, 4, 30);
        ctx.fillStyle = "#00f0ff";
        ctx.fillRect(234, cy + 8, 4, 25);

      } else if (theme === "forest") {
        // Misty Evergreen Forest
        const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
        skyGrad.addColorStop(0, "#081c15");
        skyGrad.addColorStop(0.4, "#1b4332");
        skyGrad.addColorStop(0.75, "#2d6a4f");
        skyGrad.addColorStop(1, "#081c15");
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Misty fog
        const fog = ctx.createLinearGradient(0, cy - 20, 0, cy + 60);
        fog.addColorStop(0, "rgba(82, 183, 136, 0)");
        fog.addColorStop(0.5, "rgba(82, 183, 136, 0.25)");
        fog.addColorStop(1, "rgba(82, 183, 136, 0)");
        ctx.fillStyle = fog;
        ctx.fillRect(0, cy - 20, this.width, 80);

        // Pine silhouettes
        ctx.fillStyle = "#081c15";
        const pines = [30, 70, 115, 160, 205, 250, 290];
        pines.forEach(px => {
          ctx.beginPath();
          ctx.moveTo(px, cy - 10);
          ctx.lineTo(px - 16, cy + 60);
          ctx.lineTo(px + 16, cy + 60);
          ctx.closePath();
          ctx.fill();
        });

      } else if (theme === "sakura") {
        // Japanese Sakura Blossom
        const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
        skyGrad.addColorStop(0, "#1d0f28");
        skyGrad.addColorStop(0.4, "#3e1f47");
        skyGrad.addColorStop(0.75, "#7b2cbf");
        skyGrad.addColorStop(1, "#f72585");
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Full moon
        ctx.fillStyle = "rgba(255, 240, 245, 0.85)";
        ctx.beginPath();
        ctx.arc(cx, cy + 15, 60, 0, Math.PI * 2);
        ctx.fill();

        // Mount Fuji peak
        ctx.fillStyle = "rgba(18, 5, 30, 0.9)";
        ctx.beginPath();
        ctx.moveTo(cx - 70, cy + 60);
        ctx.lineTo(cx, cy + 10);
        ctx.lineTo(cx + 70, cy + 60);
        ctx.lineTo(this.width, this.height);
        ctx.lineTo(0, this.height);
        ctx.closePath();
        ctx.fill();

      } else {
        // Default: Synthwave Sunset
        const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
        skyGrad.addColorStop(0, "#090919");
        skyGrad.addColorStop(0.35, "#240046");
        skyGrad.addColorStop(0.7, "#7b2cbf");
        skyGrad.addColorStop(1, "#ff6b6b");
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Glowing Neon Sun
        const sunGrad = ctx.createRadialGradient(cx, cy + 20, 10, cx, cy + 20, 90);
        sunGrad.addColorStop(0, "#ffe66d");
        sunGrad.addColorStop(0.5, "#ff6b6b");
        sunGrad.addColorStop(1, "rgba(255, 107, 107, 0)");
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(cx, cy + 20, 90, 0, Math.PI * 2);
        ctx.fill();

        // Horizon mountain silhouette
        ctx.fillStyle = "rgba(10, 5, 25, 0.85)";
        ctx.beginPath();
        ctx.moveTo(0, cy + 40);
        ctx.lineTo(cx * 0.5, cy + 10);
        ctx.lineTo(cx, cy + 35);
        ctx.lineTo(cx * 1.5, cy + 5);
        ctx.lineTo(this.width, cy + 45);
        ctx.lineTo(this.width, this.height);
        ctx.lineTo(0, this.height);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Frosted Glassmorphism Card
    const cardW = this.width - (this.shape === "pill" ? 24 : 40);
    const cardH = this.shape === "pill" ? 160 : 180;
    const cardX = Math.round((this.width - cardW) / 2);
    const cardY = this.shape === "pill" ? 60 : Math.round(this.height * 0.12);

    ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 20);
    ctx.fill();
    ctx.stroke();

    // Time inside card
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${this.shape === "pill" ? 54 : 76}px "ChillDIN", sans-serif`;
    ctx.fillStyle = "#FFFFFF";
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 8;
    ctx.fillText(`${d.hours}:${d.minutes}`, cx, cardY + (this.shape === "pill" ? 52 : 62));

    ctx.shadowColor = "transparent";

    // Date & Week badge
    ctx.font = `bold ${this.shape === "pill" ? 13 : 15}px sans-serif`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fillText(`${d.month}月${d.day}日 · ${d.week}`, cx, cardY + (this.shape === "pill" ? 98 : 116));

    // Status chips
    ctx.font = `11px "ChillDIN", sans-serif`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillText(`⚡ ${d.battery}%  •  👟 ${d.steps}  •  ❤️ ${d.hrm}`, cx, cardY + (this.shape === "pill" ? 130 : 150));

    ctx.restore();
  }

  // 3. Cyberpunk HUD Preset
  renderCyberPreset(ctx, d) {
    const cx = Math.round(this.width / 2);
    const cy = Math.round(this.height / 2);
    const cyberColor = this.state.presetColors?.cyber || "#00E5FF";

    ctx.save();
    // AMOLED dark background with subtle cyber grid
    ctx.fillStyle = "#05070a";
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.strokeStyle = cyberColor + "12";
    ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    // Dual Circular Arc Gauges
    const arcR = Math.min(this.width, this.height) * (this.shape === "pill" ? 0.38 : 0.42);

    // Left Arc: Steps (Selected Cyber Neon Color)
    const stepPct = Math.min(Number(d.steps) / 10000, 1.0);
    ctx.beginPath();
    ctx.arc(cx, cy, arcR, Math.PI * 0.75, Math.PI * 1.4);
    ctx.strokeStyle = cyberColor + "33";
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, arcR, Math.PI * 0.75, Math.PI * (0.75 + 0.65 * stepPct));
    ctx.strokeStyle = cyberColor;
    ctx.lineWidth = 6;
    ctx.stroke();

    // Right Arc: Battery (Amber)
    const batPct = Math.min(Number(d.battery) / 100, 1.0);
    ctx.beginPath();
    ctx.arc(cx, cy, arcR, Math.PI * 1.6, Math.PI * 2.25);
    ctx.strokeStyle = "rgba(245, 158, 11, 0.2)";
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, arcR, Math.PI * 1.6, Math.PI * (1.6 + 0.65 * batPct));
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 6;
    ctx.stroke();

    // Center HUD Time
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${this.shape === "pill" ? 56 : 78}px "ChillDIN", sans-serif`;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(`${d.hours}:${d.minutes}`, cx, cy - 10);

    // Seconds Box
    ctx.font = `bold 16px "ChillDIN", sans-serif`;
    ctx.fillStyle = cyberColor;
    ctx.fillText(`SEC ${d.seconds}`, cx, cy + 38);

    // Top Header: System status
    ctx.font = `bold 10px monospace`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillText(`SYS.ONLINE // 60HZ`, cx, this.shape === "pill" ? 48 : 34);

    // Bottom Telemetry Cards
    ctx.font = `11px monospace`;
    ctx.fillStyle = "#F59E0B";
    ctx.fillText(`BAT: ${d.battery}%  |  HRM: ${d.hrm}BPM`, cx, this.height - (this.shape === "pill" ? 48 : 42));

    ctx.restore();
  }

  // 4. Bauhaus Minimalist Preset
  renderBauhausPreset(ctx, d) {
    const cx = Math.round(this.width / 2);
    const cy = Math.round(this.height / 2);
    const bauhausColor = this.state.presetColors?.bauhaus || "#E63946";

    ctx.save();
    // High contrast off-white cream or deep obsidian
    ctx.fillStyle = "#0f1115";
    ctx.fillRect(0, 0, this.width, this.height);

    // Bauhaus Accent block & Prussian Blue circle
    ctx.fillStyle = bauhausColor;
    ctx.fillRect(16, 24, 8, this.height - 48);

    ctx.fillStyle = "#1D3557";
    ctx.beginPath();
    ctx.arc(this.width - 32, 48, 18, 0, Math.PI * 2);
    ctx.fill();

    // Huge Stacked Typography (Hours on top, Minutes on bottom)
    ctx.font = `bold ${this.shape === "pill" ? 82 : 124}px "ChillDIN", sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#F1FAEE";

    ctx.fillText(d.hours, 36, this.shape === "pill" ? 64 : 48);

    ctx.fillStyle = "#F4A261";
    ctx.fillText(d.minutes, 36, this.shape === "pill" ? 180 : 190);

    // Bauhaus geometric date tag
    ctx.font = `bold 13px sans-serif`;
    ctx.fillStyle = bauhausColor;
    ctx.fillText(`${d.month}.${d.day}`, 38, this.height - (this.shape === "pill" ? 80 : 88));

    ctx.font = `11px monospace`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fillText(`STEPS: ${d.steps} // BAT: ${d.battery}%`, 38, this.height - (this.shape === "pill" ? 54 : 60));

    ctx.restore();
  }

  renderTime(ctx, layer, d) {
    ctx.save();
    ctx.fillStyle = layer.color || this.state.primaryColor;
    const cx = layer.x;
    const cy = layer.y;

    if (this.shape === "pill") {
      // Capsule Band mode (192 x 490)
      const fontSize = layer.fontSize || 66;
      ctx.font = `bold ${fontSize}px "${layer.fontFamily || this.state.fontFamily}", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const sx = layer.scaleX || 0.88;
      const sy = layer.scaleY || 1.25;

      // Left Hours
      ctx.save();
      ctx.translate(cx - 44, cy);
      ctx.scale(sx, sy);
      ctx.fillText(d.hours[0], -18, 0);
      ctx.fillText(d.hours[1], 18, 0);
      ctx.restore();

      // Center Stadium Colon
      ctx.beginPath();
      ctx.roundRect(cx - 3, cy - 12, 6, 8, 2);
      ctx.roundRect(cx - 3, cy + 4, 6, 8, 2);
      ctx.fill();

      // Right Minutes
      ctx.save();
      ctx.translate(cx + 44, cy);
      ctx.scale(sx, sy);
      ctx.fillText(d.minutes[0], -18, 0);
      ctx.fillText(d.minutes[1], 18, 0);
      ctx.restore();

      layer.bounds = {
        x: cx - 80,
        y: cy - 42,
        width: 160,
        height: 84
      };
    } else {
      // Pro Big Screen mode (336 x 480)
      ctx.font = `bold ${layer.fontSize || 136}px "${layer.fontFamily || this.state.fontFamily}", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const sx = layer.scaleX || 0.95;
      const sy = layer.scaleY || 1.25;

      // Left Hours
      ctx.save();
      ctx.translate(cx - 86, cy);
      ctx.scale(sx, sy);
      ctx.fillText(d.hours[0], -36, 0);
      ctx.fillText(d.hours[1], 36, 0);
      ctx.restore();

      // Center Stadium Colon
      ctx.beginPath();
      ctx.roundRect(cx - 4, cy - 22, 8, 18, 4);
      ctx.roundRect(cx - 4, cy + 22, 8, 18, 4);
      ctx.fill();

      // Right Minutes
      ctx.save();
      ctx.translate(cx + 86, cy);
      ctx.scale(sx, sy);
      ctx.fillText(d.minutes[0], -36, 0);
      ctx.fillText(d.minutes[1], 36, 0);
      ctx.restore();

      layer.bounds = {
        x: cx - 145,
        y: cy - 66,
        width: 290,
        height: 132
      };
    }

    ctx.restore();
  }

  renderWeather(ctx, layer, d) {
    ctx.save();
    const x = layer.x;
    const y = layer.y;
    const icon = layer.customIcon || (this.svgIcons[this.state.iconStyle] || this.svgIcons.color).sun;

    const iconSize = this.shape === "pill" ? 18 : 24;
    if (icon && icon.complete) {
      ctx.drawImage(icon, x, y, iconSize, iconSize);
    } else {
      ctx.fillStyle = "#FFB900";
      ctx.beginPath();
      ctx.arc(x + iconSize / 2, y + iconSize / 2, iconSize / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = `bold ${layer.fontSize || (this.shape === "pill" ? 22 : 28)}px "${this.state.fontFamily}", sans-serif`;
    ctx.fillStyle = layer.color || "#F0F0F5";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`${d.temp}°C`, x + iconSize + 6, y + iconSize / 2);

    ctx.restore();

    layer.bounds = { x, y, width: this.shape === "pill" ? 64 : 86, height: iconSize + 4 };
  }

  renderBattery(ctx, layer, d) {
    ctx.save();
    const x = layer.x;
    const y = layer.y;
    const icon = layer.customIcon || (this.svgIcons[this.state.iconStyle] || this.svgIcons.color).battery;
    const iconSize = this.shape === "pill" ? 18 : 22;

    ctx.font = `bold ${layer.fontSize || (this.shape === "pill" ? 22 : 28)}px "${this.state.fontFamily}", sans-serif`;
    ctx.fillStyle = layer.color || "#F0F0F5";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`${d.battery}%`, x, y + iconSize / 2);

    if (icon && icon.complete) {
      ctx.drawImage(icon, x + (this.shape === "pill" ? 38 : 46), y, iconSize, iconSize);
    }

    ctx.restore();

    layer.bounds = { x, y, width: this.shape === "pill" ? 62 : 68, height: iconSize + 4 };
  }

  renderRibbon(ctx, layer, d) {
    ctx.save();
    const x = layer.x;
    const y = layer.y;

    if (this.shape === "pill") {
      ctx.font = 'bold 11px "ChillDIN", sans-serif';
      ctx.fillStyle = "#8E8E93";
      ctx.textAlign = "left";
      ctx.fillText("DATE", x, y + 2);
      ctx.fillText("SEC", x + 116, y + 2);

      ctx.font = `bold 20px "${this.state.fontFamily}", sans-serif`;
      ctx.fillStyle = layer.color || "#F0F0F5";
      ctx.fillText(`${d.month}/${d.day}`, x, y + 22);

      ctx.fillStyle = layer.accentColor || "#F5B432";
      ctx.fillText(d.week, x + 58, y + 22);

      ctx.fillStyle = this.state.primaryColor;
      ctx.fillText(d.seconds, x + 116, y + 22);

      layer.bounds = { x, y, width: this.width - 32, height: 32 };
    } else {
      // Pro Ribbon
      ctx.font = 'bold 12px "ChillDIN", sans-serif';
      ctx.fillStyle = "#8E8E93";
      ctx.textAlign = "left";
      ctx.fillText("DATE", x, y + 6);

      ctx.font = `bold 28px "${this.state.fontFamily}", sans-serif`;
      ctx.fillStyle = layer.color || "#F0F0F5";
      ctx.fillText(`${d.month}/${d.day}`, x, y + 34);

      const weekX = x + 122;
      ctx.font = 'bold 12px "ChillDIN", sans-serif';
      ctx.fillStyle = "#8E8E93";
      ctx.fillText("WEEK", weekX, y + 6);

      ctx.font = `bold 28px "${this.state.fontFamily}", sans-serif`;
      ctx.fillStyle = layer.accentColor || "#F5B432";
      ctx.fillText(d.week, weekX, y + 34);

      const secX = x + 224;
      ctx.font = 'bold 12px "ChillDIN", sans-serif';
      ctx.fillStyle = "#8E8E93";
      ctx.fillText("SEC", secX, y + 6);

      ctx.font = `bold 28px "${this.state.fontFamily}", sans-serif`;
      ctx.fillStyle = this.state.primaryColor;
      ctx.fillText(d.seconds, secX, y + 34);

      layer.bounds = { x, y, width: 308, height: 42 };
    }

    ctx.restore();
  }

  renderSteps(ctx, layer, d) {
    ctx.save();
    const x = layer.x;
    const y = layer.y;
    const icon = layer.customIcon || (this.svgIcons[this.state.iconStyle] || this.svgIcons.color).footprint;

    if (this.shape === "pill") {
      if (icon && icon.complete) {
        ctx.drawImage(icon, x, y, 14, 14);
        ctx.font = 'bold 12px "ChillDIN", sans-serif';
        ctx.fillStyle = "#8E8E93";
        ctx.fillText("STEPS", x + 18, y + 11);
      } else {
        ctx.fillText("STEPS", x, y + 11);
      }

      ctx.font = `bold 22px "${this.state.fontFamily}", sans-serif`;
      ctx.fillStyle = "#F0F0F5";
      ctx.textAlign = "right";
      ctx.fillText(d.steps, x + this.width - 40, y + 12);
      ctx.textAlign = "left";

      this.drawSegmentBar(ctx, x, y + 22, this.width - 40, 9, 8, 5, layer.color || "#00E5FF");
      layer.bounds = { x, y, width: this.width - 40, height: 38 };
    } else {
      // Pro Steps Column
      if (icon && icon.complete) {
        ctx.drawImage(icon, x, y, 14, 14);
        ctx.font = 'bold 13px "ChillDIN", sans-serif';
        ctx.fillStyle = "#8E8E93";
        ctx.fillText("STEPS", x + 18, y + 12);
      } else {
        ctx.fillText("STEPS", x, y + 12);
      }

      ctx.font = `bold 36px "${this.state.fontFamily}", sans-serif`;
      ctx.fillStyle = "#F0F0F5";
      ctx.fillText(d.steps, x, y + 62);

      this.drawSegmentBar(ctx, x, y + 88, 84, 14, 6, 4, layer.color || "#00E5FF");
      layer.bounds = { x, y, width: 90, height: 96 };
    }

    ctx.restore();
  }

  renderHRM(ctx, layer, d) {
    ctx.save();
    const x = layer.x;
    const y = layer.y;
    const icon = layer.customIcon || (this.svgIcons[this.state.iconStyle] || this.svgIcons.color).heart;

    if (this.shape === "pill") {
      if (icon && icon.complete) {
        ctx.drawImage(icon, x, y, 14, 14);
        ctx.font = 'bold 12px "ChillDIN", sans-serif';
        ctx.fillStyle = "#8E8E93";
        ctx.fillText("HRM", x + 18, y + 11);
      } else {
        ctx.fillText("HRM", x, y + 11);
      }

      ctx.font = `bold 22px "${this.state.fontFamily}", sans-serif`;
      ctx.fillStyle = "#F0F0F5";
      ctx.textAlign = "right";
      ctx.fillText(`${d.hrm} BPM`, x + this.width - 40, y + 12);
      ctx.textAlign = "left";

      layer.bounds = { x, y, width: this.width - 40, height: 28 };
    } else {
      // Pro HRM Column
      if (icon && icon.complete) {
        ctx.drawImage(icon, x, y, 14, 14);
        ctx.font = 'bold 13px "ChillDIN", sans-serif';
        ctx.fillStyle = "#8E8E93";
        ctx.fillText("HRM", x + 18, y + 12);
      } else {
        ctx.fillText("HRM", x, y + 12);
      }

      if (layer.bigHrm) {
        ctx.save();
        ctx.translate(x, y + 32);
        ctx.scale(0.85, 1.25);
        ctx.font = `bold 64px "${this.state.fontFamily}", sans-serif`;
        ctx.fillStyle = "#F0F0F5";
        ctx.fillText(d.hrm, 0, 48);
        ctx.restore();
      } else {
        ctx.font = `bold 36px "${this.state.fontFamily}", sans-serif`;
        ctx.fillStyle = "#F0F0F5";
        ctx.fillText(d.hrm, x, y + 62);
      }

      layer.bounds = { x, y, width: 90, height: 96 };
    }

    ctx.restore();
  }

  renderCal(ctx, layer, d) {
    ctx.save();
    const x = layer.x;
    const y = layer.y;
    const icon = layer.customIcon || (this.svgIcons[this.state.iconStyle] || this.svgIcons.color).flame;

    if (this.shape === "pill") {
      if (icon && icon.complete) {
        ctx.drawImage(icon, x, y, 14, 14);
        ctx.font = 'bold 12px "ChillDIN", sans-serif';
        ctx.fillStyle = "#8E8E93";
        ctx.fillText("KCAL", x + 18, y + 11);
      } else {
        ctx.fillText("KCAL", x, y + 11);
      }

      ctx.font = `bold 22px "${this.state.fontFamily}", sans-serif`;
      ctx.fillStyle = "#F0F0F5";
      ctx.textAlign = "right";
      ctx.fillText(d.cal, x + this.width - 40, y + 12);
      ctx.textAlign = "left";

      this.drawSegmentBar(ctx, x, y + 22, this.width - 40, 9, 8, 4, layer.color || "#FF7000");
      layer.bounds = { x, y, width: this.width - 40, height: 38 };
    } else {
      // Pro KCAL Column
      if (icon && icon.complete) {
        ctx.drawImage(icon, x, y, 14, 14);
        ctx.font = 'bold 13px "ChillDIN", sans-serif';
        ctx.fillStyle = "#8E8E93";
        ctx.fillText("KCAL", x + 18, y + 12);
      } else {
        ctx.fillText("KCAL", x, y + 12);
      }

      ctx.font = `bold 36px "${this.state.fontFamily}", sans-serif`;
      ctx.fillStyle = "#F0F0F5";
      ctx.fillText(d.cal, x, y + 62);

      this.drawSegmentBar(ctx, x, y + 88, 84, 14, 6, 4, layer.color || "#FF7000");
      layer.bounds = { x, y, width: 90, height: 96 };
    }

    ctx.restore();
  }

  renderCustomImage(ctx, layer) {
    if (!layer.img || !layer.img.complete) return;
    ctx.save();
    ctx.globalAlpha = layer.opacity || 1.0;
    ctx.drawImage(layer.img, layer.x, layer.y, layer.width, layer.height);
    ctx.restore();

    layer.bounds = { x: layer.x, y: layer.y, width: layer.width, height: layer.height };
  }

  renderCustomText(ctx, layer) {
    ctx.save();
    ctx.globalAlpha = layer.opacity || 1.0;
    ctx.font = `bold ${layer.fontSize || 16}px "${layer.fontFamily || 'Space Mono'}", sans-serif`;
    ctx.fillStyle = layer.color || "#FFFFFF";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(layer.text, layer.x, layer.y);

    const m = ctx.measureText(layer.text);
    layer.width = Math.ceil(m.width);
    layer.height = Math.ceil((layer.fontSize || 16) * 1.2);
    ctx.restore();

    layer.bounds = { x: layer.x, y: layer.y, width: layer.width, height: layer.height };
  }

  drawSegmentBar(ctx, x, y, width, height, total, active, color) {
    const gap = 3;
    const segW = Math.floor((width - (total - 1) * gap) / total);
    const segH = height - 2;
    const totalW = total * segW + (total - 1) * gap;
    const startX = x + Math.floor((width - totalW) / 2);
    const startY = y + Math.floor((height - segH) / 2);

    for (let i = 0; i < total; i++) {
      const curX = startX + i * (segW + gap);
      ctx.beginPath();
      ctx.roundRect(curX, startY, segW, segH, 2);
      if (i < active) {
        ctx.fillStyle = color;
        ctx.fill();
      } else {
        ctx.fillStyle = "#24262C";
        ctx.fill();
        ctx.strokeStyle = "#383A40";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  drawAOD(ctx, d) {
    ctx.save();
    ctx.globalAlpha = 0.8;
    const cx = Math.round(this.width / 2);

    if (this.shape === "pill") {
      ctx.fillStyle = this.state.primaryColor;
      ctx.font = `bold 66px "${this.state.fontFamily}", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(`${d.hours}:${d.minutes}`, cx, 180);

      ctx.font = 'bold 18px "ChillDIN", sans-serif';
      ctx.fillStyle = "#D4D4D8";
      ctx.fillText(`${d.month}/${d.day} ${d.week}`, cx, 240);
    } else {
      ctx.fillStyle = this.state.primaryColor;
      ctx.save();
      ctx.translate(0, 96);
      ctx.scale(0.95, 1.25);
      ctx.font = 'bold 136px "ChillDIN", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText(d.hours[0], 52, 68);
      ctx.fillText(d.hours[1], 122, 68);
      ctx.fillText(d.minutes[0], 230, 68);
      ctx.fillText(d.minutes[1], 300, 68);
      ctx.restore();

      ctx.beginPath();
      ctx.roundRect(164, 150, 8, 18, 4);
      ctx.roundRect(164, 194, 8, 18, 4);
      ctx.fill();

      ctx.font = 'bold 12px "ChillDIN", sans-serif';
      ctx.fillStyle = "#8E8E93";
      ctx.textAlign = "left";
      ctx.fillText("DATE", 14, 280);
      ctx.fillText("WEEK", 136, 280);

      ctx.font = 'bold 28px "ChillDIN", sans-serif';
      ctx.fillStyle = "#D4D4D8";
      ctx.fillText(`${d.month}/${d.day}`, 14, 308);
      ctx.fillStyle = "#F5B432";
      ctx.fillText(d.week, 136, 308);
    }

    ctx.restore();
  }

  // ================= Interactive Gizmo Overlay =================
  renderGizmo(ctx) {
    if (this.state.currentPreset !== "retro_chrono") {
      const selected = this.getSelectedLayer();
      if (!selected || (selected.type !== "custom_image" && selected.type !== "custom_text")) {
        return;
      }
    }

    const layer = this.getSelectedLayer();
    if (!layer || layer.type === "bg" || !layer.visible) return;

    const b = layer.bounds;
    if (!b) return;

    ctx.save();

    // 1. Snapping Guides
    if (this.snapGuideX !== null) {
      ctx.strokeStyle = "#00E5FF";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(this.snapGuideX, 0);
      ctx.lineTo(this.snapGuideX, this.height);
      ctx.stroke();
    }

    if (this.snapGuideY !== null) {
      ctx.strokeStyle = "#00E5FF";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, this.snapGuideY);
      ctx.lineTo(this.width, this.snapGuideY);
      ctx.stroke();
    }

    // 2. Selection Bounding Box (Linear aesthetic electric blue)
    ctx.strokeStyle = "#5E6AD2";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(b.x - 2, b.y - 2, b.width + 4, b.height + 4);

    // 3. Four Corner Handles
    ctx.setLineDash([]);
    ctx.fillStyle = "#5E6AD2";
    const handleSize = 6;
    const corners = [
      { x: b.x - 2 - handleSize / 2, y: b.y - 2 - handleSize / 2 },
      { x: b.x + b.width + 2 - handleSize / 2, y: b.y - 2 - handleSize / 2 },
      { x: b.x - 2 - handleSize / 2, y: b.y + b.height + 2 - handleSize / 2 },
      { x: b.x + b.width + 2 - handleSize / 2, y: b.y + b.height + 2 - handleSize / 2 }
    ];

    corners.forEach((c) => {
      ctx.fillRect(c.x, c.y, handleSize, handleSize);
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 1;
      ctx.strokeRect(c.x, c.y, handleSize, handleSize);
    });

    // 4. Floating Coordinates Tooltip Badge
    const tagText = `${layer.name.split(" ")[0]} X:${Math.round(layer.x)} Y:${Math.round(layer.y)}`;
    ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const tagW = ctx.measureText(tagText).width + 12;
    const tagH = 20;
    const tagX = Math.max(4, Math.min(this.width - tagW - 4, b.x));
    const tagY = b.y - 24 > 4 ? b.y - 24 : b.y + b.height + 6;

    ctx.fillStyle = "rgba(10, 10, 15, 0.92)";
    ctx.beginPath();
    ctx.roundRect(tagX, tagY, tagW, tagH, 4);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(tagText, tagX + 6, tagY + tagH / 2);

    ctx.restore();
  }

  setPrimaryColor(hex) {
    this.state.primaryColor = hex;
    const timeLayer = this.getLayer("time");
    if (timeLayer) timeLayer.color = hex;
  }

  /**
   * Export clean watchface snapshot without editor Gizmo bounding box or guidelines
   * @param {number} targetWidth - e.g. 230 or 336
   * @param {number} targetHeight - e.g. 328 or 480
   * @returns {string} DataURL (image/png)
   */
  exportImage(targetWidth = 336, targetHeight = 480) {
    const offCanvas = document.createElement("canvas");
    offCanvas.width = this.width;
    offCanvas.height = this.height;
    const offCtx = offCanvas.getContext("2d");

    // 1. Clip to rounded pill if in capsule mode
    offCtx.save();
    if (this.shape === "pill") {
      offCtx.beginPath();
      offCtx.roundRect(0, 0, this.width, this.height, this.radius || 96);
      offCtx.clip();
    }

    const d = this.getTimeData();

    // 2. Render background and all active layers cleanly
    this.renderBackground(offCtx);

    if (this.state.isAOD) {
      if (this.state.currentPreset === "analog_luxe") {
        this.renderAnalogPreset(offCtx, d, true);
      } else if (this.state.currentPreset === "gallery_photo") {
        this.renderGalleryPresetAOD(offCtx, d);
      } else if (this.state.currentPreset === "cyber_hud") {
        this.renderCyberPresetAOD(offCtx, d);
      } else if (this.state.currentPreset === "bauhaus_minimal") {
        this.renderBauhausPresetAOD(offCtx, d);
      } else {
        this.drawAOD(offCtx, d);
      }
    } else {
      if (this.state.currentPreset === "analog_luxe") {
        this.renderAnalogPreset(offCtx, d);
      } else if (this.state.currentPreset === "gallery_photo") {
        this.renderGalleryPreset(offCtx, d);
      } else if (this.state.currentPreset === "cyber_hud") {
        this.renderCyberPreset(offCtx, d);
      } else if (this.state.currentPreset === "bauhaus_minimal") {
        this.renderBauhausPreset(offCtx, d);
      } else {
        this.layers.forEach((layer) => {
          if (!layer.visible) return;
          switch (layer.type) {
            case "time":
              this.renderTime(offCtx, layer, d);
              break;
            case "weather":
              this.renderWeather(offCtx, layer, d);
              break;
            case "battery":
              this.renderBattery(offCtx, layer, d);
              break;
            case "ribbon":
              this.renderRibbon(offCtx, layer, d);
              break;
            case "steps":
              this.renderSteps(offCtx, layer, d);
              break;
            case "hrm":
              this.renderHRM(offCtx, layer, d);
              break;
            case "cal":
              this.renderCal(offCtx, layer, d);
              break;
          }
        });
      }

      // Render custom stickers / texts on top
      this.layers.forEach((layer) => {
        if (!layer.visible) return;
        if (layer.type === "custom_image") {
          this.renderCustomImage(offCtx, layer);
        } else if (layer.type === "custom_text") {
          this.renderCustomText(offCtx, layer);
        }
      });
    }

    offCtx.restore();

    // 3. If exact dimensions match, return directly
    if (targetWidth === this.width && targetHeight === this.height) {
      return offCanvas.toDataURL("image/png");
    }

    // 4. Bicubic High-Quality Scaling for 230x328, 336x480, etc.
    const scaledCanvas = document.createElement("canvas");
    scaledCanvas.width = targetWidth;
    scaledCanvas.height = targetHeight;
    const scaledCtx = scaledCanvas.getContext("2d");
    scaledCtx.imageSmoothingEnabled = true;
    scaledCtx.imageSmoothingQuality = "high";

    // Fill AMOLED pure black background for letterboxing if needed
    scaledCtx.fillStyle = "#000000";
    scaledCtx.fillRect(0, 0, targetWidth, targetHeight);

    // If source and target aspect ratios are close (e.g. 336x480 to 230x328: 0.7000 vs 0.7012)
    const srcRatio = this.width / this.height;
    const targetRatio = targetWidth / targetHeight;

    if (Math.abs(srcRatio - targetRatio) < 0.05) {
      scaledCtx.drawImage(offCanvas, 0, 0, this.width, this.height, 0, 0, targetWidth, targetHeight);
    } else {
      // Contain / Fit with center alignment
      const scale = Math.min(targetWidth / this.width, targetHeight / this.height);
      const dw = Math.round(this.width * scale);
      const dh = Math.round(this.height * scale);
      const dx = Math.round((targetWidth - dw) / 2);
      const dy = Math.round((targetHeight - dh) / 2);
      scaledCtx.drawImage(offCanvas, 0, 0, this.width, this.height, dx, dy, dw, dh);
    }

    return scaledCanvas.toDataURL("image/png");
  }
}

window.WatchfaceRenderer = new WatchfaceRenderer();
