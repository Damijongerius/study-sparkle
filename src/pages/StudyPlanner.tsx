import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStudyStoreContext } from '@/hooks/useStudyStoreContext';
import { toast } from 'sonner';
import { sfx } from '@/lib/sfx';
import { ExamPlannerWizard } from '@/components/ExamPlannerWizard';
import { AgendaComponent } from '@/components/AgendaComponent';
import { RoadmapView } from '@/features/Planner/RoadmapView';
import { ExecutionFlowView } from '@/features/Planner/ExecutionFlowView';
import { PlannerHeader } from '@/features/Planner/PlannerHeader';
import { PlannerDialogs } from '@/features/Planner/PlannerDialogs';
import { DeleteConfirmDialog } from '@/features/Planner/DeleteConfirmDialog';

type PlannerMode = 'flow' | 'long-term' | 'availability';

const StudyPlanner = () => {
  const store = useStudyStoreContext();
  const [activeMode, setActiveMode] = useState<PlannerMode>('long-term');
  const [agendaView, setAgendaView] = useState<'calendar' | 'settings'>('calendar');
  const [weekStart, setWeekStart] = useState(() => {
      const d = new Date();
      const diff = d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1);
      const m = new Date(d.setDate(diff)); m.setHours(0,0,0,0); return m;
  });

  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; type: 'plan' | 'task'; taskId?: string } | null>(null);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d; }), [weekStart]);

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-8 py-4 md:py-10 px-2 md:px-4">
      <PlannerHeader activeMode={activeMode} agendaView={agendaView} weekDays={weekDays} onSwitchMode={setActiveMode} onSwitchAgendaView={setAgendaView} onChangeWeek={(off) => { const d = new Date(weekStart); d.setDate(d.getDate() + off*7); setWeekStart(d); }} onResetToday={() => { const d = new Date(); const diff = d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1); setWeekStart(new Date(d.setDate(diff))); }} onOpenWizard={() => setIsWizardOpen(true)} onOpenAddPlan={() => setIsAddPlanOpen(true)} />

      <div className="relative">
        {isWizardOpen ? <ExamPlannerWizard onComplete={() => { setIsWizardOpen(false); setActiveMode('long-term'); sfx.milestone(); toast.success('Added! 🎯'); }} onCancel={() => setIsWizardOpen(false)} /> :
         activeMode === 'availability' ? <AgendaComponent view={agendaView} onViewChange={setAgendaView} weekStart={weekStart} setWeekStart={setWeekStart} /> :
         activeMode === 'long-term' ? <RoadmapView plans={store.plans.filter(p => p.type !== 'flow')} onSwitchMode={setActiveMode} onDelete={(id) => setDeleteConfirm({ id, type: 'plan' })} /> :
         <ExecutionFlowView plans={store.plans} onDelete={(id) => setDeleteConfirm({ id, type: 'plan' })} onAddTask={(id) => { setSelectedPlanId(id); setIsAddTaskOpen(true); }} onDeleteTask={(pId, tId) => setDeleteConfirm({ id: pId, type: 'task', taskId: tId })} onToggleTask={store.toggleTaskStatus} />}
      </div>

      <DeleteConfirmDialog deleteConfirm={deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)} onConfirm={async () => { if(deleteConfirm?.type === 'plan') await store.deletePlan(deleteConfirm.id); else if(deleteConfirm?.taskId) await store.deleteTask(deleteConfirm.id, deleteConfirm.taskId); sfx.trash(); setDeleteConfirm(null); }} />
      <PlannerDialogs isAddPlanOpen={isAddPlanOpen} onAddPlanChange={setIsAddPlanOpen} isAddTaskOpen={isAddTaskOpen} onAddTaskChange={setIsAddTaskOpen} selectedPlanId={selectedPlanId} activeMode={activeMode} />
    </div>
  );
};

export default StudyPlanner;
