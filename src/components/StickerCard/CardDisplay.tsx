import React from 'react';
import { Sparkles, Calendar, Gift } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StickerSlot } from '@/components/StickerSlot';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { statusConfig, getGridCols } from './StickerCardUtils';
import { EliteCard } from '../shared/EliteCard';

interface Props {
    card: any;
    allStickers: any[];
    onRedeem?: (id: string) => void;
}

export const CardDisplay = ({ card, allStickers, onRedeem }: Props) => {
  const statusInfo = statusConfig[card.status as keyof typeof statusConfig];
  const gridCols = getGridCols(card.slots);
  
  return (
    <EliteCard className={cn("p-6 border-4", card.status === 'done' ? "border-green-200" : "border-primary/10")} interactive={false}>
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2"><h3 className="font-fredoka text-xl font-bold">{card.name}</h3><Badge className={cn("text-[9px] font-black", statusInfo.color)}>{statusInfo.icon} <span className="ml-1">{statusInfo.label}</span></Badge></div>
        {card.goal && <div className="bg-primary/5 rounded-xl p-2 mt-2"><p className="text-xs font-bold text-primary">🎁 REWARD: {card.goal}</p></div>}
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}>
        {Array.from({ length: card.slots }).map((_, i) => {
          const owned = card.stickers[i];
          const sticker = owned ? allStickers.find(s => s.id === owned.stickerId) : null;
          return <StickerSlot key={i} sticker={sticker} ownedSticker={owned} index={i} />;
        })}
      </div>
      {card.status === 'done' && onRedeem && <Button variant="cute" size="lg" className="w-full mt-6 h-14 rounded-2xl gap-2 animate-bounce-soft" onClick={() => onRedeem(card.id)}><Gift className="w-5 h-5" /> Redeem Reward!</Button>}
    </EliteCard>
  );
};
