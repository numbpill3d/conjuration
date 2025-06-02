/**
 * GifExporter.js
 * Handles exporting animations as GIF files using gif.js library
 */

class GifExporter {
    constructor(timeline) {
        this.timeline = timeline;
    }
    
    async exportGif(options = {}) {
        // Default options
        const settings = {
            quality: 10,
            workers: 4,
            width: this.timeline.pixelCanvas.width,
            height: this.timeline.pixelCanvas.height,
            dither: false,
            ...options
        };
        
        // Create gif.js instance
        const gif = new GIF({
            quality: settings.quality,
            workers: settings.workers,
            width: settings.width,
            height: settings.height,
            workerScript: 'scripts/animation/gif.worker.js',
            dither: settings.dither ? 'FloydSteinberg' : false,
            background: '#000000'
        });
        
        // Prepare frames for export
        const frames = this.timeline.frames;
        
        // Save the current frame to ensure it's up to date
        frames[this.timeline.currentFrameIndex].setImageData(
            this.timeline.pixelCanvas.getCanvasImageData()
        );
        
        // Create a temporary canvas for rendering frames
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = settings.width;
        tempCanvas.height = settings.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Add each frame to the GIF
        for (const frame of frames) {
            // Clear the temporary canvas
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            // Draw the frame
            tempCtx.putImageData(frame.imageData, 0, 0);
            
            // Add the frame to the GIF
            gif.addFrame(tempCanvas, { delay: frame.delay, copy: true });
        }
        
        // Create a promise to wait for GIF rendering
        return new Promise((resolve, reject) => {
            // Set up rendering callback
            gif.on('finished', (blob) => {
                // Convert blob to array buffer
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsArrayBuffer(blob);
            });
            
            // Set up error callback
            gif.on('error', reject);
            
            // Start rendering
            gif.render();
        });
    }
    
    async exportSpriteSheet() {
        // Save the current frame to ensure it's up to date
        const frames = this.timeline.frames;
        frames[this.timeline.currentFrameIndex].setImageData(
            this.timeline.pixelCanvas.getCanvasImageData()
        );
        
        // Determine sprite sheet dimensions
        const frameWidth = this.timeline.pixelCanvas.width;
        const frameHeight = this.timeline.pixelCanvas.height;
        const frameCount = frames.length;
        
        // Calculate a reasonable grid layout (roughly square)
        const cols = Math.ceil(Math.sqrt(frameCount));
        const rows = Math.ceil(frameCount / cols);
        
        // Create a canvas for the sprite sheet
        const spriteSheet = document.createElement('canvas');
        spriteSheet.width = frameWidth * cols;
        spriteSheet.height = frameHeight * rows;
        const ctx = spriteSheet.getContext('2d');
        
        // Fill with black background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, spriteSheet.width, spriteSheet.height);
        
        // Add each frame to the sprite sheet
        for (let i = 0; i < frameCount; i++) {
            const frame = frames[i];
            
            // Calculate position
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = col * frameWidth;
            const y = row * frameHeight;
            
            // Create a temporary canvas for the frame
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = frameWidth;
            tempCanvas.height = frameHeight;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Draw the frame
            tempCtx.putImageData(frame.imageData, 0, 0);
            
            // Draw onto the sprite sheet
            ctx.drawImage(tempCanvas, x, y);
        }
        
        // Return as data URL
        return spriteSheet.toDataURL('image/png');
    }
}

/**
 * gif.worker.js
 * This is a minimal stub for the gif.worker.js file that would be used by gif.js.
 * In a real implementation, you would need to include the actual gif.worker.js file
 * from the gif.js library.
 */

// This file is intentionally minimal - in a real implementation you would
// copy the actual gif.worker.js contents from the gif.js library here.
