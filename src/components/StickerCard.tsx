import { StickerCard as StickerCardType, Sticker } from '@/hooks/useStudyStore';
import { cn } from '@/lib/utils';
import { Sparkles, Heart, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface StickerCardProps {
  stickerCards: StickerCardType[];
  allStickers: Sticker[];
}

export const StickerCard = ({ stickerCards, allStickers }: StickerCardProps) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(() => {
    // Start on the active (incomplete) card
    const activeIndex = stickerCards.findIndex(c => !c.completedAt);
    return activeIndex >= 0 ? activeIndex : stickerCards.length - 1;
  });

  const currentCard = stickerCards[currentCardIndex];
  if (!currentCard) return null;

  const isCompleted = !!currentCard.completedAt;
  const collectedCount = currentCard.stickers.length;
  const totalSlots = currentCard.slots;

  // Calculate grid columns based on slots
  const getGridCols = (slots: number) => {
    if (slots <= 9) return 3;
    if (slots <= 16) return 4;
    return 5;
  };

  const gridCols = getGridCols(totalSlots);

  // Create slots array
  const slots = Array.from({ length: totalSlots }, (_, i) => {
    const owned = currentCard.stickers[i];
    if (owned) {
      return allStickers.find(s => s.id === owned.stickerId);
    }
    return null;
  });

  const goToPrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const goToNextCard = () => {
    if (currentCardIndex < stickerCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-fredoka font-bold text-gradient-primary flex items-center justify-center gap-2">
          <Heart className="w-6 h-6 text-pink-medium fill-pink-medium" />
          My Sticker Collection
          <Heart className="w-6 h-6 text-pink-medium fill-pink-medium" />
        </h2>
        <p className="text-muted-foreground">
          {stickerCards.filter(c => c.completedAt).length} cards completed!
        </p>
      </div>

      {/* Card Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevCard}
          disabled={currentCardIndex === 0}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          {stickerCards.map((card, index) => (
            <button
              key={card.id}
              onClick={() => setCurrentCardIndex(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                index === currentCardIndex 
                  ? "bg-primary scale-125" 
                  : card.completedAt 
                    ? "bg-mint" 
                    : "bg-muted"
              )}
            />
          ))}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextCard}
          disabled={currentCardIndex === stickerCards.length - 1}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Card Title */}
      <div className="text-center">
        <h3 className="font-fredoka text-lg font-bold text-foreground flex items-center justify-center gap-2">
          {currentCard.name}
          {isCompleted && <Check className="w-5 h-5 text-mint-deep" />}
        </h3>
        <p className="text-sm text-muted-foreground">
          {collectedCount} of {totalSlots} stickers
        </p>
      </div>

      {/* Sticker Card */}
      <div className="relative max-w-md mx-auto">
        <div className={cn(
          "bg-gradient-card rounded-3xl p-6 border-4",
          isCompleted ? "border-mint" : "border-primary/30",
          "shadow-float relative overflow-hidden"
        )}>
          {/* Completed badge */}
          {isCompleted && (
            <div className="absolute top-4 right-4 bg-mint text-mint-deep px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
              <Check className="w-4 h-4" />
              Complete!
            </div>
          )}

          {/* Decorative elements */}
          <div className="absolute top-2 left-2">
            <Sparkles className="w-5 h-5 text-yellow-soft animate-sparkle" />
          </div>
          <div className="absolute bottom-2 right-2">
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
                  isCompleted ? "bg-mint" : "bg-gradient-primary"
                )}
                style={{ width: `${(collectedCount / totalSlots) * 100}%` }}
              />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {isCompleted
                ? "🎉 Card Complete! You're amazing!"
                : `${totalSlots - collectedCount} more to complete this card!`}
            </p>
          </div>
        </div>
      </div>

      {/* Total Stats */}
      <div className="text-center text-sm text-muted-foreground">
        Total stickers collected: {stickerCards.reduce((sum, card) => sum + card.stickers.length, 0)}
      </div>
    </div>
  );
};
