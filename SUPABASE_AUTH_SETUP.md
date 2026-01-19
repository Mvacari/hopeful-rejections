# Supabase Email/Password Authentication Setup

This document outlines the manual steps needed to complete the Supabase email/password authentication setup.

## Manual Steps Required

### 1. ✅ Database Migration - COMPLETED

The database migration has been successfully applied! This includes:
- Made the `username` column nullable (optional)
- Created a trigger that automatically creates a user profile when someone signs up via Supabase Auth
- Username defaults to the user's email address upon signup

The migration was applied using the Supabase MCP tools.

### 2. Disable Email Confirmation

To allow immediate signup without email verification:

1. Go to Supabase Dashboard → Authentication → Providers
2. Click on "Email" provider
3. Find "Confirm email" setting
4. **Disable** "Confirm email"
5. Save changes

This allows users to sign up and immediately sign in without needing to verify their email.

### 3. Update Redirect URLs (if needed)

If you're deploying to production:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your production URL to "Redirect URLs"
3. Ensure `http://localhost:3000` is included for local development

## What Was Implemented

✅ Supabase client setup (client.ts and server.ts)  
✅ Middleware for session refresh  
✅ Login page with email/password forms  
✅ Server Actions for login and signup  
✅ Sign out route handler  
✅ Protected pages updated to use server-side auth  
✅ Database queries updated to use Supabase Auth  
✅ Database trigger for auto-creating user profiles  
✅ Old auth code cleaned up  

## Testing

After completing the manual steps above, test the authentication flow:

1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. You should be redirected to `/login`
4. Try signing up with a new email/password
5. You should be immediately signed in and redirected to `/dashboard`
6. Try signing out
7. Try signing in with the same credentials

## Notes

- Username defaults to the user's email address when they sign up
- Users can update their username later in their profile if desired
- All authentication now uses Supabase Auth with secure HTTP-only cookies
- No more localStorage for authentication
- Server-side session validation on all protected routes

