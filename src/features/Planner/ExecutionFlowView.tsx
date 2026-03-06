import React from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Trash2, CheckCircle2, Lock, Circle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useStudyStoreContext } from '@/hooks/useStudyStoreContext';
import { EliteCard } from '@/components/shared/EliteCard';

interface Props {
    plans: any[];
    onDelete: (id: string) => void;
    onAddTask: (id: string) => void;
    onDeleteTask: (pId: string, tId: string) => void;
    onToggleTask: (pId: string, tId: string) => void;
}

export const ExecutionFlowView = ({ plans, onDelete, onAddTask, onDeleteTask, onToggleTask }: Props) => {
  const store = useStudyStoreContext();

  if (plans.length === 0) {
    return (
      <EliteCard variant="dashed" className="p-10 md:p-16 text-center">
        <GitBranch className="w-12 h-12 text-primary/40 mx-auto mb-6" />
        <h3 className="text-2xl font-fredoka font-bold mb-3">No active flows</h3>
        <Button size="lg" className="rounded-2xl px-8 h-12 mt-4 shadow-glow" onClick={() => onAddTask('')}>Create Flow</Button>
      </EliteCard>
    );
  }

  return (
    <motion.div key="flow" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      {plans.map(plan => (
        <EliteCard key={plan.id} className="overflow-hidden" interactive={false}>
            <CardHeader className="border-b bg-primary/5 py-4 md:py-8 px-4 md:px-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 rounded-full animate-pulse", plan.status === 'completed' ? "bg-green-400" : "bg-blue-400")} />
                  <div className="flex flex-col text-left min-w-0">
                      <CardTitle className="text-xl md:text-3xl font-fredoka truncate">{plan.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                          {plan.type === 'long-term' && <Badge className="bg-primary/10 text-primary uppercase font-black text-[8px] px-2">Roadmap</Badge>}
                          <div className="flex items-center gap-2 bg-white/80 px-2 py-0.5 rounded-full border">
                              <span className="text-[8px] font-black text-muted-foreground uppercase">Ordered:</span>
                              <Switch checked={plan.enforceDependencies !== false} onCheckedChange={(val) => store.updatePlan(plan.id, { enforceDependencies: val })} className="scale-50 md:scale-75" />
                          </div>
                      </div>
                  </div>
                </div>
                <div className="flex gap-3 justify-end items-center">
                  <Badge variant="secondary" className="text-sm py-1 px-3 font-black rounded-xl bg-white border-primary/10 text-primary">{plan.tasks.filter((t:any) => t.status === 'completed').length}/{plan.tasks.length}</Badge>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-10 w-10" onClick={() => onDelete(plan.id)}><Trash2 className="w-5 h-5" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {plan.tasks.map((task: any) => {
                  const isLocked = store.isTaskLocked(plan.id, task.id);
                  const isComp = task.status === 'completed';
                  return (
                    <motion.div key={task.id} className={cn("p-4 rounded-[1.25rem] border-2 transition-all group", isComp ? "bg-green-50/40 border-green-100" : isLocked ? "opacity-50 grayscale" : "bg-white border-primary/5 shadow-soft")}>
                      <div className="flex items-start gap-3">
                        <button onClick={() => onToggleTask(plan.id, task.id)} className={cn("w-8 h-8 rounded-[0.75rem] flex items-center justify-center transition-all flex-shrink-0 mt-0.5", isComp ? "bg-green-500 text-white" : isLocked ? "bg-muted" : "bg-primary/5 text-primary border-2 border-primary/10")}>
                          {isComp ? <CheckCircle2 className="w-4 h-4" /> : isLocked ? <Lock className="w-3.5 h-3.5" /> : <Circle className="w-4 h-4" />}
                        </button>
                        <div className="flex-1 min-w-0 text-left">
                          <p className={cn("font-bold truncate text-sm", isComp && "text-green-700/50 line-through")}>{task.title}</p>
                          {(task.startDate || task.estimatedHours) && <p className="text-[8px] uppercase font-black text-muted-foreground/40 mt-1">{task.startDate && format(new Date(task.startDate), 'MMM dd')} {task.estimatedHours && `• ${task.estimatedHours}H`}</p>}
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => onDeleteTask(plan.id, task.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </motion.div>
                  );
                })}
                <Button variant="outline" className="h-auto p-4 rounded-[1.25rem] border-dashed border-2 border-primary/10 text-primary/60 gap-3 font-fredoka font-bold text-xs" onClick={() => onAddTask(plan.id)}><Plus className="w-4 h-4" /> Add Piece</Button>
              </div>
            </CardContent>
        </EliteCard>
      ))}
    </motion.div>
  );
};
