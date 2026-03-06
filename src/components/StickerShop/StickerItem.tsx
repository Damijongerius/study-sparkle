import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
    sticker: any;
    canAfford: boolean;
    onPurchase: (id: string) => void;
    ownedCount: number;
    cooldown: string | null;
}

export const StickerItem = ({ sticker, canAfford, onPurchase, ownedCount, cooldown }: Props) => (
  <div className={cn("p-4 rounded-3xl border-2 transition-all group flex flex-col items-center justify-between gap-3", canAfford ? "bg-white border-primary/10 hover:border-primary/30" : "bg-muted/30 border-transparent opacity-80")}>
    <div className="relative">
        <div className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-300">{sticker.emoji}</div>
        {ownedCount > 0 && <div className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm">{ownedCount}</div>}
    </div>
    <div className="text-center w-full min-w-0"><p className="font-bold text-sm truncate leading-tight">{sticker.name}</p><p className="text-[10px] font-black text-primary/60 mt-0.5">{sticker.cost} 🌟</p></div>
    <Button variant={cooldown ? 'ghost' : canAfford ? 'cute' : 'outline'} size="sm" className="w-full rounded-xl font-bold h-9" disabled={!!cooldown || !canAfford} onClick={() => onPurchase(sticker.id)}>
        {cooldown ? cooldown : canAfford ? 'Buy' : 'Soon'}
    </Button>
  </div>
);
