/**
 * قراءة وتحليل ملف المقايسة من مشروع القصيم
 * Read and analyze real BOQ from Qassim project
 */

const XLSX = require('xlsx');
const fs = require('fs');

console.log('\n' + '═'.repeat(80));
console.log('  📊 تحليل مقايسة مشروع القصيم - Qassim Project BOQ Analysis');
console.log('═'.repeat(80) + '\n');

try {
  // قراءة الملف
  const workbook = XLSX.readFile('qassim-project-boq.xlsx');
  
  console.log('📁 معلومات الملف:');
  console.log(`   • عدد الصفحات: ${workbook.SheetNames.length}`);
  console.log(`   • أسماء الصفحات: ${workbook.SheetNames.join(', ')}\n`);
  
  // تحليل كل صفحة
  const allData = {};
  
  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`📄 تحليل صفحة ${index + 1}: ${sheetName}`);
    console.log('─'.repeat(80));
    
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`   • عدد الصفوف: ${data.length}`);
    console.log(`   • عدد الأعمدة: ${data[0] ? data[0].length : 0}`);
    
    // عرض أول 5 صفوف
    console.log('\n   📋 أول 5 صفوف:');
    data.slice(0, 5).forEach((row, i) => {
      if (row && row.length > 0) {
        const rowStr = row.map(cell => {
          if (cell === undefined || cell === null) return '---';
          if (typeof cell === 'number') return cell.toFixed(2);
          return String(cell).substring(0, 50);
        }).join(' | ');
        console.log(`   ${i + 1}. ${rowStr}`);
      }
    });
    
    // حفظ البيانات
    allData[sheetName] = data;
    
    // محاولة تحديد نوع الصفحة
    const headers = data[0] || [];
    const headerStr = headers.join(' ').toLowerCase();
    
    console.log('\n   🔍 نوع البيانات المتوقع:');
    if (headerStr.includes('بند') || headerStr.includes('item') || headerStr.includes('code')) {
      console.log('   ✓ يبدو أنها صفحة مقايسات (BOQ)');
      
      // تحليل بنود المقايسات
      const boqItems = [];
      for (let i = 1; i < Math.min(data.length, 100); i++) {
        const row = data[i];
        if (row && row.length >= 3) {
          // محاولة استخراج: الكود، الوصف، الكمية، الوحدة، السعر
          const item = {
            rowIndex: i + 1,
            code: row[0],
            description: row[1],
            quantity: parseFloat(row[2]) || 0,
            unit: row[3],
            unitPrice: parseFloat(row[4]) || 0,
            total: parseFloat(row[5]) || 0
          };
          
          if (item.description && item.quantity > 0) {
            boqItems.push(item);
          }
        }
      }
      
      if (boqItems.length > 0) {
        console.log(`   ✓ تم العثور على ${boqItems.length} بند مقايسات`);
        console.log('\n   📊 ملخص البنود:');
        console.log(`      • إجمالي الكميات: ${boqItems.reduce((sum, item) => sum + item.quantity, 0).toFixed(2)}`);
        console.log(`      • إجمالي التكاليف: ${boqItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)} ريال`);
        
        // عرض أول 10 بنود
        console.log('\n   📝 عينة من البنود:');
        boqItems.slice(0, 10).forEach((item, i) => {
          console.log(`      ${i + 1}. ${item.code || 'N/A'} | ${String(item.description).substring(0, 40)} | ${item.quantity} ${item.unit || ''} | ${item.unitPrice.toFixed(2)} ريال`);
        });
        
        allData[sheetName + '_parsed'] = boqItems;
      }
    } else if (headerStr.includes('مهمة') || headerStr.includes('task') || headerStr.includes('نشاط')) {
      console.log('   ✓ يبدو أنها صفحة جدول زمني (Schedule)');
    } else if (headerStr.includes('تكلفة') || headerStr.includes('cost') || headerStr.includes('مالي')) {
      console.log('   ✓ يبدو أنها صفحة مالية (Finance)');
    } else {
      console.log('   ⚠ نوع غير محدد - يحتاج فحص يدوي');
    }
  });
  
  // حفظ النتائج
  console.log('\n\n' + '═'.repeat(80));
  console.log('  💾 حفظ النتائج');
  console.log('═'.repeat(80));
  
  const outputFile = 'qassim-boq-analysis.json';
  fs.writeFileSync(outputFile, JSON.stringify(allData, null, 2));
  console.log(`✅ تم حفظ التحليل في: ${outputFile}`);
  
  // إحصائيات نهائية
  console.log('\n' + '═'.repeat(80));
  console.log('  📈 الإحصائيات النهائية');
  console.log('═'.repeat(80));
  
  let totalBOQItems = 0;
  let totalCost = 0;
  
  Object.keys(allData).forEach(key => {
    if (key.endsWith('_parsed')) {
      const items = allData[key];
      totalBOQItems += items.length;
      totalCost += items.reduce((sum, item) => sum + (item.total || 0), 0);
    }
  });
  
  console.log(`\n   • إجمالي بنود المقايسات: ${totalBOQItems}`);
  console.log(`   • إجمالي التكلفة التقديرية: ${totalCost.toLocaleString('ar-SA')} ريال`);
  console.log(`   • متوسط تكلفة البند: ${(totalCost / totalBOQItems).toFixed(2)} ريال`);
  
  console.log('\n' + '═'.repeat(80));
  console.log('  ✅ اكتمل التحليل بنجاح!');
  console.log('═'.repeat(80) + '\n');
  
} catch (error) {
  console.error('\n❌ خطأ في قراءة الملف:', error.message);
  console.error('التفاصيل:', error);
  process.exit(1);
}
