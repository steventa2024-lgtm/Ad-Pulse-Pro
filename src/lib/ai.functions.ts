import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BusinessSchema = z.object({
  name: z.string(),
  niche: z.string(),
  audience: z.string(),
  offer: z.string(),
  tone: z.string(),
});

const SlotSchema = z.object({
  time: z.string(),
  goal: z.string(),
  channel: z.enum(["facebook", "instagram", "tiktok"]),
});

const GenerateCopyInput = z.object({
  business: BusinessSchema,
  slot: SlotSchema,
  previousTitles: z.array(z.string()).default([]),
});

export const generateAdCopy = createServerFn({ method: "POST" })
  .validator((input: unknown) => GenerateCopyInput.parse(input))
  .handler(async ({ data }) => {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const { business, slot, previousTitles } = data;

    const avoidBlock = previousTitles.length
      ? `\nAlready-used headlines for this batch — DO NOT reuse wording, structure, or angle:\n${previousTitles.map((t) => `- ${t}`).join("\n")}\n`
      : "";

    const prompt = `You are an expert social media ad copywriter for small businesses.

Business: ${business.name}
Niche: ${business.niche || "general"}
Target audience: ${business.audience || "general consumers"}
Current offer: ${business.offer || "no specific offer"}
Brand tone: ${business.tone || "Friendly"}

This post is scheduled for ${slot.channel} at ${slot.time}, with the goal of: ${slot.goal}

SLOT ANGLE (must match the goal):
- Engagement → ask a provocative question, teaser, or invite a comment. No hard sell.
- Conversion → lead with a specific offer, deadline, or scarcity. Direct CTA.
- Trust → social proof, review quote, before/after, or authority claim.
${avoidBlock}
Write ONE ad post. Return strict JSON only:
{
  "title": "punchy ad headline, 1-2 sentences max, under 110 chars, ends with a clear CTA",
  "imagePrompt": "vivid visual description for an eye-catching advertising flyer background. Specify style, subject, color palette, mood, composition. NO TEXT in the image. Under 350 chars."
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
      imagePrompt: parsed.imagePrompt ?? "vibrant abstract gradient, modern, eye-catching",
    };
  });

const GenerateImageInput = z.object({ prompt: z.string() });

export const generateAdImage = createServerFn({ method: "POST" })
  .validator((input: unknown) => GenerateImageInput.parse(input))
  .handler(async ({ data }) => {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.images.generate({
      model: "gpt-image-1",
      prompt: `Advertising flyer background image, photorealistic or stylized, no text, no watermark, high quality, social-media-ready, eye-catching composition. ${data.prompt}`,
      size: "1024x1024",
      quality: "high",
      n: 1,
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) throw new Error("No image returned from OpenAI");
    return { dataUrl: `data:image/png;base64,${b64}` };
  });
