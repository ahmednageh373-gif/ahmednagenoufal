"""
ItemAnalyzer System - نظام التحليل العميق للبنود
يقوم بتحليل شامل لبنود المقايسة بما في ذلك:
- التصنيف التلقائي
- استخراج الكميات والوحدات
- تحديد مستوى التعقيد
- تحليل المواصفات الفنية
- اكتشاف العلاقات بين البنود
"""

import re
import sqlite3
from typing import Dict, List, Tuple, Optional
from datetime import datetime


class ItemAnalyzer:
    """نظام التحليل العميق للبنود"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.analysis_cache = {}
        
        # أنماط التعبيرات النمطية لاستخراج المعلومات
        self.patterns = {
            'quantity': r'(\d+(?:[.,]\d+)?)\s*(متر|م²|م³|م|طن|كجم|قطعة|عدد)',
            'dimensions': r'(\d+(?:[.,]\d+)?)\s*[xXxX×]\s*(\d+(?:[.,]\d+)?)',
            'thickness': r'سمك\s*(\d+(?:[.,]\d+)?)\s*(سم|مم)',
            'diameter': r'قطر\s*(\d+(?:[.,]\d+)?)\s*(سم|مم)',
            'strength': r'(\d+)\s*(كجم/سم²|نيوتن/مم²)',
            'floor_number': r'(دور|طابق|الدور)\s*(الأول|الثاني|الثالث|الأرضي|السفلي|\d+)',
        }
        
        # مستويات التعقيد
        self.complexity_indicators = {
            'high': ['معقد', 'متخصص', 'دقيق', 'حساس', 'استثنائي'],
            'medium': ['عادي', 'قياسي', 'متوسط', 'نمطي'],
            'low': ['بسيط', 'أساسي', 'عام', 'تقليدي']
        }
        
        print("✅ ItemAnalyzer System Initialized")
    
    def analyze_item(self, item_data: Dict) -> Dict:
        """
        تحليل بند واحد بشكل شامل
        
        Args:
            item_data: {
                'description': str,
                'quantity': float,
                'unit': str,
                'classification': Dict (optional)
            }
            
        Returns:
            تحليل شامل للبند يحتوي على:
            - extracted_info: معلومات مستخرجة
            - complexity_level: مستوى التعقيد
            - technical_specs: المواصفات الفنية
            - dependencies: التبعيات المحتملة
            - warnings: تحذيرات
        """
        
        description = item_data.get('description', '')
        
        # التحقق من الكاش
        cache_key = description.lower().strip()
        if cache_key in self.analysis_cache:
            return self.analysis_cache[cache_key]
        
        # استخراج المعلومات
        extracted_info = self._extract_information(description)
        
        # تحديد مستوى التعقيد
        complexity_level = self._determine_complexity(description, item_data)
        
        # استخراج المواصفات الفنية
        technical_specs = self._extract_technical_specs(description)
        
        # اكتشاف التبعيات
        dependencies = self._detect_dependencies(description, item_data)
        
        # توليد التحذيرات
        warnings = self._generate_warnings(item_data, extracted_info)
        
        # بناء النتيجة
        result = {
            'item_id': item_data.get('id'),
            'description': description,
            'extracted_info': extracted_info,
            'complexity_level': complexity_level,
            'technical_specs': technical_specs,
            'dependencies': dependencies,
            'warnings': warnings,
            'analysis_timestamp': datetime.now().isoformat()
        }
        
        # حفظ في الكاش
        self.analysis_cache[cache_key] = result
        
        return result
    
    def _extract_information(self, text: str) -> Dict:
        """استخراج المعلومات من النص"""
        
        extracted = {
            'quantities': [],
            'dimensions': [],
            'thickness': None,
            'diameter': None,
            'strength': None,
            'floor_number': None
        }
        
        # استخراج الكميات والوحدات
        quantity_matches = re.findall(self.patterns['quantity'], text)
        for match in quantity_matches:
            extracted['quantities'].append({
                'value': float(match[0].replace(',', '.')),
                'unit': match[1]
            })
        
        # استخراج الأبعاد
        dimension_matches = re.findall(self.patterns['dimensions'], text)
        for match in dimension_matches:
            extracted['dimensions'].append({
                'width': float(match[0].replace(',', '.')),
                'length': float(match[1].replace(',', '.'))
            })
        
        # استخراج السماكة
        thickness_match = re.search(self.patterns['thickness'], text)
        if thickness_match:
            extracted['thickness'] = {
                'value': float(thickness_match.group(1).replace(',', '.')),
                'unit': thickness_match.group(2)
            }
        
        # استخراج القطر
        diameter_match = re.search(self.patterns['diameter'], text)
        if diameter_match:
            extracted['diameter'] = {
                'value': float(diameter_match.group(1).replace(',', '.')),
                'unit': diameter_match.group(2)
            }
        
        # استخراج مقاومة الخرسانة
        strength_match = re.search(self.patterns['strength'], text)
        if strength_match:
            extracted['strength'] = {
                'value': int(strength_match.group(1)),
                'unit': strength_match.group(2)
            }
        
        # استخراج رقم الدور
        floor_match = re.search(self.patterns['floor_number'], text)
        if floor_match:
            extracted['floor_number'] = floor_match.group(0)
        
        return extracted
    
    def _determine_complexity(self, text: str, item_data: Dict) -> Dict:
        """تحديد مستوى التعقيد"""
        
        text_lower = text.lower()
        complexity_score = 0
        indicators_found = []
        
        # فحص مؤشرات التعقيد
        for level, keywords in self.complexity_indicators.items():
            for keyword in keywords:
                if keyword in text_lower:
                    if level == 'high':
                        complexity_score += 3
                    elif level == 'medium':
                        complexity_score += 2
                    else:
                        complexity_score += 1
                    indicators_found.append(keyword)
        
        # مؤشرات إضافية للتعقيد
        if item_data.get('quantity', 0) > 1000:
            complexity_score += 1
        
        if 'خاص' in text_lower or 'مخصص' in text_lower:
            complexity_score += 2
        
        if len(text.split()) > 20:
            complexity_score += 1
        
        # تحديد المستوى
        if complexity_score >= 5:
            level = 'high'
            factor = 1.3
        elif complexity_score >= 3:
            level = 'medium'
            factor = 1.1
        else:
            level = 'low'
            factor = 1.0
        
        return {
            'level': level,
            'score': complexity_score,
            'factor': factor,
            'indicators': indicators_found
        }
    
    def _extract_technical_specs(self, text: str) -> Dict:
        """استخراج المواصفات الفنية"""
        
        specs = {
            'concrete_grade': None,
            'steel_grade': None,
            'finish_type': None,
            'material_type': None
        }
        
        # درجة الخرسانة
        concrete_match = re.search(r'خرسانة\s+(\d+)', text)
        if concrete_match:
            specs['concrete_grade'] = f"{concrete_match.group(1)} نيوتن/مم²"
        
        # نوع الحديد
        if 'حديد' in text.lower():
            if 'عالي' in text.lower():
                specs['steel_grade'] = 'عالي المقاومة'
            elif 'عادي' in text.lower():
                specs['steel_grade'] = 'عادي'
            else:
                specs['steel_grade'] = 'قياسي'
        
        # نوع التشطيب
        finish_keywords = {
            'ممتاز': 'ممتاز',
            'جيد': 'جيد',
            'عادي': 'عادي',
            'ناعم': 'ناعم',
            'خشن': 'خشن'
        }
        
        for keyword, finish_type in finish_keywords.items():
            if keyword in text.lower():
                specs['finish_type'] = finish_type
                break
        
        # نوع المادة
        material_keywords = [
            'خرسانة', 'طوب', 'بلوك', 'حديد', 'ألمنيوم',
            'خشب', 'بلاط', 'رخام', 'سيراميك', 'جرانيت'
        ]
        
        found_materials = [m for m in material_keywords if m in text.lower()]
        if found_materials:
            specs['material_type'] = found_materials[0]
        
        return specs
    
    def _detect_dependencies(self, text: str, item_data: Dict) -> List[Dict]:
        """اكتشاف التبعيات مع بنود أخرى"""
        
        dependencies = []
        
        # القواعد الأساسية للتبعيات
        dependency_rules = {
            'خرسانة': ['حفر', 'نجارة', 'حديد'],
            'بلاط': ['لياسة', 'دهان'],
            'دهان': ['لياسة', 'معجون'],
            'عزل': ['خرسانة', 'لياسة'],
            'تسليح': ['نجارة', 'شدة'],
            'سباكة': ['حفر', 'تمديد'],
            'كهرباء': ['حفر', 'تمديد']
        }
        
        text_lower = text.lower()
        
        for main_keyword, prereq_keywords in dependency_rules.items():
            if main_keyword in text_lower:
                for prereq in prereq_keywords:
                    dependencies.append({
                        'depends_on': prereq,
                        'relationship': 'prerequisite',
                        'confidence': 0.85
                    })
        
        return dependencies
    
    def _generate_warnings(self, item_data: Dict, extracted_info: Dict) -> List[str]:
        """توليد التحذيرات"""
        
        warnings = []
        
        # تحذير: كمية كبيرة جداً
        quantity = item_data.get('quantity', 0)
        if quantity > 10000:
            warnings.append(f"⚠️ كمية كبيرة جداً: {quantity} - يُنصح بمراجعة الكمية")
        
        # تحذير: وحدة غير واضحة
        unit = item_data.get('unit', '')
        if not unit or unit.strip() == '':
            warnings.append("⚠️ الوحدة غير محددة")
        
        # تحذير: لا توجد مواصفات تقنية
        if not extracted_info.get('strength') and 'خرسانة' in item_data.get('description', '').lower():
            warnings.append("⚠️ مقاومة الخرسانة غير محددة")
        
        # تحذير: بند معقد بدون تفاصيل كافية
        description = item_data.get('description', '')
        if len(description.split()) < 5:
            warnings.append("⚠️ الوصف قصير جداً - قد يحتاج لمزيد من التفاصيل")
        
        return warnings
    
    def analyze_batch(self, items: List[Dict]) -> Dict:
        """
        تحليل دفعة من البنود
        
        Args:
            items: قائمة البنود
            
        Returns:
            {
                'items_analysis': List[Dict],
                'summary': Dict,
                'recommendations': List[str]
            }
        """
        
        items_analysis = []
        complexity_distribution = {'high': 0, 'medium': 0, 'low': 0}
        all_warnings = []
        
        for item in items:
            analysis = self.analyze_item(item)
            items_analysis.append(analysis)
            
            # إحصائيات
            complexity_level = analysis['complexity_level']['level']
            complexity_distribution[complexity_level] += 1
            
            all_warnings.extend(analysis['warnings'])
        
        # ملخص التحليل
        summary = {
            'total_items': len(items),
            'complexity_distribution': complexity_distribution,
            'total_warnings': len(all_warnings),
            'average_complexity_score': round(
                sum(a['complexity_level']['score'] for a in items_analysis) / len(items_analysis)
                if items_analysis else 0, 2
            )
        }
        
        # توصيات
        recommendations = self._generate_recommendations(summary, items_analysis)
        
        return {
            'items_analysis': items_analysis,
            'summary': summary,
            'recommendations': recommendations
        }
    
    def _generate_recommendations(self, summary: Dict, items_analysis: List[Dict]) -> List[str]:
        """توليد التوصيات"""
        
        recommendations = []
        
        # توصيات بناءً على التعقيد
        high_complexity = summary['complexity_distribution']['high']
        if high_complexity > summary['total_items'] * 0.3:
            recommendations.append(
                f"📌 {high_complexity} بند معقد ({round(high_complexity/summary['total_items']*100)}%) - "
                "يُنصح بتخصيص موارد متخصصة"
            )
        
        # توصيات بناءً على التحذيرات
        if summary['total_warnings'] > 10:
            recommendations.append(
                f"📌 {summary['total_warnings']} تحذير - يُنصح بمراجعة البنود وتحديث المعلومات"
            )
        
        # توصيات بناءً على التبعيات
        items_with_deps = [a for a in items_analysis if len(a['dependencies']) > 2]
        if len(items_with_deps) > 5:
            recommendations.append(
                f"📌 {len(items_with_deps)} بند لديه تبعيات متعددة - "
                "يُنصح بتخطيط دقيق للجدول الزمني"
            )
        
        return recommendations
    
    def get_item_relationships(self, item_id: str, all_items: List[Dict]) -> Dict:
        """الحصول على علاقات بند محدد مع باقي البنود"""
        
        # البحث عن البند
        target_item = None
        for item in all_items:
            if item.get('id') == item_id:
                target_item = item
                break
        
        if not target_item:
            return {'error': 'Item not found'}
        
        # تحليل البند
        analysis = self.analyze_item(target_item)
        
        # البحث عن البنود المرتبطة
        related_items = []
        for dep in analysis['dependencies']:
            dep_keyword = dep['depends_on']
            for other_item in all_items:
                if other_item.get('id') != item_id:
                    if dep_keyword in other_item.get('description', '').lower():
                        related_items.append({
                            'item_id': other_item.get('id'),
                            'description': other_item.get('description'),
                            'relationship_type': dep['relationship'],
                            'confidence': dep['confidence']
                        })
        
        return {
            'item': target_item,
            'analysis': analysis,
            'related_items': related_items
        }


# اختبار سريع
if __name__ == "__main__":
    print("✅ ItemAnalyzer System Loaded")
    
    # اختبار بسيط
    analyzer = ItemAnalyzer("test.db")
    
    test_item = {
        'id': 'TEST-001',
        'description': 'صب خرسانة عادية 250 كجم/سم² للأساسات سمك 20 سم',
        'quantity': 150.5,
        'unit': 'م³'
    }
    
    result = analyzer.analyze_item(test_item)
    print(f"\n📊 نتيجة التحليل:")
    print(f"- مستوى التعقيد: {result['complexity_level']['level']}")
    print(f"- المعلومات المستخرجة: {len(result['extracted_info'])} عنصر")
    print(f"- التبعيات: {len(result['dependencies'])} تبعية")
    print(f"- التحذيرات: {len(result['warnings'])} تحذير")
