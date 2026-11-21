import { X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { GoalEntry } from "@/features/new-match/components/GoalEntry";
import { SeasonSelector } from "@/features/seasons/components/SeasonSelector";
import type { Match, Season } from "@/types";
import { errorMessage } from "@/utils/errors";

interface EditMatchDialogProps {
  match: Match;
  onSave: (match: Match) => Promise<unknown>;
  onClose: () => void;
  seasons: Season[];
}

export function EditMatchDialog({
  match,
  onSave,
  onClose,
  seasons,
}: EditMatchDialogProps) {
  const [date, setDate] = useState(match.date.split("T")[0]);
  const [teamAScore, setTeamAScore] = useState(match.teamA.score);
  const [teamBScore, setTeamBScore] = useState(match.teamB.score);
  const [goals, setGoals] = useState(match.goals);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [seasonId, setSeasonId] = useState<string | null>(
    match.seasonId || null,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      await onSave({
        ...match,
        date: new Date(date).toISOString(),
        seasonId: seasonId || undefined,
        teamA: {
          ...match.teamA,
          score: teamAScore,
        },
        teamB: {
          ...match.teamB,
          score: teamBScore,
        },
        goals: [...goals].sort((a, b) => a.minute - b.minute),
      });
    } catch (e) {
      setError(errorMessage(e, "No se pudo guardar el partido."));
    } finally {
      setSaving(false);
    }
  };

  const handleAddGoal = (goal: {
    playerId: string;
    minute: number;
    assistById?: string;
  }) => {
    setGoals((current) => [...current, goal]);
  };

  const handleRemoveGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const allPlayers = [...match.teamA.players, ...match.teamB.players];

  return (
    <Dialog title="Editar Partido" onClose={onClose} busy={saving}>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          aria-label="Cerrar edición"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset disabled={saving} className="space-y-6">
          <div>
            <SeasonSelector
              seasons={seasons}
              selectedSeasonId={seasonId}
              onSelect={setSeasonId}
            />
          </div>
          <div>
            <label
              htmlFor="edit-match-date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha
            </label>
            <input
              id="edit-match-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded-md p-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="edit-match-score-a"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Goles (Equipo A)
              </label>
              <input
                id="edit-match-score-a"
                type="number"
                min="0"
                value={teamAScore}
                onChange={(e) => setTeamAScore(parseInt(e.target.value, 10))}
                className="w-full border rounded-md p-2"
                required
              />
              <div className="mt-2 text-sm text-gray-600">
                Jugadores: {match.teamA.players.map((p) => p.name).join(", ")}
              </div>
            </div>

            <div>
              <label
                htmlFor="edit-match-score-b"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Goles (Equipo B)
              </label>
              <input
                id="edit-match-score-b"
                type="number"
                min="0"
                value={teamBScore}
                onChange={(e) => setTeamBScore(parseInt(e.target.value, 10))}
                className="w-full border rounded-md p-2"
                required
              />
              <div className="mt-2 text-sm text-gray-600">
                Jugadores: {match.teamB.players.map((p) => p.name).join(", ")}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Goles</h3>
            <div className="space-y-3">
              {goals.map((goal, index) => (
                <div
                  key={`${goal.playerId}-${goal.minute}`}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded-sm"
                >
                  <span className="text-sm">
                    {allPlayers.find((p) => p.id === goal.playerId)?.name} (
                    {goal.minute}')
                    {goal.assistById &&
                      ` - Asistencia: ${allPlayers.find((p) => p.id === goal.assistById)?.name}`}
                  </span>
                  <button
                    type="button"
                    aria-label={`Eliminar gol de ${allPlayers.find((p) => p.id === goal.playerId)?.name}`}
                    onClick={() => handleRemoveGoal(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <GoalEntry
                players={allPlayers}
                onAddGoal={handleAddGoal}
                teamAPlayerIds={match.teamA.players.map((p) => p.id)}
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-red-700">
              {error}
            </p>
          )}
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
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </fieldset>
      </form>
    </Dialog>
  );
}
