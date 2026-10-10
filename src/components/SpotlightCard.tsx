import { useRef, forwardRef, useImperativeHandle, type ReactNode } from "react";
import "./SpotlightCard.css";

export interface SpotlightCardProps {
  children?: ReactNode;
  className?: string;
  spotlightColor?: string;
}

export interface SpotlightCardHandle {
  /** Imperatively set the spotlight position (in px, relative to this card's own box) — no React re-render involved, so it stays in sync even during fast cursor movement. */
  setSpotlight: (x: number, y: number) => void;
}

const SpotlightCard = forwardRef<SpotlightCardHandle, SpotlightCardProps>(
  ({ children, className = "", spotlightColor = "rgba(255, 255, 255, 0.25)" }, ref) => {
    const divRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      setSpotlight: (x, y) => {
        const el = divRef.current;
        if (!el) return;
        el.style.setProperty("--mouse-x", `${x}px`);
        el.style.setProperty("--mouse-y", `${y}px`);
        el.style.setProperty("--spotlight-color", spotlightColor);
      },
    }));

    // Position and hover-opacity are driven externally (see setSpotlight above / the
    // .card-spotlight:hover CSS rule) rather than by this element's own mousemove/rect,
    // since a caller that tilts this card in 3D would otherwise measure against its own
    // (rotated) bounding box, which no longer maps 1:1 to the flat coordinate space the
    // background gradient paints in.
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const el = divRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
      el.style.setProperty("--spotlight-color", spotlightColor);
    };

    return (
      <div ref={divRef} onMouseMove={handleMouseMove} className={`card-spotlight ${className}`}>
        {children}
      </div>
    );
  }
);

export default SpotlightCard;
