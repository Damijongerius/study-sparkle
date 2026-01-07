import { useState, useCallback, useRef, useEffect } from 'react';
import { StudyTimer } from '@/components/StudyTimer';
import { StickerShop } from '@/components/StickerShop';
import { StickerCard } from '@/components/StickerCard';
import { StatsDisplay } from '@/components/StatsDisplay';
import { Celebration } from '@/components/Celebration';
import { useStudyStore } from '@/hooks/useStudyStore';
import { Button } from '@/components/ui/button';
import { BookOpen, ShoppingBag, Sparkles, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Tab = 'study' | 'shop' | 'collection';

interface TimerState {
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  applyPausePenalty: () => void;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('study');
  const [showCelebration, setShowCelebration] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const timerRef = useRef<TimerState | null>(null);

  const store = useStudyStore();

  const handleStudyComplete = useCallback((minutes: number, points: number) => {
    store.addPoints(points, minutes);
    setEarnedPoints(points);
    setShowCelebration(true);
  }, [store]);

  const handlePurchase = useCallback((stickerId: string) => {
    return store.purchaseSticker(stickerId);
  }, [store]);

  const handleTabChange = useCallback((newTab: Tab) => {
    // If switching away from study tab while timer is running, pause and penalize
    if (activeTab === 'study' && newTab !== 'study' && timerRef.current?.isRunning) {
      timerRef.current.setIsRunning(false);
      timerRef.current.applyPausePenalty();
      toast('⏸️ Timer paused! -5 points', {
        description: 'Your progress is saved, come back soon! 💪',
      });
    }
    setActiveTab(newTab);
  }, [activeTab]);

  const registerTimer = useCallback((timer: TimerState) => {
    timerRef.current = timer;
  }, []);

  const tabs = [
    { id: 'study' as Tab, label: 'Study', icon: BookOpen, emoji: '📚' },
    { id: 'shop' as Tab, label: 'Shop', icon: ShoppingBag, emoji: '🛍️' },
    { id: 'collection' as Tab, label: 'Stickers', icon: Sparkles, emoji: '✨' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-fredoka font-bold text-gradient-primary flex items-center justify-center gap-3">
            <Heart className="w-8 h-8 text-pink-medium fill-pink-medium animate-bounce-soft" />
            Study Buddy
            <Heart className="w-8 h-8 text-pink-medium fill-pink-medium animate-bounce-soft" style={{ animationDelay: '0.5s' }} />
          </h1>
          <p className="text-lg text-muted-foreground mt-2 font-medium">
            Study hard, earn stickers! 🌸
          </p>
        </div>
      </header>

      {/* Stats */}
      <div className="px-4 mb-8">
        <div className="max-w-4xl mx-auto">
          <StatsDisplay
            totalPoints={store.totalPoints}
            totalStudyMinutes={store.totalStudyMinutes}
            studySessions={store.studySessions}
            stickerCount={store.ownedStickers.length}
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <nav className="px-4 mb-8">
        <div className="max-w-md mx-auto flex gap-2 p-2 bg-card rounded-2xl shadow-soft border-2 border-primary/10">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'cute' : 'ghost'}
              className={cn(
                "flex-1 gap-2",
                activeTab === tab.id && "shadow-glow"
              )}
              onClick={() => handleTabChange(tab.id)}
            >
              <span className="text-lg">{tab.emoji}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </Button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className={cn(
            "bg-card rounded-3xl p-6 md:p-8 shadow-float border-2 border-primary/10",
            "transition-all duration-300"
          )}>
            {activeTab === 'study' && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-fredoka font-bold text-foreground mb-2">
                    Ready to Study? 📖
                  </h2>
                  <p className="text-muted-foreground">
                    Pick a study block and earn points!
                  </p>
                </div>
                <StudyTimer onComplete={handleStudyComplete} registerTimer={registerTimer} />
              </div>
            )}

            {activeTab === 'shop' && (
              <StickerShop
                stickers={store.stickers}
                points={store.totalPoints}
                onPurchase={handlePurchase}
                hasSticker={store.hasSticker}
                getStickerCount={store.getStickerCount}
                canPurchaseToday={store.canPurchaseToday}
                getTimeUntilNextPurchase={store.getTimeUntilNextPurchase}
              />
            )}

            {activeTab === 'collection' && (
              <StickerCard
                stickerCards={store.stickerCards}
                allStickers={store.stickers}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Made with 💖 for my favorite study buddy</p>
      </footer>

      {/* Celebration Modal */}
      <Celebration
        show={showCelebration}
        points={earnedPoints}
        onComplete={() => setShowCelebration(false)}
      />
    </div>
  );
};

export default Index;
