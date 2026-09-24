import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Upload, X, Wand2, Check, RotateCcw, AlertTriangle, Info } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { processLogoFile, removeLogoBackground } from "@/lib/image-utils";

interface Draft {
  original: string; // data URL of the raw upload (compressed)
  processed: string | null; // data URL of background-removed version
}

export function LogoEditor() {
  const brand = useAppStore((s) => s.brand);
  const updateBrand = useAppStore((s) => s.updateBrand);
  const inputRef = useRef<HTMLInputElement>(null);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [tolerance, setTolerance] = useState(42);

  // Show the draft if the user is mid-edit, otherwise the saved logo
  const savedLogo = brand.logoDataUrl;
  const previewing = draft ?? (savedLogo ? { original: savedLogo, processed: null } : null);

  useEffect(() => {
    if (!draft) return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setWarning(null);
    setBusy(true);
    try {
      const result = await processLogoFile(file);
      if (result.aspect > 4 || result.aspect < 0.25) {
        setWarning(
          "Your logo is very wide or tall — it may appear small when placed on the flyer.",
        );
      }
      setDraft({ original: result.dataUrl, processed: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const runRemoveBackground = async () => {
    if (!draft?.original) return;
    setRemoving(true);
    setError(null);
    try {
      const processed = await removeLogoBackground(draft.original, tolerance);
      // Sanity check: does the result have any non-transparent pixels?
      const stillOpaque = await hasAnyOpaquePixel(processed);
      if (!stillOpaque)
        throw new Error("Everything was removed. Lower the tolerance or keep the original.");
      setDraft({ ...draft, processed });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Background removal failed.");
    } finally {
      setRemoving(false);
    }
  };

  const applyProcessed = () => {
    if (!draft?.processed) return;
    updateBrand({ logoDataUrl: draft.processed });
    setDraft(null);
  };

  const keepOriginal = () => {
    if (!draft) return;
    updateBrand({ logoDataUrl: draft.original });
    setDraft(null);
  };

  const undo = () => setDraft(null);

  const removeSaved = () => {
    updateBrand({ logoDataUrl: null });
    setDraft(null);
    setError(null);
    setWarning(null);
  };

  const hasDraft = draft !== null;
  const hasProcessed = draft?.processed !== null && draft?.processed !== undefined;

  return (
    <section className="glass-panel rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-[15px] font-bold tracking-tight">Logo</h2>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            PNG, JPEG, WebP, or SVG. Max 8 MB. SVG is rasterized for safety.
          </p>
        </div>
        {hasDraft && (
          <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-primary">
            Editing
          </span>
        )}
      </div>

      {/* Current / preview row */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {/* Original side */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Original
          </div>
          <div className="mt-2 grid aspect-square w-full place-items-center overflow-hidden rounded-2xl border border-white/10 bg-black/40">
            {previewing?.original ? (
              <img
                src={previewing.original}
                alt="Original logo"
                className="max-h-[80%] max-w-[80%] object-contain"
              />
            ) : (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                No logo
              </span>
            )}
          </div>
        </div>

        {/* Processed side — checkerboard so transparency is obvious */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {hasProcessed ? "Processed" : "Preview"}
          </div>
          <div className="checkerboard mt-2 grid aspect-square w-full place-items-center overflow-hidden rounded-2xl border border-white/10">
            {hasProcessed && previewing?.processed ? (
              <img
                src={previewing.processed}
                alt="Processed logo"
                className="max-h-[80%] max-w-[80%] object-contain"
              />
            ) : previewing?.original ? (
              <img
                src={previewing.original}
                alt="Preview"
                className="max-h-[80%] max-w-[80%] object-contain opacity-60"
              />
            ) : (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                —
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tolerance slider — only when a draft is active */}
      {hasDraft && (
        <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] p-3">
          <div className="flex items-center justify-between text-[10.5px]">
            <span className="font-bold uppercase tracking-wider text-muted-foreground">
              Tolerance
            </span>
            <span className="font-mono text-muted-foreground">{tolerance}</span>
          </div>
          <input
            type="range"
            min={8}
            max={100}
            value={tolerance}
            onChange={(e) => setTolerance(Number(e.target.value))}
            className="focus-ring mt-2 w-full accent-primary"
            aria-label="Background removal tolerance"
          />
          <p className="mt-1.5 text-[10.5px] leading-snug text-muted-foreground">
            Removes the edge-connected background color only. Internal white shapes stay intact.
            Works well for solid-background logos; complex photos may need a designed transparent
            PNG.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={onFile}
          className="hidden"
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy || removing}
          className="focus-ring inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-[12px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          <Upload className="size-3.5" />
          {busy ? "Processing…" : previewing?.original ? "Replace logo" : "Upload logo"}
        </button>

        {hasDraft && !hasProcessed && (
          <button
            onClick={runRemoveBackground}
            disabled={removing || busy}
            className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[12px] font-semibold text-foreground transition-colors hover:bg-white/[0.06] disabled:opacity-60"
          >
            <Wand2 className="size-3.5" />
            {removing ? "Removing…" : "Remove background"}
          </button>
        )}

        {hasProcessed && (
          <>
            <button
              onClick={applyProcessed}
              className="focus-ring inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-[12px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90"
            >
              <Check className="size-3.5" /> Use processed
            </button>
            <button
              onClick={keepOriginal}
              className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[12px] font-semibold text-foreground transition-colors hover:bg-white/[0.06]"
            >
              Keep original
            </button>
            <button
              onClick={runRemoveBackground}
              disabled={removing}
              className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[12px] font-semibold text-foreground transition-colors hover:bg-white/[0.06] disabled:opacity-60"
            >
              <Wand2 className="size-3.5" /> Retry
            </button>
          </>
        )}

        {hasDraft && (
          <button
            onClick={undo}
            className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[12px] font-semibold text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
          >
            <RotateCcw className="size-3.5" /> Undo
          </button>
        )}

        {!hasDraft && savedLogo && (
          <button
            onClick={removeSaved}
            className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[12px] font-semibold text-muted-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="size-3.5" /> Remove
          </button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-[11.5px] text-destructive">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" /> <span>{error}</span>
        </div>
      )}
      {warning && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-[11.5px] text-warning">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" /> <span>{warning}</span>
        </div>
      )}
      {!hasDraft && savedLogo && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2 text-[11px] text-muted-foreground">
          <Info className="mt-0.5 size-3 shrink-0 text-primary" />
          <span>Saved logo is used on newly generated flyers.</span>
        </div>
      )}
    </section>
  );
}

/** Quick check whether a data URL contains at least one non-transparent pixel. */
async function hasAnyOpaquePixel(dataUrl: string): Promise<boolean> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Load failed."));
    el.src = dataUrl;
  });
  const c = document.createElement("canvas");
  const scale = Math.min(1, 128 / Math.max(img.naturalWidth, img.naturalHeight));
  c.width = Math.max(1, Math.round(img.naturalWidth * scale));
  c.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = c.getContext("2d");
  if (!ctx) return true;
  ctx.drawImage(img, 0, 0, c.width, c.height);
  const data = ctx.getImageData(0, 0, c.width, c.height).data;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i]! > 12) return true;
  }
  return false;
}
