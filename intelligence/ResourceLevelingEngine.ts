/**
 * NOUFAL - Resource Leveling Engine (الخطوة 9)
 * محرك موازنة الأحمال العمالية
 * 
 * يضمن أن Peak ≤ 120% of Average
 */

import { AdvancedScheduleActivity, ResourceHistogram, ResourceLevelingResult } from '../types';

export class ResourceLevelingEngine {
    /**
     * الخطوة 9: توزيع وموازنة الأحمال
     * 
     * @param activities - قائمة الأنشطة
     * @param maxLaborCapacity - الطاقة الاستيعابية القصوى للموقع
     * @returns نتيجة الموازنة مع التوصيات
     */
    static performResourceLeveling(
        activities: AdvancedScheduleActivity[],
        maxLaborCapacity?: number
    ): ResourceLevelingResult {
        // بناء الهيستوجرام (Resource Histogram)
        const histogram = this.buildHistogram(activities);
        
        // حساب المؤشرات
        const laborCounts = histogram.map(h => h.laborCount);
        const peakLabor = Math.max(...laborCounts);
        const averageLabor = laborCounts.reduce((a, b) => a + b, 0) / laborCounts.length;
        const peakToAverageRatio = peakLabor / averageLabor;
        
        // التحقق من التوازن
        const isBalanced = peakToAverageRatio <= 1.20; // ≤ 120%
        const isWithinCapacity = maxLaborCapacity ? peakLabor <= maxLaborCapacity : true;
        
        // توليد التوصيات
        const recommendations: string[] = [];
        
        if (!isBalanced) {
            recommendations.push(
                `⚠️ Peak (${peakLabor}) يتجاوز 120% من Average (${averageLabor.toFixed(0)}). نسبة: ${(peakToAverageRatio * 100).toFixed(0)}%`
            );
            recommendations.push('💡 توصية: Split Activity - قسّم الأنشطة ذات الأحمال العالية');
            recommendations.push('💡 توصية: Increase Crews - زد عدد الطواقم');
            recommendations.push('💡 توصية: Add Shift - حوّل بعض الأنشطة إلى ورديتين');
        }
        
        if (maxLaborCapacity && !isWithinCapacity) {
            recommendations.push(
                `🚫 Peak (${peakLabor}) يتجاوز الطاقة القصوى (${maxLaborCapacity})`
            );
            recommendations.push('💡 توصية: Schedule Adjustment - أعد جدولة الأنشطة المتزامنة');
        }
        
        if (isBalanced && isWithinCapacity) {
            recommendations.push('✅ الأحمال متوازنة ضمن الطاقة الاستيعابية');
        }
        
        return {
            histogram,
            peakLabor,
            averageLabor: Number(averageLabor.toFixed(1)),
            peakToAverageRatio: Number(peakToAverageRatio.toFixed(2)),
            isBalanced: isBalanced && isWithinCapacity,
            recommendations
        };
    }
    
    /**
     * بناء الهيستوجرام اليومي للموارد
     */
    private static buildHistogram(activities: AdvancedScheduleActivity[]): ResourceHistogram[] {
        // إيجاد نطاق التواريخ
        const allDates = new Set<string>();
        
        activities.forEach(activity => {
            const start = new Date(activity.startDate);
            const end = new Date(activity.endDate);
            
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                allDates.add(d.toISOString().split('T')[0]);
            }
        });
        
        const sortedDates = Array.from(allDates).sort();
        
        // حساب الموارد لكل يوم
        const histogram: ResourceHistogram[] = sortedDates.map(date => {
            let laborCount = 0;
            let equipmentCount = 0;
            let materialCost = 0;
            
            activities.forEach(activity => {
                const start = new Date(activity.startDate);
                const end = new Date(activity.endDate);
                const current = new Date(date);
                
                // إذا كان النشاط نشطاً في هذا اليوم
                if (current >= start && current <= end) {
                    activity.resources.forEach(resource => {
                        if (resource.resourceType === 'Labor') {
                            laborCount += resource.quantity;
                        } else if (resource.resourceType === 'Equipment') {
                            equipmentCount += resource.quantity;
                        } else if (resource.resourceType === 'Material') {
                            materialCost += (resource.dailyRate || 0) * resource.quantity;
                        }
                    });
                }
            });
            
            return {
                date,
                laborCount,
                equipmentCount,
                materialCost
            };
        });
        
        return histogram;
    }
    
    /**
     * اقتراحات تلقائية لتحسين التوازن
     */
    static suggestOptimizations(
        activities: AdvancedScheduleActivity[],
        levelingResult: ResourceLevelingResult
    ): {
        activityId: number;
        currentLabor: number;
        suggestion: string;
    }[] {
        if (levelingResult.isBalanced) {
            return [];
        }
        
        const suggestions: any[] = [];
        
        // إيجاد الأنشطة ذات الأحمال العالية
        const peakDates = levelingResult.histogram
            .filter(h => h.laborCount > levelingResult.averageLabor * 1.2)
            .map(h => h.date);
        
        peakDates.forEach(date => {
            const activeActivities = activities.filter(activity => {
                const start = new Date(activity.startDate);
                const end = new Date(activity.endDate);
                const current = new Date(date);
                return current >= start && current <= end;
            });
            
            activeActivities.forEach(activity => {
                const totalLabor = activity.resources
                    .filter(r => r.resourceType === 'Labor')
                    .reduce((sum, r) => sum + r.quantity, 0);
                
                if (totalLabor > 10) { // إذا كان النشاط يستخدم أكثر من 10 عمال
                    suggestions.push({
                        activityId: activity.id,
                        currentLabor: totalLabor,
                        suggestion: `Split Activity: قسّم "${activity.name}" إلى أجزاء أصغر`
                    });
                }
            });
        });
        
        return suggestions;
    }
    
    /**
     * تطبيق التحسينات المقترحة تلقائياً
     */
    static autoOptimize(
        activities: AdvancedScheduleActivity[],
        maxIterations: number = 5
    ): {
        optimizedActivities: AdvancedScheduleActivity[];
        iterations: number;
        finalResult: ResourceLevelingResult;
    } {
        let currentActivities = [...activities];
        let iteration = 0;
        let levelingResult = this.performResourceLeveling(currentActivities);
        
        while (!levelingResult.isBalanced && iteration < maxIterations) {
            iteration++;
            
            // اقتراح تحسينات
            const suggestions = this.suggestOptimizations(currentActivities, levelingResult);
            
            if (suggestions.length === 0) {
                break; // لا توجد تحسينات ممكنة
            }
            
            // تطبيق أول اقتراح
            const firstSuggestion = suggestions[0];
            currentActivities = this.splitActivity(currentActivities, firstSuggestion.activityId);
            
            // إعادة حساب
            levelingResult = this.performResourceLeveling(currentActivities);
        }
        
        return {
            optimizedActivities: currentActivities,
            iterations: iteration,
            finalResult: levelingResult
        };
    }
    
    /**
     * تقسيم نشاط إلى أجزاء أصغر
     */
    private static splitActivity(
        activities: AdvancedScheduleActivity[],
        activityId: number
    ): AdvancedScheduleActivity[] {
        const activityIndex = activities.findIndex(a => a.id === activityId);
        if (activityIndex === -1) return activities;
        
        const activity = activities[activityIndex];
        const halfDuration = Math.ceil((activity.adjustedDuration || activity.duration) / 2);
        
        // إنشاء جزئين
        const part1: AdvancedScheduleActivity = {
            ...activity,
            id: activity.id,
            name: `${activity.name} - Part 1`,
            duration: halfDuration,
            adjustedDuration: halfDuration,
            endDate: this.addDays(new Date(activity.startDate), halfDuration).toISOString().split('T')[0]
        };
        
        const part2: AdvancedScheduleActivity = {
            ...activity,
            id: activities.length + 1,
            name: `${activity.name} - Part 2`,
            duration: halfDuration,
            adjustedDuration: halfDuration,
            startDate: this.addDays(new Date(activity.startDate), halfDuration).toISOString().split('T')[0],
            dependencies: [{
                predecessorId: activity.id,
                type: 'FS',
                lag: 0
            }]
        };
        
        // استبدال النشاط الأصلي بالجزئين
        const newActivities = [...activities];
        newActivities[activityIndex] = part1;
        newActivities.push(part2);
        
        return newActivities;
    }
    
    /**
     * إضافة أيام إلى تاريخ
     */
    private static addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
}
