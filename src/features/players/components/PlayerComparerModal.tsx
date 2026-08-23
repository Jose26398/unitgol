import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	computeHeadToHead,
	type HeadToHeadResult,
} from "@/features/players/utils/headToHead";
import type { Match, Player } from "@/types";
import { calculateScore, calculateWinRate } from "@/utils/playerStats";

interface StatRowData {
	label: string;
	valueA: string;
	valueB: string;
	numA: number;
	numB: number;
	better: "higher" | "lower" | "none";
}

const selectClassName =
	"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white";

function perMatch(total: number, matches: number): string {
	return matches > 0 ? (total / matches).toFixed(2) : "0.00";
}

export function PlayerComparerModal({
	players,
	matches,
	onClose,
}: {
	players: Player[];
	matches: Match[];
	onClose: () => void;
}) {
	const modalRef = useRef<HTMLDivElement>(null);
	const [playerAId, setPlayerAId] = useState(players[0]?.id ?? "");
	const [playerBId, setPlayerBId] = useState(players[1]?.id ?? "");

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (modalRef.current && !modalRef.current.contains(event.target as Node))
				onClose();
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [onClose]);

	const playerA = players.find((p) => p.id === playerAId);
	const playerB = players.find((p) => p.id === playerBId);

	const canCompare = Boolean(playerA && playerB && playerAId !== playerBId);

	const statRows: StatRowData[] = useMemo(() => {
		if (!canCompare || !playerA || !playerB) return [];
		return [
			{
				label: "Partidos",
				valueA: String(playerA.matches),
				valueB: String(playerB.matches),
				numA: playerA.matches,
				numB: playerB.matches,
				better: "none",
			},
			{
				label: "Victorias",
				valueA: String(playerA.wins),
				valueB: String(playerB.wins),
				numA: playerA.wins,
				numB: playerB.wins,
				better: "higher",
			},
			{
				label: "Empates",
				valueA: String(playerA.matches - playerA.wins - playerA.losses),
				valueB: String(playerB.matches - playerB.wins - playerB.losses),
				numA: playerA.matches - playerA.wins - playerA.losses,
				numB: playerB.matches - playerB.wins - playerB.losses,
				better: "none",
			},
			{
				label: "Derrotas",
				valueA: String(playerA.losses),
				valueB: String(playerB.losses),
				numA: playerA.losses,
				numB: playerB.losses,
				better: "lower",
			},
			{
				label: "% Victorias",
				valueA: `${calculateWinRate(playerA).toFixed(1)}%`,
				valueB: `${calculateWinRate(playerB).toFixed(1)}%`,
				numA: calculateWinRate(playerA),
				numB: calculateWinRate(playerB),
				better: "higher",
			},
			{
				label: "Goles",
				valueA: String(playerA.goals),
				valueB: String(playerB.goals),
				numA: playerA.goals,
				numB: playerB.goals,
				better: "higher",
			},
			{
				label: "Goles/partido",
				valueA: perMatch(playerA.goals, playerA.matches),
				valueB: perMatch(playerB.goals, playerB.matches),
				numA: playerA.matches > 0 ? playerA.goals / playerA.matches : 0,
				numB: playerB.matches > 0 ? playerB.goals / playerB.matches : 0,
				better: "higher",
			},
			{
				label: "Asistencias",
				valueA: String(playerA.assists),
				valueB: String(playerB.assists),
				numA: playerA.assists,
				numB: playerB.assists,
				better: "higher",
			},
			{
				label: "Asist./partido",
				valueA: perMatch(playerA.assists, playerA.matches),
				valueB: perMatch(playerB.assists, playerB.matches),
				numA: playerA.matches > 0 ? playerA.assists / playerA.matches : 0,
				numB: playerB.matches > 0 ? playerB.assists / playerB.matches : 0,
				better: "higher",
			},
			{
				label: "Puntuación",
				valueA: calculateScore(playerA).toFixed(1),
				valueB: calculateScore(playerB).toFixed(1),
				numA: calculateScore(playerA),
				numB: calculateScore(playerB),
				better: "higher",
			},
		];
	}, [canCompare, playerA, playerB]);

	const h2h: HeadToHeadResult = useMemo(
		() =>
			canCompare
				? computeHeadToHead(matches, playerAId, playerBId)
				: { duels: 0, winsA: 0, winsB: 0, draws: 0, duelList: [] },
		[canCompare, matches, playerAId, playerBId],
	);

	const getLeader = (stat: StatRowData): "a" | "b" | null => {
		if (stat.better === "none" || stat.numA === stat.numB) return null;
		const aBetter =
			stat.better === "higher" ? stat.numA > stat.numB : stat.numA < stat.numB;
		return aBetter ? "a" : "b";
	};

	const valueCellClass = (stat: StatRowData, side: "a" | "b"): string => {
		const base = "py-2 px-3 text-center text-lg whitespace-nowrap";
		if (getLeader(stat) === side) return `${base} font-bold text-emerald-600`;
		return `${base} font-medium text-gray-600`;
	};

	const winnerName = (winnerId: string | null): string => {
		if (!winnerId) return "Empate";
		return (
			players.find((p) => p.id === winnerId)?.name ?? "Jugador desconocido"
		);
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
				<h2 className="text-xl font-bold mb-4 text-emerald-600">Cara a Cara</h2>

				{players.length < 2 ? (
					<p className="text-center py-6 text-gray-500">
						Se necesitan al menos dos jugadores para comparar.
					</p>
				) : (
					<>
						<div className="grid grid-cols-2 gap-4 mb-6">
							<div>
								<label
									htmlFor="comparer-player-a"
									className="block text-sm text-gray-500 mb-1"
								>
									Jugador 1
								</label>
								<select
									id="comparer-player-a"
									value={playerAId}
									onChange={(e) => setPlayerAId(e.target.value)}
									className={selectClassName}
								>
									{players.map((p) => (
										<option key={p.id} value={p.id}>
											{p.name}
										</option>
									))}
								</select>
							</div>
							<div>
								<label
									htmlFor="comparer-player-b"
									className="block text-sm text-gray-500 mb-1"
								>
									Jugador 2
								</label>
								<select
									id="comparer-player-b"
									value={playerBId}
									onChange={(e) => setPlayerBId(e.target.value)}
									className={selectClassName}
								>
									{players.map((p) => (
										<option key={p.id} value={p.id}>
											{p.name}
										</option>
									))}
								</select>
							</div>
						</div>

						{!canCompare ? (
							<p className="text-center py-6 text-gray-500">
								Selecciona dos jugadores distintos para ver la comparación.
							</p>
						) : (
							<>
								<div className="grid grid-cols-3 items-center mb-4">
									<div className="text-right pr-2 min-w-0">
										<span
											className="font-bold text-gray-800 truncate block"
											title={playerA?.name}
										>
											{playerA?.name}
										</span>
									</div>
									<div className="text-center text-xl font-extrabold text-gray-300">
										VS
									</div>
									<div className="text-left pl-2 min-w-0">
										<span
											className="font-bold text-gray-800 truncate block"
											title={playerB?.name}
										>
											{playerB?.name}
										</span>
									</div>
								</div>

								<table className="w-full text-sm mb-6">
									<tbody>
										{statRows.map((stat) => (
											<tr key={stat.label} className="border-b">
												<td className={valueCellClass(stat, "a")}>
													{stat.valueA}
												</td>
												<td className="py-2 px-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wide">
													{stat.label}
												</td>
												<td className={valueCellClass(stat, "b")}>
													{stat.valueB}
												</td>
											</tr>
										))}
									</tbody>
								</table>

								<h3 className="text-lg font-bold mb-3 text-gray-800">
									Enfrentamientos directos
								</h3>
								<div className="grid grid-cols-3 gap-2 text-center mb-4">
									<div className="bg-emerald-50 rounded-md py-2">
										<div className="text-2xl font-bold text-emerald-600">
											{h2h.winsA}
										</div>
										<div
											className="text-xs text-gray-500 truncate px-1"
											title={playerA?.name}
										>
											{playerA?.name}
										</div>
									</div>
									<div className="bg-gray-50 rounded-md py-2">
										<div className="text-2xl font-bold text-gray-400">
											{h2h.draws}
										</div>
										<div className="text-xs text-gray-500">Empates</div>
									</div>
									<div className="bg-emerald-50 rounded-md py-2">
										<div className="text-2xl font-bold text-emerald-600">
											{h2h.winsB}
										</div>
										<div
											className="text-xs text-gray-500 truncate px-1"
											title={playerB?.name}
										>
											{playerB?.name}
										</div>
									</div>
								</div>

								{h2h.duelList.length > 0 ? (
									<ul className="max-h-48 overflow-y-auto divide-y divide-gray-100">
										{h2h.duelList.map((duel) => (
											<li
												key={duel.matchId}
												className="flex items-center justify-between py-2 text-sm"
											>
												<span className="text-gray-500">
													{format(new Date(duel.date), "dd MMM yyyy", {
														locale: es,
													})}
												</span>
												<span className="font-semibold">
													<span
														className={
															duel.winnerId === playerAId
																? "text-emerald-600"
																: "text-gray-600"
														}
													>
														{duel.scoreA}
													</span>
													<span className="text-gray-400 mx-1">-</span>
													<span
														className={
															duel.winnerId === playerBId
																? "text-emerald-600"
																: "text-gray-600"
														}
													>
														{duel.scoreB}
													</span>
												</span>
												<span className="text-xs text-gray-500">
													{duel.winnerId
														? `Ganó ${winnerName(duel.winnerId)}`
														: "Empate"}
												</span>
											</li>
										))}
									</ul>
								) : (
									<p className="text-center py-4 text-gray-500">
										Sin enfrentamientos directos entre estos jugadores.
									</p>
								)}
							</>
						)}
					</>
				)}

				<div className="flex justify-end mt-6">
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
	);
}
