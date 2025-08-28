import React from 'react';
import { Season } from '../../types';

interface SeasonSelectorProps {
  seasons: Season[];
  selectedSeasonId: string | null;
  onSelect: (seasonId: string | null) => void;
}

export const SeasonSelector: React.FC<SeasonSelectorProps> = ({ seasons, selectedSeasonId, onSelect }) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700">Temporada:</label>
      <select
        className="w-full rounded p-2"
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
