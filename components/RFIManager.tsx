import React, { useState } from 'react';
import {
  HelpCircle,
  Plus,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  User,
  Calendar
} from 'lucide-react';

export const RFIManager: React.FC = () => {
  const [activeView, setActiveView] = useState<'list' | 'create' | 'detail'>('list');
  const [projectId, setProjectId] = useState('1');
  const [loading, setLoading] = useState(false);
  const [rfis, setRfis] = useState<any[]>([]);

  const [newRFI, setNewRFI] = useState({
    subject: '',
    description: '',
    discipline: 'structural',
    priority: 'medium',
    due_date: ''
  });

  const disciplines = [
    { value: 'structural', label: 'إنشائي' },
    { value: 'architectural', label: 'معماري' },
    { value: 'mep', label: 'كهروميكانيكي' },
    { value: 'civil', label: 'مدني' },
  ];

  const priorities = [
    { value: 'low', label: 'منخفضة', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'متوسطة', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'عالية', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'حرجة', color: 'bg-red-100 text-red-800' },
  ];

  const statuses = [
    { value: 'draft', label: 'مسودة', icon: FileText, color: 'text-gray-600' },
    { value: 'submitted', label: 'مرسل', icon: Send, color: 'text-blue-600' },
    { value: 'in_review', label: 'قيد المراجعة', icon: Clock, color: 'text-yellow-600' },
    { value: 'answered', label: 'تمت الإجابة', icon: CheckCircle, color: 'text-green-600' },
    { value: 'closed', label: 'مغلق', icon: CheckCircle, color: 'text-gray-600' },
  ];

  const createRFI = async () => {
    setLoading(true);
    try {
      const API_BASE = window.location.origin.replace('3000', '5000');
      const response = await fetch(`${API_BASE}/api/rfi/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: parseInt(projectId),
          submitted_by: 1,
          ...newRFI
        })
      });

      const result = await response.json();
      if (result.success) {
        setActiveView('list');
        setNewRFI({
          subject: '',
          description: '',
          discipline: 'structural',
          priority: 'medium',
          due_date: ''
        });
      }
    } catch (err) {
      console.error('Error creating RFI:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          طلبات المعلومات (RFI)
        </h2>
        <button
          onClick={() => setActiveView('create')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          طلب جديد
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statuses.map((status) => {
          const Icon = status.icon;
          return (
            <div key={status.value} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-5 h-5 ${status.color}`} />
                <span className="text-sm text-gray-600 dark:text-gray-400">{status.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.floor(Math.random() * 10)}
              </p>
            </div>
          );
        })}
      </div>

      {/* RFI List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                الرقم
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                الموضوع
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                التخصص
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                الأولوية
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                تاريخ الاستحقاق
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                RFI-001
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                توضيح أبعاد القواعد
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                إنشائي
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                  عالية
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  قيد المراجعة
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                2024-12-15
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                RFI-002
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                تفاصيل نظام التكييف
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                كهروميكانيكي
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  متوسطة
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  تمت الإجابة
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                2024-12-10
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCreate = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setActiveView('list')}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          ← رجوع
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          طلب معلومات جديد
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            الموضوع *
          </label>
          <input
            type="text"
            value={newRFI.subject}
            onChange={(e) => setNewRFI({ ...newRFI, subject: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="موضوع طلب المعلومات"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            الوصف التفصيلي *
          </label>
          <textarea
            value={newRFI.description}
            onChange={(e) => setNewRFI({ ...newRFI, description: e.target.value })}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="اكتب وصفاً تفصيلياً للمعلومات المطلوبة..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              التخصص *
            </label>
            <select
              value={newRFI.discipline}
              onChange={(e) => setNewRFI({ ...newRFI, discipline: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {disciplines.map((disc) => (
                <option key={disc.value} value={disc.value}>
                  {disc.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              الأولوية *
            </label>
            <select
              value={newRFI.priority}
              onChange={(e) => setNewRFI({ ...newRFI, priority: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {priorities.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              تاريخ الاستحقاق
            </label>
            <input
              type="date"
              value={newRFI.due_date}
              onChange={(e) => setNewRFI({ ...newRFI, due_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={createRFI}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            <Send className="w-5 h-5" />
            {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
          </button>
          <button
            onClick={() => setActiveView('list')}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <HelpCircle className="w-8 h-8" />
          إدارة طلبات المعلومات (RFI)
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          نظام إلكتروني لإدارة طلبات المعلومات والاستفسارات الفنية
        </p>
      </div>

      {/* Project Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          المشروع الحالي
        </label>
        <input
          type="text"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="معرف المشروع"
        />
      </div>

      {/* Content */}
      {activeView === 'list' && renderList()}
      {activeView === 'create' && renderCreate()}
    </div>
  );
};

export default RFIManager;
