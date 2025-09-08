import { supabase } from "./supabase";
import type { Player, Match, Season } from "../types";

export class SupabaseService {
  // Players
  async addPlayer(name: string): Promise<string> {
    const { data, error } = await supabase
      .from("players")
      .insert({
        name,
        matches: 0,
        wins: 0,
        losses: 0,
        goals: 0,
        assists: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  async updatePlayer(
    id: string,
    updatedData: Partial<Omit<Player, "id">>
  ): Promise<void> {
    const { error } = await supabase
      .from("players")
      .update(updatedData)
      .eq("id", id);

    if (error) throw error;
  }

  async getAllPlayers(): Promise<Player[]> {
    const { data, error } = await supabase.from("players").select("*");

    if (error) throw error;
    return data;
  }

  async deletePlayer(id: string): Promise<void> {
    const { error } = await supabase.from("players").delete().eq("id", id);

    if (error) throw error;
  }

  async updatePlayerStats(id: string, stats: Partial<Player>): Promise<void> {
    const { error } = await supabase.from("players").update(stats).eq("id", id);

    if (error) throw error;
  }

  // Matches
  async addMatch(match: Omit<Match, "id">): Promise<string> {
    // First, create the match
    const { data: matchData, error: matchError } = await supabase
      .from("matches")
      .insert({
        date: match.date,
        season_id: match.seasonId || null,
        team_a_score: match.teamA.score,
        team_b_score: match.teamB.score,
      })
      .select()
      .single();

    if (matchError) throw matchError;

    const matchId = matchData.id;

    // Then, add all players
    const matchPlayers = [
      ...match.teamA.players.map((player) => ({
        match_id: matchId,
        player_id: player.id,
        team: "A",
      })),
      ...match.teamB.players.map((player) => ({
        match_id: matchId,
        player_id: player.id,
        team: "B",
      })),
    ];

    const { error: playersError } = await supabase
      .from("match_players")
      .insert(matchPlayers);

    if (playersError) throw playersError;

    // Finally, add all goals
    if (match.goals.length > 0) {
      const { error: goalsError } = await supabase.from("goals").insert(
        match.goals.map((goal) => ({
          match_id: matchId,
          player_id: goal.playerId,
          assist_by_id: goal.assistById || null,
          minute: goal.minute,
        }))
      );

      if (goalsError) throw goalsError;
    }

    return matchId;
  }

  async updateMatch(match: Match): Promise<void> {
    // Update match basic info
    const { error: matchError } = await supabase
      .from("matches")
      .update({
        date: match.date,
        season_id: match.seasonId || null,
        team_a_score: match.teamA.score,
        team_b_score: match.teamB.score,
      })
      .eq("id", match.id);

    if (matchError) throw matchError;

    // Delete and re-insert players
    const { error: deletePlayers } = await supabase
      .from("match_players")
      .delete()
      .eq("match_id", match.id);

    if (deletePlayers) throw deletePlayers;

    const matchPlayers = [
      ...match.teamA.players.map((player) => ({
        match_id: match.id,
        player_id: player.id,
        team: "A",
      })),
      ...match.teamB.players.map((player) => ({
        match_id: match.id,
        player_id: player.id,
        team: "B",
      })),
    ];

    const { error: playersError } = await supabase
      .from("match_players")
      .insert(matchPlayers);

    if (playersError) throw playersError;

    // Delete and re-insert goals
    const { error: deleteGoals } = await supabase
      .from("goals")
      .delete()
      .eq("match_id", match.id);

    if (deleteGoals) throw deleteGoals;

    if (match.goals.length > 0) {
      const { error: goalsError } = await supabase.from("goals").insert(
        match.goals.map((goal) => ({
          match_id: match.id,
          player_id: goal.playerId,
          assist_by_id: goal.assistById || null,
          minute: goal.minute,
        }))
      );

      if (goalsError) throw goalsError;
    }
  }

  async deleteMatch(id: string): Promise<void> {
    const { error } = await supabase.from("matches").delete().eq("id", id);

    if (error) throw error;
  }

  async getAllMatches(): Promise<Match[]> {
    const { data: matches, error: matchesError } = await supabase
      .from("matches")
      .select("*")
      .order("date", { ascending: false });

    if (matchesError) throw matchesError;

    // Get all match players
    const { data: matchPlayers, error: playersError } = await supabase
      .from("match_players")
      .select("*");

    if (playersError) throw playersError;

    // Get all goals
    const { data: goals, error: goalsError } = await supabase
      .from("goals")
      .select("*");

    if (goalsError) throw goalsError;

    // Get all players for reference
    const { data: players, error: allPlayersError } = await supabase
      .from("players")
      .select("*");

    if (allPlayersError) throw allPlayersError;

    // Transform the data to match our frontend model
    return matches.map((match) => {
      const matchPlayerEntries = matchPlayers.filter(
        (mp) => mp.match_id === match.id
      );
      const matchGoals = goals.filter((g) => g.match_id === match.id);

      const teamAPlayers = matchPlayerEntries
        .filter((mp) => mp.team === "A")
        .map((mp) => players.find((p) => p.id === mp.player_id))
        .filter((p): p is Player => p !== undefined);

      const teamBPlayers = matchPlayerEntries
        .filter((mp) => mp.team === "B")
        .map((mp) => players.find((p) => p.id === mp.player_id))
        .filter((p): p is Player => p !== undefined);

      return {
        id: match.id,
        date: match.date,
        seasonId: match.season_id || undefined,
        teamA: {
          players: teamAPlayers,
          score: match.team_a_score,
        },
        teamB: {
          players: teamBPlayers,
          score: match.team_b_score,
        },
        goals: matchGoals.map((g) => ({
          playerId: g.player_id,
          minute: g.minute,
          assistById: g.assist_by_id || undefined,
        })),
      };
    });
  }

  async getMatchById(id: string): Promise<Match | undefined> {
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("*")
      .eq("id", id)
      .single();

    if (matchError) return undefined;

    const { data: matchPlayers, error: playersError } = await supabase
      .from("match_players")
      .select("*")
      .eq("match_id", id);

    if (playersError) throw playersError;

    const { data: goals, error: goalsError } = await supabase
      .from("goals")
      .select("*")
      .eq("match_id", id);

    if (goalsError) throw goalsError;

    const playerIds = matchPlayers.map((mp) => mp.player_id);
    const { data: players, error: allPlayersError } = await supabase
      .from("players")
      .select("*")
      .in("id", playerIds);

    if (allPlayersError) throw allPlayersError;

    const teamAPlayers = matchPlayers
      .filter((mp) => mp.team === "A")
      .map((mp) => players.find((p) => p.id === mp.player_id))
      .filter((p): p is Player => p !== undefined);

    const teamBPlayers = matchPlayers
      .filter((mp) => mp.team === "B")
      .map((mp) => players.find((p) => p.id === mp.player_id))
      .filter((p): p is Player => p !== undefined);

    return {
      id: match.id,
      date: match.date,
      seasonId: match.season_id || undefined,
      teamA: {
        players: teamAPlayers,
        score: match.team_a_score,
      },
      teamB: {
        players: teamBPlayers,
        score: match.team_b_score,
      },
      goals: goals.map((g) => ({
        playerId: g.player_id,
        minute: g.minute,
        assistById: g.assist_by_id || undefined,
      })),
    };
  }

  // Seasons
  async addSeason(season: Omit<Season, "id">): Promise<string> {
    const { data, error } = await supabase
      .from("seasons")
      .insert({
        name: season.name,
        start_date: season.startDate,
        end_date: season.endDate || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  async updateSeason(season: Season): Promise<void> {
    const { error } = await supabase
      .from("seasons")
      .update({
        name: season.name,
        start_date: season.startDate,
        end_date: season.endDate || null,
      })
      .eq("id", season.id);

    if (error) throw error;
  }

  async deleteSeason(id: string): Promise<void> {
    const { error } = await supabase.from("seasons").delete().eq("id", id);

    if (error) throw error;
  }

  async getAllSeasons(): Promise<Season[]> {
    const { data, error } = await supabase
      .from("seasons")
      .select("*")
      .order("start_date", { ascending: false });

    if (error) throw error;

    return data.map((season) => ({
      id: season.id,
      name: season.name,
      startDate: season.start_date,
      endDate: season.end_date || undefined,
    }));
  }

  async getSeasonById(id: string): Promise<Season | undefined> {
    const { data, error } = await supabase
      .from("seasons")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return undefined;

    return {
      id: data.id,
      name: data.name,
      startDate: data.start_date,
      endDate: data.end_date || undefined,
    };
  }

  // Settings
  async getSetting(key: string): Promise<number | undefined> {
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", key)
      .single();

    if (error) return undefined;
    return data.value;
  }

  async setSetting(key: string, value: number): Promise<void> {
    const { error } = await supabase
      .from("settings")
      .upsert({ key, value }, { onConflict: "key" });

    if (error) throw error;
  }
}
