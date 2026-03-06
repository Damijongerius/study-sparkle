import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useStudyStoreContext } from '@/hooks/useStudyStoreContext';
import { DailyCheckIn } from '@/features/Home/DailyCheckIn';
import { DailyDashboard } from '@/features/Home/DailyDashboard';
import { ProgressSidebar } from '@/features/Home/ProgressSidebar';
import { useDailyRecommendation } from '@/hooks/Home/useDailyRecommendation';
import { getTodayStr } from '@/lib/utils';

const StudyBuddy = () => {
  const [greeting, setGreeting] = useState('');
  const [step, setStep] = useState(0);
  const store = useStudyStoreContext();
  const todayStr = getTodayStr();
  const hasCheckedIn = store.dailyIntent?.date === todayStr;

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening');
  }, []);

  const [answers, setAnswers] = useState<Record<string, string>>(store.dailyIntent || {});
  const questions = [
    { id: 'energy', text: 'How are your energy levels? ⚡', options: [{ label: 'Unstoppable! 🚀', value: 'high' }, { label: 'Steady 🧘', value: 'medium' }, { label: 'Sleepy... 🥱', value: 'low' }] },
    { id: 'persona', text: 'What kind of studier are you? 🎭', options: [{ label: 'The Completionist ✅', value: 'completionist' }, { label: 'The Explorer 🌍', value: 'explorer' }, { label: 'The Speedster ⚡', value: 'speedster' }] },
    { id: 'time', text: 'How much time today? ⏳', options: [{ label: 'Sprint (30-60m)', value: 'short' }, { label: 'Deep dive (2-4h)', value: 'medium' }, { label: 'Marathon! 🏆', value: 'long' }] },
  ];

  const handleAnswer = (val: string) => {
    const nextAns = { ...answers, [questions[step].id]: val }; setAnswers(nextAns);
    if (step === questions.length - 1) store.updateState(p => ({ ...p, dailyIntent: { ...nextAns, date: todayStr } } as any));
    setStep(step + 1);
  };

  const recommendation = useDailyRecommendation(answers);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-4">
        <div className="flex gap-4"><Sparkles className="w-10 h-10 text-yellow-400" /><h1 className="text-4xl md:text-6xl font-fredoka font-bold text-primary">{greeting}, {store.username}!</h1></div>
        <p className="text-lg text-muted-foreground font-medium">{hasCheckedIn ? "Your overview for today! ✨" : "Ready to make some progress? ✨"}</p>
      </motion.div>
      <AnimatePresence mode="wait">
        {!hasCheckedIn && step < questions.length ? <DailyCheckIn step={step} totalSteps={questions.length} question={questions[step]} onAnswer={handleAnswer} /> :
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <DailyDashboard recommendation={recommendation} studyMethods={[{ title: "Pomodoro", desc: "25/5 work/break. 🍅" }, { title: "Feynman", desc: "Explain to a child. 💡" }, { title: "Time Blocking", desc: "Focus slots. 🗓️" }]} />
           <ProgressSidebar onReset={() => { if(confirm('Reset?')) { store.updateState(p => ({ ...p, dailyIntent: undefined })); setStep(0); } }} energy={store.dailyIntent?.energy} />
         </motion.div>}
      </AnimatePresence>
    </div>
  );
};

export default StudyBuddy;
