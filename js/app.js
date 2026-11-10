/**
 * VelaCraft Main Application Controller
 * Wires up Linear-aesthetic UI interactions, state synchronization,
 * direct canvas manipulation, layer inspector, asset pipeline, and shortcuts.
 */

document.addEventListener("DOMContentLoaded", () => {
  try {
  const renderer = window.WatchfaceRenderer;
  const sketch = window.CanvasSketch;
  const packer = window.VelaPacker;
  const ai = window.AIVision;
  const ble = window.WebBLEManager;

  // ================= Toast System =================
  function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = "toast";

    const icon = type === "success" ? "✓" : type === "error" ? "⚠️" : "✦";
    const color = type === "success" ? "var(--success)" : type === "error" ? "var(--danger)" : "var(--accent)";

    toast.innerHTML = `
      <span style="color: ${color}; font-weight: bold;">${icon}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(12px)";
      toast.style.transition = "0.2s cubic-bezier(0.16, 1, 0.3, 1)";
      setTimeout(() => toast.remove(), 200);
    }, 3200);
  }

  // ================= Mode Switcher: Inspector vs Global =================
  const tabInspectorBtn = document.getElementById("tabInspectorBtn");
  const tabGlobalBtn = document.getElementById("tabGlobalBtn");
  const inspectorTabContent = document.getElementById("inspectorTabContent");
  const globalTabContent = document.getElementById("globalTabContent");

  tabInspectorBtn.addEventListener("click", () => {
    tabInspectorBtn.classList.add("active");
    tabGlobalBtn.classList.remove("active");
    inspectorTabContent.style.display = "flex";
    globalTabContent.style.display = "none";
  });

  tabGlobalBtn.addEventListener("click", () => {
    tabGlobalBtn.classList.add("active");
    tabInspectorBtn.classList.remove("active");
    inspectorTabContent.style.display = "none";
    globalTabContent.style.display = "flex";
  });

  // ================= Inspector Elements Reference =================
  const activeLayerPill = document.getElementById("activeLayerPill");
  const layerSelect = document.getElementById("layerSelect");
  const propX = document.getElementById("propX");
  const propXSlider = document.getElementById("propXSlider");
  const propY = document.getElementById("propY");
  const propYSlider = document.getElementById("propYSlider");

  const rowFontSize = document.getElementById("rowFontSize");
  const propFontSize = document.getElementById("propFontSize");
  const labelFontSize = document.getElementById("labelFontSize");

  const rowScaleX = document.getElementById("rowScaleX");
  const propScaleX = document.getElementById("propScaleX");
  const labelScaleX = document.getElementById("labelScaleX");

  const rowScaleY = document.getElementById("rowScaleY");
  const propScaleY = document.getElementById("propScaleY");
  const labelScaleY = document.getElementById("labelScaleY");

  const groupCustomText = document.getElementById("groupCustomText");
  const propCustomText = document.getElementById("propCustomText");
  const propLayerColor = document.getElementById("propLayerColor");

  const assetBoxBg = document.getElementById("assetBoxBg");
  const assetBoxIcon = document.getElementById("assetBoxIcon");
  const assetBoxCustom = document.getElementById("assetBoxCustom");

  // Sync Layer options in dropdown
  function refreshLayerDropdown() {
    layerSelect.innerHTML = "";

    if (renderer.state.currentPreset !== "retro_chrono") {
      const presetNames = {
        analog_luxe: "⌚ 拟真机械 (主表盘)",
        gallery_photo: "🌄 画廊写真 (主表盘)",
        cyber_hud: "⚡ 赛博机能 (主表盘)",
        bauhaus_minimal: "🎨 德系包豪斯 (主表盘)"
      };
      const opt = document.createElement("option");
      opt.value = "preset_root";
      opt.text = presetNames[renderer.state.currentPreset] || "⌚ 当前预设表盘";
      opt.selected = !renderer.selectedLayerId;
      layerSelect.appendChild(opt);

      // Also list any custom stickers or texts
      renderer.layers.forEach((l) => {
        if (l.type === "custom_image" || l.type === "custom_text") {
          const customOpt = document.createElement("option");
          customOpt.value = l.id;
          customOpt.text = (l.type === "custom_image" ? "🖼️ " : "🔤 ") + l.name;
          if (l.id === renderer.selectedLayerId) customOpt.selected = true;
          layerSelect.appendChild(customOpt);
        }
      });
      return;
    }

    renderer.layers.forEach((l) => {
      const opt = document.createElement("option");
      opt.value = l.id;
      opt.text = l.name;
      if (l.id === renderer.selectedLayerId) opt.selected = true;
      layerSelect.appendChild(opt);
    });
  }

  // Synchronize UI with selected layer
  function syncInspector(layer) {
    const isPreset = renderer.state.currentPreset !== "retro_chrono";
    const presetInspectorCard = document.getElementById("presetInspectorCard");
    const retroInspectorControls = document.getElementById("retroInspectorControls");
    const presetTuneTitle = document.getElementById("presetTuneTitle");
    const presetTuneDesc = document.getElementById("presetTuneDesc");
    const presetThemeColor = document.getElementById("presetThemeColor");
    const presetThemeColorVal = document.getElementById("presetThemeColorVal");

    if (isPreset && (!layer || (layer.type !== "custom_image" && layer.type !== "custom_text"))) {
      // Specialized Preset is active (no custom layer selected)
      if (presetInspectorCard) presetInspectorCard.style.display = "flex";
      if (retroInspectorControls) retroInspectorControls.style.display = "none";
      if (activeLayerPill) {
        const pNames = {
          analog_luxe: "拟真机械",
          gallery_photo: "画廊写真",
          cyber_hud: "赛博机能",
          bauhaus_minimal: "德系包豪斯"
        };
        activeLayerPill.innerText = pNames[renderer.state.currentPreset] || "预设表盘";
      }

      if (presetTuneTitle && presetTuneDesc) {
        const presetMeta = {
          analog_luxe: {
            title: "拟真机械 · Luxe",
            desc: "经典太阳放射纹三针走时，高精度实时动力指针与副表盘步数统计。",
            color: renderer.state.presetColors?.analog || "#FF3344",
            colorLabel: "秒针与副盘配色"
          },
          gallery_photo: {
            title: "画廊写真 · Photo",
            desc: "全景相册渐变壁纸搭配毛玻璃磨砂浮层，清晰数显与系统状态一览。",
            color: renderer.state.presetColors?.gallery || "#FFFFFF",
            colorLabel: "卡片微调色"
          },
          cyber_hud: {
            title: "赛博机能 · HUD",
            desc: "未来机能风双弧形仪表盘（步数与电量），荧光等宽时钟与秒数独立框。",
            color: renderer.state.presetColors?.cyber || "#00E5FF",
            colorLabel: "机能荧光配色"
          },
          bauhaus_minimal: {
            title: "德系包豪斯 · Minimal",
            desc: "极简包豪斯红蓝几何色块，高对比度不对称超大字体上下叠排。",
            color: renderer.state.presetColors?.bauhaus || "#E63946",
            colorLabel: "主几何色调"
          }
        };
        const meta = presetMeta[renderer.state.currentPreset] || { title: "预设表盘", desc: "一体化表盘布局", color: "#00E5FF", colorLabel: "主题微调色" };
        presetTuneTitle.innerText = meta.title;
        presetTuneDesc.innerText = meta.desc;
        const presetThemeColorLabel = document.getElementById("presetThemeColorLabel");
        if (presetThemeColorLabel) presetThemeColorLabel.innerText = meta.colorLabel;
        if (presetThemeColor) presetThemeColor.value = meta.color;
        if (presetThemeColorVal) presetThemeColorVal.innerText = meta.color;
      }

      // Render preset quick color palette swatches
      const presetColorSwatches = document.getElementById("presetColorSwatches");
      if (presetColorSwatches) {
        presetColorSwatches.innerHTML = "";
        const swatchesByPreset = {
          analog_luxe: ["#FF3344", "#00E5FF", "#F59E0B", "#10B981", "#E11D48"],
          cyber_hud: ["#00E5FF", "#10B981", "#EC4899", "#F59E0B", "#6366F1"],
          bauhaus_minimal: ["#E63946", "#2563EB", "#EAB308", "#10B981", "#94A3B8"]
        };
        const colors = swatchesByPreset[renderer.state.currentPreset];
        if (colors && colors.length > 0) {
          presetColorSwatches.style.display = "flex";
          const currentColor = renderer.state.presetColors?.[renderer.state.currentPreset === "analog_luxe" ? "analog" : renderer.state.currentPreset === "cyber_hud" ? "cyber" : "bauhaus"] || colors[0];
          colors.forEach((col) => {
            const btn = document.createElement("button");
            btn.className = `preset-swatch-btn ${col.toUpperCase() === currentColor.toUpperCase() ? "active" : ""}`;
            btn.style.backgroundColor = col;
            btn.title = col;
            btn.addEventListener("click", () => {
              if (presetThemeColor) presetThemeColor.value = col;
              if (presetThemeColorVal) presetThemeColorVal.innerText = col;
              if (!renderer.state.presetColors) renderer.state.presetColors = {};
              const p = renderer.state.currentPreset;
              if (p === "analog_luxe") renderer.state.presetColors.analog = col;
              else if (p === "cyber_hud") renderer.state.presetColors.cyber = col;
              else if (p === "bauhaus_minimal") renderer.state.presetColors.bauhaus = col;
              presetColorSwatches.querySelectorAll(".preset-swatch-btn").forEach((b) => b.classList.toggle("active", b === btn));
              renderer.draw();
            });
            presetColorSwatches.appendChild(btn);
          });
        } else {
          presetColorSwatches.style.display = "none";
        }
      }

      // Toggle Mechanical Dial Selector in inspector
      const analogDialSection = document.getElementById("analogDialSection");
      if (renderer.state.currentPreset === "analog_luxe") {
        if (analogDialSection) {
          analogDialSection.style.display = "block";
          const currentDial = renderer.state.analogDial || "titanium";
          analogDialGrid?.querySelectorAll(".gallery-thumb-btn").forEach((b) => {
            b.classList.toggle("active", b.dataset.dial === currentDial);
          });
        }
      } else {
        if (analogDialSection) analogDialSection.style.display = "none";
      }

      // Toggle Gallery Wallpaper Switcher in inspector
      const galleryWallpaperSection = document.getElementById("galleryWallpaperSection");
      const presetThemeColorRow = document.getElementById("presetThemeColorRow");
      if (renderer.state.currentPreset === "gallery_photo") {
        if (galleryWallpaperSection) galleryWallpaperSection.style.display = "block";
        if (presetThemeColorRow) presetThemeColorRow.style.display = "none";
      } else {
        if (galleryWallpaperSection) galleryWallpaperSection.style.display = "none";
        if (presetThemeColorRow) presetThemeColorRow.style.display = "flex";
      }

      // Hide custom layer controls
      if (rowFontSize) rowFontSize.style.display = "none";
      if (rowScaleX) rowScaleX.style.display = "none";
      if (rowScaleY) rowScaleY.style.display = "none";
      if (groupCustomText) groupCustomText.style.display = "none";
      if (assetBoxBg) assetBoxBg.style.display = "none";
      if (assetBoxIcon) assetBoxIcon.style.display = "none";
      if (assetBoxCustom) assetBoxCustom.style.display = "none";

      const hudCoords = document.getElementById("hudCoords");
      if (hudCoords) hudCoords.innerText = "预设居中";
      return;
    }

    // Custom Layer or Retro Chrono layer selected
    if (presetInspectorCard) presetInspectorCard.style.display = "none";
    if (retroInspectorControls) retroInspectorControls.style.display = "block";

    if (!layer) {
      if (activeLayerPill) activeLayerPill.innerText = "未选中";
      if (rowFontSize) rowFontSize.style.display = "none";
      if (rowScaleX) rowScaleX.style.display = "none";
      if (rowScaleY) rowScaleY.style.display = "none";
      if (groupCustomText) groupCustomText.style.display = "none";
      if (assetBoxBg) assetBoxBg.style.display = "none";
      if (assetBoxIcon) assetBoxIcon.style.display = "none";
      if (assetBoxCustom) assetBoxCustom.style.display = "none";
      return;
    }

    activeLayerPill.innerText = layer.name.split(" ")[0];
    layerSelect.value = layer.id;

    // Position coordinates
    const curX = Math.round(layer.x || 0);
    const curY = Math.round(layer.y || 0);
    propX.value = curX;
    propXSlider.value = curX;
    propY.value = curY;
    propYSlider.value = curY;

    const hudCoords = document.getElementById("hudCoords");
    if (hudCoords) {
      hudCoords.innerText = `X: ${curX}, Y: ${curY}`;
    }

    // Font size
    if (typeof layer.fontSize === "number") {
      rowFontSize.style.display = "flex";
      propFontSize.value = layer.fontSize;
      labelFontSize.innerText = `${layer.fontSize} px`;
    } else {
      rowFontSize.style.display = "none";
    }

    // Scale X & Y
    if (typeof layer.scaleX === "number") {
      rowScaleX.style.display = "flex";
      rowScaleY.style.display = "flex";
      propScaleX.value = layer.scaleX;
      labelScaleX.innerText = layer.scaleX.toFixed(2);
      propScaleY.value = layer.scaleY;
      labelScaleY.innerText = layer.scaleY.toFixed(2);
    } else {
      rowScaleX.style.display = "none";
      rowScaleY.style.display = "none";
    }

    // Custom Text
    if (layer.type === "custom_text") {
      groupCustomText.style.display = "flex";
      propCustomText.value = layer.text || "";
    } else {
      groupCustomText.style.display = "none";
    }

    // Layer Color
    propLayerColor.value = layer.color || renderer.state.primaryColor || "#D4D4D8";

    // Asset boxes
    if (layer.type === "bg") {
      assetBoxBg.style.display = "block";
      assetBoxIcon.style.display = "none";
      assetBoxCustom.style.display = "none";
    } else if (["weather", "battery", "steps", "hrm", "cal"].includes(layer.type)) {
      assetBoxBg.style.display = "none";
      assetBoxIcon.style.display = "block";
      assetBoxCustom.style.display = "none";
    } else if (layer.type === "custom_image" || layer.type === "custom_text") {
      assetBoxBg.style.display = "none";
      assetBoxIcon.style.display = "none";
      assetBoxCustom.style.display = "block";
    } else {
      assetBoxBg.style.display = "none";
      assetBoxIcon.style.display = "none";
      assetBoxCustom.style.display = "none";
    }
  }

  renderer.onSelectionChange = (layer) => {
    syncInspector(layer);
  };

  layerSelect.addEventListener("change", (e) => {
    if (e.target.value === "preset_root") {
      renderer.selectLayer(null);
      syncInspector(null);
    } else {
      renderer.selectLayer(e.target.value);
    }
  });

  // Preset Customizer Strip Handlers
  const presetThemeColor = document.getElementById("presetThemeColor");
  const presetThemeColorVal = document.getElementById("presetThemeColorVal");
  if (presetThemeColor) {
    presetThemeColor.addEventListener("input", (e) => {
      const col = e.target.value;
      if (presetThemeColorVal) presetThemeColorVal.innerText = col;
      if (!renderer.state.presetColors) renderer.state.presetColors = {};
      const p = renderer.state.currentPreset;
      if (p === "analog_luxe") renderer.state.presetColors.analog = col;
      else if (p === "gallery_photo") renderer.state.presetColors.gallery = col;
      else if (p === "cyber_hud") renderer.state.presetColors.cyber = col;
      else if (p === "bauhaus_minimal") renderer.state.presetColors.bauhaus = col;
      const presetColorSwatches = document.getElementById("presetColorSwatches");
      if (presetColorSwatches) {
        presetColorSwatches.querySelectorAll(".preset-swatch-btn").forEach((b) => {
          b.classList.toggle("active", b.title.toUpperCase() === col.toUpperCase());
        });
      }
      renderer.draw();
    });
  }

  // ================= Mechanical Chronometer Dial Face Switcher =================
  const analogDialGrid = document.getElementById("analogDialGrid");
  if (analogDialGrid) {
    const dialBtns = analogDialGrid.querySelectorAll(".gallery-thumb-btn");
    dialBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        dialBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const dial = btn.dataset.dial;
        renderer.setAnalogDial(dial);
        showToast(`已应用机械盘面材质：「${btn.title}」`, "info");
      });
    });
  }

  // ================= Gallery Photo Wallpaper Switcher =================
  const galleryThumbsGrid = document.getElementById("galleryThumbsGrid");
  const btnUploadGalleryPhoto = document.getElementById("btnUploadGalleryPhoto");
  const btnClearGalleryPhoto = document.getElementById("btnClearGalleryPhoto");
  const galleryPhotoFileInput = document.getElementById("galleryPhotoFileInput");

  if (galleryThumbsGrid) {
    const thumbBtns = galleryThumbsGrid.querySelectorAll(".gallery-thumb-btn");
    thumbBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        thumbBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const theme = btn.dataset.theme;
        renderer.setGalleryTheme(theme);
        showToast(`已切换画廊底图：「${btn.title}」`, "info");
      });
    });
  }

  if (btnUploadGalleryPhoto && galleryPhotoFileInput) {
    btnUploadGalleryPhoto.addEventListener("click", () => galleryPhotoFileInput.click());
    galleryPhotoFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          renderer.setGalleryCustomImage(evt.target.result);
          if (galleryThumbsGrid) {
            galleryThumbsGrid.querySelectorAll(".gallery-thumb-btn").forEach((b) => b.classList.remove("active"));
          }
          showToast(`已上传并应用画廊自定义照片：「${file.name}」！`, "success");
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (btnClearGalleryPhoto) {
    btnClearGalleryPhoto.addEventListener("click", () => {
      renderer.setGalleryTheme("sunset");
      if (galleryThumbsGrid) {
        const thumbBtns = galleryThumbsGrid.querySelectorAll(".gallery-thumb-btn");
        thumbBtns.forEach((b) => b.classList.remove("active"));
        const first = galleryThumbsGrid.querySelector('[data-theme="sunset"]');
        if (first) first.classList.add("active");
      }
      showToast("已恢复默认日落相册底图");
    });
  }

  // Preset Customizer Strip Handlers (Sticker & Text)
  // Wires to unified sticker picker modal below
  const btnPresetAddSticker = document.getElementById("btnPresetAddSticker");
  const btnPresetAddText = document.getElementById("btnPresetAddText");

  // Position Inputs & Sliders
  function updateX(val) {
    const x = parseInt(val, 10);
    propX.value = x;
    propXSlider.value = x;
    renderer.setLayerPosition(renderer.selectedLayerId, x, propY.value);
    const hudCoords = document.getElementById("hudCoords");
    if (hudCoords) {
      hudCoords.innerText = `X: ${x}, Y: ${propY.value}`;
    }
  }

  function updateY(val) {
    const y = parseInt(val, 10);
    propY.value = y;
    propYSlider.value = y;
    renderer.setLayerPosition(renderer.selectedLayerId, propX.value, y);
    const hudCoords = document.getElementById("hudCoords");
    if (hudCoords) {
      hudCoords.innerText = `X: ${propX.value}, Y: ${y}`;
    }
  }

  propX.addEventListener("input", (e) => updateX(e.target.value));
  propXSlider.addEventListener("input", (e) => updateX(e.target.value));
  propY.addEventListener("input", (e) => updateY(e.target.value));
  propYSlider.addEventListener("input", (e) => updateY(e.target.value));

  // Alignment Buttons
  document.getElementById("alignLeft").addEventListener("click", () => {
    renderer.alignLayer(renderer.selectedLayerId, "left");
    syncInspector(renderer.getSelectedLayer());
  });
  document.getElementById("alignCenterX").addEventListener("click", () => {
    renderer.alignLayer(renderer.selectedLayerId, "centerX");
    syncInspector(renderer.getSelectedLayer());
  });
  document.getElementById("alignRight").addEventListener("click", () => {
    renderer.alignLayer(renderer.selectedLayerId, "right");
    syncInspector(renderer.getSelectedLayer());
  });
  document.getElementById("alignTop").addEventListener("click", () => {
    renderer.alignLayer(renderer.selectedLayerId, "top");
    syncInspector(renderer.getSelectedLayer());
  });
  document.getElementById("alignCenterY").addEventListener("click", () => {
    renderer.alignLayer(renderer.selectedLayerId, "centerY");
    syncInspector(renderer.getSelectedLayer());
  });
  document.getElementById("alignBottom").addEventListener("click", () => {
    renderer.alignLayer(renderer.selectedLayerId, "bottom");
    syncInspector(renderer.getSelectedLayer());
  });
  document.getElementById("alignReset").addEventListener("click", () => {
    renderer.alignLayer(renderer.selectedLayerId, "reset");
    syncInspector(renderer.getSelectedLayer());
    showToast("已重置该组件位置");
  });

  // Scale & Font Size
  propFontSize.addEventListener("input", (e) => {
    const layer = renderer.getSelectedLayer();
    if (!layer) return;
    layer.fontSize = parseInt(e.target.value, 10);
    labelFontSize.innerText = `${layer.fontSize} px`;
    renderer.updateLayerBounds(layer);
  });

  propScaleX.addEventListener("input", (e) => {
    const layer = renderer.getSelectedLayer();
    if (!layer) return;
    layer.scaleX = parseFloat(e.target.value);
    labelScaleX.innerText = layer.scaleX.toFixed(2);
    renderer.updateLayerBounds(layer);
  });

  propScaleY.addEventListener("input", (e) => {
    const layer = renderer.getSelectedLayer();
    if (!layer) return;
    layer.scaleY = parseFloat(e.target.value);
    labelScaleY.innerText = layer.scaleY.toFixed(2);
    renderer.updateLayerBounds(layer);
  });

  // Custom text input
  propCustomText.addEventListener("input", (e) => {
    const layer = renderer.getSelectedLayer();
    if (layer && layer.type === "custom_text") {
      layer.text = e.target.value;
    }
  });

  // Layer Color
  propLayerColor.addEventListener("input", (e) => {
    const layer = renderer.getSelectedLayer();
    if (layer) {
      layer.color = e.target.value;
      if (layer.id === "time") {
        renderer.state.primaryColor = e.target.value;
      }
    }
  });

  // ================= Asset Replacement Pipeline =================
  // 1. Wallpaper upload
  const btnUploadWallpaper = document.getElementById("btnUploadWallpaper");
  const wallpaperFileInput = document.getElementById("wallpaperFileInput");
  const btnClearWallpaper = document.getElementById("btnClearWallpaper");

  btnUploadWallpaper.addEventListener("click", () => wallpaperFileInput.click());
  wallpaperFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        renderer.setLayerCustomAsset("bg", evt.target.result);
        showToast("已上传并应用自定义壁纸！", "success");
      };
      reader.readAsDataURL(file);
    }
  });
  btnClearWallpaper.addEventListener("click", () => {
    renderer.clearLayerCustomAsset("bg");
    showToast("已恢复 AMOLED 纯黑背景");
  });

  // 2. Component Custom Icon upload
  const btnUploadCustomIcon = document.getElementById("btnUploadCustomIcon");
  const iconFileInput = document.getElementById("iconFileInput");
  const btnClearCustomIcon = document.getElementById("btnClearCustomIcon");

  btnUploadCustomIcon.addEventListener("click", () => iconFileInput.click());
  iconFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        renderer.setLayerCustomAsset(renderer.selectedLayerId, evt.target.result);
        showToast("已替换组件专属矢量图标！", "success");
      };
      reader.readAsDataURL(file);
    }
  });
  btnClearCustomIcon.addEventListener("click", () => {
    renderer.clearLayerCustomAsset(renderer.selectedLayerId);
    showToast("已恢复默认内置矢量图标");
  });

  // 3. Delete custom layer
  const btnDeleteSelectedLayer = document.getElementById("btnDeleteSelectedLayer");
  btnDeleteSelectedLayer.addEventListener("click", () => {
    renderer.deleteLayer(renderer.selectedLayerId);
    refreshLayerDropdown();
    syncInspector(renderer.getSelectedLayer());
    showToast("已删除该自定义图层");
  });

  // ================= Sticker Library & Modal System =================
  const stickerModal = document.getElementById("stickerModal");
  const closeStickerModal = document.getElementById("closeStickerModal");
  const btnUploadLocalSticker = document.getElementById("btnUploadLocalSticker");
  const stickerFileInput = document.getElementById("stickerFileInput");
  const presetStickersGrid = document.getElementById("presetStickersGrid");

  const builtInStickers = [
    {
      name: "赛博闪电",
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#00E5FF" stroke="#FFD600" stroke-width="1.5" stroke-linejoin="round"/></svg>`
    },
    {
      name: "机能探索",
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 16.5C3 18 3 21 3 21C3 21 6 21 7.5 19.5L14.5 12.5L9.5 7.5L4.5 16.5Z" fill="#FF3344"/><path d="M14.5 12.5L19 8C20.5 6.5 21 3 21 3C21 3 17.5 3.5 16 5L11.5 9.5" stroke="#FF9F1C" stroke-width="2"/><circle cx="15.5" cy="8.5" r="1.5" fill="#FFFFFF"/></svg>`
    },
    {
      name: "极客像素",
      svg: `<svg viewBox="0 0 24 24" fill="#CCFF00" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="6" width="4" height="6"/><rect x="16" y="6" width="4" height="6"/><rect x="6" y="10" width="12" height="10"/><rect x="8" y="13" width="2" height="2" fill="#000"/><rect x="14" y="13" width="2" height="2" fill="#000"/><rect x="10" y="17" width="4" height="1.5" fill="#000"/></svg>`
    },
    {
      name: "赛博耀星",
      svg: `<svg viewBox="0 0 24 24" fill="#FFD166" xmlns="http://www.w3.org/2000/svg"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/></svg>`
    },
    {
      name: "潮酷钻石",
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 3H18L22 9L12 22L2 9L6 3Z" fill="rgba(0,229,255,0.25)" stroke="#00E5FF" stroke-width="1.8" stroke-linejoin="round"/><path d="M2 9H22M12 22L7.5 9L10 3M12 22L16.5 9L14 3" stroke="#00E5FF" stroke-width="1.2"/></svg>`
    },
    {
      name: "能量烈焰",
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C16.4183 22 20 18.4183 20 14C20 8 13 2 13 2C13 2 14 7 11 9C8 11 6 12.5 6 15C6 18.866 8.68629 22 12 22Z" fill="#FF5722" stroke="#FFD600" stroke-width="1.5"/></svg>`
    },
    {
      name: "数码爱心",
      svg: `<svg viewBox="0 0 24 24" fill="#FF2A6D" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"/></svg>`
    },
    {
      name: "潮酷声浪",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#AF52DE" stroke-width="2" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg"><path d="M3 18V12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12V18"/><rect x="2" y="14" width="4" height="7" rx="2" fill="#AF52DE"/><rect x="18" y="14" width="4" height="7" rx="2" fill="#AF52DE"/></svg>`
    }
  ];

  function openStickerPicker() {
    if (stickerModal) stickerModal.classList.add("open");
  }

  function closeStickerPicker() {
    if (stickerModal) stickerModal.classList.remove("open");
  }

  if (closeStickerModal) {
    closeStickerModal.addEventListener("click", closeStickerPicker);
  }
  if (stickerModal) {
    stickerModal.addEventListener("click", (e) => {
      if (e.target === stickerModal) closeStickerPicker();
    });
  }

  // Populate built-in preset stickers
  if (presetStickersGrid) {
    presetStickersGrid.innerHTML = "";
    builtInStickers.forEach((st) => {
      const item = document.createElement("div");
      item.className = "sticker-item";
      item.innerHTML = `
        <div class="sticker-icon">${st.svg}</div>
        <span class="sticker-name">${st.name}</span>
      `;
      item.addEventListener("click", () => {
        const dataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(st.svg);
        renderer.addCustomImageLayer(dataUrl, st.name, (layer) => {
          refreshLayerDropdown();
          tabInspectorBtn.click();
          syncInspector(layer);
          closeStickerPicker();
          showToast(`已在表盘上添加贴纸「${st.name}」，可在画布自由拖动排版！`, "success");
        });
      });
      presetStickersGrid.appendChild(item);
    });
  }

  // Local file upload
  if (btnUploadLocalSticker && stickerFileInput) {
    btnUploadLocalSticker.addEventListener("click", () => stickerFileInput.click());
    stickerFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const stickerName = "贴纸_" + file.name.substring(0, 8);
          renderer.addCustomImageLayer(evt.target.result, stickerName, (layer) => {
            refreshLayerDropdown();
            tabInspectorBtn.click();
            syncInspector(layer);
            closeStickerPicker();
            showToast(`已成功添加专属贴纸「${file.name}」！`, "success");
          });
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // ================= Stage Quick Buttons =================
  const btnStageAddSticker = document.getElementById("btnStageAddSticker");
  const btnStageAddText = document.getElementById("btnStageAddText");
  const btnStageResetAll = document.getElementById("btnStageResetAll");

  if (btnStageAddSticker) {
    btnStageAddSticker.addEventListener("click", openStickerPicker);
  }
  if (btnPresetAddSticker) {
    btnPresetAddSticker.addEventListener("click", openStickerPicker);
  }
  if (btnPresetAddText) {
    btnPresetAddText.addEventListener("click", () => {
      const layer = renderer.addCustomTextLayer("VELA PHOTO", "画廊标签");
      refreshLayerDropdown();
      tabInspectorBtn.click();
      syncInspector(layer);
      if (propCustomText) {
        propCustomText.focus();
        propCustomText.select();
      }
      showToast("已在表盘上添加个性文字标签！", "success");
    });
  }

  btnStageAddText.addEventListener("click", () => {
    const defaultText = "VELA PRO";
    const layer = renderer.addCustomTextLayer(defaultText, "自定义文字");
    refreshLayerDropdown();
    tabInspectorBtn.click();
    syncInspector(layer);
    if (propCustomText) {
      propCustomText.focus();
      propCustomText.select();
    }
    showToast(window.I18n ? (window.I18n.currentLang === "zh" ? "已添加文字图层，可在右侧修改内容" : "Text layer added, edit in inspector") : "已添加文字图层", "success");
  });

  btnStageResetAll.addEventListener("click", () => {
    ["time", "weather", "battery", "ribbon", "steps", "hrm", "cal"].forEach((id) => {
      renderer.alignLayer(id, "reset");
    });
    renderer.clearLayerCustomAsset("bg");
    syncInspector(renderer.getSelectedLayer());
    showToast("已恢复全部组件默认布局与素材");
  });

  // Stage Quick Screenshot
  const btnStageScreenshot = document.getElementById("btnStageScreenshot");
  if (btnStageScreenshot) {
    btnStageScreenshot.addEventListener("click", () => {
      const title = (titleInput.value || "watchface").replace(/\s+/g, "_");
      const w = renderer.width;
      const h = renderer.height;
      const dataUrl = renderer.exportImage(w, h);
      downloadDataUrl(dataUrl, `${title}_${w}x${h}.png`);
      showToast(`已保存当前表盘高清截图 (${w}×${h})`, "success");
    });
  }

  // ================= Direct Canvas Touch & Drag Manipulation =================
  const watchCanvas = document.getElementById("watchCanvas");
  let isDragging = false;
  let dragStartPos = { x: 0, y: 0 };
  let initialLayerPos = { x: 0, y: 0 };

  function getCanvasCoords(e) {
    const rect = watchCanvas.getBoundingClientRect();
    const scaleX = watchCanvas.width / rect.width;
    const scaleY = watchCanvas.height / rect.height;
    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function onPointerDown(e) {
    const pos = getCanvasCoords(e);
    const hitId = renderer.hitTest(pos.x, pos.y);

    renderer.selectLayer(hitId);
    syncInspector(renderer.getSelectedLayer());

    const layer = renderer.getSelectedLayer();
    if (layer && layer.type !== "bg" && !layer.locked) {
      isDragging = true;
      dragStartPos = pos;
      initialLayerPos = { x: layer.x, y: layer.y };
      watchCanvas.classList.add("dragging");
    }
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    e.preventDefault();

    const pos = getCanvasCoords(e);
    const dx = pos.x - dragStartPos.x;
    const dy = pos.y - dragStartPos.y;

    let targetX = initialLayerPos.x + dx;
    let targetY = initialLayerPos.y + dy;

    // Smart Magnet Snapping
    // 1. Center X (168)
    const layer = renderer.getSelectedLayer();
    let currentCenterX = targetX;
    if (layer.bounds && layer.type !== "time") {
      currentCenterX = targetX + layer.bounds.width / 2;
    }

    if (Math.abs(currentCenterX - 168) < 6) {
      renderer.snapGuideX = 168;
      targetX = layer.type === "time" ? 168 : Math.round(168 - layer.bounds.width / 2);
    } else {
      renderer.snapGuideX = null;
    }

    // 2. Center Y (240)
    let currentCenterY = targetY;
    if (layer.bounds && layer.type !== "time") {
      currentCenterY = targetY + layer.bounds.height / 2;
    }

    if (Math.abs(currentCenterY - 240) < 6) {
      renderer.snapGuideY = 240;
      targetY = layer.type === "time" ? 240 : Math.round(240 - layer.bounds.height / 2);
    } else {
      renderer.snapGuideY = null;
    }

    renderer.setLayerPosition(renderer.selectedLayerId, targetX, targetY);

    // Live update inspector inputs
    propX.value = Math.round(targetX);
    propXSlider.value = Math.round(targetX);
    propY.value = Math.round(targetY);
    propYSlider.value = Math.round(targetY);
  }

  function onPointerUp() {
    if (isDragging) {
      isDragging = false;
      renderer.snapGuideX = null;
      renderer.snapGuideY = null;
      watchCanvas.classList.remove("dragging");
    }
  }

  watchCanvas.addEventListener("mousedown", onPointerDown);
  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("mouseup", onPointerUp);

  watchCanvas.addEventListener("touchstart", onPointerDown, { passive: false });
  window.addEventListener("touchmove", onPointerMove, { passive: false });
  window.addEventListener("touchend", onPointerUp);

  // Initialize Inspector with current selection
  refreshLayerDropdown();
  syncInspector(renderer.getSelectedLayer());

  // ================= Palette Swatches Initialization =================
  const swatchesContainer = document.getElementById("swatchesContainer");
  const customColorPicker = document.getElementById("customColorPicker");

  Object.entries(renderer.palettes).forEach(([key, p], index) => {
    const swatch = document.createElement("div");
    swatch.className = `color-swatch ${index === 0 ? "active" : ""}`;
    swatch.style.backgroundColor = p.hex;
    swatch.style.setProperty("--swatch-color", p.hex);
    swatch.title = p.name;
    swatch.dataset.hex = p.hex;

    swatch.addEventListener("click", () => {
      document.querySelectorAll(".color-swatch").forEach((s) => s.classList.remove("active"));
      swatch.classList.add("active");
      renderer.setPrimaryColor(p.hex);
      customColorPicker.value = p.hex;
      propLayerColor.value = p.hex;
      showToast(`已切换主题配色：${p.name}`);
    });

    swatchesContainer.appendChild(swatch);
  });

  customColorPicker.addEventListener("input", (e) => {
    const hex = e.target.value;
    document.querySelectorAll(".color-swatch").forEach((s) => s.classList.remove("active"));
    renderer.setPrimaryColor(hex);
    propLayerColor.value = hex;
  });

  // ================= Typography & SVG Style Switchers =================
  const fontSelect = document.getElementById("fontSelect");
  if (fontSelect) {
    fontSelect.addEventListener("change", (e) => {
      renderer.state.fontFamily = e.target.value;
      const timeLayer = renderer.getLayer("time");
      if (timeLayer) timeLayer.fontFamily = e.target.value;
      showToast(`已应用时钟字体：${e.target.options[e.target.selectedIndex].text}`);
    });
  }

  const btnIconColor = document.getElementById("btnIconColor");
  const btnIconMono = document.getElementById("btnIconMono");
  if (btnIconColor && btnIconMono) {
    btnIconColor.addEventListener("click", () => {
      btnIconColor.classList.add("active");
      btnIconMono.classList.remove("active");
      renderer.state.iconStyle = "color";
      showToast("已切换为开源彩色矢量图标");
    });

    btnIconMono.addEventListener("click", () => {
      btnIconMono.classList.add("active");
      btnIconColor.classList.remove("active");
      renderer.state.iconStyle = "mono";
      showToast("已切换为极简黑白线条图标");
    });
  }

  // ================= Component Toggles =================
  document.getElementById("toggleStatus").addEventListener("change", (e) => {
    const w = renderer.getLayer("weather");
    const b = renderer.getLayer("battery");
    if (w) w.visible = e.target.checked;
    if (b) b.visible = e.target.checked;
  });
  document.getElementById("toggleRibbon").addEventListener("change", (e) => {
    const r = renderer.getLayer("ribbon");
    if (r) r.visible = e.target.checked;
  });
  document.getElementById("toggleHealth").addEventListener("change", (e) => {
    const s = renderer.getLayer("steps");
    const h = renderer.getLayer("hrm");
    const c = renderer.getLayer("cal");
    if (s) s.visible = e.target.checked;
    if (h) h.visible = e.target.checked;
    if (c) c.visible = e.target.checked;
  });
  document.getElementById("toggleBigHrm").addEventListener("change", (e) => {
    const h = renderer.getLayer("hrm");
    if (h) h.bigHrm = e.target.checked;
  });

  // Title Input
  const titleInput = document.getElementById("watchfaceTitle");
  titleInput.addEventListener("input", (e) => {
    renderer.state.title = e.target.value || "简约数字表盘";
  });

  // ================= Hardware Device Switching (Stage Dock) =================
  const stageDeviceSelect = document.getElementById("stageDeviceSelect");
  const deviceSelect = stageDeviceSelect;

  function handleDeviceSwitch(deviceType, triggerEl) {
    if (stageDeviceSelect && stageDeviceSelect.value !== deviceType) stageDeviceSelect.value = deviceType;

    const activeDropdown = triggerEl || stageDeviceSelect;
    const selectedOption = activeDropdown ? activeDropdown.options[activeDropdown.selectedIndex] : null;
    const isPill = selectedOption ? selectedOption.dataset.shape === "pill" : false;

    // 1. Update WatchfaceRenderer engine
    renderer.setDevice(deviceType);

    // 2. Morph Hardware Mockup & Sketchpad CSS
    const mockupWrapper = document.querySelector(".band-mockup-wrapper");
    const sketchWrapper = document.querySelector(".canvas-wrapper");
    const dropzoneWrapper = document.querySelector(".dropzone");
    const stageFooterSpan = document.querySelector(".stage-footer span:first-child");
    const stageDeviceShapeBadge = document.getElementById("stageDeviceShapeBadge");
    const stageDeviceResBadge = document.getElementById("stageDeviceResBadge");

    if (isPill) {
      if (mockupWrapper) mockupWrapper.classList.add("pill-mode");
      if (sketchWrapper) sketchWrapper.classList.add("pill-mode");
      if (dropzoneWrapper) dropzoneWrapper.classList.add("pill-mode");
      if (stageFooterSpan) stageFooterSpan.innerText = `${renderer.width} × ${renderer.height} AMOLED · 跑道屏`;
      if (stageDeviceShapeBadge) stageDeviceShapeBadge.innerText = "跑道胶囊屏";
      if (stageDeviceResBadge) stageDeviceResBadge.innerText = `${renderer.width} × ${renderer.height}`;
      sketch.setDimensions(renderer.width, renderer.height, "pill");
    } else {
      if (mockupWrapper) mockupWrapper.classList.remove("pill-mode");
      if (sketchWrapper) sketchWrapper.classList.remove("pill-mode");
      if (dropzoneWrapper) dropzoneWrapper.classList.remove("pill-mode");
      if (stageFooterSpan) stageFooterSpan.innerText = `${renderer.width} × ${renderer.height} AMOLED · 矩形`;
      if (stageDeviceShapeBadge) stageDeviceShapeBadge.innerText = "矩形 AMOLED";
      if (stageDeviceResBadge) stageDeviceResBadge.innerText = `${renderer.width} × ${renderer.height}`;
      sketch.setDimensions(336, 480, "rect");
    }

    const hudResolution = document.getElementById("hudResolution");
    if (hudResolution) {
      hudResolution.innerText = `${renderer.width}×${renderer.height} ${isPill ? "胶囊屏" : "AMOLED"}`;
    }

    // 3. Update inspector coordinate boundaries
    propX.max = renderer.width;
    propXSlider.max = renderer.width;
    propY.max = renderer.height;
    propYSlider.max = renderer.height;

    refreshLayerDropdown();
    syncInspector(renderer.getSelectedLayer());
    showToast(`已切换并适配设备：${selectedOption ? selectedOption.text.split("(")[0].trim() : deviceType}`, "success");
  }

  if (stageDeviceSelect) {
    stageDeviceSelect.addEventListener("change", (e) => handleDeviceSwitch(e.target.value, e.target));
  }

  // ================= Stage Toolbar Buttons =================
  const btnLiveTime = document.getElementById("btnLiveTime");
  const btnDemoTime = document.getElementById("btnDemoTime");
  const btnAOD = document.getElementById("btnAODToggle");

  btnLiveTime.addEventListener("click", () => {
    renderer.state.isLiveTime = true;
    renderer.state.isAOD = false;
    btnLiveTime.classList.add("active");
    btnDemoTime.classList.remove("active");
    btnAOD.classList.remove("active");
    showToast("已切换至系统真实时钟");
  });

  btnDemoTime.addEventListener("click", () => {
    renderer.state.isLiveTime = false;
    renderer.state.isAOD = false;
    btnDemoTime.classList.add("active");
    btnLiveTime.classList.remove("active");
    btnAOD.classList.remove("active");
    showToast("已切换至经典定格样例 (10:42)");
  });

  btnAOD.addEventListener("click", () => {
    renderer.state.isAOD = !renderer.state.isAOD;
    btnAOD.classList.toggle("active", renderer.state.isAOD);
    if (renderer.state.isAOD) {
      btnLiveTime.classList.remove("active");
      btnDemoTime.classList.remove("active");
    } else {
      btnLiveTime.classList.add("active");
    }
    showToast(renderer.state.isAOD ? "已开启 AOD 息屏超低功耗模式预览" : "已返回全屏高亮模式");
  });

  // ================= Presets, Sketch & AI Tabs =================
  const tabPresets = document.getElementById("tabPresets");
  const tabSketch = document.getElementById("tabSketch");
  const tabUpload = document.getElementById("tabUpload");

  const presetsSection = document.getElementById("presetsSection");
  const sketchSection = document.getElementById("sketchSection");
  const dropzoneSection = document.getElementById("dropzoneSection");

  function switchLeftTab(activeTab, activeSection) {
    [tabPresets, tabSketch, tabUpload].forEach((t) => {
      if (t) t.classList.toggle("active", t === activeTab);
    });
    [presetsSection, sketchSection, dropzoneSection].forEach((s) => {
      if (s) {
        if (s === activeSection) {
          s.style.display = (s === sketchSection || s === presetsSection) ? "flex" : "block";
        } else {
          s.style.display = "none";
        }
      }
    });
  }

  if (tabPresets) {
    tabPresets.addEventListener("click", () => switchLeftTab(tabPresets, presetsSection));
  }
  if (tabSketch) {
    tabSketch.addEventListener("click", () => switchLeftTab(tabSketch, sketchSection));
  }
  if (tabUpload) {
    tabUpload.addEventListener("click", () => switchLeftTab(tabUpload, dropzoneSection));
  }

  // Preset Card Selection in Panel 1
  const presetCardItems = document.querySelectorAll(".preset-card-item");
  presetCardItems.forEach((card) => {
    card.addEventListener("click", () => {
      const presetKey = card.dataset.preset;
      presetCardItems.forEach((c) => c.classList.toggle("active", c === card));

      // Disengage AOD if active so preset change is immediately visible
      renderer.state.isAOD = false;
      if (btnAOD) btnAOD.classList.remove("active");
      if (btnLiveTime) btnLiveTime.classList.add("active");
      if (btnDemoTime) btnDemoTime.classList.remove("active");

      renderer.setPreset(presetKey);

      refreshLayerDropdown();
      syncInspector(renderer.getSelectedLayer());

      const presetNames = {
        retro_chrono: window.I18n.t("preset_retro"),
        analog_luxe: window.I18n.t("preset_analog"),
        gallery_photo: window.I18n.t("preset_gallery"),
        cyber_hud: window.I18n.t("preset_cyber"),
        bauhaus_minimal: window.I18n.t("preset_bauhaus")
      };

      showToast(`${window.I18n.currentLang === "zh" ? "已载入预设表盘：" : "Loaded preset: "}${presetNames[presetKey] || presetKey}`, "success");
    });
  });

  // Image Upload Handling
  const imageInput = document.getElementById("imageInput");
  const dropzonePreview = document.getElementById("dropzonePreview");
  let uploadedImageBase64 = null;

  imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        uploadedImageBase64 = evt.target.result;
        dropzonePreview.src = uploadedImageBase64;
        dropzonePreview.style.display = "block";
        showToast("已加载参考截图");
      };
      reader.readAsDataURL(file);
    }
  });

  // Drag & drop for image
  const aiDropzoneEl = document.getElementById("aiDropzone") || dropzoneSection;
  if (aiDropzoneEl) {
    aiDropzoneEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      aiDropzoneEl.classList.add("dragover");
    });
    aiDropzoneEl.addEventListener("dragleave", () => {
      aiDropzoneEl.classList.remove("dragover");
    });
    aiDropzoneEl.addEventListener("drop", (e) => {
      e.preventDefault();
      aiDropzoneEl.classList.remove("dragover");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        imageInput.files = e.dataTransfer.files;
        const event = new Event("change");
        imageInput.dispatchEvent(event);
      }
    });
  }

  // ================= Bin Unpacker Logic & Modals =================
  const unpacker = window.VelaUnpacker;
  const binFileInput = document.getElementById("binFileInput");
  const binDropzoneSection = document.getElementById("binDropzoneSection");
  const btnBrowseBin = document.getElementById("btnBrowseBin");
  const btnLoadSampleBin = document.getElementById("btnLoadSampleBin");
  const navImportBinBtn = document.getElementById("navImportBinBtn");
  const btnImportBinSecondary = document.getElementById("btnImportBinSecondary");

  const unpackModal = document.getElementById("unpackModal");
  const closeUnpackModal = document.getElementById("closeUnpackModal");
  const cancelUnpackBtn = document.getElementById("cancelUnpackBtn");
  const btnLoadUnpackedIntoStudio = document.getElementById("btnLoadUnpackedIntoStudio");
  const btnDownloadPreview = document.getElementById("btnDownloadPreview");
  const btnDownloadAllSlices = document.getElementById("btnDownloadAllSlices");

  const unpackMetaTitle = document.getElementById("unpackMetaTitle");
  const unpackMetaDevice = document.getElementById("unpackMetaDevice");
  const unpackMetaRes = document.getElementById("unpackMetaRes");
  const unpackMetaSliceCount = document.getElementById("unpackMetaSliceCount");
  const unpackMetaFileSize = document.getElementById("unpackMetaFileSize");
  const unpackPreviewImg = document.getElementById("unpackPreviewImg");
  const unpackSliceTotal = document.getElementById("unpackSliceTotal");
  const unpackSlicesGrid = document.getElementById("unpackSlicesGrid");

  let lastUnpackResult = null;

  function closeUnpack() {
    unpackModal.classList.remove("open");
  }

  closeUnpackModal.addEventListener("click", closeUnpack);
  cancelUnpackBtn.addEventListener("click", closeUnpack);

  // Trigger file browser
  const btnStageImportBin = document.getElementById("btnStageImportBin");
  if (btnStageImportBin && binFileInput) {
    btnStageImportBin.addEventListener("click", () => binFileInput.click());
  }
  if (btnBrowseBin && binFileInput) {
    btnBrowseBin.addEventListener("click", () => binFileInput.click());
  }
  if (btnImportBinSecondary && binFileInput) {
    btnImportBinSecondary.addEventListener("click", () => binFileInput.click());
  }
  if (navImportBinBtn) {
    navImportBinBtn.addEventListener("click", () => {
      const studioSec = document.getElementById("studio");
      if (studioSec) studioSec.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Handle unpack file
  async function handleBinBuffer(arrayBuffer, filename = "watchface.bin") {
    showToast(`正在解包分析固件：${filename}...`, "info");
    try {
      const result = unpacker.unpack(arrayBuffer);
      lastUnpackResult = result;
      displayUnpackModal(result);
      showToast(`成功解包「${result.title}」！提取出 ${result.images.length} 个切片`, "success");
    } catch (err) {
      console.error("Unpack error:", err);
      showToast(`解包失败: ${err.message}`, "error");
    }
  }

  async function handleBinFile(file) {
    if (!file) return;
    const arrayBuffer = await file.arrayBuffer();
    await handleBinBuffer(arrayBuffer, file.name);
  }

  if (binFileInput) {
    binFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        handleBinFile(file);
        binFileInput.value = "";
      }
    });
  }

  // Drag & drop for bin dropzone
  if (binDropzoneSection) {
    binDropzoneSection.addEventListener("dragover", (e) => {
      e.preventDefault();
      binDropzoneSection.classList.add("dragover");
    });
    binDropzoneSection.addEventListener("dragleave", () => {
      binDropzoneSection.classList.remove("dragover");
    });
    binDropzoneSection.addEventListener("drop", (e) => {
      e.preventDefault();
      binDropzoneSection.classList.remove("dragover");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleBinFile(e.dataTransfer.files[0]);
      }
    });
  }

  // Global window drop for .bin files
  window.addEventListener("dragover", (e) => e.preventDefault());
  window.addEventListener("drop", (e) => {
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      if (f.name.toLowerCase().endsWith(".bin")) {
        e.preventDefault();
        handleBinFile(f);
      }
    }
  });

  // Load sample binary
  if (btnLoadSampleBin) {
    btnLoadSampleBin.addEventListener("click", async () => {
      try {
        showToast("正在拉取标准样例表盘进行解包...", "info");
        const resp = await fetch("assets/RetroChrono_Band8Pro.bin");
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const buffer = await resp.arrayBuffer();
        await handleBinBuffer(buffer, "RetroChrono_Band8Pro.bin");
      } catch (err) {
        showToast(`加载内置样例失败: ${err.message}`, "error");
      }
    });
  }

  // Display unpack modal with extracted slices
  function displayUnpackModal(result) {
    unpackMetaTitle.textContent = result.title;
    unpackMetaDevice.textContent = `${result.device.name}`;
    unpackMetaRes.textContent = `${result.device.width} × ${result.device.height} px`;
    unpackMetaSliceCount.textContent = `${result.images.length} 个`;
    unpackMetaFileSize.textContent = `${(result.fileSize / 1024).toFixed(1)} KB`;

    if (result.preview && result.preview.dataUrl) {
      unpackPreviewImg.src = result.preview.dataUrl;
      unpackPreviewImg.style.display = "block";
      btnDownloadPreview.style.display = "block";
    } else {
      unpackPreviewImg.style.display = "none";
      btnDownloadPreview.style.display = "none";
    }

    unpackSliceTotal.textContent = result.images.length;
    unpackSlicesGrid.innerHTML = "";

    result.images.forEach((img, idx) => {
      const card = document.createElement("div");
      card.className = "slice-card";
      card.title = `切片 #${idx} (${img.width}×${img.height} px) - 点击下载 PNG`;

      card.innerHTML = `
        <div class="slice-thumb-wrapper">
          <img src="${img.dataUrl}" class="slice-thumb" alt="Slice #${idx}">
        </div>
        <div class="slice-meta">${img.width}×${img.height}</div>
        <div style="font-size: 9px; color: var(--text-muted); opacity: 0.8;">#${idx}</div>
      `;

      card.addEventListener("click", () => {
        downloadDataUrl(img.dataUrl, `slice_${idx}_${img.width}x${img.height}.png`);
        showToast(`已下载切片 #${idx} (${img.width}×${img.height})`, "success");
      });

      unpackSlicesGrid.appendChild(card);
    });

    unpackModal.classList.add("open");
  }

  function downloadDataUrl(dataUrl, filename) {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Download preview button
  btnDownloadPreview.addEventListener("click", () => {
    if (lastUnpackResult && lastUnpackResult.preview && lastUnpackResult.preview.dataUrl) {
      downloadDataUrl(lastUnpackResult.preview.dataUrl, `${lastUnpackResult.title}_preview.png`);
      showToast("已下载官方商店预览缩略图", "success");
    }
  });

  // Download all slices sequentially
  if (btnDownloadAllSlices) {
    btnDownloadAllSlices.addEventListener("click", () => {
      if (!lastUnpackResult || !lastUnpackResult.images.length) return;
      lastUnpackResult.images.forEach((img, idx) => {
        setTimeout(() => {
          downloadDataUrl(img.dataUrl, `${lastUnpackResult.title}_slice_${idx}.png`);
        }, idx * 100);
      });
      showToast(`正在批量导出 ${lastUnpackResult.images.length} 个切片...`, "success");
    });
  }

  // Load unpacked watchface into studio
  btnLoadUnpackedIntoStudio.addEventListener("click", () => {
    if (!lastUnpackResult) return;
    closeUnpack();

    // 1. Sync title
    if (lastUnpackResult.title) {
      titleInput.value = lastUnpackResult.title;
    }

    // 2. Sync device selection
    const targetType = lastUnpackResult.device.deviceType;
    let matchedOption = Array.from(deviceSelect.options).find(opt => opt.value === targetType);
    if (!matchedOption) {
      // Find by shape and dimension
      matchedOption = Array.from(deviceSelect.options).find(opt => 
        Number(opt.dataset.width) === lastUnpackResult.device.width &&
        Number(opt.dataset.height) === lastUnpackResult.device.height
      );
    }

    if (matchedOption) {
      deviceSelect.value = matchedOption.value;
      deviceSelect.dispatchEvent(new Event("change"));
    }

    // 3. Load unpacked preview as base custom wallpaper
    if (lastUnpackResult.preview && lastUnpackResult.preview.dataUrl) {
      renderer.customWallpaper = lastUnpackResult.preview.dataUrl;
    }

    // 4. Populate custom layers if unpacked images exist
    // Add decorative/extracted elements
    const largestImg = lastUnpackResult.images.find(img => img.width > 200 && img.height > 200);
    if (largestImg) {
      renderer.customWallpaper = largestImg.dataUrl;
    }

    renderer.draw();
    refreshLayerDropdown();
    syncInspector(renderer.getSelectedLayer());

    // Scroll to studio
    const studioSec = document.getElementById("studio");
    if (studioSec) {
      studioSec.scrollIntoView({ behavior: "smooth" });
    }

    showToast(`已成功将「${lastUnpackResult.title}」载入工坊，可自由拖动排版与再次编译！`, "success");
  });

  // ================= AI Vision Trigger =================
  const aiGenerateBtn = document.getElementById("aiGenerateBtn");
  const promptInput = document.getElementById("promptInput");

  async function triggerAITransform() {
    let sourceImage = null;

    if (tabUpload.classList.contains("active") && uploadedImageBase64) {
      sourceImage = uploadedImageBase64;
    } else {
      sourceImage = sketch.getBase64Image();
    }

    if (!ai.hasApiKey()) {
      document.getElementById("apiKeyModal").classList.add("open");
      showToast("请先配置 Gemini API Key 开启 AI 视觉能力", "error");
      return;
    }

    aiGenerateBtn.disabled = true;
    const originalText = aiGenerateBtn.innerHTML;
    aiGenerateBtn.innerHTML = `<span>⏳</span><span>AI 正在深度解析草图...</span>`;

    try {
      const analysis = await ai.analyzeSketch(sourceImage, promptInput.value);

      // Apply recognized state to renderer
      if (analysis.primaryColor) {
        renderer.setPrimaryColor(analysis.primaryColor);
        customColorPicker.value = analysis.primaryColor;
      }
      if (typeof analysis.showStatus === "boolean") {
        const w = renderer.getLayer("weather");
        const b = renderer.getLayer("battery");
        if (w) w.visible = analysis.showStatus;
        if (b) b.visible = analysis.showStatus;
        document.getElementById("toggleStatus").checked = analysis.showStatus;
      }
      if (typeof analysis.showRibbon === "boolean") {
        const r = renderer.getLayer("ribbon");
        if (r) r.visible = analysis.showRibbon;
        document.getElementById("toggleRibbon").checked = analysis.showRibbon;
      }
      if (typeof analysis.showHealth === "boolean") {
        const s = renderer.getLayer("steps");
        const h = renderer.getLayer("hrm");
        const c = renderer.getLayer("cal");
        if (s) s.visible = analysis.showHealth;
        if (h) h.visible = analysis.showHealth;
        if (c) c.visible = analysis.showHealth;
        document.getElementById("toggleHealth").checked = analysis.showHealth;
      }
      if (typeof analysis.bigHrm === "boolean") {
        const h = renderer.getLayer("hrm");
        if (h) h.bigHrm = analysis.bigHrm;
        document.getElementById("toggleBigHrm").checked = analysis.bigHrm;
      }
      if (analysis.suggestedTitle) {
        titleInput.value = analysis.suggestedTitle;
        renderer.state.title = analysis.suggestedTitle;
      }

      showToast(`✨ ${analysis.analysis || "草图已成功转换为表盘！"}`, "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      aiGenerateBtn.disabled = false;
      aiGenerateBtn.innerHTML = originalText;
    }
  }

  aiGenerateBtn.addEventListener("click", triggerAITransform);

  // ================= Helper: Download Data URL =================
  function downloadDataUrl(dataUrl, filename) {
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  // ================= Export & Sync Actions =================
  // 0. Screenshot & Official Preview Exports (230x328 and 336x480)
  const btnExport230x328 = document.getElementById("btnExport230x328");
  const btnExport336x480 = document.getElementById("btnExport336x480");

  if (btnExport230x328) {
    btnExport230x328.addEventListener("click", () => {
      try {
        const title = (titleInput.value || "watchface").replace(/\s+/g, "_");
        const dataUrl = renderer.exportImage(230, 328);
        downloadDataUrl(dataUrl, `${title}_preview_230x328.png`);
        showToast("已成功导出 230 × 328 官方应用商店预览图！", "success");
      } catch (err) {
        showToast(`导出截图失败: ${err.message}`, "error");
      }
    });
  }

  if (btnExport336x480) {
    btnExport336x480.addEventListener("click", () => {
      try {
        const title = (titleInput.value || "watchface").replace(/\s+/g, "_");
        const dataUrl = renderer.exportImage(336, 480);
        downloadDataUrl(dataUrl, `${title}_screen_336x480.png`);
        showToast("已成功导出 336 × 480 1:1 原生屏幕高清截图！", "success");
      } catch (err) {
        showToast(`导出截图失败: ${err.message}`, "error");
      }
    });
  }

  // 1. Download .bin
  const btnDownloadBin = document.getElementById("btnDownloadBin");
  btnDownloadBin.addEventListener("click", async () => {
    btnDownloadBin.disabled = true;
    btnDownloadBin.innerText = "⏳ 正在生成 .bin...";

    try {
      const selectedOption = deviceSelect.options[deviceSelect.selectedIndex];
      const deviceType = deviceSelect.value;
      const deviceName = selectedOption.dataset.name || "RetroChrono";

      const res = await packer.downloadBin({
        deviceType,
        name: deviceName,
        title: titleInput.value,
        primaryColor: renderer.state.primaryColor
      });

      showToast(`固件下载就绪 (${(res.size / 1024).toFixed(1)} KB)：${res.filename}`, "success");
    } catch (err) {
      showToast(`生成失败: ${err.message}`, "error");
    } finally {
      btnDownloadBin.disabled = false;
      btnDownloadBin.innerHTML = `<span>📥</span><span>导出 .bin 固件安装包</span><span class="kbd">⌘S</span>`;
    }
  });

  // 2. Web Bluetooth Direct Sync
  const btnBleSync = document.getElementById("btnBleSync");
  const bleModal = document.getElementById("bleModal");
  const closeBleModal = document.getElementById("closeBleModal");
  const bleStatusText = document.getElementById("bleStatusText");
  const bleProgressBar = document.getElementById("bleProgressBar");

  btnBleSync.addEventListener("click", async () => {
    bleModal.classList.add("open");
    bleProgressBar.style.width = "0%";
    bleStatusText.innerText = "正在打开蓝牙设备选择器...";

    try {
      const deviceType = deviceSelect.value;
      const binData = await packer.buildWatchfaceBin({
        deviceType,
        title: titleInput.value,
        primaryColor: renderer.state.primaryColor
      });

      await ble.syncViaBluetooth(binData, {}, (percent, text) => {
        bleProgressBar.style.width = `${percent}%`;
        bleStatusText.innerText = text;
      });

      showToast("🎉 表盘已通过蓝牙成功直刷到手环！", "success");
      setTimeout(() => bleModal.classList.remove("open"), 1500);
    } catch (err) {
      bleStatusText.innerText = err.message;
      showToast(err.message, "error");
    }
  });

  closeBleModal.addEventListener("click", () => {
    bleModal.classList.remove("open");
  });

  // 3. Web Share API (Mobile One-Tap)
  const btnWebShare = document.getElementById("btnWebShare");
  btnWebShare.addEventListener("click", async () => {
    try {
      const selectedOption = deviceSelect.options[deviceSelect.selectedIndex];
      const deviceName = selectedOption.dataset.name || "RetroChrono";
      const binData = await packer.buildWatchfaceBin({
        deviceType: deviceSelect.value,
        title: titleInput.value,
        primaryColor: renderer.state.primaryColor
      });

      await ble.shareToMobileApp(binData, `${deviceName}.bin`);
      showToast("已呼起分享面板，可直接选择表盘自定义工具导入", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  // ================= API Key Modal =================
  const apiKeyModal = document.getElementById("apiKeyModal");
  const openSettingsBtn = document.getElementById("openSettingsBtn");
  const closeApiKeyModal = document.getElementById("closeApiKeyModal");
  const cancelApiKeyBtn = document.getElementById("cancelApiKeyBtn");
  const saveApiKeyBtn = document.getElementById("saveApiKeyBtn");
  const apiKeyInput = document.getElementById("apiKeyInput");

  openSettingsBtn.addEventListener("click", () => {
    apiKeyInput.value = ai.getApiKey();
    apiKeyModal.classList.add("open");
  });

  const closeModal = () => apiKeyModal.classList.remove("open");
  closeApiKeyModal.addEventListener("click", closeModal);
  cancelApiKeyBtn.addEventListener("click", closeModal);

  saveApiKeyBtn.addEventListener("click", () => {
    ai.setApiKey(apiKeyInput.value);
    closeModal();
    showToast("Gemini API Key 已安全保存在本地浏览器！", "success");
  });

  // ================= Studio Fullscreen Mode =================
  const workspaceEl = document.querySelector(".workspace");
  const navFullscreenBtn = document.getElementById("navFullscreenBtn");
  const btnStageFullscreen = document.getElementById("btnStageFullscreen");
  const btnExitFullscreen = document.getElementById("btnExitFullscreen");

  function toggleStudioFullscreen(forceState) {
    if (!workspaceEl) return;
    const isCurrentlyFullscreen = workspaceEl.classList.contains("is-fullscreen");
    const nextState = typeof forceState === "boolean" ? forceState : !isCurrentlyFullscreen;

    workspaceEl.classList.toggle("is-fullscreen", nextState);
    document.body.classList.toggle("has-fullscreen", nextState);

    const isNativeFs = !!(document.fullscreenElement || document.webkitFullscreenElement);

    if (nextState) {
      const reqFs = document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen;
      if (reqFs && !isNativeFs) {
        try {
          const res = reqFs.call(document.documentElement);
          if (res && res.catch) res.catch(() => {});
        } catch (e) {}
      }
      const lang = window.I18n ? window.I18n.currentLang : "zh";
      showToast(lang === "zh" ? "已进入全屏工作台 (按 Esc 退出)" : "Entered Fullscreen Studio (Press Esc to exit)", "info");
    } else {
      const exitFs = document.exitFullscreen || document.webkitExitFullscreen;
      if (exitFs && isNativeFs) {
        try {
          const res = exitFs.call(document);
          if (res && res.catch) res.catch(() => {});
        } catch (e) {}
      }
    }
  }

  if (navFullscreenBtn) {
    navFullscreenBtn.addEventListener("click", () => toggleStudioFullscreen());
  }
  if (btnStageFullscreen) {
    btnStageFullscreen.addEventListener("click", () => toggleStudioFullscreen());
  }
  if (btnExitFullscreen) {
    btnExitFullscreen.addEventListener("click", () => toggleStudioFullscreen(false));
  }

  // Handle native browser fullscreen change
  const onFullscreenChange = () => {
    const isNativeFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
    if (!isNativeFs && workspaceEl && workspaceEl.classList.contains("is-fullscreen")) {
      toggleStudioFullscreen(false);
    }
  };
  document.addEventListener("fullscreenchange", onFullscreenChange);
  document.addEventListener("webkitfullscreenchange", onFullscreenChange);

  // ================= i18n Bilingual Switcher =================
  const langToggleBtn = document.getElementById("langToggleBtn");
  if (langToggleBtn) {
    langToggleBtn.addEventListener("click", () => {
      const newLang = window.I18n.toggleLanguage();
      showToast(newLang === "zh" ? "已切换至 简体中文" : "Switched to English", "success");
    });
  }
  // Initialize i18n DOM translation on start
  if (window.I18n) {
    window.I18n.updateDOM();
  }

  // ================= Mobile Studio Segment Switcher =================
  const mobileTabBtns = document.querySelectorAll(".mobile-tab-btn");
  const panelSketch = document.getElementById("panelSketch");
  const panelStage = document.getElementById("panelStage");
  const panelInspector = document.getElementById("panelInspector");

  // Default active on mobile is Stage Panel (The Watch Mockup)
  if (panelStage) panelStage.classList.add("mobile-active");

  mobileTabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      mobileTabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const targetId = btn.dataset.target;
      [panelSketch, panelStage, panelInspector].forEach((p) => {
        if (p) p.classList.remove("mobile-active");
      });

      const activePanel = document.getElementById(targetId);
      if (activePanel) {
        activePanel.classList.add("mobile-active");
      }
    });
  });

  // ================= Global Keyboard Shortcuts =================
  window.addEventListener("keydown", (e) => {
    const layer = renderer.getSelectedLayer();

    // Toggle fullscreen with 'F' key (when not focusing an input)
    if (e.key.toLowerCase() === "f" && !e.metaKey && !e.ctrlKey && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
      e.preventDefault();
      toggleStudioFullscreen();
      return;
    }

    // Exit fullscreen with 'Escape'
    if (e.key === "Escape" && workspaceEl && workspaceEl.classList.contains("is-fullscreen")) {
      e.preventDefault();
      toggleStudioFullscreen(false);
      return;
    }

    // 1px micro adjustment with Arrow Keys, 10px with Shift
    if (layer && layer.type !== "bg" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
      const step = e.shiftKey ? 10 : 1;
      let handled = false;

      if (e.key === "ArrowLeft") {
        updateX(layer.x - step);
        handled = true;
      } else if (e.key === "ArrowRight") {
        updateX(layer.x + step);
        handled = true;
      } else if (e.key === "ArrowUp") {
        updateY(layer.y - step);
        handled = true;
      } else if (e.key === "ArrowDown") {
        updateY(layer.y + step);
        handled = true;
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (layer.type === "custom_image" || layer.type === "custom_text") {
          renderer.deleteLayer(layer.id);
          refreshLayerDropdown();
          syncInspector(renderer.getSelectedLayer());
          showToast("已删除该图层");
          handled = true;
        }
      }

      if (handled) e.preventDefault();
    }

    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      triggerAITransform();
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      btnDownloadBin.click();
    }
  });
  } catch (err) {
    console.error("FATAL_APP_ERROR:", err);
  }
});
