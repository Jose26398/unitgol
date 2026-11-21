// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useNewMatchForm } from "@/features/new-match/hooks/useNewMatchForm";
import type { Player } from "@/types";

const player: Player = {
  id: "p1",
  name: "Alice",
  matches: 0,
  wins: 0,
  losses: 0,
  goals: 0,
  assists: 0,
};
describe("new match selection", () => {
  it("moves a player between teams without allowing overlap", () => {
    const { result } = renderHook(() => useNewMatchForm([player]));
    act(() => result.current.togglePlayerSelection("p1", "A"));
    expect(result.current.teamAPlayers).toEqual(["p1"]);
    act(() => result.current.togglePlayerSelection("p1", "B"));
    expect(result.current.teamAPlayers).toEqual([]);
    expect(result.current.availablePlayers).toEqual([player]);
    act(() => result.current.togglePlayerSelection("p1", "B"));
    expect(result.current.availablePlayers).toEqual([]);
  });
  it("removes invalid contributions when the lineup changes and resets after saving", () => {
    const { result } = renderHook(() => useNewMatchForm([player]));
    act(() => {
      result.current.handleAddGoal({
        playerId: "p1",
        assistById: "p2",
        minute: 10,
      });
      result.current.setMatchDate("2026-11-20");
    });
    act(() => result.current.togglePlayerSelection("p2", "B"));
    expect(result.current.goals).toEqual([
      { playerId: "p1", assistById: undefined, minute: 10 },
    ]);
    act(() => result.current.togglePlayerSelection("p1", "A"));
    expect(result.current.goals).toEqual([]);
    act(() => result.current.reset());
    expect(result.current.matchDate).toBeNull();
    expect(result.current.selectedPlayers).toEqual([]);
  });
});
