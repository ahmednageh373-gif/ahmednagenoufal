/**
 * Unified Dashboard - لوحة التحكم الموحدة
 * =====================================
 * 
 * Dashboard موحد يدمج جميع أدوات NOUFAL EMS + Civil Concept
 * يحتوي على 30+ أداة هندسية متكاملة
 * 
 * @author NOUFAL Engineering Management System
 * @date 2025-11-04
 * @version 1.0
 */

import React, { useState, useEffect } from 'react';
import {
  Home,
  Calculator,
  Building2,
  Hammer,
  LineChart,
  FileText,
  Settings,
  Users,
  FolderKanban,
  Boxes,
  Ruler,
  Coins,
  TrendingUp,
  Package,
  BarChart3,
  Layers,
  Target,
  ClipboardList,
  Wrench,
  Layout,
  Zap,
  TrendingUp as Activity,
  Database,
  GitBranch,
  PieChart,
  ArrowRightLeft,
  DollarSign,
  Timer,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronRight,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Star,
  Bookmark,
  Bell,
  Calendar,
  Clock,
  MapPin,
  Gauge
} from 'lucide-react';

// ============================================================================
// Types and Interfaces
// ============================================================================

interface DashboardStats {
  totalProjects: number;
  activeTools: number;
  completedCalculations: number;
  systemHealth: number;
  lastUpdate: string;
}

interface ToolCategory {
  id: string;
  name: string;
  nameAr: string;
  icon: React.ReactNode;
  tools: Tool[];
  color: string;
}

interface Tool {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  complexity: 'simple' | 'medium' | 'complex';
  status: 'active' | 'beta' | 'coming-soon';
  usage: number;
  lastUsed?: string;
}

interface RecentActivity {
  id: string;
  tool: string;
  action: string;
  timestamp: string;
  user: string;
  status: 'success' | 'warning' | 'error';
}

// ============================================================================
// Tool Categories Configuration
// ============================================================================

const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: 'basic',
    name: 'Basic Tools',
    nameAr: 'الأدوات الأساسية',
    icon: <Calculator className="w-6 h-6" />,
    color: 'blue',
    tools: [
      {
        id: 'converter',
        name: 'Unit Converter',
        nameAr: 'محول الوحدات',
        description: 'Convert between different units',
        descriptionAr: 'تحويل بين الوحدات المختلفة',
        category: 'basic',
        complexity: 'simple',
        status: 'active',
        usage: 1234
      },
      {
        id: 'building_estimator',
        name: 'Building Estimator',
        nameAr: 'مقدر المباني',
        description: 'Calculate building costs',
        descriptionAr: 'حساب تكاليف المباني',
        category: 'basic',
        complexity: 'medium',
        status: 'active',
        usage: 856
      },
      {
        id: 'estimation',
        name: 'Estimation Tools',
        nameAr: 'أدوات التقدير',
        description: 'Project estimation tools',
        descriptionAr: 'أدوات تقدير المشاريع',
        category: 'basic',
        complexity: 'medium',
        status: 'active',
        usage: 723
      },
      {
        id: 'steel_weight',
        name: 'Steel Weight Calculator',
        nameAr: 'حاسبة وزن الحديد',
        description: 'Calculate steel weight',
        descriptionAr: 'حساب وزن الحديد',
        category: 'basic',
        complexity: 'simple',
        status: 'active',
        usage: 945
      }
    ]
  },
  {
    id: 'estimation',
    name: 'Estimation & Costing',
    nameAr: 'التقدير والتكاليف',
    icon: <DollarSign className="w-6 h-6" />,
    color: 'green',
    tools: [
      {
        id: 'rate_analysis',
        name: 'Rate Analysis',
        nameAr: 'تحليل الأسعار',
        description: 'Analyze material and labor rates',
        descriptionAr: 'تحليل أسعار المواد والعمالة',
        category: 'estimation',
        complexity: 'medium',
        status: 'active',
        usage: 678
      },
      {
        id: 'boq_maker',
        name: 'BOQ Maker',
        nameAr: 'مولد BOQ',
        description: 'Create Bill of Quantities',
        descriptionAr: 'إنشاء جدول الكميات',
        category: 'estimation',
        complexity: 'medium',
        status: 'active',
        usage: 892
      },
      {
        id: 'finance',
        name: 'Finance Calculator',
        nameAr: 'حاسبة التمويل',
        description: 'Financial calculations',
        descriptionAr: 'الحسابات المالية',
        category: 'estimation',
        complexity: 'medium',
        status: 'active',
        usage: 534
      },
      {
        id: 'volume_area',
        name: 'Volume/Area Calculator',
        nameAr: 'حاسبة الحجم والمساحة',
        description: 'Calculate volumes and areas',
        descriptionAr: 'حساب الحجوم والمساحات',
        category: 'estimation',
        complexity: 'simple',
        status: 'active',
        usage: 1123
      },
      {
        id: 'load_calculator',
        name: 'Load Calculator',
        nameAr: 'حاسبة الأحمال',
        description: 'Calculate structural loads',
        descriptionAr: 'حساب الأحمال الإنشائية',
        category: 'estimation',
        complexity: 'complex',
        status: 'active',
        usage: 567
      }
    ]
  },
  {
    id: 'design',
    name: 'Design Tools',
    nameAr: 'أدوات التصميم',
    icon: <Ruler className="w-6 h-6" />,
    color: 'purple',
    tools: [
      {
        id: 'rcc_design',
        name: 'RCC Design',
        nameAr: 'تصميم الخرسانة المسلحة',
        description: 'Reinforced concrete design',
        descriptionAr: 'تصميم الخرسانة المسلحة',
        category: 'design',
        complexity: 'complex',
        status: 'active',
        usage: 456
      },
      {
        id: 'cutting_length',
        name: 'Cutting Length',
        nameAr: 'طول القطع',
        description: 'Calculate rebar cutting length',
        descriptionAr: 'حساب طول قطع الحديد',
        category: 'design',
        complexity: 'medium',
        status: 'active',
        usage: 789
      },
      {
        id: 'bar_bending',
        name: 'Bar Bending Schedule',
        nameAr: 'جدول تسليح الحديد',
        description: 'Create bar bending schedule',
        descriptionAr: 'إنشاء جدول تسليح الحديد',
        category: 'design',
        complexity: 'complex',
        status: 'active',
        usage: 612
      },
      {
        id: 'formwork_cost',
        name: 'Formwork Cost',
        nameAr: 'تكلفة الشدات',
        description: 'Calculate formwork costs',
        descriptionAr: 'حساب تكاليف الشدات',
        category: 'design',
        complexity: 'medium',
        status: 'active',
        usage: 423
      },
      {
        id: 'concrete_tech',
        name: 'Concrete Technology',
        nameAr: 'تكنولوجيا الخرسانة',
        description: 'Concrete mix design',
        descriptionAr: 'تصميم خلطة الخرسانة',
        category: 'design',
        complexity: 'complex',
        status: 'active',
        usage: 534
      },
      {
        id: 'material_lab',
        name: 'Material Lab Test',
        nameAr: 'اختبارات المواد',
        description: 'Material testing calculations',
        descriptionAr: 'حسابات اختبار المواد',
        category: 'design',
        complexity: 'medium',
        status: 'active',
        usage: 345
      }
    ]
  },
  {
    id: 'analysis',
    name: 'Analysis Tools',
    nameAr: 'أدوات التحليل',
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'red',
    tools: [
      {
        id: 'structural_analysis',
        name: 'Structural Analysis',
        nameAr: 'التحليل الإنشائي',
        description: 'Analyze structures',
        descriptionAr: 'تحليل الهياكل',
        category: 'analysis',
        complexity: 'complex',
        status: 'active',
        usage: 378
      },
      {
        id: 'soil_mechanics',
        name: 'Soil Mechanics',
        nameAr: 'ميكانيكا التربة',
        description: 'Soil analysis',
        descriptionAr: 'تحليل التربة',
        category: 'analysis',
        complexity: 'complex',
        status: 'active',
        usage: 289
      },
      {
        id: 'foundation',
        name: 'Foundation Engineering',
        nameAr: 'هندسة الأساسات',
        description: 'Foundation design',
        descriptionAr: 'تصميم الأساسات',
        category: 'analysis',
        complexity: 'complex',
        status: 'active',
        usage: 423
      },
      {
        id: 'strength_materials',
        name: 'Strength of Materials',
        nameAr: 'مقاومة المواد',
        description: 'Material strength calculations',
        descriptionAr: 'حسابات مقاومة المواد',
        category: 'analysis',
        complexity: 'complex',
        status: 'active',
        usage: 312
      },
      {
        id: 'hydraulics',
        name: 'Hydraulics & Fluid Mechanics',
        nameAr: 'الهيدروليكا وميكانيكا الموائع',
        description: 'Hydraulic calculations',
        descriptionAr: 'حسابات الهيدروليكا',
        category: 'analysis',
        complexity: 'complex',
        status: 'active',
        usage: 267
      }
    ]
  },
  {
    id: 'transportation',
    name: 'Transportation',
    nameAr: 'النقل',
    icon: <MapPin className="w-6 h-6" />,
    color: 'yellow',
    tools: [
      {
        id: 'transportation',
        name: 'Transportation Engineering',
        nameAr: 'هندسة النقل',
        description: 'Road and transport calculations',
        descriptionAr: 'حسابات الطرق والنقل',
        category: 'transportation',
        complexity: 'complex',
        status: 'active',
        usage: 234
      },
      {
        id: 'survey',
        name: 'Survey Tools',
        nameAr: 'أدوات المسح',
        description: 'Land surveying',
        descriptionAr: 'مسح الأراضي',
        category: 'transportation',
        complexity: 'medium',
        status: 'active',
        usage: 345
      }
    ]
  },
  {
    id: 'education',
    name: 'Education & References',
    nameAr: 'التعليم والمراجع',
    icon: <FileText className="w-6 h-6" />,
    color: 'indigo',
    tools: [
      {
        id: 'video_course',
        name: 'Video Course Pro',
        nameAr: 'دورات الفيديو',
        description: 'Engineering video courses',
        descriptionAr: 'دورات فيديو هندسية',
        category: 'education',
        complexity: 'simple',
        status: 'active',
        usage: 567
      },
      {
        id: 'building_guide',
        name: 'Building Guide',
        nameAr: 'دليل المباني',
        description: 'Building design guide',
        descriptionAr: 'دليل تصميم المباني',
        category: 'education',
        complexity: 'simple',
        status: 'active',
        usage: 678
      }
    ]
  },
  {
    id: 'special',
    name: 'Special Tools',
    nameAr: 'أدوات خاصة',
    icon: <Star className="w-6 h-6" />,
    color: 'pink',
    tools: [
      {
        id: 'cv_maker',
        name: 'CV Maker',
        nameAr: 'صانع السيرة الذاتية',
        description: 'Create professional CV',
        descriptionAr: 'إنشاء سيرة ذاتية احترافية',
        category: 'special',
        complexity: 'simple',
        status: 'active',
        usage: 234
      },
      {
        id: 'soil_property',
        name: 'Soil Property Calculator',
        nameAr: 'حاسبة خصائص التربة',
        description: 'Calculate soil properties',
        descriptionAr: 'حساب خصائص التربة',
        category: 'special',
        complexity: 'medium',
        status: 'active',
        usage: 178
      },
      {
        id: 'plinth_area',
        name: 'Plinth Area Calculator',
        nameAr: 'حاسبة مساحة الأساس',
        description: 'Calculate plinth area and cost',
        descriptionAr: 'حساب مساحة الأساس والتكلفة',
        category: 'special',
        complexity: 'simple',
        status: 'active',
        usage: 289
      },
      {
        id: 'linear_interpolation',
        name: 'Linear Interpolation',
        nameAr: 'الاستيفاء الخطي',
        description: 'Interpolate values',
        descriptionAr: 'حساب القيم المفقودة',
        category: 'special',
        complexity: 'simple',
        status: 'active',
        usage: 156
      }
    ]
  },
  {
    id: 'management',
    name: 'Project Management',
    nameAr: 'إدارة المشاريع',
    icon: <FolderKanban className="w-6 h-6" />,
    color: 'teal',
    tools: [
      {
        id: 'project_tracking',
        name: 'Project Tracking',
        nameAr: 'تتبع المشاريع',
        description: 'Track project progress',
        descriptionAr: 'تتبع تقدم المشاريع',
        category: 'management',
        complexity: 'medium',
        status: 'active',
        usage: 456
      },
      {
        id: 'task_management',
        name: 'Task Management',
        nameAr: 'إدارة المهام',
        description: 'Manage tasks and schedules',
        descriptionAr: 'إدارة المهام والجداول',
        category: 'management',
        complexity: 'medium',
        status: 'active',
        usage: 534
      }
    ]
  }
];

// ============================================================================
// Main Dashboard Component
// ============================================================================

export const UnifiedDashboard: React.FC = () => {
  const [language, setLanguage] = useState<'en' | 'ar'>('ar');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 42,
    activeTools: 30,
    completedCalculations: 1567,
    systemHealth: 98.5,
    lastUpdate: new Date().toISOString()
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(false);

  const isRTL = language === 'ar';

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Load recent activities
      setRecentActivities([
        {
          id: '1',
          tool: 'BOQ Maker',
          action: 'Created new BOQ for Project X',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          user: 'Ahmed',
          status: 'success'
        },
        {
          id: '2',
          tool: 'RCC Design',
          action: 'Designed column C1',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          user: 'Mohammed',
          status: 'success'
        },
        {
          id: '3',
          tool: 'Steel Weight',
          action: 'Calculated steel weight',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          user: 'Sara',
          status: 'success'
        }
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = TOOL_CATEGORIES.filter(category => {
    if (selectedCategory && category.id !== selectedCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        category.name.toLowerCase().includes(query) ||
        category.nameAr.includes(query) ||
        category.tools.some(tool =>
          tool.name.toLowerCase().includes(query) ||
          tool.nameAr.includes(query)
        )
      );
    }
    return true;
  });

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'green';
      case 'medium': return 'yellow';
      case 'complex': return 'red';
      default: return 'gray';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
          {isRTL ? 'نشط' : 'Active'}
        </span>;
      case 'beta':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
          {isRTL ? 'تجريبي' : 'Beta'}
        </span>;
      case 'coming-soon':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
          {isRTL ? 'قريباً' : 'Coming Soon'}
        </span>;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diff < 1) return isRTL ? 'الآن' : 'Now';
    if (diff < 60) return isRTL ? `منذ ${diff} دقيقة` : `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return isRTL ? `منذ ${hours} ساعة` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return isRTL ? `منذ ${days} يوم` : `${days}d ago`;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isRTL ? 'نظام نوفل الهندسي' : 'NOUFAL Engineering'}
                </h1>
                <p className="text-sm text-gray-600">
                  {isRTL ? 'لوحة التحكم الموحدة - 30+ أداة متكاملة' : 'Unified Dashboard - 30+ Integrated Tools'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="px-4 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              >
                {language === 'ar' ? 'English' : 'العربية'}
              </button>
              
              {/* Notifications */}
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* User Profile */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  A
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <FolderKanban className="w-8 h-8 text-blue-600" />
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                {isRTL ? 'المشاريع' : 'Projects'}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalProjects}</div>
            <p className="text-sm text-gray-600">
              {isRTL ? 'إجمالي المشاريع' : 'Total Projects'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Wrench className="w-8 h-8 text-green-600" />
              <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium">
                {isRTL ? 'الأدوات' : 'Tools'}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.activeTools}</div>
            <p className="text-sm text-gray-600">
              {isRTL ? 'أدوات نشطة' : 'Active Tools'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-purple-600" />
              <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-sm font-medium">
                {isRTL ? 'الحسابات' : 'Calculations'}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.completedCalculations}</div>
            <p className="text-sm text-gray-600">
              {isRTL ? 'حسابات منجزة' : 'Completed'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Gauge className="w-8 h-8 text-orange-600" />
              <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-sm font-medium">
                {isRTL ? 'الصحة' : 'Health'}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.systemHealth}%</div>
            <p className="text-sm text-gray-600">
              {isRTL ? 'صحة النظام' : 'System Health'}
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 rtl:right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={isRTL ? 'ابحث عن أداة...' : 'Search for a tool...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 rtl:pr-12 pr-4 rtl:pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  selectedCategory === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isRTL ? 'الكل' : 'All'}
              </button>
              <button
                onClick={loadDashboardData}
                className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {TOOL_CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 rtl:space-x-reverse transition-colors ${
                  selectedCategory === category.id
                    ? `bg-${category.color}-100 text-${category.color}-700 border-2 border-${category.color}-500`
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category.icon}
                <span className="font-medium">
                  {isRTL ? category.nameAr : category.name}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white text-xs">
                  {category.tools.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tools Grid */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isRTL ? 'الأدوات المتاحة' : 'Available Tools'}
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                {filteredCategories.map(category => (
                  <div key={category.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className={`p-2 rounded-lg bg-${category.color}-50`}>
                          {category.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {isRTL ? category.nameAr : category.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {category.tools.length} {isRTL ? 'أداة' : 'tools'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.tools.map(tool => (
                        <button
                          key={tool.id}
                          className="text-left rtl:text-right p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {isRTL ? tool.nameAr : tool.name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {isRTL ? tool.descriptionAr : tool.description}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors rtl:rotate-180" />
                          </div>
                          
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              {getStatusBadge(tool.status)}
                              <span className={`px-2 py-1 text-xs rounded-full bg-${getComplexityColor(tool.complexity)}-50 text-${getComplexityColor(tool.complexity)}-700`}>
                                {tool.complexity === 'simple' && (isRTL ? 'بسيط' : 'Simple')}
                                {tool.complexity === 'medium' && (isRTL ? 'متوسط' : 'Medium')}
                                {tool.complexity === 'complex' && (isRTL ? 'معقد' : 'Complex')}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 rtl:space-x-reverse text-sm text-gray-500">
                              <Activity className="w-4 h-4" />
                              <span>{tool.usage}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activities */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 rtl:ml-2" />
                {isRTL ? 'النشاطات الأخيرة' : 'Recent Activities'}
              </h3>
              
              <div className="space-y-3">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.tool}</p>
                        <p className="text-xs text-gray-600 mt-1">{activity.action}</p>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse mt-2">
                          <span className="text-xs text-gray-500">{activity.user}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</span>
                        </div>
                      </div>
                      {activity.status === 'success' && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                      {activity.status === 'warning' && (
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 rtl:ml-2" />
                {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
              </h3>
              
              <div className="space-y-2">
                <button className="w-full p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center justify-between">
                  <span className="font-medium">{isRTL ? 'مشروع جديد' : 'New Project'}</span>
                  <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                </button>
                <button className="w-full p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors flex items-center justify-between">
                  <span className="font-medium">{isRTL ? 'تقرير BOQ' : 'BOQ Report'}</span>
                  <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                </button>
                <button className="w-full p-3 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors flex items-center justify-between">
                  <span className="font-medium">{isRTL ? 'تحليل سريع' : 'Quick Analysis'}</span>
                  <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                </button>
                <button className="w-full p-3 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors flex items-center justify-between">
                  <span className="font-medium">{isRTL ? 'تصدير البيانات' : 'Export Data'}</span>
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* System Info */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2 rtl:ml-2" />
                {isRTL ? 'معلومات النظام' : 'System Info'}
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">{isRTL ? 'الإصدار' : 'Version'}</span>
                  <span className="font-semibold">1.0.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">{isRTL ? 'آخر تحديث' : 'Last Update'}</span>
                  <span className="font-semibold text-sm">
                    {new Date(stats.lastUpdate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">{isRTL ? 'صحة النظام' : 'System Health'}</span>
                  <span className="font-semibold">{stats.systemHealth}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {isRTL 
                ? '© 2025 نظام نوفل الهندسي. جميع الحقوق محفوظة.'
                : '© 2025 NOUFAL Engineering System. All rights reserved.'}
            </p>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600">
                {isRTL ? 'المساعدة' : 'Help'}
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600">
                {isRTL ? 'الدعم' : 'Support'}
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600">
                {isRTL ? 'التوثيق' : 'Documentation'}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UnifiedDashboard;
