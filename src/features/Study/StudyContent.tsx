import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { StudyTimer } from '@/components/StudyTimer';
import { StickerShop } from '@/components/StickerShop';
import { StickerCard } from '@/components/StickerCard';
import { ActivityLog } from '@/components/ActivityLog';
import { useStudyStoreContext } from '@/hooks/useStudyStoreContext';
import { Tab } from './StudyNavigation';
import { EliteTabContent } from '@/components/shared/EliteTabContent';

interface Props {
    activeTab: Tab;
    onStudyComplete: (mins: number, pts: number, eff?: number) => void;
    onPurchase: (id: string) => boolean;
    onRedeemCard: (id: string) => void;
    onCreateCustomCard: (n: string, g: string, s: number, cats?: string[]) => void;
    registerTimer: (t: any) => void;
}

export const StudyContent = ({ activeTab, onStudyComplete, onPurchase, onRedeemCard, onCreateCustomCard, registerTimer }: Props) => {
  const store = useStudyStoreContext();

  return (
    <AnimatePresence mode="wait">
      {activeTab === 'study' && (
        <EliteTabContent id="study">
          <div className="space-y-8">
            <div className="text-center"><h2 className="text-2xl font-fredoka font-bold mb-2">Ready to Study? 📖</h2><p className="text-muted-foreground">Pick a study block and earn points!</p></div>
            <StudyTimer onComplete={onStudyComplete} registerTimer={registerTimer} onPenalty={(a, r) => r === 'pause' ? store.logPause() : store.deductPoints(a, 'reset')} />
          </div>
        </EliteTabContent>
      )}
      {activeTab === 'shop' && (
        <EliteTabContent id="shop">
          <StickerShop stickers={store.stickers} points={store.totalPoints} onPurchase={onPurchase} hasSticker={store.hasSticker} getStickerCount={store.getStickerCount} canPurchaseToday={store.canPurchaseToday} getTimeUntilNextPurchase={store.getTimeUntilNextPurchase} />
        </EliteTabContent>
      )}
      {activeTab === 'collection' && (
        <EliteTabContent id="collection">
          <StickerCard stickerCards={store.stickerCards} allStickers={store.stickers} onRedeemCard={onRedeemCard} onCreateCustomCard={onCreateCustomCard} />
        </EliteTabContent>
      )}
      {activeTab === 'log' && (
        <EliteTabContent id="log">
          <ActivityLog logs={store.activityLogs} reminders={store.reminders} onAddJournalEntry={store.addJournalEntry} onAddReminder={store.addReminder} onDismissReminder={store.dismissReminder} onTriggerReminder={store.triggerReminder} getDueReminders={store.getDueReminders} />
        </EliteTabContent>
      )}
    </AnimatePresence>
  );
};
