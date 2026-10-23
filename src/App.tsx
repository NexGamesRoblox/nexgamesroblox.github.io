import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Clock, Lightbulb, LineChart, MessageCircle, Target, TrendingUp } from "lucide-react";
import DotField from "@/components/DotField";
import ShinyText from "@/components/ShinyText";
import CountUp from "@/components/CountUp";
import FadeContent from "@/components/FadeContent";
import LogoLoop from "@/components/LogoLoop";
import LightRays from "@/components/LightRays";
import ModernButton from "@/components/ModernButton";
import TiltedCard from "@/components/TiltedCard";
import ScrollVelocity from "@/components/ScrollVelocity";
import data from "@/games.json";

type Game = (typeof data.games)[number];

// Sold games keep a card with live stats but stay out of the totals (visits, playing now, live games).
const activeGames = data.games.filter((g) => !("sold" in g));
const activeIds = new Set(activeGames.map((g) => g.universeId));
const sumActive = (r: Record<string, number>) => sum(Object.fromEntries(Object.entries(r).filter(([id]) => activeIds.has(id))));
const isSold = (g: Game) => "sold" in g;

// Electric theme (blue, analogous). Page colours are CSS vars in index.css under [data-style="liveops"];
// this holds what CSS can't reach (canvas/WebGL colours, glow rgb, games-bar fade).
const THEME = {
  bg: "#000000",
  glow: "10, 132, 255",
  rays: "#4da3ff",
  dots: { glow: "#0a84ff", from: "#5a5a5f", to: "#4a4a4f" },
};

// Contact is via Discord. A profile link needs the numeric user ID (Discord → Settings → Advanced →
// Developer Mode, then right-click yourself → Copy User ID). Until it's set, the button copies the
// username and opens Discord.
const DISCORD_USERNAME = "nexgames";
const DISCORD_NAME = "Nex";
const DISCORD_AVATAR = "contact/discord-avatar.webp"; // saved copy of the Discord PFP (CDN links change when the avatar does)
const DISCORD_USER_ID = "434993893671698432";
const DISCORD_URL = DISCORD_USER_ID ? `https://discord.com/users/${DISCORD_USER_ID}` : "https://discord.com/app";

function DiscordIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

// Big Discord button: opens Discord in a new tab and (without a user ID) copies the username so
// it can be pasted straight into "Add Friend".
function DiscordButton() {
  const [copied, setCopied] = useState(false);
  const onClick = () => {
    if (DISCORD_USER_ID) return;
    navigator.clipboard?.writeText(DISCORD_USERNAME).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => { /* clipboard blocked — the username is shown on the button anyway */ });
  };
  return (
    <div className="mt-10 flex flex-col items-center gap-3">
      <a
        href={DISCORD_URL}
        target="_blank"
        rel="noreferrer"
        onClick={onClick}
        aria-label="Message us on Discord"
        className="group inline-flex items-center gap-3.5 rounded-full bg-[#5865F2] py-2.5 pl-2.5 pr-6 text-white shadow-[0_12px_40px_-12px_#5865F2] transition-transform hover:scale-[1.03]"
      >
        <span className="relative shrink-0">
          <img src={DISCORD_AVATAR} alt={`${DISCORD_NAME}'s Discord avatar`} width={52} height={52} className="h-[52px] w-[52px] rounded-full object-cover ring-2 ring-white/80" />
          <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-[#5865F2] ring-2 ring-[#5865F2]">
            <DiscordIcon className="h-3.5 w-3.5" />
          </span>
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70">Message us on Discord</span>
          <span className="text-lg font-bold">{DISCORD_NAME} <span className="font-medium text-white/70">@{DISCORD_USERNAME}</span></span>
        </span>
        <ArrowUpRight className="h-5 w-5 opacity-70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </a>
      <span className="h-5 text-sm text-[var(--x-games-muted)]" aria-live="polite">
        {copied ? "Username copied — paste it into Add Friend in Discord" : DISCORD_USER_ID ? "" : "Click to copy the username and open Discord"}
      </span>
    </div>
  );
}

// 11678901 -> { n: 11.7, unit: "M" } so CountUp can animate the short form
function compact(v: number): { n: number; unit: string } {
  if (v >= 1e9) return { n: Math.round(v / 1e8) / 10, unit: "B" };
  if (v >= 1e6) return { n: Math.round(v / 1e5) / 10, unit: "M" };
  if (v >= 1e3) return { n: Math.round(v / 1e2) / 10, unit: "K" };
  return { n: v, unit: "" };
}

// How long a game has been live, from its Roblox creation date, always in months: "3 months", "13 months".
// Completed months only; it rounds up to the next month once that month is a week or less away
// (2 months 3 weeks shows as 3 months, 2 months 1 week as 2 months). Under a month it shows whole weeks.
function lifespan(created: string): string {
  const from = new Date(created);
  const now = new Date();
  let months = (now.getFullYear() - from.getFullYear()) * 12 + now.getMonth() - from.getMonth();
  if (now.getDate() < from.getDate()) months--;
  const next = new Date(from);
  next.setMonth(from.getMonth() + months + 1);
  if (next.getTime() - now.getTime() <= 7 * 864e5) months++;
  if (months < 1) {
    const weeks = Math.max(1, Math.floor((now.getTime() - from.getTime()) / 6048e5));
    return `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
  }
  return `${months} ${months === 1 ? "month" : "months"}`;
}

// Live player counts and visits (per game + total). Roblox's API has no CORS, so read it through the
// roproxy mirror; until it answers (or if it fails) show the snapshot from npm run update-stats.
type LivePlaying = { total: number; byId: Record<string, number>; visits: number; visitsById: Record<string, number> };

// Live counts come from a third-party mirror, so treat the response as untrusted:
// - only our own universe IDs are read, and only as plain numbers within a sane range
// - each request times out, failures back off (1 → 2 → 4 → 10 min), and polling pauses while the
//   tab is hidden, so the page never hammers the API (and can't be used to)
// - on any problem the last good value (or the build-time snapshot) stays on screen
const LIVE_URL = "https://games.roproxy.com/v1/games";
const MAX_PLAYING = 5_000_000; // more than any Roblox game has ever had; anything above is bogus
const MAX_VISITS = 1e11;
const sum = (r: Record<string, number>) => Object.values(r).reduce((s, n) => s + n, 0);

function useLivePlaying(): LivePlaying {
  const snapshot = (): LivePlaying => {
    const byId = Object.fromEntries(data.games.map((g) => [g.universeId, g.playing]));
    const visitsById = Object.fromEntries(data.games.map((g) => [g.universeId, g.visits]));
    return { total: sumActive(byId), byId, visits: sumActive(visitsById), visitsById };
  };
  const [live, setLive] = useState<LivePlaying>(snapshot);
  useEffect(() => {
    const ours = new Set(data.games.map((g) => g.universeId));
    const url = `${LIVE_URL}?universeIds=${encodeURIComponent([...ours].join(","))}`;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let failures = 0;
    let stopped = false;

    const parse = (j: unknown): LivePlaying | null => {
      const rows = (j as { data?: unknown })?.data;
      if (!Array.isArray(rows)) return null;
      const ok = (n: unknown, max: number): n is number => typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= max;
      const byId: Record<string, number> = {};
      const visitsById: Record<string, number> = {};
      for (const row of rows) {
        const id = String((row as { id?: unknown })?.id ?? "");
        if (!ours.has(id)) continue;
        const n = (row as { playing?: unknown })?.playing;
        const v = (row as { visits?: unknown })?.visits;
        if (ok(n, MAX_PLAYING)) byId[id] = n;
        if (ok(v, MAX_VISITS)) visitsById[id] = v;
      }
      if (Object.keys(byId).length === 0 && Object.keys(visitsById).length === 0) return null;
      const base = snapshot();
      const mergedPlaying = { ...base.byId, ...byId };
      // visits only ever go up; never drop below the build-time snapshot
      const mergedVisits = { ...base.visitsById };
      for (const [id, v] of Object.entries(visitsById)) mergedVisits[id] = Math.max(mergedVisits[id], v);
      return { total: sumActive(mergedPlaying), byId: mergedPlaying, visits: sumActive(mergedVisits), visitsById: mergedVisits };
    };

    const schedule = (ms: number) => {
      clearTimeout(timer);
      if (!stopped) timer = setTimeout(load, ms);
    };

    const load = async () => {
      if (document.hidden) return; // resumes on visibilitychange
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      try {
        const r = await fetch(url, { signal: ctrl.signal, credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store" });
        if (!r.ok || !(r.headers.get("content-type") ?? "").includes("json")) throw new Error(String(r.status));
        const next = parse(await r.json());
        if (!next) throw new Error("bad data");
        failures = 0;
        if (!stopped) setLive(next);
        schedule(60_000);
      } catch {
        failures++;
        schedule(Math.min(60_000 * 2 ** (failures - 1), 600_000));
      } finally {
        clearTimeout(t);
      }
    };

    const onVisible = () => { if (!document.hidden) schedule(0); };
    document.addEventListener("visibilitychange", onVisible);
    load();
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  return live;
}

// Services (bento/particles + PTR viewer) is split into its own chunk and only fetched
// once the visitor scrolls near it.
const ServicesSection = lazy(() => import("@/Services"));
const PartnerSection = lazy(() => import("@/Services").then((m) => ({ default: m.PartnerSection })));

function LazyMount({ children, minHeight, margin = "600px" }: { children: ReactNode; minHeight: number; margin?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || show) return;
    if (!("IntersectionObserver" in window)) { setShow(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShow(true); io.disconnect(); } }, { rootMargin: margin });
    io.observe(el);
    // also mount once the browser is idle after first paint, so section heights are final before
    // anyone clicks a nav link (otherwise smooth-scroll targets shift while the page grows)
    const ric = typeof window.requestIdleCallback === "function";
    const idle = ric ? window.requestIdleCallback(() => setShow(true), { timeout: 2500 }) : setTimeout(() => setShow(true), 1500);
    return () => {
      io.disconnect();
      if (ric) window.cancelIdleCallback(idle as number); else clearTimeout(idle);
    };
  }, [show, margin]);
  return (
    <div ref={ref} style={show ? undefined : { minHeight }}>
      {show && <Suspense fallback={<div style={{ minHeight }} />}>{children}</Suspense>}
    </div>
  );
}

const ABOUT_POINTS = [
  { title: "0 → 15K CCU", text: "Grew +1 Bite Per Click from launch to 15K concurrent players.", icon: TrendingUp },
  { title: "Stat-targeted updates", text: "Each update and change aims at one metric: retention, playtime or revenue.", icon: Target },
  { title: "Measured LiveOps", text: "Every change is tracked, so what works gets doubled down on.", icon: LineChart },
  { title: "Concepts checked first", text: "Game ideas are analysed against real data before they're built.", icon: Lightbulb },
  { title: "Replies within 24h", text: "Usually within 12h. Communication is key.", icon: MessageCircle },
];

const playUrl = (g: Game) => `https://www.roblox.com/games/${g.placeId}`;
const contactHref = "#contact";

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header
      className={`fixed top-0 inset-x-0 z-30 transition-colors duration-300 ${
        scrolled ? "border-b border-[var(--x-stat-border)] bg-[color-mix(in_srgb,var(--x-bg)_82%,transparent)] backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl flex h-16 md:h-20 items-center justify-between gap-4 px-4 md:px-8 text-[var(--x-fg)]">
        <a href="#" aria-label="Nex Games" className="flex items-center gap-2.5">
          <img src="brand/mark-nav.webp" alt="" width={60} height={32} fetchPriority="high" className="h-7 md:h-8 w-auto drop-shadow-[0_0_12px_rgba(10,132,255,0.45)]" />
          <img src="brand/wordmark-nav.webp" alt="Nex Games" width={120} height={20} className="h-5 md:h-6 w-auto" />
        </a>
        <div className="flex items-center gap-5 md:gap-8 text-sm md:text-[15px] font-medium">
          {[["Games", "#games"], ["Services", "#services"], ["Partner", "#partner"], ["About", "#about"]].map(([label, href]) => (
            <a key={href} href={href} className="hidden sm:block opacity-80 hover:opacity-100 hover:text-[var(--x-accent)] transition-colors">{label}</a>
          ))}
          <ModernButton href={contactHref} size="sm">Contact</ModernButton>
        </div>
      </nav>
    </header>
  );
}

function LiveDot({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-flex h-2 w-2 shrink-0 ${className}`}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#30d158] opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#30d158]" />
    </span>
  );
}

function HeroStat({ value, label, suffix = "", delay = 0, live = false }: { value: number; label: string; suffix?: string; delay?: number; live?: boolean }) {
  const c = compact(value);
  return (
    <motion.div
      className="flex flex-col items-center gap-1 px-4 md:px-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="x-heading !normal-case !tracking-normal text-3xl sm:text-4xl md:text-5xl tabular-nums">
        <CountUp to={c.n} duration={1.6} delay={delay} />
        <span className="text-[var(--x-accent)]">{c.unit}{suffix}</span>
      </span>
      <span className="flex items-center gap-1.5 font-[family-name:var(--x-font-mono)] text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[var(--x-muted)]">
        {live && (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#30d158] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#30d158]" />
          </span>
        )}
        {label}
      </span>
    </motion.div>
  );
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

// One word rising into place. No overflow mask, so nothing (descenders, overhangs) gets clipped.
function RiseWord({ children, delay, className = "" }: { children: React.ReactNode; delay: number; className?: string }) {
  return (
    <motion.span
      className={`inline-block ${className}`}
      initial={{ y: "0.45em", opacity: 0, filter: "blur(12px)" }}
      animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.9, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.span>
  );
}

// Rising trend line with an arrowhead, drawn in under "grow.". Scales uniformly (no stretched
// strokes), gradient stroke + soft glow, coloured per style via --x-line-a/b.
function TrendLine({ delay }: { delay: number }) {
  const curve = "M6 42 C 70 42, 110 36, 150 24 C 180 15, 200 10, 226 6";
  const head = "M215.6 16.7 L 228 5.7 L 212.8 -1.1";
  const draw = { duration: 1, delay, ease: [0.65, 0, 0.35, 1] as const };
  const headIn = { duration: 0.35, delay: delay + 0.85, ease: "easeOut" as const };
  return (
    <svg viewBox="0 0 240 48" fill="none" className="pointer-events-none absolute left-[1%] top-[97%] h-auto w-[90%] overflow-visible" aria-hidden>
      <defs>
        <linearGradient id="trend-stroke" x1="0" y1="0" x2="240" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: "var(--x-line-a)" }} />
          <stop offset="1" style={{ stopColor: "var(--x-line-b)" }} />
        </linearGradient>
        <filter id="trend-glow" x="-10%" y="-60%" width="120%" height="220%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <g stroke="url(#trend-stroke)" strokeLinecap="round" strokeLinejoin="round">
        {/* glow underneath */}
        <motion.path d={curve} strokeWidth="9" filter="url(#trend-glow)" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.55 }} transition={draw} />
        <motion.path d={head} strokeWidth="9" filter="url(#trend-glow)" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.55 }} transition={headIn} />
        {/* crisp line on top */}
        <motion.path d={curve} strokeWidth="5" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={draw} />
        <motion.path d={head} strokeWidth="5" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={headIn} />
      </g>
    </svg>
  );
}

// "We make Roblox / games grow." on two balanced lines, with the trend line under "grow."
function Headline() {
  const line1 = ["We", "make", "Roblox"];
  return (
    <h1 className="x-heading x-h1 !normal-case leading-[1.02]">
      <span className="block">
        {line1.map((w, i) => (
          <span key={w}>
            <RiseWord delay={0.15 + i * 0.09}>{w}</RiseWord>
            {i < line1.length - 1 && " "}
          </span>
        ))}
      </span>
      <span className="block">
        <RiseWord delay={0.42}>games</RiseWord>{" "}
        <span className="relative inline-block">
          {/* gradient text only paints inside its box, so pad the box past the g's descender and the period */}
          <RiseWord delay={0.51} className="x-grad-text -mx-[0.06em] -mb-[0.22em] px-[0.06em] pb-[0.22em]">
            grow.
          </RiseWord>
          <TrendLine delay={1.05} />
        </span>
      </span>
    </h1>
  );
}

function SectionTitle({ title, text, fg = "var(--x-games-fg)", muted = "var(--x-games-muted)" }: { title: string; text?: string; fg?: string; muted?: string }) {
  return (
    <FadeContent blur duration={900}>
      <div className="flex flex-col items-center text-center" style={{ color: fg }}>
        <h2 className="x-heading !normal-case text-[2.6rem] sm:text-5xl md:text-7xl leading-[1.02]">{title}</h2>
        {text && <p className="mt-4 max-w-2xl text-base md:text-lg font-medium" style={{ color: muted }}>{text}</p>}
        <div className="mt-6 h-[3px] w-16 rounded-full" style={{ background: "var(--x-bar)" }} />
      </div>
    </FadeContent>
  );
}

// One game stat: white number with the unit in the blue accent.
function GameStat({ value, unit, label, live }: { value: number; unit: string; label: string; live?: boolean }) {
  return (
    <div>
      <div className="x-heading !normal-case !tracking-normal text-2xl sm:text-3xl lg:text-4xl tabular-nums text-[var(--x-fg)]">
        <CountUp to={value} duration={1.6} /><span className="text-[var(--x-accent)]">{unit}</span>
      </div>
      <div className="mt-1 flex items-center gap-1.5 font-[family-name:var(--x-font-mono)] text-xs md:text-sm text-[var(--x-card-muted)]">
        {live && <LiveDot />} {label}
      </div>
    </div>
  );
}

// One big showcase card per game: tilting thumbnail + headline stats, sides alternate.
function GameRow({ game, index, current, visitCount, bare = false }: { game: Game; index: number; current: number; visitCount: number; bare?: boolean }) {
  const now = compact(current);
  // the stored peak is from LiveOps' last 28 days, so never show it below what's live right now
  const ccu = compact(Math.max(game.peakCcu, current));
  const visits = compact(visitCount);
  const sold = isSold(game);
  const flip = index % 2 === 1;
  return (
    <FadeContent blur duration={900}>
      {/* one card per game: thumbnail + details on the same surface, soft accent glow behind the thumbnail side */}
      <div className={`group/row relative grid items-center gap-6 md:gap-10 md:grid-cols-[1.3fr_1fr] overflow-hidden p-4 md:p-7 ${bare ? "" : "rounded-[var(--x-radius)] border-2 border-[var(--x-card-border)] bg-[var(--x-card)] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.6)] transition-[border-color,box-shadow] duration-300 hover:border-[color-mix(in_srgb,var(--x-accent)_55%,var(--x-card-border))] hover:shadow-[0_24px_70px_-28px_var(--x-accent)]"}`}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-500 group-hover/row:opacity-100"
          style={{ background: `radial-gradient(ellipse 60% 80% at ${flip ? "85%" : "15%"} 50%, color-mix(in srgb, var(--x-accent) 16%, transparent), transparent 70%)` }}
        />
        <div className={`relative block aspect-video w-full ${flip ? "md:order-last" : ""}`}>
          <TiltedCard
            imageSrc={game.thumb}
            altText={`${game.name} thumbnail`}
            showTooltip={false}
            containerHeight="100%"
            imageWidth="100%"
            imageHeight="100%"
            scaleOnHover={1.04}
            rotateAmplitude={8}
            showMobileWarning={false}
          />
        </div>
        <div className="relative flex flex-col gap-2 px-1 pb-1 md:px-0 md:pb-0 text-[var(--x-card-fg)]">
          <span className="flex flex-wrap items-center gap-x-2 font-[family-name:var(--x-font-mono)] text-sm font-bold uppercase tracking-wider">
            <span className="text-[var(--x-genre)]">{game.genre}</span>
            <span className="text-[var(--x-card-muted)]">· {sold ? "Built & sold" : `Alive ${lifespan(game.created)}`}</span>
          </span>
          <h3 className="x-heading !normal-case text-4xl md:text-5xl leading-tight">{game.name}</h3>
          <div className="my-4 h-[3px] w-full rounded-full" style={{ background: "var(--x-bar)" }} />
          <div className="grid grid-cols-3 gap-3 md:gap-5">
            <GameStat value={now.n} unit={now.unit} label="Current CCU" live />
            <GameStat value={ccu.n} unit={ccu.unit} label="Peak CCU" />
            <GameStat value={visits.n} unit={`${visits.unit}+`} label="Visits" />
          </div>
          <a
            href={playUrl(game)}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--x-btn-a)] px-5 py-2.5 text-sm font-semibold text-[var(--x-on-accent)] transition-[filter] hover:brightness-110"
          >
            {sold ? "View on Roblox" : "Play on Roblox"} <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </FadeContent>
  );
}

// "Our Games": filter + sort pills over a Stage (one big game, a strip of every game to pick from).
type GameSort = "peak" | "now" | "visits" | "new";
const GAME_SORTS: { key: GameSort; label: string }[] = [
  { key: "peak", label: "Peak CCU" },
  { key: "now", label: "Playing now" },
  { key: "visits", label: "Visits" },
  { key: "new", label: "Newest" },
];
function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 font-[family-name:var(--x-font-mono)] text-xs font-bold transition-colors md:text-sm ${
        active
          ? "border-transparent bg-[var(--x-btn-a)] text-[var(--x-on-accent)]"
          : "border-[var(--x-card-border)] bg-[var(--x-card)] text-[var(--x-card-muted)] hover:text-[var(--x-card-fg)]"
      }`}
    >
      {children}
    </button>
  );
}

// D · Stage: the big card is the focus (it keeps the accent border + glow); the strip below is a separate row
// of every game, where every game is full brightness and the picked one just has a white outline, no blue.
function GameStage({ list, cur, vis }: { list: Game[]; cur: (g: Game) => number; vis: (g: Game) => number }) {
  const [id, setId] = useState(list[0]?.universeId);
  const picked = list.find((g) => g.universeId === id) ?? list[0];
  if (!picked) return null;
  return (
    <div className="mt-8">
      <div className="rounded-[var(--x-radius)] shadow-[0_24px_70px_-30px_var(--x-accent)] [&>*>div]:!border-[color-mix(in_srgb,var(--x-accent)_60%,var(--x-card-border))]">
        <GameRow key={picked.universeId} game={picked} index={0} current={cur(picked)} visitCount={vis(picked)} />
      </div>
      <div className="mt-5 flex gap-3 overflow-x-auto pb-3 [scrollbar-width:thin]" role="tablist" aria-label="Pick a game">
        {list.map((g) => {
          const on = g.universeId === picked.universeId;
          const n = compact(cur(g));
          return (
            <button
              key={g.universeId}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setId(g.universeId)}
              className={`group/t w-44 shrink-0 overflow-hidden rounded-xl border-2 bg-[var(--x-card)] text-left transition-[border-color] duration-200 md:w-52 ${on ? "border-white/80" : "border-[var(--x-card-border)] hover:border-white/40"}`}
            >
              <div className="relative">
                <img src={g.thumb} alt="" loading="lazy" className={`aspect-video w-full object-cover ${isSold(g) ? "opacity-80 saturate-75" : ""}`} />
                {isSold(g) && (
                  <span className="absolute left-2 top-2 rounded-full bg-black/65 px-2 py-0.5 font-[family-name:var(--x-font-mono)] text-[10px] font-bold text-[var(--x-card-muted)] backdrop-blur">SOLD</span>
                )}
              </div>
              <div className="px-3 py-2 text-[var(--x-card-fg)]">
                <div className="truncate text-sm font-semibold">{g.name}</div>
                <div className="flex items-center gap-1 font-[family-name:var(--x-font-mono)] text-[11px] text-[var(--x-card-muted)]">
                  <LiveDot /> {n.n.toLocaleString()}{n.unit} now
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GamesSection({ playingById, visitsById }: { playingById: Record<string, number>; visitsById: Record<string, number> }) {
  const [filter, setFilter] = useState<"all" | "live" | "sold">("all");
  const [sort, setSort] = useState<GameSort>("peak");
  const cur = (g: Game) => playingById[g.universeId] ?? g.playing;
  const vis = (g: Game) => visitsById[g.universeId] ?? g.visits;
  const counts = { all: data.games.length, live: activeGames.length, sold: data.games.length - activeGames.length };
  const key: Record<GameSort, (g: Game) => number> = {
    peak: (g) => Math.max(g.peakCcu, cur(g)),
    now: cur,
    visits: vis,
    new: (g) => +new Date(g.created),
  };
  const list = data.games
    .filter((g) => (filter === "all" ? true : filter === "sold" ? isSold(g) : !isSold(g)))
    .sort((a, b) => key[sort](b) - key[sort](a));
  return (
    <>
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter games">
          {([["all", "All"], ["live", "Live"], ["sold", "Built & sold"]] as const).map(([k, label]) => (
            counts[k] > 0 && <Pill key={k} active={filter === k} onClick={() => setFilter(k)}>{label} · {counts[k]}</Pill>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Sort games">
          <span className="font-[family-name:var(--x-font-mono)] text-xs text-[var(--x-muted)]">Sort</span>
          {GAME_SORTS.map((o) => <Pill key={o.key} active={sort === o.key} onClick={() => setSort(o.key)}>{o.label}</Pill>)}
        </div>
      </div>
      <GameStage key={list.map((g) => g.universeId).join()} list={list} cur={cur} vis={vis} />
    </>
  );
}

// Footer: name · links · Discord · headline numbers, then the copyright line.
function Footer({ visits, playing, games }: { visits: number; playing: number; games: number }) {
  const v = compact(visits);
  const p = compact(playing);
  const stats = [
    { value: `${v.n}${v.unit}+`, label: "visits" },
    { value: `${p.n}${p.unit}`, label: "playing", live: true },
    { value: String(games), label: games === 1 ? "game" : "games" },
  ];
  return (
    <footer className="border-t border-[var(--x-stat-border)] bg-[var(--x-bg)]">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col items-center gap-5 py-10 text-center">
          <a href="#" aria-label="Nex Games" className="flex items-center gap-2.5">
            <img src="brand/mark-nav.webp" alt="" width={53} height={28} className="h-7 w-auto" />
            <img src="brand/wordmark-nav.webp" alt="Nex Games" width={108} height={18} className="h-[18px] w-auto" />
          </a>
          <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[15px] text-[var(--x-muted)]">
            {[["Home", "#"], ["Games", "#games"], ["Services", "#services"], ["Partner", "#partner"], ["About", "#about"], ["Contact", "#contact"]].map(([label, href]) => (
              <a key={label} href={href} className="transition-colors hover:text-[var(--x-fg)]">{label}</a>
            ))}
          </nav>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[15px]">
            {stats.map((st, i) => (
              <span key={st.label} className="flex items-center gap-3">
                {i > 0 && <span className="h-1 w-1 rounded-full bg-[var(--x-muted)] opacity-60" />}
                <span className="flex items-center gap-1.5">
                  {st.live && <span className="h-1.5 w-1.5 rounded-full bg-[#30d158]" />}
                  <b className="font-semibold text-[var(--x-fg)] tabular-nums">{st.value}</b>
                  <span className="text-[var(--x-muted)]">{st.label}</span>
                </span>
              </span>
            ))}
          </div>
        </div>
        <div className="border-t border-[var(--x-stat-border)] py-6 text-center text-sm text-[var(--x-muted)] opacity-80">
          © {new Date().getFullYear()} Nex Games. Not affiliated with Roblox Corporation.
        </div>
      </div>
    </footer>
  );
}

function App() {
  const live = useLivePlaying();
  const totalVisits = live.visits;

  return (
    <div
      data-style="liveops"
      className="min-h-svh bg-[var(--x-bg)] text-[var(--x-fg)] relative overflow-x-clip">
      <div className="fixed inset-0 z-0">
        <DotField
          dotRadius={2}
          dotSpacing={26}
          cursorRadius={130}
          glowColor={THEME.dots.glow}
          gradientFrom={THEME.dots.from}
          gradientTo={THEME.dots.to}
          sparkle
        />
      </div>

      <div className="relative z-10">
        <Nav />

        <main>
          {/* ── Hero: one line, the numbers, and a bar of every game ── */}
          <section id="stats" className="relative flex min-h-svh flex-col overflow-hidden">
            <div className="absolute inset-0 z-0">
              <LightRays
                raysOrigin="top-center"
                raysColor={THEME.rays}
                raysSpeed={1.2}
                lightSpread={0.9}
                rayLength={1.6}
                followMouse
                mouseInfluence={0.08}
                noiseAmount={0.08}
                distortion={0.04}
                className="opacity-80"
              />
            </div>

            <div className="relative z-[1] flex flex-1 flex-col items-center justify-center px-4 pt-24 pb-10 text-center">
              <Headline />
              <div className="mt-12 md:mt-16 flex items-start justify-center divide-x divide-[var(--x-stat-border)]">
                <HeroStat value={totalVisits} label="Total visits" suffix="+" delay={0.7} />
                <HeroStat value={live.total} label="Playing now" delay={0.8} live />
                <HeroStat value={activeGames.length} label="Live games" delay={0.9} />
              </div>
            </div>

            {/* every game, scrolling past */}
            <motion.div
              className="relative z-[1] pb-20 md:pb-24"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* above the bar: proof first, then the ask */}
              <div className="mb-10 flex flex-wrap items-center justify-center gap-3 px-4">
                <a
                  href="#games"
                  className="inline-flex h-12 items-center rounded-full px-6 text-[15px] font-semibold text-[var(--x-fg)] ring-1 ring-white/20 bg-white/5 backdrop-blur-sm transition-[transform,background-color,box-shadow] duration-300 hover:-translate-y-px hover:bg-white/10 hover:ring-[var(--x-accent)]"
                >
                  See Results
                </a>
                <ModernButton href="#partner">Sell Your Game</ModernButton>
              </div>
              <LogoLoop
                logos={data.games.map((g) => {
                  const current = live.byId[g.universeId] ?? g.playing;
                  const ccu = compact(Math.max(g.peakCcu, current));
                  const v = compact(live.visitsById[g.universeId] ?? g.visits);
                  // hover: image dims + blurs, the name lifts away and the game's numbers rise in
                  return {
                  node: (
                    <span className="group/g relative z-0 block h-[110px] md:h-[140px] aspect-video overflow-hidden rounded-2xl ring-1 ring-white/15 shadow-xl transition-[scale,box-shadow] duration-300 ease-out hover:z-20 hover:scale-[1.06] hover:ring-2 hover:ring-[var(--x-accent)] hover:shadow-[0_10px_32px_-6px_var(--x-accent)]">
                      <img src={g.thumb} alt={g.name} className="h-full w-full object-cover transition-all duration-500 group-hover/g:scale-105 group-hover/g:brightness-[0.4]" />
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-6 text-left text-xs md:text-sm font-semibold text-white transition-all duration-300 group-hover/g:translate-y-full group-hover/g:opacity-0">
                        {g.name}
                      </span>
                      <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-white opacity-0 translate-y-4 transition-all duration-300 ease-out group-hover/g:opacity-100 group-hover/g:translate-y-0">
                        <span className="text-[11px] md:text-xs font-semibold text-white truncate max-w-[90%]">{g.name}</span>
                        <span className="flex items-start gap-4 md:gap-6">
                          {[
                            { val: `${ccu.n}${ccu.unit}`, label: "Peak CCU", color: "text-white" },
                            { val: `${v.n}${v.unit}+`, label: "Visits", color: "text-white" },
                          ].map((st) => (
                            <span key={st.label} className="flex flex-col items-center">
                              <span className={`x-heading !normal-case !tracking-normal text-xl md:text-3xl tabular-nums drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] ${st.color}`}>{st.val}</span>
                              <span className="whitespace-nowrap font-[family-name:var(--x-font-mono)] text-[9px] md:text-[10px] uppercase tracking-wider text-white/75">
                                {st.label}
                              </span>
                            </span>
                          ))}
                        </span>
                      </span>
                    </span>
                  ),
                  title: g.name,
                  };
                })}
                speed={40}
                logoHeight={140}
                gap={20}
                pauseOnHover
                fadeOut
                className="py-8 -my-8"
                fadeOutColor={THEME.bg}
                ariaLabel="Our games"
              />
            </motion.div>
          </section>

          {/* ── Games ──────────────────────────────────────── */}
          <section id="games" className="bg-[var(--x-bg2)] transition-colors duration-500">
            <div className="mx-auto max-w-6xl px-4 md:px-6 pt-16 md:pt-24 pb-24">
              <SectionTitle
                title="Our Games"
              />
              <GamesSection playingById={live.byId} visitsById={live.visitsById} />
            </div>
          </section>

          {/* ── Moving banner ─────────────────────────────── */}
          <div aria-hidden className="py-10 md:py-14 overflow-hidden">
            <ScrollVelocity
              texts={["LiveOps ✦ Thumbnails ✦ Updates ✦ ", "PTR ✦ Concepts ✦ Monetization ✦ "]}
              velocity={40}
              numCopies={4}
              className="x-heading px-2 text-5xl md:text-8xl text-[var(--x-dim)]"
              parallaxClassName="relative overflow-hidden py-1"
              scrollerClassName="flex whitespace-nowrap"
            />
          </div>

          {/* ── Services ───────────────────────────────────── */}
          <section id="services">
            <div className="mx-auto max-w-6xl px-4 md:px-6 pt-10 pb-24">
              <SectionTitle title="Our Services" fg="var(--x-fg)" muted="var(--x-muted)" />
              <LazyMount minHeight={900}><ServicesSection glow={THEME.glow} /></LazyMount>
            </div>
          </section>

          {/* ── How we partner ─────────────────────────────── */}
          <section id="partner">
            <div className="mx-auto max-w-6xl px-4 md:px-6 pt-4 pb-24">
              <SectionTitle title="Our Partnership" fg="var(--x-fg)" muted="var(--x-muted)" />
              <LazyMount minHeight={900}><PartnerSection glow={THEME.glow} /></LazyMount>
            </div>
          </section>

          {/* ── About ──────────────────────────────────────── */}
          <section id="about">
            <div className="mx-auto max-w-6xl px-4 md:px-6 pt-8 pb-16 md:pb-24">
              <SectionTitle title="About Us" fg="var(--x-fg)" muted="var(--x-muted)" />
              <div className="mt-10 grid gap-10 rounded-[var(--x-radius)] border-2 border-[var(--x-card-border)] bg-[var(--x-card)] p-6 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.6)] md:grid-cols-[1.2fr_1fr] md:gap-16 md:p-10">
                <FadeContent blur duration={900}>
                  <div className="flex items-center gap-4">
                    <img src={DISCORD_AVATAR} alt={DISCORD_NAME} width={64} height={64} loading="lazy" decoding="async" className="h-16 w-16 rounded-2xl object-cover ring-2 ring-[var(--x-stat-border)]" />
                    <div>
                      <div className="x-heading !normal-case text-2xl">{DISCORD_NAME}</div>
                      <div className="text-sm text-[var(--x-muted)]">Founder · Data-driven LiveOps</div>
                    </div>
                  </div>
                  <p className="mt-8 text-2xl md:text-3xl font-semibold leading-snug text-[var(--x-fg)]">
                    Every update I ship is backed by data. <span className="x-grad-text">That's how +1 Bite Per Click went from 0 to 15K CCU.</span>
                  </p>
                  <p className="mt-6 text-lg leading-[1.75] text-[#d1d1d6]">
                    <b className="font-semibold text-white">I don't guess what a game needs.</b> I dig into{" "}
                    <b className="font-semibold text-white">retention</b>, <b className="font-semibold text-white">funnels</b>,{" "}
                    <b className="font-semibold text-white">session time</b> and <b className="font-semibold text-white">monetization</b> to find
                    the exact stat holding it back, then build the update, balance change and LiveOps pushes that move it,
                    and measure the result.
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-3 rounded-2xl border border-[var(--x-card-border)] bg-white/[0.04] px-4 py-3.5 text-center">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[rgba(var(--x-accent-rgb),0.15)] text-[var(--x-accent)]">
                      <Clock className="h-4 w-4" />
                    </span>
                    <p className="text-[17px] leading-relaxed text-[#d1d1d6]">
                      You'll never be left waiting: I reply within <b className="font-semibold text-white">24 hours</b>.
                    </p>
                  </div>
                </FadeContent>
                <div className="flex flex-col self-start divide-y divide-[var(--x-stat-border)] border-y border-[var(--x-stat-border)]">
                  {ABOUT_POINTS.map(({ title, text, icon: Icon }, i) => (
                    <FadeContent key={title} blur duration={800} delay={100 * i}>
                      <div className="flex items-start gap-4 py-5">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--x-accent)_15%,transparent)] text-[var(--x-accent)]">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <div className="font-semibold text-[var(--x-fg)]">{title}</div>
                          <div className="mt-0.5 text-sm text-[var(--x-muted)]">{text}</div>
                        </div>
                      </div>
                    </FadeContent>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Contact ────────────────────────────────────── */}
          <section id="contact" className="bg-[var(--x-bg2)] transition-colors duration-500">
            <FadeContent blur duration={900}>
              <div className="mx-auto max-w-4xl px-4 py-24 md:py-32 text-center text-[var(--x-games-fg)]">
                <h2 className="x-heading text-5xl md:text-7xl leading-[0.95]">
                  Got a game?
                  <span className="x-grad-text block">Let's grow it.</span>
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-lg font-medium text-[var(--x-games-muted)]">
                  Open to all kinds of deals!
                </p>
                <DiscordButton />
              </div>
            </FadeContent>
          </section>
        </main>

        <Footer visits={totalVisits} playing={live.total} games={activeGames.length} />
      </div>

    </div>
  );
}

export default App;
