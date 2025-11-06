#!/usr/bin/env python3
"""
سكريبت اختبار البناء - للتحقق من صحة ملفات dist
"""

import os
import json
from pathlib import Path

def check_build():
    print("=" * 70)
    print("🔍 فحص ملفات البناء (dist/)")
    print("=" * 70)
    
    dist_path = Path("/home/user/webapp/dist")
    
    if not dist_path.exists():
        print("❌ مجلد dist غير موجود!")
        print("   قم بتشغيل: npm run build")
        return False
    
    # الملفات المطلوبة
    required_files = {
        'index.html': 'الصفحة الرئيسية',
        '_redirects': 'قواعد التوجيه',
        '_headers': 'إعدادات الأمان',
        'assets/': 'مجلد الملفات المحولة'
    }
    
    print("\n✅ الملفات الأساسية:\n")
    all_good = True
    
    for file, desc in required_files.items():
        file_path = dist_path / file
        if file_path.exists():
            if file_path.is_dir():
                count = len(list(file_path.iterdir()))
                print(f"✅ {file:<20} {desc:<25} ({count} ملفات)")
            else:
                size = file_path.stat().st_size
                print(f"✅ {file:<20} {desc:<25} ({size:,} bytes)")
        else:
            print(f"❌ {file:<20} {desc:<25} [مفقود!]")
            all_good = False
    
    # فحص index.html
    print("\n📄 فحص index.html:\n")
    index_path = dist_path / "index.html"
    if index_path.exists():
        content = index_path.read_text(encoding='utf-8')
        
        checks = [
            ('<div id="root">', 'React root container'),
            ('<script type="module"', 'Module script'),
            ('/assets/', 'Assets path'),
            ('جاري التحميل', 'Loading indicator'),
        ]
        
        for check, desc in checks:
            if check in content:
                print(f"✅ {desc:<30} موجود")
            else:
                print(f"❌ {desc:<30} مفقود!")
                all_good = False
    
    # فحص assets
    print("\n📦 فحص Assets:\n")
    assets_path = dist_path / "assets"
    if assets_path.exists():
        js_files = list(assets_path.glob("*.js"))
        css_files = list(assets_path.glob("*.css"))
        
        print(f"   • ملفات JavaScript: {len(js_files)}")
        print(f"   • ملفات CSS: {len(css_files)}")
        
        # فحص الملف الرئيسي
        main_js = list(assets_path.glob("index-*.js"))
        if main_js:
            main_file = main_js[0]
            size_mb = main_file.stat().st_size / (1024 * 1024)
            print(f"\n   📌 الملف الرئيسي: {main_file.name}")
            print(f"      الحجم: {size_mb:.2f} MB")
            
            # فحص محتوى React
            content = main_file.read_text(encoding='utf-8', errors='ignore')
            if 'react' in content.lower():
                print(f"      ✅ React محزوم في الملف")
            else:
                print(f"      ❌ React غير موجود!")
                all_good = False
        else:
            print("   ❌ الملف الرئيسي (index-*.js) مفقود!")
            all_good = False
    
    print("\n" + "=" * 70)
    if all_good:
        print("✅ البناء صحيح! جميع الملفات موجودة.")
    else:
        print("❌ هناك مشاكل في البناء!")
    print("=" * 70)
    
    return all_good

if __name__ == '__main__':
    check_build()
