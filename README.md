# VelaCraft ⌚✨

> **下一代小米手环 Web 表盘可视化工坊**  
> *Next-Gen Pure-Web Visual Watchface Studio for Xiaomi Band 8 / 9 / 10 / Pro Series.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-app.lideguang.com%2FVelaCraft-blueviolet)](https://app.lideguang.com/VelaCraft/)
[![Pure Web](https://img.shields.io/badge/Platform-Pure%20HTML5%20%2F%20Canvas-emerald)](https://app.lideguang.com/VelaCraft/)
[![Devices](https://img.shields.io/badge/Xiaomi%20Band-8%20%7C%209%20%7C%2010%20%7C%20Pro-cyan)](https://github.com/Deguang/VelaCraft)

---

## 🌟 特性概览 (Features)

- **纯前端零依赖 (Pure Client-Side Engine)**：无需安装 Python、C# 或 .NET 环境，直接在现代浏览器中运行 60Hz 实时双缓冲渲染引擎。
- **全系机型覆盖 (Multi-Device Matrix)**：
  - **方屏旗舰**：小米手环 10 Pro (336×480) / 小米手环 9 Pro (336×480) / 小米手环 8 Pro (336×480)
  - **跑道长胶囊**：小米手环 10 (212×520) / 小米手环 9 (192×490) / 小米手环 8 (192×490)
- **5 大经典预设与深度微调 (5 Built-in Specialized Presets)**：
  1. **复古数显 (Retro Chrono)**：德黑 ChillDIN 数字、三等分传感器矩阵、全图层自由排版与打包。
  2. **拟真机械 (Analog Luxe)**：60Hz 平滑三针扫秒、4 款奢华盘面材质（钛黑/曜蓝/墨绿/象牙白）、微调指针与副盘。
  3. **画廊写真 (Gallery Photo)**：5 套全景主题壁纸（日落/极光/赛博雨夜/冷杉/樱雪）、支持自定义照片一键上传并自动暗角裁剪。
  4. **赛博机能 (Cyber HUD)**：等宽未来荧光时钟、双弧形进度表盘（步数与电量）、秒数独立卡片。
  5. **德系包豪斯 (Bauhaus Minimal)**：极简非对称红蓝几何色块、上下巨型叠排时间、自适应胶囊与方屏比例。
- **舞台交互与图层微调 (Interactive Gizmo Editor)**：
  - 舞台实时鼠标拖拽对齐、X/Y 坐标数字滑动微调。
  - 字体选择、水平/垂直独立缩放比例、自动对齐（左、中、右、顶、底）。
  - 图层显隐、锁定、顺序调整，以及实时指标预览。
- **贴纸与个性标签 (Stickers & Custom Text)**：
  - 内置矢量贴纸库（闪电、火箭、游戏机、星星、钻石、火苗、爱心、耳机）与本地贴纸导入。
  - 支持叠加自定义个性文字图层。
- **全时态预览 (Multi-State Preview)**：
  - **实时模式 (Live Time)**：与本地系统真实时钟秒级同步。
  - **样例定格 (Demo Time)**：经典黄金发布会时刻 `10:42`。
  - **息屏低功耗预览 (AOD Mode)**：超低发光率 AMOLED 息屏预览。
  - **全屏沉浸预览 (Fullscreen)**：一键沉浸全屏校验效果。
- **Web 蓝牙无线直连 (Web Bluetooth Direct Sync)**：
  - 支持通过 Web Bluetooth API 直接搜索周边手环并无线写入表盘二进制固件。
- **AI 视觉自动识别 (Multimodal AI Vision)**：
  - 支持接入 Google Gemini 多模态视觉模型，上传参考设计图即可自动推断时间与指标排版坐标。
- **双语界面 (Internationalization)**：
  - 内置中文 / 英文双语无缝切换。

---

## 🚀 快速开始 (Quick Start)

### 选项 1：直接通过静态服务器启动
```bash
git clone https://github.com/Deguang/VelaCraft.git
cd VelaCraft

# 使用任意静态服务器启动，例如 Python:
python3 -m http.server 8080

# 打开浏览器访问:
# http://localhost:8080
```

### 选项 2：通过 GitHub Pages 免费部署
进入本仓库 `Settings` -> `Pages` -> Source 选择 `Deploy from a branch` -> 选择 `main` 分支 `/ (root)` 保存即可自动上线访问！

---

## 📁 目录结构 (Project Structure)

```text
VelaCraft/
├── index.html                  # Web Studio 核心三栏式单页应用
├── css/
│   └── style.css               # 工业级极简深色工作台样式表
├── js/
│   ├── app.js                  # UI 事件分发与状态同步控制器
│   ├── watchface-renderer.js   # 60Hz 双缓冲表盘渲染引擎 (含 5 大预设)
│   ├── canvas-sketch.js        # 简易画板与手绘导出模块
│   ├── vela-packer.js          # Vela 表盘二进制打包生成器
│   ├── vela-unpacker.js        # Vela 表盘 bin 解包器
│   ├── web-ble.js              # Web Bluetooth 蓝牙传输通信栈
│   ├── ai-vision.js            # Gemini 多模态视觉识别与排版提取
│   └── i18n.js                 # 完整中英双语国际化翻译字典
├── fonts/
│   └── ChillDINVF.ttf          # 可变字重 ChillDIN 经典表盘字体
└── assets/
    ├── preview.png             # 演示与分享缩略图
    ├── icons/                  # 彩色与单色矢量传感器图标集
    └── RetroChrono_*.bin       # 全机型经过校验的预设二进制包
```

---

## 🛠️ 支持机型规格一览 (Hardware Targets)

| 机型名称 | 芯片 / 固件平台 | 屏幕形态 | 物理分辨率 | 像素密度 |
| :--- | :--- | :--- | :--- | :--- |
| **小米手环 10 Pro** | Xiaomi Vela OS | 矩形方屏 | **336 × 480** | 336 PPI |
| **小米手环 10** | Xiaomi Vela OS | 跑道胶囊 | **212 × 520** | 326 PPI |
| **小米手环 9 Pro** | Xiaomi Vela OS | 矩形方屏 | **336 × 480** | 336 PPI |
| **小米手环 9** | Xiaomi Vela OS | 跑道胶囊 | **192 × 490** | 326 PPI |
| **小米手环 8 Pro** | Xiaomi Vela OS | 矩形方屏 | **336 × 480** | 336 PPI |
| **小米手环 8** | Xiaomi Vela OS | 跑道胶囊 | **192 × 490** | 326 PPI |

---

## 📄 开源许可证 (License)

本项目基于 [MIT License](LICENSE) 开源发布。  
Copyright (c) 2026 [Li Deguang](https://app.lideguang.com).
