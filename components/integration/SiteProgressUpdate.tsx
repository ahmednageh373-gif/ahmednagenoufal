/**
 * نظام تحديث التقدم من الموقع
 * Site Progress Update System
 * 
 * يتضمن: تحديث فوري + صور + إنذار مبكر + إعادة تخطيط تلقائي
 */

import React, { useState } from 'react';
import { Camera, MapPin, AlertTriangle, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { EarlyWarningService, AutoReSchedulingService } from '../../src/services/integration/IntegrationService';
import { IntegratedScheduleTask, EXAMPLE_INTEGRATED_SCHEDULE_TASK } from '../../src/types/integrated/IntegratedSchedule';

export const SiteProgressUpdate: React.FC = () => {
  const [task, setTask] = useState<IntegratedScheduleTask>(EXAMPLE_INTEGRATED_SCHEDULE_TASK);
  const [updateForm, setUpdateForm] = useState({
    completedQuantity: 0,
    laborPresent: 0,
    workQuality: 'good' as 'excellent' | 'good' | 'acceptable' | 'poor',
    weatherConditions: '',
    issues: '',
    notes: ''
  });

  const handleSubmitUpdate = async () => {
    // حساب نسبة الإنجاز
    const boqItem = task.boqIntegration.linkedBOQItems[0];
    const percentageComplete = (updateForm.completedQuantity / boqItem.quantity) * 100;

    // تحليل التقدم وإنشاء إنذار مبكر
    const warning = EarlyWarningService.analyzeProgress(task, percentageComplete, new Date());
    
    // اقتراح إعادة تخطيط إذا لزم الأمر
    let reScheduling = null;
    if (warning.predictions.delayDays > 0) {
      reScheduling = AutoReSchedulingService.proposeReSchedule(task, warning.predictions.delayDays);
    }

    // تحديث المهمة
    const updatedTask = {
      ...task,
      actualProgress: {
        percentageComplete,
        dailyProgress: [
          ...task.actualProgress.dailyProgress,
          {
            date: new Date(),
            progress: percentageComplete,
            quantityCompleted: updateForm.completedQuantity,
            updatedBy: 'م. أحمد',
            siteData: {
              laborPresent: updateForm.laborPresent,
              equipmentUsed: [],
              weatherConditions: updateForm.weatherConditions,
              workQuality: updateForm.workQuality,
              issues: updateForm.issues ? [updateForm.issues] : []
            },
            notes: updateForm.notes
          }
        ],
        prediction: {
          expectedCompletionDate: new Date(),
          expectedDelay: warning.predictions.delayDays,
          confidence: 85
        }
      },
      earlyWarning: warning.active ? warning : undefined,
      reScheduling: reScheduling || undefined
    };

    setTask(updatedTask);

    // عرض رسالة النجاح
    alert(`✅ تم تحديث التقدم بنجاح!\n\n` +
      `نسبة الإنجاز: ${percentageComplete.toFixed(1)}%\n` +
      `${warning.active ? `⚠️ تحذير: توقع تأخير ${warning.predictions.delayDays} يوم` : '✅ العمل يسير حسب الخطة'}`
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">تحديث التقدم من الموقع</h1>
        <p className="text-blue-100">نظام متقدم للتحديث الفوري مع إنذار مبكر وإعادة تخطيط تلقائي</p>
      </div>

      {/* Task Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{task.name}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <InfoCard
            icon={<Calendar className="text-blue-500" />}
            label="تاريخ البدء"
            value={new Date(task.startDate).toLocaleDateString('ar-SA')}
          />
          <InfoCard
            icon={<Calendar className="text-red-500" />}
            label="تاريخ الانتهاء المخطط"
            value={new Date(task.endDate).toLocaleDateString('ar-SA')}
          />
          <InfoCard
            icon={<TrendingUp className="text-green-500" />}
            label="نسبة الإنجاز الحالية"
            value={`${task.actualProgress.percentageComplete}%`}
          />
        </div>

        {/* Early Warning */}
        {task.earlyWarning && task.earlyWarning.active && (
          <div className={`p-4 rounded-lg mb-6 ${
            task.earlyWarning.riskLevel === 'critical' ? 'bg-red-100 border border-red-300' :
            task.earlyWarning.riskLevel === 'high' ? 'bg-orange-100 border border-orange-300' :
            task.earlyWarning.riskLevel === 'medium' ? 'bg-yellow-100 border border-yellow-300' :
            'bg-blue-100 border border-blue-300'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={24} className={
                task.earlyWarning.riskLevel === 'critical' ? 'text-red-600' :
                task.earlyWarning.riskLevel === 'high' ? 'text-orange-600' :
                task.earlyWarning.riskLevel === 'medium' ? 'text-yellow-600' :
                'text-blue-600'
              } />
              <h3 className="font-bold text-lg">إنذار مبكر - مستوى الخطر: {getRiskLevelArabic(task.earlyWarning.riskLevel)}</h3>
            </div>
            <div className="space-y-2">
              <p className="font-medium">التوقعات:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>تأخير متوقع: {task.earlyWarning.predictions.delayDays} يوم</li>
                <li>تجاوز التكلفة المتوقع: {task.earlyWarning.predictions.costOverrun.toLocaleString()} ريال</li>
                <li>التأثير: {task.earlyWarning.predictions.impactOnProject}</li>
              </ul>
              
              {task.earlyWarning.recommendations.length > 0 && (
                <>
                  <p className="font-medium mt-3">التوصيات:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {task.earlyWarning.recommendations.map((rec, i) => (
                      <li key={i}>
                        <span className="font-medium">{rec.action}</span>
                        {' - '}
                        <span className="text-sm">تكلفة: {rec.estimatedCost.toLocaleString()} ريال</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        )}

        {/* Re-Scheduling */}
        {task.reScheduling && task.reScheduling.required && (
          <div className="bg-purple-100 border border-purple-300 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Clock className="text-purple-600" />
              إعادة تخطيط تلقائي
            </h3>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">الخطة الأصلية:</p>
                  <p className="font-medium">{task.reScheduling.originalPlan.duration} يوم</p>
                  <p className="text-sm">{new Date(task.reScheduling.originalPlan.endDate).toLocaleDateString('ar-SA')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">الخطة المعدلة:</p>
                  <p className="font-medium text-purple-600">{task.reScheduling.revisedPlan.duration} يوم</p>
                  <p className="text-sm">{new Date(task.reScheduling.revisedPlan.endDate).toLocaleDateString('ar-SA')}</p>
                </div>
              </div>
              
              <p className="font-medium mt-3">التغييرات المقترحة:</p>
              <ul className="list-disc list-inside space-y-1">
                {task.reScheduling.revisedPlan.changes.map((change, i) => (
                  <li key={i}>{change}</li>
                ))}
              </ul>
              
              <p className="text-sm mt-2">
                <span className="font-medium">التكلفة الإضافية:</span> {task.reScheduling.revisedPlan.additionalCost.toLocaleString()} ريال
              </p>
              
              <div className="flex gap-2 mt-4">
                <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  ✅ اعتماد الخطة المعدلة
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                  ❌ رفض
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Update Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">تحديث التقدم</h2>
        
        <div className="space-y-4">
          {/* Completed Quantity */}
          <div>
            <label className="block text-sm font-medium mb-2">الكمية المنجزة</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={updateForm.completedQuantity}
                onChange={(e) => setUpdateForm({ ...updateForm, completedQuantity: Number(e.target.value) })}
                className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700"
                placeholder="أدخل الكمية"
              />
              <span className="text-gray-600">{task.boqIntegration.linkedBOQItems[0]?.unit || 'm³'}</span>
            </div>
          </div>

          {/* Labor Present */}
          <div>
            <label className="block text-sm font-medium mb-2">عدد العمال الحاضرين</label>
            <input
              type="number"
              value={updateForm.laborPresent}
              onChange={(e) => setUpdateForm({ ...updateForm, laborPresent: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
              placeholder="أدخل عدد العمال"
            />
          </div>

          {/* Work Quality */}
          <div>
            <label className="block text-sm font-medium mb-2">جودة العمل</label>
            <select
              value={updateForm.workQuality}
              onChange={(e) => setUpdateForm({ ...updateForm, workQuality: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
            >
              <option value="excellent">ممتازة</option>
              <option value="good">جيدة</option>
              <option value="acceptable">مقبولة</option>
              <option value="poor">ضعيفة</option>
            </select>
          </div>

          {/* Weather Conditions */}
          <div>
            <label className="block text-sm font-medium mb-2">الأحوال الجوية</label>
            <input
              type="text"
              value={updateForm.weatherConditions}
              onChange={(e) => setUpdateForm({ ...updateForm, weatherConditions: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
              placeholder="مثال: صحو - 28°م"
            />
          </div>

          {/* Issues */}
          <div>
            <label className="block text-sm font-medium mb-2">المشاكل (إن وجدت)</label>
            <textarea
              value={updateForm.issues}
              onChange={(e) => setUpdateForm({ ...updateForm, issues: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
              rows={2}
              placeholder="اذكر أي مشاكل واجهت العمل"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">ملاحظات إضافية</label>
            <textarea
              value={updateForm.notes}
              onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
              rows={3}
              placeholder="أي ملاحظات أخرى"
            />
          </div>

          {/* Photos Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">رفع الصور من الموقع</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 cursor-pointer">
              <Camera size={48} className="mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600">اضغط لرفع الصور أو اسحب الملفات هنا</p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG (max 5MB)</p>
            </div>
          </div>

          {/* GPS Location */}
          <div>
            <label className="block text-sm font-medium mb-2">الموقع الجغرافي</label>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <MapPin size={20} />
              تحديد الموقع تلقائياً من GPS
            </button>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmitUpdate}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium"
          >
            <CheckCircle size={20} />
            إرسال التحديث
          </button>
        </div>
      </div>

      {/* Progress History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">سجل التحديثات</h2>
        <div className="space-y-3">
          {task.actualProgress.dailyProgress.slice().reverse().map((update, i) => (
            <div key={i} className="border-l-4 border-indigo-600 pl-4 py-2">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium">{new Date(update.date).toLocaleDateString('ar-SA')}</span>
                <span className="text-indigo-600 font-bold">{update.progress.toFixed(1)}%</span>
              </div>
              <p className="text-sm text-gray-600">الكمية: {update.quantityCompleted} {task.boqIntegration.linkedBOQItems[0]?.unit}</p>
              <p className="text-sm text-gray-600">العمال: {update.siteData.laborPresent}</p>
              {update.notes && <p className="text-sm text-gray-500 mt-1">{update.notes}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const InfoCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
    {icon}
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  </div>
);

function getRiskLevelArabic(level: string): string {
  const map: Record<string, string> = {
    none: 'لا يوجد',
    low: 'منخفض',
    medium: 'متوسط',
    high: 'عالي',
    critical: 'حرج'
  };
  return map[level] || level;
}
