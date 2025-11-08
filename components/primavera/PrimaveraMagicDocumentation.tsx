import React, { useState } from 'react';
import { BookOpen, Code, Database, FileText, Info, ArrowRight, CheckCircle2 } from 'lucide-react';

const PrimaveraMagicDocumentation: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'tools' | 'api' | 'examples'>('overview');

  const toolsDocumentation = [
    {
      id: 'sdk',
      name: 'SDK Magic Tool',
      icon: '📦',
      description: 'استيراد وتصدير البيانات من وإلى Primavera P6',
      features: [
        'استيراد الأنشطة من Excel',
        'تصدير البيانات إلى Excel/CSV/JSON',
        'تحديث الأنشطة الموجودة',
        'دعم الموارد والتكاليف'
      ],
      endpoints: [
        { method: 'POST', path: '/api/primavera-magic/sdk/import-excel', desc: 'استيراد من Excel' },
        { method: 'POST', path: '/api/primavera-magic/sdk/import-activities', desc: 'استيراد أنشطة' },
        { method: 'POST', path: '/api/primavera-magic/sdk/export-activities', desc: 'تصدير أنشطة' },
      ]
    },
    {
      id: 'xer',
      name: 'XER Magic Tool',
      icon: '📄',
      description: 'تحليل وعرض ملفات XER من Primavera P6',
      features: [
        'تحليل ملفات XER',
        'استخراج معلومات المشروع',
        'عرض الأنشطة و WBS',
        'استخراج الموارد'
      ],
      endpoints: [
        { method: 'POST', path: '/api/primavera-magic/xer/parse', desc: 'تحليل ملف XER' },
        { method: 'GET', path: '/api/primavera-magic/xer/validate', desc: 'التحقق من ملف XER' },
      ]
    },
    {
      id: 'xls',
      name: 'XLS Magic Tool',
      icon: '📊',
      description: 'إنشاء تقارير Excel احترافية',
      features: [
        'تقارير مخصصة',
        'جداول محورية',
        'رسوم بيانية',
        'تنسيق احترافي'
      ],
      endpoints: [
        { method: 'POST', path: '/api/primavera-magic/xls/generate-report', desc: 'إنشاء تقرير' },
        { method: 'POST', path: '/api/primavera-magic/xls/export-schedule', desc: 'تصدير الجدول الزمني' },
      ]
    },
    {
      id: 'sql',
      name: 'SQL Magic Tool',
      icon: '🗃️',
      description: 'استعلامات SQL مباشرة على قاعدة البيانات',
      features: [
        'استعلامات SQL مخصصة',
        'استعلامات جاهزة',
        'تحليل البيانات',
        'تصدير النتائج'
      ],
      endpoints: [
        { method: 'POST', path: '/api/primavera-magic/sql/execute-query', desc: 'تنفيذ استعلام' },
        { method: 'GET', path: '/api/primavera-magic/sql/saved-queries', desc: 'الاستعلامات المحفوظة' },
      ]
    },
    {
      id: 'wbs',
      name: 'WBS Magic Tool',
      icon: '🌳',
      description: 'إدارة وتصميم هيكل WBS',
      features: [
        'إنشاء WBS',
        'تعديل الهيكل',
        'نقل العناصر',
        'عرض شجري'
      ],
      endpoints: [
        { method: 'GET', path: '/api/primavera-magic/wbs/tree', desc: 'عرض شجرة WBS' },
        { method: 'POST', path: '/api/primavera-magic/wbs/create', desc: 'إنشاء عنصر WBS' },
        { method: 'POST', path: '/api/primavera-magic/wbs/reorganize', desc: 'إعادة تنظيم' },
      ]
    },
    {
      id: 'rsc',
      name: 'RSC Magic Tool',
      icon: '👥',
      description: 'إدارة الموارد وتخصيصها',
      features: [
        'إدارة الموارد',
        'تحليل الاستخدام',
        'تعديل التخصيص',
        'تقارير الموارد'
      ],
      endpoints: [
        { method: 'GET', path: '/api/primavera-magic/rsc/list', desc: 'قائمة الموارد' },
        { method: 'POST', path: '/api/primavera-magic/rsc/allocate', desc: 'تخصيص موارد' },
        { method: 'GET', path: '/api/primavera-magic/rsc/utilization-report', desc: 'تقرير الاستخدام' },
      ]
    },
    {
      id: 'boq',
      name: 'BOQ Magic Tool',
      icon: '💰',
      description: 'دمج BOQ مع Primavera P6',
      features: [
        'استيراد BOQ',
        'ربط بالأنشطة',
        'حساب التكاليف',
        'تقارير مالية'
      ],
      endpoints: [
        { method: 'POST', path: '/api/primavera-magic/boq/import-as-resources', desc: 'استيراد BOQ' },
        { method: 'POST', path: '/api/primavera-magic/boq/link-to-activities', desc: 'ربط بالأنشطة' },
        { method: 'GET', path: '/api/primavera-magic/boq/cost-report', desc: 'تقرير التكاليف' },
      ]
    },
  ];

  const examples = [
    {
      title: 'استيراد أنشطة من Excel',
      tool: 'SDK Magic Tool',
      code: `// 1. تحضير البيانات
const activities = [
  {
    activity_id: 'A1000',
    activity_name: 'Site Mobilization',
    wbs_id: 'WBS-01',
    original_duration: 5,
    remaining_duration: 5,
    status: 'Not Started'
  }
];

// 2. إرسال الطلب
const response = await fetch('/api/primavera-magic/sdk/import-activities', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ activities })
});

// 3. معالجة النتيجة
const result = await response.json();
console.log(result.imported_count); // عدد الأنشطة المستوردة`
    },
    {
      title: 'تحليل ملف XER',
      tool: 'XER Magic Tool',
      code: `// 1. رفع الملف
const formData = new FormData();
formData.append('file', xerFile);

// 2. تحليل الملف
const response = await fetch('/api/primavera-magic/xer/parse', {
  method: 'POST',
  body: formData
});

// 3. استخراج البيانات
const data = await response.json();
console.log(data.data.project); // معلومات المشروع
console.log(data.data.activities); // الأنشطة
console.log(data.data.wbs); // عناصر WBS`
    },
    {
      title: 'استعلام SQL مخصص',
      tool: 'SQL Magic Tool',
      code: `// استعلام لعرض الأنشطة المتأخرة
const query = \`
  SELECT 
    activity_id,
    activity_name,
    actual_start,
    actual_finish,
    status
  FROM activities
  WHERE status = 'Behind Schedule'
  ORDER BY actual_start
\`;

const response = await fetch('/api/primavera-magic/sql/execute-query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query })
});

const result = await response.json();
console.log(result.results); // نتائج الاستعلام`
    },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">مرحباً بك في Primavera Magic Tools 📚</h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          مجموعة أدوات متكاملة ومتقدمة لإدارة مشاريع Primavera P6 بذكاء واحترافية. 
          تتيح لك هذه الأدوات التفاعل مع قاعدة بيانات Primavera بطرق مبتكرة وفعالة.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-gray-900 mb-1">سرعة فائقة</h3>
            <p className="text-sm text-gray-600">معالجة آلاف الأنشطة في ثوانٍ</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-gray-900 mb-1">دقة عالية</h3>
            <p className="text-sm text-gray-600">تحليل دقيق للبيانات والعلاقات</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl mb-2">🔒</div>
            <h3 className="font-semibold text-gray-900 mb-1">أمان كامل</h3>
            <p className="text-sm text-gray-600">حماية البيانات والصلاحيات</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">الأدوات المتاحة</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {toolsDocumentation.map((tool) => (
            <div key={tool.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{tool.icon}</span>
                <h4 className="font-semibold text-gray-900">{tool.name}</h4>
              </div>
              <p className="text-sm text-gray-600">{tool.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTools = () => (
    <div className="space-y-6">
      {toolsDocumentation.map((tool) => (
        <div key={tool.id} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{tool.icon}</span>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{tool.name}</h3>
              <p className="text-gray-600">{tool.description}</p>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">المميزات الرئيسية:</h4>
            <ul className="space-y-1">
              {tool.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">نقاط النهاية (Endpoints):</h4>
            <div className="space-y-2">
              {tool.endpoints.map((endpoint, index) => (
                <div key={index} className="flex items-start gap-3 text-sm bg-gray-50 rounded p-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {endpoint.method}
                  </span>
                  <div className="flex-1">
                    <code className="text-purple-600">{endpoint.path}</code>
                    <p className="text-gray-600 mt-1">{endpoint.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAPI = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">مرجع API</h3>
        <p className="text-gray-600 mb-6">
          جميع نقاط النهاية تستخدم Base URL التالي:
        </p>
        <div className="bg-gray-900 rounded-lg p-4 mb-6">
          <code className="text-green-400">http://localhost:5000/api/primavera-magic</code>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">تنسيق الاستجابة</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-700 overflow-auto">{`{
  "success": true,
  "data": { ... },
  "message": "نجحت العملية",
  "timestamp": "2024-01-15T10:30:00"
}`}</pre>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">رموز الحالة</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-medium">200</span>
                <span className="text-gray-700">نجحت العملية</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-medium">400</span>
                <span className="text-gray-700">خطأ في البيانات المدخلة</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded font-medium">500</span>
                <span className="text-gray-700">خطأ في الخادم</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExamples = () => (
    <div className="space-y-6">
      {examples.map((example, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">{example.title}</h3>
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {example.tool}
            </span>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
            <pre className="text-sm text-green-400">{example.code}</pre>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border-r-4 border-purple-600">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg text-white">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">الدليل الإرشادي الشامل</h1>
              <p className="text-gray-600 mt-1">كل ما تحتاج معرفته عن Primavera Magic Tools</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveSection('overview')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeSection === 'overview'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Info className="w-4 h-4" />
                نظرة عامة
              </button>
              <button
                onClick={() => setActiveSection('tools')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeSection === 'tools'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Database className="w-4 h-4" />
                الأدوات
              </button>
              <button
                onClick={() => setActiveSection('api')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeSection === 'api'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Code className="w-4 h-4" />
                مرجع API
              </button>
              <button
                onClick={() => setActiveSection('examples')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeSection === 'examples'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                أمثلة عملية
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeSection === 'overview' && renderOverview()}
            {activeSection === 'tools' && renderTools()}
            {activeSection === 'api' && renderAPI()}
            {activeSection === 'examples' && renderExamples()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrimaveraMagicDocumentation;
