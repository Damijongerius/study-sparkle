import React from 'react';
import { motion } from 'framer-motion';
import { Target, ArrowRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { GanttChart } from '@/components/GanttChart';
import { useStudyStoreContext } from '@/hooks/useStudyStoreContext';
import { EliteCard } from '@/components/shared/EliteCard';

interface Props {
    plans: any[];
    onSwitchMode: (mode: any) => void;
    onDelete: (id: string) => void;
}

export const RoadmapView = ({ plans, onSwitchMode, onDelete }: Props) => {
  const store = useStudyStoreContext();

  return (
    <motion.div key="long-term" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <EliteCard className="h-[400px] md:h-[600px] overflow-hidden" interactive={false}>
          <GanttChart plans={plans} onUpdatePlan={store.updatePlan} onDeletePlan={onDelete} />
      </EliteCard>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 text-left">
          {plans.map(plan => (
              <EliteCard key={plan.id} className="overflow-hidden group" interactive>
                  <CardHeader className="bg-primary/5 pb-3 border-b border-primary/5 px-4 md:px-6">
                      <CardTitle className="flex items-center justify-between text-lg font-fredoka">
                          <span className="truncate">{plan.title}</span>
                          <Target className="w-5 h-5 text-primary/40 group-hover:text-primary shrink-0" />
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 space-y-4">
                      <div className="flex justify-between text-[9px] font-black text-muted-foreground uppercase">
                          <span>Progress</span>
                          <span className="text-primary">{plan.tasks.filter((t: any) => t.status === 'completed').length} / {plan.tasks.length}</span>
                      </div>
                      <div className="w-full bg-muted/50 h-2.5 rounded-full overflow-hidden border p-0.5">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(plan.tasks.filter((t: any) => t.status === 'completed').length / (plan.tasks.length || 1)) * 100}%` }} className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" />
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                          <Button className="flex-1 rounded-xl h-10 gap-2 font-bold text-xs" onClick={() => onSwitchMode('flow')}>View <ArrowRight className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-destructive h-10 w-10" onClick={() => onDelete(plan.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                  </CardContent>
              </EliteCard>
          ))}
      </div>
    </motion.div>
  );
};
