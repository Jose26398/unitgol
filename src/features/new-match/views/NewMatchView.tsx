import { NewMatchForm } from "@/features/new-match/components/NewMatchForm";
import type { Match, Player } from "@/types";

interface NewMatchViewProps {
	players: Player[];
	selectedSeasonId: string | null;
	isAdmin: boolean;
	onAddMatch: (match: Omit<Match, "id">) => void;
}

export function NewMatchView({
	players,
	selectedSeasonId,
	isAdmin,
	onAddMatch,
}: NewMatchViewProps) {
	return (
		<div className="space-y-6">
			{isAdmin ? (
				<NewMatchForm
					players={players}
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
