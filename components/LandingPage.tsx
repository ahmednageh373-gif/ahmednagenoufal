import React, { useState } from 'react';
import { 
  Rocket, 
  Zap, 
  Shield, 
  Target, 
  TrendingUp, 
  Users, 
  Award, 
  ChevronRight, 
  CheckCircle, 
  PlayCircle,
  BarChart3,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  Settings,
  Brain,
  Sparkles,
  ArrowRight,
  Star,
  Building2,
  Hammer,
  Package,
  FileSpreadsheet,
  GanttChart,
  LineChart,
  Workflow,
  Database,
  ChevronDown
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: FileSpreadsheet,
      title: 'إدارة المقايسات الذكية',
      description: 'إنشاء وتحليل المقايسات (BOQ) بذكاء اصطناعي، استيراد من Excel، حساب تلقائي للإجماليات',
      color: 'from-blue-500 to-blue-600',
      stats: '469 بند في ثوانٍ'
    },
    {
      icon: GanttChart,
      title: 'تكامل Primavera P6',
      description: 'استيراد وتحليل جداول Primavera، تتبع الجدول الزمني بدقة، تحديثات تلقائية',
      color: 'from-purple-500 to-purple-600',
      stats: 'توفير 70% من الوقت'
    },
    {
      icon: LineChart,
      title: 'تحليلات مالية متقدمة',
      description: 'تتبع التكاليف، المستخلصات، التدفقات النقدية، تقارير مالية شاملة',
      color: 'from-green-500 to-green-600',
      stats: 'دقة 99.5%'
    },
    {
      icon: Brain,
      title: 'ذكاء اصطناعي مدمج',
      description: 'مساعد AI ذكي، تحليل تلقائي، توصيات احترافية، توقعات دقيقة',
      color: 'from-pink-500 to-pink-600',
      stats: 'قرارات أذكى'
    },
    {
      icon: Workflow,
      title: 'CAD Studio المتكامل',
      description: 'استوديو تصميم هندسي، مكتبة رموز احترافية، عارض 4D للمشاريع',
      color: 'from-orange-500 to-orange-600',
      stats: '1000+ رمز جاهز'
    },
    {
      icon: Database,
      title: 'قاعدة معرفية شاملة',
      description: 'معايير سعودية (SBC)، كودات عالمية، مكتبة تقنية ضخمة، استشارات فورية',
      color: 'from-indigo-500 to-indigo-600',
      stats: '10,000+ مصدر'
    }
  ];

  const stats = [
    { label: 'مشروع نشط', value: '10,000+', icon: Building2 },
    { label: 'مهندس يثق بنا', value: '50,000+', icon: Users },
    { label: 'توفير في الوقت', value: '70%', icon: Clock },
    { label: 'تقييم المستخدمين', value: '4.9/5', icon: Star }
  ];

  const useCases = [
    {
      title: 'مشروع مزرعة القصيم',
      type: 'مشروع زراعي',
      metrics: [
        { label: 'بنود المقايسة', value: '469' },
        { label: 'المدة', value: '1,020 يوم' },
        { label: 'القيمة', value: '7.13M ريال' }
      ],
      success: 'تم التنفيذ بنجاح مع توفير 20% من الوقت المخطط'
    },
    {
      title: 'مجمع سكني بالرياض',
      type: 'مشروع إنشائي',
      metrics: [
        { label: 'بنود المقايسة', value: '892' },
        { label: 'المدة', value: '18 شهر' },
        { label: 'القيمة', value: '45M ريال' }
      ],
      success: 'تسليم قبل الموعد بـ 3 أشهر'
    }
  ];

  const comparisonFeatures = [
    { feature: 'إنشاء مقايسات غير محدودة', us: true, competitor: true },
    { feature: 'تحليل أسعار تلقائي', us: true, competitor: true },
    { feature: 'استيراد من Excel/Primavera', us: true, competitor: false },
    { feature: 'ذكاء اصطناعي مدمج', us: true, competitor: false },
    { feature: 'CAD Studio متكامل', us: true, competitor: false },
    { feature: 'عارض 4D للمشاريع', us: true, competitor: false },
    { feature: 'قاعدة معرفية شاملة', us: true, competitor: false },
    { feature: 'تكامل Primavera P6', us: true, competitor: false },
    { feature: 'تحليلات مالية متقدمة', us: true, competitor: false },
    { feature: 'سرعة الأداء', us: '360ms ⚡', competitor: '11,350ms ⚠️' }
  ];

  const testimonials = [
    {
      name: 'م. أحمد السعيد',
      role: 'مدير مشاريع، شركة البناء المتطور',
      quote: 'نظام NOUFAL وفر علينا 70% من وقت إعداد المقايسات. الذكاء الاصطناعي المدمج يعطي توصيات دقيقة جداً.',
      rating: 5
    },
    {
      name: 'م. فاطمة الحربي',
      role: 'مهندسة تكاليف، مجموعة الإنشاءات الحديثة',
      quote: 'استيراد ملفات Primavera مباشرة وفر علينا ساعات من العمل اليدوي. النظام احترافي جداً.',
      rating: 5
    },
    {
      name: 'م. خالد العتيبي',
      role: 'مدير تنفيذي، مكتب هندسي استشاري',
      quote: 'مكتبة CAD والرموز الجاهزة جعلت التصميم أسرع بكثير. أفضل نظام هندسي استخدمته على الإطلاق.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-bounce-slow">
              <Sparkles size={16} />
              <span>النظام الهندسي الأكثر تطوراً في الشرق الأوسط</span>
            </div>
          </div>

          <div className="text-center">
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              نظام <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">NOUFAL</span>
              <br />
              <span className="text-3xl md:text-5xl">لإدارة المشاريع الهندسية</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              النظام الشامل الوحيد الذي يجمع إدارة المقايسات، Primavera، CAD Studio، والذكاء الاصطناعي في منصة واحدة
            </p>

            {/* Key Benefits */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg">
                <CheckCircle size={20} className="text-green-500" />
                <span className="text-gray-700 dark:text-gray-300 font-semibold">مجاني 100%</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg">
                <CheckCircle size={20} className="text-green-500" />
                <span className="text-gray-700 dark:text-gray-300 font-semibold">ذكاء اصطناعي مدمج</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg">
                <CheckCircle size={20} className="text-green-500" />
                <span className="text-gray-700 dark:text-gray-300 font-semibold">سرعة فائقة 30x</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg">
                <CheckCircle size={20} className="text-green-500" />
                <span className="text-gray-700 dark:text-gray-300 font-semibold">باللغة العربية</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onGetStarted}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <Rocket size={24} />
                <span>ابدأ العمل الآن</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => document.getElementById('demo-video')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-xl text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <PlayCircle size={24} />
                <span>شاهد الفيديو التوضيحي</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white dark:bg-gray-800 py-16 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <stat.icon size={32} className="text-white" />
                  </div>
                </div>
                <div className="text-4xl font-black text-gray-900 dark:text-white mb-2">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-400 font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              مميزات لا مثيل لها
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              كل ما يحتاجه المهندس المحترف في منصة واحدة
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                onMouseEnter={() => setActiveFeature(index)}
                className={`group relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer ${
                  activeFeature === index ? 'ring-4 ring-indigo-500' : ''
                }`}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {feature.description}
                </p>
                <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${feature.color} text-white px-4 py-2 rounded-full text-sm font-bold`}>
                  <Sparkles size={16} />
                  <span>{feature.stats}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              قصص نجاح حقيقية
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              مشاريع فعلية تم تنفيذها بنجاح باستخدام NOUFAL
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {useCase.title}
                    </h3>
                    <span className="inline-block bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-semibold">
                      {useCase.type}
                    </span>
                  </div>
                  <Award size={40} className="text-yellow-500" />
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {useCase.metrics.map((metric, idx) => (
                    <div key={idx} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mb-1">
                        {metric.value}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {metric.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                  <CheckCircle size={24} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 dark:text-gray-300 font-semibold">
                    {useCase.success}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Section */}
      <div className="py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              لماذا NOUFAL أفضل من المنافسين؟
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              مقارنة شاملة مع أنظمة المقايسات الأخرى
            </p>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-900 rounded-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <th className="px-6 py-4 text-right text-lg font-bold">الميزة</th>
                    <th className="px-6 py-4 text-center text-lg font-bold">
                      <div className="flex items-center justify-center gap-2">
                        <Star size={20} className="text-yellow-300" />
                        <span>NOUFAL</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-lg font-bold">المنافسون</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((item, index) => (
                    <tr
                      key={index}
                      className={`${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'
                      } border-b border-gray-200 dark:border-gray-600`}
                    >
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">
                        {item.feature}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {typeof item.us === 'boolean' ? (
                          item.us ? (
                            <CheckCircle size={24} className="text-green-500 mx-auto" />
                          ) : (
                            <span className="text-2xl">❌</span>
                          )
                        ) : (
                          <span className="text-green-600 dark:text-green-400 font-bold">{item.us}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {typeof item.competitor === 'boolean' ? (
                          item.competitor ? (
                            <CheckCircle size={24} className="text-green-500 mx-auto" />
                          ) : (
                            <span className="text-2xl">❌</span>
                          )
                        ) : (
                          <span className="text-red-600 dark:text-red-400 font-bold">{item.competitor}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg">
              <Award size={24} />
              <span>NOUFAL أسرع 30x وأقوى بـ 15 ميزة فريدة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              ماذا يقول عملاؤنا؟
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              آراء حقيقية من مهندسين محترفين
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={20} className="text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="font-bold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Video Demo Section */}
      <div id="demo-video" className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              شاهد NOUFAL في العمل
            </h2>
            <p className="text-xl text-gray-400">
              جولة سريعة لأهم المميزات في دقيقتين
            </p>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-1">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="aspect-video flex items-center justify-center">
                <button className="group">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <PlayCircle size={48} className="text-indigo-600" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            جاهز لتحويل طريقة إدارة مشاريعك؟
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            انضم لأكثر من 50,000 مهندس محترف يستخدمون NOUFAL يومياً
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="group inline-flex items-center justify-center gap-3 bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
            >
              <Rocket size={24} />
              <span>ابدأ العمل مجاناً</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <p className="mt-6 text-indigo-100 text-sm">
            ✓ لا حاجة لبطاقة ائتمان &nbsp; ✓ جاهز للاستخدام فوراً &nbsp; ✓ دعم فني 24/7
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p className="mb-2">© 2025 NOUFAL Engineering Management System. جميع الحقوق محفوظة.</p>
            <p className="text-sm">تم التطوير بواسطة AHMED NAGEH</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
      `}</style>
    </div>
  );
};
