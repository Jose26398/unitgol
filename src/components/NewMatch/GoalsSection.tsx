import { Player } from '../../types';
import { GoalEntry } from '../GoalEntry';

interface GoalsSectionProps {
  goals: Array<{ playerId: string; minute: number; assistById?: string }>;
  players: Player[];
  availablePlayers: Player[];
  handleAddGoal: (goal: { playerId: string; minute: number; assistById?: string }) => void;
  selectedPlayers: string[];
}

export function GoalsSection({ goals, players, availablePlayers, handleAddGoal, selectedPlayers }: GoalsSectionProps) {
  return (
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
  );
}
