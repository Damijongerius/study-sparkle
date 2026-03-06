import { formatSeconds } from '@/lib/utils';

export const TIME_OPTIONS = [
    { label: 'Pomodoro', minutes: 25, description: 'Best for standard focus' },
    { label: 'Deep Work', minutes: 50, description: 'For complex tasks' },
    { label: 'Quick Sprint', minutes: 15, description: 'Fast momentum builder' },
    { label: 'Marathon', minutes: 90, description: 'Extended flow sessions' },
];

export const ENCOURAGEMENTS = [
    "You've got this! ✨", "Keep shining! 🌟", "Focus mode on! 🎯",
    "Making great progress! 🚀", "Stay sparkly! ✨", "Almost there! 💪"
];

export interface TimerState {
    selectedTime: number;
    timeLeft: number;
    isRunning: boolean;
    pausePenalty: number;
    endAt: number | null;
    repeatCounts: Record<string, number>;
}

export const STORAGE_KEY = 'study-timer-state';

export const saveTimerState = (state: TimerState) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
export const loadTimerState = (): TimerState | null => {
    const s = localStorage.getItem(STORAGE_KEY);
    if (!s) return null;
    try {
        const p = JSON.parse(s);
        return { ...p, repeatCounts: p.repeatCounts || {} };
    } catch { return null; }
};
