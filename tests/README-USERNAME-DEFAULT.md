# Username Defaults to Email - Test Documentation

This document describes the test suite for the username defaulting to email feature.

## Feature Overview

When a user signs up for the application, their username is automatically set to their email address. This provides several benefits:
- Users have an identifiable username immediately upon signup
- No need to prompt users for a separate username during registration
- Reduces friction in the signup process
- Users can still update their username later if desired

## Implementation

The feature is implemented via a database trigger (`handle_new_user()`) that executes when a new user is inserted into the `auth.users` table. The trigger automatically creates a user profile entry in the `public.users` table with the username set to the user's email address.

**Migration File:** `supabase/migrations/create_user_profile_trigger.sql`

## Test Suite

### E2E Tests (Playwright)
**File:** `tests/e2e/username-defaults-to-email.spec.ts`

Tests the complete user flow from signup to username display:
1. **Username display after signup** - Verifies that after signing up, the user's email is displayed as their username on the dashboard
2. **Leaderboard display** - Ensures email is shown in leaderboard entries
3. **No "Anonymous" fallback** - Confirms that users never see "Anonymous" when username defaults to email

**How to run:**
```bash
npm run test:e2e
```

### Integration Tests
**File:** `tests/integration/username-email-default.test.tsx`

Tests the database and API integration:
1. **User profile creation** - Verifies that the database trigger correctly sets username to email
2. **Query by username** - Tests that users can be found by their email username
3. **Leaderboard data** - Ensures leaderboard queries return email as username

**How to run:**
```bash
npm run test:integration
```

### Unit Tests
**File:** `tests/unit/username-generation.test.ts`

Tests the username generation and display logic:
1. **Email formats** - Tests various email formats (plus addressing, subdomains, numbers, hyphens)
2. **Display fallback** - Tests the fallback logic for displaying usernames
3. **Avatar initials** - Tests that the first character of email is used for avatar initials

**How to run:**
```bash
npm run test:unit -- tests/unit/username-generation.test.ts
```

## Verification

To manually verify the feature is working:

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000/login`
3. Sign up with a new email address
4. After signup, you should see your email displayed as your username
5. Check the leaderboard to see your email there as well

## Database Changes

The migration updates the `handle_new_user()` function to:
```sql
create or replace function public.handle_new_user()
returns trigger
set search_path = ''
as $$
begin
  insert into public.users (id, username, created_at)
  values (new.id, new.email, new.created_at);
  return new;
end;
$$ language plpgsql security definer;
```

The key change is `new.email` instead of `null` for the username value.

## Future Enhancements

- Add ability for users to update their username in profile settings
- Add validation to ensure custom usernames are unique
- Consider extracting just the local part of email (before @) as an option

