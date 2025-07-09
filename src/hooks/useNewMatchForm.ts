import { useState } from 'react';
import { Player, Match } from '../types';

export function useNewMatchForm(players: Player[], onAddMatch: (match: Omit<Match, 'id'>) => void) {
  const [matchDate, setMatchDate] = useState<string | null>(null);
  const [teamAPlayers, setTeamAPlayers] = useState<string[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<string[]>([]);
  const [teamAScore, setTeamAScore] = useState<number | null>(null);
  const [teamBScore, setTeamBScore] = useState<number | null>(null);
  const [goals, setGoals] = useState<Array<{ playerId: string; minute: number; assistById?: string }>>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamAScore === null || teamBScore === null || matchDate === null) return;
    onAddMatch({
      date: matchDate,
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

  const handleAddGoal = (goal: { playerId: string; minute: number; assistById?: string }) => {
    setGoals([...goals, goal]);
  };

  const togglePlayerSelection = (playerId: string, team: 'A' | 'B') => {
    if (team === 'A') {
      setTeamAPlayers(prev =>
        prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]
      );
      setTeamBPlayers(prev => prev.filter(id => id !== playerId));
    } else {
      setTeamBPlayers(prev =>
        prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]
      );
      setTeamAPlayers(prev => prev.filter(id => id !== playerId));
    }
  };

  const selectedPlayers = [...teamAPlayers, ...teamBPlayers];
  const availablePlayers = players.filter(p => selectedPlayers.includes(p.id));

  return {
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
    handleSubmit,
    handleAddGoal,
    togglePlayerSelection,
    selectedPlayers,
    availablePlayers,
  };
}
