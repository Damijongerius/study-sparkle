import { useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sticker } from '@/hooks/useStudyStore';
import { cn } from '@/lib/utils';
import { ShoppingBag, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

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

// Hook for horizontal drag scrolling
const useDragScroll = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!ref.current) return;
    setIsDragging(true);
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    ref.current.scrollLeft = scrollLeft - walk;
  };

  return {
    ref,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
    onMouseMove: handleMouseMove,
    style: { cursor: isDragging ? 'grabbing' : 'grab' } as React.CSSProperties,
  };
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
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(['animals']));

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

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
    <div className="space-y-4">
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

      {categories.map((category) => {
        const isOpen = openCategories.has(category);
        const sortedStickers = getSortedStickers(category);
        const availableCount = sortedStickers.filter(s => canPurchaseToday(s.id)).length;

        return (
          <Collapsible 
            key={category} 
            open={isOpen} 
            onOpenChange={() => toggleCategory(category)}
          >
            <CollapsibleTrigger asChild>
              <button className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl transition-all",
                "border-2 hover:border-primary/40",
                isOpen ? "bg-card border-primary/30" : "bg-muted/30 border-muted"
              )}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{categoryLabels[category].split(' ')[0]}</span>
                  <h3 className="text-lg font-fredoka font-bold text-foreground">
                    {categoryLabels[category].split(' ').slice(1).join(' ')}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    ({availableCount}/{sortedStickers.length} available)
                  </span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <AnimatePresence>
                {isOpen && (
                  <CategoryRow
                    stickers={sortedStickers}
                    points={points}
                    onPurchase={onPurchase}
                    hasSticker={hasSticker}
                    getStickerCount={getStickerCount}
                    canPurchaseToday={canPurchaseToday}
                    getTimeUntilNextPurchase={getTimeUntilNextPurchase}
                    categoryColors={categoryColors}
                    category={category}
                  />
                )}
              </AnimatePresence>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
};

interface CategoryRowProps {
  stickers: Sticker[];
  points: number;
  onPurchase: (stickerId: string) => boolean;
  hasSticker: (stickerId: string) => boolean;
  getStickerCount: (stickerId: string) => number;
  canPurchaseToday: (stickerId: string) => boolean;
  getTimeUntilNextPurchase: (stickerId: string) => string | null;
  categoryColors: Record<string, string>;
  category: string;
}

const CategoryRow = ({
  stickers,
  points,
  onPurchase,
  hasSticker,
  getStickerCount,
  canPurchaseToday,
  getTimeUntilNextPurchase,
  categoryColors,
  category,
}: CategoryRowProps) => {
  const dragProps = useDragScroll();

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-2"
    >
      <div
        {...dragProps}
        ref={dragProps.ref}
        className="flex gap-4 overflow-x-auto pb-3 px-1 scrollbar-thin select-none"
        style={dragProps.style}
      >
        {stickers.map((sticker) => {
          const owned = hasSticker(sticker.id);
          const count = getStickerCount(sticker.id);
          const canAfford = points >= sticker.cost;
          const canBuyToday = canPurchaseToday(sticker.id);
          const timeUntilNext = getTimeUntilNextPurchase(sticker.id);

          return (
            <div
              key={sticker.id}
              className={cn(
                "relative p-4 rounded-2xl border-2 transition-all duration-200 flex-shrink-0",
                "flex flex-col items-center gap-2 w-[140px]",
                !canBuyToday ? "border-muted bg-muted/30" : 
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
                <div className="flex items-center gap-1 text-muted-foreground text-xs font-medium text-center">
                  <Clock className="w-3 h-3" />
                  Tomorrow!
                </div>
              ) : owned ? (
                <Button
                  variant={canAfford ? 'mint' : 'outline'}
                  size="sm"
                  onClick={() => onPurchase(sticker.id)}
                  disabled={!canAfford}
                  className="w-full mt-1"
                >
                  {canAfford ? 'Get Another!' : 'Need pts'}
                </Button>
              ) : (
                <Button
                  variant={canAfford ? 'cute' : 'outline'}
                  size="sm"
                  onClick={() => onPurchase(sticker.id)}
                  disabled={!canAfford}
                  className="w-full mt-1"
                >
                  {canAfford ? 'Get Sticker!' : 'Need pts'}
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
      <p className="text-xs text-center text-muted-foreground mt-1">
        👆 Drag to scroll
      </p>
    </motion.div>
  );
};
