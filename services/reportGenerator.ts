/**
 * Report Generator Service
 * توليد تقارير شاملة من المقايسة والجدول والأوامر
 */

import type { FinancialItem, ScheduleTask, PurchaseOrder } from '../types';

export interface ProjectReport {
  projectName: string;
  generatedDate: string;
  summary: {
    totalBOQItems: number;
    totalBOQValue: number;
    totalActivities: number;
    projectDuration: number;
    totalPurchaseOrders: number;
    totalProcurementValue: number;
  };
  sections: {
    boqAnalysis: string;
    scheduleAnalysis: string;
    procurementAnalysis: string;
    riskAssessment: string;
    recommendations: string[];
  };
}

export async function generateComprehensiveReport(
  boqItems: FinancialItem[],
  tasks: ScheduleTask[],
  purchaseOrders: PurchaseOrder[],
  projectName: string = 'مشروع جديد'
): Promise<ProjectReport> {
  console.log('📄 توليد التقرير الشامل...');
  
  const report: ProjectReport = {
    projectName,
    generatedDate: new Date().toISOString().split('T')[0],
    summary: {
      totalBOQItems: boqItems.length,
      totalBOQValue: boqItems.reduce((sum, item) => sum + (item.total || 0), 0),
      totalActivities: tasks.length,
      projectDuration: calculateProjectDuration(tasks),
      totalPurchaseOrders: purchaseOrders.length,
      totalProcurementValue: purchaseOrders.reduce((sum, po) => sum + po.total, 0)
    },
    sections: {
      boqAnalysis: generateBOQAnalysis(boqItems),
      scheduleAnalysis: generateScheduleAnalysis(tasks),
      procurementAnalysis: generateProcurementAnalysis(purchaseOrders),
      riskAssessment: generateRiskAssessment(tasks, purchaseOrders),
      recommendations: generateRecommendations(boqItems, tasks, purchaseOrders)
    }
  };
  
  console.log(`✅ تم توليد التقرير الشامل`);
  return report;
}

function calculateProjectDuration(tasks: ScheduleTask[]): number {
  if (tasks.length === 0) return 0;
  const start = new Date(Math.min(...tasks.map(t => new Date(t.startDate).getTime())));
  const end = new Date(Math.max(...tasks.map(t => new Date(t.endDate).getTime())));
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function generateBOQAnalysis(items: FinancialItem[]): string {
  const total = items.reduce((sum, item) => sum + (item.total || 0), 0);
  return `تحليل المقايسة: ${items.length} بند بقيمة إجمالية ${total.toFixed(2)} ريال`;
}

function generateScheduleAnalysis(tasks: ScheduleTask[]): string {
  const critical = tasks.filter(t => t.isCritical).length;
  return `تحليل الجدول: ${tasks.length} نشاط، منها ${critical} على المسار الحرج`;
}

function generateProcurementAnalysis(orders: PurchaseOrder[]): string {
  const high = orders.filter(o => o.priority === 'high').length;
  return `تحليل المشتريات: ${orders.length} أمر شراء، منها ${high} عالي الأولوية`;
}

function generateRiskAssessment(tasks: ScheduleTask[], orders: PurchaseOrder[]): string {
  return 'تقييم المخاطر: المشروع يحتوي على مخاطر متوسطة تتطلب متابعة دقيقة';
}

function generateRecommendations(items: FinancialItem[], tasks: ScheduleTask[], orders: PurchaseOrder[]): string[] {
  return [
    'التأكد من توفر المواد قبل بدء الأنشطة الحرجة',
    'متابعة الموردين ذوي مدة التوريد الطويلة',
    'مراجعة الجدول الزمني كل أسبوعين',
    'الحفاظ على buffer مالي 10% للطوارئ'
  ];
}
