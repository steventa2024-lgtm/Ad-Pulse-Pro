import { useCallback, useEffect, useReducer, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, Loader2, Pencil, X, Info, Check, Eye, Hash, Target } from "lucide-react";
import { demoAds, miniDashboardWindow } from "@/lib/demo-ads";
import { DemoFlyer } from "./DemoFlyer";

type Stage = "idle" | "copy" | "visual" | "compose" | "ready";

interface State {
  activeIndex: number;
  stage: Stage;
  generating: boolean;
  editing: boolean;
  draft: string;
  headlineOverrides: Record<string, string>;
  previewOpen: boolean;
}

type Action =
  | { type: "start" }
  | { type: "stage"; stage: Stage }
  | { type: "advance" }
  | { type: "editStart"; current: string }
  | { type: "editChange"; value: string }
  | { type: "editCancel" }
  | { type: "editCommit" }
  | { type: "previewOpen" }
  | { type: "previewClose" };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "start":
      return { ...s, generating: true, stage: "copy" };
    case "stage":
      return { ...s, stage: a.stage };
    case "advance":
      return {
        ...s,
        activeIndex: (s.activeIndex + 1) % demoAds.length,
        stage: "ready",
        generating: false,
      };
    case "editStart":
      return { ...s, editing: true, draft: a.current };
    case "editChange":
      return { ...s, draft: a.value };
    case "editCancel":
      return { ...s, editing: false };
    case "editCommit": {
      const id = demoAds[s.activeIndex]!.id;
      return {
        ...s,
        editing: false,
        headlineOverrides: {
          ...s.headlineOverrides,
          [id]: s.draft.trim() || demoAds[s.activeIndex]!.headline,
        },
      };
    }
    case "previewOpen":
      return { ...s, previewOpen: true };
    case "previewClose":
      return { ...s, previewOpen: false };
  }
}

const stageLabel: Record<Stage, string> = {
  idle: "Ready",
  copy: "Writing copy…",
  visual: "Preparing visual…",
  compose: "Composing ad…",
  ready: "Ready to review",
};

export function InteractiveDemo() {
  const reduce = useReducedMotion();
  const [state, dispatch] = useReducer(reducer, {
    activeIndex: 0,
    stage: "idle",
    generating: false,
    editing: false,
    draft: "",
    headlineOverrides: {},
    previewOpen: false,
  });
  const timers = useRef<number[]>([]);

  const visible = miniDashboardWindow(state.activeIndex);
  const selected = demoAds[state.activeIndex]!;
  const headline = state.headlineOverrides[selected.id] ?? selected.headline;
  const selectedForDisplay = { ...selected, headline };

  const run = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    dispatch({ type: "start" });
    const push = (fn: () => void, ms: number) =>
      timers.current.push(window.setTimeout(fn, reduce ? 0 : ms));

    push(() => dispatch({ type: "stage", stage: "copy" }), 0);
    push(() => dispatch({ type: "stage", stage: "visual" }), 650);
    push(() => dispatch({ type: "stage", stage: "compose" }), 1300);
    push(() => dispatch({ type: "advance" }), 1800);
  }, [reduce]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  return (
    <div className="glass-panel overflow-hidden rounded-3xl">
      <div className="flex items-center justify-between gap-2 border-b border-white/5 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-6 shrink-0 place-items-center rounded-md bg-primary font-display text-[10px] font-black text-primary-foreground">
            A
          </span>
          <span className="shrink-0 text-[11px] font-bold">Ad Pilot Pro</span>
          <span className="h-3.5 w-px shrink-0 bg-white/10" />
          <span className="truncate text-[11px] text-muted-foreground">Example workspace</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9.5px] font-semibold text-muted-foreground tabular-nums">
            {state.activeIndex + 1} / {demoAds.length}
          </span>
          <span className="rounded-full border border-warning/25 bg-warning/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-warning">
            Sample draft
          </span>
        </div>
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-8">
          <CreativeWorkspace
            visible={visible}
            generating={state.generating}
            stage={state.stage}
            headlineOverrides={state.headlineOverrides}
            onGenerate={run}
          />
          <TodayLineup visible={visible} />
        </div>

        <div className="min-w-0 xl:col-span-4">
          <AdInspector
            ad={selectedForDisplay}
            headline={headline}
            editing={state.editing}
            editDraft={state.draft}
            stage={state.stage}
            onEditStart={() => dispatch({ type: "editStart", current: headline })}
            onEditChange={(v) => dispatch({ type: "editChange", value: v })}
            onEditCommit={() => dispatch({ type: "editCommit" })}
            onEditCancel={() => dispatch({ type: "editCancel" })}
            onPreview={() => dispatch({ type: "previewOpen" })}
          />
        </div>
      </div>

      <PreviewModal
        open={state.previewOpen}
        onClose={() => dispatch({ type: "previewClose" })}
        ad={selectedForDisplay}
      />
    </div>
  );
}

function CreativeWorkspace({
  visible,
  generating,
  stage,
  headlineOverrides,
  onGenerate,
}: {
  visible: ReturnType<typeof miniDashboardWindow>;
  generating: boolean;
  stage: Stage;
  headlineOverrides: Record<string, string>;
  onGenerate: () => void;
}) {
  const reduce = useReducedMotion();
  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12.5px] font-bold">Creative workspace</div>
          <div className="mt-0.5 truncate text-[10.5px] text-muted-foreground">
            Sample generation · no API calls · cycles through {demoAds.length} drafts
          </div>
        </div>
        <button
          onClick={onGenerate}
          disabled={generating}
          className="focus-ring inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:translate-y-0 disabled:opacity-60"
        >
          {generating ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Sparkles className="size-3" />
          )}
          <span className="whitespace-nowrap">
            {generating ? stageLabel[stage] : "Generate sample"}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {visible.map((ad, offset) => {
          const isActive = offset === 0;
          const override = headlineOverrides[ad.id];
          const adWithHeadline = override ? { ...ad, headline: override } : ad;
          const loadingThis = generating && isActive;
          return (
            <motion.div
              key={ad.id}
              layout
              transition={{ duration: reduce ? 0 : 0.3 }}
              className={`relative overflow-hidden rounded-[1.15rem] ${
                isActive ? "ring-2 ring-primary/45" : ""
              }`}
            >
              <DemoFlyer ad={adWithHeadline} compact />
              {loadingThis && (
                <div className="absolute inset-0 flex items-center justify-center rounded-[1.15rem] bg-black/65 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 rounded-full bg-black/80 px-2 py-1 text-[9.5px] font-semibold text-white">
                    <Loader2 className="size-3 animate-spin" /> {stageLabel[stage]}
                  </div>
                </div>
              )}
              {isActive && !generating && (
                <span className="pointer-events-none absolute left-2 top-2 rounded-full border border-primary/40 bg-primary/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur">
                  Selected
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function TodayLineup({ visible }: { visible: ReturnType<typeof miniDashboardWindow> }) {
  const times = ["9:00 AM", "1:30 PM", "6:00 PM"];
  return (
    <div className="mt-5">
      <div className="text-[12.5px] font-bold">Today&apos;s lineup</div>
      <div className="glass-panel relative mt-2.5 rounded-2xl p-3">
        <div
          aria-hidden
          className="absolute left-[58px] top-5 bottom-5 w-px bg-gradient-to-b from-white/5 via-white/10 to-white/5"
        />
        <ul className="space-y-1.5">
          {visible.map((ad, offset) => {
            const isActive = offset === 0;
            return (
              <li key={ad.id}>
                <div
                  className={`relative flex items-center gap-3 rounded-xl border px-3 py-2 ${
                    isActive
                      ? "border-primary/30 bg-primary/[0.06]"
                      : "border-white/8 bg-white/[0.02]"
                  }`}
                >
                  <span className="w-10 shrink-0 text-[10.5px] font-bold text-primary">
                    {times[offset]}
                  </span>
                  <span
                    className={`relative z-10 grid size-2 shrink-0 place-items-center rounded-full ring-4 ring-background ${
                      isActive ? "bg-primary" : "bg-muted-foreground"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold">{ad.headline}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-[9.5px] text-muted-foreground">
                      <Hash className="size-2.5 shrink-0" />
                      <span className="truncate">{ad.channel}</span>
                      <Target className="size-2.5 shrink-0" />
                      <span className="truncate">{ad.goal}</span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function AdInspector({
  ad,
  headline,
  editing,
  editDraft,
  stage,
  onEditStart,
  onEditChange,
  onEditCommit,
  onEditCancel,
  onPreview,
}: {
  ad: ReturnType<typeof miniDashboardWindow>[number];
  headline: string;
  editing: boolean;
  editDraft: string;
  stage: Stage;
  onEditStart: () => void;
  onEditChange: (v: string) => void;
  onEditCommit: () => void;
  onEditCancel: () => void;
  onPreview: () => void;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="glass-panel rounded-2xl xl:sticky xl:top-4">
      <div className="flex items-center justify-between gap-2 px-4 pt-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Inspector
        </span>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ${
            stage === "ready"
              ? "border-success/25 bg-success/10 text-success"
              : "border-warning/25 bg-warning/10 text-warning"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${stage === "ready" ? "bg-success" : "bg-warning"}`}
          />
          {stage === "ready" ? "Sample draft" : "Preview"}
        </span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={ad.id}
          initial={{ opacity: 0, y: reduce ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : -6 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
          className="px-4 pt-3"
        >
          <DemoFlyer ad={ad} />

          <div className="mt-3">
            {editing ? (
              <input
                autoFocus
                value={editDraft}
                onChange={(e) => onEditChange(e.target.value)}
                onBlur={onEditCommit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onEditCommit();
                  if (e.key === "Escape") onEditCancel();
                }}
                className="focus-ring w-full rounded-lg border border-primary/50 bg-background px-2 py-1.5 text-[12.5px] font-semibold outline-none"
              />
            ) : (
              <button
                onClick={onEditStart}
                className="focus-ring group flex w-full items-start gap-2 rounded-lg px-1 py-0.5 text-left transition-colors hover:bg-white/5"
              >
                <span className="text-[12.5px] font-semibold leading-snug">{headline}</span>
                <Pencil className="mt-0.5 size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            )}
          </div>

          <dl className="mt-3 space-y-1.5 text-[10.5px]">
            <Row label="Brand" value={ad.brand} />
            <Row label="Niche" value={ad.niche} />
            <Row label="Channel" value={ad.channel} />
            <Row label="Goal" value={ad.goal} />
            <Row label="Time" value={ad.time} />
          </dl>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-2 px-4 pb-4 pt-3">
        <button
          onClick={onPreview}
          className="focus-ring inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-[11px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90"
        >
          <Eye className="size-3.5" /> Preview
        </button>
        <button
          onClick={onEditStart}
          className="focus-ring inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
        >
          <Pencil className="size-3.5" /> Edit
        </button>
      </div>

      <div className="flex items-start gap-2 border-t border-white/5 px-4 py-3 text-[10px] leading-snug text-muted-foreground">
        <Info className="mt-0.5 size-3 shrink-0 text-primary" />
        <p>Sample demonstration only. Real generation happens inside the app.</p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-1.5 last:border-none">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="truncate font-semibold capitalize text-foreground">{value}</dd>
    </div>
  );
}

function PreviewModal({
  open,
  onClose,
  ad,
}: {
  open: boolean;
  onClose: () => void;
  ad: ReturnType<typeof miniDashboardWindow>[number];
}) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
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
            <div className="min-w-0 sm:w-3/5">
              <DemoFlyer ad={ad} />
            </div>
            <div className="flex min-w-0 flex-col gap-3 p-6 sm:w-2/5">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-warning/25 bg-warning/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-warning">
                <Check className="size-3" /> Sample draft
              </span>
              <h3 className="font-display text-lg font-bold leading-snug">{ad.headline}</h3>
              <p className="text-[12px] leading-relaxed text-muted-foreground">{ad.subline}</p>
              <dl className="mt-2 space-y-2 text-[11px]">
                <Row label="Brand" value={ad.brand} />
                <Row label="Channel" value={ad.channel} />
                <Row label="Goal" value={ad.goal} />
              </dl>
              <p className="mt-auto text-[10.5px] leading-snug text-muted-foreground">
                Fictional example. Not a customer result.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
