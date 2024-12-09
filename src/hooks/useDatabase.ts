import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Player, Match } from '../types';

export function useDatabase() {
  const players = useLiveQuery(() => db.getAllPlayers()) || [];
  const matches = useLiveQuery(() => db.getAllMatches()) || [];

  const addPlayer = async (newPlayer: Omit<Player, 'id' | 'matches' | 'wins' | 'losses' | 'goals' | 'assists'>) => {
    return await db.addPlayer(newPlayer.name);
  };

  const editPlayer = async (id: string, updatedData: Partial<Omit<Player, 'id'>>) => {
    await db.updatePlayer(id, updatedData);
  };

  const deletePlayer = async (id: string) => {
    await db.deletePlayer(id);
  };

  const addMatch = async (newMatch: Omit<Match, 'id'>) => {
    const matchId = await db.addMatch(newMatch);

    // Update player stats
    const allPlayers = [...newMatch.teamA.players, ...newMatch.teamB.players];
    
    for (const player of allPlayers) {
      const isTeamA = newMatch.teamA.players.some(p => p.id === player.id);
      const currentStats = await db.players.get(player.id);
      
      if (currentStats) {
        const wins = isTeamA ? 
          (newMatch.teamA.score > newMatch.teamB.score ? currentStats.wins + 1 : currentStats.wins) :
          (newMatch.teamB.score > newMatch.teamA.score ? currentStats.wins + 1 : currentStats.wins);
        
        const losses = isTeamA ?
          (newMatch.teamA.score < newMatch.teamB.score ? currentStats.losses + 1 : currentStats.losses) :
          (newMatch.teamB.score < newMatch.teamA.score ? currentStats.losses + 1 : currentStats.losses);

        const goals = currentStats.goals + newMatch.goals.filter(g => g.playerId === player.id).length;
        const assists = currentStats.assists + newMatch.goals.filter(g => g.assistById === player.id).length;

        await db.updatePlayerStats(player.id, {
          matches: currentStats.matches + 1,
          wins,
          losses,
          goals,
          assists,
        });
      }
    }

    return matchId;
  };

  const editMatch = async (updatedMatch: Match) => {
    const oldMatch = await db.getMatchById(updatedMatch.id);

    if (!oldMatch) {
      throw new Error(`Match with ID ${updatedMatch.id} not found`);
    }

    // Revert old match stats
    await updatePlayerStatsForMatch(oldMatch, true);
    // Apply new match stats
    await updatePlayerStatsForMatch(updatedMatch);
    // Save updated match
    await db.updateMatch(updatedMatch);
  };

  const deleteMatch = async (match: Match) => {
    // Revert match stats
    await updatePlayerStatsForMatch(match, true);
    // Delete match
    await db.deleteMatch(match.id);
  };

  const updatePlayerStatsForMatch = async (match: Omit<Match, 'id'>, revert: boolean = false) => {
    const multiplier = revert ? -1 : 1;
    const allPlayers = [...match.teamA.players, ...match.teamB.players];
    
    for (const player of allPlayers) {
      const isTeamA = match.teamA.players.some(p => p.id === player.id);
      const currentStats = await db.players.get(player.id);
      
      if (currentStats) {
        const wins = isTeamA ? 
          (match.teamA.score > match.teamB.score ? currentStats.wins + multiplier : currentStats.wins) :
          (match.teamB.score > match.teamA.score ? currentStats.wins + multiplier : currentStats.wins);
        
        const losses = isTeamA ?
          (match.teamA.score < match.teamB.score ? currentStats.losses + multiplier : currentStats.losses) :
          (match.teamB.score < match.teamA.score ? currentStats.losses + multiplier : currentStats.losses);

        const goals = currentStats.goals + (multiplier * match.goals.filter(g => g.playerId === player.id).length);
        const assists = currentStats.assists + (multiplier * match.goals.filter(g => g.assistById === player.id).length);

        await db.updatePlayerStats(player.id, {
          matches: currentStats.matches + multiplier,
          wins,
          losses,
          goals,
          assists,
        });
      }
    }
  };

  return {
    players,
    matches,
    addPlayer,
    editPlayer,
    deletePlayer,
    addMatch,
    editMatch,
    deleteMatch,
  };
}