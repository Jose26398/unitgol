import { Edit, Trash2, User } from "lucide-react";
import { useState } from "react";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import type { Match, Player, Season } from "@/types";
import { type EloRatings, getEloRating, type RatingMode } from "@/utils/elo";
import { calculateScore, calculateWinRate } from "@/utils/playerStats";
import { calculateRecentForm, recentFormSymbols } from "@/utils/recentForm";
import { getPlayerAvatarUrl } from "../utils/playerAvatar";
import { AchievementsSection } from "./AchievementsSection";
import { PlayerEditModal } from "./PlayerEditModal";
import { PositionBadge } from "./PlayerPositionSelector";

interface PlayerCardProps {
	player: Player;
	players: Player[];
	matches: Match[];
	seasonId: string | null;
	onDelete?: (id: string) => void;
	onEdit?: (
		id: string,
		updatedData: Partial<Omit<Player, "id" | "avatarPath">>,
		avatarFile?: File,
		removeAvatar?: boolean,
	) => Promise<void>;
	seasons?: Season[];
	isAdmin: boolean;
	ratingMode: RatingMode;
	eloRatings?: EloRatings;
}

export function PlayerCard({
	player,
	players,
	matches,
	seasonId,
	onDelete,
	onEdit,
	seasons,
	isAdmin,
	ratingMode,
	eloRatings,
}: PlayerCardProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [deleteConfirm, setDeleteConfirm] = useState(false);
	const [deleteError, setDeleteError] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);

	const winRate = calculateWinRate(player);
	const calculatePoints = (player: Player) =>
		ratingMode === "elo"
			? getEloRating(eloRatings, player.id)
			: calculateScore(player);

	const recentForm = calculateRecentForm(player, matches, seasonId);
	const playerRating = calculatePoints(player);
	const achievementMatches = matches.filter(
		(match) => !seasonId || match.seasonId === seasonId,
	);

	const handleSave = async (
		updatedData: Partial<Omit<Player, "id" | "avatarPath">>,
		avatarFile?: File,
		removeAvatar?: boolean,
	) => {
		if (onEdit) {
			await onEdit(player.id, updatedData, avatarFile, removeAvatar);
		}
		setIsEditing(false);
	};

	const handleDelete = async () => {
		if (!onDelete) return;
		setIsDeleting(true);
		setDeleteError("");
		try {
			await onDelete(player.id);
			setDeleteConfirm(false);
		} catch (error) {
			setDeleteError(
				error instanceof Error
					? error.message
					: "No se pudo eliminar el jugador.",
			);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md shadow-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
			<div className="relative isolate aspect-7/8 overflow-hidden bg-linear-to-br from-emerald-700 via-slate-800 to-slate-950">
				{player.avatarPath ? (
					<img
						src={getPlayerAvatarUrl(player.avatarPath)}
						alt={`Foto de ${player.name}`}
						className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
					/>
				) : (
					<div className="absolute inset-0 grid place-items-center">
						<User className="h-28 w-28 text-white/35" />
					</div>
				)}
				<div
					aria-hidden="true"
					className="absolute inset-0 bg-linear-to-b from-slate-950/15 via-transparent to-slate-950/90"
				/>
				<div className="absolute left-4 top-4 flex min-w-14 flex-col items-center rounded-xl border border-white/60 bg-white/90 px-3 py-2 text-slate-900 shadow-lg backdrop-blur-md">
					<span className="text-2xl font-black leading-none">
						{playerRating.toFixed(ratingMode === "elo" ? 0 : 1)}
					</span>
					<span className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em]">
						{ratingMode === "elo" ? "ELO" : "PTS"}
					</span>
				</div>
				<div className="absolute right-4 top-4 flex gap-1.5">
					{isAdmin && onEdit && (
						<button
							type="button"
							onClick={() => setIsEditing(true)}
							className="grid h-9 w-9 place-items-center rounded-full bg-slate-950/50 text-white shadow-sm ring-1 ring-white/50 backdrop-blur-md transition hover:bg-white hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-white"
							title="Editar jugador"
							aria-label="Editar jugador"
						>
							<Edit className="h-4 w-4" />
						</button>
					)}
					{isAdmin && onDelete && (
						<button
							type="button"
							onClick={() => {
								setDeleteError("");
								setDeleteConfirm(true);
							}}
							className="grid h-9 w-9 place-items-center rounded-full bg-slate-950/50 text-white shadow-sm ring-1 ring-white/50 backdrop-blur-md transition hover:bg-white hover:text-red-700 focus-visible:outline-2 focus-visible:outline-white"
							title="Eliminar jugador"
							aria-label="Eliminar jugador"
						>
							<Trash2 className="h-4 w-4" />
						</button>
					)}
				</div>
				<div className="absolute inset-x-4 bottom-3 text-white">
					<div className="flex items-center gap-1 flex-wrap mb-1">
						{player.positions && player.positions.length > 0
							? player.positions.map((pos) => (
									<PositionBadge key={pos} position={pos} />
								))
							: null}
					</div>
					<h3 className="mb-2 wrap-break-word text-xl font-black uppercase leading-tight tracking-wide drop-shadow sm:text-2xl">
						{player.name}
					</h3>
					<div className="flex items-end justify-between gap-3">
						<div className="min-w-0 flex-1">
							<AchievementsSection
								player={player}
								players={players}
								matches={achievementMatches}
							/>
						</div>
						<div className="shrink-0 text-right">
							<p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-300">
								Forma reciente
							</p>
							<p className="text-sm">
								{recentForm.results.length > 0
									? recentForm.results
											.map((result) => recentFormSymbols[result])
											.join(" ")
									: "⚪"}
							</p>
						</div>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-x-5 bg-linear-to-br from-white to-slate-50 px-4 py-3">
				<div className="border-b border-slate-200 py-2">
					<p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
						Partidos V/E/D
					</p>
					<p className="text-lg font-black tabular-nums text-slate-800">
						{player.wins}/{player.matches - player.wins - player.losses}/
						{player.losses}
					</p>
				</div>
				<div className="border-b border-slate-200 py-2">
					<p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
						Victorias
					</p>
					<p className="text-lg font-black tabular-nums text-slate-800">
						{winRate.toFixed(1)}%
					</p>
				</div>
				<div className="py-2">
					<p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
						Goles
					</p>
					<p className="text-lg font-black tabular-nums text-slate-800">
						{player.goals}
					</p>
				</div>
				<div className="py-2">
					<p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
						Asistencias
					</p>
					<p className="text-lg font-black tabular-nums text-slate-800">
						{player.assists}
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
					isAdmin={isAdmin}
				/>
			)}

			<ConfirmDeleteModal
				open={deleteConfirm}
				title="¿Eliminar jugador?"
				message="¿Estás seguro de que deseas eliminar este jugador? Esta acción no se puede deshacer."
				confirmText="Eliminar"
				cancelText="Cancelar"
				onCancel={() => setDeleteConfirm(false)}
				onConfirm={handleDelete}
				errorMessage={deleteError}
				isConfirming={isDeleting}
			/>
		</div>
	);
}
