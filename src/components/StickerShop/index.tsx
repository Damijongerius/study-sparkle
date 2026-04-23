import React from 'react';
import { StickerItem } from './StickerItem';

interface Props {
  stickers: any[];
  points: number;
  onPurchase: (id: string) => boolean;
  hasSticker: (id: string) => boolean;
  getStickerCount: (id: string) => number;
  canPurchaseToday: (id: string) => boolean;
  getTimeUntilNextPurchase: (id: string) => string | null;
}

export function StickerShop({
  stickers,
  points,
  onPurchase,
  getStickerCount,
  canPurchaseToday,
  getTimeUntilNextPurchase
}: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {stickers.map(sticker => (
        <StickerItem
          key={sticker.id}
          sticker={sticker}
          canAfford={points >= sticker.cost}
          onPurchase={onPurchase}
          ownedCount={getStickerCount(sticker.id)}
          cooldown={!canPurchaseToday(sticker.id) ? getTimeUntilNextPurchase(sticker.id) : null}
        />
      ))}
    </div>
  );
}
