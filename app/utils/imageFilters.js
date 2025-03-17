/**
 * Applies a Y2K-style threshold filter to an image, mapping black to dark color and white to green
 * @param {HTMLImageElement} img - The image element to process
 * @param {string} darkColor - Theme dark color in hex
 * @param {string} greenColor - Theme green color in hex
 * @returns {HTMLCanvasElement} - Canvas with the filtered image
 */
export function applyY2KImageFilter(img, darkColor = '#15191A', greenColor = '#29B5B0') {
  // Create canvas and get context
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  
  // Draw original image
  ctx.drawImage(img, 0, 0, img.width, img.height);
  
  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // First pass: calculate average luminance and find min/max values
  let totalLuminance = 0;
  let minLuminance = 255;
  let maxLuminance = 0;
  const luminanceMap = new Array(data.length / 4);
  
  for (let i = 0; i < data.length; i += 4) {
    // Calculate grayscale value (luminance)
    const luminance = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
    luminanceMap[i/4] = luminance;
    totalLuminance += luminance;
    minLuminance = Math.min(minLuminance, luminance);
    maxLuminance = Math.max(maxLuminance, luminance);
  }
  
  const avgLuminance = totalLuminance / (data.length / 4);
  const isMostlyDark = avgLuminance < 128;
  
  // Create edge detection convolution kernels (Sobel operators)
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  
  // Edge detection
  const edgeData = new Uint8ClampedArray(data.length);
  const width = canvas.width;
  const edgeThreshold = 30; // Adjust for edge sensitivity
  
  // Create a separate array for edge detection
  for (let y = 1; y < canvas.height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pixelIndex = (y * width + x) * 4;
      
      // Apply sobel operator
      let gradX = 0;
      let gradY = 0;
      
      for (let kernelY = -1; kernelY <= 1; kernelY++) {
        for (let kernelX = -1; kernelX <= 1; kernelX++) {
          const currentPixel = ((y + kernelY) * width + (x + kernelX)) * 4;
          const luminance = luminanceMap[currentPixel/4];
          
          gradX += luminance * sobelX[(kernelY + 1) * 3 + (kernelX + 1)];
          gradY += luminance * sobelY[(kernelY + 1) * 3 + (kernelX + 1)];
        }
      }
      
      // Calculate edge strength
      const gradMagnitude = Math.sqrt(gradX * gradX + gradY * gradY);
      const isEdge = gradMagnitude > edgeThreshold;
      
      // Interpolate luminance for contrast enhancement
      const normalizedLuminance = maxLuminance > minLuminance ? 
        (luminanceMap[pixelIndex/4] - minLuminance) / (maxLuminance - minLuminance) : 0.5;
      
      // Apply threshold with interpolation
      if (normalizedLuminance > 0.5 || isEdge) {
        // Use green for bright areas or edges in dark images
        edgeData[pixelIndex] = 41;     // R component
        edgeData[pixelIndex+1] = 181;  // G component
        edgeData[pixelIndex+2] = 176;  // B component
        edgeData[pixelIndex+3] = 255;  // Alpha
      } else {
        // Use dark for shadows or edges in light images
        edgeData[pixelIndex] = 21;     // R component
        edgeData[pixelIndex+1] = 25;   // G component
        edgeData[pixelIndex+2] = 26;   // B component
        edgeData[pixelIndex+3] = 255;  // Alpha
      }
      
      // Enhance edge visibility
      if (isEdge) {
        if (isMostlyDark) {
          // For dark images, make edges green
          edgeData[pixelIndex] = 41;
          edgeData[pixelIndex+1] = 181;
          edgeData[pixelIndex+2] = 176;
        } else {
          // For light images, make edges dark
          edgeData[pixelIndex] = 21;
          edgeData[pixelIndex+1] = 25;
          edgeData[pixelIndex+2] = 26;
        }
      }
    }
  }
  // Create new image data with the processed pixels
  const processedImageData = new ImageData(edgeData, canvas.width, canvas.height);
  ctx.putImageData(processedImageData, 0, 0);
  
  return canvas;
}