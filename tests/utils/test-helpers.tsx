import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

/**
 * Custom render function that includes providers
 * Use this instead of the default render from @testing-library/react
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, {
    ...options,
  });
}

/**
 * Mock user data for testing
 */
export const mockUser = {
  id: 'test-user-id',
  username: 'testuser',
  avatar_url: null,
  created_at: '2024-01-01T00:00:00Z',
};

/**
 * Mock rejection data for testing
 */
export const mockRejection = {
  id: 'test-rejection-id',
  user_id: 'test-user-id',
  description: 'Test rejection description',
  created_at: new Date().toISOString(),
  group_id: 'test-group-id',
};

/**
 * Wait for a condition to be true
 */
export async function waitForCondition(
  condition: () => boolean,
  timeout = 5000,
): Promise<void> {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeout) {
      throw new Error('Condition timeout');
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';

