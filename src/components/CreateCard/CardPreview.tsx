import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { CATEGORY_LABELS } from '@/types';

interface Props {
    name: string; goal: string; slots: number; cats: string[]; from?: string;
}

export const CardPreview = ({ name, goal, slots, cats, from = 'You' }: Props) => (
  <motion.div className="bg-gradient-card rounded-2xl p-4 border-2 border-primary/30 relative overflow-hidden" initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
    <div className="absolute top-2 left-2"><Sparkles className="w-4 h-4 text-yellow-soft animate-sparkle" /></div>
    <div className="absolute top-2 right-2"><Sparkles className="w-3 h-3 text-pink-medium animate-sparkle" /></div>
    <div className="text-center space-y-2 py-4">
      <p className="font-fredoka text-lg font-bold text-foreground">{name || 'Card Title'}</p>
      {goal && <div className="bg-primary/10 rounded-xl px-3 py-2 mx-4"><p className="text-[10px] font-black text-primary uppercase">🎁 REWARD</p><p className="text-sm">{goal}</p></div>}
      <p className="text-[10px] font-black uppercase text-muted-foreground/60">From: {from} 💝</p>
      <div className="flex flex-wrap justify-center gap-1 mt-2">{cats.map(c => <span key={c} className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{(CATEGORY_LABELS as any)[c].emoji} {(CATEGORY_LABELS as any)[c].label}</span>)}</div>
      <div className="flex justify-center gap-1 mt-3">
        {Array.from({ length: Math.min(slots, 9) }).map((_, i) => <div key={i} className="w-6 h-6 rounded bg-muted/50 border border-dashed border-primary/20 flex items-center justify-center text-[10px] opacity-50">?</div>)}
        {slots > 9 && <span className="text-[10px] font-black text-muted-foreground">+{slots - 9}</span>}
      </div>
    </div>
  </motion.div>
);
