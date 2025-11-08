/**
 * قراءة ومعالجة ملف مقايسات القصيم
 * Read and process Al-Qassim BOQ Excel file
 */

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// قراءة ملف Excel
const workbook = XLSX.readFile('qassim-boq.xlsx');

console.log('\n═══════════════════════════════════════════════════════════');
console.log('  📊 تحليل ملف مقايسات القصيم - Al-Qassim BOQ Analysis');
console.log('═══════════════════════════════════════════════════════════\n');

// عرض أسماء الشيتات
console.log('📋 الشيتات المتاحة (Available Sheets):');
workbook.SheetNames.forEach((name, index) => {
  console.log(`  ${index + 1}. ${name}`);
});

console.log('\n───────────────────────────────────────────────────────────\n');

// معالجة البيانات من كل شيت
const boqItems = [];
let itemId = 1;

workbook.SheetNames.forEach((sheetName) => {
  console.log(`\n🔍 معالجة الشيت: ${sheetName}`);
  
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log(`  عدد الصفوف: ${data.length}`);
  
  // عرض أول 5 صفوف كمثال
  if (data.length > 0) {
    console.log('\n  📋 عينة من البيانات (أول 5 صفوف):');
    data.slice(0, 5).forEach((row, idx) => {
      if (row && row.length > 0) {
        console.log(`  ${idx + 1}. ${JSON.stringify(row).substring(0, 100)}...`);
      }
    });
  }
  
  // البحث عن الأعمدة المهمة
  const headers = data[0] || [];
  console.log('\n  📊 الأعمدة المكتشفة:');
  headers.forEach((header, idx) => {
    if (header && header.toString().trim()) {
      console.log(`    ${idx}: ${header}`);
    }
  });
  
  // استخراج بنود المقايسات
  for (let i = 1; i < Math.min(data.length, 100); i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    // محاولة استخراج البيانات
    let description = '';
    let quantity = 0;
    let unit = '';
    let unitPrice = 0;
    
    // البحث عن وصف البند
    for (let col of row) {
      if (col && typeof col === 'string' && col.length > 10) {
        description = col;
        break;
      }
    }
    
    // البحث عن الأرقام (الكمية والسعر)
    const numbers = row.filter(cell => typeof cell === 'number' && cell > 0);
    if (numbers.length >= 2) {
      quantity = numbers[0];
      unitPrice = numbers[numbers.length - 1];
    }
    
    // البحث عن الوحدة
    for (let col of row) {
      if (col && typeof col === 'string' && col.length <= 5) {
        const potentialUnit = col.trim();
        if (['م²', 'م³', 'م', 'كجم', 'طن', 'عدد', 'م.ط', 'لتر'].includes(potentialUnit)) {
          unit = potentialUnit;
          break;
        }
      }
    }
    
    if (description && quantity > 0) {
      boqItems.push({
        id: `BOQ-${String(itemId).padStart(4, '0')}`,
        sheetName,
        description,
        quantity,
        unit: unit || 'عدد',
        unitPrice: unitPrice || 0,
        totalCost: quantity * (unitPrice || 0)
      });
      itemId++;
    }
  }
});

console.log('\n───────────────────────────────────────────────────────────');
console.log(`\n✅ تم استخراج ${boqItems.length} بند من المقايسات\n`);

// عرض ملخص البنود المستخرجة
if (boqItems.length > 0) {
  console.log('📊 ملخص البنود المستخرجة:\n');
  
  // مجموعة حسب الشيت
  const bySheet = {};
  boqItems.forEach(item => {
    if (!bySheet[item.sheetName]) {
      bySheet[item.sheetName] = [];
    }
    bySheet[item.sheetName].push(item);
  });
  
  Object.keys(bySheet).forEach(sheetName => {
    const items = bySheet[sheetName];
    const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0);
    console.log(`  📁 ${sheetName}: ${items.length} بند - التكلفة: ${totalCost.toLocaleString('ar-SA')} ريال`);
  });
  
  console.log(`\n  💰 إجمالي التكلفة: ${boqItems.reduce((sum, item) => sum + item.totalCost, 0).toLocaleString('ar-SA')} ريال`);
  
  // عرض أول 10 بنود كمثال
  console.log('\n  📋 عينة من البنود المستخرجة (أول 10 بنود):\n');
  boqItems.slice(0, 10).forEach((item, idx) => {
    console.log(`  ${idx + 1}. ${item.id} - ${item.description.substring(0, 60)}...`);
    console.log(`     الكمية: ${item.quantity} ${item.unit} | السعر: ${item.unitPrice} | الإجمالي: ${item.totalCost.toLocaleString('ar-SA')}`);
    console.log('');
  });
}

// حفظ البيانات المستخرجة
const outputPath = path.join(__dirname, '..', 'qassim-boq-extracted.json');
fs.writeFileSync(outputPath, JSON.stringify(boqItems, null, 2), 'utf8');

console.log('\n───────────────────────────────────────────────────────────');
console.log(`\n✅ تم حفظ البيانات في: ${outputPath}\n`);
console.log('═══════════════════════════════════════════════════════════\n');
