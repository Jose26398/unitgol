import { useEffect, useRef, useState } from "react";
import { db } from "../db";
import { setScoreFactors } from "../utils/playerStats";
import { Download } from "lucide-react";

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [goalScoreFactor, setGoalScoreFactor] = useState(10);
  const [assistScoreFactor, setAssistScoreFactor] = useState(5);

  useEffect(() => {
    const loadSettings = async () => {
      const goal = await db.getSetting("goalScoreFactor");
      const assist = await db.getSetting("assistScoreFactor");

      setGoalScoreFactor(goal ?? 10);
      setAssistScoreFactor(assist ?? 5);
    };

    loadSettings();
  }, []);

  const applySettings = async () => {
    await db.setSetting("goalScoreFactor", goalScoreFactor);
    await db.setSetting("assistScoreFactor", assistScoreFactor);

    setScoreFactors(goalScoreFactor, assistScoreFactor);
    onClose();
  };

  const exportDB = async () => {
    try {
      const players = await db.getAllPlayers();
      const matches = await db.getAllMatches();
      const settings = await db.settings.toArray();

      const exportData = {
        players,
        matches,
        settings,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'unitgol.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting database:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div ref={modalRef} className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Configuración</h2>

        {/* Factor de puntos por gol */}
        <div className="mb-6">
          <label htmlFor="goalScoreFactor" className="block text-sm font-medium text-gray-700">
            Factor de puntos por gol
          </label>
          <input
            type="number"
            id="goalScoreFactor"
            step="0.1" // Permite decimales
            value={goalScoreFactor}
            onChange={(e) => setGoalScoreFactor(parseFloat(e.target.value) || 0)}
            className="block w-full rounded-md border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-base"
            placeholder="10"
          />
        </div>

        {/* Factor de puntos por asistencia */}
        <div className="mb-6">
          <label htmlFor="assistScoreFactor" className="block text-sm font-medium text-gray-700">
            Factor de puntos por asistencia
          </label>
          <input
            type="number"
            id="assistScoreFactor"
            step="0.1" // Permite decimales
            value={assistScoreFactor}
            onChange={(e) => setAssistScoreFactor(parseFloat(e.target.value) || 0)}
            className="block w-full rounded-md border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-base"
            placeholder="5"
          />
        </div>

        <div className="flex justify-between flex-col md:flex-row gap-4">
          <div>
            <button
              onClick={exportDB}
              className="flex gap-2 w-full justify-center md:w-fit bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              aria-label="Exportar datos"
            >
              <Download className="w-5 h-5" />
              Exportar datos
            </button>
          </div>
          <div className="flex justify-between space-x-3">
            <button
              onClick={onClose}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              aria-label="Cerrar modal"
            >
              Cerrar
            </button>

            <button
              onClick={applySettings}
              className="w-full bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 transition-colors"
              aria-label="Aplicar cambios"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
