import { describe, expect, it } from "vitest";
import type { Player } from "@/types";
import { getPlayerResult } from "@/utils/matches";

const player = (id: string): Player => ({
  id,
  name: id,
  matches: 0,
  wins: 0,
  losses: 0,
  goals: 0,
  assists: 0,
});
describe("player match results", () => {
  it("resolves both sides and refuses a player outside the match", () => {
    const match = {
      teamA: { players: [player("a")], score: 2 },
      teamB: { players: [player("b")], score: 1 },
    };
    expect(getPlayerResult("a", match)).toBe("win");
    expect(getPlayerResult("b", match)).toBe("loss");
    expect(getPlayerResult("outside", match)).toBeNull();
    match.teamB.score = 2;
    expect(getPlayerResult("a", match)).toBe("draw");
    match.teamB.score = 3;
    expect(getPlayerResult("a", match)).toBe("loss");
    expect(getPlayerResult("b", match)).toBe("win");
  });
});
