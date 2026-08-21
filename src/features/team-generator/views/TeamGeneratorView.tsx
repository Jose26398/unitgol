import { TeamGenerator } from "@/features/team-generator/components/TeamGenerator";
import type { Player } from "@/types";

interface TeamGeneratorViewProps {
	players: Player[];
	selectedSeasonId: string | null;
}

export function TeamGeneratorView({
	players,
	selectedSeasonId,
}: TeamGeneratorViewProps) {
	const visiblePlayers = players.filter(
		(p: Player) => !selectedSeasonId || p.seasonId === selectedSeasonId,
	);

	return (
		<div className="space-y-6">
			{visiblePlayers.length > 0 ? (
				<TeamGenerator players={visiblePlayers} />
			) : (
				<div className="text-center text-gray-500">
					No hay jugadores disponibles.
				</div>
			)}
		</div>
	);
}
