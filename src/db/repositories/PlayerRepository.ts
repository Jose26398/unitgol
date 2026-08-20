import type { Player } from "../../types";
import { mapPlayerRow } from "../mappers";
import { supabase } from "../supabase";

export class PlayerRepository {
	async addPlayer(
		name: string,
		seasonId: string | undefined,
		teamId: string | null,
	): Promise<string> {
		if (!teamId) throw new Error("Team not authenticated");

		const { data, error } = await supabase
			.from("players")
			.insert({
				name,
				matches: 0,
				wins: 0,
				losses: 0,
				goals: 0,
				assists: 0,
				season_id: seasonId || null,
				team_id: teamId,
			})
			.select()
			.single();

		if (error) throw error;
		return data.id;
	}

	async updatePlayer(
		id: string,
		updatedData: Partial<Omit<Player, "id">>,
	): Promise<void> {
		const { seasonId, ...data } = updatedData;
		const { error } = await supabase
			.from("players")
			.update({
				...data,
				season_id: seasonId,
			})
			.eq("id", id);

		if (error) throw error;
	}

	async getAllPlayers(teamId: string | null): Promise<Player[]> {
		if (!teamId) throw new Error("Team not authenticated");

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
      `)
			.eq("team_id", teamId);

		if (error) throw error;
		return data.map((player) => mapPlayerRow(player));
	}

	async deletePlayer(id: string): Promise<void> {
		const { error } = await supabase.from("players").delete().eq("id", id);
		if (error) throw error;
	}

	async updatePlayerStats(
		id: string,
		stats: Partial<Player>,
		seasonId?: string,
	): Promise<void> {
		console.log(
			"updatePlayerStats called for player:",
			id,
			"with stats:",
			stats,
			"seasonId:",
			seasonId,
		);

		const { data: currentStats, error: statsError } = await supabase
			.from("players")
			.select("*")
			.eq("id", id)
			.single();

		if (statsError) throw statsError;

		console.log("Current stats for player:", id, currentStats);

		const statsToUpdate = {
			matches: (currentStats.matches || 0) + (stats.matches || 0),
			wins: (currentStats.wins || 0) + (stats.wins || 0),
			losses: (currentStats.losses || 0) + (stats.losses || 0),
			goals: (currentStats.goals || 0) + (stats.goals || 0),
			assists: (currentStats.assists || 0) + (stats.assists || 0),
		};

		console.log("Stats to update:", statsToUpdate);

		// If this is the first match in a season for this player and they don't have a season yet
		if (seasonId && !currentStats.season_id) {
			Object.assign(statsToUpdate, { season_id: seasonId });
			console.log("Setting season_id to:", seasonId);
		}

		const { error } = await supabase
			.from("players")
			.update(statsToUpdate)
			.eq("id", id);

		if (error) throw error;

		console.log("Player stats updated successfully for:", id);
	}
}
