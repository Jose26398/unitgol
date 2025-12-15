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

describe('SupabaseService - Error Handling', () => {
  let service: SupabaseService;

  beforeEach(() => {
    service = new SupabaseService();
    vi.clearAllMocks();
  });

  it('should throw error if team not authenticated for addPlayer', async () => {
    const serviceWithoutTeam = new SupabaseService();

    await expect(serviceWithoutTeam.addPlayer('test')).rejects.toThrow('Team not authenticated');
  });

  it('should throw error on DB error', async () => {
    service.setTeamId('a'); // Set team ID to avoid authentication error
    const mockInsert = vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(() => ({ data: null, error: new Error('DB Error') })) })) }));

    (supabase.from as unknown as MockSupabaseFrom).mockReturnValue({
      insert: mockInsert,
    });

    await expect(service.addPlayer('test')).rejects.toThrow('DB Error');
  });
});