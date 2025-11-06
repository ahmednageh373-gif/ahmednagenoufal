import React, { useState, useMemo } from 'react';
import { Project } from './types';
import { Book, Search, FileText, GraduationCap, Building2, Calculator, Zap, BookOpen, ChevronRight, Download, Filter, Star } from './lucide-icons';
import { marked } from 'marked';

// Training modules data structure
interface TrainingModule {
    id: string;
    title: string;
    titleAr: string;
    description: string;
    category: string;
    icon: React.ElementType;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedHours: number;
    topics: string[];
    featured?: boolean;
}

const trainingModules: TrainingModule[] = [
    {
        id: 'autocad-comprehensive',
        title: 'Comprehensive AutoCAD Training',
        titleAr: 'التدريب الشامل على AutoCAD',
        description: 'برنامج تدريبي متكامل من المبتدئ إلى المحترف، يغطي جميع جوانب AutoCAD',
        category: 'CAD',
        icon: Building2,
        difficulty: 'beginner',
        estimatedHours: 30,
        topics: ['أساسيات AutoCAD', 'الأوامر المتقدمة', 'المخططات الهندسية', 'استخراج الكميات'],
        featured: true
    },
    {
        id: 'tank-analysis',
        title: 'Underground Tank Analysis',
        titleAr: 'تحليل الخزان الأرضي من SAP2000',
        description: 'سكريبت Python المتقدم لتحليل الخزانات الأرضية والحسابات الإنشائية',
        category: 'Structural',
        icon: Calculator,
        difficulty: 'advanced',
        estimatedHours: 8,
        topics: ['تحليل الخزانات', 'حسابات SAP2000', 'التسليح', 'معاملات الأمان'],
        featured: true
    },
    {
        id: 'wind-seismic',
        title: 'Wind & Seismic Load Calculator',
        titleAr: 'حساب أحمال الرياح والزلازل',
        description: 'نظام متقدم لحساب أحمال الرياح والزلازل وفقاً للمعايير الدولية',
        category: 'Structural',
        icon: Zap,
        difficulty: 'advanced',
        estimatedHours: 6,
        topics: ['أحمال الرياح', 'أحمال الزلازل', 'Staad Pro', 'المعايير الدولية'],
        featured: false
    },
    {
        id: 'yqarch-tool',
        title: 'YQArch Tool Mastery',
        titleAr: 'إتقان أداة YQArch',
        description: 'دليل شامل لاستخدام أداة YQArch مع 60+ كتلة معمارية جاهزة',
        category: 'CAD',
        icon: BookOpen,
        difficulty: 'intermediate',
        estimatedHours: 12,
        topics: ['مكتبة الكتل', 'أنماط الملء', 'أدوات الرسم', 'الحصر واستخراج الكميات'],
        featured: true
    },
    {
        id: 'lisp-scripting',
        title: 'LISP Scripting for Walls',
        titleAr: 'برمجة LISP لرسم الجدران',
        description: 'تعلم إنشاء سكريبتات LISP لرسم الجدران والمخططات المعمارية',
        category: 'Programming',
        icon: FileText,
        difficulty: 'intermediate',
        estimatedHours: 4,
        topics: ['لغة LISP', 'رسم الجدران', 'الأوامر المخصصة', 'AutoCAD API'],
        featured: false
    },
    {
        id: 'autocad-drawings',
        title: 'AutoCAD Drawing Documentation',
        titleAr: 'توثيق مخططات AutoCAD',
        description: '3 مخططات AutoCAD احترافية كاملة (فيلا، عمارة، مبنى تجاري)',
        category: 'CAD',
        icon: Building2,
        difficulty: 'intermediate',
        estimatedHours: 10,
        topics: ['المخططات المعمارية', 'التوثيق', 'المعايير', 'الطباعة والإخراج'],
        featured: false
    },
    {
        id: 'tank-types',
        title: 'Advanced Tank Analysis System',
        titleAr: 'نظام تحليل الخزانات المتقدم',
        description: 'تحليل 5 أنواع من الخزانات (أرضي، علوي، دائري، بيضاوي)',
        category: 'Structural',
        icon: Calculator,
        difficulty: 'advanced',
        estimatedHours: 12,
        topics: ['خزانات متعددة', 'تحليل متقدم', 'مقارنة الأنواع', 'تصميم شامل'],
        featured: false
    },
    {
        id: 'yqarch-implementation',
        title: 'YQArch Implementation Plan',
        titleAr: 'خطة تطبيق YQArch',
        description: 'خطة عمل شاملة لتطبيق YQArch في المشاريع الهندسية',
        category: 'Management',
        icon: Book,
        difficulty: 'beginner',
        estimatedHours: 4,
        topics: ['خطة العمل', 'التطبيق العملي', 'قياس الأداء', 'أفضل الممارسات'],
        featured: false
    },
    {
        id: 'agent-profile',
        title: 'AN.AI Agent Complete Profile',
        titleAr: 'الملف الشامل للوكيل AN.AI',
        description: 'الملف التعريفي الكامل مع 8 تخصصات وقاعدة معرفية ضخمة',
        category: 'Knowledge',
        icon: GraduationCap,
        difficulty: 'beginner',
        estimatedHours: 2,
        topics: ['التعريف بالوكيل', '8 تخصصات', 'قاعدة المعرفة', 'التعليمات الكاملة'],
        featured: true
    },
    {
        id: 'livestock-barn',
        title: 'Livestock Barn Analysis',
        titleAr: 'تحليل وتصميم الحظائر الحيوانية',
        description: 'نظام متقدم لتحليل وتصميم الحظائر الحيوانية مع الحسابات الحرارية',
        category: 'Structural',
        icon: Building2,
        difficulty: 'advanced',
        estimatedHours: 8,
        topics: ['حسابات المساحة', 'التهوية', 'التحليل الحراري', 'الحسابات الإنشائية'],
        featured: false
    }
];

const categories = [
    { id: 'all', name: 'الكل', icon: BookOpen },
    { id: 'CAD', name: 'AutoCAD', icon: Building2 },
    { id: 'Structural', name: 'التحليل الإنشائي', icon: Calculator },
    { id: 'Programming', name: 'البرمجة', icon: FileText },
    { id: 'Management', name: 'الإدارة', icon: Book },
    { id: 'Knowledge', name: 'قاعدة المعرفة', icon: GraduationCap },
];

const difficulties = {
    beginner: { label: 'مبتدئ', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
    intermediate: { label: 'متوسط', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
    advanced: { label: 'متقدم', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
};

interface EngineeringKnowledgeProps {
    project: Project;
}

export const EngineeringKnowledge: React.FC<EngineeringKnowledgeProps> = ({ project }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
    const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);

    const filteredModules = useMemo(() => {
        return trainingModules.filter(module => {
            const matchesSearch = module.titleAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                module.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
            const matchesDifficulty = selectedDifficulty === 'all' || module.difficulty === selectedDifficulty;
            
            return matchesSearch && matchesCategory && matchesDifficulty;
        });
    }, [searchTerm, selectedCategory, selectedDifficulty]);

    const featuredModules = trainingModules.filter(m => m.featured);
    const totalHours = trainingModules.reduce((sum, m) => sum + m.estimatedHours, 0);

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <GraduationCap className="w-8 h-8 text-indigo-600" />
                        <h1 className="text-3xl font-bold">المعرفة الهندسية - AN.AI AHMED NAGEH</h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        مكتبة شاملة من الأدلة التدريبية والمعرفة الهندسية المتخصصة
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">إجمالي الدورات</p>
                                <p className="text-2xl font-bold text-indigo-600">{trainingModules.length}</p>
                            </div>
                            <BookOpen className="w-8 h-8 text-indigo-600 opacity-50" />
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">ساعات التدريب</p>
                                <p className="text-2xl font-bold text-green-600">{totalHours}</p>
                            </div>
                            <GraduationCap className="w-8 h-8 text-green-600 opacity-50" />
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">تخصصات</p>
                                <p className="text-2xl font-bold text-blue-600">8</p>
                            </div>
                            <Building2 className="w-8 h-8 text-blue-600 opacity-50" />
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">مميزة</p>
                                <p className="text-2xl font-bold text-yellow-600">{featuredModules.length}</p>
                            </div>
                            <Star className="w-8 h-8 text-yellow-600 opacity-50" />
                        </div>
                    </div>
                </div>

                {/* Featured Modules */}
                {!selectedModule && featuredModules.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Star className="w-6 h-6 text-yellow-500" />
                            دورات مميزة
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {featuredModules.map(module => {
                                const Icon = module.icon;
                                return (
                                    <div 
                                        key={module.id}
                                        onClick={() => setSelectedModule(module)}
                                        className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-all border-2 border-indigo-200 dark:border-indigo-700"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <Icon className="w-8 h-8 text-indigo-600" />
                                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                        </div>
                                        <h3 className="text-lg font-bold mb-2">{module.titleAr}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{module.description}</p>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className={`px-2 py-1 rounded-full ${difficulties[module.difficulty].color}`}>
                                                {difficulties[module.difficulty].label}
                                            </span>
                                            <span className="text-gray-500">{module.estimatedHours} ساعة</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {!selectedModule && (
                    <>
                        {/* Search and Filters */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="ابحث في الدورات..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pr-10 pl-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                                    />
                                </div>

                                {/* Category Filter */}
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>

                                {/* Difficulty Filter */}
                                <select
                                    value={selectedDifficulty}
                                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                                    className="px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                                >
                                    <option value="all">كل المستويات</option>
                                    <option value="beginner">مبتدئ</option>
                                    <option value="intermediate">متوسط</option>
                                    <option value="advanced">متقدم</option>
                                </select>
                            </div>
                        </div>

                        {/* Modules Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredModules.map(module => {
                                const Icon = module.icon;
                                return (
                                    <div
                                        key={module.id}
                                        onClick={() => setSelectedModule(module)}
                                        className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow hover:shadow-lg transition-all cursor-pointer border border-gray-200 dark:border-slate-700"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <Icon className="w-8 h-8 text-indigo-600" />
                                            {module.featured && <Star className="w-5 h-5 text-yellow-500" />}
                                        </div>
                                        <h3 className="text-lg font-bold mb-2">{module.titleAr}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                                            {module.description}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {module.topics.slice(0, 2).map((topic, idx) => (
                                                <span key={idx} className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                                                    {topic}
                                                </span>
                                            ))}
                                            {module.topics.length > 2 && (
                                                <span className="text-xs text-gray-500">+{module.topics.length - 2}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className={`text-xs px-2 py-1 rounded-full ${difficulties[module.difficulty].color}`}>
                                                {difficulties[module.difficulty].label}
                                            </span>
                                            <span className="text-sm text-gray-500">{module.estimatedHours} ساعة</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {filteredModules.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>لم يتم العثور على دورات مطابقة</p>
                            </div>
                        )}
                    </>
                )}

                {/* Module Details */}
                {selectedModule && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                            <button
                                onClick={() => setSelectedModule(null)}
                                className="mb-4 flex items-center gap-2 hover:underline"
                            >
                                <ChevronRight className="w-5 h-5 rotate-180" />
                                العودة للقائمة
                            </button>
                            <div className="flex items-start gap-4">
                                {React.createElement(selectedModule.icon, { className: 'w-12 h-12' })}
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">{selectedModule.titleAr}</h2>
                                    <p className="text-indigo-100">{selectedModule.description}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="text-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">المستوى</p>
                                    <p className={`font-bold ${difficulties[selectedModule.difficulty].color.split(' ')[1]}`}>
                                        {difficulties[selectedModule.difficulty].label}
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">المدة</p>
                                    <p className="font-bold text-indigo-600">{selectedModule.estimatedHours} ساعة</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">التصنيف</p>
                                    <p className="font-bold text-blue-600">{selectedModule.category}</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-bold mb-4">المواضيع المغطاة</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {selectedModule.topics.map((topic, idx) => (
                                        <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                            <ChevronRight className="w-5 h-5 text-indigo-600" />
                                            <span>{topic}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
                                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                    📚 <strong>ملاحظة:</strong> هذه الدورة جزء من حزمة AN.AI AHMED NAGEH الشاملة التي تحتوي على 210,000+ كلمة من المحتوى الاحترافي
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 font-semibold flex items-center justify-center gap-2">
                                    <BookOpen className="w-5 h-5" />
                                    بدء التدريب
                                </button>
                                <button className="flex-1 border-2 border-indigo-600 text-indigo-600 py-3 px-6 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-semibold flex items-center justify-center gap-2">
                                    <Download className="w-5 h-5" />
                                    تحميل الملف
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EngineeringKnowledge;
