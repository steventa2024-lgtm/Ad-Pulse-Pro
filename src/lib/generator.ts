import type { BusinessProfile, ChannelId, GeneratedPost } from "./store";
import { generateAdCopy, generateAdImage } from "./ai.functions";

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

export async function composeAdImage(
  backgroundDataUrl: string,
  headline: string,
  accent = "#6366f1",
): Promise<string> {
  const img = await loadImage(backgroundDataUrl);
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return backgroundDataUrl;

  ctx.drawImage(img, 0, 0, size, size);

  const gradient = ctx.createLinearGradient(0, size * 0.45, 0, size);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(0.55, "rgba(0,0,0,0.55)");
  gradient.addColorStop(1, "rgba(0,0,0,0.92)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, size * 0.45, size, size * 0.55);

  ctx.fillStyle = accent;
  ctx.fillRect(72, size * 0.6, 64, 6);

  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "600 22px Inter, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("SPONSORED", 72, size * 0.6 - 16);

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 62px Inter, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  const maxWidth = size - 144;
  const lines = wrapText(ctx, headline, maxWidth);
  const lineHeight = 72;
  const startY = size * 0.6 + 40;
  lines.slice(0, 4).forEach((line, i) => {
    ctx.fillText(line, 72, startY + i * lineHeight);
  });

  return canvas.toDataURL("image/jpeg", 0.88);
}

export async function generateDailyPostsAI(
  business: BusinessProfile,
  onProgress?: (p: GenerationProgress) => void,
  count = 3,
  initialStatus: GeneratedPost["status"] = "scheduled",
): Promise<GeneratedPost[]> {
  const slots = SLOTS.slice(0, count);
  const total = slots.length;

  onProgress?.({ stage: "copy", completed: 0, total });
  let copyDone = 0;
  const copies = await Promise.all(
    slots.map(async (slot, i) => {
      const channel = CHANNELS[i % CHANNELS.length]!;
      const result = await generateAdCopy({
        data: { business, slot: { time: slot.time, goal: slot.goal, channel, focus: slot.focus } },
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
      const result = await generateAdImage({ data: { prompt: c.imagePrompt, business } });
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
        out = await composeAdImage(img.dataUrl, copies[i]!.title, "#6366f1");
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
  }));

  onProgress?.({ stage: "done", completed: total, total });
  return posts;
}
