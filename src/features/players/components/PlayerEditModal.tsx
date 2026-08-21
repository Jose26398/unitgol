import { useState } from "react";
import type { Player, Season } from "@/types";

interface PlayerEditModalProps {
	player: Player;
	seasons?: Season[];
	onSave: (updatedData: Partial<Omit<Player, "id">>) => void;
	onCancel: () => void;
}

export function PlayerEditModal({
	player,
	seasons,
	onSave,
	onCancel,
}: PlayerEditModalProps) {
	const [editedData, setEditedData] = useState<Partial<Omit<Player, "id">>>({
		name: player.name,
		matches: player.matches,
		goals: player.goals,
		assists: player.assists,
		seasonId: player.seasonId,
	});

	const handleSave = () => {
		onSave(editedData);
	};

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
			<div className="bg-white p-6 rounded-lg shadow-lg w-96">
				<h2 className="text-xl font-semibold mb-4">Editar Jugador</h2>
				<form className="space-y-3">
					<div>
						<label
							htmlFor="player-name"
							className="block text-sm font-medium text-gray-600"
						>
							Nombre
						</label>
						<input
							id="player-name"
							type="text"
							className="w-full border border-gray-300 rounded-sm px-3 py-2"
							value={editedData.name}
							onChange={(e) =>
								setEditedData({ ...editedData, name: e.target.value })
							}
						/>
					</div>
					<div>
						<label
							htmlFor="player-matches"
							className="block text-sm font-medium text-gray-600"
						>
							Partidos
						</label>
						<input
							id="player-matches"
							type="number"
							className="w-full border border-gray-300 rounded-sm px-3 py-2"
							value={editedData.matches}
							onChange={(e) =>
								setEditedData({ ...editedData, matches: +e.target.value })
							}
						/>
					</div>
					<div>
						<label
							htmlFor="player-goals"
							className="block text-sm font-medium text-gray-600"
						>
							Goles
						</label>
						<input
							id="player-goals"
							type="number"
							className="w-full border border-gray-300 rounded-sm px-3 py-2"
							value={editedData.goals}
							onChange={(e) =>
								setEditedData({ ...editedData, goals: +e.target.value })
							}
						/>
					</div>
					<div>
						<label
							htmlFor="player-assists"
							className="block text-sm font-medium text-gray-600"
						>
							Asistencias
						</label>
						<input
							id="player-assists"
							type="number"
							className="w-full border border-gray-300 rounded-sm px-3 py-2"
							value={editedData.assists}
							onChange={(e) =>
								setEditedData({ ...editedData, assists: +e.target.value })
							}
						/>
					</div>
					{seasons && (
						<div>
							<label
								htmlFor="player-season"
								className="block text-sm font-medium text-gray-600"
							>
								Temporada
							</label>
							<select
								id="player-season"
								className="w-full border border-gray-300 rounded-sm px-3 py-2"
								value={editedData.seasonId}
								onChange={(e) =>
									setEditedData({ ...editedData, seasonId: e.target.value })
								}
							>
								{seasons.map((season) => (
									<option key={season.id} value={season.id}>
										{season.name}
									</option>
								))}
							</select>
						</div>
					)}
				</form>
				<div className="flex justify-end gap-3 mt-4">
					<button
						type="button"
						onClick={onCancel}
						className="px-4 py-2 bg-gray-300 text-gray-700 rounded-sm hover:bg-gray-400"
					>
						Cancelar
					</button>
					<button
						type="button"
						onClick={handleSave}
						className="px-4 py-2 bg-emerald-600 text-white rounded-sm hover:bg-emerald-700"
					>
						Guardar
					</button>
				</div>
			</div>
		</div>
	);
}
