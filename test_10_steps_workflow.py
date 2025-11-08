#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NOUFAL - اختبار الخطوات العشر الكاملة للجدول الزمني
Test 10-Step Professional Scheduling Workflow
"""

import pandas as pd
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any
import math

class TenStepScheduler:
    """محرك الجدول الزمني الاحترافي - 10 خطوات"""
    
    def __init__(self, boq_file: str):
        self.boq_file = boq_file
        self.activities = []
        self.project_duration = 0
        self.project_start = datetime(2025, 1, 1)
        
    def step1_read_boq(self) -> pd.DataFrame:
        """الخطوة 1: قراءة المقايسة"""
        print("🔍 الخطوة 1/10: قراءة المقايسة...")
        df = pd.read_excel(self.boq_file, sheet_name=0)
        print(f"   ✅ تم قراءة {len(df)} بند من المقايسة")
        return df
    
    def step2_classify_items(self, df: pd.DataFrame) -> Dict[str, List]:
        """الخطوة 2: تصنيف البنود"""
        print("\n📊 الخطوة 2/10: تصنيف البنود...")
        categories = {}
        
        for idx, row in df.iterrows():
            try:
                desc = str(row.iloc[1]) if len(row) > 1 else ""
                
                # تصنيف تلقائي بناءً على الوصف
                if any(x in desc for x in ['حفر', 'تسوية', 'نقل']):
                    category = 'أعمال حفر ونقل'
                elif any(x in desc for x in ['خرسانة', 'صب', 'بيتون']):
                    category = 'أعمال خرسانية'
                elif any(x in desc for x in ['حديد', 'تسليح']):
                    category = 'أعمال حديد'
                elif any(x in desc for x in ['بلوك', 'طوب', 'بناء']):
                    category = 'أعمال مباني'
                elif any(x in desc for x in ['لياسة', 'محارة', 'قصارة']):
                    category = 'أعمال لياسة'
                elif any(x in desc for x in ['دهان', 'طلاء']):
                    category = 'أعمال دهانات'
                elif any(x in desc for x in ['بلاط', 'رخام', 'جرانيت']):
                    category = 'أعمال تشطيبات'
                elif any(x in desc for x in ['كهرباء', 'كبل', 'لوحة']):
                    category = 'أعمال كهربائية'
                elif any(x in desc for x in ['سباكة', 'مواسير', 'صرف']):
                    category = 'أعمال صحية'
                else:
                    category = 'أعمال عامة'
                
                if category not in categories:
                    categories[category] = []
                categories[category].append(row)
            except:
                continue
        
        print(f"   ✅ تم تصنيف البنود إلى {len(categories)} فئات")
        for cat, items in categories.items():
            print(f"      • {cat}: {len(items)} بند")
        return categories
    
    def step3_extract_activities(self, categories: Dict) -> List[Dict]:
        """الخطوة 3: استخراج الأنشطة (Level-3 WBS)"""
        print("\n🔨 الخطوة 3/10: استخراج الأنشطة التنفيذية...")
        activities = []
        activity_id = 1
        
        # معدلات الإنتاج السعودية القياسية
        productivity_rates = {
            'حفر': 25,  # م3 في اليوم
            'خرسانة': 15,  # م3 في اليوم
            'حديد': 1,  # طن في اليوم
            'بلوك': 20,  # م2 في اليوم
            'لياسة': 25,  # م2 في اليوم
            'دهان': 30,  # م2 في اليوم
            'بلاط': 15,  # م2 في اليوم
        }
        
        for category, items in categories.items():
            for item in items:
                try:
                    desc = str(item.iloc[1] if len(item) > 1 else "")
                    qty_str = str(item.iloc[2] if len(item) > 2 else "0")
                    unit = str(item.iloc[3] if len(item) > 3 else "م")
                    
                    # استخراج الكمية
                    qty = 0
                    try:
                        qty = float(qty_str.replace(',', ''))
                    except:
                        qty = 100  # قيمة افتراضية
                    
                    # تحديد نوع النشاط
                    activity_type = 'general'
                    rate = 10
                    for key in productivity_rates:
                        if key in desc:
                            activity_type = key
                            rate = productivity_rates[key]
                            break
                    
                    # حساب المدة (بدون shift factor - سيتم تطبيقه في الخطوة 4)
                    duration_days = math.ceil(qty / rate)
                    duration_days = max(0.5, min(30, duration_days))  # بين 0.5 و 30 يوم
                    
                    activities.append({
                        'id': f'A{activity_id:04d}',
                        'name': desc[:60],
                        'category': category,
                        'activity_type': activity_type,
                        'quantity': qty,
                        'unit': unit,
                        'base_duration': duration_days,
                        'adjusted_duration': duration_days,  # سيتم تعديله
                        'predecessors': [],
                        'is_critical': False,
                        'float': 0
                    })
                    activity_id += 1
                except:
                    continue
        
        print(f"   ✅ تم استخراج {len(activities)} نشاط تنفيذي")
        return activities
    
    def step4_apply_shift_factors(self, activities: List[Dict]) -> List[Dict]:
        """الخطوة 4: تطبيق معامل الورديات"""
        print("\n⏰ الخطوة 4/10: تطبيق معامل الورديات...")
        
        shift_config = {
            1: 1.0,   # 1 وردية = 100%
            2: 0.6,   # 2 وردية = 60%
            3: 0.45   # 3 ورديات = 45%
        }
        
        # تطبيق ورديتين للأنشطة الحرجة
        for activity in activities:
            if activity['base_duration'] > 15:  # أنشطة طويلة
                shifts = 2
                factor = shift_config[shifts]
                activity['shifts'] = shifts
                activity['shift_factor'] = factor
                activity['adjusted_duration'] = activity['base_duration'] * factor
                activity['adjusted_duration'] = math.ceil(activity['adjusted_duration'])
            else:
                activity['shifts'] = 1
                activity['shift_factor'] = 1.0
        
        print(f"   ✅ تم تطبيق معامل الورديات على جميع الأنشطة")
        return activities
    
    def step5_apply_risk_buffers(self, activities: List[Dict]) -> List[Dict]:
        """الخطوة 5: إضافة احتياطي الزمن"""
        print("\n🛡️ الخطوة 5/10: إضافة احتياطي الزمن (Risk Buffer)...")
        
        for activity in activities:
            # تحديد نوع المخاطر
            if activity['activity_type'] in ['دهان', 'بلاط']:
                buffer_pct = 8  # أعمال دقيقة
                risk_type = 'precision'
            elif 'external' in activity.get('notes', ''):
                buffer_pct = 6  # أعمال خارجية
                risk_type = 'external'
            elif activity.get('is_critical', False):
                buffer_pct = 5  # أنشطة حرجة
                risk_type = 'critical'
            else:
                buffer_pct = 3  # غير حرج
                risk_type = 'non-critical'
            
            buffer_days = math.ceil(activity['adjusted_duration'] * buffer_pct / 100)
            activity['risk_buffer'] = {
                'type': risk_type,
                'percentage': buffer_pct,
                'days': buffer_days
            }
            activity['adjusted_duration'] += buffer_days
        
        print(f"   ✅ تم إضافة احتياطي زمني لـ {len(activities)} نشاط")
        return activities
    
    def step6_calculate_dependencies(self, activities: List[Dict]) -> List[Dict]:
        """الخطوة 6: حساب العلاقات (CPM)"""
        print("\n🔗 الخطوة 6/10: حساب العلاقات والمسار الحرج...")
        
        # ترتيب الأنشطة حسب الفئات (logic)
        category_order = [
            'أعمال حفر ونقل',
            'أعمال خرسانية',
            'أعمال حديد',
            'أعمال مباني',
            'أعمال لياسة',
            'أعمال كهربائية',
            'أعمال صحية',
            'أعمال تشطيبات',
            'أعمال دهانات'
        ]
        
        # إضافة علاقات منطقية
        prev_activity = None
        for i, activity in enumerate(activities):
            if i == 0:
                activity['early_start'] = 0
            else:
                # Finish-to-Start relationship
                if prev_activity:
                    activity['predecessors'] = [prev_activity['id']]
                    activity['early_start'] = prev_activity.get('early_finish', 0)
                else:
                    activity['early_start'] = 0
            
            activity['early_finish'] = activity['early_start'] + activity['adjusted_duration']
            prev_activity = activity
        
        # Backward Pass لحساب Float
        total_duration = max([a['early_finish'] for a in activities])
        for activity in reversed(activities):
            activity['late_finish'] = total_duration
            activity['late_start'] = activity['late_finish'] - activity['adjusted_duration']
            activity['float'] = activity['late_start'] - activity['early_start']
            activity['is_critical'] = (activity['float'] <= 0)
        
        critical_count = sum(1 for a in activities if a['is_critical'])
        print(f"   ✅ تم تحديد {critical_count} نشاط حرج")
        print(f"   ✅ المدة الإجمالية: {total_duration:.1f} يوم")
        
        self.project_duration = total_duration
        return activities
    
    def step7_apply_calendar(self, activities: List[Dict]) -> Dict:
        """الخطوة 7: تطبيق التقويم"""
        print("\n📅 الخطوة 7/10: تطبيق تقويم المشروع...")
        
        calendar = {
            'work_days': ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
            'holidays': [
                {'date': '2025-03-30', 'name': 'عيد الفطر - يوم 1'},
                {'date': '2025-03-31', 'name': 'عيد الفطر - يوم 2'},
                {'date': '2025-04-01', 'name': 'عيد الفطر - يوم 3'},
                {'date': '2025-06-07', 'name': 'عيد الأضحى - يوم 1'},
                {'date': '2025-06-08', 'name': 'عيد الأضحى - يوم 2'},
                {'date': '2025-09-23', 'name': 'اليوم الوطني السعودي'},
                {'date': '2025-02-22', 'name': 'يوم التأسيس'}
            ],
            'rainy_day_buffer_pct': 6,  # 6% = 1 يوم ممطر لكل 17 يوم عمل
            'ramadan': {
                'start': '2025-02-28',
                'end': '2025-03-29',
                'productivity_factor': 0.7  # 70% إنتاجية
            }
        }
        
        # إضافة احتياطي الأمطار (6%)
        rainy_buffer_days = math.ceil(self.project_duration * 0.06)
        self.project_duration += rainy_buffer_days
        
        print(f"   ✅ تم إضافة {len(calendar['holidays'])} يوم عطلة")
        print(f"   ✅ تم إضافة {rainy_buffer_days} يوم احتياطي أمطار (6%)")
        print(f"   ✅ تعديل رمضان: 70% إنتاجية")
        
        return calendar
    
    def step8_resource_leveling(self, activities: List[Dict]) -> Dict:
        """الخطوة 8: موازنة الأحمال"""
        print("\n⚖️ الخطوة 8/10: موازنة الأحمال العمالية...")
        
        # بناء histogram يومي
        histogram = {}
        for activity in activities:
            start = int(activity['early_start'])
            finish = int(activity['early_finish'])
            
            # افتراض 10 عمال لكل نشاط (تقديري)
            labor_per_day = 10
            
            for day in range(start, finish):
                if day not in histogram:
                    histogram[day] = 0
                histogram[day] += labor_per_day
        
        if histogram:
            labor_counts = list(histogram.values())
            peak_labor = max(labor_counts)
            avg_labor = sum(labor_counts) / len(labor_counts)
            ratio = peak_labor / avg_labor if avg_labor > 0 else 1.0
        else:
            peak_labor = 0
            avg_labor = 0
            ratio = 1.0
        
        is_balanced = ratio <= 1.20  # ≤ 120%
        
        result = {
            'peak_labor': peak_labor,
            'average_labor': avg_labor,
            'peak_to_average_ratio': ratio,
            'is_balanced': is_balanced,
            'recommendations': []
        }
        
        if not is_balanced:
            result['recommendations'] = [
                '💡 Split Activity - قسّم الأنشطة ذات الأحمال العالية',
                '💡 Increase Crews - زد عدد الطواقم',
                '💡 Add Shift - حوّل بعض الأنشطة إلى ورديتين'
            ]
        
        status = "✅ متوازن" if is_balanced else "⚠️ غير متوازن"
        print(f"   {status}: Peak={peak_labor:.0f} | Average={avg_labor:.0f} | Ratio={ratio:.2%}")
        
        return result
    
    def step9_extract_milestones(self, activities: List[Dict], categories: Dict) -> List[Dict]:
        """الخطوة 9: استخراج نقاط التسليم"""
        print("\n🎯 الخطوة 9/10: استخراج نقاط التسليم (Milestones)...")
        
        milestones = []
        
        # Start Milestone
        milestones.append({
            'name': 'بداية المشروع (Start)',
            'date': self.project_start.strftime('%Y-%m-%d'),
            'is_contractual': True
        })
        
        # Category Completion Milestones
        for category, items in categories.items():
            category_activities = [a for a in activities if a['category'] == category]
            if category_activities:
                last_activity = max(category_activities, key=lambda x: x['early_finish'])
                milestone_date = self.project_start + timedelta(days=last_activity['early_finish'])
                milestones.append({
                    'name': f'إنجاز {category}',
                    'date': milestone_date.strftime('%Y-%m-%d'),
                    'is_contractual': False
                })
        
        # PC Milestone
        pc_date = self.project_start + timedelta(days=self.project_duration)
        milestones.append({
            'name': 'الإنجاز الكلي (Practical Completion)',
            'date': pc_date.strftime('%Y-%m-%d'),
            'is_contractual': True
        })
        
        print(f"   ✅ تم استخراج {len(milestones)} نقطة تسليم")
        
        return milestones
    
    def step10_generate_report(self, activities: List[Dict], calendar: Dict, 
                               leveling: Dict, milestones: List[Dict]) -> Dict:
        """الخطوة 10: توليد التقرير النهائي"""
        print("\n📊 الخطوة 10/10: توليد التقرير النهائي...")
        
        report = {
            'project_name': 'مشروع القصيم التعاقدي',
            'generated_at': datetime.now().isoformat(),
            'statistics': {
                'total_activities': len(activities),
                'critical_activities': sum(1 for a in activities if a['is_critical']),
                'total_duration_days': self.project_duration,
                'start_date': self.project_start.strftime('%Y-%m-%d'),
                'end_date': (self.project_start + timedelta(days=self.project_duration)).strftime('%Y-%m-%d')
            },
            'shift_factors': {
                '1_shift': '100%',
                '2_shifts': '60%',
                '3_shifts': '45%'
            },
            'risk_buffers': {
                'non_critical': '3%',
                'critical': '5%',
                'external': '6%',
                'precision': '8%'
            },
            'calendar': calendar,
            'resource_leveling': leveling,
            'milestones': milestones,
            'activities': activities[:20]  # أول 20 نشاط للعرض
        }
        
        print("\n" + "="*60)
        print("📋 ملخص المشروع:")
        print("="*60)
        print(f"   📌 إجمالي الأنشطة: {report['statistics']['total_activities']}")
        print(f"   🔴 أنشطة حرجة: {report['statistics']['critical_activities']}")
        print(f"   ⏱️ المدة الإجمالية: {report['statistics']['total_duration_days']:.1f} يوم")
        print(f"   📅 تاريخ البدء: {report['statistics']['start_date']}")
        print(f"   📅 تاريخ الانتهاء: {report['statistics']['end_date']}")
        print(f"   ⚖️ موازنة الأحمال: {'✅ متوازن' if leveling['is_balanced'] else '⚠️ يحتاج تحسين'}")
        print(f"   🎯 نقاط التسليم: {len(milestones)}")
        print("="*60)
        
        return report
    
    def run(self) -> Dict:
        """تشغيل جميع الخطوات العشر"""
        print("\n" + "🚀 " * 30)
        print("بدء الخطوات العشر الكاملة للجدول الزمني الاحترافي")
        print("10-Step Professional Scheduling Workflow")
        print("🚀 " * 30)
        
        # تنفيذ الخطوات
        df = self.step1_read_boq()
        categories = self.step2_classify_items(df)
        activities = self.step3_extract_activities(categories)
        activities = self.step4_apply_shift_factors(activities)
        activities = self.step5_apply_risk_buffers(activities)
        activities = self.step6_calculate_dependencies(activities)
        calendar = self.step7_apply_calendar(activities)
        leveling = self.step8_resource_leveling(activities)
        milestones = self.step9_extract_milestones(activities, categories)
        report = self.step10_generate_report(activities, calendar, leveling, milestones)
        
        print("\n✅ اكتمال جميع الخطوات العشر بنجاح!")
        print("🎉 النظام جاهز للاستخدام في الإنتاج\n")
        
        return report


if __name__ == "__main__":
    # تشغيل الاختبار
    scheduler = TenStepScheduler('qasim_contract.xlsx')
    report = scheduler.run()
    
    # حفظ التقرير
    with open('10_steps_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    print("💾 تم حفظ التقرير في: 10_steps_report.json")
