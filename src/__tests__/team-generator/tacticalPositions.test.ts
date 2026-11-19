import { describe, expect, it } from "vitest";
import { assignTacticalPositions } from "@/features/team-generator/utils/tacticalPositions";
import type { Player } from "@/types";

describe("assignTacticalPositions", () => {
	const createSamplePlayer = (
		id: string,
		name: string,
		score: number,
		positions?: Player["positions"],
	): Player => ({
		id,
		name,
		matches: 10,
		wins: 5,
		losses: 5,
		goals: score,
		assists: 0,
		positions,
	});

	it("assigns 7 players to soccer pitch positions with 1 goalkeeper and 6 outfielders", () => {
		const players: Player[] = [
			createSamplePlayer("1", "P1 (Top)", 100, ["estaca"]),
			createSamplePlayer("2", "P2", 90, ["medio"]),
			createSamplePlayer("3", "P3", 80, ["banda"]),
			createSamplePlayer("4", "P4", 70, ["banda"]),
			createSamplePlayer("5", "P5", 60, ["defensa"]),
			createSamplePlayer("6", "P6", 50, ["defensa"]),
			createSamplePlayer("7", "P7", 40, ["defensa"]),
		];

		const formation = assignTacticalPositions(
			players,
			(p) => p.goals,
			"Equipo A",
		);

		expect(formation.allAssigned).toHaveLength(7);
		expect(formation.portero).toBeDefined();
		expect(formation.portero.tacticalPosition).toBe("portero");
		expect(formation.defensas.length).toBeGreaterThanOrEqual(1);
	});

	it("guarantees the highest scored outfield player his primary position", () => {
		const players: Player[] = [
			createSamplePlayer("top", "Crack", 200, ["estaca", "medio"]),
			createSamplePlayer("2", "P2", 80, ["estaca"]),
			createSamplePlayer("3", "P3", 75, ["estaca"]),
			createSamplePlayer("4", "P4", 70, ["estaca"]),
			createSamplePlayer("5", "P5", 60, ["estaca"]),
			createSamplePlayer("6", "P6", 50, ["estaca"]),
			createSamplePlayer("7", "P7", 10, ["estaca"]),
		];

		// Run multiple times to verify regardless of who gets chosen as random GK
		for (let i = 0; i < 10; i++) {
			const formation = assignTacticalPositions(players, (p) => p.goals);
			const outfield = formation.allAssigned.filter(
				(p) => p.tacticalPosition !== "portero",
			);
			const bestOutfield = outfield.reduce((best, curr) =>
				curr.score > best.score ? curr : best,
			);

			// The best outfield player must get his primary position
			const primaryPos = bestOutfield.player.positions?.[0];
			if (primaryPos) {
				expect(bestOutfield.tacticalPosition).toBe(primaryPos);
				expect(bestOutfield.isOutOfPosition).toBe(false);
			}
		}
	});

	it("marks players as out of position when preferred slots are full", () => {
		// All outfield players are 'estaca', but only 1 estaca slot exists
		const players: Player[] = [
			createSamplePlayer("1", "P1", 100, ["estaca"]),
			createSamplePlayer("2", "P2", 90, ["estaca"]),
			createSamplePlayer("3", "P3", 80, ["estaca"]),
			createSamplePlayer("4", "P4", 70, ["estaca"]),
			createSamplePlayer("5", "P5", 60, ["estaca"]),
			createSamplePlayer("6", "P6", 50, ["estaca"]),
			createSamplePlayer("7", "P7", 40, ["estaca"]),
		];

		const formation = assignTacticalPositions(players, (p) => p.goals);
		const outOfPosCount = formation.allAssigned.filter(
			(p) => p.isOutOfPosition,
		).length;

		// Since 6 outfield players want 'estaca' and only 1 can have it, 5 must be out of position
		expect(outOfPosCount).toBe(5);
	});
});
