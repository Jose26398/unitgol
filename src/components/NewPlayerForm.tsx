import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Player } from '../types';

interface NewPlayerFormProps {
  onAddPlayer: (player: Omit<Player, 'id' | 'matches' | 'wins' | 'losses' | 'goals' | 'assists'>) => void;
}

export function NewPlayerForm({ onAddPlayer }: NewPlayerFormProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddPlayer({ name: name.trim() });
      setName('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <UserPlus className="w-6 h-6 text-blue-600" />
        Añadir nuevo jugador
      </h2>
      <div className="flex gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del jugador"
          className="flex-1 border rounded-md p-2"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Añadir jugador
        </button>
      </div>
    </form>
  );
}