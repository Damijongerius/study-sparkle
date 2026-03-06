import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Props {
    value: string;
    onChange: (color: string) => void;
    label?: string;
}

export const CuteColorPicker = ({ value, onChange, label }: Props) => {
  const [recentColors, setRecentColors] = useState<string[]>(() => {
      const saved = localStorage.getItem('study_sparkle_recent_colors');
      return saved ? JSON.parse(saved) : ['#6366f1', '#3b82f6', '#f59e0b', '#10b981', '#ef4444'];
  });

  const addToRecent = (color: string) => {
      if (!color.startsWith('#')) return;
      setRecentColors(prev => {
          const updated = [color, ...prev.filter(c => c !== color)].slice(0, 10);
          localStorage.setItem('study_sparkle_recent_colors', JSON.stringify(updated));
          return updated;
      });
  };

  return (
    <div className="space-y-2">
        {label && <Label className="text-[10px] font-black uppercase opacity-40 ml-1">{label}</Label>}
        <div className="flex flex-wrap gap-2 items-center">
            <div className="relative w-10 h-10">
                <input 
                  type="color" 
                  value={value.startsWith('#') ? value : '#6366f1'} 
                  onChange={e => { onChange(e.target.value); addToRecent(e.target.value); }} 
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-20" 
                />
                <div className="absolute inset-0 rounded-full border-4 border-white shadow-soft transition-transform hover:scale-110 flex items-center justify-center z-10" style={{ backgroundColor: value.startsWith('#') ? value : '#6366f1' }}>
                    <Plus className="w-4 h-4 text-white drop-shadow-md" />
                </div>
            </div>
            <div className="flex flex-wrap gap-1.5 p-1.5 bg-card/50 rounded-2xl border-2 border-primary/5 shadow-inner">
                {recentColors.map(c => (
                    <button key={c} type="button" onClick={() => onChange(c)} className={cn("w-7 h-7 rounded-full border-2 border-white shadow-sm transition-all hover:scale-110", value === c ? "ring-2 ring-primary ring-offset-1 z-10 scale-90" : "opacity-80 hover:opacity-100")} style={{ backgroundColor: c }} />
                ))}
            </div>
        </div>
    </div>
  );
};
