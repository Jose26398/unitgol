import type { Match } from "@/types";

export const INITIAL_ELO = 1000;
export const DEFAULT_ELO_K_FACTOR = 32;

export type RatingMode = "score" | "elo";

export interface EloOptions {
	initialRating?: number;
	kFactor?: number;
	goalFactor?: number;
	assistFactor?: number;
}

export type EloRatings = Map<string, number>;

const getExpectedScore = (teamRating: number, opponentRating: number) =>
	1 / (1 + 10 ** ((opponentRating - teamRating) / 400));

const getMatchResult = (teamScore: number, opponentScore: number) => {
	if (teamScore === opponentScore) return 0.5;
	return teamScore > opponentScore ? 1 : 0;
};

const getUniquePlayerIds = (matchPlayers: Match["teamA"]["players"]) =>
	[...new Set(matchPlayers.map((player) => player.id))];

const getEventBonuses = (
	match: Match,
	playerIds: Set<string>,
	goalFactor: number,
	assistFactor: number,
) => {
	const bonuses = new Map<string, number>();

	for (const goal of match.goals) {
		if (playerIds.has(goal.playerId)) {
			bonuses.set(
				goal.playerId,
				(bonuses.get(goal.playerId) ?? 0) + goalFactor,
			);
		}
		if (goal.assistById && playerIds.has(goal.assistById)) {
			bonuses.set(
				goal.assistById,
				(bonuses.get(goal.assistById) ?? 0) + assistFactor,
			);
		}
	}

	return bonuses;
};

/** Rebuilds player ratings from the matches in chronological order. */
export const calculateEloRatings = (
	matches: Match[],
	seasonId: string | null = null,
	options: EloOptions = {},
): EloRatings => {
	const initialRating = options.initialRating ?? INITIAL_ELO;
	const kFactor = options.kFactor ?? DEFAULT_ELO_K_FACTOR;
	const goalFactor = options.goalFactor ?? 10;
	const assistFactor = options.assistFactor ?? 5;
	const ratings: EloRatings = new Map();

	const seasonMatches = matches
		.filter((match) => seasonId === null || match.seasonId === seasonId)
		.slice()
		.sort((a, b) =>
			a.date === b.date
				? a.id.localeCompare(b.id)
				: a.date.localeCompare(b.date),
		);

	const getRating = (playerId: string) => {
		if (!ratings.has(playerId)) ratings.set(playerId, initialRating);
		return ratings.get(playerId) ?? initialRating;
	};

	for (const match of seasonMatches) {
		const teamAIds = getUniquePlayerIds(match.teamA.players);
		const teamBIds = getUniquePlayerIds(match.teamB.players);
		if (teamAIds.length === 0 || teamBIds.length === 0) continue;

		const teamARating =
			teamAIds.reduce((sum, playerId) => sum + getRating(playerId), 0) /
			teamAIds.length;
		const teamBRating =
			teamBIds.reduce((sum, playerId) => sum + getRating(playerId), 0) /
			teamBIds.length;
		const expectedA = getExpectedScore(teamARating, teamBRating);
		const expectedB = 1 - expectedA;
		const resultA = getMatchResult(match.teamA.score, match.teamB.score);
		const resultB = 1 - resultA;
		const bonuses = getEventBonuses(
			match,
			new Set([...teamAIds, ...teamBIds]),
			goalFactor,
			assistFactor,
		);
		const baseDeltaA =
			resultA === 0.5 ? 0 : kFactor * (resultA - expectedA);
		const baseDeltaB =
			resultB === 0.5 ? 0 : kFactor * (resultB - expectedB);

		for (const playerId of teamAIds) {
			ratings.set(
				playerId,
				getRating(playerId) + baseDeltaA + (bonuses.get(playerId) ?? 0),
			);
		}
		for (const playerId of teamBIds) {
			ratings.set(
				playerId,
				getRating(playerId) + baseDeltaB + (bonuses.get(playerId) ?? 0),
			);
		}
	}

	return ratings;
};

export const getEloRating = (
	ratings: EloRatings | null | undefined,
	playerId: string,
) => ratings?.get(playerId) ?? INITIAL_ELO;
