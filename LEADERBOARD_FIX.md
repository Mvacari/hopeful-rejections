# Leaderboard Group Points Fix

## Problem

The leaderboard was not displaying points from groups correctly. When users viewed the leaderboard, their points were not being aggregated, resulting in incorrect or zero point totals.

## Root Cause

The `get_leaderboard` database function had an **ambiguous column reference error** in the SQL query. Specifically, in this subquery:

```sql
WHERE p_group_id IS NULL 
  OR u.id IN (SELECT user_id FROM public.group_members WHERE group_id = p_group_id AND is_active = true)
```

The column `user_id` was ambiguous because it could refer to either:
1. The `user_id` column in the `group_members` table
2. A potential variable named `user_id` in the function scope

This caused the PostgreSQL query to fail with error:
```
ERROR: 42702: column reference "user_id" is ambiguous
DETAIL: It could refer to either a PL/pgSQL variable or a table column.
```

## Solution

Fixed the ambiguous column reference by explicitly qualifying the column with the table alias:

**Before:**
```sql
OR u.id IN (SELECT user_id FROM public.group_members WHERE group_id = p_group_id AND is_active = true)
```

**After:**
```sql
OR u.id IN (
  SELECT gm.user_id 
  FROM public.group_members gm 
  WHERE gm.group_id = p_group_id AND gm.is_active = true
)
```

Additionally, the RETURN columns were explicitly aliased to prevent any future ambiguity:

```sql
SELECT 
  u.id as user_id,  -- Explicitly alias as user_id
  u.username,
  u.avatar_url,
  COALESCE(SUM(r.points), 0)::BIGINT as total_points,
  RANK() OVER (ORDER BY COALESCE(SUM(r.points), 0) DESC) as rank
```

## Changes Made

1. **Database Migration**: `fix_get_leaderboard_ambiguous_column.sql`
   - Dropped and recreated the `get_leaderboard` function
   - Fixed the ambiguous column reference
   - Updated existing users with null usernames to use their email

2. **Integration Tests**: `tests/integration/leaderboard-group-points.test.tsx`
   - Tests point aggregation for group leaderboard
   - Tests timeframe filtering (daily, weekly, monthly, all)
   - Tests that only active group members appear in group leaderboard

## Verification

After the fix was applied:

### Before Fix
```
ERROR: column reference "user_id" is ambiguous
```

### After Fix
```json
[
  {
    "user_id": "fb014710-8d2d-4168-9634-24fc8e2dc794",
    "username": "Mika",
    "avatar_url": null,
    "total_points": 1,
    "rank": 1
  },
  {
    "user_id": "39eb25de-5042-43b2-adad-9c9305dce5a2",
    "username": "faboweber@gmail.com",
    "avatar_url": null,
    "total_points": 1,
    "rank": 1
  }
]
```

## Testing

Run the integration tests:
```bash
npm run test:integration -- tests/integration/leaderboard-group-points.test.tsx
```

## Related Issues

This fix also addresses the username defaulting issue. As part of the fix, existing users with `null` usernames were updated to use their email addresses, ensuring no "Anonymous" users appear in the leaderboard.

## Migration Applied

The migration was successfully applied to the Supabase database on: `2026-01-19`

Migration name: `fix_get_leaderboard_drop_and_recreate`

