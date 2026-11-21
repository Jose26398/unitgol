import type { Match } from "@/types";

export type MatchResult = "win" | "draw" | "loss";

export function getPlayerResult(
  playerId: string,
  match: Pick<Match, "teamA" | "teamB">,
): MatchResult | null {
  const inA = match.teamA.players.some((player) => player.id === playerId);
  if (!inA && !match.teamB.players.some((player) => player.id === playerId))
    return null;
  const difference = inA
    ? match.teamA.score - match.teamB.score
    : match.teamB.score - match.teamA.score;
  return difference === 0 ? "draw" : difference > 0 ? "win" : "loss";
}
