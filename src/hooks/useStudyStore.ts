import { useState, useEffect } from 'react';

export interface Sticker {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  category: 'animals' | 'food' | 'nature' | 'sparkles' | 'space' | 'cozy' | 'sports' | 'music' | 'weather';
}

export interface OwnedSticker {
  stickerId: string;
  earnedAt: Date;
}

export type CardStatus = 'in-progress' | 'done' | 'redeemed';

export interface StickerCard {
  id: string;
  name: string;
  goal?: string; // Reward description for completing the card
  slots: number;
  stickers: OwnedSticker[];
  status: CardStatus;
  completedAt?: Date;
  redeemedAt?: Date;
  givenBy?: string; // Username of who gave this card
  givenTo?: string; // Username of who this card is for
  allowedCategories?: StickerCategory[]; // Empty or undefined = all categories allowed
}

export type StickerCategory = 'animals' | 'food' | 'nature' | 'sparkles' | 'space' | 'cozy' | 'sports' | 'music' | 'weather';

export const ALL_CATEGORIES: StickerCategory[] = ['animals', 'food', 'nature', 'sparkles', 'space', 'cozy', 'sports', 'music', 'weather'];

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
  notifications: Notification[];
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
  
  // Sports
  { id: 'soccer', name: 'Soccer Ball', emoji: '⚽', cost: 45, category: 'sports' },
  { id: 'basketball', name: 'Basketball', emoji: '🏀', cost: 50, category: 'sports' },
  { id: 'tennis', name: 'Tennis Ball', emoji: '🎾', cost: 40, category: 'sports' },
  { id: 'medal', name: 'Gold Medal', emoji: '🥇', cost: 150, category: 'sports' },
  { id: 'skateboard', name: 'Cool Skateboard', emoji: '🛹', cost: 70, category: 'sports' },
  { id: 'bowling', name: 'Strike!', emoji: '🎳', cost: 55, category: 'sports' },
  { id: 'dart', name: 'Bullseye', emoji: '🎯', cost: 65, category: 'sports' },
  { id: 'pingpong', name: 'Ping Pong', emoji: '🏓', cost: 45, category: 'sports' },
  
  // Music
  { id: 'musicnote', name: 'Music Note', emoji: '🎵', cost: 35, category: 'music' },
  { id: 'guitar', name: 'Cool Guitar', emoji: '🎸', cost: 80, category: 'music' },
  { id: 'piano', name: 'Piano Keys', emoji: '🎹', cost: 90, category: 'music' },
  { id: 'microphone', name: 'Sing Along', emoji: '🎤', cost: 60, category: 'music' },
  { id: 'headphones', name: 'Headphones', emoji: '🎧', cost: 55, category: 'music' },
  { id: 'drum', name: 'Drum Beat', emoji: '🥁', cost: 70, category: 'music' },
  { id: 'violin', name: 'Violin', emoji: '🎻', cost: 100, category: 'music' },
  { id: 'saxophone', name: 'Saxophone', emoji: '🎷', cost: 85, category: 'music' },
  
  // Weather
  { id: 'sun', name: 'Sunny Day', emoji: '☀️', cost: 40, category: 'weather' },
  { id: 'cloud', name: 'Fluffy Cloud', emoji: '☁️', cost: 30, category: 'weather' },
  { id: 'rain', name: 'Rainy Day', emoji: '🌧️', cost: 45, category: 'weather' },
  { id: 'snow', name: 'Snowflake', emoji: '❄️', cost: 50, category: 'weather' },
  { id: 'thunder', name: 'Thunder', emoji: '⚡', cost: 75, category: 'weather' },
  { id: 'tornado', name: 'Tornado', emoji: '🌪️', cost: 120, category: 'weather' },
  { id: 'umbrella', name: 'Umbrella', emoji: '☂️', cost: 55, category: 'weather' },
  { id: 'suncloud', name: 'Partly Cloudy', emoji: '⛅', cost: 35, category: 'weather' },
];

const getStorageKey = (username?: string) => `cutesy-study-state${username ? `-${username.toLowerCase()}` : ''}`;
const getGiftCardsKey = (username: string) => `cutesy-gift-cards-${username.toLowerCase()}`;

const createNewCard = (name?: string, slots?: number, goal?: string, allowedCategories?: StickerCategory[]): StickerCard => {
  return {
    id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: name || 'New Card',
    slots: slots || 9,
    goal: goal || undefined,
    stickers: [],
    status: 'in-progress',
    allowedCategories: allowedCategories || undefined,
  };
};

const createGiftCard = (name: string, goal: string, slots: number, givenBy: string, givenTo: string, allowedCategories?: StickerCategory[]): StickerCard => {
  return {
    id: `gift-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    goal,
    slots,
    stickers: [],
    status: 'in-progress',
    givenBy,
    givenTo,
    allowedCategories: allowedCategories || undefined,
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
      stickerCards: [createNewCard('Starter Card', 9)],
      dailyCooldowns: {},
      activityLogs: [],
      reminders: [],
      notifications: [],
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
          stickerCards: (parsed.stickerCards || [createNewCard('Starter Card', 9)]).map((card: any) => ({
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
          notifications: (parsed.notifications || []).map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt),
          })),
        };
      
      return state;
    } catch {
      return { 
        totalPoints: 0, 
        ownedStickers: [], 
        totalStudyMinutes: 0, 
        studySessions: 0,
        stickerCards: [createNewCard('Starter Card', 9)],
        dailyCooldowns: {},
        activityLogs: [],
        reminders: [],
        notifications: [],
      };
    }
  }
  return { 
    totalPoints: 0, 
    ownedStickers: [], 
    totalStudyMinutes: 0, 
    studySessions: 0,
    stickerCards: [createNewCard('Starter Card', 9)],
    dailyCooldowns: {},
    activityLogs: [],
    reminders: [],
    notifications: [],
  };
};

const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

export const useStudyStore = (username?: string) => {
  const [state, setState] = useState<StudyState>(() => getInitialState(username));
  const [pendingSticker, setPendingSticker] = useState<string | null>(null);

  // Check for gift cards from friends on mount
  useEffect(() => {
    if (!username) return;
    
    const giftCardsKey = getGiftCardsKey(username);
    const stored = localStorage.getItem(giftCardsKey);
    if (stored) {
      try {
        const giftCards: StickerCard[] = JSON.parse(stored).map((card: any) => ({
          ...card,
          stickers: card.stickers.map((s: any) => ({
            ...s,
            earnedAt: new Date(s.earnedAt),
          })),
          completedAt: card.completedAt ? new Date(card.completedAt) : undefined,
          redeemedAt: card.redeemedAt ? new Date(card.redeemedAt) : undefined,
        }));
        
        // Add gift cards that aren't already in state
        const existingIds = new Set(state.stickerCards.map(c => c.id));
        const newGiftCards = giftCards.filter(gc => !existingIds.has(gc.id));
        
        if (newGiftCards.length > 0) {
          setState(prev => ({
            ...prev,
            stickerCards: [...newGiftCards, ...prev.stickerCards],
          }));
          // Clear the gift cards queue
          localStorage.removeItem(giftCardsKey);
        }
      } catch {}
    }
  }, [username]);

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

  const deductPoints = (amount: number, _reason: 'pause' | 'reset') => {
    if (!amount || amount <= 0) return;
    setState(prev => ({
      ...prev,
      totalPoints: Math.max(0, prev.totalPoints - amount),
    }));
  };

  const logPause = () => {
    deductPoints(5, 'pause');
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

  // Get cards that can receive stickers (in-progress only, respecting category restrictions)
  const getAvailableCards = (stickerCategory?: StickerCategory): StickerCard[] => {
    return state.stickerCards.filter(c => {
      if (c.status !== 'in-progress' || c.stickers.length >= c.slots) return false;
      // If a category is specified, check if the card accepts it
      if (stickerCategory && c.allowedCategories && c.allowedCategories.length > 0) {
        return c.allowedCategories.includes(stickerCategory);
      }
      return true;
    });
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

    const willComplete = card.stickers.length + 1 >= card.slots;

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

    if (willComplete) {
      addActivityLog('card_complete', { cardId, cardName: card.name });

      // If this was a gifted card, notify the giver
      if (username && card.givenBy) {
        try {
          const giverKey = getStorageKey(card.givenBy);
          const stored = localStorage.getItem(giverKey);
          if (stored) {
            const giverState = JSON.parse(stored);
            const notif: Notification = {
              id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              type: 'gift_card_completed',
              fromUsername: username,
              cardName: card.name,
              createdAt: new Date(),
              read: false,
            };
            giverState.notifications = [
              { ...notif, createdAt: notif.createdAt.toISOString() },
              ...(giverState.notifications || []),
            ];
            localStorage.setItem(giverKey, JSON.stringify(giverState));
          }
        } catch {
          // ignore
        }
      }
    }

    setPendingSticker(null);
    return true;
  };

  // Create a new card with custom options
  const createCard = (name?: string, goal?: string, slots?: number, allowedCategories?: StickerCategory[]): StickerCard => {
    const newCard = createNewCard(name, slots, goal, allowedCategories);
    setState(prev => ({
      ...prev,
      stickerCards: [...prev.stickerCards, newCard],
    }));
    return newCard;
  };

  // Send a gift card to a friend
  const sendGiftCard = (friendUsername: string, name: string, goal: string, slots: number): boolean => {
    if (!username) return false;
    
    const giftCard = createGiftCard(name, goal, slots, username, friendUsername);
    
    // Store in friend's gift cards queue
    const giftCardsKey = getGiftCardsKey(friendUsername);
    const existing = localStorage.getItem(giftCardsKey);
    const giftCards: StickerCard[] = existing ? JSON.parse(existing) : [];
    giftCards.push(giftCard);
    localStorage.setItem(giftCardsKey, JSON.stringify(giftCards));
    
    return true;
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

    // If gifted, notify giver that it was redeemed
    if (username && card.givenBy) {
      try {
        const giverKey = getStorageKey(card.givenBy);
        const stored = localStorage.getItem(giverKey);
        if (stored) {
          const giverState = JSON.parse(stored);
          const notif: Notification = {
            id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            type: 'gift_card_redeemed',
            fromUsername: username,
            cardName: card.name,
            createdAt: new Date(),
            read: false,
          };
          giverState.notifications = [
            { ...notif, createdAt: notif.createdAt.toISOString() },
            ...(giverState.notifications || []),
          ];
          localStorage.setItem(giverKey, JSON.stringify(giverState));
        }
      } catch {
        // ignore
      }
    }

    return true;
  };

  const hasSticker = (stickerId: string): boolean => {
    return state.ownedStickers.some(s => s.stickerId === stickerId);
  };

  const getStickerCount = (stickerId: string): number => {
    return state.ownedStickers.filter(s => s.stickerId === stickerId).length;
  };

  const markNotificationRead = (notificationId: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
    }));
  };

  const clearNotifications = () => {
    setState(prev => ({
      ...prev,
      notifications: [],
    }));
  };

  return {
    ...state,
    stickers: STICKERS,
    pendingSticker,
    pendingStickerData: pendingSticker ? STICKERS.find(s => s.id === pendingSticker) : null,
    addPoints,
    deductPoints,
    logPause,
    initiatePurchase,
    confirmPurchase,
    cancelPurchase,
    createCard,
    sendGiftCard,
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
    markNotificationRead,
    clearNotifications,
  };
};

export type StudyStore = ReturnType<typeof useStudyStore>;
