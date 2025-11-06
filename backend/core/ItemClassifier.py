"""
ItemClassifier System - نظام تصنيف البنود (3 طبقات)
يصنف بنود المقايسة إلى 3 طبقات: Tier1 (Category) > Tier2 (Subcategory) > Tier3 (Specification)
Rule-Based + Database-Driven
"""

import sqlite3
from typing import Dict, List, Tuple, Optional
import re


class ItemClassifier:
    """نظام تصنيف البنود في 3 طبقات"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.classification_cache = {}
        self._load_classification_dictionary()
    
    def _load_classification_dictionary(self):
        """تحميل قاموس التصنيف من قاعدة البيانات"""
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT keyword, tier1_category, tier2_subcategory, tier3_specification, 
                       priority, confidence_score, alternative_keywords
                FROM classification_dictionary
                ORDER BY priority DESC
            """)
            
            rows = cursor.fetchall()
            conn.close()
            
            self.dictionary = []
            for row in rows:
                entry = {
                    'keyword': row[0].lower(),
                    'tier1': row[1],
                    'tier2': row[2],
                    'tier3': row[3],
                    'priority': row[4],
                    'confidence': row[5],
                    'alternatives': row[6].split(',') if row[6] else []
                }
                self.dictionary.append(entry)
            
            print(f"✅ تم تحميل {len(self.dictionary)} كلمة مفتاحية للتصنيف")
            
        except Exception as e:
            print(f"❌ خطأ في تحميل قاموس التصنيف: {e}")
            self.dictionary = []
    
    def classify(self, item_description: str) -> Dict:
        """
        تصنيف بند واحد
        
        Args:
            item_description: وصف البند
            
        Returns:
            قاموس يحتوي على:
            - tier1_category: الفئة الرئيسية
            - tier2_subcategory: الفئة الفرعية
            - tier3_specification: المواصفة التفصيلية
            - confidence: درجة الثقة
            - matched_keywords: الكلمات المطابقة
        """
        
        # التحقق من الكاش
        cache_key = item_description.lower().strip()
        if cache_key in self.classification_cache:
            return self.classification_cache[cache_key]
        
        # تنظيف النص
        text = item_description.lower().strip()
        
        # البحث عن التطابقات
        matches = []
        for entry in self.dictionary:
            # البحث عن الكلمة المفتاحية الرئيسية
            if entry['keyword'] in text:
                matches.append({
                    'entry': entry,
                    'score': entry['priority'] * entry['confidence']
                })
            
            # البحث عن الكلمات البديلة
            for alt in entry['alternatives']:
                if alt.strip().lower() in text:
                    matches.append({
                        'entry': entry,
                        'score': entry['priority'] * entry['confidence'] * 0.9  # تقليل قليل للبدائل
                    })
        
        # اختيار أفضل تطابق
        if matches:
            best_match = max(matches, key=lambda x: x['score'])
            entry = best_match['entry']
            
            result = {
                'tier1_category': entry['tier1'],
                'tier2_subcategory': entry['tier2'],
                'tier3_specification': entry['tier3'],
                'confidence': entry['confidence'],
                'matched_keywords': [entry['keyword']],
                'classification_method': 'dictionary'
            }
        else:
            # تصنيف افتراضي
            result = {
                'tier1_category': 'أخرى',
                'tier2_subcategory': 'غير محدد',
                'tier3_specification': 'غير محدد',
                'confidence': 0.3,
                'matched_keywords': [],
                'classification_method': 'default'
            }
        
        # حفظ في الكاش
        self.classification_cache[cache_key] = result
        
        return result
    
    def classify_batch(self, items: List[str]) -> List[Dict]:
        """
        تصنيف دفعة من البنود
        
        Args:
            items: قائمة أوصاف البنود
            
        Returns:
            قائمة نتائج التصنيف
        """
        
        results = []
        for item in items:
            result = self.classify(item)
            results.append({
                'item': item,
                'classification': result
            })
        
        return results
    
    def get_statistics(self, classifications: List[Dict]) -> Dict:
        """حساب إحصائيات التصنيف"""
        
        total = len(classifications)
        classified = sum(1 for c in classifications if c['classification']['confidence'] > 0.5)
        
        tier1_counts = {}
        for c in classifications:
            tier1 = c['classification']['tier1_category']
            tier1_counts[tier1] = tier1_counts.get(tier1, 0) + 1
        
        return {
            'total_items': total,
            'classified': classified,
            'unclassified': total - classified,
            'classification_rate': round((classified / total * 100) if total > 0 else 0, 2),
            'tier1_distribution': tier1_counts
        }


# اختبار سريع
if __name__ == "__main__":
    # يتطلب قاعدة بيانات موجودة
    print("✅ ItemClassifier System Loaded")
    print("📝 يحتاج إلى قاعدة بيانات لإجراء اختبار كامل")
