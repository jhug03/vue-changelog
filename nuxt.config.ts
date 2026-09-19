// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || "/",
  },
  runtimeConfig: {
    public: {
      appwriteEndpoint: process.env.VITE_APPWRITE_ENDPOINT || "",
      appwriteProjectId: process.env.VITE_APPWRITE_PROJECT_ID || "",
    },
  },
  vite: {
    optimizeDeps: {
      include: [
        'marked',
        'appwrite',
      ]
    }
  },
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],

  postcss: {
    plugins: {
      // Change 'tailwindcss' to '@tailwindcss/postcss'
      '@tailwindcss/postcss': {},
      autoprefixer: {}
    }
  },

  modules: ["@nuxt/eslint"],
});