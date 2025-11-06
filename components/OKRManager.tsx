import React, { useState, useEffect } from 'react';
import {
  Target, Plus, Filter, Calendar, TrendingUp, CheckCircle,
  Clock, Flag, Users, Edit, Trash2, Eye, BarChart2, Award,
  AlertCircle, ArrowRight, ChevronDown, Search, X
} from '../lucide-icons';

interface KeyResult {
  id: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  status: 'on-track' | 'at-risk' | 'off-track';
}

interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'short-term' | 'long-term' | 'quarterly' | 'annual';
  priority: 'high' | 'medium' | 'low';
  category: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold';
  progress: number;
  startDate: string;
  endDate: string;
  owner: string;
  keyResults: KeyResult[];
  tags: string[];
}

export const OKRManager: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Weekly Progress Review',
      description: 'Review project progress on a weekly basis',
      type: 'short-term',
      priority: 'high',
      category: 'Project',
      status: 'in-progress',
      progress: 75,
      startDate: '2025-01-01',
      endDate: '2025-03-31',
      owner: 'Ahmed Nageh',
      keyResults: [
        { id: 'kr1', description: 'Complete 4 reviews', target: 4, current: 3, unit: 'reviews', status: 'on-track' },
        { id: 'kr2', description: 'Identify 10 issues', target: 10, current: 7, unit: 'issues', status: 'on-track' }
      ],
      tags: ['Review', 'Weekly']
    },
    {
      id: '2',
      title: 'Define Main Project Objectives',
      description: 'Establish clear objectives for the project',
      type: 'long-term',
      priority: 'high',
      category: 'Project',
      status: 'in-progress',
      progress: 60,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      owner: 'Ahmed Nageh',
      keyResults: [
        { id: 'kr3', description: 'Define 5 main objectives', target: 5, current: 3, unit: 'objectives', status: 'on-track' },
        { id: 'kr4', description: 'Get stakeholder approval', target: 1, current: 0, unit: 'approvals', status: 'at-risk' }
      ],
      tags: ['Planning', 'Strategy']
    },
    {
      id: '3',
      title: 'Improve Problem-Solving',
      description: 'Enhance team problem-solving capabilities',
      type: 'long-term',
      priority: 'high',
      category: 'Project',
      status: 'in-progress',
      progress: 45,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      owner: 'Ahmed Nageh',
      keyResults: [
        { id: 'kr5', description: 'Conduct 6 training sessions', target: 6, current: 2, unit: 'sessions', status: 'on-track' },
        { id: 'kr6', description: 'Reduce issues by 30%', target: 30, current: 15, unit: '%', status: 'on-track' }
      ],
      tags: ['Training', 'Quality']
    },
    {
      id: '4',
      title: 'Identify Key Engineering Results',
      description: 'Identify and document key engineering metrics',
      type: 'short-term',
      priority: 'medium',
      category: 'Project',
      status: 'not-started',
      progress: 0,
      startDate: '2025-02-01',
      endDate: '2025-04-30',
      owner: 'Ahmed Nageh',
      keyResults: [
        { id: 'kr7', description: 'Define 10 KPIs', target: 10, current: 0, unit: 'KPIs', status: 'off-track' },
        { id: 'kr8', description: 'Create dashboard', target: 1, current: 0, unit: 'dashboard', status: 'off-track' }
      ],
      tags: ['Metrics', 'KPI']
    },
    {
      id: '5',
      title: 'Document Achievements and Challenges',
      description: 'Maintain comprehensive documentation',
      type: 'short-term',
      priority: 'low',
      category: 'Project',
      status: 'not-started',
      progress: 0,
      startDate: '2025-03-01',
      endDate: '2025-05-31',
      owner: 'Ahmed Nageh',
      keyResults: [
        { id: 'kr9', description: 'Write 20 reports', target: 20, current: 0, unit: 'reports', status: 'off-track' },
        { id: 'kr10', description: 'Update wiki weekly', target: 12, current: 0, unit: 'updates', status: 'off-track' }
      ],
      tags: ['Documentation', 'Reports']
    }
  ]);

  const [view, setView] = useState<'kanban' | 'table' | 'calendar'>('kanban');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const columns = [
    { id: 'not-started', title: 'لم يبدأ', color: 'bg-gray-100', count: 0 },
    { id: 'short-term', title: 'قصير المدى', color: 'bg-blue-100', count: 1 },
    { id: 'long-term', title: 'طويل المدى', color: 'bg-green-100', count: 3 },
    { id: 'completed', title: 'مكتمل', color: 'bg-purple-100', count: 1 }
  ];

  const getGoalsByColumn = (columnId: string) => {
    return goals.filter(goal => {
      // Filter by column type
      let matchesColumn = false;
      if (columnId === 'not-started') matchesColumn = goal.status === 'not-started';
      else if (columnId === 'short-term') matchesColumn = goal.type === 'short-term' && goal.status !== 'not-started';
      else if (columnId === 'long-term') matchesColumn = goal.type === 'long-term' && goal.status !== 'not-started';
      else if (columnId === 'completed') matchesColumn = goal.status === 'completed';

      // Apply filters
      const matchesType = filterType === 'all' || goal.type === filterType;
      const matchesPriority = filterPriority === 'all' || goal.priority === filterPriority;
      const matchesSearch = searchQuery === '' || 
        goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesColumn && matchesType && matchesPriority && matchesSearch;
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'text-green-600';
      case 'at-risk': return 'text-yellow-600';
      case 'off-track': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const calculateOverallStats = () => {
    const total = goals.length;
    const completed = goals.filter(g => g.status === 'completed').length;
    const inProgress = goals.filter(g => g.status === 'in-progress').length;
    const notStarted = goals.filter(g => g.status === 'not-started').length;
    const avgProgress = goals.reduce((sum, g) => sum + g.progress, 0) / total;

    return { total, completed, inProgress, notStarted, avgProgress };
  };

  const stats = calculateOverallStats();

  return (
    <div className="h-full bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🎯 إدارة الأهداف و OKRs</h1>
        <p className="text-gray-600">حدد أهدافك وتتبع تقدمك بطريقة منظمة</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">إجمالي الأهداف</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <Target className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">قيد التنفيذ</p>
              <p className="text-2xl font-bold text-green-600">{stats.inProgress}</p>
            </div>
            <TrendingUp className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">مكتملة</p>
              <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
            </div>
            <CheckCircle className="text-purple-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">متوسط التقدم</p>
              <p className="text-2xl font-bold text-orange-600">{stats.avgProgress.toFixed(0)}%</p>
            </div>
            <BarChart2 className="text-orange-500" size={32} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Add Goal Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
          >
            <Plus size={20} />
            إضافة هدف جديد
          </button>

          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="بحث عن الأهداف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* View Switcher */}
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('kanban')}
              className={`px-4 py-2 rounded-lg transition ${
                view === 'kanban' ? 'bg-white shadow' : 'hover:bg-gray-200'
              }`}
            >
              📋 Kanban
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-4 py-2 rounded-lg transition ${
                view === 'table' ? 'bg-white shadow' : 'hover:bg-gray-200'
              }`}
            >
              📊 جدول
            </button>
          </div>

          {/* Filters */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">كل الأنواع</option>
            <option value="short-term">قصير المدى</option>
            <option value="long-term">طويل المدى</option>
            <option value="quarterly">ربع سنوي</option>
            <option value="annual">سنوي</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">كل الأولويات</option>
            <option value="high">🔴 عالي</option>
            <option value="medium">🟡 متوسط</option>
            <option value="low">🟢 منخفض</option>
          </select>
        </div>
      </div>

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {columns.map((column) => {
            const columnGoals = getGoalsByColumn(column.id);
            
            return (
              <div key={column.id} className="bg-gray-100 rounded-lg p-4">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    {column.title}
                    <span className="bg-white px-2 py-1 rounded text-sm">
                      {columnGoals.length}
                    </span>
                  </h3>
                  <button className="text-gray-600 hover:text-gray-800">
                    <Plus size={20} />
                  </button>
                </div>

                {/* Goal Cards */}
                <div className="space-y-3">
                  {columnGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="bg-white rounded-lg p-4 shadow hover:shadow-lg transition cursor-pointer"
                      onClick={() => setSelectedGoal(goal)}
                    >
                      {/* Goal Title */}
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {goal.title}
                      </h4>

                      {/* Labels */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${column.color}`}>
                          {goal.type === 'short-term' ? 'Short-term' : 'Long-term'}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(goal.priority)}`}>
                          {getPriorityIcon(goal.priority)} {goal.priority}
                        </span>
                        {goal.category && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                            {goal.category}
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {goal.progress > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>التقدم</span>
                            <span>{goal.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 rounded-full h-2 transition-all"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Key Results Count */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Target size={16} />
                        <span>{goal.keyResults.length} نتائج رئيسية</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Card Button */}
                {columnGoals.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <Plus size={32} className="mx-auto mb-2" />
                    <p className="text-sm">لا توجد أهداف هنا</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {view === 'table' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الهدف</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الأولوية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التقدم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المسؤول</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الموعد</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {goals.map((goal) => (
                <tr key={goal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">{goal.title}</div>
                    <div className="text-sm text-gray-600">{goal.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                      {goal.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(goal.priority)}`}>
                      {getPriorityIcon(goal.priority)} {goal.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                      goal.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {goal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 rounded-full h-2"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{goal.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{goal.owner}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{goal.endDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedGoal(goal)}
                        className="text-blue-600 hover:text-blue-800"
                        title="عرض"
                      >
                        <Eye size={18} />
                      </button>
                      <button className="text-green-600 hover:text-green-800" title="تعديل">
                        <Edit size={18} />
                      </button>
                      <button className="text-red-600 hover:text-red-800" title="حذف">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Goal Details Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedGoal.title}</h2>
                  <p className="text-gray-600">{selectedGoal.description}</p>
                </div>
                <button
                  onClick={() => setSelectedGoal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Goal Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">النوع</p>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-semibold">
                    {selectedGoal.type}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">الأولوية</p>
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${getPriorityColor(selectedGoal.priority)}`}>
                    {getPriorityIcon(selectedGoal.priority)} {selectedGoal.priority}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">المسؤول</p>
                  <p className="font-semibold">{selectedGoal.owner}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">الفترة الزمنية</p>
                  <p className="font-semibold">{selectedGoal.startDate} - {selectedGoal.endDate}</p>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-800">التقدم الإجمالي</p>
                  <span className="text-2xl font-bold text-blue-600">{selectedGoal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 rounded-full h-4 transition-all"
                    style={{ width: `${selectedGoal.progress}%` }}
                  />
                </div>
              </div>

              {/* Key Results */}
              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-4">النتائج الرئيسية (KRs)</h3>
                <div className="space-y-4">
                  {selectedGoal.keyResults.map((kr) => (
                    <div key={kr.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-gray-800">{kr.description}</p>
                        <span className={`text-sm font-semibold ${getStatusColor(kr.status)}`}>
                          {kr.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>الهدف: {kr.target} {kr.unit}</span>
                        <span>الحالي: {kr.current} {kr.unit}</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`rounded-full h-2 transition-all ${
                            kr.status === 'on-track' ? 'bg-green-600' :
                            kr.status === 'at-risk' ? 'bg-yellow-600' :
                            'bg-red-600'
                          }`}
                          style={{ width: `${(kr.current / kr.target) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
