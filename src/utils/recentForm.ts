import type { Match, Player } from "@/types";

export type RecentFormResult = "win" | "draw" | "loss";

export const recentFormSymbols: Record<RecentFormResult, string> = {
	win: "🟢",
	draw: "🟡",
	loss: "🔴",
};

export interface RecentForm {
	results: RecentFormResult[];
	percentage: number | null;
}

function playerParticipates(match: Match, playerId: string) {
	return (
		match.teamA.players.some((player) => player.id === playerId) ||
		match.teamB.players.some((player) => player.id === playerId)
	);
}

function getResult(match: Match, playerId: string): RecentFormResult {
	const isTeamA = match.teamA.players.some((player) => player.id === playerId);
	const playerScore = isTeamA ? match.teamA.score : match.teamB.score;
	const opponentScore = isTeamA ? match.teamB.score : match.teamA.score;

	if (playerScore === opponentScore) return "draw";
	return playerScore > opponentScore ? "win" : "loss";
}

export function calculateRecentForm(
	player: Player,
	matches: Match[],
	seasonId: string | null,
): RecentForm {
	const recentMatches = matches
		.filter(
			(match) =>
				(!seasonId || match.seasonId === seasonId) &&
				playerParticipates(match, player.id),
		)
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, 5);

	const results = recentMatches.map((match) => getResult(match, player.id));
	if (results.length === 0) {
		return { results, percentage: null };
	}

	const weightedWins = results.reduce(
		(total, result) =>
			total + (result === "win" ? 1 : result === "draw" ? 0.5 : 0),
		0,
	);

	return {
		results,
		percentage: (weightedWins / results.length) * 100,
	};
}
