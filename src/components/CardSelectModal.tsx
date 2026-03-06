import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { StickerCard, Sticker } from '@/types';
import { CATEGORY_LABELS } from '@/types';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { CardOption } from './CardSelect/CardOption';
import { IncompatibleCardOption } from './CardSelect/IncompatibleCardOption';

interface Props { open: boolean; sticker: Sticker | null; availableCards: StickerCard[]; onSelectCard: (id: string) => void; onCreateCard: () => void; onCancel: () => void; }

export const CardSelectModal = ({ open, sticker, availableCards, onSelectCard, onCreateCard, onCancel }: Props) => {
  if (!sticker) return null;
  const compatible = availableCards.filter(c => !c.allowedCategories?.length || c.allowedCategories.includes(sticker.category));
  const incompatible = availableCards.filter(c => c.allowedCategories?.length && !c.allowedCategories.includes(sticker.category));

  return (
    <Dialog open={open} onOpenChange={o => !o && onCancel()}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto rounded-[2.5rem]">
        <DialogHeader><DialogTitle className="flex items-center gap-3 font-fredoka text-xl"><span className="text-3xl">{sticker.emoji}</span> Place Your Sticker!</DialogTitle><DialogDescription>Choose which sticker card to add your new {sticker.name} to 🌸</DialogDescription></DialogHeader>
        <div className="space-y-3 mt-4">
          {compatible.length === 0 && incompatible.length === 0 ? <div className="text-center py-6 text-muted-foreground"><p>No cards available!</p></div> : 
           compatible.map(c => <CardOption key={c.id} card={c} onSelect={onSelectCard} />)}
          {incompatible.length > 0 && <><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pt-2">Incompatible Cards:</p>{incompatible.map(c => <IncompatibleCardOption key={c.id} card={c} />)}</>}
          <button onClick={onCreateCard} className="w-full p-4 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-3 text-left"><div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center"><Plus className="w-6 h-6 text-muted-foreground" /></div><div><p className="font-semibold text-foreground">Create New Card</p><p className="text-sm text-muted-foreground">Start a fresh sticker collection</p></div></button>
        </div>
        <div className="flex justify-end mt-4"><Button variant="ghost" onClick={onCancel} className="rounded-xl font-bold">Cancel</Button></div>
      </DialogContent>
    </Dialog>
  );
};
