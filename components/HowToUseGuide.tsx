/**
 * NOUFAL Engineering Management System - دليل الاستخدام التفاعلي
 * How To Use Guide - Professional User Guide Component
 * 
 * @author AHMED NAGEH
 * @date 2025-12-10
 * @version 1.0
 * 
 * Features:
 * - Interactive step-by-step guide
 * - Video tutorials integration
 * - Quick start wizard
 * - Feature showcase with animations
 * - Multi-language support (Arabic + English)
 * - Responsive design for all devices
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Play,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Home,
  FileText,
  Users,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  Zap,
  Download,
  Upload,
  Target,
  Package,
  FolderOpen,
  AlertCircle,
  Lightbulb,
  Video,
  MessageCircle,
  Star,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface GuideStep {
  id: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: React.ReactNode;
  color: string;
  videoUrl?: string;
  steps?: string[];
  stepsAr?: string[];
  tips?: string[];
  tipsAr?: string[];
}

interface FeatureSection {
  id: string;
  titleAr: string;
  titleEn: string;
  icon: React.ReactNode;
  color: string;
  features: {
    nameAr: string;
    nameEn: string;
    descriptionAr: string;
    descriptionEn: string;
  }[];
}

export const HowToUseGuide: React.FC = () => {
  const [activeLanguage, setActiveLanguage] = useState<'ar' | 'en'>('ar');
  const [activeStep, setActiveStep] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>('getting-started');

  // دليل البداية السريعة - Quick Start Guide
  const quickStartSteps: GuideStep[] = [
    {
      id: 1,
      titleAr: 'مرحباً في نظام NOUFAL',
      titleEn: 'Welcome to NOUFAL System',
      descriptionAr: 'نظام إدارة هندسية متكامل لتخطيط وإدارة المشاريع الإنشائية بكفاءة عالية',
      descriptionEn: 'Comprehensive engineering management system for efficient construction project planning and management',
      icon: <Home className="w-12 h-12" />,
      color: 'text-blue-600',
      stepsAr: [
        'قم بتسجيل الدخول أو إنشاء حساب جديد',
        'ابدأ بإنشاء مشروع جديد من القائمة الرئيسية',
        'أكمل البيانات الأساسية للمشروع (الاسم، الموقع، التاريخ)',
        'قم برفع ملف BOQ أو أدخل البيانات يدوياً'
      ],
      steps: [
        'Login or create a new account',
        'Start by creating a new project from the main menu',
        'Complete basic project information (name, location, date)',
        'Upload BOQ file or enter data manually'
      ],
      tipsAr: [
        '💡 استخدم قوالب المشاريع الجاهزة لتوفير الوقت',
        '💡 يمكنك استيراد بيانات من مشاريع سابقة',
        '💡 تأكد من ملء جميع البيانات المطلوبة للحصول على تحليل دقيق'
      ],
      tips: [
        '💡 Use ready-made project templates to save time',
        '💡 You can import data from previous projects',
        '💡 Ensure all required fields are filled for accurate analysis'
      ]
    },
    {
      id: 2,
      titleAr: 'رفع وتحليل كميات الأعمال (BOQ)',
      titleEn: 'Upload and Analyze BOQ',
      descriptionAr: 'قم برفع ملف BOQ الخاص بمشروعك وسيقوم النظام بتحليله تلقائياً',
      descriptionEn: 'Upload your project BOQ file and the system will automatically analyze it',
      icon: <Upload className="w-12 h-12" />,
      color: 'text-green-600',
      stepsAr: [
        'انتقل إلى قسم "إدارة المقايسات" من القائمة الجانبية',
        'اضغط على زر "رفع BOQ" واختر الملف (Excel, PDF, CSV)',
        'انتظر حتى يتم تحليل الملف (يستغرق 10-30 ثانية)',
        'راجع نتائج التحليل التلقائي وصحح أي أخطاء إن وجدت',
        'احفظ البيانات وانتقل لمرحلة الجدولة'
      ],
      steps: [
        'Navigate to "BOQ Management" from the sidebar',
        'Click "Upload BOQ" and select file (Excel, PDF, CSV)',
        'Wait for file analysis (takes 10-30 seconds)',
        'Review automatic analysis results and correct any errors',
        'Save data and proceed to scheduling'
      ],
      tipsAr: [
        '🎯 الملفات المدعومة: Excel (.xlsx, .xls), PDF, CSV',
        '🎯 الحد الأقصى لحجم الملف: 50 ميجابايت',
        '🎯 يدعم النظام الكشوفات العربية والإنجليزية',
        '🎯 يمكنك تعديل البيانات بعد التحليل'
      ],
      tips: [
        '🎯 Supported formats: Excel (.xlsx, .xls), PDF, CSV',
        '🎯 Maximum file size: 50 MB',
        '🎯 System supports Arabic and English BOQs',
        '🎯 You can edit data after analysis'
      ]
    },
    {
      id: 3,
      titleAr: 'إنشاء الجدول الزمني (Schedule)',
      titleEn: 'Create Project Schedule',
      descriptionAr: 'قم بإنشاء الجدول الزمني للمشروع وتحديد الأنشطة والتبعيات',
      descriptionEn: 'Create project schedule and define activities and dependencies',
      icon: <Calendar className="w-12 h-12" />,
      color: 'text-purple-600',
      stepsAr: [
        'انتقل إلى "الجداول الزمنية" من القائمة',
        'اضغط "جدولة تلقائية" لإنشاء جدول بناءً على BOQ',
        'راجع الأنشطة المقترحة ومدة كل نشاط',
        'عدّل المدد والتبعيات حسب الحاجة',
        'احفظ الجدول وابدأ التتبع'
      ],
      steps: [
        'Navigate to "Schedule Manager" from menu',
        'Click "Auto Schedule" to generate based on BOQ',
        'Review suggested activities and durations',
        'Adjust durations and dependencies as needed',
        'Save schedule and start tracking'
      ],
      tipsAr: [
        '⚡ الجدولة التلقائية توفر 80% من الوقت',
        '⚡ يمكنك استخدام قوالب جدولة جاهزة',
        '⚡ النظام يحسب المسار الحرج تلقائياً (CPM)',
        '⚡ يدعم التصدير لـ MS Project و Primavera'
      ],
      tips: [
        '⚡ Auto-scheduling saves 80% of time',
        '⚡ You can use ready-made schedule templates',
        '⚡ System calculates Critical Path automatically (CPM)',
        '⚡ Supports export to MS Project & Primavera'
      ]
    },
    {
      id: 4,
      titleAr: 'متابعة التقدم والتقارير',
      titleEn: 'Track Progress and Reports',
      descriptionAr: 'تابع تقدم المشروع وأنشئ تقارير دورية احترافية',
      descriptionEn: 'Monitor project progress and generate professional periodic reports',
      icon: <BarChart3 className="w-12 h-12" />,
      color: 'text-orange-600',
      stepsAr: [
        'سجل التقدم اليومي من "متابعة الموقع"',
        'راجع لوحة التحكم الرئيسية للحصول على نظرة شاملة',
        'أنشئ تقارير أسبوعية/شهرية تلقائية',
        'شارك التقارير مع الفريق والعملاء',
        'تتبع الانحرافات واتخذ الإجراءات التصحيحية'
      ],
      steps: [
        'Log daily progress from "Site Tracker"',
        'Review main dashboard for comprehensive overview',
        'Generate automatic weekly/monthly reports',
        'Share reports with team and clients',
        'Track deviations and take corrective actions'
      ],
      tipsAr: [
        '📊 تحديث التقدم يومياً يضمن دقة التحليلات',
        '📊 استخدم التقارير الجاهزة لتوفير الوقت',
        '📊 يمكنك تخصيص شكل ومحتوى التقارير',
        '📊 التقارير تدعم التصدير لـ PDF و Excel'
      ],
      tips: [
        '📊 Daily progress updates ensure accurate analytics',
        '📊 Use ready-made reports to save time',
        '📊 You can customize report format and content',
        '📊 Reports support export to PDF & Excel'
      ]
    },
    {
      id: 5,
      titleAr: 'الميزات المتقدمة',
      titleEn: 'Advanced Features',
      descriptionAr: 'استكشف الميزات المتقدمة لإدارة شاملة للمشروع',
      descriptionEn: 'Explore advanced features for comprehensive project management',
      icon: <Star className="w-12 h-12" />,
      color: 'text-yellow-600',
      stepsAr: [
        'استخدم الذكاء الاصطناعي لتحليل المخاطر',
        'إدارة الموارد والمشتريات',
        'تتبع التكاليف والفواتير',
        'إدارة الفريق والصلاحيات',
        'التكامل مع أدوات خارجية'
      ],
      steps: [
        'Use AI for risk analysis',
        'Manage resources and procurement',
        'Track costs and invoices',
        'Manage team and permissions',
        'Integrate with external tools'
      ],
      tipsAr: [
        '🚀 استخدم الأتمتة لتقليل العمل اليدوي',
        '🚀 قم بإعداد تنبيهات للمهام الحرجة',
        '🚀 استفد من التحليلات التنبؤية',
        '🚀 دعم متعدد اللغات (عربي، إنجليزي)'
      ],
      tips: [
        '🚀 Use automation to reduce manual work',
        '🚀 Set up alerts for critical tasks',
        '🚀 Benefit from predictive analytics',
        '🚀 Multi-language support (Arabic, English)'
      ]
    }
  ];

  // أقسام الميزات الرئيسية - Main Feature Sections
  const featureSections: FeatureSection[] = [
    {
      id: 'project-management',
      titleAr: 'إدارة المشاريع',
      titleEn: 'Project Management',
      icon: <FolderOpen className="w-6 h-6" />,
      color: 'text-blue-600',
      features: [
        {
          nameAr: 'لوحة التحكم الرئيسية',
          nameEn: 'Main Dashboard',
          descriptionAr: 'نظرة شاملة على جميع المشاريع والمؤشرات الرئيسية',
          descriptionEn: 'Comprehensive view of all projects and key indicators'
        },
        {
          nameAr: 'إنشاء وإدارة المشاريع',
          nameEn: 'Create and Manage Projects',
          descriptionAr: 'إنشاء مشاريع جديدة وإدارة التفاصيل بسهولة',
          descriptionEn: 'Create new projects and easily manage details'
        },
        {
          nameAr: 'قوالب المشاريع',
          nameEn: 'Project Templates',
          descriptionAr: 'استخدم قوالب جاهزة لتسريع إنشاء المشاريع',
          descriptionEn: 'Use ready-made templates to accelerate project creation'
        }
      ]
    },
    {
      id: 'boq-management',
      titleAr: 'إدارة المقايسات (BOQ)',
      titleEn: 'BOQ Management',
      icon: <FileText className="w-6 h-6" />,
      color: 'text-green-600',
      features: [
        {
          nameAr: 'رفع وتحليل BOQ',
          nameEn: 'Upload and Analyze BOQ',
          descriptionAr: 'رفع ملفات Excel/PDF وتحليلها تلقائياً بالذكاء الاصطناعي',
          descriptionEn: 'Upload Excel/PDF files and analyze automatically with AI'
        },
        {
          nameAr: 'التصنيف الذكي',
          nameEn: 'Smart Classification',
          descriptionAr: 'تصنيف تلقائي للبنود حسب الفئات والأنشطة',
          descriptionEn: 'Automatic item classification by categories and activities'
        },
        {
          nameAr: 'مطابقة البنود',
          nameEn: 'Item Matching',
          descriptionAr: 'مقارنة BOQ العقد مع BOQ التنفيذ',
          descriptionEn: 'Compare contract BOQ with execution BOQ'
        }
      ]
    },
    {
      id: 'scheduling',
      titleAr: 'الجدولة الزمنية',
      titleEn: 'Scheduling',
      icon: <Calendar className="w-6 h-6" />,
      color: 'text-purple-600',
      features: [
        {
          nameAr: 'الجدولة التلقائية',
          nameEn: 'Auto-Scheduling',
          descriptionAr: 'إنشاء جدول زمني تلقائياً بناءً على BOQ',
          descriptionEn: 'Auto-generate schedule based on BOQ'
        },
        {
          nameAr: 'حساب المسار الحرج (CPM)',
          nameEn: 'Critical Path Method (CPM)',
          descriptionAr: 'حساب تلقائي للمسار الحرج والعوامل',
          descriptionEn: 'Automatic calculation of critical path and float'
        },
        {
          nameAr: 'مخطط جانت التفاعلي',
          nameEn: 'Interactive Gantt Chart',
          descriptionAr: 'عرض مرئي تفاعلي للجدول الزمني',
          descriptionEn: 'Interactive visual display of schedule'
        }
      ]
    },
    {
      id: 'financial',
      titleAr: 'الإدارة المالية',
      titleEn: 'Financial Management',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'text-emerald-600',
      features: [
        {
          nameAr: 'تتبع التكاليف',
          nameEn: 'Cost Tracking',
          descriptionAr: 'متابعة التكاليف الفعلية مقابل الميزانية',
          descriptionEn: 'Track actual costs versus budget'
        },
        {
          nameAr: 'إدارة الفواتير',
          nameEn: 'Invoice Management',
          descriptionAr: 'إنشاء وإدارة فواتير المشروع',
          descriptionEn: 'Create and manage project invoices'
        },
        {
          nameAr: 'التدفق النقدي',
          nameEn: 'Cash Flow',
          descriptionAr: 'توقع وإدارة التدفق النقدي',
          descriptionEn: 'Forecast and manage cash flow'
        }
      ]
    },
    {
      id: 'resources',
      titleAr: 'إدارة الموارد',
      titleEn: 'Resource Management',
      icon: <Package className="w-6 h-6" />,
      color: 'text-orange-600',
      features: [
        {
          nameAr: 'إدارة العمالة',
          nameEn: 'Labor Management',
          descriptionAr: 'تتبع العمالة والحضور والإنتاجية',
          descriptionEn: 'Track labor, attendance, and productivity'
        },
        {
          nameAr: 'إدارة المعدات',
          nameEn: 'Equipment Management',
          descriptionAr: 'متابعة المعدات والصيانة',
          descriptionEn: 'Track equipment and maintenance'
        },
        {
          nameAr: 'إدارة المواد',
          nameEn: 'Material Management',
          descriptionAr: 'تتبع المواد والمخزون',
          descriptionEn: 'Track materials and inventory'
        }
      ]
    },
    {
      id: 'reporting',
      titleAr: 'التقارير والتحليلات',
      titleEn: 'Reports and Analytics',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'text-red-600',
      features: [
        {
          nameAr: 'تقارير تلقائية',
          nameEn: 'Automatic Reports',
          descriptionAr: 'تقارير أسبوعية وشهرية تلقائية',
          descriptionEn: 'Automatic weekly and monthly reports'
        },
        {
          nameAr: 'تحليلات متقدمة',
          nameEn: 'Advanced Analytics',
          descriptionAr: 'تحليلات عميقة بالذكاء الاصطناعي',
          descriptionEn: 'Deep analytics with AI'
        },
        {
          nameAr: 'لوحات تحكم مخصصة',
          nameEn: 'Custom Dashboards',
          descriptionAr: 'أنشئ لوحات تحكم حسب احتياجاتك',
          descriptionEn: 'Create dashboards based on your needs'
        }
      ]
    }
  ];

  const currentStep = quickStartSteps[activeStep];
  const isArabic = activeLanguage === 'ar';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {isArabic ? 'دليل الاستخدام التفاعلي' : 'Interactive User Guide'}
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              {isArabic 
                ? 'تعلم كيفية استخدام نظام NOUFAL لإدارة مشاريعك الهندسية بكفاءة عالية' 
                : 'Learn how to use NOUFAL system to efficiently manage your engineering projects'}
            </p>
            
            {/* Language Toggle */}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setActiveLanguage('ar')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  isArabic 
                    ? 'bg-white text-indigo-600 shadow-lg' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                🇸🇦 العربية
              </button>
              <button
                onClick={() => setActiveLanguage('en')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  !isArabic 
                    ? 'bg-white text-indigo-600 shadow-lg' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                🇬🇧 English
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start Guide Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {isArabic ? '🚀 دليل البداية السريعة' : '🚀 Quick Start Guide'}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {isArabic 
              ? 'خطوات بسيطة للبدء مع النظام في دقائق معدودة' 
              : 'Simple steps to get started with the system in minutes'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {quickStartSteps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1">
                  <button
                    onClick={() => setActiveStep(index)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                      index === activeStep
                        ? 'bg-indigo-600 text-white shadow-lg scale-110'
                        : index < activeStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {index < activeStep ? <CheckCircle2 className="w-6 h-6" /> : index + 1}
                  </button>
                  <span className={`text-xs mt-2 text-center max-w-[100px] ${
                    index === activeStep ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {isArabic ? step.titleAr.split(' ').slice(0, 2).join(' ') : step.titleEn.split(' ').slice(0, 2).join(' ')}
                  </span>
                </div>
                {index < quickStartSteps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    index < activeStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-12">
          <div className={`${currentStep.color} bg-gradient-to-r from-${currentStep.color.split('-')[1]}-500 to-${currentStep.color.split('-')[1]}-600 p-8`}>
            <div className="flex items-center gap-4 text-white">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                {currentStep.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">
                  {isArabic ? currentStep.titleAr : currentStep.titleEn}
                </h3>
                <p className="text-white/90">
                  {isArabic ? currentStep.descriptionAr : currentStep.descriptionEn}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Steps */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                {isArabic ? 'الخطوات التفصيلية:' : 'Detailed Steps:'}
              </h4>
              <div className="space-y-3">
                {(isArabic ? currentStep.stepsAr : currentStep.steps)?.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <p className="flex-1 text-gray-700 dark:text-gray-300">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            {currentStep.tipsAr && currentStep.tipsAr.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  {isArabic ? 'نصائح مهمة:' : 'Important Tips:'}
                </h4>
                <div className="space-y-2">
                  {(isArabic ? currentStep.tipsAr : currentStep.tips)?.map((tip, index) => (
                    <p key={index} className="text-gray-700 dark:text-gray-300">
                      {tip}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              {isArabic ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              {isArabic ? 'السابق' : 'Previous'}
            </button>
            
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              {activeStep + 1} / {quickStartSteps.length}
            </span>
            
            <button
              onClick={() => setActiveStep(Math.min(quickStartSteps.length - 1, activeStep + 1))}
              disabled={activeStep === quickStartSteps.length - 1}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-all"
            >
              {isArabic ? 'التالي' : 'Next'}
              {isArabic ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Features Sections */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {isArabic ? '✨ الميزات الرئيسية' : '✨ Main Features'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {isArabic 
                ? 'استكشف جميع إمكانيات النظام لإدارة شاملة للمشروع' 
                : 'Explore all system capabilities for comprehensive project management'}
            </p>
          </div>

          <div className="space-y-4">
            {featureSections.map((section) => (
              <div 
                key={section.id} 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <button
                  onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${section.color} bg-opacity-10 rounded-lg flex items-center justify-center`}>
                      {section.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {isArabic ? section.titleAr : section.titleEn}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {section.features.length} {isArabic ? 'ميزة' : 'features'}
                      </p>
                    </div>
                  </div>
                  {expandedSection === section.id ? (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-6 h-6 text-gray-400" />
                  )}
                </button>

                {expandedSection === section.id && (
                  <div className="px-6 pb-6 space-y-4">
                    {section.features.map((feature, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {isArabic ? feature.nameAr : feature.nameEn}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {isArabic ? feature.descriptionAr : feature.descriptionEn}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Help & Support Section */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-indigo-200 dark:border-indigo-800">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {isArabic ? '🆘 هل تحتاج المساعدة؟' : '🆘 Need Help?'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {isArabic 
                ? 'فريق الدعم جاهز لمساعدتك في أي وقت' 
                : 'Our support team is ready to help you anytime'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-md">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {isArabic ? 'فيديوهات تعليمية' : 'Tutorial Videos'}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {isArabic ? 'شاهد الشروحات المصورة' : 'Watch video tutorials'}
              </p>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                {isArabic ? 'عرض الفيديوهات' : 'View Videos'}
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-md">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {isArabic ? 'الدردشة المباشرة' : 'Live Chat'}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {isArabic ? 'تحدث مع فريق الدعم' : 'Chat with support team'}
              </p>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                {isArabic ? 'بدء المحادثة' : 'Start Chat'}
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-md">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {isArabic ? 'قاعدة المعرفة' : 'Knowledge Base'}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {isArabic ? 'ابحث في المقالات' : 'Search articles'}
              </p>
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                {isArabic ? 'تصفح المقالات' : 'Browse Articles'}
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              {isArabic ? '📧 أو راسلنا عبر البريد الإلكتروني:' : '📧 Or email us at:'}
            </p>
            <a 
              href="mailto:support@noufal.com" 
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline text-lg"
            >
              support@noufal.com
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 mb-2">
            {isArabic 
              ? 'نظام إدارة هندسية شامل - NOUFAL EMS' 
              : 'Comprehensive Engineering Management System - NOUFAL EMS'}
          </p>
          <p className="text-gray-500 text-sm">
            {isArabic 
              ? 'تم التطوير بواسطة AHMED NAGEH - 2025' 
              : 'Developed by AHMED NAGEH - 2025'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowToUseGuide;
