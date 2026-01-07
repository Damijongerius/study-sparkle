import { Clock, Star, BookOpen, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsDisplayProps {
  totalPoints: number;
  totalStudyMinutes: number;
  studySessions: number;
  stickerCount: number;
}

export const StatsDisplay = ({ totalPoints, totalStudyMinutes, studySessions, stickerCount }: StatsDisplayProps) => {
  const stats = [
    {
      icon: Star,
      label: 'Points',
      value: totalPoints,
      color: 'text-pink-deep',
      bg: 'bg-pink-soft/50',
    },
    {
      icon: Clock,
      label: 'Minutes',
      value: totalStudyMinutes,
      color: 'text-lavender-deep',
      bg: 'bg-lavender/50',
    },
    {
      icon: BookOpen,
      label: 'Sessions',
      value: studySessions,
      color: 'text-mint-deep',
      bg: 'bg-mint/50',
    },
    {
      icon: Award,
      label: 'Stickers',
      value: stickerCount,
      color: 'text-primary',
      bg: 'bg-peach/50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-2xl",
            "bg-card border-2 border-primary/10 shadow-soft",
            "hover:shadow-float hover:scale-105 transition-all duration-200"
          )}
        >
          <div className={cn("p-3 rounded-xl", stat.bg)}>
            <stat.icon className={cn("w-6 h-6", stat.color)} />
          </div>
          <span className="text-2xl font-fredoka font-bold text-foreground">
            {stat.value}
          </span>
          <span className="text-sm text-muted-foreground">{stat.label}</span>
        </div>
      ))}
    </div>
  );
};
