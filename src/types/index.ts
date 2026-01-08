/**
 * Centralized Type Exports
 * Import types from here for consistency across the application
 */

// Auth types
export type {
  User,
  Friend,
  AuthResponse,
  LoginResponse,
  SignupResponse,
} from './auth';

// Study types
export type {
  Sticker,
  OwnedSticker,
  StickerCard,
  CardStatus,
  StickerCategory,
  ActivityType,
  ActivityLog,
  Reminder,
  Notification,
  NotificationType,
  DailyCooldown,
  StudyState,
} from './study';

export {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
} from './study';

// Store types
export type {
  AuthStore,
  StudyStore,
} from './store';

