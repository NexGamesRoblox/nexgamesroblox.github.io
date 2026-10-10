import type { MouseEvent, ReactNode } from "react";
import { ArrowRight } from "lucide-react";

// Gradient pill with a soft glow, a light sweep across it on hover, and the arrow in its own
// little circle that nudges forward. Used for the main calls to action.
export default function ModernButton({
  href,
  children,
  size = "md",
  onClick,
  className = "",
}: {
  href: string;
  children: ReactNode;
  size?: "sm" | "md";
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}) {
  const sm = size === "sm";
  return (
    <a
      href={href}
      onClick={onClick}
      className={`group/btn relative isolate inline-flex w-fit items-center overflow-hidden rounded-full bg-[linear-gradient(90deg,var(--x-btn-a),var(--x-btn-b))] font-semibold text-[var(--x-on-accent)] shadow-[0_8px_24px_-8px_rgba(var(--x-accent-rgb),0.8),inset_0_1px_0_rgba(255,255,255,0.25)] ring-1 ring-white/15 transition-[transform,box-shadow] duration-300 hover:-translate-y-px hover:shadow-[0_12px_32px_-8px_rgba(var(--x-accent-rgb),0.95),inset_0_1px_0_rgba(255,255,255,0.3)] active:translate-y-0 ${
        sm ? "gap-2 py-1.5 pl-4 pr-1.5 text-sm" : "gap-3 py-2 pl-5 pr-2 text-[15px]"
      } ${className}`}
    >
      {/* light sweep */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/2 -z-10 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/btn:left-[120%] group-hover/btn:opacity-100"
      />
      <span>{children}</span>
      <span
        className={`grid shrink-0 place-items-center rounded-full bg-[var(--x-on-accent)] text-[var(--x-btn-a)] transition-transform duration-300 group-hover/btn:translate-x-0.5 ${
          sm ? "h-6 w-6" : "h-8 w-8"
        }`}
      >
        <ArrowRight className={`${sm ? "h-3.5 w-3.5" : "h-4 w-4"} transition-transform duration-300 group-hover/btn:-rotate-45`} />
      </span>
    </a>
  );
}
