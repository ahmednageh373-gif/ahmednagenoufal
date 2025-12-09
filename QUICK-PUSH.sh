#!/bin/bash

# ===============================================
# Quick Push Script للموقع
# https://www.ahmednagehnoufal.com/
# ===============================================

echo "=================================="
echo "🚀 دفع التحديثات إلى الموقع"
echo "=================================="
echo ""

# التحقق من وجود Token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "⚠️  لم يتم العثور على GitHub Token"
    echo ""
    echo "📝 الرجاء الحصول على Token من:"
    echo "   https://github.com/settings/tokens/new"
    echo ""
    echo "✅ الصلاحيات المطلوبة:"
    echo "   - repo (Full control)"
    echo "   - workflow (Update workflows)"
    echo ""
    echo "💡 ثم شغّل الأمر:"
    echo "   export GITHUB_TOKEN=your_token_here"
    echo "   bash QUICK-PUSH.sh"
    echo ""
    exit 1
fi

# عرض الكومتات الجاهزة
echo "📦 الكومتات الجاهزة للدفع:"
git log --oneline origin/genspark_ai_developer..HEAD
echo ""

# التأكيد
read -p "🔍 هل تريد دفع هذه التحديثات؟ (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "❌ تم الإلغاء"
    exit 0
fi

echo ""
echo "⏳ جاري الدفع إلى GitHub..."

# الدفع باستخدام Token
git push https://$GITHUB_TOKEN@github.com/ahmednageh373-gif/ahmednagenoufal.git genspark_ai_developer

if [ $? -eq 0 ]; then
    echo ""
    echo "=================================="
    echo "✅ تم الدفع بنجاح!"
    echo "=================================="
    echo ""
    echo "🌐 الموقع سيتم تحديثه تلقائياً خلال 2-5 دقائق"
    echo "🔗 الموقع: https://www.ahmednagehnoufal.com/"
    echo ""
    echo "💡 لمشاهدة التحديث:"
    echo "   1. انتظر 2-5 دقائق"
    echo "   2. افتح الموقع"
    echo "   3. اضغط Ctrl+Shift+R (Hard Refresh)"
    echo ""
else
    echo ""
    echo "=================================="
    echo "❌ فشل الدفع"
    echo "=================================="
    echo ""
    echo "📝 الحلول المحتملة:"
    echo "   1. تحقق من صحة الـ Token"
    echo "   2. تأكد من الصلاحيات (repo + workflow)"
    echo "   3. راجع PUSH-TO-PRODUCTION.md للتفاصيل"
    echo ""
fi
