import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";
import { AuthProvider } from "./features/auth/AuthProvider";

// Register service worker
const updateSW = registerSW({
	onNeedRefresh() {
		if (confirm("Nueva versión disponible. ¿Actualizar?")) {
			updateSW();
		}
	},
	onOfflineReady() {
		console.log("La aplicación está lista para uso sin conexión");
	},
});

const rootElement = document.getElementById("root");
if (!rootElement) {
	throw new Error("No se encontró el elemento raíz");
}

createRoot(rootElement).render(
	<StrictMode>
		<AuthProvider>
			<App />
		</AuthProvider>
	</StrictMode>,
);
