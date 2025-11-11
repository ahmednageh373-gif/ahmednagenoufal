import React, { useState } from 'react';
import { BookOpen, FileText, Code, Wrench, Database, Brain, Search, Download } from 'lucide-react';

interface KnowledgeCategory {
  id: string;
  name: string;
  nameEn: string;
  icon: React.ReactNode;
  files: KnowledgeFile[];
  description: string;
}

interface KnowledgeFile {
  id: string;
  name: string;
  nameEn: string;
  size: string;
  type: string;
  description: string;
  topics: string[];
}

const AIAssistantKnowledgeBase: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const knowledgeBase: KnowledgeCategory[] = [
    {
      id: 'autocad',
      name: 'تدريبات AutoCAD',
      nameEn: 'AutoCAD Training',
      icon: <Code className="w-5 h-5" />,
      description: 'برامج تدريبية شاملة في AutoCAD من الأساسيات إلى الاحتراف',
      files: [
        {
          id: 'autocad-complete',
          name: 'دليل AutoCAD الشامل',
          nameEn: 'COMPREHENSIVE_TRAINING_GUIDE_AutoCAD_Complete.md',
          size: '~500 KB',
          type: 'دليل تدريبي',
          description: 'برنامج تدريبي شامل من الصفر إلى الاحتراف - 6 مراحل متقدمة',
          topics: ['أساسيات AutoCAD', 'الأوامر المتقدمة', 'المخططات الهندسية', 'استخراج الكميات']
        },
        {
          id: 'autocad-drawings',
          name: 'توثيق مخططات AutoCAD',
          nameEn: 'توثيق_مخططات_AutoCAD.md',
          size: '~14 KB',
          type: 'توثيق',
          description: '3 مخططات احترافية جاهزة (فيلا، مبنى تجاري، مستودع)',
          topics: ['مخطط فيلا 300م²', 'مبنى تجاري 500م²', 'مستودع صناعي 400م²']
        }
      ]
    },
    {
      id: 'yqarch',
      name: 'أداة YQArch',
      nameEn: 'YQArch Tool',
      icon: <Wrench className="w-5 h-5" />,
      description: 'دليل شامل لاستخدام أداة YQArch المتخصصة في AutoCAD',
      files: [
        {
          id: 'yqarch-learned',
          name: 'ما تعلمته من YQArch',
          nameEn: 'ما_تعلمته_YQArch.md',
          size: '~13 KB',
          type: 'دليل تعليمي',
          description: 'تحليل شامل لمكونات وآليات أداة YQArch',
          topics: ['مكتبة الكتل', 'أنماط الملء', 'أدوات الرسم', 'استخراج الكميات']
        },
        {
          id: 'yqarch-plan',
          name: 'خطة عمل YQArch',
          nameEn: 'خطة_عمل_YQArch.md',
          size: '~14 KB',
          type: 'خطة تطبيقية',
          description: 'خطة شاملة لتطبيق أداة YQArch في المشاريع الهندسية',
          topics: ['التثبيت والإعداد', 'التدريب والممارسة', 'التطبيق العملي']
        }
      ]
    },
    {
      id: 'lisp',
      name: 'سكريبتات LISP',
      nameEn: 'LISP Scripts',
      icon: <FileText className="w-5 h-5" />,
      description: 'أدلة شاملة لإنشاء واستخدام سكريبتات AutoLISP',
      files: [
        {
          id: 'lisp-walls',
          name: 'دليل سكريبت الجدران',
          nameEn: 'دليل_سكريبت_LISP.md',
          size: '~13 KB',
          type: 'دليل برمجي',
          description: 'كيفية إنشاء سكريبت LISP صحيح لرسم الجدران بخطين متقاربين',
          topics: ['رسم الجدران', 'الحسابات الرياضية', 'الدوال المتقدمة']
        },
        {
          id: 'lisp-complete',
          name: 'دليل التطبيق الكامل',
          nameEn: 'دليل_التطبيق_الكامل.md',
          size: '~19 KB',
          type: 'دليل متقدم',
          description: 'سكريبت متقدم يجمع 10 أجزاء متكاملة للرسم الهندسي',
          topics: ['إعداد الطبقات', 'رسم الجدران', 'الأبواب والنوافذ', 'الأثاث', 'الأبعاد']
        }
      ]
    },
    {
      id: 'structural',
      name: 'التحليل الإنشائي',
      nameEn: 'Structural Analysis',
      icon: <Database className="w-5 h-5" />,
      description: 'أنظمة متقدمة للتحليل الإنشائي والتصميم',
      files: [
        {
          id: 'sap2000-tank',
          name: 'تحليل الخزانات SAP2000',
          nameEn: 'SAP2000_Tank_Analysis_Script.py',
          size: '~19 KB',
          type: 'سكريبت Python',
          description: 'برنامج متقدم لتحليل الخزان الأرضي من نموذج SAP2000',
          topics: ['تحليل الخزانات', 'حساب الإجهادات', 'تحديد التسليح', 'تقارير شاملة']
        },
        {
          id: 'tank-training',
          name: 'دليل تدريبي الخزانات',
          nameEn: 'دليل_تدريبي_شامل.md',
          size: '~16 KB',
          type: 'دليل تدريبي',
          description: 'دليل شامل لاستخدام سكريبت تحليل الخزان الأرضي',
          topics: ['فهم هيكل السكريبت', 'إضافة الأحمال', 'حساب الإجهادات', 'إنشاء التقارير']
        },
        {
          id: 'tank-advanced',
          name: 'نظام الخزانات المتقدم',
          nameEn: 'دليل_نظام_الخزانات.md',
          size: '~16 KB',
          type: 'دليل موسع',
          description: 'نظام متقدم لتحليل 5 أنواع من الخزانات',
          topics: ['خزان أرضي مستطيل', 'خزان علوي', 'خزان دائري', 'خزان بيضاوي']
        }
      ]
    },
    {
      id: 'loads',
      name: 'حساب الأحمال',
      nameEn: 'Load Calculations',
      icon: <BookOpen className="w-5 h-5" />,
      description: 'أدلة شاملة لحساب أحمال الرياح والزلازل',
      files: [
        {
          id: 'wind-seismic',
          name: 'دليل أحمال الرياح والزلازل',
          nameEn: 'دليل_الرياح_والزلازل.md',
          size: '~11 KB',
          type: 'دليل تعليمي',
          description: 'دليل شامل لحساب أحمال الرياح والزلازل وفقاً للمعايير الدولية',
          topics: ['أحمال الرياح', 'أحمال الزلازل', 'تحليل Staad Pro', 'تقارير مفصلة']
        },
        {
          id: 'livestock',
          name: 'دليل الحظائر الحيوانية',
          nameEn: 'دليل_الحظائر_الحيوانية.md',
          size: '~14 KB',
          type: 'دليل متخصص',
          description: 'نظام متقدم لتحليل وتصميم الحظائر الحيوانية',
          topics: ['حسابات المساحة', 'التحليل الحراري', 'التهوية', 'الحسابات الإنشائية']
        }
      ]
    }
  ];

  const filteredFiles = knowledgeBase
    .map(category => ({
      ...category,
      files: category.files.filter(file =>
        (selectedCategory === 'all' || category.id === selectedCategory) &&
        (searchQuery === '' ||
          file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          file.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          file.description.includes(searchQuery) ||
          file.topics.some(topic => topic.includes(searchQuery)))
      )
    }))
    .filter(category => category.files.length > 0);

  const totalFiles = knowledgeBase.reduce((sum, cat) => sum + cat.files.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Brain className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">قاعدة المعرفة للمساعد الذكي</h2>
            <p className="text-blue-100">مدعوم بالذكاء الاصطناعي من NOUFAL</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold">{totalFiles}</div>
            <div className="text-sm text-blue-100">ملف تدريبي</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold">{knowledgeBase.length}</div>
            <div className="text-sm text-blue-100">فئة معرفية</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold">~210</div>
            <div className="text-sm text-blue-100">KB إجمالي</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute right-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث في قاعدة المعرفة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            الكل ({totalFiles})
          </button>
          {knowledgeBase.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.icon}
              {category.name} ({category.files.length})
            </button>
          ))}
        </div>
      </div>

      {/* Knowledge Categories */}
      <div className="space-y-6">
        {filteredFiles.map(category => (
          <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  {category.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
              </div>
            </div>

            <div className="divide-y">
              {category.files.map(file => (
                <div key={file.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h4 className="font-bold text-gray-800">{file.name}</h4>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {file.type}
                        </span>
                        <span className="text-xs text-gray-500">{file.size}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{file.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {file.topics.map((topic, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredFiles.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد نتائج</h3>
          <p className="text-gray-600">جرب مصطلحات بحث مختلفة</p>
        </div>
      )}

      {/* Footer Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Brain className="w-5 h-5 text-blue-600 mt-1" />
          <div>
            <h4 className="font-bold text-blue-900 mb-1">كيف يستخدم المساعد الذكي هذه المعرفة؟</h4>
            <p className="text-sm text-blue-800">
              المساعد الذكي يستخدم هذه الملفات التدريبية لفهم استفساراتك وتقديم إجابات دقيقة ومفصلة حول:
              AutoCAD، التحليل الإنشائي، حساب الأحمال، أدوات YQArch، سكريبتات LISP، والمزيد.
              يمكنه مساعدتك في حساب التكاليف، تحليل المشاريع، وإنشاء تقارير شاملة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantKnowledgeBase;
