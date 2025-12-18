// @ts-check
import { defineConfig, passthroughImageService } from "astro/config";
import node from "@astrojs/node";
import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  adapter: node({
    mode: "standalone",
  }),
  prefetch: true,
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react(), icon()],
  image: {
    service: passthroughImageService(),
  },
});
