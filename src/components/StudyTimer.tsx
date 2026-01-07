import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudyTimerProps {
  onComplete: (minutes: number, points: number) => void;
}

const TIME_OPTIONS = [
  { minutes: 15, label: '15 min', points: 15, emoji: '🌱' },
  { minutes: 25, label: '25 min', points: 30, emoji: '🌸' },
  { minutes: 45, label: '45 min', points: 60, emoji: '🌺' },
  { minutes: 60, label: '60 min', points: 100, emoji: '🌻' },
];

const ENCOURAGEMENTS = [
  "You're doing amazing! ✨",
  "Keep going, superstar! 🌟",
  "So proud of you! 💖",
  "You've got this! 🎀",
  "Study queen energy! 👑",
];

export const StudyTimer = ({ onComplete }: StudyTimerProps) => {
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [encouragement, setEncouragement] = useState(ENCOURAGEMENTS[0]);

  const selectedOption = TIME_OPTIONS.find(t => t.minutes === selectedTime);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning && selectedOption) {
      setIsRunning(false);
      onComplete(selectedOption.minutes, selectedOption.points);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, selectedOption, onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEncouragement(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const selectTime = useCallback((minutes: number) => {
    setSelectedTime(minutes);
    setTimeLeft(minutes * 60);
    setIsRunning(false);
  }, []);

  const toggleTimer = () => {
    if (selectedTime) {
      setIsRunning(!isRunning);
    }
  };

  const resetTimer = () => {
    if (selectedTime) {
      setTimeLeft(selectedTime * 60);
      setIsRunning(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = selectedTime ? ((selectedTime * 60 - timeLeft) / (selectedTime * 60)) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Time Selection */}
      <div className="flex flex-wrap justify-center gap-3">
        {TIME_OPTIONS.map((option) => (
          <Button
            key={option.minutes}
            variant={selectedTime === option.minutes ? 'timerActive' : 'timer'}
            size="lg"
            onClick={() => selectTime(option.minutes)}
            disabled={isRunning}
            className="flex flex-col items-center gap-1 h-auto py-4 px-6 min-w-[100px]"
          >
            <span className="text-2xl">{option.emoji}</span>
            <span className="font-bold">{option.label}</span>
            <span className="text-xs text-muted-foreground">+{option.points} pts</span>
          </Button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="relative">
        <div className={cn(
          "w-64 h-64 rounded-full flex items-center justify-center",
          "bg-card border-4 border-primary/30 shadow-float",
          "relative overflow-hidden transition-all duration-300",
          isRunning && "border-primary shadow-glow"
        )}>
          {/* Progress Ring */}
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="hsl(var(--primary) / 0.2)"
              strokeWidth="4"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.89} 289`}
              className="transition-all duration-1000"
            />
          </svg>
          
          <div className="text-center z-10">
            <div className="text-5xl font-fredoka font-bold text-foreground">
              {formatTime(timeLeft)}
            </div>
            {selectedOption && (
              <div className="text-lg text-muted-foreground mt-2">
                {selectedOption.emoji} {selectedOption.label}
              </div>
            )}
          </div>
        </div>

        {/* Floating sparkles when running */}
        {isRunning && (
          <>
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-soft animate-sparkle" />
            <Sparkles className="absolute -bottom-2 -left-2 w-5 h-5 text-pink-medium animate-sparkle" style={{ animationDelay: '0.5s' }} />
          </>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <Button
          variant="cute"
          size="xl"
          onClick={toggleTimer}
          disabled={!selectedTime}
          className="min-w-[140px]"
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          size="xl"
          onClick={resetTimer}
          disabled={!selectedTime}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {/* Encouragement */}
      {isRunning && (
        <p className="text-lg text-muted-foreground animate-bounce-soft font-medium">
          {encouragement}
        </p>
      )}
    </div>
  );
};
