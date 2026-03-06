import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface EliteCardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'glass' | 'solid' | 'dashed';
    interactive?: boolean;
}

export const EliteCard = ({ children, className, variant = 'glass', interactive = false }: EliteCardProps) => {
  return (
    <Card className={cn(
        "rounded-[2.5rem] border-2 transition-all duration-300",
        variant === 'glass' && "bg-white/60 backdrop-blur-sm border-primary/10 shadow-soft",
        variant === 'solid' && "bg-card border-primary/10 shadow-float",
        variant === 'dashed' && "bg-muted/5 border-dashed border-primary/20",
        interactive && "hover:border-primary/30 hover:shadow-glow-sm hover:-translate-y-1 cursor-pointer",
        className
    )}>
        {children}
    </Card>
  );
};
