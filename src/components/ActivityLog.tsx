import type { ActivityLog as ActivityLogType, ActivityType, Reminder } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { 
  BookOpen, 
  Pause, 
  ShoppingBag, 
  Gift, 
  Award,
  PenLine,
  Send,
  Clock,
  Bell,
  BellRing,
  X,
  Timer
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface ActivityLogProps {
  logs: ActivityLogType[];
  reminders: Reminder[];
  onAddJournalEntry: (text: string) => void;
  onAddReminder: (text: string, minutes: number) => void;
  onDismissReminder: (id: string) => void;
  onTriggerReminder: (id: string) => void;
  getDueReminders: () => Reminder[];
}

const activityIcons: Record<ActivityType, React.ReactNode> = {
  study_complete: <BookOpen className="w-4 h-4" />,
  study_pause: <Pause className="w-4 h-4" />,
  sticker_purchase: <ShoppingBag className="w-4 h-4" />,
  card_complete: <Award className="w-4 h-4" />,
  card_redeem: <Gift className="w-4 h-4" />,
  journal_entry: <PenLine className="w-4 h-4" />,
  reminder_set: <Bell className="w-4 h-4" />,
  reminder_triggered: <BellRing className="w-4 h-4" />,
};

const activityColors: Record<ActivityType, string> = {
  study_complete: 'bg-mint text-mint-deep',
  study_pause: 'bg-yellow-soft text-yellow-700',
  sticker_purchase: 'bg-lavender text-purple-700',
  card_complete: 'bg-primary/20 text-primary',
  card_redeem: 'bg-pink-soft text-pink-700',
  journal_entry: 'bg-muted text-muted-foreground',
  reminder_set: 'bg-blue-100 text-blue-700',
  reminder_triggered: 'bg-orange-100 text-orange-700',
};

const REMINDER_PRESETS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
];

const getActivityMessage = (log: ActivityLogType): string => {
  const { type, details } = log;
  
  switch (type) {
    case 'study_complete':
      { const effectiveness = details.effectiveness ? ` (${details.effectiveness}/5 effectiveness)` : '';
      return `Completed ${details.minutes} min study session! +${details.points} pts${effectiveness}`; }
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
    case 'reminder_set':
      return `Reminder set: "${details.reminderText}" in ${details.reminderMinutes} min ⏰`;
    case 'reminder_triggered':
      return `Reminder: ${details.reminderText} 🔔`;
    default:
      return 'Activity logged';
  }
};

export const ActivityLog = ({ 
  logs, 
  reminders,
  onAddJournalEntry, 
  onAddReminder,
  onDismissReminder,
  onTriggerReminder,
  getDueReminders,
}: ActivityLogProps) => {
  const [journalText, setJournalText] = useState('');
  const [reminderText, setReminderText] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState<string>('60');

  // Check for due reminders periodically
  useEffect(() => {
    const checkReminders = () => {
      const dueReminders = getDueReminders();
      dueReminders.forEach(reminder => {
        toast.info(`⏰ Reminder: ${reminder.text}`, {
          duration: 10000,
          action: {
            label: 'Dismiss',
            onClick: () => onDismissReminder(reminder.id),
          },
        });
        onTriggerReminder(reminder.id);
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [getDueReminders, onTriggerReminder, onDismissReminder]);

  const handleSubmitJournal = () => {
    if (journalText.trim()) {
      onAddJournalEntry(journalText.trim());
      setJournalText('');
    }
  };

  const handleSubmitReminder = () => {
    if (reminderText.trim() && reminderMinutes) {
      onAddReminder(reminderText.trim(), parseInt(reminderMinutes));
      setReminderText('');
      toast.success(`Reminder set for ${reminderMinutes} minutes from now! ⏰`);
    }
  };

  const activeReminders = reminders.filter(r => !r.triggered);

  return (
    <div className="space-y-6">
      {/* Active Reminders */}
      {activeReminders.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-fredoka font-bold text-lg text-foreground flex items-center gap-2">
            <Timer className="w-5 h-5 text-primary" />
            Active Reminders
          </h3>
          <div className="space-y-2">
            {activeReminders.map(reminder => (
              <div 
                key={reminder.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-blue-50 border-2 border-blue-200"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{reminder.text}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(reminder.triggerAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDismissReminder(reminder.id)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Set Reminder Form */}
      <div className="space-y-3">
        <h3 className="font-fredoka font-bold text-lg text-foreground flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Set Reminder
        </h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={reminderText}
            onChange={(e) => setReminderText(e.target.value)}
            placeholder="What should I remind you about? 🔔"
            className="flex-1"
          />
          <Select value={reminderMinutes} onValueChange={setReminderMinutes}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="When?" />
            </SelectTrigger>
            <SelectContent>
              {REMINDER_PRESETS.map(preset => (
                <SelectItem key={preset.value} value={preset.value.toString()}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
          variant="cute" 
          onClick={handleSubmitReminder}
          disabled={!reminderText.trim()}
          className="w-full sm:w-auto"
        >
          <Bell className="w-4 h-4 mr-2" />
          Set Reminder
        </Button>
      </div>

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
