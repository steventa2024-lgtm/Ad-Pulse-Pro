import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import {
  FONT_PAIRINGS,
  SUGGESTED_PALETTES,
  contrastText,
  getFontPairing,
  isValidHex,
  isHexInProgress,
} from "@/lib/brand";
import { LogoEditor } from "@/components/LogoEditor";
import sampleBg from "@/assets/flyer-glow.jpg";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Brand kit — Ad Pilot Pro" },
      {
        name: "description",
        content:
          "Upload your logo, choose colors and typography, and personalize your generated flyers.",
      },
    ],
  }),
  component: Settings,
});

function Settings() {
  return (
    <div className="ambient-stage min-h-screen bg-background text-foreground antialiased">
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
            <span className="hidden h-4 w-px bg-white/10 sm:inline-block" />
            <span className="text-[12px] font-semibold text-muted-foreground">Brand kit</span>
          </div>
          <Link
            to="/dashboard"
            className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-[12px] font-semibold text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 pb-16 pt-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            Brand kit
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Your logo, colors, and typography are applied to{" "}
            <span className="font-semibold text-foreground">newly generated</span> flyers. Existing
            flyers keep their original look.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="min-w-0 space-y-5 lg:col-span-7">
            <LogoEditor />
            <ColorsSection />
            <TypographySection />
            <BusinessSection />
          </div>
          <div className="min-w-0 lg:col-span-5">
            <div className="lg:sticky lg:top-20">
              <PreviewPanel />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ------------------------------- Colors ------------------------------ */

function ColorsSection() {
  const brand = useAppStore((s) => s.brand);
  const updateBrand = useAppStore((s) => s.updateBrand);

  return (
    <section className="glass-panel rounded-3xl p-5">
      <SectionHeading
        title="Colors"
        subtitle="Primary drives the accent bar, kicker, and CTA. Secondary is used for supporting details."
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <ColorField
          label="Primary"
          value={brand.primaryColor}
          onChange={(v) => updateBrand({ primaryColor: v })}
        />
        <ColorField
          label="Secondary"
          value={brand.secondaryColor}
          onChange={(v) => updateBrand({ secondaryColor: v })}
        />
      </div>

      <div className="mt-5">
        <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
          Suggested palettes
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SUGGESTED_PALETTES.map((p) => {
            const active = p.primary.toLowerCase() === brand.primaryColor.toLowerCase();
            return (
              <button
                key={p.label}
                onClick={() =>
                  updateBrand({ primaryColor: p.primary, secondaryColor: p.secondary })
                }
                className={`focus-ring flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors ${
                  active
                    ? "border-primary/40 bg-primary/5"
                    : "border-white/8 bg-white/[0.02] hover:border-white/15"
                }`}
              >
                <span className="flex shrink-0 items-center">
                  <span
                    className="size-5 rounded-full ring-2 ring-background"
                    style={{ background: p.primary }}
                  />
                  <span
                    className="-ml-2 size-5 rounded-full ring-2 ring-background"
                    style={{ background: p.secondary }}
                  />
                </span>
                <span className="truncate text-[11.5px] font-semibold">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [text, setText] = useState(value);
  const valid = isValidHex(text);

  return (
    <div>
      <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <label className="focus-ring relative grid size-10 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-xl border border-white/10">
          <span className="absolute inset-0" style={{ background: value }} />
          <input
            type="color"
            value={value}
            onChange={(e) => {
              setText(e.target.value);
              onChange(e.target.value);
            }}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label={`${label} color picker`}
          />
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => {
            const next = e.target.value;
            setText(next);
            if (isHexInProgress(next) && isValidHex(next)) onChange(next);
          }}
          onBlur={() => {
            if (!isValidHex(text)) setText(value);
          }}
          spellCheck={false}
          className={`focus-ring h-10 w-full rounded-xl border bg-background px-3 font-mono text-[12.5px] uppercase outline-none ${
            valid ? "border-white/10" : "border-destructive/40"
          }`}
          placeholder="#6366f1"
        />
      </div>
      {!valid && text.length > 0 && (
        <p className="mt-1 text-[10.5px] text-destructive">Use a 6-digit hex, e.g. #6366f1</p>
      )}
    </div>
  );
}

/* ------------------------------ Typography --------------------------- */

function TypographySection() {
  const brand = useAppStore((s) => s.brand);
  const updateBrand = useAppStore((s) => s.updateBrand);

  return (
    <section className="glass-panel rounded-3xl p-5">
      <SectionHeading
        title="Typography"
        subtitle="One choice sets both the display and body fonts."
      />

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {FONT_PAIRINGS.map((p) => {
          const active = p.id === brand.fontPairing;
          return (
            <button
              key={p.id}
              onClick={() => updateBrand({ fontPairing: p.id })}
              className={`focus-ring flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                active
                  ? "border-primary/40 bg-primary/5"
                  : "border-white/8 bg-white/[0.02] hover:border-white/15"
              }`}
            >
              <span
                className="grid size-11 shrink-0 place-items-center rounded-lg border border-white/10 bg-black/40 text-[20px] font-extrabold leading-none text-foreground"
                style={{
                  fontFamily: `"${p.displayFamily}", system-ui, sans-serif`,
                  fontWeight: p.displayWeight,
                }}
              >
                Aa
              </span>
              <div className="min-w-0">
                <div className="text-[12.5px] font-bold">{p.label}</div>
                <div className="mt-0.5 text-[10.5px] text-muted-foreground">{p.vibe}</div>
                <div className="mt-1 text-[10px] text-muted-foreground/70">
                  {p.displayFamily} · {p.bodyFamily}
                </div>
              </div>
              {active && <Check className="ml-auto size-3.5 shrink-0 text-primary" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------- Business ---------------------------- */

function BusinessSection() {
  const business = useAppStore((s) => s.business);
  const updateBusiness = useAppStore((s) => s.updateBusiness);
  const brand = useAppStore((s) => s.brand);
  const updateBrand = useAppStore((s) => s.updateBrand);

  const fields: {
    key: keyof typeof business;
    label: string;
    placeholder: string;
    multiline?: boolean;
  }[] = [
    { key: "name", label: "Business name", placeholder: "e.g. Glow & Co." },
    { key: "niche", label: "Niche", placeholder: "e.g. Natural skincare" },
    {
      key: "audience",
      label: "Audience",
      placeholder: "e.g. Women 25–40 who care about clean ingredients",
      multiline: true,
    },
    {
      key: "offer",
      label: "Current offer",
      placeholder: "e.g. 20% off the weekend essentials bundle",
      multiline: true,
    },
    {
      key: "tone",
      label: "Brand style / tone",
      placeholder: "e.g. Minimal, warm, premium",
      multiline: true,
    },
  ];

  return (
    <section className="glass-panel rounded-3xl p-5">
      <SectionHeading
        title="Business profile"
        subtitle="Used by the copy writer to keep headlines on-brand."
      />

      <div className="mt-4 space-y-3">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
              {f.label}
            </label>
            {f.multiline ? (
              <textarea
                rows={2}
                value={business[f.key]}
                onChange={(e) => updateBusiness({ [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="focus-ring mt-1.5 w-full rounded-xl border border-white/10 bg-background px-3 py-2 text-[12.5px] outline-none placeholder:text-muted-foreground/60"
              />
            ) : (
              <input
                type="text"
                value={business[f.key]}
                onChange={(e) => updateBusiness({ [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="focus-ring mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-background px-3 text-[12.5px] outline-none placeholder:text-muted-foreground/60"
              />
            )}
          </div>
        ))}

        <div>
          <label className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
            Brand display name (optional)
          </label>
          <input
            type="text"
            value={brand.brandName}
            onChange={(e) => updateBrand({ brandName: e.target.value })}
            placeholder="e.g. GLOW & CO"
            className="focus-ring mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-background px-3 text-[12.5px] outline-none placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
        <button
          onClick={() => {
            if (confirm("Reset brand kit to defaults? This does not affect existing flyers.")) {
              useAppStore.getState().clearBrand();
            }
          }}
          className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-[11.5px] font-semibold text-muted-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
        >
          <RotateCcw className="size-3.5" /> Reset brand kit
        </button>
        <SavedPill />
      </div>
    </section>
  );
}

function SavedPill() {
  const configured = useAppStore((s) => s.brand.configured);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
        configured
          ? "border-success/25 bg-success/10 text-success"
          : "border-white/10 bg-white/5 text-muted-foreground"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${configured ? "bg-success" : "bg-muted-foreground"}`}
      />
      {configured ? "Saved" : "Not configured"}
    </span>
  );
}

/* ------------------------------- Preview ----------------------------- */

function PreviewPanel() {
  const brand = useAppStore((s) => s.brand);
  const pairing = getFontPairing(brand.fontPairing);
  const ctaText = contrastText(brand.primaryColor);

  const sampleHeadline = brand.brandName
    ? `${brand.brandName.trim()}, made for you.`
    : "A headline styled by your brand kit.";

  return (
    <section className="glass-panel rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
          Sample preview
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9.5px] font-semibold text-muted-foreground">
          Not a real ad
        </span>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/8">
        <div className="relative aspect-square w-full">
          <img
            src={sampleBg}
            alt="Sample background"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          {/* logo chip */}
          {brand.logoDataUrl && (
            <div className="absolute left-5 top-5 rounded-xl bg-black/35 p-2 backdrop-blur">
              <img
                src={brand.logoDataUrl}
                alt="Logo"
                className="max-h-10 max-w-[88px] object-contain"
              />
            </div>
          )}

          {/* content */}
          <div className="absolute inset-x-5 bottom-5">
            <div className="h-1 w-14 rounded-full" style={{ background: brand.primaryColor }} />
            <div
              className="mt-3 text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{ color: brand.primaryColor }}
            >
              SPONSORED
            </div>
            <h3
              className="mt-2 text-2xl font-extrabold leading-[1.05] text-white sm:text-3xl"
              style={{
                fontFamily: `"${pairing.displayFamily}", system-ui, sans-serif`,
                fontWeight: pairing.displayWeight,
              }}
            >
              {sampleHeadline}
            </h3>
            <div
              className="mt-3 inline-block rounded-full px-3 py-1.5 text-[11px] font-extrabold"
              style={{
                background: brand.primaryColor,
                color: ctaText,
                fontFamily: `"${pairing.bodyFamily}", system-ui, sans-serif`,
              }}
            >
              Explore the ritual →
            </div>
            {brand.brandName && (
              <div
                className="mt-3 text-right text-[10px] uppercase tracking-[0.18em] text-white/70"
                style={{ fontFamily: `"${pairing.bodyFamily}", system-ui, sans-serif` }}
              >
                {brand.brandName}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {brand.configured && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-[11px] text-muted-foreground"
          >
            Newly generated flyers will use this identity. Existing flyers keep their original look.
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 className="font-display text-[15px] font-bold tracking-tight">{title}</h2>
      {subtitle && <p className="mt-0.5 text-[11.5px] text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
