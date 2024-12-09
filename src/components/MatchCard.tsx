import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Edit, Trash2, Trophy } from 'lucide-react';
import { useState } from 'react';
import { Match } from '../types';
import { EditMatchDialog } from './EditMatchDialog';

interface MatchCardProps {
  match: Match;
  onEdit: (match: Match) => void;
  onDelete: (match: Match) => void;
}

export function MatchCard({ match, onEdit, onDelete }: MatchCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEdit = (updatedMatch: Match) => {
    onEdit(updatedMatch);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(match);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{format(new Date(match.date), 'PPP', { locale: es })}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="Editar partido"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 items-center gap-4">
        <div className="text-center">
          <div className="font-semibold mb-2">Equipo A</div>
          <div className="text-2xl font-bold text-blue-600">{match.teamA.score}</div>
          <div className="mt-2 text-sm text-gray-600">
            {match.teamA.players.map(p => p.name).join(', ')}
          </div>
        </div>
        
        <div className="text-center text-gray-400">vs</div>
        
        <div className="text-center">
          <div className="font-semibold mb-2">Equipo B</div>
          <div className="text-2xl font-bold text-blue-600">{match.teamB.score}</div>
          <div className="mt-2 text-sm text-gray-600">
            {match.teamB.players.map(p => p.name).join(', ')}
          </div>
        </div>
      </div>
      
      {match.goals.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="font-semibold">Goles</span>
          </div>
          <div className="text-sm text-gray-600">
            {match.goals.map((goal, index) => (
              <div key={index} className="mb-1">
                {`${match.teamA.players.concat(match.teamB.players).find(p => p.id === goal.playerId)?.name} (${goal.minute}')`}
                {goal.assistById && ` - Asistencia: ${match.teamA.players.concat(match.teamB.players).find(p => p.id === goal.assistById)?.name}`}
              </div>
            ))}
          </div>
        </div>
      )}

      {isEditing && (
        <EditMatchDialog
          match={match}
          onSave={handleEdit}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}