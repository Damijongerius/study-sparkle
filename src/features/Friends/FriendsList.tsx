import React from 'react';
import { UserMinus, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Props {
    friends: any[];
    onRemove: (id: string) => void;
    onSendGift: (u: string) => void;
}

export const FriendsList = ({ friends, onRemove, onSendGift }: Props) => (
  <div className="space-y-3">
    {friends.length === 0 ? <p className="text-center py-8 text-muted-foreground italic text-sm">No friends added yet. Share your code! ✨</p> :
     friends.map(f => (
      <div key={f.friendCode} className="flex items-center justify-between p-4 bg-white/60 rounded-2xl border-2 border-primary/5 hover:border-primary/20 transition-all group">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/10 shadow-sm"><AvatarFallback className="bg-primary/10 text-primary font-bold">{f.username[0].toUpperCase()}</AvatarFallback></Avatar>
          <div className="text-left"><p className="font-bold text-sm">{f.username}</p><p className="text-[10px] text-muted-foreground uppercase font-black">#{f.friendCode}</p></div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-primary hover:bg-primary/10" onClick={() => onSendGift(f.username)}><Mail className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-red-50" onClick={() => onRemove(f.friendCode)}><UserMinus className="w-4 h-4" /></Button>
        </div>
      </div>
    ))}
  </div>
);
