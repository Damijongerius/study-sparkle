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
