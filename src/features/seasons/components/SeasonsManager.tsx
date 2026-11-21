import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import type { Season } from "@/types";
import { errorMessage } from "@/utils/errors";

interface SeasonsManagerProps {
  seasons: Season[];
  onAddSeason: (season: Omit<Season, "id">) => Promise<unknown>;
  onEditSeason: (season: Season) => Promise<unknown>;
  onDeleteSeason: (id: string) => Promise<unknown>;
  selectedSeasonId?: string | null;
  onSelectSeason?: (seasonId: string) => void;
  isAdmin: boolean;
}

export function SeasonsManager({
  seasons,
  onAddSeason,
  onEditSeason,
  onDeleteSeason,
  selectedSeasonId,
  onSelectSeason,
  isAdmin,
}: SeasonsManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Season, "id">>({
    name: "",
    startDate: "",
    endDate: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      if (editId) {
        await onEditSeason({ ...form, id: editId });
      } else {
        await onAddSeason(form);
      }
      setForm({ name: "", startDate: "", endDate: "" });
      setEditId(null);
      setShowForm(false);
    } catch (e) {
      setError(errorMessage(e, "No se pudo guardar la temporada."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId || saving) return;
    setSaving(true);
    setError("");
    try {
      await onDeleteSeason(deleteId);
      setDeleteId(null);
    } catch (e) {
      setError(errorMessage(e, "No se pudo eliminar la temporada."));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (season: Season) => {
    setForm({
      name: season.name,
      startDate: season.startDate,
      endDate: season.endDate,
    });
    setEditId(season.id);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Temporadas</h2>
        {isAdmin && (
          <button
            type="button"
            className="bg-emerald-600 text-white px-4 py-2 rounded-sm"
            onClick={() => {
              setShowForm(true);
              setEditId(null);
              setForm({ name: "", startDate: "", endDate: "" });
              setError("");
            }}
          >
            Nueva Temporada
          </button>
        )}
      </div>
      {showForm && (
        <form className="mb-6 space-y-2" onSubmit={handleSubmit}>
          <fieldset disabled={saving} className="space-y-2">
            <input
              className="border p-2 rounded-sm w-full"
              placeholder="Nombre de la temporada"
              aria-label="Nombre de la temporada"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <input
              className="border p-2 rounded-sm w-full"
              type="date"
              aria-label="Inicio de la temporada"
              value={form.startDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, startDate: e.target.value }))
              }
              required
            />
            <input
              className="border p-2 rounded-sm w-full"
              type="date"
              aria-label="Fin de la temporada"
              min={form.startDate}
              value={form.endDate || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, endDate: e.target.value }))
              }
            />
            <div className="flex gap-2">
              <button
                className="bg-emerald-600 text-white px-4 py-2 rounded-sm"
                type="submit"
              >
                {editId ? "Guardar" : "Crear"}
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded-sm"
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </fieldset>
        </form>
      )}
      {error && !deleteId && (
        <p role="alert" className="text-red-700 mb-4">
          {error}
        </p>
      )}
      <ul className="mb-8 space-y-2">
        {seasons.map((season) => (
          <li
            key={season.id}
            className={`flex justify-between items-center border rounded-sm bg-white transition-colors ${selectedSeasonId === season.id ? "bg-emerald-100 border-emerald-400" : "hover:bg-gray-50"}`}
          >
            <button
              type="button"
              className="flex-1 text-left cursor-pointer p-3"
              onClick={() => onSelectSeason?.(season.id)}
            >
              <div className="font-semibold">{season.name}</div>
              <div className="text-sm text-gray-500">
                {season.startDate} {season.endDate ? `- ${season.endDate}` : ""}
              </div>
            </button>
            {isAdmin && (
              <div className="flex gap-4 mr-4">
                <button
                  type="button"
                  className="text-emerald-600"
                  aria-label={`Editar ${season.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(season);
                  }}
                >
                  <Edit className="inline-block w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="text-red-500"
                  aria-label={`Eliminar ${season.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(season.id);
                    setError("");
                  }}
                >
                  <Trash2 className="inline-block w-5 h-5" />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <ConfirmDeleteModal
        open={!!deleteId}
        title="¿Eliminar temporada?"
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isConfirming={saving}
        errorMessage={error}
      />
    </div>
  );
}
