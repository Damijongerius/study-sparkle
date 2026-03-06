const sanitizePlanner = (data, sanitized) => {
  if (Array.isArray(data.plans)) {
    sanitized.plans = data.plans.map(p => ({
      id: String(p.id).substring(0, 100), title: String(p.title).substring(0, 100), description: p.description ? String(p.description).substring(0, 500) : undefined,
      status: ['pending', 'in-progress', 'completed'].includes(p.status) ? p.status : 'pending', type: ['flow', 'exam', 'long-term'].includes(p.type) ? p.type : 'flow',
      examDate: p.examDate ? new Date(p.examDate) : undefined, startDate: p.startDate ? new Date(p.startDate) : undefined, endDate: p.endDate ? new Date(p.endDate) : undefined,
      enforceDependencies: Boolean(p.enforceDependencies),
      tasks: Array.isArray(p.tasks) ? p.tasks.map(t => ({
        id: String(t.id).substring(0, 100), title: String(t.title).substring(0, 100), description: t.description ? String(t.description).substring(0, 500) : undefined,
        status: ['pending', 'in-progress', 'completed'].includes(t.status) ? t.status : 'pending',
        dependencies: Array.isArray(t.dependencies) ? t.dependencies.map(d => String(d).substring(0, 100)) : [],
        externalLink: t.externalLink ? String(t.externalLink).substring(0, 500) : undefined,
        startDate: t.startDate ? new Date(t.startDate) : undefined, endDate: t.endDate ? new Date(t.endDate) : undefined,
        estimatedHours: Number(t.estimatedHours) || 0, row: Number(t.row) || 0, order: Number(t.order) || 0, linkedTaskId: t.linkedTaskId ? String(t.linkedTaskId).substring(0, 100) : undefined,
      })) : []
    }));
  }
};

module.exports = { sanitizePlanner };
