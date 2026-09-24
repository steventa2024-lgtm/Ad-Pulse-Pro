import { useEffect, useRef, useState } from "react";

/**
 * Animates a number from 0 → target when the value changes.
 * Handles suffixes like "14.2k" and "3.8%".
 */
export function useCountUp(value: string, duration = 900): string {
  const [display, setDisplay] = useState(value);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    // Parse numeric part + suffix
    const match = value.match(/^([\d.]+)(.*)$/);
    if (!match) {
      setDisplay(value);
      return;
    }

    const target = parseFloat(match[1]!);
    const suffix = match[2] ?? "";
    const decimals = match[1]!.includes(".") ? (match[1]!.split(".")[1]?.length ?? 0) : 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // ease-out-cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = target * eased;
      setDisplay(`${current.toFixed(decimals)}${suffix}`);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, duration]);

  return display;
}
