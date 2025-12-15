import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Edit, Trash2, Trophy } from 'lucide-react';
import { useState } from 'react';
import { Match } from '../../types';
import { EditMatchDialog } from '../EditMatchDialog';
import { useDatabase } from '../../hooks/useDatabase';


interface MatchCardProps {
  match: Match;
  onEdit: (match: Match) => void;
  onDelete: (match: Match) => void;
}

const GOALS_LIMIT = 5;

export function MatchCard({ match, onEdit, onDelete }: MatchCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showAllGoals, setShowAllGoals] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { seasons } = useDatabase();

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
    <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3 text-gray-500">
          <Calendar className="w-5 h-5" />
          <span className="text-sm font-medium">{format(new Date(match.date), 'PPP', { locale: es })}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditing(true)}
            className='rounded-full text-emerald-600 hover:text-emerald-200 transition-colors'
            title="Editar partido"
            aria-label="Editar partido"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className='rounded-full text-red-600 hover:text-red-200 transition-colors'
            title="Eliminar partido"
            aria-label="Eliminar partido"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Edit Match Dialog */}
      {isEditing && (
        <EditMatchDialog
          match={match}
          onClose={() => setIsEditing(false)}
          onSave={handleEdit}
          seasons={seasons}
        />
      )}

      {/* Match Details */}
      <div className="grid grid-cols-3 gap-6 align-top">
        {/* Team A */}
        <div className="text-center">
          <div className="text-gray-700 font-semibold mb-2">Equipo A</div>
          <div className="text-3xl font-bold text-emerald-600">{match.teamA.score}</div>
          <div className="mt-2 text-sm text-gray-500">
            {match.teamA.players.map(p => p.name).join(', ')}
          </div>
        </div>

        <div className="text-center text-gray-400 text-xl font-bold">vs</div>

        {/* Team B */}
        <div className="text-center">
          <div className="text-gray-700 font-semibold mb-2">Equipo B</div>
          <div className="text-3xl font-bold text-emerald-600">{match.teamB.score}</div>
          <div className="mt-2 text-sm text-gray-500">
            {match.teamB.players.map(p => p.name).join(', ')}
          </div>
        </div>
      </div>

      {/* Goals */}
      {match.goals.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-center items-center gap-3 mb-3">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-lg font-semibold text-gray-700">Goles</span>
          </div>
          <div className="text-sm text-gray-600 space-y-2">
            {[...match.goals]
              .sort((a, b) => a.minute - b.minute)
              .slice(0, showAllGoals ? match.goals.length : GOALS_LIMIT)
              .map((goal, index) => {

                const allPlayers = match.teamA.players.concat(match.teamB.players);

                const scorer = allPlayers.find(p => p.id === goal.playerId);
                const assist = goal.assistById
                  ? allPlayers.find(p => p.id === goal.assistById)
                  : null;

                const isTeamA = match.teamA.players.some(p => p.id === goal.playerId);

                return (
                  <div
                    key={index}
                    className={`flex ${isTeamA ? "justify-start text-left" : "justify-end text-right"}`}
                  >
                    <div>
                      <span className="font-medium">
                        {scorer?.name} ({goal.minute}')
                      </span>

                      {assist && (
                        <span className="text-gray-500">
                          {" "}<br />Asistencia: {assist.name}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            {match.goals.length > GOALS_LIMIT && (
              <div className="mt-5 text-center">
                <button
                  onClick={() => setShowAllGoals(prev => !prev)}
                  className="text-emerald-600 hover:underline text-sm font-medium"
                >
                  {showAllGoals
                    ? "Mostrar menos"
                    : `Mostrar más (${match.goals.length - GOALS_LIMIT})`}
                </button>
              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
}
