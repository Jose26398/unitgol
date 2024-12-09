import React, { useState } from 'react';
import { Player } from '../types';

interface GoalEntryProps {
  players: Player[];
  onAddGoal: (goal: { playerId: string; minute: number; assistById?: string }) => void;
}

export function GoalEntry({ players, onAddGoal }: GoalEntryProps) {
  const [scorer, setScorer] = useState('');
  const [minute, setMinute] = useState('');
  const [assist, setAssist] = useState('');

  const handleAddGoal = () => {
    if (scorer && minute) {
      onAddGoal({
        playerId: scorer,
        minute: parseInt(minute),
        assistById: assist || undefined,
      });
      setScorer('');
      setMinute('');
      setAssist('');
    }
  };

  return (
    <div className="space-y-3 border-t pt-3 mt-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Goleador
          </label>
          <select
            value={scorer}
            onChange={(e) => setScorer(e.target.value)}
            className="w-full border rounded-md p-2"
          >
            <option value="">Seleccionar jugador</option>
            {players.map(player => (
              <option key={player.id} value={player.id}>{player.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minuto
          </label>
          <input
            type="number"
            min="1"
            max="90"
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            className="w-full border rounded-md p-2"
            placeholder="Minuto"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-ellipsis overflow-hidden whitespace-nowrap">
            Asistencia (opcional)
          </label>
          <select
            value={assist}
            onChange={(e) => setAssist(e.target.value)}
            className="w-full border rounded-md p-2"
          >
            <option value="">Sin asistencia</option>
            {players.map(player => (
              <option key={player.id} value={player.id}>{player.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <button
        type="button"
        onClick={handleAddGoal}
        disabled={!scorer || !minute}
        className="w-full bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Añadir Gol
      </button>
    </div>
  );
}