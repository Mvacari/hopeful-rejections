import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSimpleMockSupabase } from '../utils/supabase-helpers';
import { User, Group, Rejection } from '@/types/database';

describe('Supabase Integration Tests', () => {
  let mock: ReturnType<typeof createSimpleMockSupabase>;

  beforeEach(() => {
    mock = createSimpleMockSupabase();
    vi.mock('@/lib/supabase/client', () => ({
      createClient: () => mock.client,
    }));
  });

  describe('User Operations', () => {
    it('should query users from Supabase', async () => {
      const mockUsers: User[] = [
        {
          id: 'user-1',
          username: 'alice',
          avatar_url: null,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'user-2',
          username: 'bob',
          avatar_url: 'https://example.com/avatar.jpg',
          created_at: '2024-01-02T00:00:00Z',
        },
      ];

      mock.setData('users', mockUsers);

      const result = await mock.client.from('users').select('*');
      expect(result.data).toEqual(mockUsers);
      expect(result.error).toBeNull();
    });

    it('should filter users by id', async () => {
      const mockUsers: User[] = [
        {
          id: 'user-1',
          username: 'alice',
          avatar_url: null,
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      mock.setData('users', mockUsers);

      const result = await mock.client.from('users').select('*').eq('id', 'user-1').single();
      expect(result.data).toEqual(mockUsers[0]);
      expect(result.error).toBeNull();
    });
  });

  describe('Group Operations', () => {
    it('should create a group', async () => {
      const newGroup: Group = {
        id: 'group-1',
        name: 'Test Group',
        invite_code: 'ABC123',
        created_by: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = await mock.client.from('groups').insert(newGroup).select().single();
      expect(result.data).toMatchObject({
        name: newGroup.name,
        invite_code: newGroup.invite_code,
        created_by: newGroup.created_by,
      });
      expect(result.data.id).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should handle errors when creating group', async () => {
      const error = { message: 'Duplicate group name', code: '23505' };
      mock.setError('groups_insert', error);

      const result = await mock.client.from('groups').insert({ name: 'Test' }).select().single();
      expect(result.error).toEqual(error);
      expect(result.data).toBeNull();
    });
  });

  describe('Rejection Operations', () => {
    it('should create a rejection', async () => {
      const newRejection: Rejection = {
        id: 'rejection-1',
        user_id: 'user-1',
        group_id: 'group-1',
        description: 'Got rejected from my dream job',
        created_at: '2024-01-01T00:00:00Z',
        points: 1,
      };

      const result = await mock.client.from('rejections').insert(newRejection).select().single();
      expect(result.data).toMatchObject({
        user_id: newRejection.user_id,
        group_id: newRejection.group_id,
        description: newRejection.description,
        points: newRejection.points,
      });
      expect(result.data.id).toBeDefined();
    });

    it('should query rejections with ordering and limit', async () => {
      const mockRejections: Rejection[] = [
        {
          id: 'rejection-1',
          user_id: 'user-1',
          group_id: 'group-1',
          description: 'Rejection 1',
          created_at: '2024-01-01T00:00:00Z',
          points: 1,
        },
        {
          id: 'rejection-2',
          user_id: 'user-2',
          group_id: 'group-1',
          description: 'Rejection 2',
          created_at: '2024-01-02T00:00:00Z',
          points: 1,
        },
      ];

      mock.setData('rejections', mockRejections);

      const result = await mock.client
        .from('rejections')
        .select('*')
        .eq('group_id', 'group-1')
        .order('created_at', { ascending: false })
        .limit(10);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('rejection-2'); // Most recent first
      expect(result.error).toBeNull();
    });
  });

  describe('Authentication', () => {
    it('should get authenticated user', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      };

      mock.client.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await mock.client.auth.getUser();
      expect(result.data.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('should handle authentication errors', async () => {
      const error = { message: 'Invalid token', code: 'invalid_token' };
      mock.client.auth.getUser.mockResolvedValue({
        data: { user: null },
        error,
      });

      const result = await mock.client.auth.getUser();
      expect(result.error).toEqual(error);
      expect(result.data.user).toBeNull();
    });
  });
});

