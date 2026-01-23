import { useState, useEffect, useCallback, useRef } from 'react';
import { dataApi, giftCardApi, cardsApi, notificationsApi, ApiError } from '@/lib/api';
import type {
  Sticker,
  OwnedSticker,
  StickerCard,
  StickerCategory,
  ActivityType,
  ActivityLog,
  Reminder,
  Notification,
  DailyCooldown,
  StudyState,
} from '@/types';
import { ALL_CATEGORIES } from '@/types';
import {
    BackendActivity,
    BackendCard,
    BackendData,
    BackendNotificationType,
    BackendStickerEntry
} from "@/types/backend.ts";

const STICKERS: Sticker[] = [
  // Animals
{ id: 'bunny', name: 'Happy Bunny', emoji: '🐰', cost: 30, category: 'animals' },
{ id: 'cat', name: 'Sleepy Cat', emoji: '😺', cost: 30, category: 'animals' },
{ id: 'bear', name: 'Study Bear', emoji: '🐻', cost: 60, category: 'animals' },
{ id: 'panda', name: 'Panda Pal', emoji: '🐼', cost: 120, category: 'animals' },
{ id: 'unicorn', name: 'Magic Unicorn', emoji: '🦄', cost: 250, category: 'animals' },
{ id: 'owl', name: 'Wise Owl', emoji: '🦉', cost: 65, category: 'animals' },
{ id: 'fox', name: 'Clever Fox', emoji: '🦊', cost: 80, category: 'animals' },
{ id: 'butterfly', name: 'Pretty Butterfly', emoji: '🦋', cost: 45, category: 'animals' },
{ id: 'penguin', name: 'Cool Penguin', emoji: '🐧', cost: 70, category: 'animals' },
{ id: 'koala', name: 'Koala Cuddles', emoji: '🐨', cost: 90, category: 'animals' },

// Food
{ id: 'strawberry', name: 'Sweet Strawberry', emoji: '🍓', cost: 15, category: 'food' },
{ id: 'donut', name: 'Yummy Donut', emoji: '🍩', cost: 25, category: 'food' },
{ id: 'icecream', name: 'Ice Cream Dream', emoji: '🍦', cost: 30, category: 'food' },
{ id: 'cake', name: 'Birthday Cake', emoji: '🎂', cost: 70, category: 'food' },
{ id: 'boba', name: 'Bubble Tea', emoji: '🧋', cost: 40, category: 'food' },
{ id: 'cookie', name: 'Choco Cookie', emoji: '🍪', cost: 20, category: 'food' },
{ id: 'cupcake', name: 'Pink Cupcake', emoji: '🧁', cost: 35, category: 'food' },
{ id: 'candy', name: 'Sweet Candy', emoji: '🍬', cost: 10, category: 'food' },
{ id: 'lollipop', name: 'Lollipop', emoji: '🍭', cost: 15, category: 'food' },
{ id: 'cherries', name: 'Cherry Twins', emoji: '🍒', cost: 25, category: 'food' },

// Nature
{ id: 'flower', name: 'Pretty Flower', emoji: '🌸', cost: 20, category: 'nature' },
{ id: 'rainbow', name: 'Rainbow Magic', emoji: '🌈', cost: 150, category: 'nature' },
{ id: 'sunflower', name: 'Sunny Flower', emoji: '🌻', cost: 35, category: 'nature' },
{ id: 'tulip', name: 'Tulip Love', emoji: '🌷', cost: 30, category: 'nature' },
{ id: 'mushroom', name: 'Magic Mushroom', emoji: '🍄', cost: 45, category: 'nature' },
{ id: 'leaf', name: 'Lucky Leaf', emoji: '🍀', cost: 50, category: 'nature' },
{ id: 'rose', name: 'Red Rose', emoji: '🌹', cost: 80, category: 'nature' },
{ id: 'hibiscus', name: 'Hibiscus', emoji: '🌺', cost: 40, category: 'nature' },

// Sparkles
{ id: 'star', name: 'Shiny Star', emoji: '⭐', cost: 250, category: 'sparkles' },
{ id: 'sparkles', name: 'Sparkle Time', emoji: '✨', cost: 205, category: 'sparkles' },
{ id: 'heart', name: 'Love Heart', emoji: '💖', cost: 405, category: 'sparkles' },
{ id: 'crown', name: 'Study Queen', emoji: '👑', cost: 1350, category: 'sparkles' },
{ id: 'gem', name: 'Pink Gem', emoji: '💎', cost: 900, category: 'sparkles' },
{ id: 'ribbon', name: 'Gift Ribbon', emoji: '🎀', cost: 225, category: 'sparkles' },
{ id: 'balloon', name: 'Party Balloon', emoji: '🎈', cost: 135, category: 'sparkles' },
{ id: 'gift', name: 'Surprise Gift', emoji: '🎁', cost: 495, category: 'sparkles' },
{ id: 'trophy', name: 'Golden Trophy', emoji: '🏆', cost: 1125, category: 'sparkles' },

// Space
{ id: 'moon', name: 'Sleepy Moon', emoji: '🌙', cost: 80, category: 'space' },
{ id: 'planet', name: 'Pink Planet', emoji: '🪐', cost: 140, category: 'space' },
{ id: 'rocket', name: 'Study Rocket', emoji: '🚀', cost: 220, category: 'space' },
{ id: 'alien', name: 'Cute Alien', emoji: '👽', cost: 95, category: 'space' },
{ id: 'comet', name: 'Comet Trail', emoji: '☄️', cost: 160, category: 'space' },

// Cozy
{ id: 'coffee', name: 'Study Coffee', emoji: '☕', cost: 35, category: 'cozy' },
{ id: 'book', name: 'Favorite Book', emoji: '📚', cost: 50, category: 'cozy' },
{ id: 'candle', name: 'Cozy Candle', emoji: '🕯️', cost: 40, category: 'cozy' },
{ id: 'blanket', name: 'Soft Blanket', emoji: '🧶', cost: 60, category: 'cozy' },
{ id: 'lamp', name: 'Study Lamp', emoji: '💡', cost: 70, category: 'cozy' },
{ id: 'plant', name: 'Desk Plant', emoji: '🪴', cost: 50, category: 'cozy' },

// Sports
{ id: 'soccer', name: 'Soccer Ball', emoji: '⚽', cost: 45, category: 'sports' },
{ id: 'basketball', name: 'Basketball', emoji: '🏀', cost: 50, category: 'sports' },
{ id: 'tennis', name: 'Tennis Ball', emoji: '🎾', cost: 40, category: 'sports' },
{ id: 'medal', name: 'Gold Medal', emoji: '🥇', cost: 180, category: 'sports' },
{ id: 'skateboard', name: 'Cool Skateboard', emoji: '🛹', cost: 90, category: 'sports' },
{ id: 'bowling', name: 'Strike!', emoji: '🎳', cost: 60, category: 'sports' },
{ id: 'dart', name: 'Bullseye', emoji: '🎯', cost: 70, category: 'sports' },
{ id: 'pingpong', name: 'Ping Pong', emoji: '🏓', cost: 45, category: 'sports' },

// Music
{ id: 'musicnote', name: 'Music Note', emoji: '🎵', cost: 20, category: 'music' },
{ id: 'guitar', name: 'Cool Guitar', emoji: '🎸', cost: 85, category: 'music' },
{ id: 'piano', name: 'Piano Keys', emoji: '🎹', cost: 110, category: 'music' },
{ id: 'microphone', name: 'Sing Along', emoji: '🎤', cost: 65, category: 'music' },
{ id: 'headphones', name: 'Headphones', emoji: '🎧', cost: 55, category: 'music' },
{ id: 'drum', name: 'Drum Beat', emoji: '🥁', cost: 75, category: 'music' },
{ id: 'violin', name: 'Violin', emoji: '🎻', cost: 140, category: 'music' },
{ id: 'saxophone', name: 'Saxophone', emoji: '🎷', cost: 100, category: 'music' },

// Weather
{ id: 'sun', name: 'Sunny Day', emoji: '☀️', cost: 35, category: 'weather' },
{ id: 'cloud', name: 'Fluffy Cloud', emoji: '☁️', cost: 20, category: 'weather' },
{ id: 'rain', name: 'Rainy Day', emoji: '🌧️', cost: 40, category: 'weather' },
{ id: 'snow', name: 'Snowflake', emoji: '❄️', cost: 60, category: 'weather' },
{ id: 'thunder', name: 'Thunder', emoji: '⚡', cost: 120, category: 'weather' },
{ id: 'tornado', name: 'Tornado', emoji: '🌪️', cost: 220, category: 'weather' },
{ id: 'umbrella', name: 'Umbrella', emoji: '☂️', cost: 50, category: 'weather' },
{ id: 'suncloud', name: 'Partly Cloudy', emoji: '⛅', cost: 30, category: 'weather' },
];

const convertBackendData = (backendData: BackendData): StudyState => {
    const convertCard = (card: BackendCard): StickerCard => ({
        id:
            typeof card._id === 'string'
                ? card._id
                : card._id?.toString?.() || `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: card.name || 'New Card',
        goal: card.goal,
        slots: card.slots || 9,
        stickers: (card.stickers || []).map((s: BackendStickerEntry) => ({
            stickerId: s.stickerId,
            earnedAt: new Date(s.earnedAt),
        })),
        status: card.status || (card.completedAt ? 'done' : 'in-progress'),
        completedAt: card.completedAt ? new Date(card.completedAt) : undefined,
        redeemedAt: card.redeemedAt ? new Date(card.redeemedAt) : undefined,
        givenBy: card.givenBy,
        givenTo: card.givenTo,
        allowedCategories:
            card.allowedCategories && card.allowedCategories.length > 0 ? card.allowedCategories : undefined,
    });

    const convertActivity = (log: BackendActivity): ActivityLog => ({
        id:
            typeof log._id === 'string'
                ? log._id
                : log._id?.toString?.() || `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: log.type,
        timestamp: new Date(log.timestamp),
        details: (log.details as ActivityLog['details']) || {},
    });

    const convertNotification = (notif: BackendNotificationType): Notification => ({
        id:
            typeof notif._id === 'string'
                ? notif._id
                : notif._id?.toString?.() || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: notif.type,
        fromUsername: notif.fromUsername,
        cardName: notif.cardName,
        createdAt: new Date(notif.createdAt),
        read: notif.read || false,
    });

    return {
        totalPoints: backendData.totalPoints || 0,
        ownedStickers: (backendData.ownedStickers || []).map((s: BackendStickerEntry) => ({
            stickerId: s.stickerId,
            earnedAt: new Date(s.earnedAt),
        })),
        totalStudyMinutes: backendData.totalStudyMinutes || 0,
        studySessions: backendData.studySessions || 0,
        stickerCards: (backendData.stickerCards || []).map(convertCard),
        dailyCooldowns: backendData.dailyCooldowns
            ? Object.fromEntries(Object.entries(backendData.dailyCooldowns).map(([k, v]) => [k, String(v)]))
            : {},
        activityLogs: (backendData.activityLogs || []).map(convertActivity),
        reminders: [], // Backend doesn't store reminders yet - keeping local for now
        notifications: (backendData.notifications || []).map(convertNotification),
    };
};

// Convert frontend format to backend format
const convertToBackendFormat = (state: StudyState): any => {
  return {
    totalPoints: state.totalPoints,
    ownedStickers: state.ownedStickers.map(s => ({
      stickerId: s.stickerId,
      earnedAt: s.earnedAt,
    })),
    totalStudyMinutes: state.totalStudyMinutes,
    studySessions: state.studySessions,
    stickerCards: state.stickerCards.map(card => ({
      name: card.name,
      slots: card.slots,
      goal: card.goal,
      givenBy: card.givenBy,
      givenTo: card.givenTo,
      allowedCategories: card.allowedCategories || [],
      stickers: card.stickers.map(s => ({
        stickerId: s.stickerId,
        earnedAt: s.earnedAt,
      })),
      status: card.status,
      completedAt: card.completedAt,
      redeemedAt: card.redeemedAt,
    })),
    dailyCooldowns: state.dailyCooldowns,
    activityLogs: state.activityLogs.map(log => ({
      type: log.type,
      timestamp: log.timestamp,
      details: log.details,
    })),
    notifications: state.notifications.map(n => ({
      type: n.type,
      fromUsername: n.fromUsername,
      cardName: n.cardName,
      read: n.read,
      createdAt: n.createdAt,
    })),
  };
};

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

const generateActivityId = () => `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

export const useStudyStore = (username?: string) => {
  const [state, setState] = useState<StudyState>(() => ({
    totalPoints: 0,
    ownedStickers: [],
    totalStudyMinutes: 0,
    studySessions: 0,
    stickerCards: [createNewCard('Starter Card', 9)],
    dailyCooldowns: {},
    activityLogs: [],
    reminders: [],
    notifications: [],
  }));
  const [pendingSticker, setPendingSticker] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load data from API on mount
  useEffect(() => {
    if (!username) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const backendData = await dataApi.getUserData();
        const convertedData = convertBackendData(backendData);
        setState(convertedData);
      } catch (error) {
        console.error('Failed to load user data:', error);
        // Keep default state on error
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [username]);

  // Load notifications separately (they update more frequently)
  useEffect(() => {
    if (!username || isLoading) return;

    const loadNotifications = async () => {
      try {
        const response = await notificationsApi.getNotifications();
        setState(prev => ({
          ...prev,
          notifications: (response.notifications || []).map((n: any) => ({
            id: n._id?.toString() || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: n.type,
            fromUsername: n.fromUsername,
            cardName: n.cardName,
            createdAt: new Date(n.createdAt),
            read: n.read || false,
          })),
        }));
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [username, isLoading]);

  // Save data to API (debounced)
  const saveToBackend = useCallback(async (newState: StudyState) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const backendFormat = convertToBackendFormat(newState);
        await dataApi.updateUserData(backendFormat);
      } catch (error) {
        console.error('Failed to save user data:', error);
      }
    }, 1000); // Debounce by 1 second
  }, []);

  // Update state and save to backend
  const updateState = useCallback((updater: (prev: StudyState) => StudyState) => {
    setState(prev => {
      const newState = updater(prev);
      saveToBackend(newState);
      return newState;
    });
  }, [saveToBackend]);

  const addActivityLog = useCallback((type: ActivityType, details: ActivityLog['details']) => {
    const newLog: ActivityLog = {
      id: generateActivityId(),
      type,
      timestamp: new Date(),
      details,
    };

    // Save to backend immediately for activity logs
    dataApi.addActivity({
      type,
      timestamp: new Date(),
      details,
    }).catch(err => console.error('Failed to save activity:', err));

    updateState(prev => ({
      ...prev,
      activityLogs: [newLog, ...prev.activityLogs].slice(0, 500),
    }));
  }, [updateState]);

  const addJournalEntry = useCallback((text: string) => {
    addActivityLog('journal_entry', { journalText: text });
  }, [addActivityLog]);

  const addReminder = useCallback((text: string, minutes: number) => {
    const id = `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const triggerAt = new Date(Date.now() + minutes * 60 * 1000);

    const newReminder: Reminder = {
      id,
      text,
      triggerAt,
      createdAt: new Date(),
      triggered: false,
    };

    updateState(prev => ({
      ...prev,
      reminders: [...prev.reminders, newReminder],
    }));

    addActivityLog('reminder_set', { reminderText: text, reminderMinutes: minutes });

    return newReminder;
  }, [updateState, addActivityLog]);

  const triggerReminder = useCallback((reminderId: string) => {
    updateState(prev => {
      const reminder = prev.reminders.find(r => r.id === reminderId);
      if (!reminder || reminder.triggered) return prev;

      addActivityLog('reminder_triggered', { reminderText: reminder.text });

      return {
        ...prev,
        reminders: prev.reminders.map(r =>
          r.id === reminderId ? { ...r, triggered: true } : r
        ),
      };
    });
  }, [updateState, addActivityLog]);

  const dismissReminder = useCallback((reminderId: string) => {
    updateState(prev => ({
      ...prev,
      reminders: prev.reminders.filter(r => r.id !== reminderId),
    }));
  }, [updateState]);

  const getActiveReminders = useCallback((): Reminder[] => {
    return state.reminders.filter(r => !r.triggered);
  }, [state.reminders]);

  const getDueReminders = useCallback((): Reminder[] => {
    const now = new Date();
    return state.reminders.filter(r => !r.triggered && new Date(r.triggerAt) <= now);
  }, [state.reminders]);

  const addPoints = useCallback((points: number, minutes: number, effectiveness?: number) => {
    updateState(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + points,
      totalStudyMinutes: prev.totalStudyMinutes + minutes,
      studySessions: prev.studySessions + 1,
    }));

    addActivityLog('study_complete', { points, minutes, effectiveness });
  }, [updateState, addActivityLog]);

  const deductPoints = useCallback(async (amount: number, reason: 'pause' | 'reset') => {
    if (!amount || amount <= 0) return;

    try {
      const response = await dataApi.deductPoints(amount, reason);
      updateState(prev => ({
        ...prev,
        totalPoints: response.newTotal,
      }));
    } catch (error) {
      console.error('Failed to deduct points:', error);
      // Fallback: update locally
      updateState(prev => ({
        ...prev,
        totalPoints: Math.max(0, prev.totalPoints - amount),
      }));
    }
  }, [updateState]);

  const logPause = useCallback(() => {
    deductPoints(5, 'pause');
    addActivityLog('study_pause', { points: -5 });
  }, [deductPoints, addActivityLog]);

  const canPurchaseToday = useCallback((stickerId: string): boolean => {
    const lastPurchase = state.dailyCooldowns[stickerId];
    if (!lastPurchase) return true;
    return lastPurchase !== getTodayDateString();
  }, [state.dailyCooldowns]);

  const getTimeUntilNextPurchase = useCallback((stickerId: string): string | null => {
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
  }, [state.dailyCooldowns]);

  const getAvailableCards = useCallback((stickerCategory?: StickerCategory): StickerCard[] => {
    return state.stickerCards.filter(c => {
      if (c.status !== 'in-progress' || c.stickers.length >= c.slots) return false;
      if (stickerCategory && c.allowedCategories && c.allowedCategories.length > 0) {
        return c.allowedCategories.includes(stickerCategory);
      }
      return true;
    });
  }, [state.stickerCards]);

  const initiatePurchase = useCallback((stickerId: string): boolean => {
    const sticker = STICKERS.find(s => s.id === stickerId);
    if (!sticker || state.totalPoints < sticker.cost) {
      return false;
    }

    if (!canPurchaseToday(stickerId)) {
      return false;
    }

    setPendingSticker(stickerId);
    return true;
  }, [state.totalPoints, canPurchaseToday]);

  const cancelPurchase = useCallback(() => {
    setPendingSticker(null);
  }, []);

  const confirmPurchase = useCallback((cardId: string): boolean => {
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

    updateState(prev => {
      const updatedCards = [...prev.stickerCards];
      const targetCard = { ...updatedCards[cardIndex] };
      targetCard.stickers = [...targetCard.stickers, newOwnedSticker];

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

      // Notify backend that card is complete (for gift cards)
      if (card.givenBy) {
        cardsApi.completeCard(cardId).catch(err => console.error('Failed to notify card completion:', err));
      }
    }

    setPendingSticker(null);
    return true;
  }, [pendingSticker, state.totalPoints, state.stickerCards, updateState, addActivityLog]);

  const createCard = useCallback((name?: string, goal?: string, slots?: number, allowedCategories?: StickerCategory[]): StickerCard => {
    const newCard = createNewCard(name, slots, goal, allowedCategories);
    updateState(prev => ({
      ...prev,
      stickerCards: [...prev.stickerCards, newCard],
    }));
    return newCard;
  }, [updateState]);

  const sendGiftCard = useCallback(async (friendUsername: string, name: string, goal: string, slots: number, allowedCategories?: StickerCategory[]): Promise<boolean> => {
    if (!username) return false;

    try {
      await giftCardApi.sendGiftCard(
        friendUsername,
        name,
        goal,
        slots,
        allowedCategories
      );
      return true;
    } catch (error) {
      console.error('Failed to send gift card:', error);
      return false;
    }
  }, [username]);

  const redeemCard = useCallback(async (cardId: string): Promise<boolean> => {
    const cardIndex = state.stickerCards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return false;

    const card = state.stickerCards[cardIndex];
    if (card.status !== 'done') return false;

    updateState(prev => {
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
  }, [state.stickerCards, updateState, addActivityLog]);

  const hasSticker = useCallback((stickerId: string): boolean => {
    return state.ownedStickers.some(s => s.stickerId === stickerId);
  }, [state.ownedStickers]);

  const getStickerCount = useCallback((stickerId: string): number => {
    return state.ownedStickers.filter(s => s.stickerId === stickerId).length;
  }, [state.ownedStickers]);

  const markNotificationRead = useCallback(async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      updateState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Update optimistically
      updateState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
      }));
    }
  }, [updateState]);

  const clearNotifications = useCallback(async () => {
    try {
      await notificationsApi.clearAll();
      updateState(prev => ({
        ...prev,
        notifications: [],
      }));
    } catch (error) {
      console.error('Failed to clear notifications:', error);
      // Update optimistically
      updateState(prev => ({
        ...prev,
        notifications: [],
      }));
    }
  }, [updateState]);

  return {
    ...state,
    stickers: STICKERS,
    pendingSticker,
    pendingStickerData: pendingSticker ? STICKERS.find(s => s.id === pendingSticker) : null,
    isLoading,
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
