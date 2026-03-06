import { format, addDays, startOfISOWeek, endOfISOWeek, eachDayOfInterval } from 'date-fns';

export const CELL_WIDTH = 40;
export const ROW_HEIGHT = 48;

export const getTimelineDays = (start: Date, weeks: number) => {
    const end = addDays(start, weeks * 7 - 1);
    return eachDayOfInterval({ start, end });
};

export const getTaskPosition = (taskStart: Date, taskEnd: Date, timelineStart: Date) => {
    const startOffset = Math.floor((taskStart.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.max(1, Math.floor((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    return { left: startOffset * CELL_WIDTH, width: duration * CELL_WIDTH };
};
