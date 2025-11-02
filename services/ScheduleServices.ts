/**
 * NOUFAL Scheduling System - Schedule Services
 * S-Curve Generation, Export & Import Services
 * 
 * Includes:
 * - S-Curve data generation for progress tracking
 * - Export to Excel, PDF, Primavera formats
 * - Import from Excel, Primavera formats
 */

import { 
    AdvancedScheduleActivity, 
    SCurveData, 
    SchedulePerformanceMetrics,
    ScheduleExportOptions,
    PrimaveraActivity,
    ScheduleImportResult,
    WBSItem
} from '../types';

declare var XLSX: any;

// ==================== S-Curve Generator ====================

export class SCurveGenerator {
    /**
     * Generate S-Curve data for the schedule
     */
    static generateSCurve(
        activities: AdvancedScheduleActivity[],
        projectStart: Date,
        projectEnd: Date
    ): SCurveData[] {
        const sCurveData: SCurveData[] = [];
        const totalCost = this.calculateTotalCost(activities);
        
        // Generate daily data points
        const currentDate = new Date(projectStart);
        let cumulativePlannedProgress = 0;
        let cumulativePlannedCost = 0;

        while (currentDate <= projectEnd) {
            const dateStr = currentDate.toISOString().split('T')[0];
            
            // Calculate planned progress for this date
            const { progress, cost } = this.calculatePlannedAtDate(activities, currentDate);
            cumulativePlannedProgress += progress;
            cumulativePlannedCost += cost;

            // Calculate actual progress (based on activity actual progress)
            const { actualProgress, actualCost } = this.calculateActualAtDate(activities, currentDate);

            // Calculate Earned Value
            const earnedValue = (actualProgress / 100) * totalCost;

            sCurveData.push({
                date: dateStr,
                plannedProgress: Math.min(100, cumulativePlannedProgress),
                actualProgress: Math.min(100, actualProgress),
                plannedCost: cumulativePlannedCost,
                actualCost,
                earnedValue
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return sCurveData;
    }

    /**
     * Calculate planned work at a specific date
     */
    private static calculatePlannedAtDate(
        activities: AdvancedScheduleActivity[],
        targetDate: Date
    ): { progress: number; cost: number } {
        let dailyProgress = 0;
        let dailyCost = 0;

        for (const activity of activities) {
            const actStart = new Date(activity.startDate);
            const actEnd = new Date(activity.endDate);

            // Check if activity is active on this date
            if (targetDate >= actStart && targetDate <= actEnd) {
                // Calculate daily progress rate
                const duration = activity.duration || 1;
                const dailyProgressRate = 100 / duration / activities.length; // Per activity per day
                dailyProgress += dailyProgressRate;

                // Calculate daily cost
                const activityCost = this.calculateActivityCost(activity);
                dailyCost += activityCost / duration;
            }
        }

        return { progress: dailyProgress, cost: dailyCost };
    }

    /**
     * Calculate actual work at a specific date
     */
    private static calculateActualAtDate(
        activities: AdvancedScheduleActivity[],
        targetDate: Date
    ): { actualProgress: number; actualCost: number } {
        let totalProgress = 0;
        let totalCost = 0;

        for (const activity of activities) {
            if (activity.actualStart) {
                const actStart = new Date(activity.actualStart);
                
                if (targetDate >= actStart) {
                    totalProgress += (activity.progress || 0) / activities.length;
                    totalCost += this.calculateActivityCost(activity) * ((activity.progress || 0) / 100);
                }
            }
        }

        return { actualProgress: totalProgress, actualCost: totalCost };
    }

    /**
     * Calculate total project cost
     */
    private static calculateTotalCost(activities: AdvancedScheduleActivity[]): number {
        return activities.reduce((sum, act) => sum + this.calculateActivityCost(act), 0);
    }

    /**
     * Calculate individual activity cost
     */
    private static calculateActivityCost(activity: AdvancedScheduleActivity): number {
        let cost = 0;
        for (const resource of activity.resources) {
            if (resource.dailyRate) {
                cost += resource.quantity * resource.dailyRate * activity.duration;
            }
        }
        return cost || activity.duration * 1000; // Default cost if no resources
    }

    /**
     * Calculate Schedule Performance Metrics
     */
    static calculatePerformanceMetrics(
        activities: AdvancedScheduleActivity[],
        currentDate: Date
    ): SchedulePerformanceMetrics {
        const totalBudget = this.calculateTotalCost(activities);
        const { plannedProgress, plannedCost } = this.calculatePlannedAtDate(activities, currentDate);
        const { actualProgress, actualCost } = this.calculateActualAtDate(activities, currentDate);

        const earnedValue = (actualProgress / 100) * totalBudget;
        const plannedValue = (plannedProgress / 100) * totalBudget;

        // Schedule Performance Index
        const spi = plannedValue > 0 ? earnedValue / plannedValue : 1;

        // Cost Performance Index
        const cpi = actualCost > 0 ? earnedValue / actualCost : 1;

        // Schedule Variance
        const sv = earnedValue - plannedValue;

        // Cost Variance
        const cv = earnedValue - actualCost;

        // Estimate at Completion
        const estimatedCost = cpi > 0 ? totalBudget / cpi : totalBudget;

        // Estimate completion date
        const completionDays = spi > 0 ? this.getProjectDuration(activities) / spi : this.getProjectDuration(activities);
        const estimatedCompletion = new Date(currentDate);
        estimatedCompletion.setDate(estimatedCompletion.getDate() + completionDays);

        return {
            spi,
            cpi,
            sv,
            cv,
            estimatedCompletion: estimatedCompletion.toISOString().split('T')[0],
            estimatedCost
        };
    }

    /**
     * Get project duration
     */
    private static getProjectDuration(activities: AdvancedScheduleActivity[]): number {
        if (activities.length === 0) return 0;
        
        const starts = activities.map(a => new Date(a.startDate));
        const ends = activities.map(a => new Date(a.endDate));
        
        const projectStart = new Date(Math.min(...starts.map(d => d.getTime())));
        const projectEnd = new Date(Math.max(...ends.map(d => d.getTime())));
        
        return Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
    }
}

// ==================== Export Service ====================

export class ScheduleExportService {
    /**
     * Export schedule to Excel
     */
    static exportToExcel(
        activities: AdvancedScheduleActivity[],
        wbs: WBSItem[],
        projectName: string
    ): void {
        const workbook = XLSX.utils.book_new();

        // Sheet 1: Activities
        const activitiesData = activities.map(act => ({
            'رقم النشاط': act.id,
            'كود WBS': act.wbsCode,
            'اسم النشاط': act.name,
            'الوصف': act.description,
            'المدة (أيام)': act.duration,
            'تاريخ البدء': act.startDate,
            'تاريخ الانتهاء': act.endDate,
            'البدء المبكر': act.earlyStart,
            'الانتهاء المبكر': act.earlyFinish,
            'البدء المتأخر': act.lateStart,
            'الانتهاء المتأخر': act.lateFinish,
            'Float الكلي': act.totalFloat,
            'Float الحر': act.freeFloat,
            'حرج': act.isCritical ? 'نعم' : 'لا',
            'التقدم %': act.progress,
            'الحالة': act.status,
            'تكلفة التقديرية': SCurveGenerator['calculateActivityCost'](act)
        }));

        const wsActivities = XLSX.utils.json_to_sheet(activitiesData);
        XLSX.utils.book_append_sheet(workbook, wsActivities, 'الأنشطة');

        // Sheet 2: WBS
        const wbsData = wbs.map(item => ({
            'كود WBS': item.code,
            'المستوى': item.level,
            'الاسم': item.name,
            'عدد الأنشطة': item.activities.length,
            'المدة الإجمالية': item.totalDuration,
            'التكلفة الإجمالية': item.totalCost
        }));

        const wsWBS = XLSX.utils.json_to_sheet(wbsData);
        XLSX.utils.book_append_sheet(workbook, wsWBS, 'WBS');

        // Sheet 3: Critical Path
        const criticalActivities = activities.filter(act => act.isCritical);
        const criticalData = criticalActivities.map(act => ({
            'رقم النشاط': act.id,
            'اسم النشاط': act.name,
            'المدة': act.duration,
            'تاريخ البدء': act.startDate,
            'تاريخ الانتهاء': act.endDate
        }));

        const wsCritical = XLSX.utils.json_to_sheet(criticalData);
        XLSX.utils.book_append_sheet(workbook, wsCritical, 'المسار الحرج');

        // Download file
        XLSX.writeFile(workbook, `${projectName}_Schedule_${new Date().toISOString().split('T')[0]}.xlsx`);
    }

    /**
     * Export to Primavera P6 XML format (simplified)
     */
    static exportToPrimavera(
        activities: AdvancedScheduleActivity[],
        projectName: string
    ): void {
        const primaveraActivities: PrimaveraActivity[] = activities.map(act => ({
            activityId: `A${act.id}`,
            activityName: act.name,
            originalDuration: act.duration,
            remainingDuration: act.duration * (1 - act.progress / 100),
            percentComplete: act.progress,
            startDate: act.startDate,
            finishDate: act.endDate,
            calendarId: 'STD',
            wbsId: act.wbsCode,
            predecessors: act.dependencies.map(dep => ({
                predecessorActivityId: `A${dep.predecessorId}`,
                type: `PR_${dep.type}` as any,
                lag: dep.lag
            }))
        }));

        // Generate XML
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<Project>\n';
        xml += `  <ProjectName>${projectName}</ProjectName>\n`;
        xml += '  <Activities>\n';

        for (const act of primaveraActivities) {
            xml += '    <Activity>\n';
            xml += `      <ActivityId>${act.activityId}</ActivityId>\n`;
            xml += `      <ActivityName><![CDATA[${act.activityName}]]></ActivityName>\n`;
            xml += `      <Duration>${act.originalDuration}</Duration>\n`;
            xml += `      <PercentComplete>${act.percentComplete}</PercentComplete>\n`;
            xml += `      <StartDate>${act.startDate}</StartDate>\n`;
            xml += `      <FinishDate>${act.finishDate}</FinishDate>\n`;
            xml += `      <WBSCode>${act.wbsId}</WBSCode>\n`;
            
            if (act.predecessors.length > 0) {
                xml += '      <Predecessors>\n';
                for (const pred of act.predecessors) {
                    xml += '        <Predecessor>\n';
                    xml += `          <ActivityId>${pred.predecessorActivityId}</ActivityId>\n`;
                    xml += `          <Type>${pred.type}</Type>\n`;
                    xml += `          <Lag>${pred.lag}</Lag>\n`;
                    xml += '        </Predecessor>\n';
                }
                xml += '      </Predecessors>\n';
            }
            
            xml += '    </Activity>\n';
        }

        xml += '  </Activities>\n';
        xml += '</Project>';

        // Download XML file
        const blob = new Blob([xml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName}_Primavera_${new Date().toISOString().split('T')[0]}.xml`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Generate PDF (simplified - returns HTML for printing)
     */
    static generatePDFContent(
        activities: AdvancedScheduleActivity[],
        projectName: string
    ): string {
        let html = `
            <html>
            <head>
                <title>${projectName} - Schedule</title>
                <style>
                    body { font-family: Arial, sans-serif; direction: rtl; }
                    h1 { text-align: center; color: #333; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                    th { background-color: #4CAF50; color: white; }
                    .critical { background-color: #ffcccc; }
                </style>
            </head>
            <body>
                <h1>الجدول الزمني للمشروع: ${projectName}</h1>
                <table>
                    <thead>
                        <tr>
                            <th>رقم</th>
                            <th>اسم النشاط</th>
                            <th>المدة</th>
                            <th>تاريخ البدء</th>
                            <th>تاريخ الانتهاء</th>
                            <th>Float</th>
                            <th>حرج</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        activities.forEach(act => {
            const rowClass = act.isCritical ? 'critical' : '';
            html += `
                <tr class="${rowClass}">
                    <td>${act.id}</td>
                    <td>${act.name}</td>
                    <td>${act.duration} يوم</td>
                    <td>${act.startDate}</td>
                    <td>${act.endDate}</td>
                    <td>${act.totalFloat}</td>
                    <td>${act.isCritical ? '★' : ''}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </body>
            </html>
        `;

        return html;
    }

    /**
     * Print PDF
     */
    static printPDF(activities: AdvancedScheduleActivity[], projectName: string): void {
        const content = this.generatePDFContent(activities, projectName);
        const printWindow = window.open('', '', 'width=800,height=600');
        if (printWindow) {
            printWindow.document.write(content);
            printWindow.document.close();
            printWindow.print();
        }
    }
}

// ==================== Import Service ====================

export class ScheduleImportService {
    /**
     * Import schedule from Excel
     */
    static importFromExcel(file: File): Promise<ScheduleImportResult> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    // Read activities sheet
                    const activitiesSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const activitiesJson: any[] = XLSX.utils.sheet_to_json(activitiesSheet);
                    
                    const activities: AdvancedScheduleActivity[] = [];
                    const warnings: string[] = [];
                    const errors: string[] = [];
                    
                    activitiesJson.forEach((row, index) => {
                        try {
                            const activity: AdvancedScheduleActivity = {
                                id: row['رقم النشاط'] || row['Activity ID'] || index + 1,
                                wbsCode: row['كود WBS'] || row['WBS Code'] || '',
                                name: row['اسم النشاط'] || row['Activity Name'] || '',
                                description: row['الوصف'] || row['Description'] || '',
                                category: '',
                                duration: parseInt(row['المدة (أيام)'] || row['Duration'] || '0'),
                                startDate: row['تاريخ البدء'] || row['Start Date'] || '',
                                endDate: row['تاريخ الانتهاء'] || row['End Date'] || '',
                                earlyStart: '',
                                earlyFinish: '',
                                lateStart: '',
                                lateFinish: '',
                                totalFloat: 0,
                                freeFloat: 0,
                                isCritical: false,
                                dependencies: [],
                                successors: [],
                                resources: [],
                                progress: parseInt(row['التقدم %'] || row['Progress'] || '0'),
                                status: 'Not Started',
                                productivityRate: 0,
                                estimatedManHours: 0
                            };
                            
                            activities.push(activity);
                        } catch (err: any) {
                            errors.push(`Row ${index + 1}: ${err.message}`);
                        }
                    });
                    
                    const result: ScheduleImportResult = {
                        activities,
                        wbs: [],
                        metadata: {
                            projectName: file.name.replace('.xlsx', ''),
                            projectStart: activities[0]?.startDate || '',
                            projectFinish: activities[activities.length - 1]?.endDate || '',
                            totalActivities: activities.length,
                            importDate: new Date().toISOString().split('T')[0],
                            sourceFormat: 'Excel'
                        },
                        warnings,
                        errors
                    };
                    
                    resolve(result);
                } catch (error: any) {
                    reject(new Error(`Failed to parse Excel file: ${error.message}`));
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    }
}

export default {
    SCurveGenerator,
    ScheduleExportService,
    ScheduleImportService
};
