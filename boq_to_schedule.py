#!/usr/bin/env python3
"""
تحويل المقايسة إلى جدول زمني متكامل
BOQ to Integrated Schedule Converter

يقرأ المواصفات من المقايسة ويحولها إلى أنشطة للجدول الزمني
"""

import json
import pandas as pd
from datetime import datetime, timedelta
import re
from typing import List, Dict, Tuple

class BOQToScheduleConverter:
    """محول المقايسة إلى جدول زمني"""
    
    def __init__(self):
        # قواعد تقدير المدة حسب نوع العمل والكمية
        self.duration_rules = {
            # أعمال الحفر والردم
            'حفر': {'unit': 'م3', 'rate': 50, 'min_days': 2, 'max_days': 30},
            'ردم': {'unit': 'م3', 'rate': 80, 'min_days': 1, 'max_days': 20},
            
            # أعمال الخرسانة
            'خرسانة': {'unit': 'م3', 'rate': 20, 'min_days': 3, 'max_days': 60},
            'صب': {'unit': 'م3', 'rate': 30, 'min_days': 1, 'max_days': 30},
            
            # أعمال المباني
            'مباني': {'unit': 'م2', 'rate': 30, 'min_days': 5, 'max_days': 90},
            'بلوك': {'unit': 'م2', 'rate': 40, 'min_days': 3, 'max_days': 60},
            
            # أعمال التشطيبات
            'لياسة': {'unit': 'م2', 'rate': 50, 'min_days': 5, 'max_days': 60},
            'دهان': {'unit': 'م2', 'rate': 100, 'min_days': 3, 'max_days': 45},
            'بلاط': {'unit': 'م2', 'rate': 40, 'min_days': 3, 'max_days': 60},
            'سيراميك': {'unit': 'م2', 'rate': 40, 'min_days': 3, 'max_days': 60},
            'رخام': {'unit': 'م2', 'rate': 30, 'min_days': 5, 'max_days': 60},
            'جرانيت': {'unit': 'م2', 'rate': 30, 'min_days': 5, 'max_days': 60},
            
            # أعمال الكهرباء
            'كهرباء': {'unit': 'نقطة', 'rate': 20, 'min_days': 5, 'max_days': 60},
            'كهربائية': {'unit': 'م', 'rate': 50, 'min_days': 5, 'max_days': 60},
            'تمديد': {'unit': 'م', 'rate': 50, 'min_days': 3, 'max_days': 45},
            
            # أعمال السباكة
            'سباكة': {'unit': 'نقطة', 'rate': 15, 'min_days': 5, 'max_days': 60},
            'مواسير': {'unit': 'م', 'rate': 40, 'min_days': 3, 'max_days': 45},
            'صرف': {'unit': 'م', 'rate': 30, 'min_days': 3, 'max_days': 45},
            
            # أعمال التكييف
            'تكييف': {'unit': 'وحدة', 'rate': 2, 'min_days': 10, 'max_days': 90},
            'مكيف': {'unit': 'وحدة', 'rate': 2, 'min_days': 5, 'max_days': 60},
            
            # أعمال الحدادة والنجارة
            'حدادة': {'unit': 'طن', 'rate': 2, 'min_days': 7, 'max_days': 60},
            'نجارة': {'unit': 'م2', 'rate': 20, 'min_days': 5, 'max_days': 60},
            'شدة': {'unit': 'م2', 'rate': 50, 'min_days': 2, 'max_days': 30},
            
            # أعمال التركيب
            'تركيب': {'unit': 'عدد', 'rate': 5, 'min_days': 2, 'max_days': 30},
            'توريد': {'unit': 'عدد', 'rate': 10, 'min_days': 3, 'max_days': 45},
            
            # Default
            'default': {'unit': 'لوح', 'rate': 10, 'min_days': 3, 'max_days': 30}
        }
        
        # علاقات التبعية (أي عمل يتبع أي عمل)
        self.dependency_rules = {
            'خرسانة': ['حفر', 'شدة', 'حدادة'],
            'مباني': ['خرسانة', 'صب'],
            'لياسة': ['مباني'],
            'دهان': ['لياسة'],
            'بلاط': ['لياسة'],
            'كهرباء': ['مباني', 'لياسة'],
            'سباكة': ['حفر', 'مباني'],
            'تكييف': ['كهرباء', 'سباكة']
        }
    
    def extract_work_type(self, text: str) -> str:
        """استخراج نوع العمل من النص"""
        text_lower = text.lower()
        
        # البحث عن الكلمات المفتاحية
        for work_type in self.duration_rules.keys():
            if work_type in text_lower:
                return work_type
        
        return 'default'
    
    def estimate_duration(self, work_type: str, quantity: float, unit: str) -> int:
        """تقدير مدة النشاط بالأيام"""
        
        rule = self.duration_rules.get(work_type, self.duration_rules['default'])
        
        # حساب المدة بناءً على الكمية ومعدل الإنتاج
        if quantity > 0:
            estimated_days = quantity / rule['rate']
            # تطبيق الحدود الدنيا والعليا
            duration = max(rule['min_days'], min(int(estimated_days), rule['max_days']))
        else:
            duration = rule['min_days']
        
        return duration
    
    def identify_dependencies(self, activities: List[Dict]) -> List[Dict]:
        """تحديد التبعيات بين الأنشطة"""
        
        for i, activity in enumerate(activities):
            work_type = activity['work_type']
            dependencies = []
            
            # البحث عن الأعمال التي يجب أن تسبق هذا النشاط
            if work_type in self.dependency_rules:
                required_works = self.dependency_rules[work_type]
                
                # البحث في الأنشطة السابقة
                for j in range(i):
                    prev_activity = activities[j]
                    if prev_activity['work_type'] in required_works:
                        dependencies.append(prev_activity['id'])
            
            activity['dependencies'] = dependencies
        
        return activities
    
    def calculate_dates(self, activities: List[Dict], start_date: datetime) -> List[Dict]:
        """حساب تواريخ البداية والنهاية لكل نشاط"""
        
        # قاموس لتخزين تاريخ انتهاء كل نشاط
        end_dates = {}
        
        for activity in activities:
            # إذا لم يكن هناك تبعيات، نبدأ من تاريخ البداية
            if not activity['dependencies']:
                activity['start_date'] = start_date
            else:
                # نبدأ بعد انتهاء آخر تبعية
                max_end_date = start_date
                for dep_id in activity['dependencies']:
                    if dep_id in end_dates:
                        dep_end = end_dates[dep_id]
                        if dep_end > max_end_date:
                            max_end_date = dep_end
                
                # إضافة يوم واحد بعد انتهاء التبعية
                activity['start_date'] = max_end_date + timedelta(days=1)
            
            # حساب تاريخ النهاية
            activity['end_date'] = activity['start_date'] + timedelta(days=activity['duration'])
            end_dates[activity['id']] = activity['end_date']
        
        return activities
    
    def convert_boq_to_schedule(self, boq_data: Dict, start_date: datetime = None) -> Dict:
        """تحويل المقايسة إلى جدول زمني متكامل"""
        
        if start_date is None:
            start_date = datetime.now()
        
        print("🔄 جاري تحويل المقايسة إلى جدول زمني...")
        print("=" * 80)
        
        activities = []
        
        # معالجة كل بند في المقايسة
        for item in boq_data['items']:
            # استخراج نوع العمل من المواصفات أو الوصف
            specifications = item.get('specifications', '') or item.get('description', '')
            item_name = item.get('item_name', '')
            
            # دمج النصوص للتحليل
            full_text = f"{item_name} {specifications}"
            work_type = self.extract_work_type(full_text)
            
            # تقدير المدة
            duration = self.estimate_duration(
                work_type, 
                item.get('quantity', 0),
                item.get('unit', '')
            )
            
            # إنشاء النشاط
            activity = {
                'id': f"ACT-{item['serial']}",
                'serial': item['serial'],
                'name': item_name,
                'description': specifications[:200] + '...' if len(specifications) > 200 else specifications,
                'work_type': work_type,
                'duration': duration,
                'quantity': item.get('quantity', 0),
                'unit': item.get('unit', ''),
                'cost': item.get('total', 0),
                'boq_reference': item['serial'],
                'category': item.get('category', ''),
                'code': item.get('code', ''),
                'dependencies': [],
                'resources': [],
                'progress': 0,
                'status': 'not-started'
            }
            
            activities.append(activity)
        
        print(f"✅ تم إنشاء {len(activities)} نشاط")
        
        # تحديد التبعيات
        print("\n🔗 جاري تحديد التبعيات...")
        activities = self.identify_dependencies(activities)
        
        total_dependencies = sum(len(act['dependencies']) for act in activities)
        print(f"✅ تم تحديد {total_dependencies} علاقة تبعية")
        
        # حساب التواريخ
        print("\n📅 جاري حساب التواريخ...")
        activities = self.calculate_dates(activities, start_date)
        
        # حساب نهاية المشروع
        project_end = max(act['end_date'] for act in activities)
        total_duration = (project_end - start_date).days
        
        print(f"✅ تاريخ البداية: {start_date.strftime('%Y-%m-%d')}")
        print(f"✅ تاريخ النهاية المتوقع: {project_end.strftime('%Y-%m-%d')}")
        print(f"✅ المدة الإجمالية: {total_duration} يوم")
        
        # تحديد المسار الحرج (أطول مسار)
        print("\n🎯 جاري تحديد المسار الحرج...")
        critical_path = self.find_critical_path(activities)
        print(f"✅ المسار الحرج يحتوي على {len(critical_path)} نشاط")
        
        # إحصائيات
        work_types_count = {}
        for act in activities:
            work_type = act['work_type']
            work_types_count[work_type] = work_types_count.get(work_type, 0) + 1
        
        print("\n📊 توزيع الأنشطة حسب النوع:")
        print("-" * 80)
        for work_type, count in sorted(work_types_count.items(), key=lambda x: x[1], reverse=True)[:10]:
            print(f"  {work_type}: {count} نشاط")
        
        # تجهيز النتيجة
        result = {
            'project_info': {
                'name': boq_data.get('file_name', 'مشروع'),
                'start_date': start_date.strftime('%Y-%m-%d'),
                'end_date': project_end.strftime('%Y-%m-%d'),
                'total_duration': total_duration,
                'total_activities': len(activities),
                'total_cost': sum(act['cost'] for act in activities),
                'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            },
            'activities': [
                {
                    **act,
                    'start_date': act['start_date'].strftime('%Y-%m-%d'),
                    'end_date': act['end_date'].strftime('%Y-%m-%d')
                }
                for act in activities
            ],
            'critical_path': critical_path,
            'statistics': {
                'total_activities': len(activities),
                'total_duration': total_duration,
                'total_dependencies': total_dependencies,
                'work_types': work_types_count,
                'critical_path_length': len(critical_path)
            }
        }
        
        return result
    
    def find_critical_path(self, activities: List[Dict]) -> List[str]:
        """إيجاد المسار الحرج (أطول مسار من البداية للنهاية)"""
        
        # بناء شجرة التبعيات
        graph = {act['id']: act['dependencies'] for act in activities}
        
        # إيجاد الأنشطة التي لا تعتمد على أي شيء (نقاط البداية)
        start_activities = [act['id'] for act in activities if not act['dependencies']]
        
        # إيجاد الأنشطة التي لا يعتمد عليها أي شيء (نقاط النهاية)
        all_dependencies = set()
        for deps in graph.values():
            all_dependencies.update(deps)
        
        end_activities = [act_id for act_id in graph.keys() if act_id not in all_dependencies]
        
        # DFS للبحث عن أطول مسار
        def dfs(activity_id, path, visited):
            visited.add(activity_id)
            path.append(activity_id)
            
            # البحث في الأنشطة التي تعتمد على هذا النشاط
            next_activities = [
                act['id'] for act in activities 
                if activity_id in act['dependencies'] and act['id'] not in visited
            ]
            
            if not next_activities:
                return path.copy()
            
            longest_path = path.copy()
            for next_act in next_activities:
                current_path = dfs(next_act, path.copy(), visited.copy())
                if len(current_path) > len(longest_path):
                    longest_path = current_path
            
            return longest_path
        
        # إيجاد أطول مسار من كل نقطة بداية
        critical_path = []
        for start in start_activities:
            path = dfs(start, [], set())
            if len(path) > len(critical_path):
                critical_path = path
        
        return critical_path


def main():
    """البرنامج الرئيسي"""
    
    print("=" * 80)
    print("🚀 محول المقايسة إلى جدول زمني متكامل")
    print("=" * 80)
    
    # قراءة بيانات المقايسة المحللة
    boq_file = 'القصيم-التعاقدي_analyzed.json'
    
    print(f"\n📖 جاري قراءة المقايسة من: {boq_file}")
    with open(boq_file, 'r', encoding='utf-8') as f:
        boq_data = json.load(f)
    
    print(f"✅ تم تحميل {boq_data['total_items']} بند")
    
    # إنشاء المحول
    converter = BOQToScheduleConverter()
    
    # تحديد تاريخ بداية المشروع
    start_date = datetime(2025, 1, 1)  # يمكن تغييره
    
    # تحويل المقايسة إلى جدول زمني
    print(f"\n📅 تاريخ بداية المشروع: {start_date.strftime('%Y-%m-%d')}")
    schedule_data = converter.convert_boq_to_schedule(boq_data, start_date)
    
    # حفظ النتيجة
    output_file = 'القصيم-جدول-زمني-متكامل.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(schedule_data, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 80)
    print(f"✅ تم حفظ الجدول الزمني في: {output_file}")
    print("=" * 80)
    
    # عرض عينة من الأنشطة
    print("\n📋 عينة من الأنشطة (أول 5):")
    print("-" * 80)
    for i, activity in enumerate(schedule_data['activities'][:5], 1):
        print(f"\n{i}. {activity['name']}")
        print(f"   النوع: {activity['work_type']}")
        print(f"   المدة: {activity['duration']} يوم")
        print(f"   من: {activity['start_date']} → إلى: {activity['end_date']}")
        print(f"   التبعيات: {len(activity['dependencies'])} نشاط سابق")
        print(f"   التكلفة: {activity['cost']:,.2f} ريال")
    
    # عرض المسار الحرج
    print("\n" + "=" * 80)
    print("🎯 المسار الحرج (Critical Path):")
    print("-" * 80)
    critical_activities = [
        act for act in schedule_data['activities'] 
        if act['id'] in schedule_data['critical_path']
    ]
    for i, activity in enumerate(critical_activities[:10], 1):
        print(f"{i}. {activity['name']} ({activity['duration']} يوم)")
    
    print("\n" + "=" * 80)
    print("🎉 تم الإنجاز بنجاح!")
    print("=" * 80)


if __name__ == "__main__":
    main()
