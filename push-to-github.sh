#!/bin/bash

# Script to push to GitHub using Personal Access Token
# Usage: ./push-to-github.sh

# Get GitHub username and repo from remote URL
REMOTE_URL=$(git remote get-url origin 2>/dev/null)
if [ -z "$REMOTE_URL" ]; then
    echo "❌ Error: No remote 'origin' configured."
    echo "Run: git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    exit 1
fi

# Extract username and repo name from remote URL
GITHUB_USERNAME=$(echo "$REMOTE_URL" | sed -E 's|.*github.com[:/]([^/]+)/.*|\1|')
REPO_NAME=$(echo "$REMOTE_URL" | sed -E 's|.*github.com[:/][^/]+/([^/]+)(\.git)?$|\1|')

echo "🚀 Pushing to GitHub..."
echo ""
echo "Repository: $GITHUB_USERNAME/$REPO_NAME"
echo ""
echo "If prompted for credentials:"
echo "  Username: $GITHUB_USERNAME"
echo "  Password: [Your Personal Access Token]"
echo ""
echo "Don't have a token? Create one at: https://github.com/settings/tokens"
echo "Select 'repo' scope for full repository access."
echo ""
echo "Press Enter to continue or Ctrl+C to cancel..."
read

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "View your repository at: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
else
    echo ""
    echo "❌ Push failed. Make sure you have:"
    echo "  1. Created a Personal Access Token"
    echo "  2. Entered correct credentials when prompted"
    echo ""
    echo "Get help: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens"
fi

