import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import { imagetools } from "vite-imagetools";

export default defineConfig(() => {
  return {
    plugins: [qwikCity(), qwikVite(), imagetools()],
    preview: {
      headers: {
        "Cache-Control": "no-cache, must-revalidate",
      },
    },
  };
});
