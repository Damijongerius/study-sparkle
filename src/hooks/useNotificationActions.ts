import { useCallback } from 'react';
import { notificationsApi } from '@/lib/api';
import type { StudyState } from '@/types';

export const useNotificationActions = (
  state: StudyState,
  updateState: (updater: (prev: StudyState) => StudyState) => void
) => {
  const addNotification = useCallback((n: any) => {
    updateState(prev => ({
      ...prev,
      notifications: [{ ...n, id: `n-${Date.now()}`, read: false, createdAt: new Date() }, ...prev.notifications].slice(0, 50)
    }));
  }, [updateState]);

  const markAsRead = useCallback(async (id: string) => {
    updateState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    }));
    await notificationsApi.markAsRead(id);
  }, [updateState]);

  const clearAllNotifications = useCallback(async () => {
    updateState(prev => ({ ...prev, notifications: [] }));
    await notificationsApi.clearAll();
  }, [updateState]);

  return { addNotification, markAsRead, clearAllNotifications };
};
