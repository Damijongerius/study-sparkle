import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Props {
    title: string;
    description: string;
    onUpdate: (data: any) => void;
}

export const WizardStep1 = ({ title, description, onUpdate }: Props) => (
  <div className="space-y-6 text-left">
    <div className="space-y-2">
        <Label className="font-bold ml-1 text-lg">Goal Title</Label>
        <Input placeholder="e.g. Master Final Exams" value={title} onChange={e => onUpdate({ title: e.target.value })} className="h-14 rounded-2xl border-2 text-lg px-6" />
    </div>
    <div className="space-y-2">
        <Label className="font-bold ml-1 text-lg">What's the mission? (Optional)</Label>
        <Textarea placeholder="Describe your objective..." value={description} onChange={e => onUpdate({ description: e.target.value })} className="min-h-[120px] rounded-2xl border-2 px-6 py-4" />
    </div>
  </div>
);
