import React, { useState } from 'react';
import { GitBranch, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useStudyStoreContext } from '@/hooks/useStudyStoreContext';
import { toast } from 'sonner';

interface Props {
    isAddPlanOpen: boolean;
    onAddPlanChange: (o: boolean) => void;
    isAddTaskOpen: boolean;
    onAddTaskChange: (o: boolean) => void;
    selectedPlanId: string | null;
    activeMode: string;
}

export const PlannerDialogs = ({ isAddPlanOpen, onAddPlanChange, isAddTaskOpen, onAddTaskChange, selectedPlanId, activeMode }: Props) => {
  const store = useStudyStoreContext();
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanDesc, setNewPlanDesc] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  return (
    <>
      <Dialog open={isAddPlanOpen} onOpenChange={onAddPlanChange}>
        <DialogContent className="rounded-[2rem] border-2 w-[95vw] max-w-md p-6">
          <DialogHeader><DialogTitle className="text-xl font-fredoka font-bold text-left flex items-center gap-3"><GitBranch className="text-primary" /> New Flow</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4 text-left">
            <div className="space-y-2"><Label className="font-bold ml-1">Title</Label><Input placeholder="e.g. Learn React" className="rounded-xl h-12 border-2" value={newPlanTitle} onChange={e => setNewPlanTitle(e.target.value)} /></div>
            <div className="space-y-2"><Label className="font-bold ml-1">Description</Label><Textarea placeholder="What is this about?" className="rounded-xl min-h-[100px] border-2" value={newPlanDesc} onChange={e => setNewPlanDesc(e.target.value)} /></div>
          </div>
          <DialogFooter className="flex flex-row gap-2">
            <Button variant="ghost" onClick={() => onAddPlanChange(false)} className="flex-1 rounded-xl font-bold">Cancel</Button>
            <Button className="flex-1 rounded-xl shadow-glow font-bold" onClick={async () => { if (!newPlanTitle.trim()) return; const s = await store.addPlan(newPlanTitle, newPlanDesc, activeMode as any); if (s) { onAddPlanChange(false); setNewPlanTitle(''); setNewPlanDesc(''); toast.success('Created! ✨'); } }}>Start</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddTaskOpen} onOpenChange={onAddTaskChange}>
        <DialogContent className="rounded-[2rem] border-2 w-[95vw] max-w-md p-6">
          <DialogHeader><DialogTitle className="text-xl font-fredoka font-bold text-left flex items-center gap-3"><PlusCircle className="text-primary" /> Add Piece</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4 text-left">
            <div className="space-y-2"><Label className="font-bold ml-1 text-sm">Title</Label><Input placeholder="e.g. Task Name" className="rounded-xl h-12 border-2" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} /></div>
            <div className="space-y-2"><Label className="font-bold ml-1 text-sm">Detail</Label><Input placeholder="Short detail" className="rounded-xl h-12 border-2" value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} /></div>
          </div>
          <DialogFooter className="flex flex-row gap-2">
            <Button variant="ghost" onClick={() => onAddTaskChange(false)} className="flex-1 rounded-xl font-bold">Cancel</Button>
            <Button className="flex-1 rounded-xl shadow-glow font-bold" onClick={async () => { if (!newTaskTitle.trim() || !selectedPlanId) return; const p = store.plans.find(x => x.id === selectedPlanId); const last = p?.tasks[p.tasks.length - 1]; const s = await store.addTask(selectedPlanId, { title: newTaskTitle, description: newTaskDesc, dependencies: last ? [last.id] : [], startDate: new Date(), endDate: new Date(), row: (p?.tasks.length || 0) % 5 }); if (s) { onAddTaskChange(false); setNewTaskTitle(''); setNewTaskDesc(''); toast.success('Added! 🌊'); } }}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
