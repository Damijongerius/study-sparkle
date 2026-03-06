import React from 'react';
import { Moon, X } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { useStudyStoreContext } from '@/hooks/useStudyStoreContext';
import { DAYS, HOURS, DEFAULT_SLEEP, getStyleColor, getClassNameColor } from './AgendaUtils';
import { EliteCard } from '../shared/EliteCard';

interface Props {
    weekDays: Date[];
    currentTime: Date;
    onGridClick: (dateStr: string, day: number, hour: number) => void;
    startInteraction: (e: React.MouseEvent, item: any, type: string) => void;
    preview: any;
}

export const AgendaGrid = ({ weekDays, currentTime, onGridClick, startInteraction, preview }: Props) => {
  const store = useStudyStoreContext();
  const settings = store.agendaSettings;

  const isToday = (date: Date) => {
      const today = new Date();
      return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const isOutOfAgenda = (day: number, hour: number) => {
      const time = hour * 60;
      const daySetting = (settings?.outOfAgenda || []).find(s => s.day === day) || DEFAULT_SLEEP;
      return daySetting.sleepTime > daySetting.wakeTime ? (time < daySetting.wakeTime || time >= daySetting.sleepTime) : (time >= daySetting.sleepTime && time < daySetting.wakeTime);
  };

  const renderSleepBlocks = (dayIndex: number) => {
    const daySetting = (settings?.outOfAgenda || []).find(s => s.day === dayIndex) || DEFAULT_SLEEP;
    const { wakeTime, sleepTime } = daySetting;
    const blocks = sleepTime > wakeTime ? [{ start: 0, end: wakeTime }, { start: sleepTime, end: 1440 }] : [{ start: sleepTime, end: wakeTime }];

    return blocks.map((block, i) => (
        <div key={i} className="absolute inset-x-0 bg-slate-100/60 z-0 pointer-events-none border-y border-slate-200/50 flex flex-col items-center justify-center overflow-hidden" style={{ top: (block.start / 60) * 64, height: ((block.end - block.start) / 60) * 64 }}>
            <div className="opacity-[0.03] absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
            <Moon className="w-5 h-5 text-slate-400/20 mb-1" />
            <span className="text-[9px] font-black uppercase text-slate-400/30">Rest Period</span>
        </div>
    ));
  };

  return (
    <EliteCard className="overflow-hidden" variant="solid">
        <div className="overflow-auto custom-scrollbar max-h-[750px]">
            <div className="min-w-[1000px] flex flex-col relative">
                <div className="flex border-b bg-card shrink-0 h-16 sticky top-0 z-50">
                    <div className="w-[80px] border-r border-muted/20 shrink-0" />
                    {weekDays.map((date, i) => (
                        <div key={i} className={cn("flex-1 flex flex-col items-center justify-center border-r border-muted/20 last:border-r-0", isToday(date) && "bg-primary/[0.03]")}>
                            <span className={cn("font-black uppercase tracking-widest text-[10px]", isToday(date) ? "text-primary" : "text-muted-foreground/50")}>{DAYS[i].slice(0,3)}</span>
                            <span className={cn("text-lg font-fredoka font-bold leading-none mt-1", isToday(date) ? "text-primary" : "text-foreground")}>{date.getDate()}</span>
                        </div>
                    ))}
                </div>
                <div className="flex relative bg-white">
                    <div className="w-[80px] shrink-0 border-r border-muted/20 bg-muted/5 sticky left-0 z-30">
                        {HOURS.map(hour => <div key={hour} className="h-16 flex items-start justify-center pt-2 text-[10px] font-black text-muted-foreground/30 uppercase">{hour === 0 ? '' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}</div>)}
                    </div>
                    {weekDays.map((date, dayIndex) => {
                        const dateStr = formatDate(date);
                        if (!dateStr) return null;
                        const isCurrentDay = isToday(date);
                        return (
                            <div key={dayIndex} className={cn("flex-1 relative border-r border-muted/20 last:border-r-0 h-[1536px]", isCurrentDay && "bg-primary/[0.01]")}>
                                {isCurrentDay && <div className="absolute left-0 right-0 z-40 flex items-center pointer-events-none" style={{ top: ((currentTime.getHours() * 60 + currentTime.getMinutes()) / 60) * 64 }}><div className="w-2 h-2 rounded-full bg-primary -ml-1" /><div className="flex-1 h-0.5 bg-primary/40" /></div>}
                                {renderSleepBlocks(dayIndex)}
                                {HOURS.map(h => <div key={h} className="absolute w-full border-b border-muted/10 h-16 box-border cursor-cell hover:bg-primary/[0.03]" style={{ top: h * 64 }} onClick={(e) => onGridClick(dateStr, dayIndex, h)} />)}
                                {store.agendaItems.filter(it => it.date === dateStr).map(item => {
                                    const action = settings?.actions.find(a => a.id === item.actionId);
                                    const calendar = settings?.calendars.find(c => c.id === item.calendarId) || settings?.calendars[0];
                                    const isPreview = preview?.id === item.id;
                                    const dStart = isPreview ? preview.start : item.startTime;
                                    const dEnd = isPreview ? preview.end : item.endTime;
                                    return (
                                        <div key={item.id} style={{ top: (dStart / 60) * 64, height: ((dEnd - dStart) / 60) * 64, ...getStyleColor(calendar?.color || action?.color || '#cbd5e1') }} className={cn("absolute left-0.5 right-0.5 rounded-lg shadow-sm border-2 p-1.5 group z-10", getClassNameColor(calendar?.color || action?.color || 'bg-slate-200'), isPreview ? "z-20 shadow-float ring-4 ring-primary/20 opacity-90 cursor-grabbing" : "cursor-grab")} onMouseDown={(e) => startInteraction(e, item, 'move')}>
                                            <div className="absolute -top-1.5 left-0 right-0 h-4 cursor-ns-resize z-20" onMouseDown={(e) => startInteraction(e, item, 'resize-top')} />
                                            <div className="flex flex-col h-full pointer-events-none select-none text-white">
                                                <div className="flex items-start justify-between gap-1 overflow-hidden">
                                                    <span className="text-[10px] font-black uppercase truncate">{item.title}</span>
                                                    <button onClick={(e) => { e.stopPropagation(); store.deleteAgendaItem(item.id); }} onMouseDown={(e) => e.stopPropagation()} className="pointer-events-auto opacity-0 group-hover:opacity-100 text-white/60 hover:text-white"><X className="w-3 h-3" /></button>
                                                </div>
                                                <span className="text-[8px] font-bold text-white/60">{Math.floor(dStart/60)}:{(dStart%60).toString().padStart(2,'0')}</span>
                                            </div>
                                            <div className="absolute -bottom-1.5 left-0 right-0 h-4 cursor-ns-resize z-20" onMouseDown={(e) => startInteraction(e, item, 'resize-bottom')} />
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    </EliteCard>
  );
};
