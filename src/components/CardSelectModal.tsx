import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StickerCard, Sticker, CATEGORY_LABELS } from '@/hooks/useStudyStore';
import { cn } from '@/lib/utils';
import { Plus, Sparkles, Lock } from 'lucide-react';

interface CardSelectModalProps {
  open: boolean;
  sticker: Sticker | null;
  availableCards: StickerCard[];
  onSelectCard: (cardId: string) => void;
  onCreateCard: () => void;
  onCancel: () => void;
}

export const CardSelectModal = ({
  open,
  sticker,
  availableCards,
  onSelectCard,
  onCreateCard,
  onCancel,
}: CardSelectModalProps) => {
  if (!sticker) return null;

  // Filter cards that accept this sticker's category
  const compatibleCards = availableCards.filter(card => {
    if (!card.allowedCategories || card.allowedCategories.length === 0) return true;
    return card.allowedCategories.includes(sticker.category);
  });

  const incompatibleCards = availableCards.filter(card => {
    if (!card.allowedCategories || card.allowedCategories.length === 0) return false;
    return !card.allowedCategories.includes(sticker.category);
  });

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-fredoka text-xl">
            <span className="text-3xl">{sticker.emoji}</span>
            Place Your Sticker!
          </DialogTitle>
          <DialogDescription>
            Choose which sticker card to add your new {sticker.name} to 🌸
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {compatibleCards.length === 0 && incompatibleCards.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No cards available!</p>
              <p className="text-sm">Create a new card to place your sticker.</p>
            </div>
          ) : compatibleCards.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <p>No cards accept {CATEGORY_LABELS[sticker.category].emoji} {CATEGORY_LABELS[sticker.category].label} stickers!</p>
              <p className="text-sm">Create a new card or check your other cards.</p>
            </div>
          ) : (
            compatibleCards.map((card) => (
              <button
                key={card.id}
                onClick={() => onSelectCard(card.id)}
                className={cn(
                  "w-full p-4 rounded-xl border-2 border-primary/20 bg-card",
                  "hover:border-primary hover:shadow-soft transition-all",
                  "flex items-center justify-between gap-3 text-left"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{card.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {card.stickers.length} / {card.slots} stickers
                    </p>
                    {card.allowedCategories && card.allowedCategories.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {card.allowedCategories.map(cat => (
                          <span key={cat} className="text-xs">{CATEGORY_LABELS[cat].emoji}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex -space-x-1">
                  {card.stickers.slice(-3).map((s, i) => (
                    <span key={i} className="text-lg">✨</span>
                  ))}
                </div>
              </button>
            ))
          )}

          {/* Show incompatible cards as disabled */}
          {incompatibleCards.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground pt-2">
                These cards don't accept {CATEGORY_LABELS[sticker.category].label} stickers:
              </p>
              {incompatibleCards.map((card) => (
                <div
                  key={card.id}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 border-muted bg-muted/30",
                    "flex items-center justify-between gap-3 text-left opacity-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">{card.name}</p>
                      <div className="flex gap-1 mt-1">
                        {card.allowedCategories?.map(cat => (
                          <span key={cat} className="text-xs">{CATEGORY_LABELS[cat].emoji}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Create new card option */}
          <button
            onClick={onCreateCard}
            className={cn(
              "w-full p-4 rounded-xl border-2 border-dashed border-primary/30",
              "hover:border-primary hover:bg-primary/5 transition-all",
              "flex items-center gap-3 text-left"
            )}
          >
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Create New Card</p>
              <p className="text-sm text-muted-foreground">
                Start a fresh sticker collection
              </p>
            </div>
          </button>
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
