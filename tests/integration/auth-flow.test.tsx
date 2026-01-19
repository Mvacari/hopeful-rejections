import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import {
  getCurrentUserId,
  getCurrentUsername,
  setCurrentUser,
  clearCurrentUser,
  isAuthenticated,
} from '@/lib/auth';

describe('Auth Flow Integration', () => {
  beforeEach(() => {
    // Use real localStorage for integration tests
    localStorage.clear();
  });

  it('should complete full authentication flow', async () => {
    // Initially not authenticated
    expect(isAuthenticated()).toBe(false);
    expect(getCurrentUserId()).toBeNull();
    expect(getCurrentUsername()).toBeNull();

    // Set user
    setCurrentUser('user-123', 'testuser');

    // Should now be authenticated
    expect(isAuthenticated()).toBe(true);
    expect(getCurrentUserId()).toBe('user-123');
    expect(getCurrentUsername()).toBe('testuser');

    // Clear user
    clearCurrentUser();

    // Should no longer be authenticated
    expect(isAuthenticated()).toBe(false);
    expect(getCurrentUserId()).toBeNull();
    expect(getCurrentUsername()).toBeNull();
  });

  it('should persist user data across multiple calls', () => {
    setCurrentUser('user-456', 'anotheruser');

    // Multiple calls should return same data
    expect(getCurrentUserId()).toBe('user-456');
    expect(getCurrentUserId()).toBe('user-456');
    expect(getCurrentUsername()).toBe('anotheruser');
    expect(getCurrentUsername()).toBe('anotheruser');
    expect(isAuthenticated()).toBe(true);
    expect(isAuthenticated()).toBe(true);
  });

  it('should handle user update correctly', () => {
    setCurrentUser('user-1', 'user1');
    expect(getCurrentUserId()).toBe('user-1');
    expect(getCurrentUsername()).toBe('user1');

    // Update to new user
    setCurrentUser('user-2', 'user2');
    expect(getCurrentUserId()).toBe('user-2');
    expect(getCurrentUsername()).toBe('user2');
  });
});

