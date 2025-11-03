"""
نظام نوفل الهندسي - Backend API
Noufal Engineering System - Backend API
Flask Server
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pathlib import Path
import sys

# إضافة المسار
sys.path.append(str(Path(__file__).parent))

# استيراد الأنظمة
from core.ExcelIntelligence import ExcelIntelligence
from core.ItemClassifier import ItemClassifier
from core.ProductivityDatabase import ProductivityDatabase

# إنشاء التطبيق
app = Flask(__name__)
CORS(app)  # السماح بطلبات من Frontend

# التكوين
BASE_DIR = Path(__file__).parent
app.config['UPLOAD_FOLDER'] = BASE_DIR.parent / 'uploads'
app.config['DATABASE'] = BASE_DIR / 'database' / 'noufal.db'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB

# تهيئة الأنظمة
excel_intel = ExcelIntelligence()
classifier = ItemClassifier(str(app.config['DATABASE']))
productivity_db = ProductivityDatabase(str(app.config['DATABASE']))

print("\n" + "="*60)
print("🚀 نظام نوفل الهندسي - NOUFAL Engineering System")
print("="*60)
print(f"✅ Excel Intelligence: Ready")
print(f"✅ Item Classifier: Ready ({len(classifier.dictionary)} keywords)")
print(f"✅ Productivity Database: Ready")
print(f"✅ Database: {app.config['DATABASE']}")
print("="*60 + "\n")


# ============================================
# API Endpoints
# ============================================

@app.route('/')
def home():
    """الصفحة الرئيسية"""
    return jsonify({
        'message': 'نظام نوفال الهندسي - NOUFAL Engineering System',
        'status': 'running',
        'version': '1.0.0',
        'systems': {
            'excel_intelligence': True,
            'item_classifier': True,
            'productivity_database': True
        }
    })


@app.route('/api/health', methods=['GET'])
def health_check():
    """فحص صحة التطبيق"""
    return jsonify({
        'status': 'healthy',
        'message': 'نظام نوفل الهندسي جاهز! 🚀',
        'systems': {
            'excel_intelligence': True,
            'item_classifier': True,
            'productivity_database': True
        }
    })


@app.route('/api/upload', methods=['POST'])
def upload_file():
    """رفع ملف Excel"""
    
    if 'file' not in request.files:
        return jsonify({'error': 'لا يوجد ملف'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'اسم الملف فارغ'}), 400
    
    # حفظ الملف
    filename = file.filename
    file_path = app.config['UPLOAD_FOLDER'] / filename
    app.config['UPLOAD_FOLDER'].mkdir(parents=True, exist_ok=True)
    file.save(file_path)
    
    # تحليل الملف
    try:
        # اكتشاف نوع الملف
        discovery = excel_intel.discover_file_type(str(file_path))
        
        # استخراج البيانات
        data = excel_intel.extract_data(str(file_path), discovery)
        
        # إذا كان BOQ، قم بتصنيف البنود
        if discovery['file_type'] == 'boq' and 'items' in data:
            classified_items = []
            for item in data['items']:
                classification = classifier.classify(item['description'])
                item['classification'] = classification
                classified_items.append(item)
            
            data['items'] = classified_items
            data['classification_stats'] = classifier.get_statistics(
                [{'classification': c['classification']} for c in classified_items]
            )
        
        return jsonify({
            'status': 'success',
            'file': filename,
            'discovery': discovery,
            'data': data
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500


@app.route('/api/classify', methods=['POST'])
def classify_items():
    """تصنيف بنود"""
    
    data = request.json
    items = data.get('items', [])
    
    if not items:
        return jsonify({'error': 'لا توجد بنود للتصنيف'}), 400
    
    # تصنيف البنود
    results = classifier.classify_batch(items)
    stats = classifier.get_statistics(results)
    
    return jsonify({
        'status': 'success',
        'results': results,
        'statistics': stats
    })


@app.route('/api/calculate-duration', methods=['POST'])
def calculate_duration():
    """حساب مدة نشاط"""
    
    data = request.json
    activity_type = data.get('activity_type', '')
    quantity = float(data.get('quantity', 0))
    unit = data.get('unit', '')
    category = data.get('category', None)
    
    if not activity_type or quantity <= 0:
        return jsonify({'error': 'بيانات غير صحيحة'}), 400
    
    # حساب المدة
    result = productivity_db.calculate_duration(activity_type, quantity, unit, category)
    
    return jsonify({
        'status': 'success',
        'result': result
    })


@app.route('/api/productivity-rates', methods=['GET'])
def get_productivity_rates():
    """الحصول على جميع معدلات الإنتاجية"""
    
    rates = productivity_db.get_all_rates()
    
    return jsonify({
        'status': 'success',
        'rates': rates,
        'total': len(rates)
    })


@app.route('/api/analyze-boq', methods=['POST'])
def analyze_boq():
    """تحليل BOQ كامل"""
    
    data = request.json
    items = data.get('items', [])
    
    if not items:
        return jsonify({'error': 'لا توجد بنود للتحليل'}), 400
    
    analyzed_items = []
    
    for item in items:
        # تصنيف البند
        classification = classifier.classify(item.get('description', ''))
        
        # حساب المدة
        duration_result = productivity_db.calculate_duration(
            classification['tier2_subcategory'],
            float(item.get('quantity', 0)),
            item.get('unit', ''),
            classification['tier1_category']
        )
        
        analyzed_items.append({
            'item': item,
            'classification': classification,
            'duration': duration_result
        })
    
    return jsonify({
        'status': 'success',
        'analyzed_items': analyzed_items,
        'total': len(analyzed_items)
    })


# ============================================
# تشغيل التطبيق
# ============================================

if __name__ == '__main__':
    # إنشاء المجلدات المطلوبة
    app.config['UPLOAD_FOLDER'].mkdir(parents=True, exist_ok=True)
    
    # تشغيل الخادم
    print("\n🌐 Flask Server Starting...")
    print(f"📍 URL: http://localhost:5000")
    print(f"📂 Upload Folder: {app.config['UPLOAD_FOLDER']}")
    print("\n")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
