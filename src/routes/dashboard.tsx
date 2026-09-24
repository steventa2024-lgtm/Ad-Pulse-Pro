import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, X, Loader2 } from "lucide-react";
import { useAppStore, type GeneratedPost } from "@/lib/store";
import { generateDailyPostsAI, type GenerationProgress } from "@/lib/generator";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Pulseboard" },
      { name: "description", content: "See your generated ad flyers, today's posting schedule, and control your automation." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const business = useAppStore((s) => s.business);
  const channels = useAppStore((s) => s.channels);
  const posts = useAppStore((s) => s.posts);
  const autopilotOn = useAppStore((s) => s.autopilotOn);
  const lastGenerationAt = useAppStore((s) => s.lastGenerationAt);
  const addPosts = useAppStore((s) => s.addPosts);
  const toggleAutopilot = useAppStore((s) => s.toggleAutopilot);
  const setLastGenerationAt = useAppStore((s) => s.setLastGenerationAt);
  const reset = useAppStore((s) => s.reset);

  const [preview, setPreview] = useState<GeneratedPost | null>(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const autoRan = useRef(false);

  const connectedCount = channels.filter((c) => c.connected).length;
  const todayPosts = posts.slice(0, 3);
  const postsThisWeek = posts.length || 21;

  const runGeneration = async () => {
    setGenerating(true);
    setError(null);
    try {
      const generated = await generateDailyPostsAI(business, (p) => setProgress(p), 3);
      addPosts(generated);
      setLastGenerationAt(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
      setProgress(null);
    }
  };

  // Auto-run once per session if we have a business and no posts
  useEffect(() => {
    if (!autoRan.current && business.name && posts.length === 0) {
      autoRan.current = true;
      void runGeneration();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business.name, posts.length]);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-primary font-display text-sm font-extrabold text-primary-foreground">P</span>
            <span className="font-display text-[15px] font-bold tracking-tight">Pulseboard</span>
          </Link>
          <span className="text-[11px] font-semibold text-muted-foreground">{business.name || "Dashboard"}</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        {connectedCount === 0 && (
          <div className="mb-5 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-[13px] text-warning">
            No channels connected. <Link to="/connect" className="font-semibold underline">Connect one</Link> so posts can go out.
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
            <strong>Generation error:</strong> {error}
            <div className="mt-1 text-[11px] opacity-80">Check that OPENAI_API_KEY is set correctly in .env.local and restart the dev server.</div>
          </div>
        )}

        <section className="reveal">
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                autopilotOn ? "border-success/20 bg-success/10 text-success" : "border-border bg-secondary text-muted-foreground"
              }`}>
                <span className={`size-1.5 rounded-full ${autopilotOn ? "bg-success" : "bg-muted-foreground"}`} />
                {autopilotOn ? "Automation live" : "Automation paused"}
              </span>
              <h1 className="mt-3 font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                Your ads are on <span className="text-primary">autopilot.</span>
              </h1>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {autopilotOn
                  ? `Auto-generating 3 posts per day across ${connectedCount || 0} connected channel${connectedCount === 1 ? "" : "s"}.`
                  : "Nothing will be posted while paused. Flip the switch to resume."}
              </p>
            </div>
            <button
              onClick={toggleAutopilot}
              role="switch"
              aria-checked={autopilotOn}
              aria-label="Toggle automation"
              className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors ${autopilotOn ? "bg-success" : "bg-secondary"}`}
            >
              <span className={`absolute size-7 rounded-full bg-background shadow transition-all ${autopilotOn ? "right-0.5" : "left-0.5"}`} />
            </button>
          </div>
        </section>

        <section className="reveal mt-6 grid grid-cols-3 gap-2 sm:gap-3">
          <Stat value={String(postsThisWeek)} label="posts this week" />
          <Stat value="14.2k" label="reach, last 7 days" />
          <Stat value="3.8%" label="click-through rate" />
        </section>

        <section className="reveal mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold tracking-tight">Today's flyers</h2>
            <button
              onClick={runGeneration}
              disabled={generating}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {generating ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
              {generating ? "Generating…" : "Generate posts"}
            </button>
          </div>

          {generating && progress && (
            <div className="mb-4 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-[12px] text-primary">
              <div className="flex items-center gap-2 font-semibold">
                <Loader2 className="size-3.5 animate-spin" />
                Generating post {progress.index + 1} of {progress.total} — {progress.stage === "copy" ? "writing copy" : progress.stage === "image" ? "rendering image" : progress.stage === "compose" ? "composing ad" : "saving"}
              </div>
              {progress.title && <div className="mt-1 text-[11px] opacity-80">“{progress.title}”</div>}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            {generating && todayPosts.length < 3 && Array.from({ length: 3 - todayPosts.length }).map((_, i) => (
              <div key={`skeleton-${i}`} className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="aspect-[16/10] w-full animate-pulse bg-secondary" />
                <div className="space-y-2 p-4">
                  <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
                  <div className="h-3 w-3/4 animate-pulse rounded bg-secondary" />
                </div>
              </div>
            ))}

            {!generating && todayPosts.length === 0 && (
              <p className="col-span-full rounded-xl border border-dashed border-border bg-card/50 px-4 py-8 text-center text-[13px] text-muted-foreground">
                No posts yet. Click <span className="font-semibold text-foreground">Generate posts</span> to create today's lineup.
              </p>
            )}

            {todayPosts.map((post) => (
              <article key={post.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-transform hover:-translate-y-0.5">
                <img src={post.image} alt={post.title} width={1024} height={640} loading="lazy" className="aspect-[16/10] w-full object-cover" />
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-primary">{post.time}</span>
                    <span className="text-[11px] text-muted-foreground">· {post.channel} · {post.goal}</span>
                  </div>
                  <p className="mt-1.5 text-[13px] font-semibold leading-snug">{post.title}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success">
                      <span className="size-1.5 rounded-full bg-success" />
                      {autopilotOn ? "Scheduled" : "Held"}
                    </span>
                    <button
                      onClick={() => setPreview(post)}
                      className="rounded-lg border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-accent"
                    >
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
            {todayPosts.map((post) => (
              <div key={`schedule-${post.id}`} className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3">
                <span className="w-16 shrink-0 text-[12px] font-bold text-primary">{post.time}</span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold">{post.title}</p>
                  <p className="text-[11px] text-muted-foreground">{post.channel}</p>
                </div>
                <span className={`ml-auto size-1.5 shrink-0 rounded-full ${autopilotOn ? "bg-success" : "bg-muted-foreground"}`} />
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-between border-t border-border pt-4 text-[11px] text-muted-foreground">
            <span>{lastGenerationAt ? `Last generated: ${new Date(lastGenerationAt).toLocaleTimeString()}` : "Not generated yet"}</span>
            <button
              onClick={() => { if (confirm("Reset all app data?")) { reset(); autoRan.current = false; } }}
              className="rounded-lg border border-border px-2.5 py-1 font-semibold transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            >
              Reset app data
            </button>
          </div>
        </section>
      </main>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreview(null)}>
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreview(null)} className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-background" aria-label="Close preview">
              <X className="size-4" />
            </button>
            <img src={preview.image} alt={preview.title} className="aspect-square w-full object-cover" />
            <div className="p-5">
              <div className="text-[11px] font-bold text-primary">{preview.time} · {preview.channel} · {preview.goal}</div>
              <h3 className="mt-2 font-display text-lg font-bold">{preview.title}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="font-display text-xl font-extrabold text-primary sm:text-2xl">{value}</div>
      <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{label}</div>
    </div>
  );
}
