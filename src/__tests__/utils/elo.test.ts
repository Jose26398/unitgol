import { describe, expect, it } from "vitest";
import type { Match, Player } from "@/types";
import { calculateEloRatings, getEloRating } from "@/utils/elo";

const player = (id: string): Player => ({
	id,
	name: id,
	matches: 0,
	wins: 0,
	losses: 0,
	goals: 0,
	assists: 0,
});

const match = (overrides: Partial<Match> = {}): Match => ({
	id: "match-1",
	date: "2026-01-01",
	seasonId: "season-1",
	teamA: { players: [player("a")], score: 1 },
	teamB: { players: [player("b")], score: 0 },
	goals: [],
	...overrides,
});

describe("calculateEloRatings", () => {
	it("calculates the rating of a player from the match history", () => {
		const ratings = calculateEloRatings([match()]);

		expect(getEloRating(ratings, "a")).toBe(1016);
	});

	it("starts players at 1000 and applies opposite deltas to a winning match", () => {
		const ratings = calculateEloRatings([match()]);

		expect(getEloRating(ratings, "a")).toBeCloseTo(1016);
		expect(getEloRating(ratings, "b")).toBeCloseTo(984);
	});

	it("keeps the base rating neutral in a draw and adds goal and assist bonuses", () => {
		const ratings = calculateEloRatings([
			match({
				teamA: { players: [player("a")], score: 2 },
				teamB: { players: [player("b")], score: 2 },
				goals: [
					{ playerId: "a", minute: 10, assistById: "b" },
					{ playerId: "a", minute: 20 },
				],
			}),
		]);

		expect(getEloRating(ratings, "a")).toBe(1020);
		expect(getEloRating(ratings, "b")).toBe(1005);
	});

	it("filters matches by season and processes them chronologically", () => {
		const ratings = calculateEloRatings([
			match({ id: "new", date: "2026-01-02" }),
			match({ id: "other-season", seasonId: "season-2" }),
			match({ id: "old", date: "2026-01-01" }),
		], "season-1");

		expect(getEloRating(ratings, "a")).toBeCloseTo(1030.53, 1);
		expect(getEloRating(ratings, "b")).toBeCloseTo(969.47, 1);
		expect(getEloRating(ratings, "unknown")).toBe(1000);
	});
});
