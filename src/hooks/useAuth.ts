import { useState, useEffect, useCallback } from 'react';

interface User {
  username: string;
  friendCode: string;
  createdAt: Date;
}

export interface Friend {
  username: string;
  friendCode: string;
  addedAt: Date;
}

const AUTH_KEY = 'study-buddy-auth';
const USERS_KEY = 'study-buddy-users';
const FRIENDS_KEY = 'study-buddy-friends';

interface StoredUser {
  username: string;
  passwordHash: string;
  friendCode: string;
  createdAt: string;
}

// Generate a unique friend code
const generateFriendCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

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
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getFriendsKey = (username: string) => `${FRIENDS_KEY}-${username.toLowerCase()}`;

  const loadFriends = (username: string): Friend[] => {
    try {
      const stored = localStorage.getItem(getFriendsKey(username));
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((f: any) => ({ ...f, addedAt: new Date(f.addedAt) }));
      }
    } catch {}
    return [];
  };

  const saveFriends = (username: string, friendsList: Friend[]) => {
    localStorage.setItem(getFriendsKey(username), JSON.stringify(friendsList));
  };

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser({
          username: parsed.username,
          friendCode: parsed.friendCode,
          createdAt: new Date(parsed.createdAt),
        });
        setFriends(loadFriends(parsed.username));
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
      friendCode: existingUser.friendCode,
      createdAt: new Date(existingUser.createdAt),
    };

    setUser(userData);
    setFriends(loadFriends(existingUser.username));
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

    const friendCode = generateFriendCode();
    const newUser: StoredUser = {
      username,
      passwordHash: simpleHash(password),
      friendCode,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    const userData: User = {
      username: newUser.username,
      friendCode: newUser.friendCode,
      createdAt: new Date(newUser.createdAt),
    };

    setUser(userData);
    setFriends([]);
    localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setFriends([]);
    localStorage.removeItem(AUTH_KEY);
  }, []);

  const addFriend = useCallback((code: string): { success: boolean; error?: string } => {
    if (!user) return { success: false, error: 'Not logged in' };
    
    const normalizedCode = code.toUpperCase().trim();
    
    if (normalizedCode === user.friendCode) {
      return { success: false, error: "You can't add yourself!" };
    }

    const users = getUsers();
    const friendUser = users.find(u => u.friendCode === normalizedCode);
    
    if (!friendUser) {
      return { success: false, error: 'Friend code not found.' };
    }

    const existingFriend = friends.find(f => f.friendCode === normalizedCode);
    if (existingFriend) {
      return { success: false, error: 'Already friends!' };
    }

    const newFriend: Friend = {
      username: friendUser.username,
      friendCode: friendUser.friendCode,
      addedAt: new Date(),
    };

    const updatedFriends = [...friends, newFriend];
    setFriends(updatedFriends);
    saveFriends(user.username, updatedFriends);
    
    return { success: true };
  }, [user, friends]);

  const removeFriend = useCallback((friendCode: string) => {
    if (!user) return;
    const updatedFriends = friends.filter(f => f.friendCode !== friendCode);
    setFriends(updatedFriends);
    saveFriends(user.username, updatedFriends);
  }, [user, friends]);

  return {
    user,
    friends,
    isLoading,
    login,
    signup,
    logout,
    addFriend,
    removeFriend,
    isAuthenticated: !!user,
  };
};

export type AuthStore = ReturnType<typeof useAuth>;
