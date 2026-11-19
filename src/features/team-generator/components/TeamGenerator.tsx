import { Shuffle, Users } from "lucide-react";
import { useState } from "react";
import { ShareButton } from "@/components/ui/ShareButton";
import { NewsCard } from "@/features/news/components/NewsCard";
import { createTeamNews, type UnitGolNews } from "@/features/news/utils/news";
import type { Match, Player } from "@/types";
import {
	calculateEloRatings,
	getEloRating,
	type RatingMode,
} from "@/utils/elo";
import { calculateScore, generateBalancedTeams } from "@/utils/playerStats";
import { PlayerSelector } from "./PlayerSelector";
import { TeamDisplay } from "./TeamDisplay";

interface TeamGeneratorProps {
	players: Player[];
	matches: Match[];
	seasonId: string | null;
	teamName?: string;
	ratingMode: RatingMode;
}

export function TeamGenerator({
	players,
	matches,
	seasonId,
	teamName,
	ratingMode,
}: TeamGeneratorProps) {
	const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
	const [teams, setTeams] = useState<{
		teamA: Player[];
		teamB: Player[];
	} | null>(null);
	const [news, setNews] = useState<UnitGolNews | null>(null);

	const handleTogglePlayer = (player: Player) => {
		setSelectedPlayers((prev) =>
			prev.some((p) => p.id === player.id)
				? prev.filter((p) => p.id !== player.id)
				: [...prev, player],
		);
	};

	const handleGenerateTeams = () => {
		if (selectedPlayers.length < 2) {
			alert("Selecciona al menos dos jugadores para generar equipos.");
			return;
		}
		const eloRatings =
			ratingMode === "elo" ? calculateEloRatings(matches, seasonId) : null;
		const getPlayerValue = (player: Player) =>
			ratingMode === "elo"
				? getEloRating(eloRatings, player.id)
				: calculateScore(player);
		const generatedTeams = generateBalancedTeams(
			selectedPlayers,
			getPlayerValue,
		);
		const teamAValue = generatedTeams.teamA.reduce(
			(total, player) => total + getPlayerValue(player),
			0,
		);
		const teamBValue = generatedTeams.teamB.reduce(
			(total, player) => total + getPlayerValue(player),
			0,
		);

		setTeams(generatedTeams);
		setNews(
			createTeamNews(teamAValue, teamBValue, {
				teamAPlayers: generatedTeams.teamA,
				teamBPlayers: generatedTeams.teamB,
				previousMatches: matches,
				seasonId,
			}),
		);
	};

	return (
		<div className="bg-white rounded-lg shadow-md p-6">
			<div className="flex justify-between mb-6 flex-col sm:flex-row gap-4">
				<div className="flex items-center gap-2">
					<Users className="w-6 h-6 text-emerald-600" />
					<h2 className="text-xl font-semibold">Generador de Equipos</h2>
				</div>
				<div className="flex flex-col-reverse gap-2 sm:flex-row">
					{teams && (
						<ShareButton
							teams={teams}
							seasonId={seasonId}
							matches={matches}
							ratingMode={ratingMode}
						/>
					)}
					<button
						type="button"
						onClick={handleGenerateTeams}
						className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors"
					>
						<Shuffle className="w-4 h-4" />
						Generar Equipos
					</button>
				</div>
			</div>

			<div className="mb-6">
				<h3 className="text-lg font-semibold mb-4">Selecciona los jugadores</h3>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
					{players.map((player) => (
						<PlayerSelector
							key={player.id}
							player={player}
							isSelected={selectedPlayers.some((p) => p.id === player.id)}
							onToggle={handleTogglePlayer}
						/>
					))}
				</div>
			</div>

			{teams && (
				<>
					<div className="grid md:grid-cols-2 gap-6">
						<TeamDisplay
							teamName="Equipo A"
							players={teams.teamA}
							allPlayers={players}
							matches={matches}
							seasonId={seasonId}
							ratingMode={ratingMode}
						/>
						<TeamDisplay
							teamName="Equipo B"
							players={teams.teamB}
							allPlayers={players}
							matches={matches}
							seasonId={seasonId}
							ratingMode={ratingMode}
						/>
					</div>
					{news && <NewsCard news={news} teamName={teamName} />}
				</>
			)}
		</div>
	);
}
