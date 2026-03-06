export * from './api/apiClient';
export * from './api/authApi';
export * from './api/dataApi';
export * from './api/plannerApi';
export * from './api/stickerApi';

// Re-export specific grouped objects for backward compatibility if needed
import { authApi } from './api/authApi';
import { dataApi } from './api/dataApi';
import { plannerApi } from './api/plannerApi';
import { stickerApi } from './api/stickerApi';

export const giftCardApi = stickerApi;
export const cardsApi = stickerApi;
export const notificationsApi = stickerApi;

export { authApi, dataApi, plannerApi, stickerApi };
