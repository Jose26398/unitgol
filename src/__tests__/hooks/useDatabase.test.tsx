// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SupabaseService } from "@/db/supabase-service";
import { useDatabase } from "@/hooks/useDatabase";
import type { Match, Player } from "@/types";
import { DEFAULT_SETTINGS } from "@/types";

const db = new SupabaseService();
db.setTeamId("team-a");
const player: Player = {
  id: "p1",
  name: "Alice",
  matches: 0,
  wins: 0,
  losses: 0,
  goals: 0,
  assists: 0,
};
const match: Match = {
  id: "m1",
  date: "2026-11-20",
  teamA: { players: [player], score: 0 },
  teamB: { players: [], score: 0 },
  goals: [],
};
beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(db, "getAllPlayers").mockResolvedValue([]);
  vi.spyOn(db, "getAllMatches").mockResolvedValue([]);
  vi.spyOn(db, "getAllSeasons").mockResolvedValue([]);
  vi.spyOn(db, "getSetting").mockImplementation(async (key) =>
    key === "goalScoreFactor" ? 10 : key === "assistScoreFactor" ? 5 : 0,
  );
  vi.spyOn(db, "addPlayer").mockResolvedValue("p1");
  vi.spyOn(db, "updatePlayer").mockResolvedValue();
  vi.spyOn(db, "deletePlayer").mockResolvedValue();
  vi.spyOn(db, "addMatch").mockResolvedValue("m1");
  vi.spyOn(db, "editMatch").mockResolvedValue();
  vi.spyOn(db, "deleteMatch").mockResolvedValue();
  vi.spyOn(db, "addSeason").mockResolvedValue("s1");
  vi.spyOn(db, "updateSeason").mockResolvedValue();
  vi.spyOn(db, "deleteSeason").mockResolvedValue();
  vi.spyOn(db, "setSetting").mockResolvedValue();
});

describe("useDatabase synchronization", () => {
  it("loads all team data and settings together", async () => {
    vi.mocked(db.getAllPlayers).mockResolvedValue([player]);
    const { result } = renderHook(() => useDatabase(db));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.players).toEqual([player]);
    expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
    expect(result.current.error).toBeNull();
  });

  it("ignores an older response when a newer refresh finishes first", async () => {
    let finish: (players: Player[]) => void = () => {};
    vi.mocked(db.getAllPlayers).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const { result } = renderHook(() => useDatabase(db));
    vi.mocked(db.getAllPlayers).mockResolvedValue([player]);
    await act(async () => {
      await result.current.refresh();
      finish([{ ...player, name: "Stale" }]);
    });
    expect(result.current.players).toEqual([player]);
  });

  it("ignores responses after the team screen unmounts", async () => {
    let finish: (players: Player[]) => void = () => {};
    vi.mocked(db.getAllPlayers).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const { result, unmount } = renderHook(() => useDatabase(db));
    unmount();
    await act(async () => finish([player]));
    expect(result.current.players).toEqual([]);
  });

  it("shows server error messages and recovers on refresh", async () => {
    vi.mocked(db.getAllPlayers).mockRejectedValueOnce({
      message: "Unavailable",
    });
    const { result } = renderHook(() => useDatabase(db));
    await waitFor(() => expect(result.current.error).toBe("Unavailable"));
    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.error).toBeNull();
  });

  it("uses a readable fallback for unexpected failures", async () => {
    vi.mocked(db.getSetting).mockRejectedValueOnce(null);
    const { result } = renderHook(() => useDatabase(db));
    await waitFor(() =>
      expect(result.current.error).toMatch(/actualizar los datos/),
    );
  });

  it("does not report a committed save as failed when refresh is unavailable", async () => {
    const { result } = renderHook(() => useDatabase(db));
    await waitFor(() => expect(result.current.loading).toBe(false));
    vi.mocked(db.getAllPlayers).mockRejectedValue(
      new Error("Refresh unavailable"),
    );
    await act(async () =>
      expect(await result.current.addMatch(match)).toBe("m1"),
    );
    expect(db.addMatch).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBe("Refresh unavailable");
  });

  it("propagates failed writes without refreshing or losing existing state", async () => {
    const { result } = renderHook(() => useDatabase(db));
    await waitFor(() => expect(result.current.loading).toBe(false));
    vi.mocked(db.addPlayer).mockRejectedValue(new Error("Save failed"));
    await act(async () =>
      expect(
        result.current.addPlayer({ name: "Alice", seasonId: "s1" }),
      ).rejects.toThrow("Save failed"),
    );
    expect(db.getAllPlayers).toHaveBeenCalledTimes(1);
  });

  it("refreshes players, matches, seasons and settings after every successful mutation", async () => {
    const { result } = renderHook(() => useDatabase(db));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.addPlayer({ name: "Alice", seasonId: "s1" });
      await result.current.editPlayer("p1", { name: "Bob" });
      await result.current.deletePlayer("p1");
      await result.current.editMatch(match);
      await result.current.deleteMatch(match);
      await result.current.addSeason({
        name: "Season",
        startDate: "2026-01-01",
      });
      await result.current.editSeason({
        id: "s1",
        name: "Updated",
        startDate: "2026-01-01",
      });
      await result.current.deleteSeason("s1");
      await result.current.saveSettings(DEFAULT_SETTINGS);
    });
    expect(db.getAllSeasons).toHaveBeenCalledTimes(10);
    expect(db.getSetting).toHaveBeenCalledTimes(30);
  });
});
