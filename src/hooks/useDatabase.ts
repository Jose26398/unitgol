import { useCallback, useEffect, useRef, useState } from "react";
import type { SupabaseService } from "@/db/supabase-service";
import {
  DEFAULT_SETTINGS,
  type Match,
  type NewPlayer,
  type Player,
  type PlayerUpdate,
  type Season,
  type TeamSettings,
} from "@/types";
import { errorMessage } from "@/utils/errors";

export function useDatabase(db: SupabaseService) {
  const [data, setData] = useState({
    players: [] as Player[],
    matches: [] as Match[],
    seasons: [] as Season[],
    settings: DEFAULT_SETTINGS,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(false);
  const revision = useRef(0);

  const refresh = useCallback(async () => {
    const current = ++revision.current;
    try {
      const [players, matches, seasons, settings] = await Promise.all([
        db
          .getAllPlayers()
          .then((players) =>
            players.sort((a, b) => a.name.localeCompare(b.name)),
          ),
        db.getAllMatches(),
        db.getAllSeasons(),
        Promise.all([
          db.getSetting("goalScoreFactor"),
          db.getSetting("assistScoreFactor"),
          db.getSetting("ratingMode"),
        ]).then(
          ([goal, assist, rating]): TeamSettings => ({
            goalScoreFactor: goal ?? 10,
            assistScoreFactor: assist ?? 5,
            ratingMode: rating === 1 ? "elo" : "score",
          }),
        ),
      ]);
      if (mounted.current && current === revision.current) {
        setData({ players, matches, seasons, settings });
        setError(null);
      }
    } catch (e) {
      if (mounted.current && current === revision.current) {
        setError(
          errorMessage(
            e,
            "No se pudieron actualizar los datos. Recarga para sincronizarlos.",
          ),
        );
      }
    } finally {
      if (mounted.current && current === revision.current) setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    return () => {
      mounted.current = false;
      ++revision.current;
    };
  }, [refresh]);

  async function mutate<T>(action: () => Promise<T>): Promise<T> {
    const result = await action();
    // A failed refresh must not make a committed write look like a failed save.
    if (mounted.current) await refresh();
    return result;
  }

  return {
    ...data,
    loading,
    error,
    refresh,
    addPlayer: (player: NewPlayer) =>
      mutate(() => db.addPlayer(player.name, player.seasonId)),
    editPlayer: (
      id: string,
      values: PlayerUpdate,
      avatar?: File,
      removeAvatar?: boolean,
    ) => mutate(() => db.updatePlayer(id, values, avatar, removeAvatar)),
    deletePlayer: (id: string) => mutate(() => db.deletePlayer(id)),
    addMatch: (match: Omit<Match, "id">) => mutate(() => db.addMatch(match)),
    editMatch: (match: Match) => mutate(() => db.editMatch(match)),
    deleteMatch: (match: Match) => mutate(() => db.deleteMatch(match.id)),
    addSeason: (season: Omit<Season, "id">) =>
      mutate(() => db.addSeason(season)),
    editSeason: (season: Season) => mutate(() => db.updateSeason(season)),
    deleteSeason: (id: string) => mutate(() => db.deleteSeason(id)),
    saveSettings: (settings: TeamSettings) =>
      mutate(async () => {
        await Promise.all([
          db.setSetting("goalScoreFactor", settings.goalScoreFactor),
          db.setSetting("assistScoreFactor", settings.assistScoreFactor),
          db.setSetting("ratingMode", settings.ratingMode === "elo" ? 1 : 0),
        ]);
      }),
  };
}
