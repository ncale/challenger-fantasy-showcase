// // @ts-check

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { LINKS } from "@challenger-fantasy/core";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  site: LINKS.LANDING_URL,
  integrations: [react(), sitemap()],
});
