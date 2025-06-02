/**
 * SymmetryTools Class
 * 
 * Handles symmetry modes for drawing operations.
 */
class SymmetryTools {
  /**
   * Create a new SymmetryTools instance
   * @param {PixelCanvas} canvas - The PixelCanvas instance
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.symmetryMode = 'none';
    
    // Override the canvas drawPixel method to apply symmetry
    this.overrideDrawPixel();
  }
  
  /**
   * Set the symmetry mode
   * @param {string} mode - Symmetry mode ('none', 'horizontal', 'vertical', 'quad', 'octal')
   */
  setSymmetryMode(mode) {
    this.symmetryMode = mode;
  }
  
  /**
   * Override the canvas drawPixel method to apply symmetry
   */
  overrideDrawPixel() {
    const originalDrawPixel = this.canvas.drawPixel.bind(this.canvas);
    
    this.canvas.drawPixel = (x, y, color) => {
      // Draw the original pixel
      originalDrawPixel(x, y, color);
      
      // Apply symmetry based on the current mode
      switch (this.symmetryMode) {
        case 'horizontal':
          this.applyHorizontalSymmetry(x, y, color, originalDrawPixel);
          break;
        case 'vertical':
          this.applyVerticalSymmetry(x, y, color, originalDrawPixel);
          break;
        case 'quad':
          this.applyQuadSymmetry(x, y, color, originalDrawPixel);
          break;
        case 'octal':
          this.applyOctalSymmetry(x, y, color, originalDrawPixel);
          break;
      }
    };
  }
  
  /**
   * Apply horizontal symmetry
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} color - Color in hex format
   * @param {Function} drawPixel - Function to draw a pixel
   */
  applyHorizontalSymmetry(x, y, color, drawPixel) {
    // Calculate the mirrored X coordinate
    const mirrorX = this.canvas.width - 1 - x;
    
    // Draw the mirrored pixel
    drawPixel(mirrorX, y, color);
  }
  
  /**
   * Apply vertical symmetry
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} color - Color in hex format
   * @param {Function} drawPixel - Function to draw a pixel
   */
  applyVerticalSymmetry(x, y, color, drawPixel) {
    // Calculate the mirrored Y coordinate
    const mirrorY = this.canvas.height - 1 - y;
    
    // Draw the mirrored pixel
    drawPixel(x, mirrorY, color);
  }
  
  /**
   * Apply quadrant symmetry
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} color - Color in hex format
   * @param {Function} drawPixel - Function to draw a pixel
   */
  applyQuadSymmetry(x, y, color, drawPixel) {
    // Calculate the center of the canvas
    const centerX = Math.floor(this.canvas.width / 2);
    const centerY = Math.floor(this.canvas.height / 2);
    
    // Calculate the offset from the center
    const offsetX = x - centerX;
    const offsetY = y - centerY;
    
    // Draw the mirrored pixels in all four quadrants
    drawPixel(centerX + offsetX, centerY + offsetY, color); // Original (Q1)
    drawPixel(centerX - offsetX, centerY + offsetY, color); // Q2
    drawPixel(centerX - offsetX, centerY - offsetY, color); // Q3
    drawPixel(centerX + offsetX, centerY - offsetY, color); // Q4
  }
  
  /**
   * Apply octal symmetry
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} color - Color in hex format
   * @param {Function} drawPixel - Function to draw a pixel
   */
  applyOctalSymmetry(x, y, color, drawPixel) {
    // Calculate the center of the canvas
    const centerX = Math.floor(this.canvas.width / 2);
    const centerY = Math.floor(this.canvas.height / 2);
    
    // Calculate the offset from the center
    const offsetX = x - centerX;
    const offsetY = y - centerY;
    
    // Draw the mirrored pixels in all eight octants
    drawPixel(centerX + offsetX, centerY + offsetY, color); // Original (O1)
    drawPixel(centerX - offsetX, centerY + offsetY, color); // O2
    drawPixel(centerX - offsetX, centerY - offsetY, color); // O3
    drawPixel(centerX + offsetX, centerY - offsetY, color); // O4
    drawPixel(centerX + offsetY, centerY + offsetX, color); // O5
    drawPixel(centerX - offsetY, centerY + offsetX, color); // O6
    drawPixel(centerX - offsetY, centerY - offsetX, color); // O7
    drawPixel(centerX + offsetY, centerY - offsetX, color); // O8
  }
}
