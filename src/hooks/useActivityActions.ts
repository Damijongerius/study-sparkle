import { useCallback } from 'react';
import { dataApi } from '@/lib/api';
import type { StudyState } from '@/types';

export const useActivityActions = (
  updateState: (updater: (prev: StudyState) => StudyState) => void
) => {
  const addActivity = useCallback((type: string, details: any = {}) => {
    const entry = { type, timestamp: new Date(), details };
    updateState(prev => ({ ...prev, activityLogs: [entry, ...prev.activityLogs].slice(0, 100) }));
    dataApi.addActivity({ type, timestamp: new Date(), details }).catch(e => console.error(e));
  }, [updateState]);

  const addJournalEntry = useCallback((content: string) => {
    addActivity('journal', { content });
  }, [addActivity]);

  return { addActivity, addJournalEntry };
};
