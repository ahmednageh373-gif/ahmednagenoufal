"""
Claude Prompts Service - خدمة استدعاءات Claude المحسّنة
=========================================================

9 أنواع من الاستدعاءات المحسّنة لاستخراج الكميات والتحليل الهندسي
Optimized prompts for quantity extraction and engineering analysis with Claude

Author: NOUFAL Engineering Management System
Date: 2025-11-04
Version: 1.0
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum


class PromptType(Enum):
    """أنواع الاستدعاءات المتاحة"""
    BASIC_QUANTITY = "basic_quantity"           # استخراج كميات أساسي
    ADVANCED_QUANTITY = "advanced_quantity"     # استخراج كميات متقدم
    IMAGE_ANALYSIS = "image_analysis"           # تحليل الصور والمخططات
    COMPARISON = "comparison"                   # مقارنة والتحقق
    COST_ESTIMATION = "cost_estimation"         # تقدير التكاليف
    MATERIALS = "materials"                     # استخراج المواد
    VALIDATION = "validation"                   # التحقق من الصحة
    REPORT_GENERATION = "report_generation"     # إنشاء التقارير
    SCHEDULE_ANALYSIS = "schedule_analysis"     # تحليل الجدول الزمني


@dataclass
class PromptTemplate:
    """قالب استدعاء Claude"""
    type: PromptType
    name: str
    name_ar: str
    description: str
    description_ar: str
    template: str
    variables: List[str]
    expected_output: str


class ClaudePromptsService:
    """خدمة استدعاءات Claude المحسّنة"""
    
    # ====================================================================
    # 1. Basic Quantity Extraction - استخراج الكميات الأساسي
    # ====================================================================
    
    BASIC_QUANTITY_PROMPT = """
أنت مهندس مدني محترف متخصص في استخراج الكميات من المستندات.

المهمة: استخرج الكميات من النص التالي:
{document_text}

تعليمات:
1. استخرج جميع البنود والكميات
2. حدد الوحدات بدقة
3. ميز بين الكميات والأسعار
4. رتب البنود حسب الأقسام

الصيغة المطلوبة (JSON):
{{
  "items": [
    {{
      "item_no": "رقم البند",
      "description": "الوصف",
      "quantity": العدد,
      "unit": "الوحدة",
      "section": "القسم"
    }}
  ]
}}

ملاحظات:
- استخدم الأرقام العربية الهندية إذا وجدت
- حدد القسم (أعمال حفر، أعمال خرسانة، إلخ)
- تأكد من دقة الوحدات (م، م٢، م٣، كجم، إلخ)
"""

    # ====================================================================
    # 2. Advanced Quantity Extraction - استخراج الكميات المتقدم
    # ====================================================================
    
    ADVANCED_QUANTITY_PROMPT = """
أنت خبير في استخراج وتحليل الكميات من مستندات BOQ المعقدة.

المهمة: قم بتحليل متقدم للكميات من:
{document_text}

التحليل المطلوب:
1. استخراج البنود مع التصنيف الكامل
2. حساب الكميات الفرعية
3. تحديد العلاقات بين البنود
4. اكتشاف البنود المفقودة أو المتكررة
5. التحقق من التوافق مع المعايير السعودية (SBC)

معايير SBC 303 (الهيكل الإنشائي):
- حديد التسليح: 80-120 كجم/م³ للخرسانة
- سمك الأساسات: 30-100 سم حسب التربة
- سمك البلاط: 15-30 سم حسب البحور
- أعمدة: مسافة لا تزيد عن 8 متر
- كمرات: ارتفاع = البحر/12 (تقريباً)

الصيغة المطلوبة (JSON):
{{
  "items": [
    {{
      "item_no": "رقم البند",
      "description": "الوصف الكامل",
      "quantity": العدد,
      "unit": "الوحدة",
      "section": "القسم",
      "category": "الفئة",
      "sub_items": [
        {{"description": "بند فرعي", "quantity": العدد, "unit": "الوحدة"}}
      ],
      "sbc_compliance": {{
        "compliant": true/false,
        "issues": ["قائمة المشاكل"],
        "recommendations": ["قائمة التوصيات"]
      }},
      "relationships": ["البنود المرتبطة"],
      "unit_price_range": {{"min": الحد_الأدنى, "max": الحد_الأقصى, "currency": "SAR"}}
    }}
  ],
  "summary": {{
    "total_items": عدد_البنود,
    "total_sections": عدد_الأقسام,
    "missing_items": ["البنود المفقودة"],
    "duplicate_items": ["البنود المكررة"],
    "compliance_score": نسبة_التوافق_مع_SBC,
    "warnings": ["قائمة التحذيرات"]
  }}
}}
"""

    # ====================================================================
    # 3. Image Analysis - تحليل الصور والمخططات
    # ====================================================================
    
    IMAGE_ANALYSIS_PROMPT = """
أنت مهندس معماري خبير في قراءة المخططات الهندسية.

المهمة: حلل المخطط/الصورة وقدم تحليل شامل.

نوع المخطط: {image_type}
الغرض من التحليل: {analysis_purpose}

تعليمات التحليل:
1. حدد نوع المخطط (معماري، إنشائي، كهربائي، صحي)
2. استخرج الأبعاد والمقاسات
3. حدد الغرف والمساحات
4. استخرج الملاحظات والمواصفات
5. اكتشف أي مشاكل أو تعارضات

للمخططات المعمارية:
- قائمة الغرف مع الأبعاد والمساحات
- إجمالي مساحة البناء
- عدد الطوابق
- نوع الأساسات (إن وجد)

للمخططات الإنشائية:
- أبعاد الأعمدة والكمرات
- سماكة البلاطات
- تفاصيل التسليح
- نوع الخرسانة المستخدمة

الصيغة المطلوبة (JSON):
{{
  "drawing_type": "نوع المخطط",
  "scale": "المقياس",
  "dimensions": {{
    "length": الطول,
    "width": العرض,
    "height": الارتفاع,
    "unit": "الوحدة"
  }},
  "rooms": [
    {{
      "name": "اسم الغرفة",
      "dimensions": {{"length": الطول, "width": العرض, "unit": "م"}},
      "area": المساحة,
      "notes": "ملاحظات"
    }}
  ],
  "structural_elements": [
    {{
      "type": "النوع (عمود/كمرة/بلاطة)",
      "dimensions": "الأبعاد",
      "reinforcement": "التسليح",
      "location": "الموقع"
    }}
  ],
  "total_area": المساحة_الإجمالية,
  "notes": ["ملاحظات عامة"],
  "issues": ["مشاكل محتملة"],
  "confidence": نسبة_الثقة_من_100
}}
"""

    # ====================================================================
    # 4. Comparison & Verification - المقارنة والتحقق
    # ====================================================================
    
    COMPARISON_PROMPT = """
أنت خبير في مراجعة ومقارنة مستندات BOQ.

المهمة: قارن بين المستندين التاليين:

المستند الأول (الأصلي):
{document1}

المستند الثاني (للمقارنة):
{document2}

نقاط المقارنة:
1. البنود المتطابقة
2. البنود المختلفة (الكميات أو الأسعار)
3. البنود الموجودة في الأول فقط
4. البنود الموجودة في الثاني فقط
5. نسبة التطابق الإجمالية

الصيغة المطلوبة (JSON):
{{
  "comparison_summary": {{
    "matching_items": عدد_البنود_المتطابقة,
    "different_items": عدد_البنود_المختلفة,
    "unique_in_doc1": عدد_البنود_الفريدة_في_الأول,
    "unique_in_doc2": عدد_البنود_الفريدة_في_الثاني,
    "match_percentage": نسبة_التطابق
  }},
  "matching_items": [
    {{
      "item_no": "رقم البند",
      "description": "الوصف",
      "quantity1": الكمية_في_الأول,
      "quantity2": الكمية_في_الثاني,
      "match": "متطابق تماماً"
    }}
  ],
  "different_items": [
    {{
      "item_no": "رقم البند",
      "description": "الوصف",
      "quantity1": الكمية_في_الأول,
      "quantity2": الكمية_في_الثاني,
      "difference": الفرق,
      "percentage_diff": نسبة_الفرق,
      "reason": "سبب الاختلاف"
    }}
  ],
  "unique_in_doc1": [
    {{"item_no": "رقم", "description": "الوصف", "quantity": الكمية}}
  ],
  "unique_in_doc2": [
    {{"item_no": "رقم", "description": "الوصف", "quantity": الكمية}}
  ],
  "recommendations": ["توصيات للمراجعة"]
}}
"""

    # ====================================================================
    # 5. Cost Estimation - تقدير التكاليف
    # ====================================================================
    
    COST_ESTIMATION_PROMPT = """
أنت مهندس تكاليف محترف متخصص في التقدير للسوق السعودي.

المهمة: قدر التكاليف التفصيلية للبنود التالية:
{items_list}

المنطقة: {region}
نوع المشروع: {project_type}
مستوى التشطيب: {finish_level}

معلومات السوق (السعودية - 2025):
- خرسانة عادية: 250-300 ريال/م³
- خرسانة مسلحة: 400-500 ريال/م³
- حديد تسليح: 3,200-3,500 ريال/طن
- بلوك أسمنتي: 6-8 ريال/بلوكة
- أعمال حفر: 15-25 ريال/م³
- أعمال دفان: 8-12 ريال/م³

التقدير المطلوب (JSON):
{{
  "items": [
    {{
      "item_no": "رقم البند",
      "description": "الوصف",
      "quantity": الكمية,
      "unit": "الوحدة",
      "unit_price": السعر_للوحدة,
      "total_price": السعر_الإجمالي,
      "price_breakdown": {{
        "materials": تكلفة_المواد,
        "labor": تكلفة_العمالة,
        "equipment": تكلفة_المعدات,
        "overhead": المصاريف_الإدارية
      }},
      "price_source": "مصدر السعر",
      "confidence": نسبة_الثقة
    }}
  ],
  "summary": {{
    "subtotal": المجموع_الفرعي,
    "overhead_15percent": المصاريف_الإدارية,
    "profit_10percent": الربح,
    "vat_15percent": ضريبة_القيمة_المضافة,
    "total_estimate": المجموع_الكلي,
    "currency": "SAR"
  }},
  "assumptions": ["افتراضات التقدير"],
  "exclusions": ["البنود غير المشمولة"],
  "validity": "مدة صلاحية التقدير"
}}
"""

    # ====================================================================
    # 6. Materials Extraction - استخراج المواد
    # ====================================================================
    
    MATERIALS_PROMPT = """
أنت خبير مواد بناء متخصص في استخراج قوائم المواد.

المهمة: استخرج قائمة مفصلة بجميع المواد المطلوبة من:
{boq_data}

تصنيف المواد:
1. مواد إنشائية (خرسانة، حديد، بلوك، أسمنت، رمل، حصى)
2. مواد تشطيب (بلاط، رخام، دهانات، أبواب، نوافذ)
3. مواد كهربائية (أسلاك، مفاتيح، لمبات، لوحات)
4. مواد صحية (مواسير، خلاطات، أحواض، سخانات)
5. مواد MEP (تكييف، تهوية، مطافئ، إنذار)

الصيغة المطلوبة (JSON):
{{
  "materials": {{
    "structural": [
      {{
        "name": "اسم المادة",
        "specification": "المواصفات",
        "quantity": الكمية,
        "unit": "الوحدة",
        "estimated_price": السعر_المقدر,
        "supplier_notes": "ملاحظات للمورد"
      }}
    ],
    "finishing": [...],
    "electrical": [...],
    "plumbing": [...],
    "mep": [...]
  }},
  "summary": {{
    "total_material_types": عدد_أنواع_المواد,
    "estimated_total_cost": التكلفة_المقدرة,
    "critical_materials": ["المواد الحرجة"],
    "long_lead_items": ["المواد طويلة التوريد"]
  }},
  "procurement_plan": {{
    "phase1_materials": ["المرحلة الأولى"],
    "phase2_materials": ["المرحلة الثانية"],
    "phase3_materials": ["المرحلة الثالثة"]
  }}
}}
"""

    # ====================================================================
    # 7. Validation & Checking - التحقق من الصحة
    # ====================================================================
    
    VALIDATION_PROMPT = """
أنت مدقق BOQ محترف متخصص في التحقق من الصحة والدقة.

المهمة: دقق البنود التالية وتحقق من صحتها:
{items_to_validate}

معايير التدقيق:
1. دقة الكميات (هل منطقية؟)
2. صحة الوحدات (م، م²، م³، كجم، طن، إلخ)
3. اكتمال البنود (هل هناك نقص؟)
4. التكرار (هل هناك بنود مكررة؟)
5. التوافق مع المعايير السعودية (SBC)
6. علاقات البنود (هل متناسقة؟)

الصيغة المطلوبة (JSON):
{{
  "validation_results": {{
    "total_items_checked": عدد_البنود_المدققة,
    "valid_items": عدد_البنود_الصحيحة,
    "items_with_issues": عدد_البنود_بها_مشاكل,
    "overall_score": النتيجة_الإجمالية_من_100
  }},
  "issues_found": [
    {{
      "item_no": "رقم البند",
      "issue_type": "نوع المشكلة",
      "severity": "خطورة (critical/high/medium/low)",
      "description": "وصف المشكلة",
      "current_value": "القيمة الحالية",
      "suggested_value": "القيمة المقترحة",
      "reasoning": "السبب"
    }}
  ],
  "missing_items": [
    {{
      "suggested_item": "البند المقترح",
      "reason": "سبب الإضافة",
      "estimated_quantity": الكمية_المقدرة,
      "priority": "أولوية (high/medium/low)"
    }}
  ],
  "duplicate_items": [
    {{
      "item_no_1": "رقم البند الأول",
      "item_no_2": "رقم البند الثاني",
      "similarity": نسبة_التشابه,
      "recommendation": "التوصية"
    }}
  ],
  "sbc_compliance": {{
    "compliant_items": عدد_البنود_المتوافقة,
    "non_compliant_items": عدد_البنود_غير_المتوافقة,
    "compliance_percentage": نسبة_التوافق,
    "violations": ["قائمة المخالفات"]
  }},
  "recommendations": ["قائمة التوصيات العامة"]
}}
"""

    # ====================================================================
    # 8. Report Generation - إنشاء التقارير
    # ====================================================================
    
    REPORT_GENERATION_PROMPT = """
أنت كاتب تقارير هندسية محترف.

المهمة: أنشئ تقريراً شاملاً من البيانات التالية:
{data}

نوع التقرير: {report_type}
الجهة المستهدفة: {audience}

محتوى التقرير:
1. ملخص تنفيذي
2. نطاق العمل
3. الكميات التفصيلية
4. التكاليف المقدرة
5. الجدول الزمني
6. المخاطر والتوصيات
7. الملاحق

الصيغة المطلوبة (Markdown):
```markdown
# تقرير {report_type}

## ملخص تنفيذي
[ملخص شامل للمشروع]

## معلومات المشروع
- اسم المشروع: ...
- الموقع: ...
- المالك: ...
- المقاول: ...
- التاريخ: ...

## نطاق العمل
[وصف تفصيلي لنطاق العمل]

## الكميات الرئيسية
| البند | الوصف | الكمية | الوحدة |
|-------|-------|--------|--------|
| ... | ... | ... | ... |

## التكاليف المقدرة
| القسم | التكلفة (ريال) |
|-------|----------------|
| أعمال إنشائية | ... |
| أعمال تشطيبات | ... |
| أعمال MEP | ... |
| **المجموع** | **...** |

## الجدول الزمني
- المدة المقدرة: ... شهر
- تاريخ البدء المتوقع: ...
- تاريخ الانتهاء المتوقع: ...

## المخاطر المحتملة
1. ...
2. ...

## التوصيات
1. ...
2. ...

## الملاحق
- ملحق أ: جداول تفصيلية
- ملحق ب: مخططات
```
"""

    # ====================================================================
    # 9. Schedule Analysis - تحليل الجدول الزمني
    # ====================================================================
    
    SCHEDULE_ANALYSIS_PROMPT = """
أنت مخطط مشاريع خبير متخصص في تحليل الجداول الزمنية.

المهمة: حلل الجدول الزمني التالي:
{schedule_data}

نوع المشروع: {project_type}
مدة المشروع: {duration_months} شهر

التحليل المطلوب:
1. المسار الحرج (Critical Path)
2. الأنشطة المتوازية
3. التبعيات بين الأنشطة
4. الموارد المطلوبة
5. المخاطر الزمنية

الصيغة المطلوبة (JSON):
{{
  "schedule_summary": {{
    "total_activities": عدد_الأنشطة,
    "total_duration_days": المدة_الإجمالية_بالأيام,
    "critical_path_duration": مدة_المسار_الحرج,
    "float_days": أيام_الفلوت_المتاحة,
    "start_date": "تاريخ البدء",
    "end_date": "تاريخ الانتهاء"
  }},
  "critical_path": [
    {{
      "activity_id": "رقم النشاط",
      "activity_name": "اسم النشاط",
      "duration": المدة_بالأيام,
      "start_date": "تاريخ البدء",
      "end_date": "تاريخ الانتهاء",
      "float": أيام_الفلوت,
      "predecessors": ["الأنشطة السابقة"],
      "successors": ["الأنشطة اللاحقة"]
    }}
  ],
  "phases": [
    {{
      "phase_name": "اسم المرحلة",
      "duration": المدة_بالأيام,
      "activities_count": عدد_الأنشطة,
      "start_date": "تاريخ البدء",
      "end_date": "تاريخ الانتهاء"
    }}
  ],
  "resource_requirements": {{
    "peak_workforce": الحد_الأقصى_للعمالة,
    "peak_equipment": الحد_الأقصى_للمعدات,
    "critical_resources": ["الموارد الحرجة"]
  }},
  "risks": [
    {{
      "risk": "المخاطرة",
      "impact": "التأثير (high/medium/low)",
      "probability": "الاحتمالية (high/medium/low)",
      "mitigation": "خطة التخفيف"
    }}
  ],
  "milestones": [
    {{
      "milestone": "المعلم الرئيسي",
      "date": "التاريخ",
      "activities": ["الأنشطة المرتبطة"]
    }}
  ],
  "recommendations": ["قائمة التوصيات لتحسين الجدول"]
}}
"""

    # ====================================================================
    # Templates Registry
    # ====================================================================
    
    @classmethod
    def get_all_templates(cls) -> Dict[PromptType, PromptTemplate]:
        """Get all prompt templates"""
        return {
            PromptType.BASIC_QUANTITY: PromptTemplate(
                type=PromptType.BASIC_QUANTITY,
                name="Basic Quantity Extraction",
                name_ar="استخراج الكميات الأساسي",
                description="Extract basic quantities from documents",
                description_ar="استخراج الكميات الأساسية من المستندات",
                template=cls.BASIC_QUANTITY_PROMPT,
                variables=["document_text"],
                expected_output="JSON with items array"
            ),
            PromptType.ADVANCED_QUANTITY: PromptTemplate(
                type=PromptType.ADVANCED_QUANTITY,
                name="Advanced Quantity Extraction",
                name_ar="استخراج الكميات المتقدم",
                description="Advanced BOQ analysis with SBC compliance",
                description_ar="تحليل متقدم لـ BOQ مع التوافق مع SBC",
                template=cls.ADVANCED_QUANTITY_PROMPT,
                variables=["document_text"],
                expected_output="JSON with items, summary, and compliance"
            ),
            PromptType.IMAGE_ANALYSIS: PromptTemplate(
                type=PromptType.IMAGE_ANALYSIS,
                name="Image & Drawing Analysis",
                name_ar="تحليل الصور والمخططات",
                description="Analyze architectural and structural drawings",
                description_ar="تحليل المخططات المعمارية والإنشائية",
                template=cls.IMAGE_ANALYSIS_PROMPT,
                variables=["image_type", "analysis_purpose"],
                expected_output="JSON with drawing analysis"
            ),
            PromptType.COMPARISON: PromptTemplate(
                type=PromptType.COMPARISON,
                name="Document Comparison",
                name_ar="مقارنة المستندات",
                description="Compare and verify BOQ documents",
                description_ar="مقارنة والتحقق من مستندات BOQ",
                template=cls.COMPARISON_PROMPT,
                variables=["document1", "document2"],
                expected_output="JSON with comparison results"
            ),
            PromptType.COST_ESTIMATION: PromptTemplate(
                type=PromptType.COST_ESTIMATION,
                name="Cost Estimation",
                name_ar="تقدير التكاليف",
                description="Estimate costs with Saudi market prices",
                description_ar="تقدير التكاليف بأسعار السوق السعودي",
                template=cls.COST_ESTIMATION_PROMPT,
                variables=["items_list", "region", "project_type", "finish_level"],
                expected_output="JSON with cost breakdown"
            ),
            PromptType.MATERIALS: PromptTemplate(
                type=PromptType.MATERIALS,
                name="Materials Extraction",
                name_ar="استخراج المواد",
                description="Extract detailed materials list",
                description_ar="استخراج قائمة مفصلة بالمواد",
                template=cls.MATERIALS_PROMPT,
                variables=["boq_data"],
                expected_output="JSON with materials by category"
            ),
            PromptType.VALIDATION: PromptTemplate(
                type=PromptType.VALIDATION,
                name="BOQ Validation",
                name_ar="التحقق من BOQ",
                description="Validate BOQ for accuracy and compliance",
                description_ar="التحقق من دقة وتوافق BOQ",
                template=cls.VALIDATION_PROMPT,
                variables=["items_to_validate"],
                expected_output="JSON with validation results"
            ),
            PromptType.REPORT_GENERATION: PromptTemplate(
                type=PromptType.REPORT_GENERATION,
                name="Report Generation",
                name_ar="إنشاء التقارير",
                description="Generate professional reports",
                description_ar="إنشاء تقارير احترافية",
                template=cls.REPORT_GENERATION_PROMPT,
                variables=["data", "report_type", "audience"],
                expected_output="Markdown formatted report"
            ),
            PromptType.SCHEDULE_ANALYSIS: PromptTemplate(
                type=PromptType.SCHEDULE_ANALYSIS,
                name="Schedule Analysis",
                name_ar="تحليل الجدول الزمني",
                description="Analyze project schedules and critical path",
                description_ar="تحليل الجداول الزمنية والمسار الحرج",
                template=cls.SCHEDULE_ANALYSIS_PROMPT,
                variables=["schedule_data", "project_type", "duration_months"],
                expected_output="JSON with schedule analysis"
            )
        }
    
    @classmethod
    def get_template(cls, prompt_type: PromptType) -> PromptTemplate:
        """Get specific prompt template"""
        templates = cls.get_all_templates()
        return templates.get(prompt_type)
    
    @classmethod
    def format_prompt(cls, prompt_type: PromptType, **kwargs) -> str:
        """Format prompt with variables"""
        template = cls.get_template(prompt_type)
        if not template:
            raise ValueError(f"Unknown prompt type: {prompt_type}")
        
        try:
            return template.template.format(**kwargs)
        except KeyError as e:
            raise ValueError(f"Missing required variable for prompt: {e}")
    
    @classmethod
    def get_prompt_info(cls, prompt_type: PromptType) -> Dict[str, Any]:
        """Get prompt template information"""
        template = cls.get_template(prompt_type)
        if not template:
            return None
        
        return {
            "type": template.type.value,
            "name": template.name,
            "name_ar": template.name_ar,
            "description": template.description,
            "description_ar": template.description_ar,
            "variables": template.variables,
            "expected_output": template.expected_output
        }
    
    @classmethod
    def list_all_prompts(cls) -> List[Dict[str, Any]]:
        """List all available prompts"""
        templates = cls.get_all_templates()
        return [
            {
                "type": template.type.value,
                "name": template.name,
                "name_ar": template.name_ar,
                "description": template.description,
                "description_ar": template.description_ar,
                "variables": template.variables
            }
            for template in templates.values()
        ]
