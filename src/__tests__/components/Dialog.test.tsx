// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "@/app/ErrorBoundary";

function Broken(): never {
  throw new Error("Render failed");
}

import { Dialog } from "@/components/ui/Dialog";

describe("Dialog", () => {
  it("has an accessible title and lets Escape close it", () => {
    const close = vi.fn();
    render(
      <Dialog title="Confirmar" onClose={close}>
        Contenido
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog", { name: "Confirmar" });
    fireEvent(
      dialog,
      new Event("cancel", { bubbles: false, cancelable: true }),
    );
    expect(close).toHaveBeenCalledOnce();
  });
  it("keeps an operation open while it is pending", () => {
    const close = vi.fn();
    render(
      <Dialog title="Guardando" onClose={close} busy>
        Contenido
      </Dialog>,
    );
    fireEvent(
      screen.getByRole("dialog"),
      new Event("cancel", { bubbles: false, cancelable: true }),
    );
    expect(close).not.toHaveBeenCalled();
  });
  it("shows a recovery screen after a render error", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "No se pudo mostrar la aplicación",
    );
    error.mockRestore();
  });
});
