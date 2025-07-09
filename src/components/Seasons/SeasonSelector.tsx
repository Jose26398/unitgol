import React from 'react';
import { Season } from '../../types';

interface SeasonSelectorProps {
  seasons: Season[];
  selectedSeasonId: string | null;
  onSelect: (seasonId: string | null) => void;
}

export const SeasonSelector: React.FC<SeasonSelectorProps> = ({ seasons, selectedSeasonId, onSelect }) => {
  return (
    <div className="mb-4 flex gap-2 items-center">
      <label className="font-semibold">Temporada:</label>
      <select
        className="border rounded p-2"
        value={selectedSeasonId || ''}
        onChange={e => onSelect(e.target.value || null)}
      >
        <option value="">Todas</option>
        {seasons.map(season => (
          <option key={season.id} value={season.id}>
            {season.name}
          </option>
        ))}
      </select>
    </div>
  );
};
