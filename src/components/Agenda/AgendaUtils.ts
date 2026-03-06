import { cn, formatDate } from '@/lib/utils';

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const HOURS = Array.from({ length: 24 }, (_, i) => i);
export const HOUR_HEIGHT = 64;

export const ACTION_COLORS = [
    '#6366f1', '#3b82f6', '#f59e0b', '#10b981', '#ef4444', 
    '#ec4899', '#8b5cf6', '#06b6d4', '#84cc16', '#71717a'
];

export const DEFAULT_SLEEP = { wakeTime: 9 * 60, sleepTime: 17 * 60 };

export const getStyleColor = (colorStr: string) => {
    if (!colorStr) return { backgroundColor: '#cbd5e1', borderColor: '#94a3b8' };
    if (colorStr.startsWith('bg-')) return {}; 
    return { backgroundColor: colorStr, borderColor: colorStr };
};

export const getClassNameColor = (colorStr: string, isBorder = false) => {
    if (!colorStr || !colorStr.startsWith('bg-')) return "";
    if (isBorder) return colorStr.replace('bg-', 'border-');
    return colorStr;
};
