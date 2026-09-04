export const priorityColors = {
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

export const priorityLabels = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const statusColors = {
  pending: '#64748b',
  in_progress: '#3b82f6',
  completed: '#22c55e',
  cancelled: '#94a3b8',
};

export const statusLabels = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const categories = [
  'general',
  'work',
  'personal',
  'health',
  'study',
  'finance',
  'shopping',
  'family',
  'other',
];

export function getPriorityRank(priority) {
  const ranks = { urgent: 0, high: 1, medium: 2, low: 3 };
  return ranks[priority] ?? 3;
}

export function formatDate(dateStr) {
  if (!dateStr) return 'No date';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function isOverdue(task) {
  if (!task.dueDate || task.status === 'completed' || task.status === 'cancelled') return false;
  const today = new Date().toISOString().split('T')[0];
  return task.dueDate < today;
}
