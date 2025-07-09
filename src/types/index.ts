export interface Player {
  id: string;
  name: string;
  matches: number;
  wins: number;
  losses: number;
  goals: number;
  assists: number;
}

export interface Match {
  id: string;
  date: string;
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

// Update Match to include seasonId
export interface Match {
  id: string;
  date: string;
  seasonId?: string; // Optional for backward compatibility
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