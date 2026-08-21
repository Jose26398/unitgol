import type { Match, Player } from "../types";
import type { GoalRow, MatchWithRelations } from "./types";

export function mapPlayerRow(player: {
	id: string;
	name: string;
	matches: number;
	wins: number;
	losses: number;
	goals: number;
	assists: number;
	season_id: string | null;
}): Player {
	return {
		id: player.id,
		name: player.name,
		matches: player.matches,
		wins: player.wins,
		losses: player.losses,
		goals: player.goals,
		assists: player.assists,
		seasonId: player.season_id || undefined,
	};
}

export function mapMatchWithRelations(match: MatchWithRelations): Match {
	const teamAPlayers = match.match_players
		.filter((mp) => mp.team === "A" && mp.players)
		.map((mp) => mapPlayerRow(mp.players));

	const teamBPlayers = match.match_players
		.filter((mp) => mp.team === "B" && mp.players)
		.map((mp) => mapPlayerRow(mp.players));

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
