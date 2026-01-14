// typescript
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

declare global {
    interface Window {
        webkitAudioContext?: typeof AudioContext;
    }
}

interface StudyTimerProps {
    onComplete: (minutes: number, points: number, effectiveness?: number) => void;
    registerTimer?: (timer: {
        isRunning: boolean;
        setIsRunning: (running: boolean) => void;
        applyPausePenalty: () => void;
    }) => void;
    onPenalty?: (amount: number, reason: 'pause' | 'reset') => void;
}

const TIME_OPTIONS = [
    { minutes: 15, label: '15 min', points: 15, emoji: '🌱' },
    { minutes: 25, label: '25 min', points: 30, emoji: '🌸' },
    { minutes: 45, label: '45 min', points: 60, emoji: '🌺' },
    { minutes: 60, label: '60 min', points: 100, emoji: '🌻' },
    { minutes: 120, label: '120 min', points: 220, emoji: '💫' },
];

const ENCOURAGEMENTS = [
    "You're doing amazing! ✨",
    "Keep going, superstar! 🌟",
    "So proud of you! 💖",
    "You've got this! 🎀",
    "Study queen energy! 👑",
    "Small steps, big wins! 🪴",
    "Focus mode: activated! 🚀",
    "One minute at a time — you got this! ⏳",
    "Progress over perfection! 📈",
    "Brains and bravery — combo unlocked! 🧠💪",
    "Today’s effort, tomorrow’s success! 🌞",
    "Keep the momentum — you're unstoppable! ⚡️",
];

const EFFECTIVENESS_OPTIONS = [
    { label: 'Super effective! 🌟', emoji: '🌟', modifier: 1.05, description: '+5% bonus points!' },
    { label: 'Pretty good! ✨', emoji: '✨', modifier: 1.0, description: 'Full points!' },
    { label: 'It was okay 🌸', emoji: '🌸', modifier: 0.9, description: '-10% points' },
    { label: 'Could be better 🌱', emoji: '🌱', modifier: 0.85, description: '-15% points' },
    { label: 'Not very effective 😔', emoji: '😔', modifier: 0.8, description: '-20% points' },
];

const playAlarmSound = () => {
    const AudioCtxClass = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioCtxClass) return;
    const audioContext = new AudioCtxClass();

    const playChime = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    };

    const now = audioContext.currentTime;
    playChime(523.25, now, 0.4);        // C5
    playChime(659.25, now + 0.15, 0.4); // E5
    playChime(783.99, now + 0.3, 0.6);  // G5
};

const TIMER_STORAGE_KEY = 'study-timer-state';

interface TimerState {
    selectedTime: number | null;
    timeLeft: number;
    isRunning: boolean;
    pausePenalty: number;
    endAt: number | null; // timestamp in ms when timer should end
}

const loadTimerState = (): TimerState | null => {
    try {
        const stored = localStorage.getItem(TIMER_STORAGE_KEY);
        if (!stored) return null;
        return JSON.parse(stored);
    } catch {
        return null;
    }
};

const saveTimerState = (state: TimerState) => {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
};

const clearTimerState = () => {
    localStorage.removeItem(TIMER_STORAGE_KEY);
};

export const StudyTimer = ({ onComplete, registerTimer, onPenalty }: StudyTimerProps) => {
    // Restore state from localStorage on mount
    const savedState = loadTimerState();

    const [selectedTime, setSelectedTime] = useState<number | null>(() => savedState?.selectedTime ?? null);

    const computeInitialTimeLeft = (saved?: TimerState | null) => {
        if (!saved) return 0;
        if (saved.endAt) {
            const remaining = Math.max(0, Math.ceil((saved.endAt - Date.now()) / 1000));
            return remaining;
        }
        return saved.timeLeft ?? 0;
    };

    const [timeLeft, setTimeLeft] = useState<number>(() => computeInitialTimeLeft(savedState));

    const [isRunning, setIsRunning] = useState<boolean>(() => {
        if (!savedState) return false;
        if (savedState.endAt) {
            const remaining = Math.max(0, Math.ceil((savedState.endAt - Date.now()) / 1000));
            return remaining > 0;
        }
        return false;
    });

    const [pausePenalty, setPausePenalty] = useState(() => savedState?.pausePenalty ?? 0);
    const [endAt, setEndAt] = useState<number | null>(() => savedState?.endAt ?? null);

    const [encouragement, setEncouragement] = useState(ENCOURAGEMENTS[0]);
    const [showEffectivenessDialog, setShowEffectivenessDialog] = useState(false);
    const [showPauseWarning, setShowPauseWarning] = useState(false);
    const [showResetWarning, setShowResetWarning] = useState(false);
    const [pendingCompletion, setPendingCompletion] = useState<{ minutes: number; points: number } | null>(null);

    const selectedOption = TIME_OPTIONS.find(t => t.minutes === selectedTime);

    // Persist timer state to localStorage
    useEffect(() => {
        saveTimerState({
            selectedTime,
            timeLeft,
            isRunning,
            pausePenalty,
            endAt,
        });
    }, [selectedTime, timeLeft, isRunning, pausePenalty, endAt]);

    const applyPausePenalty = useCallback(() => {
        setPausePenalty(prev => prev + 5);
    }, []);

    // Register timer with parent
    useEffect(() => {
        if (registerTimer) {
            registerTimer({
                isRunning,
                setIsRunning,
                applyPausePenalty,
            });
        }
    }, [isRunning, registerTimer, applyPausePenalty]);

    // Accurate ticking based on endAt
    useEffect(() => {
        let interval: number | undefined;

        if (isRunning && endAt) {
            const tick = () => {
                const remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
                setTimeLeft(remaining);
                if (remaining <= 0) {
                    setIsRunning(false);
                    setEndAt(null);
                    playAlarmSound();
                    if (selectedOption) {
                        const basePoints = Math.max(0, selectedOption.points);
                        setPendingCompletion({ minutes: selectedOption.minutes, points: basePoints });
                        setShowEffectivenessDialog(true);
                    }
                }
            };

            tick();
            interval = window.setInterval(tick, 500);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning, endAt, selectedOption]);

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
        setPausePenalty(0);
        setEndAt(null);
    }, []);

    const toggleTimer = () => {
        if (selectedTime) {
            if (isRunning) {
                // Show warning before pausing
                setShowPauseWarning(true);
            } else {
                // Start timer: compute endAt from current timeLeft
                setEndAt(Date.now() + timeLeft * 1000);
                setIsRunning(true);
            }
        }
    };

    const confirmPause = () => {
        applyPausePenalty();
        onPenalty?.(5, 'pause');
        setIsRunning(false);
        setEndAt(null);
        setShowPauseWarning(false);
        toast('⏸️ Paused! -5 points', {
            description: 'Try to stay focused! 💪',
        });
    };

    const handleResetClick = () => {
        if (selectedTime && (isRunning || timeLeft < selectedTime * 60)) {
            // Timer has been used, show warning
            setShowResetWarning(true);
        } else if (selectedTime) {
            resetTimer();
        }
    };

    const resetTimer = () => {
        if (selectedTime) {
            setTimeLeft(selectedTime * 60);
            setIsRunning(false);
            setPausePenalty(0);
            setEndAt(null);
            setShowResetWarning(false);
        }
    };

    const confirmReset = () => {
        if (isRunning) {
            // Apply penalty if resetting while running
            applyPausePenalty();
            onPenalty?.(5, 'pause');
        }
        // Apply reset penalty
        setPausePenalty(prev => prev + 10);
        onPenalty?.(10, 'reset');
        toast('🔄 Reset! -10 points', {
            description: 'Starting fresh, you got this! 💪',
        });
        resetTimer();
    };

    const handleEffectivenessSelect = (modifier: number, effectivenessIndex: number) => {
        if (pendingCompletion) {
            const finalPoints = Math.round(pendingCompletion.points * modifier);
            onComplete(pendingCompletion.minutes, finalPoints, 5 - effectivenessIndex); // 5 = super effective, 1 = not effective
            setPendingCompletion(null);
            setShowEffectivenessDialog(false);
            setPausePenalty(0);
            setSelectedTime(null);
            setTimeLeft(0);
            setEndAt(null);
            clearTimerState(); // Clear persisted state after completion
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
                        {pausePenalty > 0 && (
                            <div className="text-sm text-destructive mt-1">
                                Penalties applied: -{pausePenalty} pts
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
                    onClick={handleResetClick}
                    disabled={!selectedTime}
                >
                    <RotateCcw className="w-5 h-5" />
                </Button>
            </div>

            {/* Pause Warning Dialog */}
            <Dialog open={showPauseWarning} onOpenChange={setShowPauseWarning}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl font-fredoka">
                            ⏸️ Pause Timer?
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            Pausing will cost you <span className="text-destructive font-bold">5 points</span>. Are you sure?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 mt-4">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowPauseWarning(false)}
                        >
                            Keep Going! 💪
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={confirmPause}
                        >
                            Pause Anyway
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Reset Warning Dialog */}
            <Dialog open={showResetWarning} onOpenChange={setShowResetWarning}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl font-fredoka">
                            🔄 Reset Timer?
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            Resetting will cost you <span className="text-destructive font-bold">10 points</span> and lose all progress. Are you sure?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 mt-4">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowResetWarning(false)}
                        >
                            Keep Going! 💪
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={confirmReset}
                        >
                            Reset Anyway
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Encouragement */}
            {isRunning && (
                <p className="text-lg text-muted-foreground animate-bounce-soft font-medium">
                    {encouragement}
                </p>
            )}

            {/* Effectiveness Rating Dialog */}
            <Dialog open={showEffectivenessDialog} onOpenChange={setShowEffectivenessDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl font-fredoka">
                            🎉 Study Session Complete!
                        </DialogTitle>
                        <DialogDescription className="text-center text-lg">
                            How effective was your study session?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 mt-4">
                        {EFFECTIVENESS_OPTIONS.map((option, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                className="w-full justify-between h-auto py-4 px-6 hover:bg-primary/10 hover:border-primary"
                                onClick={() => handleEffectivenessSelect(option.modifier, index)}
                            >
                                <span className="text-lg">{option.label}</span>
                                <span className="text-sm text-muted-foreground">{option.description}</span>
                            </Button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
