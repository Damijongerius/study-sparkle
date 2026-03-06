const sanitizeAgenda = (data, sanitized) => {
  if (Array.isArray(data.availability)) {
    sanitized.availability = data.availability.map(s => ({ day: Number(s.day) || 0, startHour: Number(s.startHour) || 0, category: ['study', 'class', 'break', 'sleep', 'other'].includes(s.category) ? s.category : 'study' }));
  }
  if (Array.isArray(data.agendaItems)) {
    sanitized.agendaItems = data.agendaItems.map(i => ({ id: String(i.id).substring(0, 100), title: String(i.title).substring(0, 100), day: Number(i.day) || 0, date: String(i.date).substring(0, 10), startTime: Number(i.startTime) || 0, endTime: Number(i.endTime) || 0, type: ['task', 'custom'].includes(i.type) ? i.type : 'custom', actionId: String(i.actionId).substring(0, 100), calendarId: i.calendarId ? String(i.calendarId).substring(0, 100) : undefined }));
  }
  if (data.agendaSettings && typeof data.agendaSettings === 'object') {
    sanitized.agendaSettings = {
      actions: Array.isArray(data.agendaSettings.actions) ? data.agendaSettings.actions.map(a => ({ id: String(a.id).substring(0, 100), label: String(a.label).substring(0, 100), color: String(a.color).substring(0, 50), isSystem: Boolean(a.isSystem) })) : [],
      outOfAgenda: Array.isArray(data.agendaSettings.outOfAgenda) ? data.agendaSettings.outOfAgenda.map(o => ({ day: Number(o.day) || 0, wakeTime: Number(o.wakeTime) || 0, sleepTime: Number(o.sleepTime) || 0 })) : [],
      calendars: Array.isArray(data.agendaSettings.calendars) ? data.agendaSettings.calendars.map(c => ({ id: String(c.id).substring(0, 100), name: String(c.name).substring(0, 100), color: String(c.color).substring(0, 50), url: c.url ? String(c.url).substring(0, 500) : undefined, isExternal: Boolean(c.isExternal) })) : []
    };
  }
};

module.exports = { sanitizeAgenda };
