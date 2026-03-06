import React from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORY_LABELS } from '@/types';

interface Props { card: any; }

export const IncompatibleCardOption = ({ card }: Props) => (
  <div className={cn("w-full p-4 rounded-xl border-2 border-muted bg-muted/30 flex items-center justify-between gap-3 text-left opacity-50")}>
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center"><Lock className="w-5 h-5 text-muted-foreground" /></div>
      <div>
        <p className="font-semibold text-muted-foreground">{card.name}</p>
        <div className="flex gap-1 mt-1">{card.allowedCategories?.map((cat: any) => <span key={cat} className="text-xs">{CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS].emoji}</span>)}</div>
      </div>
    </div>
  </div>
);
