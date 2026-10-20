// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: process.env.SITE_URL ?? "https://portfolio-chi-fawn-38.vercel.app",
  i18n: {
    locales: ["pt", "en"],
    defaultLocale: "pt",
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: "pt", locales: { pt: "pt-BR", en: "en-US" } },
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
