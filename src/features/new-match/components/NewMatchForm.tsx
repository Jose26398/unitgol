import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useNewMatchForm } from "@/features/new-match/hooks/useNewMatchForm";
import { NewsCard } from "@/features/news/components/NewsCard";
import { createMatchNews, type UnitGolNews } from "@/features/news/utils/news";
import type { Match, Player } from "@/types";
import { GoalsSection } from "./GoalsSection";
import { MatchDateInput } from "./MatchDateInput";
import { TeamSelector } from "./TeamSelector";

interface NewMatchFormProps {
	players: Player[];
	matches: Match[];
	teamName?: string;
	onAddMatch: (match: Omit<Match, "id">) => Promise<unknown>;
	selectedSeasonId: string | null;
}

export function NewMatchForm({
	players,
	matches,
	teamName,
	onAddMatch,
	selectedSeasonId,
}: NewMatchFormProps) {
	const [news, setNews] = useState<UnitGolNews | null>(null);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const filteredPlayers = useMemo(
		() =>
			players.filter(
				(p) => !selectedSeasonId || p.seasonId === selectedSeasonId,
			),
		[players, selectedSeasonId],
	);
	const {
		matchDate,
		setMatchDate,
		teamAPlayers,
		setTeamAPlayers,
		teamBPlayers,
		setTeamBPlayers,
		teamAScore,
		setTeamAScore,
		teamBScore,
		setTeamBScore,
		goals,
		setGoals,
		handleAddGoal,
		togglePlayerSelection,
		selectedPlayers,
		availablePlayers,
	} = useNewMatchForm(filteredPlayers, onAddMatch);

	const handleFormSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (teamAScore === null || teamBScore === null || matchDate === null)
			return;
		const newMatch: Omit<Match, "id"> = {
			date: matchDate,
			seasonId: selectedSeasonId || undefined,
			teamA: {
				players: players.filter((p) => teamAPlayers.includes(p.id)),
				score: teamAScore,
			},
			teamB: {
				players: players.filter((p) => teamBPlayers.includes(p.id)),
				score: teamBScore,
			},
			goals: [...goals].sort((a, b) => a.minute - b.minute),
		};

		setNews(null);
		setSaveError(null);
		setIsSaving(true);
		try {
			await onAddMatch(newMatch);
			setNews(createMatchNews(newMatch, matches));
			setMatchDate(null);
			setTeamAPlayers([]);
			setTeamBPlayers([]);
			setTeamAScore(null);
			setTeamBScore(null);
			setGoals([]);
		} catch (error) {
			setSaveError(
				error instanceof Error
					? error.message
					: "No se pudo guardar el partido. Inténtalo de nuevo.",
			);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="space-y-6">
			{news && <NewsCard news={news} teamName={teamName} />}
			<form
				onSubmit={handleFormSubmit}
				className="bg-white rounded-lg shadow-lg p-6"
			>
				<div className="flex items-center gap-2 mb-4">
					<Plus className="w-6 h-6 text-emerald-600" />
					<h2 className="text-xl font-semibold">Añadir nuevo partido</h2>
				</div>
				{saveError && (
					<p className="mb-4 text-red-700" role="alert">
						No se pudo guardar el partido: {saveError}
					</p>
				)}
				<div className="grid lg:grid-cols-3 gap-8">
					<TeamSelector
						team="A"
						players={filteredPlayers}
						selectedPlayers={teamAPlayers}
						otherTeamPlayers={teamBPlayers}
						score={teamAScore}
						setScore={setTeamAScore}
						togglePlayerSelection={togglePlayerSelection}
					/>
					<TeamSelector
						team="B"
						players={filteredPlayers}
						selectedPlayers={teamBPlayers}
						otherTeamPlayers={teamAPlayers}
						score={teamBScore}
						setScore={setTeamBScore}
						togglePlayerSelection={togglePlayerSelection}
					/>
					<div>
						<MatchDateInput matchDate={matchDate} setMatchDate={setMatchDate} />
						<GoalsSection
							goals={goals}
							players={filteredPlayers}
							availablePlayers={availablePlayers}
							handleAddGoal={handleAddGoal}
							selectedPlayers={selectedPlayers}
						/>
					</div>
				</div>
				<button
					type="submit"
					disabled={
						isSaving ||
						teamAScore === null ||
						teamBScore === null ||
						matchDate === null ||
						teamAPlayers.length === 0 ||
						teamBPlayers.length === 0
					}
					className="mt-6 w-full bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
				>
					{isSaving ? "Guardando..." : "Añadir partido"}
				</button>
			</form>
		</div>
	);
}
