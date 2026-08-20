import { describe, expect, it } from "vitest";
import { computeMatchStats, getMatchOutcome } from "@/db/matchStats";
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
			players: [makePlayer("a1", "A1"), makePlayer("a2", "A2")],
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

describe("getMatchOutcome", () => {
	it("detects a team A win", () => {
		expect(getMatchOutcome(makeMatch())).toEqual({
			teamAWon: true,
			teamBWon: false,
		});
	});

	it("detects a team B win", () => {
		const match = makeMatch({
			teamA: { ...makeMatch().teamA, score: 1 },
			teamB: { ...makeMatch().teamB, score: 3 },
		});
		expect(getMatchOutcome(match)).toEqual({
			teamAWon: false,
			teamBWon: true,
		});
	});

	it("detects a draw", () => {
		const match = makeMatch({
			teamA: { ...makeMatch().teamA, score: 2 },
			teamB: { ...makeMatch().teamB, score: 2 },
		});
		expect(getMatchOutcome(match)).toEqual({
			teamAWon: false,
			teamBWon: false,
		});
	});
});

describe("computeMatchStats", () => {
	it("computes goals, assists, wins and losses with sign +1", () => {
		const match = makeMatch({
			goals: [
				{ playerId: "a1", minute: 5 },
				{ playerId: "a1", minute: 20 },
				{ playerId: "b1", minute: 30, assistById: "a2" },
			],
		});

		const deltas = computeMatchStats(match, 1);

		expect(deltas.find((d) => d.playerId === "a1")?.stats).toEqual({
			matches: 1,
			wins: 1,
			losses: 0,
			goals: 2,
			assists: 0,
		});
		expect(deltas.find((d) => d.playerId === "a2")?.stats).toEqual({
			matches: 1,
			wins: 1,
			losses: 0,
			goals: 0,
			assists: 1,
		});
		expect(deltas.find((d) => d.playerId === "b1")?.stats).toEqual({
			matches: 1,
			wins: 0,
			losses: 1,
			goals: 1,
			assists: 0,
		});
	});

	it("inverts stats with sign -1 (subtraction)", () => {
		const deltas = computeMatchStats(makeMatch(), -1);

		// The source computes -0 for absent stats; normalize to 0 before comparing.
		const normalize = (d: Partial<Player>) => ({
			matches: d.matches || 0,
			wins: d.wins || 0,
			losses: d.losses || 0,
			goals: d.goals || 0,
			assists: d.assists || 0,
		});

		expect(
			normalize(
				deltas.find((d) => d.playerId === "a1")?.stats ?? {
					matches: 0,
					wins: 0,
					losses: 0,
					goals: 0,
					assists: 0,
				},
			),
		).toEqual({
			matches: -1,
			wins: -1,
			losses: 0,
			goals: 0,
			assists: 0,
		});
		expect(
			normalize(
				deltas.find((d) => d.playerId === "b1")?.stats ?? {
					matches: 0,
					wins: 0,
					losses: 0,
					goals: 0,
					assists: 0,
				},
			),
		).toEqual({
			matches: -1,
			wins: 0,
			losses: -1,
			goals: 0,
			assists: 0,
		});
	});

	it("gives no wins or losses on a draw", () => {
		const draw = makeMatch({
			teamA: { ...makeMatch().teamA, score: 1 },
			teamB: { ...makeMatch().teamB, score: 1 },
		});

		const deltas = computeMatchStats(draw, 1);

		expect(deltas.find((d) => d.playerId === "a1")?.stats).toEqual({
			matches: 1,
			wins: 0,
			losses: 0,
			goals: 0,
			assists: 0,
		});
		expect(deltas.find((d) => d.playerId === "b1")?.stats).toEqual({
			matches: 1,
			wins: 0,
			losses: 0,
			goals: 0,
			assists: 0,
		});
	});
});
