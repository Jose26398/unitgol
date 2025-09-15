import { LogOut, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { MatchCard } from './components/Matches/MatchCard';
import { NewMatchForm } from './components/NewMatch/NewMatchForm';
import { NewPlayerForm } from './components/Players/NewPlayerForm';
import { PlayerCard } from './components/Players/PlayerCard';
import { PlayerSummaryModal } from './components/Matches/PlayerSummaryModal';
import { SettingsModal } from './components/SettingsModal';
import { TeamGenerator } from './components/TeamGenerator/TeamGenerator';
import { useDatabase } from './hooks/useDatabase';
import type { Season, Match, Player } from './types';
import { SeasonStats } from './components/Seasons/SeasonStats';
import { SeasonsManager } from './components/Seasons/SeasonsManager';
import { useAuth } from './auth/hook';
import { AuthForm } from './components/Auth/AuthForm';

function App() {
  const { isAuthenticated, teamAuth, logout } = useAuth();

  const { players, matches, seasons, loading, error, addPlayer, editPlayer, deletePlayer, addMatch, editMatch, deleteMatch, addSeason, editSeason, deleteSeason } = useDatabase();
  const [activeTab, setActiveTab] = useState<'matches' | 'players' | 'newMatch' | 'generator' | 'seasons'>('seasons');
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);

  // Seleccionar la última temporada activa por defecto
  useEffect(() => {
    if (seasons && seasons.length > 0 && !selectedSeasonId) {
      const activeSeason = seasons.find((s: Season) => !s.endDate) || seasons[0];
      setSelectedSeasonId(activeSeason.id);
    }
  }, [seasons, selectedSeasonId]);

  const openPlayerModal = () => setIsPlayerModalOpen(true);
  const closePlayerModal = () => setIsPlayerModalOpen(false);

  const openSettingsModal = () => setIsSettingsModalOpen(true);
  const closeSettingsModal = () => setIsSettingsModalOpen(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-emerald-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center gap-3 px-4">
          <img src="/favicon.ico" className="w-8 h-8" alt="Logo" />
          <h1 className="text-2xl font-bold flex-1">UnitGol</h1>
          {isAuthenticated && (
            <div className="flex items-center gap-4">
              <span className="text-gray-100">{teamAuth?.team}</span>
              <button
                className="bg-emerald-600 text-white p-2 rounded-md hover:bg-emerald-700"
                onClick={openSettingsModal}
              >
                <Settings className="w-6 h-6" />
              </button>
              <button
                className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                onClick={logout}
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!isAuthenticated ? (
          <AuthForm />
        ) : (
          <>
            {/* Error Display */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {/* Loading Display */}
            {(loading.players || loading.matches || loading.seasons) && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <span className="ml-2 text-emerald-600">Cargando...</span>
              </div>
            )}

            {!loading.players && !loading.matches && !loading.seasons && (
              <>
                {/* Tab Navigation */}
                <nav className="flex gap-4 mb-8 overflow-x-auto border-b border-gray-300">
                  {[
                    { label: 'Temporadas', value: 'seasons' },
                    { label: 'Partidos', value: 'matches' },
                    { label: 'Jugadores', value: 'players' },
                    { label: 'Nueva Jornada', value: 'newMatch' },
                    { label: 'Generador de Equipos', value: 'generator' }
                  ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value as typeof activeTab)}
                    className={`relative px-4 py-2 font-semibold text-lg text-ellipsis whitespace-nowrap rounded-md ${activeTab === tab.value
                      ? 'text-emerald-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-emerald-600'
                      : 'text-gray-500 hover:text-emerald-600'
                      }`}
                    aria-current={activeTab === tab.value ? 'page' : undefined}
                  >
                    {tab.label}
                  </button>
                ))}
                </nav>

                {/* Tab Content */}
                {activeTab === 'seasons' && (
                  <>
                    <div className="mb-8">
                      <SeasonsManager
                        seasons={seasons}
                        onAddSeason={addSeason}
                        onEditSeason={editSeason}
                        onDeleteSeason={deleteSeason}
                        selectedSeasonId={selectedSeasonId}
                        onSelectSeason={setSelectedSeasonId}
                      />
                    </div>
                    {selectedSeasonId && (
                      <SeasonStats seasonId={selectedSeasonId} players={players} matches={matches} />
                    )}
                  </>
                )}

                {activeTab === 'matches' && (
                  <>
                    {(matches.filter((m: Match) => !selectedSeasonId || m.seasonId === selectedSeasonId).length > 0) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {matches.filter((m: Match) => !selectedSeasonId || m.seasonId === selectedSeasonId).map((match: Match) => (
                          <MatchCard key={match.id} match={match} onEdit={editMatch} onDelete={deleteMatch} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">No hay partidos disponibles.</div>
                    )}
                  </>
                )}

                {activeTab === 'players' && (
                  <>
                    <div className="flex gap-4 md:flex-row flex-col w-full justify-between">
                      <button
                        onClick={openPlayerModal}
                        className="bg-emerald-600 text-white mb-6 p-6 rounded-lg shadow-md hover:bg-emerald-700"
                      >
                        Tabla Resumen
                      </button>
                      <NewPlayerForm onAddPlayer={addPlayer} selectedSeasonId={selectedSeasonId} />
                    </div>
                    {(players.filter((p: Player) => !selectedSeasonId || p.seasonId === selectedSeasonId).length > 0) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {players.filter((p: Player) => !selectedSeasonId || p.seasonId === selectedSeasonId).map((player: Player) => (
                          <PlayerCard
                            key={player.id}
                            player={player}
                            onEdit={editPlayer}
                            onDelete={deletePlayer}
                            seasons={seasons}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">No hay jugadores disponibles.</div>
                    )}
                  </>
                )}

                {activeTab === 'newMatch' && (
                  <>
                    <div className="space-y-6">
                      <NewMatchForm players={players} onAddMatch={addMatch} selectedSeasonId={selectedSeasonId} />
                    </div>
                  </>
                )}

                {activeTab === 'generator' && (
                  <>
                    <div className="space-y-6">
                      {(players.filter((p: Player) => !selectedSeasonId || p.seasonId === selectedSeasonId).length > 0) ? (
                        <TeamGenerator players={players.filter((p: Player) => !selectedSeasonId || p.seasonId === selectedSeasonId)} />
                      ) : (
                        <div className="text-center text-gray-500">No hay jugadores disponibles.</div>
                      )}
                    </div>
                  </>
                )}

                {/* Modals */}
                {isPlayerModalOpen && (
                  <PlayerSummaryModal players={players} onClose={closePlayerModal} />
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

      {/* Footer */}
      <footer className="bg-gray-100 text-center text-sm text-gray-500 p-4">
        <div className="container mx-auto">
          <p>Made with 💚 by Jose26398</p>
          <a href="https://github.com/Jose26398/unigol" target="_blank" rel="noreferrer">
            <p className="text-emerald-600">View code on GitHub</p>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
