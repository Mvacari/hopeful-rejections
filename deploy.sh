#!/bin/bash

# Vercel Deployment Script
# Make sure you're logged in: npx vercel login

echo "🚀 Deploying Hopeful Rejections to Vercel..."

# Check if vercel is authenticated
if ! npx vercel@latest whoami &>/dev/null; then
    echo "❌ Not authenticated with Vercel"
    echo "Please run: npx vercel login"
    exit 1
fi

# Deploy to production
echo "📦 Deploying..."
npx vercel@latest --prod --yes

echo "✅ Deployment complete!"
echo ""
echo "⚠️  Don't forget to:"
echo "1. Add environment variables in Vercel dashboard:"
echo "   - NEXT_PUBLIC_SUPABASE_URL=https://foncszywtxidjfpmqyah.supabase.co"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvbmNzenl3dHhpZGpmcG1xeWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3ODg4NzYsImV4cCI6MjA4NDM2NDg3Nn0.BDCl2lNFrYcdlrTfqOfwYAUPDZC_v1jmdKeocqwkGYc"
echo "2. Update Supabase redirect URLs with your Vercel domain"

