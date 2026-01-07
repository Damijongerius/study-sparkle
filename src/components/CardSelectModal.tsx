import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StickerCard, Sticker } from '@/hooks/useStudyStore';
import { cn } from '@/lib/utils';
import { Plus, Sparkles } from 'lucide-react';

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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-md">
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
          {availableCards.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No cards available!</p>
              <p className="text-sm">Create a new card to place your sticker.</p>
            </div>
          ) : (
            availableCards.map((card) => (
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
                  </div>
                </div>
                <div className="flex -space-x-1">
                  {card.stickers.slice(-3).map((s, i) => (
                    <span key={i} className="text-lg">{
                      // This is just a preview, actual emoji would need lookup
                      '✨'
                    }</span>
                  ))}
                </div>
              </button>
            ))
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
