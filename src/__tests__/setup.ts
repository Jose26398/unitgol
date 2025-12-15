import { vi } from 'vitest';

// Define a type for the mocked supabase
type MockSupabaseFrom = {
  insert: unknown;
  update: unknown;
  select: unknown;
  delete: unknown;
  upsert: unknown;
};

// Mock Supabase globally
vi.mock('../db/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          error: null
        })),
        select: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null
          })),
          single: vi.fn(() => ({
            data: null,
            error: null
          })),
        })),
        order: vi.fn(() => ({
          data: [],
          error: null
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          error: null
        })),
      })),
      upsert: vi.fn(() => ({
        error: null
      })),
    })) as MockSupabaseFrom,
  },
}));