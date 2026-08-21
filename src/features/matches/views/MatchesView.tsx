import { MatchCard } from "@/features/matches/components/MatchCard";
import type { Match } from "@/types";

interface MatchesViewProps {
	matches: Match[];
	selectedSeasonId: string | null;
	isAdmin: boolean;
	onEditMatch: (match: Match) => void;
	onDeleteMatch: (match: Match) => void;
}

export function MatchesView({
	matches,
	selectedSeasonId,
	isAdmin,
	onEditMatch,
	onDeleteMatch,
}: MatchesViewProps) {
	const visibleMatches = matches.filter(
		(m: Match) => !selectedSeasonId || m.seasonId === selectedSeasonId,
	);

	return (
		<>
			{visibleMatches.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{visibleMatches.map((match: Match) => (
						<MatchCard
							key={match.id}
							match={match}
							onEdit={onEditMatch}
							onDelete={onDeleteMatch}
							isAdmin={isAdmin}
						/>
					))}
				</div>
			) : (
				<div className="text-center text-gray-500">
					No hay partidos disponibles.
				</div>
			)}
		</>
	);
}
