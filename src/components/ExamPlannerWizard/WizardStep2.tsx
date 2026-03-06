import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface Props {
    tasks: any[];
    onUpdate: (data: any) => void;
}

export const WizardStep2 = ({ tasks, onUpdate }: Props) => {
  const [newTitle, setNewTitle] = useState('');
  
  const addTask = () => { if(newTitle) { onUpdate({ tasks: [...tasks, { title: newTitle, amount: 2, unit: 'hours' }] }); setNewTitle(''); } };
  const removeTask = (i: number) => onUpdate({ tasks: tasks.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-6 text-left">
      <div className="flex gap-2">
          <Input placeholder="Enter a task/piece..." value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} className="h-12 rounded-xl border-2 px-4" />
          <Button onClick={addTask} size="icon" className="h-12 w-12 rounded-xl shrink-0"><Plus /></Button>
      </div>
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {tasks.map((t, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border-2 border-transparent hover:border-primary/10 group transition-all">
                  <span className="font-bold">{t.title}</span>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-destructive" onClick={() => removeTask(i)}><Trash2 className="w-4 h-4" /></Button>
              </div>
          ))}
      </div>
    </div>
  );
};
