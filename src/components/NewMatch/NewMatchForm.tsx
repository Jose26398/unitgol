import { Plus } from 'lucide-react';
import type { Player, Match } from '../../types';
import { useNewMatchForm } from '../../hooks/useNewMatchForm';
import { TeamSelector } from './TeamSelector';
import { MatchDateInput } from './MatchDateInput';
import { GoalsSection } from './GoalsSection';
import { useMemo } from 'react';


interface NewMatchFormProps {
  players: Player[];
  onAddMatch: (match: Omit<Match, 'id'>) => void;
  selectedSeasonId: string | null;
}

export function NewMatchForm({ players, onAddMatch, selectedSeasonId }: NewMatchFormProps) {
  const filteredPlayers = useMemo(() =>
    players.filter(p => !selectedSeasonId || p.seasonId === selectedSeasonId),
    [players, selectedSeasonId]
  );
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
  } = useNewMatchForm(filteredPlayers, onAddMatch);

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
  };

  return (
    <form onSubmit={handleFormSubmit} className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Plus className="w-6 h-6 text-emerald-600" />
        <h2 className="text-xl font-semibold">Añadir nuevo partido</h2>
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <TeamSelector
          team="A"
          players={filteredPlayers}
          selectedPlayers={teamAPlayers}
          otherTeamPlayers={teamBPlayers}
          score={teamAScore}
          setScore={setTeamAScore}
          togglePlayerSelection={togglePlayerSelection}
        />
        <TeamSelector
          team="B"
          players={filteredPlayers}
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
            players={filteredPlayers}
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
