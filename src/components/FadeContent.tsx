import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

// Fades (and un-blurs) its children in the first time they scroll into view.
// Plain CSS transition + IntersectionObserver, so no animation library is needed on first load.
export interface FadeContentProps {
  children?: ReactNode;
  blur?: boolean;
  /** ms */
  duration?: number;
  /** ms */
  delay?: number;
  /** how much of the element must be visible before it fades in (0–1) */
  threshold?: number;
  className?: string;
  style?: CSSProperties;
}

export default function FadeContent({ children, blur = false, duration = 1000, delay = 0, threshold = 0.1, className = "", style }: FadeContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  // once shown, drop filter/will-change entirely: a lingering filter creates a backdrop root that
  // breaks backdrop-filter on descendants
  const [settled, setSettled] = useState(false);
  return (
    <div
      ref={ref}
      className={className}
      onTransitionEnd={(e) => { if (e.target === ref.current && shown) setSettled(true); }}
      style={{
        ...style,
        ...(settled
          ? {}
          : {
              opacity: shown ? 1 : 0,
              filter: blur ? (shown ? "blur(0px)" : "blur(10px)") : undefined,
              transition: `opacity ${duration}ms cubic-bezier(0.33, 1, 0.68, 1) ${delay}ms, filter ${duration}ms cubic-bezier(0.33, 1, 0.68, 1) ${delay}ms`,
              willChange: shown ? undefined : "opacity, filter",
            }),
      }}
    >
      {children}
    </div>
  );
}
