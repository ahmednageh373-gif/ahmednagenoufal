/**
 * 🚀 نظام NOUFAL المطور للمشاريع الهندسية
 * NOUFAL Enhanced System for Engineering Projects
 * 
 * التاريخ: 4 نوفمبر 2025
 * الإصدار: 2.0 - Enhanced
 */

import React, { useState, useEffect } from 'react';
import {
  Home, Calendar, DollarSign, AlertTriangle, MapPin, FileText, 
  Menu, X, Bell, Search, Settings, Users, TrendingUp, BarChart3,
  CheckCircle, Clock, Zap, Target, Award, Activity, Download,
  MessageSquare, Shield, Briefcase, Database, ChevronRight,
  Star, ThumbsUp, Eye, ArrowUp, ArrowDown
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'delayed';
  progress: number;
  budget: number;
  spent: number;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  team: number;
  tasks: number;
  completedTasks: number;
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface Stats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  spentBudget: number;
  teamMembers: number;
  tasksCompleted: number;
  efficiency: number;
}

export default function NOUFALEnhanced() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: 'تأخر في المشروع',
      message: 'مشروع برج الرياض متأخر 3 أيام عن الجدول',
      time: 'منذ ساعتين',
      read: false
    },
    {
      id: '2',
      type: 'success',
      title: 'اكتمال مرحلة',
      message: 'تم إكمال مرحلة الأساسات في مشروع الفيلا',
      time: 'منذ 4 ساعات',
      read: false
    },
    {
      id: '3',
      type: 'info',
      title: 'اجتماع جديد',
      message: 'اجتماع مراجعة المشروع غداً الساعة 10 صباحاً',
      time: 'منذ يوم',
      read: true
    }
  ]);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'برج الرياض التجاري',
      status: 'active',
      progress: 68,
      budget: 15000000,
      spent: 10200000,
      dueDate: '2025-12-31',
      priority: 'high',
      team: 45,
      tasks: 120,
      completedTasks: 82
    },
    {
      id: '2',
      name: 'مجمع الفلل السكنية',
      status: 'active',
      progress: 45,
      budget: 8500000,
      spent: 3825000,
      dueDate: '2026-06-30',
      priority: 'medium',
      team: 28,
      tasks: 85,
      completedTasks: 38
    },
    {
      id: '3',
      name: 'مشروع المدينة الصناعية',
      status: 'active',
      progress: 92,
      budget: 25000000,
      spent: 23000000,
      dueDate: '2025-11-15',
      priority: 'high',
      team: 72,
      tasks: 200,
      completedTasks: 184
    },
    {
      id: '4',
      name: 'تطوير المركز التجاري',
      status: 'pending',
      progress: 12,
      budget: 12000000,
      spent: 1440000,
      dueDate: '2026-08-20',
      priority: 'low',
      team: 15,
      tasks: 95,
      completedTasks: 11
    }
  ]);

  const stats: Stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
    spentBudget: projects.reduce((sum, p) => sum + p.spent, 0),
    teamMembers: projects.reduce((sum, p) => sum + p.team, 0),
    tasksCompleted: projects.reduce((sum, p) => sum + p.completedTasks, 0),
    efficiency: 85
  };

  const navigation = [
    { id: 'dashboard', name: 'لوحة التحكم', icon: Home },
    { id: 'projects', name: 'المشاريع', icon: Briefcase },
    { id: 'schedule', name: 'الجدول الزمني', icon: Calendar },
    { id: 'financial', name: 'الإدارة المالية', icon: DollarSign },
    { id: 'team', name: 'الفريق', icon: Users },
    { id: 'analytics', name: 'التحليلات', icon: BarChart3 },
    { id: 'risks', name: 'إدارة المخاطر', icon: AlertTriangle },
    { id: 'quality', name: 'الجودة', icon: Shield },
    { id: 'docs', name: 'المستندات', icon: FileText },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'delayed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header with Welcome Message */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">مرحباً بك في نظام NOUFAL</h1>
            <p className="text-xl opacity-90 mb-4">نظام إدارة المشاريع الهندسية المتكامل - الإصدار المطور 2.0</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date().toLocaleDateString('ar-SA')}
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-4 h-4" />
                النظام يعمل بكفاءة {stats.efficiency}%
              </span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Zap className="w-16 h-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="إجمالي المشاريع"
          value={stats.totalProjects.toString()}
          subtitle={`${stats.activeProjects} نشط`}
          icon={Briefcase}
          color="blue"
          trend="+12%"
          trendUp={true}
        />
        <StatsCard
          title="الميزانية الكلية"
          value={`${(stats.totalBudget / 1000000).toFixed(1)}M`}
          subtitle={`تم إنفاق ${((stats.spentBudget / stats.totalBudget) * 100).toFixed(0)}%`}
          icon={DollarSign}
          color="green"
          trend="+8%"
          trendUp={true}
        />
        <StatsCard
          title="أعضاء الفريق"
          value={stats.teamMembers.toString()}
          subtitle="عضو نشط"
          icon={Users}
          color="purple"
          trend="+5%"
          trendUp={true}
        />
        <StatsCard
          title="المهام المكتملة"
          value={stats.tasksCompleted.toString()}
          subtitle="من إجمالي المهام"
          icon={CheckCircle}
          color="orange"
          trend="+15%"
          trendUp={true}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          إجراءات سريعة
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton icon={FileText} label="إنشاء مشروع" color="blue" />
          <QuickActionButton icon={Users} label="إضافة عضو" color="green" />
          <QuickActionButton icon={Download} label="تصدير تقرير" color="purple" />
          <QuickActionButton icon={Settings} label="الإعدادات" color="gray" />
        </div>
      </div>

      {/* Projects Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Projects */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              المشاريع النشطة
            </span>
            <span className="text-sm text-blue-600 cursor-pointer hover:underline">عرض الكل</span>
          </h2>
          <div className="space-y-3">
            {projects.filter(p => p.status === 'active').slice(0, 3).map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            النشاطات الأخيرة
          </h2>
          <div className="space-y-4">
            {notifications.slice(0, 4).map(notif => (
              <ActivityItem key={notif.id} notification={notif} />
            ))}
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          مؤشرات الأداء
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PerformanceMetric
            label="معدل الإنجاز"
            value={68}
            max={100}
            color="blue"
            unit="%"
          />
          <PerformanceMetric
            label="الكفاءة التشغيلية"
            value={85}
            max={100}
            color="green"
            unit="%"
          />
          <PerformanceMetric
            label="رضا العملاء"
            value={92}
            max={100}
            color="purple"
            unit="%"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex" dir="rtl">
      {/* Sidebar */}
      <aside className={`
        fixed top-0 right-0 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700
        transition-all duration-300 z-50 shadow-2xl
        ${isSidebarOpen ? 'w-64' : 'w-0 md:w-20'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-3 ${!isSidebarOpen && 'md:justify-center'}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                {isSidebarOpen && (
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">NOUFAL</h1>
                    <p className="text-xs text-gray-500">v2.0 Enhanced</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden text-gray-600 dark:text-gray-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-2">
              {navigation.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${activeView === item.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                    ${!isSidebarOpen && 'md:justify-center'}
                  `}
                  title={!isSidebarOpen ? item.name : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {isSidebarOpen && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* User Profile */}
          {isSidebarOpen && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">أحمد ناجح</p>
                  <p className="text-xs text-gray-500">مدير المشاريع</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:mr-64' : 'md:mr-20'}`}>
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              {/* Search Bar */}
              <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 w-96">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث عن مشروع، مهمة، أو عضو..."
                  className="bg-transparent border-none outline-none flex-1 text-sm text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg">
                <Bell className="w-6 h-6" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Settings */}
              <button className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg">
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {activeView === 'dashboard' && renderDashboard()}
          {activeView !== 'dashboard' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                قسم {navigation.find(n => n.id === activeView)?.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                سيتم تطوير هذا القسم قريباً...
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Helper Components

interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  trend: string;
  trendUp: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, icon: Icon, color, trend, trendUp }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  }[color];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className={`flex items-center gap-1 text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trendUp ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          {trend}
        </span>
      </div>
      <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
    </div>
  );
};

interface QuickActionButtonProps {
  icon: React.ElementType;
  label: string;
  color: string;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon: Icon, label, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400',
    gray: 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-400',
  }[color];

  return (
    <button className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all ${colorClasses}`}>
      <Icon className="w-6 h-6" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{project.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {project.team} أعضاء • {project.completedTasks}/{project.tasks} مهمة
          </p>
        </div>
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{project.progress}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
          style={{ width: `${project.progress}%` }}
        />
      </div>
    </div>
  );
};

const ActivityItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  const iconMap = {
    info: MessageSquare,
    warning: AlertTriangle,
    success: CheckCircle,
    error: AlertTriangle,
  };
  
  const Icon = iconMap[notification.type];

  return (
    <div className="flex items-start gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        notification.type === 'success' ? 'bg-green-100 dark:bg-green-900' :
        notification.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900' :
        notification.type === 'error' ? 'bg-red-100 dark:bg-red-900' :
        'bg-blue-100 dark:bg-blue-900'
      }`}>
        <Icon className={`w-4 h-4 ${
          notification.type === 'success' ? 'text-green-600 dark:text-green-400' :
          notification.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
          notification.type === 'error' ? 'text-red-600 dark:text-red-400' :
          'text-blue-600 dark:text-blue-400'
        }`} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.message}</p>
        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
      </div>
    </div>
  );
};

interface PerformanceMetricProps {
  label: string;
  value: number;
  max: number;
  color: string;
  unit: string;
}

const PerformanceMetric: React.FC<PerformanceMetricProps> = ({ label, value, max, color, unit }) => {
  const percentage = (value / max) * 100;
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
  }[color];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-lg font-bold text-gray-900 dark:text-white">{value}{unit}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
        <div
          className={`bg-gradient-to-r ${colorClasses} h-3 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
