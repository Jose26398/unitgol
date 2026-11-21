// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TeamBalance } from "@/features/team-generator/components/TeamBalance";

describe("TeamBalance", () => {
  it.each([
    [25, 75, 25],
    [75, 25, 75],
    [0, 75, 0],
    [25, 0, 100],
    [0, 0, 50],
    [23.3, 24.4, (23.3 / (23.3 + 24.4)) * 100],
  ])(
    "compares %s against %s using proportional widths",
    (teamAScore, teamBScore, percentage) => {
      render(
        <TeamBalance
          teamAScore={teamAScore}
          teamBScore={teamBScore}
          ratingMode="score"
        />,
      );

      const bar = screen.getByRole("img", {
        name: `Reparto de puntuación: Equipo A ${percentage.toFixed(1)}%, Equipo B ${(100 - percentage).toFixed(1)}%`,
      });
      expect(bar.children[0]).toHaveStyle({ width: `${percentage}%` });
      expect(bar.children[1]).toHaveStyle({ width: `${100 - percentage}%` });
      expect(screen.getAllByText("PTS")).toHaveLength(2);
    },
  );

  it("labels ELO totals using the same proportions", () => {
    render(
      <TeamBalance teamAScore={1200} teamBScore={1800} ratingMode="elo" />,
    );

    expect(screen.getAllByText("ELO")).toHaveLength(2);
    expect(
      screen.getByRole("img", {
        name: "Reparto de puntuación: Equipo A 40.0%, Equipo B 60.0%",
      }),
    ).toBeInTheDocument();
  });
});
