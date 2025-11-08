#!/bin/bash

# 🚀 سكريبت النشر السريع | Quick Deployment Script
# للتطبيق: نظام إدارة المشاريع الإنشائية
# الإصدار: 1.0.0

echo "=========================================="
echo "🚀 سكريبت النشر السريع"
echo "🚀 Quick Deployment Script"
echo "=========================================="
echo ""

# الألوان
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 التحقق من ملف البناء...${NC}"
echo -e "${BLUE}📦 Checking build folder...${NC}"
echo ""

if [ ! -d "dist" ]; then
    echo -e "${YELLOW}⚠️  مجلد dist غير موجود. جارٍ البناء...${NC}"
    echo -e "${YELLOW}⚠️  dist folder not found. Building...${NC}"
    npm run build
    echo ""
fi

if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    echo -e "${GREEN}✅ ملف البناء جاهز! الحجم: $DIST_SIZE${NC}"
    echo -e "${GREEN}✅ Build ready! Size: $DIST_SIZE${NC}"
    echo ""
else
    echo -e "${RED}❌ فشل البناء! تحقق من الأخطاء.${NC}"
    echo -e "${RED}❌ Build failed! Check errors.${NC}"
    exit 1
fi

echo "=========================================="
echo "🌐 اختر منصة النشر | Choose Deployment Platform"
echo "=========================================="
echo ""
echo "1️⃣  Netlify (الأسهل | Easiest)"
echo "2️⃣  Vercel (الأسرع | Fastest)"
echo "3️⃣  GitHub Pages (مجاني | Free)"
echo "4️⃣  إلغاء | Cancel"
echo ""

read -p "اختيارك (1-4) | Your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}📘 تعليمات نشر Netlify:${NC}"
        echo -e "${BLUE}📘 Netlify Deployment Instructions:${NC}"
        echo ""
        echo "1. افتح | Open: https://app.netlify.com"
        echo "2. اضغط | Click: 'Add new site' → 'Import an existing project'"
        echo "3. اختر | Select: GitHub"
        echo "4. ابحث عن | Search: ahmednagenoufal"
        echo "5. الإعدادات | Settings:"
        echo "   - Build command: npm run build"
        echo "   - Publish directory: dist"
        echo "6. اضغط | Click: 'Deploy site'"
        echo ""
        echo -e "${GREEN}✅ سيكون تطبيقك متاحاً على: [your-site].netlify.app${NC}"
        echo -e "${GREEN}✅ Your app will be live at: [your-site].netlify.app${NC}"
        ;;
    2)
        echo ""
        echo -e "${BLUE}📘 تعليمات نشر Vercel:${NC}"
        echo -e "${BLUE}📘 Vercel Deployment Instructions:${NC}"
        echo ""
        echo "1. افتح | Open: https://vercel.com"
        echo "2. اضغط | Click: 'Add New...' → 'Project'"
        echo "3. استورد | Import: ahmednagenoufal من GitHub"
        echo "4. الإعدادات (تلقائية) | Settings (automatic):"
        echo "   - Framework: Vite (auto-detected)"
        echo "   - Build Command: npm run build"
        echo "   - Output Directory: dist"
        echo "5. اضغط | Click: 'Deploy'"
        echo ""
        echo -e "${GREEN}✅ سيكون تطبيقك متاحاً على: [project-name].vercel.app${NC}"
        echo -e "${GREEN}✅ Your app will be live at: [project-name].vercel.app${NC}"
        ;;
    3)
        echo ""
        echo -e "${BLUE}📘 تعليمات نشر GitHub Pages:${NC}"
        echo -e "${BLUE}📘 GitHub Pages Deployment Instructions:${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  يجب دمج PR #5 في main أولاً!${NC}"
        echo -e "${YELLOW}⚠️  Must merge PR #5 into main first!${NC}"
        echo ""
        echo "1. اذهب إلى | Go to: https://github.com/ahmednageh373-gif/ahmednagenoufal/settings/pages"
        echo "2. في Source، اختر | In Source, select:"
        echo "   - Branch: main"
        echo "   - Folder: /dist"
        echo "3. اضغط | Click: 'Save'"
        echo "4. انتظر 2-5 دقائق | Wait 2-5 minutes"
        echo ""
        echo -e "${GREEN}✅ سيكون تطبيقك متاحاً على:${NC}"
        echo -e "${GREEN}✅ Your app will be live at:${NC}"
        echo "https://ahmednageh373-gif.github.io/ahmednagenoufal/"
        echo ""
        echo -e "${BLUE}لدمج PR #5 | To merge PR #5:${NC}"
        echo "gh pr merge 5 --squash"
        ;;
    4)
        echo ""
        echo -e "${YELLOW}تم الإلغاء | Cancelled${NC}"
        exit 0
        ;;
    *)
        echo ""
        echo -e "${RED}اختيار غير صحيح! | Invalid choice!${NC}"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 انتهى! | Done!${NC}"
echo "=========================================="
echo ""
echo "📚 للمزيد من التفاصيل | For more details:"
echo "   - DEPLOYMENT_INSTRUCTIONS.md"
echo "   - QUICK_DEPLOY.md"
echo "   - STATUS_REPORT.md"
echo ""
echo "🔗 Pull Request #5:"
echo "   https://github.com/ahmednageh373-gif/ahmednagenoufal/pull/5"
echo ""
echo -e "${GREEN}✨ حظاً موفقاً في النشر! | Good luck with deployment! ✨${NC}"
