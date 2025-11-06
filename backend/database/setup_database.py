"""
إعداد قاعدة البيانات - Database Setup
ينشئ قاعدة البيانات ويملأها بالبيانات الأولية
"""

import sqlite3
from pathlib import Path
import sys

# إضافة المسار لاستيراد الوحدات
sys.path.append(str(Path(__file__).parent.parent))


def create_database():
    """إنشاء قاعدة البيانات وتنفيذ schema.sql"""
    
    print("\n" + "="*60)
    print("🚀 بدء إنشاء قاعدة البيانات - Database Setup")
    print("="*60 + "\n")
    
    # المسارات
    db_dir = Path(__file__).parent
    schema_path = db_dir / 'schema.sql'
    db_path = db_dir / 'noufal.db'
    
    # قراءة ملف schema.sql
    print("📖 قراءة ملف schema.sql...")
    with open(schema_path, 'r', encoding='utf-8') as f:
        schema_sql = f.read()
    
    # إنشاء قاعدة البيانات
    print(f"🗄️  إنشاء قاعدة البيانات: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # تنفيذ schema
    print("⚙️  تنفيذ Schema...")
    cursor.executescript(schema_sql)
    
    print("✅ تم إنشاء قاعدة البيانات بنجاح!")
    print(f"📍 المسار: {db_path}")
    
    # عرض الجداول المُنشأة
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    print(f"\n📊 الجداول المُنشأة ({len(tables)}):")
    for table in tables:
        print(f"   - {table[0]}")
    
    conn.commit()
    conn.close()
    
    print("\n" + "="*60)
    print("✅ اكتمل إعداد قاعدة البيانات بنجاح!")
    print("="*60 + "\n")
    
    return db_path


if __name__ == '__main__':
    create_database()
