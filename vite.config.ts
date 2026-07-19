import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "pwa-icon-192.png", "pwa-icon-512.png"],
      manifest: {
        id: "/",
        name: "Mi Super Diario",
        short_name: "Super Diario",
        description: "Diario creativo privado para guardar recuerdos con texto, voz, video, fotos y stickers.",
        theme_color: "#17263d",
        background_color: "#0b2238",
        lang: "es",
        display: "fullscreen",
        display_override: ["fullscreen", "standalone"],
        orientation: "landscape-primary",
        scope: "/",
        start_url: "/",
        icons: [
          { src: "/pwa-icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/pwa-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: [
          "**/*.{js,css,html,ico,svg,woff,woff2,webmanifest}",
          "assets/adventure-map-premium-*.webp",
        ],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallbackDenylist: [/^\/~oauth/],
        runtimeCaching: [
          {
            urlPattern: /\/assets\/(?!.*-sprites-).*\.(?:png|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "visual-assets",
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 60 },
            },
          },
          {
            urlPattern: /\/assets\/.*-sprites-.*\.webp$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "floating-mascots",
              expiration: { maxEntries: 24, maxAgeSeconds: 60 * 60 * 24 * 90 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
