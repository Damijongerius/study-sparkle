import { useState, useEffect, useCallback } from 'react';
import { authApi, friendsApi, ApiError } from '@/lib/api';
import type { User, Friend } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await authApi.getCurrentUser();
        if (response.user) {
          setUser({
            username: response.user.username,
            friendCode: response.user.friendCode,
            createdAt: new Date(), // Backend doesn't return createdAt, but it's not critical
          });
          if (response.friends) {
            setFriends(
              response.friends.map((f) => ({
                username: f.username,
                friendCode: f.friendCode,
                addedAt: new Date(f.addedAt),
              }))
            );
          }
        }
      } catch (error) {
        // Session expired or not authenticated - that's okay
        console.log('No active session');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await authApi.login(username, password);
        if (response.success && response.user) {
          setUser({
            username: response.user.username,
            friendCode: response.user.friendCode,
            createdAt: new Date(),
          });
          setFriends(
            (response.friends || []).map((f) => ({
              username: f.username,
              friendCode: f.friendCode,
              addedAt: new Date(f.addedAt),
            }))
          );
          return { success: true, error: "null" };
        }
        return { success: false, error: 'Login failed' };
      } catch (error) {
        if (error instanceof ApiError) {
          return { success: false, error: error.message };
        }
        return { success: false, error: 'Login failed. Please try again.' };
      }
    },
    []
  );

  const signup = useCallback(
    async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await authApi.signup(username, password);
        if (response.success && response.user) {
          setUser({
            username: response.user.username,
            friendCode: response.user.friendCode,
            createdAt: new Date(),
          });
          setFriends([]);
          return { success: true };
        }
        return { success: false, error: 'Signup failed' };
      } catch (error) {
        if (error instanceof ApiError) {
          return { success: false, error: error.message };
        }
        return { success: false, error: 'Signup failed. Please try again.' };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setFriends([]);
    }
  }, []);

  const addFriend = useCallback(
    async (code: string): Promise<{ success: boolean; error?: string }> => {
      if (!user) return { success: false, error: 'Not logged in' };

      const normalizedCode = code.toUpperCase().trim();

      if (normalizedCode === user.friendCode) {
        return { success: false, error: "You can't add yourself!" };
      }

      try {
        const response = await friendsApi.addFriend(normalizedCode);
        if (response.success && response.friend) {
          const newFriend: Friend = {
            username: response.friend.username,
            friendCode: response.friend.friendCode,
            addedAt: new Date(),
          };
          setFriends((prev) => [...prev, newFriend]);
          return { success: true };
        }
        return { success: false, error: response.error || 'Failed to add friend' };
      } catch (error) {
        if (error instanceof ApiError) {
          return { success: false, error: error.message };
        }
        return { success: false, error: 'Failed to add friend. Please try again.' };
      }
    },
    [user]
  );

  const removeFriend = useCallback(
    async (friendCode: string) => {
      if (!user) return;

      try {
        await friendsApi.removeFriend(friendCode);
        setFriends((prev) => prev.filter((f) => f.friendCode !== friendCode));
      } catch (error) {
        console.error('Remove friend error:', error);
        // Still update UI optimistically
        setFriends((prev) => prev.filter((f) => f.friendCode !== friendCode));
      }
    },
    [user]
  );

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
