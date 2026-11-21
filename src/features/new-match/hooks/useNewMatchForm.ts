import { useState } from "react";
import type { Match, Player } from "@/types";

export function useNewMatchForm(players: Player[]) {
  const [matchDate, setMatchDate] = useState<string | null>(null);
  const [teamAPlayers, setTeamAPlayers] = useState<string[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<string[]>([]);
  const [teamAScore, setTeamAScore] = useState<number | null>(null);
  const [teamBScore, setTeamBScore] = useState<number | null>(null);
  const [goals, setGoals] = useState<Match["goals"]>([]);

  const reset = () => {
    setMatchDate(null);
    setTeamAPlayers([]);
    setTeamBPlayers([]);
    setTeamAScore(null);
    setTeamBScore(null);
    setGoals([]);
  };

  const handleAddGoal = (goal: Match["goals"][number]) => {
    setGoals((current) => [...current, goal]);
  };

  const togglePlayerSelection = (playerId: string, team: "A" | "B") => {
    setGoals((current) =>
      current
        .filter((goal) => goal.playerId !== playerId)
        .map((goal) =>
          goal.assistById === playerId
            ? { ...goal, assistById: undefined }
            : goal,
        ),
    );
    if (team === "A") {
      setTeamAPlayers((prev) =>
        prev.includes(playerId)
          ? prev.filter((id) => id !== playerId)
          : [...prev, playerId],
      );
      setTeamBPlayers((prev) => prev.filter((id) => id !== playerId));
    } else {
      setTeamBPlayers((prev) =>
        prev.includes(playerId)
          ? prev.filter((id) => id !== playerId)
          : [...prev, playerId],
      );
      setTeamAPlayers((prev) => prev.filter((id) => id !== playerId));
    }
  };

  const selectedPlayers = [...teamAPlayers, ...teamBPlayers];
  const availablePlayers = players.filter((p) =>
    selectedPlayers.includes(p.id),
  );

  return {
    matchDate,
    setMatchDate,
    teamAPlayers,
    teamBPlayers,
    teamAScore,
    setTeamAScore,
    teamBScore,
    setTeamBScore,
    goals,
    setGoals,
    reset,
    handleAddGoal,
    togglePlayerSelection,
    selectedPlayers,
    availablePlayers,
  };
}
