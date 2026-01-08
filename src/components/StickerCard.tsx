import { useState, useMemo, useRef } from 'react';
import { StickerCard as StickerCardType, Sticker, CardStatus, CATEGORY_LABELS, StickerCategory } from '@/hooks/useStudyStore';
import { cn } from '@/lib/utils';
import { Sparkles, Heart, Check, Gift, Plus, Search, Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { StickerSlot } from '@/components/StickerSlot';
import { CreateCustomCard } from '@/components/CreateCustomCard';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
    isDragging,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
    onMouseMove: handleMouseMove,
    style: { cursor: isDragging ? 'grabbing' : 'grab' } as React.CSSProperties,
  };
};

interface StickerCardProps {
  stickerCards: StickerCardType[];
  allStickers: Sticker[];
  onRedeemCard?: (cardId: string) => void;
  onCreateCustomCard?: (name: string, goal: string, slots: number, allowedCategories: StickerCategory[]) => void;
}

const statusConfig: Record<CardStatus, { label: string; color: string; icon: React.ReactNode }> = {
  'in-progress': { label: 'In Progress', color: 'bg-primary/20 text-primary', icon: <Sparkles className="w-3 h-3" /> },
  'done': { label: 'Complete!', color: 'bg-mint text-mint-deep', icon: <Check className="w-3 h-3" /> },
  'redeemed': { label: 'Redeemed', color: 'bg-lavender text-purple-700', icon: <Gift className="w-3 h-3" /> },
};

type FilterType = 'all' | 'in-progress' | 'done' | 'redeemed' | 'gifted';
type SortType = 'newest' | 'oldest' | 'progress';

export const StickerCard = ({ stickerCards, allStickers, onRedeemCard, onCreateCustomCard }: StickerCardProps) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(() => {
    const activeCard = stickerCards.find(c => c.status === 'in-progress');
    return activeCard?.id || stickerCards[0]?.id || null;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [showCreateCard, setShowCreateCard] = useState(false);
  
  const dragScroll = useDragScroll();

  // Filter and sort cards
  const filteredCards = useMemo(() => {
    let result = [...stickerCards];

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(card => 
        card.name.toLowerCase().includes(query) ||
        card.goal?.toLowerCase().includes(query) ||
        card.givenBy?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      if (filterStatus === 'gifted') {
        result = result.filter(card => card.givenBy);
      } else {
        result = result.filter(card => card.status === filterStatus);
      }
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        const aTime = a.completedAt ? new Date(a.completedAt).getTime() : Date.now();
        const bTime = b.completedAt ? new Date(b.completedAt).getTime() : Date.now();
        return bTime - aTime;
      }
      if (sortBy === 'oldest') {
        const aTime = a.completedAt ? new Date(a.completedAt).getTime() : Date.now();
        const bTime = b.completedAt ? new Date(b.completedAt).getTime() : Date.now();
        return aTime - bTime;
      }
      if (sortBy === 'progress') {
        const aProgress = a.stickers.length / a.slots;
        const bProgress = b.stickers.length / b.slots;
        return bProgress - aProgress;
      }
      return 0;
    });

    return result;
  }, [stickerCards, searchQuery, filterStatus, sortBy]);

  const currentCard = stickerCards.find(c => c.id === selectedCardId);

  const inProgressCount = stickerCards.filter(c => c.status === 'in-progress').length;
  const doneCount = stickerCards.filter(c => c.status === 'done').length;
  const redeemedCount = stickerCards.filter(c => c.status === 'redeemed').length;

  const handleCreateCard = (name: string, goal: string, slots: number, allowedCategories: StickerCategory[]) => {
    if (onCreateCustomCard) {
      onCreateCustomCard(name, goal, slots, allowedCategories);
    }
    setShowCreateCard(false);
  };

  const handleCardClick = (cardId: string) => {
    // Only select if not dragging
    if (!dragScroll.isDragging) {
      setSelectedCardId(cardId);
    }
  };

  if (showCreateCard && onCreateCustomCard) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-fredoka font-bold text-gradient-primary flex items-center justify-center gap-2">
            <Plus className="w-6 h-6 text-primary" />
            Create New Card
          </h2>
        </div>
        <CreateCustomCard
          onCancel={() => setShowCreateCard(false)}
          onCreateCard={handleCreateCard}
        />
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No sticker cards yet!</p>
        {onCreateCustomCard && (
          <Button variant="cute" className="mt-4" onClick={() => setShowCreateCard(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Card
          </Button>
        )}
      </div>
    );
  }

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
      const sticker = allStickers.find(s => s.id === owned.stickerId);
      return { sticker, owned };
    }
    return { sticker: null, owned: null };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterType)}>
            <SelectTrigger className="w-[130px]">
              <Filter className="w-4 h-4 mr-1" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cards</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="done">Complete</SelectItem>
              <SelectItem value="redeemed">Redeemed</SelectItem>
              <SelectItem value="gifted">From Friends</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortType)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Card List (horizontal scrollable with drag) */}
      <div className="relative">
        <div 
          ref={dragScroll.ref}
          onMouseDown={dragScroll.onMouseDown}
          onMouseUp={dragScroll.onMouseUp}
          onMouseLeave={dragScroll.onMouseLeave}
          onMouseMove={dragScroll.onMouseMove}
          style={dragScroll.style}
          className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-thin select-none"
        >
          {onCreateCustomCard && (
            <button
              onClick={() => setShowCreateCard(true)}
              className="flex-shrink-0 w-28 h-20 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1"
            >
              <Plus className="w-5 h-5 text-primary" />
              <span className="text-xs font-medium text-primary">New Card</span>
            </button>
          )}
          {filteredCards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={cn(
                "flex-shrink-0 w-28 h-20 rounded-xl border-2 p-2 transition-all",
                "flex flex-col items-start justify-between text-left",
                selectedCardId === card.id
                  ? "border-primary bg-primary/10 shadow-soft"
                  : card.status === 'redeemed'
                    ? "border-lavender/50 bg-lavender/10"
                    : card.status === 'done'
                      ? "border-mint/50 bg-mint/10"
                      : "border-muted hover:border-primary/30"
              )}
            >
              <div className="w-full">
                <p className="text-xs font-semibold truncate">{card.name}</p>
                {card.givenBy && (
                  <p className="text-[10px] text-muted-foreground truncate">From: {card.givenBy}</p>
                )}
              </div>
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] text-muted-foreground">
                  {card.stickers.length}/{card.slots}
                </span>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  card.status === 'redeemed' ? "bg-lavender" :
                  card.status === 'done' ? "bg-mint" : "bg-primary"
                )} />
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-center text-muted-foreground mt-1">
          👆 Drag to scroll
        </p>
      </div>

      {/* Selected Card Display */}
      <div className="relative max-w-md mx-auto">
        <div className={cn(
          "bg-gradient-card rounded-3xl p-6 border-4",
          currentCard.status === 'redeemed' ? "border-lavender" :
          currentCard.status === 'done' ? "border-mint" : "border-primary/30",
          "shadow-float relative overflow-hidden"
        )}>
          {/* Card Title & Status */}
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

            {/* Show allowed categories */}
            {currentCard.allowedCategories && currentCard.allowedCategories.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                <span className="text-xs text-muted-foreground">Accepts:</span>
                {currentCard.allowedCategories.map(cat => (
                  <span key={cat} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                    {CATEGORY_LABELS[cat].emoji} {CATEGORY_LABELS[cat].label}
                  </span>
                ))}
              </div>
            )}

            {/* Completion date */}
            {currentCard.completedAt && (
              <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                Completed: {format(new Date(currentCard.completedAt), 'MMM d, yyyy')}
              </div>
            )}
          </div>

          {/* Decorative elements */}
          <div className="absolute top-2 left-2">
            <Sparkles className="w-5 h-5 text-yellow-soft animate-sparkle" />
          </div>
          <div className="absolute top-2 right-2">
            <Sparkles className="w-4 h-4 text-pink-medium animate-sparkle" style={{ animationDelay: '0.7s' }} />
          </div>

          {/* Sticker grid with flippable slots */}
          <div 
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
          >
            {slots.map((slot, index) => (
              <StickerSlot
                key={index}
                sticker={slot.sticker}
                ownedSticker={slot.owned}
                index={index}
              />
            ))}
          </div>

          {/* Tap hint */}
          <p className="text-center text-xs text-muted-foreground mt-3">
            💡 Tap a sticker to see when it was added!
          </p>

          {/* Progress bar */}
          <div className="mt-4 space-y-2">
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
