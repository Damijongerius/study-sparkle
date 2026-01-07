import { ActivityLog as ActivityLogType, ActivityType } from '@/hooks/useStudyStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { 
  BookOpen, 
  Pause, 
  ShoppingBag, 
  Gift, 
  Award,
  PenLine,
  Send,
  Clock
} from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

interface ActivityLogProps {
  logs: ActivityLogType[];
  onAddJournalEntry: (text: string) => void;
}

const activityIcons: Record<ActivityType, React.ReactNode> = {
  study_complete: <BookOpen className="w-4 h-4" />,
  study_pause: <Pause className="w-4 h-4" />,
  sticker_purchase: <ShoppingBag className="w-4 h-4" />,
  card_complete: <Award className="w-4 h-4" />,
  card_redeem: <Gift className="w-4 h-4" />,
  journal_entry: <PenLine className="w-4 h-4" />,
};

const activityColors: Record<ActivityType, string> = {
  study_complete: 'bg-mint text-mint-deep',
  study_pause: 'bg-yellow-soft text-yellow-700',
  sticker_purchase: 'bg-lavender text-purple-700',
  card_complete: 'bg-primary/20 text-primary',
  card_redeem: 'bg-pink-soft text-pink-700',
  journal_entry: 'bg-muted text-muted-foreground',
};

const getActivityMessage = (log: ActivityLogType): string => {
  const { type, details } = log;
  
  switch (type) {
    case 'study_complete':
      const effectiveness = details.effectiveness ? ` (${details.effectiveness}/5 effectiveness)` : '';
      return `Completed ${details.minutes} min study session! +${details.points} pts${effectiveness}`;
    case 'study_pause':
      return `Timer paused. ${details.points} pts`;
    case 'sticker_purchase':
      return `Got ${details.stickerName}! Added to ${details.cardName}. ${details.points} pts`;
    case 'card_complete':
      return `Completed ${details.cardName}! 🎉`;
    case 'card_redeem':
      return `Redeemed ${details.cardName}! 🎁`;
    case 'journal_entry':
      return details.journalText || '';
    default:
      return 'Activity logged';
  }
};

export const ActivityLog = ({ logs, onAddJournalEntry }: ActivityLogProps) => {
  const [journalText, setJournalText] = useState('');

  const handleSubmitJournal = () => {
    if (journalText.trim()) {
      onAddJournalEntry(journalText.trim());
      setJournalText('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Journal Entry Form */}
      <div className="space-y-3">
        <h3 className="font-fredoka font-bold text-lg text-foreground flex items-center gap-2">
          <PenLine className="w-5 h-5 text-primary" />
          Study Journal
        </h3>
        <div className="flex gap-2">
          <Textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder="How was your study session? Write your thoughts here... 💭"
            className="min-h-[80px] resize-none"
          />
        </div>
        <Button 
          variant="cute" 
          onClick={handleSubmitJournal}
          disabled={!journalText.trim()}
          className="w-full sm:w-auto"
        >
          <Send className="w-4 h-4 mr-2" />
          Add Journal Entry
        </Button>
      </div>

      {/* Activity Feed */}
      <div className="space-y-3">
        <h3 className="font-fredoka font-bold text-lg text-foreground flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Activity Feed
        </h3>
        
        <ScrollArea className="h-[400px] rounded-xl border-2 border-primary/10 bg-card p-4">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No activity yet!</p>
              <p className="text-sm">Start studying to see your progress here 🌸</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={cn(
                    "flex gap-3 p-3 rounded-xl",
                    log.type === 'journal_entry' ? 'bg-muted/50' : 'bg-background'
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    activityColors[log.type]
                  )}>
                    {activityIcons[log.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm text-foreground",
                      log.type === 'journal_entry' && 'italic'
                    )}>
                      {getActivityMessage(log)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(log.timestamp, 'MMM d, yyyy · h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
