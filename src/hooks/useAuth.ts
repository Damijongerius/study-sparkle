import { useAuthContext } from './Auth/AuthContext';
import type { User, Friend } from '@/types';

export interface AuthStore {
  user: User | null;
  friends: Friend[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (u: string, p: string) => Promise<any>;
  signup: (u: string, p: string) => Promise<any>;
  logout: () => Promise<void>;
  addFriend: (c: string) => Promise<any>;
  removeFriend: (c: string) => Promise<any>;
}

export const useAuth = (): AuthStore => {
  return useAuthContext();
};
