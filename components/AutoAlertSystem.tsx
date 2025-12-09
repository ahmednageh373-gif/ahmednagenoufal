/**
 * ═══════════════════════════════════════════════════════════════
 * نظام التنبيهات الآلية (Auto Alert System)
 * يراقب مؤشرات EVM ويرسل تنبيهات عند تجاوز الحدود
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle,
  X,
  Settings,
  Mail,
  MessageSquare,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface AlertThresholds {
  cpiCritical: number;    // Default: 0.90
  cpiWarning: number;     // Default: 0.95
  spiCritical: number;    // Default: 0.90
  spiWarning: number;     // Default: 0.95
  costVariancePercent: number; // Default: 10%
  scheduleVariancePercent: number; // Default: 10%
}

interface Alert {
  id: string;
  timestamp: Date;
  type: 'cost' | 'schedule' | 'both' | 'milestone' | 'quality';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  activityCode?: string;
  activityName?: string;
  currentValue: number;
  thresholdValue: number;
  actionRequired: string;
  isRead: boolean;
  isSent: boolean;
}

interface NotificationChannel {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  dashboard: boolean;
}

// ═══════════════════════════════════════════════════════════════
// Alert Generator Class
// ═══════════════════════════════════════════════════════════════

class AlertGenerator {
  static generateAlert(
    type: Alert['type'],
    severity: Alert['severity'],
    title: string,
    message: string,
    currentValue: number,
    thresholdValue: number,
    actionRequired: string,
    activityCode?: string,
    activityName?: string
  ): Alert {
    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      severity,
      title,
      message,
      activityCode,
      activityName,
      currentValue,
      thresholdValue,
      actionRequired,
      isRead: false,
      isSent: false,
    };
  }

  /**
   * فحص مؤشر CPI وإنشاء تنبيه إذا لزم الأمر
   */
  static checkCPI(
    cpi: number,
    thresholds: AlertThresholds,
    activityCode?: string,
    activityName?: string
  ): Alert | null {
    if (cpi < thresholds.cpiCritical) {
      return this.generateAlert(
        'cost',
        'critical',
        '🚨 تجاوز حرج في التكلفة',
        `مؤشر أداء التكلفة (CPI) = ${cpi.toFixed(2)} أقل من ${thresholds.cpiCritical.toFixed(2)}`,
        cpi,
        thresholds.cpiCritical,
        'مراجعة عاجلة للتكاليف - طلب Variation Order - تحسين الإنتاجية',
        activityCode,
        activityName
      );
    } else if (cpi < thresholds.cpiWarning) {
      return this.generateAlert(
        'cost',
        'high',
        '⚠️ تحذير: زيادة في التكلفة',
        `مؤشر أداء التكلفة (CPI) = ${cpi.toFixed(2)} أقل من ${thresholds.cpiWarning.toFixed(2)}`,
        cpi,
        thresholds.cpiWarning,
        'مراقبة دقيقة للتكاليف - مراجعة أسعار الموردين',
        activityCode,
        activityName
      );
    }
    return null;
  }

  /**
   * فحص مؤشر SPI وإنشاء تنبيه إذا لزم الأمر
   */
  static checkSPI(
    spi: number,
    thresholds: AlertThresholds,
    activityCode?: string,
    activityName?: string
  ): Alert | null {
    if (spi < thresholds.spiCritical) {
      return this.generateAlert(
        'schedule',
        'critical',
        '🚨 تأخير حرج في الجدولة',
        `مؤشر أداء الجدولة (SPI) = ${spi.toFixed(2)} أقل من ${thresholds.spiCritical.toFixed(2)}`,
        spi,
        thresholds.spiCritical,
        'زيادة عدد الورديات - زيادة حجم الطاقم - عمل Overtime',
        activityCode,
        activityName
      );
    } else if (spi < thresholds.spiWarning) {
      return this.generateAlert(
        'schedule',
        'high',
        '⚠️ تحذير: تأخير في الجدولة',
        `مؤشر أداء الجدولة (SPI) = ${spi.toFixed(2)} أقل من ${thresholds.spiWarning.toFixed(2)}`,
        spi,
        thresholds.spiWarning,
        'تسريع المسار الحرج - مراجعة توفر الموارد',
        activityCode,
        activityName
      );
    }
    return null;
  }

  /**
   * فحص كلا المؤشرين معاً
   */
  static checkBothIndicators(
    cpi: number,
    spi: number,
    thresholds: AlertThresholds,
    activityCode?: string,
    activityName?: string
  ): Alert | null {
    if (cpi < thresholds.cpiCritical && spi < thresholds.spiCritical) {
      return this.generateAlert(
        'both',
        'critical',
        '🔥 حالة طوارئ: تجاوز حرج في التكلفة والجدولة',
        `CPI = ${cpi.toFixed(2)} و SPI = ${spi.toFixed(2)} كلاهما أقل من الحد الحرج`,
        (cpi + spi) / 2,
        (thresholds.cpiCritical + thresholds.spiCritical) / 2,
        'اجتماع طوارئ فوري - إعادة تخطيط المشروع - طلب دعم إداري',
        activityCode,
        activityName
      );
    }
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// Alert Card Component
// ═══════════════════════════════════════════════════════════════

interface AlertCardProps {
  alert: Alert;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onMarkRead, onDismiss }) => {
  const getSeverityStyle = () => {
    switch (alert.severity) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-500',
          text: 'text-red-900',
          icon: AlertTriangle,
          iconColor: 'text-red-600',
        };
      case 'high':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-500',
          text: 'text-orange-900',
          icon: TrendingDown,
          iconColor: 'text-orange-600',
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-500',
          text: 'text-yellow-900',
          icon: Clock,
          iconColor: 'text-yellow-600',
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-500',
          text: 'text-blue-900',
          icon: CheckCircle,
          iconColor: 'text-blue-600',
        };
    }
  };

  const style = getSeverityStyle();
  const Icon = style.icon;

  const getTypeIcon = () => {
    switch (alert.type) {
      case 'cost':
        return DollarSign;
      case 'schedule':
        return Clock;
      case 'both':
        return AlertTriangle;
      default:
        return Bell;
    }
  };

  const TypeIcon = getTypeIcon();

  return (
    <div className={`${style.bg} ${style.text} border-l-4 ${style.border} rounded-r-lg p-4 mb-3 ${alert.isRead ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <Icon className={`w-6 h-6 ${style.iconColor} flex-shrink-0 mt-1`} />
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-bold text-lg">{alert.title}</h4>
              <span className="text-xs bg-white/50 px-2 py-1 rounded">
                {alert.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {alert.activityCode && (
              <p className="text-sm font-medium mb-1">
                النشاط: {alert.activityCode} - {alert.activityName}
              </p>
            )}

            <p className="text-sm mb-2">{alert.message}</p>

            <div className="bg-white/70 rounded p-2 text-sm mb-2">
              <div className="flex justify-between mb-1">
                <span>القيمة الحالية:</span>
                <span className="font-bold">{alert.currentValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>الحد المسموح:</span>
                <span className="font-bold">{alert.thresholdValue.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-white/90 rounded p-3 text-sm">
              <p className="font-semibold mb-1">🎯 الإجراء المطلوب:</p>
              <p>{alert.actionRequired}</p>
            </div>

            <div className="flex items-center gap-2 mt-3">
              {!alert.isRead && (
                <button
                  onClick={() => onMarkRead(alert.id)}
                  className="text-xs bg-white/70 hover:bg-white px-3 py-1 rounded transition-colors"
                >
                  وضع علامة مقروء
                </button>
              )}
              {alert.isSent && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  ✓ تم الإرسال
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => onDismiss(alert.id)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Settings Modal
// ═══════════════════════════════════════════════════════════════

interface SettingsModalProps {
  thresholds: AlertThresholds;
  channels: NotificationChannel;
  onSave: (thresholds: AlertThresholds, channels: NotificationChannel) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  thresholds,
  channels,
  onSave,
  onClose,
}) => {
  const [localThresholds, setLocalThresholds] = useState(thresholds);
  const [localChannels, setLocalChannels] = useState(channels);

  const handleSave = () => {
    onSave(localThresholds, localChannels);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">إعدادات التنبيهات</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Thresholds */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">حدود التنبيهات</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPI - الحد الحرج
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={localThresholds.cpiCritical}
                  onChange={(e) => setLocalThresholds({
                    ...localThresholds,
                    cpiCritical: parseFloat(e.target.value),
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">تنبيه حرج إذا كان CPI أقل من هذه القيمة</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPI - حد التحذير
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={localThresholds.cpiWarning}
                  onChange={(e) => setLocalThresholds({
                    ...localThresholds,
                    cpiWarning: parseFloat(e.target.value),
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SPI - الحد الحرج
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={localThresholds.spiCritical}
                  onChange={(e) => setLocalThresholds({
                    ...localThresholds,
                    spiCritical: parseFloat(e.target.value),
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SPI - حد التحذير
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={localThresholds.spiWarning}
                  onChange={(e) => setLocalThresholds({
                    ...localThresholds,
                    spiWarning: parseFloat(e.target.value),
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Notification Channels */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">قنوات التنبيه</h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localChannels.email}
                  onChange={(e) => setLocalChannels({
                    ...localChannels,
                    email: e.target.checked,
                  })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">البريد الإلكتروني</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localChannels.sms}
                  onChange={(e) => setLocalChannels({
                    ...localChannels,
                    sms: e.target.checked,
                  })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">رسائل SMS</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localChannels.whatsapp}
                  onChange={(e) => setLocalChannels({
                    ...localChannels,
                    whatsapp: e.target.checked,
                  })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <MessageSquare className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">WhatsApp</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localChannels.dashboard}
                  onChange={(e) => setLocalChannels({
                    ...localChannels,
                    dashboard: e.target.checked,
                  })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">لوحة التحكم</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              حفظ التغييرات
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Main Auto Alert System Component
// ═══════════════════════════════════════════════════════════════

export const AutoAlertSystem: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [thresholds, setThresholds] = useState<AlertThresholds>({
    cpiCritical: 0.90,
    cpiWarning: 0.95,
    spiCritical: 0.90,
    spiWarning: 0.95,
    costVariancePercent: 10,
    scheduleVariancePercent: 10,
  });
  const [channels, setChannels] = useState<NotificationChannel>({
    email: true,
    sms: false,
    whatsapp: true,
    dashboard: true,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<Alert['severity'] | 'all'>('all');

  // Simulate monitoring
  useEffect(() => {
    // Check for alerts every 5 seconds
    const interval = setInterval(() => {
      checkForAlerts();
    }, 5000);

    // Initial check
    checkForAlerts();

    return () => clearInterval(interval);
  }, [thresholds]);

  const checkForAlerts = () => {
    // Example: Check project indicators
    const projectCPI = 0.87;
    const projectSPI = 2.25;

    const cpiAlert = AlertGenerator.checkCPI(projectCPI, thresholds);
    if (cpiAlert && !alerts.find(a => a.message === cpiAlert.message && !a.isRead)) {
      setAlerts(prev => [cpiAlert, ...prev]);
      sendNotification(cpiAlert);
    }

    // Check activity indicators
    const activityAlerts: Alert[] = [];
    
    // Activity 1: فرشة أسمنتية
    const act1Alert = AlertGenerator.checkCPI(0.95, thresholds, 'TILE-001-B', 'فرشة أسمنتية');
    if (act1Alert) activityAlerts.push(act1Alert);

    activityAlerts.forEach(alert => {
      if (!alerts.find(a => a.id === alert.id)) {
        setAlerts(prev => [alert, ...prev]);
        sendNotification(alert);
      }
    });
  };

  const sendNotification = (alert: Alert) => {
    // Simulate sending notifications
    if (channels.dashboard) {
      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(alert.title, {
          body: alert.message,
          icon: '/icon.png',
        });
      }
    }

    if (channels.email) {
      console.log('📧 Sending email notification:', alert.title);
    }

    if (channels.sms) {
      console.log('📱 Sending SMS notification:', alert.title);
    }

    if (channels.whatsapp) {
      console.log('💬 Sending WhatsApp notification:', alert.title);
    }

    // Mark as sent
    setAlerts(prev =>
      prev.map(a => (a.id === alert.id ? { ...a, isSent: true } : a))
    );
  };

  const handleMarkRead = (id: string) => {
    setAlerts(prev =>
      prev.map(alert => (alert.id === id ? { ...alert, isRead: true } : alert))
    );
  };

  const handleDismiss = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const handleSaveSettings = (newThresholds: AlertThresholds, newChannels: NotificationChannel) => {
    setThresholds(newThresholds);
    setChannels(newChannels);
  };

  const filteredAlerts = filterSeverity === 'all'
    ? alerts
    : alerts.filter(a => a.severity === filterSeverity);

  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-8 h-8 text-blue-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">نظام التنبيهات الآلية</h1>
            <p className="text-gray-600 mt-1">
              مراقبة مستمرة لمؤشرات EVM وإرسال تنبيهات فورية
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Settings className="w-4 h-4" />
          الإعدادات
        </button>
      </div>

      {/* Thresholds Info */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">الحدود الحالية للتنبيهات</h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-700">CPI حرج:</span>
            <span className="font-bold text-blue-900 mr-1">&lt; {thresholds.cpiCritical}</span>
          </div>
          <div>
            <span className="text-blue-700">CPI تحذير:</span>
            <span className="font-bold text-blue-900 mr-1">&lt; {thresholds.cpiWarning}</span>
          </div>
          <div>
            <span className="text-blue-700">SPI حرج:</span>
            <span className="font-bold text-blue-900 mr-1">&lt; {thresholds.spiCritical}</span>
          </div>
          <div>
            <span className="text-blue-700">SPI تحذير:</span>
            <span className="font-bold text-blue-900 mr-1">&lt; {thresholds.spiWarning}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">الفلترة حسب الخطورة:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">الكل ({alerts.length})</option>
            <option value="critical">حرج ({alerts.filter(a => a.severity === 'critical').length})</option>
            <option value="high">عالي ({alerts.filter(a => a.severity === 'high').length})</option>
            <option value="medium">متوسط ({alerts.filter(a => a.severity === 'medium').length})</option>
            <option value="low">منخفض ({alerts.filter(a => a.severity === 'low').length})</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div>
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">لا توجد تنبيهات</h3>
            <p className="text-gray-600">
              جميع مؤشرات المشروع ضمن الحدود المقبولة
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onMarkRead={handleMarkRead}
              onDismiss={handleDismiss}
            />
          ))
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          thresholds={thresholds}
          channels={channels}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default AutoAlertSystem;
