"""
SCurveGenerator System - مولد منحنى S
يقوم بتوليد منحنى S (S-Curve) للمشروع الذي يُظهر:
- التقدم المخطط (Planned Progress)
- التقدم الفعلي (Actual Progress)
- التقدم المالي (Financial Progress)
- تحليل الانحرافات (Deviation Analysis)
"""

import sqlite3
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import json
import math


class SCurveGenerator:
    """مولد منحنى S للمشروع"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        
        print("✅ SCurveGenerator System Initialized")
    
    def generate_s_curve(
        self,
        schedule: Dict,
        interval: str = 'weekly',
        curve_type: str = 'both'
    ) -> Dict:
        """
        توليد منحنى S
        
        Args:
            schedule: الجدول الزمني من ComprehensiveScheduler
            interval: الفترة الزمنية (daily, weekly, monthly)
            curve_type: نوع المنحنى (planned, actual, both)
            
        Returns:
            بيانات منحنى S
        """
        
        activities = schedule.get('activities', [])
        
        if not activities:
            return {'error': 'No activities found'}
        
        # تحديد نطاق التواريخ
        date_range = self._calculate_date_range(schedule)
        
        # توليد الفترات الزمنية
        time_periods = self._generate_time_periods(
            date_range['start'],
            date_range['end'],
            interval
        )
        
        # حساب التقدم المخطط
        planned_progress = self._calculate_planned_progress(
            activities,
            time_periods
        )
        
        # إعداد البيانات للعرض
        s_curve_data = {
            'project_info': {
                'start_date': date_range['start'].strftime('%Y-%m-%d'),
                'end_date': date_range['end'].strftime('%Y-%m-%d'),
                'total_duration': (date_range['end'] - date_range['start']).days,
                'total_activities': len(activities)
            },
            'time_periods': [
                {
                    'period': i + 1,
                    'start_date': period['start'].strftime('%Y-%m-%d'),
                    'end_date': period['end'].strftime('%Y-%m-%d'),
                    'planned_progress': planned_progress[i]['cumulative'],
                    'planned_activities': planned_progress[i]['activities_count']
                }
                for i, period in enumerate(time_periods)
            ],
            'statistics': self._calculate_s_curve_statistics(planned_progress)
        }
        
        return s_curve_data
    
    def _calculate_date_range(self, schedule: Dict) -> Dict:
        """حساب نطاق التواريخ"""
        
        start_date = datetime.strptime(
            schedule.get('project_start', '2025-01-01'),
            '%Y-%m-%d'
        )
        
        end_date = datetime.strptime(
            schedule.get('project_finish', '2025-12-31'),
            '%Y-%m-%d'
        )
        
        return {
            'start': start_date,
            'end': end_date
        }
    
    def _generate_time_periods(
        self,
        start_date: datetime,
        end_date: datetime,
        interval: str
    ) -> List[Dict]:
        """توليد الفترات الزمنية"""
        
        periods = []
        current_date = start_date
        
        if interval == 'daily':
            delta = timedelta(days=1)
        elif interval == 'weekly':
            delta = timedelta(weeks=1)
        elif interval == 'monthly':
            delta = timedelta(days=30)  # تقريبي
        else:
            delta = timedelta(weeks=1)  # افتراضي
        
        while current_date < end_date:
            period_end = min(current_date + delta, end_date)
            periods.append({
                'start': current_date,
                'end': period_end
            })
            current_date = period_end
        
        return periods
    
    def _calculate_planned_progress(
        self,
        activities: List[Dict],
        time_periods: List[Dict]
    ) -> List[Dict]:
        """حساب التقدم المخطط لكل فترة"""
        
        total_work = sum(activity.get('duration', 1) for activity in activities)
        progress_data = []
        cumulative_progress = 0.0
        
        for period in time_periods:
            period_work = 0
            activities_in_period = 0
            
            for activity in activities:
                activity_start = datetime.strptime(
                    activity.get('start_date', period['start'].strftime('%Y-%m-%d')),
                    '%Y-%m-%d'
                )
                activity_finish = datetime.strptime(
                    activity.get('finish_date', period['end'].strftime('%Y-%m-%d')),
                    '%Y-%m-%d'
                )
                
                # حساب التداخل بين النشاط والفترة
                overlap = self._calculate_overlap(
                    activity_start,
                    activity_finish,
                    period['start'],
                    period['end']
                )
                
                if overlap > 0:
                    activities_in_period += 1
                    activity_duration = activity.get('duration', 1)
                    work_in_period = (overlap / max(1, (activity_finish - activity_start).days)) * activity_duration
                    period_work += work_in_period
            
            # حساب النسبة المئوية
            period_progress = (period_work / total_work * 100) if total_work > 0 else 0
            cumulative_progress += period_progress
            cumulative_progress = min(100, cumulative_progress)  # لا تتجاوز 100%
            
            progress_data.append({
                'period_work': round(period_work, 2),
                'period_progress': round(period_progress, 2),
                'cumulative': round(cumulative_progress, 2),
                'activities_count': activities_in_period
            })
        
        return progress_data
    
    def _calculate_overlap(
        self,
        activity_start: datetime,
        activity_finish: datetime,
        period_start: datetime,
        period_end: datetime
    ) -> int:
        """حساب أيام التداخل بين نشاط وفترة زمنية"""
        
        overlap_start = max(activity_start, period_start)
        overlap_end = min(activity_finish, period_end)
        
        if overlap_start >= overlap_end:
            return 0
        
        return (overlap_end - overlap_start).days
    
    def _calculate_s_curve_statistics(self, progress_data: List[Dict]) -> Dict:
        """حساب إحصائيات منحنى S"""
        
        if not progress_data:
            return {}
        
        # نقطة الانعطاف (Inflection Point) - حيث يكون التقدم حوالي 50%
        inflection_point = None
        for i, data in enumerate(progress_data):
            if data['cumulative'] >= 50:
                inflection_point = i + 1
                break
        
        # معدل التقدم الأقصى
        max_progress_rate = max(data['period_progress'] for data in progress_data)
        max_rate_period = next(
            i + 1 for i, data in enumerate(progress_data)
            if data['period_progress'] == max_progress_rate
        )
        
        # معدل التقدم المتوسط
        avg_progress_rate = sum(data['period_progress'] for data in progress_data) / len(progress_data)
        
        return {
            'inflection_point_period': inflection_point,
            'max_progress_rate': round(max_progress_rate, 2),
            'max_rate_period': max_rate_period,
            'avg_progress_rate': round(avg_progress_rate, 2),
            'total_periods': len(progress_data)
        }
    
    def generate_financial_s_curve(
        self,
        schedule: Dict,
        item_costs: Dict[str, float],
        interval: str = 'monthly'
    ) -> Dict:
        """
        توليد منحنى S المالي
        
        Args:
            schedule: الجدول الزمني
            item_costs: قاموس تكاليف البنود {activity_id: cost}
            interval: الفترة الزمنية
            
        Returns:
            بيانات منحنى S المالي
        """
        
        activities = schedule.get('activities', [])
        date_range = self._calculate_date_range(schedule)
        time_periods = self._generate_time_periods(
            date_range['start'],
            date_range['end'],
            interval
        )
        
        # حساب التكلفة الإجمالية
        total_cost = sum(
            item_costs.get(activity.get('id'), 0)
            for activity in activities
        )
        
        # حساب التقدم المالي
        financial_progress = []
        cumulative_cost = 0.0
        
        for period in time_periods:
            period_cost = 0
            
            for activity in activities:
                activity_start = datetime.strptime(
                    activity.get('start_date', period['start'].strftime('%Y-%m-%d')),
                    '%Y-%m-%d'
                )
                activity_finish = datetime.strptime(
                    activity.get('finish_date', period['end'].strftime('%Y-%m-%d')),
                    '%Y-%m-%d'
                )
                
                overlap = self._calculate_overlap(
                    activity_start,
                    activity_finish,
                    period['start'],
                    period['end']
                )
                
                if overlap > 0:
                    activity_cost = item_costs.get(activity.get('id'), 0)
                    activity_duration = max(1, (activity_finish - activity_start).days)
                    cost_in_period = (overlap / activity_duration) * activity_cost
                    period_cost += cost_in_period
            
            cumulative_cost += period_cost
            cumulative_progress = (cumulative_cost / total_cost * 100) if total_cost > 0 else 0
            
            financial_progress.append({
                'period_cost': round(period_cost, 2),
                'cumulative_cost': round(cumulative_cost, 2),
                'cumulative_progress': round(cumulative_progress, 2)
            })
        
        return {
            'project_info': {
                'total_cost': round(total_cost, 2),
                'start_date': date_range['start'].strftime('%Y-%m-%d'),
                'end_date': date_range['end'].strftime('%Y-%m-%d')
            },
            'time_periods': [
                {
                    'period': i + 1,
                    'start_date': period['start'].strftime('%Y-%m-%d'),
                    'end_date': period['end'].strftime('%Y-%m-%d'),
                    'period_cost': financial_progress[i]['period_cost'],
                    'cumulative_cost': financial_progress[i]['cumulative_cost'],
                    'cumulative_progress': financial_progress[i]['cumulative_progress']
                }
                for i, period in enumerate(time_periods)
            ]
        }
    
    def compare_curves(
        self,
        planned_curve: Dict,
        actual_curve: Dict
    ) -> Dict:
        """
        مقارنة منحنيين (مخطط وفعلي)
        
        Args:
            planned_curve: منحنى S المخطط
            actual_curve: منحنى S الفعلي
            
        Returns:
            تحليل الانحرافات
        """
        
        deviations = []
        
        planned_periods = planned_curve.get('time_periods', [])
        actual_periods = actual_curve.get('time_periods', [])
        
        # مقارنة كل فترة
        for i in range(min(len(planned_periods), len(actual_periods))):
            planned = planned_periods[i]
            actual = actual_periods[i]
            
            planned_progress = planned.get('planned_progress', 0)
            actual_progress = actual.get('planned_progress', 0)  # استخدام الفعلي إذا كان متوفراً
            
            deviation = actual_progress - planned_progress
            deviation_percentage = (deviation / planned_progress * 100) if planned_progress > 0 else 0
            
            status = 'on_track'
            if deviation < -5:
                status = 'behind'
            elif deviation > 5:
                status = 'ahead'
            
            deviations.append({
                'period': i + 1,
                'date': planned['start_date'],
                'planned_progress': planned_progress,
                'actual_progress': actual_progress,
                'deviation': round(deviation, 2),
                'deviation_percentage': round(deviation_percentage, 2),
                'status': status
            })
        
        # إحصائيات الانحرافات
        total_deviation = sum(d['deviation'] for d in deviations)
        avg_deviation = total_deviation / len(deviations) if deviations else 0
        
        behind_count = sum(1 for d in deviations if d['status'] == 'behind')
        ahead_count = sum(1 for d in deviations if d['status'] == 'ahead')
        on_track_count = sum(1 for d in deviations if d['status'] == 'on_track')
        
        return {
            'deviations': deviations,
            'statistics': {
                'total_deviation': round(total_deviation, 2),
                'avg_deviation': round(avg_deviation, 2),
                'periods_behind': behind_count,
                'periods_ahead': ahead_count,
                'periods_on_track': on_track_count,
                'overall_status': self._determine_overall_status(avg_deviation)
            }
        }
    
    def _determine_overall_status(self, avg_deviation: float) -> str:
        """تحديد الحالة الإجمالية للمشروع"""
        
        if avg_deviation < -10:
            return 'significantly_behind'
        elif avg_deviation < -5:
            return 'behind'
        elif avg_deviation > 10:
            return 'significantly_ahead'
        elif avg_deviation > 5:
            return 'ahead'
        else:
            return 'on_track'
    
    def export_to_chart_js(self, s_curve_data: Dict) -> Dict:
        """تصدير البيانات بصيغة Chart.js"""
        
        periods = s_curve_data.get('time_periods', [])
        
        return {
            'labels': [period['start_date'] for period in periods],
            'datasets': [
                {
                    'label': 'التقدم المخطط',
                    'data': [period['planned_progress'] for period in periods],
                    'borderColor': 'rgb(75, 192, 192)',
                    'backgroundColor': 'rgba(75, 192, 192, 0.2)',
                    'tension': 0.4  # منحنى ناعم
                }
            ]
        }
    
    def calculate_earned_value(
        self,
        schedule: Dict,
        actual_progress: Dict[str, float],
        costs: Dict[str, float]
    ) -> Dict:
        """
        حساب القيمة المكتسبة (Earned Value Management)
        
        Args:
            schedule: الجدول الزمني
            actual_progress: التقدم الفعلي {activity_id: progress_percentage}
            costs: التكاليف {activity_id: cost}
            
        Returns:
            تحليل القيمة المكتسبة (EVM)
        """
        
        activities = schedule.get('activities', [])
        
        # Planned Value (PV) - القيمة المخططة
        pv = sum(costs.get(activity.get('id'), 0) for activity in activities)
        
        # Earned Value (EV) - القيمة المكتسبة
        ev = sum(
            costs.get(activity.get('id'), 0) * actual_progress.get(activity.get('id'), 0) / 100
            for activity in activities
        )
        
        # Actual Cost (AC) - التكلفة الفعلية (افتراضياً نفس القيمة المكتسبة)
        ac = ev  # في حالة عدم توفر التكاليف الفعلية
        
        # Cost Variance (CV)
        cv = ev - ac
        
        # Schedule Variance (SV)
        sv = ev - pv
        
        # Cost Performance Index (CPI)
        cpi = ev / ac if ac > 0 else 0
        
        # Schedule Performance Index (SPI)
        spi = ev / pv if pv > 0 else 0
        
        return {
            'planned_value': round(pv, 2),
            'earned_value': round(ev, 2),
            'actual_cost': round(ac, 2),
            'cost_variance': round(cv, 2),
            'schedule_variance': round(sv, 2),
            'cost_performance_index': round(cpi, 2),
            'schedule_performance_index': round(spi, 2),
            'performance_status': self._evaluate_evm_performance(cpi, spi)
        }
    
    def _evaluate_evm_performance(self, cpi: float, spi: float) -> str:
        """تقييم أداء المشروع بناءً على مؤشرات EVM"""
        
        if cpi >= 1.0 and spi >= 1.0:
            return 'excellent'
        elif cpi >= 0.9 and spi >= 0.9:
            return 'good'
        elif cpi >= 0.8 and spi >= 0.8:
            return 'acceptable'
        else:
            return 'poor'


# اختبار سريع
if __name__ == "__main__":
    print("✅ SCurveGenerator System Loaded")
    
    # اختبار بسيط
    generator = SCurveGenerator("test.db")
    
    test_schedule = {
        'project_start': '2025-01-01',
        'project_finish': '2025-03-31',
        'activities': [
            {
                'id': 'ACT-001',
                'description': 'نشاط 1',
                'start_date': '2025-01-01',
                'finish_date': '2025-01-31',
                'duration': 30
            },
            {
                'id': 'ACT-002',
                'description': 'نشاط 2',
                'start_date': '2025-02-01',
                'finish_date': '2025-02-28',
                'duration': 28
            }
        ]
    }
    
    s_curve = generator.generate_s_curve(test_schedule, interval='monthly')
    
    print(f"\n📊 نتيجة منحنى S:")
    print(f"- المدة الإجمالية: {s_curve['project_info']['total_duration']} يوم")
    print(f"- عدد الفترات: {len(s_curve['time_periods'])}")
    print(f"- نقطة الانعطاف: الفترة {s_curve['statistics']['inflection_point_period']}")
