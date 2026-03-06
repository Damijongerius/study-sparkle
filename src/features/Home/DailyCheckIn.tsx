import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EliteCard } from '@/components/shared/EliteCard';

interface Props {
    step: number;
    totalSteps: number;
    question: any;
    onAnswer: (val: string) => void;
}

export const DailyCheckIn = ({ step, totalSteps, question, onAnswer }: Props) => (
  <motion.div key="questions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto">
    <EliteCard variant="solid" className="overflow-hidden">
      <CardHeader className="bg-primary/5 pb-8 text-left p-8">
        <div className="flex items-center gap-3 mb-2">
            <Badge variant="cute">DAILY CHECK-IN</Badge>
            <span className="text-xs font-bold text-muted-foreground/60 tracking-widest uppercase">Step {step + 1} of {totalSteps}</span>
        </div>
        <CardTitle className="text-3xl font-fredoka">{question.text}</CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid gap-4">
          {question.options.map((opt: any) => (
            <Button key={opt.value} variant="outline" size="lg" className="h-20 text-lg rounded-2xl border-2 hover:border-primary/40 flex items-center justify-between px-6 group text-left" onClick={() => onAnswer(opt.value)}>
              <div className="flex items-center gap-4">
                  {opt.icon && <opt.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />}
                  <span className="font-bold">{opt.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Button>
          ))}
        </div>
      </CardContent>
    </EliteCard>
  </motion.div>
);
