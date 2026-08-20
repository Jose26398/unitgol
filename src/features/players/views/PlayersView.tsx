import { NewPlayerForm } from "@/features/players/components/NewPlayerForm";
import { PlayerCard } from "@/features/players/components/PlayerCard";
import type { Player, Season } from "@/types";

interface PlayersViewProps {
	players: Player[];
	seasons: Season[];
	selectedSeasonId: string | null;
	isAdmin: boolean;
	onAddPlayer: (
		player: Omit<
			Player,
			"id" | "matches" | "wins" | "losses" | "goals" | "assists"
		> & { seasonId: string },
	) => void;
	onEditPlayer: (id: string, updatedData: Partial<Omit<Player, "id">>) => void;
	onDeletePlayer: (id: string) => void;
	onOpenSummary: () => void;
}

export function PlayersView({
	players,
	seasons,
	selectedSeasonId,
	isAdmin,
	onAddPlayer,
	onEditPlayer,
	onDeletePlayer,
	onOpenSummary,
}: PlayersViewProps) {
	const visiblePlayers = players.filter(
		(p: Player) => !selectedSeasonId || p.seasonId === selectedSeasonId,
	);

	return (
		<>
			<div className="flex gap-4 md:flex-row flex-col w-full justify-between">
				<button
					type="button"
					onClick={onOpenSummary}
					className="bg-emerald-600 text-white mb-6 p-6 rounded-lg shadow-md hover:bg-emerald-700"
				>
					Tabla Resumen
				</button>
				{isAdmin && (
					<NewPlayerForm
						onAddPlayer={onAddPlayer}
						selectedSeasonId={selectedSeasonId}
					/>
				)}
			</div>
			{visiblePlayers.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{visiblePlayers.map((player: Player) => (
						<PlayerCard
							key={player.id}
							player={player}
							onEdit={onEditPlayer}
							onDelete={onDeletePlayer}
							seasons={seasons}
							isAdmin={isAdmin}
						/>
					))}
				</div>
			) : (
				<div className="text-center text-gray-500">
					No hay jugadores disponibles.
				</div>
			)}
		</>
	);
}
