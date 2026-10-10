import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // relative asset URLs so the build works from a sub-folder (GitHub Pages: user.github.io/repo/) and at a domain root
  base: "./",
  plugins: [react(), tailwindcss()],
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
