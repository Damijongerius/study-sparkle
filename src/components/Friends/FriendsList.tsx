import React from 'react';
import { User, Gift, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
  friends: any[];
  onRemove: (code: string) => void;
  onSendGift: (username: string) => void;
}

export const FriendsList = ({ friends, onRemove, onSendGift }: Props) => {
  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-50">
        <User className="w-12 h-12 mb-4" />
        <p className="font-medium">No friends yet!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-3">
        {friends.map((friend) => (
          <div key={friend.friendCode} className="p-4 rounded-2xl border-2 border-primary/5 bg-white/40 flex items-center justify-between group hover:border-primary/20 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{friend.username[0].toUpperCase()}</div>
              <div><p className="font-bold text-sm">{friend.username}</p><p className="text-[10px] font-black text-muted-foreground/40 uppercase">{friend.friendCode}</p></div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary h-9 w-9" onClick={() => onSendGift(friend.username)}><Gift className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-destructive/10 hover:text-destructive h-9 w-9" onClick={() => onRemove(friend.friendCode)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
