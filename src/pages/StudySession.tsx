import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Star, ArrowRight } from 'lucide-react';
import { useStudyStoreContext } from '@/hooks/useStudyStoreContext';
import { StudyContent } from '@/features/Study/StudyContent';
import { StudyNavigation, Tab } from '@/features/Study/StudyNavigation';
import { StudyModals } from '@/features/Study/StudyModals';
import { sfx } from '@/lib/sfx';
import { toast } from 'sonner';
import { StudyStore } from '@/types';

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
  totalPoints: number;
  totalStudyMinutes: number;
}

/** Sidebar stats component to flatten layout */
function StudySidebar({ activeTab, onTabChange, totalPoints, totalStudyMinutes }: SidebarProps) {
  return (
    <div className="lg:col-span-3 sticky top-8 space-y-6">
      <StudyNavigation activeTab={activeTab} onTabChange={onTabChange} />
      <div className="bg-primary/5 rounded-[2rem] p-6 border-2 border-primary/10">
        <div className="flex items-center gap-3 mb-4">
          <Star className="text-yellow-500 fill-yellow-500" /> 
          <span className="font-fredoka font-bold text-xl">{totalPoints} pts</span>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="text-primary" /> 
          <span className="font-fredoka font-bold text-xl">{totalStudyMinutes} mins</span>
        </div>
      </div>
    </div>
  );
}

/** Main Study Session Page */
export default function StudySession() {
  const store = useStudyStoreContext();
  const [activeTab, setActiveTab] = useState<Tab>('study');
  const [showCelebration, setShowCelebration] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const timerRef = useRef<any>(null);

  const handleStudyComplete = (mins: number, pts: number) => {
    store.addPoints(pts, mins);
    setEarnedPoints(pts);
    setShowCelebration(true);
    sfx.milestone();
  };

  const handleSelectCard = async (cardId: string) => {
    if (store.confirmPurchase(cardId)) {
      sfx.purchase();
      toast.success('Sticker added to card! ✨');
    }
  };

  const handleRedeem = async (id: string) => {
    await store.redeemCard(id);
    sfx.redeem();
  };

  const handleCreateCard = async () => {
    await store.createCard('New Card', 'My Goal', 9);
    toast.success('New card created! 🆕');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <StudySidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          totalPoints={store.totalPoints} 
          totalStudyMinutes={store.totalStudyMinutes} 
        />

        <div className="lg:col-span-9">
          <StudyContent 
            activeTab={activeTab} 
            onStudyComplete={handleStudyComplete} 
            onPurchase={store.initiatePurchase} 
            onRedeemCard={handleRedeem} 
            onCreateCustomCard={(n, g, s) => store.createCard(n, g, s)} 
            registerTimer={(t) => { timerRef.current = t; }} 
          />
        </div>
      </div>

      <StudyModals 
        showCelebration={showCelebration} 
        earnedPoints={earnedPoints} 
        onCelebrationComplete={() => setShowCelebration(false)} 
        onSelectCard={handleSelectCard} 
        onCreateCard={handleCreateCard} 
      />
    </div>
  );
}
