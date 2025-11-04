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
from core.AutomationEngine import AutomationEngine
from core.AutomationTemplates import AutomationTemplates
# New integrations from CivilConcept
from core.quick_estimator import (
    QuickEstimator, 
    EstimateInput, 
    Region, 
    BuildingType, 
    FinishLevel
)
from core.unit_converter import (
    UnitConverter,
    LengthUnit,
    AreaUnit,
    VolumeUnit,
    WeightUnit,
    PressureUnit,
    ForceUnit,
    TemperatureUnit,
    IrregularLandCalculator
)
# House Plan Extraction
from core.house_plan_extractor import (
    HousePlanScraper,
    HousePlanAnalyzer,
    HousePlanData
)
from core.house_plan_integrator import HousePlanIntegrator

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
automation_engine = AutomationEngine(db_path)
automation_templates = AutomationTemplates()
# New systems
quick_estimator = QuickEstimator()
land_calculator = IrregularLandCalculator()
house_plan_scraper = HousePlanScraper()
house_plan_integrator = HousePlanIntegrator()

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
print(f"✅ System 11: Automation Engine - Ready")
print(f"✅ System 12: Automation Templates - Ready")
print(f"✅ System 13: Quick Estimator - Ready (CivilConcept Integration)")
print(f"✅ System 14: Unit Converter - Ready (Metric ↔ Imperial)")
print(f"✅ System 15: Land Calculator - Ready (Irregular plots)")
print(f"✅ System 16: House Plan Scraper - Ready (Web extraction)")
print(f"✅ System 17: House Plan Integrator - Ready (Auto BOQ from plans)")
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
# Automation APIs
# ============================================

@app.route('/api/automations', methods=['GET'])
def get_automations():
    """Get all automations"""
    try:
        board_id = request.args.get('board_id')
        automations = automation_engine.get_all_automations(board_id)
        
        return jsonify({
            'success': True,
            'automations': automations,
            'count': len(automations)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/automations', methods=['POST'])
def create_automation():
    """Create new automation"""
    try:
        automation_data = request.json
        result = automation_engine.create_automation(automation_data)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/automations/<int:automation_id>', methods=['PUT'])
def toggle_automation(automation_id):
    """Toggle automation on/off"""
    try:
        is_active = request.json.get('is_active', True)
        result = automation_engine.toggle_automation(automation_id, is_active)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/automations/<int:automation_id>', methods=['DELETE'])
def delete_automation(automation_id):
    """Delete automation"""
    try:
        result = automation_engine.delete_automation(automation_id)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/automations/trigger', methods=['POST'])
def trigger_automation():
    """Manually trigger automation event"""
    try:
        event_type = request.json.get('event_type')
        event_data = request.json.get('event_data', {})
        
        results = automation_engine.trigger_event(event_type, event_data)
        
        return jsonify({
            'success': True,
            'results': results,
            'triggered_count': len([r for r in results if r.get('triggered')])
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/automations/stats', methods=['GET'])
def get_automation_stats():
    """Get automation statistics"""
    try:
        automation_id = request.args.get('automation_id', type=int)
        stats = automation_engine.get_automation_stats(automation_id)
        
        return jsonify({
            'success': True,
            'stats': stats
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/automation-templates', methods=['GET'])
def get_automation_templates():
    """Get all automation templates"""
    try:
        category = request.args.get('category')
        
        if category:
            all_templates = automation_templates.get_all_templates()
            templates = all_templates.get(category, [])
        else:
            templates = automation_templates.get_all_templates()
        
        return jsonify({
            'success': True,
            'templates': templates
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/automation-templates/<template_id>', methods=['GET'])
def get_template_by_id(template_id):
    """Get specific template by ID"""
    try:
        template = automation_templates.get_template_by_id(template_id)
        
        if template:
            return jsonify({
                'success': True,
                'template': template
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Template not found'
            }), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/automation-templates/search', methods=['GET'])
def search_templates():
    """Search automation templates"""
    try:
        query = request.args.get('q', '')
        templates = automation_templates.search_templates(query)
        
        return jsonify({
            'success': True,
            'templates': templates,
            'count': len(templates)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================
# Quick Tools APIs - أدوات سريعة (CivilConcept Integration)
# ============================================

@app.route('/api/quick-estimate', methods=['POST'])
def quick_estimate():
    """
    تقدير سريع للمشروع - Quick preliminary project estimate
    
    Body params:
        total_area_sqm (float): Total area in square meters
        number_of_storeys (int): Number of storeys
        region (str): Region code (saudi_arabia, uae, egypt, etc.)
        building_type (str): Type (residential, villa, commercial, etc.)
        finish_level (str): Finish quality (basic, standard, luxury, super_luxury)
        custom_contractor_rate (float, optional): Custom rate per m²
    """
    try:
        data = request.json
        
        # Parse input
        input_data = EstimateInput(
            total_area_sqm=float(data.get('total_area_sqm', 0)),
            number_of_storeys=int(data.get('number_of_storeys', 1)),
            region=Region(data.get('region', 'saudi_arabia')),
            building_type=BuildingType(data.get('building_type', 'residential')),
            finish_level=FinishLevel(data.get('finish_level', 'standard')),
            custom_contractor_rate=data.get('custom_contractor_rate')
        )
        
        # Generate estimate
        result = quick_estimator.estimate(input_data)
        
        # Convert dataclass to dict
        result_dict = {
            'region': result.region,
            'building_type': result.building_type,
            'finish_level': result.finish_level,
            'total_area_sqm': result.total_area_sqm,
            'number_of_storeys': result.number_of_storeys,
            'currency': result.currency,
            'materials': {
                'steel_kg': result.steel_kg,
                'concrete_m3': result.concrete_m3,
                'blocks_nos': result.blocks_nos,
                'cement_bags_50kg': result.cement_bags_50kg,
                'sand_m3': result.sand_m3,
                'aggregate_m3': result.aggregate_m3
            },
            'costs': {
                'structure_cost': result.structure_cost,
                'finishing_cost': result.finishing_cost,
                'mep_cost': result.mep_cost,
                'total_estimated_cost': result.total_estimated_cost,
                'cost_per_sqm': result.cost_per_sqm
            },
            'factors': {
                'storey_multiplier': result.storey_multiplier,
                'building_type_multiplier': result.building_type_multiplier,
                'finish_multiplier': result.finish_multiplier
            },
            'warnings': result.warnings,
            'confidence_level': result.confidence_level
        }
        
        return jsonify({
            'success': True,
            'estimate': result_dict
        })
        
    except ValueError as e:
        return jsonify({'success': False, 'error': f'Invalid input: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/quick-estimate/regions', methods=['GET'])
def get_regions():
    """Get list of supported regions"""
    regions = [
        {'code': 'saudi_arabia', 'name_ar': 'السعودية', 'name_en': 'Saudi Arabia', 'currency': 'SAR'},
        {'code': 'uae', 'name_ar': 'الإمارات', 'name_en': 'UAE', 'currency': 'AED'},
        {'code': 'qatar', 'name_ar': 'قطر', 'name_en': 'Qatar', 'currency': 'QAR'},
        {'code': 'kuwait', 'name_ar': 'الكويت', 'name_en': 'Kuwait', 'currency': 'KWD'},
        {'code': 'oman', 'name_ar': 'عمان', 'name_en': 'Oman', 'currency': 'OMR'},
        {'code': 'bahrain', 'name_ar': 'البحرين', 'name_en': 'Bahrain', 'currency': 'BHD'},
        {'code': 'egypt', 'name_ar': 'مصر', 'name_en': 'Egypt', 'currency': 'EGP'},
        {'code': 'jordan', 'name_ar': 'الأردن', 'name_en': 'Jordan', 'currency': 'JOD'}
    ]
    return jsonify({'success': True, 'regions': regions})


@app.route('/api/unit-convert', methods=['POST'])
def convert_units():
    """
    تحويل الوحدات - Convert units
    
    Body params:
        value (float): Value to convert
        from_unit (str): Source unit
        to_unit (str): Target unit
        unit_type (str): Type (length, area, volume, weight, pressure, force, temperature)
    """
    try:
        data = request.json
        value = float(data.get('value', 0))
        from_unit = data.get('from_unit', '')
        to_unit = data.get('to_unit', '')
        unit_type = data.get('unit_type', 'length')
        
        # Convert based on type
        if unit_type == 'length':
            result = UnitConverter.convert_length(
                value, 
                LengthUnit(from_unit), 
                LengthUnit(to_unit)
            )
        elif unit_type == 'area':
            result = UnitConverter.convert_area(
                value, 
                AreaUnit(from_unit), 
                AreaUnit(to_unit)
            )
        elif unit_type == 'volume':
            result = UnitConverter.convert_volume(
                value, 
                VolumeUnit(from_unit), 
                VolumeUnit(to_unit)
            )
        elif unit_type == 'weight':
            result = UnitConverter.convert_weight(
                value, 
                WeightUnit(from_unit), 
                WeightUnit(to_unit)
            )
        elif unit_type == 'pressure':
            result = UnitConverter.convert_pressure(
                value, 
                PressureUnit(from_unit), 
                PressureUnit(to_unit)
            )
        elif unit_type == 'force':
            result = UnitConverter.convert_force(
                value, 
                ForceUnit(from_unit), 
                ForceUnit(to_unit)
            )
        elif unit_type == 'temperature':
            result = UnitConverter.convert_temperature(
                value, 
                TemperatureUnit(from_unit), 
                TemperatureUnit(to_unit)
            )
        else:
            return jsonify({'success': False, 'error': 'Invalid unit type'}), 400
        
        return jsonify({
            'success': True,
            'original': {
                'value': value,
                'unit': from_unit
            },
            'converted': {
                'value': round(result, 6),
                'unit': to_unit
            }
        })
        
    except ValueError as e:
        return jsonify({'success': False, 'error': f'Invalid unit: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/land-area/irregular', methods=['POST'])
def calculate_irregular_land_area():
    """
    حساب مساحة قطعة أرض غير منتظمة - Calculate irregular land area
    
    Body params:
        method (str): 'diagonal' or 'coordinates'
        
        For diagonal method:
            side_a, side_b, side_c, side_d (float): Four sides
            diagonal_ac (float): One diagonal
            unit (str): Unit of measurement
        
        For coordinates method:
            coordinates (list): List of [x, y] pairs
            unit (str): Unit of coordinates
    """
    try:
        data = request.json
        method = data.get('method', 'diagonal')
        unit_str = data.get('unit', 'm')
        unit = LengthUnit(unit_str)
        
        if method == 'diagonal':
            result = land_calculator.calculate_area_with_diagonal(
                side_a=float(data.get('side_a', 0)),
                side_b=float(data.get('side_b', 0)),
                side_c=float(data.get('side_c', 0)),
                side_d=float(data.get('side_d', 0)),
                diagonal_ac=float(data.get('diagonal_ac', 0)),
                unit=unit
            )
        elif method == 'coordinates':
            coords = data.get('coordinates', [])
            if len(coords) != 4:
                return jsonify({
                    'success': False, 
                    'error': 'Exactly 4 coordinates required'
                }), 400
            
            # Convert to tuples
            coord_tuples = [(float(c[0]), float(c[1])) for c in coords]
            
            result = land_calculator.calculate_area_with_coordinates(
                coordinates=coord_tuples,
                unit=unit
            )
        else:
            return jsonify({'success': False, 'error': 'Invalid method'}), 400
        
        return jsonify({
            'success': True,
            'area': result
        })
        
    except ValueError as e:
        return jsonify({'success': False, 'error': f'Invalid input: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/unit-convert/available-units', methods=['GET'])
def get_available_units():
    """Get list of available units by type"""
    units = {
        'length': [u.value for u in LengthUnit],
        'area': [u.value for u in AreaUnit],
        'volume': [u.value for u in VolumeUnit],
        'weight': [u.value for u in WeightUnit],
        'pressure': [u.value for u in PressureUnit],
        'force': [u.value for u in ForceUnit],
        'temperature': [u.value for u in TemperatureUnit]
    }
    return jsonify({'success': True, 'units': units})


# ============================================
# House Plan APIs - واجهات استخراج المخططات
# ============================================

@app.route('/api/house-plan/scrape', methods=['POST'])
def scrape_house_plan():
    """
    استخراج بيانات مخطط من رابط
    
    Body params:
        url (str): URL of the house plan page
    """
    try:
        data = request.json
        url = data.get('url', '')
        
        if not url:
            return jsonify({'success': False, 'error': 'URL is required'}), 400
        
        # Scrape the plan
        plan = house_plan_scraper.scrape_plan(url)
        
        if not plan:
            return jsonify({'success': False, 'error': 'Failed to extract plan data'}), 500
        
        # Convert to dict
        plan_dict = HousePlanAnalyzer.to_dict(plan)
        
        return jsonify({
            'success': True,
            'plan': plan_dict
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/house-plan/scrape-list', methods=['POST'])
def scrape_house_plan_list():
    """
    استخراج قائمة روابط المخططات
    
    Body params:
        url (str): URL of the plans list page
        limit (int, optional): Maximum number of URLs to return
    """
    try:
        data = request.json
        url = data.get('url', '')
        limit = data.get('limit', 50)
        
        if not url:
            return jsonify({'success': False, 'error': 'URL is required'}), 400
        
        # Scrape list
        plan_urls = house_plan_scraper.scrape_plan_list(url)
        
        # Apply limit
        if limit:
            plan_urls = plan_urls[:limit]
        
        return jsonify({
            'success': True,
            'count': len(plan_urls),
            'urls': plan_urls
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/house-plan/estimate', methods=['POST'])
def estimate_from_house_plan():
    """
    إنشاء تقدير تلقائي من بيانات مخطط
    
    Body params:
        url (str): URL to scrape, OR
        plan (dict): Pre-extracted plan data
        region (str, optional): Region code
        finish_level (str, optional): Finish level
        custom_contractor_rate (float, optional): Custom rate
    """
    try:
        data = request.json
        
        # Get or scrape plan
        if 'url' in data:
            plan = house_plan_scraper.scrape_plan(data['url'])
            if not plan:
                return jsonify({'success': False, 'error': 'Failed to extract plan'}), 500
        elif 'plan' in data:
            # TODO: Reconstruct HousePlanData from dict
            return jsonify({'success': False, 'error': 'Direct plan data not yet supported'}), 501
        else:
            return jsonify({'success': False, 'error': 'Either url or plan required'}), 400
        
        # Parse parameters
        region = Region(data.get('region', 'saudi_arabia'))
        finish_level = FinishLevel(data.get('finish_level', 'standard'))
        custom_rate = data.get('custom_contractor_rate')
        
        # Generate estimate
        estimate = house_plan_integrator.generate_estimate_from_plan(
            plan,
            region=region,
            finish_level=finish_level,
            custom_contractor_rate=custom_rate
        )
        
        # Convert to dict
        result = {
            'plan_id': estimate.plan_id,
            'plan_title': estimate.plan_title,
            'plan_url': estimate.plan_url,
            'land_area_sqm': estimate.land_area_sqm,
            'building_area_sqm': estimate.building_area_sqm,
            'room_count': estimate.room_count,
            'bhk': estimate.bhk,
            'quick_estimate': estimate.quick_estimate,
            'room_breakdown': estimate.room_breakdown,
            'confidence': estimate.confidence,
            'notes': estimate.notes
        }
        
        return jsonify({
            'success': True,
            'estimate': result
        })
        
    except ValueError as e:
        return jsonify({'success': False, 'error': f'Invalid input: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/house-plan/generate-boq', methods=['POST'])
def generate_boq_from_plan():
    """
    إنشاء BOQ أولي من مخطط
    
    Body params:
        url (str): URL to scrape
    """
    try:
        data = request.json
        url = data.get('url', '')
        
        if not url:
            return jsonify({'success': False, 'error': 'URL is required'}), 400
        
        # Scrape plan
        plan = house_plan_scraper.scrape_plan(url)
        if not plan:
            return jsonify({'success': False, 'error': 'Failed to extract plan'}), 500
        
        # Generate BOQ
        boq = house_plan_integrator.generate_boq_from_plan(plan)
        
        return jsonify({
            'success': True,
            'boq': boq
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/house-plan/compare', methods=['POST'])
def compare_house_plans():
    """
    مقارنة مخططين
    
    Body params:
        url1 (str): First plan URL
        url2 (str): Second plan URL
        region (str, optional): Region for estimates
    """
    try:
        data = request.json
        url1 = data.get('url1', '')
        url2 = data.get('url2', '')
        
        if not url1 or not url2:
            return jsonify({'success': False, 'error': 'Both url1 and url2 required'}), 400
        
        # Scrape both plans
        plan1 = house_plan_scraper.scrape_plan(url1)
        plan2 = house_plan_scraper.scrape_plan(url2)
        
        if not plan1 or not plan2:
            return jsonify({'success': False, 'error': 'Failed to extract one or both plans'}), 500
        
        # Parse region
        region = Region(data.get('region', 'saudi_arabia'))
        
        # Compare with estimates
        comparison = house_plan_integrator.compare_plans_with_estimates(plan1, plan2, region)
        
        # Convert estimates to serializable format
        comparison['estimates']['plan1'] = {
            'plan_id': comparison['estimates']['plan1'].plan_id,
            'plan_title': comparison['estimates']['plan1'].plan_title,
            'quick_estimate': comparison['estimates']['plan1'].quick_estimate,
            'confidence': comparison['estimates']['plan1'].confidence
        }
        comparison['estimates']['plan2'] = {
            'plan_id': comparison['estimates']['plan2'].plan_id,
            'plan_title': comparison['estimates']['plan2'].plan_title,
            'quick_estimate': comparison['estimates']['plan2'].quick_estimate,
            'confidence': comparison['estimates']['plan2'].confidence
        }
        
        return jsonify({
            'success': True,
            'comparison': comparison
        })
        
    except ValueError as e:
        return jsonify({'success': False, 'error': f'Invalid input: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/house-plan/analyze', methods=['POST'])
def analyze_house_plan():
    """
    تحليل مخطط واحد
    
    Body params:
        url (str): Plan URL
    """
    try:
        data = request.json
        url = data.get('url', '')
        
        if not url:
            return jsonify({'success': False, 'error': 'URL is required'}), 400
        
        # Scrape plan
        plan = house_plan_scraper.scrape_plan(url)
        if not plan:
            return jsonify({'success': False, 'error': 'Failed to extract plan'}), 500
        
        # Calculate statistics
        stats = HousePlanAnalyzer.calculate_statistics(plan)
        
        return jsonify({
            'success': True,
            'plan': HousePlanAnalyzer.to_dict(plan),
            'statistics': stats
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


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
