#!/bin/bash

# Quick Push Script for ahmednagenoufal.com
# Created by: AHMED NAGEH
# Date: 2025-12-10

echo "============================================"
echo "🚀 Quick Push to GitHub"
echo "============================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    exit 1
fi

echo -e "${BLUE}📂 Current directory: $(pwd)${NC}"
echo ""

# Show current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}🌿 Current branch: ${GREEN}${CURRENT_BRANCH}${NC}"
echo ""

# Show commits to push
COMMITS_AHEAD=$(git rev-list --count @{u}..HEAD 2>/dev/null || echo "0")
echo -e "${BLUE}📊 Commits to push: ${GREEN}${COMMITS_AHEAD}${NC}"
echo ""

if [ "$COMMITS_AHEAD" = "0" ]; then
    echo -e "${YELLOW}⚠️  No commits to push${NC}"
    exit 0
fi

# Show last 5 commits
echo -e "${BLUE}📝 Last 5 commits:${NC}"
git log --oneline -5
echo ""

# Check git status
echo -e "${BLUE}📋 Git status:${NC}"
git status -s
echo ""

# Ask for confirmation
echo -e "${YELLOW}⚠️  Ready to push ${COMMITS_AHEAD} commits to origin/${CURRENT_BRANCH}?${NC}"
echo -e "${YELLOW}   This will push to: https://github.com/ahmednageh373-gif/ahmednagenoufal.git${NC}"
echo ""
read -p "Continue? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Push cancelled${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🚀 Pushing to remote...${NC}"
echo ""

# Try to push
if git push origin "$CURRENT_BRANCH"; then
    echo ""
    echo -e "${GREEN}✅ Successfully pushed to origin/${CURRENT_BRANCH}!${NC}"
    echo ""
    echo -e "${BLUE}📌 Next steps:${NC}"
    echo -e "   1. Go to: ${GREEN}https://github.com/ahmednageh373-gif/ahmednagenoufal${NC}"
    echo -e "   2. Create a Pull Request from ${GREEN}${CURRENT_BRANCH}${NC} to ${GREEN}main${NC}"
    echo -e "   3. Review and merge the PR"
    echo -e "   4. Deploy will happen automatically via Cloudflare Pages"
    echo ""
    echo -e "${GREEN}🎉 Done!${NC}"
else
    echo ""
    echo -e "${RED}❌ Push failed!${NC}"
    echo ""
    echo -e "${YELLOW}💡 Possible solutions:${NC}"
    echo ""
    echo -e "${BLUE}1. Use Personal Access Token:${NC}"
    echo -e "   ${YELLOW}git remote set-url origin https://YOUR_TOKEN@github.com/ahmednageh373-gif/ahmednagenoufal.git${NC}"
    echo -e "   ${YELLOW}git push origin ${CURRENT_BRANCH}${NC}"
    echo ""
    echo -e "${BLUE}2. Generate token at:${NC}"
    echo -e "   ${GREEN}https://github.com/settings/tokens${NC}"
    echo -e "   Select: ${YELLOW}repo (full control)${NC}"
    echo ""
    echo -e "${BLUE}3. Or use SSH:${NC}"
    echo -e "   ${YELLOW}git remote set-url origin git@github.com:ahmednageh373-gif/ahmednagenoufal.git${NC}"
    echo -e "   ${YELLOW}git push origin ${CURRENT_BRANCH}${NC}"
    echo ""
    echo -e "${BLUE}4. Or use GitHub Desktop / VSCode Git${NC}"
    echo ""
    exit 1
fi

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}✨ Push Complete! ✨${NC}"
echo -e "${BLUE}============================================${NC}"
