import { useState } from "react";
import { AchievementsInfoModal } from "@/features/players/components/AchievementsInfoModal";
import { NewPlayerForm } from "@/features/players/components/NewPlayerForm";
import { PlayerCard } from "@/features/players/components/PlayerCard";
import type { Match, Player, Season } from "@/types";
import type { RatingMode } from "@/utils/elo";

interface PlayersViewProps {
	players: Player[];
	matches: Match[];
	seasons: Season[];
	selectedSeasonId: string | null;
	ratingMode: RatingMode;
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
	onOpenComparer: () => void;
}

export function PlayersView({
	players,
	matches,
	seasons,
	selectedSeasonId,
	ratingMode,
	isAdmin,
	onAddPlayer,
	onEditPlayer,
	onDeletePlayer,
	onOpenSummary,
	onOpenComparer,
}: PlayersViewProps) {
	const [showAchievementsInfo, setShowAchievementsInfo] = useState(false);
	const visiblePlayers = players.filter(
		(p: Player) => !selectedSeasonId || p.seasonId === selectedSeasonId,
	);
	return (
		<>
			<div className="flex gap-4 md:flex-row flex-col w-full justify-between">
				<button
					type="button"
					onClick={onOpenSummary}
					className="bg-emerald-600 text-white mb-1 md:mb-6 p-6 rounded-lg shadow-md hover:bg-emerald-700"
				>
					Tabla Resumen
				</button>
				<div className="flex gap-4 mb-6">
					<button
						type="button"
						onClick={onOpenComparer}
						className="flex-1 bg-emerald-600 text-white p-6 rounded-lg shadow-md hover:bg-emerald-700"
					>
						Cara a Cara
					</button>
					<button
						type="button"
						onClick={() => setShowAchievementsInfo(true)}
						className="bg-gray-600 text-white p-6 rounded-lg shadow-md hover:bg-gray-700"
					>
						Logros
					</button>
				</div>
				{isAdmin && (
					<NewPlayerForm
						onAddPlayer={onAddPlayer}
						selectedSeasonId={selectedSeasonId}
					/>
				)}
			</div>
			{showAchievementsInfo && (
				<AchievementsInfoModal onClose={() => setShowAchievementsInfo(false)} />
			)}
			{visiblePlayers.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{visiblePlayers.map((player: Player) => (
						<PlayerCard
							key={player.id}
							player={player}
							players={visiblePlayers}
							matches={matches}
							seasonId={selectedSeasonId}
							onEdit={onEditPlayer}
							onDelete={onDeletePlayer}
							seasons={seasons}
							isAdmin={isAdmin}
							ratingMode={ratingMode}
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
