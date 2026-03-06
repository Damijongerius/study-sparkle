import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FriendsManager } from '@/components/FriendsManager';
import { CreateGiftCard } from '@/components/CreateGiftCard';
import { useStudyStoreContext } from '@/hooks/useStudyStoreContext';
import { toast } from 'sonner';

interface Props {
    open: boolean; onClose: () => void; user: any; friends: any[]; onAdd: (c: string) => any; onRemove: (c: string) => void;
}

export const FriendsPanel = ({ open, onClose, user, friends, onAdd, onRemove }: Props) => {
  const [giftTo, setGiftTo] = useState<string | null>(null);
  const store = useStudyStoreContext();

  const handleSendGift = async (n: string, g: string, s: number, cats?: string[]) => {
    if (!giftTo) return;
    if (await store.sendGiftCard(giftTo, n, g, s, cats as any)) { toast.success('Sent! 🎁'); setGiftTo(null); }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l p-6 overflow-y-auto shadow-2xl" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-fredoka font-bold">Friends 👥</h2><Button variant="ghost" onClick={onClose}><X /></Button></div>
            {giftTo ? <CreateGiftCard friendUsername={giftTo} onCancel={() => setGiftTo(null)} onCreateCard={handleSendGift} /> :
             <FriendsManager friendCode={user.friendCode} friends={friends} onAddFriend={onAdd} onRemoveFriend={onRemove} onSendGift={setGiftTo} />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
