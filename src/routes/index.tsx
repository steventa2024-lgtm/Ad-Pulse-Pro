import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Check, Facebook, Instagram, Music2 } from "lucide-react";
import { capabilities, features, workflowSteps, channels as channelData } from "@/lib/mock-data";
import { Reveal } from "@/components/Reveal";
import { HeroCarousel } from "@/components/HeroCarousel";
import { InteractiveDemo } from "@/components/InteractiveDemo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ad Pilot Pro — Generate a week of social ads from your business brief" },
      {
        name: "description",
        content:
          "Ad Pilot Pro turns your business details into on-brand ad copy and visuals — ready to review, edit, and prepare for your channels.",
      },
      { property: "og:title", content: "Ad Pilot Pro — Ads on Autopilot for Small Business" },
      {
        property: "og:description",
        content:
          "Enter your business brief once. Generate three tailored ad headlines and flyers per day.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground antialiased">
      <Header />
      <Hero />
      <WorkflowStory />
      <ProductShowcase />
      <ChannelPrep />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-primary font-display text-sm font-extrabold text-primary-foreground shadow-lg shadow-primary/30">
            A
          </span>
          <span className="font-display text-[15px] font-bold tracking-tight">Ad Pilot Pro</span>
        </Link>
        <Link
          to="/onboarding"
          className="inline-flex h-9 items-center rounded-xl bg-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-primary/40"
        >
          Start free
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-20%] size-[720px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute right-[-10%] top-[30%] size-[420px] rounded-full bg-accent/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:py-24 lg:grid-cols-12 lg:gap-12">
        <Reveal className="lg:col-span-6 lg:pt-10" y={28}>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            <Sparkles className="size-3" /> AI ads for small business
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Turn your business brief into a week of{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ready-to-post ads.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-lg">
            Enter your niche, audience, and offer. Ad Pilot Pro writes the copy and renders a unique
            flyer for every slot — so you can review, edit, and prepare your content in minutes.
          </p>
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Link
              to="/onboarding"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-primary/50"
            >
              Start free <ArrowRight className="size-4" />
            </Link>
            <span className="text-[13px] text-muted-foreground">
              No card required · runs in your browser
            </span>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-[12.5px] text-muted-foreground">
            {["On-brand copy", "Unique visuals", "Edit before you post"].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 text-success" /> {t}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="lg:col-span-6" delay={0.1} y={32}>
          <HeroCarousel />
        </Reveal>
      </div>
    </section>
  );
}

function WorkflowStory() {
  return (
    <Reveal as="section" className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
      <div className="max-w-2xl">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
          How it works
        </span>
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          From brief to finished flyer in three steps.
        </h2>
        <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">
          No design tools, no copywriting block. Just answer a few questions and let the app do the
          first draft.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {workflowSteps.map((step, i) => (
          <Reveal key={step.n} delay={i * 0.08} y={20}>
            <div className="group relative h-full overflow-hidden rounded-2xl border border-white/8 bg-white/[0.025] p-6 backdrop-blur-xl transition-colors hover:border-primary/25">
              <div className="flex items-center gap-3">
                <span className="font-display text-2xl font-extrabold text-primary/70">
                  {step.n}
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold tracking-tight">{step.title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Reveal>
  );
}

function ProductShowcase() {
  return (
    <Reveal as="section" className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
      <div className="grid gap-10 rounded-3xl border border-white/8 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 backdrop-blur-xl sm:p-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4 lg:pt-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            Inside the app
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            See every slot. Review every word.
          </h2>
          <p className="mt-4 text-[14.5px] leading-relaxed text-muted-foreground">
            The dashboard shows your three daily slots at a glance — morning engagement, midday
            conversion, evening social proof — each with its own headline and flyer.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Select a slot to preview it larger.",
              "Click Generate to watch a sample transition.",
              "Real generation and editing happen in the app.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[13.5px] text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-success" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-8">
          <InteractiveDemo />
        </div>
      </div>
    </Reveal>
  );
}

const channelIcons = [Facebook, Instagram, Music2];

function ChannelPrep() {
  return (
    <Reveal as="section" className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
      <div className="mb-10 max-w-2xl">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
          Channels
        </span>
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Prepare content for the platforms you already use.
        </h2>
        <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">
          Link your handles today. Direct publishing is on the roadmap — for now, drafts stay local
          so you can copy them into your scheduler of choice.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {channelData.map((channel, i) => {
          const Icon = channelIcons[i]!;
          return (
            <Reveal key={channel.id} delay={i * 0.06} y={18}>
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.025] p-5 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <div className="text-[14px] font-semibold">{channel.name}</div>
                    <div className="text-[11.5px] text-muted-foreground">{channel.handle}</div>
                  </div>
                </div>
                <span className="rounded-full border border-warning/25 bg-warning/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-warning">
                  Coming soon
                </span>
              </div>
            </Reveal>
          );
        })}
      </div>

      <div className="mt-12 grid gap-3 sm:grid-cols-3">
        {capabilities.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-center backdrop-blur-xl"
          >
            <div className="font-display text-2xl font-extrabold text-primary">{c.value}</div>
            <div className="mt-1 text-[11.5px] text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-3 sm:grid-cols-2">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.05} y={18}>
            <div className="h-full rounded-2xl border border-white/8 bg-white/[0.025] p-5 backdrop-blur-xl transition-colors hover:border-primary/25">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[15px] font-semibold">{f.title}</h3>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ${
                    f.tag === "Ready"
                      ? "border-success/25 bg-success/10 text-success"
                      : "border-warning/25 bg-warning/10 text-warning"
                  }`}
                >
                  {f.tag}
                </span>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Reveal>
  );
}

function FinalCTA() {
  return (
    <Reveal as="section" className="mx-auto max-w-6xl px-5 pb-24 pt-8">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-primary/15 via-card/60 to-accent/10 p-10 text-center backdrop-blur-xl sm:p-16">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" />
        </div>
        <div className="relative">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Draft your first campaign in under two minutes.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[14.5px] text-muted-foreground">
            Answer five quick questions about your business. We&apos;ll handle the first draft.
          </p>
          <Link
            to="/onboarding"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-primary/50"
          >
            Start free <ArrowRight className="size-4" />
          </Link>
          <p className="mt-4 text-[11.5px] text-muted-foreground">
            No account required. Everything runs locally until you connect a channel.
          </p>
        </div>
      </div>
    </Reveal>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-md bg-primary font-display text-[10px] font-extrabold text-primary-foreground">
            A
          </span>
          <span className="font-display text-[13px] font-bold">Ad Pilot Pro</span>
        </div>
        <p className="text-[12px] text-muted-foreground">
          Generate, review, and prepare ads in one place.
        </p>
      </div>
    </footer>
  );
}
