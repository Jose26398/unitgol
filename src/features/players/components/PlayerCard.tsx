import { Edit, Trash2, User } from "lucide-react";
import { useState } from "react";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import type { Match, Player, Season } from "@/types";
import { calculateScore, calculateWinRate } from "@/utils/playerStats";
import { calculateRecentForm, recentFormSymbols } from "@/utils/recentForm";
import { PlayerEditModal } from "./PlayerEditModal";

interface PlayerCardProps {
	player: Player;
	matches: Match[];
	seasonId: string | null;
	onDelete?: (id: string) => void;
	onEdit?: (id: string, updatedData: Partial<Omit<Player, "id">>) => void;
	seasons?: Season[];
	isAdmin: boolean;
}

export function PlayerCard({
	player,
	matches,
	seasonId,
	onDelete,
	onEdit,
	seasons,
	isAdmin,
}: PlayerCardProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [deleteConfirm, setDeleteConfirm] = useState(false);

	const winRate = calculateWinRate(player);
	const score = calculateScore(player);
	const recentForm = calculateRecentForm(player, matches, seasonId);

	const handleSave = (updatedData: Partial<Omit<Player, "id">>) => {
		if (onEdit) {
			onEdit(player.id, updatedData);
		}
		setIsEditing(false);
	};

	return (
		<div className="bg-white rounded-lg shadow-md p-5 hover:shadow-xl transition-shadow">
			{/* Header */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-4">
					<User className="w-10 h-10 text-emerald-600" />
					<h3 className="text-xl font-bold text-gray-800">{player.name}</h3>
				</div>
				<div className="flex items-center gap-3">
					{isAdmin && onEdit && (
						<button
							type="button"
							onClick={() => setIsEditing(true)}
							className="rounded-full text-emerald-600 hover:text-emerald-200 transition-colors"
							title="Editar jugador"
							aria-label="Editar jugador"
						>
							<Edit className="w-5 h-5" />
						</button>
					)}
					{isAdmin && onDelete && (
						<button
							type="button"
							onClick={() => setDeleteConfirm(true)}
							className="rounded-full text-red-600 hover:text-red-200 transition-colors"
							title="Eliminar jugador"
							aria-label="Eliminar jugador"
						>
							<Trash2 className="w-5 h-5" />
						</button>
					)}
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-2 gap-4 text-sm">
				<div>
					<p className="text-gray-500">Partidos V/E/D</p>
					<p className="text-lg font-medium text-gray-800">
						{player.wins}/{player.matches - player.wins - player.losses}/
						{player.losses}
					</p>
				</div>
				<div>
					<p className="text-gray-500">Tasa de victorias</p>
					<p className="text-lg font-medium text-gray-800">
						{winRate.toFixed(1)}%
					</p>
				</div>
				<div>
					<p className="text-gray-500">Goles</p>
					<p className="text-lg font-medium text-gray-800">{player.goals}</p>
				</div>
				<div>
					<p className="text-gray-500">Asistencias</p>
					<p className="text-lg font-medium text-gray-800">{player.assists}</p>
				</div>
			</div>

			{/* Player Score */}
			<div className="flex justify-between mt-6">
				<div className="mt-5 pt-4 border-t border-gray-200">
					<p className="text-gray-500 text-sm">Puntuación del jugador</p>
					<p className="text-2xl font-bold text-emerald-600">
						{score.toFixed(1)}
					</p>
				</div>
				<div className="mt-5 pt-4 text-sm">
					<p className="text-gray-500">Forma reciente</p>
					<p className="mt-1 text-lg">
						{recentForm.results.length > 0
							? recentForm.results
									.map((result) => recentFormSymbols[result])
									.join(" ")
							: "⚪"}
					</p>
				</div>
			</div>

			{/* Modal for editing */}
			{isEditing && (
				<PlayerEditModal
					player={player}
					seasons={seasons}
					onSave={handleSave}
					onCancel={() => setIsEditing(false)}
				/>
			)}

			<ConfirmDeleteModal
				open={deleteConfirm}
				title="¿Eliminar jugador?"
				message="¿Estás seguro de que deseas eliminar este jugador? Esta acción no se puede deshacer."
				confirmText="Eliminar"
				cancelText="Cancelar"
				onCancel={() => setDeleteConfirm(false)}
				onConfirm={() => {
					if (onDelete) onDelete(player.id);
					setDeleteConfirm(false);
				}}
			/>
		</div>
	);
}
