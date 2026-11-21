import { describe, expect, it, vi } from "vitest";
import type { Player } from "@/types";
import {
  calculateScore,
  calculateWinRate,
  generateBalancedTeams,
} from "@/utils/playerStats";

const player = (id: number, goals = id): Player => ({
  id: String(id),
  name: `Player ${id}`,
  matches: 10,
  wins: 5,
  losses: 3,
  goals,
  assists: 0,
});
const score = (team: Player[]) => team.reduce((sum, p) => sum + p.goals, 0);
describe("player scoring and bounded team generation", () => {
  it("counts draws as half a win and handles players without matches", () => {
    expect(calculateWinRate(player(1))).toBe(60);
    expect(calculateWinRate({ ...player(1), matches: 0 })).toBe(0);
    expect(calculateScore({ ...player(1), matches: 0 })).toBe(0);
  });
  it("uses explicit factors without contaminating subsequent calculations", () => {
    const p = { ...player(1), assists: 5 };
    const original = calculateScore(p);
    expect(
      calculateScore(p, { goalScoreFactor: 0, assistScoreFactor: 0 }),
    ).toBeLessThan(original);
    expect(calculateScore(p)).toBe(original);
  });
  it.each([0, 1, 2, 7, 14, 20, 21, 31, 32, 100])(
    "partitions %i players without loss or duplicates",
    (count) => {
      const players = Array.from({ length: count }, (_, i) => player(i));
      const before = [...players];
      const getValue = vi.fn((p: Player) => p.goals);
      const { teamA, teamB } = generateBalancedTeams(players, getValue);
      expect(teamA).toHaveLength(Math.ceil(count / 2));
      expect(teamB).toHaveLength(Math.floor(count / 2));
      expect(new Set([...teamA, ...teamB].map((p) => p.id)).size).toBe(count);
      expect(getValue).toHaveBeenCalledTimes(count);
      expect(players).toEqual(before);
    },
  );
  it("finds the exact optimum on small squads, even when greedy choices fail", () => {
    const players = [8, 7, 6, 5, 4, 1].map((value, i) => player(i, value));
    const { teamA, teamB } = generateBalancedTeams(players, (p) => p.goals);
    expect(Math.abs(score(teamA) - score(teamB))).toBe(1);
    expect(generateBalancedTeams(players)).toHaveProperty("teamA");
  });
  it("balances a 100-player squad without bitmask overflow or exponential work", () => {
    const players = Array.from({ length: 100 }, (_, i) => player(i, i % 9));
    const { teamA, teamB } = generateBalancedTeams(players, (p) => p.goals);
    expect(Math.abs(score(teamA) - score(teamB))).toBeLessThanOrEqual(1);
  });
});
