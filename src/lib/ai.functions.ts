import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BusinessSchema = z.object({
  name: z.string(),
  niche: z.string(),
  audience: z.string(),
  offer: z.string(),
  tone: z.string(),
});

const BrandSchema = z.object({
  brandName: z.string(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  fontPairing: z.string(),
});

const SlotSchema = z.object({
  time: z.string(),
  goal: z.string(),
  channel: z.enum(["facebook", "instagram", "tiktok"]),
  focus: z.string(),
});

const GenerateCopyInput = z.object({
  business: BusinessSchema,
  slot: SlotSchema,
  brand: BrandSchema.optional(),
});

export const generateAdCopy = createServerFn({ method: "POST" })
  .validator((input: unknown) => GenerateCopyInput.parse(input))
  .handler(async ({ data }) => {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const { business, slot, brand } = data;

    const brandBlock = brand?.brandName
      ? `\nBrand display name (use as the brand reference; do not repeat the business name if identical): ${brand.brandName}`
      : "";

    const prompt = `You are an elite direct-response social media ad copywriter.

Business: ${business.name}
Niche: ${business.niche || "general"}
Target audience: ${business.audience || "general consumers"}
Current offer: ${business.offer || "no specific offer"}
Brand tone: ${business.tone || "Friendly"}${brandBlock}

Post slot: ${slot.channel} at ${slot.time}
Goal: ${slot.goal}
Angle hint: ${slot.focus}

HARD RULES:
- Use SPECIFIC niche language. Reference the actual product/service. NEVER generic filler.
- Every sentence must be specific to THIS business, THIS niche, THIS audience.
- Match the goal exactly:
  - Engagement → ask a targeted, niche-specific question. No hard sell.
  - Conversion → lead with the offer + deadline + a direct CTA.
  - Trust → social proof, review quote, or before/after proof.
- Do NOT mention hex colors, font names, or design terms in the headline.

Return STRICT JSON only:
{
  "title": "punchy ad headline, 1-2 sentences, under 110 chars, ends with a clear CTA",
  "imagePrompt": "detailed visual description for the ad background. MUST visibly relate to ${business.niche}. Describe specific subject/scene/objects, color palette, mood, camera angle, lighting. NO TEXT. Under 320 chars."
}`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 1.0,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as { title?: string; imagePrompt?: string };
    return {
      title: parsed.title ?? "Untitled ad",
      imagePrompt:
        parsed.imagePrompt ??
        `vibrant, modern, eye-catching scene related to ${business.niche || "the product"}`,
    };
  });

const GenerateImageInput = z.object({
  prompt: z.string(),
  business: BusinessSchema,
  brand: BrandSchema.optional(),
});

export const generateAdImage = createServerFn({ method: "POST" })
  .validator((input: unknown) => GenerateImageInput.parse(input))
  .handler(async ({ data }) => {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const { business, prompt, brand } = data;

    const brandPalette = brand?.primaryColor
      ? `\nBrand palette (art direction only — do not replace the subject with abstract color fields):\n  Primary mood color: ${brand.primaryColor}\n  Secondary mood color: ${brand.secondaryColor}\nUse a lighting and color mood compatible with these tones.`
      : "";

    const fullPrompt = `Advertising flyer background image.

Context: This ad is for a ${business.niche || "small"} business called ${business.name}, targeting ${business.audience || "local customers"}. Current offer: ${business.offer || "none"}.
${brandPalette}

Visual brief: ${prompt}

Requirements: no text, no watermark, no letters, high quality, social-media-ready, eye-catching composition, subject visibly related to the niche. Keep the subject clearly recognizable.`;

    const response = await client.images.generate({
      model: "gpt-image-1",
      prompt: fullPrompt,
      size: "1024x1024",
      quality: "high",
      n: 1,
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) throw new Error("No image returned from OpenAI");
    return { dataUrl: `data:image/png;base64,${b64}` };
  });
