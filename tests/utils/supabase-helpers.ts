import { vi } from 'vitest';
import { Database } from '@/types/database';

type TableName = keyof Database['public']['Tables'];
type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];

/**
 * Simple Supabase mock helper
 * This provides a simpler way to mock Supabase queries in tests
 */

export interface MockSupabaseQuery {
  select: (columns?: string) => MockSupabaseQuery;
  insert: (values: any) => { select: () => { single: () => Promise<any> } };
  update: (values: any) => MockSupabaseQuery;
  delete: () => MockSupabaseQuery;
  eq: (field: string, value: any) => MockSupabaseQuery;
  order: (field: string, options?: { ascending?: boolean }) => MockSupabaseQuery;
  limit: (count: number) => MockSupabaseQuery;
  single: () => Promise<any>;
  maybeSingle: () => Promise<any>;
}

export interface MockSupabaseClient {
  from: (table: string) => MockSupabaseQuery;
  rpc: (fn: string, args?: any) => Promise<any>;
  auth: {
    getUser: () => Promise<any>;
    signInWithPassword: (credentials: any) => Promise<any>;
    signOut: () => Promise<any>;
    signUp: (credentials: any) => Promise<any>;
  };
  storage: {
    from: (bucket: string) => any;
  };
}

/**
 * Creates a simple mock Supabase client
 * Usage:
 *   const mockClient = createSimpleMockSupabase();
 *   mockClient.setData('users', [{ id: '1', username: 'test' }]);
 *   vi.mock('@/lib/supabase/client', () => ({ createClient: () => mockClient.client }));
 */
export function createSimpleMockSupabase() {
  const data: Record<string, any[]> = {};
  const errors: Record<string, any> = {};

  const createQuery = (table: string): MockSupabaseQuery => {
    let filters: Array<{ field: string; value: any }> = [];
    let orderBy: { field: string; ascending: boolean } | null = null;
    let limitCount: number | null = null;
    let isSingle = false;

    const applyFilters = () => {
      let result = data[table] || [];

      filters.forEach(({ field, value }) => {
        result = result.filter((item) => item[field] === value);
      });

      if (orderBy) {
        result.sort((a, b) => {
          const aVal = a[orderBy!.field];
          const bVal = b[orderBy!.field];
          return orderBy!.ascending
            ? aVal > bVal ? 1 : aVal < bVal ? -1 : 0
            : aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        });
      }

      if (limitCount !== null) {
        result = result.slice(0, limitCount);
      }

      return result;
    };

    const query: MockSupabaseQuery = {
      select: vi.fn((columns?: string) => {
        return query;
      }),
      insert: vi.fn((values: any) => {
        const errorKey = `${table}_insert`;
        if (errors[errorKey]) {
          return {
            select: () => ({
              single: () => Promise.resolve({ data: null, error: errors[errorKey] }),
            }),
          };
        }

        const newItem = Array.isArray(values) ? values[0] : values;
        const inserted = {
          ...newItem,
          id: newItem.id || `mock-${table}-${Date.now()}`,
          created_at: newItem.created_at || new Date().toISOString(),
        };

        if (!data[table]) data[table] = [];
        data[table].push(inserted);

        return {
          select: () => ({
            single: () => Promise.resolve({ data: inserted, error: null }),
          }),
        };
      }),
      update: vi.fn((values: any) => {
        return query;
      }),
      delete: vi.fn(() => {
        return query;
      }),
      eq: vi.fn((field: string, value: any) => {
        filters.push({ field, value });
        return query;
      }),
      order: vi.fn((field: string, options?: { ascending?: boolean }) => {
        orderBy = { field, ascending: options?.ascending !== false };
        return query;
      }),
      limit: vi.fn((count: number) => {
        limitCount = count;
        return query;
      }),
      single: vi.fn(async () => {
        isSingle = true;
        const errorKey = `${table}_select_single`;
        if (errors[errorKey]) {
          return { data: null, error: errors[errorKey] };
        }
        const result = applyFilters();
        filters = [];
        orderBy = null;
        limitCount = null;
        isSingle = false;
        return { data: result[0] || null, error: null };
      }),
      maybeSingle: vi.fn(async () => {
        return query.single();
      }),
    };

    // Make select() return a promise when awaited
    const originalSelect = query.select;
    query.select = vi.fn((columns?: string) => {
      const result = originalSelect(columns);
      // Make it thenable
      (result as any).then = async (resolve: any) => {
        const errorKey = `${table}_select`;
        if (errors[errorKey]) {
          return resolve({ data: null, error: errors[errorKey] });
        }
        const filtered = applyFilters();
        filters = [];
        orderBy = null;
        limitCount = null;
        return resolve({ data: filtered, error: null });
      };
      return result;
    });

    return query;
  };

  const client: MockSupabaseClient = {
    from: vi.fn((table: string) => createQuery(table)),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: 'mock-path' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/image.jpg' } }),
        remove: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    },
  };

  return {
    client,
    setData: <T extends TableName>(table: T, tableData: TableRow<T>[]) => {
      data[table] = tableData;
    },
    setError: (operation: string, error: any) => {
      errors[operation] = error;
    },
    clear: () => {
      Object.keys(data).forEach((key) => delete data[key]);
      Object.keys(errors).forEach((key) => delete errors[key]);
    },
    getData: (table: string) => data[table] || [],
  };
}

/**
 * Helper to mock Supabase client module
 * Usage:
 *   const { mockClient, setData } = mockSupabaseClient();
 *   setData('users', [{ id: '1', username: 'test' }]);
 */
export function mockSupabaseClient() {
  const mock = createSimpleMockSupabase();
  
  // Mock the client module
  vi.mock('@/lib/supabase/client', () => ({
    createClient: () => mock.client,
  }));

  vi.mock('@/lib/supabase/server', () => ({
    createClient: () => Promise.resolve(mock.client),
  }));

  return {
    mockClient: mock.client,
    setData: mock.setData,
    setError: mock.setError,
    clear: mock.clear,
    getData: mock.getData,
  };
}

