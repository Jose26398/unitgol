import type { Match, Player, Season } from "../types";
import { MatchRepository } from "./repositories/MatchRepository";
import { PlayerRepository } from "./repositories/PlayerRepository";
import { SeasonRepository } from "./repositories/SeasonRepository";
import { SettingsRepository } from "./repositories/SettingsRepository";

export class SupabaseService {
	private teamId: string | null = null;

	private playerRepo: PlayerRepository;
	private matchRepo: MatchRepository;
	private seasonRepo: SeasonRepository;
	private settingsRepo: SettingsRepository;

	constructor() {
		this.playerRepo = new PlayerRepository();
		this.matchRepo = new MatchRepository(this.playerRepo);
		this.seasonRepo = new SeasonRepository();
		this.settingsRepo = new SettingsRepository();
	}

	setTeamId(id: string) {
		this.teamId = id;
	}

	// Players
	async addPlayer(name: string, seasonId?: string): Promise<string> {
		return this.playerRepo.addPlayer(name, seasonId, this.teamId);
	}

	async updatePlayer(
		id: string,
		updatedData: Partial<Omit<Player, "id">>,
	): Promise<void> {
		return this.playerRepo.updatePlayer(id, updatedData);
	}

	async getAllPlayers(): Promise<Player[]> {
		return this.playerRepo.getAllPlayers(this.teamId);
	}

	async deletePlayer(id: string): Promise<void> {
		return this.playerRepo.deletePlayer(id);
	}

	async updatePlayerStats(
		id: string,
		stats: Partial<Player>,
		seasonId?: string,
	): Promise<void> {
		return this.playerRepo.updatePlayerStats(id, stats, seasonId);
	}

	// Matches
	async addMatch(match: Omit<Match, "id">): Promise<string> {
		return this.matchRepo.addMatch(match, this.teamId);
	}

	async getAllMatches(): Promise<Match[]> {
		return this.matchRepo.getAllMatches(this.teamId);
	}

	async deleteMatch(id: string): Promise<void> {
		return this.matchRepo.deleteMatch(id);
	}

	async editMatch(match: Match): Promise<void> {
		return this.matchRepo.editMatch(match);
	}

	async getMatchById(id: string): Promise<Match | undefined> {
		return this.matchRepo.getMatchById(id);
	}

	// Seasons
	async addSeason(season: Omit<Season, "id">): Promise<string> {
		return this.seasonRepo.addSeason(season, this.teamId);
	}

	async updateSeason(season: Season): Promise<void> {
		return this.seasonRepo.updateSeason(season);
	}

	async deleteSeason(id: string): Promise<void> {
		return this.seasonRepo.deleteSeason(id);
	}

	async getAllSeasons(): Promise<Season[]> {
		return this.seasonRepo.getAllSeasons(this.teamId);
	}

	async getSeasonById(id: string): Promise<Season | undefined> {
		return this.seasonRepo.getSeasonById(id);
	}

	// Settings
	async getSetting(key: string): Promise<number | undefined> {
		return this.settingsRepo.getSetting(key, this.teamId);
	}

	async setSetting(key: string, value: number): Promise<void> {
		return this.settingsRepo.setSetting(key, value, this.teamId);
	}
}

export const supabaseService = new SupabaseService();
