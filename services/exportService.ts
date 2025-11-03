/**
 * Export Service
 * تصدير التحليلات إلى Excel و PDF مع الحفاظ على التنسيق
 */

import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AnalyzedItem } from './aiItemAnalyzer';

/**
 * تصدير البنود المحللة إلى Excel مع تنسيق كامل
 */
export async function exportToExcel(analyzedItems: AnalyzedItem[], projectName: string = 'تحليل المقايسة'): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  
  // إعداد خصائص الملف
  workbook.creator = 'NOUFAL AI System';
  workbook.lastModifiedBy = 'NOUFAL AI';
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.properties.date1904 = true;

  // ورقة الملخص
  const summarySheet = workbook.addWorksheet('الملخص التنفيذي', {
    views: [{ rightToLeft: true }],
    properties: { tabColor: { argb: 'FF4A90E2' } }
  });

  // عنوان رئيسي
  summarySheet.mergeCells('A1:F1');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = `تحليل المقايسة - ${projectName}`;
  titleCell.font = { name: 'Arial', size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' } // أزرق
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  summarySheet.getRow(1).height = 40;

  // إحصائيات عامة
  const totalItems = analyzedItems.length;
  const avgConfidence = analyzedItems.length > 0 
    ? Math.round(analyzedItems.reduce((sum, item) => sum + item.analysis.confidence, 0) / analyzedItems.length)
    : 0;
  const totalWorkers = analyzedItems.reduce((sum, item) => sum + item.analysis.labor.totalWorkers, 0);
  const totalDuration = analyzedItems.reduce((sum, item) => sum + item.analysis.breakdown.totalDuration, 0);
  const totalCost = analyzedItems.reduce((sum, item) => sum + item.analysis.labor.totalCost, 0);

  summarySheet.addRow([]);
  summarySheet.addRow(['الإحصائية', 'القيمة']);
  summarySheet.addRow(['إجمالي البنود', totalItems]);
  summarySheet.addRow(['متوسط دقة التحليل', `${avgConfidence}%`]);
  summarySheet.addRow(['إجمالي العمالة المطلوبة', totalWorkers]);
  summarySheet.addRow(['المدة الإجمالية', `${totalDuration} يوم`]);
  summarySheet.addRow(['تكلفة العمالة الإجمالية', `${totalCost.toLocaleString('ar-SA')} ريال`]);

  // تنسيق جدول الإحصائيات
  for (let i = 3; i <= 8; i++) {
    const row = summarySheet.getRow(i);
    row.getCell(1).font = { bold: true, color: { argb: 'FF1E40AF' } };
    row.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E7FF' }
    };
    row.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  }

  summarySheet.getColumn(1).width = 25;
  summarySheet.getColumn(2).width = 30;

  // ورقة تفاصيل البنود
  const itemsSheet = workbook.addWorksheet('تفاصيل البنود', {
    views: [{ rightToLeft: true }],
    properties: { tabColor: { argb: 'FF10B981' } }
  });

  // عناوين الأعمدة
  const headers = ['#', 'رقم البند', 'الوصف', 'الكمية', 'الوحدة', 'عدد الأنشطة', 'العمالة', 'المدة (يوم)', 'التكلفة (ريال)', 'الدقة %'];
  const headerRow = itemsSheet.addRow(headers);
  
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF059669' } // أخضر
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 25;

  // بيانات البنود
  analyzedItems.forEach((item, index) => {
    const row = itemsSheet.addRow([
      index + 1,
      item.itemNumber,
      item.description,
      item.quantity,
      item.unit,
      item.analysis.breakdown.activities.length,
      item.analysis.labor.totalWorkers,
      item.analysis.breakdown.totalDuration,
      item.analysis.labor.totalCost,
      item.analysis.confidence
    ]);

    // تنسيق حسب الدقة
    const confidenceCell = row.getCell(10);
    if (item.analysis.confidence >= 90) {
      confidenceCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
      confidenceCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    } else if (item.analysis.confidence >= 70) {
      confidenceCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
      confidenceCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    } else {
      confidenceCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } };
      confidenceCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    }

    // حدود
    row.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  // ضبط عرض الأعمدة
  itemsSheet.columns = [
    { width: 5 }, { width: 12 }, { width: 40 }, { width: 10 }, { width: 10 },
    { width: 12 }, { width: 10 }, { width: 12 }, { width: 15 }, { width: 10 }
  ];

  // ورقة تفاصيل الأنشطة
  const activitiesSheet = workbook.addWorksheet('تحليل الأنشطة', {
    views: [{ rightToLeft: true }],
    properties: { tabColor: { argb: 'FFF59E0B' } }
  });

  const activityHeaders = ['رقم البند', 'اسم النشاط', 'التسلسل', 'المدة (يوم)', 'العمالة', 'التخصص', 'الإنتاجية'];
  const activityHeaderRow = activitiesSheet.addRow(activityHeaders);
  
  activityHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  activityHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD97706' } // برتقالي
  };
  activityHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };

  analyzedItems.forEach(item => {
    item.analysis.breakdown.activities.forEach(activity => {
      activity.workers.forEach((worker, idx) => {
        const row = activitiesSheet.addRow([
          item.itemNumber,
          idx === 0 ? activity.name : '',
          idx === 0 ? activity.sequence : '',
          idx === 0 ? activity.duration : '',
          worker.count,
          worker.role,
          worker.productivity
        ]);

        row.eachCell(cell => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });
    });
  });

  activitiesSheet.columns = [
    { width: 12 }, { width: 30 }, { width: 10 }, { width: 12 },
    { width: 10 }, { width: 20 }, { width: 12 }
  ];

  // حفظ الملف
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * تصدير البنود المحللة إلى PDF مع تنسيق كامل
 */
export async function exportToPDF(analyzedItems: AnalyzedItem[], projectName: string = 'تحليل المقايسة'): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // إضافة خط عربي (يتطلب تضمين خط عربي)
  // doc.addFont('path/to/arabic-font.ttf', 'Arabic', 'normal');
  // doc.setFont('Arabic');

  // العنوان الرئيسي
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235); // أزرق
  doc.text(`تحليل المقايسة - ${projectName}`, 148, 20, { align: 'center' });

  // الإحصائيات
  const totalItems = analyzedItems.length;
  const avgConfidence = analyzedItems.length > 0 
    ? Math.round(analyzedItems.reduce((sum, item) => sum + item.analysis.confidence, 0) / analyzedItems.length)
    : 0;
  const totalWorkers = analyzedItems.reduce((sum, item) => sum + item.analysis.labor.totalWorkers, 0);
  const totalDuration = analyzedItems.reduce((sum, item) => sum + item.analysis.breakdown.totalDuration, 0);
  const totalCost = analyzedItems.reduce((sum, item) => sum + item.analysis.labor.totalCost, 0);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  let y = 35;
  doc.text(`Total Items: ${totalItems}`, 20, y);
  y += 8;
  doc.text(`Average Confidence: ${avgConfidence}%`, 20, y);
  y += 8;
  doc.text(`Total Workers: ${totalWorkers}`, 20, y);
  y += 8;
  doc.text(`Total Duration: ${totalDuration} days`, 20, y);
  y += 8;
  doc.text(`Total Labor Cost: ${totalCost.toLocaleString()} SAR`, 20, y);

  // جدول البنود
  const tableData = analyzedItems.map((item, index) => [
    String(index + 1),
    item.itemNumber,
    item.description.substring(0, 50), // تقصير الوصف
    String(item.quantity),
    item.unit,
    String(item.analysis.breakdown.activities.length),
    String(item.analysis.labor.totalWorkers),
    String(item.analysis.breakdown.totalDuration),
    String(item.analysis.labor.totalCost.toFixed(0)),
    `${item.analysis.confidence}%`
  ]);

  autoTable(doc, {
    startY: y + 10,
    head: [['#', 'Item No', 'Description', 'Qty', 'Unit', 'Activities', 'Workers', 'Duration', 'Cost', 'Confidence']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [5, 150, 105], // أخضر
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 60 },
      3: { cellWidth: 12, halign: 'center' },
      4: { cellWidth: 12, halign: 'center' },
      5: { cellWidth: 15, halign: 'center' },
      6: { cellWidth: 15, halign: 'center' },
      7: { cellWidth: 15, halign: 'center' },
      8: { cellWidth: 18, halign: 'right' },
      9: { cellWidth: 15, halign: 'center' }
    },
    didDrawCell: (data) => {
      // تلوين الدقة حسب القيمة
      if (data.column.index === 9 && data.section === 'body') {
        const item = analyzedItems[data.row.index];
        if (item.analysis.confidence >= 90) {
          doc.setFillColor(16, 185, 129); // أخضر
        } else if (item.analysis.confidence >= 70) {
          doc.setFillColor(59, 130, 246); // أزرق
        } else {
          doc.setFillColor(245, 158, 11); // برتقالي
        }
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(data.cell.text[0], data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, {
          align: 'center',
          baseline: 'middle'
        });
      }
    }
  });

  // تذييل
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Generated by NOUFAL AI System - Page ${i} of ${pageCount}`,
      148,
      205,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}

/**
 * تنزيل ملف Blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * تصدير وتنزيل Excel
 */
export async function exportAndDownloadExcel(analyzedItems: AnalyzedItem[], projectName: string = 'تحليل المقايسة'): Promise<void> {
  const blob = await exportToExcel(analyzedItems, projectName);
  const filename = `${projectName}_${new Date().toISOString().split('T')[0]}.xlsx`;
  downloadBlob(blob, filename);
}

/**
 * تصدير وتنزيل PDF
 */
export async function exportAndDownloadPDF(analyzedItems: AnalyzedItem[], projectName: string = 'تحليل المقايسة'): Promise<void> {
  const blob = await exportToPDF(analyzedItems, projectName);
  const filename = `${projectName}_${new Date().toISOString().split('T')[0]}.pdf`;
  downloadBlob(blob, filename);
}
