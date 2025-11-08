import React, { useState, useEffect } from 'react';
import {
  Workflow,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Database,
  Link,
  Zap
} from 'lucide-react';

export const IntegrationMonitor: React.FC = () => {
  const [projectId, setProjectId] = useState('1');
  const [status, setStatus] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadIntegrationStatus = async () => {
    setLoading(true);
    try {
      const API_BASE = window.location.origin.replace('3000', '5000');
      const response = await fetch(
        `${API_BASE}/api/integration/status/${projectId}`
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStatus(result.status);
          setEvents(result.events || []);
        }
      }
    } catch (err) {
      console.error('Error loading integration status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrationStatus();
    const interval = setInterval(loadIntegrationStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [projectId]);

  const modules = [
    { id: 'boq', name: 'المقايسات', icon: Database, color: 'bg-blue-500' },
    { id: 'schedule', name: 'الجدول الزمني', icon: Clock, color: 'bg-green-500' },
    { id: 'procurement', name: 'المشتريات', icon: Link, color: 'bg-purple-500' },
    { id: 'financials', name: 'المالية', icon: Activity, color: 'bg-orange-500' },
    { id: 'resources', name: 'الموارد', icon: Zap, color: 'bg-yellow-500' },
  ];

  const eventTypes = [
    { type: 'boq_updated', label: 'تحديث المقايسات', icon: Database, color: 'text-blue-600' },
    { type: 'schedule_updated', label: 'تحديث الجدول', icon: Clock, color: 'text-green-600' },
    { type: 'procurement_updated', label: 'تحديث المشتريات', icon: Link, color: 'text-purple-600' },
    { type: 'sync_completed', label: 'اكتمال المزامنة', icon: CheckCircle, color: 'text-green-600' },
    { type: 'sync_failed', label: 'فشل المزامنة', icon: AlertCircle, color: 'text-red-600' },
  ];

  const getEventIcon = (eventType: string) => {
    const event = eventTypes.find(e => e.type === eventType);
    return event || { icon: Activity, color: 'text-gray-600', label: eventType };
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Workflow className="w-8 h-8" />
          مراقبة التكامل بين الوحدات
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          مراقبة حالة التكامل والمزامنة بين جميع أنظمة المشروع
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              المشروع
            </label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="معرف المشروع"
            />
          </div>
          <button
            onClick={loadIntegrationStatus}
            disabled={loading}
            className="mt-6 flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>
      </div>

      {/* Module Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {modules.map((module) => {
          const Icon = module.icon;
          const moduleStatus = status?.modules?.[module.id] || 'unknown';
          
          return (
            <div key={module.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${module.color} rounded-full p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {moduleStatus === 'active' ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : moduleStatus === 'syncing' ? (
                  <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                ) : moduleStatus === 'error' ? (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                ) : (
                  <Clock className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {module.name}
              </h3>
              <p className={`text-sm ${
                moduleStatus === 'active' ? 'text-green-600' :
                moduleStatus === 'syncing' ? 'text-blue-600' :
                moduleStatus === 'error' ? 'text-red-600' :
                'text-gray-600 dark:text-gray-400'
              }`}>
                {moduleStatus === 'active' ? 'نشط' :
                 moduleStatus === 'syncing' ? 'جاري المزامنة' :
                 moduleStatus === 'error' ? 'خطأ' : 'غير معروف'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Integration Summary */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-6 h-6 text-blue-600" />
              <h3 className="text-sm text-gray-600 dark:text-gray-400">إجمالي الأحداث</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {status.total_events || 0}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-sm text-gray-600 dark:text-gray-400">مزامنات ناجحة</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {status.successful_syncs || 0}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-sm text-gray-600 dark:text-gray-400">أخطاء</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {status.failed_syncs || 0}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-blue-600" />
              <h3 className="text-sm text-gray-600 dark:text-gray-400">آخر تحديث</h3>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {status.last_sync ? new Date(status.last_sync).toLocaleString('ar-SA') : 'لا يوجد'}
            </p>
          </div>
        </div>
      )}

      {/* Integration Flow Diagram */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          مخطط التدفق
        </h2>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <React.Fragment key={module.id}>
                <div className="flex flex-col items-center">
                  <div className={`${module.color} rounded-lg p-4 mb-2`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {module.name}
                  </span>
                </div>
                {index < modules.length - 1 && (
                  <div className="flex items-center">
                    <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                    <Zap className="w-5 h-5 text-blue-600 mx-2" />
                    <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Event Log */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          سجل الأحداث
        </h2>
        
        {events.length > 0 ? (
          <div className="space-y-3">
            {events.slice(0, 20).map((event, index) => {
              const eventInfo = getEventIcon(event.event_type);
              const EventIcon = eventInfo.icon;
              
              return (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className={`p-2 rounded-full bg-white dark:bg-gray-800 ${eventInfo.color}`}>
                    <EventIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {eventInfo.label}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {event.timestamp ? new Date(event.timestamp).toLocaleString('ar-SA') : ''}
                      </span>
                    </div>
                    {event.data && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {JSON.stringify(event.data).substring(0, 100)}...
                      </p>
                    )}
                    {event.status && (
                      <span className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full ${
                        event.status === 'completed' ? 'bg-green-100 text-green-800' :
                        event.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {event.status === 'completed' ? 'مكتمل' :
                         event.status === 'failed' ? 'فشل' : 'جاري المعالجة'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              لا توجد أحداث للعرض
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegrationMonitor;
