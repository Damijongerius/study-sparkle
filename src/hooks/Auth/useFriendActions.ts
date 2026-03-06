import { useCallback } from 'react';
import { authApi } from '@/lib/api';
import type { User, Friend } from '@/types';

export const useFriendActions = (
  setUser: (u: User | null) => void,
  setFriends: (f: Friend[]) => void
) => {
  const addFriend = useCallback(async (code: string) => {
    try {
      const res = await authApi.addFriend(code);
      if (res.success && res.friend) {
        setFriends(prev => [...prev, { ...res.friend, addedAt: new Date() }]);
      }
      return res;
    } catch (e: any) { return { error: e.message }; }
  }, [setFriends]);

  const removeFriend = useCallback(async (code: string) => {
    try {
      const res = await authApi.removeFriend(code);
      if (res.success) {
        setFriends(prev => prev.filter(f => f.friendCode !== code));
      }
      return res;
    } catch (e: any) { return { error: e.message }; }
  }, [setFriends]);

  return { addFriend, removeFriend };
};
