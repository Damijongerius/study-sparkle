import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatSeconds, cn } from '@/lib/utils';

interface Props {
    timeLeft: number;
    isRunning: boolean;
    onToggle: () => void;
    onReset: () => void;
    encouragement: string;
}

export const TimerDisplay = ({ timeLeft, isRunning, onToggle, onReset, encouragement }: Props) => (
  <div className="flex flex-col items-center gap-8">
    <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border-8 border-primary/10" />
      <div className="text-6xl md:text-8xl font-black font-fredoka tabular-nums text-primary drop-shadow-glow">{formatSeconds(timeLeft)}</div>
    </div>
    <div className="text-xl font-medium text-muted-foreground animate-pulse">{encouragement}</div>
    <div className="flex gap-4">
      <Button variant="outline" size="icon" className="w-16 h-16 rounded-2xl border-2 hover:bg-destructive/10 hover:text-destructive" onClick={onReset}><RotateCcw className="w-8 h-8" /></Button>
      <Button size="lg" className={cn("w-24 h-24 rounded-3xl shadow-glow transition-all", isRunning ? "bg-orange-500 hover:bg-orange-600" : "bg-primary hover:bg-primary/90")} onClick={onToggle}>
        {isRunning ? <Pause className="w-12 h-12 fill-white" /> : <Play className="w-12 h-12 fill-white translate-x-1" />}
      </Button>
      <Button variant="outline" size="icon" className="w-16 h-16 rounded-2xl border-2"><Sparkles className="w-8 h-8 text-yellow-500" /></Button>
    </div>
  </div>
);
