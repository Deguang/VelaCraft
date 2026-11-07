/**
 * VelaCraft Touch & Mouse Sketchboard
 * Supports pointer drawing, pressure/smooth lines, undo, presets, and image upload.
 */

class CanvasSketch {
  constructor() {
    this.canvas = document.getElementById("sketchCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.isDrawing = false;
    this.isEraser = false;
    this.brushSize = 4;
    this.brushColor = "#ffffff";
    this.history = [];
    this.maxHistory = 20;

    this.initCanvas();
    this.bindEvents();
  }

  setDimensions(w, h, shape = "rect") {
    this.canvas.width = w;
    this.canvas.height = h;
    this.shape = shape;
    this.clear();
  }

  initCanvas() {
    // Fill pure black
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.saveState();
  }

  saveState() {
    if (this.history.length >= this.maxHistory) {
      this.history.shift();
    }
    this.history.push(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
  }

  undo() {
    if (this.history.length > 1) {
      this.history.pop(); // discard current
      const prevState = this.history[this.history.length - 1];
      this.ctx.putImageData(prevState, 0, 0);
    }
  }

  clear() {
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.saveState();
  }

  getPointerPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

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

  bindEvents() {
    const startDraw = (e) => {
      e.preventDefault();
      this.isDrawing = true;
      const pos = this.getPointerPos(e);
      this.ctx.beginPath();
      this.ctx.moveTo(pos.x, pos.y);
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      this.ctx.lineWidth = this.brushSize;
      this.ctx.strokeStyle = this.isEraser ? "#000000" : this.brushColor;
    };

    const draw = (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();
      const pos = this.getPointerPos(e);
      this.ctx.lineTo(pos.x, pos.y);
      this.ctx.stroke();
    };

    const stopDraw = (e) => {
      if (this.isDrawing) {
        this.isDrawing = false;
        this.ctx.closePath();
        this.saveState();
      }
    };

    // Pointer & Touch events
    this.canvas.addEventListener("mousedown", startDraw);
    this.canvas.addEventListener("mousemove", draw);
    window.addEventListener("mouseup", stopDraw);

    this.canvas.addEventListener("touchstart", startDraw, { passive: false });
    this.canvas.addEventListener("touchmove", draw, { passive: false });
    window.addEventListener("touchend", stopDraw);

    // UI Tools
    document.getElementById("penTool").addEventListener("click", () => {
      this.isEraser = false;
      document.getElementById("penTool").classList.add("active");
      document.getElementById("eraserTool").classList.remove("active");
    });

    document.getElementById("eraserTool").addEventListener("click", () => {
      this.isEraser = true;
      document.getElementById("eraserTool").classList.add("active");
      document.getElementById("penTool").classList.remove("active");
    });

    document.getElementById("brushSize").addEventListener("input", (e) => {
      this.brushSize = parseInt(e.target.value, 10);
    });

    document.getElementById("brushColor").addEventListener("input", (e) => {
      this.brushColor = e.target.value;
      this.isEraser = false;
      document.getElementById("penTool").classList.add("active");
      document.getElementById("eraserTool").classList.remove("active");
    });

    document.getElementById("clearCanvasBtn").addEventListener("click", () => {
      this.clear();
    });

    // Keyboard Undo
    window.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        this.undo();
      }
    });

    // Preset 1: 3-Column Minimal Chrono
    document.getElementById("loadPreset1")?.addEventListener("click", () => {
      this.drawPresetChrono();
    });

    // Preset 2: Mega Stretched Time
    document.getElementById("loadPreset2")?.addEventListener("click", () => {
      this.drawPresetMega();
    });
  }

  drawPresetChrono() {
    this.clear();
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 3;
    this.ctx.font = "bold 14px sans-serif";
    this.ctx.fillStyle = "#8a8f98";

    if (this.shape === "pill") {
      // Pill layout (192 x 490)
      this.ctx.strokeRect(24, 36, 50, 20);
      this.ctx.strokeRect(118, 36, 50, 20);

      this.ctx.strokeStyle = "#5e6ad2";
      this.ctx.lineWidth = 4;
      this.ctx.strokeRect(20, 95, 152, 65);
      this.ctx.strokeRect(20, 175, 152, 65);
      this.ctx.font = "bold 44px sans-serif";
      this.ctx.fillText("10", 72, 142);
      this.ctx.fillText("42", 72, 222);

      this.ctx.strokeStyle = "#f59e0b";
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(18, 255, 156, 32);

      this.ctx.strokeStyle = "#00e5ff";
      this.ctx.strokeRect(18, 310, 156, 38);
      this.ctx.strokeRect(18, 360, 156, 38);
      this.ctx.strokeRect(18, 410, 156, 38);
    } else {
      // Pro layout (336 x 480)
      // Top status sketch (Weather left, Battery right)
      this.ctx.strokeRect(30, 32, 60, 24);
      this.ctx.strokeRect(246, 32, 60, 24);

      // Giant Time Box (10 : 42)
      this.ctx.strokeStyle = "#5e6ad2";
      this.ctx.lineWidth = 4;
      this.ctx.strokeRect(28, 88, 130, 130);
      this.ctx.strokeRect(178, 88, 130, 130);
      this.ctx.font = "bold 52px sans-serif";
      this.ctx.fillText("10", 62, 172);
      this.ctx.fillText("42", 212, 172);

      // Mid Ribbon (Date / Sec)
      this.ctx.strokeStyle = "#f59e0b";
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(28, 250, 85, 36);
      this.ctx.strokeRect(125, 250, 85, 36);
      this.ctx.strokeRect(223, 250, 85, 36);

      // 3 Equal Bottom Columns (112px width each on real watch: Step, Cal, BPM)
      this.ctx.strokeStyle = "#00e5ff";
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(22, 330, 88, 90);
      this.ctx.strokeRect(124, 330, 88, 90);
      this.ctx.strokeRect(226, 330, 88, 90);
    }

    this.saveState();
  }

  drawPresetMega() {
    this.clear();
    this.ctx.strokeStyle = "#00e5ff";
    this.ctx.lineWidth = 5;

    // Ultra tall time blocks
    this.ctx.strokeRect(28, 40, 130, 210);
    this.ctx.strokeRect(178, 40, 130, 210);

    this.ctx.strokeStyle = "#f59e0b";
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(28, 280, 280, 60);

    this.ctx.strokeStyle = "#ff3344";
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(28, 360, 280, 75);

    this.saveState();
  }

  getBase64Image() {
    return this.canvas.toDataURL("image/png");
  }
}

window.CanvasSketch = new CanvasSketch();
