import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORY_LABELS } from '@/types';

interface Props {
    card: any;
    onSelect: (id: string) => void;
}

export const CardOption = ({ card, onSelect }: Props) => (
  <button onClick={() => onSelect(card.id)} className={cn("w-full p-4 rounded-xl border-2 border-primary/20 bg-card hover:border-primary hover:shadow-soft transition-all flex items-center justify-between gap-3 text-left")}>
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center"><Sparkles className="w-6 h-6 text-primary-foreground" /></div>
      <div>
        <p className="font-semibold text-foreground">{card.name}</p>
        <p className="text-sm text-muted-foreground">{card.stickers.length} / {card.slots} stickers</p>
        {card.allowedCategories && card.allowedCategories.length > 0 && <div className="flex gap-1 mt-1">{card.allowedCategories.map((cat: any) => <span key={cat} className="text-xs">{CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS].emoji}</span>)}</div>}
      </div>
    </div>
    <div className="flex -space-x-1">{card.stickers.slice(-3).map((_: any, i: number) => <span key={i} className="text-lg">✨</span>)}</div>
  </button>
);
