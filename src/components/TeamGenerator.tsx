import { useState } from 'react';
import { Users, Shuffle } from 'lucide-react';
import { Player } from '../types';
import { generateBalancedTeams } from '../utils/playerStats';
import { PlayerCard } from './PlayerCard';

interface TeamGeneratorProps {
  players: Player[];
}

export function TeamGenerator({ players }: TeamGeneratorProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<{ teamA: Player[]; teamB: Player[] } | null>(null);

  const handleTogglePlayer = (player: Player) => {
    setSelectedPlayers(prev =>
      prev.some(p => p.id === player.id)
        ? prev.filter(p => p.id !== player.id)
        : [...prev, player]
    );
  };

  const handleGenerateTeams = () => {
    if (selectedPlayers.length < 2) {
      alert('Selecciona al menos dos jugadores para generar equipos.');
      return;
    }
    setTeams(generateBalancedTeams(selectedPlayers));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between mb-6 flex-col sm:flex-row gap-4 sm:gap-0">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-emerald-600" />
          <h2 className="text-xl font-semibold">Generador de Equipos</h2>
        </div>
        <button
          onClick={handleGenerateTeams}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors"
        >
          <Shuffle className="w-4 h-4" />
          Generar Equipos
        </button>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Selecciona los jugadores</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {players.map(player => (
            <div
              key={player.id}
              onClick={() => handleTogglePlayer(player)}
              className={`flex items-center p-2 border rounded-md cursor-pointer ${
                selectedPlayers.some(p => p.id === player.id)
                  ? 'bg-emerald-50 border-emerald-300'
                  : 'hover:bg-gray-100'
              }`}
            >
              <label
                htmlFor={`player-${player.id}`}
                className="flex-1 cursor-pointer text-gray-700 truncate"
              >
                {player.name}
              </label>
              <input
                id={`player-${player.id}`}
                type="checkbox"
                checked={selectedPlayers.some(p => p.id === player.id)}
                onChange={() => handleTogglePlayer(player)}
                className="form-checkbox text-emerald-600"
                aria-label={`Seleccionar a ${player.name}`}
              />
            </div>
          ))}
        </div>
      </div>

      {teams && (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Equipo A</h3>
            <div className="space-y-4">
              {teams.teamA.map(player => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Equipo B</h3>
            <div className="space-y-4">
              {teams.teamB.map(player => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
