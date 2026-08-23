import { describe, expect, it } from "vitest";
import { computeHeadToHead } from "@/features/players/utils/headToHead";
import type { Match, Player } from "@/types";

function makePlayer(id: string, name: string): Player {
	return { id, name, matches: 0, wins: 0, losses: 0, goals: 0, assists: 0 };
}

function makeMatch(overrides: Partial<Match> = {}): Match {
	return {
		id: "m1",
		date: "2024-01-01",
		seasonId: "s1",
		teamA: {
			players: [makePlayer("a1", "A1")],
			score: 2,
		},
		teamB: {
			players: [makePlayer("b1", "B1")],
			score: 1,
		},
		goals: [],
		...overrides,
	};
}

describe("computeHeadToHead", () => {
	it("returns zeros for empty matches", () => {
		const result = computeHeadToHead([], "a1", "b1");
		expect(result).toEqual({
			duels: 0,
			winsA: 0,
			winsB: 0,
			draws: 0,
			duelList: [],
		});
	});

	it("counts a win for player A when A's team scores higher", () => {
		const result = computeHeadToHead([makeMatch()], "a1", "b1");
		expect(result.duels).toBe(1);
		expect(result.winsA).toBe(1);
		expect(result.winsB).toBe(0);
		expect(result.draws).toBe(0);
	});

	it("counts a win for player B when B's team scores higher", () => {
		const match = makeMatch({
			teamA: { players: [makePlayer("a1", "A1")], score: 0 },
			teamB: { players: [makePlayer("b1", "B1")], score: 3 },
		});
		const result = computeHeadToHead([match], "a1", "b1");
		expect(result.duels).toBe(1);
		expect(result.winsA).toBe(0);
		expect(result.winsB).toBe(1);
	});

	it("counts a draw on equal scores", () => {
		const match = makeMatch({
			teamA: { players: [makePlayer("a1", "A1")], score: 2 },
			teamB: { players: [makePlayer("b1", "B1")], score: 2 },
		});
		const result = computeHeadToHead([match], "a1", "b1");
		expect(result.duels).toBe(1);
		expect(result.draws).toBe(1);
		expect(result.duelList[0].winnerId).toBeNull();
	});

	it("orients scores from player A perspective when B was in teamA", () => {
		const match = makeMatch({
			teamA: { players: [makePlayer("b1", "B1")], score: 4 },
			teamB: { players: [makePlayer("a1", "A1")], score: 1 },
		});
		const result = computeHeadToHead([match], "a1", "b1");
		expect(result.winsB).toBe(1);
		expect(result.duelList[0]).toMatchObject({
			matchId: "m1",
			scoreA: 1,
			scoreB: 4,
			winnerId: "b1",
		});
	});

	it("ignores matches where both players are teammates", () => {
		const match = makeMatch({
			teamA: {
				players: [makePlayer("a1", "A1"), makePlayer("b1", "B1")],
				score: 5,
			},
			teamB: { players: [makePlayer("c1", "C1")], score: 1 },
		});
		const result = computeHeadToHead([match], "a1", "b1");
		expect(result.duels).toBe(0);
	});

	it("ignores matches where only one of the two plays", () => {
		const match = makeMatch({
			teamB: { players: [makePlayer("c1", "C1")], score: 1 },
		});
		const result = computeHeadToHead([match], "a1", "b1");
		expect(result.duels).toBe(0);
	});

	it("aggregates multiple duels and sorts the list newest first", () => {
		const matches = [
			makeMatch({ id: "m-old", date: "2024-01-01" }),
			makeMatch({
				id: "m-new",
				date: "2024-03-01",
				teamA: { players: [makePlayer("a1", "A1")], score: 2 },
				teamB: { players: [makePlayer("b1", "B1")], score: 2 },
			}),
			makeMatch({
				id: "m-mid",
				date: "2024-02-01",
				teamA: { players: [makePlayer("a1", "A1")], score: 0 },
				teamB: { players: [makePlayer("b1", "B1")], score: 2 },
			}),
		];
		const result = computeHeadToHead(matches, "a1", "b1");
		expect(result.duels).toBe(3);
		expect(result.winsA).toBe(1);
		expect(result.winsB).toBe(1);
		expect(result.draws).toBe(1);
		expect(result.duelList.map((d) => d.matchId)).toEqual([
			"m-new",
			"m-mid",
			"m-old",
		]);
	});

	it("returns zeros for missing or identical player ids", () => {
		expect(computeHeadToHead([makeMatch()], "", "b1").duels).toBe(0);
		expect(computeHeadToHead([makeMatch()], "a1", "").duels).toBe(0);
		expect(computeHeadToHead([makeMatch()], "a1", "a1").duels).toBe(0);
	});
});
