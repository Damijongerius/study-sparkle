import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getTodayStr = () => new Date().toISOString().split('T')[0];

export const formatDate = (date: Date | string | number) => {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0];
    } catch { return ''; }
};

export const formatMinutes = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${m.toString().padStart(2, '0')}`;
};

export const formatSeconds = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
};

export const getStatusColor = (status: string) => {
    switch (status) {
        case 'completed':
        case 'done': return 'bg-green-100 text-green-700 border-green-200';
        case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
        default: return 'bg-muted text-muted-foreground border-transparent';
    }
};
