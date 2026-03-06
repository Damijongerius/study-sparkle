import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowLeft, LayoutDashboard, GitBranch, Clock, Settings2, Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EliteDateRange } from '@/components/shared/EliteDateRange';

interface Props {
    activeMode: string;
    agendaView: string;
    weekDays: Date[];
    onSwitchMode: (mode: any) => void;
    onSwitchAgendaView: (view: any) => void;
    onChangeWeek: (offset: number) => void;
    onResetToday: () => void;
    onOpenWizard: () => void;
    onOpenAddPlan: () => void;
}

export const PlannerHeader = ({ activeMode, agendaView, weekDays, onSwitchMode, onSwitchAgendaView, onChangeWeek, onResetToday, onOpenWizard, onOpenAddPlan }: Props) => {
  return (
    <div className="flex flex-col gap-3">
        <div className="bg-card/40 backdrop-blur-xl p-1.5 rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-primary/10 shadow-float order-2 lg:order-1">
            <div className="flex flex-col lg:flex-row items-center gap-3 lg:gap-4">
                <div className={cn("hidden lg:flex items-center justify-start flex-1 min-w-0", activeMode !== 'availability' && "lg:opacity-0")}>
                    {activeMode === 'availability' && (
                        agendaView === 'settings' ? 
                        <Button variant="cute" className="rounded-2xl px-4 h-10 gap-2" onClick={() => onSwitchAgendaView('calendar')}><ArrowLeft className="w-4 h-4" /> <span className="font-fredoka text-xs">Back</span></Button> :
                        <EliteDateRange startDate={weekDays[0]} endDate={weekDays[6]} onChange={onChangeWeek} />
                    )}
                </div>
                <div className="bg-white/60 backdrop-blur-md p-1 rounded-2xl flex gap-1 shadow-inner border border-primary/5 w-full lg:w-auto overflow-x-auto no-scrollbar">
                    {[{ id: 'long-term', label: 'Roadmap', icon: LayoutDashboard }, { id: 'flow', label: 'Execution', icon: GitBranch }, { id: 'availability', label: 'Availability', icon: Clock }].map((tab) => (
                        <Button key={tab.id} variant={activeMode === tab.id ? 'cute' : 'ghost'} className={cn("flex-1 lg:flex-none rounded-xl px-3 md:px-5 gap-2 h-10 transition-all text-xs", activeMode === tab.id ? "shadow-glow" : "text-muted-foreground/60")} onClick={() => onSwitchMode(tab.id as any)}><tab.icon className="w-3.5 h-3.5" /><span className="font-fredoka">{tab.label}</span></Button>
                    ))}
                </div>
                <div className="hidden lg:flex items-center justify-end flex-1 min-w-0">
                    {activeMode === 'long-term' && <Button className="h-10 rounded-xl font-bold gap-2 shadow-glow px-6" onClick={onOpenWizard}><Sparkles className="w-4 h-4 text-yellow-300" /> <span className="font-fredoka text-xs">New Goal</span></Button>}
                    {activeMode === 'flow' && <Button className="h-10 rounded-xl font-bold gap-2 shadow-glow px-6" onClick={onOpenAddPlan}><Plus className="w-4 h-4" /> <span className="font-fredoka text-xs">New Flow</span></Button>}
                    {activeMode === 'availability' && agendaView === 'calendar' && <Button variant="outline" className="h-10 rounded-xl px-4 gap-2 border-2" onClick={() => onSwitchAgendaView('settings')}><span className="font-fredoka text-xs font-bold">Config</span> <Settings2 className="w-4 h-4 opacity-60" /></Button>}
                </div>
            </div>
        </div>
        <div className="flex lg:hidden order-1">
            <div>
                {activeMode === 'availability' ? (
                    <div className="flex items-center gap-2 w-full">
                        {agendaView === 'settings' ? <Button variant="cute" className="w-full rounded-2xl h-12 gap-3" onClick={() => onSwitchAgendaView('calendar')}><ArrowLeft className="w-4 h-4" /> <span className="font-fredoka">Back to Schedule</span></Button> :
                        <>
                            <EliteDateRange startDate={weekDays[0]} endDate={weekDays[6]} onChange={onChangeWeek} size="lg" className="flex-1 bg-card/80 border-primary/10 shadow-soft" />
                            <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-2 shrink-0 bg-card/80 shadow-soft" onClick={() => onSwitchAgendaView('settings')}><Settings2 className="w-5 h-5 text-primary" /></Button>
                        </>}
                    </div>
                ) : (
                    <div className="w-full">
                        <Button className="w-full h-12 rounded-2xl font-bold gap-3 shadow-glow" onClick={() => activeMode === 'long-term' ? onOpenWizard() : onOpenAddPlan()}><Plus className="w-5 h-5" /><span className="font-fredoka">{activeMode === 'long-term' ? 'Add New Goal' : 'Create New Flow'}</span></Button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
