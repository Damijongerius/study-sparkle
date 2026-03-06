import { apiRequest } from './apiClient';

export const plannerApi = {
  createPlan: (title: string, id: string, description?: string, type?: string, examDate?: Date, enforceDependencies?: boolean, startDate?: Date, endDate?: Date) => 
    apiRequest('/planner/plan', { method: 'POST', body: JSON.stringify({ title, id, description, type, examDate, enforceDependencies, startDate, endDate }) }),
  
  updatePlan: (id: string, updates: any) => 
    apiRequest(`/planner/plan/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  
  deletePlan: (id: string) => 
    apiRequest(`/planner/plan/${id}`, { method: 'DELETE' }),
  
  addTask: (planId: string, task: any) => 
    apiRequest(`/planner/plan/${planId}/task`, { method: 'POST', body: JSON.stringify(task) }),
  
  updateTask: (planId: string, taskId: string, updates: any) => 
    apiRequest(`/planner/plan/${planId}/task/${taskId}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  
  deleteTask: (planId: string, taskId: string) => 
    apiRequest(`/planner/plan/${planId}/task/${taskId}`, { method: 'DELETE' }),
};
