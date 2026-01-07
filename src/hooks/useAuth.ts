import { useState, useEffect, useCallback } from 'react';

interface User {
  username: string;
  createdAt: Date;
}

const AUTH_KEY = 'study-buddy-auth';
const USERS_KEY = 'study-buddy-users';

interface StoredUser {
  username: string;
  passwordHash: string;
  createdAt: string;
}

// Simple hash function for demo purposes (in production, use proper auth)
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser({
          username: parsed.username,
          createdAt: new Date(parsed.createdAt),
        });
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const getUsers = (): StoredUser[] => {
    try {
      const stored = localStorage.getItem(USERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveUsers = (users: StoredUser[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const login = useCallback((username: string, password: string): { success: boolean; error?: string } => {
    const users = getUsers();
    const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (!existingUser) {
      return { success: false, error: 'User not found. Please sign up first.' };
    }

    const passwordHash = simpleHash(password);
    if (existingUser.passwordHash !== passwordHash) {
      return { success: false, error: 'Incorrect password.' };
    }

    const userData: User = {
      username: existingUser.username,
      createdAt: new Date(existingUser.createdAt),
    };

    setUser(userData);
    localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
    return { success: true };
  }, []);

  const signup = useCallback((username: string, password: string): { success: boolean; error?: string } => {
    if (username.length < 2) {
      return { success: false, error: 'Username must be at least 2 characters.' };
    }
    if (password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    const users = getUsers();
    const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (existingUser) {
      return { success: false, error: 'Username already exists.' };
    }

    const newUser: StoredUser = {
      username,
      passwordHash: simpleHash(password),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    const userData: User = {
      username: newUser.username,
      createdAt: new Date(newUser.createdAt),
    };

    setUser(userData);
    localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  }, []);

  return {
    user,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };
};

export type AuthStore = ReturnType<typeof useAuth>;
