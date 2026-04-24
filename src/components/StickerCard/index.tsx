import React, { useState } from 'react';
import { CardDisplay } from './CardDisplay';
import { StickerCardList } from './StickerCardList';
import { CreateCustomCard } from '@/components/CreateCustomCard';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    stickerCards: any[];
    allStickers: any[];
    onRedeemCard: (id: string) => void;
    onCreateCustomCard: (name: string, goal: string, slots: number, cats?: string[]) => void;
}

export const StickerCard = ({ stickerCards, allStickers, onRedeemCard, onCreateCustomCard }: Props) => {
    const [selectedCardId, setSelectedCardId] = useState<string | null>(stickerCards[0]?.id || null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const selectedCard = stickerCards.find(c => c.id === selectedCardId) || stickerCards[0];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="text-left">
                    <h2 className="text-2xl font-fredoka font-bold text-primary">Your Collections ✨</h2>
                    <p className="text-muted-foreground font-medium">Complete cards to earn rewards!</p>
                </div>
            </div>

            <StickerCardList 
                cards={stickerCards} 
                selectedId={selectedCardId} 
                onSelect={setSelectedCardId} 
                onCreateNew={() => setIsCreateOpen(true)} 
            />

            <AnimatePresence mode="wait">
                {selectedCard && (
                    <motion.div
                        key={selectedCard.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <CardDisplay 
                            card={selectedCard} 
                            allStickers={allStickers} 
                            onRedeem={onRedeemCard} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <CreateCustomCard 
                open={isCreateOpen} 
                onOpenChange={setIsCreateOpen} 
                onSubmit={(name, goal, slots, cats) => {
                    onCreateCustomCard(name, goal, slots, cats);
                    setIsCreateOpen(false);
                }} 
            />
        </div>
    );
};
