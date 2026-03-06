import { apiRequest } from './apiClient';

export const authApi = {
  signup: (username: string, password: string) => 
    apiRequest('/auth/signup', { method: 'POST', body: JSON.stringify({ username, password }) }),
  
  login: (username: string, password: string) => 
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  
  checkAuth: () => apiRequest('/auth/check'),
  
  searchFriends: (query: string) => apiRequest(`/friends/search?query=${query}`),
  
  addFriend: (friendCode: string) => 
    apiRequest('/friends/add', { method: 'POST', body: JSON.stringify({ friendCode }) }),
  
  removeFriend: (friendCode: string) => 
    apiRequest('/friends/remove', { method: 'POST', body: JSON.stringify({ friendCode }) }),
};
