/**
 * Study-related Types
 */

export interface Sticker {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  category: StickerCategory;
}

export interface OwnedSticker {
  stickerId: string;
  earnedAt: Date;
}

export type CardStatus = 'in-progress' | 'done' | 'redeemed';

export interface StickerCard {
  id: string;
  name: string;
  goal?: string;
  slots: number;
  stickers: OwnedSticker[];
  status: CardStatus;
  completedAt?: Date;
  redeemedAt?: Date;
  givenBy?: string;
  givenTo?: string;
  allowedCategories?: StickerCategory[];
}

export type StickerCategory = 
  | 'animals' 
  | 'food' 
  | 'nature' 
  | 'sparkles' 
  | 'space' 
  | 'cozy' 
  | 'sports' 
  | 'music' 
  | 'weather';

export const ALL_CATEGORIES: StickerCategory[] = [
  'animals', 
  'food', 
  'nature', 
  'sparkles', 
  'space', 
  'cozy', 
  'sports', 
  'music', 
  'weather'
];

export const CATEGORY_LABELS: Record<StickerCategory, { label: string; emoji: string }> = {
  animals: { label: 'Animals', emoji: '🐰' },
  food: { label: 'Food', emoji: '🍓' },
  nature: { label: 'Nature', emoji: '🌸' },
  sparkles: { label: 'Sparkles', emoji: '✨' },
  space: { label: 'Space', emoji: '🚀' },
  cozy: { label: 'Cozy', emoji: '☕' },
  sports: { label: 'Sports', emoji: '⚽' },
  music: { label: 'Music', emoji: '🎵' },
  weather: { label: 'Weather', emoji: '🌤️' },
};

export type ActivityType = 
  | 'study_complete' 
  | 'study_pause' 
  | 'sticker_purchase' 
  | 'card_complete' 
  | 'card_redeem'
  | 'journal_entry'
  | 'reminder_set'
  | 'reminder_triggered';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  timestamp: Date;
  details: {
    points?: number;
    minutes?: number;
    effectiveness?: number;
    stickerId?: string;
    stickerName?: string;
    cardId?: string;
    cardName?: string;
    journalText?: string;
    reminderText?: string;
    reminderMinutes?: number;
  };
}

export interface Reminder {
  id: string;
  text: string;
  triggerAt: Date;
  createdAt: Date;
  triggered: boolean;
}

export type NotificationType = 'gift_card_completed' | 'gift_card_redeemed';

export interface Notification {
  id: string;
  type: NotificationType;
  fromUsername: string;
  cardName: string;
  createdAt: Date;
  read: boolean;
}

export interface DailyCooldown {
  [stickerId: string]: string;
}

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
}

