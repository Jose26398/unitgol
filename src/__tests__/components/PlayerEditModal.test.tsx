// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PlayerEditModal } from "@/features/players/components/PlayerEditModal";
import type { Player } from "@/types";

const player: Player = {
  id: "player-id",
  name: "Castolo",
  matches: 2,
  wins: 2,
  losses: 0,
  goals: 4,
  assists: 1,
};

describe("PlayerEditModal", () => {
  it("renders outside its parent and saves the edited player", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { container } = render(
      <div className="overflow-hidden">
        <PlayerEditModal player={player} onSave={onSave} onCancel={vi.fn()} />
      </div>,
    );

    const dialog = screen.getByRole("dialog", { name: "Editar Jugador" });
    expect(document.body).toContainElement(dialog);
    expect(container).not.toContainElement(dialog);

    await user.clear(screen.getByLabelText("Nombre"));
    await user.type(screen.getByLabelText("Nombre"), "Castolo Nuevo");
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Castolo Nuevo" }),
      undefined,
      false,
    );
  });
});
