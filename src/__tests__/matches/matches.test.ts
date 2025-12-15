import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseService } from '../../db/supabase-service';
import { supabase } from '../../db/supabase';

type MockSupabaseFrom = {
  insert: unknown;
  update: unknown;
  select: unknown;
  delete: unknown;
  upsert: unknown;
};

describe('SupabaseService - Matches', () => {
  let service: SupabaseService;

  beforeEach(() => {
    service = new SupabaseService();
    service.setTeamId('a');
    vi.clearAllMocks();
  });

  it('should add a match', async () => {
    const mockSingle = vi.fn(() => ({ data: { id: 'match-id' }, error: null }));
    const mockSelect = vi.fn(() => ({ single: mockSingle }));
    const mockInsertMatch = vi.fn(() => ({ select: mockSelect }));

    const mockInsertPlayers = vi.fn(() => ({ error: null }));
    const mockInsertGoals = vi.fn(() => ({ error: null }));

    // Mock for updatePlayerStats
    const mockPlayerSelect = vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => ({ data: { matches: 0, wins: 0, losses: 0, goals: 0, assists: 0 }, error: null })) })) }));
    const mockPlayerUpdate = vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }));

    (supabase.from as unknown as MockSupabaseFrom).mockImplementation((table: string) => {
      if (table === 'matches') {
        return { insert: mockInsertMatch };
      } else if (table === 'match_players') {
        return { insert: mockInsertPlayers };
      } else if (table === 'goals') {
        return { insert: mockInsertGoals };
      } else if (table === 'players') {
        return { select: mockPlayerSelect, update: mockPlayerUpdate };
      }
      return {};
    });

    const match = {
      date: '2024-01-01',
      seasonId: 'ac798200-40df-4e6b-b2f3-e20e108ea816',
      teamA: {
        players: [
          { id: '1', name: 'hola', matches: 0, wins: 0, losses: 0, goals: 0, assists: 0 },
          { id: '2', name: 'adios', matches: 0, wins: 0, losses: 0, goals: 0, assists: 0 }
        ],
        score: 2
      },
      teamB: {
        players: [
          { id: '3', name: 'buenas', matches: 0, wins: 0, losses: 0, goals: 0, assists: 0 },
          { id: '4', name: 'tardes', matches: 0, wins: 0, losses: 0, goals: 0, assists: 0 }
        ],
        score: 1
      },
      goals: []
    };

    const matchId = await service.addMatch(match);
    expect(matchId).toBe('match-id');
  });

  it('should get all matches', async () => {
    const mockData = [
      {
        id: 'match-1',
        date: '2024-01-01',
        season_id: 'ac798200-40df-4e6b-b2f3-e20e108ea816',
        team_a_score: 2,
        team_b_score: 1,
        match_players: [
          { team: 'A', players: { id: '1', name: 'hola', matches: 1, wins: 1, losses: 0, goals: 1, assists: 0, season_id: 'ac798200-40df-4e6b-b2f3-e20e108ea816' } },
          { team: 'B', players: { id: '3', name: 'buenas', matches: 1, wins: 0, losses: 1, goals: 0, assists: 0, season_id: 'ac798200-40df-4e6b-b2f3-e20e108ea816' } }
        ],
        goals: []
      }
    ];

    const mockOrder = vi.fn(() => ({ data: mockData, error: null }));
    const mockEq = vi.fn(() => ({ order: mockOrder }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));

    (supabase.from as unknown as MockSupabaseFrom).mockReturnValue({
      select: mockSelect,
    });

    const matches = await service.getAllMatches();
    expect(matches).toHaveLength(1);
    expect(matches[0].id).toBe('match-1');
  });

  it('should delete match', async () => {
    const mockMatchData = {
      id: 'match-id',
      date: '2024-01-01',
      season_id: 'ac798200-40df-4e6b-b2f3-e20e108ea816',
      team_a_score: 2,
      team_b_score: 1,
      match_players: [],
      goals: []
    };

    const mockGetMatchSingle = vi.fn(() => ({ data: mockMatchData, error: null }));
    const mockGetMatchEq = vi.fn(() => ({ single: mockGetMatchSingle }));
    const mockGetMatchSelect = vi.fn(() => ({ eq: mockGetMatchEq }));

    const mockDeleteGoals = vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }));
    const mockDeletePlayers = vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }));
    const mockDeleteMatch = vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }));

    // Mock for updatePlayerStats in subtractMatchStats
    const mockPlayerSelect = vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => ({ data: { matches: 1, wins: 1, losses: 0, goals: 0, assists: 0 }, error: null })) })) }));
    const mockPlayerUpdate = vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }));

    (supabase.from as unknown as MockSupabaseFrom).mockImplementation((table: string) => {
      if (table === 'matches') {
        return { select: mockGetMatchSelect, delete: mockDeleteMatch };
      } else if (table === 'goals') {
        return { delete: mockDeleteGoals };
      } else if (table === 'match_players') {
        return { delete: mockDeletePlayers };
      } else if (table === 'players') {
        return { select: mockPlayerSelect, update: mockPlayerUpdate };
      }
      return {};
    });

    await expect(service.deleteMatch('match-id')).resolves.toBeUndefined();
  });

  it('should edit match', async () => {
    const mockCurrentMatchData = {
      id: 'match-id',
      date: '2024-01-01',
      season_id: 'ac798200-40df-4e6b-b2f3-e20e108ea816',
      team_a_score: 1,
      team_b_score: 1,
      match_players: [],
      goals: []
    };

    const mockGetMatchSingle = vi.fn(() => ({ data: mockCurrentMatchData, error: null }));
    const mockGetMatchEq = vi.fn(() => ({ single: mockGetMatchSingle }));
    const mockGetMatchSelect = vi.fn(() => ({ eq: mockGetMatchEq }));

    const mockUpdateMatch = vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }));
    const mockDeletePlayers = vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }));
    const mockDeleteGoals = vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }));
    const mockInsertPlayers = vi.fn(() => ({ error: null }));
    const mockInsertGoals = vi.fn(() => ({ error: null }));

    // Mock for updatePlayerStats in subtractMatchStats and addMatchStats
    const mockPlayerSelect = vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => ({ data: { matches: 1, wins: 0, losses: 0, goals: 0, assists: 0 }, error: null })) })) }));
    const mockPlayerUpdate = vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }));

    (supabase.from as unknown as MockSupabaseFrom).mockImplementation((table: string) => {
      if (table === 'matches') {
        return { select: mockGetMatchSelect, update: mockUpdateMatch };
      } else if (table === 'match_players') {
        return { delete: mockDeletePlayers, insert: mockInsertPlayers };
      } else if (table === 'goals') {
        return { delete: mockDeleteGoals, insert: mockInsertGoals };
      } else if (table === 'players') {
        return { select: mockPlayerSelect, update: mockPlayerUpdate };
      }
      return {};
    });

    const match = {
      id: 'match-id',
      date: '2024-01-01',
      seasonId: 'ac798200-40df-4e6b-b2f3-e20e108ea816',
      teamA: { players: [], score: 2 },
      teamB: { players: [], score: 1 },
      goals: []
    };

    await expect(service.editMatch(match)).resolves.toBeUndefined();
  });

  it('should get match by id', async () => {
    const mockData = {
      id: 'match-id',
      date: '2024-01-01',
      season_id: 'ac798200-40df-4e6b-b2f3-e20e108ea816',
      team_a_score: 2,
      team_b_score: 1,
      match_players: [],
      goals: []
    };

    const mockSingle = vi.fn(() => ({ data: mockData, error: null }));
    const mockEq = vi.fn(() => ({ single: mockSingle }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));

    (supabase.from as unknown as MockSupabaseFrom).mockReturnValue({
      select: mockSelect,
    });

    const match = await service.getMatchById('match-id');
    expect(match?.id).toBe('match-id');
  });

  it('should return undefined for non-existent match', async () => {
    const mockSingle = vi.fn(() => ({ data: null, error: { code: 'PGRST116' } }));
    const mockEq = vi.fn(() => ({ single: mockSingle }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));

    (supabase.from as unknown as MockSupabaseFrom).mockReturnValue({
      select: mockSelect,
    });

    const match = await service.getMatchById('non-existent');
    expect(match).toBeUndefined();
  });
});