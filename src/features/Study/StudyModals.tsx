import React from 'react';
import { Celebration } from '@/components/Celebration';
import { CardSelectModal } from '@/components/CardSelectModal';
import { useStudyStoreContext } from '@/hooks/useStudyStoreContext';

interface Props {
    showCelebration: boolean;
    earnedPoints: number;
    onCelebrationComplete: () => void;
    onSelectCard: (id: string) => void;
    onCreateCard: () => void;
}

export const StudyModals = ({ showCelebration, earnedPoints, onCelebrationComplete, onSelectCard, onCreateCard }: Props) => {
  const store = useStudyStoreContext();

  return (
    <>
      <Celebration show={showCelebration} points={earnedPoints} onComplete={onCelebrationComplete} />
      <CardSelectModal
        open={!!store.pendingSticker}
        sticker={store.pendingStickerData}
        availableCards={store.getAvailableCards()}
        onSelectCard={onSelectCard}
        onCreateCard={onCreateCard}
        onCancel={store.cancelPurchase}
      />
    </>
  );
};
