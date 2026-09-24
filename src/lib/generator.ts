import type { BusinessProfile, ChannelId, GeneratedPost } from "./store";
import { generateAdCopy, generateAdImage } from "./ai.functions";
import { DEFAULT_BRAND, ensureCanvasFont, getFontPairing, type BrandKit } from "./brand";

const CHANNELS: ChannelId[] = ["instagram", "facebook", "tiktok"];

const SLOTS = [
  {
    time: "9:00 AM",
    goal: "Engagement",
    focus: "Ask the audience a niche-specific question. Spark replies. Zero hard sell.",
  },
  {
    time: "1:30 PM",
    goal: "Conversion",
    focus: "Lead with the specific offer, add a deadline, end with a strong CTA.",
  },
  {
    time: "6:00 PM",
    goal: "Trust",
    focus: "Open with a customer review, social proof, or before/after proof.",
  },
] as const;

export interface GenerationProgress {
  stage: "copy" | "image" | "compose" | "done";
  completed: number;
  total: number;
}

/* ------------------------------- utilities -------------------------------- */

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return { r: 99, g: 102, b: 241 };
  const n = parseInt(m[1]!, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function luminance(rgb: RGB): number {
  return (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
}

/* ----------------------------- brand header ------------------------------- */

/**
 * Draws a full-width top brand treatment over the photograph.
 * Gradient uses the secondary color; the accent line uses the primary.
 * Logo is drawn exactly as supplied (already approved/transparent) — never
 * regenerated or restyled by AI.
 */
function drawBrandHeader(
  ctx: CanvasRenderingContext2D,
  size: number,
  brand: BrandKit,
  logo: HTMLImageElement | null,
): void {
  const primary = hexToRgb(brand.primaryColor || "#6366f1");
  const secondary = hexToRgb(brand.secondaryColor || "#0f172a");

  const bandH = Math.round(size * 0.17); // ~174px @ 1024
  const padX = 48;
  const contentY = Math.round(bandH * 0.42); // vertical center of logo/text
  const accentY = Math.round(bandH * 0.82);

  // 1. Full-width gradient — darkest at top, fades into the photo
  const grad = ctx.createLinearGradient(0, 0, 0, bandH);
  grad.addColorStop(0, `rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, 0.88)`);
  grad.addColorStop(0.68, `rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, 0.45)`);
  grad.addColorStop(1, `rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, 0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, bandH);

  // 2. Primary accent line under the text row
  ctx.fillStyle = `rgba(${primary.r}, ${primary.g}, ${primary.b}, 0.95)`;
  ctx.fillRect(padX, accentY, 64, 3);

  // 3. Contrast-aware text colors
  const bandLum = luminance(secondary);
  const textColor = bandLum < 0.55 ? "rgba(255,255,255,0.94)" : "rgba(15,17,24,0.94)";
  const subtleColor = bandLum < 0.55 ? "rgba(255,255,255,0.62)" : "rgba(15,17,24,0.62)";

  // 4. Logo — fit within 140x84 without distortion
  let cursorX = padX;
  if (logo && logo.naturalWidth > 0 && logo.naturalHeight > 0) {
    const maxW = 140;
    const maxH = 84;
    const scale = Math.min(maxW / logo.naturalWidth, maxH / logo.naturalHeight, 1);
    const w = Math.max(1, Math.round(logo.naturalWidth * scale));
    const h = Math.max(1, Math.round(logo.naturalHeight * scale));
    ctx.drawImage(logo, cursorX, Math.round(contentY - h / 2), w, h);
    cursorX += w + 22;
  }

  // 5. Brand name beside the logo (if the user set one)
  if (brand.brandName && brand.brandName.trim()) {
    ctx.font = "700 26px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = textColor;
    ctx.fillText(brand.brandName.trim().toUpperCase(), cursorX, contentY);
  }

  // 6. Small "SPONSORED" kicker at the right of the band
  ctx.font = "600 15px Inter, system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillStyle = subtleColor;
  ctx.fillText("SPONSORED", size - padX, contentY);
}

/* ------------------------------- compositor ------------------------------- */

/**
 * Compose a flyer with brand-aware styling.
 * Pass the brand snapshot captured at generation time — never the current
 * settings unless this is a fresh generation.
 */
export async function composeAdImage(
  backgroundDataUrl: string,
  headline: string,
  brand: BrandKit = DEFAULT_BRAND,
): Promise<string> {
  const img = await loadImage(backgroundDataUrl);
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return backgroundDataUrl;

  const pairing = getFontPairing(brand.fontPairing);
  const headlineFont = await ensureCanvasFont(pairing.displayWeight, 62, pairing.displayFamily);
  const bodyFont = await ensureCanvasFont(pairing.bodyWeight, 20, pairing.bodyFamily);

  // 1. Background photo
  ctx.drawImage(img, 0, 0, size, size);

  // 2. Brand header band (top) — full width treatment
  const hasBrandIdentity =
    Boolean(brand.logoDataUrl) || Boolean(brand.brandName && brand.brandName.trim());
  if (hasBrandIdentity) {
    let logoImg: HTMLImageElement | null = null;
    if (brand.logoDataUrl) {
      try {
        logoImg = await loadImage(brand.logoDataUrl);
      } catch {
        logoImg = null;
      }
    }
    drawBrandHeader(ctx, size, brand, logoImg);
  }

  // 3. Bottom legibility gradient
  const gradient = ctx.createLinearGradient(0, size * 0.45, 0, size);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(0.55, "rgba(0,0,0,0.55)");
  gradient.addColorStop(1, "rgba(0,0,0,0.92)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, size * 0.45, size, size * 0.55);

  // 4. Small primary accent above the headline
  ctx.fillStyle = brand.primaryColor || "#6366f1";
  ctx.fillRect(72, size * 0.6, 48, 4);

  // 5. Headline in the brand display font
  ctx.fillStyle = "#ffffff";
  ctx.font = headlineFont;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const maxWidth = size - 144;
  const lines = wrapText(ctx, headline, maxWidth);
  const lineHeight = 72;
  const startY = size * 0.6 + 36;
  lines.slice(0, 4).forEach((line, i) => {
    ctx.fillText(line, 72, startY + i * lineHeight);
  });

  // 6. Body-font watermark bottom-right — only when there's no header band
  //    (avoids duplicating the brand name when it's already in the band)
  if (!hasBrandIdentity && brand.brandName) {
    ctx.font = bodyFont;
    ctx.textAlign = "right";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.fillText(brand.brandName.toUpperCase(), size - 72, size - 40);
  }

  return canvas.toDataURL("image/jpeg", 0.88);
}

/* ------------------------------ batch runner ------------------------------ */

/**
 * Generate all posts in parallel.
 * Captures ONE brand snapshot at start — all posts in this batch share it.
 * Both copy and image server functions receive only text/color/font fields;
 * the logo stays client-side and is applied by composeAdImage.
 */
export async function generateDailyPostsAI(
  business: BusinessProfile,
  brand: BrandKit = DEFAULT_BRAND,
  onProgress?: (p: GenerationProgress) => void,
  count = 3,
  initialStatus: GeneratedPost["status"] = "scheduled",
): Promise<GeneratedPost[]> {
  const snapshot: BrandKit = { ...brand };

  const slots = SLOTS.slice(0, count);
  const total = slots.length;

  onProgress?.({ stage: "copy", completed: 0, total });
  let copyDone = 0;
  const copies = await Promise.all(
    slots.map(async (slot, i) => {
      const channel = CHANNELS[i % CHANNELS.length]!;
      const result = await generateAdCopy({
        data: {
          business,
          slot: { time: slot.time, goal: slot.goal, channel, focus: slot.focus },
          brand: {
            brandName: snapshot.brandName,
            primaryColor: snapshot.primaryColor,
            secondaryColor: snapshot.secondaryColor,
            fontPairing: snapshot.fontPairing,
          },
        },
      });
      copyDone++;
      onProgress?.({ stage: "copy", completed: copyDone, total });
      return result;
    }),
  );

  onProgress?.({ stage: "image", completed: 0, total });
  let imgDone = 0;
  const images = await Promise.all(
    copies.map(async (c) => {
      const result = await generateAdImage({
        data: {
          prompt: c.imagePrompt,
          business,
          brand: {
            brandName: snapshot.brandName,
            primaryColor: snapshot.primaryColor,
            secondaryColor: snapshot.secondaryColor,
            fontPairing: snapshot.fontPairing,
          },
        },
      });
      imgDone++;
      onProgress?.({ stage: "image", completed: imgDone, total });
      return result;
    }),
  );

  onProgress?.({ stage: "compose", completed: 0, total });
  let composeDone = 0;
  const finals = await Promise.all(
    images.map(async (img, i) => {
      let out = img.dataUrl;
      try {
        out = await composeAdImage(img.dataUrl, copies[i]!.title, snapshot);
      } catch {
        out = img.dataUrl;
      }
      composeDone++;
      onProgress?.({ stage: "compose", completed: composeDone, total });
      return out;
    }),
  );

  const now = Date.now();
  const posts: GeneratedPost[] = slots.map((slot, i) => ({
    id: `p_${now}_${i}`,
    image: finals[i]!,
    bgImage: images[i]!.dataUrl,
    title: copies[i]!.title,
    goal: slot.goal,
    time: slot.time,
    channel: CHANNELS[i % CHANNELS.length]!,
    status: initialStatus,
    createdAt: now + i,
    brandSnapshot: snapshot,
  }));

  onProgress?.({ stage: "done", completed: total, total });
  return posts;
}
