import { lazy, Suspense, useMemo, useState } from "react";
import { Footer } from "@/app/layout/Footer";
import { Header } from "@/app/layout/Header";
import { TabNav, type TabValue } from "@/app/layout/TabNav";
import { SupabaseService } from "@/db/supabase-service";
import type { TeamAuth } from "@/features/auth/context";
import { useAuth } from "@/features/auth/useAuth";
import { PlayerComparerModal } from "@/features/players/components/PlayerComparerModal";
import { PlayerSummaryModal } from "@/features/players/components/PlayerSummaryModal";
import { SettingsModal } from "@/features/settings/components/SettingsModal";
import { SettingsContext } from "@/features/settings/SettingsContext";
import { exportDatabase } from "@/features/settings/utils/exportData";
import { useDatabase } from "@/hooks/useDatabase";
import type { Match, Season } from "@/types";

const MatchesView = lazy(() =>
  import("@/features/matches/views/MatchesView").then((m) => ({
    default: m.MatchesView,
  })),
);
const NewMatchView = lazy(() =>
  import("@/features/new-match/views/NewMatchView").then((m) => ({
    default: m.NewMatchView,
  })),
);
const PlayersView = lazy(() =>
  import("@/features/players/views/PlayersView").then((m) => ({
    default: m.PlayersView,
  })),
);
const SeasonsView = lazy(() =>
  import("@/features/seasons/views/SeasonsView").then((m) => ({
    default: m.SeasonsView,
  })),
);
const TeamGeneratorView = lazy(() =>
  import("@/features/team-generator/views/TeamGeneratorView").then((m) => ({
    default: m.TeamGeneratorView,
  })),
);

function TeamApp({ teamAuth }: { teamAuth: TeamAuth }) {
  const { logout } = useAuth();
  const db = useMemo(() => {
    const service = new SupabaseService();
    service.setTeamId(teamAuth.id);
    return service;
  }, [teamAuth.id]);

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
    settings,
    saveSettings,
  } = useDatabase(db);
  const [activeTab, setActiveTab] = useState<TabValue>("seasons");
  const [modal, setModal] = useState<"summary" | "compare" | "settings" | null>(
    null,
  );
  const { ratingMode } = settings;

  const defaultSeasonId = useMemo(() => {
    if (!seasons?.length) return null;

    const season = seasons.find((s: Season) => !s.endDate) ?? seasons[0];

    return season.id;
  }, [seasons]);

  const [seasonSelection, setSelectedSeasonId] = useState<string | null>();
  const selectedSeasonId =
    seasonSelection === null
      ? null
      : seasons.some((season) => season.id === seasonSelection)
        ? (seasonSelection ?? null)
        : defaultSeasonId;
  const closeModal = () => setModal(null);
  const seasonPlayers = players.filter(
    (player) => !selectedSeasonId || player.seasonId === selectedSeasonId,
  );

  return (
    <SettingsContext.Provider value={settings}>
      <div className="min-h-screen bg-gray-100">
        <Header
          teamName={teamAuth?.team ?? ""}
          isAdmin={teamAuth?.isAdmin || false}
          onOpenSettings={() => setModal("settings")}
          onLogout={logout}
        />

        <main className="container mx-auto px-4 py-8">
          <Suspense fallback={<p role="status">Cargando sección...</p>}>
            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-sm relative mb-4"
                role="alert"
              >
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <span className="ml-2 text-emerald-600">Cargando...</span>
              </div>
            )}

            {!loading && (
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
                    ratingMode={ratingMode}
                  />
                )}

                {activeTab === "matches" && (
                  <MatchesView
                    matches={matches}
                    seasons={seasons}
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
                    onOpenSummary={() => setModal("summary")}
                    onOpenComparer={() => setModal("compare")}
                    ratingMode={ratingMode}
                  />
                )}

                {activeTab === "newMatch" && (
                  <NewMatchView
                    key={selectedSeasonId}
                    players={players}
                    matches={matches}
                    selectedSeasonId={selectedSeasonId}
                    teamName={teamAuth?.team}
                    isAdmin={teamAuth?.isAdmin || false}
                    onAddMatch={addMatch}
                  />
                )}

                {activeTab === "generator" && (
                  <TeamGeneratorView
                    key={selectedSeasonId}
                    players={players}
                    matches={matches}
                    selectedSeasonId={selectedSeasonId}
                    teamName={teamAuth?.team}
                    ratingMode={ratingMode}
                  />
                )}

                {modal === "summary" && (
                  <PlayerSummaryModal
                    players={seasonPlayers}
                    matches={matches}
                    seasonId={selectedSeasonId}
                    ratingMode={ratingMode}
                    onClose={closeModal}
                  />
                )}

                {modal === "compare" && (
                  <PlayerComparerModal
                    players={seasonPlayers}
                    matches={matches.filter(
                      (m: Match) =>
                        !selectedSeasonId || m.seasonId === selectedSeasonId,
                    )}
                    onClose={closeModal}
                  />
                )}

                {modal === "settings" && (
                  <SettingsModal
                    onClose={closeModal}
                    seasons={seasons}
                    selectedSeasonId={selectedSeasonId}
                    onSelectSeason={setSelectedSeasonId}
                    settings={settings}
                    onSave={saveSettings}
                    isAdmin={teamAuth.isAdmin}
                    onExport={() =>
                      exportDatabase({ players, matches, seasons, settings })
                    }
                  />
                )}
              </>
            )}
          </Suspense>
        </main>

        <Footer />
      </div>
    </SettingsContext.Provider>
  );
}

export default TeamApp;
