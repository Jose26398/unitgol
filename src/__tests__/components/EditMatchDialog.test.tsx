import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EditMatchDialog } from "@/features/matches/components/EditMatchDialog";
import type { Match, Player, Season } from "@/types";

function makePlayer(id: string, name: string): Player {
	return { id, name, matches: 0, wins: 0, losses: 0, goals: 0, assists: 0 };
}

function makeMatch(goals: Match["goals"] = []): Match {
	return {
		id: "match-id",
		date: "2024-01-01T10:00:00.000Z",
		seasonId: "season-id",
		teamA: {
			players: [makePlayer("p1", "Alice"), makePlayer("p2", "Bob")],
			score: 2,
		},
		teamB: {
			players: [makePlayer("p3", "Carol")],
			score: 1,
		},
		goals,
	};
}

const seasons: Season[] = [
	{ id: "season-id", name: "Temporada 1", startDate: "2024-01-01" },
];

describe("EditMatchDialog", () => {
	it("renders existing goals and allows deleting one", async () => {
		const user = userEvent.setup();
		const onSave = vi.fn();

		render(
			<EditMatchDialog
				match={makeMatch([
					{ playerId: "p1", minute: 10 },
					{ playerId: "p3", minute: 55, assistById: "p1" },
				])}
				onSave={onSave}
				onClose={vi.fn()}
				seasons={seasons}
			/>,
		);

		expect(screen.getByText("Alice (10')")).toBeInTheDocument();
		expect(
			screen.getByText("Carol (55') - Asistencia: Alice"),
		).toBeInTheDocument();

		await user.click(
			screen.getByRole("button", { name: /Eliminar gol de Alice/ }),
		);

		expect(screen.queryByText("Alice (10')")).not.toBeInTheDocument();
		expect(
			screen.getByText("Carol (55') - Asistencia: Alice"),
		).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /Guardar Cambios/ }));
		expect(onSave).toHaveBeenCalledTimes(1);
		const saved = onSave.mock.calls[0][0] as Match;
		expect(saved.goals).toHaveLength(1);
		expect(saved.goals[0]).toEqual({
			playerId: "p3",
			minute: 55,
			assistById: "p1",
		});
	});

	it("saves the updated score and season", async () => {
		const user = userEvent.setup();
		const onSave = vi.fn();

		render(
			<EditMatchDialog
				match={makeMatch()}
				onSave={onSave}
				onClose={vi.fn()}
				seasons={seasons}
			/>,
		);

		await user.clear(screen.getByLabelText("Goles (Equipo A)"));
		await user.type(screen.getByLabelText("Goles (Equipo A)"), "3");
		await user.selectOptions(screen.getByLabelText("Temporada:"), "season-id");
		await user.click(screen.getByRole("button", { name: /Guardar Cambios/ }));

		const saved = onSave.mock.calls[0][0] as Match;
		expect(saved.teamA.score).toBe(3);
		expect(saved.seasonId).toBe("season-id");
	});

	it("allows adding a goal and saves goals sorted by minute", async () => {
		const user = userEvent.setup();
		const onSave = vi.fn();

		render(
			<EditMatchDialog
				match={makeMatch([{ playerId: "p2", minute: 40 }])}
				onSave={onSave}
				onClose={vi.fn()}
				seasons={seasons}
			/>,
		);

		await user.selectOptions(screen.getByLabelText("Goleador"), "p1");
		await user.type(screen.getByLabelText("Minuto"), "20");
		await user.click(screen.getByRole("button", { name: /Añadir Gol/ }));

		expect(screen.getByText("Alice (20')")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /Guardar Cambios/ }));
		const saved = onSave.mock.calls[0][0] as Match;
		expect(saved.goals.map((g) => g.minute)).toEqual([20, 40]);
	});

	it("calls onClose when cancel is clicked", async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();

		render(
			<EditMatchDialog
				match={makeMatch()}
				onSave={vi.fn()}
				onClose={onClose}
				seasons={seasons}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /Cancelar/ }));
		expect(onClose).toHaveBeenCalledTimes(1);
	});
});
