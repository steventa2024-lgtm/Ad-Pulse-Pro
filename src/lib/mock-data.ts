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
    alt: "Skincare product flyer with clean typography on an indigo background",
    title: "Meet your morning glow: 3 steps to dewy skin",
    goal: "Engagement",
    time: "9:00 AM",
    channel: "Instagram",
  },
  {
    id: "f2",
    image: flyerSale,
    alt: "Bold promotional flyer announcing a 20 percent weekend flash sale",
    title: "Flash sale: 20% off weekend essentials — ends Sunday",
    goal: "Conversion",
    time: "1:30 PM",
    channel: "Facebook",
  },
  {
    id: "f3",
    image: flyerReview,
    alt: "Testimonial flyer showing a five-star rating and customer quote",
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

export const stats = [
  { value: "21", label: "posts this week" },
  { value: "14.2k", label: "reach, last 7 days" },
  { value: "3.8%", label: "click-through rate" },
];

export const features = [
  {
    title: "3 posts a day, every day",
    description:
      "Fresh, on-brand flyers and copy are generated daily from your business profile — morning, midday, and evening.",
  },
  {
    title: "Written in your voice",
    description:
      "Tell us your niche, audience, and offer once. Every post is tuned to your brand style automatically.",
  },
  {
    title: "Every channel at once",
    description:
      "Facebook, Instagram, and TikTok stay in sync. Connect once and the schedule fills itself.",
  },
  {
    title: "Pause anytime",
    description:
      "One toggle pauses the whole machine. Resume when you're ready and the calendar picks back up.",
  },
];
