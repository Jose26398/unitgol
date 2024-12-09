import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Match } from '../types';
import { GoalEntry } from './GoalEntry';

interface EditMatchDialogProps {
  match: Match;
  onSave: (match: Match) => void;
  onClose: () => void;
}

export function EditMatchDialog({ match, onSave, onClose }: EditMatchDialogProps) {
  const [date, setDate] = useState(match.date.split('T')[0]);
  const [teamAScore, setTeamAScore] = useState(match.teamA.score);
  const [teamBScore, setTeamBScore] = useState(match.teamB.score);
  const [goals, setGoals] = useState(match.goals);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...match,
      date: new Date(date).toISOString(),
      teamA: {
        ...match.teamA,
        score: teamAScore
      },
      teamB: {
        ...match.teamB,
        score: teamBScore
      },
      goals: goals.sort((a, b) => a.minute - b.minute)
    });
  };

  const handleAddGoal = (goal: { playerId: string; minute: number; assistById?: string }) => {
    setGoals([...goals, goal]);
  };

  const handleRemoveGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const allPlayers = [...match.teamA.players, ...match.teamB.players];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Edit Match</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded-md p-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goles (Equipo A)
              </label>
              <input
                type="number"
                min="0"
                value={teamAScore}
                onChange={(e) => setTeamAScore(parseInt(e.target.value))}
                className="w-full border rounded-md p-2"
                required
              />
              <div className="mt-2 text-sm text-gray-600">
                Jugadores: {match.teamA.players.map(p => p.name).join(', ')}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goles (Equipo B)
              </label>
              <input
                type="number"
                min="0"
                value={teamBScore}
                onChange={(e) => setTeamBScore(parseInt(e.target.value))}
                className="w-full border rounded-md p-2"
                required
              />
              <div className="mt-2 text-sm text-gray-600">
                Jugadores: {match.teamB.players.map(p => p.name).join(', ')}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Goals</h3>
            <div className="space-y-3">
              {goals.map((goal, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm">
                    {allPlayers.find(p => p.id === goal.playerId)?.name} ({goal.minute}')
                    {goal.assistById && ` - Assist: ${allPlayers.find(p => p.id === goal.assistById)?.name}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveGoal(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <GoalEntry players={allPlayers} onAddGoal={handleAddGoal} />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-600"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}