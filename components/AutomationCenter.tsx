import React, { useState, useEffect } from 'react';
import {
  Zap, Plus, Search, Filter, Play, Pause, Trash2, Edit, Copy,
  Calendar, Tag, CheckSquare, Bell, Mail, Users, FolderOpen,
  Clock, Activity, TrendingUp, AlertCircle, CheckCircle
} from '../lucide-icons';

interface Automation {
  id: number;
  name: string;
  description: string;
  trigger_type: string;
  trigger_config: any;
  conditions: any[];
  actions: any[];
  is_active: boolean;
  execution_count: number;
  last_executed: string | null;
  created_at: string;
}

interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  template: any;
}

export const AutomationCenter: React.FC = () => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [templates, setTemplates] = useState<{ [key: string]: AutomationTemplate[] }>({});
  const [activeTab, setActiveTab] = useState<'my-automations' | 'templates' | 'create'>('templates');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = 'https://5000-i8ngr18dc7uqtnynq0d23-b9b802c4.sandbox.novita.ai';

  useEffect(() => {
    loadAutomations();
    loadTemplates();
    loadStats();
  }, []);

  const loadAutomations = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/automations`);
      const data = await response.json();
      if (data.success) {
        setAutomations(data.automations);
      }
    } catch (error) {
      console.error('Error loading automations:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/automation-templates`);
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/automations/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const toggleAutomation = async (automationId: number, isActive: boolean) => {
    try {
      const response = await fetch(`${API_BASE}/api/automations/${automationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive })
      });
      
      const data = await response.json();
      if (data.success) {
        loadAutomations();
      }
    } catch (error) {
      console.error('Error toggling automation:', error);
    }
  };

  const deleteAutomation = async (automationId: number) => {
    if (!confirm('هل تريد حذف هذه الأتمتة؟')) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/automations/${automationId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        loadAutomations();
      }
    } catch (error) {
      console.error('Error deleting automation:', error);
    }
  };

  const createFromTemplate = async (template: AutomationTemplate) => {
    try {
      const automationData = {
        name: template.name,
        description: template.description,
        ...template.template,
        created_by: 'current_user@example.com'
      };

      const response = await fetch(`${API_BASE}/api/automations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(automationData)
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ تم إنشاء الأتمتة بنجاح!');
        setActiveTab('my-automations');
        loadAutomations();
      }
    } catch (error) {
      console.error('Error creating automation:', error);
      alert('❌ حدث خطأ أثناء إنشاء الأتمتة');
    }
  };

  const getTriggerIcon = (triggerType: string) => {
    const icons: { [key: string]: any } = {
      'DATE_ARRIVES': Clock,
      'STATUS_CHANGES': Tag,
      'ITEM_CREATED': Plus,
      'ITEM_DELETED': Trash2,
      'ATTRIBUTE_VALUE_CHANGES': Edit,
      'FORM_SUBMITTED': CheckSquare,
      'BUTTON_CLICKED': Play,
      'EVERY_TIME_PERIOD': Calendar
    };
    return icons[triggerType] || Zap;
  };

  const getActionIcon = (actionType: string) => {
    const icons: { [key: string]: any } = {
      'SEND_NOTIFICATION': Bell,
      'SEND_EMAIL': Mail,
      'CREATE_ITEM': Plus,
      'UPDATE_ITEM': Edit,
      'MOVE_ITEM': FolderOpen,
      'ASSIGN_MEMBERS': Users,
      'CHANGE_STATUS': Tag,
      'LEAVE_COMMENT': Edit
    };
    return icons[actionType] || Zap;
  };

  const categories = [
    { id: 'all', name: 'جميع القوالب', icon: '📋' },
    { id: 'reminders', name: 'التذكيرات', icon: '⏰' },
    { id: 'recurring', name: 'المتكررة', icon: '🔄' },
    { id: 'ifttt', name: 'إذا-ثم', icon: '⚡' },
    { id: 'forms', name: 'النماذج', icon: '📝' },
    { id: 'notifications', name: 'الإشعارات', icon: '🔔' },
    { id: 'engineering', name: 'الهندسية', icon: '🏗️' }
  ];

  return (
    <div className="h-full bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">⚡ مركز الأتمتة</h1>
        <p className="text-gray-600">أتمت مهامك ووفر الوقت مع قوالب جاهزة وسهلة</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي التنفيذات</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total_executions || 0}</p>
              </div>
              <Activity className="text-blue-500" size={32} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">نجحت</p>
                <p className="text-2xl font-bold text-green-600">{stats.successful || 0}</p>
              </div>
              <CheckCircle className="text-green-500" size={32} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">فشلت</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed || 0}</p>
              </div>
              <AlertCircle className="text-red-500" size={32} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">متوسط الوقت</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.avg_execution_time ? `${stats.avg_execution_time.toFixed(0)}ms` : '0ms'}
                </p>
              </div>
              <TrendingUp className="text-purple-500" size={32} />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 px-6 py-3 font-semibold transition ${
              activeTab === 'templates'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            📚 قوالب الأتمتة
          </button>
          <button
            onClick={() => setActiveTab('my-automations')}
            className={`flex-1 px-6 py-3 font-semibold transition ${
              activeTab === 'my-automations'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            ⚙️ أتمتاتي ({automations.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 px-6 py-3 font-semibold transition ${
              activeTab === 'create'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            ➕ إنشاء جديد
          </button>
        </div>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div>
          {/* Category Filter */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(templates).map(([category, categoryTemplates]) => {
              if (selectedCategory !== 'all' && selectedCategory !== category) return null;
              
              return categoryTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{template.icon}</div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {template.category}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-800 mb-2">
                    {template.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {template.description}
                  </p>
                  
                  {/* Automation Flow Visual */}
                  <div className="flex items-center gap-2 mb-4 text-xs">
                    <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded">
                      {React.createElement(getTriggerIcon(template.template.trigger.type), { size: 14 })}
                      <span>Trigger</span>
                    </div>
                    <span className="text-gray-400">→</span>
                    {template.template.conditions && template.template.conditions.length > 0 && (
                      <>
                        <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                          If
                        </div>
                        <span className="text-gray-400">→</span>
                      </>
                    )}
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded">
                      {React.createElement(getActionIcon(template.template.actions[0].type), { size: 14 })}
                      <span>Action</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => createFromTemplate(template)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                  >
                    + استخدام هذا القالب
                  </button>
                </div>
              ));
            })}
          </div>
        </div>
      )}

      {/* My Automations Tab */}
      {activeTab === 'my-automations' && (
        <div className="space-y-4">
          {automations.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Zap className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد أتمتة حتى الآن</h3>
              <p className="text-gray-600 mb-4">ابدأ بإنشاء أتمتة من القوالب الجاهزة</p>
              <button
                onClick={() => setActiveTab('templates')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                عرض القوالب
              </button>
            </div>
          ) : (
            automations.map((automation) => (
              <div
                key={automation.id}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-gray-800">{automation.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded ${
                        automation.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {automation.is_active ? '✅ نشط' : '⏸️ متوقف'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{automation.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>🔄 نُفذت {automation.execution_count} مرة</span>
                      {automation.last_executed && (
                        <span>🕐 آخر تنفيذ: {new Date(automation.last_executed).toLocaleString('ar')}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAutomation(automation.id, automation.is_active)}
                      className={`p-2 rounded-lg transition ${
                        automation.is_active
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                      title={automation.is_active ? 'إيقاف' : 'تشغيل'}
                    >
                      {automation.is_active ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    
                    <button
                      onClick={() => deleteAutomation(automation.id)}
                      className="p-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition"
                      title="حذف"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Tab */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <Plus className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">إنشاء أتمتة مخصصة</h3>
            <p className="text-gray-600 mb-6">
              قريباً! سيتم إضافة واجهة إنشاء الأتمتة المخصصة مع drag-and-drop builder
            </p>
            <button
              onClick={() => setActiveTab('templates')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              في الوقت الحالي، استخدم القوالب الجاهزة
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
