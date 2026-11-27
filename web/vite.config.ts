import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Только для dev: папка ../smena (модуль распознавания лица и веса) отдаётся по /smena/ как на сайте — окно съёмки лица в «Отметках» берёт её по пути сайта.
// В сборку она не попадает: на сайте web лежит рядом со smena.
const MIME: Record<string, string> = { ".js": "text/javascript", ".json": "application/json", ".bin": "application/octet-stream", ".html": "text/html" };
const smena = (): Plugin => ({
  name: "kassa-smena-dev",
  apply: "serve",
  configureServer(server) {
    const root = path.resolve(__dirname, "../smena");
    server.middlewares.use((req, res, next) => {
      const url = decodeURIComponent((req.url || "").split("?")[0]);
      if (!url.startsWith("/smena/")) return next();
      const file = path.resolve(root, "." + url.slice("/smena".length));
      if (!file.startsWith(root) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return next();
      res.setHeader("Content-Type", MIME[path.extname(file)] || "application/octet-stream");
      fs.createReadStream(file).pipe(res);
    });
  },
});

// base — путь на GitHub Pages: сайт будет жить в подпапке репозитория
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), smena()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
