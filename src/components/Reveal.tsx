import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register once on the client
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface RevealProps {
  children: ReactNode;
  /** Stagger delay in seconds */
  delay?: number;
  /** Distance to travel in px */
  y?: number;
  className?: string;
  as?: "div" | "section";
}

export function Reveal({ children, delay = 0, y = 24, className, as = "div" }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !ref.current) return;

    const el = ref.current;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none none",
            once: true,
          },
        },
      );
    });

    return () => ctx.revert();
  }, [delay, y]);

  const Tag = as;
  return (
    <Tag ref={ref as never} className={className} style={{ visibility: "hidden" }}>
      {children}
    </Tag>
  );
}
