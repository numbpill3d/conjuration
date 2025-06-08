/**
 * Effects Module
 *
 * Provides various visual effects for the canvas.
 */

/**
 * Apply grain effect to a canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} intensity - Effect intensity (0-1)
 */
function applyGrainEffect (ctx, width, height, intensity = 0.5) {
  // Create a temporary canvas for the grain
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = width
  tempCanvas.height = height
  const tempCtx = tempCanvas.getContext('2d')

  // Create grain pattern
  const imageData = tempCtx.createImageData(width, height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    // Random noise value
    const value = Math.random() * 255 * intensity

    // Set RGBA values
    data[i] = value // R
    data[i + 1] = value // G
    data[i + 2] = value // B
    data[i + 3] = Math.random() * 128 * intensity // A
  }

  // Put the image data on the temporary canvas
  tempCtx.putImageData(imageData, 0, 0)

  // Draw the grain on the main canvas with 'overlay' blend mode
  ctx.globalCompositeOperation = 'overlay'
  ctx.drawImage(tempCanvas, 0, 0)
  ctx.globalCompositeOperation = 'source-over'
}

/**
 * Apply static effect to a canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} intensity - Effect intensity (0-1)
 */
function applyStaticEffect (ctx, width, height, intensity = 0.5) {
  // Draw horizontal static lines
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'

  for (let y = 0; y < height; y += 2) {
    if (Math.random() < intensity * 0.3) {
      ctx.fillRect(0, y, width, 1)
    }
  }

  // Draw random static pixels
  const numPixels = Math.floor(width * height * intensity * 0.01)

  for (let i = 0; i < numPixels; i++) {
    const x = Math.floor(Math.random() * width)
    const y = Math.floor(Math.random() * height)
    const size = Math.random() < 0.5 ? 1 : 2

    ctx.fillRect(x, y, size, size)
  }
}

/**
 * Apply glitch effect to a canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} intensity - Effect intensity (0-1)
 */
function applyGlitchEffect (ctx, width, height, intensity = 0.5) {
  // Only apply glitch occasionally
  if (Math.random() > intensity * 0.3) return

  // Create a temporary canvas
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = width
  tempCanvas.height = height
  const tempCtx = tempCanvas.getContext('2d')

  // Copy the original canvas
  tempCtx.drawImage(ctx.canvas, 0, 0)

  // Apply random glitch effects
  const effects = [
    () => applyChannelShift(ctx, tempCanvas, width, height, intensity),
    () => applyBlockGlitch(ctx, tempCanvas, width, height, intensity),
    () => applyLineShift(ctx, tempCanvas, width, height, intensity)
  ]

  // Choose a random effect
  const effect = effects[Math.floor(Math.random() * effects.length)]
  effect()
}

/**
 * Apply channel shift glitch
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLCanvasElement} sourceCanvas - Source canvas
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} intensity - Effect intensity (0-1)
 */
function applyChannelShift (ctx, sourceCanvas, width, height, intensity) {
  // Create temporary canvases for each channel
  const redCanvas = document.createElement('canvas')
  redCanvas.width = width
  redCanvas.height = height
  const redCtx = redCanvas.getContext('2d')

  const greenCanvas = document.createElement('canvas')
  greenCanvas.width = width
  greenCanvas.height = height
  const greenCtx = greenCanvas.getContext('2d')

  const blueCanvas = document.createElement('canvas')
  blueCanvas.width = width
  blueCanvas.height = height
  const blueCtx = blueCanvas.getContext('2d')

  // Draw the source canvas to each channel canvas
  redCtx.drawImage(sourceCanvas, 0, 0)
  greenCtx.drawImage(sourceCanvas, 0, 0)
  blueCtx.drawImage(sourceCanvas, 0, 0)

  // Get image data for each channel
  const redData = redCtx.getImageData(0, 0, width, height)
  const greenData = greenCtx.getImageData(0, 0, width, height)
  const blueData = blueCtx.getImageData(0, 0, width, height)

  // Keep only the red channel in the red canvas
  for (let i = 0; i < redData.data.length; i += 4) {
    redData.data[i + 1] = 0 // G
    redData.data[i + 2] = 0 // B
  }

  // Keep only the green channel in the green canvas
  for (let i = 0; i < greenData.data.length; i += 4) {
    greenData.data[i] = 0 // R
    greenData.data[i + 2] = 0 // B
  }

  // Keep only the blue channel in the blue canvas
  for (let i = 0; i < blueData.data.length; i += 4) {
    blueData.data[i] = 0 // R
    blueData.data[i + 1] = 0 // G
  }

  // Put the image data back
  redCtx.putImageData(redData, 0, 0)
  greenCtx.putImageData(greenData, 0, 0)
  blueCtx.putImageData(blueData, 0, 0)

  // Calculate random offsets for each channel
  const redOffset = Math.floor((Math.random() - 0.5) * width * intensity * 0.1)
  const greenOffset = Math.floor(
    (Math.random() - 0.5) * width * intensity * 0.1
  )
  const blueOffset = Math.floor(
    (Math.random() - 0.5) * width * intensity * 0.1
  )

  // Clear the main canvas
  ctx.clearRect(0, 0, width, height)

  // Draw each channel with offset and blend mode
  ctx.globalCompositeOperation = 'screen'

  ctx.drawImage(redCanvas, redOffset, 0)
  ctx.drawImage(greenCanvas, greenOffset, 0)
  ctx.drawImage(blueCanvas, blueOffset, 0)

  // Reset blend mode
  ctx.globalCompositeOperation = 'source-over'
}

/**
 * Apply block glitch
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLCanvasElement} sourceCanvas - Source canvas
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} intensity - Effect intensity (0-1)
 */
function applyBlockGlitch (ctx, sourceCanvas, width, height, intensity) {
  // Number of blocks to glitch
  const numBlocks = Math.floor(intensity * 5) + 1

  // Clear the main canvas
  ctx.clearRect(0, 0, width, height)

  // Draw the source canvas
  ctx.drawImage(sourceCanvas, 0, 0)

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

    // Copy the block
    const blockData = ctx.getImageData(blockX, blockY, blockWidth, blockHeight)

    // Paste the block at the destination
    ctx.putImageData(blockData, destX, destY)
  }
}

/**
 * Apply line shift glitch
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLCanvasElement} sourceCanvas - Source canvas
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} intensity - Effect intensity (0-1)
 */
function applyLineShift (ctx, sourceCanvas, width, height, intensity) {
  // Number of lines to shift
  const numLines = Math.floor(height * intensity * 0.2)

  // Clear the main canvas
  ctx.clearRect(0, 0, width, height)

  // Draw the source canvas
  ctx.drawImage(sourceCanvas, 0, 0)

  // Shift random lines
  for (let i = 0; i < numLines; i++) {
    const y = Math.floor(Math.random() * height)
    const shiftAmount = Math.floor((Math.random() - 0.5) * width * intensity)

    // Get the line data
    const lineData = ctx.getImageData(0, y, width, 1)

    // Clear the line
    ctx.clearRect(0, y, width, 1)

    // Draw the line with offset
    ctx.putImageData(lineData, shiftAmount, y)
  }
}

/**
 * Apply CRT effect to a canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} intensity - Effect intensity (0-1)
 */
function applyCRTEffect (ctx, width, height, intensity = 0.5) {
  // Scanlines
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
  for (let y = 0; y < height; y += 2) {
    ctx.fillRect(0, y, width, 1)
  }

  // Vignette
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    0,
    width / 2,
    height / 2,
    Math.max(width, height) / 1.5
  )
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
  gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity * 0.7})`)

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // CRT curvature (using a subtle transform)
  if (intensity > 0.3) {
    // This would be better with WebGL, but for a simple effect:
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, width, height)
    ctx.clip()

    // Apply a subtle transform to simulate curvature
    ctx.transform(
      1 + intensity * 0.1,
      0,
      0,
      1 + intensity * 0.1,
      -width * intensity * 0.05,
      -height * intensity * 0.05
    )

    // Draw a slightly larger version of the canvas
    const scale = 1 + intensity * 0.1
    ctx.drawImage(
      ctx.canvas,
      0,
      0,
      width,
      height,
      (-width * (scale - 1)) / 2,
      (-height * (scale - 1)) / 2,
      width * scale,
      height * scale
    )

    ctx.restore()
  }
}

// Export the functions
window.applyGrainEffect = applyGrainEffect
window.applyStaticEffect = applyStaticEffect
window.applyGlitchEffect = applyGlitchEffect
window.applyCRTEffect = applyCRTEffect
