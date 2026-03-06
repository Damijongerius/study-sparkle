import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/lib/api';
import type { User, Friend, AuthStore } from '@/types';
import { useFriendActions } from './useFriendActions';

const AuthContext = createContext<AuthStore | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const check = useCallback(async () => {
    try {
      const res = await authApi.checkAuth();
      if (res.user) { 
        setUser(res.user); 
        setFriends(res.friends || []);
        setIsAuthenticated(true); 
      } else { 
        setUser(null); 
        setFriends([]);
        setIsAuthenticated(false); 
      }
    } catch { 
      setIsAuthenticated(false); 
    } finally { 
      setIsLoading(false); 
    }
  }, []);

  useEffect(() => { check(); }, [check]);

  const login = async (u: string, p: string) => {
    try {
      const res = await authApi.login(u, p);
      if (res.user) { 
        setUser(res.user); 
        setFriends(res.friends || []);
        setIsAuthenticated(true); 
      }
      return res;
    } catch (e: any) { return { error: e.message }; }
  };

  const signup = async (u: string, p: string) => {
    try {
      const res = await authApi.signup(u, p);
      if (res.user) { 
        setUser(res.user); 
        setFriends(res.friends || []);
        setIsAuthenticated(true); 
      }
      return res;
    } catch (e: any) { return { error: e.message }; }
  };

  const logout = async () => { 
    await authApi.logout(); 
    setUser(null); 
    setFriends([]);
    setIsAuthenticated(false); 
  };

  const friendActions = useFriendActions(setUser, setFriends);

  const value = { 
    user, 
    friends,
    isLoading, 
    isAuthenticated, 
    login, 
    signup, 
    logout, 
    ...friendActions 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within an AuthProvider');
  return context;
};
