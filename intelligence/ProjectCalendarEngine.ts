/**
 * NOUFAL - Project Calendar Engine
 * محرك تقويم المشروع - العطل، الأمطار، رمضان
 * 
 * يطبق احتياطي 6% للأمطار + تعديل رمضان
 */

import { ProjectCalendar } from '../types';

export class ProjectCalendarEngine {
    /**
     * إنشاء تقويم افتراضي للمشروع (السعودية)
     */
    static createDefaultSaudiCalendar(year: number = 2025): ProjectCalendar {
        return {
            // أيام العمل الرسمية (الأحد - الخميس)
            workDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
            
            // العطل الرسمية السعودية 2025
            holidays: [
                // عيد الفطر (تقديري - يعتمد على الرؤية)
                { date: '2025-03-30', name: 'عيد الفطر - يوم 1' },
                { date: '2025-03-31', name: 'عيد الفطر - يوم 2' },
                { date: '2025-04-01', name: 'عيد الفطر - يوم 3' },
                { date: '2025-04-02', name: 'عيد الفطر - يوم 4' },
                
                // عيد الأضحى (تقديري)
                { date: '2025-06-06', name: 'وقفة عرفات' },
                { date: '2025-06-07', name: 'عيد الأضحى - يوم 1' },
                { date: '2025-06-08', name: 'عيد الأضحى - يوم 2' },
                { date: '2025-06-09', name: 'عيد الأضحى - يوم 3' },
                { date: '2025-06-10', name: 'عيد الأضحى - يوم 4' },
                
                // اليوم الوطني
                { date: '2025-09-23', name: 'اليوم الوطني السعودي' },
                
                // يوم التأسيس
                { date: '2025-02-22', name: 'يوم التأسيس' }
            ],
            
            // احتياطي الأمطار: 6% (≈1 يوم ماطر كل 17 يوم عمل)
            rainyDayBuffer: 6,
            
            // فترة رمضان (تقديري - يعتمد على الرؤية)
            ramadanPeriods: [
                {
                    startDate: '2025-02-28',
                    endDate: '2025-03-29',
                    productivityFactor: 0.7 // 70% إنتاجية في رمضان
                }
            ],
            
            // قيود الطقس
            weatherConstraints: {
                maxTemperature: 45, // درجة الحرارة القصوى (°C)
                minTemperature: 5,  // درجة الحرارة الدنيا (°C)
                rainySeasonMonths: [11, 12, 1, 2, 3] // نوفمبر - مارس
            }
        };
    }
    
    /**
     * حساب أيام العمل الفعلية بين تاريخين (مع استثناء العطل)
     */
    static calculateWorkingDays(
        startDate: Date,
        endDate: Date,
        calendar: ProjectCalendar
    ): number {
        let workingDays = 0;
        const current = new Date(startDate);
        
        while (current <= endDate) {
            const dayName = current.toLocaleDateString('en-US', { weekday: 'long' }) as any;
            const dateStr = current.toISOString().split('T')[0];
            
            // تحقق من أنه يوم عمل وليس عطلة
            const isWorkDay = calendar.workDays.includes(dayName);
            const isHoliday = calendar.holidays.some(h => h.date === dateStr);
            
            if (isWorkDay && !isHoliday) {
                workingDays++;
            }
            
            current.setDate(current.getDate() + 1);
        }
        
        return workingDays;
    }
    
    /**
     * تطبيق احتياطي الأمطار (6%)
     */
    static applyRainyDayBuffer(
        workingDays: number,
        calendar: ProjectCalendar
    ): number {
        const rainyDays = Math.ceil(workingDays * (calendar.rainyDayBuffer / 100));
        return workingDays + rainyDays;
    }
    
    /**
     * تعديل المدة بناءً على رمضان
     */
    static adjustForRamadan(
        startDate: Date,
        duration: number,
        calendar: ProjectCalendar
    ): number {
        let adjustedDuration = duration;
        
        calendar.ramadanPeriods.forEach(ramadan => {
            const ramadanStart = new Date(ramadan.startDate);
            const ramadanEnd = new Date(ramadan.endDate);
            const activityStart = new Date(startDate);
            const activityEnd = new Date(startDate);
            activityEnd.setDate(activityEnd.getDate() + duration);
            
            // تحقق من التداخل
            const hasOverlap = 
                (activityStart >= ramadanStart && activityStart <= ramadanEnd) ||
                (activityEnd >= ramadanStart && activityEnd <= ramadanEnd) ||
                (activityStart <= ramadanStart && activityEnd >= ramadanEnd);
            
            if (hasOverlap) {
                // حساب عدد الأيام المتداخلة
                const overlapStart = activityStart > ramadanStart ? activityStart : ramadanStart;
                const overlapEnd = activityEnd < ramadanEnd ? activityEnd : ramadanEnd;
                const overlapDays = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24));
                
                // تعديل المدة بناءً على الإنتاجية (70% → يحتاج 30% وقت إضافي)
                const additionalDays = Math.ceil(overlapDays * (1 - ramadan.productivityFactor) / ramadan.productivityFactor);
                adjustedDuration += additionalDays;
            }
        });
        
        return adjustedDuration;
    }
    
    /**
     * حساب التاريخ النهائي مع احتساب العطل والأمطار
     */
    static calculateEndDate(
        startDate: Date,
        duration: number,
        calendar: ProjectCalendar
    ): Date {
        let daysAdded = 0;
        const current = new Date(startDate);
        
        // تطبيق احتياطي الأمطار
        const durationWithRain = this.applyRainyDayBuffer(duration, calendar);
        
        // تطبيق تعديل رمضان
        const finalDuration = this.adjustForRamadan(startDate, durationWithRain, calendar);
        
        while (daysAdded < finalDuration) {
            current.setDate(current.getDate() + 1);
            
            const dayName = current.toLocaleDateString('en-US', { weekday: 'long' }) as any;
            const dateStr = current.toISOString().split('T')[0];
            
            // عد فقط أيام العمل (غير العطل)
            const isWorkDay = calendar.workDays.includes(dayName);
            const isHoliday = calendar.holidays.some(h => h.date === dateStr);
            
            if (isWorkDay && !isHoliday) {
                daysAdded++;
            }
        }
        
        return current;
    }
    
    /**
     * توليد تقرير التقويم
     */
    static generateCalendarReport(calendar: ProjectCalendar): {
        totalHolidays: number;
        ramadanDays: number;
        expectedRainyDays: string;
        workDaysPerWeek: number;
        summary: string;
    } {
        const totalHolidays = calendar.holidays.length;
        
        const ramadanDays = calendar.ramadanPeriods.reduce((sum, period) => {
            const start = new Date(period.startDate);
            const end = new Date(period.endDate);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            return sum + days;
        }, 0);
        
        const workDaysPerWeek = calendar.workDays.length;
        
        const summary = `
📅 تقرير تقويم المشروع:

• أيام العمل: ${calendar.workDays.join(', ')}
• عدد أيام العمل في الأسبوع: ${workDaysPerWeek}
• العطل الرسمية: ${totalHolidays} يوم
• فترة رمضان: ${ramadanDays} يوم (إنتاجية ${calendar.ramadanPeriods[0]?.productivityFactor * 100}%)
• احتياطي الأمطار: ${calendar.rainyDayBuffer}% (≈1 يوم ماطر كل ${Math.ceil(100 / calendar.rainyDayBuffer)} يوم)
• قيود الطقس: 
  - حد أقصى للحرارة: ${calendar.weatherConstraints?.maxTemperature}°C
  - أشهر الأمطار: ${calendar.weatherConstraints?.rainySeasonMonths?.join(', ')}
        `.trim();
        
        return {
            totalHolidays,
            ramadanDays,
            expectedRainyDays: `${calendar.rainyDayBuffer}% (1 day per ${Math.ceil(100 / calendar.rainyDayBuffer)} work days)`,
            workDaysPerWeek,
            summary
        };
    }
    
    /**
     * التحقق من تواريخ النشاط ضمن قيود الطقس
     */
    static checkWeatherConstraints(
        activityDate: Date,
        calendar: ProjectCalendar
    ): {
        isViable: boolean;
        warnings: string[];
    } {
        const month = activityDate.getMonth() + 1; // 1-12
        const warnings: string[] = [];
        let isViable = true;
        
        // تحقق من موسم الأمطار
        if (calendar.weatherConstraints?.rainySeasonMonths?.includes(month)) {
            warnings.push('⚠️ هذا الشهر ضمن موسم الأمطار - خطط لتأخيرات محتملة');
        }
        
        return {
            isViable,
            warnings
        };
    }
}
