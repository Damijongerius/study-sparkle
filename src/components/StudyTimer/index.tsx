import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TimerDisplay } from './TimerDisplay';
import { EffectivenessDialog } from './EffectivenessDialog';
import { TIME_OPTIONS, ENCOURAGEMENTS, TimerState, STORAGE_KEY, loadTimerState, saveTimerState } from './TimerUtils';
import { sfx } from '@/lib/sfx';
import { toast } from 'sonner';

interface Props {
    onComplete: (mins: number, pts: number, eff?: number) => void;
    onPenalty: (amount: number, reason: string) => void;
    registerTimer: (timer: any) => void;
}

export const StudyTimer = ({ onComplete, onPenalty, registerTimer }: Props) => {
    const [selectedTime, setSelectedTime] = useState(TIME_OPTIONS[0].minutes);
    const [timeLeft, setTimeLeft] = useState(TIME_OPTIONS[0].minutes * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [showEffectiveness, setShowEffectiveness] = useState(false);
    const [encouragement, setEncouragement] = useState(ENCOURAGEMENTS[0]);
    
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const handleToggle = useCallback(() => {
        if (isRunning) {
            setIsRunning(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
        } else {
            setIsRunning(true);
            const id = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(id);
                        setIsRunning(false);
                        setShowEffectiveness(true);
                        sfx.complete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            intervalRef.current = id;
        }
    }, [isRunning]);

    const handleReset = useCallback(() => {
        setIsRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimeLeft(selectedTime * 60);
    }, [selectedTime]);

    useEffect(() => {
        registerTimer({ isRunning, stop: () => { setIsRunning(false); if (intervalRef.current) clearInterval(intervalRef.current); }, applyPausePenalty: () => onPenalty(5, 'pause') });
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isRunning, registerTimer, onPenalty]);

    const handleEffectivenessSelect = (eff: number) => {
        setShowEffectiveness(false);
        const pts = Math.round(selectedTime * eff);
        onComplete(selectedTime, pts, eff);
        handleReset();
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap justify-center gap-3">
                {TIME_OPTIONS.map((opt) => (
                    <button key={opt.minutes} onClick={() => { setSelectedTime(opt.minutes); setTimeLeft(opt.minutes * 60); setIsRunning(false); if (intervalRef.current) clearInterval(intervalRef.current); }} className={`px-6 py-3 rounded-2xl font-bold transition-all ${selectedTime === opt.minutes ? 'bg-primary text-white shadow-glow scale-105' : 'bg-muted/50 hover:bg-muted text-muted-foreground'}`}>
                        {opt.label} ({opt.minutes}m)
                    </button>
                ))}
            </div>

            <TimerDisplay timeLeft={timeLeft} isRunning={isRunning} onToggle={handleToggle} onReset={handleReset} encouragement={encouragement} />
            
            <EffectivenessDialog open={showEffectiveness} onSelect={handleEffectivenessSelect} />
        </div>
    );
};
