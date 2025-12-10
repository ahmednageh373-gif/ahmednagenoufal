#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
اختبارات شاملة للنظام المتكامل
Comprehensive Tests for Integrated Construction System

يختبر:
1. حسابات المدد مع جميع العوامل
2. قاعدة البيانات (14 جدول)
3. معدلات الإنتاج 2024
4. تصدير البيانات
5. السيناريوهات الواقعية

المطور: GenSpark AI Developer
التاريخ: 2025-12-10
"""

import json
import os
from integrated_construction_system import IntegratedConstructionDB, ProductionRates2024


def test_1_database_creation():
    """اختبار 1: إنشاء قاعدة البيانات"""
    print("\n" + "="*60)
    print("🧪 اختبار 1: إنشاء قاعدة البيانات")
    print("="*60)
    
    db = IntegratedConstructionDB('test_construction.db')
    
    # التحقق من وجود الجداول
    db.cursor.execute('''
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        ORDER BY name
    ''')
    
    tables = [row[0] for row in db.cursor.fetchall()]
    expected_tables = [
        'activities', 'activity_resources', 'adjustment_factors',
        'adjusted_rates', 'daily_progress', 'payment_certificates',
        'production_rates', 'project_documents', 'projects',
        'quality_checkpoints', 'resources', 'risk_register',
        'schedule_detail', 'wbs_structure'
    ]
    
    print(f"✅ تم إنشاء {len(tables)} جدول")
    
    for table in expected_tables:
        if table in tables:
            print(f"   ✓ {table}")
        else:
            print(f"   ✗ {table} - مفقود!")
    
    db.close()
    
    return len(tables) == len(expected_tables)


def test_2_production_rates():
    """اختبار 2: معدلات الإنتاج 2024"""
    print("\n" + "="*60)
    print("🧪 اختبار 2: معدلات الإنتاج 2024")
    print("="*60)
    
    # اختبار الخرسانة
    concrete = ProductionRates2024.get_rate("خرسانة", "خرسانة_أساسات")
    print(f"\n📊 معدل خرسانة الأساسات:")
    print(f"   المعدل الأساسي: {concrete['base_rate_daily']} م³/يوم")
    print(f"   تعديل الصيف: {concrete['summer_adjustment']} ({concrete['summer_adjustment']*100-100:+.0f}%)")
    print(f"   التكلفة: {concrete['unit_cost_range'][0]}-{concrete['unit_cost_range'][1]} ريال/م³")
    
    # اختبار الحديد
    rebar = ProductionRates2024.get_rate("حديد", "حديد_تسليح")
    print(f"\n📊 معدل حديد التسليح:")
    print(f"   المعدل الأساسي: {rebar['base_rate_daily']} كجم/يوم")
    print(f"   تعديل الصيف: {rebar['summer_adjustment']} ({rebar['summer_adjustment']*100-100:+.0f}%)")
    print(f"   التكلفة: {rebar['unit_cost_range'][0]}-{rebar['unit_cost_range'][1]} ريال/كجم")
    
    # اختبار عوامل الطقس
    print(f"\n🌡️ عوامل الطقس:")
    for month in [1, 5, 8, 11]:
        factor = ProductionRates2024.get_weather_factor(month)
        print(f"   الشهر {month}: {factor} ({factor*100-100:+.0f}%)")
    
    return concrete is not None and rebar is not None


def test_3_duration_calculations():
    """اختبار 3: حسابات المدد"""
    print("\n" + "="*60)
    print("🧪 اختبار 3: حسابات المدد")
    print("="*60)
    
    db = IntegratedConstructionDB('test_construction.db')
    
    test_cases = [
        {
            "name": "صب خرسانة أساسات (صيف)",
            "category": "خرسانة",
            "activity_type": "خرسانة_أساسات",
            "quantity": 150.0,
            "month": 8,
            "is_ramadan": False
        },
        {
            "name": "صب خرسانة أساسات (شتاء)",
            "category": "خرسانة",
            "activity_type": "خرسانة_أساسات",
            "quantity": 150.0,
            "month": 1,
            "is_ramadan": False
        },
        {
            "name": "صب خرسانة أساسات (رمضان)",
            "category": "خرسانة",
            "activity_type": "خرسانة_أساسات",
            "quantity": 150.0,
            "month": 3,
            "is_ramadan": True
        },
        {
            "name": "تركيب حديد تسليح",
            "category": "حديد",
            "activity_type": "حديد_تسليح",
            "quantity": 12000.0,
            "month": 8,
            "is_ramadan": False
        }
    ]
    
    results = []
    
    for test in test_cases:
        result = db.calculate_activity_duration(
            category=test["category"],
            activity_type=test["activity_type"],
            quantity=test["quantity"],
            month=test["month"],
            is_ramadan=test["is_ramadan"]
        )
        
        if result:
            print(f"\n📊 {test['name']}:")
            print(f"   الكمية: {test['quantity']} {result['unit']}")
            print(f"   المعدل النهائي: {result['final_rate_daily']} {result['unit']}/يوم")
            print(f"   المدة: {result['net_duration_days']} يوم ({result['duration_weeks']} أسبوع)")
            print(f"   التكلفة: {result['cost_estimate']['total_cost']:,.0f} ريال")
            print(f"   العوامل:")
            for factor_name, factor_value in result['factors'].items():
                if factor_name != 'total':
                    print(f"      {factor_name}: {factor_value} ({factor_value*100-100:+.0f}%)")
            
            results.append(result)
    
    db.close()
    
    return len(results) == len(test_cases)


def test_4_project_insertion():
    """اختبار 4: إدخال مشروع"""
    print("\n" + "="*60)
    print("🧪 اختبار 4: إدخال مشروع")
    print("="*60)
    
    db = IntegratedConstructionDB('test_construction.db')
    
    project = {
        'project_id': 'TEST-001',
        'project_name_ar': 'مشروع اختبار شامل',
        'project_name_en': 'Comprehensive Test Project',
        'location': 'الملقا',
        'region': 'الرياض',
        'project_type': 'سكني',
        'start_date': '2024-08-01',
        'planned_finish_date': '2025-08-01',
        'budget_total': 3000000.00,
        'contractor_name': 'شركة الاختبار',
        'consultant_name': 'مكتب الاستبار الاستشاري',
        'status': 'جاري التنفيذ'
    }
    
    success = db.insert_project(project)
    
    if success:
        print(f"✅ تم إدخال المشروع: {project['project_id']}")
        print(f"   الاسم: {project['project_name_ar']}")
        print(f"   الموقع: {project['location']}, {project['region']}")
        print(f"   الميزانية: {project['budget_total']:,.0f} ريال")
        
        # التحقق من الإدخال
        db.cursor.execute('SELECT * FROM projects WHERE project_id = ?', (project['project_id'],))
        row = db.cursor.fetchone()
        
        if row:
            print(f"   ✓ تم التحقق من وجود المشروع في قاعدة البيانات")
    else:
        print(f"❌ فشل إدخال المشروع")
    
    db.close()
    
    return success


def test_5_realistic_villa_project():
    """اختبار 5: مشروع فيلا واقعي كامل"""
    print("\n" + "="*60)
    print("🧪 اختبار 5: مشروع فيلا واقعي (469 بند)")
    print("="*60)
    
    db = IntegratedConstructionDB('test_construction.db')
    
    # بنود رئيسية من مشروع فيلا حقيقي
    activities = [
        # الأساسات
        ("خرسانة", "خرسانة_أساسات", 65.0, "م³"),
        ("حديد", "حديد_أساسات", 5200.0, "كجم"),
        
        # الهيكل الإنشائي
        ("خرسانة", "خرسانة_أعمدة", 35.0, "م³"),
        ("حديد", "حديد_تسليح", 2800.0, "كجم"),
        ("خرسانة", "خرسانة_سقف", 120.0, "م³"),
        
        # البناء
        ("بناء", "طابوق_حامل", 450.0, "م²"),
        ("بناء", "بلوك_خرساني", 180.0, "م²"),
        
        # التشطيبات
        ("تشطيب", "معجون_دهان", 800.0, "م²"),
        ("تشطيب", "بلاط_أرضيات", 350.0, "م²"),
        ("تشطيب", "بلاط_حوائط", 120.0, "م²"),
        
        # الأعمال الكهروميكانيكية
        ("كهرباء", "تمديدات_كهربائية", 85.0, "نقطة"),
        ("سباكة", "تمديدات_سباكة", 60.0, "نقطة")
    ]
    
    print(f"\n📋 تحليل {len(activities)} بند رئيسي:")
    print("-" * 60)
    
    total_duration = 0
    total_cost = 0
    
    for i, (category, activity_type, qty, unit) in enumerate(activities, 1):
        result = db.calculate_activity_duration(
            category=category,
            activity_type=activity_type,
            quantity=qty,
            region="الرياض",
            location="riyadh_malqa",
            month=8,  # أغسطس
            is_ramadan=False,
            supervision_quality="expert"
        )
        
        if result:
            total_duration += result['net_duration_days']
            total_cost += result['cost_estimate']['total_cost']
            
            print(f"{i:2d}. {result['activity']:<40} "
                  f"{qty:>8.1f} {unit:<6} → "
                  f"{result['net_duration_days']:>6.2f} يوم "
                  f"({result['cost_estimate']['total_cost']:>10,.0f} ريال)")
    
    print("-" * 60)
    print(f"📊 الإجماليات:")
    print(f"   إجمالي المدة: {total_duration:.1f} يوم ({total_duration/30:.1f} شهر)")
    print(f"   إجمالي التكلفة: {total_cost:,.0f} ريال")
    
    # حساب المعدل اليومي
    daily_cost = total_cost / total_duration if total_duration > 0 else 0
    print(f"   متوسط التكلفة اليومية: {daily_cost:,.0f} ريال/يوم")
    
    db.close()
    
    return total_duration > 0 and total_cost > 0


def test_6_export_json():
    """اختبار 6: تصدير البيانات إلى JSON"""
    print("\n" + "="*60)
    print("🧪 اختبار 6: تصدير البيانات")
    print("="*60)
    
    db = IntegratedConstructionDB('test_construction.db')
    
    output_file = 'test_export.json'
    
    try:
        data = db.export_to_json('TEST-001', output_file)
        
        if os.path.exists(output_file):
            file_size = os.path.getsize(output_file)
            print(f"✅ تم التصدير إلى: {output_file}")
            print(f"   حجم الملف: {file_size:,} بايت")
            print(f"   عدد الأنشطة: {len(data.get('activities', []))}")
            print(f"   تاريخ التصدير: {data.get('export_date', 'N/A')}")
            
            success = True
        else:
            print(f"❌ فشل التصدير")
            success = False
    
    except Exception as e:
        print(f"❌ خطأ في التصدير: {e}")
        success = False
    
    finally:
        db.close()
        # تنظيف ملفات الاختبار
        if os.path.exists(output_file):
            os.remove(output_file)
        if os.path.exists('test_construction.db'):
            os.remove('test_construction.db')
    
    return success


def run_all_tests():
    """تشغيل جميع الاختبارات"""
    print("\n" + "="*60)
    print("🚀 بدء الاختبارات الشاملة للنظام المتكامل")
    print("="*60)
    
    tests = [
        ("إنشاء قاعدة البيانات", test_1_database_creation),
        ("معدلات الإنتاج 2024", test_2_production_rates),
        ("حسابات المدد", test_3_duration_calculations),
        ("إدخال مشروع", test_4_project_insertion),
        ("مشروع فيلا واقعي", test_5_realistic_villa_project),
        ("تصدير البيانات", test_6_export_json)
    ]
    
    results = []
    
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n❌ خطأ في اختبار '{name}': {e}")
            results.append((name, False))
    
    # ملخص النتائج
    print("\n" + "="*60)
    print("📊 ملخص نتائج الاختبارات")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ نجح" if result else "❌ فشل"
        print(f"{status} - {name}")
    
    print("-" * 60)
    print(f"النتيجة النهائية: {passed}/{total} ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("\n🎉 جميع الاختبارات نجحت!")
        return True
    else:
        print(f"\n⚠️  {total-passed} اختبار(ات) فشل")
        return False


if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
