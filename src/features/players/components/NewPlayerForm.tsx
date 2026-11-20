import { UserPlus } from "lucide-react";
import { useState } from "react";
import type { Player } from "@/types";

interface NewPlayerFormProps {
	onAddPlayer: (
		player: Omit<
			Player,
			"id" | "matches" | "wins" | "losses" | "goals" | "assists"
		> & { seasonId: string },
	) => Promise<unknown>;
	selectedSeasonId: string | null;
	playerCount: number;
}

export function NewPlayerForm({
	onAddPlayer,
	selectedSeasonId,
	playerCount,
}: NewPlayerFormProps) {
	const [name, setName] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !selectedSeasonId || playerCount >= 100) return;
		setSaving(true);
		setError("");
		try {
			await onAddPlayer({
				name: name.trim(),
				seasonId: selectedSeasonId,
			});
			setName("");
		} catch (addError) {
			setError(
				addError instanceof Error
					? addError.message
					: "No se pudo añadir el jugador.",
			);
		} finally {
			setSaving(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="bg-white rounded-lg shadow-md p-6 mb-6 w-full space-y-4"
		>
			<h2 className="text-xl font-semibold flex items-center gap-2">
				<UserPlus className="w-6 h-6 text-emerald-600" />
				Añadir nuevo jugador
			</h2>
			<div className="flex gap-4 md:flex-row flex-col">
				<input
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Nombre del jugador"
					className="flex-1 border rounded-md p-2"
					required
					disabled={saving || playerCount >= 100}
				/>
				{playerCount >= 100 && (
					<p className="text-red-600 text-sm self-center">
						El equipo ya tiene el máximo de 100 jugadores.
					</p>
				)}
				<button
					type="submit"
					disabled={saving || playerCount >= 100}
					className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors shrink-0"
				>
					{saving ? "Añadiendo..." : "Añadir jugador"}
				</button>
			</div>
			{error && (
				<p className="text-red-600 text-sm mt-3" role="alert">
					{error}
				</p>
			)}
		</form>
	);
}
