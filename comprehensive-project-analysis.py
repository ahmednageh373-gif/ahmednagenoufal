#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
تحليل شامل لمشروع القصيم
Comprehensive Analysis for Qassim Project
كمهندس تخطيط، مهندس تسعير، ومدير مشروع
"""

import json
from datetime import datetime, timedelta
from collections import defaultdict

# Load BOQ data
with open('qassim-boq-imported.json', 'r', encoding='utf-8') as f:
    boq_data = json.load(f)

project_info = boq_data['projectInfo']
summary = boq_data['summary']
items = boq_data['items']
categories = boq_data['categories']

print("=" * 120)
print("📊 تحليل شامل للمشروع - COMPREHENSIVE PROJECT ANALYSIS")
print("=" * 120)
print(f"\n🏗️ مشروع: {project_info['name']}")
print(f"📋 رمز المشروع: {project_info['code']}")
print(f"📅 تاريخ الاستيراد: {project_info['importDate']}")
print(f"💰 القيمة الإجمالية: {project_info['totalAmount']:,.2f} ريال سعودي")
print(f"📦 عدد البنود: {project_info['totalItems']} بند")

# ============================================
# 1️⃣ التحليل المالي - PRICING ENGINEER VIEW
# ============================================
print("\n\n" + "=" * 120)
print("💵 التحليل المالي الشامل - DETAILED COST ANALYSIS (مهندس التسعير)")
print("=" * 120)

# Category breakdown
print("\n📊 توزيع التكاليف حسب الفئات الرئيسية:")
print("-" * 120)

category_analysis = defaultdict(lambda: {'count': 0, 'total': 0, 'items': []})

for item in items:
    cat_name = item.get('itemCode', 'غير محدد').split()[0:3]
    cat_key = ' '.join(cat_name) if cat_name else 'غير محدد'
    
    category_analysis[cat_key]['count'] += 1
    category_analysis[cat_key]['total'] += item.get('total', 0)
    category_analysis[cat_key]['items'].append(item)

# Sort by cost descending
sorted_cats = sorted(category_analysis.items(), key=lambda x: x[1]['total'], reverse=True)

total_cost = sum(cat['total'] for _, cat in sorted_cats)

print(f"{'الفئة':<50} {'العدد':>10} {'التكلفة':>20} {'النسبة %':>15}")
print("-" * 120)

for cat_name, cat_data in sorted_cats[:20]:  # Top 20 categories
    percentage = (cat_data['total'] / total_cost * 100) if total_cost > 0 else 0
    print(f"{cat_name:<50} {cat_data['count']:>10} {cat_data['total']:>20,.2f} {percentage:>14.2f}%")

# Top 10 most expensive items
print("\n\n🔝 أعلى 10 بنود تكلفة:")
print("-" * 120)
print(f"{'الرقم':<10} {'الوصف':<60} {'التكلفة':>20}")
print("-" * 120)

sorted_items = sorted(items, key=lambda x: x.get('total', 0), reverse=True)
for idx, item in enumerate(sorted_items[:10], 1):
    desc = item.get('description', 'N/A')[:57] + "..." if len(item.get('description', '')) > 60 else item.get('description', 'N/A')
    print(f"{idx:<10} {desc:<60} {item.get('total', 0):>20,.2f}")

# Cost distribution analysis
print("\n\n💡 توزيع البنود حسب التكلفة:")
print("-" * 120)

ranges = [
    (0, 1000, "أقل من 1,000"),
    (1000, 10000, "1,000 - 10,000"),
    (10000, 50000, "10,000 - 50,000"),
    (50000, 100000, "50,000 - 100,000"),
    (100000, 500000, "100,000 - 500,000"),
    (500000, float('inf'), "أكثر من 500,000")
]

print(f"{'النطاق':<30} {'عدد البنود':>15} {'إجمالي التكلفة':>25} {'النسبة %':>15}")
print("-" * 120)

for min_val, max_val, label in ranges:
    range_items = [item for item in items if min_val <= item.get('total', 0) < max_val]
    range_total = sum(item.get('total', 0) for item in range_items)
    percentage = (range_total / total_cost * 100) if total_cost > 0 else 0
    print(f"{label:<30} {len(range_items):>15} {range_total:>25,.2f} {percentage:>14.2f}%")

# ============================================
# 2️⃣ تخطيط الجدول الزمني - PLANNING ENGINEER VIEW
# ============================================
print("\n\n" + "=" * 120)
print("📅 تخطيط الجدول الزمني - PROJECT SCHEDULE PLANNING (مهندس التخطيط)")
print("=" * 120)

# Create CPM schedule based on BOQ categories
project_start = datetime.now()

# Define activity durations based on work types
def estimate_duration(item):
    """تقدير المدة بالأيام حسب نوع العمل"""
    keywords = {
        'حفر': 2,
        'مدقات': 3,
        'سور': 10,
        'سياج': 7,
        'بوابه': 3,
        'لوحة': 2,
        'مظلات': 5,
        'بلوك': 8,
        'خرسانة': 10,
        'لياسة': 7,
        'دهان': 5,
        'باب': 2,
        'شباك': 2,
        'بلاط': 6,
        'سيراميك': 4,
        'عزل': 5,
        'كهرباء': 8,
        'مضخات': 6
    }
    
    item_code = item.get('itemCode', '').lower()
    total_amount = item.get('total', 0)
    
    # Base duration from keywords
    duration = 3  # Default
    for keyword, days in keywords.items():
        if keyword in item_code or keyword in item.get('description', '').lower():
            duration = days
            break
    
    # Adjust based on cost (larger cost = more work)
    if total_amount > 500000:
        duration *= 2
    elif total_amount > 100000:
        duration *= 1.5
    
    return max(1, int(duration))

# Group activities by major work package
work_packages = {
    'الموقع العام': [],
    'غرف الكهرباء': [],
    'غرفة المضخات': [],
    'غرفة الحراسة': [],
    'أعمال أخرى': []
}

for item in items:
    item_code = item.get('itemCode', '')
    assigned = False
    for package_name in work_packages.keys():
        if package_name in item_code:
            work_packages[package_name].append(item)
            assigned = True
            break
    if not assigned:
        work_packages['أعمال أخرى'].append(item)

# Calculate schedule
print("\n📋 حزم العمل والجدول الزمني المقترح:")
print("-" * 120)
print(f"{'حزمة العمل':<30} {'عدد الأنشطة':>15} {'التكلفة':>20} {'المدة (يوم)':>15} {'المدة (أسبوع)':>15}")
print("-" * 120)

schedule_data = []
current_date = project_start

for package_name, package_items in work_packages.items():
    if not package_items:
        continue
    
    package_cost = sum(item.get('total', 0) for item in package_items)
    package_duration = sum(estimate_duration(item) for item in package_items) // 2  # Parallel work
    package_duration_weeks = package_duration / 7
    
    schedule_data.append({
        'package': package_name,
        'items': len(package_items),
        'cost': package_cost,
        'duration_days': package_duration,
        'start': current_date,
        'end': current_date + timedelta(days=package_duration)
    })
    
    print(f"{package_name:<30} {len(package_items):>15} {package_cost:>20,.2f} {package_duration:>15} {package_duration_weeks:>15.1f}")
    
    current_date += timedelta(days=package_duration // 2)  # Some overlap

total_duration = (current_date - project_start).days
print("-" * 120)
print(f"{'المدة الإجمالية للمشروع':<30} {'':<15} {total_cost:>20,.2f} {total_duration:>15} {total_duration/7:>15.1f}")

# Milestone schedule
print("\n\n🎯 المعالم الرئيسية للمشروع:")
print("-" * 120)

milestones = [
    ("🚀 بداية المشروع", project_start, 0),
    ("🏗️ إكمال أعمال الموقع العام", project_start + timedelta(days=30), 25),
    ("⚡ إكمال غرف الكهرباء", project_start + timedelta(days=50), 40),
    ("💧 إكمال غرفة المضخات", project_start + timedelta(days=65), 50),
    ("🏠 إكمال غرفة الحراسة", project_start + timedelta(days=80), 65),
    ("✅ التسليم النهائي", current_date, 100)
]

print(f"{'المعلم':<40} {'التاريخ المتوقع':<20} {'نسبة الإنجاز %':>20}")
print("-" * 120)
for milestone_name, milestone_date, progress in milestones:
    print(f"{milestone_name:<40} {milestone_date.strftime('%Y-%m-%d'):<20} {progress:>20}%")

# ============================================
# 3️⃣ إدارة المشروع - PROJECT MANAGER VIEW
# ============================================
print("\n\n" + "=" * 120)
print("📈 تحليل إدارة المشروع - PROJECT MANAGEMENT ANALYSIS (مدير المشروع)")
print("=" * 120)

# Resource analysis
print("\n👷 تحليل الموارد المطلوبة:")
print("-" * 120)

resources = {
    'عمالة فنية': {'count': 15, 'daily_cost': 200, 'duration': total_duration},
    'عمالة عادية': {'count': 30, 'daily_cost': 100, 'duration': total_duration},
    'مهندس موقع': {'count': 2, 'daily_cost': 500, 'duration': total_duration},
    'مشرف فني': {'count': 4, 'daily_cost': 300, 'duration': total_duration},
    'معدات ثقيلة': {'count': 5, 'daily_cost': 1000, 'duration': 45},
    'معدات خفيفة': {'count': 10, 'daily_cost': 200, 'duration': total_duration}
}

print(f"{'الموردالمورد':<25} {'العدد':>10} {'التكلفة اليومية':>20} {'عدد الأيام':>15} {'التكلفة الإجمالية':>25}")
print("-" * 120)

total_resource_cost = 0
for resource_name, resource_data in resources.items():
    total_res_cost = resource_data['count'] * resource_data['daily_cost'] * resource_data['duration']
    total_resource_cost += total_res_cost
    print(f"{resource_name:<25} {resource_data['count']:>10} {resource_data['daily_cost']:>20,.2f} {resource_data['duration']:>15} {total_res_cost:>25,.2f}")

print("-" * 120)
print(f"{'إجمالي تكلفة الموارد':<25} {'':<10} {'':<20} {'':<15} {total_resource_cost:>25,.2f}")

# Cash flow analysis
print("\n\n💰 تحليل التدفق النقدي:")
print("-" * 120)

months = 4  # Project duration in months
monthly_spend = total_cost / months

print(f"{'الشهر':<15} {'الإنفاق المخطط':>25} {'الإنفاق التراكمي':>25} {'نسبة الإنجاز %':>20}")
print("-" * 120)

cumulative_spend = 0
for month in range(1, months + 1):
    cumulative_spend += monthly_spend
    progress_pct = (cumulative_spend / total_cost) * 100
    print(f"{'الشهر ' + str(month):<15} {monthly_spend:>25,.2f} {cumulative_spend:>25,.2f} {progress_pct:>19.1f}%")

# Risk analysis
print("\n\n⚠️ تحليل المخاطر الرئيسية:")
print("-" * 120)

risks = [
    ("تأخر توريد المواد", "متوسط", "عالي", "إعداد قائمة موردين بديلة"),
    ("تغير أسعار المواد", "عالي", "عالي", "تثبيت الأسعار مع الموردين"),
    ("نقص العمالة الفنية", "متوسط", "متوسط", "التعاقد مقدماً مع شركات مقاولات"),
    ("تأخر الاعتمادات", "منخفض", "متوسط", "متابعة دورية مع الاستشاري"),
    ("ظروف جوية غير ملائمة", "منخفض", "منخفض", "جدولة الأعمال حسب المواسم")
]

print(f"{'المخاطرة':<35} {'الاحتمالية':>15} {'التأثير':>15} {'خطة التخفيف':<50}")
print("-" * 120)
for risk_name, probability, impact, mitigation in risks:
    print(f"{risk_name:<35} {probability:>15} {impact:>15} {mitigation:<50}")

# Quality control checkpoints
print("\n\n✅ نقاط المراقبة والجودة:")
print("-" * 120)

checkpoints = [
    ("فحص التربة والأساسات", "قبل الصب", "حرج"),
    ("فحص حديد التسليح", "قبل الصب", "حرج"),
    ("اختبار مكعبات الخرسانة", "بعد 7 و 28 يوم", "حرج"),
    ("فحص العزل المائي والحراري", "بعد التركيب", "مهم"),
    ("فحص اللياسة والدهانات", "قبل التسليم", "مهم"),
    ("اختبار الكهرباء والمضخات", "قبل التشغيل", "حرج")
]

print(f"{'نقطة المراقبة':<45} {'التوقيت':>25} {'الأهمية':>20}")
print("-" * 120)
for checkpoint, timing, importance in checkpoints:
    print(f"{checkpoint:<45} {timing:>25} {importance:>20}")

# S-Curve generation
print("\n\n📊 منحنى الإنجاز (S-Curve):")
print("-" * 120)

weeks = total_duration // 7
print(f"{'الأسبوع':<15} {'الإنفاق التراكمي':>25} {'نسبة الإنجاز %':>20} {'المنحنى':>30}")
print("-" * 120)

for week in range(1, weeks + 1):
    # S-curve formula: slow start, fast middle, slow end
    t = week / weeks
    progress = 100 * (1 / (1 + pow(2.71828, -10 * (t - 0.5))))
    cumulative = (progress / 100) * total_cost
    bar_length = int((progress / 100) * 30)
    bar = "█" * bar_length
    print(f"{'الأسبوع ' + str(week):<15} {cumulative:>25,.2f} {progress:>19.1f}% {bar:>30}")

# Summary
print("\n\n" + "=" * 120)
print("📋 ملخص تنفيذي - EXECUTIVE SUMMARY")
print("=" * 120)

print(f"""
✅ تم تحليل المشروع بنجاح

📊 المعلومات الأساسية:
   • القيمة الإجمالية: {total_cost:,.2f} ريال سعودي
   • عدد البنود: {len(items)} بند
   • عدد الفئات الرئيسية: {len(work_packages)} فئة
   
⏱️ الجدول الزمني:
   • مدة المشروع المقدرة: {total_duration} يوم ({total_duration/7:.1f} أسبوع / {total_duration/30:.1f} شهر)
   • تاريخ البدء المتوقع: {project_start.strftime('%Y-%m-%d')}
   • تاريخ الانتهاء المتوقع: {current_date.strftime('%Y-%m-%d')}
   
💰 التكاليف:
   • تكلفة المواد والتنفيذ: {total_cost:,.2f} ريال
   • تكلفة الموارد المقدرة: {total_resource_cost:,.2f} ريال
   • التكلفة الإجمالية المقدرة: {total_cost + total_resource_cost:,.2f} ريال
   
🎯 المعالم الرئيسية:
   • عدد المعالم: {len(milestones)}
   • التسليم النهائي: {current_date.strftime('%Y-%m-%d')}
   
⚠️ المخاطر:
   • عدد المخاطر المحددة: {len(risks)}
   • مخاطر عالية التأثير: 2
   
✅ نقاط المراقبة:
   • عدد نقاط المراقبة: {len(checkpoints)}
   • نقاط حرجة: 4
""")

print("=" * 120)
print("✨ انتهى التحليل الشامل للمشروع")
print("=" * 120)
