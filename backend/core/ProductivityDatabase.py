"""
ProductivityDatabase System - قاعدة معدلات الإنتاجية
يوفر معدلات إنتاجية موثوقة لحساب المدد والموارد
Database-Driven System
"""

import sqlite3
from typing import Dict, List, Optional


class ProductivityDatabase:
    """قاعدة بيانات معدلات الإنتاجية"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
    
    def get_rate(self, activity_type: str, category: str = None) -> Optional[Dict]:
        """
        الحصول على معدل إنتاجية لنشاط معين
        
        Args:
            activity_type: نوع النشاط
            category: الفئة (اختياري)
            
        Returns:
            معلومات معدل الإنتاجية أو None
        """
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            if category:
                cursor.execute("""
                    SELECT activity_type, category, unit, rate_per_unit, crew_size, 
                           equipment_needed, complexity_factor, weather_factor
                    FROM productivity_rates
                    WHERE LOWER(activity_type) LIKE ? AND LOWER(category) LIKE ?
                    ORDER BY priority DESC
                    LIMIT 1
                """, (f'%{activity_type.lower()}%', f'%{category.lower()}%'))
            else:
                cursor.execute("""
                    SELECT activity_type, category, unit, rate_per_unit, crew_size, 
                           equipment_needed, complexity_factor, weather_factor
                    FROM productivity_rates
                    WHERE LOWER(activity_type) LIKE ?
                    ORDER BY priority DESC
                    LIMIT 1
                """, (f'%{activity_type.lower()}%',))
            
            row = cursor.fetchone()
            conn.close()
            
            if row:
                return {
                    'activity_type': row[0],
                    'category': row[1],
                    'unit': row[2],
                    'rate_per_unit': row[3],  # أيام/وحدة
                    'crew_size': row[4],
                    'equipment_needed': row[5],
                    'complexity_factor': row[6],
                    'weather_factor': row[7]
                }
            
            return None
            
        except Exception as e:
            print(f"❌ خطأ في الحصول على معدل الإنتاجية: {e}")
            return None
    
    def calculate_duration(self, activity_type: str, quantity: float, 
                          unit: str, category: str = None) -> Dict:
        """
        حساب المدة المطلوبة لنشاط
        
        Args:
            activity_type: نوع النشاط
            quantity: الكمية
            unit: الوحدة
            category: الفئة
            
        Returns:
            قاموس يحتوي على:
            - duration_days: المدة بالأيام
            - crew_size: حجم الطاقم
            - man_days: أيام العمل الإجمالية
            - rate_used: المعدل المستخدم
        """
        
        rate_info = self.get_rate(activity_type, category)
        
        if not rate_info:
            # معدل افتراضي
            return {
                'duration_days': max(1, round(quantity / 10)),  # افتراضي: 10 وحدات/يوم
                'crew_size': 4,
                'man_days': max(1, round(quantity / 10)) * 4,
                'rate_used': 'default',
                'confidence': 0.3
            }
        
        # حساب المدة
        base_duration = quantity * rate_info['rate_per_unit']
        
        # تطبيق معاملات التعقيد والطقس
        adjusted_duration = base_duration * rate_info['complexity_factor'] * rate_info['weather_factor']
        
        # تقريب لأعلى رقم صحيح
        duration_days = max(1, round(adjusted_duration))
        
        # حساب أيام العمل
        man_days = duration_days * rate_info['crew_size']
        
        return {
            'duration_days': duration_days,
            'crew_size': rate_info['crew_size'],
            'man_days': man_days,
            'equipment_needed': rate_info['equipment_needed'],
            'rate_used': f"{rate_info['activity_type']} - {rate_info['category']}",
            'confidence': 0.9
        }
    
    def get_all_rates(self) -> List[Dict]:
        """الحصول على جميع معدلات الإنتاجية"""
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT activity_type, category, unit, rate_per_unit, crew_size
                FROM productivity_rates
                ORDER BY category, activity_type
            """)
            
            rows = cursor.fetchall()
            conn.close()
            
            rates = []
            for row in rows:
                rates.append({
                    'activity_type': row[0],
                    'category': row[1],
                    'unit': row[2],
                    'rate_per_unit': row[3],
                    'crew_size': row[4]
                })
            
            return rates
            
        except Exception as e:
            print(f"❌ خطأ في الحصول على المعدلات: {e}")
            return []


# اختبار سريع
if __name__ == "__main__":
    print("✅ ProductivityDatabase System Loaded")
    print("📝 يحتاج إلى قاعدة بيانات لإجراء اختبار كامل")
