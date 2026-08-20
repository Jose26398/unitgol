import { describe, expect, it } from "vitest";
import { mapMatchWithRelations, mapPlayerRow } from "@/db/mappers";
import type { MatchWithRelations } from "@/db/types";

describe("mapPlayerRow", () => {
	it("maps a row with a season_id", () => {
		expect(
			mapPlayerRow({
				id: "1",
				name: "Alice",
				matches: 5,
				wins: 3,
				losses: 2,
				goals: 4,
				assists: 1,
				season_id: "s1",
			}),
		).toEqual({
			id: "1",
			name: "Alice",
			matches: 5,
			wins: 3,
			losses: 2,
			goals: 4,
			assists: 1,
			seasonId: "s1",
		});
	});

	it("leaves seasonId undefined when there is no season", () => {
		const player = mapPlayerRow({
			id: "1",
			name: "Alice",
			matches: 0,
			wins: 0,
			losses: 0,
			goals: 0,
			assists: 0,
			season_id: null,
		});
		expect(player.seasonId).toBeUndefined();
	});
});

describe("mapMatchWithRelations", () => {
	it("maps players per team and goals with assists", () => {
		const row: MatchWithRelations = {
			id: "m1",
			date: "2024-01-01",
			season_id: "s1",
			team_a_score: 2,
			team_b_score: 1,
			created_at: "2024-01-01",
			match_players: [
				{
					id: "mp1",
					match_id: "m1",
					player_id: "a1",
					team: "A",
					created_at: "2024-01-01",
					players: {
						id: "a1",
						name: "Alice",
						matches: 1,
						wins: 1,
						losses: 0,
						goals: 1,
						assists: 0,
						season_id: "s1",
						created_at: "2024-01-01",
					},
				},
				{
					id: "mp2",
					match_id: "m1",
					player_id: "b1",
					team: "B",
					created_at: "2024-01-01",
					players: {
						id: "b1",
						name: "Bob",
						matches: 1,
						wins: 0,
						losses: 1,
						goals: 0,
						assists: 1,
						season_id: null,
						created_at: "2024-01-01",
					},
				},
			],
			goals: [
				{
					id: "g1",
					match_id: "m1",
					player_id: "a1",
					assist_by_id: "b1",
					minute: 10,
					created_at: "2024-01-01",
				},
				{
					id: "g2",
					match_id: "m1",
					player_id: "b1",
					assist_by_id: null,
					minute: 44,
					created_at: "2024-01-01",
				},
			],
		};

		const match = mapMatchWithRelations(row);

		expect(match.seasonId).toBe("s1");
		expect(match.teamA.players).toHaveLength(1);
		expect(match.teamA.players[0].name).toBe("Alice");
		expect(match.teamA.score).toBe(2);
		expect(match.teamB.players).toHaveLength(1);
		expect(match.teamB.players[0].name).toBe("Bob");
		expect(match.goals).toEqual([
			{ playerId: "a1", minute: 10, assistById: "b1" },
			{ playerId: "b1", minute: 44, assistById: undefined },
		]);
	});
});
