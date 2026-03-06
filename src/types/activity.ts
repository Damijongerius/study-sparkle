export type ActivityType = 'study_complete' | 'study_pause' | 'sticker_purchase' | 'card_complete' | 'card_redeem' | 'journal_entry' | 'reminder_set' | 'reminder_triggered';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  timestamp: Date;
  details: {
    points?: number; minutes?: number; effectiveness?: number;
    stickerId?: string; stickerName?: string; cardId?: string;
    cardName?: string; journalText?: string; reminderText?: string;
    reminderMinutes?: number;
  };
}

export interface Reminder {
  id: string; text: string; triggerAt: Date; createdAt: Date; triggered: boolean;
}

export type NotificationType = 'gift_card_completed' | 'gift_card_redeemed';

export interface Notification {
  id: string; type: NotificationType; fromUsername: string; cardName: string; createdAt: Date; read: boolean;
}
