# Deploy via GitHub to Vercel

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `hopeful-rejections`
3. **Don't** initialize with README, .gitignore, or license (we already have these)

## Step 2: Push Code to GitHub

Run these commands in your terminal:

```bash
cd "/Users/mihaelavacari/hopeful rejections"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/hopeful-rejections.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Connect to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `hopeful-rejections` repository
4. Click "Import"

## Step 4: Configure Vercel Project

1. **Project Name**: `hopeful-rejections` (or your choice)
2. **Framework Preset**: Next.js (auto-detected)
3. **Root Directory**: `./` (default)
4. **Build Command**: `npm run build` (default)
5. **Output Directory**: `.next` (default)

## Step 5: Add Environment Variables

Before deploying, add these environment variables in Vercel:

1. Click "Environment Variables"
2. Add these two variables:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://foncszywtxidjfpmqyah.supabase.co`
   - Environment: Production, Preview, Development (select all)

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvbmNzenl3dHhpZGpmcG1xeWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3ODg4NzYsImV4cCI6MjA4NDM2NDg3Nn0.BDCl2lNFrYcdlrTfqOfwYAUPDZC_v1jmdKeocqwkGYc`
   - Environment: Production, Preview, Development (select all)

## Step 6: Deploy

1. Click "Deploy"
2. Wait for the deployment to complete
3. Your app will be live at `https://hopeful-rejections.vercel.app` (or your custom domain)

## Step 7: Update Supabase Redirect URLs

After deployment, update Supabase:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL to "Redirect URLs":
   - `https://hopeful-rejections.vercel.app`
   - `https://hopeful-rejections.vercel.app/auth/callback`
   - `https://*.vercel.app` (for preview deployments)

## Automatic Deployments

Once connected, every push to `main` branch will automatically trigger a new deployment!

## Troubleshooting

- If build fails, check the build logs in Vercel dashboard
- Make sure environment variables are set correctly
- Verify Supabase redirect URLs include your Vercel domain
