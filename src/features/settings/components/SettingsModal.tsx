import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { SeasonSelector } from "@/features/seasons/components/SeasonSelector";
import type { Season, TeamSettings } from "@/types";
import { errorMessage } from "@/utils/errors";

interface SettingsModalProps {
  onClose: () => void;
  seasons: Season[];
  selectedSeasonId: string | null;
  onSelectSeason: (id: string | null) => void;
  settings: TeamSettings;
  onSave: (settings: TeamSettings) => Promise<void>;
  onExport: () => void;
  isAdmin: boolean;
}

export function SettingsModal({
  onClose,
  seasons,
  selectedSeasonId,
  onSelectSeason,
  settings,
  onSave,
  onExport,
  isAdmin,
}: SettingsModalProps) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving || !isAdmin) return;
    setSaving(true);
    setError("");
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setError(errorMessage(e, "No se pudo guardar la configuración."));
    } finally {
      setSaving(false);
    }
  };
  return (
    <Dialog title="Configuración" onClose={onClose} busy={saving}>
      <SeasonSelector
        seasons={seasons}
        selectedSeasonId={selectedSeasonId}
        onSelect={onSelectSeason}
      />
      <form onSubmit={save} className="space-y-6 mt-6">
        <fieldset disabled={!isAdmin || saving} className="space-y-6">
          <div>
            <label
              htmlFor="ratingMode"
              className="block text-sm font-medium text-gray-700"
            >
              Métrica para valorar jugadores
            </label>
            <select
              id="ratingMode"
              value={form.ratingMode}
              className="block w-full border rounded-md px-4 py-2"
              onChange={(e) =>
                setForm({
                  ...form,
                  ratingMode: e.target.value === "elo" ? "elo" : "score",
                })
              }
            >
              <option value="score">Score</option>
              <option value="elo">ELO</option>
            </select>
          </div>
          {(["goalScoreFactor", "assistScoreFactor"] as const).map((key) => (
            <div key={key}>
              <label
                htmlFor={key}
                className="block text-sm font-medium text-gray-700"
              >
                Factor de puntos por{" "}
                {key === "goalScoreFactor" ? "gol" : "asistencia"}
              </label>
              <input
                id={key}
                type="number"
                min="0"
                max="1000"
                step="1"
                required
                value={form[key]}
                className="block w-full border rounded-md px-4 py-2"
                onChange={(e) =>
                  setForm({ ...form, [key]: e.target.valueAsNumber })
                }
              />
            </div>
          ))}
        </fieldset>
        {error && (
          <p role="alert" className="text-red-700">
            {error}
          </p>
        )}
        <div className="flex flex-wrap justify-between gap-3">
          <button
            type="button"
            onClick={onExport}
            className="bg-blue-500 text-white px-4 py-2 rounded-sm"
          >
            Exportar datos
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="bg-gray-300 px-4 py-2 rounded-sm"
          >
            Cerrar
          </button>
          {isAdmin && (
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 text-white px-4 py-2 rounded-sm"
            >
              {saving ? "Guardando..." : "Aplicar"}
            </button>
          )}
        </div>
      </form>
    </Dialog>
  );
}
