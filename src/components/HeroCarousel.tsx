import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { demoAds } from "@/lib/demo-ads";
import { DemoFlyer } from "./DemoFlyer";

const ROTATE_MS = 5000;

export function HeroCarousel() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setIndex((i) => (i + 1) % demoAds.length);
      }
    }, ROTATE_MS);
    return () => window.clearInterval(t);
  }, [reduce]);

  const ad = demoAds[index]!;

  return (
    <div className="relative">
      <div className="glass-panel relative overflow-hidden rounded-3xl p-3">
        <div className="flex items-center gap-1.5 px-2 pb-2.5">
          <span className="size-2.5 rounded-full bg-white/10" />
          <span className="size-2.5 rounded-full bg-white/10" />
          <span className="size-2.5 rounded-full bg-white/10" />
          <span className="ml-3 text-[10.5px] font-medium text-muted-foreground">
            Example creative · {ad.niche}
          </span>
          <span className="ml-auto rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            Example creatives
          </span>
        </div>

        <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              key={ad.id}
              initial={{ opacity: 0, y: reduce ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -10 }}
              transition={{ duration: reduce ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <DemoFlyer ad={ad} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-3 flex items-center justify-center gap-1.5">
          {demoAds.map((_, i) => (
            <span
              key={i}
              aria-hidden
              className={`h-1 rounded-full transition-all duration-300 ${
                i === index ? "w-5 bg-primary" : "w-1.5 bg-white/15"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute -bottom-4 -left-4 hidden max-w-[240px] rounded-2xl border border-white/10 bg-card/85 p-3 shadow-xl backdrop-blur-xl sm:block">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 size-1.5 shrink-0 animate-pulse rounded-full bg-success" />
          <div className="min-w-0">
            <div className="text-[11px] font-bold">Example creatives</div>
            <div className="text-[10.5px] text-muted-foreground">
              {demoAds.length} fictional portfolio pieces · auto-rotating
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
