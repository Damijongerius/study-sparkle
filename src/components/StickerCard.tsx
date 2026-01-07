import { OwnedSticker, Sticker } from '@/hooks/useStudyStore';
import { cn } from '@/lib/utils';
import { Sparkles, Heart } from 'lucide-react';

interface StickerCardProps {
  ownedStickers: OwnedSticker[];
  allStickers: Sticker[];
}

export const StickerCard = ({ ownedStickers, allStickers }: StickerCardProps) => {
  // Create a grid of 16 slots
  const slots = Array.from({ length: 16 }, (_, i) => {
    const owned = ownedStickers[i];
    if (owned) {
      return allStickers.find(s => s.id === owned.stickerId);
    }
    return null;
  });

  const collectedCount = ownedStickers.length;
  const totalSlots = 16;

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
          {collectedCount} of {totalSlots} stickers collected!
        </p>
      </div>

      {/* Sticker Card */}
      <div className="relative max-w-md mx-auto">
        {/* Card background with cute pattern */}
        <div className={cn(
          "bg-gradient-card rounded-3xl p-6 border-4 border-primary/30",
          "shadow-float relative overflow-hidden"
        )}>
          {/* Decorative elements */}
          <div className="absolute top-2 right-2">
            <Sparkles className="w-5 h-5 text-yellow-soft animate-sparkle" />
          </div>
          <div className="absolute bottom-2 left-2">
            <Sparkles className="w-4 h-4 text-pink-medium animate-sparkle" style={{ animationDelay: '0.7s' }} />
          </div>

          {/* Sticker grid */}
          <div className="grid grid-cols-4 gap-3">
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
                  <span className="text-3xl hover:scale-110 transition-transform cursor-default">
                    {sticker.emoji}
                  </span>
                ) : (
                  <span className="text-2xl opacity-30">?</span>
                )}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-6 space-y-2">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                style={{ width: `${(collectedCount / totalSlots) * 100}%` }}
              />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {collectedCount === totalSlots
                ? "🎉 Card Complete! You're amazing!"
                : `${totalSlots - collectedCount} more to complete your card!`}
            </p>
          </div>
        </div>
      </div>

      {/* All owned stickers list */}
      {ownedStickers.length > 16 && (
        <div className="mt-8">
          <h3 className="text-lg font-fredoka font-bold text-foreground mb-4 text-center">
            ✨ Extra Stickers ✨
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {ownedStickers.slice(16).map((owned, index) => {
              const sticker = allStickers.find(s => s.id === owned.stickerId);
              return sticker ? (
                <span
                  key={index}
                  className="text-2xl p-2 bg-card rounded-xl shadow-soft hover:scale-110 transition-transform cursor-default"
                >
                  {sticker.emoji}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};
