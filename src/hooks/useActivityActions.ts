import { useCallback } from 'react';
import { dataApi } from '@/lib/api';
import type { StudyState, Reminder, ActivityType } from '@/types';

export const useActivityActions = (
  updateState: (updater: (prev: StudyState) => StudyState) => void
) => {
  const addActivity = useCallback((type: ActivityType, details: any = {}) => {
    const entry = { id: Math.random().toString(36).substr(2, 9), type, timestamp: new Date(), details };
    updateState(prev => ({ ...prev, activityLogs: [entry, ...prev.activityLogs].slice(0, 100) }));
    dataApi.addActivity({ type, timestamp: new Date(), details }).catch(e => console.error(e));
  }, [updateState]);

  const addJournalEntry = useCallback((content: string) => {
    addActivity('journal_entry', { journalText: content });
  }, [addActivity]);

  const addReminder = useCallback((text: string, time: string) => {
    const triggerAt = new Date();
    const [h, m] = time.split(':').map(Number);
    triggerAt.setHours(h, m, 0, 0);
    const newR: Reminder = { 
        id: Math.random().toString(36).substr(2, 9), 
        text, 
        triggerAt, 
        createdAt: new Date(), 
        triggered: false 
    };
    updateState(prev => ({ ...prev, reminders: [...prev.reminders, newR] }));
    addActivity('reminder_set', { reminderText: text, reminderMinutes: h * 60 + m });
  }, [updateState, addActivity]);

  const dismissReminder = useCallback((id: string) => {
    updateState(prev => ({ ...prev, reminders: prev.reminders.filter(r => r.id !== id) }));
  }, [updateState]);

  const triggerReminder = useCallback((id: string) => {
    updateState(prev => ({
        ...prev,
        reminders: prev.reminders.map(r => r.id === id ? { ...r, triggered: true } : r)
    }));
    addActivity('reminder_triggered', { reminderId: id });
  }, [updateState, addActivity]);

  const getDueReminders = useCallback((reminders: Reminder[]) => {
    return reminders.filter(r => !r.triggered && new Date(r.triggerAt) <= new Date());
  }, []);

  return { addActivity, addJournalEntry, addReminder, dismissReminder, triggerReminder, getDueReminders };
};
