-- Fix get_leaderboard function to resolve ambiguous column reference
-- This migration fixes the issue where the leaderboard was not retrieving points from groups
-- The problem was an ambiguous reference to 'user_id' in the subquery

DROP FUNCTION IF EXISTS get_leaderboard(uuid, text);

CREATE OR REPLACE FUNCTION get_leaderboard(p_group_id UUID, p_timeframe TEXT)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  total_points BIGINT,
  rank BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
  start_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Determine start date based on timeframe
  CASE p_timeframe
    WHEN 'daily' THEN start_date := date_trunc('day', NOW());
    WHEN 'weekly' THEN start_date := date_trunc('week', NOW());
    WHEN 'monthly' THEN start_date := date_trunc('month', NOW());
    ELSE start_date := '1970-01-01'::timestamp;
  END CASE;

  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.username,
    u.avatar_url,
    COALESCE(SUM(r.points), 0)::BIGINT as total_points,
    RANK() OVER (ORDER BY COALESCE(SUM(r.points), 0) DESC) as rank
  FROM public.users u
  LEFT JOIN public.rejections r ON r.user_id = u.id
    AND (p_group_id IS NULL OR r.group_id = p_group_id)
    AND r.created_at >= start_date
  WHERE p_group_id IS NULL 
    OR u.id IN (
      SELECT gm.user_id 
      FROM public.group_members gm 
      WHERE gm.group_id = p_group_id AND gm.is_active = true
    )
  GROUP BY u.id, u.username, u.avatar_url
  ORDER BY total_points DESC;
END;
$$;

-- Update existing users with null username to use their email address
UPDATE users u
SET username = au.email
FROM auth.users au
WHERE u.id = au.id AND u.username IS NULL;

