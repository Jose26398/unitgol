import { useEffect, useRef, useState } from "react";
import { ShareButton } from "@/components/ui/ShareButton";
import type { Match, Player } from "@/types";
import { calculateScore, calculateWinRate } from "@/utils/playerStats";
import { calculateRecentForm, recentFormSymbols } from "@/utils/recentForm";

type SortKey = "name" | "matches" | "goals" | "assists" | "score";
type SortOrder = "asc" | "desc";

export function PlayerSummaryModal({
	players,
	matches,
	seasonId,
	onClose,
}: {
	players: Player[];
	matches: Match[];
	seasonId: string | null;
	onClose: () => void;
}) {
	const modalRef = useRef<HTMLDivElement>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [sortKey, setSortKey] = useState<SortKey>("score");
	const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (modalRef.current && !modalRef.current.contains(event.target as Node))
				onClose();
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [onClose]);

	const handleSort = (key: SortKey) => {
		if (sortKey === key) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortKey(key);
			setSortOrder("desc");
		}
	};

	const filteredAndSortedPlayers = players
		.filter((player) =>
			player.name.toLowerCase().includes(searchTerm.toLowerCase()),
		)
		.sort((a, b) => {
			let aValue: number | string = 0;
			let bValue: number | string = 0;

			switch (sortKey) {
				case "name":
					aValue = a.name;
					bValue = b.name;
					break;
				case "matches":
					aValue = a.matches;
					bValue = b.matches;
					break;
				case "goals":
					aValue = a.goals;
					bValue = b.goals;
					break;
				case "assists":
					aValue = a.assists;
					bValue = b.assists;
					break;
				case "score":
					aValue = calculateScore(a);
					bValue = calculateScore(b);
					break;
			}

			if (typeof aValue === "string" && typeof bValue === "string") {
				return sortOrder === "asc"
					? aValue.localeCompare(bValue)
					: bValue.localeCompare(aValue);
			}

			const numA = typeof aValue === "number" ? aValue : 0;
			const numB = typeof bValue === "number" ? bValue : 0;
			return sortOrder === "asc" ? numA - numB : numB - numA;
		});

	const getSortIndicator = (column: SortKey) => {
		if (sortKey !== column) return "⇅";
		return sortOrder === "asc" ? "↑" : "↓";
	};

	return (
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
			role="dialog"
			aria-modal="true"
		>
			<div
				ref={modalRef}
				className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-lg"
			>
				<h2 className="text-xl font-bold mb-4 text-emerald-500">
					Resumen de Jugadores
				</h2>

				<div className="mb-4">
					<input
						type="text"
						placeholder="Buscar jugador..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
					/>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b bg-gray-50">
								<th
									className="text-left py-3 px-2 cursor-pointer hover:bg-gray-100 font-semibold w-1/4"
									onClick={() => handleSort("name")}
								>
									Jugador{" "}
									<span
										className={
											sortKey === "name" ? "ml-1" : "text-gray-300 ml-1"
										}
									>
										{getSortIndicator("name")}
									</span>
								</th>
								<th
									className="text-left py-3 px-2 cursor-pointer hover:bg-gray-100 font-semibold"
									onClick={() => handleSort("matches")}
								>
									Partidos{" "}
									<span
										className={
											sortKey === "matches" ? "ml-1" : "text-gray-300 ml-1"
										}
									>
										{getSortIndicator("matches")}
									</span>
								</th>
								<th
									className="text-left py-3 px-2 cursor-pointer hover:bg-gray-100 font-semibold"
									onClick={() => handleSort("goals")}
								>
									Goles{" "}
									<span
										className={
											sortKey === "goals" ? "ml-1" : "text-gray-300 ml-1"
										}
									>
										{getSortIndicator("goals")}
									</span>
								</th>
								<th
									className="text-left py-3 px-2 cursor-pointer hover:bg-gray-100 font-semibold"
									onClick={() => handleSort("assists")}
								>
									Asist.{" "}
									<span
										className={
											sortKey === "assists" ? "ml-1" : "text-gray-300 ml-1"
										}
									>
										{getSortIndicator("assists")}
									</span>
								</th>
								<th
									className="text-left py-3 px-2 cursor-pointer hover:bg-gray-100 font-semibold"
									onClick={() => handleSort("score")}
								>
									Rating{" "}
									<span
										className={
											sortKey === "score" ? "ml-1" : "text-gray-300 ml-1"
										}
									>
										{getSortIndicator("score")}
									</span>
								</th>
							</tr>
						</thead>
						<tbody>
							{filteredAndSortedPlayers.length > 0 ? (
								filteredAndSortedPlayers.map((player) => {
									const draws = player.matches - player.wins - player.losses;
									const winRate = calculateWinRate(player).toFixed(2);
									const recentForm = calculateRecentForm(
										player,
										matches,
										seasonId,
									);
									const goalsPerMatch = player.matches
										? (player.goals / player.matches).toFixed(2)
										: "-";
									const assistsPerMatch = player.matches
										? (player.assists / player.matches).toFixed(2)
										: "-";
									const score = calculateScore(player).toFixed(2);

									return (
										<tr
											key={player.id}
											className="border-b hover:bg-gray-50 transition-colors"
										>
											<td
												className="py-3 px-2 truncate max-w-37.5"
												title={player.name}
											>
												<div className="font-medium">{player.name}</div>
												<div className="text-xs text-gray-500">
													{recentForm.results.length > 0
														? recentForm.results
																.map((result) => recentFormSymbols[result])
																.join(" ")
														: "⚪"}
												</div>
											</td>
											<td className="py-3 px-2">
												<div>
													V: {player.wins}, E: {draws}, D: {player.losses}
												</div>
												<div className="text-xs text-gray-500">
													WR {winRate}%
												</div>
											</td>
											<td className="py-3 px-2">
												<div>⚽ {player.goals}</div>
												<div className="text-xs text-gray-500">
													GPP {goalsPerMatch}
												</div>
											</td>
											<td className="py-3 px-2">
												<div>🎯 {player.assists}</div>
												<div className="text-xs text-gray-500">
													APP {assistsPerMatch}
												</div>
											</td>
											<td className="py-3 px-2 font-semibold text-emerald-600">
												{score}
											</td>
										</tr>
									);
								})
							) : (
								<tr>
									<td colSpan={5} className="text-center py-6 text-gray-500">
										No se encontraron jugadores
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				<div className="flex justify-between mt-6">
					<div className="text-sm text-gray-600">
						Mostrando {filteredAndSortedPlayers.length} de {players.length}{" "}
						jugadores
					</div>
					<div className="flex gap-2">
						<ShareButton players={filteredAndSortedPlayers} />
						<button
							type="button"
							onClick={onClose}
							className="bg-red-500 text-white px-4 py-2 rounded-sm hover:bg-red-600 transition-colors"
							aria-label="Cerrar modal"
						>
							Cerrar
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
