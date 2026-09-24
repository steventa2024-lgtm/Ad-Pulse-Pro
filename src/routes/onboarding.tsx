import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useAppStore, type BusinessProfile } from "@/lib/store";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set Up Your Brand — Pulseboard" },
      { name: "description", content: "Tell Pulseboard about your business in five quick steps and start automating your ads." },
      { property: "og:title", content: "Set Up Your Brand — Pulseboard" },
      { property: "og:description", content: "Tell Pulseboard about your business in five quick steps and start automating your ads." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Onboarding,
});

interface StepDef {
  key: keyof BusinessProfile;
  title: string;
  hint: string;
  placeholder: string;
  multiline?: boolean;
}

const steps: StepDef[] = [
  { key: "name", title: "What's your business name?", hint: "This appears on your generated flyers.", placeholder: "e.g. Glow & Co." },
  { key: "niche", title: "What niche are you in?", hint: "Skincare, fitness coaching, coffee roasting…", placeholder: "e.g. Natural skincare" },
  { key: "audience", title: "Who is your target audience?", hint: "Describe the people you want to reach.", placeholder: "e.g. Women 25–40 who care about clean ingredients", multiline: true },
  { key: "offer", title: "What's your current offer?", hint: "The promotion or product you're pushing right now.", placeholder: "e.g. 20% off the weekend essentials bundle", multiline: true },
  { key: "tone", title: "Describe your brand style", hint: "Tone, colors, vibe — how should your ads feel?", placeholder: "e.g. Minimal, warm, premium; deep indigo and cream", multiline: true },
];

function Onboarding() {
  const navigate = useNavigate();
  const step = useAppStore((s) => s.onboardingStep);
  const business = useAppStore((s) => s.business);
  const setStep = useAppStore((s) => s.setOnboardingStep);
  const updateBusiness = useAppStore((s) => s.updateBusiness);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const idx = Math.min(step - 1, steps.length - 1);
  const current = steps[idx]!;
  const value = business[current.key] ?? "";
  const isLast = idx === steps.length - 1;
  const canContinue = value.trim().length > 0;

  const next = () => {
    if (isLast) {
      completeOnboarding();
      navigate({ to: "/connect" });
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-primary font-display text-sm font-extrabold text-primary-foreground">P</span>
            <span className="font-display text-[15px] font-bold tracking-tight">Pulseboard</span>
          </Link>
          <span className="text-[11px] font-semibold text-muted-foreground">Step {idx + 1} of {steps.length}</span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-md reveal" key={idx}>
          <div className="mb-6 flex gap-1.5">
            {steps.map((s, i) => (
              <span key={s.key} className={`h-1 flex-1 rounded-full ${i <= idx ? "bg-primary" : "bg-secondary"}`} />
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h1 className="font-display text-2xl font-bold tracking-tight">{current.title}</h1>
            <p className="mt-2 text-[13.5px] text-muted-foreground">{current.hint}</p>

            {current.multiline ? (
              <textarea
                value={value}
                onChange={(e) => updateBusiness({ [current.key]: e.target.value })}
                placeholder={current.placeholder}
                rows={3}
                autoFocus
                className="mt-5 w-full rounded-xl border border-input bg-background px-4 py-3 text-[14px] outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
              />
            ) : (
              <input
                value={value}
                onChange={(e) => updateBusiness({ [current.key]: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter" && canContinue) next(); }}
                placeholder={current.placeholder}
                autoFocus
                className="mt-5 h-12 w-full rounded-xl border border-input bg-background px-4 text-[14px] outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
              />
            )}

            <div className="mt-6 flex items-center gap-3">
              {idx > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="inline-flex h-12 items-center gap-1.5 rounded-xl border border-border bg-card px-4 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-accent"
                >
                  <ArrowLeft className="size-4" /> Back
                </button>
              )}
              <button
                onClick={next}
                disabled={!canContinue}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:shadow-none"
              >
                {isLast ? "Connect channels" : "Continue"} <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
