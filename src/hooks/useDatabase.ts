import { useState, useEffect } from 'react';
import { SupabaseService } from '../db/supabase-service';
import { Player, Match, Season } from '../types';
import { useAuth } from '../auth/hook';

const db = new SupabaseService();

export function useDatabase() {
  const { teamAuth } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState({
    players: true,
    matches: true,
    seasons: true
  });
  const [error, setError] = useState<string | null>(null);

  // Set team ID in SupabaseService when it changes
  useEffect(() => {
    if (teamAuth) {
      db.setTeamId(teamAuth.id);
    }
  }, [teamAuth]);

  // Fetch initial data when teamAuth changes
  useEffect(() => {
    if (!teamAuth) {
      setPlayers([]);
      setMatches([]);
      setSeasons([]);
      return;
    }

    const fetchData = async () => {
      try {
        const [playersData, matchesData, seasonsData] = await Promise.all([
          db.getAllPlayers(),
          db.getAllMatches(),
          db.getAllSeasons()
        ]);

        setPlayers(playersData);
        setMatches(matchesData);
        setSeasons(seasonsData);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar los datos');
      } finally {
        setLoading({
          players: false,
          matches: false,
          seasons: false
        });
      }
    };

    fetchData();
  }, [teamAuth]);
  // Season CRUD
  const addSeason = async (season: Omit<Season, 'id'>) => {
    return await db.addSeason(season);
  };

  const editSeason = async (season: Season) => {
    await db.updateSeason(season);
  };

  const deleteSeason = async (id: string) => {
    await db.deleteSeason(id);
  };

  const addPlayer = async (newPlayer: Omit<Player, 'id' | 'matches' | 'wins' | 'losses' | 'goals' | 'assists'> & { seasonId: string }) => {
    return await db.addPlayer(newPlayer.name, newPlayer.seasonId);
  };

  const editPlayer = async (id: string, updatedData: Partial<Omit<Player, 'id'>>) => {
    await db.updatePlayer(id, updatedData);
  };

  const deletePlayer = async (id: string) => {
    await db.deletePlayer(id);
  };

  const addMatch = async (newMatch: Omit<Match, 'id'>) => {
    const matchId = await db.addMatch(newMatch);
    await updatePlayerStatsForMatch(newMatch);
    
    // Actualizar el estado local
    const match = { id: matchId, ...newMatch };
    setMatches(prev => [match, ...prev]);
    
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
    await db.editMatch(updatedMatch);
    
    // Actualizar estado local
    setMatches((prev: Match[]) => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
  };

  const deleteMatch = async (match: Match) => {
    // Revert match stats
    await updatePlayerStatsForMatch(match, true);
    // Delete match
    await db.deleteMatch(match.id);
    // Actualizar estado local
    setMatches((prev: Match[]) => prev.filter(m => m.id !== match.id));
  };

  const updatePlayerStatsForMatch = async (match: Omit<Match, 'id'>, revert: boolean = false) => {
    const multiplier = revert ? -1 : 1;
    const allPlayers = [...match.teamA.players, ...match.teamB.players];

    for (const player of allPlayers) {
      const isTeamA = match.teamA.players.some((p: Player) => p.id === player.id);
      const currentStats = players.find((p: Player) => p.id === player.id);

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

        setPlayers((prev: Player[]) => prev.map((p: Player) => p.id === player.id ? {
          ...p,
          matches: currentStats.matches + multiplier,
          wins,
          losses,
          goals,
          assists,
        } : p));
      }
    }
  };

  const selectSeason = (seasonId: string | null) => {
    if (!seasonId) {
      setSelectedSeason(null);
      return;
    }
    const season = seasons.find(s => s.id === seasonId);
    setSelectedSeason(season || null);
  };

  return {
    players,
    matches,
    seasons,
    selectedSeason,
    loading,
    error,
    addPlayer,
    editPlayer,
    deletePlayer,
    addMatch,
    editMatch,
    deleteMatch,
    addSeason,
    editSeason,
    deleteSeason,
    selectSeason,
  };
}