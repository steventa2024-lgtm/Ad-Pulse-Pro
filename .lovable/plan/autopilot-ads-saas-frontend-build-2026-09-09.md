# Autopilot Ads SaaS — Frontend Build

A premium marketing SaaS with four screens, built frontend-only with React local state and mock data. Visual direction: **Editorial Ink**, rebased on **deep near-black surfaces** — Sora display + Inter body fonts, indigo brand accent, green success accent, rounded corners, soft shadows, generous whitespace.

## Visual system

- Dark theme: near-black backgrounds (deep slate), light text, indigo (#4f46e5-family) primary, green success accent
- Fonts: Sora (headings), Inter (body) loaded via `<link>` in root route
- Design tokens in `src/styles.css` (oklch, `@theme inline`); semantic classes only in components
- Soft shadows, rounded-2xl cards, subtle fade-up reveals, responsive (mobile-first, desktop grids)

## Screens & routes

1. **Landing `/`** — sticky header with logo + CTA; hero ("Automate Your Ads on Autopilot", subtext, Start Free Trial CTA); 3-posts-a-day feature grid; stats strip; footer. Unique `head()` metadata.
2. **Onboarding `/onboarding`** — centered card with 5 steps (Business Name, Niche, Target Audience, Current Offer, Brand Style), progress indicator ("Step X of 5"), back/next navigation, mock state; completing goes to `/connect`.
3. **Connect `/connect`** — Connect Facebook / Instagram / TikTok buttons; clicking flips to a green "Connected" badge (mock state); continue to `/dashboard` once at least one is connected.
4. **Dashboard `/dashboard`** — header with automation pause/resume toggle; grid of mock generated flyers (generated images); "Today's schedule" of 3 posts with times/channels; stats cards. Mock data module drives all of it.

## Structure

```text
src/
  styles.css                    # dark Editorial Ink tokens
  lib/mock-data.ts              # flyers, schedule, channels, stats
  routes/
    __root.tsx                  # fonts, Toaster, updated metadata
    index.tsx                   # landing
    onboarding.tsx              # 5-step form
    connect.tsx                 # channel connections
    dashboard.tsx               # flyer grid + schedule + toggle
```

## Assets

- Generate 3 flyer images (skincare flyer, flash-sale flyer, testimonial flyer) per the direction's image prompts, dark-compatible, saved to `src/assets/`.

## Technical notes

- TanStack Start routes with per-route `head()` (title/description/og), `Link`-based navigation
- All state is React local state — no backend, no database
- Verify: dev server renders all four routes, flow works landing → onboarding → connect → dashboard
