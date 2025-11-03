"""
ComprehensiveScheduler System - المجدول الشامل
يقوم بإنشاء جدول زمني متكامل للمشروع بناءً على:
- تحليل البنود (ItemAnalyzer)
- العلاقات والتبعيات (RelationshipEngine)
- معدلات الإنتاجية (ProductivityDatabase)
- القيود والموارد
- التقويم (أيام العمل، العطلات)
"""

import sqlite3
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import json


class ComprehensiveScheduler:
    """المجدول الشامل للمشروع"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.calendar = self._initialize_calendar()
        self.resource_pool = {}
        
        print("✅ ComprehensiveScheduler System Initialized")
    
    def _initialize_calendar(self) -> Dict:
        """تهيئة التقويم (أيام العمل والعطلات)"""
        
        return {
            'work_days': [0, 1, 2, 3, 4, 5],  # السبت-الخميس (0=السبت, 6=الجمعة)
            'work_hours_per_day': 8,
            'holidays': [],  # سيتم إضافة العطلات الرسمية
            'shifts': {
                'single': {'start': '07:00', 'end': '15:00'},
                'double': [
                    {'start': '07:00', 'end': '15:00'},
                    {'start': '15:00', 'end': '23:00'}
                ]
            }
        }
    
    def generate_schedule(
        self,
        activities: List[Dict],
        start_date: str,
        constraints: Dict = None
    ) -> Dict:
        """
        توليد جدول زمني شامل
        
        Args:
            activities: قائمة الأنشطة مع المدد والعلاقات
            start_date: تاريخ بدء المشروع (YYYY-MM-DD)
            constraints: قيود إضافية (موارد، ميزانية، إلخ)
            
        Returns:
            جدول زمني كامل مع التواريخ والموارد
        """
        
        constraints = constraints or {}
        start_date_obj = datetime.strptime(start_date, '%Y-%m-%d')
        
        # 1. إضافة المدد للأنشطة (من ProductivityDatabase)
        activities_with_durations = self._add_durations(activities)
        
        # 2. ترتيب الأنشطة حسب التبعيات
        sorted_activities = self._topological_sort(activities_with_durations)
        
        # 3. حساب التواريخ (Early Dates)
        scheduled_activities = self._calculate_dates(
            sorted_activities, 
            start_date_obj,
            constraints
        )
        
        # 4. تخصيص الموارد
        activities_with_resources = self._assign_resources(
            scheduled_activities,
            constraints.get('resource_constraints', {})
        )
        
        # 5. حساب المعالم (Milestones)
        milestones = self._identify_milestones(activities_with_resources)
        
        # 6. حساب الإحصائيات
        statistics = self._calculate_statistics(activities_with_resources)
        
        return {
            'project_start': start_date,
            'project_finish': statistics['project_finish'],
            'total_duration': statistics['total_duration'],
            'activities': activities_with_resources,
            'milestones': milestones,
            'statistics': statistics,
            'generated_at': datetime.now().isoformat()
        }
    
    def _add_durations(self, activities: List[Dict]) -> List[Dict]:
        """إضافة المدد للأنشطة من قاعدة البيانات"""
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            for activity in activities:
                # إذا كانت المدة موجودة بالفعل، تخطي
                if 'duration' in activity and activity['duration'] > 0:
                    continue
                
                # البحث عن معدل الإنتاجية
                activity_type = activity.get('type', 'general')
                quantity = activity.get('quantity', 1)
                
                cursor.execute("""
                    SELECT rate_per_unit, crew_size, complexity_factor
                    FROM productivity_rates
                    WHERE activity_type = ?
                    LIMIT 1
                """, (activity_type,))
                
                row = cursor.fetchone()
                
                if row:
                    rate_per_unit = row[0]
                    crew_size = row[1]
                    complexity_factor = row[2]
                    
                    # حساب المدة
                    base_duration = quantity * rate_per_unit
                    adjusted_duration = base_duration * complexity_factor
                    duration_days = max(1, round(adjusted_duration))
                    
                    activity['duration'] = duration_days
                    activity['crew_size'] = crew_size
                    activity['man_days'] = duration_days * crew_size
                else:
                    # مدة افتراضية
                    activity['duration'] = 1
                    activity['crew_size'] = 1
                    activity['man_days'] = 1
            
            conn.close()
            
        except Exception as e:
            print(f"❌ خطأ في إضافة المدد: {e}")
        
        return activities
    
    def _topological_sort(self, activities: List[Dict]) -> List[Dict]:
        """ترتيب الأنشطة طوبولوجياً (حسب التبعيات)"""
        
        # بناء قاموس التبعيات
        dependencies = {}
        all_activity_ids = set()
        
        for activity in activities:
            activity_id = activity['id']
            all_activity_ids.add(activity_id)
            dependencies[activity_id] = activity.get('predecessors', [])
        
        # Kahn's Algorithm للترتيب الطوبولوجي
        in_degree = {activity_id: 0 for activity_id in all_activity_ids}
        
        for activity_id, predecessors in dependencies.items():
            in_degree[activity_id] = len(predecessors)
        
        queue = [activity_id for activity_id, degree in in_degree.items() if degree == 0]
        sorted_ids = []
        
        while queue:
            current_id = queue.pop(0)
            sorted_ids.append(current_id)
            
            # تقليل درجة الأنشطة التي تعتمد على النشاط الحالي
            for activity in activities:
                if current_id in activity.get('predecessors', []):
                    in_degree[activity['id']] -= 1
                    if in_degree[activity['id']] == 0:
                        queue.append(activity['id'])
        
        # إعادة ترتيب الأنشطة
        activity_dict = {activity['id']: activity for activity in activities}
        sorted_activities = [activity_dict[activity_id] for activity_id in sorted_ids]
        
        return sorted_activities
    
    def _calculate_dates(
        self,
        activities: List[Dict],
        start_date: datetime,
        constraints: Dict
    ) -> List[Dict]:
        """حساب تواريخ البداية والنهاية لكل نشاط"""
        
        activity_dates = {}
        
        for activity in activities:
            activity_id = activity['id']
            duration = activity.get('duration', 1)
            predecessors = activity.get('predecessors', [])
            
            # حساب تاريخ البداية المبكر
            if not predecessors:
                early_start = start_date
            else:
                # البحث عن أقصى تاريخ انتهاء للأنشطة السابقة
                max_finish = start_date
                for pred_id in predecessors:
                    if pred_id in activity_dates:
                        pred_finish = activity_dates[pred_id]['early_finish']
                        if pred_finish > max_finish:
                            max_finish = pred_finish
                
                early_start = self._get_next_work_day(max_finish)
            
            # حساب تاريخ الانتهاء المبكر
            early_finish = self._add_work_days(early_start, duration)
            
            activity_dates[activity_id] = {
                'early_start': early_start,
                'early_finish': early_finish
            }
            
            # إضافة التواريخ للنشاط
            activity['early_start'] = early_start.strftime('%Y-%m-%d')
            activity['early_finish'] = early_finish.strftime('%Y-%m-%d')
            activity['start_date'] = activity['early_start']
            activity['finish_date'] = activity['early_finish']
        
        return activities
    
    def _get_next_work_day(self, date: datetime) -> datetime:
        """الحصول على يوم العمل التالي"""
        
        next_day = date
        while next_day.weekday() not in self.calendar['work_days']:
            next_day += timedelta(days=1)
        
        return next_day
    
    def _add_work_days(self, start_date: datetime, work_days: int) -> datetime:
        """إضافة أيام عمل إلى تاريخ"""
        
        current_date = start_date
        days_added = 0
        
        while days_added < work_days:
            current_date += timedelta(days=1)
            if current_date.weekday() in self.calendar['work_days']:
                days_added += 1
        
        return current_date
    
    def _assign_resources(
        self,
        activities: List[Dict],
        resource_constraints: Dict
    ) -> List[Dict]:
        """تخصيص الموارد للأنشطة"""
        
        for activity in activities:
            activity_type = activity.get('type', 'general')
            crew_size = activity.get('crew_size', 1)
            
            # تخصيص الموارد البشرية
            activity['resources'] = {
                'labor': {
                    'count': crew_size,
                    'type': activity_type
                }
            }
            
            # تخصيص المعدات (إن وجدت)
            if activity_type in ['excavation', 'concrete']:
                activity['resources']['equipment'] = {
                    'type': 'heavy_machinery',
                    'count': 1
                }
        
        return activities
    
    def _identify_milestones(self, activities: List[Dict]) -> List[Dict]:
        """تحديد المعالم الرئيسية في المشروع"""
        
        milestones = []
        
        # معالم افتراضية
        milestone_keywords = {
            'foundation': ['أساسات', 'قواعد'],
            'structure': ['هيكل', 'خرسانة', 'أعمدة'],
            'finishing': ['تشطيب', 'دهان', 'بلاط'],
            'mep': ['كهرباء', 'سباكة', 'ميكانيكا']
        }
        
        for milestone_type, keywords in milestone_keywords.items():
            matching_activities = []
            for activity in activities:
                description = activity.get('description', '').lower()
                if any(keyword in description for keyword in keywords):
                    matching_activities.append(activity)
            
            if matching_activities:
                # آخر نشاط في هذه المجموعة هو المعلم
                last_activity = max(
                    matching_activities,
                    key=lambda a: datetime.strptime(a['finish_date'], '%Y-%m-%d')
                )
                
                milestones.append({
                    'name': f"إنجاز {milestone_type}",
                    'date': last_activity['finish_date'],
                    'activities': [a['id'] for a in matching_activities]
                })
        
        return milestones
    
    def _calculate_statistics(self, activities: List[Dict]) -> Dict:
        """حساب إحصائيات المشروع"""
        
        if not activities:
            return {}
        
        # تاريخ الانتهاء
        finish_dates = [
            datetime.strptime(a['finish_date'], '%Y-%m-%d')
            for a in activities
        ]
        project_finish = max(finish_dates)
        
        # تاريخ البداية
        start_dates = [
            datetime.strptime(a['start_date'], '%Y-%m-%d')
            for a in activities
        ]
        project_start = min(start_dates)
        
        # المدة الإجمالية
        total_duration = (project_finish - project_start).days
        
        # إجمالي أيام العمل
        total_man_days = sum(a.get('man_days', 0) for a in activities)
        
        # عدد الأنشطة حسب النوع
        activity_types = {}
        for activity in activities:
            activity_type = activity.get('type', 'general')
            activity_types[activity_type] = activity_types.get(activity_type, 0) + 1
        
        return {
            'project_start': project_start.strftime('%Y-%m-%d'),
            'project_finish': project_finish.strftime('%Y-%m-%d'),
            'total_duration': total_duration,
            'total_activities': len(activities),
            'total_man_days': total_man_days,
            'activity_types': activity_types
        }
    
    def export_to_gantt_data(self, schedule: Dict) -> Dict:
        """تصدير الجدول إلى صيغة Gantt Chart"""
        
        gantt_data = {
            'tasks': [],
            'links': []
        }
        
        activities = schedule.get('activities', [])
        
        for idx, activity in enumerate(activities, start=1):
            gantt_data['tasks'].append({
                'id': idx,
                'text': activity.get('description', 'نشاط'),
                'start_date': activity.get('start_date'),
                'duration': activity.get('duration', 1),
                'progress': 0,
                'type': 'task'
            })
            
            # إضافة الروابط (Links)
            predecessors = activity.get('predecessors', [])
            for pred_id in predecessors:
                # البحث عن رقم النشاط السابق
                pred_idx = next(
                    (i for i, a in enumerate(activities, start=1) if a['id'] == pred_id),
                    None
                )
                if pred_idx:
                    gantt_data['links'].append({
                        'id': len(gantt_data['links']) + 1,
                        'source': pred_idx,
                        'target': idx,
                        'type': '0'  # Finish-to-Start
                    })
        
        # إضافة المعالم (Milestones)
        milestones = schedule.get('milestones', [])
        for milestone in milestones:
            gantt_data['tasks'].append({
                'id': len(gantt_data['tasks']) + 1,
                'text': milestone['name'],
                'start_date': milestone['date'],
                'duration': 0,
                'progress': 0,
                'type': 'milestone'
            })
        
        return gantt_data
    
    def optimize_schedule(self, schedule: Dict, optimization_criteria: str = 'duration') -> Dict:
        """
        تحسين الجدول حسب معيار محدد
        
        Args:
            schedule: الجدول الحالي
            optimization_criteria: معيار التحسين (duration, cost, resources)
            
        Returns:
            جدول محسّن
        """
        
        if optimization_criteria == 'duration':
            # تقليل المدة: البحث عن أنشطة يمكن تنفيذها بالتوازي
            return self._optimize_for_duration(schedule)
        
        elif optimization_criteria == 'cost':
            # تقليل التكلفة: موازنة الموارد
            return self._optimize_for_cost(schedule)
        
        elif optimization_criteria == 'resources':
            # موازنة الموارد: تجنب الذروات
            return self._optimize_for_resources(schedule)
        
        return schedule
    
    def _optimize_for_duration(self, schedule: Dict) -> Dict:
        """تحسين الجدول لتقليل المدة"""
        
        # تحديد الأنشطة التي يمكن تنفيذها بالتوازي
        activities = schedule['activities']
        
        # البحث عن أنشطة بدون تبعيات متبادلة
        for i, activity1 in enumerate(activities):
            for j, activity2 in enumerate(activities):
                if i >= j:
                    continue
                
                # إذا لم يكن هناك تبعية، يمكن تنفيذهما بالتوازي
                if (activity2['id'] not in activity1.get('predecessors', []) and
                    activity1['id'] not in activity2.get('predecessors', [])):
                    
                    # تعديل التواريخ لتنفيذهما معاً
                    if activity1['start_date'] != activity2['start_date']:
                        activity2['start_date'] = activity1['start_date']
                        # إعادة حساب تاريخ الانتهاء
                        start_date = datetime.strptime(activity2['start_date'], '%Y-%m-%d')
                        finish_date = self._add_work_days(start_date, activity2['duration'])
                        activity2['finish_date'] = finish_date.strftime('%Y-%m-%d')
        
        # إعادة حساب الإحصائيات
        schedule['statistics'] = self._calculate_statistics(activities)
        
        return schedule
    
    def _optimize_for_cost(self, schedule: Dict) -> Dict:
        """تحسين الجدول لتقليل التكلفة"""
        # يمكن تنفيذ خوارزميات تحسين أكثر تعقيداً
        return schedule
    
    def _optimize_for_resources(self, schedule: Dict) -> Dict:
        """تحسين الجدول لموازنة الموارد"""
        # يمكن تنفيذ Resource Leveling
        return schedule


# اختبار سريع
if __name__ == "__main__":
    print("✅ ComprehensiveScheduler System Loaded")
    
    # اختبار بسيط
    scheduler = ComprehensiveScheduler("test.db")
    
    test_activities = [
        {
            'id': 'ACT-001',
            'description': 'حفر أساسات',
            'type': 'excavation',
            'quantity': 100,
            'duration': 3,
            'predecessors': []
        },
        {
            'id': 'ACT-002',
            'description': 'صب خرسانة عادية',
            'type': 'concrete',
            'quantity': 50,
            'duration': 2,
            'predecessors': ['ACT-001']
        }
    ]
    
    schedule = scheduler.generate_schedule(
        test_activities,
        '2025-01-01'
    )
    
    print(f"\n📊 نتيجة الجدولة:")
    print(f"- تاريخ البداية: {schedule['project_start']}")
    print(f"- تاريخ الانتهاء: {schedule['project_finish']}")
    print(f"- المدة الإجمالية: {schedule['total_duration']} يوم")
