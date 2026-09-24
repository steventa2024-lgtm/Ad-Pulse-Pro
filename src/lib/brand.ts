export type FontPairingId = "modern" | "editorial" | "bold" | "minimal";

export interface BrandKit {
  brandName: string;
  logoDataUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  fontPairing: FontPairingId;
  configured: boolean;
}

export const DEFAULT_BRAND: BrandKit = {
  brandName: "",
  logoDataUrl: null,
  primaryColor: "#6366f1",
  secondaryColor: "#0f172a",
  fontPairing: "modern",
  configured: false,
};

export interface FontPairing {
  id: FontPairingId;
  label: string;
  vibe: string;
  displayFamily: string;
  displayWeight: number;
  bodyFamily: string;
  bodyWeight: number;
}

export const FONT_PAIRINGS: FontPairing[] = [
  {
    id: "modern",
    label: "Modern",
    vibe: "clean, current, neutral",
    displayFamily: "Inter",
    displayWeight: 800,
    bodyFamily: "Inter",
    bodyWeight: 500,
  },
  {
    id: "editorial",
    label: "Editorial",
    vibe: "premium, magazine, warm",
    displayFamily: "Playfair Display",
    displayWeight: 800,
    bodyFamily: "Inter",
    bodyWeight: 500,
  },
  {
    id: "bold",
    label: "Bold",
    vibe: "loud, punchy, direct",
    displayFamily: "Archivo Black",
    displayWeight: 400,
    bodyFamily: "Inter",
    bodyWeight: 500,
  },
  {
    id: "minimal",
    label: "Minimal",
    vibe: "quiet, refined, precise",
    displayFamily: "DM Sans",
    displayWeight: 700,
    bodyFamily: "DM Sans",
    bodyWeight: 500,
  },
];

export function getFontPairing(id: FontPairingId): FontPairing {
  return FONT_PAIRINGS.find((p) => p.id === id) ?? FONT_PAIRINGS[0]!;
}

export const SUGGESTED_PALETTES: { label: string; primary: string; secondary: string }[] = [
  { label: "Indigo", primary: "#6366f1", secondary: "#0f172a" },
  { label: "Ember", primary: "#f97316", secondary: "#1c1917" },
  { label: "Forest", primary: "#16a34a", secondary: "#0f1a14" },
  { label: "Rose", primary: "#e11d48", secondary: "#1a0f14" },
  { label: "Ocean", primary: "#0ea5e9", secondary: "#082f49" },
  { label: "Amber", primary: "#eab308", secondary: "#1c1917" },
];

export function isValidHex(v: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(v);
}

export function isHexInProgress(v: string): boolean {
  return /^#?[0-9a-fA-F]{0,6}$/.test(v) && v.length <= 7;
}

/** Returns a canvas-ready font spec, or an Inter fallback if the font can't load. */
export async function ensureCanvasFont(
  weight: number,
  size: number,
  family: string,
): Promise<string> {
  const fallback = `${weight} ${size}px Inter, system-ui, sans-serif`;
  if (typeof document === "undefined" || !("fonts" in document)) return fallback;
  const spec = `${weight} ${size}px "${family}"`;
  try {
    await document.fonts.load(spec);
    return document.fonts.check(spec) ? spec : fallback;
  } catch {
    return fallback;
  }
}

/** Pick black or white text for a given background hex. */
export function contrastText(hex: string): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "#ffffff";
  const n = parseInt(m[1]!, 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.62 ? "#111318" : "#ffffff";
}
