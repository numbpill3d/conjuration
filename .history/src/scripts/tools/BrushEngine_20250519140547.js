/**
 * BrushEngine Class
 *
 * Handles different brush types and drawing operations.
 */
class BrushEngine {
  /**
   * Create a new BrushEngine
   * @param {PixelCanvas} canvas - The PixelCanvas instance
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.activeBrush = 'pencil';
    this.brushSize = 1;
    this.primaryColor = '#ffffff';
    this.secondaryColor = '#000000';
    this.isDrawing = false;
    this.startX = 0;
    this.startY = 0;
    this.lastX = 0;
    this.lastY = 0;

    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Set up event listeners for mouse/touch interaction
   */
  setupEventListeners() {
    const canvas = this.canvas.canvas;

    // Mouse events
    canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));

    // Prevent context menu on right-click
    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  /**
   * Handle mouse down event
   * @param {MouseEvent} e - Mouse event
   */
  handleMouseDown(e) {
    this.isDrawing = true;

    // Get pixel coordinates
    const rect = this.canvas.canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (this.canvas.pixelSize * this.canvas.zoom));
    const y = Math.floor((e.clientY - rect.top) / (this.canvas.pixelSize * this.canvas.zoom));

    // Store start position
    this.startX = x;
    this.startY = y;
    this.lastX = x;
    this.lastY = y;

    // Get color based on mouse button
    const color = e.buttons === 2 ? this.secondaryColor : this.primaryColor;

    // Handle different brush types
    switch (this.activeBrush) {
      case 'pencil':
        this.drawWithPencil(x, y, color);
        break;
      case 'brush':
        this.drawWithBrush(x, y, color);
        break;
      case 'eraser':
        this.drawWithEraser(x, y);
        break;
      case 'fill':
        this.fillArea(x, y, color);
        break;
      case 'line':
      case 'rect':
      case 'ellipse':
        // These are handled in mouseMove and mouseUp
        break;
      case 'glitch':
        this.applyGlitchBrush(x, y, color);
        break;
      case 'static':
        this.applyStaticBrush(x, y, color);
        break;
      case 'spray':
        this.applySprayBrush(x, y, color);
        break;
      case 'pixel':
        this.drawPixelBrush(x, y, color);
        break;
      case 'dither':
        this.applyDitherBrush(x, y, color);
        break;
      case 'pattern':
        this.applyPatternBrush(x, y, color);
        break;
    }

    // Render the canvas
    this.canvas.render();
  }

  /**
   * Handle mouse move event
   * @param {MouseEvent} e - Mouse event
   */
  handleMouseMove(e) {
    if (!this.isDrawing) return;

    // Get pixel coordinates
    const rect = this.canvas.canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (this.canvas.pixelSize * this.canvas.zoom));
    const y = Math.floor((e.clientY - rect.top) / (this.canvas.pixelSize * this.canvas.zoom));

    // Get color based on mouse button
    const color = e.buttons === 2 ? this.secondaryColor : this.primaryColor;

    // Handle different brush types
    switch (this.activeBrush) {
      case 'pencil':
        this.drawWithPencil(x, y, color);
        break;
      case 'brush':
        this.drawWithBrush(x, y, color);
        break;
      case 'eraser':
        this.drawWithEraser(x, y);
        break;
      case 'line':
        this.previewLine(this.startX, this.startY, x, y, color);
        break;
      case 'rect':
        this.previewRect(this.startX, this.startY, x, y, color);
        break;
      case 'ellipse':
        this.previewEllipse(this.startX, this.startY, x, y, color);
        break;
      case 'glitch':
        this.applyGlitchBrush(x, y, color);
        break;
      case 'static':
        this.applyStaticBrush(x, y, color);
        break;
      case 'spray':
        this.applySprayBrush(x, y, color);
        break;
      case 'pixel':
        this.drawPixelBrush(x, y, color);
        break;
      case 'dither':
        this.applyDitherBrush(x, y, color);
        break;
      case 'pattern':
        this.applyPatternBrush(x, y, color);
        break;
    }

    // Update last position
    this.lastX = x;
    this.lastY = y;

    // Render the canvas
    this.canvas.render();
  }

  /**
   * Handle mouse up event
   * @param {MouseEvent} e - Mouse event
   */
  handleMouseUp(e) {
    if (!this.isDrawing) return;

    // Get pixel coordinates
    const rect = this.canvas.canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (this.canvas.pixelSize * this.canvas.zoom));
    const y = Math.floor((e.clientY - rect.top) / (this.canvas.pixelSize * this.canvas.zoom));

    // Get color based on mouse button
    const color = e.buttons === 2 ? this.secondaryColor : this.primaryColor;

    // Handle different brush types
    switch (this.activeBrush) {
      case 'line':
        this.drawLine(this.startX, this.startY, x, y, color);
        break;
      case 'rect':
        this.drawRect(this.startX, this.startY, x, y, color);
        break;
      case 'ellipse':
        this.drawEllipse(this.startX, this.startY, x, y, color);
        break;
    }

    this.isDrawing = false;

    // Render the canvas
    this.canvas.render();
  }

  /**
   * Set the active brush
   * @param {string} brushType - Type of brush to set as active
   */
  setActiveBrush(brushType) {
    this.activeBrush = brushType;

    // Set default brush size based on brush type
    switch (brushType) {
      case 'pencil':
      case 'eraser':
        this.brushSize = 1;
        break;
      case 'spray':
        this.brushSize = 5;
        break;
      case 'brush':
        this.brushSize = 3;
        break;
      case 'pixel':
        this.brushSize = 1;
        break;
      case 'dither':
        this.brushSize = 3;
        break;
      case 'pattern':
        this.brushSize = 4;
        break;
    }

    // Update brush size slider if it exists
    const brushSizeSlider = document.getElementById('brush-size');
    if (brushSizeSlider) {
      brushSizeSlider.value = this.brushSize;

      // Update the displayed value
      const brushSizeValue = document.getElementById('brush-size-value');
      if (brushSizeValue) {
        brushSizeValue.textContent = this.brushSize;
      }
    }
  }

  /**
   * Set the brush size
   * @param {number} size - Size of the brush in pixels
   */
  setBrushSize(size) {
    this.brushSize = size;
  }

  /**
   * Set the primary color
   * @param {string} color - Color in hex format
   */
  setPrimaryColor(color) {
    this.primaryColor = color;
  }

  /**
   * Set the secondary color
   * @param {string} color - Color in hex format
   */
  setSecondaryColor(color) {
    this.secondaryColor = color;
  }

  /**
   * Draw with the pencil brush
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} color - Color in hex format
   */
  drawWithPencil(x, y, color) {
    if (this.brushSize === 1) {
      // Single pixel
      this.canvas.drawPixel(x, y, color);
    } else {
      // Draw a square of pixels
      const offset = Math.floor(this.brushSize / 2);
      for (let i = -offset; i <= offset; i++) {
        for (let j = -offset; j <= offset; j++) {
          this.canvas.drawPixel(x + i, y + j, color);
        }
      }
    }

    // Draw a line from last position to current position
    if (this.lastX !== x || this.lastY !== y) {
      this.canvas.drawLine(this.lastX, this.lastY, x, y, color);
    }
  }

  /**
   * Draw with the eraser brush
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  drawWithEraser(x, y) {
    if (this.brushSize === 1) {
      // Single pixel
      this.canvas.drawPixel(x, y, '#000000');
    } else {
      // Draw a square of pixels
      const offset = Math.floor(this.brushSize / 2);
      for (let i = -offset; i <= offset; i++) {
        for (let j = -offset; j <= offset; j++) {
          this.canvas.drawPixel(x + i, y + j, '#000000');
        }
      }
    }

    // Draw a line from last position to current position
    if (this.lastX !== x || this.lastY !== y) {
      this.canvas.drawLine(this.lastX, this.lastY, x, y, '#000000');
    }
  }

  /**
   * Fill an area with a color
   * @param {number} x - Starting X coordinate
   * @param {number} y - Starting Y coordinate
   * @param {string} color - Color to fill with
   */
  fillArea(x, y, color) {
    this.canvas.floodFill(x, y, color);
  }

  /**
   * Preview a line
   * @param {number} x1 - Starting X coordinate
   * @param {number} y1 - Starting Y coordinate
   * @param {number} x2 - Ending X coordinate
   * @param {number} y2 - Ending Y coordinate
   * @param {string} color - Color in hex format
   */
  previewLine(x1, y1, x2, y2, color) {
    // Save the current pixel data
    const originalPixels = this.canvas.getPixelData();

    // Draw the line
    this.canvas.drawLine(x1, y1, x2, y2, color);

    // Restore the original pixel data on the next frame
    setTimeout(() => {
      this.canvas.setPixelData(originalPixels);
    }, 0);
  }

  /**
   * Draw a line
   * @param {number} x1 - Starting X coordinate
   * @param {number} y1 - Starting Y coordinate
   * @param {number} x2 - Ending X coordinate
   * @param {number} y2 - Ending Y coordinate
   * @param {string} color - Color in hex format
   */
  drawLine(x1, y1, x2, y2, color) {
    this.canvas.drawLine(x1, y1, x2, y2, color);
  }

  /**
   * Preview a rectangle
   * @param {number} x1 - Starting X coordinate
   * @param {number} y1 - Starting Y coordinate
   * @param {number} x2 - Ending X coordinate
   * @param {number} y2 - Ending Y coordinate
   * @param {string} color - Color in hex format
   */
  previewRect(x1, y1, x2, y2, color) {
    // Save the current pixel data
    const originalPixels = this.canvas.getPixelData();

    // Calculate rectangle dimensions
    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x2 - x1) + 1;
    const height = Math.abs(y2 - y1) + 1;

    // Draw the rectangle
    this.canvas.drawRect(left, top, width, height, color);

    // Restore the original pixel data on the next frame
    setTimeout(() => {
      this.canvas.setPixelData(originalPixels);
    }, 0);
  }

  /**
   * Draw a rectangle
   * @param {number} x1 - Starting X coordinate
   * @param {number} y1 - Starting Y coordinate
   * @param {number} x2 - Ending X coordinate
   * @param {number} y2 - Ending Y coordinate
   * @param {string} color - Color in hex format
   */
  drawRect(x1, y1, x2, y2, color) {
    // Calculate rectangle dimensions
    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x2 - x1) + 1;
    const height = Math.abs(y2 - y1) + 1;

    // Draw the rectangle
    this.canvas.drawRect(left, top, width, height, color);
  }

  /**
   * Preview an ellipse
   * @param {number} x1 - Starting X coordinate
   * @param {number} y1 - Starting Y coordinate
   * @param {number} x2 - Ending X coordinate
   * @param {number} y2 - Ending Y coordinate
   * @param {string} color - Color in hex format
   */
  previewEllipse(x1, y1, x2, y2, color) {
    // Save the current pixel data
    const originalPixels = this.canvas.getPixelData();

    // Calculate ellipse parameters
    const centerX = Math.floor((x1 + x2) / 2);
    const centerY = Math.floor((y1 + y2) / 2);
    const radiusX = Math.abs(x2 - x1) / 2;
    const radiusY = Math.abs(y2 - y1) / 2;

    // Draw the ellipse
    this.canvas.drawEllipse(centerX, centerY, radiusX, radiusY, color);

    // Restore the original pixel data on the next frame
    setTimeout(() => {
      this.canvas.setPixelData(originalPixels);
    }, 0);
  }

  /**
   * Draw an ellipse
   * @param {number} x1 - Starting X coordinate
   * @param {number} y1 - Starting Y coordinate
   * @param {number} x2 - Ending X coordinate
   * @param {number} y2 - Ending Y coordinate
   * @param {string} color - Color in hex format
   */
  drawEllipse(x1, y1, x2, y2, color) {
    // Calculate ellipse parameters
    const centerX = Math.floor((x1 + x2) / 2);
    const centerY = Math.floor((y1 + y2) / 2);
    const radiusX = Math.abs(x2 - x1) / 2;
    const radiusY = Math.abs(y2 - y1) / 2;

    // Draw the ellipse
    this.canvas.drawEllipse(centerX, centerY, radiusX, radiusY, color);
  }

  /**
   * Apply the glitch brush
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} color - Color in hex format
   */
  applyGlitchBrush(x, y, color) {
    // Draw a basic pixel
    this.canvas.drawPixel(x, y, color);

    // Add random glitch effects
    if (Math.random() < 0.3) {
      // Randomly shift a row
      const rowY = y;
      const shiftAmount = Math.floor((Math.random() - 0.5) * 10);

      for (let i = 0; i < this.canvas.width; i++) {
        const srcX = (i - shiftAmount + this.canvas.width) % this.canvas.width;
        const srcColor = this.canvas.getPixel(srcX, rowY);
        if (srcColor) {
          this.canvas.drawPixel(i, rowY, srcColor);
        }
      }
    }

    // Occasionally add random noise
    if (Math.random() < 0.2) {
      for (let i = 0; i < 10; i++) {
        const noiseX = x + Math.floor((Math.random() - 0.5) * 10);
        const noiseY = y + Math.floor((Math.random() - 0.5) * 10);
        this.canvas.drawPixel(noiseX, noiseY, color);
      }
    }
  }

  /**
   * Apply the static brush
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} color - Color in hex format
   */
  applyStaticBrush(x, y, color) {
    // Draw random noise in a square area
    const size = this.brushSize * 2;
    const offset = Math.floor(size / 2);

    for (let i = -offset; i <= offset; i++) {
      for (let j = -offset; j <= offset; j++) {
        if (Math.random() < 0.5) {
          this.canvas.drawPixel(x + i, y + j, color);
        }
      }
    }

    // Draw a line of noise from last position to current position
    if (this.lastX !== x || this.lastY !== y) {
      const steps = Math.max(Math.abs(x - this.lastX), Math.abs(y - this.lastY));

      for (let i = 0; i <= steps; i++) {
        const t = steps === 0 ? 0 : i / steps;
        const px = Math.floor(this.lastX + (x - this.lastX) * t);
        const py = Math.floor(this.lastY + (y - this.lastY) * t);

        for (let j = -offset; j <= offset; j++) {
          for (let k = -offset; k <= offset; k++) {
            if (Math.random() < 0.3) {
              this.canvas.drawPixel(px + j, py + k, color);
            }
          }
        }
      }
    }
  }
}
