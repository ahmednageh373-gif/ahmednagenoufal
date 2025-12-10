/**
 * User Guide Component - دليل الاستخدام الاحترافي
 * Professional user guide explaining how to use the application
 * 
 * @author AHMED NAGEH
 * @date 2025-12-10
 * @version 1.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  PlayCircle, 
  FileText, 
  CheckCircle, 
  ArrowRight,
  Upload,
  Calculator,
  Calendar,
  LineChart,
  Zap,
  Target,
  Users,
  Settings,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface GuideStep {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: React.ReactNode;
  color: string;
  substeps: SubStep[];
  videoUrl?: string;
  tips?: string[];
}

interface SubStep {
  number: number;
  text: string;
  textAr: string;
  details?: string;
  detailsAr?: string;
}

export const UserGuide: React.FC = () => {
  const [activeStep, setActiveStep] = useState<string>('upload');
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const guideSteps: GuideStep[] = [
    {
      id: 'upload',
      title: 'Upload BOQ File',
      titleAr: 'رفع ملف المقايسة',
      description: 'Start by uploading your Bill of Quantities (BOQ) file',
      descriptionAr: 'ابدأ برفع ملف المقايسة (BOQ) الخاص بمشروعك',
      icon: <Upload className="w-8 h-8" />,
      color: 'bg-blue-500',
      substeps: [
        {
          number: 1,
          text: 'Click on "Quick Tools" in sidebar',
          textAr: 'اضغط على "أدوات سريعة" في القائمة الجانبية',
          details: 'Located in the Tools & Utilities section',
          detailsAr: 'موجود في قسم الأدوات والمساعدات'
        },
        {
          number: 2,
          text: 'Find "BOQ Magic Tool" card',
          textAr: 'ابحث عن بطاقة "أداة المقايسة الذكية"',
          details: 'In the Smart Analysis section',
          detailsAr: 'في قسم التحليل الذكي'
        },
        {
          number: 3,
          text: 'Click "Upload BOQ" button',
          textAr: 'اضغط على زر "رفع المقايسة"',
          details: 'Supports Excel (.xlsx, .xls) and CSV files',
          detailsAr: 'يدعم ملفات إكسل (.xlsx, .xls) وCSV'
        },
        {
          number: 4,
          text: 'Select your BOQ file',
          textAr: 'اختر ملف المقايسة من جهازك',
          details: 'Maximum file size: 10MB',
          detailsAr: 'الحد الأقصى لحجم الملف: 10 ميجابايت'
        }
      ],
      tips: [
        'تأكد من أن ملف الإكسل يحتوي على أعمدة: البند، الوصف، الوحدة، الكمية، السعر',
        'يجب أن تكون البيانات في الصفحة الأولى من الملف',
        'تجنب الصفوف الفارغة أو البيانات غير المكتملة'
      ]
    },
    {
      id: 'analysis',
      title: 'Automatic Analysis',
      titleAr: 'التحليل التلقائي',
      description: 'The system analyzes your BOQ automatically',
      descriptionAr: 'يقوم النظام بتحليل المقايسة تلقائياً باستخدام الذكاء الاصطناعي',
      icon: <Calculator className="w-8 h-8" />,
      color: 'bg-green-500',
      substeps: [
        {
          number: 1,
          text: 'BOQ items breakdown',
          textAr: 'تفكيك بنود المقايسة إلى أنشطة فرعية',
          details: 'Each BOQ item is analyzed and broken down into detailed sub-activities',
          detailsAr: 'يتم تحليل كل بند وتفكيكه إلى أنشطة فرعية تفصيلية'
        },
        {
          number: 2,
          text: 'Activity duration calculation',
          textAr: 'حساب مدة كل نشاط',
          details: 'Based on 2024 production rates and adjustment factors',
          detailsAr: 'بناءً على معدلات الإنتاج لعام 2024 وعوامل التعديل'
        },
        {
          number: 3,
          text: 'Resource allocation',
          textAr: 'تخصيص الموارد',
          details: 'Crew size, equipment, and materials for each activity',
          detailsAr: 'حجم الطاقم، المعدات، والمواد لكل نشاط'
        },
        {
          number: 4,
          text: 'Cost estimation',
          textAr: 'تقدير التكاليف',
          details: 'Direct costs, overhead, and total project cost',
          detailsAr: 'التكاليف المباشرة، التكاليف الإدارية، والتكلفة الإجمالية'
        }
      ],
      tips: [
        'التحليل يستخدم معدلات الإنتاج الفعلية لمنطقة القصيم 2024',
        'يتم تطبيق عوامل تعديل للطقس، الموقع، رمضان، وجودة الإشراف',
        'النتائج تعتمد على معايير NECA وRSMeans الدولية'
      ]
    },
    {
      id: 'schedule',
      title: 'Project Schedule',
      titleAr: 'الجدول الزمني للمشروع',
      description: 'Generate and optimize project schedule',
      descriptionAr: 'إنشاء وتحسين الجدول الزمني للمشروع',
      icon: <Calendar className="w-8 h-8" />,
      color: 'bg-purple-500',
      substeps: [
        {
          number: 1,
          text: 'CPM calculation',
          textAr: 'حساب المسار الحرج (CPM)',
          details: 'Forward and backward pass to identify critical path',
          detailsAr: 'المرور الأمامي والخلفي لتحديد المسار الحرج'
        },
        {
          number: 2,
          text: 'Activity relationships',
          textAr: 'العلاقات بين الأنشطة',
          details: 'FS, SS, FF, and SF dependencies',
          detailsAr: 'علاقات البداية والنهاية بين الأنشطة'
        },
        {
          number: 3,
          text: 'Float calculation',
          textAr: 'حساب الوقت الاحتياطي',
          details: 'Total float and free float for each activity',
          detailsAr: 'الوقت الاحتياطي الكلي والحر لكل نشاط'
        },
        {
          number: 4,
          text: 'Timeline optimization',
          textAr: 'تحسين الجدول الزمني',
          details: 'Recommendations to reduce project duration',
          detailsAr: 'توصيات لتقليل مدة المشروع'
        }
      ],
      tips: [
        'المسار الحرج يظهر بلون أحمر في الجدول',
        'الأنشطة على المسار الحرج ليس لها وقت احتياطي (Float = 0)',
        'يمكن تقليل مدة المشروع بالبدء في أشهر مناسبة (فبراير-مارس)'
      ]
    },
    {
      id: 'reports',
      title: 'Generate Reports',
      titleAr: 'إنشاء التقارير',
      description: 'Export detailed reports and analytics',
      descriptionAr: 'تصدير التقارير والتحليلات التفصيلية',
      icon: <FileText className="w-8 h-8" />,
      color: 'bg-orange-500',
      substeps: [
        {
          number: 1,
          text: 'Cost breakdown report',
          textAr: 'تقرير تفصيل التكاليف',
          details: 'Direct costs, overhead, and total cost by category',
          detailsAr: 'التكاليف المباشرة والإدارية والإجمالية حسب الفئة'
        },
        {
          number: 2,
          text: 'Schedule report',
          textAr: 'تقرير الجدول الزمني',
          details: 'Activity list, durations, and critical path',
          detailsAr: 'قائمة الأنشطة، المدد، والمسار الحرج'
        },
        {
          number: 3,
          text: 'Resource report',
          textAr: 'تقرير الموارد',
          details: 'Crew requirements, equipment, and materials',
          detailsAr: 'متطلبات الطاقم، المعدات، والمواد'
        },
        {
          number: 4,
          text: 'Cash flow report',
          textAr: 'تقرير التدفق النقدي',
          details: 'Monthly cash flow projection',
          detailsAr: 'التوقعات الشهرية للتدفق النقدي'
        }
      ],
      tips: [
        'جميع التقارير يمكن تصديرها بصيغة Excel أو JSON',
        'التقارير تشمل رسوم بيانية توضيحية',
        'يمكن طباعة التقارير أو مشاركتها مع الفريق'
      ]
    },
    {
      id: 'optimize',
      title: 'Optimization & Recommendations',
      titleAr: 'التحسين والتوصيات',
      description: 'AI-powered recommendations to improve project',
      descriptionAr: 'توصيات ذكية لتحسين المشروع',
      icon: <Target className="w-8 h-8" />,
      color: 'bg-indigo-500',
      substeps: [
        {
          number: 1,
          text: 'Best start date',
          textAr: 'أفضل تاريخ بدء للمشروع',
          details: 'Based on weather and seasonal factors',
          detailsAr: 'بناءً على عوامل الطقس والمواسم'
        },
        {
          number: 2,
          text: 'Risk analysis',
          textAr: 'تحليل المخاطر',
          details: 'Identify potential delays and risks',
          detailsAr: 'تحديد التأخيرات والمخاطر المحتملة'
        },
        {
          number: 3,
          text: 'Cost reduction',
          textAr: 'تقليل التكاليف',
          details: 'Suggestions to optimize costs without compromising quality',
          detailsAr: 'اقتراحات لتحسين التكاليف دون المساس بالجودة'
        },
        {
          number: 4,
          text: 'Resource optimization',
          textAr: 'تحسين الموارد',
          details: 'Balance crew size and equipment usage',
          detailsAr: 'توازن حجم الطاقم واستخدام المعدات'
        }
      ],
      tips: [
        'البدء في فبراير-مارس يوفر 70% من الوقت مقارنة بيونيو-أغسطس',
        'الإشراف الجيد يزيد الإنتاجية بنسبة 20%',
        'تجنب الأشهر الحارة (يونيو-أغسطس) لتقليل التأخيرات'
      ]
    }
  ];

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'سرعة التحليل',
      description: 'تحليل مقايسة كاملة في أقل من 30 ثانية'
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'دقة عالية',
      description: 'دقة 85-95% بناءً على معدلات 2024 الفعلية'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'سهل الاستخدام',
      description: 'واجهة بسيطة لا تحتاج تدريب مسبق'
    },
    {
      icon: <LineChart className="w-6 h-6" />,
      title: 'تحليلات شاملة',
      description: 'تقارير تفصيلية للتكاليف والجداول والموارد'
    }
  ];

  const currentStep = guideSteps.find(step => step.id === activeStep) || guideSteps[0];
  const currentStepIndex = guideSteps.findIndex(step => step.id === activeStep);

  const nextStep = () => {
    if (currentStepIndex < guideSteps.length - 1) {
      setActiveStep(guideSteps[currentStepIndex + 1].id);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setActiveStep(guideSteps[currentStepIndex - 1].id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-10 h-10" />
            <h1 className="text-4xl font-bold">دليل استخدام التطبيق</h1>
          </div>
          <p className="text-xl text-blue-100 mb-6">
            دليلك الشامل لاستخدام نظام إدارة المشاريع الهندسية
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <PlayCircle className="w-5 h-5" />
              <span>فيديوهات تعليمية</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <FileText className="w-5 h-5" />
              <span>أمثلة عملية</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <Target className="w-5 h-5" />
              <span>نصائح احترافية</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              الخطوة {currentStepIndex + 1} من {guideSteps.length}
            </span>
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              {Math.round((currentStepIndex + 1) / guideSteps.length * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${((currentStepIndex + 1) / guideSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Navigation */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-4">
          {guideSteps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`
                flex items-center gap-3 px-6 py-4 rounded-xl transition-all flex-shrink-0
                ${activeStep === step.id
                  ? `${step.color} text-white shadow-lg scale-105`
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md'
                }
              `}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${activeStep === step.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}
              `}>
                {step.icon}
              </div>
              <div className="text-right">
                <div className="font-semibold">{step.titleAr}</div>
                <div className={`text-xs ${activeStep === step.id ? 'text-white/80' : 'text-gray-500'}`}>
                  خطوة {index + 1}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Step Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <div className={`${currentStep.color} p-6 text-white`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    {currentStep.icon}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{currentStep.titleAr}</h2>
                    <p className="text-white/90 mt-1">{currentStep.descriptionAr}</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {/* Sub-steps */}
                <div className="space-y-6 mb-8">
                  {currentStep.substeps.map((substep, index) => (
                    <div key={index} className="flex gap-4 group">
                      <div className={`
                        w-10 h-10 rounded-full ${currentStep.color} text-white 
                        flex items-center justify-center font-bold flex-shrink-0
                        group-hover:scale-110 transition-transform
                      `}>
                        {substep.number}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                          {substep.textAr}
                        </h3>
                        {substep.detailsAr && (
                          <p className="text-gray-600 dark:text-gray-400">
                            {substep.detailsAr}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tips Section */}
                {currentStep.tips && currentStep.tips.length > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      <h3 className="font-bold text-yellow-900 dark:text-yellow-100">
                        💡 نصائح مهمة
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {currentStep.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-yellow-900 dark:text-yellow-100">
                          <span className="text-yellow-500 mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={prevStep}
                    disabled={currentStepIndex === 0}
                    className={`
                      flex items-center gap-2 px-6 py-3 rounded-lg transition-all
                      ${currentStepIndex === 0
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    <ChevronRight className="w-5 h-5" />
                    <span>الخطوة السابقة</span>
                  </button>

                  <button
                    onClick={nextStep}
                    disabled={currentStepIndex === guideSteps.length - 1}
                    className={`
                      flex items-center gap-2 px-6 py-3 rounded-lg transition-all
                      ${currentStepIndex === guideSteps.length - 1
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        : `${currentStep.color} text-white hover:shadow-lg hover:scale-105`
                      }
                    `}
                  >
                    <span>الخطوة التالية</span>
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Features Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                ✨ مميزات النظام
              </h3>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-6">📊 إحصائيات النظام</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">2024</div>
                  <div className="text-indigo-100">معدلات إنتاج محدثة</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">85-95%</div>
                  <div className="text-indigo-100">دقة الحسابات</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">&lt;30s</div>
                  <div className="text-indigo-100">وقت التحليل</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">14</div>
                  <div className="text-indigo-100">نوع تقرير مختلف</div>
                </div>
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                🆘 تحتاج مساعدة؟
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                فريق الدعم الفني متاح لمساعدتك
              </p>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition-colors">
                تواصل معنا
              </button>
            </div>
          </div>
        </div>

        {/* Example Project Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">📋 مثال عملي: مشروع مزرعة القصيم</h2>
            <p className="text-green-100">مشروع حقيقي تم تحليله باستخدام النظام</p>
          </div>
          <div className="p-8 grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                469
              </div>
              <div className="text-gray-600 dark:text-gray-400">بند مقايسة</div>
            </div>
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                1,020
              </div>
              <div className="text-gray-600 dark:text-gray-400">يوم (34 شهر)</div>
            </div>
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                7.13M
              </div>
              <div className="text-gray-600 dark:text-gray-400">ريال سعودي</div>
            </div>
          </div>
          <div className="px-8 pb-8">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
              <h3 className="font-bold text-orange-900 dark:text-orange-100 mb-3">
                💡 نتيجة التحليل الذكي:
              </h3>
              <p className="text-orange-800 dark:text-orange-200">
                البدء في <strong>فبراير-مارس</strong> يقلل مدة المشروع من <strong>34 شهراً</strong> إلى <strong>20 شهراً</strong> فقط! 
                (توفير 14 شهر = 58% أسرع) بسبب تجنب أشهر الحرارة الشديدة ورمضان.
              </p>
            </div>
          </div>
        </div>

        {/* Getting Started CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">🚀 جاهز للبدء؟</h2>
          <p className="text-xl text-blue-100 mb-6">
            ابدأ الآن في تحليل مشروعك باستخدام أحدث تقنيات الذكاء الاصطناعي
          </p>
          <button 
            onClick={() => window.location.href = '#/quick-tools'}
            className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all hover:scale-105 shadow-lg"
          >
            ابدأ التحليل الآن ←
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            تم التطوير بواسطة <strong className="text-white">AHMED NAGEH</strong> | 
            نظام إدارة المشاريع الهندسية v2.1
          </p>
          <p className="text-gray-500 text-sm mt-2">
            © 2025 NOUFAL Engineering Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;
