import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { searchIndexing } from "./config/searchIndexing.ts";

export default defineConfig(({ mode }) => {
  const env = loadEnv(
    mode,
    fileURLToPath(new URL(".", import.meta.url)),
    "VITE_ENV",
  );
  const allowIndexing =
    mode === "production" && !["develop", "development"].includes(env.VITE_ENV);

  return {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    plugins: [
      react(),
      searchIndexing(allowIndexing),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.png"],
        manifest: {
          name: "UnitGol",
          short_name: "UnitGol",
          lang: "es",
          description:
            "Aplicación para gestionar partidos de fútbol entre amigos",
          theme_color: "#ffffff",
          background_color: "#ffffff",
          display: "standalone",
          icons: [
            {
              src: "icons/icon-72x72.png",
              sizes: "72x72",
              type: "image/png",
            },
            {
              src: "icons/icon-96x96.png",
              sizes: "96x96",
              type: "image/png",
            },
            {
              src: "icons/icon-128x128.png",
              sizes: "128x128",
              type: "image/png",
            },
            {
              src: "icons/icon-144x144.png",
              sizes: "144x144",
              type: "image/png",
            },
            {
              src: "icons/icon-152x152.png",
              sizes: "152x152",
              type: "image/png",
            },
            {
              src: "icons/icon-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "icons/icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      }),
    ],
  };
});
