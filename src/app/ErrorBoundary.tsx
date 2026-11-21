import { Component, type ReactNode } from "react";

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main role="alert" className="p-8 text-center">
        <h1 className="text-xl font-semibold mb-4">
          No se pudo mostrar la aplicación
        </h1>
        <p className="mb-4">Recarga la página para volver a intentarlo.</p>
        <button
          type="button"
          className="bg-emerald-600 text-white px-4 py-2 rounded-md"
          onClick={() => window.location.reload()}
        >
          Recargar
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
