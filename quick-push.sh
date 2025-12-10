#!/bin/bash

# Quick Push Script for NOUFAL EMS
# Developer: AHMED NAGEH
# Date: 2025-12-10

echo "=================================================="
echo "🚀 NOUFAL EMS - Quick Push to Production"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Navigate to project directory
cd /home/user/webapp || exit 1

echo -e "${BLUE}📋 Current Status:${NC}"
echo "Branch: $(git branch --show-current)"
echo "Commits ahead: $(git rev-list --count origin/genspark_ai_developer..HEAD 2>/dev/null || echo '0')"
echo ""

echo -e "${YELLOW}📊 Recent Commits:${NC}"
git log --oneline -5
echo ""

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${RED}⚠️  AUTHENTICATION REQUIRED ⚠️${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""
echo "To push to GitHub, you need to:"
echo ""
echo "OPTION 1: Use Personal Access Token (PAT)"
echo "  1. Go to: https://github.com/settings/tokens"
echo "  2. Generate new token (classic)"
echo "  3. Select: repo, workflow permissions"
echo "  4. Copy the token"
echo "  5. Run:"
echo -e "     ${GREEN}git remote set-url origin https://YOUR_TOKEN@github.com/ahmednageh373-gif/ahmednagenoufal.git${NC}"
echo -e "     ${GREEN}git push origin genspark_ai_developer${NC}"
echo ""
echo "OPTION 2: Use SSH Key"
echo "  1. Generate key: ssh-keygen -t ed25519 -C \"your_email@example.com\""
echo "  2. Add to GitHub: cat ~/.ssh/id_ed25519.pub"
echo "  3. Run:"
echo -e "     ${GREEN}git remote set-url origin git@github.com:ahmednageh373-gif/ahmednagenoufal.git${NC}"
echo -e "     ${GREEN}git push origin genspark_ai_developer${NC}"
echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Try to push (will fail but shows the command)
echo -e "${YELLOW}Attempting to push...${NC}"
git push origin genspark_ai_developer 2>&1

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ SUCCESS! Pushed to GitHub${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Create Pull Request: https://github.com/ahmednageh373-gif/ahmednagenoufal/compare"
    echo "2. Merge to main branch"
    echo "3. Deploy to ahmednagenoufal.com"
    echo ""
else
    echo ""
    echo -e "${RED}════════════════════════════════════════${NC}"
    echo -e "${RED}❌ Push failed - Authentication required${NC}"
    echo -e "${RED}════════════════════════════════════════${NC}"
    echo ""
    echo "Please set up authentication using one of the options above."
    echo ""
    echo -e "${YELLOW}Quick Setup Commands:${NC}"
    echo ""
    echo "# For Personal Access Token:"
    echo "git remote set-url origin https://YOUR_TOKEN@github.com/ahmednageh373-gif/ahmednagenoufal.git"
    echo ""
    echo "# For SSH:"
    echo "git remote set-url origin git@github.com:ahmednageh373-gif/ahmednagenoufal.git"
    echo ""
    echo "Then run: ./quick-push.sh again"
    echo ""
fi

echo -e "${BLUE}📚 For detailed guide, see:${NC} PUSH-TO-PRODUCTION-GUIDE.md"
echo ""
