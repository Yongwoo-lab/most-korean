import { readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const ortVersion = JSON.parse(readFileSync("node_modules/onnxruntime-web/package.json", "utf8")).version;

// Some hosts refuse files that contain a raw U+FFFD character (Whisper's
// decoder has one), so write it as an escape.
// The worker loads the ONNX runtime wasm from the CDN (see ml.worker.js),
// so the bundled copy is dead weight. Drop it to keep the site small.
const tidyAssets = {
  name: "tidy-assets",
  apply: "build",
  closeBundle() {
    const dir = "dist/assets";
    for (const f of readdirSync(dir)) {
      if (/^ort-wasm.*\.wasm$/.test(f)) rmSync(join(dir, f));
      else if (f.endsWith(".js")) {
        const code = readFileSync(join(dir, f), "utf8");
        if (code.includes("\uFFFD")) writeFileSync(join(dir, f), code.replaceAll("\uFFFD", "\\uFFFD"));
      }
    }
  },
};

export default defineConfig({
  base: "./",
  plugins: [react(), tidyAssets],
  define: { __ORT_VERSION__: JSON.stringify(ortVersion) },
  worker: { format: "es" },
  build: { chunkSizeWarningLimit: 1200 },
});
