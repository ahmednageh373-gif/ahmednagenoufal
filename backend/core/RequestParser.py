"""
RequestParser System - محلل الطلبات اللغوية
يقوم بتحليل الطلبات باللغة الطبيعية (عربي/إنجليزي) وتحويلها إلى أوامر قابلة للتنفيذ
بدون استخدام ML/AI - Rule-Based NLP
"""

import re
from typing import Dict, List, Tuple, Optional
from datetime import datetime


class RequestParser:
    """محلل الطلبات اللغوية"""
    
    def __init__(self):
        self.intent_patterns = self._initialize_intent_patterns()
        self.entity_patterns = self._initialize_entity_patterns()
        
        print("✅ RequestParser System Initialized")
    
    def _initialize_intent_patterns(self) -> Dict:
        """تهيئة أنماط الأوامر (Intents)"""
        
        return {
            # إنشاء جدول زمني
            'create_schedule': [
                r'أنشئ\s+جدول',
                r'إعداد\s+جدول',
                r'توليد\s+جدول',
                r'create\s+schedule',
                r'generate\s+schedule',
                r'جدول\s+زمني',
                r'برنامج\s+زمني'
            ],
            
            # تحليل BOQ
            'analyze_boq': [
                r'حلل\s+المقايسة',
                r'تحليل\s+BOQ',
                r'analyze\s+boq',
                r'تصنيف\s+البنود',
                r'فحص\s+المقايسة'
            ],
            
            # توليد منحنى S
            'generate_s_curve': [
                r'منحنى\s+S',
                r'S[- ]curve',
                r'منحنى\s+التقدم',
                r'تقدم\s+المشروع',
                r'خطة\s+التقدم'
            ],
            
            # فحص الامتثال
            'check_compliance': [
                r'فحص\s+الامتثال',
                r'check\s+compliance',
                r'كود\s+البناء',
                r'SBC',
                r'مطابقة\s+المواصفات',
                r'تحقق\s+من\s+المواصفات'
            ],
            
            # تصدير
            'export': [
                r'تصدير',
                r'export',
                r'حفظ\s+كـ',
                r'تنزيل',
                r'download'
            ],
            
            # استيراد
            'import': [
                r'استيراد',
                r'import',
                r'رفع\s+ملف',
                r'upload',
                r'تحميل\s+ملف'
            ],
            
            # عرض/استعلام
            'query': [
                r'أظهر',
                r'اعرض',
                r'show',
                r'display',
                r'ما\s+هو',
                r'what\s+is',
                r'كم',
                r'how\s+many'
            ],
            
            # تحديث
            'update': [
                r'حدّث',
                r'عدّل',
                r'update',
                r'modify',
                r'غيّر',
                r'change'
            ]
        }
    
    def _initialize_entity_patterns(self) -> Dict:
        """تهيئة أنماط الكيانات (Entities)"""
        
        return {
            # التواريخ
            'date': [
                r'(\d{4}-\d{2}-\d{2})',  # YYYY-MM-DD
                r'(\d{2}/\d{2}/\d{4})',  # DD/MM/YYYY
                r'(يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر)\s+\d{4}'
            ],
            
            # الفترات الزمنية
            'duration': [
                r'(\d+)\s*(يوم|أيام|day|days)',
                r'(\d+)\s*(أسبوع|أسابيع|week|weeks)',
                r'(\d+)\s*(شهر|أشهر|month|months)',
                r'(\d+)\s*(سنة|سنوات|year|years)'
            ],
            
            # الأرقام
            'number': [
                r'\b(\d+)\b'
            ],
            
            # صيغ الملفات
            'file_format': [
                r'\b(excel|xlsx|xls|csv|pdf|json|xml)\b',
                r'\b(إكسل|PDF|JSON)\b'
            ],
            
            # أنواع التقارير
            'report_type': [
                r'(gantt|جانت)',
                r'(s[- ]curve|منحنى)',
                r'(schedule|جدول)',
                r'(boq|مقايسة)',
                r'(compliance|امتثال)'
            ],
            
            # البنود/الأنشطة
            'activity_type': [
                r'(خرسانة|concrete)',
                r'(حفر|excavation)',
                r'(بناء|masonry)',
                r'(لياسة|plastering)',
                r'(دهان|painting)',
                r'(عزل|waterproofing)',
                r'(كهرباء|electrical)',
                r'(سباكة|plumbing)'
            ]
        }
    
    def parse(self, request_text: str) -> Dict:
        """
        تحليل طلب لغوي
        
        Args:
            request_text: النص المراد تحليله
            
        Returns:
            الأمر المُحلّل مع المعاملات
        """
        
        # تنظيف النص
        cleaned_text = self._clean_text(request_text)
        
        # تحديد النية (Intent)
        intent = self._detect_intent(cleaned_text)
        
        # استخراج الكيانات (Entities)
        entities = self._extract_entities(cleaned_text)
        
        # بناء الأمر
        command = {
            'original_text': request_text,
            'cleaned_text': cleaned_text,
            'intent': intent,
            'entities': entities,
            'confidence': self._calculate_confidence(intent, entities),
            'parsed_at': datetime.now().isoformat()
        }
        
        # تحسين الأمر بناءً على السياق
        command = self._enhance_command(command)
        
        return command
    
    def _clean_text(self, text: str) -> str:
        """تنظيف النص"""
        
        # إزالة الأحرف الخاصة
        text = re.sub(r'[^\w\s\-/،.؛:؟!]', '', text)
        
        # توحيد المسافات
        text = re.sub(r'\s+', ' ', text)
        
        # تحويل إلى حروف صغيرة (للإنجليزية فقط)
        # العربية لا تحتاج
        
        return text.strip()
    
    def _detect_intent(self, text: str) -> Dict:
        """اكتشاف النية من النص"""
        
        detected_intents = []
        
        for intent_name, patterns in self.intent_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    detected_intents.append(intent_name)
                    break
        
        if not detected_intents:
            return {
                'name': 'unknown',
                'confidence': 0.0
            }
        
        # إذا تم اكتشاف أكثر من نية، نختار الأولى (يمكن تحسين هذا)
        primary_intent = detected_intents[0]
        
        return {
            'name': primary_intent,
            'confidence': 0.9 if len(detected_intents) == 1 else 0.7,
            'alternatives': detected_intents[1:] if len(detected_intents) > 1 else []
        }
    
    def _extract_entities(self, text: str) -> Dict:
        """استخراج الكيانات من النص"""
        
        entities = {}
        
        for entity_type, patterns in self.entity_patterns.items():
            matches = []
            for pattern in patterns:
                found = re.findall(pattern, text, re.IGNORECASE)
                if found:
                    matches.extend(found)
            
            if matches:
                # تنظيف التطابقات
                if entity_type == 'number':
                    entities[entity_type] = [int(m) for m in matches]
                elif entity_type == 'date':
                    entities[entity_type] = [self._parse_date(m) for m in matches]
                else:
                    entities[entity_type] = list(set(matches))
        
        return entities
    
    def _parse_date(self, date_str: str) -> str:
        """تحويل التاريخ إلى صيغة موحدة"""
        
        # محاولة تحليل التاريخ
        date_formats = [
            '%Y-%m-%d',
            '%d/%m/%Y',
            '%Y/%m/%d'
        ]
        
        for fmt in date_formats:
            try:
                parsed_date = datetime.strptime(date_str, fmt)
                return parsed_date.strftime('%Y-%m-%d')
            except:
                continue
        
        # إذا فشل التحليل، إرجاع النص كما هو
        return date_str
    
    def _calculate_confidence(self, intent: Dict, entities: Dict) -> float:
        """حساب درجة الثقة في التحليل"""
        
        confidence = intent.get('confidence', 0.5)
        
        # زيادة الثقة إذا تم استخراج كيانات
        if entities:
            confidence += 0.1 * min(len(entities), 3)
        
        # تحديد الثقة في نطاق 0-1
        confidence = min(1.0, max(0.0, confidence))
        
        return round(confidence, 2)
    
    def _enhance_command(self, command: Dict) -> Dict:
        """تحسين الأمر بإضافة معاملات افتراضية"""
        
        intent_name = command['intent']['name']
        entities = command['entities']
        
        # معاملات محسّنة
        enhanced_params = {}
        
        if intent_name == 'create_schedule':
            enhanced_params['start_date'] = entities.get('date', [datetime.now().strftime('%Y-%m-%d')])[0]
            enhanced_params['interval'] = 'weekly'
            
        elif intent_name == 'generate_s_curve':
            enhanced_params['interval'] = 'monthly'
            enhanced_params['curve_type'] = 'planned'
            
        elif intent_name == 'export':
            file_formats = entities.get('file_format', ['excel'])
            enhanced_params['format'] = file_formats[0] if file_formats else 'excel'
            
        elif intent_name == 'check_compliance':
            enhanced_params['category'] = 'all'
        
        command['parameters'] = enhanced_params
        
        return command
    
    def parse_batch(self, requests: List[str]) -> List[Dict]:
        """تحليل دفعة من الطلبات"""
        
        results = []
        for request_text in requests:
            result = self.parse(request_text)
            results.append(result)
        
        return results
    
    def generate_suggestions(self, partial_text: str) -> List[str]:
        """توليد اقتراحات بناءً على نص جزئي"""
        
        suggestions = []
        
        # اقتراحات بناءً على الأوامر الشائعة
        common_requests = [
            "أنشئ جدول زمني للمشروع",
            "حلل المقايسة وصنف البنود",
            "توليد منحنى S للمشروع",
            "فحص الامتثال لكود البناء السعودي",
            "تصدير الجدول إلى Excel",
            "اعرض تفاصيل الأنشطة",
            "ما هي مدة المشروع؟",
            "كم عدد الأنشطة على المسار الحرج؟"
        ]
        
        # تصفية الاقتراحات
        partial_lower = partial_text.lower()
        for suggestion in common_requests:
            if partial_lower in suggestion.lower() or suggestion.lower().startswith(partial_lower):
                suggestions.append(suggestion)
        
        return suggestions[:5]  # أول 5 اقتراحات
    
    def validate_command(self, command: Dict) -> Dict:
        """التحقق من صحة الأمر"""
        
        errors = []
        warnings = []
        
        # التحقق من النية
        if command['intent']['name'] == 'unknown':
            errors.append("لم يتم التعرف على الأمر")
        
        # التحقق من درجة الثقة
        if command['confidence'] < 0.5:
            warnings.append(f"درجة الثقة منخفضة ({command['confidence']})")
        
        # التحقق من المعاملات المطلوبة
        intent_name = command['intent']['name']
        required_params = self._get_required_parameters(intent_name)
        
        for param in required_params:
            if param not in command.get('parameters', {}):
                errors.append(f"المعامل المطلوب '{param}' غير موجود")
        
        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings
        }
    
    def _get_required_parameters(self, intent_name: str) -> List[str]:
        """الحصول على المعاملات المطلوبة لكل نية"""
        
        requirements = {
            'create_schedule': ['start_date'],
            'analyze_boq': [],
            'generate_s_curve': ['interval'],
            'check_compliance': [],
            'export': ['format'],
            'import': [],
            'query': [],
            'update': []
        }
        
        return requirements.get(intent_name, [])


# اختبار سريع
if __name__ == "__main__":
    print("✅ RequestParser System Loaded")
    
    # اختبار بسيط
    parser = RequestParser()
    
    test_requests = [
        "أنشئ جدول زمني للمشروع يبدأ في 2025-01-01",
        "حلل المقايسة وصنف البنود حسب الفئات",
        "توليد منحنى S شهري للمشروع",
        "فحص الامتثال لكود البناء السعودي SBC",
        "تصدير الجدول إلى Excel",
        "ما هي مدة المشروع؟"
    ]
    
    print("\n📊 اختبار تحليل الطلبات:")
    for i, request in enumerate(test_requests, 1):
        result = parser.parse(request)
        print(f"\n{i}. الطلب: {request}")
        print(f"   النية: {result['intent']['name']}")
        print(f"   الثقة: {result['confidence']}")
        print(f"   الكيانات: {list(result['entities'].keys())}")
        
        validation = parser.validate_command(result)
        print(f"   صحيح: {'✅' if validation['valid'] else '❌'}")
