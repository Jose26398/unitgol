import type { Match } from "../../types";
import { mapMatchWithRelations } from "../mappers";
import { computeMatchStats } from "../matchStats";
import { supabase } from "../supabase";
import type { MatchWithRelations } from "../types";
import type { PlayerRepository } from "./PlayerRepository";

export class MatchRepository {
	constructor(private playerRepo: PlayerRepository) {}

	async addMatch(
		match: Omit<Match, "id">,
		teamId: string | null,
	): Promise<string> {
		console.log("addMatch called with match data:", match);

		if (!teamId) throw new Error("Team not authenticated");

		const { data: matchData, error: matchError } = await supabase
			.from("matches")
			.insert({
				date: match.date,
				season_id: match.seasonId || null,
				team_a_score: match.teamA.score,
				team_b_score: match.teamB.score,
				team_id: teamId,
			})
			.select()
			.single();

		if (matchError) throw matchError;

		const matchId = matchData.id;
		console.log("Match created with id:", matchId);

		const matchPlayers = [
			...match.teamA.players.map((player) => ({
				match_id: matchId,
				player_id: player.id,
				team: "A" as const,
			})),
			...match.teamB.players.map((player) => ({
				match_id: matchId,
				player_id: player.id,
				team: "B" as const,
			})),
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
					minute: goal.minute,
				})),
			);

			if (goalsError) throw goalsError;
		}

		// Update player stats
		const fullMatch: Match = {
			id: matchId,
			date: match.date,
			seasonId: match.seasonId,
			teamA: match.teamA,
			teamB: match.teamB,
			goals: match.goals,
		};
		console.log("Calling addMatchStats for match:", matchId);
		await this.addMatchStats(fullMatch);

		return matchId;
	}

	async getAllMatches(teamId: string | null): Promise<Match[]> {
		if (!teamId) throw new Error("Team not authenticated");

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
			.eq("team_id", teamId)
			.order("date", { ascending: false });

		if (matchesError) throw matchesError;

		return matches.map((match: MatchWithRelations) =>
			mapMatchWithRelations(match),
		);
	}

	async deleteMatch(id: string): Promise<void> {
		console.log("deleteMatch called for match:", id);

		// Get the match to subtract stats
		const match = await this.getMatchById(id);
		console.log("Match retrieved for deletion:", match);

		if (match) {
			console.log("Calling subtractMatchStats for match:", id);
			await this.subtractMatchStats(match);
		}

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
		const { error } = await supabase.from("matches").delete().eq("id", id);

		if (error) throw error;

		console.log("Match deleted successfully:", id);
	}

	async editMatch(match: Match): Promise<void> {
		console.log("editMatch called with match:", match);

		// Get the current match to calculate stats to subtract
		const currentMatch = await this.getMatchById(match.id);
		console.log("currentMatch retrieved:", currentMatch);
		if (!currentMatch) throw new Error("Match not found");

		// Calculate and subtract old stats
		if (currentMatch) {
			console.log("subtracting stats for currentMatch");
			await this.subtractMatchStats(currentMatch);
		}

		// Update match
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
				team: "A" as const,
			})),
			...match.teamB.players.map((player) => ({
				match_id: match.id,
				player_id: player.id,
				team: "B" as const,
			})),
		];

		const { error: playersError } = await supabase
			.from("match_players")
			.insert(matchPlayers);

		if (playersError) throw playersError;

		// Insert new goals
		if (match.goals.length > 0) {
			const { error: goalsError } = await supabase.from("goals").insert(
				match.goals.map((goal) => ({
					match_id: match.id,
					player_id: goal.playerId,
					assist_by_id: goal.assistById || null,
					minute: goal.minute,
				})),
			);

			if (goalsError) throw goalsError;
		}

		// Calculate and add new stats
		console.log("adding stats for new match");
		await this.addMatchStats(match);
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

		return mapMatchWithRelations(match as MatchWithRelations);
	}

	private async addMatchStats(match: Match): Promise<void> {
		console.log(
			"addMatchStats called for match:",
			match.id,
			"teamA score:",
			match.teamA.score,
			"teamB score:",
			match.teamB.score,
		);

		for (const { playerId, stats } of computeMatchStats(match, 1)) {
			console.log("Updating player:", playerId, "with stats:", stats);
			await this.playerRepo.updatePlayerStats(playerId, stats, match.seasonId);
		}
	}

	private async subtractMatchStats(match: Match): Promise<void> {
		console.log(
			"subtractMatchStats called for match:",
			match.id,
			"teamA score:",
			match.teamA.score,
			"teamB score:",
			match.teamB.score,
		);

		for (const { playerId, stats } of computeMatchStats(match, -1)) {
			console.log("Subtracting player:", playerId, "with stats:", stats);
			await this.playerRepo.updatePlayerStats(playerId, stats, match.seasonId);
		}
	}
}
