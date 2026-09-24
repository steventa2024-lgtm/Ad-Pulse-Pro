import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Facebook, Instagram, Music2 } from "lucide-react";
import { useAppStore, type ChannelId } from "@/lib/store";

export const Route = createFileRoute("/connect")({
  head: () => ({
    meta: [
      { title: "Connect Your Channels — Ad Pilot Pro" },
      {
        name: "description",
        content:
          "Connect Facebook, Instagram, and TikTok so Ad Pilot Pro can post your ads on autopilot.",
      },
      { property: "og:title", content: "Connect Your Channels — Ad Pilot Pro" },
      {
        property: "og:description",
        content:
          "Connect Facebook, Instagram, and TikTok so Ad Pilot Pro can post your ads on autopilot.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Connect,
});

const channelIcons: Record<ChannelId, typeof Facebook> = {
  facebook: Facebook,
  instagram: Instagram,
  tiktok: Music2,
};

function Connect() {
  const navigate = useNavigate();
  const channels = useAppStore((s) => s.channels);
  const setChannelConnected = useAppStore((s) => s.setChannelConnected);
  const count = channels.filter((c) => c.connected).length;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-primary font-display text-sm font-extrabold text-primary-foreground">
              P
            </span>
            <span className="font-display text-[15px] font-bold tracking-tight">Ad Pilot Pro</span>
          </Link>
          <span className="text-[11px] font-semibold text-muted-foreground">Step 2 of 2</span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-md reveal">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-2xl font-bold tracking-tight">
                Add your channel handles
              </h1>
              <span className="text-[11px] font-semibold text-success">
                {count} of {channels.length}
              </span>
            </div>
            <p className="mt-2 text-[13.5px] text-muted-foreground">
              Save your handles so each draft is labeled for the right platform. Direct publishing
              is planned — for now, drafts stay local.
            </p>

            <div className="mt-6 space-y-2">
              {channels.map((channel) => {
                const Icon = channelIcons[channel.id];
                return (
                  <div
                    key={channel.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-secondary/50 px-4 py-3.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold">{channel.name}</div>
                        <div className="truncate text-[11.5px] text-muted-foreground">
                          {channel.handle}
                        </div>
                      </div>
                    </div>
                    {channel.connected ? (
                      <button
                        onClick={() => setChannelConnected(channel.id, false)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                        title="Click to disconnect"
                      >
                        <Check className="size-3" /> Connected
                      </button>
                    ) : (
                      <button
                        onClick={() => setChannelConnected(channel.id, true)}
                        className="shrink-0 rounded-lg bg-primary px-3.5 py-2 text-[12px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => navigate({ to: "/dashboard" })}
              disabled={count === 0}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:shadow-none"
            >
              Continue to dashboard <ArrowRight className="size-4" />
            </button>
            <p className="mt-3 text-center text-[11.5px] text-muted-foreground">
              Add at least one handle to continue
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
