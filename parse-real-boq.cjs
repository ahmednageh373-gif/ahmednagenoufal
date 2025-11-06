/**
 * تحليل دقيق لمقايسة مشروع القصيم الحقيقية
 * Accurate parsing of real Qassim project BOQ
 */

const XLSX = require('xlsx');
const fs = require('fs');

console.log('\n' + '═'.repeat(90));
console.log('  🏗️ مشروع القصيم: إنشاء وتجهيز مجمع المزارع النموذجية للإنتاج الحيواني');
console.log('═'.repeat(90) + '\n');

const workbook = XLSX.readFile('qassim-project-boq.xlsx');
const worksheet = workbook.Sheets['ورقة1'];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// استخراج معلومات المشروع
const projectName = data[0][4]; // اسم المشروع
const duration = data[1][4]; // المدة
const totalBudget = data[0][11]; // الميزانية

console.log('📋 معلومات المشروع:');
console.log(`   • اسم المشروع: ${projectName}`);
console.log(`   • المدة: ${duration}`);
console.log(`   • الميزانية الإجمالية: ${totalBudget.toLocaleString('ar-SA')} ريال\n`);

// استخراج الرؤوس (الصف 3)
const headers = data[3];
console.log('📊 رؤوس الأعمدة:');
headers.forEach((h, i) => {
  if (h) console.log(`   ${i}. ${h}`);
});

// استخراج بنود المقايسات (من الصف 5 فما فوق)
console.log('\n' + '─'.repeat(90));
console.log('📝 بنود المقايسات:');
console.log('─'.repeat(90) + '\n');

const boqItems = [];
let totalCost = 0;

for (let i = 5; i < data.length; i++) {
  const row = data[i];
  if (!row || row.length === 0) continue;
  
  const serialNo = row[0];
  const category = row[1];
  const itemCode = row[2];
  const description = row[3];
  const specifications = row[4];
  const mandatory = row[5];
  const constructionCode = row[6];
  const attachments = row[7];
  const unit = row[8];
  const quantity = parseFloat(row[9]) || 0;
  const unitPrice = parseFloat(row[10]) || 0;
  const total = parseFloat(row[11]) || 0;
  
  // تخطي الصفوف الفارغة أو غير الصالحة
  if (!description || quantity === 0) continue;
  
  const item = {
    serialNo,
    category,
    itemCode,
    description: String(description).substring(0, 100),
    specifications: String(specifications).substring(0, 200),
    mandatory,
    constructionCode,
    unit,
    quantity,
    unitPrice,
    total,
    // حساب معدل الإنتاجية المتوقع حسب النوع
    productivityRate: estimateProductivity(description, unit),
    // تصنيف البند
    workType: classifyWorkType(description)
  };
  
  boqItems.push(item);
  totalCost += total;
}

console.log(`✅ تم استخراج ${boqItems.length} بند من المقايسة\n`);

// عرض أول 20 بند
console.log('📌 عينة من البنود (أول 20 بند):');
console.log('─'.repeat(90));

boqItems.slice(0, 20).forEach((item, i) => {
  console.log(`\n${i + 1}. ${item.itemCode || 'N/A'}`);
  console.log(`   الوصف: ${item.description}`);
  console.log(`   الكمية: ${item.quantity.toLocaleString('ar-SA')} ${item.unit}`);
  console.log(`   سعر الوحدة: ${item.unitPrice.toLocaleString('ar-SA')} ريال`);
  console.log(`   الإجمالي: ${item.total.toLocaleString('ar-SA')} ريال`);
  console.log(`   نوع العمل: ${item.workType}`);
  console.log(`   معدل الإنتاجية المقدر: ${item.productivityRate} ${item.unit}/يوم`);
});

// إحصائيات
console.log('\n\n' + '═'.repeat(90));
console.log('📊 الإحصائيات والتحليل');
console.log('═'.repeat(90) + '\n');

console.log('💰 الملخص المالي:');
console.log(`   • إجمالي التكلفة: ${totalCost.toLocaleString('ar-SA')} ريال`);
console.log(`   • متوسط تكلفة البند: ${(totalCost / boqItems.length).toLocaleString('ar-SA')} ريال`);
console.log(`   • نسبة من الميزانية: ${((totalCost / totalBudget) * 100).toFixed(2)}%\n`);

// تصنيف حسب نوع العمل
const workTypes = {};
boqItems.forEach(item => {
  if (!workTypes[item.workType]) {
    workTypes[item.workType] = { count: 0, cost: 0, items: [] };
  }
  workTypes[item.workType].count++;
  workTypes[item.workType].cost += item.total;
  workTypes[item.workType].items.push(item);
});

console.log('🏗️ التصنيف حسب نوع العمل:');
Object.keys(workTypes).sort((a, b) => workTypes[b].cost - workTypes[a].cost).forEach(type => {
  const data = workTypes[type];
  console.log(`   • ${type}:`);
  console.log(`     - عدد البنود: ${data.count}`);
  console.log(`     - التكلفة: ${data.cost.toLocaleString('ar-SA')} ريال (${((data.cost / totalCost) * 100).toFixed(1)}%)`);
});

// حساب المدة المتوقعة لكل بند
console.log('\n\n⏱️ تقدير الجدول الزمني:');
let totalDuration = 0;
boqItems.forEach(item => {
  if (item.productivityRate > 0) {
    item.estimatedDuration = Math.ceil(item.quantity / item.productivityRate);
    totalDuration += item.estimatedDuration;
  }
});

console.log(`   • إجمالي أيام العمل (متتالية): ${totalDuration} يوم`);
console.log(`   • المدة الفعلية (بالتوازي): ~${Math.ceil(totalDuration / 5)} يوم (بافتراض 5 فرق عمل)`);
console.log(`   • المدة التعاقدية: 15 شهر (~450 يوم)\n`);

// حفظ البيانات المحللة
const output = {
  projectInfo: {
    name: projectName,
    duration: duration,
    budget: totalBudget,
    totalCost: totalCost
  },
  boqItems: boqItems,
  statistics: {
    totalItems: boqItems.length,
    totalCost: totalCost,
    workTypes: workTypes,
    estimatedDuration: totalDuration
  }
};

fs.writeFileSync('qassim-boq-parsed.json', JSON.stringify(output, null, 2));
console.log('💾 تم حفظ البيانات المحللة في: qassim-boq-parsed.json\n');

// إنشاء ملف CSV للاستيراد
const csvLines = [
  'الرقم,الكود,الوصف,الكمية,الوحدة,سعر الوحدة,الإجمالي,نوع العمل,معدل الإنتاجية,المدة المقدرة'
];

boqItems.forEach((item, i) => {
  csvLines.push([
    i + 1,
    item.itemCode || '',
    `"${item.description.replace(/"/g, '""')}"`,
    item.quantity,
    item.unit || '',
    item.unitPrice,
    item.total,
    item.workType,
    item.productivityRate,
    item.estimatedDuration || 0
  ].join(','));
});

fs.writeFileSync('qassim-boq-import.csv', csvLines.join('\n'));
console.log('📄 تم إنشاء ملف CSV للاستيراد: qassim-boq-import.csv\n');

console.log('═'.repeat(90));
console.log('  ✅ اكتمل تحليل المشروع الحقيقي بنجاح!');
console.log('═'.repeat(90) + '\n');

// ========== وظائف مساعدة ==========

function estimateProductivity(description, unit) {
  const desc = String(description).toLowerCase();
  
  // خرسانة
  if (desc.includes('خرسانة') || desc.includes('concrete')) {
    return unit === 'م3' ? 25 : 50;
  }
  
  // حديد تسليح
  if (desc.includes('حديد') || desc.includes('تسليح') || desc.includes('steel')) {
    return unit === 'طن' ? 1.2 : 200;
  }
  
  // مباني
  if (desc.includes('مباني') || desc.includes('بلوك') || desc.includes('طوب')) {
    return unit === 'م2' ? 15 : 10;
  }
  
  // دهانات
  if (desc.includes('دهان') || desc.includes('paint')) {
    return unit === 'م2' ? 100 : 50;
  }
  
  // بلاط وأرضيات
  if (desc.includes('بلاط') || desc.includes('أرضيات') || desc.includes('رخام')) {
    return unit === 'م2' ? 30 : 20;
  }
  
  // كهرباء
  if (desc.includes('كهرباء') || desc.includes('كابل') || desc.includes('electrical')) {
    return unit === 'مط' ? 50 : 20;
  }
  
  // سباكة
  if (desc.includes('سباكة') || desc.includes('مواسير') || desc.includes('plumbing')) {
    return unit === 'مط' ? 40 : 15;
  }
  
  // أعمال حفر
  if (desc.includes('حفر') || desc.includes('excavation')) {
    return unit === 'م3' ? 50 : 100;
  }
  
  // افتراضي
  return 20;
}

function classifyWorkType(description) {
  const desc = String(description).toLowerCase();
  
  if (desc.includes('خرسانة') || desc.includes('concrete')) return 'أعمال خرسانية';
  if (desc.includes('حديد') || desc.includes('تسليح')) return 'أعمال حديد التسليح';
  if (desc.includes('مباني') || desc.includes('بلوك')) return 'أعمال المباني';
  if (desc.includes('دهان') || desc.includes('paint')) return 'أعمال الدهانات';
  if (desc.includes('بلاط') || desc.includes('رخام') || desc.includes('أرضيات')) return 'أعمال التشطيبات';
  if (desc.includes('كهرباء') || desc.includes('كابل')) return 'أعمال كهربائية';
  if (desc.includes('سباكة') || desc.includes('مواسير')) return 'أعمال السباكة';
  if (desc.includes('تكييف') || desc.includes('hvac')) return 'أعمال التكييف';
  if (desc.includes('حفر') || desc.includes('ردم')) return 'أعمال الحفر والردم';
  if (desc.includes('سور') || desc.includes('سياج')) return 'أعمال الأسوار';
  if (desc.includes('باب') || desc.includes('شباك') || desc.includes('نجارة')) return 'أعمال النجارة';
  if (desc.includes('عازل') || desc.includes('عزل')) return 'أعمال العزل';
  if (desc.includes('طريق') || desc.includes('اسفلت')) return 'أعمال الطرق';
  
  return 'أعمال أخرى';
}
