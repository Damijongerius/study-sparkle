import { useState, useEffect } from 'react';

export interface Sticker {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  category: 'animals' | 'food' | 'nature' | 'sparkles';
}

export interface OwnedSticker {
  stickerId: string;
  earnedAt: Date;
}

interface StudyState {
  totalPoints: number;
  ownedStickers: OwnedSticker[];
  totalStudyMinutes: number;
  studySessions: number;
}

const STICKERS: Sticker[] = [
  { id: 'bunny', name: 'Happy Bunny', emoji: '🐰', cost: 50, category: 'animals' },
  { id: 'cat', name: 'Sleepy Cat', emoji: '😺', cost: 50, category: 'animals' },
  { id: 'bear', name: 'Study Bear', emoji: '🐻', cost: 75, category: 'animals' },
  { id: 'panda', name: 'Panda Pal', emoji: '🐼', cost: 100, category: 'animals' },
  { id: 'unicorn', name: 'Magic Unicorn', emoji: '🦄', cost: 150, category: 'animals' },
  { id: 'strawberry', name: 'Sweet Strawberry', emoji: '🍓', cost: 30, category: 'food' },
  { id: 'donut', name: 'Yummy Donut', emoji: '🍩', cost: 40, category: 'food' },
  { id: 'icecream', name: 'Ice Cream Dream', emoji: '🍦', cost: 45, category: 'food' },
  { id: 'cake', name: 'Birthday Cake', emoji: '🎂', cost: 80, category: 'food' },
  { id: 'boba', name: 'Bubble Tea', emoji: '🧋', cost: 60, category: 'food' },
  { id: 'flower', name: 'Pretty Flower', emoji: '🌸', cost: 35, category: 'nature' },
  { id: 'rainbow', name: 'Rainbow Magic', emoji: '🌈', cost: 90, category: 'nature' },
  { id: 'star', name: 'Shiny Star', emoji: '⭐', cost: 55, category: 'sparkles' },
  { id: 'sparkles', name: 'Sparkle Time', emoji: '✨', cost: 40, category: 'sparkles' },
  { id: 'heart', name: 'Love Heart', emoji: '💖', cost: 65, category: 'sparkles' },
  { id: 'crown', name: 'Study Queen', emoji: '👑', cost: 200, category: 'sparkles' },
];

const STORAGE_KEY = 'cutesy-study-state';

const getInitialState = (): StudyState => {
  if (typeof window === 'undefined') {
    return { totalPoints: 0, ownedStickers: [], totalStudyMinutes: 0, studySessions: 0 };
  }
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        ownedStickers: parsed.ownedStickers.map((s: any) => ({
          ...s,
          earnedAt: new Date(s.earnedAt)
        }))
      };
    } catch {
      return { totalPoints: 0, ownedStickers: [], totalStudyMinutes: 0, studySessions: 0 };
    }
  }
  return { totalPoints: 0, ownedStickers: [], totalStudyMinutes: 0, studySessions: 0 };
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

  const purchaseSticker = (stickerId: string): boolean => {
    const sticker = STICKERS.find(s => s.id === stickerId);
    if (!sticker || state.totalPoints < sticker.cost) {
      return false;
    }

    setState(prev => ({
      ...prev,
      totalPoints: prev.totalPoints - sticker.cost,
      ownedStickers: [...prev.ownedStickers, { stickerId, earnedAt: new Date() }]
    }));
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
  };
};
