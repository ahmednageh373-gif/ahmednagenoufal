/**
 * Procurement Plan Generator Service
 * توليد خطة مشتريات متكاملة من المقايسة والجدول الزمني
 */

import type { FinancialItem, ScheduleTask, PurchaseOrder } from '../types';

export interface ProcurementPlanItem {
  id: string;
  material: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  supplier: string;
  orderDate: string;
  deliveryDate: string;
  leadTime: number;
  priority: 'low' | 'medium' | 'high';
  relatedActivity?: string;
  status: 'planned' | 'ordered' | 'delivered' | 'delayed';
  notes?: string;
}

export interface ProcurementMilestone {
  date: string;
  description: string;
  items: string[];
  totalValue: number;
}

/**
 * توليد خطة مشتريات من أوامر الشراء والجدول الزمني
 */
export async function generateProcurementPlan(
  purchaseOrders: PurchaseOrder[],
  scheduleTasks: ScheduleTask[]
): Promise<{
  plan: ProcurementPlanItem[];
  milestones: ProcurementMilestone[];
  summary: {
    totalItems: number;
    totalValue: number;
    criticalItems: number;
    monthlyBreakdown: { month: string; value: number; items: number }[];
  };
}> {
  console.log('📋 توليد خطة المشتريات المتكاملة...');
  
  const plan: ProcurementPlanItem[] = [];
  
  purchaseOrders.forEach((po, index) => {
    po.items.forEach((item, itemIndex) => {
      const planItem: ProcurementPlanItem = {
        id: `proc-${index}-${itemIndex}`,
        material: item.description,
        category: po.category || 'أخرى',
        quantity: item.quantity,
        unit: item.unit,
        estimatedCost: item.total,
        supplier: po.supplier,
        orderDate: po.date,
        deliveryDate: po.requiredDate || '',
        leadTime: po.leadTime || 5,
        priority: po.priority || 'medium',
        status: 'planned',
        notes: po.notes
      };
      
      plan.push(planItem);
    });
  });
  
  const milestones = generateMilestones(plan);
  const summary = generateProcurementSummary(plan);
  
  console.log(`✅ تم توليد خطة مشتريات متكاملة`);
  console.log(`   - عدد البنود: ${plan.length}`);
  console.log(`   - المعالم الرئيسية: ${milestones.length}`);
  
  return { plan, milestones, summary };
}

function generateMilestones(plan: ProcurementPlanItem[]): ProcurementMilestone[] {
  const milestoneMap = new Map<string, {items: string[]; value: number}>();
  
  plan.forEach(item => {
    const date = item.orderDate;
    if (!milestoneMap.has(date)) {
      milestoneMap.set(date, { items: [], value: 0 });
    }
    const milestone = milestoneMap.get(date)!;
    milestone.items.push(item.id);
    milestone.value += item.estimatedCost;
  });
  
  return Array.from(milestoneMap.entries())
    .map(([date, data]) => ({
      date,
      description: `طلب ${data.items.length} مادة`,
      items: data.items,
      totalValue: data.value
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function generateProcurementSummary(plan: ProcurementPlanItem[]) {
  const monthlyMap = new Map<string, {value: number; items: number}>();
  
  plan.forEach(item => {
    const month = item.orderDate.substring(0, 7);
    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, { value: 0, items: 0 });
    }
    const monthly = monthlyMap.get(month)!;
    monthly.value += item.estimatedCost;
    monthly.items++;
  });
  
  return {
    totalItems: plan.length,
    totalValue: plan.reduce((sum, item) => sum + item.estimatedCost, 0),
    criticalItems: plan.filter(item => item.priority === 'high').length,
    monthlyBreakdown: Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))
  };
}

export { generateMilestones, generateProcurementSummary };
