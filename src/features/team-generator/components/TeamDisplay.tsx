import { useMemo } from "react";
import { PlayerCard } from "@/features/players/components/PlayerCard";
import { usePlayerScore } from "@/features/settings/SettingsContext";
import type { Match, Player } from "@/types";
import {
  calculateEloRatings,
  getEloRating,
  type RatingMode,
} from "@/utils/elo";

interface TeamDisplayProps {
  teamName: string;
  players: Player[];
  allPlayers: Player[];
  matches: Match[];
  seasonId: string | null;
  ratingMode: RatingMode;
}

export function TeamDisplay({
  teamName,
  players,
  allPlayers,
  matches,
  seasonId,
  ratingMode,
}: TeamDisplayProps) {
  const calculateScore = usePlayerScore();
  const eloRatings = useMemo(
    () =>
      ratingMode === "elo" ? calculateEloRatings(matches, seasonId) : null,
    [matches, ratingMode, seasonId],
  );
  const teamScore = useMemo(() => {
    const total = players.reduce(
      (sum, player) =>
        sum +
        (ratingMode === "elo"
          ? getEloRating(eloRatings, player.id)
          : calculateScore(player)),
      0,
    );
    return total.toFixed(2);
  }, [players, ratingMode, eloRatings, calculateScore]);

  return (
    <div>
      <h3 className="text-2xl under font-semibold my-4">
        {teamName} {ratingMode === "elo" ? "ELO" : "🌟"}
        <span className="italic">{teamScore}</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {players.map((player, index) => (
          <div
            key={player.id}
            className={
              index === 0
                ? "sm:col-span-2 sm:mx-auto sm:w-full sm:max-w-sm"
                : ""
            }
          >
            <PlayerCard
              player={player}
              players={allPlayers}
              matches={matches}
              seasonId={seasonId}
              isAdmin={false}
              ratingMode={ratingMode}
              eloRatings={eloRatings ?? undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
