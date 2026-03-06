import React from 'react';
import { Sparkles, Check, Gift } from 'lucide-react';
import { CardStatus } from '@/types';

export const statusConfig: Record<CardStatus, { label: string; color: string; icon: React.ReactNode }> = {
  'in-progress': { label: 'In Progress', color: 'bg-primary/20 text-primary', icon: React.createElement(Sparkles, { className: "w-3 h-3" }) },
  'done': { label: 'Complete!', color: 'bg-green-100 text-green-700', icon: React.createElement(Check, { className: "w-3 h-3" }) },
  'redeemed': { label: 'Redeemed', color: 'bg-purple-100 text-purple-700', icon: React.createElement(Gift, { className: "w-3 h-3" }) },
};

export const getGridCols = (slots: number) => {
  if (slots <= 9) return 3;
  if (slots <= 16) return 4;
  return 5;
};
