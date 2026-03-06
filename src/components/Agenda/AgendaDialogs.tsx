import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { useStudyStoreContext } from '@/hooks/useStudyStoreContext';

interface Props {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    newItem: any;
    setNewItem: (item: any) => void;
}

export const AgendaDialogs = ({ isOpen, onOpenChange, newItem, setNewItem }: Props) => {
  const store = useStudyStoreContext();
  const settings = store.agendaSettings;

  const handleSave = async () => {
      const startTime = newItem.startHour * 60;
      await store.addAgendaItem({ 
          title: newItem.title, 
          date: newItem.date, 
          day: newItem.day, 
          startTime, 
          endTime: startTime + newItem.duration, 
          type: newItem.actionId === 'task' ? 'task' : 'custom', 
          actionId: newItem.actionId,
          calendarId: newItem.calendarId
      });
      onOpenChange(false);
      setNewItem({ ...newItem, title: '' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="rounded-[2.5rem] border-2 sm:max-w-md shadow-glow">
            <DialogHeader>
                <DialogTitle className="text-2xl font-fredoka font-bold flex items-center gap-3"><Plus className="text-primary" /> New Event</DialogTitle>
                <DialogDescription className="ml-1">Add a custom event to your schedule.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 text-left">
                <div className="space-y-2">
                    <Label className="font-bold ml-1">Event Title</Label>
                    <Input placeholder="e.g. Science Class" value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} className="h-12 rounded-xl border-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="font-bold ml-1">Calendar</Label>
                        <Select value={newItem.calendarId} onValueChange={val => setNewItem({ ...newItem, calendarId: val })}>
                            <SelectTrigger className="h-12 rounded-xl border-2"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-xl border-2">
                                {settings?.calendars.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold ml-1">Category</Label>
                        <Select value={newItem.actionId} onValueChange={val => setNewItem({ ...newItem, actionId: val })}>
                            <SelectTrigger className="h-12 rounded-xl border-2"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-xl border-2">
                                {settings?.actions.map(a => <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="font-bold ml-1">Initial Duration</Label>
                    <Select value={newItem.duration.toString()} onValueChange={val => setNewItem({ ...newItem, duration: parseInt(val) })}>
                        <SelectTrigger className="h-12 rounded-xl border-2"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl border-2">
                            <SelectItem value="30">30 Mins</SelectItem>
                            <SelectItem value="60">1 Hour</SelectItem>
                            <SelectItem value="120">2 Hours</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold h-12">Cancel</Button>
                <Button onClick={handleSave} className="rounded-xl px-8 shadow-glow font-bold h-12">Save</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
};
