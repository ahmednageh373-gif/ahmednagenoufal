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
from core.ItemAnalyzer import ItemAnalyzer
from core.RelationshipEngine import RelationshipEngine
from core.ComprehensiveScheduler import ComprehensiveScheduler
from core.SBCComplianceChecker import SBCComplianceChecker
from core.SCurveGenerator import SCurveGenerator
from core.RequestParser import RequestParser
from core.RequestExecutor import RequestExecutor

# إنشاء التطبيق
app = Flask(__name__)
CORS(app)  # السماح بطلبات من Frontend

# التكوين
BASE_DIR = Path(__file__).parent
app.config['UPLOAD_FOLDER'] = BASE_DIR.parent / 'uploads'
app.config['DATABASE'] = BASE_DIR / 'database' / 'noufal.db'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB

# تهيئة الأنظمة
db_path = str(app.config['DATABASE'])
excel_intel = ExcelIntelligence()
classifier = ItemClassifier(db_path)
productivity_db = ProductivityDatabase(db_path)
item_analyzer = ItemAnalyzer(db_path)
relationship_engine = RelationshipEngine(db_path)
scheduler = ComprehensiveScheduler(db_path)
compliance_checker = SBCComplianceChecker(db_path)
s_curve_generator = SCurveGenerator(db_path)
request_parser = RequestParser()
request_executor = RequestExecutor(db_path)

print("\n" + "="*80)
print("🚀 نظام نوفل الهندسي - NOUFAL Engineering System - المتكامل")
print("="*80)
print(f"✅ System 01: Excel Intelligence - Ready")
print(f"✅ System 02: Item Classifier - Ready ({len(classifier.dictionary)} keywords)")
print(f"✅ System 03: Productivity Database - Ready")
print(f"✅ System 04: Item Analyzer - Ready")
print(f"✅ System 05: Relationship Engine - Ready")
print(f"✅ System 06: Comprehensive Scheduler - Ready")
print(f"✅ System 07: SBC Compliance Checker - Ready")
print(f"✅ System 08: S-Curve Generator - Ready")
print(f"✅ System 09: Request Parser - Ready")
print(f"✅ System 10: Request Executor - Ready")
print(f"📁 Database: {app.config['DATABASE']}")
print("="*80 + "\n")


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
            'productivity_database': True,
            'item_analyzer': True,
            'relationship_engine': True,
            'scheduler': True,
            'compliance_checker': True,
            's_curve_generator': True,
            'request_parser': True,
            'request_executor': True
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
            'productivity_database': True,
            'item_analyzer': True,
            'relationship_engine': True,
            'scheduler': True,
            'compliance_checker': True,
            's_curve_generator': True,
            'request_parser': True,
            'request_executor': True
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
# الأنظمة الجديدة - API Endpoints
# ============================================

@app.route('/api/analyze-items', methods=['POST'])
def analyze_items_deep():
    """تحليل عميق للبنود"""
    
    data = request.json
    items = data.get('items', [])
    
    if not items:
        return jsonify({'error': 'لا توجد بنود للتحليل'}), 400
    
    # تحليل شامل
    analysis = item_analyzer.analyze_batch(items)
    
    return jsonify({
        'status': 'success',
        'analysis': analysis
    })


@app.route('/api/build-relationships', methods=['POST'])
def build_relationships():
    """بناء شبكة التبعيات"""
    
    data = request.json
    activities = data.get('activities', [])
    
    if not activities:
        return jsonify({'error': 'لا توجد أنشطة'}), 400
    
    # بناء الشبكة
    graph = relationship_engine.build_dependency_graph(activities)
    critical_path = relationship_engine.get_critical_path()
    
    return jsonify({
        'status': 'success',
        'graph': {
            activity_id: {
                'description': node['activity'].get('description'),
                'level': node['level'],
                'critical': node.get('critical', False),
                'early_start': node.get('early_start'),
                'early_finish': node.get('early_finish')
            }
            for activity_id, node in graph.items()
        },
        'critical_path': critical_path
    })


@app.route('/api/generate-schedule', methods=['POST'])
def generate_schedule():
    """توليد جدول زمني شامل"""
    
    data = request.json
    activities = data.get('activities', [])
    start_date = data.get('start_date', '2025-01-01')
    constraints = data.get('constraints', {})
    
    if not activities:
        return jsonify({'error': 'لا توجد أنشطة'}), 400
    
    # توليد الجدول
    schedule = scheduler.generate_schedule(activities, start_date, constraints)
    
    return jsonify({
        'status': 'success',
        'schedule': schedule
    })


@app.route('/api/gantt-data', methods=['POST'])
def get_gantt_data():
    """الحصول على بيانات Gantt Chart"""
    
    data = request.json
    schedule = data.get('schedule', {})
    
    if not schedule:
        return jsonify({'error': 'لا يوجد جدول'}), 400
    
    # تحويل إلى صيغة Gantt
    gantt_data = scheduler.export_to_gantt_data(schedule)
    
    return jsonify({
        'status': 'success',
        'gantt_data': gantt_data
    })


@app.route('/api/check-sbc-compliance', methods=['POST'])
def check_sbc_compliance():
    """فحص الامتثال لكود البناء السعودي"""
    
    data = request.json
    items = data.get('items', [])
    category = data.get('category', 'all')
    
    if not items:
        return jsonify({'error': 'لا توجد بنود للفحص'}), 400
    
    # فحص الامتثال
    results = compliance_checker.check_batch(items, category)
    report = compliance_checker.generate_compliance_report(results)
    
    return jsonify({
        'status': 'success',
        'results': results,
        'report': report
    })


@app.route('/api/generate-s-curve', methods=['POST'])
def generate_s_curve():
    """توليد منحنى S"""
    
    data = request.json
    schedule = data.get('schedule', {})
    interval = data.get('interval', 'weekly')
    
    if not schedule:
        return jsonify({'error': 'لا يوجد جدول'}), 400
    
    # توليد منحنى S
    s_curve = s_curve_generator.generate_s_curve(schedule, interval)
    
    return jsonify({
        'status': 'success',
        's_curve': s_curve
    })


@app.route('/api/financial-s-curve', methods=['POST'])
def generate_financial_s_curve():
    """توليد منحنى S المالي"""
    
    data = request.json
    schedule = data.get('schedule', {})
    item_costs = data.get('item_costs', {})
    interval = data.get('interval', 'monthly')
    
    if not schedule or not item_costs:
        return jsonify({'error': 'بيانات غير كاملة'}), 400
    
    # توليد منحنى S المالي
    financial_curve = s_curve_generator.generate_financial_s_curve(
        schedule, item_costs, interval
    )
    
    return jsonify({
        'status': 'success',
        'financial_curve': financial_curve
    })


@app.route('/api/parse-request', methods=['POST'])
def parse_request():
    """تحليل طلب لغوي"""
    
    data = request.json
    request_text = data.get('request', '')
    
    if not request_text:
        return jsonify({'error': 'لا يوجد طلب'}), 400
    
    # تحليل الطلب
    parsed = request_parser.parse(request_text)
    validation = request_parser.validate_command(parsed)
    
    return jsonify({
        'status': 'success',
        'parsed': parsed,
        'validation': validation
    })


@app.route('/api/execute-request', methods=['POST'])
def execute_request():
    """تنفيذ طلب لغوي"""
    
    data = request.json
    request_text = data.get('request', '')
    context = data.get('context', {})
    
    if not request_text:
        return jsonify({'error': 'لا يوجد طلب'}), 400
    
    # تنفيذ الطلب
    result = request_executor.execute(request_text, context)
    
    return jsonify(result)


@app.route('/api/system-status', methods=['GET'])
def system_status():
    """حالة جميع الأنظمة"""
    
    status = request_executor.get_system_status()
    
    return jsonify({
        'status': 'success',
        'system_status': status
    })


@app.route('/api/suggestions', methods=['POST'])
def get_suggestions():
    """الحصول على اقتراحات للطلبات"""
    
    data = request.json
    partial_text = data.get('text', '')
    
    suggestions = request_parser.generate_suggestions(partial_text)
    
    return jsonify({
        'status': 'success',
        'suggestions': suggestions
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
