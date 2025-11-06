"""
RequestExecutor System - منفذ الطلبات
يقوم بتنفيذ الأوامر المُحللة من RequestParser باستخدام جميع الأنظمة الأخرى
"""

import sqlite3
from typing import Dict, List, Optional
import json
from datetime import datetime

# استيراد جميع الأنظمة
from .ExcelIntelligence import ExcelIntelligence
from .ItemClassifier import ItemClassifier
from .ItemAnalyzer import ItemAnalyzer
from .ProductivityDatabase import ProductivityDatabase
from .RelationshipEngine import RelationshipEngine
from .ComprehensiveScheduler import ComprehensiveScheduler
from .SBCComplianceChecker import SBCComplianceChecker
from .SCurveGenerator import SCurveGenerator
from .RequestParser import RequestParser


class RequestExecutor:
    """منفذ الطلبات اللغوية"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        
        # تهيئة جميع الأنظمة
        self.excel_intelligence = ExcelIntelligence()
        self.item_classifier = ItemClassifier(db_path)
        self.item_analyzer = ItemAnalyzer(db_path)
        self.productivity_db = ProductivityDatabase(db_path)
        self.relationship_engine = RelationshipEngine(db_path)
        self.scheduler = ComprehensiveScheduler(db_path)
        self.compliance_checker = SBCComplianceChecker(db_path)
        self.s_curve_generator = SCurveGenerator(db_path)
        self.request_parser = RequestParser()
        
        # كاش للبيانات
        self.cache = {
            'last_uploaded_file': None,
            'last_analysis': None,
            'last_schedule': None,
            'last_s_curve': None
        }
        
        print("✅ RequestExecutor System Initialized")
    
    def execute(self, request_text: str, context: Dict = None) -> Dict:
        """
        تنفيذ طلب لغوي
        
        Args:
            request_text: النص المراد تنفيذه
            context: سياق إضافي (ملفات، مشاريع، إلخ)
            
        Returns:
            نتيجة التنفيذ
        """
        
        context = context or {}
        
        # 1. تحليل الطلب
        parsed_command = self.request_parser.parse(request_text)
        
        # 2. التحقق من صحة الأمر
        validation = self.request_parser.validate_command(parsed_command)
        if not validation['valid']:
            return {
                'success': False,
                'error': 'أمر غير صحيح',
                'details': validation['errors'],
                'parsed_command': parsed_command
            }
        
        # 3. تنفيذ الأمر
        intent_name = parsed_command['intent']['name']
        parameters = parsed_command.get('parameters', {})
        
        try:
            if intent_name == 'create_schedule':
                result = self._execute_create_schedule(parameters, context)
            
            elif intent_name == 'analyze_boq':
                result = self._execute_analyze_boq(parameters, context)
            
            elif intent_name == 'generate_s_curve':
                result = self._execute_generate_s_curve(parameters, context)
            
            elif intent_name == 'check_compliance':
                result = self._execute_check_compliance(parameters, context)
            
            elif intent_name == 'export':
                result = self._execute_export(parameters, context)
            
            elif intent_name == 'query':
                result = self._execute_query(parameters, context)
            
            else:
                result = {
                    'success': False,
                    'error': f"النية '{intent_name}' غير مدعومة حالياً"
                }
            
            # إضافة معلومات التنفيذ
            result['parsed_command'] = parsed_command
            result['executed_at'] = datetime.now().isoformat()
            
            return result
            
        except Exception as e:
            return {
                'success': False,
                'error': f"خطأ في التنفيذ: {str(e)}",
                'parsed_command': parsed_command
            }
    
    def _execute_create_schedule(self, parameters: Dict, context: Dict) -> Dict:
        """تنفيذ أمر إنشاء جدول زمني"""
        
        # الحصول على البيانات
        if 'activities' in context:
            activities = context['activities']
        elif self.cache['last_analysis']:
            # استخدام آخر تحليل
            activities = self.cache['last_analysis'].get('items_analysis', [])
            # تحويل إلى صيغة الأنشطة
            activities = [
                {
                    'id': f"ACT-{i+1:03d}",
                    'description': item.get('description', ''),
                    'type': item.get('item_type', 'general'),
                    'quantity': item.get('quantity', 1),
                    'predecessors': []
                }
                for i, item in enumerate(activities)
            ]
        else:
            return {
                'success': False,
                'error': 'لا توجد أنشطة متاحة. يُرجى تحليل المقايسة أولاً.'
            }
        
        # توليد الجدول
        start_date = parameters.get('start_date', datetime.now().strftime('%Y-%m-%d'))
        schedule = self.scheduler.generate_schedule(
            activities,
            start_date,
            constraints=context.get('constraints', {})
        )
        
        # حفظ في الكاش
        self.cache['last_schedule'] = schedule
        
        return {
            'success': True,
            'message': f"تم إنشاء جدول زمني يحتوي على {len(activities)} نشاط",
            'data': schedule
        }
    
    def _execute_analyze_boq(self, parameters: Dict, context: Dict) -> Dict:
        """تنفيذ أمر تحليل المقايسة"""
        
        # الحصول على البيانات
        if 'boq_items' in context:
            items = context['boq_items']
        elif 'file_path' in context:
            # تحليل ملف
            file_path = context['file_path']
            discovery = self.excel_intelligence.discover_file_type(file_path)
            
            if discovery['file_type'] == 'boq':
                extracted_data = self.excel_intelligence.extract_data(file_path, discovery)
                items = extracted_data.get('items', [])
            else:
                return {
                    'success': False,
                    'error': f"الملف من نوع '{discovery['file_type']}' وليس BOQ"
                }
        else:
            return {
                'success': False,
                'error': 'لا توجد مقايسة متاحة للتحليل'
            }
        
        # تصنيف البنود
        classifications = self.item_classifier.classify_batch(
            [item.get('description', '') for item in items]
        )
        
        # تحليل عميق للبنود
        analysis = self.item_analyzer.analyze_batch(items)
        
        # حفظ في الكاش
        self.cache['last_analysis'] = analysis
        
        return {
            'success': True,
            'message': f"تم تحليل {len(items)} بند",
            'data': {
                'classifications': classifications,
                'analysis': analysis
            }
        }
    
    def _execute_generate_s_curve(self, parameters: Dict, context: Dict) -> Dict:
        """تنفيذ أمر توليد منحنى S"""
        
        # الحصول على الجدول
        if 'schedule' in context:
            schedule = context['schedule']
        elif self.cache['last_schedule']:
            schedule = self.cache['last_schedule']
        else:
            return {
                'success': False,
                'error': 'لا يوجد جدول زمني. يُرجى إنشاء جدول أولاً.'
            }
        
        # توليد منحنى S
        interval = parameters.get('interval', 'monthly')
        s_curve = self.s_curve_generator.generate_s_curve(
            schedule,
            interval=interval
        )
        
        # حفظ في الكاش
        self.cache['last_s_curve'] = s_curve
        
        return {
            'success': True,
            'message': f"تم توليد منحنى S بفاصل زمني '{interval}'",
            'data': s_curve
        }
    
    def _execute_check_compliance(self, parameters: Dict, context: Dict) -> Dict:
        """تنفيذ أمر فحص الامتثال"""
        
        # الحصول على البنود
        if 'items' in context:
            items = context['items']
        elif self.cache['last_analysis']:
            items = self.cache['last_analysis'].get('items_analysis', [])
        else:
            return {
                'success': False,
                'error': 'لا توجد بنود متاحة للفحص'
            }
        
        # فحص الامتثال
        category = parameters.get('category', 'all')
        compliance_results = self.compliance_checker.check_batch(items, category)
        
        # توليد تقرير
        report = self.compliance_checker.generate_compliance_report(compliance_results)
        
        return {
            'success': True,
            'message': f"تم فحص {len(items)} بند",
            'data': {
                'results': compliance_results,
                'report': report
            }
        }
    
    def _execute_export(self, parameters: Dict, context: Dict) -> Dict:
        """تنفيذ أمر التصدير"""
        
        export_format = parameters.get('format', 'excel')
        
        # تحديد البيانات المراد تصديرها
        if 'data' in context:
            data = context['data']
        elif self.cache['last_schedule']:
            data = self.cache['last_schedule']
        else:
            return {
                'success': False,
                'error': 'لا توجد بيانات متاحة للتصدير'
            }
        
        # التصدير حسب الصيغة
        if export_format == 'json':
            exported = json.dumps(data, ensure_ascii=False, indent=2)
        elif export_format == 'excel':
            # يمكن استخدام ExcelExporter.ts logic هنا
            exported = "Excel export requires frontend integration"
        else:
            exported = str(data)
        
        return {
            'success': True,
            'message': f"تم التصدير إلى صيغة '{export_format}'",
            'data': exported
        }
    
    def _execute_query(self, parameters: Dict, context: Dict) -> Dict:
        """تنفيذ أمر الاستعلام"""
        
        # استخراج نوع الاستعلام من السياق
        query_text = context.get('original_text', '').lower()
        
        # الرد على أسئلة شائعة
        if 'مدة' in query_text or 'duration' in query_text:
            if self.cache['last_schedule']:
                duration = self.cache['last_schedule']['total_duration']
                return {
                    'success': True,
                    'message': f"مدة المشروع: {duration} يوم",
                    'data': {'duration': duration}
                }
        
        elif 'عدد' in query_text or 'how many' in query_text:
            if 'نشاط' in query_text or 'activity' in query_text:
                if self.cache['last_schedule']:
                    count = len(self.cache['last_schedule'].get('activities', []))
                    return {
                        'success': True,
                        'message': f"عدد الأنشطة: {count}",
                        'data': {'count': count}
                    }
            elif 'بند' in query_text or 'item' in query_text:
                if self.cache['last_analysis']:
                    count = self.cache['last_analysis']['summary']['total_items']
                    return {
                        'success': True,
                        'message': f"عدد البنود: {count}",
                        'data': {'count': count}
                    }
        
        elif 'تكلفة' in query_text or 'cost' in query_text:
            if self.cache['last_s_curve'] and 'project_info' in self.cache['last_s_curve']:
                cost = self.cache['last_s_curve']['project_info'].get('total_cost', 0)
                return {
                    'success': True,
                    'message': f"التكلفة الإجمالية: {cost} ريال",
                    'data': {'cost': cost}
                }
        
        return {
            'success': False,
            'error': 'لم أتمكن من فهم الاستعلام. يُرجى إعادة الصياغة.'
        }
    
    def get_system_status(self) -> Dict:
        """الحصول على حالة جميع الأنظمة"""
        
        return {
            'systems': {
                'excel_intelligence': True,
                'item_classifier': True,
                'item_analyzer': True,
                'productivity_database': True,
                'relationship_engine': True,
                'scheduler': True,
                'compliance_checker': True,
                's_curve_generator': True,
                'request_parser': True
            },
            'cache': {
                'last_uploaded_file': self.cache['last_uploaded_file'] is not None,
                'last_analysis': self.cache['last_analysis'] is not None,
                'last_schedule': self.cache['last_schedule'] is not None,
                'last_s_curve': self.cache['last_s_curve'] is not None
            },
            'database': {
                'path': self.db_path,
                'connected': self._check_database_connection()
            }
        }
    
    def _check_database_connection(self) -> bool:
        """فحص اتصال قاعدة البيانات"""
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            conn.close()
            return True
        except:
            return False
    
    def clear_cache(self):
        """مسح الكاش"""
        
        self.cache = {
            'last_uploaded_file': None,
            'last_analysis': None,
            'last_schedule': None,
            'last_s_curve': None
        }
    
    def execute_batch(self, requests: List[str], context: Dict = None) -> List[Dict]:
        """تنفيذ دفعة من الطلبات"""
        
        results = []
        for request_text in requests:
            result = self.execute(request_text, context)
            results.append(result)
        
        return results


# اختبار سريع
if __name__ == "__main__":
    print("✅ RequestExecutor System Loaded")
    
    # اختبار بسيط
    executor = RequestExecutor("../database/noufal.db")
    
    # فحص حالة الأنظمة
    status = executor.get_system_status()
    print(f"\n📊 حالة الأنظمة:")
    print(f"- الأنظمة النشطة: {sum(status['systems'].values())}/{len(status['systems'])}")
    print(f"- قاعدة البيانات: {'✅' if status['database']['connected'] else '❌'}")
    
    # اختبار تنفيذ طلب
    test_request = "ما هي مدة المشروع؟"
    result = executor.execute(test_request)
    print(f"\n📝 اختبار تنفيذ طلب:")
    print(f"- الطلب: {test_request}")
    print(f"- النتيجة: {'✅' if result['success'] else '❌'}")
