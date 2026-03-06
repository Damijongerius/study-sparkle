export type AvailabilityCategory = 'study' | 'class' | 'break' | 'sleep' | 'other';

export interface AvailabilitySlot {
  day: number; startHour: number; category: AvailabilityCategory;
}

export type AgendaItemType = 'task' | 'custom';

export interface Calendar {
  id: string; name: string; color: string; url?: string; isExternal: boolean;
}

export interface AgendaItem {
  id: string; title: string; day: number; date: string;
  startTime: number; endTime: number; type: AgendaItemType;
  actionId?: string; calendarId?: string;
}

export interface AgendaAction {
  id: string; label: string; color: string; isSystem?: boolean;
}

export interface AgendaSettings {
  actions: AgendaAction[];
  outOfAgenda: { day: number; wakeTime: number; sleepTime: number }[];
  calendars: Calendar[];
}
