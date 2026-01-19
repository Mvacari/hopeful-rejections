import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import RejectionCard from '@/components/RejectionCard';
import { Rejection, User } from '@/types/database';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', { src, alt, ...props });
  },
}));

describe('RejectionCard', () => {
  const mockUser: User = {
    id: 'user-1',
    username: 'testuser',
    avatar_url: null,
    created_at: '2024-01-01T00:00:00Z',
  };

  const mockRejection: Rejection = {
    id: 'rejection-1',
    user_id: 'user-1',
    group_id: 'group-1',
    description: 'This is a test rejection',
    created_at: new Date().toISOString(),
    points: 1,
  };

  it('should render rejection card with username', () => {
    render(<RejectionCard rejection={{ ...mockRejection, users: mockUser }} />);
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('should render rejection description', () => {
    render(<RejectionCard rejection={{ ...mockRejection, users: mockUser }} />);
    expect(screen.getByText('This is a test rejection')).toBeInTheDocument();
  });

  it('should render avatar initial when no avatar_url', () => {
    render(<RejectionCard rejection={{ ...mockRejection, users: mockUser }} />);
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('should render avatar image when avatar_url is provided', () => {
    const userWithAvatar = { ...mockUser, avatar_url: 'https://example.com/avatar.jpg' };
    render(<RejectionCard rejection={{ ...mockRejection, users: userWithAvatar }} />);
    const img = screen.getByAltText('testuser');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('should display formatted date', () => {
    render(<RejectionCard rejection={{ ...mockRejection, users: mockUser }} />);
    // The date should be rendered (formatDate returns various formats)
    const dateElement = screen.getByText(/ago|just now/);
    expect(dateElement).toBeInTheDocument();
  });
});

