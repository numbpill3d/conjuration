/**
 * dithering.js
 * Implements dithering algorithms for the Uno Moralez-style pixel art
 */

class DitheringEngine {
  constructor (canvas) {
    this.canvas = canvas
  }

  /**
   * Apply Floyd-Steinberg dithering to the canvas
   * @param {string} lightColor - The light color for dithering (usually white)
   * @param {string} darkColor - The dark color for dithering (usually black)
   * @param {number} threshold - Threshold for dithering (0-255)
   */
  applyFloydSteinberg (
    lightColor = '#FFFFFF',
    darkColor = '#000000',
    threshold = 127
  ) {
    // Get the canvas image data
    const ctx = this.canvas.ctx
    const width = this.canvas.width
    const height = this.canvas.height
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    // Convert to grayscale and apply threshold
    const grayscale = new Array(width * height)

    // Convert to grayscale
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const gray = 0.299 * r + 0.587 * g + 0.114 * b
      grayscale[i / 4] = gray
    }

    // Apply Floyd-Steinberg dithering
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x
        const oldPixel = grayscale[index]
        const newPixel = oldPixel < threshold ? 0 : 255
        grayscale[index] = newPixel

        const error = oldPixel - newPixel

        // Distribute error to neighboring pixels
        if (x + 1 < width) {
          grayscale[index + 1] += error * (7 / 16)
        }
        if (y + 1 < height) {
          if (x > 0) {
            grayscale[(y + 1) * width + (x - 1)] += error * (3 / 16)
          }
          grayscale[(y + 1) * width + x] += error * (5 / 16)
          if (x + 1 < width) {
            grayscale[(y + 1) * width + (x + 1)] += error * (1 / 16)
          }
        }
      }
    }

    // Convert back to RGBA
    const lightRgb = this.hexToRgb(lightColor)
    const darkRgb = this.hexToRgb(darkColor)

    for (let i = 0; i < grayscale.length; i++) {
      const pixelValue = grayscale[i]
      const rgbValues = pixelValue === 255 ? lightRgb : darkRgb

      const dataIndex = i * 4
      data[dataIndex] = rgbValues.r
      data[dataIndex + 1] = rgbValues.g
      data[dataIndex + 2] = rgbValues.b
      // Alpha remains unchanged
    }

    // Put the image data back on the canvas
    ctx.putImageData(imageData, 0, 0)
  }

  /**
   * Apply ordered dithering (Bayer matrix) to the canvas
   * @param {string} lightColor - The light color for dithering
   * @param {string} darkColor - The dark color for dithering
   * @param {number} matrixSize - Size of the Bayer matrix (2, 4, or 8)
   */
  applyOrderedDithering (
    lightColor = '#FFFFFF',
    darkColor = '#000000',
    matrixSize = 4
  ) {
    // Get the canvas image data
    const ctx = this.canvas.ctx
    const width = this.canvas.width
    const height = this.canvas.height
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    // Define Bayer matrices for different sizes
    const matrices = {
      2: [
        [0, 2],
        [3, 1]
      ],
      4: [
        [0, 8, 2, 10],
        [12, 4, 14, 6],
        [3, 11, 1, 9],
        [15, 7, 13, 5]
      ],
      8: [
        [0, 32, 8, 40, 2, 34, 10, 42],
        [48, 16, 56, 24, 50, 18, 58, 26],
        [12, 44, 4, 36, 14, 46, 6, 38],
        [60, 28, 52, 20, 62, 30, 54, 22],
        [3, 35, 11, 43, 1, 33, 9, 41],
        [51, 19, 59, 27, 49, 17, 57, 25],
        [15, 47, 7, 39, 13, 45, 5, 37],
        [63, 31, 55, 23, 61, 29, 53, 21]
      ]
    }

    // Select the matrix or default to 4x4
    const matrix = matrices[matrixSize] || matrices[4]
    const matrixLength = matrix.length

    // Convert to grayscale and apply dithering
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4

        // Get RGB values
        const r = data[index]
        const g = data[index + 1]
        const b = data[index + 2]

        // Convert to grayscale
        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b)

        // Get threshold from matrix
        const matrixX = x % matrixLength
        const matrixY = y % matrixLength
        const threshold =
          ((matrix[matrixY][matrixX] + 1) / (matrixLength * matrixLength + 1)) *
          255

        // Apply threshold
        const newColor = gray < threshold ? darkColor : lightColor
        const rgb = this.hexToRgb(newColor)

        // Set new color
        data[index] = rgb.r
        data[index + 1] = rgb.g
        data[index + 2] = rgb.b
        // Alpha remains unchanged
      }
    }

    // Put the image data back on the canvas
    ctx.putImageData(imageData, 0, 0)
  }

  /**
   * Apply noise dithering to the canvas
   * @param {string} lightColor - The light color for dithering
   * @param {string} darkColor - The dark color for dithering
   * @param {number} threshold - Base threshold (0-255)
   * @param {number} noiseAmount - Amount of noise to add (0-1)
   */
  applyNoiseDithering (
    lightColor = '#FFFFFF',
    darkColor = '#000000',
    threshold = 127,
    noiseAmount = 0.5
  ) {
    // Get the canvas image data
    const ctx = this.canvas.ctx
    const width = this.canvas.width
    const height = this.canvas.height
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    // Convert to grayscale and apply dithering
    for (let i = 0; i < data.length; i += 4) {
      // Get RGB values
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Convert to grayscale
      const gray = 0.299 * r + 0.587 * g + 0.114 * b

      // Add noise to threshold
      const noise = (Math.random() - 0.5) * 2 * noiseAmount * 255
      const adjustedThreshold = threshold + noise

      // Apply threshold
      const newColor = gray < adjustedThreshold ? darkColor : lightColor
      const rgb = this.hexToRgb(newColor)

      // Set new color
      data[i] = rgb.r
      data[i + 1] = rgb.g
      data[i + 2] = rgb.b
      // Alpha remains unchanged
    }

    // Put the image data back on the canvas
    ctx.putImageData(imageData, 0, 0)
  }

  /**
   * Convert image to two-bit color (4 colors)
   * @param {Array} palette - Array of 4 colors in hex format
   */
  applyTwoBitColor (palette = ['#000000', '#550055', '#AA00AA', '#FF00FF']) {
    // Get the canvas image data
    const ctx = this.canvas.ctx
    const width = this.canvas.width
    const height = this.canvas.height
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    // Convert palette to RGB
    const rgbPalette = palette.map((color) => this.hexToRgb(color))

    // Process each pixel
    for (let i = 0; i < data.length; i += 4) {
      // Get RGB values
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Find the closest color in the palette
      let closestColor = rgbPalette[0]
      let minDistance = this.colorDistance(
        r,
        g,
        b,
        closestColor.r,
        closestColor.g,
        closestColor.b
      )

      for (let j = 1; j < rgbPalette.length; j++) {
        const color = rgbPalette[j]
        const distance = this.colorDistance(r, g, b, color.r, color.g, color.b)

        if (distance < minDistance) {
          minDistance = distance
          closestColor = color
        }
      }

      // Set new color
      data[i] = closestColor.r
      data[i + 1] = closestColor.g
      data[i + 2] = closestColor.b
      // Alpha remains unchanged
    }

    // Put the image data back on the canvas
    ctx.putImageData(imageData, 0, 0)
  }

  /**
   * Calculate the Euclidean distance between two colors
   */
  colorDistance (r1, g1, b1, r2, g2, b2) {
    return Math.sqrt(
      Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2)
    )
  }

  /**
   * Convert a hex color string to an RGB object
   */
  hexToRgb (hex) {
    // Default to black for invalid values
    if (!hex || typeof hex !== 'string') {
      return { r: 0, g: 0, b: 0 }
    }

    // Remove # if present
    hex = hex.replace(/^#/, '')

    // Handle shorthand hex
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
    }

    // Parse hex values
    const bigint = parseInt(hex, 16)
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    }
  }
}
