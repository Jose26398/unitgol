import { useEffect, useMemo, useState } from "react";
import { Footer } from "@/app/layout/Footer";
import { Header } from "@/app/layout/Header";
import { TabNav, type TabValue } from "@/app/layout/TabNav";
import { AuthForm } from "@/features/auth/AuthForm";
import { useAuth } from "@/features/auth/useAuth";
import { MatchesView } from "@/features/matches/views/MatchesView";
import { NewMatchView } from "@/features/new-match/views/NewMatchView";
import { PlayerComparerModal } from "@/features/players/components/PlayerComparerModal";
import { PlayerSummaryModal } from "@/features/players/components/PlayerSummaryModal";
import { PlayersView } from "@/features/players/views/PlayersView";
import { SeasonsView } from "@/features/seasons/views/SeasonsView";
import { SettingsModal } from "@/features/settings/components/SettingsModal";
import { TeamGeneratorView } from "@/features/team-generator/views/TeamGeneratorView";
import { useDatabase } from "@/hooks/useDatabase";
import type { Match, Player, Season } from "@/types";
import { loadScoreFactors } from "@/utils/playerStats";

function App() {
	const { isAuthenticated, teamAuth, logout } = useAuth();

	useEffect(() => {
		if (teamAuth) {
			loadScoreFactors(teamAuth.id);
		}
	}, [teamAuth]);

	const {
		players,
		matches,
		seasons,
		loading,
		error,
		addPlayer,
		editPlayer,
		deletePlayer,
		addMatch,
		editMatch,
		deleteMatch,
		addSeason,
		editSeason,
		deleteSeason,
	} = useDatabase();
	const [activeTab, setActiveTab] = useState<TabValue>("seasons");
	const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
	const [isComparerModalOpen, setIsComparerModalOpen] = useState(false);
	const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

	const defaultSeasonId = useMemo(() => {
		if (!seasons?.length) return null;

		const activeSeasons = seasons.filter((s: Season) => !s.endDate);

		const season =
			activeSeasons[activeSeasons.length - 1] ?? seasons[seasons.length - 1];

		return season.id;
	}, [seasons]);

	const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(
		defaultSeasonId,
	);

	const openPlayerModal = () => setIsPlayerModalOpen(true);
	const closePlayerModal = () => setIsPlayerModalOpen(false);

	const openComparerModal = () => setIsComparerModalOpen(true);
	const closeComparerModal = () => setIsComparerModalOpen(false);

	const openSettingsModal = () => setIsSettingsModalOpen(true);
	const closeSettingsModal = () => setIsSettingsModalOpen(false);

	return (
		<div className="min-h-screen bg-gray-100">
			<Header
				teamName={teamAuth?.team ?? ""}
				isAdmin={teamAuth?.isAdmin || false}
				onOpenSettings={openSettingsModal}
				onLogout={logout}
			/>

			<main className="container mx-auto px-4 py-8">
				{!isAuthenticated ? (
					<AuthForm />
				) : (
					<>
						{error && (
							<div
								className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-sm relative mb-4"
								role="alert"
							>
								<strong className="font-bold">Error: </strong>
								<span className="block sm:inline">{error}</span>
							</div>
						)}

						{(loading.players || loading.matches || loading.seasons) && (
							<div className="flex justify-center items-center py-8">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
								<span className="ml-2 text-emerald-600">Cargando...</span>
							</div>
						)}

						{!loading.players && !loading.matches && !loading.seasons && (
							<>
								<TabNav activeTab={activeTab} onChange={setActiveTab} />

								{activeTab === "seasons" && (
									<SeasonsView
										seasons={seasons}
										players={players}
										matches={matches}
										selectedSeasonId={selectedSeasonId}
										isAdmin={teamAuth?.isAdmin || false}
										onAddSeason={addSeason}
										onEditSeason={editSeason}
										onDeleteSeason={deleteSeason}
										onSelectSeason={setSelectedSeasonId}
									/>
								)}

								{activeTab === "matches" && (
									<MatchesView
										matches={matches}
										selectedSeasonId={selectedSeasonId}
										isAdmin={teamAuth?.isAdmin || false}
										onEditMatch={editMatch}
										onDeleteMatch={deleteMatch}
									/>
								)}

								{activeTab === "players" && (
									<PlayersView
										players={players}
										matches={matches}
										seasons={seasons}
										selectedSeasonId={selectedSeasonId}
										isAdmin={teamAuth?.isAdmin || false}
										onAddPlayer={addPlayer}
										onEditPlayer={editPlayer}
										onDeletePlayer={deletePlayer}
										onOpenSummary={openPlayerModal}
										onOpenComparer={openComparerModal}
									/>
								)}

								{activeTab === "newMatch" && (
									<NewMatchView
										players={players}
										selectedSeasonId={selectedSeasonId}
										isAdmin={teamAuth?.isAdmin || false}
										onAddMatch={addMatch}
									/>
								)}

								{activeTab === "generator" && (
									<TeamGeneratorView
										players={players}
										matches={matches}
										selectedSeasonId={selectedSeasonId}
									/>
								)}

								{isPlayerModalOpen && (
									<PlayerSummaryModal
										players={players.filter(
											(p: Player) =>
												!selectedSeasonId || p.seasonId === selectedSeasonId,
										)}
										matches={matches}
										seasonId={selectedSeasonId}
										onClose={closePlayerModal}
									/>
								)}

								{isComparerModalOpen && (
									<PlayerComparerModal
										players={players.filter(
											(p: Player) =>
												!selectedSeasonId || p.seasonId === selectedSeasonId,
										)}
										matches={matches.filter(
											(m: Match) =>
												!selectedSeasonId || m.seasonId === selectedSeasonId,
										)}
										onClose={closeComparerModal}
									/>
								)}

								<SettingsModal
									isOpen={isSettingsModalOpen}
									onClose={closeSettingsModal}
									seasons={seasons}
									selectedSeasonId={selectedSeasonId}
									onSelectSeason={setSelectedSeasonId}
								/>
							</>
						)}
					</>
				)}
			</main>

			<Footer />
		</div>
	);
}

export default App;
