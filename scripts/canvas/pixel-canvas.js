/**
 * PixelCanvas.js
 * Core canvas handling and drawing functionality for VOIDSKETCH
 */

class PixelCanvas {
    constructor(options = {}) {
        // Default options
        this.options = {
            width: 64,
            height: 64,
            pixelSize: 8,
            container: null,
            backgroundColor: '#000000',
            ...options
        };
        
        // Canvas elements
        this.canvas = document.getElementById('pixel-canvas');
        this.effectsCanvas = document.getElementById('effects-canvas');
        this.uiCanvas = document.getElementById('ui-canvas');
        this.canvasWrapper = document.getElementById('canvas-wrapper');
        
        // Context references
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.effectsCtx = this.effectsCanvas.getContext('2d');
        this.uiCtx = this.uiCanvas.getContext('2d');

        // State variables
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.zoom = 1;
        this.panOffset = { x: 0, y: 0 };
        this.currentColor = '#FFFFFF';
        this.backgroundColor = this.options.backgroundColor;
        this.showGrid = true;
        this.gridColor = 'rgba(255, 255, 255, 0.2)';
        
        // Tool state
        this.currentTool = 'pencil';
        this.brushSize = 1;
        this.symmetryMode = 'none';
        
        // History for undo/redo
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySteps = 50;
        
        // Initialize canvas
        this.initialize();
    }
    
    initialize() {
        // Set canvas dimensions
        this.setCanvasSize(this.options.width, this.options.height);
        
        // Initial clear
        this.clear();
        
        // Save initial state
        this.saveState();
        
        // Event listeners
        this.setupEventListeners();
        
        // Setup grid
        this.drawGrid();
    }
    
    setCanvasSize(width, height) {
        this.width = width;
        this.height = height;
        
        // Set physical canvas size
        this.canvas.width = width;
        this.canvas.height = height;
        this.effectsCanvas.width = width;
        this.effectsCanvas.height = height;
        this.uiCanvas.width = width;
        this.uiCanvas.height = height;
        
        // Apply scaling for display
        this.updateCanvasDisplay();
        
        // Update sizing info
        document.getElementById('canvas-size').textContent = `${width}x${height}`;
    }
    
    updateCanvasDisplay() {
        // Calculate displayed size based on pixel size and zoom
        const displayWidth = this.width * this.options.pixelSize * this.zoom;
        const displayHeight = this.height * this.options.pixelSize * this.zoom;
        
        // Update CSS sizes
        this.canvas.style.width = `${displayWidth}px`;
        this.canvas.style.height = `${displayHeight}px`;
        this.effectsCanvas.style.width = `${displayWidth}px`;
        this.effectsCanvas.style.height = `${displayHeight}px`;
        this.uiCanvas.style.width = `${displayWidth}px`;
        this.uiCanvas.style.height = `${displayHeight}px`;
        
        // Update wrapper size
        this.canvasWrapper.style.width = `${displayWidth}px`;
        this.canvasWrapper.style.height = `${displayHeight}px`;
        
        // Update zoom display
        document.getElementById('zoom-level').textContent = `${Math.round(this.zoom * 100)}%`;
        
        // Redraw grid if needed
        if (this.showGrid) {
            this.drawGrid();
        }
    }
    
    setupEventListeners() {
        // Mouse event listeners for drawing
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
        
        // Zoom controls
        document.getElementById('zoom-in').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoom-out').addEventListener('click', () => this.zoomOut());
        
        // Mouse wheel for zooming
        this.canvasWrapper.addEventListener('wheel', this.handleWheel.bind(this));
        
        // Track cursor position
        this.canvas.addEventListener('mousemove', this.updateCursorPosition.bind(this));
    }
    
    handleMouseDown(e) {
        // Start drawing
        this.isDrawing = true;
        
        // Get the pixel coordinates
        const { x, y } = this.getPixelCoordinates(e);
        this.lastX = x;
        this.lastY = y;
        
        // Apply the current tool
        this.applyTool(x, y);
    }
    
    handleMouseMove(e) {
        if (!this.isDrawing) return;
        
        // Get the pixel coordinates
        const { x, y } = this.getPixelCoordinates(e);
        
        // Only continue if we have moved to a new pixel
        if (x === this.lastX && y === this.lastY) return;
        
        // Handle line drawing between points for smooth lines
        if (this.currentTool === 'pencil' || this.currentTool === 'eraser') {
            this.drawLine(this.lastX, this.lastY, x, y);
        } else {
            // Apply the current tool at the new position
            this.applyTool(x, y);
        }
        
        // Update last position
        this.lastX = x;
        this.lastY = y;
    }
    
    handleMouseUp() {
        if (this.isDrawing) {
            // Stop drawing
            this.isDrawing = false;
            
            // Save the current state for undo history
            this.saveState();
        }
    }
    
    handleWheel(e) {
        e.preventDefault();
        
        // Zoom in or out based on wheel direction
        if (e.deltaY < 0) {
            this.zoomIn();
        } else {
            this.zoomOut();
        }
    }
    
    updateCursorPosition(e) {
        const { x, y } = this.getPixelCoordinates(e);
        document.getElementById('cursor-position').textContent = `X: ${x} Y: ${y}`;
    }
    
    getPixelCoordinates(e) {
        // Get the bounding box for correct coordinates
        const rect = this.canvas.getBoundingClientRect();
        
        // Calculate pixel coordinates
        const pixelSize = this.options.pixelSize * this.zoom;
        const x = Math.floor((e.clientX - rect.left) / pixelSize);
        const y = Math.floor((e.clientY - rect.top) / pixelSize);
        
        // Clamp to canvas limits
        return {
            x: Math.max(0, Math.min(x, this.width - 1)),
            y: Math.max(0, Math.min(y, this.height - 1))
        };
    }
    
    zoomIn() {
        if (this.zoom < 16) {
            this.zoom *= 1.5;
            this.updateCanvasDisplay();
        }
    }
    
    zoomOut() {
        if (this.zoom > 0.25) {
            this.zoom /= 1.5;
            this.updateCanvasDisplay();
        }
    }
    
    clear() {
        // Fill with background color
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Clear effects and UI layers
        this.effectsCtx.clearRect(0, 0, this.width, this.height);
        this.uiCtx.clearRect(0, 0, this.width, this.height);
    }
    
    applyTool(x, y) {
        switch (this.currentTool) {
            case 'pencil':
                this.drawPixel(x, y, this.currentColor);
                break;
            case 'eraser':
                this.drawPixel(x, y, this.backgroundColor);
                break;
            case 'fill':
                this.floodFill(x, y, this.currentColor);
                break;
            case 'line':
                // Implemented in UI drawing for preview
                break;
            case 'rect':
                // Implemented in UI drawing for preview
                break;
            case 'ellipse':
                // Implemented in UI drawing for preview
                break;
            case 'glitch':
                this.applyGlitch(x, y);
                break;
            case 'static':
                this.applyStatic(x, y);
                break;
            default:
                this.drawPixel(x, y, this.currentColor);
        }
    }
    
    drawPixel(x, y, color) {
        // Check bounds
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
        
        // Draw the pixel
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, 1, 1);
        
        // Apply symmetry if enabled
        this.applySymmetry(x, y, color);
    }
    
    drawLine(x0, y0, x1, y1) {
        // Bresenham's line algorithm
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = (x0 < x1) ? 1 : -1;
        const sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;
        
        while (true) {
            // Draw current pixel
            if (this.currentTool === 'eraser') {
                this.drawPixel(x0, y0, this.backgroundColor);
            } else {
                this.drawPixel(x0, y0, this.currentColor);
            }
            
            // Break if we've reached the end point
            if (x0 === x1 && y0 === y1) break;
            
            // Calculate next point
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
    
    applySymmetry(x, y, color) {
        // Calculate center point
        const centerX = Math.floor(this.width / 2);
        const centerY = Math.floor(this.height / 2);
        
        // Calculate symmetric points
        const xOffset = x - centerX;
        const yOffset = y - centerY;
        
        switch (this.symmetryMode) {
            case 'horizontal':
                // Mirror across horizontal axis
                this.drawPixel(centerX - xOffset, y, color);
                break;
            case 'vertical':
                // Mirror across vertical axis
                this.drawPixel(x, centerY - yOffset, color);
                break;
            case 'quad':
                // Mirror in all four quadrants
                this.drawPixel(centerX - xOffset, y, color);
                this.drawPixel(x, centerY - yOffset, color);
                this.drawPixel(centerX - xOffset, centerY - yOffset, color);
                break;
            case 'octal':
                // Eight-way symmetry
                this.drawPixel(centerX - xOffset, y, color);
                this.drawPixel(x, centerY - yOffset, color);
                this.drawPixel(centerX - xOffset, centerY - yOffset, color);
                this.drawPixel(centerX + yOffset, centerY + xOffset, color);
                this.drawPixel(centerX - yOffset, centerY + xOffset, color);
                this.drawPixel(centerX + yOffset, centerY - xOffset, color);
                this.drawPixel(centerX - yOffset, centerY - xOffset, color);
                break;
            case 'none':
            default:
                // No symmetry
                break;
        }
    }
    
    drawGrid() {
        if (!this.showGrid) {
            this.uiCtx.clearRect(0, 0, this.width, this.height);
            return;
        }
        
        this.uiCtx.clearRect(0, 0, this.width, this.height);
        this.uiCtx.strokeStyle = this.gridColor;
        this.uiCtx.lineWidth = 0.5;
        
        // Draw vertical grid lines
        for (let x = 1; x < this.width; x++) {
            this.uiCtx.beginPath();
            this.uiCtx.moveTo(x, 0);
            this.uiCtx.lineTo(x, this.height);
            this.uiCtx.stroke();
        }
        
        // Draw horizontal grid lines
        for (let y = 1; y < this.height; y++) {
            this.uiCtx.beginPath();
            this.uiCtx.moveTo(0, y);
            this.uiCtx.lineTo(this.width, y);
            this.uiCtx.stroke();
        }
    }
    
    toggleGrid() {
        this.showGrid = !this.showGrid;
        if (this.showGrid) {
            this.drawGrid();
        } else {
            this.uiCtx.clearRect(0, 0, this.width, this.height);
        }
    }
    
    floodFill(x, y, fillColor) {
        // Get the color of the target pixel
        const targetColor = this.getPixelColor(x, y);
        
        // Don't fill if the target is already the fill color
        if (this.colorToRGBA(targetColor).join(',') === this.colorToRGBA(fillColor).join(',')) {
            return;
        }
        
        // Perform the flood fill
        const pixelsToCheck = [{x, y}];
        const visited = new Set();
        
        while (pixelsToCheck.length > 0) {
            const pixel = pixelsToCheck.pop();
            const key = `${pixel.x},${pixel.y}`;
            
            // Skip if out of bounds or already visited
            if (
                pixel.x < 0 || pixel.x >= this.width ||
                pixel.y < 0 || pixel.y >= this.height ||
                visited.has(key)
            ) {
                continue;
            }
            
            // Check if this pixel matches the target color
            const currentColor = this.getPixelColor(pixel.x, pixel.y);
            if (this.colorToRGBA(currentColor).join(',') !== this.colorToRGBA(targetColor).join(',')) {
                continue;
            }
            
            // Fill this pixel
            this.drawPixel(pixel.x, pixel.y, fillColor);
            visited.add(key);
            
            // Add neighboring pixels to check
            pixelsToCheck.push({x: pixel.x + 1, y: pixel.y});
            pixelsToCheck.push({x: pixel.x - 1, y: pixel.y});
            pixelsToCheck.push({x: pixel.x, y: pixel.y + 1});
            pixelsToCheck.push({x: pixel.x, y: pixel.y - 1});
        }
    }
    
    getPixelColor(x, y) {
        // Get the color of a pixel at position (x, y)
        const pixel = this.ctx.getImageData(x, y, 1, 1).data;
        return `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`;
    }
    
    colorToRGBA(color) {
        // Helper to convert a color string to RGBA array
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        return Array.from(ctx.getImageData(0, 0, 1, 1).data);
    }
    
    applyGlitch(x, y) {
        // Simple glitch effect - shift pixels randomly
        const radius = this.brushSize;
        const intensity = 0.7; // Adjust for effect strength
        
        for (let offsetY = -radius; offsetY <= radius; offsetY++) {
            for (let offsetX = -radius; offsetX <= radius; offsetX++) {
                const currentX = x + offsetX;
                const currentY = y + offsetY;
                
                // Check if within bounds and within brush radius
                if (
                    currentX >= 0 && currentX < this.width &&
                    currentY >= 0 && currentY < this.height &&
                    Math.sqrt(offsetX * offsetX + offsetY * offsetY) <= radius
                ) {
                    // Random shift amount
                    const shiftX = Math.floor(Math.random() * 5) - 2;
                    const shiftY = Math.floor(Math.random() * 5) - 2;
                    
                    // Get source pixel
                    const sourceX = Math.max(0, Math.min(this.width - 1, currentX + shiftX));
                    const sourceY = Math.max(0, Math.min(this.height - 1, currentY + shiftY));
                    
                    // Move pixel
                    if (Math.random() < intensity) {
                        const color = this.getPixelColor(sourceX, sourceY);
                        this.drawPixel(currentX, currentY, color);
                    }
                }
            }
        }
    }
    
    applyStatic(x, y) {
        // Apply static noise effect
        const radius = this.brushSize;
        
        for (let offsetY = -radius; offsetY <= radius; offsetY++) {
            for (let offsetX = -radius; offsetX <= radius; offsetX++) {
                const currentX = x + offsetX;
                const currentY = y + offsetY;
                
                // Check if within bounds and within brush radius
                if (
                    currentX >= 0 && currentX < this.width &&
                    currentY >= 0 && currentY < this.height &&
                    Math.sqrt(offsetX * offsetX + offsetY * offsetY) <= radius
                ) {
                    // Random black or white pixel
                    const color = Math.random() > 0.5 ? '#FFFFFF' : '#000000';
                    this.drawPixel(currentX, currentY, color);
                }
            }
        }
    }
    
    saveState() {
        // Save current canvas state to history
        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        
        // If we're in the middle of history, remove future states
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        // Add the new state to history
        this.history.push(imageData);
        
        // Limit history size
        if (this.history.length > this.maxHistorySteps) {
            this.history.shift();
        }
        
        // Update history index
        this.historyIndex = this.history.length - 1;
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState();
        }
    }
    
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState();
        }
    }
    
    restoreState() {
        // Restore canvas state from history
        if (this.historyIndex >= 0 && this.historyIndex < this.history.length) {
            this.ctx.putImageData(this.history[this.historyIndex], 0, 0);
        }
    }
    
    // Methods for tools that need UI preview
    startShapeDraw(x, y) {
        // Store the starting point
        this.shapeStartX = x;
        this.shapeStartY = y;
    }
    
    previewShape(x, y) {
        // Clear the UI canvas
        this.uiCtx.clearRect(0, 0, this.width, this.height);
        
        // Draw the grid if enabled
        if (this.showGrid) {
            this.drawGrid();
        }
        
        // Draw shape preview
        this.uiCtx.strokeStyle = this.currentColor;
        this.uiCtx.lineWidth = 1;
        
        switch (this.currentTool) {
            case 'line':
                this.uiCtx.beginPath();
                this.uiCtx.moveTo(this.shapeStartX, this.shapeStartY);
                this.uiCtx.lineTo(x, y);
                this.uiCtx.stroke();
                break;
            case 'rect':
                const width = x - this.shapeStartX;
                const height = y - this.shapeStartY;
                this.uiCtx.strokeRect(this.shapeStartX, this.shapeStartY, width, height);
                break;
            case 'ellipse':
                const radiusX = Math.abs(x - this.shapeStartX) / 2;
                const radiusY = Math.abs(y - this.shapeStartY) / 2;
                const centerX = this.shapeStartX + (x - this.shapeStartX) / 2;
                const centerY = this.shapeStartY + (y - this.shapeStartY) / 2;
                
                this.uiCtx.beginPath();
                this.uiCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
                this.uiCtx.stroke();
                break;
        }
    }
    
    finishShapeDraw(x, y) {
        // Draw the final shape on the main canvas
        switch (this.currentTool) {
            case 'line':
                this.drawLine(this.shapeStartX, this.shapeStartY, x, y);
                break;
            case 'rect':
                this.drawRect(this.shapeStartX, this.shapeStartY, x, y);
                break;
            case 'ellipse':
                this.drawEllipse(this.shapeStartX, this.shapeStartY, x, y);
                break;
        }
        
        // Clear the UI canvas
        this.uiCtx.clearRect(0, 0, this.width, this.height);
        
        // Redraw the grid if needed
        if (this.showGrid) {
            this.drawGrid();
        }
    }
    
    drawRect(x0, y0, x1, y1) {
        // Draw the rectangle outline
        const startX = Math.min(x0, x1);
        const startY = Math.min(y0, y1);
        const endX = Math.max(x0, x1);
        const endY = Math.max(y0, y1);
        
        // Draw top and bottom lines
        for (let x = startX; x <= endX; x++) {
            this.drawPixel(x, startY, this.currentColor);
            this.drawPixel(x, endY, this.currentColor);
        }
        
        // Draw left and right lines
        for (let y = startY + 1; y < endY; y++) {
            this.drawPixel(startX, y, this.currentColor);
            this.drawPixel(endX, y, this.currentColor);
        }
    }
    
    drawEllipse(x0, y0, x1, y1) {
        // Draw an ellipse using the midpoint ellipse algorithm
        const centerX = Math.round((x0 + x1) / 2);
        const centerY = Math.round((y0 + y1) / 2);
        const radiusX = Math.abs(Math.round((x1 - x0) / 2));
        const radiusY = Math.abs(Math.round((y1 - y0) / 2));
        
        // Special case for tiny ellipses
        if (radiusX === 0 || radiusY === 0) {
            this.drawPixel(centerX, centerY, this.currentColor);
            return;
        }
        
        // First region of the ellipse
        let x = 0;
        let y = radiusY;
        let d1 = radiusY * radiusY - radiusX * radiusX * radiusY + 0.25 * radiusX * radiusX;
        let dx = 2 * radiusY * radiusY * x;
        let dy = 2 * radiusX * radiusX * y;
        
        while (dx < dy) {
            this.plotEllipsePoints(centerX, centerY, x, y);
            
            if (d1 < 0) {
                x++;
                dx += 2 * radiusY * radiusY;
                d1 += dx + radiusY * radiusY;
            } else {
                x++;
                y--;
                dx += 2 * radiusY * radiusY;
                dy -= 2 * radiusX * radiusX;
                d1 += dx - dy + radiusY * radiusY;
            }
        }
        
        // Second region of the ellipse
        let d2 = radiusY * radiusY * (x + 0.5) * (x + 0.5) + radiusX * radiusX * (y - 1) * (y - 1) - radiusX * radiusX * radiusY * radiusY;
        
        while (y >= 0) {
            this.plotEllipsePoints(centerX, centerY, x, y);
            
            if (d2 > 0) {
                y--;
                dy -= 2 * radiusX * radiusX;
                d2 += radiusX * radiusX - dy;
            } else {
                y--;
                x++;
                dx += 2 * radiusY * radiusY;
                dy -= 2 * radiusX * radiusX;
                d2 += dx - dy + radiusX * radiusX;
            }
        }
    }
    
    plotEllipsePoints(centerX, centerY, x, y) {
        // Plot points in all four quadrants
        this.drawPixel(centerX + x, centerY + y, this.currentColor);
        this.drawPixel(centerX - x, centerY + y, this.currentColor);
        this.drawPixel(centerX + x, centerY - y, this.currentColor);
        this.drawPixel(centerX - x, centerY - y, this.currentColor);
    }
    
    // Canvas data getters for export/save
    getCanvasData() {
        return this.canvas.toDataURL('image/png');
    }
    
    getCanvasImageData() {
        return this.ctx.getImageData(0, 0, this.width, this.height);
    }
    
    setCanvasFromImageData(imageData) {
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    setCanvasFromDataURL(dataURL) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.clear();
                this.ctx.drawImage(img, 0, 0);
                resolve();
            };
            img.onerror = reject;
            img.src = dataURL;
        });
    }
    
    // Tool and color setters
    setTool(tool) {
        this.currentTool = tool;
    }
    
    setColor(color) {
        this.currentColor = color;
    }
    
    setBackgroundColor(color) {
        this.backgroundColor = color;
    }
    
    setBrushSize(size) {
        this.brushSize = size;
    }
    
    setSymmetryMode(mode) {
        this.symmetryMode = mode;
    }
}
