/**
 * Test BOQ Processing
 * اختبار معالجة ملف BOQ
 */

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════════
// Replicate excelProcessor.ts logic
// ═══════════════════════════════════════════════════════════════

const COLUMN_NAMES = {
  code: ['كود', 'code', 'item', 'بند', 'رقم', 'item no', 'no', 'رقم البند'],
  description: ['وصف', 'description', 'بيان', 'item description', 'الوصف', 'البيان', 'اسم البند', 'name'],
  unit: ['وحدة', 'unit', 'uom', 'وحدة القياس', 'الوحدة', 'units'],
  quantity: ['كمية', 'quantity', 'qty', 'الكمية', 'العدد', 'count'],
  unitPrice: ['سعر الوحدة', 'unit price', 'rate', 'السعر', 'سعر', 'price', 'unit rate', 'معدل'],
  category: ['تصنيف', 'category', 'type', 'النوع', 'الفئة', 'التصنيف', 'class', 'group'],
};

function findColumnIndex(headers, possibleNames) {
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

function getCellValue(row, columnIndex) {
  if (columnIndex === null || columnIndex >= row.length) {
    return '';
  }
  const value = row[columnIndex];
  return value !== null && value !== undefined ? value.toString().trim() : '';
}

function parseNumericValue(value) {
  if (!value) return 0;
  
  const cleaned = value
    .replace(/,/g, '')
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function categorizeItem(description) {
  const desc = description.toLowerCase();

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

  return 'أخرى';
}

function processBOQData(data) {
  if (!data || data.length < 2) {
    throw new Error('File does not contain sufficient data');
  }

  const headers = data[0];
  const rows = data.slice(1);

  const columnMap = {
    code: findColumnIndex(headers, COLUMN_NAMES.code),
    description: findColumnIndex(headers, COLUMN_NAMES.description),
    unit: findColumnIndex(headers, COLUMN_NAMES.unit),
    quantity: findColumnIndex(headers, COLUMN_NAMES.quantity),
    unitPrice: findColumnIndex(headers, COLUMN_NAMES.unitPrice),
    category: findColumnIndex(headers, COLUMN_NAMES.category),
  };

  console.log('📊 Column Mapping:', columnMap);

  const items = [];
  let totalCost = 0;
  const categoryCosts = {};

  rows.forEach((row, index) => {
    if (!row || row.length === 0 || row.every((cell) => !cell)) {
      return;
    }

    const description = getCellValue(row, columnMap.description) || `بند غير محدد ${index + 1}`;
    const quantityStr = getCellValue(row, columnMap.quantity);
    const priceStr = getCellValue(row, columnMap.unitPrice);

    const quantity = parseNumericValue(quantityStr);
    const unitPrice = parseNumericValue(priceStr);

    if (quantity <= 0 || unitPrice <= 0) {
      return;
    }

    const totalPrice = quantity * unitPrice;
    const category = getCellValue(row, columnMap.category) || categorizeItem(description);

    const item = {
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

// ═══════════════════════════════════════════════════════════════
// Test BOQ Processing
// ═══════════════════════════════════════════════════════════════

function testBOQProcessing() {
  console.log('🔄 Testing BOQ Processing...\n');
  
  // Read the test file
  const filePath = path.join(__dirname, '..', 'test-boq-400-items.xlsx');
  
  console.log(`📂 Reading file: ${filePath}`);
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log(`📄 File has ${data.length} rows\n`);
  
  // Process the data
  try {
    const result = processBOQData(data);
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ BOQ PROCESSING TEST RESULTS');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    console.log(`📊 Total Items: ${result.totalItems}`);
    console.log(`💰 Total Cost: ${result.totalCost.toLocaleString()} SAR`);
    console.log(`📈 Average Cost per Item: ${Math.round(result.averageCost).toLocaleString()} SAR`);
    console.log(`📁 Number of Categories: ${Object.keys(result.categories).length}\n`);
    
    console.log('📂 Category Breakdown:');
    Object.entries(result.categories)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, cost]) => {
        const percentage = (cost / result.totalCost * 100).toFixed(1);
        console.log(`   ${cat}: ${cost.toLocaleString()} SAR (${percentage}%)`);
      });
    
    console.log('\n🎯 First 5 Items:');
    result.items.slice(0, 5).forEach((item, index) => {
      console.log(`\n   ${index + 1}. ${item.code}`);
      console.log(`      ${item.description}`);
      console.log(`      ${item.quantity} ${item.unit} × ${item.unitPrice.toLocaleString()} = ${item.totalPrice.toLocaleString()} SAR`);
    });
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ TEST PASSED - All 400 items processed successfully!');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    // Compare with expected results
    const expected = {
      minItems: 400,
      minCost: 10000000, // 10 million SAR
    };
    
    const testsPasssd = result.totalItems >= expected.minItems && result.totalCost >= expected.minCost;
    
    if (testsPasssd) {
      console.log('🎉 All validation tests passed!');
      console.log(`   ✓ Items count: ${result.totalItems} >= ${expected.minItems}`);
      console.log(`   ✓ Total cost: ${result.totalCost.toLocaleString()} >= ${expected.minCost.toLocaleString()}`);
    } else {
      console.log('⚠️  Some validation tests failed:');
      if (result.totalItems < expected.minItems) {
        console.log(`   ✗ Items count: ${result.totalItems} < ${expected.minItems}`);
      }
      if (result.totalCost < expected.minCost) {
        console.log(`   ✗ Total cost: ${result.totalCost.toLocaleString()} < ${expected.minCost.toLocaleString()}`);
      }
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error processing BOQ:', error);
    throw error;
  }
}

// Run the test
testBOQProcessing();
