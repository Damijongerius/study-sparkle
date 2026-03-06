import React from 'react';
import { CheckCircle2, Timer, Sparkles, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStudyStoreContext } from '@/hooks/useStudyStoreContext';
import { EliteCard } from '@/components/shared/EliteCard';
import { cn } from '@/lib/utils';

interface Props {
    onReset: () => void;
    energy?: string;
}

export const ProgressSidebar = ({ onReset, energy }: Props) => {
  const store = useStudyStoreContext();

  return (
    <div className="space-y-6 text-left">
        <div className="p-6 bg-primary/5 rounded-[2.5rem] border-2 border-primary/10 space-y-6">
            <h3 className="text-lg font-fredoka font-bold text-primary ml-2">Daily Progress</h3>
            <div className="space-y-4">
                {[
                    { label: 'Points', val: `${store.totalPoints} 🌟`, icon: CheckCircle2, bg: 'bg-green-100', color: 'text-green-600' },
                    { label: 'Time', val: `${store.totalStudyMinutes}m ⏱️`, icon: Timer, bg: 'bg-blue-100', color: 'text-blue-600' },
                    { label: 'Stickers', val: `${store.ownedStickers.length} ✨`, icon: Sparkles, bg: 'bg-purple-100', color: 'text-purple-600' }
                ].map(stat => (
                    <div key={stat.label} className="p-4 bg-white/80 rounded-2xl border-2 border-primary/5 flex items-center gap-4 shadow-sm">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", stat.bg)}><stat.icon className={cn("w-7 h-7", stat.color)} /></div>
                        <div><p className="text-[10px] font-black text-muted-foreground/60 uppercase">{stat.label}</p><p className="text-xl font-fredoka font-bold text-primary">{stat.val}</p></div>
                    </div>
                ))}
            </div>
            <Button variant="ghost" className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-white" onClick={onReset}>Update My Intent</Button>
        </div>
        <EliteCard className="p-6 bg-gradient-to-b from-secondary/5 to-transparent overflow-hidden relative">
            <Heart className="absolute -right-4 -bottom-4 w-24 h-24 text-secondary/10 rotate-12" />
            <h4 className="font-fredoka font-bold mb-2">Today's Vibe</h4>
            <p className="text-sm font-medium text-muted-foreground italic">
                {energy === 'low' ? "Small progress is still progress! 🕯️" : energy === 'high' ? "Time to crush those big goals! ⚡" : "Steady steps win the race. 🧗"}
            </p>
        </EliteCard>
    </div>
  );
};
