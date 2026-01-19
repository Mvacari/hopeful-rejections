import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cn, formatDate } from '@/lib/utils';

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('should merge Tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });
});

describe('formatDate utility', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return "just now" for dates less than 1 minute ago', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    vi.setSystemTime(now);
    const date = new Date('2024-01-01T11:59:30Z');
    expect(formatDate(date)).toBe('just now');
  });

  it('should return minutes ago for dates less than 60 minutes', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    vi.setSystemTime(now);
    const date = new Date('2024-01-01T11:45:00Z');
    expect(formatDate(date)).toBe('15m ago');
  });

  it('should return hours ago for dates less than 24 hours', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    vi.setSystemTime(now);
    const date = new Date('2024-01-01T10:00:00Z');
    expect(formatDate(date)).toBe('2h ago');
  });

  it('should return days ago for dates less than 7 days', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    vi.setSystemTime(now);
    const date = new Date('2023-12-30T12:00:00Z');
    expect(formatDate(date)).toBe('2d ago');
  });

  it('should return formatted date for dates older than 7 days', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    vi.setSystemTime(now);
    const date = new Date('2023-12-01T12:00:00Z');
    const result = formatDate(date);
    expect(result).toMatch(/Dec \d+/);
  });

  it('should handle string dates', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    vi.setSystemTime(now);
    expect(formatDate('2024-01-01T11:30:00Z')).toBe('30m ago');
  });
});

