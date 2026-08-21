import type { Player } from "@/types";

interface TeamSelectorProps {
	team: "A" | "B";
	players: Player[];
	selectedPlayers: string[];
	otherTeamPlayers: string[];
	score: number | null;
	setScore: (score: number) => void;
	togglePlayerSelection: (playerId: string, team: "A" | "B") => void;
}

export function TeamSelector({
	team,
	players,
	selectedPlayers,
	otherTeamPlayers,
	score,
	setScore,
	togglePlayerSelection,
}: TeamSelectorProps) {
	const color = team === "A" ? "emerald" : "blue";
	return (
		<div>
			<h3
				className={`text-lg font-semibold text-gray-700 mb-3`}
			>{`Equipo ${team}`}</h3>
			<input
				type="number"
				min="0"
				value={score ?? ""}
				onChange={(e) => setScore(parseInt(e.target.value, 10))}
				className="w-full mb-4 border rounded-md p-2"
				placeholder="Goles"
				aria-label="Goles"
			/>
			<div className="border-t border-gray-300 mb-4" />
			<div className="space-y-2">
				{players.map((player) => (
					<label
						key={player.id}
						className={`flex items-center justify-between p-2 border rounded-md cursor-pointer ${
							selectedPlayers.includes(player.id)
								? team === "A"
									? "bg-emerald-50 border-emerald-300"
									: "bg-blue-50 border-blue-300"
								: "hover:bg-gray-100"
						} ${
							otherTeamPlayers.includes(player.id)
								? "opacity-50 pointer-events-none"
								: ""
						}`}
					>
						<span className="text-gray-700">{player.name}</span>
						<input
							type="checkbox"
							checked={selectedPlayers.includes(player.id)}
							onChange={() => togglePlayerSelection(player.id, team)}
							disabled={otherTeamPlayers.includes(player.id)}
							className={`form-checkbox text-${color}-600`}
							aria-label={`Añadir ${player.name} al equipo ${team}`}
						/>
					</label>
				))}
			</div>
			<div className="border-t border-gray-400 my-6" />
		</div>
	);
}
