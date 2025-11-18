/**
 * Photo quality assessment utilities
 * Analyzes images for brightness, contrast, and blur detection
 */

export interface QualityAssessment {
  brightness: number; // 0-255 average brightness
  contrast: number; // Standard deviation of brightness
  blurScore: number; // Lower = more blurry (0-1)
  isTooDark: boolean;
  isTooBright: boolean;
  isBlurry: boolean;
  isWellFramed: boolean;
  overallScore: number; // 0-1, higher is better
  feedback: string[];
}

/**
 * Analyze image quality from an ImageData object
 */
export async function assessImageQuality(
  imageData: ImageData
): Promise<QualityAssessment> {
  const { data, width, height } = imageData;
  const pixelCount = width * height;

  // Calculate brightness (average of RGB values)
  let totalBrightness = 0;
  const brightnessValues: number[] = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;
    totalBrightness += brightness;
    brightnessValues.push(brightness);
  }

  const avgBrightness = totalBrightness / pixelCount;

  // Calculate contrast (standard deviation of brightness)
  const variance =
    brightnessValues.reduce((sum, val) => sum + Math.pow(val - avgBrightness, 2), 0) /
    pixelCount;
  const contrast = Math.sqrt(variance);

  // Calculate blur score using Laplacian variance
  // Higher variance = sharper image
  let laplacianVariance = 0;
  const laplacianValues: number[] = [];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const center = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      const right = (data[idx + 4] + data[idx + 5] + data[idx + 6]) / 3;
      const bottom = (data[(idx + width * 4) + 0] + data[(idx + width * 4) + 1] + data[(idx + width * 4) + 2]) / 3;

      const laplacian = Math.abs(center * 4 - right - bottom);
      laplacianValues.push(laplacian);
      laplacianVariance += laplacian;
    }
  }

  const avgLaplacian = laplacianVariance / laplacianValues.length;
  const laplacianStdDev = Math.sqrt(
    laplacianValues.reduce(
      (sum, val) => sum + Math.pow(val - avgLaplacian, 2),
      0
    ) / laplacianValues.length
  );

  // Normalize blur score (0-1, higher = sharper)
  const blurScore = Math.min(laplacianStdDev / 100, 1);

  // Thresholds
  const TOO_DARK_THRESHOLD = 50;
  const TOO_BRIGHT_THRESHOLD = 200;
  const BLURRY_THRESHOLD = 0.1;
  const MIN_CONTRAST = 20;

  const isTooDark = avgBrightness < TOO_DARK_THRESHOLD;
  const isTooBright = avgBrightness > TOO_BRIGHT_THRESHOLD;
  const isBlurry = blurScore < BLURRY_THRESHOLD;
  const hasLowContrast = contrast < MIN_CONTRAST;

  // Check if well framed (not too much empty space at edges)
  const edgeBrightness = calculateEdgeBrightness(data, width, height);
  const centerBrightness = calculateCenterBrightness(data, width, height);
  const isWellFramed = Math.abs(edgeBrightness - centerBrightness) < 30;

  // Generate feedback
  const feedback: string[] = [];
  if (isTooDark) {
    feedback.push('Image is too dark. Try increasing lighting or using flash.');
  }
  if (isTooBright) {
    feedback.push('Image is too bright. Try reducing exposure or moving away from direct light.');
  }
  if (isBlurry) {
    feedback.push('Image appears blurry. Hold the camera steady and ensure focus.');
  }
  if (hasLowContrast) {
    feedback.push('Image has low contrast. Ensure good lighting conditions.');
  }
  if (!isWellFramed) {
    feedback.push('Consider framing the window more centrally.');
  }
  if (feedback.length === 0) {
    feedback.push('Image quality looks good!');
  }

  // Calculate overall score (0-1)
  let overallScore = 1.0;
  if (isTooDark || isTooBright) overallScore -= 0.3;
  if (isBlurry) overallScore -= 0.3;
  if (hasLowContrast) overallScore -= 0.2;
  if (!isWellFramed) overallScore -= 0.1;
  overallScore = Math.max(0, overallScore);

  return {
    brightness: avgBrightness,
    contrast,
    blurScore,
    isTooDark,
    isTooBright,
    isBlurry,
    isWellFramed,
    overallScore,
    feedback,
  };
}

/**
 * Calculate average brightness at image edges
 */
function calculateEdgeBrightness(
  data: Uint8ClampedArray,
  width: number,
  height: number
): number {
  let totalBrightness = 0;
  let pixelCount = 0;

  // Top and bottom edges
  for (let x = 0; x < width; x++) {
    const topIdx = x * 4;
    const bottomIdx = ((height - 1) * width + x) * 4;
    totalBrightness += (data[topIdx] + data[topIdx + 1] + data[topIdx + 2]) / 3;
    totalBrightness += (data[bottomIdx] + data[bottomIdx + 1] + data[bottomIdx + 2]) / 3;
    pixelCount += 2;
  }

  // Left and right edges (excluding corners already counted)
  for (let y = 1; y < height - 1; y++) {
    const leftIdx = y * width * 4;
    const rightIdx = (y * width + width - 1) * 4;
    totalBrightness += (data[leftIdx] + data[leftIdx + 1] + data[leftIdx + 2]) / 3;
    totalBrightness += (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;
    pixelCount += 2;
  }

  return totalBrightness / pixelCount;
}

/**
 * Calculate average brightness at image center
 */
function calculateCenterBrightness(
  data: Uint8ClampedArray,
  width: number,
  height: number
): number {
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  const radius = Math.min(width, height) * 0.2;

  let totalBrightness = 0;
  let pixelCount = 0;

  for (let y = centerY - radius; y < centerY + radius; y++) {
    for (let x = centerX - radius; x < centerX + radius; x++) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        const idx = (y * width + x) * 4;
        totalBrightness += (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        pixelCount++;
      }
    }
  }

  return totalBrightness / pixelCount;
}

/**
 * Load image from file and assess quality
 */
export async function assessImageFileQuality(
  file: File
): Promise<QualityAssessment> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      assessImageQuality(imageData)
        .then((assessment) => {
          URL.revokeObjectURL(url);
          resolve(assessment);
        })
        .catch(reject);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

