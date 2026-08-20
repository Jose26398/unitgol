import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	plugins: [
		react(),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
			manifest: {
				name: "UnitGol",
				short_name: "UnitGol",
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
						src: "icons/icon-384x384.png",
						sizes: "384x384",
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
	optimizeDeps: {
		exclude: ["lucide-react"],
	},
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./src/__tests__/setup.ts"],
		coverage: {
			reporter: ["text", "json", "html"],
			exclude: ["node_modules/", "src/__tests__/setup.ts"],
			thresholds: {
				statements: 90,
				branches: 80,
				functions: 95,
				lines: 95,
			},
		},
	},
});
