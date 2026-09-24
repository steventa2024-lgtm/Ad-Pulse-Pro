import type { CSSProperties } from "react";
import type { DemoAd } from "@/lib/demo-ads";
import "./demo-flyer.css";

export function DemoFlyer({ ad, compact = false }: { ad: DemoAd; compact?: boolean }) {
  return (
    <article
      className={`demo-flyer ${compact ? "demo-flyer--compact" : ""}`}
      style={{ "--ad-accent": ad.accent } as CSSProperties}
      aria-label={`${ad.niche} sample ad: ${ad.headline}`}
    >
      <img
        className="demo-flyer__image"
        src={ad.image}
        alt={ad.imageAlt}
        loading={compact ? "lazy" : "eager"}
      />
      <div className="demo-flyer__content">
        <span className="demo-flyer__brand">{ad.brand} · EXAMPLE CREATIVE</span>
        <div className="demo-flyer__copy">
          <h3>{ad.headline}</h3>
          <p>{ad.subline}</p>
          {!compact && (
            <span className="demo-flyer__cta">
              {ad.cta} <span aria-hidden="true">→</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
