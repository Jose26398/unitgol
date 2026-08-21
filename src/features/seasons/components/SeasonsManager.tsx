import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import type { Season } from "@/types";

interface SeasonsManagerProps {
	seasons: Season[];
	onAddSeason: (season: Omit<Season, "id">) => void;
	onEditSeason: (season: Season) => void;
	onDeleteSeason: (id: string) => void;
	selectedSeasonId?: string | null;
	onSelectSeason?: (seasonId: string) => void;
	isAdmin: boolean;
}

export function SeasonsManager({
	seasons,
	onAddSeason,
	onEditSeason,
	onDeleteSeason,
	selectedSeasonId,
	onSelectSeason,
	isAdmin,
}: SeasonsManagerProps) {
	const [showForm, setShowForm] = useState(false);
	const [form, setForm] = useState<Omit<Season, "id">>({
		name: "",
		startDate: "",
		endDate: "",
	});
	const [editId, setEditId] = useState<string | null>(null);
	const [deleteId, setDeleteId] = useState<string | null>(null);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (editId) {
			onEditSeason({ ...form, id: editId });
		} else {
			onAddSeason(form);
		}
		setForm({ name: "", startDate: "", endDate: "" });
		setEditId(null);
		setShowForm(false);
	};

	const handleEdit = (season: Season) => {
		setForm({
			name: season.name,
			startDate: season.startDate,
			endDate: season.endDate,
		});
		setEditId(season.id);
		setShowForm(true);
	};

	return (
		<div>
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-xl font-bold">Temporadas</h2>
				{isAdmin && (
					<button
						type="button"
						className="bg-emerald-600 text-white px-4 py-2 rounded-sm"
						onClick={() => {
							setShowForm(true);
							setEditId(null);
						}}
					>
						Nueva Temporada
					</button>
				)}
			</div>
			{showForm && (
				<form className="mb-6 space-y-2" onSubmit={handleSubmit}>
					<input
						className="border p-2 rounded-sm w-full"
						placeholder="Nombre de la temporada"
						value={form.name}
						onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
						required
					/>
					<input
						className="border p-2 rounded-sm w-full"
						type="date"
						value={form.startDate}
						onChange={(e) =>
							setForm((f) => ({ ...f, startDate: e.target.value }))
						}
						required
					/>
					<input
						className="border p-2 rounded-sm w-full"
						type="date"
						value={form.endDate || ""}
						onChange={(e) =>
							setForm((f) => ({ ...f, endDate: e.target.value }))
						}
					/>
					<div className="flex gap-2">
						<button
							className="bg-emerald-600 text-white px-4 py-2 rounded-sm"
							type="submit"
						>
							{editId ? "Guardar" : "Crear"}
						</button>
						<button
							className="bg-gray-300 px-4 py-2 rounded-sm"
							type="button"
							onClick={() => {
								setShowForm(false);
								setEditId(null);
							}}
						>
							Cancelar
						</button>
					</div>
				</form>
			)}
			<ul className="mb-8 space-y-2">
				{seasons.map((season) => (
					<li
						key={season.id}
						className={`flex justify-between items-center border p-3 rounded-sm bg-white transition-colors ${selectedSeasonId === season.id ? "bg-emerald-100 border-emerald-400" : "hover:bg-gray-50"}`}
					>
						<button
							type="button"
							className="flex-1 text-left cursor-pointer"
							onClick={() => onSelectSeason?.(season.id)}
						>
							<div className="font-semibold">{season.name}</div>
							<div className="text-sm text-gray-500">
								{season.startDate} {season.endDate ? `- ${season.endDate}` : ""}
							</div>
						</button>
						{isAdmin && (
							<div className="flex gap-4 mr-4">
								<button
									type="button"
									className="text-emerald-600"
									onClick={(e) => {
										e.stopPropagation();
										handleEdit(season);
									}}
								>
									<Edit className="inline-block w-5 h-5" />
								</button>
								<button
									type="button"
									className="text-red-500"
									onClick={(e) => {
										e.stopPropagation();
										setDeleteId(season.id);
									}}
								>
									<Trash2 className="inline-block w-5 h-5" />
								</button>
								<ConfirmDeleteModal
									open={!!deleteId}
									title="¿Eliminar temporada?"
									message="¿Estás seguro de que deseas eliminar esta temporada? Esta acción no se puede deshacer."
									confirmText="Eliminar"
									cancelText="Cancelar"
									onCancel={() => setDeleteId(null)}
									onConfirm={() => {
										if (deleteId) onDeleteSeason(deleteId);
										setDeleteId(null);
									}}
								/>
							</div>
						)}
					</li>
				))}
			</ul>
		</div>
	);
}
