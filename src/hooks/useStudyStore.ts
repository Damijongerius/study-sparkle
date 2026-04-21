import { useState, useEffect, useCallback, useRef } from 'react';
import { dataApi } from '@/lib/api';
import type { StudyState } from '@/types';
import { usePlanActions } from './Planner/usePlanActions';
import { useTaskActions } from './Planner/useTaskActions';
import { useStickerActions } from './useStickerActions';
import { useAgendaActions } from './useAgendaActions';
import { useNotificationActions } from './useNotificationActions';
import { useActivityActions } from './useActivityActions';
import { STICKERS, DEFAULT_AGENDA_SETTINGS } from './useStudyStoreData';
import { convertBackendData, convertToBackendFormat, createNewCard } from './useStudyStoreUtils';

export const useStudyStore = (username?: string) => {
  const [state, setState] = useState<StudyState>(() => ({
    totalPoints: 0, ownedStickers: [], totalStudyMinutes: 0, studySessions: 0,
    stickerCards: [createNewCard('Starter Card', 9)], dailyCooldowns: {}, activityLogs: [],
    reminders: [], notifications: [], plans: [], availability: [], agendaItems: [],
    agendaSettings: DEFAULT_AGENDA_SETTINGS, dailyIntent: undefined
  }));

  const [pendingSticker, setPendingSticker] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveToBackend = useCallback(async (newState: StudyState) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try { await dataApi.updateUserData(convertToBackendFormat(newState)); } 
      catch (e) { console.error('Save error', e); }
    }, 1000);
  }, []);

  const updateState = useCallback((updater: (prev: StudyState) => StudyState) => {
    setState(prev => { const newState = updater(prev); saveToBackend(newState); return newState; });
  }, [saveToBackend]);

  const plans = usePlanActions(updateState);
  const tasks = useTaskActions(state, updateState);
  const stickers = useStickerActions(state, updateState, STICKERS, pendingSticker, username);
  const agenda = useAgendaActions(updateState);
  const notifications = useNotificationActions(state, updateState);
  const activity = useActivityActions(updateState);

  useEffect(() => {
    if (!username) return setIsLoading(false);
    const load = async () => {
      try { const data = await dataApi.getUserData(); setState(convertBackendData(data as any)); }
      catch (e) { console.error('Load error', e); } finally { setIsLoading(false); }
    };
    load();
  }, [username]);

  return {
    ...state, 
    username,
    stickers: STICKERS, 
    pendingSticker, 
    pendingStickerData: STICKERS.find(s => s.id === pendingSticker),
    isLoading, 
    updateState,
    ...plans, 
    ...tasks, 
    ...stickers, 
    ...agenda, 
    ...notifications, 
    ...activity,
    addPoints: (pts: number, mins: number) => updateState(p => ({ ...p, totalPoints: p.totalPoints + pts, totalStudyMinutes: p.totalStudyMinutes + mins, studySessions: p.studySessions + 1 })),
    deductPoints: (amount: number, reason: string) => {
        updateState(p => ({ ...p, totalPoints: Math.max(0, p.totalPoints - amount) }));
        activity.addActivity('point_deduction', { amount, reason });
    },
    logPause: () => updateState(p => ({ ...p, totalPoints: Math.max(0, p.totalPoints - 5) })),
    initiatePurchase: (id: string) => { if(stickers.canPurchaseToday(id)) { setPendingSticker(id); return true; } return false; },
    confirmPurchase: (cardId: string) => { const res = stickers.confirmPurchase(cardId); if(res) setPendingSticker(null); return res; },
    cancelPurchase: () => setPendingSticker(null),
    toggleTaskStatus: (pId: string, tId: string) => {
        if(tasks.isTaskLocked(pId, tId)) return Promise.resolve(false);
        const task = state.plans.find(p => p.id === pId)?.tasks.find(t => t.id === tId);
        return tasks.updateTask(pId, tId, { status: task?.status === 'completed' ? 'pending' : 'completed' });
    }
  };
};

export type StudyStore = ReturnType<typeof useStudyStore>;
