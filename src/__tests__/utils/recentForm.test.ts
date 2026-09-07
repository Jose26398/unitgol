import { describe, expect, it } from "vitest";
import type { Match, Player } from "@/types";
import { calculateRecentForm } from "@/utils/recentForm";

const player: Player = {
	id: "player-1",
	name: "Jugador",
	matches: 0,
	wins: 0,
	losses: 0,
	goals: 0,
	assists: 0,
};

function match(
	id: string,
	date: string,
	teamAScore: number,
	teamBScore: number,
	seasonId = "season-1",
): Match {
	return {
		id,
		date,
		seasonId,
		teamA: { players: [player], score: teamAScore },
		teamB: { players: [], score: teamBScore },
		goals: [],
	};
}

describe("calculateRecentForm", () => {
	it("orders results from newest to oldest and limits them to five", () => {
		const matches = [
			match("old", "2026-01-01", 1, 0),
			match("newest", "2026-01-06", 1, 0),
			match("middle", "2026-01-03", 0, 1),
			match("new", "2026-01-05", 0, 0),
			match("fourth", "2026-01-04", 1, 0),
			match("fifth", "2026-01-02", 0, 1),
		];

		expect(calculateRecentForm(player, matches, "season-1")).toEqual({
			results: ["win", "draw", "win", "loss", "loss"],
			percentage: 50,
		});
	});

	it("filters by player and season", () => {
		const otherPlayer = { ...player, id: "player-2" };
		const otherPlayerMatch = match("other", "2026-01-04", 1, 0);
		otherPlayerMatch.teamA.players = [otherPlayer];

		expect(
			calculateRecentForm(
				player,
				[
					match("included", "2026-01-03", 1, 0),
					match("wrong-season", "2026-01-04", 1, 0, "season-2"),
					otherPlayerMatch,
				],
				"season-1",
			),
		).toEqual({ results: ["win"], percentage: 100 });
	});

	it("returns no percentage when the player has no matches", () => {
		expect(calculateRecentForm(player, [], "season-1")).toEqual({
			results: [],
			percentage: null,
		});
	});
});
