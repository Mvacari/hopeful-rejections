# Hopeful Rejections

A mobile-first web application for tracking rejections with friends and competing on leaderboards. Built with Next.js and Supabase.

## Features

- **Magic Link Authentication** - Passwordless login via email
- **Group Management** - Create groups and invite friends via shareable links
- **Rejection Tracking** - Log rejections with a simple sentence or two
- **Leaderboards** - Compete with daily, weekly, monthly, and all-time rankings
- **Selfie Avatars** - Capture profile photos directly from your device camera
- **Mobile-First Design** - Optimized for mobile devices with a clean, Pinterest/Duolingo-inspired UI

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://foncszywtxidjfpmqyah.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_jODudwn2wMA8xmqrPR5c1g_YqxHHXPl
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── leaderboard/       # Leaderboard page
│   ├── groups/            # Group management
│   ├── rejections/        # Rejection entry pages
│   └── invite/            # Invite link pages
├── components/            # React components
├── lib/                   # Utility functions
│   ├── supabase/         # Supabase client setup
│   └── db/               # Database queries and mutations
└── types/                # TypeScript type definitions
```

## Supabase Setup

The Supabase project has been created with:
- Database tables: users, groups, group_members, rejections
- Row Level Security (RLS) policies
- Storage bucket for avatars
- Database functions for leaderboard calculations

## Deployment

The app can be deployed to Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables
4. Deploy

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Deployment**: Vercel (recommended)
