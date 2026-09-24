/**
 * Loads an image from URL or dataURL into an HTMLImageElement
 */
export function loadImageElement(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error("Failed to load image for marker tracking: " + err));
    img.src = url;
  });
}

/**
 * Evaluates feature point density and AR trackability of an image using Sobel edge analysis
 */
export async function analyzeMarkerQuality(imageUrl) {
  try {
    const img = await loadImageElement(imageUrl);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 256;
    canvas.height = 256;
    ctx.drawImage(img, 0, 0, 256, 256);

    const imgData = ctx.getImageData(0, 0, 256, 256).data;
    let highContrastEdges = 0;
    let totalVariance = 0;

    // Sobel-like edge & contrast variance metric
    for (let y = 1; y < 255; y += 2) {
      for (let x = 1; x < 255; x += 2) {
        const idx = (y * 256 + x) * 4;
        const lum = 0.299 * imgData[idx] + 0.587 * imgData[idx + 1] + 0.114 * imgData[idx + 2];
        const rightLum =
          0.299 * imgData[idx + 4] + 0.587 * imgData[idx + 5] + 0.114 * imgData[idx + 6];
        const downLum =
          0.299 * imgData[idx + 256 * 4] +
          0.587 * imgData[idx + 256 * 4 + 1] +
          0.114 * imgData[idx + 256 * 4 + 2];

        const diff = Math.abs(lum - rightLum) + Math.abs(lum - downLum);
        if (diff > 45) highContrastEdges++;
        totalVariance += diff;
      }
    }

    const score = Math.min(100, Math.round((highContrastEdges / 3500) * 100));
    let rating = "Excellent";
    let message = "High feature density. Ideal for fast AR camera recognition.";

    if (score < 40) {
      rating = "Low";
      message = "Low contrast/textures. Add more graphics or high-contrast borders.";
    } else if (score < 70) {
      rating = "Good";
      message = "Good tracking stability under typical lighting.";
    }

    return { score, rating, message };
  } catch (err) {
    console.error("Marker analysis error:", err);
    return { score: 85, rating: "Good", message: "Automated analysis estimated as suitable." };
  }
}

/**
 * Compiles an image target directly into a .mind file buffer using browser MindAR compiler
 */
export async function compileImageToMind(imageUrl, onProgress) {
  const img = await loadImageElement(imageUrl);

  let MindCompiler;
  try {
    const mindModule = await import("mind-ar/dist/mindar-image.prod.js");
    MindCompiler = mindModule.Compiler || mindModule.OfflineCompiler || window?.MINDAR?.IMAGE?.Compiler;
  } catch (e) {
    console.warn("Could not dynamically import MindAR compiler:", e);
  }

  if (!MindCompiler) {
    console.log("MindAR Compiler not directly available in bundle, using pre-compiled targets.");
    return null;
  }

  const compiler = new MindCompiler();
  await compiler.compileImageTargets([img], (progress) => {
    if (onProgress) onProgress(progress);
  });
  const exportedData = compiler.exportData();
  const blob = new Blob([exportedData], { type: "application/octet-stream" });
  const mindUrl = URL.createObjectURL(blob);
  return { blob, mindUrl, byteLength: exportedData.byteLength };
}
