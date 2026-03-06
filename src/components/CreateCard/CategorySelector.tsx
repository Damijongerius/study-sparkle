import React from 'react';
import { ALL_CATEGORIES, CATEGORY_LABELS } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
    selected: string[];
    onToggle: (cat: any) => void;
}

export const CategorySelector = ({ selected, onToggle }: Props) => (
  <div className="space-y-2">
    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Allowed Categories</label>
    <div className="flex flex-wrap gap-2">
      {ALL_CATEGORIES.map(c => (
        <button key={c} type="button" onClick={() => onToggle(c)} className={cn("px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all", selected.includes(c) ? "bg-primary text-white border-primary shadow-glow-sm" : "bg-muted/50 border-muted hover:border-primary/30")}>
          {(CATEGORY_LABELS as any)[c].emoji} {(CATEGORY_LABELS as any)[c].label}
        </button>
      ))}
    </div>
    {selected.length === 0 && <p className="text-[10px] text-muted-foreground italic ml-1">All categories allowed</p>}
  </div>
);
