import React, { useState } from 'react';
import { Users, UserPlus, Copy, Check } from 'lucide-react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FriendsList } from './Friends/FriendsList';
import { EliteCard } from './shared/EliteCard';

interface Props {
  friendCode: string; friends: any[]; onAddFriend: (c: string) => Promise<any>;
  onRemoveFriend: (c: string) => Promise<any>; onSendGift: (u: string) => void;
}

export const FriendsManager = ({ friendCode, friends, onAddFriend, onRemoveFriend, onSendGift }: Props) => {
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  const copy = () => { navigator.clipboard.writeText(friendCode); setCopied(true); setTimeout(() => setCopied(false), 2000); toast.success('Copied! ✨'); };
  const add = async () => { if(!code) return; const res = await onAddFriend(code); if(res.error) toast.error(res.error); else { setCode(''); toast.success('Friend added! 💖'); } };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
      <EliteCard className="p-8" variant="glass">
        <CardHeader className="p-0 mb-6"><CardTitle className="flex items-center gap-3 font-fredoka"><Users className="text-primary" /> My Friends</CardTitle></CardHeader>
        <FriendsList friends={friends} onRemove={onRemoveFriend} onSendGift={onSendGift} />
      </EliteCard>
      <div className="space-y-8">
        <EliteCard className="p-6 bg-primary/5" variant="solid">
          <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Your Friend Code</Label>
          <div className="flex gap-2 mt-2"><div className="flex-1 bg-white rounded-xl border-2 px-4 flex items-center font-mono font-bold text-primary tracking-wider">{friendCode}</div><Button onClick={copy} variant="outline" className="rounded-xl border-2 h-12 w-12">{copied ? <Check className="text-green-500" /> : <Copy />}</Button></div>
        </EliteCard>
        <EliteCard className="p-6" variant="solid">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Add by Code</Label>
          <div className="flex gap-2 mt-2"><Input placeholder="Enter code..." value={code} onChange={e => setCode(e.target.value)} className="rounded-xl h-12 border-2 font-bold" /><Button onClick={add} className="rounded-xl h-12 px-6 shadow-glow font-bold gap-2"><UserPlus className="w-4 h-4" /> Add</Button></div>
        </EliteCard>
      </div>
    </div>
  );
};
