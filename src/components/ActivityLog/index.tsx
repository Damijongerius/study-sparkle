import React from 'react';
import { ReminderItem } from './ReminderItem';

interface Props {
  logs: any[];
  reminders: any[];
  onDismissReminder: (id: string) => void;
  onTriggerReminder: (id: string) => void;
}

export function ActivityLog({
  logs,
  reminders,
  onDismissReminder,
  onTriggerReminder
}: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-left">Reminders 🔔</h3>
        {reminders.map(reminder => (
          <ReminderItem
            key={reminder.id}
            reminder={reminder}
            onDismiss={onDismissReminder}
            onTrigger={onTriggerReminder}
          />
        ))}
      </div>
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-left">Recent Activity 📜</h3>
        <div className="bg-white rounded-2xl border-2 p-4 space-y-3">
          {logs.map((log, i) => (
            <div key={i} className="flex justify-between items-center text-sm border-b last:border-0 pb-2">
              <span className="font-medium">{log.type}</span>
              <span className="text-muted-foreground text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
