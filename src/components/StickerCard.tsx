import { StickerCard as StickerCardType, Sticker, CardStatus } from '@/hooks/useStudyStore';
import { cn } from '@/lib/utils';
import { Sparkles, Heart, ChevronLeft, ChevronRight, Check, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface StickerCardProps {
  stickerCards: StickerCardType[];
  allStickers: Sticker[];
  onRedeemCard?: (cardId: string) => void;
}

const statusConfig: Record<CardStatus, { label: string; color: string; icon: React.ReactNode }> = {
  'in-progress': { label: 'In Progress', color: 'bg-primary/20 text-primary', icon: <Sparkles className="w-3 h-3" /> },
  'done': { label: 'Complete!', color: 'bg-mint text-mint-deep', icon: <Check className="w-3 h-3" /> },
  'redeemed': { label: 'Redeemed', color: 'bg-lavender text-purple-700', icon: <Gift className="w-3 h-3" /> },
};

export const StickerCard = ({ stickerCards, allStickers, onRedeemCard }: StickerCardProps) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(() => {
    const activeIndex = stickerCards.findIndex(c => c.status === 'in-progress');
    return activeIndex >= 0 ? activeIndex : 0;
  });

  const currentCard = stickerCards[currentCardIndex];
  if (!currentCard) return null;

  const collectedCount = currentCard.stickers.length;
  const totalSlots = currentCard.slots;
  const statusInfo = statusConfig[currentCard.status];

  const getGridCols = (slots: number) => {
    if (slots <= 9) return 3;
    if (slots <= 16) return 4;
    return 5;
  };

  const gridCols = getGridCols(totalSlots);

  const slots = Array.from({ length: totalSlots }, (_, i) => {
    const owned = currentCard.stickers[i];
    if (owned) {
      return allStickers.find(s => s.id === owned.stickerId);
    }
    return null;
  });

  const goToPrevCard = () => {
    if (currentCardIndex > 0) setCurrentCardIndex(currentCardIndex - 1);
  };

  const goToNextCard = () => {
    if (currentCardIndex < stickerCards.length - 1) setCurrentCardIndex(currentCardIndex + 1);
  };

  const inProgressCount = stickerCards.filter(c => c.status === 'in-progress').length;
  const doneCount = stickerCards.filter(c => c.status === 'done').length;
  const redeemedCount = stickerCards.filter(c => c.status === 'redeemed').length;

  return (
    <div className="space-y-6">
      {/* Header - simplified */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-fredoka font-bold text-gradient-primary flex items-center justify-center gap-2">
          <Heart className="w-6 h-6 text-pink-medium fill-pink-medium" />
          My Sticker Collection
          <Heart className="w-6 h-6 text-pink-medium fill-pink-medium" />
        </h2>
        <div className="flex justify-center gap-3 text-sm">
          <span className="text-muted-foreground">📝 {inProgressCount} in progress</span>
          <span className="text-muted-foreground">✅ {doneCount} complete</span>
          <span className="text-muted-foreground">🎁 {redeemedCount} redeemed</span>
        </div>
      </div>

      {/* Card Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="icon" onClick={goToPrevCard} disabled={currentCardIndex === 0}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-2 flex-wrap justify-center max-w-xs">
          {stickerCards.map((card, index) => (
            <button
              key={card.id}
              onClick={() => setCurrentCardIndex(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                index === currentCardIndex 
                  ? "bg-primary scale-125" 
                  : card.status === 'redeemed'
                    ? "bg-lavender"
                    : card.status === 'done' 
                      ? "bg-mint" 
                      : "bg-muted"
              )}
            />
          ))}
        </div>
        
        <Button variant="ghost" size="icon" onClick={goToNextCard} disabled={currentCardIndex === stickerCards.length - 1}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Sticker Card - with title inside */}
      <div className="relative max-w-md mx-auto">
        <div className={cn(
          "bg-gradient-card rounded-3xl p-6 border-4",
          currentCard.status === 'redeemed' ? "border-lavender" :
          currentCard.status === 'done' ? "border-mint" : "border-primary/30",
          "shadow-float relative overflow-hidden"
        )}>
          {/* Card Title & Status - now inside the card */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <h3 className="font-fredoka text-xl font-bold text-foreground">
                {currentCard.name}
              </h3>
              <Badge className={cn("text-xs", statusInfo.color)}>
                {statusInfo.icon}
                <span className="ml-1">{statusInfo.label}</span>
              </Badge>
            </div>
            
            {/* Show goal/reward if exists */}
            {currentCard.goal && (
              <div className="bg-primary/10 rounded-xl px-3 py-2 mt-2">
                <p className="text-sm font-medium text-primary">🎁 Reward:</p>
                <p className="text-sm text-foreground">{currentCard.goal}</p>
              </div>
            )}
            
            {/* Show who gave the card */}
            {currentCard.givenBy && (
              <p className="text-xs text-muted-foreground mt-1">
                From: {currentCard.givenBy} 💝
              </p>
            )}
          </div>

          {/* Decorative elements */}
          <div className="absolute top-2 left-2">
            <Sparkles className="w-5 h-5 text-yellow-soft animate-sparkle" />
          </div>
          <div className="absolute top-2 right-2">
            <Sparkles className="w-4 h-4 text-pink-medium animate-sparkle" style={{ animationDelay: '0.7s' }} />
          </div>

          {/* Sticker grid */}
          <div 
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
          >
            {slots.map((sticker, index) => (
              <div
                key={index}
                className={cn(
                  "aspect-square rounded-xl flex items-center justify-center",
                  "transition-all duration-300",
                  sticker
                    ? "bg-card border-2 border-primary/20 shadow-soft animate-pop"
                    : "bg-muted/50 border-2 border-dashed border-primary/20"
                )}
                style={sticker ? { animationDelay: `${index * 0.05}s` } : undefined}
              >
                {sticker ? (
                  <span className="text-2xl sm:text-3xl hover:scale-110 transition-transform cursor-default">
                    {sticker.emoji}
                  </span>
                ) : (
                  <span className="text-xl opacity-30">?</span>
                )}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-6 space-y-2">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  currentCard.status === 'redeemed' ? "bg-lavender" :
                  currentCard.status === 'done' ? "bg-mint" : "bg-gradient-primary"
                )}
                style={{ width: `${(collectedCount / totalSlots) * 100}%` }}
              />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {currentCard.status === 'redeemed'
                ? "🎁 This card has been redeemed!"
                : currentCard.status === 'done'
                  ? "🎉 Ready to redeem!"
                  : `${totalSlots - collectedCount} more to complete!`}
            </p>
          </div>
        </div>

        {/* Redeem Button for completed cards */}
        {currentCard.status === 'done' && onRedeemCard && (
          <div className="mt-4 text-center">
            <Button 
              variant="cute" 
              size="lg" 
              onClick={() => onRedeemCard(currentCard.id)}
              className="animate-bounce-soft"
            >
              <Gift className="w-5 h-5 mr-2" />
              Redeem This Card!
            </Button>
          </div>
        )}
      </div>

      {/* Total Stats */}
      <div className="text-center text-sm text-muted-foreground">
        Total stickers collected: {stickerCards.reduce((sum, card) => sum + card.stickers.length, 0)}
      </div>
    </div>
  );
};