# BOQ Extended Fields Documentation

## 🎯 Overview

تم إضافة 3 حقول جديدة ضرورية لنظام المقايسات لدعم التنسيقات الحكومية والتعاقدية السعودية.

## ✨ New Fields

### 1. Item Number (الرقم التسلسلي)
- **Field Name:** `itemNumber`
- **Type:** `string` (optional)
- **Arabic Name:** الرقم التسلسلي
- **Description:** Sequential item number for BOQ items
- **Example:** "1", "2", "3", etc.
- **Used in:** Government contracts, official BOQ formats

### 2. Construction Code (الكود/الرمز الإنشائي)
- **Field Name:** `code`
- **Type:** `string` (optional)
- **Arabic Name:** الكود / الرمز الإنشائي
- **Description:** Official construction code based on Saudi standards
- **Example:** "2007", "2011", "2017", etc.
- **Used in:** Saudi construction standards, government projects

### 3. Category (الفئة)
- **Field Name:** `category`
- **Type:** `string` (optional)
- **Arabic Name:** الفئة
- **Description:** Item category or classification
- **Example:** "1", "2", "3", etc.
- **Used in:** Item grouping, reporting, analysis

## 📊 BOQ Structure Example

### القصيم - التعاقدي Format

Based on the analyzed file structure:

```
| الرقم التسلسلي | الفئة | البند | وصف البند | الرمز الإنشائي | الكمية | سعر الوحدة | الإجمالي |
|---------------|------|-------|-----------|----------------|--------|-----------|----------|
| 1             | 1    | ...   | ...       | 2007           | 100    | 50        | 5000     |
```

**Column Mapping:**
- **Col 4:** الرقم التسلسلي → `itemNumber`
- **Col 5:** الفئة → `category`
- **Col 6:** البند → Main item ID
- **Col 7:** وصف البند → `item` (description)
- **Col 10:** الرمز الإنشائي → `code`
- **Col 12:** وحدة القياس → `unit`
- **Col 13:** الكمية → `quantity`
- **Col 14:** سعر الوحدة → `unitPrice`
- **Col 15:** الإجمالي → `total`

## 🔍 Auto-Detection Keywords

The system now automatically detects these fields using the following keywords:

### itemNumber Keywords:
- Arabic: `رقم تسلسلي`, `تسلسلي`
- English: `itemnum`, `item number`, `serial`

### code Keywords:
- Arabic: `كود`, `رمز`, `إنشائي`
- English: `code`, `construction code`

### category Keywords:
- Arabic: `فئة`
- English: `category`, `class`

## 💾 Excel Export Format

When exporting BOQ to Excel, the following columns are included (in order):

1. **الرقم التسلسلي** (Item Number)
2. **الكود** (Code)
3. **الفئة** (Category)
4. **رقم البند** (ID)
5. **الوصف** (Description)
6. **الوحدة** (Unit)
7. **الكمية** (Quantity)
8. **سعر الوحدة** (Unit Price)
9. **الإجمالي** (Total)

## 🎨 UI Changes

### BOQ Table
The BOQ table now displays 10 columns (including the new fields):

```
| # | رقم البند | الكود | الفئة | الوصف | الوحدة | الكمية | سعر الوحدة | الإجمالي | إجراء |
```

Each field is fully editable with inline input fields.

### Manual Column Mapper
The manual column mapper now includes 9 column selectors:

**Required (2):**
1. عمود الوصف/البند (Description) - Required
2. عمود الكمية (Quantity) - Required

**Optional (7):**
3. عمود الوحدة (Unit)
4. عمود سعر الوحدة (Unit Price)
5. عمود الإجمالي (Total)
6. عمود الرقم التسلسلي (Item Number) - **NEW**
7. عمود الكود/الرمز الإنشائي (Code) - **NEW**
8. عمود الفئة (Category) - **NEW**
9. عمود رقم البند (ID)

## 🔧 TypeScript Interface

```typescript
export interface FinancialItem {
    id: string;
    itemNumber?: string;        // NEW: الرقم التسلسلي - Item Number
    code?: string;              // NEW: الكود/الرمز الإنشائي - Construction Code
    category?: string;          // NEW: الفئة - Category
    item: string;               // وصف البند - Description
    quantity: number;           // الكمية - Quantity
    unit: string;               // وحدة القياس - Unit of Measurement
    unitPrice: number;          // سعر الوحدة - Unit Price
    total: number;              // الإجمالي - Total
}
```

## 📝 Usage Examples

### Creating a New Item

```typescript
const newItem: FinancialItem = {
    id: 'f-manual-123',
    itemNumber: '1',
    code: '2007',
    category: '1',
    item: 'خرسانة مسلحة للأساسات',
    unit: 'م3',
    quantity: 100,
    unitPrice: 500,
    total: 50000
};
```

### Importing from Excel

The system automatically detects and maps columns based on header keywords. If auto-detection fails, the user can manually select columns through the interactive UI.

### Exporting to Excel

```typescript
exportToExcel(financials, 'BOQ_Export');
```

This will create an Excel file with all 9 columns including the new fields.

## ✅ Compatibility

### Backward Compatibility
- All new fields are **optional** (`?` in TypeScript)
- Existing BOQ data without these fields will continue to work
- Old Excel files will import correctly (new fields will be `undefined`)

### Forward Compatibility
- New BOQ files with extended fields are fully supported
- Auto-detection works for both old and new formats
- Manual column mapping provides flexibility for any format

## 🎯 User Request Addressed

This implementation addresses the user request:
> "رقم البند ضروري والكود اكمل"
> (Item number is necessary and complete the code)

All three fields (itemNumber, code, category) are now fully integrated into:
- ✅ Data structure (TypeScript interface)
- ✅ Excel import (auto-detection and manual mapping)
- ✅ Excel export (all 9 fields)
- ✅ UI table (editable columns)
- ✅ Manual column mapper (3 new selectors)
- ✅ Data persistence (localStorage)

## 📚 Related Files

- `types.ts` - Interface definitions
- `BOQManualManager.tsx` - Main component with all logic
- `FEATURES.md` - General features documentation
- `SETUP.md` - Setup and configuration guide

---

**Last Updated:** 2025-11-01
**Version:** 1.0.0
**Author:** GenSpark AI Development Team
