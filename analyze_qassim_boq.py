#!/usr/bin/env python3
"""
تحليل ملف مقايسة القصيم التعاقدي
يتعرف على الأعمدة: الرقم، البند، وصف البند، المواصفات، الكود، الوحدة، الكمية، السعر، الإجمالي
"""

import pandas as pd
import json
import sys

def analyze_qassim_boq(file_path):
    """تحليل ملف المقايسة وإخراج البيانات بشكل منظم"""
    
    print("🔍 جاري تحليل ملف المقايسة...")
    print("=" * 80)
    
    # قراءة الملف (header في الصف 5)
    df = pd.read_excel(file_path, header=5)
    
    # تنظيف أسماء الأعمدة
    df.columns = df.columns.str.strip()
    
    print("\n📋 الأعمدة المكتشفة:")
    print("-" * 80)
    for i, col in enumerate(df.columns):
        print(f"  {i+1}. {col}")
    
    # تعيين الأعمدة حسب المواصفات
    column_mapping = {
        'serial': 'الرقم التسلسلي',
        'category': 'الفئة', 
        'item_name': 'البند',
        'description': 'وصف البند',
        'specifications': 'المواصفات',
        'mandatory': 'منتج من القائمة الإلزامية',
        'code': 'الرمز الإنشائي',
        'attachments': 'مرفقات',
        'unit': 'وحدة القياس',
        'quantity': 'الكمية',
        'unit_price': 'سعر الوحدة',
        'total': 'الإجمالي'
    }
    
    # تصفية البيانات (إزالة الصفوف الفارغة والعناوين)
    df_clean = df.copy()
    
    # إزالة الصفوف التي لا تحتوي على رقم تسلسلي
    df_clean = df_clean[pd.notna(df_clean[column_mapping['serial']])]
    
    # تحويل الأعمدة الرقمية
    numeric_columns = {
        'serial': column_mapping['serial'],
        'category': column_mapping['category'],
        'quantity': column_mapping['quantity'],
        'unit_price': column_mapping['unit_price'],
        'total': column_mapping['total']
    }
    
    for key, col in numeric_columns.items():
        if col in df_clean.columns:
            df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce')
    
    # إزالة الصفوف التي لا تحتوي على كمية أو سعر
    df_clean = df_clean[(pd.notna(df_clean[column_mapping['quantity']])) & 
                        (pd.notna(df_clean[column_mapping['unit_price']]))]
    
    print(f"\n📊 عدد البنود الصالحة: {len(df_clean)}")
    print("=" * 80)
    
    # تحويل إلى قائمة من القواميس
    items = []
    for idx, row in df_clean.iterrows():
        item = {
            'serial': int(row[column_mapping['serial']]) if pd.notna(row[column_mapping['serial']]) else None,
            'category': int(row[column_mapping['category']]) if pd.notna(row[column_mapping['category']]) else None,
            'item_name': str(row[column_mapping['item_name']]) if pd.notna(row[column_mapping['item_name']]) else '',
            'description': str(row[column_mapping['description']]) if pd.notna(row[column_mapping['description']]) else '',
            'specifications': str(row[column_mapping['specifications']]) if pd.notna(row[column_mapping['specifications']]) else '',
            'mandatory': str(row[column_mapping['mandatory']]) if pd.notna(row[column_mapping['mandatory']]) else '',
            'code': str(row[column_mapping['code']]) if pd.notna(row[column_mapping['code']]) else '',
            'unit': str(row[column_mapping['unit']]) if pd.notna(row[column_mapping['unit']]) else '',
            'quantity': float(row[column_mapping['quantity']]) if pd.notna(row[column_mapping['quantity']]) else 0,
            'unit_price': float(row[column_mapping['unit_price']]) if pd.notna(row[column_mapping['unit_price']]) else 0,
            'total': float(row[column_mapping['total']]) if pd.notna(row[column_mapping['total']]) else 0
        }
        items.append(item)
    
    # حساب الإحصائيات
    total_amount = sum(item['total'] for item in items)
    
    # عرض عينة من البيانات
    print("\n📋 عينة من البيانات (أول 5 بنود):")
    print("=" * 80)
    for i, item in enumerate(items[:5], 1):
        print(f"\n{i}. البند رقم {item['serial']}:")
        print(f"   الاسم: {item['item_name']}")
        print(f"   الوصف: {item['description'][:80]}...")
        print(f"   الكود: {item['code']}")
        print(f"   الوحدة: {item['unit']}")
        print(f"   الكمية: {item['quantity']:,.2f}")
        print(f"   سعر الوحدة: {item['unit_price']:,.2f} ريال")
        print(f"   الإجمالي: {item['total']:,.2f} ريال")
    
    # الإحصائيات
    print("\n" + "=" * 80)
    print("📊 الإحصائيات:")
    print("-" * 80)
    print(f"  عدد البنود: {len(items)}")
    print(f"  إجمالي المقايسة: {total_amount:,.2f} ريال")
    print(f"  متوسط قيمة البند: {total_amount/len(items):,.2f} ريال" if len(items) > 0 else "  متوسط قيمة البند: 0 ريال")
    
    # التصنيف حسب الفئة
    categories = {}
    for item in items:
        cat = item['category']
        if cat not in categories:
            categories[cat] = {'count': 0, 'total': 0}
        categories[cat]['count'] += 1
        categories[cat]['total'] += item['total']
    
    print(f"  عدد الفئات: {len(categories)}")
    
    print("\n📈 توزيع البنود حسب الفئة:")
    print("-" * 80)
    for cat, data in sorted(categories.items())[:10]:
        print(f"  الفئة {cat}: {data['count']} بند - {data['total']:,.2f} ريال")
    
    # حفظ النتائج
    result = {
        'file_name': file_path,
        'file_type': 'BOQ - جدول الكميات',
        'total_items': len(items),
        'total_amount': total_amount,
        'categories': len(categories),
        'items': items,
        'column_mapping': column_mapping,
        'statistics': {
            'total_items': len(items),
            'total_amount': total_amount,
            'average_item_value': total_amount / len(items) if len(items) > 0 else 0,
            'categories_count': len(categories),
            'categories_breakdown': {str(k): v for k, v in categories.items()}
        }
    }
    
    # حفظ إلى JSON
    output_file = file_path.replace('.xlsx', '_analyzed.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ تم حفظ النتائج في: {output_file}")
    print("=" * 80)
    
    return result

if __name__ == "__main__":
    file_path = "القصيم-التعاقدي.xlsx"
    result = analyze_qassim_boq(file_path)
    
    print("\n🎉 تم التحليل بنجاح!")
    print(f"✅ {result['total_items']} بند")
    print(f"✅ إجمالي: {result['total_amount']:,.2f} ريال")
