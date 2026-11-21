// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NewPlayerForm } from "@/features/players/components/NewPlayerForm";

describe("NewPlayerForm", () => {
  it("disables adding players once the team reaches 100", () => {
    render(
      <NewPlayerForm
        onAddPlayer={vi.fn()}
        selectedSeasonId="season-id"
        playerCount={100}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Añadir jugador" }),
    ).toBeDisabled();
    expect(
      screen.getByText("El equipo ya tiene el máximo de 100 jugadores."),
    ).toBeInTheDocument();
  });

  it("shows a database limit error if another request fills the last slot", async () => {
    const user = userEvent.setup();
    const onAddPlayer = vi
      .fn()
      .mockRejectedValue(
        new Error("El equipo ya tiene el máximo de 100 jugadores"),
      );

    render(
      <NewPlayerForm
        onAddPlayer={onAddPlayer}
        selectedSeasonId="season-id"
        playerCount={99}
      />,
    );

    await user.type(screen.getByPlaceholderText("Nombre del jugador"), "Alice");
    await user.click(screen.getByRole("button", { name: "Añadir jugador" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "El equipo ya tiene el máximo de 100 jugadores",
    );
  });
});
