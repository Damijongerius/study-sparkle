import React from 'react';
import { format, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { CELL_WIDTH, ROW_HEIGHT } from './GanttUtils';

interface Props {
    days: Date[];
    plans: any[];
    onGridClick: (date: Date, row: number) => void;
}

export const GanttTimeline = ({ days, plans, onGridClick }: Props) => (
  <div className="relative flex flex-col min-w-max bg-white">
    <div className="flex sticky top-0 z-20 bg-card border-b">
        {days.map(d => (
            <div key={d.toISOString()} className={cn("w-10 h-12 flex flex-col items-center justify-center border-r shrink-0", isToday(d) && "bg-primary/5")}>
                <span className="text-[8px] font-black uppercase text-muted-foreground">{format(d, 'EEE')}</span>
                <span className={cn("text-xs font-bold", isToday(d) ? "text-primary" : "text-foreground")}>{format(d, 'd')}</span>
            </div>
        ))}
    </div>
    <div className="relative">
        {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="flex border-b h-[48px]">
                {days.map(d => (
                    <div key={d.toISOString()} className={cn("w-10 border-r shrink-0 hover:bg-primary/[0.02] cursor-crosshair transition-colors", isToday(d) && "bg-primary/[0.02]")} onClick={() => onGridClick(d, i)} />
                ))}
            </div>
        ))}
    </div>
  </div>
);
