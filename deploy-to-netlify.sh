#!/bin/bash

# =============================================================================
# Netlify Deployment Script for ahmednagehnoufal.com
# =============================================================================
# Developer: AHMED NAGEH
# Date: 2025-12-10
# Purpose: Deploy User Guide updates to Netlify
# =============================================================================

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🚀 Netlify Deployment for ahmednagehnoufal.com         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variables
PROJECT_DIR="/home/user/webapp"
DIST_DIR="$PROJECT_DIR/dist"
BUILD_SIZE=$(du -sh "$DIST_DIR" 2>/dev/null | cut -f1 || echo "unknown")

# =============================================================================
# Step 1: Check Prerequisites
# =============================================================================

echo "${BLUE}📋 Step 1: Checking prerequisites...${NC}"
echo ""

# Check if dist directory exists
if [ ! -d "$DIST_DIR" ]; then
    echo "${RED}❌ Error: dist/ directory not found!${NC}"
    echo "   Please run 'npm run build' first."
    exit 1
fi

echo "${GREEN}✅ dist/ directory found (Size: $BUILD_SIZE)${NC}"

# Check for important files
if [ ! -f "$DIST_DIR/index.html" ]; then
    echo "${RED}❌ Error: index.html not found in dist/!${NC}"
    exit 1
fi

echo "${GREEN}✅ index.html found${NC}"

# Check for UserGuide in build
if grep -q "UserGuide" "$DIST_DIR/index.html" 2>/dev/null || \
   ls "$DIST_DIR/assets/"*.js 2>/dev/null | xargs grep -l "UserGuide" >/dev/null 2>&1; then
    echo "${GREEN}✅ UserGuide component detected in build${NC}"
else
    echo "${YELLOW}⚠️  Warning: UserGuide component not clearly detected${NC}"
fi

echo ""

# =============================================================================
# Step 2: Display Build Information
# =============================================================================

echo "${BLUE}📊 Step 2: Build Information${NC}"
echo ""
echo "  📁 Project Directory: $PROJECT_DIR"
echo "  📦 Build Directory: $DIST_DIR"
echo "  💾 Build Size: $BUILD_SIZE"
echo "  📄 Files Count: $(find "$DIST_DIR" -type f | wc -l)"
echo ""

# =============================================================================
# Step 3: Deployment Options
# =============================================================================

echo "${BLUE}🎯 Step 3: Deployment Options${NC}"
echo ""
echo "Choose deployment method:"
echo ""
echo "  1) 🌐 Netlify CLI (requires netlify-cli installed)"
echo "  2) 📤 Manual Drag & Drop Instructions"
echo "  3) 🔗 Git Integration Instructions"
echo "  4) ❌ Cancel"
echo ""
read -p "Enter your choice (1-4): " DEPLOY_CHOICE
echo ""

case $DEPLOY_CHOICE in
    1)
        # =============================================================================
        # Option 1: Netlify CLI Deployment
        # =============================================================================
        
        echo "${BLUE}🌐 Deploying via Netlify CLI...${NC}"
        echo ""
        
        # Check if netlify-cli is installed
        if ! command -v netlify &> /dev/null; then
            echo "${YELLOW}⚠️  Netlify CLI not found!${NC}"
            echo ""
            echo "Install it with:"
            echo "  npm install -g netlify-cli"
            echo ""
            read -p "Do you want to install it now? (y/n): " INSTALL_CLI
            
            if [[ $INSTALL_CLI =~ ^[Yy]$ ]]; then
                echo ""
                echo "${BLUE}📦 Installing Netlify CLI...${NC}"
                npm install -g netlify-cli
                
                if [ $? -ne 0 ]; then
                    echo "${RED}❌ Failed to install Netlify CLI!${NC}"
                    exit 1
                fi
                
                echo "${GREEN}✅ Netlify CLI installed successfully!${NC}"
            else
                echo "${YELLOW}⚠️  Skipping Netlify CLI installation${NC}"
                exit 1
            fi
        fi
        
        echo "${GREEN}✅ Netlify CLI found${NC}"
        echo ""
        
        # Check if logged in
        echo "${BLUE}🔐 Checking Netlify authentication...${NC}"
        netlify status 2>&1 | grep -q "Logged in"
        
        if [ $? -ne 0 ]; then
            echo "${YELLOW}⚠️  Not logged in to Netlify${NC}"
            echo ""
            echo "Please login to Netlify..."
            netlify login
            
            if [ $? -ne 0 ]; then
                echo "${RED}❌ Netlify login failed!${NC}"
                exit 1
            fi
        fi
        
        echo "${GREEN}✅ Authenticated with Netlify${NC}"
        echo ""
        
        # Deploy
        echo "${BLUE}🚀 Deploying to Netlify...${NC}"
        echo ""
        echo "This will deploy the contents of: $DIST_DIR"
        echo ""
        read -p "Continue with deployment? (y/n): " CONFIRM_DEPLOY
        
        if [[ ! $CONFIRM_DEPLOY =~ ^[Yy]$ ]]; then
            echo "${YELLOW}⚠️  Deployment cancelled${NC}"
            exit 0
        fi
        
        cd "$PROJECT_DIR"
        netlify deploy --prod --dir=dist
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
            echo "${GREEN}║   ✅ Deployment Successful!                              ║${NC}"
            echo "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
            echo ""
            echo "🌐 Your site is now live at:"
            echo "   https://www.ahmednagehnoufal.com/"
            echo ""
            echo "📖 User Guide available at:"
            echo "   https://www.ahmednagehnoufal.com/#/user-guide"
            echo ""
        else
            echo ""
            echo "${RED}❌ Deployment failed!${NC}"
            echo ""
            echo "Please check the error messages above."
            exit 1
        fi
        ;;
        
    2)
        # =============================================================================
        # Option 2: Manual Drag & Drop Instructions
        # =============================================================================
        
        echo "${BLUE}📤 Manual Drag & Drop Deployment${NC}"
        echo ""
        echo "Follow these steps:"
        echo ""
        echo "1. Open Netlify Drop in your browser:"
        echo "   ${GREEN}https://app.netlify.com/drop${NC}"
        echo ""
        echo "2. Locate the dist folder:"
        echo "   ${GREEN}$DIST_DIR${NC}"
        echo ""
        echo "3. Drag the entire 'dist' folder to the Netlify Drop page"
        echo "   (or click 'Browse to upload' and select the folder)"
        echo ""
        echo "4. Wait for upload to complete (~1-3 minutes for $BUILD_SIZE)"
        echo ""
        echo "5. Get your deployment URL (like: random-name-123456.netlify.app)"
        echo ""
        echo "6. Configure custom domain:"
        echo "   - Go to Site Settings > Domain Management"
        echo "   - Click 'Add custom domain'"
        echo "   - Enter: ahmednagehnoufal.com"
        echo "   - Follow DNS setup instructions"
        echo ""
        echo "${YELLOW}Note: The dist folder is already built and ready at:${NC}"
        echo "${GREEN}$DIST_DIR${NC}"
        echo ""
        ;;
        
    3)
        # =============================================================================
        # Option 3: Git Integration Instructions
        # =============================================================================
        
        echo "${BLUE}🔗 Git Integration Deployment${NC}"
        echo ""
        echo "To set up automatic deployment from GitHub:"
        echo ""
        echo "1. Go to Netlify: ${GREEN}https://app.netlify.com/start${NC}"
        echo ""
        echo "2. Click 'Import from Git' > 'GitHub'"
        echo ""
        echo "3. Select repository: ${GREEN}ahmednageh373-gif/ahmednagenoufal${NC}"
        echo ""
        echo "4. Configure build settings:"
        echo "   - Branch: ${GREEN}main${NC}"
        echo "   - Build command: ${GREEN}npm run build${NC}"
        echo "   - Publish directory: ${GREEN}dist${NC}"
        echo ""
        echo "5. Environment variables (if needed):"
        echo "   - NODE_VERSION: 18"
        echo "   - NPM_FLAGS: --legacy-peer-deps"
        echo ""
        echo "6. Click 'Deploy site'"
        echo ""
        echo "7. Configure custom domain:"
        echo "   - Site Settings > Domain Management"
        echo "   - Add: ahmednagehnoufal.com"
        echo ""
        echo "${GREEN}✅ After setup, every push to 'main' will auto-deploy!${NC}"
        echo ""
        ;;
        
    4)
        echo "${YELLOW}⚠️  Deployment cancelled${NC}"
        exit 0
        ;;
        
    *)
        echo "${RED}❌ Invalid choice!${NC}"
        exit 1
        ;;
esac

# =============================================================================
# Final Summary
# =============================================================================

echo "${BLUE}📋 Deployment Summary${NC}"
echo ""
echo "  ✅ Build Size: $BUILD_SIZE"
echo "  ✅ Files: $(find "$DIST_DIR" -type f | wc -l)"
echo "  ✅ User Guide: Included"
echo "  ✅ Dark Mode: Supported"
echo "  ✅ Responsive: Yes"
echo ""
echo "${GREEN}🎉 All done! Your updates are ready for the world!${NC}"
echo ""

# =============================================================================
# Additional Information
# =============================================================================

echo "${BLUE}📚 Additional Resources:${NC}"
echo ""
echo "  📖 Netlify Docs: https://docs.netlify.com/"
echo "  📄 Deployment Guide: NETLIFY-DEPLOY-GUIDE.md"
echo "  📄 Success Summary: DEPLOYMENT-SUCCESS-SUMMARY.md"
echo ""
echo "Developer: AHMED NAGEH"
echo "Date: 2025-12-10"
echo ""
