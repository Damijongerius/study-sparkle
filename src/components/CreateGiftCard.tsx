import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Gift, ArrowLeft, Sparkles } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateGiftCardProps {
  friendUsername: string;
  onCancel: () => void;
  onCreateCard: (name: string, goal: string, slots: number) => void;
}

const SLOT_OPTIONS = [
  { value: 6, label: '6 slots (Quick goal)' },
  { value: 9, label: '9 slots (Short goal)' },
  { value: 12, label: '12 slots (Medium goal)' },
  { value: 16, label: '16 slots (Long goal)' },
  { value: 20, label: '20 slots (Big goal)' },
  { value: 25, label: '25 slots (Ultimate goal!)' },
];

export const CreateGiftCard = ({
  friendUsername,
  onCancel,
  onCreateCard,
}: CreateGiftCardProps) => {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [slots, setSlots] = useState(9);

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreateCard(name.trim(), goal.trim(), slots);
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h3 className="font-fredoka text-xl font-bold flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Create Gift Card
          </h3>
          <p className="text-sm text-muted-foreground">
            For {friendUsername} 💝
          </p>
        </div>
      </div>

      {/* Preview */}
      <motion.div 
        className="bg-gradient-card rounded-2xl p-4 border-2 border-primary/30 relative overflow-hidden"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        <div className="absolute top-2 left-2">
          <Sparkles className="w-4 h-4 text-yellow-soft animate-sparkle" />
        </div>
        <div className="absolute top-2 right-2">
          <Sparkles className="w-3 h-3 text-pink-medium animate-sparkle" style={{ animationDelay: '0.5s' }} />
        </div>
        
        <div className="text-center space-y-2 py-4">
          <p className="font-fredoka text-lg font-bold text-foreground">
            {name || 'Card Title'}
          </p>
          {goal && (
            <div className="bg-primary/10 rounded-xl px-3 py-2 mx-4">
              <p className="text-xs font-medium text-primary">🎁 Reward:</p>
              <p className="text-sm">{goal}</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground">From: You 💝</p>
          <div className="flex justify-center gap-1 mt-3">
            {Array.from({ length: Math.min(slots, 9) }).map((_, i) => (
              <div key={i} className="w-6 h-6 rounded bg-muted/50 border border-dashed border-primary/20 flex items-center justify-center text-xs opacity-50">
                ?
              </div>
            ))}
            {slots > 9 && <span className="text-xs text-muted-foreground">+{slots - 9}</span>}
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Card Title *</label>
          <Input
            placeholder="e.g., Movie Night Challenge"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Reward Description</label>
          <Textarea
            placeholder="e.g., A movie night with snacks of your choice! 🍿"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            maxLength={150}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            What will they get when they complete the card?
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Number of Slots</label>
          <Select value={slots.toString()} onValueChange={(v) => setSlots(Number(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SLOT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value.toString()}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          variant="cute" 
          className="flex-1" 
          onClick={handleCreate}
          disabled={!name.trim()}
        >
          <Gift className="w-4 h-4 mr-2" />
          Send Gift Card!
        </Button>
      </div>
    </motion.div>
  );
};