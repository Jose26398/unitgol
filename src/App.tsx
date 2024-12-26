import { useState } from 'react';
import { PlayerCard } from './components/PlayerCard';
import { MatchCard } from './components/MatchCard';
import { TeamGenerator } from './components/TeamGenerator';
import { NewMatchForm } from './components/NewMatchForm';
import { NewPlayerForm } from './components/NewPlayerForm';
import { useDatabase } from './hooks/useDatabase';

function App() {
  const { players, matches, addPlayer, editPlayer, deletePlayer, addMatch, editMatch, deleteMatch } = useDatabase();
  const [activeTab, setActiveTab] = useState<'matches' | 'players' | 'newMatch' | 'generator'>('matches');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-emerald-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center gap-3">
          <img src="/favicon.ico" className="w-8 h-8" />
          <h1 className="text-2xl font-bold">UnitGol</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <nav className="flex gap-4 mb-8 overflow-x-auto border-b border-gray-300">
          {[
            { label: 'Partidos', value: 'matches' },
            { label: 'Jugadores', value: 'players' },
            { label: 'Nueva Jornada', value: 'newMatch' },
            { label: 'Generador de Equipos', value: 'generator' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as 'matches' | 'players' | 'generator')}
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
        {activeTab === 'matches' && (
          <div className="grid gap-6">
            {matches.length > 0 ? (
              matches.map(match => (
                <MatchCard key={match.id} match={match} onEdit={editMatch} onDelete={deleteMatch} />
              ))
            ) : (
              <div className="text-center text-gray-500">No hay partidos disponibles.</div>
            )}
          </div>
        )}

        {activeTab === 'players' && (
          <>
            <NewPlayerForm onAddPlayer={addPlayer} />
            {players.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {players.map(player => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    onEdit={editPlayer}
                    onDelete={deletePlayer}
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
              <NewMatchForm players={players} onAddMatch={addMatch} />
            </div>
          </>
        )}

        {activeTab === 'generator' && (
          <>
            <div className="space-y-6">
              {players.length > 0 ? (
                <TeamGenerator players={players} />
              ) : (
                <div className="text-center text-gray-500">No hay jugadores disponibles.</div>
              )
              }
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 text-center text-sm text-gray-500 p-4">
        <div className="container mx-auto">
          <p>Made with ❤️ by a Jose26398</p>
          <a href="https://github.com/Jose26398/unigol" target="_blank" rel="noreferrer">
            <p className="text-emerald-600">View code on GitHub</p>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
