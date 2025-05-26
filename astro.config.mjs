import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import netlify from '@astrojs/netlify';
import react from "@astrojs/react";

const isDev = process.env.NODE_ENV === "development";

export default defineConfig({
  site: isDev ? "http://localhost:4321" : "https://tids-logg.netlify.app",
  devToolbar: {
    enabled: false,
  },
  vite: {
    plugins: [tailwindcss()],
  },

  output: "server",
  adapter: netlify(),
  integrations: [react()],
});