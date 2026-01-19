# Supabase Mocking Guide

This guide explains how to mock Supabase in unit and integration tests.

## Quick Start

```typescript
import { createSimpleMockSupabase } from '@/tests/utils/supabase-helpers';
import { vi } from 'vitest';

describe('My Test', () => {
  it('should query users', async () => {
    const mock = createSimpleMockSupabase();
    
    // Set up mock data
    mock.setData('users', [
      { id: '1', username: 'alice', avatar_url: null, created_at: '2024-01-01T00:00:00Z' },
    ]);

    // Mock the Supabase module
    vi.mock('@/lib/supabase/client', () => ({
      createClient: () => mock.client,
    }));

    // Now your code will use the mock
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const { data } = await supabase.from('users').select('*').eq('id', '1').single();
    
    expect(data).toEqual({ id: '1', username: 'alice', ... });
  });
});
```

## Mocking Patterns

### 1. Basic Query Mocking

```typescript
const mock = createSimpleMockSupabase();
mock.setData('users', [{ id: '1', username: 'test' }]);

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mock.client,
}));

const supabase = createClient();
const { data } = await supabase.from('users').select('*').eq('id', '1').single();
```

### 2. Mocking Inserts

```typescript
const mock = createSimpleMockSupabase();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mock.client,
}));

const supabase = createClient();
const { data } = await supabase
  .from('rejections')
  .insert({ user_id: '1', group_id: '1', description: 'Test' })
  .select()
  .single();

expect(data).toHaveProperty('id');
```

### 3. Mocking Errors

```typescript
const mock = createSimpleMockSupabase();
mock.setError('users_select', { message: 'Database error', code: 'PGRST116' });

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mock.client,
}));

const supabase = createClient();
const { error } = await supabase.from('users').select('*').single();
expect(error).toBeDefined();
```

### 4. Mocking Auth

```typescript
const mock = createSimpleMockSupabase();

mock.client.auth.getUser.mockResolvedValue({
  data: { user: { id: 'user-1', email: 'test@example.com' } },
  error: null,
});

const { data } = await mock.client.auth.getUser();
expect(data.user.id).toBe('user-1');
```

### 5. Mocking Server-Side Queries

```typescript
const mock = createSimpleMockSupabase();
mock.setData('users', [{ id: '1', username: 'test' }]);

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => Promise.resolve(mock.client),
}));

const { createClient } = await import('@/lib/supabase/server');
const supabase = await createClient();
const { data } = await supabase.from('users').select('*').single();
```

## Advanced Usage

### Testing Query Chains

```typescript
const mock = createSimpleMockSupabase();
mock.setData('rejections', [
  { id: '1', group_id: 'group-1', description: 'Test 1', created_at: '2024-01-01T00:00:00Z' },
  { id: '2', group_id: 'group-1', description: 'Test 2', created_at: '2024-01-02T00:00:00Z' },
]);

const supabase = mock.client;
const { data } = await supabase
  .from('rejections')
  .select('*')
  .eq('group_id', 'group-1')
  .order('created_at', { ascending: false })
  .limit(10);

expect(data).toHaveLength(2);
expect(data[0].id).toBe('2'); // Most recent first
```

### Resetting Mocks Between Tests

```typescript
describe('My Tests', () => {
  let mock: ReturnType<typeof createSimpleMockSupabase>;

  beforeEach(() => {
    mock = createSimpleMockSupabase();
    vi.mock('@/lib/supabase/client', () => ({
      createClient: () => mock.client,
    }));
  });

  afterEach(() => {
    mock.clear();
  });
});
```

## Available Mock Methods

- `setData(table, data)` - Set mock data for a table
- `setError(operation, error)` - Set mock error for an operation
- `clear()` - Clear all mock data and errors
- `getData(table)` - Get current mock data for a table

## Operation Names for Errors

When setting errors, use these operation names:
- `{table}_select` - For select queries
- `{table}_select_single` - For single() queries
- `{table}_insert` - For insert operations
- `{table}_update` - For update operations
- `{table}_delete` - For delete operations

Example:
```typescript
mock.setError('users_select', { message: 'Not found', code: 'PGRST116' });
```

## Tips

1. **Always mock before importing**: Mock the module before importing code that uses it
2. **Use beforeEach**: Set up mocks in `beforeEach` to ensure clean state
3. **Clear between tests**: Call `mock.clear()` in `afterEach` if needed
4. **Test error cases**: Use `setError()` to test error handling
5. **Match real data structure**: Use the same structure as your database types

