import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight, TrendingUp, X } from "lucide-react";
import MagicBento from "@/components/MagicBento";
import ModernButton from "@/components/ModernButton";
import LogoLoop from "@/components/LogoLoop";
import ReviewPriceBox from "@/components/ReviewPriceBox";
import { BUY_GAME, GAME_REVIEW, LIVEOPS, PARTIAL_BUY, PTR_SUPPORT, SOCIAL_MEDIA } from "@/offers";

const card = "rounded-[var(--x-radius)] border-2 border-[var(--x-card-border)] bg-[var(--x-card)] text-[var(--x-card-fg)]";
const mono = "font-[family-name:var(--x-font-mono)]";

type OpenFn = (index: number) => void;

// how many PTR thumbnails the cards show; the rest are in the viewer
const PREVIEW = 3;

// 640px preview copy of a PTR image (full size only loads in the viewer)
const small = (src: string) => src.replace(/\.webp$/, "-sm.webp");

// PTR Support preview: one large thumbnail + two stacked beside it, no overlap so nothing is
// hidden or cropped (cells keep 16:9). Each opens the viewer at that image; "+N" on the last.
function ThumbPreview({ className = "", onOpen }: { className?: string; onOpen: OpenFn }) {
  const thumbs = PTR_SUPPORT.images.slice(0, PREVIEW);
  const more = PTR_SUPPORT.images.length - thumbs.length;
  const [main, ...side] = thumbs;
  const tile = "group/t relative block overflow-hidden rounded-xl ring-1 ring-white/15 shadow-lg cursor-zoom-in";
  const img = "h-full w-full object-cover transition-transform duration-500 group-hover/t:scale-105";
  return (
    <div className={`grid grid-cols-[2fr_1fr] gap-2 ${className}`} onClick={(e) => e.stopPropagation()}>
      <button type="button" onClick={() => onOpen(0)} aria-label="View thumbnail 1" className={`${tile} row-span-2 aspect-video`}>
        <img src={small(main)} alt="" loading="lazy" decoding="async" className={img} />
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-[var(--x-btn-a)] px-2.5 py-0.5 text-xs font-bold text-white shadow">
          <TrendingUp className="h-3.5 w-3.5" /> PTR
        </span>
      </button>
      {side.map((src, j) => {
        const i = j + 1;
        const last = i === thumbs.length - 1 && more > 0;
        return (
          <button key={src} type="button" onClick={() => onOpen(last ? PREVIEW : i)} aria-label={last ? `View all ${PTR_SUPPORT.images.length} thumbnails` : `View thumbnail ${i + 1}`} className={tile}>
            <img src={small(src)} alt="" loading="lazy" decoding="async" className={img} />
            {last && <span className="absolute inset-0 grid place-items-center bg-black/55 text-lg font-bold text-white">+{more}</span>}
          </button>
        );
      })}
    </div>
  );
}

// The two PTR Support price options, side by side; the first is featured (gradient rim + tag). Clicking one goes to Contact.
function PtrPricing({ className = "" }: { className?: string }) {
  return (
    <div className={`grid gap-3 pt-2 sm:grid-cols-2 ${className}`}>
      {PTR_SUPPORT.plans.map((p, i) => (
        <a
          key={p.key}
          href="#contact"
          onClick={(e) => e.stopPropagation()}
          className={`group/plan relative flex flex-col rounded-[calc(var(--x-radius)*0.7)] p-4 transition-colors ${
            i === 0 ? "x-rim" : "border border-[var(--x-card-border)] hover:border-[color-mix(in_srgb,var(--x-accent)_60%,transparent)]"
          }`}
        >
          {i === 0 && (
            <span className="absolute -top-2.5 right-3 rounded-full bg-[linear-gradient(90deg,var(--x-btn-a),var(--x-btn-b))] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--x-on-accent)] shadow-lg">
              Most popular
            </span>
          )}
          <span className="text-sm font-semibold">{p.name}</span>
          <span className="mt-1 flex items-baseline gap-1.5">
            {i === 0 ? (
              // featured plan: white → silver metallic price with a passing glint
              <span className="x-heading x-silver-text !normal-case !tracking-tight text-4xl leading-[1.15] tabular-nums drop-shadow-[0_0_12px_rgba(255,255,255,0.18)]">{p.price}</span>
            ) : (
              <span className="x-heading !normal-case !tracking-normal text-3xl tabular-nums">{p.price}</span>
            )}
            <span className="text-sm text-[var(--x-card-muted)]">{p.per}</span>
          </span>
          <span className="mt-1 text-xs text-[var(--x-card-muted)]">{p.note}</span>
        </a>
      ))}
    </div>
  );
}

// Full-screen viewer for the PTR Support thumbnails: arrows / ←→ / swipe-free thumbnail strip,
// Esc or backdrop closes. Only the current image and its neighbours are fetched.
function PtrGallery({ index, onIndex, onClose }: { index: number | null; onIndex: (i: number) => void; onClose: () => void }) {
  const imgs = PTR_SUPPORT.images;
  const open = index !== null;
  const [dir, setDir] = useState(1);
  const go = useCallback(
    (d: number) => {
      if (index === null) return;
      setDir(d);
      onIndex((index + d + imgs.length) % imgs.length);
    },
    [index, imgs.length, onIndex],
  );

  useEffect(() => {
    if (!open) return;
    // capture phase + stopImmediatePropagation so ←/→ don't also switch the page style
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else return;
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    window.addEventListener("keydown", onKey, true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, go, onClose]);

  // warm the neighbours so arrowing feels instant
  useEffect(() => {
    if (index === null) return;
    [index + 1, index - 1].forEach((i) => { new Image().src = imgs[(i + imgs.length) % imgs.length]; });
  }, [index, imgs]);

  // portal to the page root (the [data-style] element, so theme vars still apply) to sit above
  // the nav and style switcher instead of inside the content's stacking context
  const root = document.querySelector<HTMLElement>("[data-style]") ?? document.body;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-xl text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="PTR Support thumbnails"
        >
          <div className="flex items-center justify-between gap-4 px-4 md:px-8 py-4" onClick={(e) => e.stopPropagation()}>
            <div>
              <div className="x-heading !normal-case text-xl md:text-2xl">{PTR_SUPPORT.title}</div>
              <div className={`${mono} text-xs text-white/60`}>{PTR_SUPPORT.subtitle} · {index! + 1} / {imgs.length}</div>
            </div>
            <button onClick={onClose} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-4 md:px-20 min-h-0">
            <div
              className="relative aspect-video max-w-5xl overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/15"
              style={{ width: "min(100%, calc((100svh - 19rem) * 16 / 9))" }}
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence initial={false} custom={dir}>
                <motion.img
                  key={index}
                  src={imgs[index!]}
                  alt={`Thumbnail ${index! + 1}`}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-contain"
                  custom={dir}
                  initial={{ opacity: 0, x: `${dir * 8}%` }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: `${dir * -8}%` }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                />
              </AnimatePresence>
            </div>
            {imgs.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous" className="absolute left-2 md:left-6 grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next" className="absolute right-2 md:right-6 grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          <div className="flex flex-col items-center gap-4 px-4 py-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex max-w-full gap-2 overflow-x-auto p-1">
              {imgs.map((src, i) => (
                <button
                  key={src}
                  onClick={() => { setDir(i > index! ? 1 : -1); onIndex(i); }}
                  aria-label={`Thumbnail ${i + 1}`}
                  className={`shrink-0 overflow-hidden rounded-lg transition-all ${i === index ? "ring-2 ring-white opacity-100" : "opacity-50 hover:opacity-90"}`}
                >
                  <img src={small(src)} alt="" loading="lazy" decoding="async" className="aspect-video w-24 md:w-32 object-cover" />
                </button>
              ))}
            </div>
            <p className="max-w-xl text-center text-sm md:text-base text-white/70">{PTR_SUPPORT.text}</p>
            <a href="#contact" onClick={onClose} className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black hover:scale-105 transition-transform">
              Get thumbnails like these <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    root,
  );
}

function OfferButton({ label }: { label: string }) {
  return (
    <a
      href="#contact"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--x-btn-a)] px-5 py-2.5 text-sm font-semibold text-[var(--x-on-accent)] transition-[filter] hover:brightness-110"
    >
      {label} <ArrowRight className="h-4 w-4" />
    </a>
  );
}

type Item = { key: string; title: string; text: string; icon: React.ComponentType<{ className?: string }> };


// "What's included" list used by the LiveOps Review, LiveOps and Buy Your Game cards.
// oneLine (Our Services only) keeps each description on a single line from tablet width up.
function ItemList({ items, oneLine = false }: { items: Item[]; oneLine?: boolean }) {
  return (
    <ul className="divide-y divide-[var(--x-card-border)] border-t border-[var(--x-card-border)]">
      {items.map(({ key, title, text, icon: Icon }) => (
        <li key={key} className="flex items-start gap-3 py-4">
          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--x-accent)]" />
          <div className="min-w-0">
            <div className="font-semibold">{title}</div>
            <div className={`text-sm text-[var(--x-card-muted)] ${oneLine ? "sm:truncate" : ""}`} title={oneLine ? text : undefined}>{text}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function CardHead({ title, subtitle, text }: { title: string; subtitle?: string; text?: string }) {
  return (
    <>
      <h3 className="x-heading !normal-case text-4xl md:text-5xl">{title}</h3>
      {subtitle && <p className="mt-1 text-lg font-semibold text-[var(--x-genre)]">{subtitle}</p>}
      {text && <p className="mt-3 text-[var(--x-card-muted)] md:text-lg">{text}</p>}
    </>
  );
}

// Wall of every PTR thumbnail: two rows drifting in opposite directions; hover pauses a row,
// click opens the viewer on that thumbnail.
function ThumbWall({ onOpen }: { onOpen: OpenFn }) {
  const imgs = PTR_SUPPORT.images;
  const half = Math.ceil(imgs.length / 2);
  const rows = [imgs.slice(0, half).map((src, i) => ({ src, i })), imgs.slice(half).map((src, i) => ({ src, i: i + half }))];
  return (
    <div className="mt-4 overflow-hidden rounded-[var(--x-radius)] border-2 border-[var(--x-card-border)] bg-[var(--x-card)] py-6 md:py-8">
      <div className="mb-5 flex items-baseline justify-between gap-4 px-6 md:px-9">
        <h3 className="x-heading !normal-case text-2xl md:text-3xl">Thumbnails we've made</h3>
        <span className={`${mono} shrink-0 text-xs md:text-sm text-[var(--x-card-muted)]`}>{imgs.length} thumbnails · click to view</span>
      </div>
      <div className="flex flex-col gap-3 md:gap-4">
        {rows.map((row, r) => (
          <LogoLoop
            key={r}
            logos={row.map(({ src, i }) => ({
              node: (
                <button
                  type="button"
                  onClick={() => onOpen(i)}
                  aria-label={`View thumbnail ${i + 1}`}
                  className="group/t block cursor-zoom-in overflow-hidden rounded-xl ring-1 ring-white/10 transition-shadow duration-300 hover:ring-2 hover:ring-[var(--x-accent)] hover:shadow-[0_8px_30px_-8px_var(--x-accent)]"
                >
                  <img
                    src={small(src)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="aspect-video h-[120px] md:h-[170px] w-auto object-cover transition-transform duration-500 group-hover/t:scale-105"
                  />
                </button>
              ),
            }))}
            speed={r === 0 ? 34 : 28}
            direction={r === 0 ? "left" : "right"}
            logoHeight={170}
            gap={14}
            pauseOnHover
            fadeOut
            fadeOutColor="#1c1c1e"
            ariaLabel={r === 0 ? "Thumbnails, row 1" : "Thumbnails, row 2"}
          />
        ))}
      </div>
    </div>
  );
}

// Services: PTR Support + Game Review, side by side.
export default function ServicesSection({ glow }: { glow: string }) {
  const [viewing, setViewing] = useState<number | null>(null);
  return (
    <div className="mt-10">
      <MagicBento
        glowColor={glow}
        particleCount={8}
        className="gap-4 md:grid-cols-2"
        cards={[
          {
            key: "ptr",
            className: `${card} p-7 md:p-9`,
            children: (
              <div className="relative z-[2] flex h-full cursor-pointer flex-col" onClick={() => setViewing(0)}>
                <ThumbPreview className="mb-6" onOpen={setViewing} />
                <CardHead title={PTR_SUPPORT.title} subtitle={PTR_SUPPORT.subtitle} text={PTR_SUPPORT.text} />
                <PtrPricing className="mt-auto pt-7" />
              </div>
            ),
          },
          {
            key: "review",
            className: `${card} p-7 md:p-9`,
            children: (
              <div className="relative z-[2] flex h-full flex-col">
                <CardHead title={GAME_REVIEW.title} subtitle={GAME_REVIEW.subtitle} />
                <div className="mt-6"><ItemList items={GAME_REVIEW.parts} oneLine /></div>
                <div className="mt-auto pt-6">
                  <ReviewPriceBox price={GAME_REVIEW.price}>
                    <ModernButton href="#contact" onClick={(e) => e.stopPropagation()}>{GAME_REVIEW.cta}</ModernButton>
                  </ReviewPriceBox>
                </div>
              </div>
            ),
          },
        ]}
      />
      <ThumbWall onOpen={setViewing} />
      {/* not offered yet: quieter card (dashed border, no glow/particles, no button) */}
      <div className={`${card} mt-4 flex flex-col gap-3 border-dashed !bg-[color-mix(in_srgb,var(--x-card)_60%,transparent)] p-7 md:flex-row md:items-center md:justify-between md:p-9`}>
        <div>
          <h3 className="x-heading !normal-case text-3xl md:text-4xl text-[var(--x-card-fg)]/80">{SOCIAL_MEDIA.title}</h3>
          <p className="mt-1 text-[var(--x-card-muted)]">{SOCIAL_MEDIA.subtitle}</p>
        </div>
        <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-[rgba(var(--x-accent-rgb),0.4)] bg-[rgba(var(--x-accent-rgb),0.1)] px-4 py-2 text-sm font-semibold text-[var(--x-genre)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--x-accent)] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--x-accent)]" />
          </span>
          Coming soon
        </span>
      </div>
      {/* outside the cards: a transformed ancestor would break position: fixed */}
      <PtrGallery index={viewing} onIndex={setViewing} onClose={() => setViewing(null)} />
    </div>
  );
}

// Draggable stake picker (Partial Buyout card): a 0–100% ownership bar where the handle can only
// move between min and max. Blue = the stake we buy, grey = what the owner keeps.
function StakeRange({ min, max, value, onChange }: { min: number; max: number; value: number; onChange: (v: number) => void }) {
  return (
    <div className="mt-6 select-none" onClick={(e) => e.stopPropagation()}>
      <div className="mb-3 flex items-baseline justify-between text-sm tabular-nums">
        <span>
          We buy <b className="x-heading !normal-case !tracking-normal text-2xl text-[var(--x-genre)]">{value}%</b>
        </span>
        <span className="text-[var(--x-card-muted)]">
          You keep <b className="font-semibold text-[var(--x-card-fg)]">{100 - value}%</b>
        </span>
      </div>
      <div className="relative h-3 rounded-full bg-white/[0.07] ring-1 ring-inset ring-white/10">
        {/* the range that can be picked */}
        <span className="absolute inset-y-0 rounded-full bg-[rgba(var(--x-accent-rgb),0.15)]" style={{ left: `${min}%`, width: `${max - min}%` }} />
        {/* our stake, from 0 up to the handle */}
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,var(--x-accent),var(--x-accent-2))] shadow-[0_0_16px_rgba(var(--x-accent-rgb),0.55)]"
          style={{ width: `${value}%` }}
        />
        {/* native slider over just the min–max part, widened by one thumb so its centre lands exactly on min/max */}
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="Stake we buy (%)"
          className="x-stake absolute top-1/2 h-6 -translate-y-1/2 cursor-grab active:cursor-grabbing"
          style={{ left: `calc(${min}% - 11px)`, width: `calc(${max - min}% + 22px)` }}
        />
      </div>
      <div className="relative mt-2 h-4 text-xs text-[var(--x-card-muted)] tabular-nums">
        <span className="absolute left-0">0%</span>
        <span className="absolute -translate-x-1/2" style={{ left: `${min}%` }}>{min}%</span>
        <span className="absolute -translate-x-1/2" style={{ left: `${max}%` }}>{max}%</span>
        <span className="absolute right-0">100%</span>
      </div>
    </div>
  );
}

// How we partner: LiveOps on the left; Full Buyout and Partial Buyout stacked on the right.
export function PartnerSection({ glow }: { glow: string }) {
  const [stake, setStake] = useState(Math.round((PARTIAL_BUY.min + PARTIAL_BUY.max) / 2));
  return (
    <div className="mt-10">
      <MagicBento
        glowColor={glow}
        particleCount={8}
        className="gap-4 md:grid-cols-2"
        cards={[
          {
            key: "liveops",
            className: `${card} p-7 md:p-9 md:row-span-2`,
            children: (
              <div className="relative z-[2] flex h-full flex-col">
                <CardHead title={LIVEOPS.title} />
                <div className="mt-6"><ItemList items={LIVEOPS.parts} /></div>
                <div className="mt-auto pt-6"><OfferButton label="Partner with us" /></div>
              </div>
            ),
          },
          {
            key: "buy",
            className: `${card} p-7 md:p-9`,
            children: (
              <div className="relative z-[2] flex h-full flex-col">
                <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
                  <h3 className="x-heading !normal-case text-4xl md:text-5xl">{BUY_GAME.title}</h3>
                  <span className="x-heading !normal-case !tracking-tight text-3xl md:text-4xl tabular-nums text-[var(--x-genre)]">100%</span>
                </div>
                <div className="mt-6"><ItemList items={BUY_GAME.points} /></div>
                <div className="mt-auto pt-6"><OfferButton label={BUY_GAME.cta} /></div>
              </div>
            ),
          },
          {
            key: "partial",
            className: `${card} p-7 md:p-9`,
            children: (
              <div className="relative z-[2] flex h-full flex-col">
                <h3 className="x-heading !normal-case text-4xl md:text-5xl">{PARTIAL_BUY.title}</h3>
                <StakeRange min={PARTIAL_BUY.min} max={PARTIAL_BUY.max} value={stake} onChange={setStake} />
                <div className="mt-auto pt-6"><OfferButton label={`${PARTIAL_BUY.cta} for ${stake}%`} /></div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
