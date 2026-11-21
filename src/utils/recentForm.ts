import type { Match, Player } from "@/types";
import { getPlayerResult, type MatchResult } from "./matches";

export type RecentFormResult = MatchResult;

export const recentFormSymbols: Record<RecentFormResult, string> = {
  win: "🟢",
  draw: "🟡",
  loss: "🔴",
};

export interface RecentForm {
  results: RecentFormResult[];
  percentage: number | null;
}

export function calculateRecentForm(
  player: Player,
  matches: Match[],
  seasonId: string | null,
): RecentForm {
  const results = matches
    .filter((match) => !seasonId || match.seasonId === seasonId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .flatMap((match) => {
      const result = getPlayerResult(player.id, match);
      return result ? [result] : [];
    })
    .slice(0, 5);
  if (results.length === 0) {
    return { results, percentage: null };
  }

  const weightedWins = results.reduce(
    (total, result) =>
      total + (result === "win" ? 1 : result === "draw" ? 0.5 : 0),
    0,
  );

  return {
    results,
    percentage: (weightedWins / results.length) * 100,
  };
}
