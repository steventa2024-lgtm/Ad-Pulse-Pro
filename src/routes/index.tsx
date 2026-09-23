import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Zap, PenLine, Share2, PauseCircle } from "lucide-react";
import { features, stats, flyers } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pulseboard — Automate Your Ads on Autopilot" },
      {
        name: "description",
        content:
          "Pulseboard generates and posts three on-brand ads a day across Facebook, Instagram, and TikTok. Start your free trial.",
      },
      { property: "og:title", content: "Pulseboard — Automate Your Ads on Autopilot" },
      {
        property: "og:description",
        content:
          "Three on-brand posts a day, planned and scheduled across every channel — while you focus on your business.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const featureIcons = [Zap, PenLine, Share2, PauseCircle];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-primary font-display text-sm font-extrabold text-primary-foreground">
              P
            </span>
            <span className="font-display text-[15px] font-bold tracking-tight">Pulseboard</span>
          </div>
          <Link
            to="/onboarding"
            className="inline-flex h-9 items-center rounded-xl bg-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90"
          >
            Start Free Trial
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5">
        <section className="reveal py-16 text-center sm:py-24">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">
            <span className="size-1.5 rounded-full bg-success" /> Automation live for 2,400+ businesses
          </span>
          <h1 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Automate Your Ads on <span className="text-primary">Autopilot</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-lg">
            Three on-brand posts a day, planned and scheduled across every channel — while you focus on
            running your business.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/onboarding"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90"
            >
              Start Free Trial <ArrowRight className="size-4" />
            </Link>
            <span className="text-[13px] text-muted-foreground">No card required</span>
          </div>
        </section>

        <section className="reveal pb-16">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <img
              src={flyers[0]!.image}
              alt={flyers[0]!.alt}
              width={1024}
              height={640}
              className="aspect-[16/7] w-full object-cover"
            />
            <div className="flex items-center justify-between p-4">
              <p className="text-[13px] font-semibold">Today's first post, generated at 6:12 AM</p>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success">
                <span className="size-1.5 rounded-full bg-success" /> Scheduled
              </span>
            </div>
          </div>
        </section>

        <section className="reveal pb-16">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Three posts a day, handled end to end
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {features.map((feature, i) => {
              const Icon = featureIcons[i]!;
              return (
                <div key={feature.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <h3 className="mt-3 text-[15px] font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="reveal grid grid-cols-3 gap-2 pb-16 sm:gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-4 text-center sm:text-left">
              <div className="font-display text-xl font-extrabold text-primary sm:text-2xl">{stat.value}</div>
              <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </section>

        <section className="reveal pb-20 text-center">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm sm:p-12">
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Your next 21 posts are already written
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14px] text-muted-foreground">
              Set up in two minutes. Connect your channels once, and Pulseboard keeps your feed alive.
            </p>
            <Link
              to="/onboarding"
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90"
            >
              Start Free Trial <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-5 py-6 sm:flex-row">
          <span className="font-display text-[13px] font-bold">Pulseboard</span>
          <p className="text-[12px] text-muted-foreground">Three posts a day, every day. On autopilot.</p>
        </div>
      </footer>
    </div>
  );
}
