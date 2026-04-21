import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TimerDisplay } from './TimerDisplay';
import { EffectivenessDialog } from './EffectivenessDialog';
import { calculatePoints } from './TimerUtils';

interface Props {
  onComplete: (mins: number, pts: number, eff?: number) => void;
  registerTimer: (t: any) => void;
  onPenalty: (amount: number, reason: 'pause' | 'reset') => void;
}

export function StudyTimer({ onComplete, registerTimer, onPenalty }: Props) {
  const [timeLeft, setTimeLeft] = useState(1500); // 25 mins default
  const [isRunning, setIsRunning] = useState(false);
  const [showEff, setShowEff] = useState(false);
  const [initialTime] = useState(1500);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleToggle = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
    onPenalty(10, 'reset');
  };

  const handleComplete = (effectiveness: number) => {
    const mins = Math.floor(initialTime / 60);
    const pts = calculatePoints(mins, effectiveness);
    onComplete(mins, pts, effectiveness);
    setShowEff(false);
    setIsRunning(false);
    setTimeLeft(initialTime);
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      setShowEff(true);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  useEffect(() => {
    registerTimer({
      stop: () => setIsRunning(false),
      start: () => setIsRunning(true),
      reset: () => setTimeLeft(initialTime)
    });
  }, [registerTimer, initialTime]);

  return (
    <div className="flex flex-col items-center">
      <TimerDisplay 
        timeLeft={timeLeft} 
        isRunning={isRunning} 
        onToggle={handleToggle} 
        onReset={handleReset} 
        encouragement={isRunning ? "You're doing great! ⚡" : "Ready to focus? 🎯"}
      />
      <EffectivenessDialog 
        open={showEff} 
        onSelect={handleComplete} 
      />
    </div>
  );
}
