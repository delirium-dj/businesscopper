import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import { imagetools } from "vite-imagetools";

export default defineConfig(() => {
  return {
    plugins: [qwikCity(), qwikVite(), imagetools()],
    build: {
      // Three.js (hero showpiece) ships as one lazy chunk loaded only on
      // desktop — 750 kB min / ~190 kB gzip, intentionally over the default.
      chunkSizeWarningLimit: 800,
    },
    preview: {
      headers: {
        "Cache-Control": "no-cache, must-revalidate",
      },
    },
  };
});
