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
 * Genera la formación táctica para un equipo enfrentado en el campo de fútbol 7.
 *
 * Reglas de negocio:
 * 1. El portero se elige aleatoriamente.
 * 2. Al jugador de campo con mejor puntuación (ELO o puntos) se le asegura su 1ª posición.
 * 3. Se va rellenando el resto en orden de puntuación (1ª opción, 2ª opción, o hueco restante).
 * 4. Si a un jugador le toca una posición que no tiene asignada, se marca como `isOutOfPosition = true`.
 */
export function assignTacticalPositions(
	players: Player[],
	getPlayerScore: (player: Player) => number,
	teamName = "Equipo",
): TeamTacticalFormation {
	if (players.length === 0) {
		throw new Error("No hay jugadores en el equipo para asignar posiciones.");
	}

	// 1. Elegir portero aleatoriamente
	const gkIndex = Math.floor(Math.random() * players.length);
	const gkPlayer = players[gkIndex];
	const outfieldPlayers = players.filter((_, idx) => idx !== gkIndex);

	const porteroAssigned: AssignedPlayer = {
		player: gkPlayer,
		tacticalPosition: "portero",
		slotId: "por",
		slotLabel: "Portero",
		isOutOfPosition: false,
		score: getPlayerScore(gkPlayer),
	};

	// 2. Ordenar jugadores de campo de mayor a menor puntuación
	const sortedOutfield = [...outfieldPlayers].sort(
		(a, b) => getPlayerScore(b) - getPlayerScore(a),
	);

	// Definir slots disponibles según cantidad de jugadores
	// Estándar Fútbol 7 (6 de campo): 2 Defensas, 2 Bandas, 1 Medio, 1 Estaca
	const availableCapacity: Record<PlayerPosition, number> = {
		defensa: 2,
		banda: 2,
		medio: 1,
		estaca: 1,
	};

	// Adaptación si hay más o menos jugadores de campo
	const outfieldCount = sortedOutfield.length;
	if (outfieldCount < 6) {
		if (outfieldCount <= 4) {
			availableCapacity.defensa = 1;
			availableCapacity.banda = 1;
			availableCapacity.medio = 1;
			availableCapacity.estaca = 1;
		} else if (outfieldCount === 5) {
			availableCapacity.defensa = 2;
			availableCapacity.banda = 1;
			availableCapacity.medio = 1;
			availableCapacity.estaca = 1;
		}
	} else if (outfieldCount > 6) {
		// Asignar slots extra a medio o defensa
		let extra = outfieldCount - 6;
		while (extra > 0) {
			if (extra % 2 === 0) availableCapacity.medio++;
			else availableCapacity.defensa++;
			extra--;
		}
	}

	const remainingCapacity = { ...availableCapacity };
	const assignedOutfield: AssignedPlayer[] = [];

	const slotLabelsCounters: Record<PlayerPosition, number> = {
		defensa: 0,
		banda: 0,
		medio: 0,
		estaca: 0,
	};

	for (const player of sortedOutfield) {
		const positions = player.positions || [];
		const primary = positions[0];
		const secondary = positions[1];

		let assignedPos: PlayerPosition;
		let outOfPos = false;

		// Al mejor del equipo se le asegura su 1ª posición (porque todas tienen capacidad disponible).
		// Para el resto: si la 1ª está libre, se le asigna; si no, la 2ª; si no, una libre restante.
		if (primary && remainingCapacity[primary] > 0) {
			assignedPos = primary;
			remainingCapacity[primary]--;
		} else if (secondary && remainingCapacity[secondary] > 0) {
			assignedPos = secondary;
			remainingCapacity[secondary]--;
		} else {
			// Buscar cualquier posición que aún tenga hueco
			const candidatePositions: PlayerPosition[] = [
				"medio",
				"defensa",
				"banda",
				"estaca",
			];
			const openSlot = candidatePositions.find(
				(pos) => remainingCapacity[pos] > 0,
			);

			if (openSlot) {
				assignedPos = openSlot;
				remainingCapacity[openSlot]--;
			} else {
				assignedPos = primary || "medio";
			}

			outOfPos = !positions.includes(assignedPos);
		}

		slotLabelsCounters[assignedPos]++;
		const count = slotLabelsCounters[assignedPos];

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
		} else if (assignedPos === "estaca") {
			slotId = `est_${count}`;
			slotLabel = count === 1 ? "Estaca (Punta)" : `Estaca ${count}`;
		}

		assignedOutfield.push({
			player,
			tacticalPosition: assignedPos,
			slotId,
			slotLabel,
			isOutOfPosition: outOfPos,
			score: getPlayerScore(player),
		});
	}

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
