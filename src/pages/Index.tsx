import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StudyTimer } from '@/components/StudyTimer';
import { StickerShop } from '@/components/StickerShop';
import { StickerCard } from '@/components/StickerCard';
import { StatsDisplay } from '@/components/StatsDisplay';
import { Celebration } from '@/components/Celebration';
import { CardSelectModal } from '@/components/CardSelectModal';
import { ActivityLog } from '@/components/ActivityLog';
import { FriendsManager } from '@/components/FriendsManager';
import { CreateGiftCard } from '@/components/CreateGiftCard';
import { useStudyStore } from '@/hooks/useStudyStore';
import { Friend } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { BookOpen, ShoppingBag, Sparkles, Heart, ScrollText, LogOut, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Tab = 'study' | 'shop' | 'collection' | 'log';

interface TimerState {
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  applyPausePenalty: () => void;
}

interface IndexProps {
  user: { username: string; friendCode: string };
  friends: Friend[];
  onLogout: () => void;
  onAddFriend: (code: string) => { success: boolean; error?: string };
  onRemoveFriend: (friendCode: string) => void;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const tabContentVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const Index = ({ user, friends, onLogout, onAddFriend, onRemoveFriend }: IndexProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('study');
  const [showCelebration, setShowCelebration] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [giftingTo, setGiftingTo] = useState<string | null>(null);
  const [showFriends, setShowFriends] = useState(false);
  const timerRef = useRef<TimerState | null>(null);

  const store = useStudyStore(user.username);

  const handleStudyComplete = useCallback((minutes: number, points: number, effectiveness?: number) => {
    store.addPoints(points, minutes, effectiveness);
    setEarnedPoints(points);
    setShowCelebration(true);
  }, [store]);

  const handlePurchase = useCallback((stickerId: string) => {
    return store.initiatePurchase(stickerId);
  }, [store]);

  const handleSelectCard = useCallback((cardId: string) => {
    const success = store.confirmPurchase(cardId);
    if (success) {
      toast.success('Sticker added! 🎉', { description: 'Check your sticker card to see it!' });
    }
  }, [store]);

  const handleCreateCardAndAdd = useCallback(() => {
    const newCard = store.createCard();
    const success = store.confirmPurchase(newCard.id);
    if (success) toast.success('New card created with your sticker! 🌟');
  }, [store]);

  const handleRedeemCard = useCallback((cardId: string) => {
    const success = store.redeemCard(cardId);
    if (success) toast.success('Card redeemed! 🎁', { description: 'Congratulations on completing your collection!' });
  }, [store]);

  const handleTabChange = useCallback((newTab: Tab) => {
    if (activeTab === 'study' && newTab !== 'study' && timerRef.current?.isRunning) {
      timerRef.current.setIsRunning(false);
      timerRef.current.applyPausePenalty();
      store.logPause();
      toast('⏸️ Timer paused! -5 points', { description: 'Your progress is saved, come back soon! 💪' });
    }
    setActiveTab(newTab);
  }, [activeTab, store]);

  const registerTimer = useCallback((timer: TimerState) => {
    timerRef.current = timer;
  }, []);

  const handleGiftCard = (friendUsername: string) => setGiftingTo(friendUsername);

  const handleCreateGiftCard = (name: string, goal: string, slots: number) => {
    if (!giftingTo) return;
    const success = store.sendGiftCard(giftingTo, name, goal, slots);
    if (success) {
      toast.success(`Gift card sent to ${giftingTo}! 🎁`);
      setGiftingTo(null);
    }
  };

  const tabs = [
    { id: 'study' as Tab, label: 'Study', icon: BookOpen, emoji: '📚' },
    { id: 'shop' as Tab, label: 'Shop', icon: ShoppingBag, emoji: '🛍️' },
    { id: 'collection' as Tab, label: 'Stickers', icon: Sparkles, emoji: '✨' },
    { id: 'log' as Tab, label: 'Log', icon: ScrollText, emoji: '📝' },
  ];

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial="initial"
      animate="animate"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <header className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-sm text-muted-foreground">Hi, </span>
              <span className="font-semibold text-primary">{user.username}</span>
              <span className="text-lg">👋</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFriends(true)}
                className="gap-2"
              >
                <Users className="w-4 h-4" />
                Friends
                <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {friends.length}
                </span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-muted-foreground cursor-default">
                    {user.username}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onLogout} className="text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </div>
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-4xl md:text-5xl font-fredoka font-bold text-gradient-primary flex items-center justify-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Heart className="w-8 h-8 text-pink-medium fill-pink-medium" />
              </motion.div>
              Study Buddy
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
              >
                <Heart className="w-8 h-8 text-pink-medium fill-pink-medium" />
              </motion.div>
            </h1>
            <p className="text-lg text-muted-foreground mt-2 font-medium">
              Study hard, earn stickers! 🌸
            </p>
          </motion.div>
        </div>
      </header>

      {/* Stats */}
      <motion.div 
        className="px-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="max-w-4xl mx-auto">
          <StatsDisplay
            totalPoints={store.totalPoints}
            totalStudyMinutes={store.totalStudyMinutes}
            studySessions={store.studySessions}
            stickerCount={store.ownedStickers.length}
          />
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.nav 
        className="px-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="max-w-lg mx-auto flex gap-2 p-2 bg-card rounded-2xl shadow-soft border-2 border-primary/10">
          {tabs.map((tab, index) => (
            <motion.div
              key={tab.id}
              className="flex-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <Button
                variant={activeTab === tab.id ? 'cute' : 'ghost'}
                className={cn(
                  "w-full gap-2",
                  activeTab === tab.id && "shadow-glow"
                )}
                onClick={() => handleTabChange(tab.id)}
              >
                <motion.span 
                  className="text-lg"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {tab.emoji}
                </motion.span>
                <span className="hidden sm:inline">{tab.label}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className={cn(
              "bg-card rounded-3xl p-6 md:p-8 shadow-float border-2 border-primary/10",
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <AnimatePresence mode="wait">
              {activeTab === 'study' && (
                <motion.div
                  key="study"
                  variants={tabContentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <h2 className="text-2xl font-fredoka font-bold text-foreground mb-2">
                      Ready to Study? 📖
                    </h2>
                    <p className="text-muted-foreground">
                      Pick a study block and earn points!
                    </p>
                  </div>
                  <StudyTimer 
                    onComplete={handleStudyComplete} 
                    registerTimer={registerTimer}
                    onPause={() => store.logPause()}
                  />
                </motion.div>
              )}

              {activeTab === 'shop' && (
                <motion.div
                  key="shop"
                  variants={tabContentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <StickerShop
                    stickers={store.stickers}
                    points={store.totalPoints}
                    onPurchase={handlePurchase}
                    hasSticker={store.hasSticker}
                    getStickerCount={store.getStickerCount}
                    canPurchaseToday={store.canPurchaseToday}
                    getTimeUntilNextPurchase={store.getTimeUntilNextPurchase}
                  />
                </motion.div>
              )}

              {activeTab === 'collection' && (
                <motion.div
                  key="collection"
                  variants={tabContentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <StickerCard
                    stickerCards={store.stickerCards}
                    allStickers={store.stickers}
                    onRedeemCard={handleRedeemCard}
                  />
                </motion.div>
              )}

              {activeTab === 'log' && (
                <motion.div
                  key="log"
                  variants={tabContentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <ActivityLog
                    logs={store.activityLogs}
                    reminders={store.reminders}
                    onAddJournalEntry={store.addJournalEntry}
                    onAddReminder={store.addReminder}
                    onDismissReminder={store.dismissReminder}
                    onTriggerReminder={store.triggerReminder}
                    getDueReminders={store.getDueReminders}
                  />
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <motion.footer 
        className="py-6 text-center text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p>Made with 💖 for my favorite study buddy</p>
      </motion.footer>

      {/* Celebration Modal */}
      <Celebration
        show={showCelebration}
        points={earnedPoints}
        onComplete={() => setShowCelebration(false)}
      />

      {/* Card Selection Modal */}
      <CardSelectModal
        open={!!store.pendingSticker}
        sticker={store.pendingStickerData}
        availableCards={store.getAvailableCards()}
        onSelectCard={handleSelectCard}
        onCreateCard={handleCreateCardAndAdd}
        onCancel={store.cancelPurchase}
      />

      {/* Friends Panel */}
      <AnimatePresence>
        {showFriends && (
          <motion.div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFriends(false)}
          >
            <motion.div
              className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l shadow-xl p-6 overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-fredoka font-bold">Friends 👥</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowFriends(false)}>
                  ✕
                </Button>
              </div>
              {giftingTo ? (
                <CreateGiftCard
                  friendUsername={giftingTo}
                  onCancel={() => setGiftingTo(null)}
                  onCreateCard={handleCreateGiftCard}
                />
              ) : (
                <FriendsManager
                  friendCode={user.friendCode}
                  friends={friends}
                  onAddFriend={onAddFriend}
                  onRemoveFriend={onRemoveFriend}
                  onGiftCard={handleGiftCard}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Index;
