import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Click-jacking guard: the site never runs inside someone else's frame (GitHub Pages can't send
// the X-Frame-Options / frame-ancestors headers, so do it here).
if (window.top !== window.self) {
  try { window.top!.location.replace(window.self.location.href); } catch { document.documentElement.innerHTML = ""; }
}

// Load the fonts without blocking first paint (kept out of index.html so the CSP needs no inline code).
const fonts = document.createElement("link");
fonts.rel = "stylesheet";
fonts.href = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@700&display=swap";
document.head.appendChild(fonts);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
