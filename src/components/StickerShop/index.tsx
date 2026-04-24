import React from 'react';
import { ShoppingBag, Sparkles, Clock } from 'lucide-react';
import { StickerItem } from './StickerItem';
import { EliteCard } from '@/components/shared/EliteCard';
import { Badge } from '@/components/ui/badge';

interface Props {
    stickers: any[];
    points: number;
    onPurchase: (id: string) => boolean;
    hasSticker: (id: string) => boolean;
    getStickerCount: (id: string) => number;
    canPurchaseToday: (id: string) => boolean;
    getTimeUntilNextPurchase: (id: string) => string | null;
}

export const StickerShop = ({ stickers, points, onPurchase, hasSticker, getStickerCount, canPurchaseToday, getTimeUntilNextPurchase }: Props) => {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-primary/5 p-6 rounded-3xl border-2 border-primary/10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl">🛍️</div>
                    <div className="text-left">
                        <h3 className="text-xl font-fredoka font-bold text-primary">Sticker Shop</h3>
                        <p className="text-sm text-muted-foreground font-medium">Use your hard-earned points! ✨</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border-2 border-primary/10 shadow-sm">
                    <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-2xl font-black font-fredoka text-primary">{points}</span>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Points</span>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {stickers.map((sticker) => (
                    <StickerItem 
                        key={sticker.id} 
                        sticker={sticker} 
                        canAfford={points >= sticker.cost} 
                        onPurchase={onPurchase} 
                        ownedCount={getStickerCount(sticker.id)}
                        cooldown={getTimeUntilNextPurchase(sticker.id)}
                    />
                ))}
            </div>
        </div>
    );
};
