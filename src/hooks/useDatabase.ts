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
    
    // Actualizar el estado local
    const match = { id: matchId, ...newMatch };
    setMatches(prev => [match, ...prev]);
    
    // Refrescar estadísticas de jugadores
    try {
      const playersData = await db.getAllPlayers();
      setPlayers(playersData);
    } catch (e) {
      console.error('Error refreshing players after match add:', e);
    }
    
    return matchId;
  };

  const editMatch = async (updatedMatch: Match) => {
    await db.editMatch(updatedMatch);
    
    // Actualizar estado local
    setMatches((prev: Match[]) => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
    
    // Refrescar estadísticas de jugadores ya que pueden haber cambiado
    try {
      const playersData = await db.getAllPlayers();
      setPlayers(playersData);
    } catch (e) {
      console.error('Error refreshing players after match edit:', e);
    }
  };

  const deleteMatch = async (match: Match) => {
    await db.deleteMatch(match.id);
    // Actualizar estado local
    setMatches((prev: Match[]) => prev.filter(m => m.id !== match.id));
    
    // Refrescar estadísticas de jugadores
    try {
      const playersData = await db.getAllPlayers();
      setPlayers(playersData);
    } catch (e) {
      console.error('Error refreshing players after match delete:', e);
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