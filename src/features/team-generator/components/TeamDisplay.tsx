import { useMemo } from "react";
import { PlayerCard } from "@/features/players/components/PlayerCard";
import type { Match, Player } from "@/types";
import { calculateEloRatings, getEloRating, type RatingMode } from "@/utils/elo";
import { calculateScore } from "@/utils/playerStats";

interface TeamDisplayProps {
	teamName: string;
	players: Player[];
	matches: Match[];
	seasonId: string | null;
	ratingMode: RatingMode;
}

export function TeamDisplay({
	teamName,
	players,
	matches,
	seasonId,
	ratingMode,
}: TeamDisplayProps) {
	const eloRatings = useMemo(
		() => (ratingMode === "elo" ? calculateEloRatings(matches, seasonId) : null),
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
	}, [players, ratingMode, eloRatings]);

	return (
		<div>
			<h3 className="text-2xl under font-semibold my-4">
				{teamName} {ratingMode === "elo" ? "ELO" : "🌟"}
				<span className="italic">{teamScore}</span>
			</h3>
			<div className="space-y-4">
				{players.map((player) => (
					<PlayerCard
						key={player.id}
						player={player}
						players={players}
						matches={matches}
						seasonId={seasonId}
						isAdmin={false}
						ratingMode={ratingMode}
					/>
				))}
			</div>
		</div>
	);
}
