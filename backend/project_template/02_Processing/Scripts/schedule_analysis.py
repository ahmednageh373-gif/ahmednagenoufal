#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=======================================================================
وحدة تحليل الجدول الزمني (Schedule Analysis Module)
=======================================================================

الهدف: تحليل تقدم المشروع، تحديد المسار الحرج، وتوليد منحنيات S-Curve.

المدخلات:
    - بيانات الجدول الزمني من Primavera P6 (XML/XER)
    - بيانات التقدم الفعلي من التقارير اليومية (CSV)

المخرجات:
    - منحنيات S-Curve (PNG/PDF)
    - تحليل المسار الحرج
    - تقارير الانحرافات والتقدم

الممارسات الهندسية المدمجة:
    - تحليل القيمة المكتسبة (EVM - Earned Value Management)
    - تحليل المسار الحرج (Critical Path Method - CPM)
    - معايير PMI/PMP
    
التاريخ: 2025-11-04
المطور: NOUFAL Engineering System
=======================================================================
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib import rcParams
import logging

# إعداد السجلات
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configure matplotlib for Arabic support
rcParams['font.family'] = 'sans-serif'
rcParams['axes.unicode_minus'] = False


class EVMCalculator:
    """
    حاسبة إدارة القيمة المكتسبة
    Earned Value Management Calculator
    
    Metrics:
    - PV (Planned Value): القيمة المخططة
    - EV (Earned Value): القيمة المكتسبة
    - AC (Actual Cost): التكلفة الفعلية
    - CV (Cost Variance): انحراف التكلفة
    - SV (Schedule Variance): انحراف الجدول
    - CPI (Cost Performance Index): مؤشر أداء التكلفة
    - SPI (Schedule Performance Index): مؤشر أداء الجدول
    """
    
    @staticmethod
    def calculate_pv(planned_progress: float, budget: float) -> float:
        """حساب القيمة المخططة"""
        return (planned_progress / 100.0) * budget
    
    @staticmethod
    def calculate_ev(actual_progress: float, budget: float) -> float:
        """حساب القيمة المكتسبة"""
        return (actual_progress / 100.0) * budget
    
    @staticmethod
    def calculate_cv(ev: float, ac: float) -> float:
        """حساب انحراف التكلفة"""
        return ev - ac
    
    @staticmethod
    def calculate_sv(ev: float, pv: float) -> float:
        """حساب انحراف الجدول"""
        return ev - pv
    
    @staticmethod
    def calculate_cpi(ev: float, ac: float) -> float:
        """حساب مؤشر أداء التكلفة"""
        return ev / ac if ac > 0 else 0
    
    @staticmethod
    def calculate_spi(ev: float, pv: float) -> float:
        """حساب مؤشر أداء الجدول"""
        return ev / pv if pv > 0 else 0
    
    @staticmethod
    def calculate_eac(budget: float, cpi: float) -> float:
        """حساب التقدير عند الإنجاز (Estimate at Completion)"""
        return budget / cpi if cpi > 0 else budget
    
    @staticmethod
    def calculate_etc(eac: float, ac: float) -> float:
        """حساب التقدير للإكمال (Estimate to Complete)"""
        return eac - ac
    
    @staticmethod
    def calculate_vac(budget: float, eac: float) -> float:
        """حساب الانحراف عند الإنجاز (Variance at Completion)"""
        return budget - eac


class ScheduleAnalyzer:
    """
    محلل الجدول الزمني الرئيسي
    Main Schedule Analyzer
    """
    
    def __init__(self, project_path: str):
        """
        تهيئة المحلل
        
        Args:
            project_path: المسار الرئيسي للمشروع
        """
        self.project_path = Path(project_path)
        self.input_schedule = self.project_path / "01_Input_Data" / "02_Schedule"
        self.input_site = self.project_path / "01_Input_Data" / "04_Site_Data" / "Daily_Reports"
        self.output_path = self.project_path / "03_Output_Data" / "03_Visuals" / "S_Curves"
        self.temp_path = self.project_path / "02_Processing" / "Temp_Data"
        
        # Create output directories
        self.output_path.mkdir(parents=True, exist_ok=True)
        self.temp_path.mkdir(parents=True, exist_ok=True)
        
        self.df_schedule = None
        self.df_progress = None
        self.df_merged = None
        self.critical_path = []
        self.evm_data = {}
        
        logger.info(f"تم تهيئة محلل الجدول الزمني للمشروع: {self.project_path.name}")
    
    def read_schedule_data(self, filename: str = "schedule_export.csv") -> pd.DataFrame:
        """
        1. قراءة بيانات الجدول الزمني
        
        Args:
            filename: اسم ملف الجدول (CSV format)
            
        Returns:
            DataFrame: بيانات الجدول المخطط
        """
        try:
            # Try P6 export first, fallback to generic schedule
            p6_path = self.input_schedule / "P6_Export" / filename
            
            if p6_path.exists():
                file_path = p6_path
            else:
                file_path = self.input_schedule / filename
            
            logger.info(f"قراءة بيانات الجدول من: {file_path}")
            
            self.df_schedule = pd.read_csv(file_path)
            
            # Convert date columns
            date_columns = ['planned_start', 'planned_finish', 'early_start', 'early_finish',
                           'late_start', 'late_finish']
            
            for col in date_columns:
                if col in self.df_schedule.columns:
                    self.df_schedule[col] = pd.to_datetime(self.df_schedule[col], errors='coerce')
            
            logger.info(f"تم قراءة {len(self.df_schedule)} نشاط من الجدول الزمني")
            return self.df_schedule
            
        except Exception as e:
            logger.error(f"خطأ في قراءة بيانات الجدول: {e}")
            raise
    
    def read_progress_data(self, filename: str = "daily_progress.csv") -> pd.DataFrame:
        """
        2. قراءة بيانات التقدم الفعلي
        
        Args:
            filename: اسم ملف التقدم اليومي
            
        Returns:
            DataFrame: بيانات التقدم الفعلي
        """
        try:
            file_path = self.input_site / filename
            logger.info(f"قراءة بيانات التقدم من: {file_path}")
            
            self.df_progress = pd.read_csv(file_path)
            
            # Convert date column
            if 'date' in self.df_progress.columns:
                self.df_progress['date'] = pd.to_datetime(self.df_progress['date'], errors='coerce')
            
            logger.info(f"تم قراءة {len(self.df_progress)} سجل تقدم")
            return self.df_progress
            
        except Exception as e:
            logger.error(f"خطأ في قراءة بيانات التقدم: {e}")
            raise
    
    def calculate_progress(self) -> pd.DataFrame:
        """
        3. حساب التقدم والانحرافات
        
        Returns:
            DataFrame: البيانات مع التقدم المحسوب
        """
        if self.df_schedule is None or self.df_progress is None:
            raise ValueError("يجب قراءة بيانات الجدول والتقدم أولاً")
        
        logger.info("بدء حساب التقدم والانحرافات...")
        
        # Merge schedule with progress
        self.df_merged = self.df_schedule.merge(
            self.df_progress,
            left_on='activity_id',
            right_on='activity_id',
            how='left',
            suffixes=('_plan', '_actual')
        )
        
        # Calculate planned progress (time-based)
        today = datetime.now()
        
        def calc_planned_progress(row):
            """حساب التقدم المخطط بناءً على الوقت"""
            if pd.isna(row.get('planned_start')) or pd.isna(row.get('planned_finish')):
                return 0
            
            start = row['planned_start']
            finish = row['planned_finish']
            
            if today < start:
                return 0
            elif today > finish:
                return 100
            else:
                total_days = (finish - start).days
                elapsed_days = (today - start).days
                return (elapsed_days / total_days * 100) if total_days > 0 else 0
        
        self.df_merged['planned_progress'] = self.df_merged.apply(calc_planned_progress, axis=1)
        
        # Actual progress from site data
        if 'progress_percent' not in self.df_merged.columns:
            self.df_merged['progress_percent'] = 0
        
        self.df_merged['actual_progress'] = self.df_merged['progress_percent'].fillna(0)
        
        # Calculate variance
        self.df_merged['progress_variance'] = self.df_merged['actual_progress'] - self.df_merged['planned_progress']
        
        # Status classification
        def classify_status(variance):
            """تصنيف حالة التقدم"""
            if variance > 5:
                return 'ahead'  # متقدم
            elif variance < -5:
                return 'behind'  # متأخر
            else:
                return 'on_track'  # على المسار
        
        self.df_merged['status'] = self.df_merged['progress_variance'].apply(classify_status)
        
        logger.info(f"تم حساب التقدم لـ {len(self.df_merged)} نشاط")
        return self.df_merged
    
    def identify_critical_path(self) -> List[Dict]:
        """
        5. تحديد المسار الحرج
        
        Returns:
            List[Dict]: قائمة الأنشطة الحرجة
        """
        if self.df_schedule is None:
            raise ValueError("يجب قراءة بيانات الجدول أولاً")
        
        logger.info("بدء تحديد المسار الحرج...")
        
        # Identify critical activities (total float = 0 or very small)
        if 'total_float' in self.df_schedule.columns:
            critical_activities = self.df_schedule[
                self.df_schedule['total_float'] <= 0.5
            ].copy()
        else:
            # Fallback: activities with no slack in dates
            critical_activities = self.df_schedule[
                (self.df_schedule['early_start'] == self.df_schedule['late_start'])
            ].copy()
        
        self.critical_path = critical_activities.to_dict('records')
        
        logger.info(f"تم تحديد {len(self.critical_path)} نشاط حرج")
        return self.critical_path
    
    def calculate_evm_metrics(self, budget: float, actual_cost: float = None) -> Dict:
        """
        حساب مؤشرات إدارة القيمة المكتسبة
        
        Args:
            budget: الموازنة الإجمالية للمشروع
            actual_cost: التكلفة الفعلية (اختياري)
            
        Returns:
            Dict: مؤشرات EVM
        """
        if self.df_merged is None:
            raise ValueError("يجب حساب التقدم أولاً")
        
        logger.info("بدء حساب مؤشرات EVM...")
        
        # Calculate average progress
        avg_planned = self.df_merged['planned_progress'].mean()
        avg_actual = self.df_merged['actual_progress'].mean()
        
        # Calculate EVM metrics
        pv = EVMCalculator.calculate_pv(avg_planned, budget)
        ev = EVMCalculator.calculate_ev(avg_actual, budget)
        
        # Use provided actual cost or estimate from budget
        if actual_cost is None:
            actual_cost = ev * 1.05  # Assume 5% cost overrun as default
        
        ac = actual_cost
        
        cv = EVMCalculator.calculate_cv(ev, ac)
        sv = EVMCalculator.calculate_sv(ev, pv)
        cpi = EVMCalculator.calculate_cpi(ev, ac)
        spi = EVMCalculator.calculate_spi(ev, pv)
        eac = EVMCalculator.calculate_eac(budget, cpi)
        etc = EVMCalculator.calculate_etc(eac, ac)
        vac = EVMCalculator.calculate_vac(budget, eac)
        
        self.evm_data = {
            'budget': budget,
            'planned_value': pv,
            'earned_value': ev,
            'actual_cost': ac,
            'cost_variance': cv,
            'schedule_variance': sv,
            'cost_performance_index': cpi,
            'schedule_performance_index': spi,
            'estimate_at_completion': eac,
            'estimate_to_complete': etc,
            'variance_at_completion': vac,
            'planned_progress_percent': avg_planned,
            'actual_progress_percent': avg_actual
        }
        
        logger.info(f"CPI: {cpi:.2f}, SPI: {spi:.2f}")
        return self.evm_data
    
    def generate_s_curve(self, output_filename: str = None, 
                        show_evm: bool = True) -> str:
        """
        4. توليد منحنى S-Curve
        
        Args:
            output_filename: اسم الملف المخرج (اختياري)
            show_evm: إظهار مؤشرات EVM على الرسم
            
        Returns:
            str: مسار الملف المحفوظ
        """
        if self.df_merged is None:
            raise ValueError("يجب حساب التقدم أولاً")
        
        if output_filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"S_Curve_{timestamp}.png"
        
        output_file = self.output_path / output_filename
        
        logger.info(f"بدء توليد منحنى S-Curve: {output_file}")
        
        # Prepare data for S-curve
        # Group by date and calculate cumulative progress
        df_timeline = self.df_merged.groupby(self.df_merged['planned_start'].dt.date).agg({
            'planned_progress': 'mean',
            'actual_progress': 'mean'
        }).reset_index()
        
        df_timeline = df_timeline.sort_values('planned_start')
        df_timeline['cumulative_planned'] = df_timeline['planned_progress'].cumsum()
        df_timeline['cumulative_actual'] = df_timeline['actual_progress'].cumsum()
        
        # Normalize to 100%
        max_planned = df_timeline['cumulative_planned'].max()
        max_actual = df_timeline['cumulative_actual'].max()
        
        if max_planned > 0:
            df_timeline['cumulative_planned'] = (df_timeline['cumulative_planned'] / max_planned) * 100
        if max_actual > 0:
            df_timeline['cumulative_actual'] = (df_timeline['cumulative_actual'] / max_actual) * 100
        
        # Create figure
        fig, ax = plt.subplots(figsize=(12, 7))
        
        # Plot curves
        ax.plot(df_timeline['planned_start'], df_timeline['cumulative_planned'],
                label='Planned Progress (التقدم المخطط)', color='blue', linewidth=2, marker='o', markersize=4)
        
        ax.plot(df_timeline['planned_start'], df_timeline['cumulative_actual'],
                label='Actual Progress (التقدم الفعلي)', color='green', linewidth=2, marker='s', markersize=4)
        
        # Add current date line
        today = datetime.now()
        ax.axvline(x=today.date(), color='red', linestyle='--', linewidth=1.5, label=f'Today (اليوم): {today.strftime("%Y-%m-%d")}')
        
        # Formatting
        ax.set_xlabel('Date (التاريخ)', fontsize=12, fontweight='bold')
        ax.set_ylabel('Cumulative Progress % (التقدم التراكمي %)', fontsize=12, fontweight='bold')
        ax.set_title('S-Curve: Project Progress Analysis\nمنحنى S: تحليل تقدم المشروع', 
                     fontsize=14, fontweight='bold', pad=20)
        
        ax.grid(True, alpha=0.3)
        ax.legend(loc='upper left', fontsize=10)
        
        # Format x-axis
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
        ax.xaxis.set_major_locator(mdates.MonthLocator())
        plt.xticks(rotation=45)
        
        # Add EVM metrics text box
        if show_evm and self.evm_data:
            evm_text = (
                f"EVM Metrics:\n"
                f"CPI: {self.evm_data['cost_performance_index']:.2f}\n"
                f"SPI: {self.evm_data['schedule_performance_index']:.2f}\n"
                f"Progress: {self.evm_data['actual_progress_percent']:.1f}%"
            )
            
            props = dict(boxstyle='round', facecolor='wheat', alpha=0.8)
            ax.text(0.98, 0.02, evm_text, transform=ax.transAxes, fontsize=10,
                   verticalalignment='bottom', horizontalalignment='right', bbox=props)
        
        plt.tight_layout()
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        plt.close()
        
        logger.info(f"تم حفظ منحنى S-Curve: {output_file}")
        return str(output_file)
    
    def run_full_analysis(self, schedule_file: str = "schedule_export.csv",
                         progress_file: str = "daily_progress.csv",
                         budget: float = 1000000,
                         output_filename: str = None) -> Dict:
        """
        تشغيل التحليل الكامل
        
        Args:
            schedule_file: اسم ملف الجدول
            progress_file: اسم ملف التقدم
            budget: الموازنة الإجمالية
            output_filename: اسم ملف S-Curve (اختياري)
            
        Returns:
            Dict: نتائج التحليل
        """
        logger.info("=" * 70)
        logger.info("بدء التحليل الكامل للجدول الزمني")
        logger.info("=" * 70)
        
        # Step 1: Read schedule data
        self.read_schedule_data(schedule_file)
        
        # Step 2: Read progress data
        self.read_progress_data(progress_file)
        
        # Step 3: Calculate progress
        self.calculate_progress()
        
        # Step 4: Identify critical path
        self.identify_critical_path()
        
        # Step 5: Calculate EVM metrics
        self.calculate_evm_metrics(budget)
        
        # Step 6: Generate S-curve
        scurve_path = self.generate_s_curve(output_filename)
        
        # Prepare results summary
        results = {
            'success': True,
            'scurve_file': scurve_path,
            'total_activities': len(self.df_schedule),
            'critical_activities': len(self.critical_path),
            'avg_planned_progress': self.df_merged['planned_progress'].mean(),
            'avg_actual_progress': self.df_merged['actual_progress'].mean(),
            'ahead_activities': len(self.df_merged[self.df_merged['status'] == 'ahead']),
            'behind_activities': len(self.df_merged[self.df_merged['status'] == 'behind']),
            'on_track_activities': len(self.df_merged[self.df_merged['status'] == 'on_track']),
            'evm_metrics': self.evm_data
        }
        
        logger.info("=" * 70)
        logger.info("اكتمل التحليل بنجاح!")
        logger.info(f"إجمالي الأنشطة: {results['total_activities']}")
        logger.info(f"الأنشطة الحرجة: {results['critical_activities']}")
        logger.info(f"التقدم الفعلي: {results['avg_actual_progress']:.1f}%")
        logger.info(f"CPI: {self.evm_data['cost_performance_index']:.2f}")
        logger.info(f"SPI: {self.evm_data['schedule_performance_index']:.2f}")
        logger.info(f"ملف S-Curve: {scurve_path}")
        logger.info("=" * 70)
        
        return results


def main():
    """
    دالة الاختبار الرئيسية
    """
    project_path = "/home/user/webapp/backend/project_template"
    
    analyzer = ScheduleAnalyzer(project_path)
    
    print("=" * 70)
    print("وحدة تحليل الجدول الزمني - NOUFAL Engineering System")
    print("=" * 70)
    print("\nالوحدة جاهزة للاستخدام!")
    print("\nمثال على الاستخدام:")
    print("  analyzer = ScheduleAnalyzer('/path/to/project')")
    print("  results = analyzer.run_full_analysis('schedule.csv', 'progress.csv', 1000000)")
    print("=" * 70)


if __name__ == "__main__":
    main()
