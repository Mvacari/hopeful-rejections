# Supabase Redirect URLs Configuration

## Your Vercel Deployment URLs

- **Production**: `https://hopeful-rejections.vercel.app`
- **Callback**: `https://hopeful-rejections.vercel.app/auth/callback`
- **Preview URLs**: `https://*-vacarimihaela-4838s-projects.vercel.app/**`

## How to Update Supabase Redirect URLs

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/foncszywtxidjfpmqyah
2. Navigate to: **Authentication** → **URL Configuration**
3. Update the following:

### Site URL
Set to: `https://hopeful-rejections.vercel.app`

### Redirect URLs (Additional Redirect URLs)
Add these URLs (one per line):

```
https://hopeful-rejections.vercel.app/**
https://hopeful-rejections.vercel.app/auth/callback
https://*-vacarimihaela-4838s-projects.vercel.app/**
http://localhost:3000/**
```

The wildcard pattern `**` allows all paths under that domain, which is useful for:
- Preview deployments from Vercel
- Different routes in your app
- Development environment

## Why These URLs?

- `https://hopeful-rejections.vercel.app/**` - Main production domain with all paths
- `https://hopeful-rejections.vercel.app/auth/callback` - Specific callback route
- `https://*-vacarimihaela-4838s-projects.vercel.app/**` - Vercel preview deployments
- `http://localhost:3000/**` - Local development

## After Updating

Once you've added these URLs, your authentication flow will work correctly:
- Magic link emails will redirect to your Vercel app
- OAuth callbacks will work properly
- Preview deployments will also work

