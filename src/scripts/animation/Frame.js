/**
 * Frame Class
 * 
 * Represents a single animation frame.
 */
class Frame {
  /**
   * Create a new Frame
   * @param {Array} pixelData - Array of pixel colors
   * @param {number} width - Width of the frame in pixels
   * @param {number} height - Height of the frame in pixels
   */
  constructor(pixelData, width, height) {
    this.pixelData = pixelData;
    this.width = width;
    this.height = height;
  }
  
  /**
   * Create a thumbnail of the frame
   * @param {number} size - Size of the thumbnail
   * @returns {HTMLCanvasElement} Canvas element with the thumbnail
   */
  createThumbnail(size = 48) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    
    // Scale factor for the thumbnail
    const scaleX = size / this.width;
    const scaleY = size / this.height;
    
    // Draw each pixel
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const index = y * this.width + x;
        const color = this.pixelData[index];
        
        ctx.fillStyle = color;
        ctx.fillRect(
          Math.floor(x * scaleX),
          Math.floor(y * scaleY),
          Math.ceil(scaleX),
          Math.ceil(scaleY)
        );
      }
    }
    
    return canvas;
  }
  
  /**
   * Clone the frame
   * @returns {Frame} A new Frame instance with the same data
   */
  clone() {
    return new Frame([...this.pixelData], this.width, this.height);
  }
  
  /**
   * Clear the frame (set all pixels to black)
   */
  clear() {
    this.pixelData.fill('#000000');
  }
  
  /**
   * Invert the colors of the frame
   */
  invert() {
    for (let i = 0; i < this.pixelData.length; i++) {
      const color = this.pixelData[i];
      
      // Skip black pixels
      if (color === '#000000') continue;
      
      // Convert hex to RGB
      const r = parseInt(color.substr(1, 2), 16);
      const g = parseInt(color.substr(3, 2), 16);
      const b = parseInt(color.substr(5, 2), 16);
      
      // Invert RGB values
      const invR = 255 - r;
      const invG = 255 - g;
      const invB = 255 - b;
      
      // Convert back to hex
      this.pixelData[i] = `#${invR.toString(16).padStart(2, '0')}${invG.toString(16).padStart(2, '0')}${invB.toString(16).padStart(2, '0')}`;
    }
  }
  
  /**
   * Flip the frame horizontally
   */
  flipHorizontal() {
    const newPixelData = new Array(this.width * this.height);
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const srcIndex = y * this.width + x;
        const destIndex = y * this.width + (this.width - 1 - x);
        newPixelData[destIndex] = this.pixelData[srcIndex];
      }
    }
    
    this.pixelData = newPixelData;
  }
  
  /**
   * Flip the frame vertically
   */
  flipVertical() {
    const newPixelData = new Array(this.width * this.height);
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const srcIndex = y * this.width + x;
        const destIndex = (this.height - 1 - y) * this.width + x;
        newPixelData[destIndex] = this.pixelData[srcIndex];
      }
    }
    
    this.pixelData = newPixelData;
  }
  
  /**
   * Rotate the frame 90 degrees clockwise
   */
  rotate90() {
    const newPixelData = new Array(this.width * this.height);
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const srcIndex = y * this.width + x;
        const destIndex = x * this.height + (this.height - 1 - y);
        newPixelData[destIndex] = this.pixelData[srcIndex];
      }
    }
    
    // Swap width and height
    const temp = this.width;
    this.width = this.height;
    this.height = temp;
    
    this.pixelData = newPixelData;
  }
  
  /**
   * Shift the frame in a direction
   * @param {string} direction - Direction to shift ('left', 'right', 'up', 'down')
   * @param {number} amount - Number of pixels to shift
   */
  shift(direction, amount = 1) {
    const newPixelData = new Array(this.width * this.height).fill('#000000');
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let srcX = x;
        let srcY = y;
        
        // Calculate source coordinates based on direction
        switch (direction) {
          case 'left':
            srcX = (x + amount) % this.width;
            break;
          case 'right':
            srcX = (x - amount + this.width) % this.width;
            break;
          case 'up':
            srcY = (y + amount) % this.height;
            break;
          case 'down':
            srcY = (y - amount + this.height) % this.height;
            break;
        }
        
        const srcIndex = srcY * this.width + srcX;
        const destIndex = y * this.width + x;
        
        newPixelData[destIndex] = this.pixelData[srcIndex];
      }
    }
    
    this.pixelData = newPixelData;
  }
  
  /**
   * Apply a glitch effect to the frame
   * @param {number} intensity - Intensity of the glitch (0-1)
   */
  applyGlitch(intensity = 0.5) {
    // Randomly shift some rows
    const numRows = Math.floor(this.height * intensity);
    
    for (let i = 0; i < numRows; i++) {
      const y = Math.floor(Math.random() * this.height);
      const shiftAmount = Math.floor((Math.random() - 0.5) * this.width * intensity);
      
      // Shift the row
      const rowStart = y * this.width;
      const row = this.pixelData.slice(rowStart, rowStart + this.width);
      
      for (let x = 0; x < this.width; x++) {
        const srcX = (x - shiftAmount + this.width) % this.width;
        this.pixelData[rowStart + x] = row[srcX];
      }
    }
    
    // Randomly swap some pixels
    const numPixels = Math.floor(this.width * this.height * intensity * 0.1);
    
    for (let i = 0; i < numPixels; i++) {
      const x1 = Math.floor(Math.random() * this.width);
      const y1 = Math.floor(Math.random() * this.height);
      const x2 = Math.floor(Math.random() * this.width);
      const y2 = Math.floor(Math.random() * this.height);
      
      const index1 = y1 * this.width + x1;
      const index2 = y2 * this.width + x2;
      
      // Swap pixels
      const temp = this.pixelData[index1];
      this.pixelData[index1] = this.pixelData[index2];
      this.pixelData[index2] = temp;
    }
  }
  
  /**
   * Apply a dithering effect to the frame
   * @param {string} type - Type of dithering ('ordered', 'floyd-steinberg', 'noise')
   */
  applyDithering(type = 'ordered') {
    switch (type) {
      case 'ordered':
        this.applyOrderedDithering();
        break;
      case 'floyd-steinberg':
        this.applyFloydSteinbergDithering();
        break;
      case 'noise':
        this.applyNoiseDithering();
        break;
    }
  }
  
  /**
   * Apply ordered dithering (Bayer matrix)
   */
  applyOrderedDithering() {
    // 4x4 Bayer matrix
    const bayerMatrix = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5]
    ];
    
    // Normalize the matrix
    const normalizedMatrix = bayerMatrix.map(row => row.map(val => val / 16));
    
    // Apply dithering
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const index = y * this.width + x;
        const color = this.pixelData[index];
        
        // Skip black pixels
        if (color === '#000000') continue;
        
        // Convert hex to RGB
        const r = parseInt(color.substr(1, 2), 16);
        const g = parseInt(color.substr(3, 2), 16);
        const b = parseInt(color.substr(5, 2), 16);
        
        // Get threshold from Bayer matrix
        const threshold = normalizedMatrix[y % 4][x % 4];
        
        // Apply threshold
        const newR = r / 255 > threshold ? 255 : 0;
        const newG = g / 255 > threshold ? 255 : 0;
        const newB = b / 255 > threshold ? 255 : 0;
        
        // Convert back to hex
        this.pixelData[index] = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
      }
    }
  }
  
  /**
   * Apply Floyd-Steinberg dithering
   */
  applyFloydSteinbergDithering() {
    // Create a copy of the pixel data as RGB values
    const rgbData = this.pixelData.map(color => {
      if (color === '#000000') return { r: 0, g: 0, b: 0 };
      
      return {
        r: parseInt(color.substr(1, 2), 16),
        g: parseInt(color.substr(3, 2), 16),
        b: parseInt(color.substr(5, 2), 16)
      };
    });
    
    // Apply Floyd-Steinberg dithering
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const index = y * this.width + x;
        const oldPixel = rgbData[index];
        
        // Quantize the pixel
        const newPixel = {
          r: oldPixel.r > 127 ? 255 : 0,
          g: oldPixel.g > 127 ? 255 : 0,
          b: oldPixel.b > 127 ? 255 : 0
        };
        
        // Update the pixel data
        this.pixelData[index] = `#${newPixel.r.toString(16).padStart(2, '0')}${newPixel.g.toString(16).padStart(2, '0')}${newPixel.b.toString(16).padStart(2, '0')}`;
        
        // Calculate the error
        const error = {
          r: oldPixel.r - newPixel.r,
          g: oldPixel.g - newPixel.g,
          b: oldPixel.b - newPixel.b
        };
        
        // Distribute the error to neighboring pixels
        if (x < this.width - 1) {
          const rightIndex = y * this.width + (x + 1);
          rgbData[rightIndex].r += error.r * 7 / 16;
          rgbData[rightIndex].g += error.g * 7 / 16;
          rgbData[rightIndex].b += error.b * 7 / 16;
        }
        
        if (y < this.height - 1) {
          if (x > 0) {
            const bottomLeftIndex = (y + 1) * this.width + (x - 1);
            rgbData[bottomLeftIndex].r += error.r * 3 / 16;
            rgbData[bottomLeftIndex].g += error.g * 3 / 16;
            rgbData[bottomLeftIndex].b += error.b * 3 / 16;
          }
          
          const bottomIndex = (y + 1) * this.width + x;
          rgbData[bottomIndex].r += error.r * 5 / 16;
          rgbData[bottomIndex].g += error.g * 5 / 16;
          rgbData[bottomIndex].b += error.b * 5 / 16;
          
          if (x < this.width - 1) {
            const bottomRightIndex = (y + 1) * this.width + (x + 1);
            rgbData[bottomRightIndex].r += error.r * 1 / 16;
            rgbData[bottomRightIndex].g += error.g * 1 / 16;
            rgbData[bottomRightIndex].b += error.b * 1 / 16;
          }
        }
      }
    }
  }
  
  /**
   * Apply noise dithering
   */
  applyNoiseDithering() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const index = y * this.width + x;
        const color = this.pixelData[index];
        
        // Skip black pixels
        if (color === '#000000') continue;
        
        // Convert hex to RGB
        const r = parseInt(color.substr(1, 2), 16);
        const g = parseInt(color.substr(3, 2), 16);
        const b = parseInt(color.substr(5, 2), 16);
        
        // Generate random threshold
        const threshold = Math.random();
        
        // Apply threshold
        const newR = r / 255 > threshold ? 255 : 0;
        const newG = g / 255 > threshold ? 255 : 0;
        const newB = b / 255 > threshold ? 255 : 0;
        
        // Convert back to hex
        this.pixelData[index] = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
      }
    }
  }
}
