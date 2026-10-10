import { BarChart3, Video, Coins, FileCheck2, Filter, Lightbulb, MessagesSquare, MousePointerClick, RefreshCw, Rocket, Scale, UsersRound, type LucideIcon } from "lucide-react";

// The services. Edit copy here.
export const PTR_SUPPORT = {
  title: "PTR Support",
  subtitle: "Thumbnail Support",
  text: "Thumbnails and icons made to get clicked. We test multiple layouts and concepts, then do iterative work on the best-performing thumbnails to raise your play-through rate.",
  steps: ["Test layouts & concepts", "Find the best performers", "Iterate"],
  // pricing options shown on the PTR Support card (USD)
  plans: [
    { key: "weekly", name: "Weekly PTR Support", price: "$150", per: "/ week", note: "Ongoing thumbnail testing and iteration" },
    { key: "pack", name: "20 AI Thumbnails", price: "$180", per: "one-time", note: "A batch of 20 to test and pick from" },
  ],
  // thumbnails we've made, shown in the PTR Support visuals (files in public/ptr/)
  images: ["ptr/ptr-1.webp", "ptr/ptr-2.webp", "ptr/ptr-5.webp", "ptr/ptr-3.webp", "ptr/ptr-4.webp", "ptr/ptr-6.webp", "ptr/ptr-7.webp", "ptr/ptr-8.webp", "ptr/ptr-9.webp", "ptr/ptr-10.webp", "ptr/ptr-11.webp", "ptr/ptr-12.webp", "ptr/ptr-13.webp"],
};

// LiveOps Review: one-time analytics deep dive — a single LiveOps-style audit of a game.
export const GAME_REVIEW = {
  title: "LiveOps Review",
  subtitle: "One-time analytics deep dive",
  cta: "Book a review",
  price: "$150",
  parts: [
    { key: "audience", title: "Audience", text: "Ages, regions, platforms, sources.", icon: UsersRound },
    { key: "onboarding", title: "Onboarding", text: "Where new players drop off early.", icon: Rocket },
    { key: "funnels", title: "Funnels & retention", text: "Every funnel step, plus D1, D7 and D30.", icon: Filter },
    { key: "mono", title: "Monetization potential", text: "What you earn now vs. what you could.", icon: Coins },
    { key: "call", title: "1:1 Call", text: "Direct feedback and explanations.", icon: Video },
  ] as { key: string; title: string; text: string; icon: LucideIcon }[],
};

export type LiveOpsPart = { key: string; title: string; text: string; icon: LucideIcon };

export const LIVEOPS = {
  title: "LiveOps",
  parts: [
    { key: "updates", title: "Updates", text: "Planned and shipped on a steady schedule.", icon: RefreshCw },
    { key: "ptr", title: "PTR", text: "Ongoing thumbnail and icon tests.", icon: MousePointerClick },
    { key: "concepts", title: "Concepts", text: "New ideas built on what's working now.", icon: Lightbulb },
    { key: "balancing", title: "Balancing", text: "Economy, progression and difficulty tuned so players keep moving forward.", icon: Scale },
    { key: "monetization", title: "Monetization Optimisation", text: "Passes, products and pricing tuned to earn more.", icon: Coins },
    { key: "demographics", title: "Demographic Shift", text: "Moving your player base toward new ages, regions and higher-spending audiences.", icon: UsersRound },
  ] as LiveOpsPart[],
};

export const BUY_GAME = {
  title: "Full Buyout",
  cta: "Get an offer",
  points: [
    { key: "contract", title: "Clean contract", text: "Clear, simple terms. No surprises.", icon: FileCheck2 },
    { key: "comms", title: "Constant communication", text: "You always know where things stand.", icon: MessagesSquare },
    { key: "pricing", title: "Priced off real stats", text: "Offers based on your game's actual numbers.", icon: BarChart3 },
  ] as LiveOpsPart[],
};

// Partial buyout: we buy a stake of the game, anywhere in this range.
export const PARTIAL_BUY = {
  title: "Partial Buyout",
  min: 30,
  max: 80,
  cta: "Get an offer",
};

// Not offered yet: shown on Our Services as "Coming soon".
export const SOCIAL_MEDIA = {
  title: "Social Media Marketing",
  subtitle: "TikTok, YouTube Shorts and more to bring new players in",
};
