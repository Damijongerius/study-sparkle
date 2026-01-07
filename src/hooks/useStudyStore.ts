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

export interface StickerCard {
  id: string;
  name: string;
  slots: number;
  stickers: OwnedSticker[];
  completedAt?: Date;
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

const STORAGE_KEY = 'cutesy-study-state';

const createNewCard = (index: number): StickerCard => {
  const template = CARD_TEMPLATES[Math.min(index, CARD_TEMPLATES.length - 1)];
  return {
    id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: template.name,
    slots: template.slots,
    stickers: [],
  };
};

const getInitialState = (): StudyState => {
  if (typeof window === 'undefined') {
    return { 
      totalPoints: 0, 
      ownedStickers: [], 
      totalStudyMinutes: 0, 
      studySessions: 0,
      stickerCards: [createNewCard(0)],
      dailyCooldowns: {},
    };
  }
  
  const stored = localStorage.getItem(STORAGE_KEY);
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
          stickers: card.stickers.map((s: any) => ({
            ...s,
            earnedAt: new Date(s.earnedAt)
          })),
          completedAt: card.completedAt ? new Date(card.completedAt) : undefined,
        })),
        dailyCooldowns: parsed.dailyCooldowns || {},
      };
      
      // Ensure at least one active card exists
      if (!state.stickerCards.some((c: StickerCard) => !c.completedAt)) {
        state.stickerCards.push(createNewCard(state.stickerCards.length));
      }
      
      return state;
    } catch {
      return { 
        totalPoints: 0, 
        ownedStickers: [], 
        totalStudyMinutes: 0, 
        studySessions: 0,
        stickerCards: [createNewCard(0)],
        dailyCooldowns: {},
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
  };
};

const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

export const useStudyStore = () => {
  const [state, setState] = useState<StudyState>(getInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addPoints = (points: number, minutes: number) => {
    setState(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + points,
      totalStudyMinutes: prev.totalStudyMinutes + minutes,
      studySessions: prev.studySessions + 1,
    }));
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

  const purchaseSticker = (stickerId: string): boolean => {
    const sticker = STICKERS.find(s => s.id === stickerId);
    if (!sticker || state.totalPoints < sticker.cost) {
      return false;
    }

    if (!canPurchaseToday(stickerId)) {
      return false;
    }

    const newOwnedSticker: OwnedSticker = { stickerId, earnedAt: new Date() };
    
    setState(prev => {
      // Find the current active card (not completed)
      const updatedCards = [...prev.stickerCards];
      let activeCardIndex = updatedCards.findIndex(c => !c.completedAt);
      
      if (activeCardIndex === -1) {
        // All cards completed, create new one
        updatedCards.push(createNewCard(updatedCards.length));
        activeCardIndex = updatedCards.length - 1;
      }
      
      const activeCard = { ...updatedCards[activeCardIndex] };
      activeCard.stickers = [...activeCard.stickers, newOwnedSticker];
      
      // Check if card is now complete
      if (activeCard.stickers.length >= activeCard.slots) {
        activeCard.completedAt = new Date();
        // Create next card
        updatedCards.push(createNewCard(updatedCards.length));
      }
      
      updatedCards[activeCardIndex] = activeCard;
      
      return {
        ...prev,
        totalPoints: prev.totalPoints - sticker.cost,
        ownedStickers: [...prev.ownedStickers, newOwnedSticker],
        stickerCards: updatedCards,
        dailyCooldowns: {
          ...prev.dailyCooldowns,
          [stickerId]: getTodayDateString(),
        },
      };
    });
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
    addPoints,
    purchaseSticker,
    hasSticker,
    getStickerCount,
    canPurchaseToday,
    getTimeUntilNextPurchase,
  };
};
