export type PlanStatus = 'pending' | 'in-progress' | 'completed';

export interface Task {
  id: string; title: string; description?: string; status: PlanStatus;
  dependencies: string[]; externalLink?: string; startDate?: Date;
  endDate?: Date; estimatedHours?: number; row?: number;
  order?: number; linkedTaskId?: string;
}

export interface Plan {
  id: string; title: string; description?: string; status: PlanStatus;
  tasks: Task[]; examDate?: Date; startDate?: Date; endDate?: Date;
  type?: 'flow' | 'exam' | 'long-term'; enforceDependencies?: boolean;
}
