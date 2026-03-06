import React from 'react';
import { Clock, BellRing, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Props {
    reminder: any;
    onDismiss: (id: string) => void;
    onTrigger: (id: string) => void;
}

export const ReminderItem = ({ reminder, onDismiss, onTrigger }: Props) => {
  const isDue = new Date(reminder.triggerAt) <= new Date();
  
  return (
    <div className={cn("p-4 rounded-2xl border-2 flex items-center justify-between gap-4 transition-all", isDue ? "bg-primary/5 border-primary/20 animate-pulse" : "bg-white border-primary/5")}>
      <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isDue ? "bg-primary text-white shadow-glow" : "bg-muted text-muted-foreground")}>
              {isDue ? <BellRing className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          </div>
          <div className="text-left">
              <p className="font-bold text-sm leading-tight">{reminder.text}</p>
              <p className="text-[10px] font-black text-muted-foreground/60 uppercase mt-0.5">{format(new Date(reminder.triggerAt), 'h:mm a')}</p>
          </div>
      </div>
      <Button variant="ghost" size="icon" onClick={() => onDismiss(reminder.id)}><Trash2 className="w-4 h-4" /></Button>
    </div>
  );
};
