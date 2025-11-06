/**
 * Excel Exporter - تصدير الجدول الزمني بتنسيق احترافي
 * يصدر مثل ملفات PDF مع ألوان وتنسيق
 */

import { AdvancedScheduleActivity } from '../types';

declare var XLSX: any;

export interface ExportOptions {
    includeGantt: boolean;
    includeProgress: boolean;
    includeResources: boolean;
    colorByStatus: boolean;
    colorByCritical: boolean;
}

export class ExcelExporter {
    /**
     * تصدير الجدول الزمني إلى Excel مع تنسيق احترافي
     */
    static exportSchedule(
        activities: AdvancedScheduleActivity[],
        projectName: string,
        options: Partial<ExportOptions> = {}
    ): void {
        const opts: ExportOptions = {
            includeGantt: true,
            includeProgress: true,
            includeResources: true,
            colorByStatus: true,
            colorByCritical: true,
            ...options
        };

        // Create workbook
        const wb = XLSX.utils.book_new();

        // Sheet 1: Schedule
        this.addScheduleSheet(wb, activities, opts);

        // Sheet 2: Summary
        this.addSummarySheet(wb, activities, projectName);

        // Sheet 3: Critical Path
        this.addCriticalPathSheet(wb, activities);

        // Sheet 4: Resource Loading
        if (opts.includeResources) {
            this.addResourceSheet(wb, activities);
        }

        // Download
        const fileName = `${projectName}_Schedule_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    }

    /**
     * Sheet 1: جدول الأنشطة الرئيسي
     */
    private static addScheduleSheet(
        wb: any,
        activities: AdvancedScheduleActivity[],
        opts: ExportOptions
    ): void {
        const data: any[] = [];

        // Header Row
        const headers = [
            'WBS',
            'رقم النشاط',
            'اسم النشاط',
            'النوع',
            'الفئة',
            'تاريخ البدء',
            'تاريخ الانتهاء',
            'المدة (أيام)',
            'التقدم %',
            'الحالة',
            'حرج؟',
            'الأسبقيات',
            'الموارد',
            'التكلفة',
        ];
        data.push(headers);

        // Sort by WBS
        const sorted = [...activities].sort((a, b) => a.wbsCode.localeCompare(b.wbsCode));

        // Data Rows
        sorted.forEach(activity => {
            const row = [
                activity.wbsCode,
                activity.id,
                activity.name,
                this.getTypeNameAr(activity.type),
                activity.category,
                activity.startDate.toLocaleDateString('ar-SA'),
                activity.endDate.toLocaleDateString('ar-SA'),
                activity.duration,
                activity.progress,
                this.getStatusNameAr(activity.status),
                activity.isCritical ? 'نعم' : 'لا',
                activity.dependencies?.join(', ') || '-',
                activity.resources?.join(', ') || '-',
                activity.cost ? `${activity.cost.toLocaleString()} ريال` : '-',
            ];
            data.push(row);
        });

        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(data);

        // Set column widths
        ws['!cols'] = [
            { wch: 12 },  // WBS
            { wch: 12 },  // ID
            { wch: 40 },  // Name
            { wch: 15 },  // Type
            { wch: 20 },  // Category
            { wch: 15 },  // Start
            { wch: 15 },  // End
            { wch: 12 },  // Duration
            { wch: 10 },  // Progress
            { wch: 12 },  // Status
            { wch: 8 },   // Critical
            { wch: 15 },  // Dependencies
            { wch: 20 },  // Resources
            { wch: 18 },  // Cost
        ];

        // Apply colors (if supported by XLSX library)
        // Note: Basic XLSX.utils doesn't support cell styling
        // For full styling, need xlsx-style or ExcelJS library

        XLSX.utils.book_append_sheet(wb, ws, 'الجدول الزمني');
    }

    /**
     * Sheet 2: ملخص المشروع
     */
    private static addSummarySheet(
        wb: any,
        activities: AdvancedScheduleActivity[],
        projectName: string
    ): void {
        const data: any[] = [];

        // Project Info
        data.push(['معلومات المشروع']);
        data.push(['اسم المشروع', projectName]);
        data.push(['تاريخ الإنشاء', new Date().toLocaleDateString('ar-SA')]);
        data.push([]);

        // Statistics
        data.push(['الإحصائيات']);
        data.push(['إجمالي الأنشطة', activities.length]);
        data.push(['الأنشطة الحرجة', activities.filter(a => a.isCritical).length]);
        data.push(['الأنشطة المكتملة', activities.filter(a => a.progress === 100).length]);
        data.push(['الأنشطة قيد التنفيذ', activities.filter(a => a.progress > 0 && a.progress < 100).length]);
        data.push(['الأنشطة غير المبدوءة', activities.filter(a => a.progress === 0).length]);
        data.push([]);

        // Project Duration
        const starts = activities.map(a => a.startDate.getTime());
        const ends = activities.map(a => a.endDate.getTime());
        const projectStart = new Date(Math.min(...starts));
        const projectEnd = new Date(Math.max(...ends));
        const projectDuration = Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));

        data.push(['الجدول الزمني']);
        data.push(['تاريخ البداية', projectStart.toLocaleDateString('ar-SA')]);
        data.push(['تاريخ النهاية', projectEnd.toLocaleDateString('ar-SA')]);
        data.push(['المدة الإجمالية', `${projectDuration} يوم`]);
        data.push([]);

        // By Category
        data.push(['التوزيع حسب الفئة']);
        const byCategory: { [key: string]: number } = {};
        activities.forEach(a => {
            byCategory[a.category] = (byCategory[a.category] || 0) + 1;
        });
        Object.entries(byCategory).forEach(([cat, count]) => {
            data.push([cat, count]);
        });
        data.push([]);

        // By Type
        data.push(['التوزيع حسب النوع']);
        const byType: { [key: string]: number } = {};
        activities.forEach(a => {
            const typeName = this.getTypeNameAr(a.type);
            byType[typeName] = (byType[typeName] || 0) + 1;
        });
        Object.entries(byType).forEach(([type, count]) => {
            data.push([type, count]);
        });

        const ws = XLSX.utils.aoa_to_sheet(data);
        ws['!cols'] = [{ wch: 25 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, ws, 'الملخص');
    }

    /**
     * Sheet 3: المسار الحرج
     */
    private static addCriticalPathSheet(
        wb: any,
        activities: AdvancedScheduleActivity[]
    ): void {
        const data: any[] = [];

        // Header
        data.push(['المسار الحرج للمشروع']);
        data.push([]);
        data.push([
            'WBS',
            'رقم النشاط',
            'اسم النشاط',
            'تاريخ البدء',
            'تاريخ الانتهاء',
            'المدة',
            'التقدم %',
            'الوقت الإضافي',
        ]);

        // Critical activities
        const critical = activities.filter(a => a.isCritical);
        critical.forEach(activity => {
            data.push([
                activity.wbsCode,
                activity.id,
                activity.name,
                activity.startDate.toLocaleDateString('ar-SA'),
                activity.endDate.toLocaleDateString('ar-SA'),
                activity.duration,
                activity.progress,
                activity.totalFloat || 0,
            ]);
        });

        data.push([]);
        data.push(['إجمالي الأنشطة الحرجة', critical.length]);
        data.push(['نسبة الأنشطة الحرجة', `${((critical.length / activities.length) * 100).toFixed(1)}%`]);

        const ws = XLSX.utils.aoa_to_sheet(data);
        ws['!cols'] = [
            { wch: 12 },
            { wch: 12 },
            { wch: 40 },
            { wch: 15 },
            { wch: 15 },
            { wch: 10 },
            { wch: 10 },
            { wch: 12 },
        ];
        XLSX.utils.book_append_sheet(wb, ws, 'المسار الحرج');
    }

    /**
     * Sheet 4: تحميل الموارد
     */
    private static addResourceSheet(
        wb: any,
        activities: AdvancedScheduleActivity[]
    ): void {
        const data: any[] = [];

        // Header
        data.push(['تحميل الموارد حسب الأسبوع']);
        data.push([]);

        // Get project date range
        const starts = activities.map(a => a.startDate.getTime());
        const ends = activities.map(a => a.endDate.getTime());
        const projectStart = new Date(Math.min(...starts));
        const projectEnd = new Date(Math.max(...ends));

        // Calculate weeks
        const weeks: Date[] = [];
        let current = new Date(projectStart);
        while (current <= projectEnd) {
            weeks.push(new Date(current));
            current.setDate(current.getDate() + 7);
        }

        // Header row with weeks
        const headerRow = ['الفئة', 'النوع'];
        weeks.forEach((week, i) => {
            headerRow.push(`أسبوع ${i + 1}`);
        });
        data.push(headerRow);

        // Calculate resource loading per week
        const byCategory: { [key: string]: number[] } = {};
        
        activities.forEach(activity => {
            if (!byCategory[activity.category]) {
                byCategory[activity.category] = new Array(weeks.length).fill(0);
            }

            // For each week, check if activity is active
            weeks.forEach((weekStart, weekIndex) => {
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 7);

                if (activity.startDate <= weekEnd && activity.endDate >= weekStart) {
                    byCategory[activity.category][weekIndex] += 1;
                }
            });
        });

        // Add data rows
        Object.entries(byCategory).forEach(([category, counts]) => {
            const row = [category, ''];
            row.push(...counts.map(c => c.toString()));
            data.push(row);
        });

        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'الموارد');
    }

    /**
     * Get Arabic name for activity type
     */
    private static getTypeNameAr(type: string): string {
        const types: { [key: string]: string } = {
            'excavation': 'حفر',
            'concrete': 'خرسانة',
            'reinforcement': 'حديد تسليح',
            'formwork': 'شدة خشبية',
            'masonry': 'مباني',
            'waterproofing': 'عزل',
            'backfill': 'ردم',
            'painting': 'دهان',
            'installation': 'تركيب',
            'supply': 'توريد',
            'other': 'أخرى',
        };
        return types[type] || type;
    }

    /**
     * Get Arabic name for status
     */
    private static getStatusNameAr(status: string): string {
        const statuses: { [key: string]: string } = {
            'not_started': 'لم يبدأ',
            'in_progress': 'قيد التنفيذ',
            'completed': 'مكتمل',
            'delayed': 'متأخر',
            'on_hold': 'معلق',
        };
        return statuses[status] || status;
    }
}

export default ExcelExporter;
