import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CardPreview } from './CreateCard/CardPreview';
import { CategorySelector } from './CreateCard/CategorySelector';

interface Props { friendUsername: string; onCancel: () => void; onCreateCard: (n: string, g: string, s: number, c: any[]) => void; }

export const CreateGiftCard = ({ friendUsername, onCancel, onCreateCard }: Props) => {
  const [name, setName] = useState(''); const [goal, setGoal] = useState(''); const [slots, setSlots] = useState(9); const [cats, setCats] = useState<any[]>([]);
  const toggleCat = (c: any) => setCats(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  return (
    <motion.div className="space-y-6 text-left" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={onCancel}><ArrowLeft className="w-5 h-5" /></Button><div><h3 className="font-fredoka text-xl font-bold flex items-center gap-2"><Gift className="text-primary w-5 h-5" /> Gift Card</h3><p className="text-sm text-muted-foreground">For {friendUsername} 💝</p></div></div>
      <CardPreview name={name} goal={goal} slots={slots} cats={cats} />
      <div className="space-y-4">
        <div className="space-y-1"><label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Title</label><Input placeholder="e.g. Study Hero" value={name} onChange={e => setName(e.target.value)} className="h-12 rounded-xl border-2" /></div>
        <div className="space-y-1"><label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Reward</label><Textarea placeholder="What's the prize?" value={goal} onChange={e => setGoal(e.target.value)} className="rounded-xl border-2" /></div>
        <div className="space-y-1"><label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Size</label><Select value={slots.toString()} onValueChange={v => setSlots(Number(v))}><SelectTrigger className="h-12 rounded-xl border-2"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl">{[6,9,12,16,20,25].map(s => <SelectItem key={s} value={s.toString()}>{s} Slots</SelectItem>)}</SelectContent></Select></div>
        <CategorySelector selected={cats} onToggle={toggleCat} />
      </div>
      <div className="flex gap-3"><Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={onCancel}>Cancel</Button><Button variant="cute" className="flex-1 h-12 rounded-xl shadow-glow font-bold gap-2" disabled={!name.trim()} onClick={() => onCreateCard(name, goal, slots, cats)}><Gift className="w-4 h-4" /> Send Gift!</Button></div>
    </motion.div>
  );
};
