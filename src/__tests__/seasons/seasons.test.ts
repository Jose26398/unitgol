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

describe('SupabaseService - Seasons', () => {
  let service: SupabaseService;

  beforeEach(() => {
    service = new SupabaseService();
    service.setTeamId('a');
    vi.clearAllMocks();
  });

  it('should get all seasons', async () => {
    const mockData = [
      {
        id: 'ac798200-40df-4e6b-b2f3-e20e108ea816',
        name: 'Season 1',
        start_date: '2023-01-01',
        end_date: null,
      },
      {
        id: 'a2e0ed36-7269-4f51-84b1-deef8d261ee2',
        name: 'Season 2',
        start_date: '2023-06-01',
        end_date: null,
      },
    ];

    const mockOrder = vi.fn(() => ({ data: mockData, error: null }));
    const mockEq = vi.fn(() => ({ order: mockOrder }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));

    (supabase.from as unknown as MockSupabaseFrom).mockReturnValue({
      select: mockSelect,
    });

    const seasons = await service.getAllSeasons();
    expect(seasons).toHaveLength(2);
    expect(seasons.map(s => s.id)).toEqual(['ac798200-40df-4e6b-b2f3-e20e108ea816', 'a2e0ed36-7269-4f51-84b1-deef8d261ee2']);
  });

  it('should add a season', async () => {
    const mockSingle = vi.fn(() => ({ data: { id: 'season-id' }, error: null }));
    const mockSelect = vi.fn(() => ({ single: mockSingle }));
    const mockInsert = vi.fn(() => ({ select: mockSelect }));

    (supabase.from as unknown as MockSupabaseFrom).mockReturnValue({
      insert: mockInsert,
    });

    const seasonId = await service.addSeason({
      name: 'New Season',
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    });
    expect(seasonId).toBe('season-id');
  });

  it('should update season', async () => {
    const mockUpdate = vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }));

    (supabase.from as unknown as MockSupabaseFrom).mockReturnValue({
      update: mockUpdate,
    });

    await expect(service.updateSeason({
      id: 'season-id',
      name: 'Updated Season',
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    })).resolves.toBeUndefined();
  });

  it('should delete season', async () => {
    const mockUpdatePlayers = vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }));
    const mockDeleteSeason = vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }));

    (supabase.from as unknown as MockSupabaseFrom).mockImplementation((table: string) => {
      if (table === 'players') {
        return { update: mockUpdatePlayers };
      } else if (table === 'seasons') {
        return { delete: mockDeleteSeason };
      }
      return {};
    });

    await expect(service.deleteSeason('season-id')).resolves.toBeUndefined();
  });

  it('should get season by id', async () => {
    const mockData = {
      id: 'season-id',
      name: 'Season 1',
      start_date: '2023-01-01',
      end_date: null
    };

    const mockSingle = vi.fn(() => ({ data: mockData, error: null }));
    const mockEq = vi.fn(() => ({ single: mockSingle }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));

    (supabase.from as unknown as MockSupabaseFrom).mockReturnValue({
      select: mockSelect,
    });

    const season = await service.getSeasonById('season-id');
    expect(season?.name).toBe('Season 1');
  });
});