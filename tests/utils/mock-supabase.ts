import { vi } from 'vitest';
import { Database } from '@/types/database';

type TableName = keyof Database['public']['Tables'];
type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];

/**
 * Creates a mock Supabase client
 * Usage in tests:
 *   const mockClient = createMockSupabaseClient();
 *   mockClient._setMockData('users', [{ id: '1', username: 'test' }]);
 *   vi.mock('@/lib/supabase/client', () => ({ createClient: () => mockClient }));
 */
export function createMockSupabaseClient() {
  const mockData: Record<string, any[]> = {};
  const mockErrors: Record<string, any> = {};

  const getTableData = (table: string) => {
    if (!mockData[table]) {
      mockData[table] = [];
    }
    return mockData[table];
  };

  const createQueryBuilder = (table: string) => {
    let filters: Array<{ field: string; value: any; operator: string }> = [];
    let orderBy: { field: string; ascending: boolean } | null = null;
    let limitCount: number | null = null;
    let isSingle = false;

    const applyFilters = (data: any[]) => {
      let result = [...data];
      
      filters.forEach(({ field, value, operator }) => {
        if (operator === 'eq') {
          result = result.filter((item) => item[field] === value);
        } else if (operator === 'neq') {
          result = result.filter((item) => item[field] !== value);
        }
      });

      if (orderBy) {
        result.sort((a, b) => {
          const aVal = a[orderBy!.field];
          const bVal = b[orderBy!.field];
          const ascending = orderBy!.ascending;
          if (aVal < bVal) return ascending ? -1 : 1;
          if (aVal > bVal) return ascending ? 1 : -1;
          return 0;
        });
      }

      if (limitCount !== null) {
        result = result.slice(0, limitCount);
      }

      return result;
    };

    const executeQuery = async () => {
      const errorKey = `${table}_${isSingle ? 'select_single' : 'select'}`;
      if (mockErrors[errorKey]) {
        return { data: null, error: mockErrors[errorKey] };
      }

      const result = applyFilters(getTableData(table));
      
      // Reset state
      filters = [];
      orderBy = null;
      limitCount = null;
      isSingle = false;

      return { 
        data: isSingle ? (result[0] || null) : result, 
        error: null 
      };
    };

    const query = {
      select: vi.fn((columns?: string) => {
        // Return a thenable object
        const thenable = {
          then: async (resolve: any) => {
            const result = await executeQuery();
            return resolve(result);
          },
          eq: vi.fn((field: string, value: any) => {
            filters.push({ field, value, operator: 'eq' });
            return thenable;
          }),
          order: vi.fn((field: string, options?: { ascending?: boolean }) => {
            orderBy = { field, ascending: options?.ascending !== false };
            return thenable;
          }),
          limit: vi.fn((count: number) => {
            limitCount = count;
            return thenable;
          }),
          single: vi.fn(async () => {
            isSingle = true;
            return executeQuery();
          }),
          maybeSingle: vi.fn(async () => {
            isSingle = true;
            return executeQuery();
          }),
        };
        return thenable;
      }),
      insert: vi.fn((values: any) => {
        const errorKey = `${table}_insert`;
        if (mockErrors[errorKey]) {
          return {
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: null, error: mockErrors[errorKey] }),
            })),
          };
        }

        const newItems = Array.isArray(values) ? values : [values];
        const inserted = newItems.map((item) => ({
          ...item,
          id: item.id || `mock-${table}-${Date.now()}-${Math.random()}`,
          created_at: item.created_at || new Date().toISOString(),
        }));

        getTableData(table).push(...inserted);

        return {
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: inserted[0], error: null }),
          })),
        };
      }),
      update: vi.fn((values: any) => {
        return {
          eq: vi.fn(async (field: string, value: any) => {
            const errorKey = `${table}_update`;
            if (mockErrors[errorKey]) {
              return { data: null, error: mockErrors[errorKey] };
            }

            const tableData = getTableData(table);
            const updated = tableData.map((item) => 
              item[field] === value ? { ...item, ...values } : item
            );
            mockData[table] = updated;

            return { data: updated.filter((item) => item[field] === value), error: null };
          }),
        };
      }),
      delete: vi.fn(() => {
        return {
          eq: vi.fn(async (field: string, value: any) => {
            const errorKey = `${table}_delete`;
            if (mockErrors[errorKey]) {
              return { data: null, error: mockErrors[errorKey] };
            }

            const tableData = getTableData(table);
            mockData[table] = tableData.filter((item) => item[field] !== value);

            return { data: null, error: null };
          }),
        };
      }),
    };

    return query;
  };

  const client = {
    from: vi.fn((table: string) => createQueryBuilder(table)),
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
    // Helper methods for test setup
    _mockData: mockData,
    _mockErrors: mockErrors,
    _setMockData: (table: string, data: any[]) => {
      mockData[table] = data;
    },
    _setMockError: (operation: string, error: any) => {
      mockErrors[operation] = error;
    },
    _clearMocks: () => {
      Object.keys(mockData).forEach((key) => delete mockData[key]);
      Object.keys(mockErrors).forEach((key) => delete mockErrors[key]);
    },
  };

  return client;
}

/**
 * Helper to set up mock data for a table
 */
export function setupMockTableData<T extends TableName>(
  client: ReturnType<typeof createMockSupabaseClient>,
  table: T,
  data: TableRow<T>[]
) {
  client._setMockData(table, data);
}

/**
 * Helper to set up mock errors
 */
export function setupMockError(
  client: ReturnType<typeof createMockSupabaseClient>,
  operation: string,
  error: { message: string; code?: string }
) {
  client._setMockError(operation, error);
}

/**
 * Mock factory for common test scenarios
 */
export const mockSupabaseFactory = {
  /**
   * Creates a client with sample user data
   */
  withUsers: (users: TableRow<'users'>[] = []) => {
    const client = createMockSupabaseClient();
    if (users.length > 0) {
      setupMockTableData(client, 'users', users);
    }
    return client;
  },

  /**
   * Creates a client with sample group data
   */
  withGroups: (groups: TableRow<'groups'>[] = []) => {
    const client = createMockSupabaseClient();
    if (groups.length > 0) {
      setupMockTableData(client, 'groups', groups);
    }
    return client;
  },

  /**
   * Creates a client with sample rejection data
   */
  withRejections: (rejections: TableRow<'rejections'>[] = []) => {
    const client = createMockSupabaseClient();
    if (rejections.length > 0) {
      setupMockTableData(client, 'rejections', rejections);
    }
    return client;
  },

  /**
   * Creates a client with authenticated user
   */
  withAuth: (userId: string, email?: string) => {
    const client = createMockSupabaseClient();
    client.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: userId,
          email: email || `${userId}@example.com`,
        },
      },
      error: null,
    });
    return client;
  },
};
