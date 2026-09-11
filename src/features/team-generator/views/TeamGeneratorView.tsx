import { TeamGenerator } from "@/features/team-generator/components/TeamGenerator";
import type { Match, Player } from "@/types";
import type { RatingMode } from "@/utils/elo";

interface TeamGeneratorViewProps {
	players: Player[];
	matches: Match[];
	selectedSeasonId: string | null;
	ratingMode: RatingMode;
}

export function TeamGeneratorView({
	players,
	matches,
	selectedSeasonId,
	ratingMode,
}: TeamGeneratorViewProps) {
	const visiblePlayers = players.filter(
		(p: Player) => !selectedSeasonId || p.seasonId === selectedSeasonId,
	);

	return (
		<div className="space-y-6">
			{visiblePlayers.length > 0 ? (
				<TeamGenerator
					players={visiblePlayers}
					matches={matches}
					seasonId={selectedSeasonId}
					ratingMode={ratingMode}
				/>
			) : (
				<div className="text-center text-gray-500">
					No hay jugadores disponibles.
				</div>
			)}
		</div>
	);
}
