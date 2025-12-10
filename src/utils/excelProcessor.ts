/**
 * ═══════════════════════════════════════════════════════════════
 * Excel File Processor Utility
 * معالج ملفات Excel - إصلاح مشكلة معالجة BOQ
 * ═══════════════════════════════════════════════════════════════
 * 
 * This utility provides robust Excel file processing with:
 * - Dynamic column mapping (Arabic/English)
 * - Large file support (400+ items tested)
 * - Accurate cost calculations
 * - Error handling and validation
 * 
 * Bug Fix: Resolves issue where 400 items were showing as only 3
 */

import * as XLSX from 'xlsx';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface BOQItem {
  code: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
}

export interface ProcessedBOQData {
  items: BOQItem[];
  totalItems: number;
  totalCost: number;
  averageCost: number;
  categories: Record<string, number>;
}

interface ColumnMapping {
  code: number | null;
  description: number | null;
  unit: number | null;
  quantity: number | null;
  unitPrice: number | null;
  category: number | null;
}

// ═══════════════════════════════════════════════════════════════
// Column Mapping Configurations
// ═══════════════════════════════════════════════════════════════

const COLUMN_NAMES = {
  code: ['كود', 'code', 'item', 'بند', 'رقم', 'item no', 'no', 'رقم البند'],
  description: [
    'وصف',
    'description',
    'بيان',
    'item description',
    'الوصف',
    'البيان',
    'اسم البند',
    'name',
  ],
  unit: ['وحدة', 'unit', 'uom', 'وحدة القياس', 'الوحدة', 'units'],
  quantity: ['كمية', 'quantity', 'qty', 'الكمية', 'العدد', 'count'],
  unitPrice: [
    'سعر الوحدة',
    'unit price',
    'rate',
    'السعر',
    'سعر',
    'price',
    'unit rate',
    'معدل',
  ],
  category: [
    'تصنيف',
    'category',
    'type',
    'النوع',
    'الفئة',
    'التصنيف',
    'class',
    'group',
  ],
};

// ═══════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════

/**
 * Find column index by matching possible names
 */
function findColumnIndex(
  headers: any[],
  possibleNames: string[]
): number | null {
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i]?.toString().toLowerCase().trim();
    if (!header) continue;

    for (const name of possibleNames) {
      if (header.includes(name.toLowerCase())) {
        return i;
      }
    }
  }
  return null;
}

/**
 * Get cell value safely with type conversion
 */
function getCellValue(row: any[], columnIndex: number | null): string {
  if (columnIndex === null || columnIndex >= row.length) {
    return '';
  }
  const value = row[columnIndex];
  return value !== null && value !== undefined ? value.toString().trim() : '';
}

/**
 * Parse numeric value from cell
 */
function parseNumericValue(value: string): number {
  if (!value) return 0;
  
  // Remove commas and Arabic numbers
  const cleaned = value
    .replace(/,/g, '')
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Categorize BOQ item based on description
 */
function categorizeItem(description: string): string {
  const desc = description.toLowerCase();

  // Arabic categories
  if (desc.includes('خرسانة') || desc.includes('concrete')) {
    return 'الأعمال الخرسانية';
  }
  if (desc.includes('حديد') || desc.includes('steel') || desc.includes('تسليح')) {
    return 'أعمال الحديد';
  }
  if (desc.includes('بلاط') || desc.includes('tile') || desc.includes('سيراميك')) {
    return 'أعمال البلاط';
  }
  if (desc.includes('دهان') || desc.includes('paint')) {
    return 'أعمال الدهانات';
  }
  if (desc.includes('كهرباء') || desc.includes('electric')) {
    return 'أعمال الكهرباء';
  }
  if (desc.includes('سباكة') || desc.includes('plumb')) {
    return 'أعمال السباكة';
  }
  if (desc.includes('ألومنيوم') || desc.includes('aluminum') || desc.includes('نجارة')) {
    return 'أعمال الألومنيوم والنجارة';
  }
  if (desc.includes('بناء') || desc.includes('mason') || desc.includes('بلوك')) {
    return 'أعمال البناء';
  }
  if (desc.includes('تشطيب') || desc.includes('finish')) {
    return 'أعمال التشطيبات';
  }
  if (desc.includes('حفر') || desc.includes('excavat')) {
    return 'أعمال الحفر';
  }

  return 'أخرى';
}

// ═══════════════════════════════════════════════════════════════
// Main Processing Functions
// ═══════════════════════════════════════════════════════════════

/**
 * Read and parse Excel/CSV file
 */
export async function readExcelFile(file: File): Promise<any[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let parsedData: any[][];

        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          // Process Excel file
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        } else if (file.name.endsWith('.csv')) {
          // Process CSV file
          const workbook = XLSX.read(data, { type: 'string' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        } else {
          reject(new Error('Unsupported file format'));
          return;
        }

        resolve(parsedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    // Read file as binary string
    reader.readAsBinaryString(file);
  });
}

/**
 * Process BOQ data from Excel rows
 */
export function processBOQData(data: any[][]): ProcessedBOQData {
  if (!data || data.length < 2) {
    throw new Error('File does not contain sufficient data');
  }

  // Extract headers and rows
  const headers = data[0];
  const rows = data.slice(1);

  // Map columns dynamically
  const columnMap: ColumnMapping = {
    code: findColumnIndex(headers, COLUMN_NAMES.code),
    description: findColumnIndex(headers, COLUMN_NAMES.description),
    unit: findColumnIndex(headers, COLUMN_NAMES.unit),
    quantity: findColumnIndex(headers, COLUMN_NAMES.quantity),
    unitPrice: findColumnIndex(headers, COLUMN_NAMES.unitPrice),
    category: findColumnIndex(headers, COLUMN_NAMES.category),
  };

  console.log('📊 Column Mapping:', columnMap);

  // Process each row
  const items: BOQItem[] = [];
  let totalCost = 0;
  const categoryCosts: Record<string, number> = {};

  rows.forEach((row, index) => {
    // Skip empty rows
    if (!row || row.length === 0 || row.every((cell) => !cell)) {
      return;
    }

    // Extract values
    const description = getCellValue(row, columnMap.description) || `بند غير محدد ${index + 1}`;
    const quantityStr = getCellValue(row, columnMap.quantity);
    const priceStr = getCellValue(row, columnMap.unitPrice);

    const quantity = parseNumericValue(quantityStr);
    const unitPrice = parseNumericValue(priceStr);

    // Skip items with invalid data
    if (quantity <= 0 || unitPrice <= 0) {
      return;
    }

    const totalPrice = quantity * unitPrice;
    const category =
      getCellValue(row, columnMap.category) || categorizeItem(description);

    const item: BOQItem = {
      code: getCellValue(row, columnMap.code) || `ITEM-${String(index + 1).padStart(3, '0')}`,
      description,
      unit: getCellValue(row, columnMap.unit) || 'قطعة',
      quantity,
      unitPrice,
      totalPrice,
      category,
    };

    items.push(item);
    totalCost += totalPrice;

    // Track category costs
    categoryCosts[category] = (categoryCosts[category] || 0) + totalPrice;
  });

  console.log(`✅ Processed ${items.length} BOQ items`);
  console.log(`💰 Total Cost: ${totalCost.toLocaleString()} SAR`);

  return {
    items,
    totalItems: items.length,
    totalCost,
    averageCost: items.length > 0 ? totalCost / items.length : 0,
    categories: categoryCosts,
  };
}

/**
 * Main function to process BOQ file
 */
export async function processBOQFile(file: File): Promise<ProcessedBOQData> {
  try {
    console.log('📂 Processing file:', file.name);
    
    // Read file
    const data = await readExcelFile(file);
    
    // Process data
    const result = processBOQData(data);
    
    return result;
  } catch (error) {
    console.error('❌ Error processing BOQ file:', error);
    throw error;
  }
}

/**
 * Export BOQ data to Excel
 */
export function exportBOQToExcel(data: ProcessedBOQData, filename: string = 'boq_processed.xlsx'): void {
  // Prepare data for export
  const exportData = [
    ['الكود', 'الوصف', 'الوحدة', 'الكمية', 'سعر الوحدة', 'الإجمالي', 'التصنيف'],
    ...data.items.map((item) => [
      item.code,
      item.description,
      item.unit,
      item.quantity,
      item.unitPrice,
      item.totalPrice,
      item.category,
    ]),
  ];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(exportData);
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'BOQ');
  
  // Download file
  XLSX.writeFile(wb, filename);
}
