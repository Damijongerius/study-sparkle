import React from 'react';
import { Target } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
    open: boolean;
    onSelect: (eff: number) => void;
}

export const EffectivenessDialog = ({ open, onSelect }: Props) => (
  <Dialog open={open}>
    <DialogContent className="rounded-[2rem] border-2 sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-2xl font-fredoka font-bold flex items-center gap-3"><Target className="text-primary" /> How was your focus?</DialogTitle>
        <DialogDescription>Rate your effectiveness to earn bonus points!</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 gap-3 py-4">
        {[
          { label: 'High Focus 🧠', eff: 1.2, color: 'bg-green-500' },
          { label: 'Moderate 🧘', eff: 1.0, color: 'bg-blue-500' },
          { label: 'Distracted 🌪️', eff: 0.8, color: 'bg-orange-500' }
        ].map((opt) => (
          <Button key={opt.label} onClick={() => onSelect(opt.eff)} className={`h-16 rounded-2xl text-lg font-bold shadow-soft ${opt.color}`}>{opt.label}</Button>
        ))}
      </div>
    </DialogContent>
  </Dialog>
);
