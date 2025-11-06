"""
ExcelIntelligence System - نظام اكتشاف Excel الذكي
يكتشف نوع ملف Excel تلقائياً (BOQ, Schedule, Resources, etc.)
Rule-Based System - لا يعتمد على AI/ML
"""

import pandas as pd
from typing import Dict, List, Tuple, Optional
import re
from pathlib import Path


class ExcelIntelligence:
    """نظام ذكي لاكتشاف وتحليل ملفات Excel"""
    
    def __init__(self):
        # أنواع الملفات المدعومة
        self.file_types = {
            'boq': 'جدول الكميات - Bill of Quantities',
            'schedule': 'الجدول الزمني - Schedule',
            'resources': 'الموارد - Resources',
            'scurve': 'منحنى S - S-Curve',
            'progress': 'التقدم - Progress Report',
            'manpower': 'العمالة - Manpower',
            'equipment': 'المعدات - Equipment',
            'cost': 'التكلفة - Cost Report',
            'invoice': 'فاتورة - Invoice',
            'contract': 'عقد - Contract',
            'unknown': 'غير معروف - Unknown'
        }
        
        # الكلمات المفتاحية لكل نوع ملف
        self.keywords = {
            'boq': ['كمية', 'سعر', 'إجمالي', 'بند', 'وصف', 'quantity', 'rate', 'amount', 'item', 'description'],
            'schedule': ['نشاط', 'مدة', 'بداية', 'نهاية', 'activity', 'duration', 'start', 'finish', 'predecessor'],
            'resources': ['مورد', 'طاقم', 'resource', 'crew', 'labor', 'worker'],
            'scurve': ['منحنى', 'تقدم', 'نسبة', 'curve', 'progress', 'percentage', 'cumulative'],
            'progress': ['تقدم', 'إنجاز', 'نسبة', 'progress', 'completion', 'actual', 'planned'],
            'manpower': ['عمال', 'عمالة', 'أفراد', 'manpower', 'labor', 'workers', 'personnel'],
            'equipment': ['معدات', 'آلات', 'equipment', 'machinery', 'tools'],
            'cost': ['تكلفة', 'مصروف', 'cost', 'expense', 'budget'],
            'contract': ['عقد', 'اتفاقية', 'contract', 'agreement', 'terms']
        }
    
    def discover_file_type(self, file_path: str) -> Dict:
        """
        اكتشاف نوع ملف Excel
        
        Args:
            file_path: مسار الملف
            
        Returns:
            قاموس يحتوي على:
            - file_type: نوع الملف
            - confidence: درجة الثقة (0-100)
            - detected_sheets: الأوراق المكتشفة
            - columns_found: الأعمدة المكتشفة
        """
        
        try:
            # قراءة أسماء الأوراق
            excel_file = pd.ExcelFile(file_path)
            sheet_names = excel_file.sheet_names
            
            # تحليل كل ورقة
            results = []
            for sheet_name in sheet_names:
                df = pd.read_excel(file_path, sheet_name=sheet_name, nrows=10)
                
                # استخراج أسماء الأعمدة
                columns = [str(col).lower() for col in df.columns]
                
                # حساب النقاط لكل نوع ملف
                scores = {}
                for file_type, keywords in self.keywords.items():
                    score = 0
                    matched_keywords = []
                    
                    for keyword in keywords:
                        # البحث في أسماء الأعمدة
                        for col in columns:
                            if keyword in col:
                                score += 1
                                matched_keywords.append(keyword)
                        
                        # البحث في اسم الورقة
                        if keyword in sheet_name.lower():
                            score += 2
                            matched_keywords.append(keyword)
                    
                    scores[file_type] = {
                        'score': score,
                        'matched_keywords': list(set(matched_keywords))
                    }
                
                # اختيار النوع الأعلى نقاطاً
                best_type = max(scores.items(), key=lambda x: x[1]['score'])
                
                results.append({
                    'sheet_name': sheet_name,
                    'file_type': best_type[0],
                    'score': best_type[1]['score'],
                    'matched_keywords': best_type[1]['matched_keywords'],
                    'columns': list(df.columns),
                    'rows_count': len(df)
                })
            
            # النوع الإجمالي للملف
            if results:
                overall_type = max(results, key=lambda x: x['score'])
                confidence = min(100, (overall_type['score'] / len(self.keywords[overall_type['file_type']])) * 100)
            else:
                overall_type = {'file_type': 'unknown'}
                confidence = 0
            
            return {
                'file_type': overall_type['file_type'],
                'file_type_ar': self.file_types[overall_type['file_type']],
                'confidence': round(confidence, 2),
                'detected_sheets': results,
                'total_sheets': len(sheet_names),
                'file_path': str(file_path)
            }
            
        except Exception as e:
            return {
                'file_type': 'error',
                'file_type_ar': 'خطأ',
                'confidence': 0,
                'error': str(e),
                'file_path': str(file_path)
            }
    
    def extract_data(self, file_path: str, discovery_result: Dict) -> Dict:
        """
        استخراج البيانات من الملف حسب نوعه
        
        Args:
            file_path: مسار الملف
            discovery_result: نتيجة الاكتشاف
            
        Returns:
            البيانات المستخرجة
        """
        
        file_type = discovery_result['file_type']
        
        if file_type == 'boq':
            return self._extract_boq_data(file_path, discovery_result)
        elif file_type == 'schedule':
            return self._extract_schedule_data(file_path, discovery_result)
        elif file_type == 'resources':
            return self._extract_resources_data(file_path, discovery_result)
        else:
            return self._extract_generic_data(file_path, discovery_result)
    
    def _extract_boq_data(self, file_path: str, discovery_result: Dict) -> Dict:
        """استخراج بيانات جدول الكميات"""
        
        items = []
        
        for sheet_info in discovery_result['detected_sheets']:
            if sheet_info['file_type'] == 'boq':
                df = pd.read_excel(file_path, sheet_name=sheet_info['sheet_name'])
                
                # البحث عن أعمدة: الوصف، الكمية، الوحدة، السعر
                desc_col = self._find_column(df, ['وصف', 'بند', 'description', 'item'])
                qty_col = self._find_column(df, ['كمية', 'quantity', 'qty'])
                unit_col = self._find_column(df, ['وحدة', 'unit'])
                rate_col = self._find_column(df, ['سعر', 'rate', 'price'])
                
                for idx, row in df.iterrows():
                    if pd.notna(row.get(desc_col, None)):
                        item = {
                            'row_number': idx + 1,
                            'description': str(row.get(desc_col, '')),
                            'quantity': float(row.get(qty_col, 0)) if pd.notna(row.get(qty_col)) else 0,
                            'unit': str(row.get(unit_col, '')) if pd.notna(row.get(unit_col)) else '',
                            'rate': float(row.get(rate_col, 0)) if pd.notna(row.get(rate_col)) else 0,
                            'sheet': sheet_info['sheet_name']
                        }
                        
                        # حساب الإجمالي
                        item['amount'] = item['quantity'] * item['rate']
                        
                        items.append(item)
        
        return {
            'type': 'boq',
            'items': items,
            'total_items': len(items),
            'total_amount': sum(item['amount'] for item in items)
        }
    
    def _extract_schedule_data(self, file_path: str, discovery_result: Dict) -> Dict:
        """استخراج بيانات الجدول الزمني"""
        
        activities = []
        
        for sheet_info in discovery_result['detected_sheets']:
            if sheet_info['file_type'] == 'schedule':
                df = pd.read_excel(file_path, sheet_name=sheet_info['sheet_name'])
                
                # البحث عن أعمدة: النشاط، المدة، البداية، النهاية
                activity_col = self._find_column(df, ['نشاط', 'activity', 'task'])
                duration_col = self._find_column(df, ['مدة', 'duration'])
                start_col = self._find_column(df, ['بداية', 'start'])
                finish_col = self._find_column(df, ['نهاية', 'finish', 'end'])
                
                for idx, row in df.iterrows():
                    if pd.notna(row.get(activity_col, None)):
                        activity = {
                            'id': idx + 1,
                            'name': str(row.get(activity_col, '')),
                            'duration': float(row.get(duration_col, 0)) if pd.notna(row.get(duration_col)) else 0,
                            'start': row.get(start_col, None),
                            'finish': row.get(finish_col, None),
                            'sheet': sheet_info['sheet_name']
                        }
                        
                        activities.append(activity)
        
        return {
            'type': 'schedule',
            'activities': activities,
            'total_activities': len(activities)
        }
    
    def _extract_resources_data(self, file_path: str, discovery_result: Dict) -> Dict:
        """استخراج بيانات الموارد"""
        
        resources = []
        
        for sheet_info in discovery_result['detected_sheets']:
            df = pd.read_excel(file_path, sheet_name=sheet_info['sheet_name'])
            
            for idx, row in df.iterrows():
                resource = {
                    'id': idx + 1,
                    'data': row.to_dict(),
                    'sheet': sheet_info['sheet_name']
                }
                resources.append(resource)
        
        return {
            'type': 'resources',
            'resources': resources,
            'total_resources': len(resources)
        }
    
    def _extract_generic_data(self, file_path: str, discovery_result: Dict) -> Dict:
        """استخراج بيانات عامة"""
        
        data = []
        
        for sheet_info in discovery_result['detected_sheets']:
            df = pd.read_excel(file_path, sheet_name=sheet_info['sheet_name'])
            
            data.append({
                'sheet': sheet_info['sheet_name'],
                'rows': len(df),
                'columns': list(df.columns),
                'data': df.to_dict('records')
            })
        
        return {
            'type': 'generic',
            'sheets': data
        }
    
    def _find_column(self, df: pd.DataFrame, keywords: List[str]) -> Optional[str]:
        """البحث عن عمود باستخدام كلمات مفتاحية"""
        
        columns = [str(col).lower() for col in df.columns]
        
        for keyword in keywords:
            for col, col_name in zip(columns, df.columns):
                if keyword in col:
                    return col_name
        
        return None


# اختبار سريع
if __name__ == "__main__":
    ei = ExcelIntelligence()
    print("✅ ExcelIntelligence System Loaded Successfully!")
    print(f"📊 Supported Types: {list(ei.file_types.values())}")
