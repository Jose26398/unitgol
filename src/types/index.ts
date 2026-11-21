export type PlayerPosition = "defensa" | "medio" | "banda" | "estaca";

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

export type PlayerUpdate = Partial<
  Omit<Player, "id" | "teamId" | "avatarPath">
>;
export type NewPlayer = Pick<Player, "name"> & { seasonId: string };

export interface TeamSettings {
  goalScoreFactor: number;
  assistScoreFactor: number;
  ratingMode: "elo" | "score";
}

export const DEFAULT_SETTINGS: TeamSettings = {
  goalScoreFactor: 10,
  assistScoreFactor: 5,
  ratingMode: "score",
};

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
