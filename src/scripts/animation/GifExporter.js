/**
 * GifExporter Class
 * 
 * Handles exporting animations as GIF files.
 * Uses the gif.js library.
 */
class GifExporter {
  /**
   * Create a new GifExporter
   * @param {Timeline} timeline - The Timeline instance
   */
  constructor(timeline) {
    this.timeline = timeline;
  }
  
  /**
   * Generate a GIF from the timeline frames
   * @param {number} frameDelay - Delay between frames in milliseconds
   * @returns {Promise<Uint8Array>} Promise that resolves with the GIF data
   */
  generateGif(frameDelay = 100) {
    return new Promise((resolve, reject) => {
      // Get frames data
      const framesData = this.timeline.getFramesData();
      
      if (framesData.length === 0) {
        reject(new Error('No frames to export'));
        return;
      }
      
      // Create a GIF encoder
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: framesData[0].width,
        height: framesData[0].height,
        workerScript: 'scripts/lib/gif.worker.js'
      });
      
      // Add each frame to the GIF
      framesData.forEach(frameData => {
        // Create a canvas for the frame
        const canvas = document.createElement('canvas');
        canvas.width = frameData.width;
        canvas.height = frameData.height;
        const ctx = canvas.getContext('2d');
        
        // Draw the frame data to the canvas
        for (let y = 0; y < frameData.height; y++) {
          for (let x = 0; x < frameData.width; x++) {
            const index = y * frameData.width + x;
            const color = frameData.pixelData[index];
            
            ctx.fillStyle = color;
            ctx.fillRect(x, y, 1, 1);
          }
        }
        
        // Add the canvas to the GIF
        gif.addFrame(canvas, { delay: frameDelay });
      });
      
      // Render the GIF
      gif.on('finished', blob => {
        // Convert blob to array buffer
        const reader = new FileReader();
        reader.onload = () => {
          const arrayBuffer = reader.result;
          const uint8Array = new Uint8Array(arrayBuffer);
          resolve(uint8Array);
        };
        reader.onerror = () => {
          reject(new Error('Failed to read GIF data'));
        };
        reader.readAsArrayBuffer(blob);
      });
      
      gif.on('error', error => {
        reject(error);
      });
      
      gif.render();
    });
  }
  
  /**
   * Generate a sprite sheet from the timeline frames
   * @param {number} columns - Number of columns in the sprite sheet
   * @returns {string} Data URL of the sprite sheet
   */
  generateSpriteSheet(columns = 5) {
    // Get frames data
    const framesData = this.timeline.getFramesData();
    
    if (framesData.length === 0) {
      throw new Error('No frames to export');
    }
    
    // Calculate sprite sheet dimensions
    const frameWidth = framesData[0].width;
    const frameHeight = framesData[0].height;
    const rows = Math.ceil(framesData.length / columns);
    const sheetWidth = frameWidth * columns;
    const sheetHeight = frameHeight * rows;
    
    // Create a canvas for the sprite sheet
    const canvas = document.createElement('canvas');
    canvas.width = sheetWidth;
    canvas.height = sheetHeight;
    const ctx = canvas.getContext('2d');
    
    // Fill with black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, sheetWidth, sheetHeight);
    
    // Draw each frame to the sprite sheet
    framesData.forEach((frameData, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      const x = col * frameWidth;
      const y = row * frameHeight;
      
      // Draw the frame data to the sprite sheet
      for (let fy = 0; fy < frameData.height; fy++) {
        for (let fx = 0; fx < frameData.width; fx++) {
          const index = fy * frameData.width + fx;
          const color = frameData.pixelData[index];
          
          ctx.fillStyle = color;
          ctx.fillRect(x + fx, y + fy, 1, 1);
        }
      }
    });
    
    // Return the sprite sheet as a data URL
    return canvas.toDataURL('image/png');
  }
}
