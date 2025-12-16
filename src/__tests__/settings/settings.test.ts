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

describe('SupabaseService - Settings', () => {
  let service: SupabaseService;

  beforeEach(() => {
    service = new SupabaseService();
    service.setTeamId('test-team-id');
    vi.clearAllMocks();
  });

  it('should get setting', async () => {
    const mockMaybeSingle = vi.fn(() => ({ data: { value: 42 }, error: null }));
    const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));

    (supabase.from as unknown as MockSupabaseFrom).mockReturnValue({
      select: mockSelect,
    });

    const value = await service.getSetting('test-key');
    expect(value).toBe(42);
    expect(mockEq).toHaveBeenCalledWith('key', 'test-team-id_test-key');
  });

  it('should return undefined for non-existent setting', async () => {
    const mockMaybeSingle = vi.fn(() => ({ data: null, error: null }));
    const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));

    (supabase.from as unknown as MockSupabaseFrom).mockReturnValue({
      select: mockSelect,
    });

    const value = await service.getSetting('non-existent');
    expect(value).toBeUndefined();
    expect(mockEq).toHaveBeenCalledWith('key', 'test-team-id_non-existent');
  });

  it('should set setting', async () => {
    const mockUpsert = vi.fn(() => ({ error: null }));

    (supabase.from as unknown as MockSupabaseFrom).mockReturnValue({
      upsert: mockUpsert,
    });

    await expect(service.setSetting('test-key', 42)).resolves.toBeUndefined();
    expect(mockUpsert).toHaveBeenCalledWith({ key: 'test-team-id_test-key', value: 42 }, { onConflict: 'key' });
  });
});