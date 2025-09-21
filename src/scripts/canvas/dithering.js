/**
 * Dithering Module
 *
 * Provides various dithering algorithms for the canvas.
 */

/**
 * Apply ordered dithering (Bayer matrix) to image data
 * @param {ImageData} imageData - Image data to dither
 * @param {Array} palette - Array of colors to use
 * @returns {ImageData} Dithered image data
 */
function applyOrderedDithering(imageData, palette) {
  // 4x4 Bayer matrix
  const bayerMatrix = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
  ];

  // Normalize the matrix
  const normalizedMatrix = bayerMatrix.map((row) => row.map((val) => val / 16));

  // Convert palette to RGB arrays
  const paletteRgb = palette.map((color) => {
    if (color.startsWith("#")) {
      return {
        r: parseInt(color.substr(1, 2), 16),
        g: parseInt(color.substr(3, 2), 16),
        b: parseInt(color.substr(5, 2), 16),
      };
    } else {
      return { r: 0, g: 0, b: 0 };
    }
  });

  // Create a copy of the image data
  const newImageData = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height,
  );

  // Apply dithering
  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      const index = (y * imageData.width + x) * 4;

      // Get the pixel color
      const r = imageData.data[index];
      const g = imageData.data[index + 1];
      const b = imageData.data[index + 2];

      // Get threshold from Bayer matrix
      const threshold = normalizedMatrix[y % 4][x % 4];

      // Find the closest color in the palette
      let closestColor = paletteRgb[0];
      let secondClosestColor = paletteRgb[paletteRgb.length > 1 ? 1 : 0];
      let closestDistance = Number.MAX_VALUE;
      let secondClosestDistance = Number.MAX_VALUE;

      for (const paletteColor of paletteRgb) {
        // Calculate Euclidean distance in RGB space
        const distance = Math.sqrt(
          Math.pow(r - paletteColor.r, 2) +
            Math.pow(g - paletteColor.g, 2) +
            Math.pow(b - paletteColor.b, 2),
        );

        if (distance < closestDistance) {
          secondClosestDistance = closestDistance;
          secondClosestColor = closestColor;
          closestDistance = distance;
          closestColor = paletteColor;
        } else if (distance < secondClosestDistance) {
          secondClosestDistance = distance;
          secondClosestColor = paletteColor;
        }
      }

      // Apply threshold to choose between closest and second closest color
      const selectedColor = threshold > 0.5 ? closestColor : secondClosestColor;

      // Set the pixel color
      newImageData.data[index] = selectedColor.r;
      newImageData.data[index + 1] = selectedColor.g;
      newImageData.data[index + 2] = selectedColor.b;
      // Alpha channel remains unchanged
    }
  }

  return newImageData;
}

/**
 * Apply Floyd-Steinberg dithering to image data
 * @param {ImageData} imageData - Image data to dither
 * @param {Array} palette - Array of colors to use
 * @returns {ImageData} Dithered image data
 */
function applyFloydSteinbergDithering(imageData, palette) {
  // Convert palette to RGB arrays
  const paletteRgb = palette.map((color) => {
    if (color.startsWith("#")) {
      return {
        r: parseInt(color.substr(1, 2), 16),
        g: parseInt(color.substr(3, 2), 16),
        b: parseInt(color.substr(5, 2), 16),
      };
    } else {
      return { r: 0, g: 0, b: 0 };
    }
  });

  // Create a copy of the image data
  const newImageData = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height,
  );

  // Create a buffer for the error diffusion
  const width = imageData.width;
  const height = imageData.height;
  const buffer = new Array(width * height * 3).fill(0);

  // Copy the image data to the buffer
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const bufferIndex = (y * width + x) * 3;

      buffer[bufferIndex] = imageData.data[index];
      buffer[bufferIndex + 1] = imageData.data[index + 1];
      buffer[bufferIndex + 2] = imageData.data[index + 2];
    }
  }

  // Apply Floyd-Steinberg dithering
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const bufferIndex = (y * width + x) * 3;
      const outputIndex = (y * width + x) * 4;

      // Get the pixel color from the buffer
      const r = Math.max(0, Math.min(255, Math.round(buffer[bufferIndex])));
      const g = Math.max(0, Math.min(255, Math.round(buffer[bufferIndex + 1])));
      const b = Math.max(0, Math.min(255, Math.round(buffer[bufferIndex + 2])));

      // Find the closest color in the palette
      let closestColor = paletteRgb[0];
      let closestDistance = Number.MAX_VALUE;

      for (const paletteColor of paletteRgb) {
        // Calculate Euclidean distance in RGB space
        const distance = Math.sqrt(
          Math.pow(r - paletteColor.r, 2) +
            Math.pow(g - paletteColor.g, 2) +
            Math.pow(b - paletteColor.b, 2),
        );

        if (distance < closestDistance) {
          closestDistance = distance;
          closestColor = paletteColor;
        }
      }

      // Set the pixel color in the output
      newImageData.data[outputIndex] = closestColor.r;
      newImageData.data[outputIndex + 1] = closestColor.g;
      newImageData.data[outputIndex + 2] = closestColor.b;
      // Alpha channel remains unchanged

      // Calculate the error
      const errorR = r - closestColor.r;
      const errorG = g - closestColor.g;
      const errorB = b - closestColor.b;

      // Distribute the error to neighboring pixels
      if (x < width - 1) {
        // Right pixel (7/16)
        const rightIndex = bufferIndex + 3;
        buffer[rightIndex] += (errorR * 7) / 16;
        buffer[rightIndex + 1] += (errorG * 7) / 16;
        buffer[rightIndex + 2] += (errorB * 7) / 16;
      }

      if (y < height - 1) {
        if (x > 0) {
          // Bottom-left pixel (3/16)
          const bottomLeftIndex = bufferIndex + width * 3 - 3;
          buffer[bottomLeftIndex] += (errorR * 3) / 16;
          buffer[bottomLeftIndex + 1] += (errorG * 3) / 16;
          buffer[bottomLeftIndex + 2] += (errorB * 3) / 16;
        }

        // Bottom pixel (5/16)
        const bottomIndex = bufferIndex + width * 3;
        buffer[bottomIndex] += (errorR * 5) / 16;
        buffer[bottomIndex + 1] += (errorG * 5) / 16;
        buffer[bottomIndex + 2] += (errorB * 5) / 16;

        if (x < width - 1) {
          // Bottom-right pixel (1/16)
          const bottomRightIndex = bufferIndex + width * 3 + 3;
          buffer[bottomRightIndex] += (errorR * 1) / 16;
          buffer[bottomRightIndex + 1] += (errorG * 1) / 16;
          buffer[bottomRightIndex + 2] += (errorB * 1) / 16;
        }
      }
    }
  }

  return newImageData;
}

/**
 * Apply noise dithering to image data
 * @param {ImageData} imageData - Image data to dither
 * @param {Array} palette - Array of colors to use
 * @returns {ImageData} Dithered image data
 */
function applyNoiseDithering(imageData, palette) {
  // Convert palette to RGB arrays
  const paletteRgb = palette.map((color) => {
    if (color.startsWith("#")) {
      return {
        r: parseInt(color.substr(1, 2), 16),
        g: parseInt(color.substr(3, 2), 16),
        b: parseInt(color.substr(5, 2), 16),
      };
    } else {
      return { r: 0, g: 0, b: 0 };
    }
  });

  // Create a copy of the image data
  const newImageData = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height,
  );

  // Apply noise dithering
  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      const index = (y * imageData.width + x) * 4;

      // Get the pixel color
      const r = imageData.data[index];
      const g = imageData.data[index + 1];
      const b = imageData.data[index + 2];

      // Generate random threshold
      const threshold = Math.random();

      // Find the closest colors in the palette
      let closestColor = paletteRgb[0];
      let secondClosestColor = paletteRgb[paletteRgb.length > 1 ? 1 : 0];
      let closestDistance = Number.MAX_VALUE;
      let secondClosestDistance = Number.MAX_VALUE;

      for (const paletteColor of paletteRgb) {
        // Calculate Euclidean distance in RGB space
        const distance = Math.sqrt(
          Math.pow(r - paletteColor.r, 2) +
            Math.pow(g - paletteColor.g, 2) +
            Math.pow(b - paletteColor.b, 2),
        );

        if (distance < closestDistance) {
          secondClosestDistance = closestDistance;
          secondClosestColor = closestColor;
          closestDistance = distance;
          closestColor = paletteColor;
        } else if (distance < secondClosestDistance) {
          secondClosestDistance = distance;
          secondClosestColor = paletteColor;
        }
      }

      // Apply threshold to choose between closest and second closest color
      const selectedColor = threshold > 0.5 ? closestColor : secondClosestColor;

      // Set the pixel color
      newImageData.data[index] = selectedColor.r;
      newImageData.data[index + 1] = selectedColor.g;
      newImageData.data[index + 2] = selectedColor.b;
      // Alpha channel remains unchanged
    }
  }

  return newImageData;
}

/**
 * Apply dithering to a canvas
 * @param {HTMLCanvasElement} canvas - Canvas to dither
 * @param {string} type - Type of dithering ('ordered', 'floyd-steinberg', 'noise')
 * @param {Array} palette - Array of colors to use
 */
function applyDitheringToCanvas(canvas, type, palette) {
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  let ditheredImageData;

  switch (type) {
    case "ordered":
      ditheredImageData = applyOrderedDithering(imageData, palette);
      break;
    case "floyd-steinberg":
      ditheredImageData = applyFloydSteinbergDithering(imageData, palette);
      break;
    case "noise":
      ditheredImageData = applyNoiseDithering(imageData, palette);
      break;
    default:
      ditheredImageData = imageData;
      break;
  }

  ctx.putImageData(ditheredImageData, 0, 0);
}

/**
 * Convert an image to 1-bit (black and white)
 * @param {ImageData} imageData - Image data to convert
 * @param {number} threshold - Threshold value (0-255)
 * @returns {ImageData} Converted image data
 */
function convertTo1Bit(imageData, threshold = 127) {
  // Create a copy of the image data
  const newImageData = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height,
  );

  // Convert to 1-bit
  for (let i = 0; i < imageData.data.length; i += 4) {
    // Calculate grayscale value
    const gray =
      (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;

    // Apply threshold
    const value = gray > threshold ? 255 : 0;

    // Set the pixel color
    newImageData.data[i] = value;
    newImageData.data[i + 1] = value;
    newImageData.data[i + 2] = value;
    // Alpha channel remains unchanged
  }

  return newImageData;
}

/**
 * Convert an image to 2-bit (4 colors)
 * @param {ImageData} imageData - Image data to convert
 * @param {Array} palette - Array of 4 colors to use
 * @returns {ImageData} Converted image data
 */
function convertTo2Bit(imageData, palette) {
  // Ensure the palette has 4 colors
  if (palette.length !== 4) {
    throw new Error("2-bit conversion requires a palette of 4 colors");
  }

  // Convert palette to RGB arrays
  const paletteRgb = palette.map((color) => {
    if (color.startsWith("#")) {
      return {
        r: parseInt(color.substr(1, 2), 16),
        g: parseInt(color.substr(3, 2), 16),
        b: parseInt(color.substr(5, 2), 16),
      };
    } else {
      return { r: 0, g: 0, b: 0 };
    }
  });

  // Create a copy of the image data
  const newImageData = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height,
  );

  // Convert to 2-bit
  for (let i = 0; i < imageData.data.length; i += 4) {
    // Get the pixel color
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];

    // Find the closest color in the palette
    let closestColor = paletteRgb[0];
    let closestDistance = Number.MAX_VALUE;

    for (const paletteColor of paletteRgb) {
      // Calculate Euclidean distance in RGB space
      const distance = Math.sqrt(
        Math.pow(r - paletteColor.r, 2) +
          Math.pow(g - paletteColor.g, 2) +
          Math.pow(b - paletteColor.b, 2),
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestColor = paletteColor;
      }
    }

    // Set the pixel color
    newImageData.data[i] = closestColor.r;
    newImageData.data[i + 1] = closestColor.g;
    newImageData.data[i + 2] = closestColor.b;
    // Alpha channel remains unchanged
  }

  return newImageData;
}

// Export the functions
window.applyOrderedDithering = applyOrderedDithering;
window.applyFloydSteinbergDithering = applyFloydSteinbergDithering;
window.applyNoiseDithering = applyNoiseDithering;
window.applyDitheringToCanvas = applyDitheringToCanvas;
window.convertTo1Bit = convertTo1Bit;
window.convertTo2Bit = convertTo2Bit;
