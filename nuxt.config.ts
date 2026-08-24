
import { createResolver } from "@nuxt/kit";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

const { resolve } = createResolver(import.meta.url);

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  // Enable server-side rendering
  ssr: false,

  // Dev server port. Override with NUXT_PORT (or `nuxt dev --port`) if 3003 is taken.
  devServer: {
    port: Number(process.env.NUXT_PORT ?? 3003),
  },

  // TypeScript configuration
  typescript: {
    shim: false,
  },

  // Vuetify build configuration
  build: {
    transpile: ["vuetify"],
  },

  // Modules
  modules: ["@pinia/nuxt"],

  // Application metadata
  app: {
    head: {
      title:
        "Afyanalytics"
    },
  },

  // Nitro configuration
  nitro: {
    serveStatic: true,
  },

  runtimeConfig: {
    public: {
      BASE_URL: process.env.BASE_URL
    }
  },

  // Dev server handlers
  devServerHandlers: [],

  compatibilityDate: "2024-09-06",
});
