import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  X,
  Loader2,
  Pencil,
  Info,
  Clock,
  Target,
  Hash,
  CircleDot,
  Eye,
  LayoutGrid,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAppStore, type GeneratedPost } from "@/lib/store";
import { generateDailyPostsAI, composeAdImage, type GenerationProgress } from "@/lib/generator";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Ad Pilot Pro" },
      {
        name: "description",
        content:
          "Review your generated ad flyers, edit headlines, and prepare content for your channels.",
      },
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
  const updatePost = useAppStore((s) => s.updatePost);
  const toggleAutopilot = useAppStore((s) => s.toggleAutopilot);
  const setLastGenerationAt = useAppStore((s) => s.setLastGenerationAt);
  const reset = useAppStore((s) => s.reset);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [preview, setPreview] = useState<GeneratedPost | null>(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [editFeedback, setEditFeedback] = useState<{
    postId: string;
    prevTitle: string;
    prevImage: string;
    nextTitle: string;
  } | null>(null);
  const autoRan = useRef(false);
  const lastArgs = useRef<{ withStatus: GeneratedPost["status"] } | null>(null);

  const connectedCount = channels.filter((c) => c.connected).length;
  const todayPosts = posts.slice(0, 3);
  const selected = useMemo(
    () => posts.find((p) => p.id === selectedId) ?? todayPosts[0] ?? null,
    [posts, todayPosts, selectedId],
  );

  const runGeneration = async () => {
    setGenerating(true);
    setError(null);
    const initialStatus: GeneratedPost["status"] = autopilotOn ? "scheduled" : "draft";
    lastArgs.current = { withStatus: initialStatus };
    try {
      const generated = await generateDailyPostsAI(
        business,
        (p) => setProgress(p),
        3,
        initialStatus,
      );
      addPosts(generated);
      setLastGenerationAt(Date.now());
      setSelectedId(generated[0]?.id ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
      setProgress(null);
    }
  };

  useEffect(() => {
    if (!autoRan.current && business.name && posts.length === 0) {
      autoRan.current = true;
      void runGeneration();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business.name, posts.length]);

  const startEdit = (post: GeneratedPost) => {
    setEditingId(post.id);
    setDraftTitle(post.title);
  };
  const saveEdit = async (post: GeneratedPost) => {
    const trimmed = draftTitle.trim();
    setEditingId(null);
    if (!trimmed || trimmed === post.title) return;

    const prevTitle = post.title;
    const prevImage = post.image;

    updatePost(post.id, { title: trimmed });
    let nextImage = prevImage;
    if (post.bgImage) {
      try {
        nextImage = await composeAdImage(post.bgImage, trimmed, "#6366f1");
        updatePost(post.id, { image: nextImage });
      } catch {
        /* keep old composite */
      }
    }

    // Feedback with undo — auto-clears after 6s
    setEditFeedback({ postId: post.id, prevTitle, prevImage, nextTitle: trimmed });
    window.setTimeout(() => {
      setEditFeedback((cur) => (cur && cur.postId === post.id ? null : cur));
    }, 6000);
  };

  const undoEdit = () => {
    if (!editFeedback) return;
    updatePost(editFeedback.postId, {
      title: editFeedback.prevTitle,
      image: editFeedback.prevImage,
    });
    setEditFeedback(null);
  };

  const stageLabel = (p: GenerationProgress | null) => {
    if (!p) return "Starting…";
    if (p.stage === "copy") return `Writing copy — ${p.completed}/${p.total}`;
    if (p.stage === "image") return `Rendering images — ${p.completed}/${p.total}`;
    if (p.stage === "compose") return `Composing ads — ${p.completed}/${p.total}`;
    return "Finishing…";
  };

  return (
    <div className="ambient-stage min-h-screen bg-background text-foreground antialiased">
      <Header businessName={business.name} onGenerate={runGeneration} generating={generating} />

      <main className="relative mx-auto max-w-7xl px-5 pb-16 pt-6">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* LEFT: workspace */}
          <section className="lg:col-span-8">
            <WorkspaceHeading
              onGenerate={runGeneration}
              generating={generating}
              stageLabel={stageLabel(progress)}
            />

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 flex items-start justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] text-destructive backdrop-blur-xl"
                >
                  <div>
                    <strong>Generation error:</strong> {error}
                    <div className="mt-1 text-[11px] opacity-80">
                      Your existing drafts are untouched. Retry when ready.
                    </div>
                  </div>
                  <button
                    onClick={runGeneration}
                    disabled={generating}
                    className="focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-destructive/40 bg-destructive/15 px-3 py-1.5 text-[11.5px] font-semibold text-destructive transition-colors hover:bg-destructive/25 disabled:opacity-60"
                  >
                    <RefreshCw className="size-3.5" /> Retry
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {generating &&
                  Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={`sk-${i}`} stage={progress?.stage} index={i} />
                  ))}
              </AnimatePresence>

              {!generating && todayPosts.length === 0 && <EmptyState onGenerate={runGeneration} />}

              {!generating &&
                todayPosts.map((post, i) => (
                  <FlyerCard
                    key={post.id}
                    post={post}
                    index={i}
                    selected={selected?.id === post.id}
                    editing={editingId === post.id}
                    draftTitle={draftTitle}
                    onSelect={() => setSelectedId(post.id)}
                    onStartEdit={() => startEdit(post)}
                    onDraftChange={setDraftTitle}
                    onSave={() => saveEdit(post)}
                    onCancel={() => setEditingId(null)}
                    onPreview={() => setPreview(post)}
                  />
                ))}
            </div>

            {/* Lineup */}
            <div className="mt-10">
              <SectionHeading
                title="Today's lineup"
                subtitle="The three daily slots your drafts are written for."
              />
              {todayPosts.length === 0 ? (
                <p className="mt-4 text-[12.5px] text-muted-foreground">Nothing queued yet.</p>
              ) : (
                <div className="glass-panel relative mt-4 rounded-3xl p-5">
                  <div
                    aria-hidden
                    className="absolute left-[62px] top-8 bottom-8 w-px bg-gradient-to-b from-white/5 via-white/10 to-white/5"
                  />
                  <ul className="space-y-2">
                    {todayPosts.map((post, i) => (
                      <motion.li
                        key={`schedule-${post.id}`}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, delay: 0.05 + i * 0.05 }}
                        onClick={() => setSelectedId(post.id)}
                        className={`relative flex cursor-pointer items-center gap-4 rounded-2xl border px-4 py-3 transition-colors ${
                          selected?.id === post.id
                            ? "border-primary/30 bg-primary/[0.06]"
                            : "border-white/8 bg-white/[0.02] hover:border-white/15"
                        }`}
                      >
                        <span className="w-14 shrink-0 text-[12px] font-bold text-primary">
                          {post.time}
                        </span>
                        <span
                          className={`relative z-10 grid size-2.5 shrink-0 place-items-center rounded-full ring-4 ring-background ${
                            post.status === "scheduled" ? "bg-success" : "bg-muted-foreground"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold">{post.title}</p>
                          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                            <Hash className="size-2.5" /> {post.channel}
                            <Target className="size-2.5" /> {post.goal}
                          </div>
                        </div>
                        <span
                          className={`hidden shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider sm:inline-flex ${
                            post.status === "scheduled"
                              ? "border-success/25 bg-success/10 text-success"
                              : "border-white/10 bg-white/5 text-muted-foreground"
                          }`}
                        >
                          {post.status === "scheduled" ? "Scheduled" : "Draft"}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="mt-4 text-center text-[11px] text-muted-foreground">
                Drafts are stored on this device. No external publishing scheduler is running.
              </p>
            </div>
          </section>

          {/* RIGHT: inspector / status rail */}
          <aside className="lg:col-span-4 lg:sticky lg:top-20 lg:self-start">
            <div className="space-y-4">
              <StatusPanel
                autopilotOn={autopilotOn}
                connectedCount={connectedCount}
                lastGenerationAt={lastGenerationAt}
                onToggle={toggleAutopilot}
                onReset={() => {
                  if (confirm("Reset all app data?")) {
                    reset();
                    autoRan.current = false;
                    setSelectedId(null);
                  }
                }}
              />

              <InspectorPanel
                post={selected}
                onPreview={() => selected && setPreview(selected)}
                onEdit={() => selected && startEdit(selected)}
              />

              <KpiPanel
                drafts={posts.length}
                channels={connectedCount}
                scheduled={posts.filter((p) => p.status === "scheduled").length}
              />
            </div>
          </aside>
        </div>
      </main>

      {/* Edit feedback — appears only after a save, not on hover */}
      <AnimatePresence>
        {editFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2"
            role="status"
            aria-live="polite"
          >
            <div className="glass-modal flex items-center gap-3 rounded-2xl px-4 py-2.5 text-[12px]">
              <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                <Check className="size-3.5 text-success" /> Headline updated
              </span>
              <span className="h-3.5 w-px bg-white/10" />
              <button
                onClick={() => {
                  const p = posts.find((x) => x.id === editFeedback.postId);
                  if (p) setPreview(p);
                }}
                className="focus-ring rounded-lg px-2 py-1 text-[11.5px] font-semibold text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                Preview
              </button>
              <button
                onClick={undoEdit}
                className="focus-ring rounded-lg px-2 py-1 text-[11.5px] font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                Undo
              </button>
              <button
                onClick={() => setEditFeedback(null)}
                className="focus-ring grid size-6 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PreviewModal post={preview} onClose={() => setPreview(null)} />
    </div>
  );
}

/* ---------------------------------- Header -------------------------------- */

function Header({
  businessName,
  onGenerate,
  generating,
}: {
  businessName: string;
  onGenerate: () => void;
  generating: boolean;
}) {
  return (
    <header className="glass-canvas sticky top-0 z-30 border-b border-white/5">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-primary font-display text-sm font-extrabold text-primary-foreground shadow-lg shadow-primary/25">
              A
            </span>
            <span className="hidden font-display text-[15px] font-bold tracking-tight sm:inline">
              Ad Pilot Pro
            </span>
          </Link>
          {businessName && (
            <>
              <span className="hidden h-4 w-px bg-white/10 sm:inline-block" />
              <span className="max-w-[40vw] truncate text-[12px] font-semibold text-muted-foreground">
                {businessName}
              </span>
            </>
          )}
        </div>
        <button
          onClick={onGenerate}
          disabled={generating}
          className="focus-ring inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-[12.5px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-primary/40 disabled:translate-y-0 disabled:opacity-60"
        >
          {generating ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Sparkles className="size-3.5" />
          )}
          {generating ? "Generating…" : "Generate posts"}
        </button>
      </div>
    </header>
  );
}

function WorkspaceHeading({
  onGenerate,
  generating,
  stageLabel,
}: {
  onGenerate: () => void;
  generating: boolean;
  stageLabel: string;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-xl font-extrabold tracking-tight">Creative workspace</h2>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          Click a card to inspect. Click a headline to edit — the flyer re-renders.
        </p>
      </div>
      <button
        onClick={onGenerate}
        disabled={generating}
        className="focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11.5px] font-semibold text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground disabled:opacity-60"
      >
        {generating ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Sparkles className="size-3.5" />
        )}
        {generating ? stageLabel : "Regenerate"}
      </button>
    </div>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 className="font-display text-lg font-bold tracking-tight">{title}</h2>
      {subtitle && <p className="mt-0.5 text-[11.5px] text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

/* ---------------------------------- Cards --------------------------------- */

function FlyerCard({
  post,
  index,
  selected,
  editing,
  draftTitle,
  onSelect,
  onStartEdit,
  onDraftChange,
  onSave,
  onCancel,
  onPreview,
}: {
  post: GeneratedPost;
  index: number;
  selected: boolean;
  editing: boolean;
  draftTitle: string;
  onSelect: () => void;
  onStartEdit: () => void;
  onDraftChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onPreview: () => void;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      transition={{
        duration: reduce ? 0 : 0.4,
        delay: reduce ? 0 : index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={onSelect}
      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-xl transition-all ${
        selected
          ? "border-primary/40 bg-primary/[0.04] shadow-primary/10"
          : "border-white/8 bg-white/[0.03] hover:border-white/15"
      }`}
    >
      <div className="relative overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          width={1024}
          height={1024}
          loading="lazy"
          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center gap-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="focus-ring flex-1 rounded-xl bg-white/95 px-3 py-2 text-[11.5px] font-bold text-black shadow-lg backdrop-blur transition-colors hover:bg-white"
          >
            Preview
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit();
            }}
            className="focus-ring grid size-9 place-items-center rounded-xl bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
            aria-label="Edit headline"
          >
            <Pencil className="size-3.5" />
          </button>
        </div>
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider backdrop-blur ${
            post.status === "scheduled"
              ? "border-success/40 bg-success/20 text-success"
              : "border-white/20 bg-black/40 text-white/80"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${post.status === "scheduled" ? "bg-success" : "bg-white/70"}`}
          />
          {post.status === "scheduled" ? "Scheduled" : "Draft"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2 text-[10.5px] font-semibold">
          <Clock className="size-3 text-primary" />
          <span className="text-primary">{post.time}</span>
          <span className="text-muted-foreground">
            · {post.channel} · {post.goal}
          </span>
        </div>

        {editing ? (
          <input
            autoFocus
            value={draftTitle}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onDraftChange(e.target.value)}
            onBlur={onSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSave();
              }
              if (e.key === "Escape") {
                onCancel();
              }
            }}
            className="focus-ring mt-2 w-full rounded-lg border border-primary/50 bg-background px-2 py-1.5 text-[13px] font-semibold leading-snug outline-none"
          />
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit();
            }}
            className="focus-ring group/title mt-2 flex w-full items-start gap-1.5 rounded-lg px-1 py-0.5 text-left transition-colors hover:bg-white/5"
            title="Click to edit headline"
          >
            <span className="text-[13px] font-semibold leading-snug">{post.title}</span>
            <Pencil className="mt-0.5 size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/title:opacity-100" />
          </button>
        )}
      </div>
    </motion.article>
  );
}

function EmptyState({ onGenerate }: { onGenerate: () => void }) {
  return (
    <div className="col-span-full rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center backdrop-blur-xl">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Sparkles className="size-5" />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold">No drafts yet</h3>
      <p className="mt-1 text-[13px] text-muted-foreground">
        Generate your first set — one click, three tailored slots.
      </p>
      <button
        onClick={onGenerate}
        className="focus-ring mt-5 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
      >
        <Sparkles className="size-3.5" /> Generate posts
      </button>
    </div>
  );
}

function SkeletonCard({ stage, index }: { stage?: GenerationProgress["stage"]; index: number }) {
  const label =
    stage === "copy"
      ? "Writing copy…"
      : stage === "image"
        ? "Rendering image…"
        : stage === "compose"
          ? "Composing ad…"
          : "Starting…";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="glass-panel overflow-hidden rounded-3xl"
    >
      <div className="relative aspect-square w-full animate-pulse bg-white/5">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2 rounded-full bg-background/85 px-3 py-1.5 text-[11px] font-semibold text-primary backdrop-blur">
            <Loader2 className="size-3.5 animate-spin" />
            {label}
          </div>
        </div>
      </div>
      <div className="space-y-2 p-4">
        <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-white/5" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-white/5" />
      </div>
    </motion.div>
  );
}

/* ---------------------------------- Rail ---------------------------------- */

function StatusPanel({
  autopilotOn,
  connectedCount,
  lastGenerationAt,
  onToggle,
  onReset,
}: {
  autopilotOn: boolean;
  connectedCount: number;
  lastGenerationAt: number | null;
  onToggle: () => void;
  onReset: () => void;
}) {
  return (
    <div className="glass-panel rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
          Status
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
          <CircleDot className="size-2.5" /> Local only
        </span>
      </div>

      <h3 className="mt-3 font-display text-[15px] font-bold leading-snug">
        Drafts only — nothing published yet.
      </h3>
      <p className="mt-1 text-[11.5px] text-muted-foreground">
        {lastGenerationAt
          ? `Last generated ${new Date(lastGenerationAt).toLocaleTimeString()}.`
          : "Not generated yet."}{" "}
        Direct publishing is planned.
      </p>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.02] px-3 py-2.5">
        <div>
          <div className="text-[11.5px] font-semibold">New drafts labeled</div>
          <div className="text-[10.5px] text-muted-foreground">
            {autopilotOn ? "Scheduled" : "Draft"} — a label, not a publish trigger.
          </div>
        </div>
        <button
          onClick={onToggle}
          role="switch"
          aria-checked={autopilotOn}
          aria-label="Toggle draft labeling"
          className={`focus-ring relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
            autopilotOn ? "bg-primary" : "bg-white/10"
          }`}
        >
          <motion.span
            className="absolute size-6 rounded-full bg-background shadow"
            animate={{ left: autopilotOn ? 22 : 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
          />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px]">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Hash className="size-2.5" /> {connectedCount}/3 channels added
        </span>
        <button
          onClick={onReset}
          className="focus-ring rounded-lg border border-white/10 px-2 py-1 text-[10.5px] font-semibold text-muted-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
        >
          Reset
        </button>
      </div>

      {connectedCount === 0 && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-warning/25 bg-warning/10 px-3 py-2 text-[11px] text-warning">
          <Info className="mt-0.5 size-3 shrink-0" />
          <span>
            No channel handles yet.{" "}
            <Link to="/connect" className="font-semibold underline">
              Add one
            </Link>
          </span>
        </div>
      )}
    </div>
  );
}

function InspectorPanel({
  post,
  onPreview,
  onEdit,
}: {
  post: GeneratedPost | null;
  onPreview: () => void;
  onEdit: () => void;
}) {
  if (!post) {
    return (
      <div className="glass-panel rounded-3xl p-5">
        <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
          Inspector
        </div>
        <p className="mt-3 text-[12px] text-muted-foreground">
          Select a card to inspect its details.
        </p>
      </div>
    );
  }
  return (
    <motion.div layout className="glass-panel overflow-hidden rounded-3xl">
      <div className="flex items-center justify-between px-4 pt-4">
        <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
          Inspector
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ${
            post.status === "scheduled"
              ? "border-success/25 bg-success/10 text-success"
              : "border-white/10 bg-white/5 text-muted-foreground"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${post.status === "scheduled" ? "bg-success" : "bg-muted-foreground"}`}
          />
          {post.status === "scheduled" ? "Scheduled" : "Draft"}
        </span>
      </div>

      <div className="mt-3 px-4">
        <div className="overflow-hidden rounded-2xl border border-white/8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={post.id}
              src={post.image}
              alt={post.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="aspect-square w-full object-cover"
            />
          </AnimatePresence>
        </div>
      </div>

      <div className="px-4 pb-4 pt-3">
        <p className="text-[12.5px] font-semibold leading-snug">{post.title}</p>
        <dl className="mt-3 space-y-1.5 text-[11px]">
          <Row label="Channel" value={post.channel} />
          <Row label="Goal" value={post.goal} />
          <Row label="Time" value={post.time} />
          <Row label="Created" value={new Date(post.createdAt).toLocaleTimeString()} />
        </dl>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={onPreview}
            className="focus-ring inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-[11.5px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90"
          >
            <Eye className="size-3.5" /> Preview
          </button>
          <button
            onClick={onEdit}
            className="focus-ring inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11.5px] font-semibold text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
          >
            <Pencil className="size-3.5" /> Edit
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function KpiPanel({
  drafts,
  channels,
  scheduled,
}: {
  drafts: number;
  channels: number;
  scheduled: number;
}) {
  return (
    <div className="glass-panel rounded-3xl p-5">
      <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
        This session
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <MiniKpi label="Drafts" value={String(drafts)} />
        <MiniKpi label="Channels" value={`${channels}/3`} />
        <MiniKpi label="Scheduled" value={String(scheduled)} />
      </div>
    </div>
  );
}

function MiniKpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-inset rounded-2xl p-3">
      <div className="font-display text-lg font-extrabold text-foreground">{value}</div>
      <div className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{label}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-1.5 last:border-none">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-semibold text-foreground">{value}</dd>
    </div>
  );
}

/* ---------------------------------- Modal --------------------------------- */

function PreviewModal({ post, onClose }: { post: GeneratedPost | null; onClose: () => void }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {post && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="glass-modal relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl sm:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="focus-ring absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70"
              aria-label="Close preview"
            >
              <X className="size-4" />
            </button>
            <div className="sm:w-3/5">
              <img
                src={post.image}
                alt={post.title}
                className="aspect-square h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-3 p-6 sm:w-2/5">
              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  post.status === "scheduled"
                    ? "border-success/25 bg-success/10 text-success"
                    : "border-white/10 bg-white/5 text-muted-foreground"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${post.status === "scheduled" ? "bg-success" : "bg-muted-foreground"}`}
                />
                {post.status === "scheduled" ? "Scheduled" : "Draft"}
              </span>
              <h3 className="font-display text-lg font-bold leading-snug">{post.title}</h3>
              <dl className="mt-2 space-y-2 text-[11.5px]">
                <Row label="Time" value={post.time} />
                <Row label="Channel" value={post.channel} />
                <Row label="Goal" value={post.goal} />
                <Row label="Created" value={new Date(post.createdAt).toLocaleString()} />
              </dl>
              <p className="mt-auto text-[10.5px] leading-snug text-muted-foreground">
                Stored locally. Not published to any platform.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* keep import LayoutGrid referenced to avoid unused-import lint if you trim later */
void LayoutGrid;
