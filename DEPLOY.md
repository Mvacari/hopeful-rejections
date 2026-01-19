# Deploy to Vercel

## Quick Deploy

1. **Authenticate with Vercel** (one-time setup):
   ```bash
   npx vercel login
   ```

2. **Deploy**:
   ```bash
   ./deploy.sh
   ```
   
   Or manually:
   ```bash
   npx vercel --prod --yes
   ```

## Environment Variables

After deployment, add these in Vercel Dashboard → Settings → Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`: `https://foncszywtxidjfpmqyah.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvbmNzenl3dHhpZGpmcG1xeWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3ODg4NzYsImV4cCI6MjA4NDM2NDg3Nn0.BDCl2lNFrYcdlrTfqOfwYAUPDZC_v1jmdKeocqwkGYc`

## Supabase Configuration

After getting your Vercel URL, update Supabase:
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL to "Redirect URLs"
3. Add `https://your-app.vercel.app/auth/callback` to allowed redirects
