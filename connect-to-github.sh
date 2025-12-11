#!/bin/bash

# Script to connect local repository to GitHub
# Usage: ./connect-to-github.sh [username] [repo-name]

echo "Connecting to GitHub..."
echo ""

# Check if username and repo are provided as arguments
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: $0 <github-username> <repository-name>"
    echo "Example: $0 myusername my-repo"
    echo ""
    read -p "Enter your GitHub username: " GITHUB_USERNAME
    read -p "Enter your repository name: " REPO_NAME
else
    GITHUB_USERNAME="$1"
    REPO_NAME="$2"
fi

# Validate inputs
if [ -z "$GITHUB_USERNAME" ] || [ -z "$REPO_NAME" ]; then
    echo "❌ Error: Username and repository name are required"
    exit 1
fi

# Check if remote already exists
if git remote get-url origin >/dev/null 2>&1; then
    echo "⚠️  Remote 'origin' already exists:"
    git remote get-url origin
    echo ""
    read -p "Do you want to update it? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote set-url origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
    else
        echo "Keeping existing remote."
        exit 0
    fi
else
    # Add remote (HTTPS)
    git remote add origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
fi

# Verify remote was added
echo ""
echo "Remote configured:"
git remote -v

echo ""
echo "✅ Ready to push! Run: git push -u origin main"
echo ""
echo "Or use the helper script: ./push-to-github.sh"

