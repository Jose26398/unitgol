export type PlayerPosition = "defensa" | "medio" | "banda" | "estaca";

export const PLAYER_POSITIONS: {
	value: PlayerPosition;
	label: string;
	short: string;
	description: string;
}[] = [
	{
		value: "defensa",
		label: "Defensa",
		short: "DEF",
		description: "Línea defensiva",
	},
	{
		value: "medio",
		label: "Medio",
		short: "MED",
		description: "Medio centro y creación",
	},
	{
		value: "banda",
		label: "Banda",
		short: "BAN",
		description: "Lateral o extremo de banda",
	},
	{
		value: "estaca",
		label: "Estaca",
		short: "EST",
		description: "Delantero centro de referencia",
	},
];

export interface Player {
	id: string;
	name: string;
	matches: number;
	wins: number;
	losses: number;
	goals: number;
	assists: number;
	seasonId?: string;
	teamId?: string;
	avatarPath?: string;
}

export interface Match {
	id: string;
	date: string;
	seasonId?: string;
	teamA: {
		players: Player[];
		score: number;
	};
	teamB: {
		players: Player[];
		score: number;
	};
	goals: {
		playerId: string;
		minute: number;
		assistById?: string;
	}[];
}

export interface Season {
	id: string;
	name: string;
	startDate: string;
	endDate?: string;
}
