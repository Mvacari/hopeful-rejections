# Testing Guide

This project uses a comprehensive testing setup with Playwright for E2E tests, and Vitest for unit and integration tests.

## Test Structure

```
tests/
├── e2e/              # Playwright end-to-end tests
├── integration/      # Integration tests (Vitest)
├── unit/             # Unit tests (Vitest)
│   └── components/   # Component unit tests
├── utils/            # Test utilities and helpers
└── setup.ts          # Test setup configuration
```

## Running Tests

### All Tests
```bash
npm run test:all
```

### Unit Tests
```bash
npm run test:unit
npm run test:unit -- --watch  # Watch mode
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests (Playwright)
```bash
npm run test:e2e              # Run in headless mode
npm run test:e2e:ui           # Run with Playwright UI
```

### Watch Mode (Unit & Integration)
```bash
npm run test:watch
```

### Coverage
```bash
npm run test:coverage
```

## Writing Tests

### Unit Tests
Unit tests should test individual functions, utilities, and components in isolation.

Example:
```typescript
import { describe, it, expect } from 'vitest';
import { formatDate } from '@/lib/utils';

describe('formatDate', () => {
  it('should format dates correctly', () => {
    expect(formatDate(new Date())).toBeDefined();
  });
});
```

### Integration Tests
Integration tests verify that multiple components or modules work together correctly.

Example:
```typescript
import { describe, it, expect } from 'vitest';
import { setCurrentUser, getCurrentUserId } from '@/lib/auth';

describe('Auth Flow', () => {
  it('should persist user data', () => {
    setCurrentUser('user-1', 'testuser');
    expect(getCurrentUserId()).toBe('user-1');
  });
});
```

### E2E Tests (Playwright)
E2E tests verify complete user flows through the application.

Example:
```typescript
import { test, expect } from '@playwright/test';

test('should navigate to dashboard', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/dashboard/);
});
```

## Test Utilities

### General Helpers

Use the test helpers from `tests/utils/test-helpers.tsx`:

```typescript
import { renderWithProviders, mockUser } from '@/tests/utils/test-helpers';
```

### Supabase Mocking

For unit and integration tests, use the Supabase mock helpers:

```typescript
import { createSimpleMockSupabase } from '@/tests/utils/supabase-helpers';
import { vi } from 'vitest';

const mock = createSimpleMockSupabase();
mock.setData('users', [{ id: '1', username: 'test' }]);

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mock.client,
}));
```

See `tests/README-SUPABASE.md` for detailed Supabase mocking guide.

## Configuration Files

- `playwright.config.ts` - Playwright configuration
- `vitest.config.ts` - Vitest configuration
- `tests/setup.ts` - Global test setup

## Best Practices

1. **Follow TDD workflow**: Write tests before implementation
2. **Keep tests isolated**: Each test should be independent
3. **Use descriptive names**: Test names should clearly describe what they test
4. **Mock external dependencies**: Use mocks for API calls, localStorage, etc.
5. **Test user behavior**: Focus on what users see and do, not implementation details
6. **Keep tests fast**: Unit tests should be very fast, integration tests moderate, E2E tests can be slower

## CI/CD

Tests run automatically in CI. Make sure all tests pass before merging:

```bash
npm run test:all
```

