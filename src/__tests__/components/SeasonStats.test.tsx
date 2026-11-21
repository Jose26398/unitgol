// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import type { ChartData } from "chart.js";
import { describe, expect, it, vi } from "vitest";
import { SeasonStats } from "@/features/seasons/components/SeasonStats";
import { SettingsContext } from "@/features/settings/SettingsContext";
import type { Match, Player } from "@/types";
import { DEFAULT_SETTINGS } from "@/types";

vi.mock("react-chartjs-2", () => ({
  Bar: ({ data }: { data: ChartData }) => (
    <output aria-label="Gráfico">{JSON.stringify(data)}</output>
  ),
  Line: ({ data }: { data: ChartData }) => (
    <output aria-label="Gráfico">{JSON.stringify(data)}</output>
  ),
}));
const player: Player = {
  id: "p1",
  name: "Alice",
  seasonId: "s1",
  matches: 1,
  wins: 1,
  losses: 0,
  goals: 1,
  assists: 0,
};
const match: Match = {
  id: "m1",
  seasonId: "s1",
  date: "2026-11-20",
  teamA: { players: [player], score: 1 },
  teamB: { players: [], score: 0 },
  goals: [{ playerId: "p1", minute: 10 }],
};

describe("reactive season charts", () => {
  it("rebuilds the selected chart after scoring factors change", () => {
    const view = (factor: number) => (
      <SettingsContext.Provider
        value={{ ...DEFAULT_SETTINGS, goalScoreFactor: factor }}
      >
        <SeasonStats
          seasonId="s1"
          players={[player]}
          matches={[match]}
          ratingMode="score"
        />
      </SettingsContext.Provider>
    );
    const { rerender } = render(view(10));
    const before = screen.getByLabelText("Gráfico").textContent;
    rerender(view(100));
    expect(screen.getByLabelText("Gráfico").textContent).not.toBe(before);
  });
  it("keeps a special chart selected and updates it when match data changes", () => {
    const { rerender } = render(
      <SeasonStats
        seasonId="s1"
        players={[player]}
        matches={[match]}
        ratingMode="score"
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Victorias\/Derrotas/ }),
    );
    expect(
      screen.getByRole("heading", { name: "Victorias y derrotas por jugador" }),
    ).toBeInTheDocument();
    const before = screen.getByLabelText("Gráfico").textContent;
    rerender(
      <SeasonStats
        seasonId="s1"
        players={[player]}
        matches={[match, { ...match, id: "m2" }]}
        ratingMode="score"
      />,
    );
    expect(screen.getByLabelText("Gráfico").textContent).not.toBe(before);
  });
  it("renders an empty season without inspecting a missing dataset", () => {
    render(
      <SeasonStats
        seasonId="s1"
        players={[]}
        matches={[]}
        ratingMode="score"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Evolución score/ }));
    expect(
      screen.getByRole("heading", { name: "Evolución del score acumulado" }),
    ).toBeInTheDocument();
  });
});
