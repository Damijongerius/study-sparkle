import React, { useState } from 'react';
import { Palette, Moon, Calendar as CalIcon, Settings2, Trash2, Check, X, PlusCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStudyStoreContext } from '@/hooks/useStudyStoreContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { CuteColorPicker } from './CuteColorPicker';
import { DAYS, getStyleColor, getClassNameColor, ACTION_COLORS } from './AgendaUtils';

export const AgendaSettingsView = () => {
  const store = useStudyStoreContext();
  const settings = store.agendaSettings;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editColor, setEditColor] = useState('#000000');
  
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState(ACTION_COLORS[0]);

  const [calName, setCalName] = useState('');
  const [calColor, setCalColor] = useState(ACTION_COLORS[0]);
  const [calUrl, setCalUrl] = useState('');

  const handleUpdateAction = () => {
      const updated = settings.actions.map(a => a.id === editingId ? { ...a, label: editLabel, color: editColor } : a);
      store.updateAgendaSettings({ actions: updated });
      setEditingId(null);
      toast.success('Updated! ✨');
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <Card className="rounded-[2rem] border-2 border-primary/10 p-8 space-y-6 shadow-soft">
              <div className="flex items-center gap-3"><Palette className="text-primary" /> <h3 className="text-xl font-fredoka font-bold">Categories</h3></div>
              <div className="space-y-3">
                  {settings.actions.map(a => (
                      <div key={a.id} className="p-3 bg-muted/30 rounded-2xl border-2 border-transparent">
                          {editingId === a.id ? (
                              <div className="space-y-4">
                                  <div className="flex gap-2"><Input value={editLabel} onChange={e => setEditLabel(e.target.value)} className="h-11 rounded-xl" /><Button variant="ghost" onClick={handleUpdateAction} className="text-green-500"><Check /></Button></div>
                                  <CuteColorPicker value={editColor} onChange={setEditColor} />
                              </div>
                          ) : (
                              <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3"><div className={cn("w-5 h-5 rounded-full border-2 border-white", getClassNameColor(a.color))} style={getStyleColor(a.color)} /><span className="font-bold text-sm">{a.label}</span></div>
                                  <div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => { setEditingId(a.id); setEditLabel(a.label); setEditColor(a.color); }}><Settings2 className="w-4 h-4" /></Button>{!a.isSystem && <Button variant="ghost" size="icon" onClick={() => store.updateAgendaSettings({ actions: settings.actions.filter(x => x.id !== a.id) })}><Trash2 className="w-4 h-4" /></Button>}</div>
                              </div>
                          )}
                      </div>
                  ))}
                  <div className="pt-6 border-t-2 border-dashed border-primary/5 space-y-4">
                      <div className="flex gap-2"><Input placeholder="New..." value={newLabel} onChange={e => setNewLabel(e.target.value)} className="h-11 rounded-xl" /><Button onClick={() => { if(newLabel) store.updateAgendaSettings({ actions: [...settings.actions, { id: `c-${Date.now()}`, label: newLabel, color: newColor }] }); setNewLabel(''); }}><PlusCircle /></Button></div>
                      <CuteColorPicker value={newColor} onChange={setNewColor} />
                  </div>
              </div>
          </Card>

          <Card className="rounded-[2rem] border-2 border-primary/10 p-8 space-y-6 shadow-soft">
              <div className="flex items-center gap-3"><Moon className="text-indigo-600" /> <h3 className="text-xl font-fredoka font-bold">Sleep</h3></div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {DAYS.map((day, i) => {
                      const s = settings.outOfAgenda.find(x => x.day === i) || { wakeTime: 540, sleepTime: 1020 };
                      return (
                          <div key={day} className="p-3 bg-muted/20 rounded-xl border border-transparent">
                              <span className="text-[10px] font-black uppercase text-primary">{day}</span>
                              <div className="flex gap-4">
                                  <div className="flex-1"><Label className="text-[9px] uppercase opacity-40">Wake</Label><Input type="time" value={`${Math.floor(s.wakeTime/60).toString().padStart(2,'0')}:${(s.wakeTime%60).toString().padStart(2,'0')}`} className="h-9 rounded-lg" onChange={(e) => { const [h, m] = e.target.value.split(':').map(Number); store.updateAgendaSettings({ outOfAgenda: settings.outOfAgenda.map(x => x.day === i ? { ...x, wakeTime: h*60+m } : x) }); }} /></div>
                                  <div className="flex-1"><Label className="text-[9px] uppercase opacity-40">Sleep</Label><Input type="time" value={`${Math.floor(s.sleepTime/60).toString().padStart(2,'0')}:${(s.sleepTime%60).toString().padStart(2,'0')}`} className="h-9 rounded-lg" onChange={(e) => { const [h, m] = e.target.value.split(':').map(Number); store.updateAgendaSettings({ outOfAgenda: settings.outOfAgenda.map(x => x.day === i ? { ...x, sleepTime: h*60+m } : x) }); }} /></div>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </Card>

          <Card className="rounded-[2rem] border-2 border-primary/10 p-8 space-y-6 shadow-soft md:col-span-2">
              <div className="flex items-center gap-3"><CalIcon className="text-sky-600" /> <h3 className="text-xl font-fredoka font-bold">Calendars</h3></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-2">{settings.calendars.map(c => (
                      <div key={c.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                          <div className="flex items-center gap-3"><div className={cn("w-4 h-4 rounded-full shadow-sm", getClassNameColor(c.color))} style={getStyleColor(c.color)} /><span className="font-bold text-sm">{c.name}</span></div>
                          {c.id !== 'personal' && <Button variant="ghost" size="icon" onClick={() => store.updateAgendaSettings({ calendars: settings.calendars.filter(x => x.id !== c.id) })}><Trash2 className="w-4 h-4" /></Button>}
                      </div>
                  ))}</div>
                  <div className="space-y-4 p-6 bg-primary/[0.02] rounded-[1.5rem] border-2 border-dashed border-primary/10">
                      <Input placeholder="Calendar Name..." value={calName} onChange={e => setCalName(e.target.value)} className="h-11 rounded-xl border-2" />
                      <CuteColorPicker value={calColor} onChange={setCalColor} />
                      <Button className="w-full h-12 rounded-xl shadow-glow" onClick={() => { if(calName) { store.updateAgendaSettings({ calendars: [...settings.calendars, { id: `cal-${Date.now()}`, name: calName, color: calColor, isExternal: false }] }); setCalName(''); } }}>Link Calendar</Button>
                  </div>
              </div>
          </Card>
      </div>
    </div>
  );
};
