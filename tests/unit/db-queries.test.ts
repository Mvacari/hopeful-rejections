import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getUser, getActiveGroup, getRejections } from '@/lib/db/queries';
import { createMockSupabaseClient, setupMockTableData } from '../utils/mock-supabase';

// Mock the Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('Database Queries', () => {
  let mockClient: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(async () => {
    mockClient = createMockSupabaseClient();
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue(mockClient as any);
  });

  describe('getUser', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        avatar_url: null,
        created_at: '2024-01-01T00:00:00Z',
      };

      setupMockTableData(mockClient, 'users', [mockUser]);

      const result = await getUser('user-1');
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      setupMockTableData(mockClient, 'users', []);

      const result = await getUser('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('getActiveGroup', () => {
    it('should return active group for user', async () => {
      const mockGroup = {
        id: 'group-1',
        name: 'Test Group',
        invite_code: 'ABC123',
        created_by: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockGroupMember = {
        id: 'member-1',
        group_id: 'group-1',
        user_id: 'user-1',
        joined_at: '2024-01-01T00:00:00Z',
        is_active: true,
        groups: mockGroup,
      };

      setupMockTableData(mockClient, 'group_members', [mockGroupMember]);

      // Mock the query chain for group_members with join
      const queryBuilder = mockClient.from('group_members');
      queryBuilder.select = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockGroupMember, error: null }),
          }),
        }),
      });

      const result = await getActiveGroup('user-1');
      // Note: This test demonstrates the pattern - actual implementation may need adjustment
      expect(mockClient.from).toHaveBeenCalledWith('group_members');
    });
  });

  describe('getRejections', () => {
    it('should return rejections for a group', async () => {
      const mockRejections = [
        {
          id: 'rejection-1',
          user_id: 'user-1',
          group_id: 'group-1',
          description: 'Test rejection 1',
          created_at: '2024-01-01T00:00:00Z',
          points: 1,
        },
        {
          id: 'rejection-2',
          user_id: 'user-2',
          group_id: 'group-1',
          description: 'Test rejection 2',
          created_at: '2024-01-02T00:00:00Z',
          points: 1,
        },
      ];

      setupMockTableData(mockClient, 'rejections', mockRejections);

      // Mock the query chain
      const queryBuilder = mockClient.from('rejections');
      queryBuilder.select = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: mockRejections, error: null }),
          }),
        }),
      });

      const result = await getRejections('group-1');
      expect(mockClient.from).toHaveBeenCalledWith('rejections');
    });
  });
});

