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

### Deploy to Vercel

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Deploy from the project root**:
   ```bash
   vercel
   ```
   
   Follow the prompts to:
   - Link to an existing project or create a new one
   - Set up the project

3. **Set Environment Variables in Vercel Dashboard**:
   - Go to your project settings → Environment Variables
   - Add these variables:
     - `NEXT_PUBLIC_SUPABASE_URL`: `https://foncszywtxidjfpmqyah.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvbmNzenl3dHhpZGpmcG1xeWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3ODg4NzYsImV4cCI6MjA4NDM2NDg3Nn0.BDCl2lNFrYcdlrTfqOfwYAUPDZC_v1jmdKeocqwkGYc`

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### Alternative: Deploy via GitHub

1. Push your code to a GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Add the environment variables (same as above)
6. Click "Deploy"

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Deployment**: Vercel (recommended)
