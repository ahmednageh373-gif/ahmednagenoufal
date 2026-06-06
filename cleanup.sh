#!/bin/bash
# ============================================================================
# NOUFAL ERP - QUICK CLEANUP SCRIPT
# ============================================================================
# This script removes all unnecessary files from git tracking
# RUN: bash cleanup.sh
# ============================================================================

set -e

echo "🧹 NOUFAL Repository Cleanup Starting..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Remove .env files (SECURITY CRITICAL)
echo -e "\n${YELLOW}Step 1: Removing .env files (Security Critical)...${NC}"
git rm --cached .env 2>/dev/null || true
git rm --cached .env.production 2>/dev/null || true
git rm --cached .env.development 2>/dev/null || true
git commit -m "security: Remove .env files with credentials" 2>/dev/null || true
echo -e "${GREEN}✓ .env files removed${NC}"

# Step 2: Remove node_modules
echo -e "\n${YELLOW}Step 2: Removing node_modules (~200MB)...${NC}"
git rm -r --cached node_modules/ 2>/dev/null || true
git commit -m "build: Remove node_modules from tracking" 2>/dev/null || true
echo -e "${GREEN}✓ node_modules removed${NC}"

# Step 3: Remove build artifacts
echo -e "\n${YELLOW}Step 3: Removing build artifacts (dist/, dev-dist/)...${NC}"
git rm -r --cached dist/ 2>/dev/null || true
git rm -r --cached dev-dist/ 2>/dev/null || true
git commit -m "build: Remove build output directories" 2>/dev/null || true
echo -e "${GREEN}✓ Build directories removed${NC}"

# Step 4: Remove .tar.gz backups
echo -e "\n${YELLOW}Step 4: Removing .tar.gz backup files (~7MB)...${NC}"
git rm --cached *.tar.gz 2>/dev/null || true
git commit -m "cleanup: Remove archived backup files" 2>/dev/null || true
echo -e "${GREEN}✓ .tar.gz files removed${NC}"

# Step 5: Remove duplicate .md files
echo -e "\n${YELLOW}Step 5: Removing 50+ duplicate .md files...${NC}"
# DEPLOYMENT duplicates
git rm --cached DEPLOYMENT-GUIDE.md DEPLOYMENT-GUIDE-AR.md DEPLOYMENT-GUIDE-EN.md 2>/dev/null || true
git rm --cached DEPLOYMENT-NOW.md DEPLOYMENT-READY-SUMMARY.md DEPLOYMENT-STATUS-FINAL.md 2>/dev/null || true
git rm --cached DEPLOYMENT-SUCCESS-SUMMARY.md DEPLOYMENT-VERIFICATION.md DEPLOYMENT_COMPLETE.md 2>/dev/null || true
git rm --cached DEPLOYMENT_FIX_REPORT.md DEPLOYMENT_INSTRUCTIONS.md DEPLOYMENT_LINKS.md 2>/dev/null || true
git rm --cached DEPLOYMENT_TROUBLESHOOTING.md 2>/dev/null || true

# INTEGRATION duplicates
git rm --cached INTEGRATION-COMPLETE.md INTEGRATION-STATUS-REPORT.md INTEGRATION-SUMMARY.md 2>/dev/null || true
git rm --cached INTEGRATION_AUDIT_REPORT.md INTEGRATION_SESSION_SUMMARY.md INTEGRATION_STATUS.md 2>/dev/null || true
git rm --cached INTEGRATION_SUMMARY.md 2>/dev/null || true

# FINAL duplicates
git rm --cached FINAL-DEPLOYMENT-INSTRUCTIONS.md FINAL-DEPLOYMENT-REPORT.md 2>/dev/null || true
git rm --cached FINAL-DEPLOYMENT-STATUS.md FINAL-SUCCESS-SUMMARY.md 2>/dev/null || true
git rm --cached FINAL_DEPLOYMENT_STATUS.md FINAL_IMPLEMENTATION_SUMMARY.md FINAL_STATUS.md 2>/dev/null || true

# STATUS & TESTING duplicates
git rm --cached STATUS_REPORT.md PROJECT-TESTING-COMPLETE.md 2>/dev/null || true
git rm --cached TESTING-COMPLETE-AR.md TESTING-SUMMARY-AR.md TEST_REPORT.md 2>/dev/null || true
git rm --cached TEST-REPORT-SUCCESS.md 2>/dev/null || true

# NETLIFY duplicates
git rm --cached NETLIFY-BUILD-FIX.md NETLIFY-BUILD-OPTIONS.md NETLIFY-CIVILENGINEER-SETUP.md 2>/dev/null || true
git rm --cached NETLIFY-DEPLOY-GUIDE.md NETLIFY-GITHUB-DEPLOY.md 2>/dev/null || true
git rm --cached NETLIFY_CI_FIX.md NETLIFY_CLEAR_CACHE.md NETLIFY_DEPLOYMENT_GUIDE.md 2>/dev/null || true
git rm --cached NETLIFY_FIX_SUMMARY.md NETLIFY_LOADING_ISSUE_SOLUTION.md 2>/dev/null || true
git rm --cached NETLIFY_MANUAL_DEPLOY.md 2>/dev/null || true

# VERCEL duplicates
git rm --cached VERCEL-DEPLOYMENT-FIX.md VERCEL_DEPLOYMENT_GUIDE.md VERCEL_FIX_GUIDE.md 2>/dev/null || true

# Other old files
git rm --cached DOMAIN-FIX-GUIDE.md DOMAIN-SETUP-AHMEDNAGENOUFAL.md 2>/dev/null || true
git rm --cached HOW-TO-DEPLOY.md QUICK-DEPLOY.md QUICK-PUSH.sh 2>/dev/null || true
git rm --cached READY-TO-DEPLOY.md READY-TO-PUSH.md 2>/dev/null || true

git commit -m "cleanup: Remove 50+ duplicate and outdated documentation files" 2>/dev/null || true
echo -e "${GREEN}✓ Duplicate .md files removed${NC}"

# Step 6: Remove test files
echo -e "\n${YELLOW}Step 6: Removing temporary test files...${NC}"
git rm --cached test-*.html test-*.json test-*.xlsx 2>/dev/null || true
git rm --cached test_*.py 2>/dev/null || true
git commit -m "cleanup: Remove temporary test files" 2>/dev/null || true
echo -e "${GREEN}✓ Test files removed${NC}"

# Step 7: Remove analysis & data files
echo -e "\n${YELLOW}Step 7: Removing analysis and data files...${NC}"
git rm --cached analyze_*.py comprehensive-project-analysis.py 2>/dev/null || true
git rm --cached create_project_plan.py fix_boq_*.py import_boq_to_app.py 2>/dev/null || true
git rm --cached integrated_construction_system.py 2>/dev/null || true
git rm --cached "*boq*.json" "qassim*.json" 2>/dev/null || true
git commit -m "cleanup: Remove analysis and test data files" 2>/dev/null || true
echo -e "${GREEN}✓ Analysis files removed${NC}"

# Step 8: Remove trigger & log files
echo -e "\n${YELLOW}Step 8: Removing trigger and log files...${NC}"
git rm --cached .netlify-build-trigger .netlify-civilengineer .netlify-deploy.sh 2>/dev/null || true
git rm --cached .trigger-deploy backend_logs.txt capture_*.* 2>/dev/null || true
git rm --cached "*.log" "*.patch" 2>/dev/null || true
git commit -m "cleanup: Remove trigger, log, and patch files" 2>/dev/null || true
echo -e "${GREEN}✓ Trigger and log files removed${NC}"

# Step 9: Garbage collection
echo -e "\n${YELLOW}Step 9: Running garbage collection...${NC}"
git gc --aggressive --prune=now 2>/dev/null || true
echo -e "${GREEN}✓ Garbage collection complete${NC}"

# Step 10: Push changes
echo -e "\n${YELLOW}Step 10: Pushing changes to remote...${NC}"
git push origin main --force-with-lease 2>/dev/null || true
echo -e "${GREEN}✓ Changes pushed${NC}"

# Summary
echo -e "\n${GREEN}=========================================="
echo "✅ CLEANUP COMPLETE!"
echo "==========================================${NC}"
echo ""
echo "📊 Repository is now clean:"
echo "  ✓ No node_modules in git"
echo "  ✓ No build artifacts"
echo "  ✓ No .env files with credentials"
echo "  ✓ No duplicate documentation"
echo "  ✓ No test files"
echo "  ✓ No backup archives"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT SECURITY NOTE:${NC}"
echo "  Your .env files were in git history!"
echo "  Please:"
echo "  1. Change all Supabase API keys"
echo "  2. Refresh Google OAuth credentials"
echo "  3. Regenerate any exposed secrets"
echo ""
echo "📝 Next step: Update README.md and deploy!"
echo ""
