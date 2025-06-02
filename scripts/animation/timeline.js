/**
 * Timeline.js
 * Handles frame-based animation timeline for VOIDSKETCH
 */

class Timeline {
    constructor(pixelCanvas, options = {}) {
        // Default options
        this.options = {
            frameDelay: 100, // milliseconds
            maxFrames: 64,
            loopAnimation: true,
            onionSkinEnabled: false,
            onionSkinOpacity: 0.3,
            ...options
        };
        
        // References
        this.pixelCanvas = pixelCanvas;
        this.framesContainer = document.getElementById('frames-container');
        
        // State
        this.frames = [];
        this.currentFrameIndex = 0;
        this.isPlaying = false;
        this.animationInterval = null;
        this.frameDelay = this.options.frameDelay;
        this.loopAnimation = this.options.loopAnimation;
        this.onionSkinEnabled = this.options.onionSkinEnabled;
        
        // Initialize
        this.initialize();
    }
    
    initialize() {
        // Create first frame
        this.createNewFrame();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Frame control buttons
        document.getElementById('add-frame').addEventListener('click', () => this.createNewFrame());
        document.getElementById('duplicate-frame').addEventListener('click', () => this.duplicateCurrentFrame());
        document.getElementById('delete-frame').addEventListener('click', () => this.deleteCurrentFrame());
        
        // Animation controls
        document.getElementById('play-animation').addEventListener('click', () => this.playAnimation());
        document.getElementById('stop-animation').addEventListener('click', () => this.stopAnimation());
        document.getElementById('loop-animation').addEventListener('click', () => this.toggleLoopAnimation());
        
        // Frame delay input
        document.getElementById('frame-delay').addEventListener('change', (e) => {
            this.frameDelay = parseInt(e.target.value);
            if (this.isPlaying) {
                this.stopAnimation();
                this.playAnimation();
            }
        });
        
        // Onion skin toggle
        document.getElementById('onion-skin').addEventListener('change', (e) => {
            this.onionSkinEnabled = e.target.checked;
            this.renderCurrentFrame();
        });
    }
    
    createNewFrame() {
        // Create a new frame after the current one
        const newFrameIndex = this.currentFrameIndex + 1;
        
        // Create a new Frame object
        const newFrame = new Frame({
            index: newFrameIndex,
            imageData: this.createEmptyImageData(),
            delay: this.frameDelay
        });
        
        // Insert the new frame after the current one
        this.frames.splice(newFrameIndex, 0, newFrame);
        
        // Update indices for frames after the new one
        for (let i = newFrameIndex + 1; i < this.frames.length; i++) {
            this.frames[i].index = i;
        }
        
        // Switch to the new frame
        this.selectFrame(newFrameIndex);
        
        // Update the UI
        this.updateFramesUI();
    }
    
    duplicateCurrentFrame() {
        // Don't do anything if there are no frames
        if (this.frames.length === 0) return;
        
        // Get the current frame
        const currentFrame = this.frames[this.currentFrameIndex];
        
        // Create a duplicate frame
        const duplicateFrame = new Frame({
            index: this.currentFrameIndex + 1,
            imageData: this.pixelCanvas.getCanvasImageData(),
            delay: currentFrame.delay
        });
        
        // Insert the duplicate frame after the current one
        this.frames.splice(this.currentFrameIndex + 1, 0, duplicateFrame);
        
        // Update indices for frames after the duplicate
        for (let i = this.currentFrameIndex + 2; i < this.frames.length; i++) {
            this.frames[i].index = i;
        }
        
        // Switch to the duplicate frame
        this.selectFrame(this.currentFrameIndex + 1);
        
        // Update the UI
        this.updateFramesUI();
    }
    
    deleteCurrentFrame() {
        // Don't delete if there's only one frame
        if (this.frames.length <= 1) return;
        
        // Remove the current frame
        this.frames.splice(this.currentFrameIndex, 1);
        
        // Update indices for all frames
        for (let i = 0; i < this.frames.length; i++) {
            this.frames[i].index = i;
        }
        
        // Adjust current frame index if needed
        if (this.currentFrameIndex >= this.frames.length) {
            this.currentFrameIndex = this.frames.length - 1;
        }
        
        // Switch to the new current frame
        this.selectFrame(this.currentFrameIndex);
        
        // Update the UI
        this.updateFramesUI();
    }
    
    selectFrame(index) {
        // Don't do anything if the index is out of bounds
        if (index < 0 || index >= this.frames.length) return;
        
        // Save the current frame
        if (this.frames.length > 0 && this.currentFrameIndex < this.frames.length) {
            this.frames[this.currentFrameIndex].setImageData(this.pixelCanvas.getCanvasImageData());
        }
        
        // Update current frame index
        this.currentFrameIndex = index;
        
        // Load the selected frame
        this.renderCurrentFrame();
        
        // Update the UI
        this.updateFramesUI();
        
        // Update status
        this.updateStatus();
    }
    
    renderCurrentFrame() {
        // Clear the canvas and remove any onion skin
        this.pixelCanvas.clear();
        
        // Apply onion skin if enabled
        if (this.onionSkinEnabled) {
            this.applyOnionSkin();
        }
        
        // Draw the current frame
        if (this.frames.length > 0) {
            const currentFrame = this.frames[this.currentFrameIndex];
            this.pixelCanvas.setCanvasFromImageData(currentFrame.imageData);
        }
    }
    
    applyOnionSkin() {
        // Apply onion skin from the previous and next frames
        const prevIndex = this.currentFrameIndex - 1;
        const nextIndex = this.currentFrameIndex + 1;
        
        // Create a temporary canvas for drawing onion skin
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.pixelCanvas.width;
        tempCanvas.height = this.pixelCanvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Draw previous frame if it exists
        if (prevIndex >= 0) {
            tempCtx.globalAlpha = this.options.onionSkinOpacity;
            tempCtx.putImageData(this.frames[prevIndex].imageData, 0, 0);
            this.pixelCanvas.effectsCtx.globalAlpha = this.options.onionSkinOpacity / 2;
            this.pixelCanvas.effectsCtx.drawImage(tempCanvas, 0, 0);
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        }
        
        // Draw next frame if it exists
        if (nextIndex < this.frames.length) {
            tempCtx.globalAlpha = this.options.onionSkinOpacity;
            tempCtx.putImageData(this.frames[nextIndex].imageData, 0, 0);
            this.pixelCanvas.effectsCtx.globalAlpha = this.options.onionSkinOpacity / 2;
            this.pixelCanvas.effectsCtx.drawImage(tempCanvas, 0, 0);
        }
        
        // Reset alpha
        this.pixelCanvas.effectsCtx.globalAlpha = 1.0;
    }
    
    playAnimation() {
        // Don't do anything if already playing
        if (this.isPlaying) return;
        
        // Save the current frame before playing
        if (this.frames.length > 0) {
            this.frames[this.currentFrameIndex].setImageData(this.pixelCanvas.getCanvasImageData());
        }
        
        // Set playing state
        this.isPlaying = true;
        
        // Update button state
        document.getElementById('play-animation').classList.add('active');
        
        // Start the animation loop
        this.startAnimationLoop();
        
        // Update status
        this.updateStatus('PLAYING');
    }
    
    stopAnimation() {
        // Don't do anything if not playing
        if (!this.isPlaying) return;
        
        // Clear the animation interval
        clearInterval(this.animationInterval);
        
        // Set playing state
        this.isPlaying = false;
        
        // Update button state
        document.getElementById('play-animation').classList.remove('active');
        
        // Return to the current frame
        this.renderCurrentFrame();
        
        // Update status
        this.updateStatus();
    }
    
    startAnimationLoop() {
        // Clear any existing interval
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }
        
        // Set up animation variables
        let frameIndex = this.currentFrameIndex;
        
        // Function to display the next frame
        const showNextFrame = () => {
            // Increment frame index
            frameIndex = (frameIndex + 1) % this.frames.length;
            
            // Check if we need to loop
            if (!this.loopAnimation && frameIndex === 0) {
                // Stop the animation if looping is disabled and we reached the end
                this.stopAnimation();
                return;
            }
            
            // Clear the canvas
            this.pixelCanvas.effectsCtx.clearRect(0, 0, this.pixelCanvas.width, this.pixelCanvas.height);
            
            // Draw the frame
            this.pixelCanvas.setCanvasFromImageData(this.frames[frameIndex].imageData);
        };
        
        // Start the interval
        this.animationInterval = setInterval(showNextFrame, this.frameDelay);
    }
    
    toggleLoopAnimation() {
        // Toggle loop state
        this.loopAnimation = !this.loopAnimation;
        
        // Update button state
        const loopButton = document.getElementById('loop-animation');
        if (this.loopAnimation) {
            loopButton.classList.add('active');
        } else {
            loopButton.classList.remove('active');
        }
    }
    
    updateFramesUI() {
        // Clear the frames container
        this.framesContainer.innerHTML = '';
        
        // Add each frame to the UI
        this.frames.forEach((frame, index) => {
            // Create frame element
            const frameElement = document.createElement('div');
            frameElement.className = 'frame-thumbnail';
            if (index === this.currentFrameIndex) {
                frameElement.classList.add('active');
            }
            
            // Create frame preview canvas
            const previewCanvas = document.createElement('canvas');
            previewCanvas.className = 'frame-preview';
            previewCanvas.width = this.pixelCanvas.width;
            previewCanvas.height = this.pixelCanvas.height;
            
            const previewCtx = previewCanvas.getContext('2d');
            previewCtx.putImageData(frame.imageData, 0, 0);
            
            // Create frame info
            const frameInfo = document.createElement('div');
            frameInfo.className = 'frame-info';
            frameInfo.textContent = `Frame ${index + 1}`;
            
            // Add elements to frame
            frameElement.appendChild(previewCanvas);
            frameElement.appendChild(frameInfo);
            
            // Add click handler
            frameElement.addEventListener('click', () => this.selectFrame(index));
            
            // Add to container
            this.framesContainer.appendChild(frameElement);
        });
    }
    
    updateStatus(message = '') {
        // Update status message
        const statusElement = document.getElementById('status-message');
        if (message) {
            statusElement.textContent = message;
        } else if (this.frames.length > 0) {
            statusElement.textContent = `FRAME ${this.currentFrameIndex + 1} OF ${this.frames.length}`;
        } else {
            statusElement.textContent = 'NO FRAMES';
        }
    }
    
    createEmptyImageData() {
        // Create an empty ImageData object
        return new ImageData(
            this.pixelCanvas.width,
            this.pixelCanvas.height
        );
    }
    
    // Methods for export and save/load
    getFramesData() {
        // Save the current frame first
        if (this.frames.length > 0) {
            this.frames[this.currentFrameIndex].setImageData(this.pixelCanvas.getCanvasImageData());
        }
        
        // Prepare frames data
        return this.frames.map(frame => ({
            index: frame.index,
            imageData: frame.getDataURL(),
            delay: frame.delay
        }));
    }
    
    setFramesFromData(framesData) {
        // Clear existing frames
        this.frames = [];
        
        // Create Promise array for loading images
        const loadPromises = framesData.map(frameData => {
            return new Promise((resolve) => {
                // Create a new frame
                const frame = new Frame({
                    index: frameData.index,
                    delay: frameData.delay || this.frameDelay
                });
                
                // Load image data
                frame.loadFromDataURL(frameData.imageData).then(() => {
                    this.frames.push(frame);
                    resolve();
                });
            });
        });
        
        // Wait for all frames to load
        return Promise.all(loadPromises).then(() => {
            // Sort frames by index
            this.frames.sort((a, b) => a.index - b.index);
            
            // Set current frame to the first one
            this.currentFrameIndex = 0;
            
            // Update the UI
            this.updateFramesUI();
            
            // Render the current frame
            this.renderCurrentFrame();
        });
    }
}

/**
 * Frame.js
 * Represents a single animation frame
 */

class Frame {
    constructor(options = {}) {
        // Default options
        this.options = {
            index: 0,
            delay: 100,
            ...options
        };
        
        // Properties
        this.index = this.options.index;
        this.delay = this.options.delay;
        
        // Create or use provided ImageData
        if (this.options.imageData) {
            this.imageData = this.options.imageData;
        } else {
            this.imageData = new ImageData(1, 1); // Default empty
        }
    }
    
    setImageData(imageData) {
        this.imageData = imageData;
    }
    
    getDataURL() {
        // Convert ImageData to Data URL
        const canvas = document.createElement('canvas');
        canvas.width = this.imageData.width;
        canvas.height = this.imageData.height;
        
        const ctx = canvas.getContext('2d');
        ctx.putImageData(this.imageData, 0, 0);
        
        return canvas.toDataURL('image/png');
    }
    
    loadFromDataURL(dataURL) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                this.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                resolve();
            };
            img.onerror = reject;
            img.src = dataURL;
        });
    }
}
