import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Security headers for the built site. GitHub Pages can't send custom HTTP headers, so these go in as
// <meta> tags (production build only — the dev server needs inline scripts for hot reload).
// The CSP lists every outside source the page really uses: Google Fonts and the live player-count API.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // components inject <style>/style attributes
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self' https://games.roproxy.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  "frame-src 'none'",
  "worker-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

function securityHeaders(): Plugin {
  return {
    name: "security-headers",
    apply: "build",
    transformIndexHtml(html) {
      return html.replace(
        "<meta charset=\"UTF-8\" />",
        `<meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="${CSP}" />
    <meta name="referrer" content="no-referrer" />`,
      );
    },
  };
}

export default defineConfig({
  // relative asset URLs so the build works from a sub-folder (GitHub Pages: user.github.io/repo/) and at a domain root
  base: "./",
  plugins: [react(), tailwindcss(), securityHeaders()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // the zero-dep node server (npm run serve in the repo root) owns /data
      "/data": "http://localhost:8321",
    },
  },
});
