import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CelebrationProps {
  show: boolean;
  points: number;
  onComplete: () => void;
}

const CONFETTI_COLORS = ['#F8BBD9', '#E1BEE7', '#B2DFDB', '#FFE0B2', '#FFF9C4', '#F48FB1'];
const CONFETTI_SHAPES = ['🎀', '⭐', '💖', '✨', '🌸', '🎉'];

export const Celebration = ({ show, points, onComplete }: CelebrationProps) => {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; emoji: string; delay: number }>>([]);

  useEffect(() => {
    if (show) {
      // Generate confetti
      const newConfetti = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        emoji: CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)],
        delay: Math.random() * 0.5,
      }));
      setConfetti(newConfetti);

      // Auto-dismiss after animation
      const timer = setTimeout(() => {
        onComplete();
        setConfetti([]);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/10 backdrop-blur-sm" />

      {/* Confetti */}
      {confetti.map((c) => (
        <span
          key={c.id}
          className="absolute text-2xl animate-bounce"
          style={{
            left: `${c.x}%`,
            top: '-20px',
            animation: `fall 2s ease-in forwards`,
            animationDelay: `${c.delay}s`,
          }}
        >
          {c.emoji}
        </span>
      ))}

      {/* Success message */}
      <div
        className={cn(
          "bg-card rounded-3xl p-8 shadow-float border-4 border-primary/30",
          "animate-pop text-center max-w-sm mx-4"
        )}
      >
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-fredoka font-bold text-gradient-primary mb-2">
          Amazing Work!
        </h2>
        <p className="text-lg text-foreground mb-4">
          You earned <span className="font-bold text-primary">+{points} points</span>!
        </p>
        <p className="text-muted-foreground">
          Keep it up, superstar! ✨
        </p>
      </div>

      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
