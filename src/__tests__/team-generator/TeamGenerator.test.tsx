// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TeamGenerator } from "@/features/team-generator/components/TeamGenerator";
import type { Player } from "@/types";

const players: Player[] = [
  {
    id: "a",
    name: "Ana",
    matches: 1,
    wins: 0,
    losses: 1,
    goals: 25,
    assists: 0,
  },
  {
    id: "b",
    name: "Bea",
    matches: 1,
    wins: 0,
    losses: 1,
    goals: 75,
    assists: 0,
  },
];

describe("TeamGenerator actions and comparison", () => {
  it("keeps sharing and the score comparison available across both views", () => {
    render(
      <TeamGenerator
        players={players}
        matches={[]}
        seasonId={null}
        ratingMode="score"
      />,
    );

    const generate = screen.getByRole("button", { name: "Generar equipos" });
    expect(generate).toBeDisabled();
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Seleccionar a Ana" }),
    );
    expect(generate).toBeDisabled();
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Seleccionar a Bea" }),
    );
    expect(generate).toBeEnabled();
    fireEvent.click(generate);

    const comparison = screen.getByRole("img", {
      name: "Reparto de puntuación: Equipo A 75.0%, Equipo B 25.0%",
    });
    expect(
      screen.getByRole("button", { name: "Compartir equipos" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Captura del campo" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Compartir texto" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Vista Campo", pressed: true }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Vista Tarjetas" }));
    expect(comparison).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Vista Tarjetas", pressed: true }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Captura del campo" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Compartir equipos" }),
    ).toBeInTheDocument();
  });
});
