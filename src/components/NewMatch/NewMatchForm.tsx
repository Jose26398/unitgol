import { Plus } from 'lucide-react';
import { Player, Match } from '../../types';
import { useNewMatchForm } from '../../hooks/useNewMatchForm';
import { TeamSelector } from './TeamSelector';
import { MatchDateInput } from './MatchDateInput';
import { GoalsSection } from './GoalsSection';


import { Season } from '../../types';

interface NewMatchFormProps {
  players: Player[];
  onAddMatch: (match: Omit<Match, 'id'>) => void;
  seasons: Season[];
}


import { useState } from 'react';

export function NewMatchForm({ players, onAddMatch, seasons }: NewMatchFormProps) {
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);
  const {
    matchDate,
    setMatchDate,
    teamAPlayers,
    setTeamAPlayers,
    teamBPlayers,
    setTeamBPlayers,
    teamAScore,
    setTeamAScore,
    teamBScore,
    setTeamBScore,
    goals,
    setGoals,
    handleAddGoal,
    togglePlayerSelection,
    selectedPlayers,
    availablePlayers,
  } = useNewMatchForm(players, onAddMatch);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamAScore === null || teamBScore === null || matchDate === null) return;
    onAddMatch({
      date: matchDate,
      seasonId: selectedSeasonId || undefined,
      teamA: {
        players: players.filter(p => teamAPlayers.includes(p.id)),
        score: teamAScore,
      },
      teamB: {
        players: players.filter(p => teamBPlayers.includes(p.id)),
        score: teamBScore,
      },
      goals: goals.sort((a, b) => a.minute - b.minute),
    });
    setMatchDate(null);
    setTeamAPlayers([]);
    setTeamBPlayers([]);
    setTeamAScore(null);
    setTeamBScore(null);
    setGoals([]);
    setSelectedSeasonId(null);
  };

  return (
    <form onSubmit={handleFormSubmit} className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Plus className="w-6 h-6 text-emerald-600" />
        <h2 className="text-xl font-semibold">Añadir nuevo partido</h2>
      </div>
      <div className="mb-4 flex gap-2 items-center">
        <label className="font-semibold">Temporada:</label>
        <select
          className="border rounded p-2"
          value={selectedSeasonId || ''}
          onChange={e => setSelectedSeasonId(e.target.value || null)}
        >
          <option value="">Sin temporada</option>
          {seasons.map(season => (
            <option key={season.id} value={season.id}>{season.name}</option>
          ))}
        </select>
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <TeamSelector
          team="A"
          players={players}
          selectedPlayers={teamAPlayers}
          otherTeamPlayers={teamBPlayers}
          score={teamAScore}
          setScore={setTeamAScore}
          togglePlayerSelection={togglePlayerSelection}
        />
        <TeamSelector
          team="B"
          players={players}
          selectedPlayers={teamBPlayers}
          otherTeamPlayers={teamAPlayers}
          score={teamBScore}
          setScore={setTeamBScore}
          togglePlayerSelection={togglePlayerSelection}
        />
        <div>
          <MatchDateInput matchDate={matchDate} setMatchDate={setMatchDate} />
          <GoalsSection
            goals={goals}
            players={players}
            availablePlayers={availablePlayers}
            handleAddGoal={handleAddGoal}
            selectedPlayers={selectedPlayers}
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={teamAScore === null || teamBScore === null || matchDate === null || teamAPlayers.length === 0 || teamBPlayers.length === 0}
        className="mt-6 w-full bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Añadir partido
      </button>
    </form>
  );
}
