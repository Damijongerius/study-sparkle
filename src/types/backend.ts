import type {ActivityType, Notification, StickerCard, StickerCategory} from "@/types/study.ts";

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

type BackendData = {
    totalPoints?: number;
    ownedStickers?: BackendStickerEntry[];
    totalStudyMinutes?: number;
    studySessions?: number;
    stickerCards?: BackendCard[];
    dailyCooldowns?: Record<string, string | number | Date>;
    activityLogs?: BackendActivity[];
    notifications?: BackendNotificationType[];
};

export type {
    BackendData,
    BackendStickerEntry,
    BackendCard,
    BackendActivity,
    BackendNotificationType,
};