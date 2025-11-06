#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=======================================================================
Unit Tests for Quantity Analysis Module
=======================================================================
"""

import pytest
import pandas as pd
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "project_template" / "02_Processing" / "Scripts"))

from quantity_analysis import QuantityAnalyzer, SBCStandards


class TestSBCStandards:
    """اختبار معايير كود البناء السعودي"""
    
    def test_concrete_min_strength(self):
        """اختبار قيم قوة الخرسانة الدنيا"""
        assert SBCStandards.CONCRETE_MIN_STRENGTH['foundations'] == 25
        assert SBCStandards.CONCRETE_MIN_STRENGTH['columns'] == 30
        assert SBCStandards.CONCRETE_MIN_STRENGTH['beams'] == 25
        assert SBCStandards.CONCRETE_MIN_STRENGTH['slabs'] == 20
    
    def test_concrete_min_cover(self):
        """اختبار قيم غطاء الخرسانة"""
        assert SBCStandards.CONCRETE_MIN_COVER['cast_against_earth'] == 75
        assert SBCStandards.CONCRETE_MIN_COVER['exposed_to_weather'] == 50
    
    def test_rebar_dimensions(self):
        """اختبار أبعاد حديد التسليح"""
        assert SBCStandards.REBAR_MIN_DIAMETER == 8
        assert SBCStandards.REBAR_MAX_DIAMETER == 40
        assert SBCStandards.REBAR_MAX_SPACING['slabs'] == 300
    
    def test_min_dimensions(self):
        """اختبار الأبعاد الدنيا"""
        assert SBCStandards.MIN_DIMENSIONS['slab_thickness'] == 150
        assert SBCStandards.MIN_DIMENSIONS['beam_width'] == 200
        assert SBCStandards.MIN_DIMENSIONS['column_dimension'] == 250


class TestQuantityAnalyzer:
    """اختبار محلل الكميات"""
    
    @pytest.fixture
    def temp_project_dir(self, tmp_path):
        """إنشاء مجلد مشروع مؤقت"""
        project_dir = tmp_path / "test_project"
        
        # Create directory structure
        (project_dir / "01_Input_Data" / "03_Cost" / "BOQ_Initial").mkdir(parents=True)
        (project_dir / "03_Output_Data" / "01_Quantities" / "Final_BOQ").mkdir(parents=True)
        (project_dir / "02_Processing" / "Temp_Data").mkdir(parents=True)
        
        return project_dir
    
    @pytest.fixture
    def sample_boq_df(self):
        """إنشاء DataFrame تجريبي لـ BOQ"""
        data = {
            'item_number': ['01-001', '01-002', '02-001'],
            'description': [
                'Concrete 30 MPa for foundations',
                'Concrete slab 180mm thick',
                'Reinforcement 12mm diameter'
            ],
            'unit': ['m³', 'm²', 'kg'],
            'length': [10.0, 5.0, 1.0],
            'width': [1.5, 4.0, 1.0],
            'height': [0.5, 1.0, 1.0],
            'thickness': [0.0, 0.18, 0.0],
            'count': [6.0, 1.0, 500.0],
            'quantity': [0.0, 0.0, 0.0]
        }
        return pd.DataFrame(data)
    
    def test_analyzer_initialization(self, temp_project_dir):
        """اختبار تهيئة المحلل"""
        analyzer = QuantityAnalyzer(str(temp_project_dir))
        
        assert analyzer.project_path == temp_project_dir
        assert analyzer.df_boq is None
        assert len(analyzer.validation_results) == 0
    
    def test_clean_data(self, temp_project_dir, sample_boq_df):
        """اختبار تنظيف البيانات"""
        analyzer = QuantityAnalyzer(str(temp_project_dir))
        analyzer.df_boq = sample_boq_df.copy()
        
        cleaned_df = analyzer.clean_data()
        
        # Check that NaN values are filled
        assert cleaned_df['length'].notna().all()
        assert cleaned_df['width'].notna().all()
        assert cleaned_df['height'].notna().all()
    
    def test_calculate_quantities_volume(self, temp_project_dir, sample_boq_df):
        """اختبار حساب الكميات - الحجم (m³)"""
        analyzer = QuantityAnalyzer(str(temp_project_dir))
        analyzer.df_boq = sample_boq_df.copy()
        analyzer.clean_data()
        
        result_df = analyzer.calculate_quantities()
        
        # Check volume calculation for first item (10 × 1.5 × 0.5 × 6 = 45)
        assert result_df.loc[0, 'calculated_quantity'] == pytest.approx(45.0, rel=1e-2)
    
    def test_calculate_quantities_area(self, temp_project_dir, sample_boq_df):
        """اختبار حساب الكميات - المساحة (m²)"""
        analyzer = QuantityAnalyzer(str(temp_project_dir))
        analyzer.df_boq = sample_boq_df.copy()
        analyzer.clean_data()
        
        result_df = analyzer.calculate_quantities()
        
        # Check area calculation for second item (5 × 4 × 1 = 20)
        assert result_df.loc[1, 'calculated_quantity'] == pytest.approx(20.0, rel=1e-2)
    
    def test_calculate_quantities_count(self, temp_project_dir, sample_boq_df):
        """اختبار حساب الكميات - العدد"""
        analyzer = QuantityAnalyzer(str(temp_project_dir))
        analyzer.df_boq = sample_boq_df.copy()
        analyzer.clean_data()
        
        result_df = analyzer.calculate_quantities()
        
        # Check count for third item (500)
        assert result_df.loc[2, 'calculated_quantity'] == 500.0
    
    def test_calculation_formula_generation(self, temp_project_dir, sample_boq_df):
        """اختبار توليد صيغة الحساب"""
        analyzer = QuantityAnalyzer(str(temp_project_dir))
        analyzer.df_boq = sample_boq_df.copy()
        analyzer.clean_data()
        analyzer.calculate_quantities()
        
        # Check that formula is generated
        assert 'calculation_formula' in analyzer.df_boq.columns
        assert '×' in analyzer.df_boq.loc[0, 'calculation_formula']
    
    def test_sbc_validation_concrete_strength(self, temp_project_dir):
        """اختبار التحقق من قوة الخرسانة"""
        analyzer = QuantityAnalyzer(str(temp_project_dir))
        
        # Create BOQ with low strength concrete
        data = {
            'item_number': ['01-001'],
            'description': ['Concrete 20 MPa for columns'],  # Too low!
            'unit': ['m³'],
            'length': [1.0],
            'width': [1.0],
            'height': [1.0],
            'count': [1.0]
        }
        analyzer.df_boq = pd.DataFrame(data)
        analyzer.clean_data()
        analyzer.calculate_quantities()
        
        results = analyzer.validate_sbc_compliance()
        
        # Should flag this as critical issue
        assert len(results) > 0
        assert results[0]['severity'] == 'critical'
        assert 'SBC 303' in results[0]['sbc_code']
    
    def test_sbc_validation_slab_thickness(self, temp_project_dir):
        """اختبار التحقق من سماكة البلاطات"""
        analyzer = QuantityAnalyzer(str(temp_project_dir))
        
        # Create BOQ with thin slab
        data = {
            'item_number': ['02-001'],
            'description': ['Concrete slab'],
            'unit': ['m²'],
            'length': [5.0],
            'width': [4.0],
            'thickness': [0.12],  # 120mm - Too thin!
            'count': [1.0]
        }
        analyzer.df_boq = pd.DataFrame(data)
        analyzer.clean_data()
        analyzer.calculate_quantities()
        
        results = analyzer.validate_sbc_compliance()
        
        # Should flag thin slab
        assert len(results) > 0
        assert any('سماكة البلاطة' in r['issue'] or 'thickness' in r['issue'].lower() for r in results)
    
    def test_sbc_validation_rebar_diameter(self, temp_project_dir):
        """اختبار التحقق من قطر الحديد"""
        analyzer = QuantityAnalyzer(str(temp_project_dir))
        
        # Create BOQ with small diameter rebar
        data = {
            'item_number': ['03-001'],
            'description': ['Steel rebar 6mm diameter'],  # Too small!
            'unit': ['kg'],
            'count': [100.0],
            'length': [1.0],
            'width': [1.0]
        }
        analyzer.df_boq = pd.DataFrame(data)
        analyzer.clean_data()
        analyzer.calculate_quantities()
        
        results = analyzer.validate_sbc_compliance()
        
        # Should flag small diameter
        assert len(results) > 0
        assert any('قطر الحديد' in r['issue'] or 'diameter' in r['issue'].lower() for r in results)


class TestIntegration:
    """اختبارات التكامل"""
    
    @pytest.fixture
    def full_project_setup(self, tmp_path):
        """إعداد مشروع كامل للاختبار"""
        project_dir = tmp_path / "integration_test"
        
        # Create structure
        input_dir = project_dir / "01_Input_Data" / "03_Cost" / "BOQ_Initial"
        input_dir.mkdir(parents=True)
        
        (project_dir / "03_Output_Data" / "01_Quantities" / "Final_BOQ").mkdir(parents=True)
        (project_dir / "02_Processing" / "Temp_Data").mkdir(parents=True)
        
        # Create sample BOQ Excel file
        data = {
            'Item No': ['01-001', '01-002', '02-001', '03-001'],
            'Description': [
                'Concrete 30 MPa foundations',
                'Concrete 25 MPa beams',
                'Concrete slab 180mm',
                'Reinforcement Ø12mm'
            ],
            'Unit': ['m³', 'm³', 'm²', 'ton'],
            'Length': [10.0, 8.0, 12.0, 1.0],
            'Width': [1.5, 0.3, 5.0, 1.0],
            'Height': [0.5, 0.6, 1.0, 1.0],
            'Count': [6, 10, 1, 2.5]
        }
        df = pd.DataFrame(data)
        df.to_excel(input_dir / "BOQ_Initial.xlsx", index=False)
        
        return project_dir
    
    def test_full_analysis_workflow(self, full_project_setup):
        """اختبار سير العمل الكامل"""
        analyzer = QuantityAnalyzer(str(full_project_setup))
        
        # Run full analysis
        results = analyzer.run_full_analysis('BOQ_Initial.xlsx')
        
        # Verify results structure
        assert results['success'] == True
        assert 'output_file' in results
        assert 'total_items' in results
        assert results['total_items'] == 4
        
        # Check output file exists
        output_file = Path(results['output_file'])
        assert output_file.exists()
        assert output_file.suffix == '.xlsx'


def test_suite_summary():
    """ملخص مجموعة الاختبارات"""
    print("\n" + "=" * 70)
    print("Quantity Analysis Test Suite")
    print("=" * 70)
    print("\nTest Categories:")
    print("  ✅ SBC Standards Tests")
    print("  ✅ Analyzer Initialization Tests")
    print("  ✅ Data Cleaning Tests")
    print("  ✅ Quantity Calculation Tests")
    print("  ✅ SBC Validation Tests")
    print("  ✅ Integration Tests")
    print("\n" + "=" * 70)


if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, '-v', '--tb=short'])
