# VelaCraft Design System (`DESIGN.md`)

> **Visual Language & Component Specification for VelaCraft Studio**  
> *Inspired by the editorial precision, warm obsidian surfaces, and horizon grid of [getdesign.md](https://getdesign.md/).*

---

## 1. Design Philosophy

VelaCraft bridges **physical hardware engineering** with **modern editorial web craft**. The design language combines:
1. **Editorial Sophistication**: Warm display typography (`Fraunces`) paired with crisp interface text (`Inter`).
2. **Hardware Precision**: Technical indices (`// 01 WASM ENGINE`), CAD coordinate reticles, and monospace telemetry (`JetBrains Mono`).
3. **Atmospheric Lighting**: Deep obsidian slate surfaces with subtle horizon grids, ambient spotlight halos, and specular top edge reflections.

---

## 2. Typography Hierarchy

| Role | Font Family | Weight | Tracking / Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `Fraunces`, Georgia, serif | 400, 500 | `letter-spacing: -0.025em; line-height: 1.1;` | Hero title, section headings, brand logo |
| **Interface / Sans** | `Inter`, -apple-system, sans-serif | 400, 500, 600, 700 | `letter-spacing: -0.015em; line-height: 1.5;` | General UI, body text, buttons, form inputs |
| **Telemetry / Code** | `JetBrains Mono`, monospace | 500, 600 | `letter-spacing: 0.04em;` | Step codes (`// 01`), coordinates (`X: 168`), specs |
| **Watchface Numerals** | `ChillDIN`, sans-serif | 100 ~ 900 (VF) | Native condensed DIN proportions | Watchface digital clock & complications |

---

## 3. Color Tokens

### Surface & Canvas
```css
--bg-deep:        #090a0d;  /* Root canvas background */
--bg-subtle:      #0e1015;  /* Secondary page background & workspace wrapper */
--surface:        #13161f;  /* Cards, panels, elevated surfaces */
--surface-hover:  #181d28;  /* Interactive hover state */
--surface-active: #1f2534;  /* Active / pressed state */
```

### Borders & Specular Shimmers
```css
--border:         rgba(255, 255, 255, 0.08);   /* Default hairline border */
--border-subtle:  rgba(255, 255, 255, 0.04);   /* Micro dividers */
--border-focus:   rgba(59, 130, 246, 0.60);   /* Focus outline */
--border-shine:   inset 0 1px 0 0 rgba(255, 255, 255, 0.08); /* Top edge specular shine */
```

### Typography Colors
```css
--text-primary:   #f8fafc;  /* Main titles & high-contrast text */
--text-secondary: #94a3b8;  /* Subtitles & descriptive labels */
--text-muted:     #64748b;  /* Inactive states & footnotes */
--text-disabled:  #334155;  /* Disabled elements */
```

### Brand & Accent
```css
--accent:          #3b82f6;  /* Cobalt blue */
--accent-light:    #60a5fa;  /* Cyan-tinted blue */
--accent-gradient: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
--accent-glow:     0 0 24px rgba(59, 130, 246, 0.4);
```

---

## 4. Atmospheric Background & Horizon Grid

The background uses a signature dual-axis horizon grid texture:
```css
.hero-dot-grid {
  background-image: 
    repeating-linear-gradient(0deg, transparent 0px, transparent 23px, rgba(255, 255, 255, 0.035) 23px, rgba(255, 255, 255, 0.035) 24px),
    repeating-linear-gradient(90deg, transparent 0px, transparent 23px, rgba(255, 255, 255, 0.035) 23px, rgba(255, 255, 255, 0.035) 24px),
    radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 24px 24px, 24px 24px, 24px 24px;
  mask-image: radial-gradient(ellipse at 50% 35%, black 25%, transparent 80%);
}
```

---

## 5. Component Patterns

### 1. Cards with Inset Shimmer
All elevated cards (`.arch-pillar-card`, `.spec-card`, `.preset-card-item`) feature an inner specular reflection along their top edge to simulate ambient studio lighting:
```css
box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.08), 0 8px 30px -4px rgba(0, 0, 0, 0.45);
```

### 2. Floating Stage Dock
Floating glassmorphism capsule with backdrop blur:
```css
background: rgba(13, 16, 22, 0.85);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.12);
box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12);
border-radius: var(--radius-full);
```

### 3. Hardware Mockup Chassis
The physical Xiaomi Band 10 / 9 / 8 chassis includes subtle titanium beveled edges and ambient floor spotlighting:
```css
box-shadow: 
  0 0 0 2px #383c48,
  0 0 0 3px #12141a,
  0 28px 65px rgba(0, 0, 0, 0.95),
  0 0 50px rgba(59, 130, 246, 0.16),
  inset 0 1px 2px rgba(255, 255, 255, 0.35);
```

---

## 6. Motion & Curves

- Fast Interactive Transition: `0.15s cubic-bezier(0.16, 1, 0.3, 1)`
- Smooth Layout Transition: `0.25s cubic-bezier(0.16, 1, 0.3, 1)`
