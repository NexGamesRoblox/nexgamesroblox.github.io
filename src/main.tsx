import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Click-jacking guard: the site never runs inside someone else's frame (GitHub Pages can't send
// the X-Frame-Options / frame-ancestors headers, so do it here).
const framed = window.top !== window.self;
if (framed) {
  // Browsers often silently block a framed page from navigating the top window, so don't rely on
  // that: never render inside a frame, just offer a link that opens the real site.
  const link = document.createElement("a");
  link.href = location.origin + location.pathname; // no query/hash carried over
  link.target = "_top";
  link.rel = "noopener";
  link.textContent = "Open Nex Games";
  Object.assign(link.style, { display: "block", padding: "2rem", font: "600 16px system-ui", color: "#0a84ff", background: "#000" });
  document.body.replaceChildren(link);
}

// Load the fonts without blocking first paint (kept out of index.html so the CSP needs no inline code).
const fonts = document.createElement("link");
fonts.rel = "stylesheet";
fonts.href = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@700&display=swap";
document.head.appendChild(fonts);

if (!framed) createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
