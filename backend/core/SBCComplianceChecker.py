"""
SBCComplianceChecker System - نظام فحص الامتثال لكود البناء السعودي (SBC)
يقوم بفحص المواصفات الفنية والتأكد من مطابقتها لـ:
- كود البناء السعودي (SBC)
- المواصفات القياسية السعودية (SASO)
- المتطلبات الفنية والهندسية
"""

import sqlite3
from typing import Dict, List, Tuple, Optional
import re


class SBCComplianceChecker:
    """نظام فحص الامتثال لكود البناء السعودي"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.sbc_rules = self._load_sbc_rules()
        
        print("✅ SBCComplianceChecker System Initialized")
    
    def _load_sbc_rules(self) -> Dict:
        """تحميل قواعد كود البناء السعودي"""
        
        # قواعد أساسية من كود البناء السعودي
        rules = {
            # SBC 301: متطلبات الحمل والقوى
            'structural': {
                'concrete_strength': {
                    'min': 20,  # نيوتن/مم²
                    'max': 80,
                    'recommended': [25, 30, 35, 40],
                    'sbc_code': 'SBC 301'
                },
                'steel_grade': {
                    'allowed': ['Grade 40', 'Grade 60', 'B500B'],
                    'sbc_code': 'SBC 301'
                },
                'column_min_dimension': {
                    'value': 200,  # مم
                    'sbc_code': 'SBC 301'
                },
                'beam_min_width': {
                    'value': 200,  # مم
                    'sbc_code': 'SBC 301'
                },
                'slab_min_thickness': {
                    'residential': 120,  # مم
                    'commercial': 150,
                    'sbc_code': 'SBC 301'
                }
            },
            
            # SBC 304: متطلبات الخرسانة
            'concrete': {
                'cement_content_min': {
                    'normal': 300,  # كجم/م³
                    'exposed': 350,
                    'sbc_code': 'SBC 304'
                },
                'water_cement_ratio': {
                    'max': 0.55,
                    'durability_max': 0.50,
                    'sbc_code': 'SBC 304'
                },
                'slump': {
                    'min': 25,  # مم
                    'max': 150,
                    'sbc_code': 'SBC 304'
                },
                'curing_duration': {
                    'min_days': 7,
                    'hot_weather': 14,
                    'sbc_code': 'SBC 304'
                }
            },
            
            # SBC 303: متطلبات البناء بالطوب والبلوك
            'masonry': {
                'min_thickness': {
                    'exterior': 200,  # مم
                    'interior': 100,
                    'sbc_code': 'SBC 303'
                },
                'mortar_strength': {
                    'min': 5,  # نيوتن/مم²
                    'sbc_code': 'SBC 303'
                },
                'joint_thickness': {
                    'horizontal': 10,  # مم
                    'vertical': 10,
                    'sbc_code': 'SBC 303'
                }
            },
            
            # SBC 501: متطلبات الحريق
            'fire_safety': {
                'fire_resistance_rating': {
                    'residential_walls': 1,  # ساعة
                    'commercial_walls': 2,
                    'structural_elements': 2,
                    'sbc_code': 'SBC 501'
                },
                'fire_exits': {
                    'min_width': 900,  # مم
                    'max_travel_distance': 45000,  # مم
                    'sbc_code': 'SBC 501'
                }
            },
            
            # SBC 601: متطلبات الطاقة
            'energy': {
                'wall_insulation': {
                    'min_r_value': 2.1,  # م².ك/واط
                    'sbc_code': 'SBC 601'
                },
                'roof_insulation': {
                    'min_r_value': 3.5,
                    'sbc_code': 'SBC 601'
                },
                'window_shgc': {
                    'max': 0.25,  # معامل اكتساب الحرارة الشمسية
                    'sbc_code': 'SBC 601'
                }
            },
            
            # SBC 701: متطلبات الصحة والسلامة
            'health_safety': {
                'ceiling_height': {
                    'min': 2400,  # مم
                    'sbc_code': 'SBC 701'
                },
                'ventilation': {
                    'min_opening_area_ratio': 0.05,  # نسبة من مساحة الأرضية
                    'sbc_code': 'SBC 701'
                },
                'lighting': {
                    'min_opening_area_ratio': 0.10,
                    'sbc_code': 'SBC 701'
                }
            }
        }
        
        return rules
    
    def check_compliance(self, item: Dict, category: str = 'all') -> Dict:
        """
        فحص امتثال بند واحد
        
        Args:
            item: البند المراد فحصه
            category: الفئة (structural, concrete, masonry, all)
            
        Returns:
            نتيجة الفحص مع التفاصيل
        """
        
        results = {
            'item_id': item.get('id'),
            'description': item.get('description'),
            'compliance_status': 'pass',  # pass, fail, warning, not_applicable
            'checks': [],
            'violations': [],
            'warnings': [],
            'recommendations': []
        }
        
        # تحديد نوع البند
        item_type = self._identify_item_type(item)
        
        if category == 'all':
            categories_to_check = self.sbc_rules.keys()
        else:
            categories_to_check = [category] if category in self.sbc_rules else []
        
        # تنفيذ الفحوصات
        for cat in categories_to_check:
            if cat == item_type or category == 'all':
                checks = self._run_category_checks(item, cat)
                results['checks'].extend(checks)
        
        # تجميع المخالفات والتحذيرات
        for check in results['checks']:
            if check['status'] == 'fail':
                results['violations'].append(check)
                results['compliance_status'] = 'fail'
            elif check['status'] == 'warning':
                results['warnings'].append(check)
                if results['compliance_status'] == 'pass':
                    results['compliance_status'] = 'warning'
        
        # توليد التوصيات
        results['recommendations'] = self._generate_recommendations(results)
        
        return results
    
    def _identify_item_type(self, item: Dict) -> str:
        """تحديد نوع البند"""
        
        description = item.get('description', '').lower()
        
        type_keywords = {
            'structural': ['أساسات', 'أعمدة', 'كمرات', 'بلاطات', 'هيكل'],
            'concrete': ['خرسانة', 'صب'],
            'masonry': ['بناء', 'طوب', 'بلوك'],
            'fire_safety': ['حريق', 'مقاوم للحريق', 'عزل حراري'],
            'energy': ['عزل', 'عازل', 'طاقة'],
            'health_safety': ['تهوية', 'إضاءة', 'سلامة']
        }
        
        for item_type, keywords in type_keywords.items():
            if any(keyword in description for keyword in keywords):
                return item_type
        
        return 'general'
    
    def _run_category_checks(self, item: Dict, category: str) -> List[Dict]:
        """تنفيذ فحوصات فئة محددة"""
        
        checks = []
        rules = self.sbc_rules.get(category, {})
        description = item.get('description', '').lower()
        
        if category == 'structural':
            # فحص مقاومة الخرسانة
            concrete_strength = self._extract_concrete_strength(description)
            if concrete_strength:
                min_strength = rules['concrete_strength']['min']
                max_strength = rules['concrete_strength']['max']
                
                if concrete_strength < min_strength:
                    checks.append({
                        'rule': 'concrete_strength',
                        'sbc_code': rules['concrete_strength']['sbc_code'],
                        'status': 'fail',
                        'message': f"مقاومة الخرسانة {concrete_strength} أقل من الحد الأدنى {min_strength} نيوتن/مم²",
                        'actual': concrete_strength,
                        'required': min_strength
                    })
                elif concrete_strength > max_strength:
                    checks.append({
                        'rule': 'concrete_strength',
                        'sbc_code': rules['concrete_strength']['sbc_code'],
                        'status': 'warning',
                        'message': f"مقاومة الخرسانة {concrete_strength} أعلى من الحد الأقصى {max_strength} نيوتن/مم²",
                        'actual': concrete_strength,
                        'required': max_strength
                    })
                else:
                    checks.append({
                        'rule': 'concrete_strength',
                        'sbc_code': rules['concrete_strength']['sbc_code'],
                        'status': 'pass',
                        'message': f"مقاومة الخرسانة {concrete_strength} مطابقة للكود",
                        'actual': concrete_strength
                    })
            
            # فحص أبعاد الأعمدة
            if 'عمود' in description or 'أعمدة' in description:
                dimensions = self._extract_dimensions(description)
                min_dim = rules['column_min_dimension']['value']
                
                if dimensions:
                    min_actual = min(dimensions)
                    if min_actual < min_dim:
                        checks.append({
                            'rule': 'column_min_dimension',
                            'sbc_code': rules['column_min_dimension']['sbc_code'],
                            'status': 'fail',
                            'message': f"أصغر بُعد للعمود {min_actual} مم أقل من الحد الأدنى {min_dim} مم",
                            'actual': min_actual,
                            'required': min_dim
                        })
                    else:
                        checks.append({
                            'rule': 'column_min_dimension',
                            'sbc_code': rules['column_min_dimension']['sbc_code'],
                            'status': 'pass',
                            'message': f"أبعاد العمود مطابقة للكود",
                            'actual': min_actual
                        })
        
        elif category == 'concrete':
            # فحص محتوى الأسمنت
            if 'خرسانة' in description:
                checks.append({
                    'rule': 'cement_content',
                    'sbc_code': rules['cement_content_min']['sbc_code'],
                    'status': 'pass',
                    'message': f"يجب التأكد من محتوى الأسمنت (حد أدنى {rules['cement_content_min']['normal']} كجم/م³)"
                })
            
            # فحص مدة المعالجة
            if 'صب' in description or 'خرسانة' in description:
                checks.append({
                    'rule': 'curing_duration',
                    'sbc_code': rules['curing_duration']['sbc_code'],
                    'status': 'pass',
                    'message': f"مدة المعالجة المطلوبة: {rules['curing_duration']['min_days']} أيام كحد أدنى"
                })
        
        elif category == 'masonry':
            # فحص سماكة الجدران
            thickness = self._extract_thickness(description)
            if thickness and ('جدار' in description or 'بناء' in description):
                if 'خارجي' in description:
                    min_thickness = rules['min_thickness']['exterior']
                else:
                    min_thickness = rules['min_thickness']['interior']
                
                if thickness < min_thickness:
                    checks.append({
                        'rule': 'min_thickness',
                        'sbc_code': rules['min_thickness']['sbc_code'],
                        'status': 'fail',
                        'message': f"سماكة الجدار {thickness} مم أقل من الحد الأدنى {min_thickness} مم",
                        'actual': thickness,
                        'required': min_thickness
                    })
                else:
                    checks.append({
                        'rule': 'min_thickness',
                        'sbc_code': rules['min_thickness']['sbc_code'],
                        'status': 'pass',
                        'message': f"سماكة الجدار مطابقة للكود",
                        'actual': thickness
                    })
        
        return checks
    
    def _extract_concrete_strength(self, text: str) -> Optional[int]:
        """استخراج مقاومة الخرسانة من النص"""
        
        # أنماط مختلفة لمقاومة الخرسانة
        patterns = [
            r'(\d+)\s*نيوتن',
            r'(\d+)\s*n/mm',
            r'(\d+)\s*كجم/سم',
            r'خرسانة\s+(\d+)',
            r'مقاومة\s+(\d+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return int(match.group(1))
        
        return None
    
    def _extract_dimensions(self, text: str) -> Optional[Tuple[int, int]]:
        """استخراج الأبعاد من النص"""
        
        pattern = r'(\d+)\s*[xXxX×]\s*(\d+)'
        match = re.search(pattern, text)
        
        if match:
            return (int(match.group(1)), int(match.group(2)))
        
        return None
    
    def _extract_thickness(self, text: str) -> Optional[int]:
        """استخراج السماكة من النص"""
        
        pattern = r'سمك\s*(\d+)'
        match = re.search(pattern, text)
        
        if match:
            thickness = int(match.group(1))
            # تحويل إلى مم إذا كان بالسم
            if thickness < 50:
                thickness *= 10
            return thickness
        
        return None
    
    def _generate_recommendations(self, results: Dict) -> List[str]:
        """توليد التوصيات بناءً على نتائج الفحص"""
        
        recommendations = []
        
        if results['violations']:
            recommendations.append(
                f"⚠️ يوجد {len(results['violations'])} مخالفة يجب تصحيحها قبل التنفيذ"
            )
        
        if results['warnings']:
            recommendations.append(
                f"📌 يوجد {len(results['warnings'])} تحذير يُنصح بمراجعته"
            )
        
        # توصيات محددة بناءً على نوع المخالفات
        violation_types = [v['rule'] for v in results['violations']]
        
        if 'concrete_strength' in violation_types:
            recommendations.append(
                "💡 يُنصح باستشارة مهندس إنشائي لتحديد المقاومة المناسبة"
            )
        
        if 'min_thickness' in violation_types:
            recommendations.append(
                "💡 مراجعة سماكة الجدران لضمان الثبات الإنشائي والعزل"
            )
        
        return recommendations
    
    def check_batch(self, items: List[Dict], category: str = 'all') -> Dict:
        """
        فحص دفعة من البنود
        
        Args:
            items: قائمة البنود
            category: الفئة المراد فحصها
            
        Returns:
            ملخص نتائج الفحص
        """
        
        results = []
        total_violations = 0
        total_warnings = 0
        
        for item in items:
            result = self.check_compliance(item, category)
            results.append(result)
            total_violations += len(result['violations'])
            total_warnings += len(result['warnings'])
        
        # حساب نسبة الامتثال
        compliant_items = sum(1 for r in results if r['compliance_status'] == 'pass')
        compliance_rate = (compliant_items / len(items) * 100) if items else 0
        
        return {
            'total_items': len(items),
            'compliant_items': compliant_items,
            'non_compliant_items': len(items) - compliant_items,
            'compliance_rate': round(compliance_rate, 2),
            'total_violations': total_violations,
            'total_warnings': total_warnings,
            'items_results': results
        }
    
    def generate_compliance_report(self, batch_results: Dict) -> str:
        """توليد تقرير امتثال شامل"""
        
        report = []
        report.append("=" * 80)
        report.append("تقرير الامتثال لكود البناء السعودي (SBC)")
        report.append("=" * 80)
        report.append("")
        
        report.append(f"📊 ملخص الفحص:")
        report.append(f"   - إجمالي البنود: {batch_results['total_items']}")
        report.append(f"   - البنود المطابقة: {batch_results['compliant_items']}")
        report.append(f"   - البنود غير المطابقة: {batch_results['non_compliant_items']}")
        report.append(f"   - نسبة الامتثال: {batch_results['compliance_rate']}%")
        report.append(f"   - إجمالي المخالفات: {batch_results['total_violations']}")
        report.append(f"   - إجمالي التحذيرات: {batch_results['total_warnings']}")
        report.append("")
        
        if batch_results['total_violations'] > 0:
            report.append("⚠️ المخالفات:")
            report.append("-" * 80)
            for item_result in batch_results['items_results']:
                if item_result['violations']:
                    report.append(f"   البند: {item_result['description']}")
                    for violation in item_result['violations']:
                        report.append(f"      - {violation['message']} [{violation['sbc_code']}]")
                    report.append("")
        
        report.append("=" * 80)
        
        return "\n".join(report)


# اختبار سريع
if __name__ == "__main__":
    print("✅ SBCComplianceChecker System Loaded")
    
    # اختبار بسيط
    checker = SBCComplianceChecker("test.db")
    
    test_item = {
        'id': 'TEST-001',
        'description': 'صب خرسانة عادية 15 نيوتن/مم² للأساسات',
        'quantity': 100
    }
    
    result = checker.check_compliance(test_item, 'structural')
    print(f"\n📊 نتيجة الفحص:")
    print(f"- حالة الامتثال: {result['compliance_status']}")
    print(f"- عدد الفحوصات: {len(result['checks'])}")
    print(f"- المخالفات: {len(result['violations'])}")
    print(f"- التحذيرات: {len(result['warnings'])}")
