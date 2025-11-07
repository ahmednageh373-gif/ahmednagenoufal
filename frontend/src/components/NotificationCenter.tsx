/**
 * Notification Center Component
 * مركز الإشعارات
 * 
 * Features:
 * - Notification panel with dropdown
 * - Filter by type and priority
 * - Mark as read/unread
 * - Clear individual or all notifications
 * - Settings modal
 * 
 * @author NOUFAL EMS
 * @date 2025-11-07
 * @version 2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Filter,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ClipboardList,
  DollarSign,
  Calendar,
  Shield,
  FileText,
  Users,
  ChevronDown
} from 'lucide-react';
import { useNotifications, NotificationType, NotificationPriority, generateMockNotifications } from '../contexts/NotificationContext';

// ============================================================================
// Utility Functions
// ============================================================================

const getNotificationIcon = (type: NotificationType) => {
  const icons = {
    info: <Info className="w-5 h-5 text-blue-500" />,
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    task: <ClipboardList className="w-5 h-5 text-purple-500" />,
    budget: <DollarSign className="w-5 h-5 text-green-500" />,
    schedule: <Calendar className="w-5 h-5 text-blue-500" />,
    risk: <Shield className="w-5 h-5 text-red-500" />,
    document: <FileText className="w-5 h-5 text-indigo-500" />,
    user: <Users className="w-5 h-5 text-pink-500" />
  };
  return icons[type] || icons.info;
};

const getPriorityColor = (priority: NotificationPriority) => {
  const colors = {
    low: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
  };
  return colors[priority];
};

const formatTimestamp = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

// ============================================================================
// Notification Item Component
// ============================================================================

interface NotificationItemProps {
  notification: any;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead, onRemove }) => {
  return (
    <div
      className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
        !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
              {notification.title}
            </h4>
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${getPriorityColor(notification.priority)}`}>
              {notification.priority}
            </span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {notification.message}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {formatTimestamp(notification.timestamp)}
            </span>

            <div className="flex items-center gap-2">
              {notification.actionUrl && (
                <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                  {notification.actionLabel || 'View'}
                </button>
              )}

              {!notification.read && (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => onRemove(notification.id)}
                className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Remove"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Settings Modal Component
// ============================================================================

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useNotifications();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notification Settings
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* General Settings */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">General</h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Sound notifications</span>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Desktop notifications</span>
                <input
                  type="checkbox"
                  checked={settings.desktopEnabled}
                  onChange={(e) => updateSettings({ desktopEnabled: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Email digest</span>
                <input
                  type="checkbox"
                  checked={settings.emailDigest}
                  onChange={(e) => updateSettings({ emailDigest: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>

          {/* Category Settings */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Categories</h4>
            <div className="space-y-3">
              {Object.entries(settings.categories).map(([category, enabled]) => (
                <label key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getNotificationIcon(category as NotificationType)}
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {category}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => updateSettings({
                      categories: { ...settings.categories, [category]: e.target.checked }
                    })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<NotificationPriority | 'all'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate mock notifications on mount (for demo)
  useEffect(() => {
    if (notifications.length === 0) {
      const mockNotifications = generateMockNotifications();
      mockNotifications.forEach(notif => {
        setTimeout(() => addNotification(notif), Math.random() * 2000);
      });
    }
  }, []);

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    if (filterType !== 'all' && n.type !== filterType) return false;
    if (filterPriority !== 'all' && n.priority !== filterPriority) return false;
    return true;
  });

  // Sort by unread first, then by timestamp
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Bell Icon Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Panel */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {unreadCount} unread
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}

                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Clear all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <Filter className="w-4 h-4 text-gray-400" />
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Types</option>
                <option value="task">Tasks</option>
                <option value="budget">Budget</option>
                <option value="schedule">Schedule</option>
                <option value="risk">Risks</option>
                <option value="document">Documents</option>
                <option value="user">Users</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                className="text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {sortedNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                sortedNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onRemove={removeNotification}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
};

export default NotificationCenter;
