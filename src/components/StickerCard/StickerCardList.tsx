import React, { useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    cards: any[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onCreateNew: () => void;
}

export const StickerCardList = ({ cards, selectedId, onSelect, onCreateNew }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDrag, setIsDrag] = useState(false);
  const [startX, setStartX] = useState(0);
  const [sl, setSl] = useState(0);

  const onDown = (e: React.MouseEvent) => { if(!ref.current) return; setIsDrag(true); setStartX(e.pageX - ref.current.offsetLeft); setSl(ref.current.scrollLeft); };
  const onMove = (e: React.MouseEvent) => { if(!isDrag || !ref.current) return; e.preventDefault(); const x = e.pageX - ref.current.offsetLeft; ref.current.scrollLeft = sl - (x - startX) * 1.5; };

  return (
    <div className="relative">
      <div ref={ref} onMouseDown={onDown} onMouseUp={() => setIsDrag(false)} onMouseLeave={() => setIsDrag(false)} onMouseMove={onMove} className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin cursor-grab active:cursor-grabbing select-none px-1">
        <button onClick={onCreateNew} className="flex-shrink-0 w-32 h-24 rounded-2xl border-2 border-dashed border-primary/20 hover:border-primary/40 flex flex-col items-center justify-center gap-1"><Plus className="text-primary" /><span className="text-[10px] font-black uppercase text-primary">New Card</span></button>
        {cards.map(c => (
          <button key={c.id} onClick={() => !isDrag && onSelect(c.id)} className={cn("flex-shrink-0 w-32 h-24 rounded-2xl border-2 p-3 flex flex-col justify-between text-left transition-all", selectedId === c.id ? "border-primary bg-primary/5 shadow-soft ring-4 ring-primary/5" : "border-muted hover:border-primary/20")}>
            <p className="text-xs font-bold truncate leading-tight">{c.name}</p>
            <div className="flex justify-between items-center"><span className="text-[10px] font-black text-muted-foreground">{c.stickers.length}/{c.slots}</span><div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", c.status === 'redeemed' ? "bg-purple-400" : c.status === 'done' ? "bg-green-400" : "bg-primary")} /></div>
          </button>
        ))}
      </div>
    </div>
  );
};
