import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "../../db/supabase";
import { SupabaseService } from "../../db/supabase-service";
import type { MockSupabaseFrom } from "../setup";

describe("SupabaseService - Error Handling", () => {
	let service: SupabaseService;

	beforeEach(() => {
		service = new SupabaseService();
		vi.clearAllMocks();
	});

	it("should throw error if team not authenticated for addPlayer", async () => {
		const serviceWithoutTeam = new SupabaseService();

		await expect(serviceWithoutTeam.addPlayer("test")).rejects.toThrow(
			"Team not authenticated",
		);
	});

	it("should throw error on DB error", async () => {
		service.setTeamId("a"); // Set team ID to avoid authentication error
		const mockInsert = vi.fn(() => ({
			select: vi.fn(() => ({
				single: vi.fn(() => ({ data: null, error: new Error("DB Error") })),
			})),
		}));

		(supabase.from as unknown as MockSupabaseFrom).mockReturnValue({
			insert: mockInsert,
		});

		await expect(service.addPlayer("test")).rejects.toThrow("DB Error");
	});
});

describe("SupabaseService - Auth errors", () => {
	let service: SupabaseService;

	beforeEach(() => {
		service = new SupabaseService();
		vi.clearAllMocks();
	});

	it("should throw for player methods without a team", async () => {
		await expect(service.addPlayer("test")).rejects.toThrow(
			"Team not authenticated",
		);
		await expect(service.getAllPlayers()).rejects.toThrow(
			"Team not authenticated",
		);
	});

	it("should throw for match methods without a team", async () => {
		await expect(
			service.addMatch({
				date: "2024-01-01",
				teamA: { players: [], score: 0 },
				teamB: { players: [], score: 0 },
				goals: [],
			}),
		).rejects.toThrow("Team not authenticated");
		await expect(service.getAllMatches()).rejects.toThrow(
			"Team not authenticated",
		);
	});

	it("should throw for season methods without a team", async () => {
		await expect(
			service.addSeason({ name: "S", startDate: "2024-01-01" }),
		).rejects.toThrow("Team not authenticated");
		await expect(service.getAllSeasons()).rejects.toThrow(
			"Team not authenticated",
		);
	});

	it("should throw for settings methods without a team", async () => {
		await expect(service.getSetting("key")).rejects.toThrow(
			"Team not authenticated",
		);
		await expect(service.setSetting("key", 10)).rejects.toThrow(
			"Team not authenticated",
		);
	});
});

describe("SupabaseService - DB errors", () => {
	let service: SupabaseService;

	beforeEach(() => {
		service = new SupabaseService();
		service.setTeamId("a");
		vi.clearAllMocks();
	});

	it("should throw when getting players fails", async () => {
		const mockEq = vi.fn(() => ({ data: null, error: new Error("DB Error") }));
		const mockSelect = vi.fn(() => ({ eq: mockEq }));

		(supabase.from as unknown as MockSupabaseFrom).mockReturnValue({
			select: mockSelect,
		});

		await expect(service.getAllPlayers()).rejects.toThrow("DB Error");
	});

	it("should throw when deleting a player fails", async () => {
		const mockDelete = vi.fn(() => ({
			eq: vi.fn(() => ({ error: new Error("DB Error") })),
		}));

		(supabase.from as unknown as MockSupabaseFrom).mockReturnValue({
			delete: mockDelete,
		});

		await expect(service.deletePlayer("id")).rejects.toThrow("DB Error");
	});

	it("should throw when updating a season fails", async () => {
		const mockUpdate = vi.fn(() => ({
			eq: vi.fn(() => ({ error: new Error("DB Error") })),
		}));

		(supabase.from as unknown as MockSupabaseFrom).mockReturnValue({
			update: mockUpdate,
		});

		await expect(
			service.updateSeason({
				id: "id",
				name: "S",
				startDate: "2024-01-01",
			}),
		).rejects.toThrow("DB Error");
	});

	it("should throw when deleting a season fails", async () => {
		const mockUpdatePlayers = vi.fn(() => ({
			eq: vi.fn(() => ({ error: new Error("DB Error") })),
		}));

		(supabase.from as unknown as MockSupabaseFrom).mockReturnValue({
			update: mockUpdatePlayers,
		});

		await expect(service.deleteSeason("id")).rejects.toThrow("DB Error");
	});

	it("should throw when adding a match fails", async () => {
		const mockInsert = vi.fn(() => ({
			select: vi.fn(() => ({
				single: vi.fn(() => ({ data: null, error: new Error("DB Error") })),
			})),
		}));

		(supabase.from as unknown as MockSupabaseFrom).mockReturnValue({
			insert: mockInsert,
		});

		await expect(
			service.addMatch({
				date: "2024-01-01",
				teamA: { players: [], score: 0 },
				teamB: { players: [], score: 0 },
				goals: [],
			}),
		).rejects.toThrow("DB Error");
	});

	it("should throw when getting matches fails", async () => {
		const mockOrder = vi.fn(() => ({
			data: null,
			error: new Error("DB Error"),
		}));
		const mockEq = vi.fn(() => ({ order: mockOrder }));
		const mockSelect = vi.fn(() => ({ eq: mockEq }));

		(supabase.from as unknown as MockSupabaseFrom).mockReturnValue({
			select: mockSelect,
		});

		await expect(service.getAllMatches()).rejects.toThrow("DB Error");
	});

	it("should throw when reading a setting fails", async () => {
		const mockMaybeSingle = vi.fn(() => ({
			data: null,
			error: new Error("DB Error"),
		}));
		const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
		const mockSelect = vi.fn(() => ({ eq: mockEq }));

		(supabase.from as unknown as MockSupabaseFrom).mockReturnValue({
			select: mockSelect,
		});

		await expect(service.getSetting("key")).rejects.toThrow("DB Error");
	});

	it("should throw when writing a setting fails", async () => {
		const mockUpsert = vi.fn(() => ({ error: new Error("DB Error") }));

		(supabase.from as unknown as MockSupabaseFrom).mockReturnValue({
			upsert: mockUpsert,
		});

		await expect(service.setSetting("key", 10)).rejects.toThrow("DB Error");
	});
});
