import { NewMatchForm } from "@/features/new-match/components/NewMatchForm";
import type { Match, Player } from "@/types";

interface NewMatchViewProps {
	players: Player[];
	matches: Match[];
	selectedSeasonId: string | null;
	teamName?: string;
	isAdmin: boolean;
	onAddMatch: (match: Omit<Match, "id">) => Promise<unknown>;
}

export function NewMatchView({
	players,
	matches,
	selectedSeasonId,
	teamName,
	isAdmin,
	onAddMatch,
}: NewMatchViewProps) {
	return (
		<div className="space-y-6">
			{isAdmin ? (
				<NewMatchForm
					players={players}
					matches={matches}
					teamName={teamName}
					onAddMatch={onAddMatch}
					selectedSeasonId={selectedSeasonId}
				/>
			) : (
				<div className="text-center text-gray-500">
					Solo los administradores pueden crear partidos.
				</div>
			)}
		</div>
	);
}
