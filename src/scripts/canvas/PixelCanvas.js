/**
 * PixelCanvas Class
 *
 * Handles the main drawing canvas, pixel manipulation, and rendering.
 */
class PixelCanvas {
  /**
   * Create a new PixelCanvas
   * @param {Object} options - Configuration options
   * @param {string} options.canvasId - ID of the main canvas element
   * @param {string} options.effectsCanvasId - ID of the effects overlay canvas
   * @param {string} options.uiCanvasId - ID of the UI overlay canvas
   * @param {number} options.width - Width in pixels
   * @param {number} options.height - Height in pixels
   * @param {number} options.pixelSize - Size of each pixel in screen pixels
   */
  constructor(options) {
    // Canvas elements
    this.canvas = document.getElementById(options.canvasId);
    this.effectsCanvas = document.getElementById(options.effectsCanvasId);
    this.uiCanvas = document.getElementById(options.uiCanvasId);

    // Canvas contexts
    this.ctx = this.canvas.getContext('2d');
    this.effectsCtx = this.effectsCanvas.getContext('2d');
    this.uiCtx = this.uiCanvas.getContext('2d');

    // Canvas dimensions
    this.width = options.width || 64;
    this.height = options.height || 64;
    this.pixelSize = options.pixelSize || 8;

    // Zoom level
    this.zoom = 1;

    // Pixel data
    this.pixels = new Array(this.width * this.height).fill('#000000');

    // Undo/Redo history
    this.history = [];
    this.historyIndex = -1;
    this.maxHistorySize = 50; // Maximum number of states to store

    // Save initial state
    this.saveToHistory();

    // Effects settings
    this.effects = {
      grain: false,
      static: false,
      glitch: false,
      crt: false,
      scanLines: false,
      vignette: false,
      noise: false,
      pixelate: false,
      intensity: 0.5
    };

    // Animation frame for effects
    this.effectsAnimationFrame = null;

    // Mouse state
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;

    // Grid display
    this.showGrid = true;

    // Selection and clipboard
    this.selection = null; // {x, y, width, height}
    this.clipboard = null; // {pixels, width, height}

    // Initialize the canvas
    this.initCanvas();

    // Set up event listeners
    this.setupEventListeners();

    // Start the effects animation loop
    this.animateEffects();
  }

  /**
   * Initialize the canvas with the correct dimensions
   */
  initCanvas() {
    // Set canvas dimensions
    this.canvas.width = this.width * this.pixelSize * this.zoom;
    this.canvas.height = this.height * this.pixelSize * this.zoom;

    // Set effects canvas dimensions
    this.effectsCanvas.width = this.canvas.width;
    this.effectsCanvas.height = this.canvas.height;

    // Set UI canvas dimensions
    this.uiCanvas.width = this.canvas.width;
    this.uiCanvas.height = this.canvas.height;

    // Set rendering options for pixel art
    this.ctx.imageSmoothingEnabled = false;
    this.effectsCtx.imageSmoothingEnabled = false;
    this.uiCtx.imageSmoothingEnabled = false;

    // Clear the canvas
    this.clear();

    // Draw the initial grid
    if (this.showGrid) {
      this.drawGrid();
    }
  }

  /**
   * Set up event listeners for mouse/touch interaction
   */
  setupEventListeners() {
    // Bind event handlers to this instance
    this._boundHandleMouseDown = this.handleMouseDown.bind(this);
    this._boundHandleMouseMove = this.handleMouseMove.bind(this);
    this._boundHandleMouseUp = this.handleMouseUp.bind(this);
    this._boundUpdateCursorPosition = this.updateCursorPosition.bind(this);
    this._boundHandleContextMenu = (e) => { e.preventDefault(); };
    this._boundHandleMouseLeave = () => {
      document.getElementById('cursor-position').textContent = 'X: - Y: -';
    };

    // Mouse events
    this.canvas.addEventListener('mousedown', this._boundHandleMouseDown);
    document.addEventListener('mousemove', this._boundHandleMouseMove);
    document.addEventListener('mouseup', this._boundHandleMouseUp);

    // Prevent context menu on right-click
    this.canvas.addEventListener('contextmenu', this._boundHandleContextMenu);

    // Update cursor position display
    this.canvas.addEventListener('mousemove', this._boundUpdateCursorPosition);

    // Mouse leave
    this.canvas.addEventListener('mouseleave', this._boundHandleMouseLeave);
  }

  /**
   * Handle mouse down event
   * @param {MouseEvent} e - Mouse event
   */
  handleMouseDown(e) {
    this.isDrawing = true;

    // Get pixel coordinates
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (this.pixelSize * this.zoom));
    const y = Math.floor((e.clientY - rect.top) / (this.pixelSize * this.zoom));

    // Store last position
    this.lastX = x;
    this.lastY = y;

    // Save the current state before drawing
    this.saveToHistory();

    // Draw a single pixel
    this.drawPixel(x, y, e.buttons === 2 ? '#000000' : '#ffffff');

    // Render the canvas
    this.render();
  }

  /**
   * Handle mouse move event
   * @param {MouseEvent} e - Mouse event
   */
  handleMouseMove(e) {
    if (!this.isDrawing) return;

    // Get pixel coordinates
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (this.pixelSize * this.zoom));
    const y = Math.floor((e.clientY - rect.top) / (this.pixelSize * this.zoom));

    // Only draw if the position has changed
    if (x !== this.lastX || y !== this.lastY) {
      // Draw a line from last position to current position
      this.drawLine(this.lastX, this.lastY, x, y, e.buttons === 2 ? '#000000' : '#ffffff');

      // Update last position
      this.lastX = x;
      this.lastY = y;

      // Render the canvas
      this.render();
    }
  }

  /**
   * Handle mouse up event
   */
  handleMouseUp() {
    this.isDrawing = false;
  }

  /**
   * Update the cursor position display
   * @param {MouseEvent} e - Mouse event
   */
  updateCursorPosition(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (this.pixelSize * this.zoom));
    const y = Math.floor((e.clientY - rect.top) / (this.pixelSize * this.zoom));

    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      document.getElementById('cursor-position').textContent = `X: ${x} Y: ${y}`;
    } else {
      document.getElementById('cursor-position').textContent = 'X: - Y: -';
    }
  }

  /**
   * Draw a single pixel
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} color - Color in hex format
   */
  drawPixel(x, y, color) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      const index = y * this.width + x;
      this.pixels[index] = color;
    }
  }

  /**
   * Draw a line using Bresenham's algorithm
   * @param {number} x0 - Starting X coordinate
   * @param {number} y0 - Starting Y coordinate
   * @param {number} x1 - Ending X coordinate
   * @param {number} y1 - Ending Y coordinate
   * @param {string} color - Color in hex format
   */
  drawLine(x0, y0, x1, y1, color) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      this.drawPixel(x0, y0, color);

      if (x0 === x1 && y0 === y1) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }
  }

  /**
   * Draw a rectangle
   * @param {number} x - X coordinate of top-left corner
   * @param {number} y - Y coordinate of top-left corner
   * @param {number} width - Width of rectangle
   * @param {number} height - Height of rectangle
   * @param {string} color - Color in hex format
   * @param {boolean} fill - Whether to fill the rectangle
   */
  drawRect(x, y, width, height, color, fill = false) {
    if (fill) {
      for (let i = x; i < x + width; i++) {
        for (let j = y; j < y + height; j++) {
          this.drawPixel(i, j, color);
        }
      }
    } else {
      // Draw horizontal lines
      for (let i = x; i < x + width; i++) {
        this.drawPixel(i, y, color);
        this.drawPixel(i, y + height - 1, color);
      }

      // Draw vertical lines
      for (let j = y; j < y + height; j++) {
        this.drawPixel(x, j, color);
        this.drawPixel(x + width - 1, j, color);
      }
    }
  }

  /**
   * Draw an ellipse
   * @param {number} xc - X coordinate of center
   * @param {number} yc - Y coordinate of center
   * @param {number} a - Semi-major axis
   * @param {number} b - Semi-minor axis
   * @param {string} color - Color in hex format
   */
  drawEllipse(xc, yc, a, b, color) {
    let x = 0;
    let y = b;
    let a2 = a * a;
    let b2 = b * b;
    let d = b2 - a2 * b + a2 / 4;

    this.drawPixel(xc + x, yc + y, color);
    this.drawPixel(xc - x, yc + y, color);
    this.drawPixel(xc + x, yc - y, color);
    this.drawPixel(xc - x, yc - y, color);

    while (a2 * (y - 0.5) > b2 * (x + 1)) {
      if (d < 0) {
        d += b2 * (2 * x + 3);
      } else {
        d += b2 * (2 * x + 3) + a2 * (-2 * y + 2);
        y--;
      }
      x++;

      this.drawPixel(xc + x, yc + y, color);
      this.drawPixel(xc - x, yc + y, color);
      this.drawPixel(xc + x, yc - y, color);
      this.drawPixel(xc - x, yc - y, color);
    }

    d = b2 * (x + 0.5) * (x + 0.5) + a2 * (y - 1) * (y - 1) - a2 * b2;

    while (y > 0) {
      if (d < 0) {
        d += b2 * (2 * x + 2) + a2 * (-2 * y + 3);
        x++;
      } else {
        d += a2 * (-2 * y + 3);
      }
      y--;

      this.drawPixel(xc + x, yc + y, color);
      this.drawPixel(xc - x, yc + y, color);
      this.drawPixel(xc + x, yc - y, color);
      this.drawPixel(xc - x, yc - y, color);
    }
  }

  /**
   * Fill an area with a color (flood fill)
   * @param {number} x - Starting X coordinate
   * @param {number} y - Starting Y coordinate
   * @param {string} fillColor - Color to fill with
   */
  floodFill(x, y, fillColor) {
    const targetColor = this.getPixel(x, y);

    // Don't fill if the target color is the same as the fill color
    if (targetColor === fillColor) return;

    // Use a more efficient stack-based approach instead of queue
    // This avoids the overhead of shift() operations
    const stack = [{x, y}];

    // Create a visited array for efficient tracking
    const visited = new Uint8Array(this.width * this.height);
    const index = y * this.width + x;

    // Check starting pixel
    if (index < 0 || index >= visited.length) return;

    while (stack.length > 0) {
      const {x, y} = stack.pop();
      const index = y * this.width + x;

      // Skip if already visited
      if (visited[index]) continue;

      // Mark as visited
      visited[index] = 1;

      // Check if this pixel is the target color
      if (this.getPixel(x, y) === targetColor) {
        // Set the pixel to the fill color
        this.drawPixel(x, y, fillColor);

        // Add adjacent pixels to the stack
        // Check bounds before adding to avoid unnecessary getPixel calls
        if (x > 0) stack.push({x: x - 1, y});
        if (x < this.width - 1) stack.push({x: x + 1, y});
        if (y > 0) stack.push({x, y: y - 1});
        if (y < this.height - 1) stack.push({x, y: y + 1});
      }
    }
  }

  /**
   * Get the color of a pixel
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {string} Color in hex format
   */
  getPixel(x, y) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      const index = y * this.width + x;
      return this.pixels[index];
    }
    return null;
  }

  /**
   * Clear the canvas
   */
  clear() {
    // Clear pixel data
    this.pixels.fill('#000000');

    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Clear effects canvas
    this.effectsCtx.clearRect(0, 0, this.effectsCanvas.width, this.effectsCanvas.height);

    // Clear UI canvas
    this.uiCtx.clearRect(0, 0, this.uiCanvas.width, this.uiCanvas.height);
  }

  /**
   * Render the canvas
   */
  render() {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Always use ImageData for rendering for consistent performance
    const imageData = this.ctx.createImageData(this.width, this.height);
    const data = imageData.data;

    for (let i = 0; i < this.pixels.length; i++) {
      const color = this.pixels[i];
      // Parse hex color to RGB
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);

      // Set RGBA values (4 bytes per pixel)
      const pixelIndex = i * 4;
      data[pixelIndex] = r;
      data[pixelIndex + 1] = g;
      data[pixelIndex + 2] = b;
      data[pixelIndex + 3] = 255; // Alpha (fully opaque)
    }

    // Create temporary canvas for efficient scaling
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.width;
    tempCanvas.height = this.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(imageData, 0, 0);

    // Draw scaled image
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(
      tempCanvas,
      0, 0, this.width, this.height,
      0, 0, this.canvas.width, this.canvas.height
    );

    // Draw grid if enabled
    if (this.showGrid) {
      this.drawGrid();
    }

    // Draw selection rectangle if present
    if (this.selection) {
      this.uiCtx.save();
      this.uiCtx.strokeStyle = '#FFD700';
      this.uiCtx.lineWidth = 2;
      this.uiCtx.setLineDash([4, 2]);
      const { x, y, width, height } = this.selection;
      this.uiCtx.strokeRect(
        x * this.pixelSize * this.zoom,
        y * this.pixelSize * this.zoom,
        width * this.pixelSize * this.zoom,
        height * this.pixelSize * this.zoom
      );
      this.uiCtx.restore();
    }
  }

  /**
   * Draw the grid
   */
  drawGrid() {
    this.uiCtx.clearRect(0, 0, this.uiCanvas.width, this.uiCanvas.height);

    if (this.zoom >= 4) {
      this.uiCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      this.uiCtx.lineWidth = 1;

      // Use a single path for all grid lines for better performance
      this.uiCtx.beginPath();

      // Draw vertical lines
      for (let x = 0; x <= this.width; x++) {
        const xPos = x * this.pixelSize * this.zoom;
        this.uiCtx.moveTo(xPos, 0);
        this.uiCtx.lineTo(xPos, this.canvas.height);
      }

      // Draw horizontal lines
      for (let y = 0; y <= this.height; y++) {
        const yPos = y * this.pixelSize * this.zoom;
        this.uiCtx.moveTo(0, yPos);
        this.uiCtx.lineTo(this.canvas.width, yPos);
      }

      // Stroke all lines at once
      this.uiCtx.stroke();
    }
  }
  /**
   * Animate effects on the effects canvas
   */
  animateEffects() {
    // Use a bound function to avoid creating a new function on each frame
    if (!this._boundAnimateEffects) {
      this._boundAnimateEffects = this.animateEffects.bind(this);
    }

    // Clear effects canvas
    this.effectsCtx.clearRect(0, 0, this.effectsCanvas.width, this.effectsCanvas.height);

    // Check if any effects are enabled
    const hasEffects =
      this.effects.grain ||
      this.effects.static ||
      this.effects.glitch ||
      this.effects.crt ||
      this.effects.scanLines ||
      this.effects.vignette ||
      this.effects.noise ||
      this.effects.pixelate;

    // Only apply effects if at least one is enabled
    if (hasEffects) {
      // Apply grain effect
      if (this.effects.grain) {
        this.applyGrainEffect();
      }

      // Apply static effect
      if (this.effects.static) {
        this.applyStaticEffect();
      }

      // Apply glitch effect
      if (this.effects.glitch) {
        this.applyGlitchEffect();
      }

      // Apply CRT effect
      if (this.effects.crt) {
        this.applyCRTEffect();
      }

      // Apply scan lines effect
      if (this.effects.scanLines) {
        this.applyScanLines();
      }

      // Apply vignette effect
      if (this.effects.vignette) {
        this.applyVignette();
      }

      // Apply noise effect
      if (this.effects.noise) {
        this.applyNoiseEffect();
      }

      // Apply pixelate effect
      if (this.effects.pixelate) {
        this.applyPixelateEffect();
      }
    }

    // Request next frame
    this.effectsAnimationFrame = requestAnimationFrame(this._boundAnimateEffects);
  }

  /**
   * Set effects configuration
   * @param {Object} effects - Effects configuration object
   */
  setEffects(effects) {
    this.effects = { ...this.effects, ...effects };
  }

  /**
   * Apply grain effect
   */
  applyGrainEffect() {
    const intensity = this.effects.intensity * 0.1;

    this.effectsCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (Math.random() < intensity) {
          this.effectsCtx.fillRect(
            x * this.pixelSize * this.zoom,
            y * this.pixelSize * this.zoom,
            this.pixelSize * this.zoom,
            this.pixelSize * this.zoom
          );
        }
      }
    }
  }

  /**
   * Apply static effect
   */
  applyStaticEffect() {
    const intensity = this.effects.intensity * 0.05;

    // Use a single path for better performance
    this.effectsCtx.fillStyle = 'rgba(255, 255, 255, 0.1)';

    // Batch drawing operations for better performance
    this.effectsCtx.beginPath();

    // Only process every other line for the scan line effect
    for (let y = 0; y < this.canvas.height; y += 2) {
      if (Math.random() < intensity) {
        this.effectsCtx.rect(0, y, this.canvas.width, 1);
      }
    }

    // Draw all static lines at once
    this.effectsCtx.fill();
  }

  /**
   * Apply glitch effect
   */
  applyGlitchEffect() {
    const intensity = this.effects.intensity;

    // Only apply glitch occasionally
    if (Math.random() < intensity * 0.1) {
      // Random offset for a few rows
      const numRows = Math.floor(Math.random() * 5) + 1;

      for (let i = 0; i < numRows; i++) {
        const y = Math.floor(Math.random() * this.height);
        const offset = (Math.random() - 0.5) * 10 * intensity;

        // Create a temporary canvas to hold the row
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.pixelSize * this.zoom;
        const tempCtx = tempCanvas.getContext('2d');

        // Copy the row from the main canvas
        tempCtx.drawImage(
          this.canvas,
          0, y * this.pixelSize * this.zoom,
          this.canvas.width, this.pixelSize * this.zoom,
          0, 0,
          this.canvas.width, this.pixelSize * this.zoom
        );

        // Draw the row with offset
        this.effectsCtx.drawImage(
          tempCanvas,
          offset * this.pixelSize * this.zoom, y * this.pixelSize * this.zoom
        );
      }
    }
  }

  /**
   * Apply CRT effect
   */
  applyCRTEffect() {
    const intensity = this.effects.intensity;

    // Scan lines
    this.effectsCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let y = 0; y < this.canvas.height; y += 2) {
      this.effectsCtx.fillRect(0, y, this.canvas.width, 1);
    }

    // Vignette
    const gradient = this.effectsCtx.createRadialGradient(
      this.canvas.width / 2, this.canvas.height / 2, 0,
      this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 1.5
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity * 0.7})`);

    this.effectsCtx.fillStyle = gradient;
    this.effectsCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Apply scan lines effect
   */
  applyScanLines() {
    const intensity = this.effects.intensity * 0.1;

    // Draw horizontal scan lines
    this.effectsCtx.fillStyle = `rgba(0, 0, 0, ${intensity})`;

    // Batch drawing operations for better performance
    this.effectsCtx.beginPath();

    for (let y = 0; y < this.canvas.height; y += 2) {
      this.effectsCtx.rect(0, y, this.canvas.width, 1);
    }

    // Draw all scan lines at once
    this.effectsCtx.fill();
  }

  /**
   * Apply vignette effect
   */
  applyVignette() {
    const intensity = this.effects.intensity * 0.7;

    // Create radial gradient
    const gradient = this.effectsCtx.createRadialGradient(
      this.canvas.width / 2, this.canvas.height / 2, 0,
      this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height) / 1.5
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);

    // Apply gradient
    this.effectsCtx.fillStyle = gradient;
    this.effectsCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Apply noise effect
   */
  applyNoiseEffect() {
    const intensity = this.effects.intensity * 0.05;

    // Create an ImageData object for better performance
    const imageData = this.effectsCtx.createImageData(this.canvas.width, this.canvas.height);
    const data = imageData.data;

    // Fill with noise
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < intensity) {
        // White noise pixel with 50% opacity
        data[i] = 255;     // R
        data[i + 1] = 255; // G
        data[i + 2] = 255; // B
        data[i + 3] = 128; // A (50% opacity)
      }
    }

    // Put the image data back to the canvas
    this.effectsCtx.putImageData(imageData, 0, 0);
  }

  /**
   * Apply pixelate effect
   */
  applyPixelateEffect() {
    const intensity = Math.max(1, Math.floor(this.effects.intensity * 10));

    // Create a temporary canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    // Draw the main canvas to the temporary canvas
    tempCtx.drawImage(this.canvas, 0, 0);

    // Clear the effects canvas
    this.effectsCtx.clearRect(0, 0, this.effectsCanvas.width, this.effectsCanvas.height);

    // Draw pixelated version
    for (let y = 0; y < this.canvas.height; y += intensity) {
      for (let x = 0; x < this.canvas.width; x += intensity) {
        // Get the color of the pixel at (x, y)
        const pixelData = tempCtx.getImageData(x, y, 1, 1).data;

        // Set the fill style to the pixel color
        this.effectsCtx.fillStyle = `rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, 0.5)`;

        // Draw a rectangle with the size of the pixel block
        this.effectsCtx.fillRect(x, y, intensity, intensity);
      }
    }
  }

  /**
   * Set canvas dimensions
   * @param {number} width - Width in pixels
   * @param {number} height - Height in pixels
   */
  setDimensions(width, height) {
    this.width = width;
    this.height = height;
    this.pixels = new Array(this.width * this.height).fill('#000000');
    this.initCanvas();
  }

  /**
   * Zoom in
   */
  zoomIn() {
    if (this.zoom < 16) {
      this.zoom *= 2;
      this.initCanvas();
      this.render();
    }
  }

  /**
   * Zoom out
   */
  zoomOut() {
    if (this.zoom > 0.5) {
      this.zoom /= 2;
      this.initCanvas();
      this.render();
    }
  }

  /**
   * Get the current zoom level
   * @returns {number} Zoom level
   */
  getZoom() {
    return this.zoom;
  }

  /**
   * Reset zoom to 100%
   */
  resetZoom() {
    this.zoom = 1;
    this.initCanvas();
    this.render();
  }

  /**
   * Toggle grid visibility
   */
  toggleGrid() {
    this.showGrid = !this.showGrid;
    this.render();
  }

  /**
   * Export the canvas as a PNG data URL
   * @returns {string} PNG data URL
   */
  exportToPNG() {
    // Create a temporary canvas for export
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = this.width;
    exportCanvas.height = this.height;
    const exportCtx = exportCanvas.getContext('2d');

    // Draw pixels at 1:1 scale
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const index = y * this.width + x;
        const color = this.pixels[index];

        exportCtx.fillStyle = color;
        exportCtx.fillRect(x, y, 1, 1);
      }
    }

    // Return data URL
    return exportCanvas.toDataURL('image/png');
  }

  /**
   * Get the pixel data as an array
   * @returns {Array} Pixel data
   */
  getPixelData() {
    return [...this.pixels];
  }

  /**
   * Set the pixel data from an array
   * @param {Array} pixelData - Pixel data
   * @param {boolean} saveHistory - Whether to save this change to history
   */
  setPixelData(pixelData, saveHistory = true) {
    if (pixelData.length === this.width * this.height) {
      this.pixels = [...pixelData];
      if (saveHistory) {
        this.saveToHistory();
      }
      this.render();
    }
  }

  /**
   * Save the current state to history
   */
  saveToHistory() {
    // If we're not at the end of the history, remove future states
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    // Add current state to history
    this.history.push(this.getPixelData());
    this.historyIndex = this.history.length - 1;

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  /**
   * Undo the last action
   * @returns {boolean} Whether the undo was successful
   */
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.setPixelData(this.history[this.historyIndex], false);
      return true;
    }
    return false;
  }

  /**
   * Redo the last undone action
   * @returns {boolean} Whether the redo was successful
   */
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.setPixelData(this.history[this.historyIndex], false);
      return true;
    }
    return false;
  }

  /**
   * Resize the canvas
   * @param {number} width - New width in pixels
   * @param {number} height - New height in pixels
   * @param {boolean} preserveContent - Whether to preserve the current content
   */
  resize(width, height, preserveContent = true) {
    // Create a new pixel array
    const newPixels = new Array(width * height).fill('#000000');

    // Copy existing pixels if preserving content
    if (preserveContent) {
      const minWidth = Math.min(width, this.width);
      const minHeight = Math.min(height, this.height);

      for (let y = 0; y < minHeight; y++) {
        for (let x = 0; x < minWidth; x++) {
          const oldIndex = y * this.width + x;
          const newIndex = y * width + x;
          newPixels[newIndex] = this.pixels[oldIndex];
        }
      }
    }

    // Update dimensions
    this.width = width;
    this.height = height;
    this.pixels = newPixels;

    // Reinitialize the canvas
    this.initCanvas();

    // Save to history
    this.saveToHistory();

    // Render the canvas
    this.render();
  }

  /**
   * Clean up resources
   * This should be called when the canvas is no longer needed
   */
  cleanup() {
    // Cancel animation frame if it exists
    if (this.effectsAnimationFrame) {
      cancelAnimationFrame(this.effectsAnimationFrame);
      this.effectsAnimationFrame = null;
    }

    // Remove event listeners using the bound handlers
    this.canvas.removeEventListener('mousedown', this._boundHandleMouseDown);
    document.removeEventListener('mousemove', this._boundHandleMouseMove);
    document.removeEventListener('mouseup', this._boundHandleMouseUp);
    this.canvas.removeEventListener('contextmenu', this._boundHandleContextMenu);
    this.canvas.removeEventListener('mousemove', this._boundUpdateCursorPosition);
    this.canvas.removeEventListener('mouseleave', this._boundHandleMouseLeave);
  }
}
