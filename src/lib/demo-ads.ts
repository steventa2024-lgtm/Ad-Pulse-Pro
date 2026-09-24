export type DemoAd = {
  id: string;
  niche: string;
  brand: string;
  headline: string;
  subline: string;
  cta: string;
  image: string;
  imageAlt: string;
  channel: "instagram" | "facebook" | "tiktok";
  goal: "Engagement" | "Conversion" | "Trust";
  time: string;
  accent: string;
};

// Fictional example creatives. Images live in public/demo-ads/.
// Both the homepage slideshow and the mini dashboard import this same array.
export const demoAds: readonly DemoAd[] = [
  {
    id: "landscaping",
    niche: "Landscaping",
    brand: "GARDENLINE",
    headline: "Make the path part of the destination.",
    subline: "A fresh look at outdoor spaces, one detail at a time.",
    cta: "Explore outdoor ideas",
    image: "/demo-ads/landscaping.png",
    imageAlt: "Paver walkway curving through a planted residential garden",
    channel: "instagram",
    goal: "Engagement",
    time: "9:00 AM",
    accent: "#d2e5aa",
  },
  {
    id: "skincare",
    niche: "Skincare",
    brand: "ATELIER SKIN",
    headline: "A moment just for your skin.",
    subline: "Make space for a gentler morning ritual.",
    cta: "Explore the ritual",
    image: "/demo-ads/skincare.png",
    imageAlt: "Serum bottle on pale stone beside reflected water",
    channel: "instagram",
    goal: "Trust",
    time: "10:30 AM",
    accent: "#f3dbc3",
  },
  {
    id: "coffee",
    niche: "Coffee",
    brand: "DAYBREAK COFFEE",
    headline: "A better morning starts here.",
    subline: "Your coffee break deserves a little more time.",
    cta: "See the menu",
    image: "/demo-ads/coffee.png",
    imageAlt: "Espresso and pastry on a sunlit cafe table",
    channel: "facebook",
    goal: "Engagement",
    time: "8:00 AM",
    accent: "#f5c38c",
  },
  {
    id: "fitness",
    niche: "Fitness",
    brand: "KINETIC STUDIO",
    headline: "Find your next rep.",
    subline: "Make room for movement that feels like yours.",
    cta: "Explore training",
    image: "/demo-ads/fitness.png",
    imageAlt: "Athlete strength training in a real gym",
    channel: "tiktok",
    goal: "Engagement",
    time: "6:00 AM",
    accent: "#d9ef65",
  },
  {
    id: "restaurant",
    niche: "Restaurant",
    brand: "EMBER TABLE",
    headline: "Tonight looks delicious.",
    subline: "Good food is even better together.",
    cta: "View the menu",
    image: "/demo-ads/restaurant.png",
    imageAlt: "Plated pasta on a warmly lit restaurant table",
    channel: "instagram",
    goal: "Conversion",
    time: "5:30 PM",
    accent: "#ffbc88",
  },
  {
    id: "home",
    niche: "Home goods",
    brand: "NORTHLINE HOME",
    headline: "Make room to feel at home.",
    subline: "Thoughtful pieces for the moments that stay.",
    cta: "Explore the collection",
    image: "/demo-ads/home.png",
    imageAlt: "Modern living room with sofa, coffee table and sculptural lighting",
    channel: "facebook",
    goal: "Trust",
    time: "11:00 AM",
    accent: "#e9d6c1",
  },
  {
    id: "pet",
    niche: "Pet care",
    brand: "GOODHOUND",
    headline: "More good days together.",
    subline: "For the companion who makes every day brighter.",
    cta: "Meet the collection",
    image: "/demo-ads/pet.png",
    imageAlt: "Dog running outdoors through a grassy park",
    channel: "tiktok",
    goal: "Engagement",
    time: "4:00 PM",
    accent: "#ffd58b",
  },
  {
    id: "florist",
    niche: "Florist",
    brand: "STEM & STORY",
    headline: "Let the flowers say it.",
    subline: "A beautiful way to mark the moment.",
    cta: "See arrangements",
    image: "/demo-ads/florist.png",
    imageAlt: "Hand-tied bouquet of seasonal flowers in a studio",
    channel: "instagram",
    goal: "Conversion",
    time: "12:00 PM",
    accent: "#f2b9c8",
  },
  {
    id: "barber",
    niche: "Barber",
    brand: "STANDARD STUDIO",
    headline: "Walk out feeling sharper.",
    subline: "Make time for a fresh cut.",
    cta: "Explore the studio",
    image: "/demo-ads/barber.png",
    imageAlt: "Barber cutting a client's hair in a modern shop",
    channel: "facebook",
    goal: "Conversion",
    time: "2:00 PM",
    accent: "#efb489",
  },
  {
    id: "travel",
    niche: "Travel",
    brand: "OPEN ROAD",
    headline: "Find your next open road.",
    subline: "A new view is waiting around the bend.",
    cta: "Explore the journey",
    image: "/demo-ads/travel.png",
    imageAlt: "Coastal highway overlooking the ocean at sunrise",
    channel: "instagram",
    goal: "Engagement",
    time: "7:00 PM",
    accent: "#f8c392",
  },
];

export function miniDashboardWindow(index: number): DemoAd[] {
  return Array.from({ length: 3 }, (_, offset) => demoAds[(index + offset) % demoAds.length]!);
}
