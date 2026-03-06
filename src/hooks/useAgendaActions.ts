import { useCallback } from 'react';
import type { StudyState, AgendaItem, AgendaSettings, AvailabilitySlot, AvailabilityCategory } from '@/types';

export const useAgendaActions = (
  updateState: (updater: (prev: StudyState) => StudyState) => void
) => {
  const toggleAvailabilitySlot = useCallback((day: number, startHour: number, category: AvailabilityCategory = 'study') => {
      updateState(prev => {
          const current = (prev.availability || []).find(s => s.day === day && s.startHour === startHour);
          let newSlots;
          if (current) {
              if (current.category === category) {
                  newSlots = prev.availability.filter(s => !(s.day === day && s.startHour === startHour));
              } else {
                  newSlots = prev.availability.map(s => s.day === day && s.startHour === startHour ? { ...s, category } : s);
              }
          } else {
              newSlots = [...(prev.availability || []), { day, startHour, category }];
          }
          return { ...prev, availability: newSlots };
      });
  }, [updateState]);

  const addAgendaItem = useCallback(async (item: Omit<AgendaItem, 'id'>) => {
      const id = `agenda-${Date.now()}`;
      const newItem = { ...item, id };
      updateState(prev => ({ ...prev, agendaItems: [...(prev.agendaItems || []), newItem] }));
      return newItem;
  }, [updateState]);

  const deleteAgendaItem = useCallback(async (id: string) => {
      updateState(prev => ({ ...prev, agendaItems: (prev.agendaItems || []).filter(i => i.id !== id) }));
  }, [updateState]);

  const updateAgendaSettings = useCallback(async (settings: Partial<AgendaSettings>) => {
      updateState(prev => ({ ...prev, agendaSettings: { ...(prev.agendaSettings || {}), ...settings } as AgendaSettings }));
  }, [updateState]);

  return { toggleAvailabilitySlot, addAgendaItem, deleteAgendaItem, updateAgendaSettings };
};
