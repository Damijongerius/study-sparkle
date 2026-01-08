import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sticker, OwnedSticker } from '@/hooks/useStudyStore';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface StickerSlotProps {
  sticker: Sticker | null;
  ownedSticker: OwnedSticker | null;
  index: number;
}

export const StickerSlot = ({ sticker, ownedSticker, index }: StickerSlotProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!sticker || !ownedSticker) {
    return (
      <div
        className={cn(
          "aspect-square rounded-xl flex items-center justify-center",
          "transition-all duration-300",
          "bg-muted/50 border-2 border-dashed border-primary/20"
        )}
      >
        <span className="text-xl opacity-30">?</span>
      </div>
    );
  }

  const earnedDate = new Date(ownedSticker.earnedAt);
  const formattedDate = format(earnedDate, 'MMM d, yyyy');
  const formattedTime = format(earnedDate, 'h:mm a');

  return (
    <div
      className="aspect-square perspective-1000 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        {/* Front - Sticker */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl flex items-center justify-center",
            "bg-card border-2 border-primary/20 shadow-soft animate-pop",
            "backface-hidden"
          )}
          style={{ 
            animationDelay: `${index * 0.05}s`,
            backfaceVisibility: 'hidden'
          }}
        >
          <span className="text-2xl sm:text-3xl hover:scale-110 transition-transform">
            {sticker.emoji}
          </span>
        </div>

        {/* Back - Date */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl flex flex-col items-center justify-center",
            "bg-gradient-to-br from-primary/20 to-lavender/30 border-2 border-primary/30 shadow-soft",
            "p-1 text-center"
          )}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <span className="text-[10px] font-medium text-muted-foreground">📅</span>
          <span className="text-[9px] font-semibold text-foreground leading-tight">{formattedDate}</span>
          <span className="text-[8px] text-muted-foreground">{formattedTime}</span>
        </div>
      </motion.div>
    </div>
  );
};
