/**
 * Notification Context & Provider
 * نظام الإشعارات الذكي
 * 
 * Features:
 * - Real-time notifications
 * - Multiple notification types
 * - Priority-based sorting
 * - Mark as read/unread
 * - Filter by category
 * - Sound notifications
 * - Desktop notifications
 * 
 * @author NOUFAL EMS
 * @date 2025-11-07
 * @version 2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'task' | 'budget' | 'schedule' | 'risk' | 'document' | 'user';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

export interface NotificationSettings {
  soundEnabled: boolean;
  desktopEnabled: boolean;
  emailDigest: boolean;
  categories: {
    [key in NotificationType]?: boolean;
  };
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  getNotificationsByType: (type: NotificationType) => Notification[];
  getNotificationsByPriority: (priority: NotificationPriority) => Notification[];
}

// ============================================================================
// Context
// ============================================================================

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('NOUFAL_NOTIFICATION_SETTINGS');
    return saved ? JSON.parse(saved) : {
      soundEnabled: true,
      desktopEnabled: false,
      emailDigest: false,
      categories: {
        info: true,
        success: true,
        warning: true,
        error: true,
        task: true,
        budget: true,
        schedule: true,
        risk: true,
        document: true,
        user: true
      }
    };
  });

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('NOUFAL_NOTIFICATION_SETTINGS', JSON.stringify(settings));
  }, [settings]);

  // Request desktop notification permission
  useEffect(() => {
    if (settings.desktopEnabled && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [settings.desktopEnabled]);

  // Clean up expired notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setNotifications(prev => prev.filter(n => !n.expiresAt || n.expiresAt > now));
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Add notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    // Check if category is enabled
    if (settings.categories[notification.type] === false) {
      return;
    }

    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Play sound
    if (settings.soundEnabled) {
      playNotificationSound(notification.priority);
    }

    // Show desktop notification
    if (settings.desktopEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: newNotification.id
      });
    }
  }, [settings]);

  // Mark as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Get notifications by type
  const getNotificationsByType = useCallback((type: NotificationType) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  // Get notifications by priority
  const getNotificationsByPriority = useCallback((priority: NotificationPriority) => {
    return notifications.filter(n => n.priority === priority);
  }, [notifications]);

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    settings,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    updateSettings,
    getNotificationsByType,
    getNotificationsByPriority
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// ============================================================================
// Hook
// ============================================================================

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// ============================================================================
// Utility Functions
// ============================================================================

const playNotificationSound = (priority: NotificationPriority) => {
  try {
    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different frequencies for different priorities
    const frequencies: Record<NotificationPriority, number> = {
      low: 400,
      medium: 600,
      high: 800,
      urgent: 1000
    };

    oscillator.frequency.value = frequencies[priority];
    oscillator.type = 'sine';

    // Volume envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
};

// ============================================================================
// Mock Notification Generator (for testing)
// ============================================================================

export const generateMockNotifications = (): Omit<Notification, 'id' | 'timestamp' | 'read'>[] => {
  return [
    {
      type: 'task',
      priority: 'high',
      title: 'Task Deadline Approaching',
      message: 'Task "Foundation Work - Phase 2" is due in 2 days',
      actionUrl: '/schedule',
      actionLabel: 'View Task'
    },
    {
      type: 'budget',
      priority: 'urgent',
      title: 'Budget Alert',
      message: 'Project budget has exceeded 85% threshold',
      actionUrl: '/financials',
      actionLabel: 'Review Budget'
    },
    {
      type: 'document',
      priority: 'medium',
      title: 'New Document Uploaded',
      message: 'Ahmed uploaded "Structural Drawing Rev.3" to Project X',
      actionUrl: '/documents',
      actionLabel: 'View Document'
    },
    {
      type: 'schedule',
      priority: 'high',
      title: 'Schedule Variance Detected',
      message: 'Project is running 3 days behind schedule',
      actionUrl: '/analytics',
      actionLabel: 'View Analytics'
    },
    {
      type: 'risk',
      priority: 'urgent',
      title: 'New High Risk Identified',
      message: 'Weather conditions may delay concrete pouring',
      actionUrl: '/risks',
      actionLabel: 'View Risk'
    },
    {
      type: 'user',
      priority: 'low',
      title: 'Team Member Added',
      message: 'Sara joined the project as Quality Control Engineer',
      actionUrl: '/team',
      actionLabel: 'View Team'
    },
    {
      type: 'success',
      priority: 'medium',
      title: 'Milestone Completed',
      message: 'Phase 1 milestone successfully completed ahead of schedule',
      actionUrl: '/schedule',
      actionLabel: 'View Progress'
    },
    {
      type: 'warning',
      priority: 'medium',
      title: 'Material Stock Low',
      message: 'Cement inventory below minimum threshold',
      actionUrl: '/procurement',
      actionLabel: 'Order Materials'
    }
  ];
};

export default NotificationContext;
