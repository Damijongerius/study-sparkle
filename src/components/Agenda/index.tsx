import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyStoreContext } from '@/hooks/useStudyStoreContext';
import { AgendaGrid } from './AgendaGrid';
import { AgendaSettingsView } from './AgendaSettingsView';
import { AgendaDialogs } from './AgendaDialogs';
import { HOUR_HEIGHT, ACTION_COLORS } from './AgendaUtils';

interface AgendaProps {
    view?: 'calendar' | 'settings';
    onViewChange?: (view: 'calendar' | 'settings') => void;
    weekStart: Date;
    setWeekStart: (date: Date) => void;
}

/** Main Agenda Component */
export function AgendaComponent({ view: externalView, onViewChange, weekStart }: AgendaProps) {
  const store = useStudyStoreContext();
  const [internalView, setInternalView] = useState<'calendar' | 'settings'>('calendar');
  const view = externalView || internalView;
  const setView = onViewChange || setInternalView;

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
      const timer = setInterval(() => setCurrentTime(new Date()), 60000);
      return () => clearInterval(timer);
  }, []);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
  }), [weekStart]);

  const [preview, setPreview] = useState<{ id: string; start: number; end: number } | null>(null);
  const interactionRef = useRef<{ itemId: string; type: string; startY: number; initialStart: number; initialEnd: number } | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', day: 0, date: '', startHour: 9, startMinute: 0, duration: 60, actionId: 'task', calendarId: 'personal' });

  const startInteraction = (e: React.MouseEvent, item: any, type: string) => {
      e.stopPropagation(); e.preventDefault();
      interactionRef.current = { itemId: item.id, type, startY: e.clientY, initialStart: item.startTime, initialEnd: item.endTime };
      setPreview({ id: item.id, start: item.startTime, end: item.endTime });
  };

  useEffect(() => {
      const handleMove = (e: MouseEvent) => {
          if (!interactionRef.current) return;
          const inter = interactionRef.current;
          const deltaMinutes = Math.round(((e.clientY - inter.startY) / HOUR_HEIGHT) * 60 / 15) * 15;
          let nextStart = inter.initialStart, nextEnd = inter.initialEnd;

          if (inter.type === 'move') { nextStart = Math.max(0, Math.min(1440 - (inter.initialEnd - inter.initialStart), inter.initialStart + deltaMinutes)); nextEnd = nextStart + (inter.initialEnd - inter.initialStart); }
          else if (inter.type === 'resize-bottom') nextEnd = Math.max(inter.initialStart + 15, Math.min(1440, inter.initialEnd + deltaMinutes));
          else if (inter.type === 'resize-top') nextStart = Math.max(0, Math.min(inter.initialEnd - 15, inter.initialStart + deltaMinutes));

          setPreview({ id: inter.itemId, start: nextStart, end: nextEnd });
      };

      const handleUp = () => {
          if (interactionRef.current && preview) {
              store.updateState((prev: any) => ({ ...prev, agendaItems: (prev.agendaItems || []).map((it: any) => it.id === preview.id ? { ...it, startTime: preview.start, endTime: preview.end } : it) }));
          }
          interactionRef.current = null; setPreview(null);
      };

      window.addEventListener('mousemove', handleMove); window.addEventListener('mouseup', handleUp);
      return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
  }, [store, preview]);

  return (
    <div className="w-full">
      <div className="relative">
          {view === 'calendar' ? (
              <div key="calendar">
                  <AgendaGrid 
                    weekDays={weekDays} 
                    currentTime={currentTime} 
                    preview={preview} 
                    onGridClick={(date, day, hour) => { setNewItem({ ...newItem, date, day, startHour: hour }); setIsCreateOpen(true); }} 
                    startInteraction={startInteraction} 
                  />
              </div>
          ) : (
              <div key="settings">
                  <AgendaSettingsView />
              </div>
          )}
      </div>
      <AgendaDialogs isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} newItem={newItem} setNewItem={setNewItem} />
    </div>
  );
}
