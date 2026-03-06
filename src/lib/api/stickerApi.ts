import { apiRequest } from './apiClient';

export const stickerApi = {
  createCard: (card: any) => 
    apiRequest('/cards', { method: 'POST', body: JSON.stringify(card) }),
  
  completeCard: (id: string) => 
    apiRequest(`/cards/${id}/complete`, { method: 'POST' }),
  
  sendGiftCard: (to: string, name: string, goal: string, slots: number, cats?: string[]) => 
    apiRequest('/giftCard/send', { method: 'POST', body: JSON.stringify({ toUsername: to, name, goal, slots, allowedCategories: cats }) }),
  
  getNotifications: () => apiRequest('/notifications'),
  
  markAsRead: (id: string) => apiRequest(`/notifications/${id}/read`, { method: 'POST' }),
  
  clearAll: () => apiRequest('/notifications/clear', { method: 'POST' }),
};
