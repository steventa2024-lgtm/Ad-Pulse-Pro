import type { BusinessProfile, ChannelId, GeneratedPost } from "./store";
import { generateAdCopy, generateAdImage } from "./ai.functions";

const CHANNELS: ChannelId[] = ["instagram", "facebook", "tiktok"];
const SLOTS = [
  { time: "9:00 AM", goal: "Engagement" },
  { time: "1:30 PM", goal: "Conversion" },
  { time: "6:00 PM", goal: "Trust" },
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length]!;
}

export interface GenerationProgress {
  index: number;
  total: number;
  stage: "copy" | "image" | "compose" | "done";
  title?: string;
}

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

/** Composite the AI background with an ad headline overlay. */
async function composeAdImage(backgroundDataUrl: string, headline: string, accent: string): Promise<string> {
  const img = await loadImage(backgroundDataUrl);
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return backgroundDataUrl;

  ctx.drawImage(img, 0, 0, size, size);

  // Bottom gradient for legibility
  const gradient = ctx.createLinearGradient(0, size * 0.45, 0, size);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(0.55, "rgba(0,0,0,0.55)");
  gradient.addColorStop(1, "rgba(0,0,0,0.92)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, size * 0.45, size, size * 0.55);

  // Accent bar above headline
  ctx.fillStyle = accent;
  ctx.fillRect(72, size * 0.60, 64, 6);

  // Small "SPONSORED" kicker
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "600 22px Inter, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("SPONSORED", 72, size * 0.60 - 16);

  // Headline
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 62px Inter, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  const maxWidth = size - 144;
  const lines = wrapText(ctx, headline, maxWidth);
  const lineHeight = 72;
  const startY = size * 0.60 + 40;
  lines.slice(0, 4).forEach((line, i) => {
    ctx.fillText(line, 72, startY + i * lineHeight);
  });

  return canvas.toDataURL("image/jpeg", 0.88);
}

export async function generateDailyPostsAI(
  business: BusinessProfile,
  onProgress?: (p: GenerationProgress) => void,
  count = 3,
): Promise<GeneratedPost[]> {
  const posts: GeneratedPost[] = [];
  const previousTitles: string[] = [];

  for (let i = 0; i < count; i++) {
    const slot = pick(SLOTS, i);
    const channel = pick(CHANNELS, i);

    onProgress?.({ index: i, total: count, stage: "copy" });

    const copy = await generateAdCopy({
      data: {
        business,
        slot: { time: slot.time, goal: slot.goal, channel },
        previousTitles,
      },
    });

    onProgress?.({ index: i, total: count, stage: "image", title: copy.title });

    const image = await generateAdImage({ data: { prompt: copy.imagePrompt } });

    onProgress?.({ index: i, total: count, stage: "compose", title: copy.title });

    // Overlay headline onto the AI background → looks like a real ad
    const accent = "#6366f1"; // indigo, matches your primary
    let finalImage = image.dataUrl;
    try {
      finalImage = await composeAdImage(image.dataUrl, copy.title, accent);
    } catch {
      // If canvas fails (e.g. SSR context), fall back to raw AI image
      finalImage = image.dataUrl;
    }

    posts.push({
      id: `p_${Date.now()}_${i}`,
      image: finalImage,
      title: copy.title,
      goal: slot.goal,
      time: slot.time,
      channel,
      status: "scheduled",
      createdAt: Date.now() + i,
    });

    previousTitles.push(copy.title);
    onProgress?.({ index: i, total: count, stage: "done", title: copy.title });
  }

  return posts;
}
