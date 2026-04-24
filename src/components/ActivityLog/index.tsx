import React, { useState } from 'react';
import { ScrollText, Bell, Plus, Calendar, Journal } from 'lucide-react';
import { ReminderItem } from './ReminderItem';
import { EliteCard } from '@/components/shared/EliteCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

interface Props {
    logs: any[];
    reminders: any[];
    onAddJournalEntry: (entry: string) => void;
    onAddReminder: (reminder: any) => void;
    onDismissReminder: (id: string) => void;
    onTriggerReminder: (id: string) => void;
    getDueReminders: () => any[];
}

export const ActivityLog = ({ logs, reminders, onAddJournalEntry, onAddReminder, onDismissReminder, onTriggerReminder, getDueReminders }: Props) => {
    const [entry, setEntry] = useState('');
    const [remText, setRemText] = useState('');
    const [remTime, setRemTime] = useState('');

    const handleAddEntry = () => {
        if (entry.trim()) {
            onAddJournalEntry(entry);
            setEntry('');
        }
    };

    const handleAddReminder = () => {
        if (remText.trim() && remTime) {
            const [h, m] = remTime.split(':').map(Number);
            const triggerAt = new Date();
            triggerAt.setHours(h, m, 0, 0);
            if (triggerAt < new Date()) triggerAt.setDate(triggerAt.getDate() + 1);
            
            onAddReminder({ id: `rem-${Date.now()}`, text: remText, triggerAt: triggerAt.toISOString() });
            setRemText('');
            setRemTime('');
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div className="space-y-6">
                    <div className="flex items-center gap-3"><ScrollText className="text-primary" /> <h3 className="text-xl font-fredoka font-bold">Activity Log</h3></div>
                    <EliteCard variant="solid" className="p-0 overflow-hidden">
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-6 space-y-4">
                            {logs.length === 0 ? (
                                <div className="text-center py-12 opacity-40"><p className="font-bold">No entries yet! ✨</p></div>
                            ) : (
                                logs.slice().reverse().map((log, i) => (
                                    <div key={i} className="flex gap-4 items-start border-l-2 border-primary/10 pl-4 py-1">
                                        <div className="min-w-[60px] text-[10px] font-black text-primary/40 uppercase pt-1">{format(new Date(log.timestamp), 'h:mm a')}</div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold leading-tight">{log.action || log.message}</p>
                                            {log.points && <p className="text-[10px] font-black text-green-500 mt-0.5">+{log.points} Points</p>}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </EliteCard>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-3"><Bell className="text-orange-500" /> <h3 className="text-xl font-fredoka font-bold">Reminders</h3></div>
                    <div className="space-y-4">
                        <div className="bg-primary/5 p-6 rounded-3xl border-2 border-dashed border-primary/10 space-y-4">
                            <Input placeholder="Remind me to..." value={remText} onChange={e => setRemText(e.target.value)} className="h-11 rounded-xl border-2" />
                            <div className="flex gap-2">
                                <Input type="time" value={remTime} onChange={e => setRemTime(e.target.value)} className="h-11 rounded-xl border-2" />
                                <Button className="h-11 px-6 rounded-xl font-bold" onClick={handleAddReminder}><Plus className="w-4 h-4 mr-2" /> Add</Button>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {reminders.map(rem => (
                                <ReminderItem key={rem.id} reminder={rem} onDismiss={onDismissReminder} onTrigger={onTriggerReminder} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
