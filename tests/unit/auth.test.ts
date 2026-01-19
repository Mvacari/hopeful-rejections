import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getCurrentUserId,
  getCurrentUsername,
  setCurrentUser,
  clearCurrentUser,
  isAuthenticated,
} from '@/lib/auth';

describe('Auth utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Mock window object for SSR safety
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  describe('getCurrentUserId', () => {
    it('should return null when no user is stored', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
      expect(getCurrentUserId()).toBeNull();
    });

    it('should return userId from localStorage', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('user-123');
      expect(getCurrentUserId()).toBe('user-123');
    });
  });

  describe('getCurrentUsername', () => {
    it('should return null when no username is stored', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
      expect(getCurrentUsername()).toBeNull();
    });

    it('should return username from localStorage', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('testuser');
      expect(getCurrentUsername()).toBe('testuser');
    });
  });

  describe('setCurrentUser', () => {
    it('should store userId and username in localStorage', () => {
      setCurrentUser('user-123', 'testuser');
      expect(localStorage.setItem).toHaveBeenCalledWith('userId', 'user-123');
      expect(localStorage.setItem).toHaveBeenCalledWith('username', 'testuser');
    });
  });

  describe('clearCurrentUser', () => {
    it('should remove userId and username from localStorage', () => {
      clearCurrentUser();
      expect(localStorage.removeItem).toHaveBeenCalledWith('userId');
      expect(localStorage.removeItem).toHaveBeenCalledWith('username');
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no user is stored', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
      expect(isAuthenticated()).toBe(false);
    });

    it('should return true when user is stored', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('user-123');
      expect(isAuthenticated()).toBe(true);
    });
  });
});

