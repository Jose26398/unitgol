import type { Match, Player } from "../types";

export interface MatchStatDelta {
	playerId: string;
	stats: Partial<Player>;
}

export function getMatchOutcome(match: Match) {
	const teamAWon = match.teamA.score > match.teamB.score;
	const teamBWon = match.teamB.score > match.teamA.score;
	return { teamAWon, teamBWon };
}

export function computeMatchStats(
	match: Match,
	sign: 1 | -1,
): MatchStatDelta[] {
	const { teamAWon, teamBWon } = getMatchOutcome(match);

	const playerGoals = new Map<string, number>();
	const playerAssists = new Map<string, number>();

	match.goals.forEach((goal) => {
		playerGoals.set(goal.playerId, (playerGoals.get(goal.playerId) || 0) + 1);
		if (goal.assistById) {
			playerAssists.set(
				goal.assistById,
				(playerAssists.get(goal.assistById) || 0) + 1,
			);
		}
	});

	const deltas: MatchStatDelta[] = [];

	for (const player of match.teamA.players) {
		deltas.push({
			playerId: player.id,
			stats: {
				matches: sign,
				wins: teamAWon ? sign : 0,
				losses: teamBWon ? sign : 0,
				goals: sign * (playerGoals.get(player.id) || 0),
				assists: sign * (playerAssists.get(player.id) || 0),
			},
		});
	}

	for (const player of match.teamB.players) {
		deltas.push({
			playerId: player.id,
			stats: {
				matches: sign,
				wins: teamBWon ? sign : 0,
				losses: teamAWon ? sign : 0,
				goals: sign * (playerGoals.get(player.id) || 0),
				assists: sign * (playerAssists.get(player.id) || 0),
			},
		});
	}

	return deltas;
}
