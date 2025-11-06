#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=======================================================================
خدمة توليد التقارير (Report Generation Service)
=======================================================================

الهدف: توليد تقارير HTML/PDF احترافية باستخدام Jinja2 Templates

المدخلات:
    - بيانات المشروع (Project Data)
    - بيانات BOQ
    - بيانات الجدول الزمني

المخرجات:
    - تقارير HTML
    - تقارير PDF (via wkhtmltopdf or weasyprint)

التاريخ: 2025-11-04
المطور: NOUFAL Engineering System
=======================================================================
"""

from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime
from jinja2 import Environment, FileSystemLoader, select_autoescape
import logging

# إعداد السجلات
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ReportService:
    """
    خدمة توليد التقارير
    Report Generation Service
    """
    
    def __init__(self, templates_path: str = None):
        """
        تهيئة الخدمة
        
        Args:
            templates_path: مسار قوالب HTML
        """
        if templates_path is None:
            templates_path = Path(__file__).parent.parent / "templates" / "reports"
        
        self.templates_path = Path(templates_path)
        
        # Setup Jinja2 environment
        self.env = Environment(
            loader=FileSystemLoader(str(self.templates_path)),
            autoescape=select_autoescape(['html', 'xml']),
            trim_blocks=True,
            lstrip_blocks=True
        )
        
        # Add custom filters
        self.env.filters['round'] = self._filter_round
        self.env.filters['format_date'] = self._filter_format_date
        self.env.filters['format_number'] = self._filter_format_number
        self.env.filters['format_currency'] = self._filter_format_currency
        
        logger.info(f"تم تهيئة خدمة التقارير - المسار: {self.templates_path}")
    
    def generate_boq_report(self, data: Dict, output_format: str = 'html') -> str:
        """
        توليد تقرير الكميات
        
        Args:
            data: بيانات الكميات
            output_format: 'html' أو 'pdf'
            
        Returns:
            str: HTML content أو مسار ملف PDF
        """
        logger.info("بدء توليد تقرير الكميات...")
        
        # Load template
        template = self.env.get_template('boq_report_template.html')
        
        # Prepare context
        context = {
            'report_title': 'تقرير الكميات الشامل',
            'project_name': data.get('project_name', 'مشروع هندسي'),
            'report_date': datetime.now().strftime('%Y-%m-%d'),
            'project_id': data.get('project_id', 'N/A'),
            'project_status': data.get('project_status', 'قيد التنفيذ'),
            
            # Summary
            'total_items': data.get('total_items', 0),
            'total_quantity': data.get('total_quantity', 0),
            'total_unit': data.get('total_unit', 'm³'),
            'compliant_items': data.get('compliant_items', 0),
            'critical_issues': data.get('critical_issues', 0),
            'warnings': data.get('warnings', 0),
            
            # Items
            'boq_items': data.get('boq_items', []),
            'validation_results': data.get('validation_results', []),
            'categories': data.get('categories', [])
        }
        
        # Render HTML
        html_content = template.render(context)
        
        if output_format == 'html':
            logger.info("تم توليد تقرير HTML بنجاح")
            return html_content
        elif output_format == 'pdf':
            # Convert to PDF (requires wkhtmltopdf or weasyprint)
            pdf_path = self._html_to_pdf(html_content, 'boq_report.pdf')
            logger.info(f"تم توليد تقرير PDF: {pdf_path}")
            return pdf_path
        else:
            raise ValueError(f"تنسيق غير مدعوم: {output_format}")
    
    def generate_schedule_report(self, data: Dict, output_format: str = 'html') -> str:
        """
        توليد تقرير الجدول الزمني
        
        Args:
            data: بيانات الجدول
            output_format: 'html' أو 'pdf'
            
        Returns:
            str: HTML content أو مسار ملف PDF
        """
        logger.info("بدء توليد تقرير الجدول الزمني...")
        
        # Load template
        template = self.env.get_template('schedule_report_template.html')
        
        # Prepare context
        context = {
            'report_title': 'تقرير الجدول الزمني',
            'project_name': data.get('project_name', 'مشروع هندسي'),
            'report_date': datetime.now().strftime('%Y-%m-%d'),
            'project_id': data.get('project_id', 'N/A'),
            'project_status': data.get('project_status', 'قيد التنفيذ'),
            
            # Summary
            'total_activities': data.get('total_activities', 0),
            'critical_activities': data.get('critical_activities', 0),
            'planned_progress': data.get('planned_progress', 0),
            'actual_progress': data.get('actual_progress', 0),
            'ahead_activities': data.get('ahead_activities', 0),
            'on_track_activities': data.get('on_track_activities', 0),
            'behind_activities': data.get('behind_activities', 0),
            
            # EVM
            'evm_metrics': data.get('evm_metrics', {}),
            
            # Activities
            'activities': data.get('activities', []),
            'critical_path': data.get('critical_path', []),
            
            # S-Curve
            'scurve_image': data.get('scurve_image', None)
        }
        
        # Render HTML
        html_content = template.render(context)
        
        if output_format == 'html':
            logger.info("تم توليد تقرير HTML بنجاح")
            return html_content
        elif output_format == 'pdf':
            pdf_path = self._html_to_pdf(html_content, 'schedule_report.pdf')
            logger.info(f"تم توليد تقرير PDF: {pdf_path}")
            return pdf_path
        else:
            raise ValueError(f"تنسيق غير مدعوم: {output_format}")
    
    def save_html_report(self, html_content: str, filename: str, output_dir: str = None) -> str:
        """
        حفظ تقرير HTML
        
        Args:
            html_content: محتوى HTML
            filename: اسم الملف
            output_dir: مجلد الحفظ (اختياري)
            
        Returns:
            str: مسار الملف المحفوظ
        """
        if output_dir is None:
            output_dir = Path.cwd() / "reports_output"
        
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        output_file = output_dir / filename
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        logger.info(f"تم حفظ التقرير: {output_file}")
        return str(output_file)
    
    def _html_to_pdf(self, html_content: str, filename: str) -> str:
        """
        تحويل HTML إلى PDF
        
        Note: يتطلب مكتبة weasyprint أو wkhtmltopdf
        """
        try:
            from weasyprint import HTML, CSS
            
            output_dir = Path.cwd() / "reports_output"
            output_dir.mkdir(parents=True, exist_ok=True)
            
            output_file = output_dir / filename
            
            # Convert to PDF
            HTML(string=html_content).write_pdf(
                str(output_file),
                stylesheets=[CSS(string='@page { size: A4; margin: 2cm; }')]
            )
            
            logger.info(f"تم تحويل HTML إلى PDF: {output_file}")
            return str(output_file)
            
        except ImportError:
            logger.warning("weasyprint غير مثبت - سيتم حفظ HTML فقط")
            return self.save_html_report(html_content, filename.replace('.pdf', '.html'))
    
    # ===== Custom Filters =====
    
    def _filter_round(self, value, decimals=2):
        """تقريب الأرقام"""
        try:
            return round(float(value), decimals)
        except (ValueError, TypeError):
            return value
    
    def _filter_format_date(self, value, format_str='%Y-%m-%d'):
        """تنسيق التاريخ"""
        if isinstance(value, str):
            value = datetime.fromisoformat(value)
        return value.strftime(format_str)
    
    def _filter_format_number(self, value, decimals=2):
        """تنسيق الأرقام مع فواصل"""
        try:
            return f"{float(value):,.{decimals}f}"
        except (ValueError, TypeError):
            return value
    
    def _filter_format_currency(self, value, currency='ريال'):
        """تنسيق العملة"""
        try:
            return f"{float(value):,.2f} {currency}"
        except (ValueError, TypeError):
            return value


def main():
    """
    دالة الاختبار
    """
    service = ReportService()
    
    # Sample data for BOQ report
    sample_boq_data = {
        'project_name': 'فيلا سكنية - الياسمين',
        'project_id': 'VL-2024-001',
        'project_status': 'قيد التنفيذ',
        'total_items': 45,
        'total_quantity': 1250.75,
        'total_unit': 'm³',
        'compliant_items': 40,
        'critical_issues': 2,
        'warnings': 3,
        'boq_items': [
            {
                'item_number': '01-001',
                'description': 'خرسانة مسلحة 30 MPa للأساسات',
                'unit': 'm³',
                'calculated_quantity': 45.50,
                'calculation_formula': '10.00 × 1.50 × 0.50 × 6',
                'drawing_ref': 'ST-01'
            },
            {
                'item_number': '01-002',
                'description': 'حديد تسليح Ø16mm',
                'unit': 'طن',
                'calculated_quantity': 2.5,
                'calculation_formula': '50',
                'drawing_ref': 'ST-01'
            }
        ],
        'validation_results': [
            {
                'item_number': '02-005',
                'description': 'بلاطة سقف سماكة 120mm',
                'issue': 'سماكة البلاطة (120 mm) أقل من الحد الأدنى (150 mm) حسب SBC 303',
                'severity': 'critical',
                'sbc_code': 'SBC 303'
            }
        ],
        'categories': [
            {'name': 'أعمال الخرسانة', 'count': 15, 'total_quantity': 450.5, 'unit': 'm³', 'percentage': 45},
            {'name': 'أعمال الحديد', 'count': 10, 'total_quantity': 25.3, 'unit': 'طن', 'percentage': 30},
            {'name': 'أعمال التشطيب', 'count': 20, 'total_quantity': 775.0, 'unit': 'm²', 'percentage': 25}
        ]
    }
    
    # Generate report
    html_report = service.generate_boq_report(sample_boq_data, output_format='html')
    
    # Save report
    output_path = service.save_html_report(html_report, 'sample_boq_report.html')
    
    print("=" * 70)
    print("خدمة توليد التقارير - NOUFAL Engineering System")
    print("=" * 70)
    print(f"\n✅ تم توليد تقرير اختباري: {output_path}")
    print("\nالخدمة جاهزة للاستخدام!")
    print("=" * 70)


if __name__ == "__main__":
    main()
