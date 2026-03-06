import { useCallback } from 'react';
import { giftCardApi, cardsApi } from '@/lib/api';
import type { StudyState, StickerCard, StickerCategory, OwnedSticker, Sticker } from '@/types';
import { toast } from 'sonner';
import { createNewCard } from './useStudyStoreUtils';
import { getTodayStr } from '@/lib/utils';

export const useStickerActions = (
  state: StudyState,
  updateState: (updater: (prev: StudyState) => StudyState) => void,
  STICKERS: Sticker[],
  pendingSticker: string | null,
  username?: string
) => {
  const canPurchaseToday = useCallback((stickerId: string): boolean => {
    return state.dailyCooldowns[stickerId] !== getTodayStr();
  }, [state.dailyCooldowns]);

  const getTimeUntilNextPurchase = useCallback((stickerId: string): string | null => {
    const last = state.dailyCooldowns[stickerId];
    if (!last || last !== getTodayStr()) return null;
    const now = new Date(), tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    return `${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m`;
  }, [state.dailyCooldowns]);

  const getAvailableCards = useCallback((cat?: StickerCategory): StickerCard[] => {
    return state.stickerCards.filter(c => {
      if (c.status !== 'in-progress' || c.stickers.length >= c.slots) return false;
      return !cat || !c.allowedCategories?.length || c.allowedCategories.includes(cat);
    });
  }, [state.stickerCards]);

  const confirmPurchase = useCallback((cardId: string): boolean => {
    if (!pendingSticker) return false;
    const sticker = STICKERS.find(s => s.id === pendingSticker);
    if (!sticker || state.totalPoints < sticker.cost) return false;
    const cardIndex = state.stickerCards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return false;
    const card = state.stickerCards[cardIndex];
    if (card.status !== 'in-progress' || card.stickers.length >= card.slots) return false;

    const newS: OwnedSticker = { stickerId: pendingSticker, earnedAt: new Date() };
    updateState(prev => {
      const cards = [...prev.stickerCards];
      const target = { ...cards[cardIndex], stickers: [...cards[cardIndex].stickers, newS] };
      if (target.stickers.length >= target.slots) { target.status = 'done'; target.completedAt = new Date(); }
      cards[cardIndex] = target;
      return { ...prev, totalPoints: prev.totalPoints - sticker.cost, ownedStickers: [...prev.ownedStickers, newS], stickerCards: cards, dailyCooldowns: { ...prev.dailyCooldowns, [pendingSticker]: getTodayStr() } };
    });
    if (card.givenBy && card.stickers.length + 1 >= card.slots) cardsApi.completeCard(cardId).catch(e => console.error(e));
    return true;
  }, [pendingSticker, state.totalPoints, state.stickerCards, updateState, STICKERS]);

  const createCard = useCallback(async (name: string, goal: string, slots: number, cats?: string[]) => {
    const newCard = createNewCard(name, slots, goal, cats as StickerCategory[]);
    updateState(prev => ({ ...prev, stickerCards: [...prev.stickerCards, newCard] }));
    return true;
  }, [updateState]);

  const sendGiftCard = useCallback(async (to: string, name: string, goal: string, slots: number, cats?: string[]) => {
    const res = await giftCardApi.sendGiftCard(to, name, goal, slots, cats);
    if (res.success) { toast.success(`Gift card sent to ${to}! 🎁`); return true; }
    toast.error(res.error || 'Failed to send gift');
    return false;
  }, []);

  const redeemCard = useCallback(async (cardId: string) => {
    updateState(prev => ({ ...prev, stickerCards: prev.stickerCards.map(c => c.id === cardId ? { ...c, status: 'redeemed' as const, redeemedAt: new Date() } : c) }));
    toast.success('Reward redeemed! Enjoy! 🥳');
  }, [updateState]);

  return { canPurchaseToday, getTimeUntilNextPurchase, getAvailableCards, confirmPurchase, createCard, sendGiftCard, redeemCard, hasSticker: (id: string) => state.ownedStickers.some(s => s.stickerId === id), getStickerCount: (id: string) => state.ownedStickers.filter(s => s.stickerId === id).length };
};
