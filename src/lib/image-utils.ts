const MAX_DATAURL_LENGTH = 280_000;
const MAX_DIMENSION = 800;

export interface ProcessedLogo {
  dataUrl: string;
  width: number;
  height: number;
  aspect: number;
}

function assertSvgSafe(text: string) {
  const lower = text.toLowerCase();
  const forbidden = [
    "<script",
    "<foreignobject",
    "javascript:",
    " onload=",
    " onerror=",
    " onclick=",
  ];
  for (const token of forbidden) {
    if (lower.includes(token)) throw new Error("SVG contains unsafe content and was rejected.");
  }
  if (/(?:xlink:)?href\s*=\s*["']https?:/i.test(text)) {
    throw new Error("SVG references external resources and was rejected.");
  }
  if (/\bfetch\s*\(|\bimport\s*\(/.test(text)) {
    throw new Error("SVG contains dynamic code and was rejected.");
  }
}

async function rasterizeSvg(file: File): Promise<HTMLImageElement> {
  const text = await file.text();
  assertSvgSafe(text);
  const blob = new Blob([text], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to rasterize SVG."));
    };
    img.src = url;
  });
}

async function loadRaster(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image."));
    };
    img.src = url;
  });
}

function imageToCanvas(img: HTMLImageElement, maxDim = MAX_DIMENSION): HTMLCanvasElement {
  const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}

/** Compress a raster logo to a bounded data URL. Always preserves alpha → PNG. */
export async function processLogoFile(file: File): Promise<ProcessedLogo> {
  if (file.size > 8 * 1024 * 1024) throw new Error("Logo file is too large (max 8 MB).");
  const isSvg = file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
  const allowed = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
  if (!isSvg && !allowed.includes(file.type)) {
    throw new Error("Unsupported file type. Use PNG, JPEG, WebP, or SVG.");
  }

  const img = isSvg ? await rasterizeSvg(file) : await loadRaster(file);

  const sizes = [512, 400, 320, 256, 192];
  for (const maxDim of sizes) {
    const canvas = imageToCanvas(img, maxDim);
    const dataUrl = canvas.toDataURL("image/png");
    if (dataUrl.length <= MAX_DATAURL_LENGTH) {
      return {
        dataUrl,
        width: canvas.width,
        height: canvas.height,
        aspect: canvas.width / canvas.height,
      };
    }
  }
  const fallback = imageToCanvas(img, 160);
  const dataUrl = fallback.toDataURL("image/png");
  if (dataUrl.length > MAX_DATAURL_LENGTH * 1.4) {
    throw new Error("Logo could not be compressed below 200 KB. Try a simpler or smaller image.");
  }
  return {
    dataUrl,
    width: fallback.width,
    height: fallback.height,
    aspect: fallback.width / fallback.height,
  };
}

/* =========================================================================
   BACKGROUND REMOVAL — flood fill from image edges.
   Removes pixels CONNECTED to the edge and close to the sampled background
   color. Internal white shapes are preserved because they are not edge-connected.
   ========================================================================= */

interface RGB {
  r: number;
  g: number;
  b: number;
}

function sampleEdgeBackground(data: Uint8ClampedArray, w: number, h: number): RGB {
  // Sample every edge pixel and average — robust for solid-color backgrounds
  let r = 0,
    g = 0,
    b = 0,
    n = 0;
  const step = Math.max(1, Math.floor(w / 64));
  for (let x = 0; x < w; x += step) {
    const top = (0 * w + x) * 4;
    const bot = ((h - 1) * w + x) * 4;
    r += data[top]! + data[bot]!;
    g += data[top + 1]! + data[bot + 1]!;
    b += data[top + 2]! + data[bot + 2]!;
    n += 2;
  }
  const stepY = Math.max(1, Math.floor(h / 64));
  for (let y = 0; y < h; y += stepY) {
    const left = (y * w + 0) * 4;
    const right = (y * w + (w - 1)) * 4;
    r += data[left]! + data[right]!;
    g += data[left + 1]! + data[right + 1]!;
    b += data[left + 2]! + data[right + 2]!;
    n += 2;
  }
  return { r: r / n, g: g / n, b: b / n };
}

/**
 * Remove edge-connected background pixels from a logo, producing a transparent PNG.
 * Uses flood fill from all edge pixels; internal shapes remain intact.
 */
export async function removeLogoBackground(sourceDataUrl: string, tolerance = 42): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = "anonymous";
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Failed to load logo for processing."));
    el.src = sourceDataUrl;
  });

  const canvas = imageToCanvas(img, MAX_DIMENSION);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable.");
  const w = canvas.width;
  const h = canvas.height;
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  const bg = sampleEdgeBackground(data, w, h);

  const tol2 = tolerance * tolerance;
  const visited = new Uint8Array(w * h);

  const matches = (i: number): boolean => {
    const dr = data[i]! - bg.r;
    const dg = data[i + 1]! - bg.g;
    const db = data[i + 2]! - bg.b;
    return dr * dr + dg * dg + db * db <= tol2;
  };

  // Flood fill from all edge pixels via a queue
  const queue: number[] = [];
  const pushPixel = (x: number, y: number) => {
    const idx = y * w + x;
    if (visited[idx]) return;
    const i = idx * 4;
    if (!matches(i)) return;
    visited[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < w; x++) {
    pushPixel(x, 0);
    pushPixel(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    pushPixel(0, y);
    pushPixel(w - 1, y);
  }

  while (queue.length > 0) {
    const idx = queue.pop()!;
    const x = idx % w;
    const y = (idx - x) / w;
    // Zero the alpha
    data[idx * 4 + 3] = 0;
    // Neighbors
    if (x > 0) pushPixel(x - 1, y);
    if (x < w - 1) pushPixel(x + 1, y);
    if (y > 0) pushPixel(x, y - 1);
    if (y < h - 1) pushPixel(x, y + 1);
  }

  // Feather: soften alpha just inside the boundary (1px halo reduction)
  const softened = new Uint8ClampedArray(data);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      if (data[idx * 4 + 3] === 0) continue;
      // Count transparent neighbors
      let transparent = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nIdx = (y + dy) * w + (x + dx);
          if (data[nIdx * 4 + 3] === 0) transparent++;
        }
      }
      if (transparent > 0) {
        const orig = softened[idx * 4 + 3] ?? 255;
        // Reduce alpha proportionally to boundary contact
        softened[idx * 4 + 3] = Math.round(orig * Math.max(0.15, 1 - transparent / 8));
      }
    }
  }

  ctx.putImageData(new ImageData(softened, w, h), 0, 0);

  // Crop transparent padding for a tight bounding box
  return cropTransparentCanvas(canvas);
}

/** Crop transparent padding around a canvas's non-transparent content. Returns a PNG data URL. */
export function cropTransparentCanvas(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas.toDataURL("image/png");
  const w = canvas.width;
  const h = canvas.height;
  const data = ctx.getImageData(0, 0, w, h).data;

  let minX = w,
    minY = h,
    maxX = -1,
    maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = data[(y * w + x) * 4 + 3]!;
      if (a > 6) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0 || maxY < 0) return canvas.toDataURL("image/png");

  const pad = 2;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);

  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const out = document.createElement("canvas");
  out.width = cw;
  out.height = ch;
  const octx = out.getContext("2d");
  if (!octx) return canvas.toDataURL("image/png");
  octx.drawImage(canvas, minX, minY, cw, ch, 0, 0, cw, ch);
  return out.toDataURL("image/png");
}
