import type { Match } from "@/types";

export interface HeadToHeadDuel {
	matchId: string;
	date: string;
	scoreA: number;
	scoreB: number;
	winnerId: string | null;
}

export interface HeadToHeadResult {
	duels: number;
	winsA: number;
	winsB: number;
	draws: number;
	duelList: HeadToHeadDuel[];
}

export function computeHeadToHead(
	matches: Match[],
	playerIdA: string,
	playerIdB: string,
): HeadToHeadResult {
	const result: HeadToHeadResult = {
		duels: 0,
		winsA: 0,
		winsB: 0,
		draws: 0,
		duelList: [],
	};

	if (!playerIdA || !playerIdB || playerIdA === playerIdB) return result;

	for (const match of matches) {
		let scoreA: number;
		let scoreB: number;

		if (
			match.teamA.players.some((p) => p.id === playerIdA) &&
			match.teamB.players.some((p) => p.id === playerIdB)
		) {
			scoreA = match.teamA.score;
			scoreB = match.teamB.score;
		} else if (
			match.teamA.players.some((p) => p.id === playerIdB) &&
			match.teamB.players.some((p) => p.id === playerIdA)
		) {
			scoreA = match.teamB.score;
			scoreB = match.teamA.score;
		} else {
			continue;
		}

		result.duels += 1;
		if (scoreA > scoreB) {
			result.winsA += 1;
			result.duelList.push({
				matchId: match.id,
				date: match.date,
				scoreA,
				scoreB,
				winnerId: playerIdA,
			});
		} else if (scoreB > scoreA) {
			result.winsB += 1;
			result.duelList.push({
				matchId: match.id,
				date: match.date,
				scoreA,
				scoreB,
				winnerId: playerIdB,
			});
		} else {
			result.draws += 1;
			result.duelList.push({
				matchId: match.id,
				date: match.date,
				scoreA,
				scoreB,
				winnerId: null,
			});
		}
	}

	result.duelList.sort((a, b) => b.date.localeCompare(a.date));

	return result;
}
