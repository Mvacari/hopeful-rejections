#!/bin/bash

# GitHub Setup Script for Hopeful Rejections
# This script will help you push to GitHub and deploy to Vercel

set -e

echo "🚀 Setting up GitHub deployment for Hopeful Rejections"
echo ""

# Check if GitHub CLI is installed
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found"
    
    # Check if authenticated
    if gh auth status &>/dev/null; then
        echo "✅ GitHub CLI authenticated"
        
        # Create repository
        echo "📦 Creating GitHub repository..."
        REPO_NAME="hopeful-rejections"
        gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
        
        echo ""
        echo "✅ Repository created and code pushed!"
        echo ""
        echo "🌐 Next steps:"
        echo "1. Go to https://vercel.com/new"
        echo "2. Import your repository: https://github.com/$(gh api user --jq .login)/$REPO_NAME"
        echo "3. Add environment variables (see GITHUB_DEPLOY.md)"
        echo "4. Deploy!"
    else
        echo "❌ GitHub CLI not authenticated"
        echo "Please run: gh auth login"
        exit 1
    fi
else
    echo "📝 GitHub CLI not found. Using manual setup..."
    echo ""
    echo "Please:"
    echo "1. Create a repository at https://github.com/new"
    echo "2. Name it: hopeful-rejections"
    echo "3. Don't initialize with README"
    echo "4. Then run:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/hopeful-rejections.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
fi

