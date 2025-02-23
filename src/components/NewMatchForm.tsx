import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Player, Match } from '../types';
import { GoalEntry } from './GoalEntry';

interface NewMatchFormProps {
  players: Player[];
  onAddMatch: (match: Omit<Match, 'id'>) => void;
}

export function NewMatchForm({ players, onAddMatch }: NewMatchFormProps) {
  const [matchDate, setMatchDate] = useState<string | null>(null);
  const [teamAPlayers, setTeamAPlayers] = useState<string[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<string[]>([]);
  const [teamAScore, setTeamAScore] = useState<number | null>(null);
  const [teamBScore, setTeamBScore] = useState<number | null>(null);
  const [goals, setGoals] = useState<Array<{ playerId: string; minute: number; assistById?: string }>>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamAScore === null || teamBScore === null || matchDate === null) return;

    onAddMatch({
      date: matchDate,
      teamA: {
        players: players.filter(p => teamAPlayers.includes(p.id)),
        score: teamAScore,
      },
      teamB: {
        players: players.filter(p => teamBPlayers.includes(p.id)),
        score: teamBScore,
      },
      goals: goals.sort((a, b) => a.minute - b.minute),
    });

    setMatchDate(null);
    setTeamAPlayers([]);
    setTeamBPlayers([]);
    setTeamAScore(null);
    setTeamBScore(null);
    setGoals([]);
  };

  const handleAddGoal = (goal: { playerId: string; minute: number; assistById?: string }) => {
    setGoals([...goals, goal]);
  };

  const togglePlayerSelection = (playerId: string, team: 'A' | 'B') => {
    if (team === 'A') {
      setTeamAPlayers(prev =>
        prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]
      );
      setTeamBPlayers(prev => prev.filter(id => id !== playerId)); // Ensure no player is in both teams
    } else {
      setTeamBPlayers(prev =>
        prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]
      );
      setTeamAPlayers(prev => prev.filter(id => id !== playerId)); // Ensure no player is in both teams
    }
  };

  const handleDivClick = (playerId: string, team: 'A' | 'B') => {
    togglePlayerSelection(playerId, team);
  };

  const selectedPlayers = [...teamAPlayers, ...teamBPlayers];
  const availablePlayers = players.filter(p => selectedPlayers.includes(p.id));

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Plus className="w-6 h-6 text-emerald-600" />
        <h2 className="text-xl font-semibold">Añadir nuevo partido</h2>
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Team A Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Equipo A</h3>
          <input
            type="number"
            min="0"
            value={teamAScore ?? ''}
            onChange={e => setTeamAScore(parseInt(e.target.value))}
            className="w-full mb-4 border rounded-md p-2"
            placeholder="Goles"
            aria-label="Goles"
          />
          <div className="border-t border-gray-300 mb-4" />
          <div className="space-y-2">
            {players.map(player => (
              <div
                key={player.id}
                onClick={() => handleDivClick(player.id, 'A')}
                className={`flex items-center justify-between p-2 border rounded-md cursor-pointer ${
                  teamAPlayers.includes(player.id) ? 'bg-emerald-50 border-emerald-300' : 'hover:bg-gray-100'
                } ${
                  teamBPlayers.includes(player.id) ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <span className="text-gray-700">{player.name}</span>
                <input
                  type="checkbox"
                  checked={teamAPlayers.includes(player.id)}
                  onClick={e => e.stopPropagation()} // Prevent parent div click
                  onChange={() => togglePlayerSelection(player.id, 'A')}
                  disabled={teamBPlayers.includes(player.id)}
                  className="form-checkbox text-emerald-600"
                  aria-label={`Añadir ${player.name} al equipo A`}
                />
              </div>
            ))}
          </div>
          <div className="border-t border-gray-400 my-6" />
        </div>


        {/* Team B Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">Equipo B</h3>
          <input
            type="number"
            min="0"
            value={teamBScore ?? ''}
            onChange={e => setTeamBScore(parseInt(e.target.value))}
            className="w-full mb-4 border rounded-md p-2"
            placeholder="Goles"
            aria-label="Goles"
          />
          <div className="border-t border-gray-300 mb-4" />
          <div className="space-y-2">
            {players.map(player => (
              <div
                key={player.id}
                onClick={() => handleDivClick(player.id, 'B')}
                className={`flex items-center justify-between p-2 border rounded-md cursor-pointer ${
                  teamBPlayers.includes(player.id) ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-100'
                } ${
                  teamAPlayers.includes(player.id) ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <span className="text-gray-700">{player.name}</span>
                <input
                  type="checkbox"
                  checked={teamBPlayers.includes(player.id)}
                  onClick={e => e.stopPropagation()} // Prevent parent div click
                  onChange={() => togglePlayerSelection(player.id, 'B')}
                  disabled={teamAPlayers.includes(player.id)}
                  className="form-checkbox text-blue-600"
                  aria-label={`Añadir ${player.name} al equipo B`}
                />
              </div>
            ))}
          </div>
          <div className="border-t border-gray-400 my-6" />
        </div>


        <div>
          {/* Match Date */}
          <div className="mb-6">
            <label htmlFor="matchDate" className="block text-gray-700 font-medium mb-2">
              Fecha del partido
            </label>
            <input
              type="date"
              id="matchDate"
              value={matchDate ?? ''}
              onChange={e => setMatchDate(e.target.value)}
              className="w-full border rounded-md p-2"
              aria-label="Match Date"
              required
              />
          </div>


          {/* Goals Section */}
          <div className="space-y-4">
            {goals.map((goal, index) => (
              <div key={index} className="text-sm text-gray-600">
                {players.find(p => p.id === goal.playerId)?.name} ({goal.minute}')
                {goal.assistById && ` - Asistencia: ${players.find(p => p.id === goal.assistById)?.name}`}
              </div>
            ))}
            {selectedPlayers.length > 0 && (
              <>
                <div className="border-t border-gray-400 my-6" />
                <h3 className="text-lg font-medium text-gray-700 mb-3">Goles</h3>
                <GoalEntry players={availablePlayers} onAddGoal={handleAddGoal} />
              </>
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={teamAScore === null || teamBScore === null || matchDate === null || teamAPlayers.length === 0 || teamBPlayers.length === 0}
        className="mt-6 w-full bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Añadir partido
      </button>
    </form>
  );
}
