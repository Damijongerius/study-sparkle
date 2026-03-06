import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Target, LayoutDashboard, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WizardStep1 } from './ExamPlannerWizard/WizardStep1';
import { WizardStep2 } from './ExamPlannerWizard/WizardStep2';

interface Props { onComplete: (data: any) => void; onCancel: () => void; }

export const ExamPlannerWizard = ({ onComplete, onCancel }: Props) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ title: '', description: '', tasks: [] as any[], endDate: new Date() });

  const update = (u: any) => setData(p => ({ ...p, ...u }));

  return (
    <Card className="max-w-3xl mx-auto rounded-[3rem] border-4 border-primary/10 shadow-glow overflow-hidden bg-white/80 backdrop-blur-xl">
      <CardHeader className="bg-primary/5 py-8 border-b border-primary/5">
          <div className="flex justify-between items-center px-4">
              <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center"><Sparkles className="text-primary w-6 h-6" /></div><CardTitle className="text-3xl font-fredoka">Roadmap Wizard</CardTitle></div>
              <div className="flex gap-2">{[1, 2, 3].map(s => <div key={s} className={`w-3 h-3 rounded-full transition-all ${step === s ? 'bg-primary scale-125' : 'bg-primary/20'}`} />)}</div>
          </div>
      </CardHeader>
      <CardContent className="p-10 min-h-[400px] flex flex-col justify-center">
          <div className="relative">
              {step === 1 ? <div key="s1"><WizardStep1 title={data.title} description={data.description} onUpdate={update} /></div> :
               step === 2 ? <div key="s2"><WizardStep2 tasks={data.tasks} onUpdate={update} /></div> :
               <div key="s3" className="text-center space-y-6"><div className="w-20 h-20 bg-green-100 rounded-[2rem] flex items-center justify-center mx-auto mb-4"><Target className="w-10 h-10 text-green-600" /></div><h3 className="text-3xl font-fredoka font-bold">Ready to Launch!</h3><p className="text-muted-foreground text-lg">We'll build your timeline for "{data.title}" with {data.tasks.length} study pieces.</p></div>}
          </div>
      </CardContent>
      <CardFooter className="bg-muted/30 p-8 flex justify-between">
          <Button variant="ghost" onClick={() => step === 1 ? onCancel() : setStep(step - 1)} className="rounded-xl font-bold gap-2">{step === 1 ? 'Cancel' : <><ChevronLeft className="w-4 h-4" /> Back</>}</Button>
          <Button onClick={() => step === 3 ? onComplete(data) : setStep(step + 1)} disabled={step === 1 && !data.title} className="rounded-2xl px-10 h-14 text-lg font-bold shadow-glow gap-3">{step === 3 ? 'Generate Roadmap!' : 'Next Step'} <ArrowRight className="w-5 h-5" /></Button>
      </CardFooter>
    </Card>
  );
};
