import React, { useState, useMemo } from 'react';
import { GanttTimeline } from './GanttTimeline';
import { addDays, startOfToday } from 'date-fns';

interface Props {
  plans: any[];
  onUpdatePlan: (id: string, data: any) => void;
  onDeletePlan: (id: string) => void;
}

export function GanttChart({ plans, onUpdatePlan, onDeletePlan }: Props) {
  const [days] = useState(() => {
    const start = startOfToday();
    return Array.from({ length: 30 }, (_, i) => addDays(start, i));
  });

  const handleGridClick = (date: Date, row: number) => {
    console.log('Grid clicked', date, row);
    // Logic for adding/editing plan slots could go here
  };

  return (
    <div className="w-full h-full overflow-auto">
      <GanttTimeline
        days={days}
        plans={plans}
        onGridClick={handleGridClick}
      />
    </div>
  );
}
