import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

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
});