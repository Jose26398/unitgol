import { describe, expect, it } from "vitest";
import {
	type AchievementContext,
	getUnlockedAchievements,
} from "@/features/players/utils/achievements";
import type { Match, Player } from "@/types";

const player: Player = {
	id: "player-1",
	name: "Jugador",
	matches: 10,
	wins: 3,
	losses: 2,
	goals: 10,
	assists: 5,
};

function match(
	id: string,
	date: string,
	teamAScore: number,
	teamBScore: number,
	goals: Match["goals"] = [],
): Match {
	return {
		id,
		date,
		seasonId: "season-1",
		teamA: { players: [player], score: teamAScore },
		teamB: { players: [], score: teamBScore },
		goals,
	};
}

function context(
	overrides: Partial<AchievementContext> = {},
): AchievementContext {
	return {
		player,
		players: [player],
		matches: [],
		...overrides,
	};
}

describe("getUnlockedAchievements", () => {
	it("unlocks achievements from player totals and a match performance", () => {
		const fiveGoals = Array.from({ length: 5 }, (_, index) => ({
			playerId: player.id,
			minute: index + 1,
		}));

		expect(
			getUnlockedAchievements(
				context({
					matches: [match("five-goals", "2026-01-01", 5, 0, fiveGoals)],
				}),
			).map((achievement) => achievement.id),
		).toEqual(["sniper", "goat", "villain"]);
	});

	it("unlocks a winning streak in chronological order", () => {
		const matches = [
			match("third", "2026-01-03", 2, 0),
			match("first", "2026-01-01", 1, 0),
			match("second", "2026-01-02", 3, 1),
		];

		expect(
			getUnlockedAchievements(context({ matches })).some(
				(achievement) => achievement.id === "on-fire",
			),
		).toBe(true);
	});

	it("does not count wins separated by a loss", () => {
		const matches = [
			match("first", "2026-01-01", 1, 0),
			match("third", "2026-01-02", 3, 0),
			match("second", "2026-01-03", 2, 0),
			match("loss", "2026-01-04", 0, 1),
			match("first", "2026-01-05", 1, 0),
		];

		expect(
			getUnlockedAchievements(context({ matches })).some(
				(achievement) => achievement.id === "on-fire",
			),
		).toBe(false);
	});

	it("gives ranking achievements to tied players", () => {
		const tiedPlayer = { ...player, id: "player-2", name: "Empatado" };
		const achievements = getUnlockedAchievements(
			context({ players: [player, tiedPlayer] }),
		);

		expect(achievements.map((achievement) => achievement.id)).toContain("goat");
		expect(achievements.map((achievement) => achievement.id)).toContain(
			"villain",
		);
	});

	it("unlocks El cono only for ten matches without goals", () => {
		const conePlayer = { ...player, goals: 0 };

		expect(
			getUnlockedAchievements(context({ player: conePlayer })).some(
				(achievement) => achievement.id === "cone",
			),
		).toBe(true);
	});

	it("does not unlock match achievements from another season when filtered by the caller", () => {
		const otherSeasonMatch = {
			...match("other-season", "2026-01-01", 5, 0),
			seasonId: "season-2",
		};

		expect(
			getUnlockedAchievements(context({ matches: [] })).some(
				(achievement) => achievement.id === "sniper",
			),
		).toBe(false);
		expect(otherSeasonMatch.seasonId).toBe("season-2");
	});

	it("unlocks the new activity and participation achievements", () => {
		const allRounderMatch = match("all-rounder", "2026-01-01", 2, 0, [
			{ playerId: player.id, minute: 1, assistById: player.id },
		]);
		const activePlayer = { ...player, matches: 20, goals: 1, assists: 1 };
		const achievements = getUnlockedAchievements(
			context({ player: activePlayer, matches: [allRounderMatch] }),
		);

		expect(achievements.map((achievement) => achievement.id)).toContain(
			"all-rounder",
		);
		expect(achievements.map((achievement) => achievement.id)).toContain(
			"consistent",
		);
	});

	it("unlocks Veteran for the player with the most matches over 15", () => {
		const veteran = { ...player, matches: 16 };
		const achievements = getUnlockedAchievements(
			context({
				player: veteran,
				players: [veteran, { ...player, id: "other", matches: 15 }],
			}),
		);

		expect(achievements.map((achievement) => achievement.id)).toContain(
			"veteran",
		);
	});

	it("unlocks Invicto after five recent matches without a loss", () => {
		const unbeatenMatches = Array.from({ length: 5 }, (_, index) =>
			match(`unbeaten-${index}`, `2026-01-0${index + 1}`, 1, 0),
		);

		expect(
			getUnlockedAchievements(context({ matches: unbeatenMatches })).some(
				(achievement) => achievement.id === "unbeaten",
			),
		).toBe(true);
	});

	it("unlocks A tu ritmo when the first goal arrives after ten matches", () => {
		const matches = Array.from({ length: 11 }, (_, index) =>
			match(
				`slow-${index}`,
				`2026-02-${String(index + 1).padStart(2, "0")}`,
				1,
				0,
				index === 10 ? [{ playerId: player.id, minute: 1 }] : [],
			),
		);
		const slowStarter = { ...player, goals: 1 };

		expect(
			getUnlockedAchievements(context({ player: slowStarter, matches })).some(
				(achievement) => achievement.id === "slow-starter",
			),
		).toBe(true);
	});

	it("unlocks Virgin only without goals or assists", () => {
		const virgin = { ...player, goals: 0, assists: 0 };

		expect(
			getUnlockedAchievements(context({ player: virgin })).some(
				(achievement) => achievement.id === "virgin",
			),
		).toBe(true);
	});
});
