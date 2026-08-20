import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "../../db/supabase";
import { SupabaseService } from "../../db/supabase-service";
import type { MockSupabaseFrom } from "../setup";

describe("SupabaseService - Players", () => {
	let service: SupabaseService;

	beforeEach(() => {
		service = new SupabaseService();
		service.setTeamId("a");
		vi.clearAllMocks();
	});

	it("should add a player", async () => {
		const mockSingle = vi.fn(() => ({
			data: { id: "player-id" },
			error: null,
		}));
		const mockSelect = vi.fn(() => ({ single: mockSingle }));
		const mockInsert = vi.fn(() => ({ select: mockSelect }));

		(supabase.from as unknown as MockSupabaseFrom).mockReturnValue({
			insert: mockInsert,
		});

		const playerId = await service.addPlayer(
			"hola",
			"ac798200-40df-4e6b-b2f3-e20e108ea816",
		);
		expect(playerId).toBe("player-id");
		expect(mockInsert).toHaveBeenCalledWith({
			name: "hola",
			matches: 0,
			wins: 0,
			losses: 0,
			goals: 0,
			assists: 0,
			season_id: "ac798200-40df-4e6b-b2f3-e20e108ea816",
			team_id: "a",
		});
	});

	it("should get all players", async () => {
		const mockData = [
			{
				id: "1",
				name: "hola",
				matches: 0,
				wins: 0,
				losses: 0,
				goals: 0,
				assists: 0,
				season_id: "ac798200-40df-4e6b-b2f3-e20e108ea816",
				seasons: null,
			},
			{
				id: "2",
				name: "adios",
				matches: 0,
				wins: 0,
				losses: 0,
				goals: 0,
				assists: 0,
				season_id: "ac798200-40df-4e6b-b2f3-e20e108ea816",
				seasons: null,
			},
			{
				id: "3",
				name: "buenas",
				matches: 0,
				wins: 0,
				losses: 0,
				goals: 0,
				assists: 0,
				season_id: "ac798200-40df-4e6b-b2f3-e20e108ea816",
				seasons: null,
			},
			{
				id: "4",
				name: "tardes",
				matches: 0,
				wins: 0,
				losses: 0,
				goals: 0,
				assists: 0,
				season_id: "ac798200-40df-4e6b-b2f3-e20e108ea816",
				seasons: null,
			},
		];

		const mockEq = vi.fn(() => ({ data: mockData, error: null }));
		const mockSelect = vi.fn(() => ({ eq: mockEq }));

		(supabase.from as unknown as MockSupabaseFrom).mockReturnValue({
			select: mockSelect,
		});

		const players = await service.getAllPlayers();
		expect(players).toHaveLength(4);
		expect(players.map((p) => p.name)).toEqual([
			"hola",
			"adios",
			"buenas",
			"tardes",
		]);
		expect(mockEq).toHaveBeenCalledWith("team_id", "a");
	});

	it("should update player without affecting stats", async () => {
		const mockUpdate = vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }));

		(supabase.from as unknown as MockSupabaseFrom).mockReturnValue({
			update: mockUpdate,
		});

		await expect(
			service.updatePlayer("player-id", { name: "Nuevo Nombre" }),
		).resolves.toBeUndefined();
		expect(mockUpdate).toHaveBeenCalledWith({
			name: "Nuevo Nombre",
			season_id: undefined,
		});
	});

	it("should update player with seasonId correctly", async () => {
		const mockUpdate = vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }));

		(supabase.from as unknown as MockSupabaseFrom).mockReturnValue({
			update: mockUpdate,
		});

		await expect(
			service.updatePlayer("player-id", {
				name: "Nuevo Nombre",
				seasonId: "season-123",
			}),
		).resolves.toBeUndefined();
		expect(mockUpdate).toHaveBeenCalledWith({
			name: "Nuevo Nombre",
			season_id: "season-123",
		});
	});

	it("should delete player", async () => {
		const mockDelete = vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }));

		(supabase.from as unknown as MockSupabaseFrom).mockReturnValue({
			delete: mockDelete,
		});

		await expect(service.deletePlayer("player-id")).resolves.toBeUndefined();
	});

	it("should update player stats correctly", async () => {
		const mockSingle = vi.fn(() => ({
			data: {
				id: "player-id",
				matches: 5,
				wins: 3,
				losses: 2,
				goals: 10,
				assists: 5,
				season_id: null,
			},
			error: null,
		}));
		const mockEq = vi.fn(() => ({ single: mockSingle }));
		const mockSelect = vi.fn(() => ({ eq: mockEq }));
		const mockUpdate = vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }));

		(supabase.from as unknown as MockSupabaseFrom).mockImplementation(
			(table: string) => {
				if (table === "players") {
					return {
						select: mockSelect,
						update: mockUpdate,
					};
				}
				return {};
			},
		);

		await service.updatePlayerStats(
			"player-id",
			{ matches: 1, wins: 1, goals: 2 },
			"ac798200-40df-4e6b-b2f3-e20e108ea816",
		);

		expect(mockUpdate).toHaveBeenCalledWith({
			matches: 6,
			wins: 4,
			losses: 2,
			goals: 12,
			assists: 5,
			season_id: "ac798200-40df-4e6b-b2f3-e20e108ea816",
		});
	});
});
