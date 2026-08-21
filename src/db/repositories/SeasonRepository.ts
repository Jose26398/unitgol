import type { Season } from "../../types";
import { supabase } from "../supabase";

export class SeasonRepository {
	async addSeason(
		season: Omit<Season, "id">,
		teamId: string | null,
	): Promise<string> {
		if (!teamId) throw new Error("Team not authenticated");

		const { data, error } = await supabase
			.from("seasons")
			.insert({
				name: season.name,
				start_date: season.startDate,
				end_date: season.endDate || null,
				team_id: teamId,
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
		// First, unlink players from this season
		const { error: playersError } = await supabase
			.from("players")
			.update({ season_id: null })
			.eq("season_id", id);

		if (playersError) throw playersError;

		// Then delete the season
		const { error } = await supabase.from("seasons").delete().eq("id", id);

		if (error) throw error;
	}

	async getAllSeasons(teamId: string | null): Promise<Season[]> {
		if (!teamId) throw new Error("Team not authenticated");

		const { data, error } = await supabase
			.from("seasons")
			.select("*")
			.eq("team_id", teamId)
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
}
