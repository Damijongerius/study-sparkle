import { useState, useEffect } from 'react';

export interface Sticker {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  category: 'animals' | 'food' | 'nature' | 'sparkles' | 'space' | 'cozy';
}

export interface OwnedSticker {
  stickerId: string;
  earnedAt: Date;
}

export type CardStatus = 'in-progress' | 'done' | 'redeemed';

export interface StickerCard {
  id: string;
  name: string;
  slots: number;
  stickers: OwnedSticker[];
  status: CardStatus;
  completedAt?: Date;
  redeemedAt?: Date;
}

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

interface DailyCooldown {
  [stickerId: string]: string; // ISO date string of last purchase
}

interface StudyState {
  totalPoints: number;
  ownedStickers: OwnedSticker[];
  totalStudyMinutes: number;
  studySessions: number;
  stickerCards: StickerCard[];
  dailyCooldowns: DailyCooldown;
  activityLogs: ActivityLog[];
  reminders: Reminder[];
}

const STICKERS: Sticker[] = [
  // Animals
  { id: 'bunny', name: 'Happy Bunny', emoji: '🐰', cost: 50, category: 'animals' },
  { id: 'cat', name: 'Sleepy Cat', emoji: '😺', cost: 50, category: 'animals' },
  { id: 'bear', name: 'Study Bear', emoji: '🐻', cost: 75, category: 'animals' },
  { id: 'panda', name: 'Panda Pal', emoji: '🐼', cost: 100, category: 'animals' },
  { id: 'unicorn', name: 'Magic Unicorn', emoji: '🦄', cost: 150, category: 'animals' },
  { id: 'owl', name: 'Wise Owl', emoji: '🦉', cost: 80, category: 'animals' },
  { id: 'fox', name: 'Clever Fox', emoji: '🦊', cost: 90, category: 'animals' },
  { id: 'butterfly', name: 'Pretty Butterfly', emoji: '🦋', cost: 60, category: 'animals' },
  { id: 'penguin', name: 'Cool Penguin', emoji: '🐧', cost: 70, category: 'animals' },
  { id: 'koala', name: 'Koala Cuddles', emoji: '🐨', cost: 85, category: 'animals' },
  
  // Food
  { id: 'strawberry', name: 'Sweet Strawberry', emoji: '🍓', cost: 30, category: 'food' },
  { id: 'donut', name: 'Yummy Donut', emoji: '🍩', cost: 40, category: 'food' },
  { id: 'icecream', name: 'Ice Cream Dream', emoji: '🍦', cost: 45, category: 'food' },
  { id: 'cake', name: 'Birthday Cake', emoji: '🎂', cost: 80, category: 'food' },
  { id: 'boba', name: 'Bubble Tea', emoji: '🧋', cost: 60, category: 'food' },
  { id: 'cookie', name: 'Choco Cookie', emoji: '🍪', cost: 35, category: 'food' },
  { id: 'cupcake', name: 'Pink Cupcake', emoji: '🧁', cost: 55, category: 'food' },
  { id: 'candy', name: 'Sweet Candy', emoji: '🍬', cost: 25, category: 'food' },
  { id: 'lollipop', name: 'Lollipop', emoji: '🍭', cost: 30, category: 'food' },
  { id: 'cherries', name: 'Cherry Twins', emoji: '🍒', cost: 40, category: 'food' },
  
  // Nature
  { id: 'flower', name: 'Pretty Flower', emoji: '🌸', cost: 35, category: 'nature' },
  { id: 'rainbow', name: 'Rainbow Magic', emoji: '🌈', cost: 90, category: 'nature' },
  { id: 'sunflower', name: 'Sunny Flower', emoji: '🌻', cost: 45, category: 'nature' },
  { id: 'tulip', name: 'Tulip Love', emoji: '🌷', cost: 40, category: 'nature' },
  { id: 'mushroom', name: 'Magic Mushroom', emoji: '🍄', cost: 50, category: 'nature' },
  { id: 'leaf', name: 'Lucky Leaf', emoji: '🍀', cost: 55, category: 'nature' },
  { id: 'rose', name: 'Red Rose', emoji: '🌹', cost: 65, category: 'nature' },
  { id: 'hibiscus', name: 'Hibiscus', emoji: '🌺', cost: 45, category: 'nature' },
  
  // Sparkles
  { id: 'star', name: 'Shiny Star', emoji: '⭐', cost: 55, category: 'sparkles' },
  { id: 'sparkles', name: 'Sparkle Time', emoji: '✨', cost: 40, category: 'sparkles' },
  { id: 'heart', name: 'Love Heart', emoji: '💖', cost: 65, category: 'sparkles' },
  { id: 'crown', name: 'Study Queen', emoji: '👑', cost: 200, category: 'sparkles' },
  { id: 'gem', name: 'Pink Gem', emoji: '💎', cost: 120, category: 'sparkles' },
  { id: 'ribbon', name: 'Gift Ribbon', emoji: '🎀', cost: 45, category: 'sparkles' },
  { id: 'balloon', name: 'Party Balloon', emoji: '🎈', cost: 35, category: 'sparkles' },
  { id: 'gift', name: 'Surprise Gift', emoji: '🎁', cost: 75, category: 'sparkles' },
  { id: 'trophy', name: 'Golden Trophy', emoji: '🏆', cost: 180, category: 'sparkles' },
  
  // Space
  { id: 'moon', name: 'Sleepy Moon', emoji: '🌙', cost: 70, category: 'space' },
  { id: 'planet', name: 'Pink Planet', emoji: '🪐', cost: 95, category: 'space' },
  { id: 'rocket', name: 'Study Rocket', emoji: '🚀', cost: 110, category: 'space' },
  { id: 'alien', name: 'Cute Alien', emoji: '👽', cost: 85, category: 'space' },
  { id: 'comet', name: 'Comet Trail', emoji: '☄️', cost: 100, category: 'space' },
  
  // Cozy
  { id: 'coffee', name: 'Study Coffee', emoji: '☕', cost: 40, category: 'cozy' },
  { id: 'book', name: 'Favorite Book', emoji: '📚', cost: 50, category: 'cozy' },
  { id: 'candle', name: 'Cozy Candle', emoji: '🕯️', cost: 45, category: 'cozy' },
  { id: 'blanket', name: 'Soft Blanket', emoji: '🧶', cost: 55, category: 'cozy' },
  { id: 'lamp', name: 'Study Lamp', emoji: '💡', cost: 60, category: 'cozy' },
  { id: 'plant', name: 'Desk Plant', emoji: '🪴', cost: 50, category: 'cozy' },
];

const CARD_TEMPLATES = [
  { name: 'Starter Card', slots: 9 },
  { name: 'Collector Card', slots: 12 },
  { name: 'Pro Card', slots: 16 },
  { name: 'Master Card', slots: 20 },
  { name: 'Ultimate Card', slots: 25 },
];

const getStorageKey = (username?: string) => `cutesy-study-state${username ? `-${username.toLowerCase()}` : ''}`;

const createNewCard = (index: number): StickerCard => {
  const template = CARD_TEMPLATES[Math.min(index, CARD_TEMPLATES.length - 1)];
  return {
    id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: template.name,
    slots: template.slots,
    stickers: [],
    status: 'in-progress',
  };
};

const generateActivityId = () => `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const getInitialState = (username?: string): StudyState => {
  if (typeof window === 'undefined') {
    return { 
      totalPoints: 0, 
      ownedStickers: [], 
      totalStudyMinutes: 0, 
      studySessions: 0,
      stickerCards: [createNewCard(0)],
      dailyCooldowns: {},
      activityLogs: [],
      reminders: [],
    };
  }
  
  const storageKey = getStorageKey(username);
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const state = {
        ...parsed,
        ownedStickers: (parsed.ownedStickers || []).map((s: any) => ({
          ...s,
          earnedAt: new Date(s.earnedAt)
        })),
        stickerCards: (parsed.stickerCards || [createNewCard(0)]).map((card: any) => ({
          ...card,
          status: card.status || (card.completedAt ? 'done' : 'in-progress'),
          stickers: card.stickers.map((s: any) => ({
            ...s,
            earnedAt: new Date(s.earnedAt)
          })),
          completedAt: card.completedAt ? new Date(card.completedAt) : undefined,
          redeemedAt: card.redeemedAt ? new Date(card.redeemedAt) : undefined,
        })),
        dailyCooldowns: parsed.dailyCooldowns || {},
        activityLogs: (parsed.activityLogs || []).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        })),
        reminders: (parsed.reminders || []).map((r: any) => ({
          ...r,
          triggerAt: new Date(r.triggerAt),
          createdAt: new Date(r.createdAt),
        })),
      };
      
      return state;
    } catch {
      return { 
        totalPoints: 0, 
        ownedStickers: [], 
        totalStudyMinutes: 0, 
        studySessions: 0,
        stickerCards: [createNewCard(0)],
        dailyCooldowns: {},
        activityLogs: [],
        reminders: [],
      };
    }
  }
  return { 
    totalPoints: 0, 
    ownedStickers: [], 
    totalStudyMinutes: 0, 
    studySessions: 0,
    stickerCards: [createNewCard(0)],
    dailyCooldowns: {},
    activityLogs: [],
    reminders: [],
  };
};

const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

export const useStudyStore = (username?: string) => {
  const [state, setState] = useState<StudyState>(() => getInitialState(username));
  const [pendingSticker, setPendingSticker] = useState<string | null>(null);

  useEffect(() => {
    const storageKey = getStorageKey(username);
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, username]);

  const addActivityLog = (type: ActivityType, details: ActivityLog['details']) => {
    const newLog: ActivityLog = {
      id: generateActivityId(),
      type,
      timestamp: new Date(),
      details,
    };
    
    setState(prev => ({
      ...prev,
      activityLogs: [newLog, ...prev.activityLogs].slice(0, 500), // Keep last 500 logs
    }));
  };

  const addJournalEntry = (text: string) => {
    addActivityLog('journal_entry', { journalText: text });
  };

  const addReminder = (text: string, minutes: number) => {
    const id = `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const triggerAt = new Date(Date.now() + minutes * 60 * 1000);
    
    const newReminder: Reminder = {
      id,
      text,
      triggerAt,
      createdAt: new Date(),
      triggered: false,
    };
    
    setState(prev => ({
      ...prev,
      reminders: [...prev.reminders, newReminder],
    }));
    
    addActivityLog('reminder_set', { reminderText: text, reminderMinutes: minutes });
    
    return newReminder;
  };

  const triggerReminder = (reminderId: string) => {
    const reminder = state.reminders.find(r => r.id === reminderId);
    if (!reminder || reminder.triggered) return;
    
    setState(prev => ({
      ...prev,
      reminders: prev.reminders.map(r => 
        r.id === reminderId ? { ...r, triggered: true } : r
      ),
    }));
    
    addActivityLog('reminder_triggered', { reminderText: reminder.text });
  };

  const dismissReminder = (reminderId: string) => {
    setState(prev => ({
      ...prev,
      reminders: prev.reminders.filter(r => r.id !== reminderId),
    }));
  };

  const getActiveReminders = (): Reminder[] => {
    return state.reminders.filter(r => !r.triggered);
  };

  const getDueReminders = (): Reminder[] => {
    const now = new Date();
    return state.reminders.filter(r => !r.triggered && new Date(r.triggerAt) <= now);
  };
  const addPoints = (points: number, minutes: number, effectiveness?: number) => {
    setState(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + points,
      totalStudyMinutes: prev.totalStudyMinutes + minutes,
      studySessions: prev.studySessions + 1,
    }));
    
    addActivityLog('study_complete', { points, minutes, effectiveness });
  };

  const logPause = () => {
    addActivityLog('study_pause', { points: -5 });
  };

  const canPurchaseToday = (stickerId: string): boolean => {
    const lastPurchase = state.dailyCooldowns[stickerId];
    if (!lastPurchase) return true;
    return lastPurchase !== getTodayDateString();
  };

  const getTimeUntilNextPurchase = (stickerId: string): string | null => {
    const lastPurchase = state.dailyCooldowns[stickerId];
    if (!lastPurchase || lastPurchase !== getTodayDateString()) return null;
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  // Get cards that can receive stickers (in-progress only)
  const getAvailableCards = (): StickerCard[] => {
    return state.stickerCards.filter(c => c.status === 'in-progress' && c.stickers.length < c.slots);
  };

  // Initiate sticker purchase - returns true if modal should show
  const initiatePurchase = (stickerId: string): boolean => {
    const sticker = STICKERS.find(s => s.id === stickerId);
    if (!sticker || state.totalPoints < sticker.cost) {
      return false;
    }

    if (!canPurchaseToday(stickerId)) {
      return false;
    }

    setPendingSticker(stickerId);
    return true;
  };

  // Cancel pending purchase
  const cancelPurchase = () => {
    setPendingSticker(null);
  };

  // Confirm purchase to specific card
  const confirmPurchase = (cardId: string): boolean => {
    if (!pendingSticker) return false;
    
    const sticker = STICKERS.find(s => s.id === pendingSticker);
    if (!sticker || state.totalPoints < sticker.cost) {
      setPendingSticker(null);
      return false;
    }

    const cardIndex = state.stickerCards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      setPendingSticker(null);
      return false;
    }

    const card = state.stickerCards[cardIndex];
    if (card.status !== 'in-progress' || card.stickers.length >= card.slots) {
      setPendingSticker(null);
      return false;
    }

    const newOwnedSticker: OwnedSticker = { stickerId: pendingSticker, earnedAt: new Date() };
    
    setState(prev => {
      const updatedCards = [...prev.stickerCards];
      const targetCard = { ...updatedCards[cardIndex] };
      targetCard.stickers = [...targetCard.stickers, newOwnedSticker];
      
      // Check if card is now full
      if (targetCard.stickers.length >= targetCard.slots) {
        targetCard.status = 'done';
        targetCard.completedAt = new Date();
      }
      
      updatedCards[cardIndex] = targetCard;
      
      return {
        ...prev,
        totalPoints: prev.totalPoints - sticker.cost,
        ownedStickers: [...prev.ownedStickers, newOwnedSticker],
        stickerCards: updatedCards,
        dailyCooldowns: {
          ...prev.dailyCooldowns,
          [pendingSticker!]: getTodayDateString(),
        },
      };
    });

    addActivityLog('sticker_purchase', { 
      stickerId: pendingSticker, 
      stickerName: sticker.name,
      points: -sticker.cost,
      cardId,
      cardName: card.name,
    });

    setPendingSticker(null);
    return true;
  };

  // Create a new card
  const createCard = (): StickerCard => {
    const newCard = createNewCard(state.stickerCards.length);
    setState(prev => ({
      ...prev,
      stickerCards: [...prev.stickerCards, newCard],
    }));
    return newCard;
  };

  // Redeem a completed card
  const redeemCard = (cardId: string): boolean => {
    const cardIndex = state.stickerCards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return false;
    
    const card = state.stickerCards[cardIndex];
    if (card.status !== 'done') return false;

    setState(prev => {
      const updatedCards = [...prev.stickerCards];
      updatedCards[cardIndex] = {
        ...updatedCards[cardIndex],
        status: 'redeemed',
        redeemedAt: new Date(),
      };
      return {
        ...prev,
        stickerCards: updatedCards,
      };
    });

    addActivityLog('card_redeem', { cardId, cardName: card.name });
    return true;
  };

  const hasSticker = (stickerId: string): boolean => {
    return state.ownedStickers.some(s => s.stickerId === stickerId);
  };

  const getStickerCount = (stickerId: string): number => {
    return state.ownedStickers.filter(s => s.stickerId === stickerId).length;
  };

  return {
    ...state,
    stickers: STICKERS,
    pendingSticker,
    pendingStickerData: pendingSticker ? STICKERS.find(s => s.id === pendingSticker) : null,
    addPoints,
    logPause,
    initiatePurchase,
    confirmPurchase,
    cancelPurchase,
    createCard,
    redeemCard,
    getAvailableCards,
    hasSticker,
    getStickerCount,
    canPurchaseToday,
    getTimeUntilNextPurchase,
    addJournalEntry,
    addReminder,
    triggerReminder,
    dismissReminder,
    getActiveReminders,
    getDueReminders,
  };
};

export type StudyStore = ReturnType<typeof useStudyStore>;
