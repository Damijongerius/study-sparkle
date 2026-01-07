import { Button } from '@/components/ui/button';
import { Sticker } from '@/hooks/useStudyStore';
import { cn } from '@/lib/utils';
import { ShoppingBag, Check } from 'lucide-react';

interface StickerShopProps {
  stickers: Sticker[];
  points: number;
  onPurchase: (stickerId: string) => boolean;
  hasSticker: (stickerId: string) => boolean;
  getStickerCount: (stickerId: string) => number;
}

const categoryColors = {
  animals: 'bg-peach',
  food: 'bg-yellow-soft',
  nature: 'bg-mint',
  sparkles: 'bg-lavender',
};

const categoryLabels = {
  animals: '🐾 Animals',
  food: '🍰 Treats',
  nature: '🌿 Nature',
  sparkles: '✨ Sparkles',
};

export const StickerShop = ({ stickers, points, onPurchase, hasSticker, getStickerCount }: StickerShopProps) => {
  const categories = ['animals', 'food', 'nature', 'sparkles'] as const;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-card px-6 py-3 rounded-2xl shadow-soft border-2 border-primary/20">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <span className="font-fredoka text-xl text-foreground">
            Your Points: <span className="text-primary font-bold">{points}</span>
          </span>
        </div>
      </div>

      {categories.map((category) => (
        <div key={category} className="space-y-4">
          <h3 className="text-xl font-fredoka font-bold text-foreground">
            {categoryLabels[category]}
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {stickers
              .filter((s) => s.category === category)
              .map((sticker) => {
                const owned = hasSticker(sticker.id);
                const count = getStickerCount(sticker.id);
                const canAfford = points >= sticker.cost;

                return (
                  <div
                    key={sticker.id}
                    className={cn(
                      "relative p-4 rounded-2xl border-2 transition-all duration-200",
                      "flex flex-col items-center gap-2",
                      owned ? "border-mint bg-mint/20" : "border-primary/20 bg-card",
                      canAfford && !owned && "hover:border-primary hover:shadow-soft hover:scale-105 cursor-pointer"
                    )}
                  >
                    {/* Sticker display */}
                    <div className={cn(
                      "text-5xl p-3 rounded-xl",
                      categoryColors[category]
                    )}>
                      {sticker.emoji}
                    </div>
                    
                    <span className="font-semibold text-sm text-center text-foreground">
                      {sticker.name}
                    </span>
                    
                    <span className="text-xs text-muted-foreground">
                      {sticker.cost} points
                    </span>

                    {/* Purchase button or owned indicator */}
                    {owned ? (
                      <div className="flex items-center gap-1 text-mint-deep text-sm font-medium">
                        <Check className="w-4 h-4" />
                        Owned {count > 1 && `(${count})`}
                      </div>
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
