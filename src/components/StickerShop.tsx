import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Sticker } from '@/hooks/useStudyStore';
import { cn } from '@/lib/utils';
import { ShoppingBag, Clock } from 'lucide-react';

interface StickerShopProps {
  stickers: Sticker[];
  points: number;
  onPurchase: (stickerId: string) => boolean;
  hasSticker: (stickerId: string) => boolean;
  getStickerCount: (stickerId: string) => number;
  canPurchaseToday: (stickerId: string) => boolean;
  getTimeUntilNextPurchase: (stickerId: string) => string | null;
}

const categoryColors: Record<string, string> = {
  animals: 'bg-peach',
  food: 'bg-yellow-soft',
  nature: 'bg-mint',
  sparkles: 'bg-lavender',
  space: 'bg-primary/20',
  cozy: 'bg-pink-soft',
};

const categoryLabels: Record<string, string> = {
  animals: '🐾 Animals',
  food: '🍰 Treats',
  nature: '🌿 Nature',
  sparkles: '✨ Sparkles',
  space: '🌙 Space',
  cozy: '☕ Cozy',
};

export const StickerShop = ({ 
  stickers, 
  points, 
  onPurchase, 
  hasSticker, 
  getStickerCount,
  canPurchaseToday,
  getTimeUntilNextPurchase,
}: StickerShopProps) => {
  const categories = ['animals', 'food', 'nature', 'sparkles', 'space', 'cozy'] as const;

  // Sort stickers by cost (low to high), redeemed today at end
  const getSortedStickers = useMemo(() => {
    return (category: string) => {
      const categoryStickers = stickers.filter((s) => s.category === category);
      
      return categoryStickers.sort((a, b) => {
        const aCanPurchase = canPurchaseToday(a.id);
        const bCanPurchase = canPurchaseToday(b.id);
        
        // Stickers that can't be purchased today go to the end
        if (aCanPurchase && !bCanPurchase) return -1;
        if (!aCanPurchase && bCanPurchase) return 1;
        
        // Within same availability, sort by cost (low to high)
        return a.cost - b.cost;
      });
    };
  }, [stickers, canPurchaseToday]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-card px-6 py-3 rounded-2xl shadow-soft border-2 border-primary/20">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <span className="font-fredoka text-xl text-foreground">
            Your Points: <span className="text-primary font-bold">{points}</span>
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Each sticker can only be redeemed once per day! 🌸
        </p>
      </div>

      {categories.map((category) => (
        <div key={category} className="space-y-4">
          <h3 className="text-xl font-fredoka font-bold text-foreground">
            {categoryLabels[category]}
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {getSortedStickers(category).map((sticker) => {
              const owned = hasSticker(sticker.id);
              const count = getStickerCount(sticker.id);
              const canAfford = points >= sticker.cost;
              const canBuyToday = canPurchaseToday(sticker.id);
              const timeUntilNext = getTimeUntilNextPurchase(sticker.id);

              return (
                <div
                  key={sticker.id}
                  className={cn(
                    "relative p-4 rounded-2xl border-2 transition-all duration-200",
                    "flex flex-col items-center gap-2",
                    !canBuyToday ? "border-muted bg-muted/30 order-last" : 
                    owned ? "border-mint bg-mint/20" : "border-primary/20 bg-card",
                    canAfford && canBuyToday && "hover:border-primary hover:shadow-soft hover:scale-105 cursor-pointer"
                  )}
                >
                  {/* Sticker display */}
                  <div className={cn(
                    "text-5xl p-3 rounded-xl",
                    categoryColors[category],
                    !canBuyToday && "opacity-50"
                  )}>
                    {sticker.emoji}
                  </div>
                  
                  <span className="font-semibold text-sm text-center text-foreground">
                    {sticker.name}
                  </span>
                  
                  <span className="text-xs text-muted-foreground">
                    {sticker.cost} points
                  </span>

                  {/* Cooldown indicator */}
                  {!canBuyToday && timeUntilNext && (
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Clock className="w-3 h-3" />
                      {timeUntilNext}
                    </div>
                  )}

                  {/* Purchase button or status */}
                  {!canBuyToday ? (
                    <div className="flex items-center gap-1 text-muted-foreground text-sm font-medium">
                      <Clock className="w-4 h-4" />
                      Come back tomorrow!
                    </div>
                  ) : owned ? (
                    <Button
                      variant={canAfford ? 'mint' : 'outline'}
                      size="sm"
                      onClick={() => onPurchase(sticker.id)}
                      disabled={!canAfford}
                      className="w-full mt-1"
                    >
                      {canAfford ? 'Get Another!' : 'Need more pts'}
                    </Button>
                  ) : (
                    <Button
                      variant={canAfford ? 'cute' : 'outline'}
                      size="sm"
                      onClick={() => onPurchase(sticker.id)}
                      disabled={!canAfford}
                      className="w-full mt-1"
                    >
                      {canAfford ? 'Get Sticker!' : 'Need more pts'}
                    </Button>
                  )}

                  {/* Badge for count */}
                  {count > 0 && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                      {count}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
