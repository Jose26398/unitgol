import { useEffect, useRef } from "react";
import { ShareButton } from "../components/ShareButton";
import { Player } from "../types";
import { calculateScore, calculateWinRate } from "../utils/playerStats";

export function PlayerSummaryModal({ players, onClose }: { players: Player[]; onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div ref={modalRef} className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[70vh] overflow-y-auto shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-emerald-500">Resumen de Jugadores</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 w-1/4">Jugador</th>
              <th className="text-left py-2">Partidos</th>
              <th className="text-left py-2">Goles</th>
              <th className="text-left py-2">Asist.</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => {
              const draws = player.matches - player.wins - player.losses;
              const winRate = calculateWinRate(player).toFixed(2);
              const goalsPerMatch = (player.goals / player.matches).toFixed(2);
              const assistsPerMatch = (player.assists / player.matches).toFixed(2);

              return (
                <tr key={player.id} className="border-b last:border-b-0">
                  <td className="py-2 truncate max-w-[70px]" title={player.name}>
                    {player.name}
                    <br />
                    <span className="text-xs text-gray-500">⭐{calculateScore(player).toFixed(2)}</span>
                  </td>
                  <td className="py-2">
                    <span>V: {player.wins}, E: {draws}, D: {player.losses}</span>
                    <br />
                    <span className="text-xs text-gray-500">WR {winRate}%</span>
                  </td>
                  <td className="py-2">
                    ⚽ {player.goals}
                    <br />
                    <span className="text-xs text-gray-500">GPP {goalsPerMatch}</span>
                  </td>
                  <td className="py-2">
                    🎯 {player.assists}
                    <br />
                    <span className="text-xs text-gray-500">APP {assistsPerMatch}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex justify-between mt-6">
          <ShareButton players={players} />
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            aria-label="Cerrar modal"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
