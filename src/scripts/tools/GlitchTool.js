/**
 * GlitchTool Class
 *
 * Provides various glitch effects for the canvas.
 */
class GlitchTool {
  /**
   * Create a new GlitchTool
   * @param {PixelCanvas} canvas - The PixelCanvas instance
   */
  constructor (canvas) {
    this.canvas = canvas
    this.intensity = 0.5
  }

  /**
   * Set the glitch intensity
   * @param {number} intensity - Intensity value (0-1)
   */
  setIntensity (intensity) {
    this.intensity = Math.max(0, Math.min(1, intensity))
  }

  /**
   * Apply a random glitch effect
   */
  applyRandomGlitch () {
    const effects = [
      this.applyRowShift.bind(this),
      this.applyColumnShift.bind(this),
      this.applyPixelSort.bind(this),
      this.applyDataCorruption.bind(this),
      this.applyBlockGlitch.bind(this)
    ]

    // Choose a random effect
    const effect = effects[Math.floor(Math.random() * effects.length)]

    // Apply the effect
    effect()

    // Render the canvas
    this.canvas.render()
  }

  /**
   * Apply row shift glitch
   */
  applyRowShift () {
    // Get the current pixel data
    const pixelData = this.canvas.getPixelData()
    const width = this.canvas.width
    const height = this.canvas.height

    // Create a copy of the pixel data
    const newPixelData = [...pixelData]

    // Number of rows to shift
    const numRows = Math.floor(height * this.intensity * 0.5)

    // Shift random rows
    for (let i = 0; i < numRows; i++) {
      const y = Math.floor(Math.random() * height)
      const shiftAmount = Math.floor(
        (Math.random() - 0.5) * width * this.intensity * 2
      )

      for (let x = 0; x < width; x++) {
        const srcX = (x - shiftAmount + width) % width
        const srcIndex = y * width + srcX
        const destIndex = y * width + x

        newPixelData[destIndex] = pixelData[srcIndex]
      }
    }

    // Update the canvas
    this.canvas.setPixelData(newPixelData)
  }

  /**
   * Apply column shift glitch
   */
  applyColumnShift () {
    // Get the current pixel data
    const pixelData = this.canvas.getPixelData()
    const width = this.canvas.width
    const height = this.canvas.height

    // Create a copy of the pixel data
    const newPixelData = [...pixelData]

    // Number of columns to shift
    const numColumns = Math.floor(width * this.intensity * 0.5)

    // Shift random columns
    for (let i = 0; i < numColumns; i++) {
      const x = Math.floor(Math.random() * width)
      const shiftAmount = Math.floor(
        (Math.random() - 0.5) * height * this.intensity * 2
      )

      for (let y = 0; y < height; y++) {
        const srcY = (y - shiftAmount + height) % height
        const srcIndex = srcY * width + x
        const destIndex = y * width + x

        newPixelData[destIndex] = pixelData[srcIndex]
      }
    }

    // Update the canvas
    this.canvas.setPixelData(newPixelData)
  }

  /**
   * Apply pixel sort glitch
   */
  applyPixelSort () {
    // Get the current pixel data
    const pixelData = this.canvas.getPixelData()
    const width = this.canvas.width
    const height = this.canvas.height

    // Create a copy of the pixel data
    const newPixelData = [...pixelData]

    // Number of rows to sort
    const numRows = Math.floor(height * this.intensity * 0.5)

    // Sort random rows
    for (let i = 0; i < numRows; i++) {
      const y = Math.floor(Math.random() * height)
      const rowStart = y * width
      const row = pixelData.slice(rowStart, rowStart + width)

      // Sort the row by brightness
      row.sort((a, b) => {
        // Convert hex to RGB
        const aR = parseInt(a.substr(1, 2), 16)
        const aG = parseInt(a.substr(3, 2), 16)
        const aB = parseInt(a.substr(5, 2), 16)

        const bR = parseInt(b.substr(1, 2), 16)
        const bG = parseInt(b.substr(3, 2), 16)
        const bB = parseInt(b.substr(5, 2), 16)

        // Calculate brightness
        const aBrightness = (aR + aG + aB) / 3
        const bBrightness = (bR + bG + bB) / 3

        return aBrightness - bBrightness
      })

      // Copy the sorted row back
      for (let x = 0; x < width; x++) {
        newPixelData[rowStart + x] = row[x]
      }
    }

    // Update the canvas
    this.canvas.setPixelData(newPixelData)
  }

  /**
   * Apply data corruption glitch
   */
  applyDataCorruption () {
    // Get the current pixel data
    const pixelData = this.canvas.getPixelData()
    const width = this.canvas.width
    const height = this.canvas.height

    // Create a copy of the pixel data
    const newPixelData = [...pixelData]

    // Number of pixels to corrupt
    const numPixels = Math.floor(width * height * this.intensity * 0.1)

    // Corrupt random pixels
    for (let i = 0; i < numPixels; i++) {
      const x = Math.floor(Math.random() * width)
      const y = Math.floor(Math.random() * height)
      const index = y * width + x

      // Corrupt the pixel
      const color = pixelData[index]

      // Skip black pixels
      if (color === '#000000') continue

      // Convert hex to RGB
      const r = parseInt(color.substr(1, 2), 16)
      const g = parseInt(color.substr(3, 2), 16)
      const b = parseInt(color.substr(5, 2), 16)

      // Corrupt the RGB values
      const newR = (r + Math.floor(Math.random() * 256)) % 256
      const newG = (g + Math.floor(Math.random() * 256)) % 256
      const newB = (b + Math.floor(Math.random() * 256)) % 256

      // Convert back to hex
      newPixelData[index] =
        `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
    }

    // Update the canvas
    this.canvas.setPixelData(newPixelData)
  }

  /**
   * Apply block glitch
   */
  applyBlockGlitch () {
    // Get the current pixel data
    const pixelData = this.canvas.getPixelData()
    const width = this.canvas.width
    const height = this.canvas.height

    // Create a copy of the pixel data
    const newPixelData = [...pixelData]

    // Number of blocks to glitch
    const numBlocks = Math.floor(this.intensity * 5) + 1

    // Glitch random blocks
    for (let i = 0; i < numBlocks; i++) {
      // Random block size
      const blockWidth = Math.floor(Math.random() * width * 0.3) + 5
      const blockHeight = Math.floor(Math.random() * height * 0.3) + 5

      // Random block position
      const blockX = Math.floor(Math.random() * (width - blockWidth))
      const blockY = Math.floor(Math.random() * (height - blockHeight))

      // Random destination position
      const destX = Math.floor(Math.random() * (width - blockWidth))
      const destY = Math.floor(Math.random() * (height - blockHeight))

      // Copy the block to the destination
      for (let y = 0; y < blockHeight; y++) {
        for (let x = 0; x < blockWidth; x++) {
          const srcIndex = (blockY + y) * width + (blockX + x)
          const destIndex = (destY + y) * width + (destX + x)

          if (
            srcIndex >= 0 &&
            srcIndex < pixelData.length &&
            destIndex >= 0 &&
            destIndex < newPixelData.length
          ) {
            newPixelData[destIndex] = pixelData[srcIndex]
          }
        }
      }
    }

    // Update the canvas
    this.canvas.setPixelData(newPixelData)
  }

  /**
   * Apply a scanline glitch
   */
  applyScanlineGlitch () {
    // Get the current pixel data
    const pixelData = this.canvas.getPixelData()
    const width = this.canvas.width
    const height = this.canvas.height

    // Create a copy of the pixel data
    const newPixelData = [...pixelData]

    // Number of scanlines to glitch
    const numScanlines = Math.floor(height * this.intensity * 0.2)

    // Glitch random scanlines
    for (let i = 0; i < numScanlines; i++) {
      const y = Math.floor(Math.random() * height)

      // Random effect for this scanline
      const effect = Math.floor(Math.random() * 3)

      switch (effect) {
        case 0: // Invert colors
          for (let x = 0; x < width; x++) {
            const index = y * width + x
            const color = pixelData[index]

            // Skip black pixels
            if (color === '#000000') continue

            // Convert hex to RGB
            const r = parseInt(color.substr(1, 2), 16)
            const g = parseInt(color.substr(3, 2), 16)
            const b = parseInt(color.substr(5, 2), 16)

            // Invert RGB values
            const newR = 255 - r
            const newG = 255 - g
            const newB = 255 - b

            // Convert back to hex
            newPixelData[index] =
              `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
          }
          break

        case 1: // Shift horizontally
          const shiftAmount = Math.floor(
            (Math.random() - 0.5) * width * this.intensity * 2
          )

          for (let x = 0; x < width; x++) {
            const srcX = (x - shiftAmount + width) % width
            const srcIndex = y * width + srcX
            const destIndex = y * width + x

            newPixelData[destIndex] = pixelData[srcIndex]
          }
          break

        case 2: // Duplicate to adjacent row
          const destY = (y + 1) % height

          for (let x = 0; x < width; x++) {
            const srcIndex = y * width + x
            const destIndex = destY * width + x

            newPixelData[destIndex] = pixelData[srcIndex]
          }
          break
      }
    }

    // Update the canvas
    this.canvas.setPixelData(newPixelData)
  }

  /**
   * Apply a wave glitch
   */
  applyWaveGlitch () {
    // Get the current pixel data
    const pixelData = this.canvas.getPixelData()
    const width = this.canvas.width
    const height = this.canvas.height

    // Create a copy of the pixel data
    const newPixelData = [...pixelData]

    // Wave parameters
    const amplitude = Math.floor(width * this.intensity * 0.1) + 1
    const frequency = Math.random() * 0.5 + 0.1
    const phase = Math.random() * Math.PI * 2

    // Apply wave distortion
    for (let y = 0; y < height; y++) {
      const offset = Math.floor(Math.sin(y * frequency + phase) * amplitude)

      for (let x = 0; x < width; x++) {
        const srcX = (x - offset + width) % width
        const srcIndex = y * width + srcX
        const destIndex = y * width + x

        newPixelData[destIndex] = pixelData[srcIndex]
      }
    }

    // Update the canvas
    this.canvas.setPixelData(newPixelData)
  }

  /**
   * Apply a noise glitch
   */
  applyNoiseGlitch () {
    // Get the current pixel data
    const pixelData = this.canvas.getPixelData()
    const width = this.canvas.width
    const height = this.canvas.height

    // Create a copy of the pixel data
    const newPixelData = [...pixelData]

    // Number of pixels to replace with noise
    const numPixels = Math.floor(width * height * this.intensity * 0.2)

    // Replace random pixels with noise
    for (let i = 0; i < numPixels; i++) {
      const x = Math.floor(Math.random() * width)
      const y = Math.floor(Math.random() * height)
      const index = y * width + x

      // Random color
      const r = Math.floor(Math.random() * 256)
      const g = Math.floor(Math.random() * 256)
      const b = Math.floor(Math.random() * 256)

      // Convert to hex
      newPixelData[index] =
        `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }

    // Update the canvas
    this.canvas.setPixelData(newPixelData)
  }

  /**
   * Apply all glitch effects
   */
  applyAllGlitches () {
    this.applyRowShift()
    this.applyColumnShift()
    this.applyPixelSort()
    this.applyDataCorruption()
    this.applyBlockGlitch()
    this.applyScanlineGlitch()
    this.applyWaveGlitch()
    this.applyNoiseGlitch()

    // Render the canvas
    this.canvas.render()
  }
}
