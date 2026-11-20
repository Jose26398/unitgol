import type { Player, PlayerPosition } from "@/types";

export type TacticalPosition = "portero" | PlayerPosition;

export interface AssignedPlayer {
	player: Player;
	tacticalPosition: TacticalPosition;
	slotId: string;
	slotLabel: string;
	isOutOfPosition: boolean;
	score: number;
}

export interface TeamTacticalFormation {
	teamName: string;
	score: number;
	portero: AssignedPlayer;
	defensas: AssignedPlayer[];
	bandas: AssignedPlayer[];
	medios: AssignedPlayer[];
	estacas: AssignedPlayer[];
	allAssigned: AssignedPlayer[];
}

/**
 * Genera la formación táctica para un equipo en el campo de fútbol 7
 * usando únicamente G/A (goles + asistencias) y la puntuación/ELO del jugador.
 *
 * Reglas:
 * 1. Portero: el jugador con menos G/A; en caso de empate, el de menor ELO/puntuación.
 * 2. Estaca (arriba): el jugador de campo con más goles (desempate: G/A, luego ELO/puntuación).
 * 3. Medio (centro): el jugador restante con más asistencias (desempate: G/A, luego ELO/puntuación).
 * 4. Bandas y defensas: de mayor a menor G/A y ELO/puntuación hacia abajo hasta el portero.
 */
function getGoalContributions(player: Player): number {
	return (player.goals || 0) + (player.assists || 0);
}

function createAssignedOutfield(
	player: Player,
	assignedPos: PlayerPosition,
	count: number,
	score: number,
): AssignedPlayer {
	let slotLabel = "";
	let slotId = "";
	if (assignedPos === "defensa") {
		slotId = `def_${count}`;
		slotLabel = count === 1 ? "Defensa Izquierdo" : "Defensa Derecho";
	} else if (assignedPos === "banda") {
		slotId = `ban_${count}`;
		slotLabel = count === 1 ? "Banda Izquierda" : "Banda Derecha";
	} else if (assignedPos === "medio") {
		slotId = `med_${count}`;
		slotLabel = count === 1 ? "Medio Centro" : `Medio ${count}`;
	} else {
		slotId = `est_${count}`;
		slotLabel = count === 1 ? "Estaca (Punta)" : `Estaca ${count}`;
	}

	return {
		player,
		tacticalPosition: assignedPos,
		slotId,
		slotLabel,
		isOutOfPosition: false,
		score,
	};
}

export function assignTacticalPositions(
	players: Player[],
	getPlayerScore: (player: Player) => number,
	teamName = "Equipo",
): TeamTacticalFormation {
	if (players.length === 0) {
		throw new Error("No hay jugadores en el equipo para asignar posiciones.");
	}

	// 1. Portero: el que menos G/A tenga, y en empate el de menor ELO/puntuación
	const sortedForGk = [...players].sort(
		(a, b) =>
			getGoalContributions(a) - getGoalContributions(b) ||
			getPlayerScore(a) - getPlayerScore(b),
	);
	const gkPlayer = sortedForGk[0];
	const gkIndex = players.indexOf(gkPlayer);
	const remaining = players.filter((_, idx) => idx !== gkIndex);

	const porteroAssigned: AssignedPlayer = {
		player: gkPlayer,
		tacticalPosition: "portero",
		slotId: "por",
		slotLabel: "Portero",
		isOutOfPosition: false,
		score: getPlayerScore(gkPlayer),
	};

	// 2. Definir slots disponibles según cantidad de jugadores de campo
	// Estándar Fútbol 7 (6 de campo): 1 Estaca, 1 Medio, 2 Bandas, 2 Defensas
	const availableCapacity: Record<PlayerPosition, number> = {
		estaca: 1,
		medio: 1,
		banda: 2,
		defensa: 2,
	};

	const outfieldCount = remaining.length;
	if (outfieldCount <= 4) {
		availableCapacity.estaca = 1;
		availableCapacity.medio = 1;
		availableCapacity.banda = 1;
		availableCapacity.defensa = 1;
	} else if (outfieldCount === 5) {
		availableCapacity.estaca = 1;
		availableCapacity.medio = 1;
		availableCapacity.banda = 1;
		availableCapacity.defensa = 2;
	} else if (outfieldCount > 6) {
		let extra = outfieldCount - 6;
		while (extra > 0) {
			if (extra % 2 === 0) availableCapacity.medio++;
			else availableCapacity.defensa++;
			extra--;
		}
	}

	const slotLabelsCounters: Record<PlayerPosition, number> = {
		defensa: 0,
		banda: 0,
		medio: 0,
		estaca: 0,
	};
	const assignedOutfield: AssignedPlayer[] = [];

	const takeTopPlayers = (
		pos: PlayerPosition,
		count: number,
		comparator: (a: Player, b: Player) => number,
	) => {
		if (count <= 0 || remaining.length === 0) return;
		remaining.sort(comparator);
		const selected = remaining.splice(0, Math.min(count, remaining.length));
		for (const player of selected) {
			slotLabelsCounters[pos]++;
			assignedOutfield.push(
				createAssignedOutfield(
					player,
					pos,
					slotLabelsCounters[pos],
					getPlayerScore(player),
				),
			);
		}
	};

	const byGAAndScoreDesc = (a: Player, b: Player) =>
		getGoalContributions(b) - getGoalContributions(a) ||
		getPlayerScore(b) - getPlayerScore(a);

	// 3. Estaca: más goles más arriba (desempate: G/A, luego ELO/puntuación)
	takeTopPlayers(
		"estaca",
		availableCapacity.estaca,
		(a, b) => b.goals - a.goals || byGAAndScoreDesc(a, b),
	);

	// 4. Medio: más asistencias más en el medio (desempate: G/A, luego ELO/puntuación)
	takeTopPlayers(
		"medio",
		availableCapacity.medio,
		(a, b) => b.assists - a.assists || byGAAndScoreDesc(a, b),
	);

	// 5. Bandas: siguientes con mayor G/A y ELO/puntuación
	takeTopPlayers("banda", availableCapacity.banda, byGAAndScoreDesc);

	// 6. Defensas: los restantes (menor G/A y ELO/puntuación hacia abajo hasta el portero)
	takeTopPlayers("defensa", remaining.length, byGAAndScoreDesc);

	const defensas = assignedOutfield.filter(
		(p) => p.tacticalPosition === "defensa",
	);
	const bandas = assignedOutfield.filter((p) => p.tacticalPosition === "banda");
	const medios = assignedOutfield.filter((p) => p.tacticalPosition === "medio");
	const estacas = assignedOutfield.filter(
		(p) => p.tacticalPosition === "estaca",
	);

	const totalScore = players.reduce((sum, p) => sum + getPlayerScore(p), 0);

	return {
		teamName,
		score: totalScore,
		portero: porteroAssigned,
		defensas,
		bandas,
		medios,
		estacas,
		allAssigned: [porteroAssigned, ...assignedOutfield],
	};
}
