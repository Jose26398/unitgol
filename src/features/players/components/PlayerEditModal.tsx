import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { getPlayerAvatarUrl } from "@/db/playerAvatars";
import type { Player, PlayerUpdate, Season } from "@/types";

interface PlayerEditModalProps {
  player: Player;
  seasons?: Season[];
  onSave: (
    updatedData: PlayerUpdate,
    avatarFile?: File,
    removeAvatar?: boolean,
  ) => Promise<void>;
  onCancel: () => void;
}

export function PlayerEditModal({
  player,
  seasons,
  onSave,
  onCancel,
}: PlayerEditModalProps) {
  const [editedData, setEditedData] = useState<PlayerUpdate>({
    name: player.name,
    matches: player.matches,
    goals: player.goals,
    assists: player.assists,
    seasonId: player.seasonId,
  });
  const [avatarFile, setAvatarFile] = useState<File | undefined>();
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave(editedData, avatarFile, removeAvatar);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar el jugador.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog title="Editar Jugador" onClose={onCancel} busy={saving}>
      <form onSubmit={handleSave} className="space-y-3">
        <fieldset disabled={saving} className="space-y-3">
          <div>
            <label
              htmlFor="player-name"
              className="block text-sm font-medium text-gray-600"
            >
              Nombre
            </label>
            <input
              id="player-name"
              type="text"
              required
              maxLength={100}
              className="w-full border border-gray-300 rounded-sm px-3 py-2"
              value={editedData.name}
              onChange={(e) =>
                setEditedData({ ...editedData, name: e.target.value })
              }
            />
          </div>
          <div>
            <label
              htmlFor="player-avatar"
              className="block text-sm font-medium text-gray-600"
            >
              Foto (JPG, PNG o WebP; máximo 2 MB)
            </label>
            {player.avatarPath && (
              <img
                src={getPlayerAvatarUrl(player.avatarPath)}
                alt={`Foto de ${player.name}`}
                className="w-16 h-16 rounded-full object-cover my-2"
              />
            )}
            <input
              id="player-avatar"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="w-full text-sm border cursor-pointer border-gray-300 rounded-sm px-3 py-2"
              onChange={(event) => {
                setAvatarFile(event.target.files?.[0]);
                setRemoveAvatar(false);
              }}
            />
            {player.avatarPath && (
              <button
                type="button"
                onClick={() => {
                  setAvatarFile(undefined);
                  setRemoveAvatar(!removeAvatar);
                }}
                className="text-sm text-red-600 mt-1 border border-red-600 px-2 py-1 rounded hover:bg-red-600 hover:text-white transition"
              >
                {removeAvatar ? "Conservar foto" : "Eliminar foto"}
              </button>
            )}
          </div>
          <div>
            <label
              htmlFor="player-matches"
              className="block text-sm font-medium text-gray-600"
            >
              Partidos
            </label>
            <input
              id="player-matches"
              type="number"
              min={0}
              className="w-full border border-gray-300 rounded-sm px-3 py-2"
              value={editedData.matches}
              onChange={(e) =>
                setEditedData({ ...editedData, matches: +e.target.value })
              }
            />
          </div>
          <div>
            <label
              htmlFor="player-goals"
              className="block text-sm font-medium text-gray-600"
            >
              Goles
            </label>
            <input
              id="player-goals"
              type="number"
              min={0}
              className="w-full border border-gray-300 rounded-sm px-3 py-2"
              value={editedData.goals}
              onChange={(e) =>
                setEditedData({ ...editedData, goals: +e.target.value })
              }
            />
          </div>
          <div>
            <label
              htmlFor="player-assists"
              className="block text-sm font-medium text-gray-600"
            >
              Asistencias
            </label>
            <input
              id="player-assists"
              type="number"
              min={0}
              className="w-full border border-gray-300 rounded-sm px-3 py-2"
              value={editedData.assists}
              onChange={(e) =>
                setEditedData({ ...editedData, assists: +e.target.value })
              }
            />
          </div>
          {seasons && (
            <div>
              <label
                htmlFor="player-season"
                className="block text-sm font-medium text-gray-600"
              >
                Temporada
              </label>
              <select
                id="player-season"
                className="w-full border border-gray-300 rounded-sm px-3 py-2"
                value={editedData.seasonId ?? ""}
                onChange={(e) =>
                  setEditedData({
                    ...editedData,
                    seasonId: e.target.value || undefined,
                  })
                }
              >
                <option value="">Sin temporada</option>
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {error && (
            <p className="text-red-600 text-sm mt-3" role="alert">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-sm hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-emerald-600 text-white rounded-sm hover:bg-emerald-700"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </fieldset>
      </form>
    </Dialog>
  );
}
