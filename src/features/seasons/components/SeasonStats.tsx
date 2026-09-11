import type { ChartData } from "chart.js";
import { useCallback, useMemo, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import type { Match, Player } from "@/types";
import { calculateScore } from "@/utils/playerStats";
import "../charts/chartSetup";
import {
	Award,
	BarChart2,
	Goal,
	Star,
	TrendingUp,
	Trophy,
	User2,
	UserCheck,
	UserPlus,
	Users,
	Volleyball,
} from "lucide-react";
import { calculateEloRatings, getEloRating } from "@/utils/elo";
import {
	buildChart,
	type ChartBuildResult,
	getChartTitle,
	SPECIAL_STATS,
} from "../charts/chartBuilders";
import { Header, StatsSection } from "./StatCard";

interface SeasonStatsProps {
	seasonId: string;
	players: Player[];
	matches: Match[];
	ratingMode: "elo" | "score";
}

export function SeasonStats({ seasonId, players, matches, ratingMode }: SeasonStatsProps) {
	const filteredPlayers = useMemo(
		() => players.filter((p) => p.seasonId === seasonId),
		[players, seasonId],
	);

	const [selectedStat, setSelectedStat] = useState<{
		stat: string;
		useLine: boolean;
	}>({ stat: "score", useLine: false });

	// Memoized data
	const seasonMatches = useMemo(
		() => matches.filter((m) => m.seasonId === seasonId),
		[matches, seasonId],
	);
	const matchesChrono = useMemo(
		() =>
			[...seasonMatches].sort(
				(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
			),
		[seasonMatches],
	);

	const calculatePoints = useCallback(
		(player: Player) =>
			ratingMode === "elo"
				? getEloRating(calculateEloRatings(matches, seasonId), player.id)
				: calculateScore(player),
		[ratingMode, matches, seasonId],
	);


	const playerStats = useMemo(
		() =>
			filteredPlayers.map((player) => {
				const played = seasonMatches.filter(
					(m) =>
						m.teamA.players.some((p) => p.id === player.id) ||
						m.teamB.players.some((p) => p.id === player.id),
				);
				let goals = 0,
					assists = 0,
					wins = 0,
					losses = 0;
				played.forEach((m) => {
					goals += m.goals.filter((g) => g.playerId === player.id).length;
					assists += m.goals.filter((g) => g.assistById === player.id).length;
					const isA = m.teamA.players.some((p) => p.id === player.id);
					const isB = m.teamB.players.some((p) => p.id === player.id);
					if (isA && m.teamA.score > m.teamB.score) wins++;
					if (isB && m.teamB.score > m.teamA.score) wins++;
					if (isA && m.teamA.score < m.teamB.score) losses++;
					if (isB && m.teamB.score < m.teamA.score) losses++;
				});
				return {
					...player,
					matches: played.length,
					goals,
					assists,
					wins,
					losses,
				};
			}),
		[filteredPlayers, seasonMatches],
	);

	const [chart, setChart] = useState<ChartBuildResult | null>(() =>
		buildChart("score", false, calculatePoints, {
			players: filteredPlayers,
			playerStats,
			matchesChrono,
		}),
	);

	// Awards and general stats
	const bestPlayer = useMemo(
		() =>
			playerStats.reduce<Player | null>(
				(b, p) => {
					return !b || calculatePoints(p) > calculatePoints(b) ? p : b;
				},
				null,
			),
		[playerStats, calculatePoints],
	);
	const topScorer = useMemo(
		() =>
			playerStats.reduce<Player | null>(
				(b, p) => (!b || p.goals > b.goals ? p : b),
				null,
			),
		[playerStats],
	);
	const topAssistant = useMemo(
		() =>
			playerStats.reduce<Player | null>(
				(b, p) => (!b || p.assists > b.assists ? p : b),
				null,
			),
		[playerStats],
	);
	const totalGoals = useMemo(
		() => playerStats.reduce((s, p) => s + p.goals, 0),
		[playerStats],
	);
	const totalAssists = useMemo(
		() => playerStats.reduce((s, p) => s + p.assists, 0),
		[playerStats],
	);
	const avgGoals = useMemo(
		() =>
			seasonMatches.length
				? (totalGoals / seasonMatches.length).toFixed(2)
				: "0",
		[totalGoals, seasonMatches.length],
	);
	const avgAssists = useMemo(
		() =>
			seasonMatches.length
				? (totalAssists / seasonMatches.length).toFixed(2)
				: "0",
		[totalAssists, seasonMatches.length],
	);
	const mostGames = useMemo(
		() =>
			playerStats.reduce<Player | null>(
				(b, p) => (!b || p.matches > b.matches ? p : b),
				null,
			),
		[playerStats],
	);

	// Handler to change the dynamic chart
	const onClickStat = useCallback(
		(stat: string, useLine: boolean) => {
			const result = buildChart(stat, useLine, calculatePoints, {
				players: filteredPlayers,
				playerStats,
				matchesChrono,
			});
			if (result) {
				setChart(result);
				if (!SPECIAL_STATS.has(stat)) {
					setSelectedStat({ stat, useLine });
				}
			}
		},
		[filteredPlayers, playerStats, matchesChrono, calculatePoints],
	);

	return (
		<section className="mb-8 p-6 bg-white rounded-2xl shadow-lg">
			<Header title="Estadísticas de la temporada" />

			<StatsSection
				title="Premios"
				icon={<Trophy className="w-5 h-5" />}
				titleClass="text-yellow-600"
				stats={[
					{
						icon: <Trophy className="text-yellow-500" />,
						label: "Mejor jugador",
						value: bestPlayer
							? `${bestPlayer.name} (${calculatePoints(bestPlayer).toFixed(1)})`
							: "-",
						onValueClick: () => onClickStat("score", false),
						highlight: selectedStat.stat === "score" && !selectedStat.useLine,
					},
					{
						icon: <Award className="text-rose-500" />,
						label: "Máximo goleador",
						value: topScorer ? `${topScorer.name} (${topScorer.goals})` : "-",
						onValueClick: () => onClickStat("goals", false),
						highlight: selectedStat.stat === "goals" && !selectedStat.useLine,
					},
					{
						icon: <Star className="text-cyan-500" />,
						label: "Máximo asistente",
						value: topAssistant
							? `${topAssistant.name} (${topAssistant.assists})`
							: "-",
						onValueClick: () => onClickStat("assists", false),
						highlight: selectedStat.stat === "assists" && !selectedStat.useLine,
					},
				]}
			/>

			<StatsSection
				title="Estadísticas generales"
				icon={<BarChart2 className="w-5 h-5" />}
				titleClass="text-emerald-600"
				stats={[
					{
						icon: <Users className="text-blue-500" />,
						label: "Partidos jugados",
						value: seasonMatches.length,
						onValueClick: () => onClickStat("matches", false),
						highlight: selectedStat.stat === "matches" && !selectedStat.useLine,
					},
					{
						icon: <Volleyball className="text-emerald-500" />,
						label: "Total de goles",
						value: totalGoals,
						onValueClick: () => onClickStat("goals", true),
						highlight: selectedStat.stat === "goals" && selectedStat.useLine,
					},
					{
						icon: <UserPlus className="text-sky-500" />,
						label: "Total de asistencias",
						value: totalAssists,
						onValueClick: () => onClickStat("assists", true),
						highlight: selectedStat.stat === "assists" && selectedStat.useLine,
					},
				]}
			/>

			<StatsSection
				title="Promedios y eficiencia"
				icon={<TrendingUp className="w-5 h-5" />}
				titleClass="text-sky-600"
				stats={[
					{
						icon: <BarChart2 className="text-orange-500" />,
						label: "Victorias/Derrotas",
						value: "",
						onValueClick: () => onClickStat("winloss", false),
						highlight: selectedStat.stat === "winloss",
					},
					{
						icon: <Star className="text-lime-500" />,
						label: "% Victorias",
						value: "",
						onValueClick: () => onClickStat("winratio", false),
						highlight: selectedStat.stat === "winratio",
					},
					{
						icon: <TrendingUp className="text-yellow-500" />,
						label: "Evolución score",
						value: "",
						onValueClick: () => onClickStat("scoreEvolution", true),
						highlight: selectedStat.stat === "scoreEvolution",
					},
					{
						icon: <Goal className="text-emerald-400" />,
						label: "Prom. goles/partido",
						value: avgGoals,
						onValueClick: () => onClickStat("avgGoals", true),
						highlight: selectedStat.stat === "avgGoals",
					},
					{
						icon: <UserCheck className="text-sky-400" />,
						label: "Prom. asistencias/partido",
						value: avgAssists,
						onValueClick: () => onClickStat("avgAssists", true),
						highlight: selectedStat.stat === "avgAssists",
					},
					{
						icon: <User2 className="text-indigo-500" />,
						label: "Jugador con más partidos",
						value: mostGames ? `${mostGames.name} (${mostGames.matches})` : "-",
						onValueClick: () => onClickStat("mostGames", true),
						highlight: selectedStat.stat === "mostGames",
					},
				]}
			/>

			{/* Gráfica dinámica (línea por jugador o barra individual) */}
			{chart && (
				<div className="my-8 bg-white rounded-xl p-6 shadow-md border border-emerald-100 animate-fade-in">
					<div className="flex justify-between items-center mb-4">
						<h5 className="text-lg font-bold flex items-center gap-2">
							<BarChart2 className="w-5 h-5 text-emerald-500" />
							{getChartTitle(
								chart.mode,
								chart.stat,
								chart.data,
								players,
								selectedStat,
							)}
						</h5>
					</div>
					<div
						style={{
							minHeight: 400,
							height: 400,
							width: "100%",
							position: "relative",
						}}
					>
						{chart.mode === "bar" ? (
							<Bar
								data={chart.data as ChartData<"bar", number[], string>}
								options={{
									responsive: true,
									maintainAspectRatio: false,
									layout: { padding: 0 },
									plugins: {
										legend: { position: "bottom" },
										title: { display: false },
									},
								}}
								height={400}
							/>
						) : (
							<Line
								data={
									chart.data as unknown as ChartData<"line", number[], string>
								}
								options={{
									responsive: true,
									maintainAspectRatio: false,
									plugins: { legend: { position: "bottom" } },
								}}
							/>
						)}
					</div>
				</div>
			)}
		</section>
	);
}
