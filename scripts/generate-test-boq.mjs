/**
 * Generate Test BOQ File - JavaScript version
 * إنشاء ملف مقايسة اختباري مع 400+ بند
 */

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// BOQ Categories with typical items
const BOQ_CATEGORIES = {
  'أعمال الحفر والدفان': [
    { desc: 'حفر يدوي لعمق 1.5 متر', unit: 'م³', rate: 45 },
    { desc: 'حفر ميكانيكي لعمق 3 متر', unit: 'م³', rate: 35 },
    { desc: 'دفان رمل نظيف بالمدك', unit: 'م³', rate: 55 },
    { desc: 'دفان نظيف من مخلفات الحفر', unit: 'م³', rate: 25 },
  ],
  'أعمال الخرسانة المسلحة': [
    { desc: 'خرسانة عادية 1:3:6 للأساسات', unit: 'م³', rate: 380 },
    { desc: 'خرسانة مسلحة 300 كجم/سم² للقواعد', unit: 'م³', rate: 450 },
    { desc: 'خرسانة مسلحة 350 كجم/سم² للأعمدة', unit: 'م³', rate: 480 },
    { desc: 'خرسانة مسلحة 350 كجم/سم² للكمرات', unit: 'م³', rate: 470 },
    { desc: 'خرسانة مسلحة 300 كجم/سم² للبلاطات', unit: 'م³', rate: 445 },
    { desc: 'خرسانة مسلحة 400 كجم/سم² للخزانات', unit: 'م³', rate: 520 },
  ],
  'أعمال حديد التسليح': [
    { desc: 'حديد تسليح قطر 8 مم عادي', unit: 'طن', rate: 4200 },
    { desc: 'حديد تسليح قطر 10 مم عادي', unit: 'طن', rate: 4150 },
    { desc: 'حديد تسليح قطر 12 مم عادي', unit: 'طن', rate: 4100 },
    { desc: 'حديد تسليح قطر 16 مم عالي الإجهاد', unit: 'طن', rate: 4250 },
    { desc: 'حديد تسليح قطر 20 مم عالي الإجهاد', unit: 'طن', rate: 4300 },
    { desc: 'حديد تسليح قطر 25 مم عالي الإجهاد', unit: 'طن', rate: 4350 },
  ],
  'أعمال البناء': [
    { desc: 'بناء بلوك أسمنتي 20×20×40 سم', unit: 'م²', rate: 65 },
    { desc: 'بناء بلوك أسمنتي 15×20×40 سم', unit: 'م²', rate: 58 },
    { desc: 'بناء بلوك أسمنتي 10×20×40 سم', unit: 'م²', rate: 52 },
    { desc: 'بناء طوب أحمر 25×12×6 سم', unit: 'م²', rate: 75 },
    { desc: 'بناء طوب حراري 25×12×6 سم', unit: 'م²', rate: 85 },
  ],
  'أعمال اللياسة': [
    { desc: 'بؤج وتحليت للجدران', unit: 'م²', rate: 12 },
    { desc: 'لياسة جدران خارجية بالمونة', unit: 'م²', rate: 35 },
    { desc: 'لياسة جدران داخلية بالمونة', unit: 'م²', rate: 32 },
    { desc: 'لياسة أسقف بالمونة', unit: 'م²', rate: 38 },
    { desc: 'لياسة حمامات ومطابخ', unit: 'م²', rate: 42 },
  ],
  'أعمال البلاط والسيراميك': [
    { desc: 'بلاط بورسلين 60×60 سم - درجة أولى', unit: 'م²', rate: 150 },
    { desc: 'بلاط بورسلين 80×80 سم - درجة أولى', unit: 'م²', rate: 180 },
    { desc: 'بلاط جرانيت محلي 60×60 سم', unit: 'م²', rate: 220 },
    { desc: 'بلاط حمامات ضد الانزلاق 30×30 سم', unit: 'م²', rate: 95 },
    { desc: 'سيراميك جدران 20×25 سم', unit: 'م²', rate: 75 },
    { desc: 'سيراميك جدران ديكور 25×40 سم', unit: 'م²', rate: 105 },
    { desc: 'رخام محلي تركيب على الأرضيات', unit: 'م²', rate: 280 },
    { desc: 'رخام مستورد تركيب على الجدران', unit: 'م²', rate: 350 },
  ],
  'أعمال الدهانات': [
    { desc: 'معجون جدران داخلية - وجهين', unit: 'م²', rate: 18 },
    { desc: 'دهان بلاستيك داخلي - وجهين', unit: 'م²', rate: 22 },
    { desc: 'دهان بلاستيك خارجي - وجهين', unit: 'م²', rate: 28 },
    { desc: 'دهان زيتي للأبواب والشبابيك', unit: 'م²', rate: 45 },
    { desc: 'دهان جدران داخلية بالجزيل', unit: 'م²', rate: 38 },
    { desc: 'دهان واجهات خارجية بالجزيل', unit: 'م²', rate: 48 },
  ],
  'أعمال الكهرباء': [
    { desc: 'تمديد أسلاك نحاس 1.5 مم²', unit: 'متر', rate: 8 },
    { desc: 'تمديد أسلاك نحاس 2.5 مم²', unit: 'متر', rate: 12 },
    { desc: 'تمديد أسلاك نحاس 4 مم²', unit: 'متر', rate: 18 },
    { desc: 'مفتاح إضاءة عادي', unit: 'قطعة', rate: 35 },
    { desc: 'مفتاح إضاءة ديلوكس', unit: 'قطعة', rate: 55 },
    { desc: 'فيش كهرباء عادي', unit: 'قطعة', rate: 32 },
    { desc: 'فيش كهرباء مزدوج', unit: 'قطعة', rate: 48 },
    { desc: 'لوحة كهرباء فرعية 12 قاطع', unit: 'قطعة', rate: 850 },
    { desc: 'لوحة كهرباء رئيسية 24 قاطع', unit: 'قطعة', rate: 1650 },
  ],
  'أعمال السباكة': [
    { desc: 'تمديد مواسير بولي إيثيلين 1 بوصة', unit: 'متر', rate: 22 },
    { desc: 'تمديد مواسير بولي إيثيلين 2 بوصة', unit: 'متر', rate: 35 },
    { desc: 'تمديد مواسير صرف PVC 4 بوصة', unit: 'متر', rate: 28 },
    { desc: 'تمديد مواسير صرف PVC 6 بوصة', unit: 'متر', rate: 42 },
    { desc: 'حوض غسيل يدين - نوع جيد', unit: 'قطعة', rate: 320 },
    { desc: 'حوض مطبخ ستانلس ستيل', unit: 'قطعة', rate: 450 },
    { desc: 'كرسي إفرنجي - نوع جيد', unit: 'قطعة', rate: 550 },
    { desc: 'خلاط حمام - نوع جيد', unit: 'قطعة', rate: 380 },
    { desc: 'خزان ماء علوي 5000 لتر', unit: 'قطعة', rate: 2800 },
  ],
  'أعمال الألومنيوم': [
    { desc: 'شباك ألومنيوم ثابت', unit: 'م²', rate: 280 },
    { desc: 'شباك ألومنيوم منزلق', unit: 'م²', rate: 320 },
    { desc: 'باب ألومنيوم زجاج', unit: 'م²', rate: 450 },
    { desc: 'واجهة ألومنيوم كيرتن وول', unit: 'م²', rate: 650 },
    { desc: 'درابزين ألومنيوم', unit: 'متر', rate: 280 },
  ],
  'أعمال النجارة': [
    { desc: 'باب خشب داخلي مع الحلق والكاسة', unit: 'م²', rate: 420 },
    { desc: 'باب خشب خارجي مع الحلق والكاسة', unit: 'م²', rate: 520 },
    { desc: 'شباك خشب داخلي', unit: 'م²', rate: 380 },
    { desc: 'دولاب مطبخ مع الرخامة', unit: 'متر', rate: 1200 },
    { desc: 'دولاب ملابس خشب', unit: 'م²', rate: 650 },
  ],
  'أعمال الأرضيات الخاصة': [
    { desc: 'باركيه خشبي طبيعي', unit: 'م²', rate: 320 },
    { desc: 'باركيه صناعي HDF', unit: 'م²', rate: 180 },
    { desc: 'موكيت مع الفوم والتركيب', unit: 'م²', rate: 75 },
    { desc: 'فينيل مع اللصق', unit: 'م²', rate: 65 },
  ],
  'أعمال الديكورات': [
    { desc: 'جبس بورد عادي للأسقف', unit: 'م²', rate: 85 },
    { desc: 'جبس بورد مقاوم للرطوبة', unit: 'م²', rate: 95 },
    { desc: 'جبس بورد مقاوم للحريق', unit: 'م²', rate: 105 },
    { desc: 'كرانيش جبس', unit: 'متر', rate: 45 },
    { desc: 'كوفرت جبس بورد', unit: 'متر', rate: 120 },
  ],
};

function generateBOQItems() {
  const items = [];
  
  // Add header
  items.push(['الكود', 'الوصف', 'الوحدة', 'الكمية', 'سعر الوحدة', 'الإجمالي', 'التصنيف']);
  
  let itemNumber = 1;
  let totalCost = 0;
  let shouldStop = false;
  
  // Generate items for each category
  categoryLoop: for (const [category, templates] of Object.entries(BOQ_CATEGORIES)) {
    // Generate multiple items from each template
    for (const template of templates) {
      // Create 3-8 items per template with varying quantities
      const itemsCount = Math.floor(Math.random() * 6) + 3;
      
      for (let i = 0; i < itemsCount; i++) {
        const code = `${category.substring(0, 3).toUpperCase()}-${String(itemNumber).padStart(3, '0')}`;
        const description = `${template.desc} - ${['الطابق الأرضي', 'الطابق الأول', 'الطابق الثاني', 'الملحق', 'القبو'][i % 5]}`;
        const unit = template.unit;
        
        // Generate realistic quantities
        let quantity;
        if (unit === 'م³') {
          quantity = Math.floor(Math.random() * 150) + 20; // 20-170 m³
        } else if (unit === 'م²') {
          quantity = Math.floor(Math.random() * 500) + 100; // 100-600 m²
        } else if (unit === 'متر') {
          quantity = Math.floor(Math.random() * 300) + 50; // 50-350 m
        } else if (unit === 'طن') {
          quantity = Math.floor(Math.random() * 20) + 5; // 5-25 ton
        } else { // قطعة
          quantity = Math.floor(Math.random() * 50) + 10; // 10-60 pieces
        }
        
        // Add some variation to the rate (±15%)
        const rateVariation = (Math.random() * 0.3) - 0.15; // -15% to +15%
        const unitPrice = Math.round(template.rate * (1 + rateVariation));
        
        const totalPrice = quantity * unitPrice;
        totalCost += totalPrice;
        
        items.push([
          code,
          description,
          unit,
          quantity,
          unitPrice,
          totalPrice,
          category
        ]);
        
        itemNumber++;
        
        // Stop if we reach 400 items
        if (itemNumber > 400) {
          shouldStop = true;
          break;
        }
      }
      
      if (shouldStop) break;
    }
    
    if (shouldStop) break;
  }
  
  console.log(`✅ Generated ${itemNumber - 1} BOQ items`);
  console.log(`💰 Total Cost: ${totalCost.toLocaleString()} SAR`);
  
  return items;
}

function generateTestBOQ() {
  console.log('🔄 Generating test BOQ file...');
  
  // Generate items
  const items = generateBOQItems();
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(items);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 12 },  // Code
    { wch: 50 },  // Description
    { wch: 10 },  // Unit
    { wch: 10 },  // Quantity
    { wch: 12 },  // Unit Price
    { wch: 15 },  // Total
    { wch: 25 },  // Category
  ];
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'BOQ');
  
  // Write file
  const outputPath = path.join(__dirname, '..', 'test-boq-400-items.xlsx');
  XLSX.writeFile(wb, outputPath);
  
  console.log(`✅ Test BOQ file generated: ${outputPath}`);
  console.log(`📊 File size: ${fs.statSync(outputPath).size} bytes`);
}

// Run the generator
generateTestBOQ();
