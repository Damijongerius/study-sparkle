import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Friend } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Users, Copy, X, Gift, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FriendsManagerProps {
  friendCode: string;
  friends: Friend[];
  onAddFriend: (code: string) => { success: boolean; error?: string };
  onRemoveFriend: (friendCode: string) => void;
  onGiftCard: (friendUsername: string) => void;
}

export const FriendsManager = ({
  friendCode,
  friends,
  onAddFriend,
  onRemoveFriend,
  onGiftCard,
}: FriendsManagerProps) => {
  const [addFriendCode, setAddFriendCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(friendCode);
      setCopied(true);
      toast.success('Friend code copied! 📋');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleAddFriend = () => {
    if (!addFriendCode.trim()) {
      toast.error('Please enter a friend code');
      return;
    }

    const result = onAddFriend(addFriendCode.trim());
    if (result.success) {
      toast.success('Friend added! 🎉');
      setAddFriendCode('');
    } else {
      toast.error(result.error || 'Failed to add friend');
    }
  };

  return (
    <div className="space-y-6">
      {/* Your Friend Code */}
      <motion.div 
        className="bg-gradient-to-r from-primary/10 to-lavender/30 rounded-2xl p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm font-medium text-muted-foreground mb-2">Your Friend Code:</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-card rounded-xl px-4 py-3 font-mono text-xl font-bold tracking-widest text-center text-primary">
            {friendCode}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopyCode}
            className="shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-mint" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Share this code so friends can add you! 💝
        </p>
      </motion.div>

      {/* Add Friend */}
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="text-sm font-medium flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Add a Friend
        </label>
        <div className="flex gap-2">
          <Input
            placeholder="Enter friend code..."
            value={addFriendCode}
            onChange={(e) => setAddFriendCode(e.target.value.toUpperCase())}
            className="font-mono tracking-widest uppercase"
            maxLength={6}
          />
          <Button variant="cute" onClick={handleAddFriend}>
            Add
          </Button>
        </div>
      </motion.div>

      {/* Friends List */}
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className="text-sm font-medium flex items-center gap-2">
          <Users className="w-4 h-4" />
          Friends ({friends.length})
        </label>
        
        {friends.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-4xl mb-2">👥</p>
            <p>No friends yet!</p>
            <p className="text-sm">Share your code to add friends</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {friends.map((friend) => (
                <motion.div
                  key={friend.friendCode}
                  className="flex items-center gap-3 bg-card rounded-xl px-4 py-3 border-2 border-primary/10"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-lavender flex items-center justify-center text-white font-bold">
                    {friend.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{friend.username}</p>
                    <p className="text-xs text-muted-foreground">{friend.friendCode}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onGiftCard(friend.username)}
                    className="text-primary hover:bg-primary/10"
                  >
                    <Gift className="w-4 h-4 mr-1" />
                    Gift Card
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveFriend(friend.friendCode)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
};