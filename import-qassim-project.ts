/**
 * استيراد مشروع القصيم الحقيقي
 * Import Real Qassim Project BOQ Data
 * 
 * يقوم بـ:
 * 1. قراءة 469 بند من ملف qassim-boq-parsed.json
 * 2. تحويلها إلى IntegratedBOQItem
 * 3. إضافتها إلى ProjectContext
 * 4. اختبار المزامنة التلقائية
 */

import * as fs from 'fs';
import * as path from 'path';
import { IntegratedBOQItem } from './src/types/integrated/IntegratedBOQ';

interface ParsedBOQItem {
  serialNo: number;
  category: number;
  itemCode: string;
  description: string;
  specifications: string;
  mandatory?: string;
  constructionCode?: number;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
  productivityRate: number;
  workType: string;
  estimatedDuration: number;
}

interface QassimProject {
  projectInfo: {
    name: string;
    duration: string;
    budget: number;
    totalCost: number;
  };
  boqItems: ParsedBOQItem[];
  statistics: any;
}

/**
 * تحويل نوع العمل إلى category string
 */
function mapWorkTypeToCategory(workType: string): string {
  const mappings: Record<string, string> = {
    'أعمال خرسانية': 'concrete',
    'أعمال الحديد': 'steel',
    'أعمال الشدات': 'formwork',
    'أعمال المباني': 'blockwork',
    'أعمال كهربائية': 'electrical',
    'أعمال أخرى': 'other'
  };
  
  return mappings[workType] || 'other';
}

/**
 * تحويل بند من الملف المحلل إلى IntegratedBOQItem
 */
function convertToIntegratedBOQItem(
  parsedItem: ParsedBOQItem, 
  projectId: string
): IntegratedBOQItem {
  const category = mapWorkTypeToCategory(parsedItem.workType);
  const itemId = `BOQ-${parsedItem.serialNo.toString().padStart(4, '0')}`;
  const taskId = `TASK-${parsedItem.serialNo.toString().padStart(4, '0')}`;
  
  // Calculate cost breakdown (rough estimate)
  const totalCost = parsedItem.total;
  const materialCost = totalCost * 0.50; // 50% materials
  const laborCost = totalCost * 0.30;     // 30% labor
  const equipmentCost = totalCost * 0.20; // 20% equipment
  
  return {
    id: itemId,
    projectId: projectId,
    code: parsedItem.itemCode,
    description: parsedItem.description,
    quantity: parsedItem.quantity,
    unit: parsedItem.unit,
    category: category,
    
    // Schedule Integration
    scheduleIntegration: {
      linkedTaskId: taskId,
      productivityRate: parsedItem.productivityRate,
      calculatedDuration: parsedItem.estimatedDuration,
      resources: {
        labor: {
          skilled: Math.ceil(parsedItem.quantity / (parsedItem.productivityRate * 10)),
          unskilled: Math.ceil(parsedItem.quantity / (parsedItem.productivityRate * 20)),
          supervisor: 1,
          totalCost: 0, // Will be calculated by IntegrationService
          dailyCost: 0
        },
        equipment: [],
        materials: []
      },
      syncStatus: 'pending',
      lastSyncDate: new Date()
    },
    
    // Financial Integration
    financialIntegration: {
      pricing: {
        unitPrice: parsedItem.unitPrice,
        currency: 'SAR',
        priceDate: new Date()
      },
      comparison: {
        estimated: {
          materialCost: materialCost,
          laborCost: laborCost,
          equipmentCost: equipmentCost,
          totalCost: totalCost
        },
        actual: {
          materialCost: 0,
          laborCost: 0,
          equipmentCost: 0,
          totalCost: 0
        },
        variance: {
          materialVariance: 0,
          laborVariance: 0,
          equipmentVariance: 0,
          totalVariance: 0,
          percentageVariance: 0
        }
      },
      suppliers: [],
      paymentStatus: 'pending'
    },
    
    // Engineering Standards
    engineeringStandards: {
      applicableCode: 'SBC',
      codeReference: 'SBC 304-2018',
      allowance: 5,
      safetyFactor: 1.15,
      qualityRequirements: [],
      testingRequirements: [],
      complianceStatus: true
    },
    
    // Progress Tracking
    actualProgress: {
      completedQuantity: 0,
      percentageComplete: 0,
      completionDate: null,
      siteUpdates: []
    },
    
    // Metadata
    createdDate: new Date(),
    lastModifiedDate: new Date(),
    createdBy: 'Import Script',
    notes: `Imported from Qassim project - ${parsedItem.workType}`
  };
}

/**
 * استيراد مشروع القصيم
 */
async function importQassimProject(limit: number = 10): Promise<{
  projectInfo: any;
  importedItems: IntegratedBOQItem[];
  errors: string[];
}> {
  const errors: string[] = [];
  const importedItems: IntegratedBOQItem[] = [];
  
  try {
    // 1. قراءة ملف البيانات
    const filePath = path.join(__dirname, 'qassim-boq-parsed.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const qassimData: QassimProject = JSON.parse(fileContent);
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🏗️  استيراد مشروع القصيم');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('📋 معلومات المشروع:');
    console.log(`   • الاسم: ${qassimData.projectInfo.name}`);
    console.log(`   • المدة: ${qassimData.projectInfo.duration}`);
    console.log(`   • الميزانية: ${qassimData.projectInfo.budget.toLocaleString('ar-SA')} ريال`);
    console.log(`   • عدد البنود: ${qassimData.boqItems.length}`);
    console.log(`   • حد الاستيراد: ${limit} بند\n`);
    
    // 2. تحويل البنود (حد أقصى = limit)
    const itemsToImport = qassimData.boqItems.slice(0, limit);
    const projectId = 'qassim-project-001';
    
    for (const item of itemsToImport) {
      try {
        const integratedItem = convertToIntegratedBOQItem(item, projectId);
        importedItems.push(integratedItem);
        
        console.log(`✅ تم تحويل البند ${item.serialNo}: ${item.description.substring(0, 40)}...`);
      } catch (error) {
        const errorMsg = `خطأ في البند ${item.serialNo}: ${error}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }
    
    // 3. حفظ البيانات المحولة
    const outputPath = path.join(__dirname, `qassim-imported-${limit}-items.json`);
    fs.writeFileSync(outputPath, JSON.stringify({
      projectInfo: qassimData.projectInfo,
      projectId,
      items: importedItems,
      summary: {
        totalItems: importedItems.length,
        totalValue: importedItems.reduce((sum, item) => 
          sum + (item.financialIntegration.comparison?.estimated?.totalCost || 0), 0
        ),
        totalDuration: importedItems.reduce((sum, item) => 
          sum + item.scheduleIntegration.calculatedDuration, 0
        )
      }
    }, null, 2));
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ نتائج الاستيراد:');
    console.log(`   • تم استيراد: ${importedItems.length} بند`);
    console.log(`   • الأخطاء: ${errors.length}`);
    console.log(`   • القيمة الإجمالية: ${importedItems.reduce((sum, item) => 
      sum + (item.financialIntegration.comparison?.estimated?.totalCost || 0), 0
    ).toLocaleString('ar-SA')} ريال`);
    console.log(`   • المدة المقدرة: ${importedItems.reduce((sum, item) => 
      sum + item.scheduleIntegration.calculatedDuration, 0
    )} يوم`);
    console.log(`   • حفظ في: ${outputPath}`);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    return {
      projectInfo: qassimData.projectInfo,
      importedItems,
      errors
    };
    
  } catch (error) {
    console.error('❌ خطأ في استيراد المشروع:', error);
    errors.push(`خطأ عام: ${error}`);
    return {
      projectInfo: null,
      importedItems: [],
      errors
    };
  }
}

/**
 * تشغيل الاستيراد
 */
if (require.main === module) {
  const limit = process.argv[2] ? parseInt(process.argv[2]) : 10;
  
  importQassimProject(limit)
    .then(result => {
      if (result.errors.length > 0) {
        console.error('\n⚠️ حدثت أخطاء:');
        result.errors.forEach(error => console.error(`   • ${error}`));
        process.exit(1);
      } else {
        console.log('\n✅ تم الاستيراد بنجاح!');
        console.log('\n💡 الخطوة التالية:');
        console.log('   1. افتح واجهة المشروع');
        console.log('   2. استورد الملف: qassim-imported-*-items.json');
        console.log('   3. راقب المزامنة التلقائية بين BOQ ↔ Schedule ↔ Finance\n');
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('❌ فشل الاستيراد:', error);
      process.exit(1);
    });
}

export { importQassimProject, convertToIntegratedBOQItem, mapWorkTypeToCategory };
