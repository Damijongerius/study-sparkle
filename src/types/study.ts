import { Sticker, OwnedSticker, StickerCard } from './stickers';
import { ActivityLog, Reminder, Notification } from './activity';
import { Plan } from './planner';
import { AvailabilitySlot, AgendaItem, AgendaSettings } from './agenda';

export * from './stickers';
export * from './activity';
export * from './planner';
export * from './agenda';

export interface DailyCooldown { [stickerId: string]: string; }

export interface StudyState {
  totalPoints: number;
  ownedStickers: OwnedSticker[];
  totalStudyMinutes: number;
  studySessions: number;
  stickerCards: StickerCard[];
  dailyCooldowns: DailyCooldown;
  activityLogs: ActivityLog[];
  reminders: Reminder[];
  notifications: Notification[];
  plans: Plan[];
  availability: AvailabilitySlot[]; 
  agendaItems: AgendaItem[];
  agendaSettings: AgendaSettings;
  dailyIntent?: { energy: string; persona: string; time: string; date: string; };
}
