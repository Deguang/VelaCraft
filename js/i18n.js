/**
 * VelaCraft Lightweight Internationalization (i18n) Engine
 * Supports Chinese (zh) and English (en) with live DOM translation,
 * localStorage persistence, and dynamic interpolation.
 */

class I18nManager {
  constructor() {
    this.currentLang = localStorage.getItem("velacraft_lang") || (navigator.language.startsWith("zh") ? "zh" : "en");
    
    this.translations = {
      zh: {
        // Navbar
        nav_studio: "工坊",
        nav_features: "特性",
        nav_guide: "指南",
        nav_specs: "规范",
        nav_faq: "问答",
        nav_status_ready: "本地离线",
        nav_import_bin: "导入 .bin",
        nav_ai_config: "AI 配置",
        nav_fullscreen: "全屏",
        nav_exit_fullscreen: "退出全屏",

        // Mobile Studio Tabs
        mobile_tab_sketch: "预设资产",
        mobile_tab_stage: "真机视口",
        mobile_tab_inspector: "属性微调",

        // Hero
        hero_pill_text: "纯前端 WASM 固件编译 · 蓝牙推流一体化工坊",
        hero_tag: "面向小米手环 8 / 9 / 10 与 Pro 系列",
        hero_title_1: "小米手环在线表盘工坊",
        hero_title_2: "纯前端设计、解包与蓝牙无线推流",
        hero_subtitle: "面向小米手环 8 / 9 / 10 与 Pro 系列。纯前端本地运行，无须配置交叉编译环境，在浏览器中直观完成表盘设计、反编译与蓝牙推流。",
        hero_btn_make: "进入工坊",
        hero_btn_guide: "安装指南",

        // Studio Section Header
        studio_heading: "在线表盘工坊",
        studio_desc: "实时 1:1 硬件物理视口，自由拖拽编排，支持一键导出固件与蓝牙直刷。",

        // Panel 1: Creation Workshop
        panel_step1_title: "预设与资产",
        tab_presets: "预设",
        tab_bin: "解包",
        tab_sketch: "画板",
        tab_upload: "AI 识别",
        preset_retro_title: "复古数显",
        preset_retro_desc: "德黑大字与三等分传感器矩阵",
        preset_analog_title: "拟真机械",
        preset_analog_desc: "经典太阳放射纹三针走时表盘",
        preset_gallery_title: "画廊写真",
        preset_gallery_desc: "毛玻璃浮层与全景壁纸展示",
        preset_cyber_title: "赛博机能",
        preset_cyber_desc: "双环规机能荧光等宽数显",
        preset_bauhaus_title: "德系包豪斯",
        preset_bauhaus_desc: "高对比度非对称极简现代排版",
        tool_pen: "画笔",
        tool_eraser: "橡皮",
        tool_clear: "清空",
        dropzone_drag: "拖拽设计截图或草图到此处",
        dropzone_sub: "或点击浏览本地图片",
        bin_drop_title: "导入 .bin 表盘固件",
        bin_drop_sub: "纯前端解析 Magic 头、解压切片并提取布局坐标",
        bin_btn_choose: "选择 .bin 文件",
        bin_btn_sample: "载入样例",
        prompt_label: "辅助排版说明",
        prompt_optional: "可选",
        prompt_placeholder: "例如：德系包豪斯、ChillDIN 德黑大字、底部三等分指标...",
        btn_ai_vision: "视觉识别转排版",
        btn_ai_subtitle: "可选特性：通过 Google Gemini 多模态识别草图坐标",

        // Presets Bar in Panel 2
        presets_label: "预设:",
        preset_retro: "复古数显",
        preset_analog: "拟真机械",
        preset_gallery: "画廊写真",
        preset_cyber: "赛博机能",
        preset_bauhaus: "德系包豪斯",
        preset_theme_color: "主题微调色",

        // Stage Toolbar
        btn_live_time: "实时",
        btn_demo_time: "样例",
        btn_aod: "AOD",
        btn_fullscreen: "全屏",
        btn_stage_sticker: "贴纸",
        btn_stage_text: "文本",
        btn_stage_import: "导入",
        btn_stage_screenshot: "截图",
        btn_stage_reset: "重置",
        stage_viewport_fps: "60 FPS 渲染视口",

        // Panel 3: Inspector
        panel_step3_title: "属性与导出",
        mode_inspector: "图层微调",
        mode_global: "全局参数",
        inspector_active_layer: "当前选定图层",
        label_align_matrix: "吸附对齐",
        align_left: "⇤ 左",
        align_center_x: "⇋ 居中",
        align_right: "⇥ 右",
        align_top: "⇡ 顶",
        align_center_y: "⇵ 中",
        align_bottom: "⇣ 底",
        align_reset: "恢复初始位置",
        group_scale: "缩放与尺寸",
        prop_font_size: "字号",
        prop_scale_x: "水平拉伸",
        prop_scale_y: "垂直拉伸",
        prop_custom_text_title: "自定义文本内容",
        prop_layer_color_title: "图层颜色",
        asset_pipeline_title: "素材替换",
        btn_upload_wallpaper: "上传个性壁纸 (PNG/JPG)",
        btn_clear_wallpaper: "恢复纯黑省电背景",
        label_current_icon: "组件图标",
        btn_replace_icon: "替换图标",
        btn_clear_icon: "恢复默认图标",
        btn_delete_layer: "删除图层",

        // Global Parameters
        label_primary_color: "主题配色",
        label_watch_title: "表盘名称",
        label_icon_style: "图标风格",
        icon_style_color: "彩色矢量",
        icon_style_mono: "极简线条",

        // Exporter
        export_preview_title: "预览图导出",
        btn_export_230: "商店图 230×328",
        btn_export_336: "高清图 336×480",
        btn_ble_sync: "网页蓝牙直刷手环",
        btn_web_share: "系统分享",
        btn_download_bin: "导出 .bin 固件",
        btn_import_bin_secondary: "导入 .bin 解包分析",

        // Features & Architecture
        features_title: "技术架构",
        features_subtitle: "完全在浏览器本地内存运行，支持直接编译、解包与无线推流。",
        arch_1_title: "纯前端固件编译与逆向引擎",
        arch_1_desc: "基于 WebAssembly 与 TypedArray 纯本地运行，零云端依赖。",
        arch_2_title: "1:1 真机双形态交互编排",
        arch_2_desc: "校准跑道圆与大方屏物理边框与真实像素比例。",
        arch_3_title: "标准规范导出与无线推流",
        arch_3_desc: "直连手环硬件与市场规范，极简闭环。",

        // Installation Guide
        guide_title: "表盘安装指南",
        guide_subtitle: "提供 3 种稳定可靠的手环安装路径。",
        guide_r1_badge: "推荐",
        guide_r1_title: "网页蓝牙直刷",
        guide_r1_desc: "免 App，通过 Chrome/Edge 浏览器直接配对推流至手环。",
        guide_r2_badge: "通用",
        guide_r2_title: "表盘工具导入",
        guide_r2_desc: "借助社区成熟工具，连接更稳定、兼容全部 Android 机型。",
        guide_r3_badge: "免工具",
        guide_r3_title: "官方应用文件替换",
        guide_r3_desc: "通过文件管理器替换小米运动健康官方缓存表盘。",

        // Decompiler Modal
        decompiler_title: "表盘固件解包分析器",
        decompiler_meta_name: "表盘名称",
        decompiler_meta_target: "目标硬件",
        decompiler_meta_res: "原生分辨率",
        decompiler_meta_slices: "切片素材",
        decompiler_meta_size: "固件包体积",
        decompiler_preview_tag: "官方商店缩略图",
        decompiler_btn_download_preview: "保存预览图",
        decompiler_slices_title: "解包提取的图层切片",
        decompiler_slices_sub: "点击切片单独保存 PNG",
        decompiler_local_tag: "纯前端本地解析 · 零数据上传",
        decompiler_btn_close: "关闭",
        decompiler_btn_load_studio: "载入工坊在线编辑",
        decompiler_btn_download_all: "下载全部切片"
      },
      en: {
        // Navbar
        nav_studio: "Studio",
        nav_features: "Features",
        nav_guide: "Guide",
        nav_specs: "Specs",
        nav_faq: "FAQ",
        nav_status_ready: "Offline Ready",
        nav_import_bin: "Import .bin",
        nav_ai_config: "AI Config",
        nav_fullscreen: "Fullscreen",
        nav_exit_fullscreen: "Exit Fullscreen",

        // Mobile Studio Tabs
        mobile_tab_sketch: "Presets",
        mobile_tab_stage: "Viewport",
        mobile_tab_inspector: "Inspector",

        // Hero
        hero_pill_text: "Pure WASM Compiler & Web Bluetooth Direct Push",
        hero_tag: "For Xiaomi Band 8 / 9 / 10 & Pro Series",
        hero_title_1: "Xiaomi Band Watchface Studio",
        hero_title_2: "Pure Client-Side Design, Decompile & BLE Flashing",
        hero_subtitle: "Engineered for Xiaomi Band 8 / 9 / 10 & Pro series. 100% static client-side, design, unpack and flash watchfaces in your browser.",
        hero_btn_make: "Open Studio",
        hero_btn_guide: "Flashing Guide",

        // Studio Section Header
        studio_heading: "Watchface Studio",
        studio_desc: "Interactive 1:1 hardware viewport with drag-and-drop layout, local decompiler and BLE flashing.",

        // Panel 1: Creation Workshop
        panel_step1_title: "Presets & Assets",
        tab_presets: "Presets",
        tab_bin: "Decompile",
        tab_sketch: "Sketch",
        tab_upload: "AI Vision",
        preset_retro_title: "Retro Chrono",
        preset_retro_desc: "Bold ChillDIN numerals with 3-column telemetry",
        preset_analog_title: "Analog Luxe",
        preset_analog_desc: "Sunburst dial with smooth mechanical 3-hands",
        preset_gallery_title: "Photo Gallery",
        preset_gallery_desc: "Frosted glass card overlay on full wallpaper",
        preset_cyber_title: "Cyber HUD",
        preset_cyber_desc: "Monospace neon typography and dual gauges",
        preset_bauhaus_title: "Bauhaus Minimal",
        preset_bauhaus_desc: "High-contrast asymmetric modernist typography",
        tool_pen: "Pen",
        tool_eraser: "Eraser",
        tool_clear: "Clear",
        dropzone_drag: "Drag sketch or screenshot here",
        dropzone_sub: "or click to browse local image",
        bin_drop_title: "Import .bin Watchface",
        bin_drop_sub: "Decompiles Magic header, unpacks RLE slices, extracts layout",
        bin_btn_choose: "Choose .bin File",
        bin_btn_sample: "Load Sample",
        prompt_label: "Layout Guidelines",
        prompt_optional: "Optional",
        prompt_placeholder: "e.g.: Bauhaus style, ChillDIN bold numerals, 3-column sensor bottom...",
        btn_ai_vision: "Convert Vision to Layout",
        btn_ai_subtitle: "Uses Google Gemini multimodal vision to extract coordinates",

        // Presets Bar in Panel 2
        presets_label: "Presets:",
        preset_retro: "Retro Chrono",
        preset_analog: "Analog Luxe",
        preset_gallery: "Gallery Photo",
        preset_cyber: "Cyber HUD",
        preset_bauhaus: "Bauhaus",
        preset_theme_color: "Theme Accent Color",

        // Stage Toolbar
        btn_live_time: "Live",
        btn_demo_time: "Demo",
        btn_aod: "AOD",
        btn_fullscreen: "Fullscreen",
        btn_stage_sticker: "Sticker",
        btn_stage_text: "Text",
        btn_stage_import: "Import",
        btn_stage_screenshot: "Screenshot",
        btn_stage_reset: "Reset",
        stage_viewport_fps: "60 FPS Viewport",

        // Panel 3: Inspector
        panel_step3_title: "Inspector & Export",
        mode_inspector: "Layer Inspector",
        mode_global: "Global Settings",
        inspector_active_layer: "Active Selected Layer",
        label_align_matrix: "Alignment",
        align_left: "Left",
        align_center_x: "Center X",
        align_right: "Right",
        align_top: "Top",
        align_center_y: "Center Y",
        align_bottom: "Bottom",
        align_reset: "Reset Position",
        group_scale: "Typography & Scale",
        prop_font_size: "Font Size",
        prop_scale_x: "Stretch Width",
        prop_scale_y: "Stretch Height",
        prop_custom_text_title: "Custom Text Content",
        prop_layer_color_title: "Layer Color",
        asset_pipeline_title: "Asset Replacement",
        btn_upload_wallpaper: "Upload Custom Wallpaper (PNG/JPG)",
        btn_clear_wallpaper: "Reset to AMOLED Pure Black",
        label_current_icon: "Widget Icon",
        btn_replace_icon: "Replace Icon",
        btn_clear_icon: "Restore Default Icon",
        btn_delete_layer: "Delete Layer",

        // Global Parameters
        label_primary_color: "Theme Color",
        label_watch_title: "Watchface Title",
        label_icon_style: "Icon Style",
        icon_style_color: "Color Vector",
        icon_style_mono: "Minimal Line",

        // Exporter
        export_preview_title: "Export & Push",
        btn_export_230: "Store 230×328",
        btn_export_336: "Screen 336×480",
        btn_ble_sync: "Flash via Bluetooth",
        btn_web_share: "Share Firmware",
        btn_download_bin: "Export .bin",
        btn_import_bin_secondary: "Import .bin File",

        // Features & Architecture
        features_title: "Technical Architecture",
        features_subtitle: "Runs entirely in browser memory for direct compilation, decompile, and push.",
        arch_1_title: "Client-Side Compiler & Decompiler",
        arch_1_desc: "Powered by WebAssembly & TypedArray, zero server dependencies.",
        arch_2_title: "1:1 Dual Form-Factor Viewport",
        arch_2_desc: "Calibrated physical chassis and exact pixel ratio for pill and rectangular screens.",
        arch_3_title: "Standard Export & Wireless Push",
        arch_3_desc: "Direct hardware connection and ecosystem store compliance.",

        // Installation Guide
        guide_title: "Installation Guide",
        guide_subtitle: "3 reliable methods to install watchfaces onto your Xiaomi Band.",
        guide_r1_badge: "Recommended",
        guide_r1_title: "Web Bluetooth Direct Flash",
        guide_r1_desc: "No companion app required. Flash wirelessly from Chrome on desktop or Android.",
        guide_r2_badge: "Universal",
        guide_r2_title: "Companion App Import",
        guide_r2_desc: "Use established community apps like Watchface Customizer or Notify.",
        guide_r3_badge: "No Tools",
        guide_r3_title: "Official App Cache Swap",
        guide_r3_desc: "Replace downloaded official watchface cache inside your phone storage.",

        // Decompiler Modal
        decompiler_title: "Firmware Decompiler",
        decompiler_meta_name: "Watchface Name",
        decompiler_meta_target: "Target Device",
        decompiler_meta_res: "Resolution",
        decompiler_meta_slices: "Slices",
        decompiler_meta_size: "File Size",
        decompiler_preview_tag: "Store Thumbnail",
        decompiler_title: "Watchface Firmware Decompiler",
        decompiler_meta_name: "Watchface Title",
        decompiler_meta_target: "Target Device",
        decompiler_meta_res: "Resolution",
        decompiler_meta_slices: "Slices Extracted",
        decompiler_meta_size: "File Size",
        decompiler_preview_tag: "Official Store Preview",
        decompiler_btn_download_preview: "Download Preview",
        decompiler_slices_title: "Extracted Layer Slices",
        decompiler_slices_sub: "Click slice to download PNG",
        decompiler_local_tag: "100% Client-Side Reverse Engineering · Zero Cloud Uploads",
        decompiler_btn_close: "Close",
        decompiler_btn_load_studio: "Load into Studio for Remaking",
        decompiler_btn_download_all: "Download All Slices"
      }
    };
  }

  t(key) {
    const dict = this.translations[this.currentLang] || this.translations.zh;
    return dict[key] || this.translations.zh[key] || key;
  }

  setLanguage(lang) {
    if (lang !== "zh" && lang !== "en") return;
    this.currentLang = lang;
    localStorage.setItem("velacraft_lang", lang);
    this.updateDOM();
    window.dispatchEvent(new CustomEvent("languagechange", { detail: { lang } }));
  }

  toggleLanguage() {
    this.setLanguage(this.currentLang === "zh" ? "en" : "zh");
    return this.currentLang;
  }

  updateDOM() {
    document.documentElement.lang = this.currentLang === "zh" ? "zh-CN" : "en";

    // Text content
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const translation = this.t(key);
      if (translation) el.textContent = translation;
    });

    // Titles
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      const translation = this.t(key);
      if (translation) el.title = translation;
    });

    // Placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const translation = this.t(key);
      if (translation) el.placeholder = translation;
    });

    // Language toggle button text
    const langText = document.getElementById("langText");
    if (langText) {
      langText.textContent = this.currentLang === "zh" ? "EN" : "中";
    }
  }
}

window.I18n = new I18nManager();
