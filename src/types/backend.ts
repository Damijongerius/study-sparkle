import type {ActivityType, Notification, StickerCard, StickerCategory, PlanStatus, AvailabilityCategory} from "@/types/study.ts";

type BackendStickerEntry = {
    stickerId: string;
    earnedAt?: string | number | Date;
};

type BackendCard = {
    _id?: string | { toString?: () => string };
    name?: string;
    goal?: string;
    slots?: number;
    stickers?: BackendStickerEntry[];
    status?: StickerCard['status'];
    completedAt?: string | number | Date | null;
    redeemedAt?: string | number | Date | null;
    givenBy?: string;
    givenTo?: string;
    allowedCategories?: StickerCategory[];
};

type BackendActivity = {
    _id?: string | { toString?: () => string };
    type: ActivityType;
    timestamp?: string | number | Date;
    details?: Record<string, unknown>;
};

type BackendNotificationType = {
    _id?: string | { toString?: () => string };
    type: Notification['type'];
    fromUsername?: string;
    cardName?: string;
    createdAt?: string | number | Date;
    read?: boolean;
};

type BackendTask = {
    id: string;
    title: string;
    description?: string;
    status: PlanStatus;
    dependencies: string[];
    externalLink?: string;
    startDate?: string | number | Date;
    endDate?: string | number | Date;
    estimatedHours?: number;
    row?: number;
    order?: number;
    linkedTaskId?: string;
};

type BackendPlan = {
    id: string;
    title: string;
    description?: string;
    status: PlanStatus;
    tasks: BackendTask[];
    examDate?: string | number | Date;
    startDate?: string | number | Date;
    endDate?: string | number | Date;
    type?: 'flow' | 'exam' | 'long-term';
    enforceDependencies?: boolean;
};

type BackendData = {
    totalPoints?: number;
    ownedStickers?: BackendStickerEntry[];
    totalStudyMinutes?: number;
    studySessions?: number;
    stickerCards?: BackendCard[];
    dailyCooldowns?: Record<string, string | number | Date>;
    activityLogs?: BackendActivity[];
    notifications?: BackendNotificationType[];
    plans?: BackendPlan[];
    availability?: Array<{ day: number; startHour: number; category: AvailabilityCategory }>;
    agendaItems?: Array<{
        id: string;
        title: string;
        day: number;
        date: string;
        startTime: number;
        endTime: number;
        type: 'task' | 'custom';
        actionId?: string;
        calendarId?: string;
    }>;
    agendaSettings?: {
        actions: Array<{ id: string; label: string; color: string; isSystem: boolean }>;
        outOfAgenda: Array<{ day: number; wakeTime: number; sleepTime: number }>;
        calendars: Array<{ id: string; name: string; color: string; isExternal: boolean; url?: string }>;
    };
    dailyIntent?: { energy: string; persona: string; time: string; date: string; };
};

export type {
    BackendData,
    BackendStickerEntry,
    BackendCard,
    BackendActivity,
    BackendNotificationType,
    BackendPlan,
    BackendTask,
};
