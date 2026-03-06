import { useMemo } from 'react';
import { useStudyStoreContext } from '@/hooks/useStudyStoreContext';

export const useDailyRecommendation = (answers: Record<string, string>) => {
  const store = useStudyStoreContext();

  return useMemo(() => {
    const e = answers.energy || store.dailyIntent?.energy;
    const p = answers.persona || store.dailyIntent?.persona;
    const t = answers.time || store.dailyIntent?.time;

    const available = store.plans.filter(x => x.status !== 'completed');
    const sorted = [...available].sort((a, b) => {
        if (p === 'completionist') {
            const getProgress = (x: any) => x.tasks.filter((t: any) => t.status === 'completed').length / x.tasks.length;
            return getProgress(b) - getProgress(a);
        }
        return 0;
    });

    for (const plan of sorted) {
      const task = plan.tasks.find(x => x.status !== 'completed' && !store.isTaskLocked(plan.id, x.id));
      if (task) {
        let dur = "25-50 min";
        if (e === 'high' || t === 'long') dur = "60-120 min";
        if (e === 'low' || t === 'short') dur = "15-25 min";

        return {
          type: plan.type === 'long-term' ? 'Roadmap Goal' : 'Execution Flow',
          name: task.title,
          planName: plan.title,
          description: task.description || `Let's work on ${plan.title}!`,
          path: '/study',
          duration: dur
        };
      }
    }

    return {
      type: 'Daily Sparkle',
      name: 'Focus Session',
      planName: 'General',
      description: 'Start fresh!',
      path: '/study',
      duration: e === 'low' ? "15 min" : "25 min"
    };
  }, [answers, store.dailyIntent, store.plans]);
};
