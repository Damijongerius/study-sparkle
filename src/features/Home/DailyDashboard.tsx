import React from 'react';
import { Sparkles, Timer, Target, ArrowRight, Calendar } from 'lucide-react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { EliteCard } from '@/components/shared/EliteCard';

interface Props {
    recommendation: any;
    studyMethods: any[];
}

export const DailyDashboard = ({ recommendation, studyMethods }: Props) => {
  const navigate = useNavigate();

  return (
    <div className="lg:col-span-2 space-y-6">
        <EliteCard className="overflow-hidden text-left" interactive={false}>
          <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent p-8">
            <div className="flex items-center justify-between mb-8">
              <Badge variant="cute"><Sparkles className="w-3 h-3 mr-2" /> TODAY'S PLAN</Badge>
              <span className="text-primary/60 flex items-center gap-2 text-sm font-black uppercase tracking-tighter bg-white/80 px-3 py-1 rounded-full border shadow-sm"><Timer className="w-4 h-4" /> {recommendation.duration}</span>
            </div>
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 leading-none">{recommendation.type}</span>
              <h3 className="text-4xl md:text-5xl font-fredoka font-bold text-foreground leading-tight">{recommendation.name}</h3>
              <div className="flex items-center gap-2 text-muted-foreground/80 font-bold"><Target className="w-4 h-4" /> <span>{recommendation.planName}</span></div>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">{recommendation.description}</p>
            </div>
          </div>
          <CardContent className="p-8 pt-0">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="flex-1 h-16 text-xl rounded-2xl gap-3 shadow-glow font-fredoka font-bold" onClick={() => navigate(recommendation.path)}>Let's Get Started! <ArrowRight className="w-6 h-6" /></Button>
              <Button variant="outline" size="lg" className="h-16 px-8 text-lg rounded-2xl border-2 font-bold bg-white/50 backdrop-blur-sm" onClick={() => navigate('/planner')}><Calendar className="w-5 h-5 mr-3" /> View Planner</Button>
            </div>
          </CardContent>
        </EliteCard>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {studyMethods.map((method, i) => (
                <EliteCard key={i} className="p-5" interactive>
                    <h4 className="font-fredoka font-bold text-primary mb-1 transition-colors">{method.title}</h4>
                    <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">{method.desc}</p>
                </EliteCard>
            ))}
        </div>
    </div>
  );
};
