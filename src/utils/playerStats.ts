import { Player } from '../types';

export const calculateWinRate = (player: Player): number => {
  if (player.matches === 0) return 0;
  return (player.wins / player.matches) * 100;
};

export const calculateScore = (player: Player): number => {
  const winRate = calculateWinRate(player);
  const goalsPerGame = player.matches > 0 ? player.goals / player.matches : 0;
  const assistsPerGame = player.matches > 0 ? player.assists / player.matches : 0;
  
  return winRate * 0.5 + goalsPerGame * 30 + assistsPerGame * 20;
};

export const generateBalancedTeams = (players: Player[]): { teamA: Player[]; teamB: Player[] } => {
  const sortedPlayers = [...players].sort((a, b) => calculateScore(b) - calculateScore(a));
  const teamA: Player[] = [];
  const teamB: Player[] = [];
  
  sortedPlayers.forEach((player, index) => {
    if (index % 2 === 0) {
      teamA.push(player);
    } else {
      teamB.push(player);
    }
  });
  
  return { teamA, teamB };
};