import React, { useState, useMemo } from 'react';
import { GanttTimeline } from './GanttTimeline';
import { getTimelineDays, getTaskPosition, CELL_WIDTH, ROW_HEIGHT } from './GanttUtils';
import { startOfISOWeek, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    plans: any[];
    onUpdatePlan: (id: string, updates: any) => void;
    onDeletePlan: (id: string) => void;
}

export const GanttChart = ({ plans, onUpdatePlan, onDeletePlan }: Props) => {
    const [viewStart, setViewStart] = useState(() => startOfISOWeek(new Date()));
    const days = useMemo(() => getTimelineDays(viewStart, 4), [viewStart]);

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b bg-muted/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Target className="w-5 h-5" /></div>
                    <div className="text-left">
                        <h3 className="font-fredoka font-bold">Study Roadmap</h3>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Project Timeline</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-2" onClick={() => setViewStart(d => addDays(d, -7))}><ChevronLeft className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" className="h-9 rounded-xl border-2 font-bold px-4" onClick={() => setViewStart(startOfISOWeek(new Date()))}>Today</Button>
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-2" onClick={() => setViewStart(d => addDays(d, 7))}><ChevronRight className="w-4 h-4" /></Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar relative">
                <div className="flex min-w-max h-full">
                    <div className="w-48 sticky left-0 z-30 bg-card border-r shadow-sm">
                        <div className="h-12 border-b bg-muted/10" />
                        {plans.map((plan, i) => (
                            <div key={plan.id} className="h-[48px] flex items-center px-4 border-b group hover:bg-primary/[0.02] transition-colors">
                                <span className="text-xs font-bold truncate text-foreground/80">{plan.title}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="relative flex-1">
                        <GanttTimeline days={days} plans={plans} onGridClick={(d, r) => console.log(d, r)} />
                        
                        {plans.map((plan, i) => {
                            if (!plan.startDate || !plan.endDate) return null;
                            const pos = getTaskPosition(new Date(plan.startDate), new Date(plan.endDate), days[0]);
                            if (pos.left + pos.width < 0 || pos.left > days.length * CELL_WIDTH) return null;
                            
                            return (
                                <div 
                                    key={plan.id}
                                    className="absolute h-8 rounded-xl bg-primary/20 border-2 border-primary/30 flex items-center px-3 z-10 shadow-sm"
                                    style={{ 
                                        left: pos.left, 
                                        width: Math.min(pos.width, days.length * CELL_WIDTH - pos.left),
                                        top: 12 + 48 + (i * 48) + 8 // row height is 48, header is 48
                                    }}
                                >
                                    <div className="w-full h-1 bg-primary/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${(plan.tasks.filter((t: any) => t.status === 'completed').length / (plan.tasks.length || 1)) * 100}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
