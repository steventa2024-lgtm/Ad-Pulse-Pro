import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { flyers, stats } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Pulseboard" },
      {
        name: "description",
        content: "See your generated ad flyers, today's posting schedule, and control your automation.",
      },
      { property: "og:title", content: "Dashboard — Pulseboard" },
      {
        property: "og:description",
        content: "See your generated ad flyers, today's posting schedule, and control your automation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [running, setRunning] = useState(true);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-primary font-display text-sm font-extrabold text-primary-foreground">
              P
            </span>
            <span className="font-display text-[15px] font-bold tracking-tight">Pulseboard</span>
          </Link>
          <span className="text-[11px] font-semibold text-muted-foreground">Dashboard</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        <section className="reveal">
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                  running
                    ? "border-success/20 bg-success/10 text-success"
                    : "border-border bg-secondary text-muted-foreground"
                }`}
              >
                <span className={`size-1.5 rounded-full ${running ? "bg-success" : "bg-muted-foreground"}`} />
                {running ? "Automation live" : "Automation paused"}
              </span>
              <h1 className="mt-3 font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                Your ads are on <span className="text-primary">autopilot.</span>
              </h1>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {running
                  ? "Auto-generating 3 posts per day across your connected channels."
                  : "Nothing will be posted while paused. Flip the switch to resume."}
              </p>
            </div>
            <button
              onClick={() => setRunning((r) => !r)}
              role="switch"
              aria-checked={running}
              aria-label="Toggle automation"
              className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors ${
                running ? "bg-success" : "bg-secondary"
              }`}
            >
              <span
                className={`absolute size-7 rounded-full bg-background shadow transition-all ${
                  running ? "right-0.5" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </section>

        <section className="reveal mt-6 grid grid-cols-3 gap-2 sm:gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
              <div className="font-display text-xl font-extrabold text-primary sm:text-2xl">{stat.value}</div>
              <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </section>

        <section className="reveal mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold tracking-tight">Today's flyers</h2>
            <span className="text-[11px] font-medium text-muted-foreground">3 scheduled</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {flyers.map((flyer) => (
              <article
                key={flyer.id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <img
                  src={flyer.image}
                  alt={flyer.alt}
                  width={1024}
                  height={640}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-primary">{flyer.time}</span>
                    <span className="text-[11px] text-muted-foreground">
                      · {flyer.channel} · {flyer.goal}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[13px] font-semibold leading-snug">{flyer.title}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success">
                      <span className="size-1.5 rounded-full bg-success" />
                      {running ? "Scheduled" : "Held"}
                    </span>
                    <button className="rounded-lg border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-accent">
                      Preview
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="reveal mt-8 pb-10">
          <h2 className="font-display text-lg font-bold tracking-tight">Upcoming schedule</h2>
          <div className="mt-4 space-y-2">
            {flyers.map((flyer) => (
              <div
                key={`schedule-${flyer.id}`}
                className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3"
              >
                <span className="w-16 shrink-0 text-[12px] font-bold text-primary">{flyer.time}</span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold">{flyer.title}</p>
                  <p className="text-[11px] text-muted-foreground">{flyer.channel}</p>
                </div>
                <span
                  className={`ml-auto size-1.5 shrink-0 rounded-full ${
                    running ? "bg-success" : "bg-muted-foreground"
                  }`}
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
