import { apiRequest } from './apiClient';

export const dataApi = {
  getUserData: () => apiRequest('/data'),
  
  updateUserData: (data: any) => 
    apiRequest('/data', { method: 'POST', body: JSON.stringify(data) }),
  
  addActivity: (activity: any) => 
    apiRequest('/activity', { method: 'POST', body: JSON.stringify(activity) }),
  
  deductPoints: (amount: number, reason: string) => 
    apiRequest('/points/deduct', { method: 'POST', body: JSON.stringify({ amount, reason }) }),
};
