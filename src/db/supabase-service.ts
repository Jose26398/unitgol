import { supabase } from "./supabase";
import type { Player, Match, Season } from "../types";
import type { MatchWithRelations, MatchPlayerRow, GoalRow } from "./types";

export class SupabaseService {
  // Players
  async addPlayer(name: string, seasonId?: string): Promise<string> {
    const { data, error } = await supabase
      .from("players")
      .insert({
        name,
        matches: 0,
        wins: 0,
        losses: 0,
        goals: 0,
        assists: 0,
        season_id: seasonId || null
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
      .update({
        ...updatedData,
        season_id: updatedData.seasonId
      })
      .eq("id", id);

    if (error) throw error;
  }

  async getAllPlayers(): Promise<Player[]> {
    const { data, error } = await supabase
      .from("players")
      .select(`
        id,
        name,
        matches,
        wins,
        losses,
        goals,
        assists,
        season_id,
        seasons (
          id,
          name,
          start_date,
          end_date
        )
      `);

    if (error) throw error;
    return data.map(player => ({
      id: player.id,
      name: player.name,
      matches: player.matches,
      wins: player.wins,
      losses: player.losses,
      goals: player.goals,
      assists: player.assists,
      seasonId: player.season_id || undefined
    }));
  }

  async deletePlayer(id: string): Promise<void> {
    const { error } = await supabase.from("players").delete().eq("id", id);
    if (error) throw error;
  }

  async updatePlayerStats(id: string, stats: Partial<Player>, seasonId?: string): Promise<void> {
    const { data: currentStats, error: statsError } = await supabase
      .from("players")
      .select("*")
      .eq("id", id)
      .single();

    if (statsError) throw statsError;

    const statsToUpdate = {
      matches: (currentStats.matches || 0) + (stats.matches || 0),
      wins: (currentStats.wins || 0) + (stats.wins || 0),
      losses: (currentStats.losses || 0) + (stats.losses || 0),
      goals: (currentStats.goals || 0) + (stats.goals || 0),
      assists: (currentStats.assists || 0) + (stats.assists || 0)
    };

    // If this is the first match in a season for this player and they don't have a season yet
    if (seasonId && !currentStats.season_id) {
      statsToUpdate.season_id = seasonId;
    }

    const { error } = await supabase
      .from("players")
      .update(statsToUpdate)
      .eq("id", id);

    if (error) throw error;
  }

  // Matches
  async addMatch(match: Omit<Match, "id">): Promise<string> {
    const { data: matchData, error: matchError } = await supabase
      .from("matches")
      .insert({
        date: match.date,
        season_id: match.seasonId || null,
        team_a_score: match.teamA.score,
        team_b_score: match.teamB.score
      })
      .select()
      .single();

    if (matchError) throw matchError;

    const matchId = matchData.id;

    const matchPlayers = [
      ...match.teamA.players.map((player) => ({
        match_id: matchId,
        player_id: player.id,
        team: "A" as const
      })),
      ...match.teamB.players.map((player) => ({
        match_id: matchId,
        player_id: player.id,
        team: "B" as const
      }))
    ];

    const { error: playersError } = await supabase
      .from("match_players")
      .insert(matchPlayers);

    if (playersError) throw playersError;

    if (match.goals.length > 0) {
      const { error: goalsError } = await supabase.from("goals").insert(
        match.goals.map((goal) => ({
          match_id: matchId,
          player_id: goal.playerId,
          assist_by_id: goal.assistById || null,
          minute: goal.minute
        }))
      );

      if (goalsError) throw goalsError;
    }

    return matchId;
  }

  async getAllMatches(): Promise<Match[]> {
    const { data: matches, error: matchesError } = await supabase
      .from("matches")
      .select(`
        id,
        date,
        season_id,
        team_a_score,
        team_b_score,
        match_players (
          team,
          players (
            id,
            name,
            matches,
            wins,
            losses,
            goals,
            assists,
            season_id
          )
        ),
        goals (
          id,
          player_id,
          assist_by_id,
          minute
        )
      `)
      .order("date", { ascending: false });

    if (matchesError) throw matchesError;

    return matches.map((match: MatchWithRelations) => {
      const teamAPlayers = match.match_players
        .filter(mp => mp.team === "A")
        .map(mp => ({
          id: mp.players.id,
          name: mp.players.name,
          matches: mp.players.matches,
          wins: mp.players.wins,
          losses: mp.players.losses,
          goals: mp.players.goals,
          assists: mp.players.assists,
          seasonId: mp.players.season_id || undefined
        }));

      const teamBPlayers = match.match_players
        .filter(mp => mp.team === "B")
        .map(mp => ({
          id: mp.players.id,
          name: mp.players.name,
          matches: mp.players.matches,
          wins: mp.players.wins,
          losses: mp.players.losses,
          goals: mp.players.goals,
          assists: mp.players.assists,
          seasonId: mp.players.season_id || undefined
        }));

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
        goals: match.goals.map(g => ({
          playerId: g.player_id,
          minute: g.minute,
          assistById: g.assist_by_id || undefined,
        })),
      };
    });
  }

  async deleteMatch(id: string): Promise<void> {
    // First delete the goals
    const { error: goalsError } = await supabase
      .from("goals")
      .delete()
      .eq("match_id", id);

    if (goalsError) throw goalsError;

    // Then delete match players
    const { error: playersError } = await supabase
      .from("match_players")
      .delete()
      .eq("match_id", id);

    if (playersError) throw playersError;

    // Finally delete the match
    const { error } = await supabase
      .from("matches")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async editMatch(match: Match): Promise<void> {
    // Update match
    const { error: matchError } = await supabase
      .from("matches")
      .update({
        date: match.date,
        season_id: match.seasonId || null,
        team_a_score: match.teamA.score,
        team_b_score: match.teamB.score
      })
      .eq("id", match.id);

    if (matchError) throw matchError;

    // Delete old match players and goals
    const { error: deletePlayersError } = await supabase
      .from("match_players")
      .delete()
      .eq("match_id", match.id);

    if (deletePlayersError) throw deletePlayersError;

    const { error: deleteGoalsError } = await supabase
      .from("goals")
      .delete()
      .eq("match_id", match.id);

    if (deleteGoalsError) throw deleteGoalsError;

    // Insert new match players
    const matchPlayers = [
      ...match.teamA.players.map((player) => ({
        match_id: match.id,
        player_id: player.id,
        team: "A" as const
      })),
      ...match.teamB.players.map((player) => ({
        match_id: match.id,
        player_id: player.id,
        team: "B" as const
      }))
    ];

    const { error: playersError } = await supabase
      .from("match_players")
      .insert(matchPlayers);

    if (playersError) throw playersError;

    // Insert new goals
    if (match.goals.length > 0) {
      const { error: goalsError } = await supabase
        .from("goals")
        .insert(
          match.goals.map((goal) => ({
            match_id: match.id,
            player_id: goal.playerId,
            assist_by_id: goal.assistById || null,
            minute: goal.minute
          }))
        );

      if (goalsError) throw goalsError;
    }
  }

  async getMatchById(id: string): Promise<Match | undefined> {
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select(`
        id,
        date,
        season_id,
        team_a_score,
        team_b_score,
        match_players (
          team,
          players (
            id,
            name,
            matches,
            wins,
            losses,
            goals,
            assists,
            season_id
          )
        ),
        goals (
          id,
          player_id,
          assist_by_id,
          minute
        )
      `)
      .eq("id", id)
      .single();

    if (matchError) return undefined;

    const teamAPlayers = match.match_players
      .filter((mp: MatchPlayerRow) => mp.team === "A" && mp.players)
      .map((mp: MatchPlayerRow) => ({
        id: mp.players!.id,
        name: mp.players!.name,
        matches: mp.players!.matches,
        wins: mp.players!.wins,
        losses: mp.players!.losses,
        goals: mp.players!.goals,
        assists: mp.players!.assists,
        seasonId: mp.players!.season_id || undefined
      }));

    const teamBPlayers = match.match_players
      .filter((mp: MatchPlayerRow) => mp.team === "B" && mp.players)
      .map((mp: MatchPlayerRow) => ({
        id: mp.players!.id,
        name: mp.players!.name,
        matches: mp.players!.matches,
        wins: mp.players!.wins,
        losses: mp.players!.losses,
        goals: mp.players!.goals,
        assists: mp.players!.assists,
        seasonId: mp.players!.season_id || undefined
      }));

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
      goals: match.goals.map((g: GoalRow) => ({
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
        end_date: season.endDate || null
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
        end_date: season.endDate || null
      })
      .eq("id", season.id);

    if (error) throw error;
  }

  async deleteSeason(id: string): Promise<void> {
    // First, unlink players from this season
    const { error: playersError } = await supabase
      .from("players")
      .update({ season_id: null })
      .eq("season_id", id);

    if (playersError) throw playersError;

    // Then delete the season
    const { error } = await supabase
      .from("seasons")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async getAllSeasons(): Promise<Season[]> {
    const { data, error } = await supabase
      .from("seasons")
      .select("*")
      .order("start_date", { ascending: false });

    if (error) throw error;

    return data.map(season => ({
      id: season.id,
      name: season.name,
      startDate: season.start_date,
      endDate: season.end_date || undefined
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
      endDate: data.end_date || undefined
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
