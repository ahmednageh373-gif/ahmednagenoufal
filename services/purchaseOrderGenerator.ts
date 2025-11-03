/**
 * Purchase Order Generator Service
 * توليد أوامر شراء تلقائية من المقايسة
 */

import type { FinancialItem, PurchaseOrder } from '../types';

export interface MaterialCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  keywords: string[];
  leadTime: number; // in days
  minOrderQuantity?: number;
  preferredSuppliers?: string[];
}

/**
 * تصنيف المواد حسب الفئات
 */
const MATERIAL_CATEGORIES: MaterialCategory[] = [
  {
    id: 'concrete',
    nameAr: 'خرسانة جاهزة',
    nameEn: 'Ready Mix Concrete',
    keywords: ['خرسانة', 'concrete', 'بلاطات', 'أعمدة', 'كمرات'],
    leadTime: 1,
    minOrderQuantity: 5,
    preferredSuppliers: ['شركة الخرسانة الجاهزة', 'مصانع الباطون']
  },
  {
    id: 'steel',
    nameAr: 'حديد التسليح',
    nameEn: 'Reinforcement Steel',
    keywords: ['حديد', 'steel', 'تسليح', 'رebar'],
    leadTime: 3,
    minOrderQuantity: 1,
    preferredSuppliers: ['حديد الراجحي', 'مصنع الحديد والصلب']
  },
  {
    id: 'cement',
    nameAr: 'أسمنت',
    nameEn: 'Cement',
    keywords: ['أسمنت', 'cement', 'إسمنت'],
    leadTime: 2,
    preferredSuppliers: ['أسمنت السعودية', 'أسمنت اليمامة']
  },
  {
    id: 'blocks',
    nameAr: 'طوب وبلوك',
    nameEn: 'Blocks & Bricks',
    keywords: ['طوب', 'بلوك', 'blocks', 'bricks', 'مباني'],
    leadTime: 3,
    preferredSuppliers: ['مصنع البلوك الأحمر', 'مصانع الطوب']
  },
  {
    id: 'tiles',
    nameAr: 'بلاط وسيراميك',
    nameEn: 'Tiles & Ceramics',
    keywords: ['بلاط', 'سيراميك', 'رخام', 'tiles', 'ceramic', 'marble', 'بورسلين'],
    leadTime: 5,
    preferredSuppliers: ['سيراميكا رأس الخيمة', 'سيراميكا كليوباترا']
  },
  {
    id: 'paint',
    nameAr: 'دهانات',
    nameEn: 'Paints',
    keywords: ['دهان', 'دهانات', 'paint', 'coating'],
    leadTime: 2,
    preferredSuppliers: ['جوتن', 'دهانات الجزيرة']
  },
  {
    id: 'doors_windows',
    nameAr: 'أبواب ونوافذ',
    nameEn: 'Doors & Windows',
    keywords: ['أبواب', 'نوافذ', 'doors', 'windows', 'ألمنيوم', 'زجاج'],
    leadTime: 7,
    preferredSuppliers: ['مصانع الألمنيوم', 'شركة الزجاج']
  },
  {
    id: 'electrical',
    nameAr: 'مواد كهربائية',
    nameEn: 'Electrical Materials',
    keywords: ['كهرباء', 'electrical', 'كابلات', 'أسلاك', 'مفاتيح'],
    leadTime: 4,
    preferredSuppliers: ['شنايدر', 'سيمنس']
  },
  {
    id: 'plumbing',
    nameAr: 'مواد صحية',
    nameEn: 'Plumbing Materials',
    keywords: ['صحي', 'plumbing', 'مواسير', 'خلاطات', 'أدوات صحية'],
    leadTime: 5,
    preferredSuppliers: ['أمريكان ستاندرد', 'مصانع المواسير']
  },
  {
    id: 'hvac',
    nameAr: 'تكييف وتهوية',
    nameEn: 'HVAC',
    keywords: ['تكييف', 'hvac', 'تهوية', 'مكيفات'],
    leadTime: 10,
    preferredSuppliers: ['كاريير', 'جنرال إلكتريك']
  }
];

/**
 * تصنيف البند من المقايسة
 */
function classifyMaterial(description: string): MaterialCategory {
  const desc = description.toLowerCase();
  
  for (const category of MATERIAL_CATEGORIES) {
    if (category.keywords.some(keyword => desc.includes(keyword))) {
      return category;
    }
  }
  
  // Default category
  return {
    id: 'other',
    nameAr: 'مواد أخرى',
    nameEn: 'Other Materials',
    keywords: [],
    leadTime: 5
  };
}

/**
 * حساب تاريخ الاحتياج بناءً على الجدول الزمني
 */
function calculateRequiredDate(
  projectStartDate: Date,
  leadTime: number,
  activityStartDay: number = 30
): Date {
  const requiredDate = new Date(projectStartDate);
  requiredDate.setDate(requiredDate.getDate() + activityStartDay - leadTime);
  return requiredDate;
}

/**
 * حساب تاريخ الطلب المقترح
 */
function calculateOrderDate(requiredDate: Date, leadTime: number): Date {
  const orderDate = new Date(requiredDate);
  orderDate.setDate(orderDate.getDate() - leadTime - 2); // 2 days buffer
  return orderDate;
}

/**
 * إنشاء أمر شراء من بند مقايسة
 */
function createPurchaseOrder(
  item: FinancialItem,
  category: MaterialCategory,
  projectStartDate: Date,
  index: number
): PurchaseOrder {
  const requiredDate = calculateRequiredDate(projectStartDate, category.leadTime);
  const orderDate = calculateOrderDate(requiredDate, category.leadTime);
  
  // Determine priority based on lead time and project phase
  let priority: 'low' | 'medium' | 'high' = 'medium';
  if (category.leadTime > 7) {
    priority = 'high';
  } else if (category.leadTime < 3) {
    priority = 'low';
  }
  
  return {
    id: `po-${Date.now()}-${index}`,
    poNumber: `PO-${new Date().getFullYear()}-${String(index + 1).padStart(4, '0')}`,
    date: orderDate.toISOString().split('T')[0],
    supplier: category.preferredSuppliers?.[0] || 'مورد مقترح',
    items: [
      {
        description: item.description,
        quantity: item.quantity || 0,
        unit: item.unit || 'وحدة',
        unitPrice: item.unitPrice || 0,
        total: item.total || 0
      }
    ],
    subtotal: item.total || 0,
    tax: (item.total || 0) * 0.15, // 15% VAT
    total: (item.total || 0) * 1.15,
    status: 'draft',
    notes: `تصنيف: ${category.nameAr}\nمدة التوريد: ${category.leadTime} أيام\nتاريخ الاحتياج: ${requiredDate.toISOString().split('T')[0]}`,
    requiredDate: requiredDate.toISOString().split('T')[0],
    category: category.nameAr,
    leadTime: category.leadTime,
    priority
  };
}

/**
 * تجميع البنود المتشابهة
 */
function groupSimilarItems(orders: PurchaseOrder[]): PurchaseOrder[] {
  const grouped = new Map<string, PurchaseOrder>();
  
  orders.forEach(order => {
    const key = `${order.supplier}-${order.category}-${order.requiredDate}`;
    
    if (grouped.has(key)) {
      const existing = grouped.get(key)!;
      existing.items.push(...order.items);
      existing.subtotal += order.subtotal;
      existing.tax += order.tax;
      existing.total += order.total;
    } else {
      grouped.set(key, { ...order });
    }
  });
  
  // Update PO numbers for grouped orders
  let counter = 1;
  grouped.forEach(order => {
    order.poNumber = `PO-${new Date().getFullYear()}-${String(counter++).padStart(4, '0')}`;
  });
  
  return Array.from(grouped.values());
}

/**
 * الدالة الرئيسية: توليد أوامر شراء من المقايسة
 */
export async function generatePurchaseOrders(
  boqItems: FinancialItem[],
  projectStartDate: Date,
  options: {
    groupSimilar?: boolean;
    minOrderValue?: number;
    includeAlternativeSuppliers?: boolean;
  } = {}
): Promise<PurchaseOrder[]> {
  try {
    console.log('🛒 بدء توليد أوامر الشراء من المقايسة...');
    console.log(`📊 عدد البنود: ${boqItems.length}`);
    
    const orders: PurchaseOrder[] = [];
    
    // إنشاء أمر شراء لكل بند
    boqItems.forEach((item, index) => {
      // Skip items with zero quantity or price
      if (!item.quantity || !item.unitPrice) {
        return;
      }
      
      const category = classifyMaterial(item.description);
      const order = createPurchaseOrder(item, category, projectStartDate, index);
      
      // Filter by minimum order value if specified
      if (options.minOrderValue && order.total < options.minOrderValue) {
        console.log(`⚠️ تخطي البند (قيمة أقل من الحد الأدنى): ${item.description}`);
        return;
      }
      
      orders.push(order);
    });
    
    // Group similar items if requested
    let finalOrders = orders;
    if (options.groupSimilar !== false) {
      console.log('🔄 تجميع البنود المتشابهة...');
      finalOrders = groupSimilarItems(orders);
    }
    
    // Sort by priority and required date
    finalOrders.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium'];
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(a.requiredDate || '').getTime() - new Date(b.requiredDate || '').getTime();
    });
    
    console.log(`✅ تم توليد ${finalOrders.length} أمر شراء`);
    console.log(`🔴 أوامر عالية الأولوية: ${finalOrders.filter(o => o.priority === 'high').length}`);
    console.log(`🟡 أوامر متوسطة الأولوية: ${finalOrders.filter(o => o.priority === 'medium').length}`);
    console.log(`🟢 أوامر منخفضة الأولوية: ${finalOrders.filter(o => o.priority === 'low').length}`);
    
    return finalOrders;
    
  } catch (error) {
    console.error('❌ خطأ في توليد أوامر الشراء:', error);
    throw error;
  }
}

/**
 * توليد ملخص أوامر الشراء
 */
export function generatePurchaseOrderSummary(orders: PurchaseOrder[]): {
  totalOrders: number;
  totalValue: number;
  byPriority: { high: number; medium: number; low: number };
  byCategory: { category: string; count: number; value: number }[];
  bySupplier: { supplier: string; count: number; value: number }[];
  timeline: { month: string; orders: number; value: number }[];
} {
  const byPriority = {
    high: orders.filter(o => o.priority === 'high').length,
    medium: orders.filter(o => o.priority === 'medium').length,
    low: orders.filter(o => o.priority === 'low').length
  };
  
  // Group by category
  const categoryMap = new Map<string, { count: number; value: number }>();
  orders.forEach(order => {
    const category = order.category || 'أخرى';
    if (!categoryMap.has(category)) {
      categoryMap.set(category, { count: 0, value: 0 });
    }
    const stats = categoryMap.get(category)!;
    stats.count++;
    stats.value += order.total;
  });
  
  const byCategory = Array.from(categoryMap.entries()).map(([category, stats]) => ({
    category,
    count: stats.count,
    value: stats.value
  })).sort((a, b) => b.value - a.value);
  
  // Group by supplier
  const supplierMap = new Map<string, { count: number; value: number }>();
  orders.forEach(order => {
    const supplier = order.supplier;
    if (!supplierMap.has(supplier)) {
      supplierMap.set(supplier, { count: 0, value: 0 });
    }
    const stats = supplierMap.get(supplier)!;
    stats.count++;
    stats.value += order.total;
  });
  
  const bySupplier = Array.from(supplierMap.entries()).map(([supplier, stats]) => ({
    supplier,
    count: stats.count,
    value: stats.value
  })).sort((a, b) => b.value - a.value);
  
  // Timeline
  const timelineMap = new Map<string, { orders: number; value: number }>();
  orders.forEach(order => {
    const date = new Date(order.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!timelineMap.has(monthKey)) {
      timelineMap.set(monthKey, { orders: 0, value: 0 });
    }
    const stats = timelineMap.get(monthKey)!;
    stats.orders++;
    stats.value += order.total;
  });
  
  const timeline = Array.from(timelineMap.entries())
    .map(([month, stats]) => ({ month, ...stats }))
    .sort((a, b) => a.month.localeCompare(b.month));
  
  return {
    totalOrders: orders.length,
    totalValue: orders.reduce((sum, o) => sum + o.total, 0),
    byPriority,
    byCategory,
    bySupplier,
    timeline
  };
}

/**
 * تصدير قائمة أوامر الشراء كـ CSV
 */
export function exportPurchaseOrdersToCSV(orders: PurchaseOrder[]): string {
  const headers = [
    'رقم الأمر',
    'التاريخ',
    'المورد',
    'الفئة',
    'الأولوية',
    'تاريخ الاحتياج',
    'مدة التوريد',
    'الإجمالي الفرعي',
    'الضريبة',
    'الإجمالي',
    'الحالة',
    'عدد البنود'
  ];
  
  const rows = orders.map(order => [
    order.poNumber,
    order.date,
    order.supplier,
    order.category || '',
    order.priority || 'medium',
    order.requiredDate || '',
    order.leadTime?.toString() || '',
    order.subtotal.toFixed(2),
    order.tax.toFixed(2),
    order.total.toFixed(2),
    order.status,
    order.items.length.toString()
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csv;
}
