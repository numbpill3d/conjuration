/**
 * Timeline Class
 *
 * Manages animation frames and playback.
 */
class Timeline {
  /**
   * Create a new Timeline
   * @param {PixelCanvas} canvas - The PixelCanvas instance
   */
  constructor (canvas) {
    this.canvas = canvas
    this.frames = []
    this.currentFrameIndex = 0
    this.isPlaying = false
    this.isLooping = true
    this.useOnionSkin = false
    this.playbackInterval = null
    this.framesContainer = document.getElementById('frames-container')
  }

  /**
   * Add a new frame
   * @returns {number} Index of the new frame
   */
  addFrame () {
    // Create a new frame with the current canvas state
    const frameData = this.canvas.getPixelData()
    const frame = new Frame(frameData, this.canvas.width, this.canvas.height)

    // Add the frame to the timeline
    this.frames.push(frame)

    // Update the UI
    this.renderFramesList()

    // Switch to the new frame
    this.setCurrentFrame(this.frames.length - 1)

    return this.frames.length - 1
  }

  /**
   * Duplicate the current frame
   * @returns {number} Index of the new frame
   */
  duplicateCurrentFrame () {
    if (this.frames.length === 0) return this.addFrame()

    // Get the current frame
    const currentFrame = this.frames[this.currentFrameIndex]

    // Create a copy of the frame
    const frameCopy = new Frame(
      [...currentFrame.pixelData],
      currentFrame.width,
      currentFrame.height
    )

    // Insert the copy after the current frame
    this.frames.splice(this.currentFrameIndex + 1, 0, frameCopy)

    // Update the UI
    this.renderFramesList()

    // Switch to the new frame
    this.setCurrentFrame(this.currentFrameIndex + 1)

    return this.currentFrameIndex
  }

  /**
   * Delete the current frame
   */
  deleteCurrentFrame () {
    if (this.frames.length <= 1) return

    // Remove the current frame
    this.frames.splice(this.currentFrameIndex, 1)

    // Adjust the current frame index
    if (this.currentFrameIndex >= this.frames.length) {
      this.currentFrameIndex = this.frames.length - 1
    }

    // Update the UI
    this.renderFramesList()

    // Switch to the adjusted current frame
    this.setCurrentFrame(this.currentFrameIndex)
  }

  /**
   * Set the current frame
   * @param {number} index - Index of the frame to set as current
   */
  setCurrentFrame (index) {
    if (index < 0 || index >= this.frames.length) return

    // Save the current canvas state to the current frame
    if (this.frames.length > 0 && this.currentFrameIndex < this.frames.length) {
      this.frames[this.currentFrameIndex].pixelData =
        this.canvas.getPixelData()
    }

    // Update the current frame index
    this.currentFrameIndex = index

    // Load the new frame data to the canvas
    this.canvas.setPixelData(this.frames[this.currentFrameIndex].pixelData)

    // Update the UI
    this.updateFrameSelection()

    // Apply onion skinning if enabled
    if (this.useOnionSkin) {
      this.applyOnionSkin()
    }
  }

  /**
   * Render the frames list in the UI
   */
  renderFramesList () {
    // Clear the frames container
    this.framesContainer.innerHTML = ''

    // Add each frame to the container
    this.frames.forEach((frame, index) => {
      const frameElement = document.createElement('div')
      frameElement.className = 'frame-item'
      frameElement.dataset.index = index

      // Create thumbnail canvas
      const thumbnail = document.createElement('canvas')
      thumbnail.className = 'frame-thumbnail'
      thumbnail.width = 48
      thumbnail.height = 48

      // Draw the frame data to the thumbnail
      const ctx = thumbnail.getContext('2d')
      ctx.imageSmoothingEnabled = false

      // Scale factor for the thumbnail
      const scaleX = 48 / frame.width
      const scaleY = 48 / frame.height

      // Draw each pixel
      for (let y = 0; y < frame.height; y++) {
        for (let x = 0; x < frame.width; x++) {
          const index = y * frame.width + x
          const color = frame.pixelData[index]

          ctx.fillStyle = color
          ctx.fillRect(
            Math.floor(x * scaleX),
            Math.floor(y * scaleY),
            Math.ceil(scaleX),
            Math.ceil(scaleY)
          )
        }
      }

      // Frame info
      const frameInfo = document.createElement('div')
      frameInfo.className = 'frame-info'

      const frameNumber = document.createElement('div')
      frameNumber.className = 'frame-number'
      frameNumber.textContent = `Frame ${index + 1}`

      const frameDuration = document.createElement('div')
      frameDuration.className = 'frame-duration'
      frameDuration.textContent = `${document.getElementById('frame-delay').value}ms`

      frameInfo.appendChild(frameNumber)
      frameInfo.appendChild(frameDuration)

      // Frame actions
      const frameActions = document.createElement('div')
      frameActions.className = 'frame-actions'

      const duplicateButton = document.createElement('button')
      duplicateButton.className = 'frame-action-button'
      duplicateButton.textContent = 'D'
      duplicateButton.title = 'Duplicate Frame'
      duplicateButton.addEventListener('click', (e) => {
        e.stopPropagation()
        this.setCurrentFrame(index)
        this.duplicateCurrentFrame()
      })

      const deleteButton = document.createElement('button')
      deleteButton.className = 'frame-action-button'
      deleteButton.textContent = 'X'
      deleteButton.title = 'Delete Frame'
      deleteButton.addEventListener('click', (e) => {
        e.stopPropagation()
        if (this.frames.length > 1) {
          this.setCurrentFrame(index)
          this.deleteCurrentFrame()
        }
      })

      frameActions.appendChild(duplicateButton)
      frameActions.appendChild(deleteButton)

      // Add elements to the frame item
      frameElement.appendChild(thumbnail)
      frameElement.appendChild(frameInfo)
      frameElement.appendChild(frameActions)

      // Add click event to select the frame
      frameElement.addEventListener('click', () => {
        this.setCurrentFrame(index)
      })

      // Add the frame element to the container
      this.framesContainer.appendChild(frameElement)
    })

    // Update the frame selection
    this.updateFrameSelection()
  }

  /**
   * Update the frame selection in the UI
   */
  updateFrameSelection () {
    // Remove active class from all frames
    const frameElements = this.framesContainer.querySelectorAll('.frame-item')
    frameElements.forEach((element) => {
      element.classList.remove('active')
    })

    // Add active class to the current frame
    if (this.currentFrameIndex < frameElements.length) {
      frameElements[this.currentFrameIndex].classList.add('active')
    }
  }

  /**
   * Play the animation
   */
  playAnimation () {
    if (this.isPlaying) return

    this.isPlaying = true

    // Get the frame delay from the input
    const frameDelay = parseInt(document.getElementById('frame-delay').value)

    // Start the playback interval
    this.playbackInterval = setInterval(() => {
      // Save the current canvas state to the current frame
      this.frames[this.currentFrameIndex].pixelData =
        this.canvas.getPixelData()

      // Move to the next frame
      this.currentFrameIndex++

      // Loop back to the beginning if needed
      if (this.currentFrameIndex >= this.frames.length) {
        if (this.isLooping) {
          this.currentFrameIndex = 0
        } else {
          this.currentFrameIndex = this.frames.length - 1
          this.stopAnimation()
          return
        }
      }

      // Load the new frame data to the canvas
      this.canvas.setPixelData(this.frames[this.currentFrameIndex].pixelData)

      // Update the UI
      this.updateFrameSelection()
    }, frameDelay)
  }

  /**
   * Stop the animation
   */
  stopAnimation () {
    if (!this.isPlaying) return

    this.isPlaying = false

    // Clear the playback interval
    clearInterval(this.playbackInterval)
    this.playbackInterval = null
  }

  /**
   * Set whether the animation should loop
   * @param {boolean} looping - Whether to loop the animation
   */
  setLooping (looping) {
    this.isLooping = looping
  }

  /**
   * Set whether to use onion skinning
   * @param {boolean} useOnionSkin - Whether to use onion skinning
   */
  setOnionSkinning (useOnionSkin) {
    this.useOnionSkin = useOnionSkin

    if (this.useOnionSkin) {
      this.applyOnionSkin()
    } else {
      // Clear the effects canvas
      const effectsCanvas = document.getElementById(
        this.canvas.effectsCanvas.id
      )
      const effectsCtx = effectsCanvas.getContext('2d')
      effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height)
    }
  }

  /**
   * Apply onion skinning effect
   */
  applyOnionSkin () {
    if (!this.useOnionSkin || this.frames.length <= 1) return

    // Get the effects canvas
    const effectsCanvas = document.getElementById(this.canvas.effectsCanvas.id)
    const effectsCtx = effectsCanvas.getContext('2d')

    // Clear the effects canvas
    effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height)

    // Get the previous frame index
    const prevIndex =
      this.currentFrameIndex > 0
        ? this.currentFrameIndex - 1
        : this.frames.length - 1

    // Get the next frame index
    const nextIndex =
      this.currentFrameIndex < this.frames.length - 1
        ? this.currentFrameIndex + 1
        : 0

    // Draw the previous frame with transparency
    if (prevIndex !== this.currentFrameIndex) {
      const prevFrame = this.frames[prevIndex]

      effectsCtx.globalAlpha = 0.2
      effectsCtx.fillStyle = 'rgba(255, 0, 0, 0.2)'

      for (let y = 0; y < prevFrame.height; y++) {
        for (let x = 0; x < prevFrame.width; x++) {
          const index = y * prevFrame.width + x
          const color = prevFrame.pixelData[index]

          if (color !== '#000000') {
            effectsCtx.fillRect(
              x * this.canvas.pixelSize * this.canvas.zoom,
              y * this.canvas.pixelSize * this.canvas.zoom,
              this.canvas.pixelSize * this.canvas.zoom,
              this.canvas.pixelSize * this.canvas.zoom
            )
          }
        }
      }
    }

    // Draw the next frame with transparency
    if (nextIndex !== this.currentFrameIndex) {
      const nextFrame = this.frames[nextIndex]

      effectsCtx.globalAlpha = 0.2
      effectsCtx.fillStyle = 'rgba(0, 0, 255, 0.2)'

      for (let y = 0; y < nextFrame.height; y++) {
        for (let x = 0; x < nextFrame.width; x++) {
          const index = y * nextFrame.width + x
          const color = nextFrame.pixelData[index]

          if (color !== '#000000') {
            effectsCtx.fillRect(
              x * this.canvas.pixelSize * this.canvas.zoom,
              y * this.canvas.pixelSize * this.canvas.zoom,
              this.canvas.pixelSize * this.canvas.zoom,
              this.canvas.pixelSize * this.canvas.zoom
            )
          }
        }
      }
    }

    // Reset global alpha
    effectsCtx.globalAlpha = 1.0
  }

  /**
   * Get the number of frames
   * @returns {number} Number of frames
   */
  getFrameCount () {
    return this.frames.length
  }

  /**
   * Get the frames data for saving
   * @returns {Array} Array of frame data objects
   */
  getFramesData () {
    // Save the current canvas state to the current frame
    if (this.frames.length > 0) {
      this.frames[this.currentFrameIndex].pixelData =
        this.canvas.getPixelData()
    }

    // Return the frames data
    return this.frames.map((frame) => ({
      pixelData: frame.pixelData,
      width: frame.width,
      height: frame.height
    }))
  }

  /**
   * Load frames from data
   * @param {Array} framesData - Array of frame data objects
   */
  loadFromData (framesData) {
    // Clear existing frames
    this.frames = []

    // Create frames from the data
    framesData.forEach((frameData) => {
      const frame = new Frame(
        frameData.pixelData,
        frameData.width,
        frameData.height
      )
      this.frames.push(frame)
    })

    // Update the UI
    this.renderFramesList()

    // Set the first frame as current
    this.setCurrentFrame(0)
  }

  /**
   * Clear all frames
   */
  clear () {
    this.frames = []
    this.currentFrameIndex = 0
    this.stopAnimation()
    this.framesContainer.innerHTML = ''
  }
}
