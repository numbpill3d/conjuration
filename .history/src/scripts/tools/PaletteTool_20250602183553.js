/**
 * PaletteTool Class
 * 
 * Manages color palettes for the application.
 */
class PaletteTool {
  /**
   * Create a new PaletteTool
   * @param {PixelCanvas} canvas - The PixelCanvas instance
   */
  constructor(canvas, brushEngine) {
    this.canvas = canvas;
    this.brushEngine = brushEngine;
    this.currentPalette = 'monochrome';
    
    // Define palettes
    this.palettes = {
      monochrome: ['#000000', '#ffffff'],
      lain: ['#000000', '#8a2be2', '#d8bfd8', '#ffffff'],
      red: ['#000000', '#8b0000', '#ff0000', '#ffffff'],
      green: ['#000000', '#006400', '#00ff00', '#ffffff']
    };
    
    // Initialize with the default palette
    this.applyPalette(this.currentPalette);
  }
  
  /**
   * Set the current palette
   * @param {string} paletteName - Name of the palette to set
   */
  setPalette(paletteName) {
    if (this.palettes[paletteName]) {
      this.currentPalette = paletteName;
      this.applyPalette(paletteName);
    }
  }
  
  /**
   * Apply a palette to the canvas
   * @param {string} paletteName - Name of the palette to apply
   */
  applyPalette(paletteName) {
    const palette = this.palettes[paletteName];
    
    // Update the brush engine colors
    if (this.brushEngine) {
      this.brushEngine.setPrimaryColor(palette[1]);
      this.brushEngine.setSecondaryColor(palette[0]);
    }
    
    // Update the color swatches in the UI
    this.updateColorSwatches(palette);
  }
  
  /**
   * Update the color swatches in the UI
   * @param {Array} colors - Array of colors in the palette
   */
  updateColorSwatches(colors) {
    // This would update the UI color swatches if they exist
    // For now, we'll just log the colors
    console.log('Palette colors:', colors);
  }
  
  /**
   * Get the current palette
   * @returns {Array} Array of colors in the current palette
   */
  getCurrentPalette() {
    return this.palettes[this.currentPalette];
  }
  
  /**
   * Get the current palette name
   * @returns {string} Name of the current palette
   */
  getCurrentPaletteName() {
    return this.currentPalette;
  }
  
  /**
   * Add a custom palette
   * @param {string} name - Name of the palette
   * @param {Array} colors - Array of colors in the palette
   */
  addCustomPalette(name, colors) {
    this.palettes[name] = colors;
  }
  
  /**
   * Remove a custom palette
   * @param {string} name - Name of the palette to remove
   */
  removeCustomPalette(name) {
    // Don't remove built-in palettes
    if (['monochrome', 'lain', 'red', 'green'].includes(name)) {
      return;
    }
    
    delete this.palettes[name];
  }
  
  /**
   * Get all available palettes
   * @returns {Object} Object containing all palettes
   */
  getAllPalettes() {
    return this.palettes;
  }
  
  /**
   * Convert an image to use the current palette
   * @param {Array} pixelData - Array of pixel colors
   * @returns {Array} Array of pixel colors using the current palette
   */
  convertToPalette(pixelData) {
    const palette = this.palettes[this.currentPalette];
    
    return pixelData.map(color => {
      // Skip black pixels
      if (color === '#000000') return color;
      
      // Convert hex to RGB
      const r = parseInt(color.substr(1, 2), 16);
      const g = parseInt(color.substr(3, 2), 16);
      const b = parseInt(color.substr(5, 2), 16);
      
      // Find the closest color in the palette
      let closestColor = palette[0];
      let closestDistance = Number.MAX_VALUE;
      
      for (const paletteColor of palette) {
        // Convert palette color to RGB
        const pr = parseInt(paletteColor.substr(1, 2), 16);
        const pg = parseInt(paletteColor.substr(3, 2), 16);
        const pb = parseInt(paletteColor.substr(5, 2), 16);
        
        // Calculate Euclidean distance in RGB space
        const distance = Math.sqrt(
          Math.pow(r - pr, 2) +
          Math.pow(g - pg, 2) +
          Math.pow(b - pb, 2)
        );
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestColor = paletteColor;
        }
      }
      
      return closestColor;
    });
  }
  
  /**
   * Apply dithering to an image using the current palette
   * @param {Array} pixelData - Array of pixel colors
   * @param {number} width - Width of the image
   * @param {number} height - Height of the image
   * @param {string} ditheringType - Type of dithering to apply
   * @returns {Array} Array of pixel colors with dithering applied
   */
  applyDithering(pixelData, width, height, ditheringType = 'ordered') {
    const palette = this.palettes[this.currentPalette];
    
    // Convert pixel data to RGB arrays
    const rgbData = pixelData.map(color => {
      if (color === '#000000') return { r: 0, g: 0, b: 0 };
      
      return {
        r: parseInt(color.substr(1, 2), 16),
        g: parseInt(color.substr(3, 2), 16),
        b: parseInt(color.substr(5, 2), 16)
      };
    });
    
    // Apply dithering based on the type
    switch (ditheringType) {
      case 'ordered':
        return this.applyOrderedDithering(rgbData, width, height, palette);
      case 'floyd-steinberg':
        return this.applyFloydSteinbergDithering(rgbData, width, height, palette);
      case 'noise':
        return this.applyNoiseDithering(rgbData, width, height, palette);
      default:
        return pixelData;
    }
  }
  
  /**
   * Apply ordered dithering (Bayer matrix)
   * @param {Array} rgbData - Array of RGB objects
   * @param {number} width - Width of the image
   * @param {number} height - Height of the image
   * @param {Array} palette - Array of colors in the palette
   * @returns {Array} Array of pixel colors with dithering applied
   */
  applyOrderedDithering(rgbData, width, height, palette) {
    // 4x4 Bayer matrix
    const bayerMatrix = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5]
    ];
    
    // Normalize the matrix
    const normalizedMatrix = bayerMatrix.map(row => row.map(val => val / 16));
    
    // Convert palette to RGB arrays
    const paletteRgb = palette.map(color => ({
      r: parseInt(color.substr(1, 2), 16),
      g: parseInt(color.substr(3, 2), 16),
      b: parseInt(color.substr(5, 2), 16)
    }));
    
    // Apply dithering
    const result = new Array(rgbData.length);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        const pixel = rgbData[index];
        
        // Skip black pixels
        if (pixel.r === 0 && pixel.g === 0 && pixel.b === 0) {
          result[index] = '#000000';
          continue;
        }
        
        // Get threshold from Bayer matrix
        const threshold = normalizedMatrix[y % 4][x % 4];
        
        // Find the closest colors in the palette
        let closestColor = paletteRgb[0];
        let closestDistance = Number.MAX_VALUE;
        
        for (const paletteColor of paletteRgb) {
          // Calculate Euclidean distance in RGB space
          const distance = Math.sqrt(
            Math.pow(pixel.r - paletteColor.r, 2) +
            Math.pow(pixel.g - paletteColor.g, 2) +
            Math.pow(pixel.b - paletteColor.b, 2)
          );
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestColor = paletteColor;
          }
        }
        
        // Apply threshold
        const r = pixel.r / 255 > threshold ? 255 : 0;
        const g = pixel.g / 255 > threshold ? 255 : 0;
        const b = pixel.b / 255 > threshold ? 255 : 0;
        
        // Convert back to hex
        result[index] = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      }
    }
    
    return result;
  }
  
  /**
   * Apply Floyd-Steinberg dithering
   * @param {Array} rgbData - Array of RGB objects
   * @param {number} width - Width of the image
   * @param {number} height - Height of the image
   * @param {Array} palette - Array of colors in the palette
   * @returns {Array} Array of pixel colors with dithering applied
   */
  applyFloydSteinbergDithering(rgbData, width, height, palette) {
    // Create a copy of the RGB data
    const newRgbData = rgbData.map(pixel => ({ ...pixel }));
    
    // Convert palette to RGB arrays
    const paletteRgb = palette.map(color => ({
      r: parseInt(color.substr(1, 2), 16),
      g: parseInt(color.substr(3, 2), 16),
      b: parseInt(color.substr(5, 2), 16)
    }));
    
    // Apply Floyd-Steinberg dithering
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        const oldPixel = newRgbData[index];
        
        // Skip black pixels
        if (oldPixel.r === 0 && oldPixel.g === 0 && oldPixel.b === 0) {
          continue;
        }
        
        // Find the closest color in the palette
        let closestColor = paletteRgb[0];
        let closestDistance = Number.MAX_VALUE;
        
        for (const paletteColor of paletteRgb) {
          // Calculate Euclidean distance in RGB space
          const distance = Math.sqrt(
            Math.pow(oldPixel.r - paletteColor.r, 2) +
            Math.pow(oldPixel.g - paletteColor.g, 2) +
            Math.pow(oldPixel.b - paletteColor.b, 2)
          );
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestColor = paletteColor;
          }
        }
        
        // Calculate the error
        const error = {
          r: oldPixel.r - closestColor.r,
          g: oldPixel.g - closestColor.g,
          b: oldPixel.b - closestColor.b
        };
        
        // Update the pixel
        newRgbData[index] = { ...closestColor };
        
        // Distribute the error to neighboring pixels
        if (x < width - 1) {
          const rightIndex = y * width + (x + 1);
          newRgbData[rightIndex].r += error.r * 7 / 16;
          newRgbData[rightIndex].g += error.g * 7 / 16;
          newRgbData[rightIndex].b += error.b * 7 / 16;
        }
        
        if (y < height - 1) {
          if (x > 0) {
            const bottomLeftIndex = (y + 1) * width + (x - 1);
            newRgbData[bottomLeftIndex].r += error.r * 3 / 16;
            newRgbData[bottomLeftIndex].g += error.g * 3 / 16;
            newRgbData[bottomLeftIndex].b += error.b * 3 / 16;
          }
          
          const bottomIndex = (y + 1) * width + x;
          newRgbData[bottomIndex].r += error.r * 5 / 16;
          newRgbData[bottomIndex].g += error.g * 5 / 16;
          newRgbData[bottomIndex].b += error.b * 5 / 16;
          
          if (x < width - 1) {
            const bottomRightIndex = (y + 1) * width + (x + 1);
            newRgbData[bottomRightIndex].r += error.r * 1 / 16;
            newRgbData[bottomRightIndex].g += error.g * 1 / 16;
            newRgbData[bottomRightIndex].b += error.b * 1 / 16;
          }
        }
      }
    }
    
    // Convert back to hex colors
    return newRgbData.map(pixel => {
      const r = Math.max(0, Math.min(255, Math.round(pixel.r)));
      const g = Math.max(0, Math.min(255, Math.round(pixel.g)));
      const b = Math.max(0, Math.min(255, Math.round(pixel.b)));
      
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    });
  }
  
  /**
   * Apply noise dithering
   * @param {Array} rgbData - Array of RGB objects
   * @param {number} width - Width of the image
   * @param {number} height - Height of the image
   * @param {Array} palette - Array of colors in the palette
   * @returns {Array} Array of pixel colors with dithering applied
   */
  applyNoiseDithering(rgbData, width, height, palette) {
    // Convert palette to RGB arrays
    const paletteRgb = palette.map(color => ({
      r: parseInt(color.substr(1, 2), 16),
      g: parseInt(color.substr(3, 2), 16),
      b: parseInt(color.substr(5, 2), 16)
    }));
    
    // Apply noise dithering
    const result = new Array(rgbData.length);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        const pixel = rgbData[index];
        
        // Skip black pixels
        if (pixel.r === 0 && pixel.g === 0 && pixel.b === 0) {
          result[index] = '#000000';
          continue;
        }
        
        // Generate random threshold
        const threshold = Math.random();
        
        // Apply threshold
        const r = pixel.r / 255 > threshold ? 255 : 0;
        const g = pixel.g / 255 > threshold ? 255 : 0;
        const b = pixel.b / 255 > threshold ? 255 : 0;
        
        // Convert back to hex
        result[index] = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      }
    }
    
    return result;
  }
}
