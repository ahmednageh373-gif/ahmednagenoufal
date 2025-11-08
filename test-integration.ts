/**
 * اختبار التكامل الشامل
 * Comprehensive Integration Test
 * 
 * يختبر التدفقات الثلاثية: BOQ ↔ Schedule ↔ Finance
 */

import { IntegrationService } from './src/services/integration/IntegrationService';
import { IntegratedBOQItem, EXAMPLE_INTEGRATED_BOQ_ITEM } from './src/types/integrated/IntegratedBOQ';
import { IntegratedScheduleTask, EXAMPLE_INTEGRATED_SCHEDULE_TASK } from './src/types/integrated/IntegratedSchedule';
import { EngineeringStandardsDatabase } from './src/types/integrated/EngineeringStandards';

interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL';
  message: string;
  details?: any;
  duration: number;
}

class IntegrationTester {
  private results: TestResult[] = [];

  /**
   * Test 1: BOQ → Schedule Sync
   */
  async testBOQToScheduleSync(): Promise<TestResult> {
    const startTime = Date.now();
    const testName = '✅ اختبار 1: مزامنة BOQ → Schedule';
    
    try {
      // إنشاء بند مقايسات جديد
      const boqItem: IntegratedBOQItem = {
        ...EXAMPLE_INTEGRATED_BOQ_ITEM,
        id: `test-boq-${Date.now()}`,
        quantity: 100,
        scheduleIntegration: {
          ...EXAMPLE_INTEGRATED_BOQ_ITEM.scheduleIntegration,
          calculatedDuration: 0, // سيتم حسابه تلقائياً
          syncStatus: 'pending'
        }
      };

      // تنفيذ المزامنة
      const syncResult = await IntegrationService.syncBOQItem(boqItem);
      
      // التحقق من النتائج
      const checks = {
        durationCalculated: boqItem.scheduleIntegration.calculatedDuration > 0,
        resourcesCalculated: boqItem.scheduleIntegration.resources.labor.skilled > 0,
        scheduleUpdated: syncResult.scheduleUpdated,
        noErrors: syncResult.errors.length === 0,
        syncStatusUpdated: boqItem.scheduleIntegration.syncStatus === 'synced'
      };

      const allPassed = Object.values(checks).every(v => v === true);

      return {
        testName,
        status: allPassed ? 'PASS' : 'FAIL',
        message: allPassed 
          ? '✅ تمت المزامنة بنجاح وحساب المدة والموارد'
          : '❌ فشل في المزامنة أو حساب البيانات',
        details: {
          checks,
          duration: boqItem.scheduleIntegration.calculatedDuration,
          resources: boqItem.scheduleIntegration.resources,
          errors: syncResult.errors
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        testName,
        status: 'FAIL',
        message: `❌ خطأ في الاختبار: ${error}`,
        details: { error: String(error) },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Test 2: Schedule → Finance Sync
   */
  async testScheduleToFinanceSync(): Promise<TestResult> {
    const startTime = Date.now();
    const testName = '✅ اختبار 2: مزامنة Schedule → Finance';
    
    try {
      const scheduleTask: IntegratedScheduleTask = {
        ...EXAMPLE_INTEGRATED_SCHEDULE_TASK,
        id: `test-task-${Date.now()}`,
        duration: 10,
        actualEndDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000) // 12 days (2 days delay)
      };

      const syncResult = await IntegrationService.syncScheduleTask(scheduleTask);
      
      const checks = {
        financeUpdated: syncResult.financeUpdated,
        costCalculated: scheduleTask.financialIntegration.plannedCosts.total > 0,
        delayDetected: scheduleTask.financialIntegration.delayCalculation && 
                      scheduleTask.financialIntegration.delayCalculation.totalDelayCost > 0,
        noErrors: syncResult.errors.length === 0
      };

      const allPassed = Object.values(checks).every(v => v === true);

      return {
        testName,
        status: allPassed ? 'PASS' : 'FAIL',
        message: allPassed 
          ? '✅ تمت مزامنة التكاليف وحساب تكاليف التأخير'
          : '❌ فشل في حساب التكاليف أو التأخير',
        details: {
          checks,
          plannedCosts: scheduleTask.financialIntegration.plannedCosts,
          delayCalculation: scheduleTask.financialIntegration.delayCalculation,
          errors: syncResult.errors
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        testName,
        status: 'FAIL',
        message: `❌ خطأ في الاختبار: ${error}`,
        details: { error: String(error) },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Test 3: Engineering Standards Calculations
   */
  async testEngineeringStandards(): Promise<TestResult> {
    const startTime = Date.now();
    const testName = '✅ اختبار 3: حسابات المعايير الهندسية';
    
    try {
      // اختبار حساب المدة
      const duration1 = EngineeringStandardsDatabase.calculateDuration(100, 'concrete', 'standard');
      const duration2 = EngineeringStandardsDatabase.calculateDuration(10, 'steel', 'optimal');
      
      // اختبار حساب الموارد
      const resources1 = EngineeringStandardsDatabase.calculateResources(100, 'concrete');
      const resources2 = EngineeringStandardsDatabase.calculateResources(10, 'steel');
      
      // اختبار حساب الهدر
      const wasteFactor1 = EngineeringStandardsDatabase.getWasteFactor('concrete', 'standard');
      const wasteFactor2 = EngineeringStandardsDatabase.getWasteFactor('steel', 'minimum');
      
      // اختبار حساب الكمية مع الهدر
      const quantityWithWaste = EngineeringStandardsDatabase.calculateQuantityWithWaste(100, 'concrete', 'standard');
      
      const checks = {
        durationCalculated: duration1 > 0 && duration2 > 0,
        resourcesCalculated: resources1 !== null && resources2 !== null,
        wasteFactorValid: wasteFactor1 > 0 && wasteFactor2 > 0,
        quantityWithWasteValid: quantityWithWaste > 100, // يجب أن يكون أكبر من الكمية الأساسية
        laborResourcesValid: resources1?.labor && resources1.labor.skilled > 0
      };

      const allPassed = Object.values(checks).every(v => v === true);

      return {
        testName,
        status: allPassed ? 'PASS' : 'FAIL',
        message: allPassed 
          ? '✅ جميع حسابات المعايير الهندسية صحيحة'
          : '❌ فشل في بعض حسابات المعايير',
        details: {
          checks,
          calculations: {
            duration1,
            duration2,
            resources1,
            resources2,
            wasteFactor1,
            wasteFactor2,
            quantityWithWaste
          }
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        testName,
        status: 'FAIL',
        message: `❌ خطأ في الاختبار: ${error}`,
        details: { error: String(error) },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Test 4: Complete Three-Way Sync (BOQ → Schedule → Finance)
   */
  async testCompleteThreeWaySync(): Promise<TestResult> {
    const startTime = Date.now();
    const testName = '✅ اختبار 4: المزامنة الثلاثية الكاملة';
    
    try {
      // 1. إنشاء بند BOQ
      const boqItem: IntegratedBOQItem = {
        ...EXAMPLE_INTEGRATED_BOQ_ITEM,
        id: `test-complete-${Date.now()}`,
        quantity: 200,
        scheduleIntegration: {
          ...EXAMPLE_INTEGRATED_BOQ_ITEM.scheduleIntegration,
          syncStatus: 'pending'
        }
      };

      // 2. مزامنة BOQ → Schedule
      const boqSync = await IntegrationService.syncBOQItem(boqItem);
      
      // 3. إنشاء مهمة من البيانات المحسوبة
      const scheduleTask: IntegratedScheduleTask = {
        ...EXAMPLE_INTEGRATED_SCHEDULE_TASK,
        id: `test-task-${Date.now()}`,
        duration: boqItem.scheduleIntegration.calculatedDuration,
        financialIntegration: {
          ...EXAMPLE_INTEGRATED_SCHEDULE_TASK.financialIntegration,
          plannedCosts: {
            labor: boqItem.scheduleIntegration.resources.labor.totalCost,
            equipment: boqItem.scheduleIntegration.resources.equipment.reduce((sum, eq) => sum + eq.totalCost, 0),
            materials: boqItem.scheduleIntegration.resources.materials.reduce((sum, mat) => sum + mat.totalCost, 0),
            overhead: 0,
            contingency: 0,
            total: 0
          }
        }
      };

      // 4. مزامنة Schedule → Finance
      const scheduleSync = await IntegrationService.syncScheduleTask(scheduleTask);

      // 5. التحقق من التدفق الكامل
      const checks = {
        boqSyncSuccess: boqSync.scheduleUpdated && boqSync.financeUpdated,
        scheduleSyncSuccess: scheduleSync.financeUpdated,
        durationSynced: scheduleTask.duration === boqItem.scheduleIntegration.calculatedDuration,
        costsSynced: scheduleTask.financialIntegration.plannedCosts.total > 0,
        resourcesSynced: scheduleTask.financialIntegration.plannedCosts.labor === boqItem.scheduleIntegration.resources.labor.totalCost,
        noErrors: boqSync.errors.length === 0 && scheduleSync.errors.length === 0
      };

      const allPassed = Object.values(checks).every(v => v === true);

      return {
        testName,
        status: allPassed ? 'PASS' : 'FAIL',
        message: allPassed 
          ? '✅ المزامنة الثلاثية الكاملة تعمل بنجاح'
          : '❌ فشل في المزامنة الثلاثية',
        details: {
          checks,
          flow: {
            boqQuantity: boqItem.quantity,
            calculatedDuration: boqItem.scheduleIntegration.calculatedDuration,
            taskDuration: scheduleTask.duration,
            boqLaborCost: boqItem.scheduleIntegration.resources.labor.totalCost,
            taskLaborCost: scheduleTask.financialIntegration.plannedCosts.labor,
            totalCost: scheduleTask.financialIntegration.plannedCosts.total
          },
          errors: [...boqSync.errors, ...scheduleSync.errors]
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        testName,
        status: 'FAIL',
        message: `❌ خطأ في الاختبار: ${error}`,
        details: { error: String(error) },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Test 5: Data Integrity & Type Safety
   */
  async testDataIntegrity(): Promise<TestResult> {
    const startTime = Date.now();
    const testName = '✅ اختبار 5: سلامة البيانات ونوع الأمان';
    
    try {
      const boqItem = EXAMPLE_INTEGRATED_BOQ_ITEM;
      const scheduleTask = EXAMPLE_INTEGRATED_SCHEDULE_TASK;

      const checks = {
        // BOQ integrity
        boqHasId: !!boqItem.id && boqItem.id.length > 0,
        boqHasDescription: !!boqItem.description && boqItem.description.length > 0,
        boqQuantityValid: boqItem.quantity > 0,
        boqHasScheduleLink: !!boqItem.scheduleIntegration.linkedTaskId,
        boqHasFinanceData: !!boqItem.financialIntegration.pricing.unitPrice,
        boqHasStandards: !!boqItem.engineeringStandards.applicableCode,
        
        // Schedule integrity
        scheduleHasId: !!scheduleTask.id && scheduleTask.id.length > 0,
        scheduleHasDuration: scheduleTask.duration > 0,
        scheduleHasBOQLink: scheduleTask.boqIntegration.linkedBOQItems.length > 0,
        scheduleHasFinanceData: scheduleTask.financialIntegration.plannedCosts.total >= 0,
        scheduleHasEVM: !!scheduleTask.earnedValue,
        
        // Cross-reference integrity
        linkedItemsMatch: scheduleTask.boqIntegration.linkedBOQItems[0]?.boqItemId === boqItem.id
      };

      const allPassed = Object.values(checks).every(v => v === true);

      return {
        testName,
        status: allPassed ? 'PASS' : 'FAIL',
        message: allPassed 
          ? '✅ جميع البيانات متكاملة والأنواع صحيحة'
          : '❌ توجد مشاكل في سلامة البيانات',
        details: {
          checks,
          boqSample: {
            id: boqItem.id,
            quantity: boqItem.quantity,
            linkedTask: boqItem.scheduleIntegration.linkedTaskId
          },
          scheduleSample: {
            id: scheduleTask.id,
            duration: scheduleTask.duration,
            linkedBOQ: scheduleTask.boqIntegration.linkedBOQItems[0]?.boqItemId
          }
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        testName,
        status: 'FAIL',
        message: `❌ خطأ في الاختبار: ${error}`,
        details: { error: String(error) },
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  🧪 اختبار التكامل الشامل - Comprehensive Integration Test');
    console.log('═══════════════════════════════════════════════════════════\n');

    const tests = [
      () => this.testBOQToScheduleSync(),
      () => this.testScheduleToFinanceSync(),
      () => this.testEngineeringStandards(),
      () => this.testCompleteThreeWaySync(),
      () => this.testDataIntegrity()
    ];

    for (const test of tests) {
      const result = await test();
      this.results.push(result);
      this.printTestResult(result);
    }

    this.printSummary();
  }

  /**
   * Print individual test result
   */
  private printTestResult(result: TestResult): void {
    console.log('\n───────────────────────────────────────────────────────────');
    console.log(`${result.status === 'PASS' ? '✅' : '❌'} ${result.testName}`);
    console.log(`${result.message}`);
    console.log(`⏱️  المدة: ${result.duration}ms`);
    
    if (result.details) {
      console.log('\n📋 التفاصيل:');
      console.log(JSON.stringify(result.details, null, 2));
    }
  }

  /**
   * Print test summary
   */
  private printSummary(): void {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log('\n\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  📊 ملخص نتائج الاختبار - Test Summary');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`\n✅ اختبارات ناجحة: ${passed}/${total}`);
    console.log(`❌ اختبارات فاشلة: ${failed}/${total}`);
    console.log(`📈 معدل النجاح: ${((passed/total) * 100).toFixed(1)}%`);
    console.log(`⏱️  إجمالي الوقت: ${totalDuration}ms (${(totalDuration/1000).toFixed(2)}s)`);
    console.log('\n═══════════════════════════════════════════════════════════\n');

    if (failed === 0) {
      console.log('🎉 جميع الاختبارات نجحت! النظام جاهز للاستخدام.');
    } else {
      console.log('⚠️  يوجد اختبارات فاشلة. يرجى مراجعة التفاصيل أعلاه.');
    }
  }
}

// Run tests
const tester = new IntegrationTester();
tester.runAllTests().catch(error => {
  console.error('خطأ فادح في تشغيل الاختبارات:', error);
  process.exit(1);
});
