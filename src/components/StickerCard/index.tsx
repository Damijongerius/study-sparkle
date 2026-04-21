import React, { useState } from 'react';
import { StickerCardList } from './StickerCardList';
import { CardDisplay } from './CardDisplay';

interface Props {
  stickerCards: any[];
  allStickers: any[];
  onRedeemCard: (id: string) => void;
  onCreateCustomCard: (n: string, g: string, s: number, cats?: string[]) => void;
}

export function StickerCard({ 
  stickerCards, 
  allStickers, 
  onRedeemCard, 
  onCreateCustomCard 
}: Props) {
  const [selectedId, setSelectedId] = useState(stickerCards[0]?.id || null);
  const selectedCard = stickerCards.find(c => c.id === selectedId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1">
        <StickerCardList 
          cards={stickerCards} 
          selectedId={selectedId} 
          onSelect={setSelectedId} 
          onCreateNew={() => onCreateCustomCard('New Card', 'Goal', 9)}
        />
      </div>
      <div className="lg:col-span-3">
        {selectedCard && (
          <CardDisplay 
            card={selectedCard} 
            allStickers={allStickers} 
            onRedeem={() => onRedeemCard(selectedCard.id)} 
          />
        )}
      </div>
    </div>
  );
}
