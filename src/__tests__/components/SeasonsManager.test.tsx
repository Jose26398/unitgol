// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SeasonsManager } from "@/features/seasons/components/SeasonsManager";

const seasons = [
  { id: "s1", name: "Season 1", startDate: "2026-01-01" },
  { id: "s2", name: "Season 2", startDate: "2025-01-01" },
];
describe("SeasonsManager", () => {
  it("opens a single confirmation dialog and preserves it after a failed deletion", async () => {
    const onDeleteSeason = vi
      .fn()
      .mockRejectedValue(new Error("Delete failed"));
    render(
      <SeasonsManager
        seasons={seasons}
        onAddSeason={vi.fn()}
        onEditSeason={vi.fn()}
        onDeleteSeason={onDeleteSeason}
        isAdmin
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Eliminar Season 1" }));
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Delete failed");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(onDeleteSeason).toHaveBeenCalledWith("s1");
  });
  it("keeps the season form and entered values when a save fails", async () => {
    const onAddSeason = vi.fn().mockRejectedValue(new Error("Save failed"));
    render(
      <SeasonsManager
        seasons={[]}
        onAddSeason={onAddSeason}
        onEditSeason={vi.fn()}
        onDeleteSeason={vi.fn()}
        isAdmin
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Nueva Temporada" }));
    fireEvent.change(screen.getByLabelText("Nombre de la temporada"), {
      target: { value: "New season" },
    });
    fireEvent.change(screen.getByLabelText("Inicio de la temporada"), {
      target: { value: "2026-01-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Crear" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Save failed");
    expect(screen.getByLabelText("Nombre de la temporada")).toHaveValue(
      "New season",
    );
  });
});
