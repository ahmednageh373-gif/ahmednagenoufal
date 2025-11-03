#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
نظام تصحيح بيانات المقايسة
يتعامل مع حالات الأعمدة المقلوبة وسعر الوحدة = 0
"""

import json
from typing import List, Dict, Any

def fix_boq_item(item: Dict[str, Any]) -> Dict[str, Any]:
    """
    تصحيح بند واحد من المقايسة
    يتعامل مع:
    1. الإجمالي موجود → استخدمه
    2. الكمية × سعر الوحدة
    3. الأعمدة المقلوبة (الكمية كبيرة جداً)
    4. سعر الوحدة = 0 (احسبه من الإجمالي)
    """
    name = item.get('name', '').strip()
    unit = item.get('unit', '').strip()
    quantity = float(item.get('quantity', 0))
    unit_price = float(item.get('unit_price', 0))
    total = float(item.get('total', 0))
    
    original_total = total
    
    # الحالة 1: الإجمالي موجود وليس صفر
    if total > 0:
        calculated_total = total
        # إذا كان سعر الوحدة = 0، احسبه من الإجمالي
        if unit_price == 0 and quantity > 0:
            unit_price = total / quantity
    
    # الحالة 2: سعر الوحدة والكمية موجودان
    elif quantity > 0 and unit_price > 0:
        calculated_total = quantity * unit_price
    
    # الحالة 3: الأعمدة مقلوبة (الكمية كبيرة أو سعر الوحدة = 0)
    # مثال: كمية = 26000، سعر الوحدة = 0، إجمالي = 0
    # أو: كمية = 180، سعر الوحدة = 0، إجمالي = 0
    # الحل: الكمية الحقيقية ربما في عمود الوحدة، والرقم الكبير هو سعر الوحدة
    elif quantity > 0 and unit_price == 0 and total == 0:
        # محاولة استخراج الكمية من عمود الوحدة
        try:
            real_quantity = float(unit)
            real_unit_price = quantity  # الرقم في عمود الكمية هو سعر الوحدة الحقيقي
            calculated_total = real_quantity * real_unit_price
            quantity = real_quantity
            unit_price = real_unit_price
            unit = 'بند'  # وحدة افتراضية
        except ValueError:
            # إذا فشل التحويل، ربما الوحدة نص فعلاً
            # في هذه الحالة، ربما الأعمدة مفقودة تماماً
            calculated_total = 0
    
    # الحالة 4: كل القيم صفر
    else:
        calculated_total = 0
    
    return {
        'name': name,
        'unit': unit,
        'quantity': quantity,
        'unit_price': round(unit_price, 2),
        'total': round(calculated_total, 2),
        'status': 'corrected' if (original_total != calculated_total and calculated_total > 0) else 'original'
    }

def parse_manual_input(text: str) -> List[Dict[str, Any]]:
    """
    تحليل النص اليدوي وتحويله إلى بنود مقايسة
    يتعامل مع حالات البيانات الناقصة أو المقلوبة
    """
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    items = []
    
    for idx, line in enumerate(lines, 1):
        # تخطي السطور التي تبدأ بـ "إجراء" أو رموز أخرى
        if line.startswith('إجراء') or line.startswith('#'):
            continue
        
        # تقسيم حسب Tab أو عدة مسافات
        parts = [p.strip() for p in line.split('\t') if p.strip()]
        
        if len(parts) < 3:
            continue
        
        try:
            name = parts[0]
            
            # حالة خاصة: إذا كان السطر يحتوي على 4 أعمدة فقط (بدون وحدة)
            # مثال: اسم | كمية | سعر | إجمالي
            if len(parts) == 4:
                # تحقق: هل العمود الثاني رقم أم نص؟
                try:
                    float(parts[1].replace(',', ''))
                    # العمود الثاني رقم = لا توجد وحدة
                    unit = 'بند'  # وحدة افتراضية
                    quantity = float(parts[1].replace(',', ''))
                    unit_price = float(parts[2].replace(',', '')) if parts[2] else 0
                    total = float(parts[3].replace(',', '')) if parts[3] else 0
                except ValueError:
                    # العمود الثاني نص = وحدة موجودة
                    unit = parts[1]
                    quantity = float(parts[2].replace(',', '')) if parts[2] else 0
                    unit_price = float(parts[3].replace(',', '')) if parts[3] else 0
                    total = 0
            elif len(parts) >= 5:
                # حالة عادية: اسم | وحدة | كمية | سعر | إجمالي
                unit = parts[1]
                quantity = float(parts[2].replace(',', '')) if parts[2] else 0
                unit_price = float(parts[3].replace(',', '')) if parts[3] else 0
                total = float(parts[4].replace(',', '')) if parts[4] else 0
            else:
                # 3 أعمدة فقط
                unit = parts[1] if not parts[1].replace(',', '').replace('.', '').isdigit() else 'بند'
                quantity = float(parts[1 if unit == 'بند' else 2].replace(',', ''))
                unit_price = float(parts[2 if unit == 'بند' else 3].replace(',', '')) if len(parts) > (2 if unit == 'بند' else 3) else 0
                total = 0
            
            item = {
                'id': f'BOQ-{idx:03d}',
                'name': name,
                'unit': unit,
                'quantity': quantity,
                'unit_price': unit_price,
                'total': total
            }
            
            fixed_item = fix_boq_item(item)
            fixed_item['id'] = item['id']
            items.append(fixed_item)
            
        except (ValueError, IndexError) as e:
            print(f"⚠️ تخطي السطر {idx}: {line[:50]}... - خطأ: {e}")
            continue
    
    return items

def main():
    """
    برنامج رئيسي لتصحيح بيانات المقايسة
    """
    print("=" * 70)
    print("🔧 نظام تصحيح بيانات المقايسة")
    print("=" * 70)
    
    # البيانات المدخلة من المستخدم
    manual_data = """
إجراء
أعمال الحفر للأساسات	م3	500	50	25,000
خرسانة مسلحة للقواعد	م3	200	450	90,000
تأسيس مواسير كهرباء - الطابق الأرضي	مقطوعية	1	15000	15,000
سحب أسلاك وتوصيلات - الطابق الأرضي	مقطوعية	1	12000	12,000
تمديد مواسير الصرف الصحي والتغذية	مقطوعية	1	25000	25,000
اعمال تمديد وتركيب نحاس للمكيفات VRF	مقطوعية	1	65000	65,000
اعمال تركيب الواح جبسية للأسقف المعلقة (جبس بورد)	م2	250	65	16,250
اعمال اعتيادية مباني معمارية 1	50	26000	0	0
اعمال اعتيادية مباني معمارية 2	60	8500	0	0
اعمال اعتيادية مباني معمارية 3	1300	180	0	0
اعمال اعتيادية مباني معمارية 4	210	700	0	0
اعمال اعتيادية مباني معمارية 5	4200	2	0	0
اعمال اعتيادية مباني معمارية 6	4200	1	0	0
اعمال اعتيادية مباني معمارية 7	12600	1	0	0
اعمال اعتيادية مباني معمارية 8	12600	3	0	0
اعمال اعتيادية مباني معمارية 9	200	175	0	0
اعمال اعتيادية مباني معمارية 10	90	95	0	0
    """
    
    # تحليل البيانات
    items = parse_manual_input(manual_data)
    
    print(f"\n✅ تم تحليل {len(items)} بند\n")
    print("-" * 70)
    
    # عرض النتائج
    total_cost = 0
    corrected_count = 0
    
    for item in items:
        total_cost += item['total']
        if item['status'] == 'corrected':
            corrected_count += 1
            print(f"🔧 {item['id']}: {item['name'][:40]}")
            print(f"   الكمية: {item['quantity']:,.0f} {item['unit']}")
            print(f"   سعر الوحدة: {item['unit_price']:,.2f} ريال")
            print(f"   الإجمالي: {item['total']:,.2f} ريال ✅")
            print()
    
    print("-" * 70)
    print(f"\n📊 الإحصائيات:")
    print(f"   • إجمالي البنود: {len(items)}")
    print(f"   • البنود المصححة: {corrected_count}")
    print(f"   • البنود الأصلية: {len(items) - corrected_count}")
    print(f"   • التكلفة الإجمالية: {total_cost:,.2f} ريال")
    
    # حفظ النتائج
    output_file = 'boq_corrected.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            'project_info': {
                'total_items': len(items),
                'corrected_items': corrected_count,
                'total_cost': round(total_cost, 2)
            },
            'items': items
        }, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 تم حفظ النتائج في: {output_file}")
    print("=" * 70)

if __name__ == '__main__':
    main()
