/**
 * BrushEngine.js
 * Manages brushes and drawing tools for VOIDSKETCH
 */

class BrushEngine {
  constructor(pixelCanvas) {
    this.pixelCanvas = pixelCanvas;
    this.currentTool = "pencil";
    this.brushSize = 1;
    this.availableTools = [
      "pencil",
      "line",
      "rect",
      "ellipse",
      "glitch",
      "static",
      "eraser",
      "fill",
    ];

    // Initialize
    this.initialize();
  }

  initialize() {
    // Set up event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Tool selection buttons
    this.availableTools.forEach((tool) => {
      const button = document.getElementById(`brush-${tool}`);
      if (button) {
        button.addEventListener("click", () => this.setTool(tool));
      }
    });

    // Mark the current tool as active
    document
      .getElementById(`brush-${this.currentTool}`)
      .classList.add("active");
  }

  setTool(tool) {
    // Set the current tool in both the engine and the canvas
    this.currentTool = tool;
    this.pixelCanvas.setTool(tool);

    // Update UI - remove active class from all tool buttons
    document.querySelectorAll(".tool-button").forEach((element) => {
      element.classList.remove("active");
    });

    // Add active class to the selected tool
    document.getElementById(`brush-${tool}`).classList.add("active");

    // Update cursor based on the selected tool
    this.updateCursor();
  }

  setBrushSize(size) {
    this.brushSize = size;
    this.pixelCanvas.setBrushSize(size);

    // Update UI if there's a brush size selector
    const brushSizeInput = document.getElementById("brush-size");
    if (brushSizeInput) {
      brushSizeInput.value = size;
    }
  }

  updateCursor() {
    // Set cursor based on the current tool
    let cursor = "default";

    switch (this.currentTool) {
      case "pencil":
        cursor = "crosshair";
        break;
      case "eraser":
        cursor = 'url("assets/images/ui/eraser-cursor.png"), auto';
        break;
      case "fill":
        cursor = 'url("assets/images/ui/fill-cursor.png"), auto';
        break;
      case "glitch":
        cursor = 'url("assets/images/ui/glitch-cursor.png"), auto';
        break;
      case "static":
        cursor = 'url("assets/images/ui/static-cursor.png"), auto';
        break;
      default:
        cursor = "crosshair";
    }

    this.pixelCanvas.canvas.style.cursor = cursor;
  }

  // Load custom brushes from image files
  loadCustomBrush(imageUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Create a temporary canvas to extract the brush data
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;

        const tempCtx = tempCanvas.getContext("2d");
        tempCtx.drawImage(img, 0, 0);

        // Extract the brush data as a 2D array
        const brushData = [];
        for (let y = 0; y < img.height; y++) {
          const row = [];
          for (let x = 0; x < img.width; x++) {
            // Get the pixel data (RGBA)
            const pixel = tempCtx.getImageData(x, y, 1, 1).data;
            // Calculate if the pixel is "on" based on brightness
            const brightness = (pixel[0] + pixel[1] + pixel[2]) / 3;
            row.push(brightness > 127);
          }
          brushData.push(row);
        }

        // Return the brush data
        resolve({
          data: brushData,
          width: img.width,
          height: img.height,
        });
      };

      img.onerror = () => {
        reject(new Error(`Failed to load brush image: ${imageUrl}`));
      };

      img.src = imageUrl;
    });
  }

  // Apply a custom brush shape to the canvas
  applyCustomBrush(x, y, brushData, color) {
    const width = brushData.width || brushData.data[0].length;
    const height = brushData.height || brushData.data.length;

    // Calculate the top-left position for centering the brush
    const startX = Math.floor(x - width / 2);
    const startY = Math.floor(y - height / 2);

    // Apply the brush pattern
    for (let brushY = 0; brushY < height; brushY++) {
      for (let brushX = 0; brushX < width; brushX++) {
        // Check if this pixel is "on" in the brush pattern
        if (brushData.data[brushY][brushX]) {
          // Calculate canvas position
          const canvasX = startX + brushX;
          const canvasY = startY + brushY;

          // Draw the pixel
          this.pixelCanvas.drawPixel(canvasX, canvasY, color);
        }
      }
    }
  }
}

/**
 * SymmetryTools.js
 * Manages symmetry modes for drawing
 */

class SymmetryTools {
  constructor(pixelCanvas) {
    this.pixelCanvas = pixelCanvas;
    this.currentMode = "none";
    this.availableModes = ["none", "horizontal", "vertical", "quad", "octal"];

    // Initialize
    this.initialize();
  }

  initialize() {
    // Set up event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Symmetry mode buttons
    this.availableModes.forEach((mode) => {
      const button = document.getElementById(`symmetry-${mode}`);
      if (button) {
        button.addEventListener("click", () => this.setMode(mode));
      }
    });

    // Mark the current mode as active
    document
      .getElementById(`symmetry-${this.currentMode}`)
      .classList.add("active");
  }

  setMode(mode) {
    // Set the current symmetry mode in both the tools and the canvas
    this.currentMode = mode;
    this.pixelCanvas.setSymmetryMode(mode);

    // Update UI - remove active class from all symmetry buttons
    document
      .querySelectorAll("#tools-panel .tool-button")
      .forEach((element) => {
        if (element.id.startsWith("symmetry-")) {
          element.classList.remove("active");
        }
      });

    // Add active class to the selected mode
    document.getElementById(`symmetry-${mode}`).classList.add("active");
  }

  // Helper method to calculate symmetric points for a given coordinate
  calculateSymmetricPoints(x, y) {
    const centerX = Math.floor(this.pixelCanvas.width / 2);
    const centerY = Math.floor(this.pixelCanvas.height / 2);

    const points = [];

    // Add the original point
    points.push({ x, y });

    switch (this.currentMode) {
      case "horizontal":
        points.push({ x: 2 * centerX - x, y });
        break;

      case "vertical":
        points.push({ x, y: 2 * centerY - y });
        break;

      case "quad":
        points.push({ x: 2 * centerX - x, y });
        points.push({ x, y: 2 * centerY - y });
        points.push({ x: 2 * centerX - x, y: 2 * centerY - y });
        break;

      case "octal":
        points.push({ x: 2 * centerX - x, y });
        points.push({ x, y: 2 * centerY - y });
        points.push({ x: 2 * centerX - x, y: 2 * centerY - y });

        // Diagonal reflections
        const dx = x - centerX;
        const dy = y - centerY;
        points.push({ x: centerX + dy, y: centerY + dx });
        points.push({ x: centerX - dy, y: centerY + dx });
        points.push({ x: centerX + dy, y: centerY - dx });
        points.push({ x: centerX - dy, y: centerY - dx });
        break;
    }

    return points;
  }
}

/**
 * GlitchTool.js
 * Implements the glitch and noise effects for the canvas
 */

class GlitchTool {
  constructor(pixelCanvas) {
    this.pixelCanvas = pixelCanvas;
    this.settings = {
      intensity: 0.5,
      shiftAmount: 3,
      noiseAmount: 0.3,
    };

    // Initialize
    this.initialize();
  }

  initialize() {
    // Set up event listeners if needed
  }

  // Apply a random glitch to the current frame
  applyRandomGlitch() {
    // Get current image data
    const imageData = this.pixelCanvas.getCanvasImageData();
    const data = imageData.data;
    const width = this.pixelCanvas.width;
    const height = this.pixelCanvas.height;

    // Decide on glitch type
    const glitchType = Math.floor(Math.random() * 3);

    switch (glitchType) {
      case 0:
        // Shift rows randomly
        this.shiftRows(data, width, height);
        break;
      case 1:
        // Channel shift
        this.channelShift(data, width, height);
        break;
      case 2:
        // Pixel sort
        this.pixelSort(data, width, height);
        break;
    }

    // Apply the modified image data
    this.pixelCanvas.setCanvasFromImageData(imageData);
  }

  // Shift horizontal rows randomly
  shiftRows(data, width, height) {
    const intensity = this.settings.intensity;
    const shiftAmount = this.settings.shiftAmount;

    // Number of rows to affect
    const affectedRows = Math.floor(height * intensity * 0.3);

    for (let i = 0; i < affectedRows; i++) {
      // Choose a random row
      const row = Math.floor(Math.random() * height);
      const shift = Math.floor(Math.random() * shiftAmount * 2) - shiftAmount;

      // Skip if no shift
      if (shift === 0) continue;

      // Create a copy of the row
      const rowData = new Uint8ClampedArray(width * 4);
      for (let x = 0; x < width; x++) {
        const index = (row * width + x) * 4;
        rowData[x * 4] = data[index];
        rowData[x * 4 + 1] = data[index + 1];
        rowData[x * 4 + 2] = data[index + 2];
        rowData[x * 4 + 3] = data[index + 3];
      }

      // Apply the shift
      for (let x = 0; x < width; x++) {
        const targetX = (x + shift + width) % width;
        const targetIndex = (row * width + targetX) * 4;
        const sourceIndex = x * 4;

        data[targetIndex] = rowData[sourceIndex];
        data[targetIndex + 1] = rowData[sourceIndex + 1];
        data[targetIndex + 2] = rowData[sourceIndex + 2];
        data[targetIndex + 3] = rowData[sourceIndex + 3];
      }
    }
  }

  // Shift color channels
  channelShift(data, width, height) {
    const intensity = this.settings.intensity;
    const shiftAmount = this.settings.shiftAmount;

    // Choose which channel to shift (R, G, or B)
    const channel = Math.floor(Math.random() * 3);
    const shift = Math.floor(Math.random() * shiftAmount * 2) - shiftAmount;

    // Skip if no shift
    if (shift === 0) return;

    // Only affect part of the image
    const startY = Math.floor(Math.random() * height * 0.5);
    const endY = startY + Math.floor(height * intensity * 0.5);

    // Create a copy of the affected region
    const regionData = new Uint8ClampedArray((endY - startY) * width);
    for (let y = startY; y < endY; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4 + channel;
        regionData[(y - startY) * width + x] = data[index];
      }
    }

    // Apply the shift
    for (let y = startY; y < endY; y++) {
      for (let x = 0; x < width; x++) {
        const targetX = (x + shift + width) % width;
        const targetIndex = (y * width + targetX) * 4 + channel;
        const sourceIndex = (y - startY) * width + x;

        data[targetIndex] = regionData[sourceIndex];
      }
    }
  }

  // Sort pixels in a region
  pixelSort(data, width, height) {
    const intensity = this.settings.intensity;

    // Choose a random region
    const startY = Math.floor(Math.random() * height * 0.7);
    const regionHeight = Math.floor(height * intensity * 0.3);
    const endY = Math.min(startY + regionHeight, height);

    // Sort each row in the region
    for (let y = startY; y < endY; y++) {
      // Get the row data
      const rowIndices = [];
      const rowBrightness = [];

      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        rowIndices.push(index);

        // Calculate brightness
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const brightness = (r + g + b) / 3;

        rowBrightness.push(brightness);
      }

      // Sort indices by brightness
      rowIndices.sort((a, b) => {
        return (
          rowBrightness[rowIndices.indexOf(a)] -
          rowBrightness[rowIndices.indexOf(b)]
        );
      });

      // Create a copy of the sorted row
      const sortedRow = new Uint8ClampedArray(width * 4);
      for (let i = 0; i < width; i++) {
        const sourceIndex = rowIndices[i];
        const targetIndex = i * 4;

        sortedRow[targetIndex] = data[sourceIndex];
        sortedRow[targetIndex + 1] = data[sourceIndex + 1];
        sortedRow[targetIndex + 2] = data[sourceIndex + 2];
        sortedRow[targetIndex + 3] = data[sourceIndex + 3];
      }

      // Copy back to the main data
      for (let i = 0; i < width; i++) {
        const sourceIndex = i * 4;
        const targetIndex = (y * width + i) * 4;

        data[targetIndex] = sortedRow[sourceIndex];
        data[targetIndex + 1] = sortedRow[sourceIndex + 1];
        data[targetIndex + 2] = sortedRow[sourceIndex + 2];
        data[targetIndex + 3] = sortedRow[sourceIndex + 3];
      }
    }
  }

  // Add digital noise to the canvas
  addNoise(intensity = null) {
    // Use provided intensity or default
    const noiseAmount =
      intensity !== null ? intensity : this.settings.noiseAmount;

    // Get current image data
    const imageData = this.pixelCanvas.getCanvasImageData();
    const data = imageData.data;

    // Add noise to each pixel
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < noiseAmount) {
        // Generate random RGB values
        const noise = Math.floor(Math.random() * 50) - 25;

        // Apply to RGB channels
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
      }
    }

    // Apply the modified image data
    this.pixelCanvas.setCanvasFromImageData(imageData);
  }

  // Create data corruption effect
  corruptData(severity = 0.5) {
    // Get current image data
    const imageData = this.pixelCanvas.getCanvasImageData();
    const data = imageData.data;

    // Number of bytes to corrupt
    const corruptCount = Math.floor(data.length * severity * 0.01);

    for (let i = 0; i < corruptCount; i++) {
      // Choose a random byte
      const index = Math.floor(Math.random() * data.length);

      // Corrupt the byte
      const corruptionType = Math.floor(Math.random() * 3);
      switch (corruptionType) {
        case 0:
          // Zero out
          data[index] = 0;
          break;
        case 1:
          // Max out
          data[index] = 255;
          break;
        case 2:
          // Random value
          data[index] = Math.floor(Math.random() * 256);
          break;
      }
    }

    // Apply the modified image data
    this.pixelCanvas.setCanvasFromImageData(imageData);
  }

  // Settings getter/setter
  getSettings() {
    return { ...this.settings };
  }

  setSettings(settings) {
    this.settings = {
      ...this.settings,
      ...settings,
    };
  }
}
