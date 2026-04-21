import type { StudyState, StickerCard, StickerCategory, OwnedSticker, DailyCooldown, AgendaItem } from '@/types';
import { BackendData, BackendCard, BackendActivity, BackendPlan, BackendTask, BackendStickerEntry } from "@/types/backend.ts";
import { DEFAULT_ACTIONS, DEFAULT_OUT_OF_AGENDA, DEFAULT_CALENDARS, DEFAULT_AGENDA_SETTINGS } from './useStudyStoreData';

const fixDates = (item: any, keys: string[]) => {
    keys.forEach(k => { if (item[k]) item[k] = new Date(item[k]); });
    return item;
};

const fixTaskDates = (t: any) => fixDates(t, ['startDate', 'endDate']);
const fixPlanDates = (p: any) => {
    fixDates(p, ['examDate', 'startDate', 'endDate']);
    if (p.tasks) p.tasks = p.tasks.map(fixTaskDates);
    return p;
};

export const convertBackendData = (backendData: BackendData): StudyState => {
    const convertCard = (card: BackendCard): StickerCard => ({
        id: typeof card._id === 'string' ? card._id : card._id?.toString?.() || `card-${Date.now()}`,
        name: card.name || 'New Card',
        goal: card.goal,
        slots: card.slots || 9,
        stickers: (card.stickers || []).map((s: BackendStickerEntry) => ({ stickerId: s.stickerId, earnedAt: new Date(s.earnedAt!) })),
        status: card.status || (card.completedAt ? 'done' : 'in-progress'),
        completedAt: card.completedAt ? new Date(card.completedAt) : undefined,
        redeemedAt: card.redeemedAt ? new Date(card.redeemedAt) : undefined,
        givenBy: card.givenBy,
        givenTo: card.givenTo,
        allowedCategories: card.allowedCategories && card.allowedCategories.length > 0 ? card.allowedCategories : undefined,
    });

    const cooldowns: DailyCooldown = {};
    if (backendData.dailyCooldowns) {
        Object.entries(backendData.dailyCooldowns).forEach(([k, v]) => {
            cooldowns[k] = v.toString();
        });
    }

    return {
        totalPoints: backendData.totalPoints || 0,
        ownedStickers: (backendData.ownedStickers || []).map((s: any) => ({ stickerId: s.stickerId, earnedAt: new Date(s.earnedAt) })),
        totalStudyMinutes: backendData.totalStudyMinutes || 0,
        studySessions: backendData.studySessions || 0,
        stickerCards: (backendData.stickerCards || []).map(convertCard),
        dailyCooldowns: cooldowns,
        activityLogs: (backendData.activityLogs || []).map((l: any) => ({ ...l, timestamp: new Date(l.timestamp) })),
        reminders: [],
        notifications: (backendData.notifications || []).map((n: any) => ({ ...n, createdAt: new Date(n.createdAt) })),
        plans: (backendData.plans || []).map(fixPlanDates),
        availability: backendData.availability || [],
        agendaItems: (backendData.agendaItems || []).map((it: any) => ({
            ...it,
            date: it.date || new Date().toISOString().split('T')[0]
        })) as AgendaItem[],
        agendaSettings: backendData.agendaSettings ? {
            ...backendData.agendaSettings,
            actions: backendData.agendaSettings.actions as any || DEFAULT_ACTIONS,
            outOfAgenda: backendData.agendaSettings.outOfAgenda || DEFAULT_OUT_OF_AGENDA,
            calendars: backendData.agendaSettings.calendars || DEFAULT_CALENDARS
        } : DEFAULT_AGENDA_SETTINGS,
        dailyIntent: backendData.dailyIntent
    };
};

export const convertToBackendFormat = (state: StudyState): any => {
  return {
    totalPoints: state.totalPoints,
    ownedStickers: state.ownedStickers,
    totalStudyMinutes: state.totalStudyMinutes,
    studySessions: state.studySessions,
    stickerCards: state.stickerCards,
    dailyCooldowns: state.dailyCooldowns,
    activityLogs: state.activityLogs,
    notifications: state.notifications,
    plans: state.plans,
    availability: state.availability,
    agendaItems: state.agendaItems,
    agendaSettings: state.agendaSettings,
    dailyIntent: state.dailyIntent,
  };
};

export const createNewCard = (name?: string, slots?: number, goal?: string, allowedCategories?: StickerCategory[]): StickerCard => ({
    id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: name || 'New Card',
    slots: slots || 9,
    goal: goal || undefined,
    stickers: [],
    status: 'in-progress',
    allowedCategories: allowedCategories || undefined,
});

export const parseMockData = (savedData: string) => {
    try {
        const parsed = JSON.parse(savedData);
        parsed.activityLogs = (parsed.activityLogs || []).map((l: any) => ({ ...l, timestamp: new Date(l.timestamp) }));
        parsed.ownedStickers = (parsed.ownedStickers || []).map((s: any) => ({ ...s, earnedAt: new Date(s.earnedAt) }));
        parsed.stickerCards = (parsed.stickerCards || []).map((c: any) => ({
            ...c,
            stickers: (c.stickers || []).map((s: any) => ({ ...s, earnedAt: new Date(s.earnedAt) })),
            completedAt: c.completedAt ? new Date(c.completedAt) : undefined,
            redeemedAt: c.redeemedAt ? new Date(c.redeemedAt) : undefined,
        }));
        parsed.plans = (parsed.plans || []).map(fixPlanDates);
        return parsed;
    } catch (e) {
        console.error('Mock parse error', e);
        return null;
    }
};
