import flyerGlow from "@/assets/flyer-glow.jpg";
import flyerSale from "@/assets/flyer-sale.jpg";
import flyerReview from "@/assets/flyer-review.jpg";

export interface Flyer {
  id: string;
  image: string;
  alt: string;
  title: string;
  goal: string;
  time: string;
  channel: string;
}

export interface Channel {
  id: string;
  name: string;
  handle: string;
}

export const flyers: Flyer[] = [
  {
    id: "f1",
    image: flyerGlow,
    alt: "Example skincare ad flyer with clean typography",
    title: "Meet your morning glow: 3 steps to dewy skin",
    goal: "Engagement",
    time: "9:00 AM",
    channel: "Instagram",
  },
  {
    id: "f2",
    image: flyerSale,
    alt: "Example promotional ad flyer announcing a weekend flash sale",
    title: "Flash sale: 20% off weekend essentials — ends Sunday",
    goal: "Conversion",
    time: "1:30 PM",
    channel: "Facebook",
  },
  {
    id: "f3",
    image: flyerReview,
    alt: "Example testimonial ad flyer showing a five-star review",
    title: '"Best purchase this year" — why 4.9-star reviews keep rolling in',
    goal: "Trust",
    time: "6:00 PM",
    channel: "TikTok",
  },
];

export const channels: Channel[] = [
  { id: "facebook", name: "Facebook", handle: "facebook.com/yourbusiness" },
  { id: "instagram", name: "Instagram", handle: "@yourbusiness" },
  { id: "tiktok", name: "TikTok", handle: "@yourbusiness" },
];

/** Honest capability strip — replaces the old fake performance stats. */
export const capabilities = [
  { value: "3", label: "ad slots per day" },
  { value: "AI", label: "copy + visuals" },
  { value: "Edit", label: "before you post" },
];

export interface FeatureItem {
  title: string;
  description: string;
  tag: "Ready" | "Coming soon";
}

export const features: FeatureItem[] = [
  {
    title: "Copy written for your business",
    description:
      "Tell us your niche, audience, and current offer. Every headline is generated fresh and tuned to your brand voice.",
    tag: "Ready",
  },
  {
    title: "A unique visual for every post",
    description:
      "AI-rendered flyer backgrounds composited with your headline, so each post looks custom — not templated.",
    tag: "Ready",
  },
  {
    title: "Preview and edit before you share",
    description:
      "Click any headline to tweak it. The flyer re-renders instantly with your changes.",
    tag: "Ready",
  },
  {
    title: "Direct publishing to your channels",
    description:
      "Facebook, Instagram, and TikTok connections are planned. Today, generate and review drafts locally.",
    tag: "Coming soon",
  },
];

export interface WorkflowStep {
  n: string;
  title: string;
  body: string;
}

export const workflowSteps: WorkflowStep[] = [
  {
    n: "01",
    title: "Fill your brief",
    body: "Enter your business name, niche, audience, and current offer. Takes about a minute.",
  },
  {
    n: "02",
    title: "Generate the day's ads",
    body: "One click produces three headlines and three visual flyers — each with its own angle.",
  },
  {
    n: "03",
    title: "Review and prepare",
    body: "Preview each flyer, edit headlines, and line up your week of content.",
  },
];

/* ------------------------- Landing hero showcase ------------------------- */
/* Curated example ads — illustrative only, not real customer results.       */

export interface ExampleAd {
  id: string;
  brand: string;
  industry: string;
  headline: string;
  subline: string;
  channel: "Instagram" | "Facebook" | "TikTok";
  goal: "Engagement" | "Conversion" | "Trust";
  time: string;
  bg: string; // tailwind classes for the card background
  accentText: string; // tailwind class for the kicker/brand
  headlineText: string; // tailwind class for the headline
  image?: string;
}

export const exampleAds: ExampleAd[] = [
  {
    id: "ex1",
    brand: "Aura Skincare",
    industry: "Skincare",
    headline: "Glow up in 7 days — or we refund you.",
    subline: "Clean ingredients. Visible results.",
    channel: "Instagram",
    goal: "Conversion",
    time: "9:00 AM",
    bg: "bg-gradient-to-br from-rose-200 via-rose-100 to-amber-50",
    accentText: "text-rose-700/80",
    headlineText: "text-rose-950",
  },
  {
    id: "ex2",
    brand: "Roast & Co.",
    industry: "Coffee",
    headline: "Your morning, upgraded.",
    subline: "Single-origin beans, roasted this week.",
    channel: "Instagram",
    goal: "Engagement",
    time: "8:00 AM",
    bg: "bg-gradient-to-br from-amber-900 via-amber-800 to-orange-700",
    accentText: "text-amber-200/90",
    headlineText: "text-amber-50",
  },
  {
    id: "ex3",
    brand: "PulseFit",
    industry: "Fitness",
    headline: "First month free. No excuses.",
    subline: "Coaching that actually sticks.",
    channel: "TikTok",
    goal: "Conversion",
    time: "6:00 AM",
    bg: "bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-900",
    accentText: "text-cyan-300/90",
    headlineText: "text-white",
  },
  {
    id: "ex4",
    brand: "Keystone Realty",
    industry: "Real estate",
    headline: "Open house this Sunday, 2–4 PM.",
    subline: "Historic charm. Modern bones.",
    channel: "Facebook",
    goal: "Engagement",
    time: "10:00 AM",
    bg: "bg-gradient-to-br from-slate-900 via-slate-800 to-yellow-900/60",
    accentText: "text-yellow-300/90",
    headlineText: "text-yellow-50",
  },
  {
    id: "ex5",
    brand: "Sunny's Kitchen",
    industry: "Restaurant",
    headline: "Half-price Tuesdays. Yes, really.",
    subline: "Family recipes. Local ingredients.",
    channel: "Facebook",
    goal: "Conversion",
    time: "11:00 AM",
    bg: "bg-gradient-to-br from-red-800 via-red-700 to-amber-600",
    accentText: "text-amber-200/90",
    headlineText: "text-amber-50",
  },
  {
    id: "ex6",
    brand: "Flow",
    industry: "SaaS",
    headline: "Try it free for 14 days.",
    subline: "No card. No sales call.",
    channel: "Instagram",
    goal: "Conversion",
    time: "2:00 PM",
    bg: "bg-gradient-to-br from-indigo-950 via-indigo-800 to-cyan-700",
    accentText: "text-cyan-300/90",
    headlineText: "text-white",
  },
  {
    id: "ex7",
    brand: "FORM",
    industry: "Fashion",
    headline: "New arrivals this week.",
    subline: "Built to last. Designed to be worn.",
    channel: "Instagram",
    goal: "Engagement",
    time: "5:00 PM",
    bg: "bg-gradient-to-br from-neutral-100 via-neutral-200 to-neutral-300",
    accentText: "text-neutral-600",
    headlineText: "text-neutral-950",
  },
  {
    id: "ex8",
    brand: "PawPost",
    industry: "Pets",
    headline: "Because they deserve the best.",
    subline: "Vet-approved. Dog-obssessed.",
    channel: "TikTok",
    goal: "Trust",
    time: "7:00 PM",
    bg: "bg-gradient-to-br from-emerald-300 via-teal-300 to-lime-200",
    accentText: "text-emerald-900/80",
    headlineText: "text-emerald-950",
  },
  {
    id: "ex9",
    brand: "GreenEdge",
    industry: "Landscaping",
    headline: "The lawn your neighbors will envy.",
    subline: "Booking spring cleanups now.",
    channel: "Facebook",
    goal: "Conversion",
    time: "9:30 AM",
    bg: "bg-gradient-to-br from-green-900 via-emerald-800 to-stone-800",
    accentText: "text-lime-300/90",
    headlineText: "text-lime-50",
  },
  {
    id: "ex10",
    brand: "Lightwork",
    industry: "Photography",
    headline: "Book your session before fall.",
    subline: "Natural light. Real moments.",
    channel: "Instagram",
    goal: "Trust",
    time: "4:00 PM",
    bg: "bg-gradient-to-br from-fuchsia-900 via-purple-900 to-pink-800",
    accentText: "text-pink-200/90",
    headlineText: "text-pink-50",
  },
];
