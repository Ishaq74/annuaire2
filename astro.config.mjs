import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import node from '@astrojs/node';

export default defineConfig({
  integrations: [icon()],
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    defaultLocale: "fr",
    locales: ["fr", "en", "es"],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  output: 'server',
  adapter: node({
    mode: 'standalone'
  })
});