import Dexie, { Table } from 'dexie';
import { Player, Match } from '../types';

export class FootballDatabase extends Dexie {
  players!: Table<Player>;
  matches!: Table<Match>;
  settings!: Table<{ key: string; value: number }>;

  constructor() {
    super('FootballDB');

    this.version(2).stores({
      players: '++id, name',
      matches: '++id, date',
      settings: 'key'
    });
  }

  async getSetting(key: string): Promise<number | undefined> {
    const setting = await this.settings.get(key);
    return setting?.value;
  }

  async setSetting(key: string, value: number): Promise<void> {
    await this.settings.put({ key, value });
  }

  async addPlayer(name: string): Promise<string> {
    const id = await this.players.add({
      id: Date.now().toString(), // Simple unique ID generation
      name,
      matches: 0,
      wins: 0,
      losses: 0,
      goals: 0,
      assists: 0
    });
    return id.toString();
  }

  async updatePlayer(id: string, updatedData: Partial<Omit<Player, 'id'>>): Promise<void> {
    const existingPlayer = await this.players.get(id);
    if (!existingPlayer) {
      throw new Error(`Player with ID ${id} not found`);
    }
    await this.players.update(id, updatedData);
  }

  async getAllPlayers(): Promise<Player[]> {
    return await this.players.toArray();
  }

  async deletePlayer(id: string): Promise<void> {
    await this.players.delete(id);
  }

  async updatePlayerStats(id: string, stats: Partial<Player>): Promise<void> {
    await this.players.update(id, stats);
  }

  async addMatch(match: Omit<Match, 'id'>): Promise<string> {
    const id = await this.matches.add({
      id: Date.now().toString(),
      ...match
    });
    return id.toString();
  }

  async updateMatch(match: Match): Promise<void> {
    await this.matches.update(match.id, match);
  }

  async deleteMatch(id: string): Promise<void> {
    await this.matches.delete(id);
  }

  async getAllMatches(): Promise<Match[]> {
    return await this.matches.orderBy('date').reverse().toArray();
  }

  async getMatchById(id: string): Promise<Match | undefined> {
    return await this.matches.get(id);
  }
}

export const db = new FootballDatabase();