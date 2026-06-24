#!/bin/bash

echo "🌱 GardenGuard → GitHub Setup"
echo "=============================="
echo ""

# Get GitHub username
read -p "Enter your GitHub username: " GH_USER
if [ -z "$GH_USER" ]; then
  echo "❌ Username required"
  exit 1
fi

# Get repo name (default: gardenguard)
read -p "Enter repo name (default: gardenguard): " REPO_NAME
REPO_NAME=${REPO_NAME:-gardenguard}

# Get GitHub token (personal access token)
echo ""
echo "Generate a token at: https://github.com/settings/tokens"
echo "  → Select 'repo' scope"
echo "  → Copy the token and paste below"
echo ""
read -sp "Paste your GitHub token: " GH_TOKEN
echo ""

if [ -z "$GH_TOKEN" ]; then
  echo "❌ Token required"
  exit 1
fi

# Create repo via GitHub API
echo ""
echo "📝 Creating GitHub repository..."
REPO_URL="https://api.github.com/user/repos"
RESPONSE=$(curl -s -X POST "$REPO_URL" \
  -H "Authorization: token $GH_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -d "{\"name\":\"$REPO_NAME\",\"private\":false,\"description\":\"Community-driven scammer watchlist for Grow a Garden 2\"}")

if echo "$RESPONSE" | grep -q "\"id\""; then
  echo "✅ Repository created!"
else
  echo "⚠️  Repo may already exist (or error). Continuing anyway..."
fi

# Push code
echo ""
echo "📤 Pushing code to GitHub..."
REMOTE_URL="https://${GH_USER}:${GH_TOKEN}@github.com/${GH_USER}/${REPO_NAME}.git"

git init
git add .
git commit -m "Initial commit: GardenGuard source code"
git branch -M main
git remote add origin "$REMOTE_URL"
git push -u origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Done! Your code is on GitHub:"
  echo "   🔗 https://github.com/$GH_USER/$REPO_NAME"
  echo ""
  echo "Next steps:"
  echo "  1. Go to your repo settings → Pages"
  echo "  2. Enable GitHub Pages from 'main' branch"
  echo "  3. Or deploy to Netlify/Vercel"
  echo ""
  echo "Stay safe out there! 🛡️"
else
  echo ""
  echo "❌ Push failed. Check your token and try again."
  exit 1
fi
