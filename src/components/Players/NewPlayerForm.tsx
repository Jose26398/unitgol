
import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Player, Season } from '../../types';

interface NewPlayerFormProps {
  onAddPlayer: (player: Omit<Player, 'id' | 'matches' | 'wins' | 'losses' | 'goals' | 'assists'> & { seasonId: string }) => void;
  seasons: Season[];
  selectedSeasonId: string | null;
}

export function NewPlayerForm({ onAddPlayer, seasons, selectedSeasonId }: NewPlayerFormProps) {
  const [name, setName] = useState('');
  const [seasonId, setSeasonId] = useState<string>(selectedSeasonId || (seasons[0]?.id ?? ''));

  if (selectedSeasonId && seasonId !== selectedSeasonId) {
    setSeasonId(selectedSeasonId);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && seasonId) {
      onAddPlayer({ name: name.trim(), seasonId });
      setName('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6 w-full">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <UserPlus className="w-6 h-6 text-emerald-600" />
        Añadir nuevo jugador
      </h2>
      <div className="flex gap-4 md:flex-row flex-col">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del jugador"
          className="flex-1 border rounded-md p-2"
          required
        />
        <select
          value={seasonId}
          onChange={e => setSeasonId(e.target.value)}
          className="border rounded-md p-2"
          required
        >
          <option value="" disabled>Selecciona temporada</option>
          {seasons.map(season => (
            <option key={season.id} value={season.id}>{season.name}</option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors"
        >
          Añadir jugador
        </button>
      </div>
    </form>
  );
}
