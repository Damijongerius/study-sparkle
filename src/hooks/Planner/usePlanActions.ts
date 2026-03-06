import { useCallback } from 'react';
import { plannerApi } from '@/lib/api';
import type { StudyState, Plan } from '@/types';
import { addDays } from 'date-fns';

export const usePlanActions = (
  updateState: (updater: (prev: StudyState) => StudyState) => void
) => {
  const addPlan = useCallback(async (title: string, description?: string, type?: 'flow' | 'exam' | 'long-term', examDate?: Date, enforceDependencies?: boolean, startDate?: Date, endDate?: Date) => {
    const id = `plan-${Date.now()}`;
    const newPlan: Plan = {
      id, title, description, status: 'pending', tasks: [],
      type: type || 'flow', examDate, startDate: startDate || new Date(),
      endDate: endDate || addDays(new Date(), 14),
      enforceDependencies: enforceDependencies ?? (type === 'flow'),
    };
    await plannerApi.createPlan(title, id, description, type, examDate, newPlan.enforceDependencies, newPlan.startDate, newPlan.endDate);
    updateState(prev => ({ ...prev, plans: [...prev.plans, newPlan] }));
    return true;
  }, [updateState]);

  const updatePlan = useCallback(async (planId: string, updates: Partial<Plan>) => {
    await plannerApi.updatePlan(planId, updates);
    updateState(prev => ({ ...prev, plans: prev.plans.map(p => p.id === planId ? { ...p, ...updates } : p) }));
  }, [updateState]);

  const deletePlan = useCallback(async (planId: string) => {
    await plannerApi.deletePlan(planId);
    updateState(prev => ({ ...prev, plans: prev.plans.filter(p => p.id !== planId) }));
    return true;
  }, [updateState]);

  return { addPlan, updatePlan, deletePlan };
};
