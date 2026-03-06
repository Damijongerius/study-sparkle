import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useStudyStoreContext } from '@/hooks/useStudyStoreContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { sfx } from '@/lib/sfx';
import { StudyNavigation, Tab } from '@/features/Study/StudyNavigation';
import { StudyContent } from '@/features/Study/StudyContent';
import { StudyModals } from '@/features/Study/StudyModals';

const StudySession = () => {
  const [activeTab, setActiveTab] = useState<Tab>('study');
  const [showCelebration, setShowCelebration] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const timerRef = useRef<any>(null);
  const store = useStudyStoreContext();

  const handleStudyComplete = useCallback((mins: number, pts: number, eff?: number) => {
    store.addPoints(pts, mins, eff); setEarnedPoints(pts); setShowCelebration(true);
  }, [store]);

  const handleSelectCard = useCallback((cardId: string) => {
    const card = store.stickerCards.find(c => c.id === cardId);
    const willComp = !!card && card.status === 'in-progress' && card.stickers.length + 1 >= card.slots;
    if (store.confirmPurchase(cardId)) {
      if (willComp) { sfx.complete(); toast.success('Card completed! 🎉'); }
      else { sfx.purchase(); toast.success('Sticker added! 🎉'); }
    }
  }, [store]);

  const handleTabChange = useCallback((newTab: Tab) => {
    if (activeTab === 'study' && newTab !== 'study' && timerRef.current?.isRunning) {
      timerRef.current.stop(); timerRef.current.applyPausePenalty(); store.logPause(); sfx.failure();
      toast('⏸️ Timer paused! -5 points');
    }
    setActiveTab(newTab);
  }, [activeTab, store]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <StudyNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      <motion.div className="bg-card rounded-3xl p-6 md:p-8 shadow-float border-2 border-primary/10" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <StudyContent activeTab={activeTab} onStudyComplete={handleStudyComplete} onPurchase={store.initiatePurchase} onRedeemCard={(id) => store.redeemCard(id) && sfx.redeem() && toast.success('Redeemed!')} onCreateCustomCard={store.createCard} registerTimer={(t) => { timerRef.current = t; }} />
      </motion.div>
      <StudyModals showCelebration={showCelebration} earnedPoints={earnedPoints} onCelebrationComplete={() => setShowCelebration(false)} onSelectCard={handleSelectCard} onCreateCard={() => store.confirmPurchase(store.createCard('New Card').id)} />
    </div>
  );
};

export default StudySession;
