import type { ReactNode } from "react";

// LiveOps Review price box: a rising line chart draws itself behind the price, then loops.
export default function ReviewPriceBox({ price, children }: { price: string; children: ReactNode }) {
  return (
    <div className="rv-chart relative isolate flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-[calc(var(--x-radius)*0.7)] px-5 py-4">
      <svg aria-hidden className="pointer-events-none absolute inset-0 -z-10 h-full w-full" viewBox="0 0 400 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="rv-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: "var(--x-accent)" }} stopOpacity="0.35" />
            <stop offset="1" style={{ stopColor: "var(--x-accent)" }} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="rv-chart-area" d="M0 88 L40 82 L80 85 L120 70 L160 74 L200 58 L240 62 L280 40 L320 44 L360 22 L400 12 L400 100 L0 100 Z" fill="url(#rv-area)" />
        <path className="rv-chart-line" d="M0 88 L40 82 L80 85 L120 70 L160 74 L200 58 L240 62 L280 40 L320 44 L360 22 L400 12" fill="none" style={{ stroke: "var(--x-accent-soft)" }} strokeWidth="2" vectorEffect="non-scaling-stroke" pathLength={1} />
      </svg>
      <span className="x-heading x-price-glint !normal-case !tracking-tight text-5xl leading-none tabular-nums drop-shadow-[0_0_18px_rgba(var(--x-accent-rgb),0.35)]">
        {price}
      </span>
      {children}
    </div>
  );
}
