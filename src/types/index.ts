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
