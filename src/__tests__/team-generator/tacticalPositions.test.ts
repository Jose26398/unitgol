import { describe, expect, it } from "vitest";
import { assignTacticalPositions } from "@/features/team-generator/utils/tacticalPositions";
import type { Player } from "@/types";

describe("assignTacticalPositions", () => {
	const createSamplePlayer = (
		id: string,
		name: string,
		goals: number,
		assists: number,
		elo: number,
	): Player & { elo: number } => ({
		id,
		name,
		matches: 10,
		wins: 5,
		losses: 5,
		goals,
		assists,
		elo,
	});

	it("places goalkeeper as the player with lowest G/A (and lowest ELO on tie)", () => {
		const players = [
			createSamplePlayer("1", "Goleador", 10, 1, 1100),
			createSamplePlayer("2", "Asistente", 1, 10, 1080),
			createSamplePlayer("3", "Banda1", 5, 3, 1050),
			createSamplePlayer("4", "Banda2", 4, 3, 1040),
			createSamplePlayer("5", "Def1", 2, 2, 1020),
			createSamplePlayer("6", "TieHighElo", 1, 0, 1010),
			createSamplePlayer("7", "TieLowElo", 1, 0, 950),
		];

		const formation = assignTacticalPositions(
			players,
			(p) => (p as Player & { elo: number }).elo,
			"Equipo A",
		);

		expect(formation.allAssigned).toHaveLength(7);
		expect(formation.portero.player.id).toBe("7");
		expect(formation.portero.tacticalPosition).toBe("portero");
	});

	it("places top scorer as estaca, top assister as medio, and orders bandas/defensas down by G/A and ELO", () => {
		const players = [
			createSamplePlayer("est", "Goleador", 12, 1, 1050),
			createSamplePlayer("med", "Asistente", 2, 11, 1040),
			createSamplePlayer("ban1", "Banda 1", 5, 4, 1060),
			createSamplePlayer("ban2", "Banda 2", 4, 3, 1030),
			createSamplePlayer("def1", "Defensa 1", 2, 2, 1020),
			createSamplePlayer("def2", "Defensa 2", 1, 1, 1000),
			createSamplePlayer("gk", "Portero", 0, 0, 980),
		];

		const formation = assignTacticalPositions(
			players,
			(p) => (p as Player & { elo: number }).elo,
		);

		expect(formation.estacas.map((p) => p.player.id)).toEqual(["est"]);
		expect(formation.medios.map((p) => p.player.id)).toEqual(["med"]);
		expect(formation.bandas.map((p) => p.player.id)).toEqual(["ban1", "ban2"]);
		expect(formation.defensas.map((p) => p.player.id)).toEqual([
			"def1",
			"def2",
		]);
		expect(formation.portero.player.id).toBe("gk");
	});

	it("breaks ties by ELO when G/A stats are equal", () => {
		const players = [
			createSamplePlayer("p1", "P1", 0, 0, 1300),
			createSamplePlayer("p2", "P2", 0, 0, 1200),
			createSamplePlayer("p3", "P3", 0, 0, 1150),
			createSamplePlayer("p4", "P4", 0, 0, 1100),
			createSamplePlayer("p5", "P5", 0, 0, 1050),
			createSamplePlayer("p6", "P6", 0, 0, 1000),
			createSamplePlayer("p7", "P7", 0, 0, 900),
		];

		const formation = assignTacticalPositions(
			players,
			(p) => (p as Player & { elo: number }).elo,
		);

		expect(formation.estacas[0].player.id).toBe("p1");
		expect(formation.medios[0].player.id).toBe("p2");
		expect(formation.bandas.map((p) => p.player.id)).toEqual(["p3", "p4"]);
		expect(formation.defensas.map((p) => p.player.id)).toEqual(["p5", "p6"]);
		expect(formation.portero.player.id).toBe("p7");
	});
});
