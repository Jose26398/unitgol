import type { ChartData } from "chart.js";
import type { Match, Player } from "@/types";

export type ChartMode = "bar" | "line";
export type ChartStat = "matches" | "goals" | "assists";

export interface ChartBuildResult {
	mode: ChartMode;
	stat: ChartStat;
	data: ChartData<"bar" | "line", number[], string>;
}

export interface ChartContext {
	players: Player[];
	playerStats: Player[];
	matchesChrono: Match[];
}

export const SPECIAL_STATS = new Set(["winloss", "winratio", "scoreEvolution"]);

const borderColor = (i: number, total: number) =>
	`hsl(${(i * 360) / total},70%,50%)`;
const backgroundColor = (i: number, total: number) =>
	`hsla(${(i * 360) / total},70%,50%,0.3)`;

export function buildChart(
	stat: string,
	useLine: boolean,
	calculatePoints: (player: Player) => number,
	ctx: ChartContext,
): ChartBuildResult | null {
	const { players, playerStats, matchesChrono } = ctx;

	const findStats = (p: Player) => playerStats.find((x) => x.id === p.id);
	const playedIn = (m: Match, id: string) =>
		m.teamA.players.some((pl) => pl.id === id) ||
		m.teamB.players.some((pl) => pl.id === id);

	// Stacked/grouped bar: wins and losses by player
	if (stat === "winloss") {
		return {
			mode: "bar",
			stat: "matches",
			data: {
				labels: players.map((p) => p.name),
				datasets: [
					{
						label: "Wins",
						data: players.map((p) => findStats(p)?.wins ?? 0),
						backgroundColor: "rgba(34,197,94,0.7)",
					},
					{
						label: "Losses",
						data: players.map((p) => findStats(p)?.losses ?? 0),
						backgroundColor: "rgba(239,68,68,0.7)",
					},
				],
			},
		};
	}

	// Bar: win percentage by player
	if (stat === "winratio") {
		return {
			mode: "bar",
			stat: "matches",
			data: {
				labels: players.map((p) => p.name),
				datasets: [
					{
						label: "% Victorias",
						data: players.map((p) => {
							const ps = findStats(p);
							return ps && ps.matches > 0 ? (ps.wins / ps.matches) * 100 : 0;
						}),
						backgroundColor: "rgba(132,204,22,0.7)",
					},
				],
			},
		};
	}

	// Line: evolution of accumulated score by player
	if (stat === "scoreEvolution") {
		const sortedPlayers = [...players]
			.sort((a, b) => {
				const sa = findStats(a);
				const sb = findStats(b);
				return (sb ? calculatePoints(sb) : 0) - (sa ? calculatePoints(sa) : 0);
			})
			.slice(0, 10);
		return {
			mode: "line",
			stat: "goals",
			data: {
				labels: matchesChrono.map((m) => new Date(m.date).toLocaleDateString()),
				datasets: sortedPlayers.map((p, i) => {
					let cumGoals = 0;
					let cumAssists = 0;
					let cumMatches = 0;
					let cumWins = 0;
					let cumLosses = 0;
					return {
						label: p.name,
						data: matchesChrono.map((m) => {
							if (playedIn(m, p.id)) {
								cumMatches++;
								const goalsInMatch = m.goals.filter(
									(g) => g.playerId === p.id,
								).length;
								const assistsInMatch = m.goals.filter(
									(g) => g.assistById === p.id,
								).length;
								cumGoals += goalsInMatch;
								cumAssists += assistsInMatch;
								const isA = m.teamA.players.some((pl) => pl.id === p.id);
								const isB = m.teamB.players.some((pl) => pl.id === p.id);
								if (isA && m.teamA.score > m.teamB.score) cumWins++;
								if (isB && m.teamB.score > m.teamA.score) cumWins++;
								if (isA && m.teamA.score < m.teamB.score) cumLosses++;
								if (isB && m.teamB.score < m.teamA.score) cumLosses++;
							}
							const score =
								cumMatches > 0
									? calculatePoints({
											...p,
											goals: cumGoals,
											assists: cumAssists,
											matches: cumMatches,
											wins: cumWins,
											losses: cumLosses,
										})
									: 0;
							return score;
						}),
						borderColor: borderColor(i, sortedPlayers.length),
						backgroundColor: backgroundColor(i, sortedPlayers.length),
						tension: 0.3,
					};
				}),
			},
		};
	}

	// Bar chart: total matches played by player
	if (stat === "matches" && !useLine) {
		return {
			mode: "bar",
			stat: "matches",
			data: {
				labels: players.map((p) => p.name),
				datasets: [
					{
						label: "Matches played",
						data: players.map((p) => findStats(p)?.matches ?? 0),
						backgroundColor: "rgba(16,185,129,0.7)",
					},
				],
			},
		};
	}

	// Line chart: accumulated matches played by player
	if ((stat === "matches" && useLine) || stat === "mostGames") {
		const sortedPlayers = [...players]
			.sort((a, b) => {
				const sa = findStats(a);
				const sb = findStats(b);
				return (sb ? sb.matches : 0) - (sa ? sa.matches : 0);
			})
			.slice(0, 10);
		return {
			mode: "line",
			stat: "matches",
			data: {
				labels: matchesChrono.map((m) => new Date(m.date).toLocaleDateString()),
				datasets: sortedPlayers.map((p, i) => {
					let acc = 0;
					return {
						label: p.name,
						data: matchesChrono.map((m) => {
							if (playedIn(m, p.id)) acc++;
							return acc;
						}),
						borderColor: borderColor(i, sortedPlayers.length),
						backgroundColor: backgroundColor(i, sortedPlayers.length),
						tension: 0.3,
					};
				}),
			},
		};
	}

	// Line chart: accumulated goals by player
	if (stat === "goals" && useLine) {
		return {
			mode: "line",
			stat: "goals",
			data: {
				labels: matchesChrono.map((m) => new Date(m.date).toLocaleDateString()),
				datasets: players.map((p, i) => {
					let acc = 0;
					return {
						label: p.name,
						data: matchesChrono.map((m) => {
							acc += m.goals.filter((g) => g.playerId === p.id).length;
							return acc;
						}),
						borderColor: borderColor(i, players.length),
						backgroundColor: backgroundColor(i, players.length),
						tension: 0.3,
					};
				}),
			},
		};
	}

	// Bar chart: total goals by player
	if (stat === "goals" && !useLine) {
		return {
			mode: "bar",
			stat: "goals",
			data: {
				labels: players.map((p) => p.name),
				datasets: [
					{
						label: "Goals",
						data: players.map((p) => findStats(p)?.goals ?? 0),
						backgroundColor: "rgba(244,63,94,0.7)",
					},
				],
			},
		};
	}

	// Line chart: accumulated assists by player
	if (stat === "assists" && useLine) {
		return {
			mode: "line",
			stat: "assists",
			data: {
				labels: matchesChrono.map((m) => new Date(m.date).toLocaleDateString()),
				datasets: players.map((p, i) => {
					let acc = 0;
					return {
						label: p.name,
						data: matchesChrono.map((m) => {
							acc += m.goals.filter((g) => g.assistById === p.id).length;
							return acc;
						}),
						borderColor: borderColor(i, players.length),
						backgroundColor: backgroundColor(i, players.length),
						tension: 0.3,
					};
				}),
			},
		};
	}

	// Bar chart: total assists by player
	if (stat === "assists" && !useLine) {
		return {
			mode: "bar",
			stat: "assists",
			data: {
				labels: players.map((p) => p.name),
				datasets: [
					{
						label: "Assists",
						data: players.map((p) => findStats(p)?.assists ?? 0),
						backgroundColor: "rgba(59,130,246,0.7)",
					},
				],
			},
		};
	}

	// Line chart: average goals per match by player
	if (stat === "avgGoals") {
		const sortedPlayers = [...players]
			.sort((a, b) => {
				const sa = findStats(a);
				const sb = findStats(b);
				return (sb ? sb.goals : 0) - (sa ? sa.goals : 0);
			})
			.slice(0, 10);
		return {
			mode: "line",
			stat: "goals",
			data: {
				labels: matchesChrono.map((m) => new Date(m.date).toLocaleDateString()),
				datasets: sortedPlayers.map((p, i) => {
					let played = 0;
					let goals = 0;
					return {
						label: p.name,
						data: matchesChrono.map((m) => {
							if (playedIn(m, p.id)) {
								played++;
								goals += m.goals.filter((g) => g.playerId === p.id).length;
							}
							return played ? goals / played : 0;
						}),
						borderColor: borderColor(i, sortedPlayers.length),
						backgroundColor: backgroundColor(i, sortedPlayers.length),
						tension: 0.3,
					};
				}),
			},
		};
	}

	// Line chart: average assists per match by player
	if (stat === "avgAssists") {
		const sortedPlayers = [...players]
			.sort((a, b) => {
				const sa = findStats(a);
				const sb = findStats(b);
				return (sb ? sb.assists : 0) - (sa ? sa.assists : 0);
			})
			.slice(0, 10);
		return {
			mode: "line",
			stat: "assists",
			data: {
				labels: matchesChrono.map((m) => new Date(m.date).toLocaleDateString()),
				datasets: sortedPlayers.map((p, i) => {
					let played = 0;
					let assists = 0;
					return {
						label: p.name,
						data: matchesChrono.map((m) => {
							if (playedIn(m, p.id)) {
								played++;
								assists += m.goals.filter((g) => g.assistById === p.id).length;
							}
							return played ? assists / played : 0;
						}),
						borderColor: borderColor(i, sortedPlayers.length),
						backgroundColor: backgroundColor(i, sortedPlayers.length),
						tension: 0.3,
					};
				}),
			},
		};
	}

	// Line chart: score per match by player (efficiency)
	if (stat === "efficiency") {
		const sortedPlayers = [...players]
			.sort((a, b) => {
				const sa = findStats(a);
				const sb = findStats(b);
				return (sb ? calculatePoints(sb) : 0) - (sa ? calculatePoints(sa) : 0);
			})
			.slice(0, 10);
		return {
			mode: "line",
			stat: "goals",
			data: {
				labels: matchesChrono.map((m) => new Date(m.date).toLocaleDateString()),
				datasets: sortedPlayers.map((p, i) => ({
					label: p.name,
					data: matchesChrono.map((m) => {
						const goals = m.goals.filter((g) => g.playerId === p.id).length;
						const assists = m.goals.filter((g) => g.assistById === p.id).length;
						return calculatePoints({
							...p,
							goals,
							assists,
							matches: 1,
							wins: 0,
							losses: 0,
						});
					}),
					borderColor: borderColor(i, sortedPlayers.length),
					backgroundColor: backgroundColor(i, sortedPlayers.length),
					tension: 0.3,
				})),
			},
		};
	}

	// Bar chart: total score by player (best player)
	if (stat === "score") {
		return {
			mode: "bar",
			stat: "goals",
			data: {
				labels: players.map((p) => p.name),
				datasets: [
					{
						label: "Score",
						data: players.map((p) => {
							const ps = findStats(p);
							return ps ? calculatePoints(ps) : 0;
						}),
						backgroundColor: "rgba(251,191,36,0.7)",
					},
				],
			},
		};
	}

	return null;
}

export function getChartTitle(
	chartMode: ChartMode,
	chartStat: ChartStat,
	detailChart: ChartData<"bar" | "line", number[], string> | null,
	players: Player[],
	selectedStat?: { stat: string; useLine: boolean },
) {
	if (!detailChart) return "";
	if (chartMode === "bar") {
		if (
			detailChart.datasets.length === 2 &&
			detailChart.datasets[0].label === "Victorias"
		)
			return "Victorias y derrotas por jugador";
		if (detailChart.datasets[0].label === "% Victorias")
			return "Porcentaje de victorias por jugador";
		return detailChart.datasets[0].label || "";
	}
	if (
		chartStat === "goals" &&
		chartMode === "line" &&
		detailChart.datasets.length === players.length &&
		detailChart.datasets[0].label !== "Score"
	)
		return "Evolución de goles";
	if (chartStat === "assists" && chartMode === "line")
		return "Evolución de asistencias";
	if (chartStat === "matches" && chartMode === "line")
		return "Evolución de partidos jugados";
	if (selectedStat && selectedStat.stat === "scoreEvolution")
		return "Evolución del score acumulado";
	if (
		chartStat === "goals" &&
		chartMode === "line" &&
		detailChart.datasets[0].label === "Score"
	)
		return "Jugador más eficiente";
	return "";
}
