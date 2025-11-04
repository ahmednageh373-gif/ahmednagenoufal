#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=======================================================================
Sample Data Generator for Testing
=======================================================================

الهدف: توليد بيانات اختبار واقعية لجميع الوحدات

المخرجات:
    - BOQ_Sample.xlsx
    - Schedule_Sample.csv
    - Progress_Sample.csv
    
التاريخ: 2025-11-04
=======================================================================
"""

import pandas as pd
from pathlib import Path
from datetime import datetime, timedelta
import random

# Set seed for reproducibility
random.seed(42)


class SampleDataGenerator:
    """مولد بيانات اختبار"""
    
    def __init__(self, output_dir: str = None):
        """
        تهيئة المولد
        
        Args:
            output_dir: مجلد الحفظ
        """
        if output_dir is None:
            output_dir = Path(__file__).parent
        
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_boq_sample(self, filename: str = "BOQ_Sample.xlsx") -> str:
        """
        توليد جدول كميات تجريبي
        
        Returns:
            str: مسار الملف
        """
        print("📊 توليد جدول الكميات التجريبي...")
        
        # Sample BOQ data for a residential villa
        data = {
            'Item No': [
                # Concrete works
                '01-001', '01-002', '01-003', '01-004', '01-005',
                # Reinforcement
                '02-001', '02-002', '02-003', '02-004',
                # Masonry
                '03-001', '03-002', '03-003',
                # Finishes
                '04-001', '04-002', '04-003', '04-004',
                # MEP
                '05-001', '05-002', '05-003', '05-004'
            ],
            'Description': [
                # Concrete
                'Concrete 30 MPa for strip foundations',
                'Concrete 35 MPa for columns 300x300mm',
                'Concrete 30 MPa for beams 250x500mm',
                'Concrete 25 MPa for ground floor slab 200mm',
                'Concrete 25 MPa for first floor slab 200mm',
                # Reinforcement
                'Steel reinforcement Ø16mm high tensile',
                'Steel reinforcement Ø12mm high tensile',
                'Steel reinforcement Ø10mm high tensile',
                'Steel mesh Ø8mm @ 150mm c/c',
                # Masonry
                'Concrete block walls 200mm external',
                'Concrete block walls 150mm internal',
                'Cement plaster 20mm thickness',
                # Finishes
                'Ceramic floor tiles 600x600mm',
                'Porcelain wall tiles 300x600mm',
                'Gypsum board ceiling 12.5mm',
                'Acrylic paint for walls (2 coats)',
                # MEP
                'Electrical wiring and outlets',
                'Plumbing fixtures (complete)',
                'HVAC split units 24000 BTU',
                'LED lighting fixtures'
            ],
            'Unit': [
                # Concrete
                'm³', 'm³', 'm³', 'm³', 'm³',
                # Reinforcement
                'ton', 'ton', 'ton', 'ton',
                # Masonry
                'm²', 'm²', 'm²',
                # Finishes
                'm²', 'm²', 'm²', 'm²',
                # MEP
                'item', 'item', 'no', 'no'
            ],
            'Length': [
                # Concrete
                50.0, 0.3, 0.25, 12.0, 12.0,
                # Reinforcement
                1.0, 1.0, 1.0, 1.0,
                # Masonry
                1.0, 1.0, 1.0,
                # Finishes
                1.0, 1.0, 1.0, 1.0,
                # MEP
                1.0, 1.0, 1.0, 1.0
            ],
            'Width': [
                # Concrete
                0.8, 0.3, 0.50, 10.0, 10.0,
                # Reinforcement
                1.0, 1.0, 1.0, 1.0,
                # Masonry
                1.0, 1.0, 1.0,
                # Finishes
                1.0, 1.0, 1.0, 1.0,
                # MEP
                1.0, 1.0, 1.0, 1.0
            ],
            'Height': [
                # Concrete
                0.6, 3.5, 0.5, 1.0, 1.0,
                # Reinforcement
                1.0, 1.0, 1.0, 1.0,
                # Masonry
                1.0, 1.0, 1.0,
                # Finishes
                1.0, 1.0, 1.0, 1.0,
                # MEP
                1.0, 1.0, 1.0, 1.0
            ],
            'Thickness': [
                # Concrete
                0.0, 0.0, 0.0, 0.20, 0.20,
                # Reinforcement
                0.0, 0.0, 0.0, 0.0,
                # Masonry
                0.20, 0.15, 0.02,
                # Finishes
                0.0, 0.0, 0.0125, 0.0,
                # MEP
                0.0, 0.0, 0.0, 0.0
            ],
            'Count': [
                # Concrete
                1, 16, 25, 1, 1,
                # Reinforcement
                3.5, 2.8, 1.5, 0.8,
                # Masonry
                280, 320, 850,
                # Finishes
                240, 180, 230, 450,
                # MEP
                1, 1, 4, 35
            ],
            'Unit Price (SAR)': [
                # Concrete
                350, 400, 380, 360, 360,
                # Reinforcement
                4500, 4500, 4500, 4200,
                # Masonry
                85, 75, 45,
                # Finishes
                120, 180, 95, 25,
                # MEP
                45000, 35000, 5500, 450
            ],
            'Drawing Ref': [
                # Concrete
                'ST-01', 'ST-02', 'ST-03', 'ST-04', 'ST-05',
                # Reinforcement
                'ST-02', 'ST-03', 'ST-04', 'ST-05',
                # Masonry
                'AR-01', 'AR-02', 'AR-03',
                # Finishes
                'AR-04', 'AR-05', 'AR-06', 'AR-07',
                # MEP
                'E-01', 'P-01', 'M-01', 'E-02'
            ],
            'Category': [
                # Concrete
                'Structural', 'Structural', 'Structural', 'Structural', 'Structural',
                # Reinforcement
                'Structural', 'Structural', 'Structural', 'Structural',
                # Masonry
                'Architectural', 'Architectural', 'Architectural',
                # Finishes
                'Finishes', 'Finishes', 'Finishes', 'Finishes',
                # MEP
                'MEP', 'MEP', 'MEP', 'MEP'
            ]
        }
        
        df = pd.DataFrame(data)
        
        # Calculate total price
        # First calculate quantity based on unit
        quantities = []
        for idx, row in df.iterrows():
            unit = row['Unit']
            if 'm³' in unit:
                qty = row['Length'] * row['Width'] * row['Height'] * row['Count']
            elif 'm²' in unit:
                qty = row['Length'] * row['Width'] * row['Count']
            elif unit in ['item', 'no', 'ton']:
                qty = row['Count']
            else:
                qty = row['Count']
            quantities.append(qty)
        
        df['Quantity'] = quantities
        df['Total Price (SAR)'] = df['Quantity'] * df['Unit Price (SAR)']
        
        # Save to Excel
        output_file = self.output_dir / filename
        df.to_excel(output_file, index=False)
        
        print(f"  ✅ تم حفظ: {output_file}")
        print(f"  📋 إجمالي البنود: {len(df)}")
        print(f"  💰 إجمالي التكلفة: {df['Total Price (SAR)'].sum():,.2f} ريال")
        
        return str(output_file)
    
    def generate_schedule_sample(self, filename: str = "Schedule_Sample.csv") -> str:
        """
        توليد جدول زمني تجريبي
        
        Returns:
            str: مسار الملف
        """
        print("\n📅 توليد الجدول الزمني التجريبي...")
        
        # Sample schedule for villa project (12 months)
        start_date = datetime(2024, 1, 1)
        
        activities = []
        activity_id = 1
        current_date = start_date
        
        # Phase 1: Site Preparation (2 weeks)
        activities.append({
            'activity_id': f'ACT-{activity_id:03d}',
            'activity_name': 'Site mobilization and preparation',
            'duration': 10,
            'planned_start': current_date.strftime('%Y-%m-%d'),
            'planned_finish': (current_date + timedelta(days=10)).strftime('%Y-%m-%d'),
            'total_float': 0,
            'wbs': '1.1',
            'category': 'Site Works'
        })
        current_date += timedelta(days=10)
        activity_id += 1
        
        # Phase 2: Foundations (3 weeks)
        for i, work in enumerate(['Excavation', 'Foundations concrete', 'Backfilling'], 1):
            activities.append({
                'activity_id': f'ACT-{activity_id:03d}',
                'activity_name': work,
                'duration': 7,
                'planned_start': current_date.strftime('%Y-%m-%d'),
                'planned_finish': (current_date + timedelta(days=7)).strftime('%Y-%m-%d'),
                'total_float': 0 if i == 1 else 2,
                'wbs': f'1.2.{i}',
                'category': 'Foundations'
            })
            current_date += timedelta(days=7)
            activity_id += 1
        
        # Phase 3: Structure (8 weeks)
        for i, work in enumerate(['Ground floor columns', 'Ground floor beams & slab', 
                                  'First floor columns', 'First floor beams & slab',
                                  'Roof beams & slab', 'Staircase'], 1):
            duration = 14 if 'slab' in work else 10
            activities.append({
                'activity_id': f'ACT-{activity_id:03d}',
                'activity_name': work,
                'duration': duration,
                'planned_start': current_date.strftime('%Y-%m-%d'),
                'planned_finish': (current_date + timedelta(days=duration)).strftime('%Y-%m-%d'),
                'total_float': 0 if 'Critical' in work else random.randint(0, 3),
                'wbs': f'1.3.{i}',
                'category': 'Structure'
            })
            current_date += timedelta(days=duration)
            activity_id += 1
        
        # Phase 4: Masonry & MEP Rough-in (6 weeks)
        for i, work in enumerate(['External walls', 'Internal walls', 'Electrical rough-in',
                                  'Plumbing rough-in', 'HVAC ducting'], 1):
            duration = 14 if 'walls' in work else 10
            activities.append({
                'activity_id': f'ACT-{activity_id:03d}',
                'activity_name': work,
                'duration': duration,
                'planned_start': current_date.strftime('%Y-%m-%d'),
                'planned_finish': (current_date + timedelta(days=duration)).strftime('%Y-%m-%d'),
                'total_float': random.randint(1, 5),
                'wbs': f'1.4.{i}',
                'category': 'Masonry & MEP'
            })
            if 'walls' in work:
                current_date += timedelta(days=duration)
            activity_id += 1
        
        # Phase 5: Finishes (10 weeks)
        for i, work in enumerate(['Plastering', 'Floor tiling', 'Wall tiling',
                                  'Ceiling works', 'Painting', 'Doors & windows',
                                  'Kitchen cabinets', 'Sanitary fixtures'], 1):
            duration = random.randint(10, 21)
            activities.append({
                'activity_id': f'ACT-{activity_id:03d}',
                'activity_name': work,
                'duration': duration,
                'planned_start': current_date.strftime('%Y-%m-%d'),
                'planned_finish': (current_date + timedelta(days=duration)).strftime('%Y-%m-%d'),
                'total_float': random.randint(2, 7),
                'wbs': f'1.5.{i}',
                'category': 'Finishes'
            })
            if i <= 3:  # Sequential for first 3
                current_date += timedelta(days=duration)
            activity_id += 1
        
        # Phase 6: MEP Final & Landscaping (4 weeks)
        for i, work in enumerate(['MEP final fix', 'Testing & commissioning',
                                  'External works', 'Landscaping', 'Cleaning'], 1):
            duration = random.randint(7, 14)
            activities.append({
                'activity_id': f'ACT-{activity_id:03d}',
                'activity_name': work,
                'duration': duration,
                'planned_start': current_date.strftime('%Y-%m-%d'),
                'planned_finish': (current_date + timedelta(days=duration)).strftime('%Y-%m-%d'),
                'total_float': random.randint(0, 3),
                'wbs': f'1.6.{i}',
                'category': 'Completion'
            })
            if i <= 2:
                current_date += timedelta(days=duration)
            activity_id += 1
        
        df = pd.DataFrame(activities)
        
        # Add early/late dates (simplified)
        df['early_start'] = df['planned_start']
        df['early_finish'] = df['planned_finish']
        df['late_start'] = pd.to_datetime(df['planned_start']) + pd.to_timedelta(df['total_float'], unit='D')
        df['late_finish'] = pd.to_datetime(df['planned_finish']) + pd.to_timedelta(df['total_float'], unit='D')
        
        df['late_start'] = df['late_start'].dt.strftime('%Y-%m-%d')
        df['late_finish'] = df['late_finish'].dt.strftime('%Y-%m-%d')
        
        # Save to CSV
        output_file = self.output_dir / filename
        df.to_csv(output_file, index=False)
        
        print(f"  ✅ تم حفظ: {output_file}")
        print(f"  📋 إجمالي الأنشطة: {len(df)}")
        print(f"  📅 مدة المشروع: {(current_date - start_date).days} يوم")
        
        return str(output_file)
    
    def generate_progress_sample(self, filename: str = "Progress_Sample.csv") -> str:
        """
        توليد تقرير تقدم تجريبي
        
        Returns:
            str: مسار الملف
        """
        print("\n📈 توليد تقرير التقدم التجريبي...")
        
        # Generate progress for first 15 activities
        progress_data = []
        
        for i in range(1, 16):
            progress_data.append({
                'activity_id': f'ACT-{i:03d}',
                'date': datetime.now().strftime('%Y-%m-%d'),
                'progress_percent': random.randint(60, 100) if i <= 10 else random.randint(20, 60)
            })
        
        df = pd.DataFrame(progress_data)
        
        # Save to CSV
        output_file = self.output_dir / filename
        df.to_csv(output_file, index=False)
        
        print(f"  ✅ تم حفظ: {output_file}")
        print(f"  📋 عدد السجلات: {len(df)}")
        
        return str(output_file)
    
    def generate_all_samples(self):
        """توليد جميع البيانات التجريبية"""
        print("=" * 70)
        print("🎯 بدء توليد البيانات التجريبية")
        print("=" * 70)
        
        boq_file = self.generate_boq_sample()
        schedule_file = self.generate_schedule_sample()
        progress_file = self.generate_progress_sample()
        
        print("\n" + "=" * 70)
        print("✅ اكتمل توليد جميع البيانات التجريبية")
        print("=" * 70)
        print(f"\n📁 الملفات المُنشأة:")
        print(f"  • {boq_file}")
        print(f"  • {schedule_file}")
        print(f"  • {progress_file}")
        print("\n💡 يمكن استخدام هذه الملفات لاختبار جميع وحدات النظام")
        print("=" * 70)


def main():
    """دالة رئيسية"""
    generator = SampleDataGenerator()
    generator.generate_all_samples()


if __name__ == "__main__":
    main()
