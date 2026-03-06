import { useCallback } from 'react';
import { plannerApi } from '@/lib/api';
import type { StudyState, Task, Plan } from '@/types';
import { addDays, differenceInDays } from 'date-fns';

export const useTaskActions = (
  state: StudyState,
  updateState: (updater: (prev: StudyState) => StudyState) => void
) => {
  const isTaskLocked = useCallback((planId: string, taskId: string): boolean => {
    const plan = state.plans.find(p => p.id === planId);
    if (!plan || plan.enforceDependencies === false) return false;
    const task = plan.tasks.find(t => t.id === taskId);
    if (!task || !task.dependencies?.length) return false;
    return task.dependencies.some(depId => {
      const depTask = plan.tasks.find(t => t.id === depId);
      return !depTask || depTask.status !== 'completed';
    });
  }, [state.plans]);

  const getAdditionalUpdates = (plan: Plan, taskId: string, nextStart: Date, prevStart: Date) => {
    const dayDelta = differenceInDays(nextStart, prevStart);
    const updates: { taskId: string, updates: any }[] = [];
    plan.tasks.forEach(t => {
      if (t.linkedTaskId === taskId && t.startDate) {
        updates.push({
          taskId: t.id,
          updates: {
            startDate: addDays(new Date(t.startDate), dayDelta),
            endDate: addDays(new Date(t.endDate!), dayDelta)
          }
        });
      }
    });
    return updates;
  };

  const updateTask = useCallback(async (planId: string, taskId: string, updates: Partial<Task>) => {
    if (updates.status && updates.status !== 'pending' && isTaskLocked(planId, taskId)) return false;
    const plan = state.plans.find(p => p.id === planId);
    const task = plan?.tasks.find(t => t.id === taskId);
    let extra: { taskId: string, updates: any }[] = [];
    if (updates.startDate && updates.endDate && task?.startDate) {
      extra = getAdditionalUpdates(plan!, taskId, new Date(updates.startDate), new Date(task.startDate));
    }
    
    await plannerApi.updateTask(planId, taskId, updates);
    for (const ex of extra) await plannerApi.updateTask(planId, ex.taskId, ex.updates);
    
    updateState(prev => ({
      ...prev,
      plans: prev.plans.map(p => {
        if (p.id !== planId) return p;
        const tasks = p.tasks.map(t => {
          if (t.id === taskId) return { ...t, ...updates };
          const ex = extra.find(x => x.taskId === t.id);
          return ex ? { ...t, ...ex.updates } : t;
        });
        return { ...p, tasks, status: tasks.every(t => t.status === 'completed') ? 'completed' : 'in-progress' };
      })
    }));
    return true;
  }, [updateState, isTaskLocked, state.plans]);

  const addTask = useCallback(async (planId: string, task: any) => {
    const id = `task-${Date.now()}`;
    const newTask = { ...task, id, status: 'pending', dependencies: task.dependencies || [] };
    await plannerApi.addTask(planId, newTask);
    updateState(prev => ({ ...prev, plans: prev.plans.map(p => p.id === planId ? { ...p, tasks: [...p.tasks, newTask] } : p) }));
    return true;
  }, [updateState]);

  const deleteTask = useCallback(async (planId: string, taskId: string) => {
    await plannerApi.deleteTask(planId, taskId);
    updateState(prev => ({ ...prev, plans: prev.plans.map(p => p.id === planId ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId).map(t => ({ ...t, dependencies: t.dependencies.filter(d => d !== taskId) })) } : p) }));
    return true;
  }, [updateState]);

  return { isTaskLocked, updateTask, addTask, deleteTask };
};
