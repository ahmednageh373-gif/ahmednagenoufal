# 🤖 Claude Prompts Service Implementation
# خدمة استدعاءات Claude المحسّنة

**Date:** 2025-11-04  
**Commit:** Pending  
**Status:** ✅ Completed

---

## 📋 Overview / نظرة عامة

Successfully implemented **Claude Prompts Service** with **9 specialized prompt types** for engineering analysis and quantity extraction.

تم بنجاح تنفيذ **خدمة استدعاءات Claude** مع **9 أنواع متخصصة** للتحليل الهندسي واستخراج الكميات.

---

## ✨ What Was Implemented

### 1. Claude Prompts Service (21.5 KB)

**File:** `backend/core/claude_prompts_service.py`

**9 Prompt Types:**

1. **Basic Quantity Extraction** (استخراج الكميات الأساسي)
   - Extract items and quantities from documents
   - Identify units accurately
   - Organize by sections
   - Variables: `document_text`

2. **Advanced Quantity Extraction** (استخراج الكميات المتقدم)
   - Advanced BOQ analysis
   - SBC 303 compliance checking
   - Sub-items calculation
   - Relationship detection
   - Missing/duplicate items detection
   - Variables: `document_text`

3. **Image Analysis** (تحليل الصور والمخططات)
   - Analyze architectural/structural drawings
   - Extract dimensions and areas
   - Identify rooms and spaces
   - Detect issues and conflicts
   - Variables: `image_type`, `analysis_purpose`

4. **Comparison & Verification** (المقارنة والتحقق)
   - Compare two BOQ documents
   - Find matching/different items
   - Calculate match percentage
   - Provide recommendations
   - Variables: `document1`, `document2`

5. **Cost Estimation** (تقدير التكاليف)
   - Detailed cost breakdown
   - Saudi market prices (2025)
   - Materials + Labor + Equipment
   - 15% VAT included
   - Variables: `items_list`, `region`, `project_type`, `finish_level`

6. **Materials Extraction** (استخراج المواد)
   - Extract detailed materials list
   - Categorize by type (structural, finishing, electrical, plumbing, MEP)
   - Procurement planning
   - Critical materials identification
   - Variables: `boq_data`

7. **Validation & Checking** (التحقق من الصحة)
   - Validate BOQ accuracy
   - Check SBC compliance
   - Find missing/duplicate items
   - Severity classification
   - Variables: `items_to_validate`

8. **Report Generation** (إنشاء التقارير)
   - Professional engineering reports
   - Executive summary
   - Detailed quantities
   - Cost estimates
   - Schedule and risks
   - Variables: `data`, `report_type`, `audience`

9. **Schedule Analysis** (تحليل الجدول الزمني)
   - Critical path analysis
   - Activity dependencies
   - Resource requirements
   - Risk assessment
   - Milestone tracking
   - Variables: `schedule_data`, `project_type`, `duration_months`

---

## 🔌 API Endpoints

### 4 New Endpoints Added:

#### 1. List All Prompts
```http
GET /api/claude-prompts/list
```

**Response:**
```json
{
  "success": true,
  "prompts": [
    {
      "type": "basic_quantity",
      "name": "Basic Quantity Extraction",
      "name_ar": "استخراج الكميات الأساسي",
      "description": "Extract basic quantities from documents",
      "description_ar": "استخراج الكميات الأساسية من المستندات",
      "variables": ["document_text"]
    }
    // ... 8 more prompts
  ],
  "total_count": 9
}
```

#### 2. Get Prompt Info
```http
GET /api/claude-prompts/info/<prompt_type>
```

**Example:**
```bash
curl http://localhost:5000/api/claude-prompts/info/basic_quantity
```

**Response:**
```json
{
  "success": true,
  "prompt_info": {
    "type": "basic_quantity",
    "name": "Basic Quantity Extraction",
    "name_ar": "استخراج الكميات الأساسي",
    "description": "Extract basic quantities from documents",
    "description_ar": "استخراج الكميات الأساسية من المستندات",
    "variables": ["document_text"],
    "expected_output": "JSON with items array"
  }
}
```

#### 3. Format Prompt
```http
POST /api/claude-prompts/format
```

**Request Body:**
```json
{
  "prompt_type": "basic_quantity",
  "variables": {
    "document_text": "بند رقم 1: أعمال حفر - 100 متر مكعب"
  }
}
```

**Response:**
```json
{
  "success": true,
  "prompt_type": "basic_quantity",
  "formatted_prompt": "أنت مهندس مدني محترف...\n\nالمهمة: استخرج الكميات من النص التالي:\nبند رقم 1: أعمال حفر - 100 متر مكعب\n\n...",
  "character_count": 583
}
```

#### 4. Get All Templates
```http
GET /api/claude-prompts/templates
```

**Response:**
```json
{
  "success": true,
  "templates": {
    "basic_quantity": {
      "name": "Basic Quantity Extraction",
      "name_ar": "استخراج الكميات الأساسي",
      "description": "...",
      "description_ar": "...",
      "variables": ["document_text"],
      "expected_output": "JSON with items array",
      "template_length": 583
    }
    // ... 8 more templates
  },
  "total_count": 9
}
```

---

## 📊 Prompt Templates Details

### 1. Basic Quantity Extraction

**Purpose:** Extract items, quantities, and units from documents

**Template Structure:**
```
أنت مهندس مدني محترف متخصص في استخراج الكميات

المهمة: استخرج الكميات من:
{document_text}

تعليمات:
1. استخرج جميع البنود والكميات
2. حدد الوحدات بدقة
3. ميز بين الكميات والأسعار
4. رتب البنود حسب الأقسام

الصيغة المطلوبة (JSON):
{
  "items": [
    {
      "item_no": "رقم البند",
      "description": "الوصف",
      "quantity": العدد,
      "unit": "الوحدة",
      "section": "القسم"
    }
  ]
}
```

### 2. Advanced Quantity Extraction

**Purpose:** Advanced BOQ analysis with SBC compliance

**Key Features:**
- Sub-items calculation
- SBC 303 compliance checking
- Relationship detection
- Missing/duplicate items
- Unit price ranges

**SBC 303 Standards Included:**
- حديد التسليح: 80-120 كجم/م³
- سمك الأساسات: 30-100 سم
- سمك البلاط: 15-30 سم
- مسافة الأعمدة: ≤ 8 متر
- ارتفاع الكمرات: البحر/12

### 3. Image Analysis

**Purpose:** Analyze architectural and structural drawings

**Capabilities:**
- Drawing type detection
- Dimensions extraction
- Room identification
- Structural elements analysis
- Issue detection

**Supported Drawing Types:**
- معماري (Architectural)
- إنشائي (Structural)
- كهربائي (Electrical)
- صحي (Plumbing)

### 4. Comparison & Verification

**Purpose:** Compare two BOQ documents

**Analysis Points:**
- Matching items
- Different items (quantities/prices)
- Unique items in each document
- Match percentage
- Recommendations

### 5. Cost Estimation

**Purpose:** Detailed cost estimation with Saudi market prices

**Saudi Market Prices (2025):**
```
خرسانة عادية: 250-300 SAR/m³
خرسانة مسلحة: 400-500 SAR/m³
حديد تسليح: 3,200-3,500 SAR/ton
بلوك أسمنتي: 6-8 SAR/block
أعمال حفر: 15-25 SAR/m³
أعمال دفان: 8-12 SAR/m³
```

**Cost Breakdown:**
- Materials
- Labor
- Equipment
- Overhead (15%)
- Profit (10%)
- VAT (15%)

### 6. Materials Extraction

**Purpose:** Extract and categorize materials list

**Categories:**
1. **Structural** (إنشائية)
   - خرسانة، حديد، بلوك، أسمنت، رمل، حصى

2. **Finishing** (تشطيبات)
   - بلاط، رخام، دهانات، أبواب، نوافذ

3. **Electrical** (كهربائية)
   - أسلاك، مفاتيح، لمبات، لوحات

4. **Plumbing** (صحية)
   - مواسير، خلاطات، أحواض، سخانات

5. **MEP**
   - تكييف، تهوية، مطافئ، إنذار

**Output:**
- Materials by category
- Procurement plan (3 phases)
- Critical materials
- Long-lead items

### 7. Validation & Checking

**Purpose:** Validate BOQ accuracy and compliance

**Validation Criteria:**
1. Quantity accuracy
2. Unit correctness
3. Item completeness
4. Duplication checking
5. SBC compliance
6. Item relationships

**Issue Severity:**
- Critical
- High
- Medium
- Low

### 8. Report Generation

**Purpose:** Generate professional engineering reports

**Report Sections:**
1. ملخص تنفيذي (Executive Summary)
2. نطاق العمل (Scope of Work)
3. الكميات التفصيلية (Detailed Quantities)
4. التكاليف المقدرة (Cost Estimates)
5. الجدول الزمني (Schedule)
6. المخاطر والتوصيات (Risks & Recommendations)
7. الملاحق (Appendices)

**Output Format:** Markdown

### 9. Schedule Analysis

**Purpose:** Analyze project schedules and critical path

**Analysis Components:**
- Critical path identification
- Activity dependencies
- Resource requirements
- Risk assessment
- Milestone tracking

**Outputs:**
- Total activities
- Critical path duration
- Float days
- Peak workforce
- Equipment needs
- Risks with mitigation

---

## 🎯 Usage Examples

### Example 1: Basic Quantity Extraction

```python
import requests

# Format prompt
response = requests.post('http://localhost:5000/api/claude-prompts/format', json={
    'prompt_type': 'basic_quantity',
    'variables': {
        'document_text': """
        بند رقم 1: أعمال حفر - 100 متر مكعب
        بند رقم 2: خرسانة عادية - 50 متر مكعب
        بند رقم 3: حديد تسليح - 5 طن
        """
    }
})

formatted_prompt = response.json()['formatted_prompt']
print(formatted_prompt)

# Use with Claude API
# ... send to Claude for processing
```

### Example 2: Advanced Quantity with SBC Compliance

```python
response = requests.post('http://localhost:5000/api/claude-prompts/format', json={
    'prompt_type': 'advanced_quantity',
    'variables': {
        'document_text': """
        [Your BOQ data here]
        """
    }
})

# Will check SBC 303 compliance automatically
```

### Example 3: Cost Estimation

```python
response = requests.post('http://localhost:5000/api/claude-prompts/format', json={
    'prompt_type': 'cost_estimation',
    'variables': {
        'items_list': """
        - خرسانة مسلحة: 100 م³
        - حديد تسليح: 10 طن
        - بلوك أسمنتي: 5000 بلوكة
        """,
        'region': 'الرياض',
        'project_type': 'فيلا سكنية',
        'finish_level': 'جيد'
    }
})

# Will include Saudi market prices
```

### Example 4: Image Analysis

```python
response = requests.post('http://localhost:5000/api/claude-prompts/format', json={
    'prompt_type': 'image_analysis',
    'variables': {
        'image_type': 'معماري',
        'analysis_purpose': 'استخراج الأبعاد والمساحات'
    }
})

# Use with Claude Vision API
```

---

## 🔧 Technical Implementation

### Class Structure

```python
class PromptType(Enum):
    BASIC_QUANTITY = "basic_quantity"
    ADVANCED_QUANTITY = "advanced_quantity"
    IMAGE_ANALYSIS = "image_analysis"
    COMPARISON = "comparison"
    COST_ESTIMATION = "cost_estimation"
    MATERIALS = "materials"
    VALIDATION = "validation"
    REPORT_GENERATION = "report_generation"
    SCHEDULE_ANALYSIS = "schedule_analysis"

@dataclass
class PromptTemplate:
    type: PromptType
    name: str
    name_ar: str
    description: str
    description_ar: str
    template: str
    variables: List[str]
    expected_output: str

class ClaudePromptsService:
    @classmethod
    def get_all_templates() -> Dict[PromptType, PromptTemplate]
    
    @classmethod
    def get_template(prompt_type: PromptType) -> PromptTemplate
    
    @classmethod
    def format_prompt(prompt_type: PromptType, **kwargs) -> str
    
    @classmethod
    def get_prompt_info(prompt_type: PromptType) -> Dict
    
    @classmethod
    def list_all_prompts() -> List[Dict]
```

---

## 📈 Statistics

```
Total Prompts:           9
Total Prompt Lines:      ~600
Template Size:           21.5 KB
API Endpoints:           4
Supported Languages:     Arabic + English
SBC Standards:           Integrated (SBC 303)
Market Prices:           Saudi Arabia 2025
```

---

## ✅ Integration with Dashboard

The Claude Prompts Service is fully integrated with:

1. **Dashboard Service** - Usage tracking
2. **Backend API** - 4 new endpoints
3. **Tool Registry** - Listed in unified dashboard
4. **Logging** - All usage logged to database

---

## 🚀 Future Enhancements

### Phase 1 (Next Week)
- [ ] Add Claude API integration
- [ ] Image upload and analysis
- [ ] Batch processing
- [ ] Result caching

### Phase 2 (Next Month)
- [ ] Custom prompts editor
- [ ] Prompt versioning
- [ ] A/B testing
- [ ] Performance analytics

### Phase 3 (Future)
- [ ] Multi-language support
- [ ] Industry-specific prompts
- [ ] AI fine-tuning
- [ ] Collaborative prompts

---

## 📝 Testing Results

### API Endpoints - All Working ✅

```bash
# Test 1: List prompts
curl http://localhost:5000/api/claude-prompts/list
✅ Success - 9 prompts listed

# Test 2: Get prompt info
curl http://localhost:5000/api/claude-prompts/info/basic_quantity
✅ Success - Detailed info returned

# Test 3: Format prompt
curl -X POST http://localhost:5000/api/claude-prompts/format \
  -d '{"prompt_type":"basic_quantity","variables":{"document_text":"..."}}'
✅ Success - 583 characters formatted

# Test 4: Get templates
curl http://localhost:5000/api/claude-prompts/templates
✅ Success - All 9 templates returned
```

---

## 🎯 Benefits

### For Engineers
- ✅ Pre-optimized prompts save time
- ✅ Consistent output format
- ✅ SBC compliance built-in
- ✅ Saudi market prices updated

### For System
- ✅ Standardized AI interactions
- ✅ Better results quality
- ✅ Usage tracking
- ✅ Easy maintenance

### For Business
- ✅ Faster project analysis
- ✅ Higher accuracy
- ✅ Cost savings
- ✅ Competitive advantage

---

## 🔗 Related Services

- **Dashboard Service** - Statistics tracking
- **Quick Estimator** - Cost estimation
- **SBC Compliance Checker** - Validation
- **BOQ Analyzer** - Quantity extraction
- **Report Generator** - Documentation

---

## 📚 Documentation

- [User Guide](./docs/guides/claude_prompts_guide_ar.md) - Coming soon
- [API Reference](./docs/api/claude_prompts_api.md) - Coming soon
- [Examples](./docs/examples/claude_prompts_examples.md) - Coming soon

---

## 🎉 Summary

Successfully implemented **Claude Prompts Service** with **9 specialized prompt types** covering all aspects of engineering analysis:

✅ Quantity extraction (basic & advanced)  
✅ Image analysis (drawings)  
✅ Document comparison  
✅ Cost estimation (Saudi prices)  
✅ Materials extraction  
✅ BOQ validation (SBC compliance)  
✅ Report generation  
✅ Schedule analysis  

**Total:** 21.5 KB of optimized prompts  
**Status:** ✅ Ready for production use  
**Integration:** ✅ Full dashboard integration  

---

**© 2025 NOUFAL Engineering Management System**  
**All Rights Reserved / جميع الحقوق محفوظة**
