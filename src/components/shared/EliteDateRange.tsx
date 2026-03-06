import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
    startDate: Date;
    endDate: Date;
    onChange: (offset: number) => void;
    className?: string;
    size?: 'sm' | 'lg';
}

export const EliteDateRange = ({ startDate, endDate, onChange, className, size = 'sm' }: Props) => {
  const format = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const isSm = size === 'sm';

  return (
    <div className={cn(
        "flex items-center gap-1 bg-white/80 rounded-xl border border-primary/5 shadow-soft",
        !isSm && "p-1 rounded-2xl border-2 border-primary/10",
        className
    )}>
        <Button variant="ghost" size="icon" className={cn(isSm ? "h-8 w-8" : "h-10 w-10")} onClick={() => onChange(-1)}><ChevronLeft className={cn(isSm ? "w-4 h-4" : "w-5 h-5 text-primary")} /></Button>
        <div className={cn("px-2 text-center", !isSm && "flex-1")}>
            <span className={cn("font-bold text-primary whitespace-nowrap block", isSm ? "text-[10px]" : "text-[10px]")}>{format(startDate)} - {format(endDate)}</span>
        </div>
        <Button variant="ghost" size="icon" className={cn(isSm ? "h-8 w-8" : "h-10 w-10")} onClick={() => onChange(1)}><ChevronRight className={cn(isSm ? "w-4 h-4" : "w-5 h-5 text-primary")} /></Button>
    </div>
  );
};
