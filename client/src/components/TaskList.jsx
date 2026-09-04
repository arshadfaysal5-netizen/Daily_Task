import { useState } from 'react';
import TaskCard from './TaskCard';
import { useTasks } from '../context/TaskContext';
import { priorityColors, getPriorityRank } from '../utils/helpers';
import { GripVertical } from 'lucide-react';

export default function TaskList({ tasks, view }) {
  const { reorderTasks } = useTasks();
  const [draggedId, setDraggedId] = useState(null);

  const sortedTasks = [...tasks].sort((a, b) => {
    if (view === 'board') return getPriorityRank(a.priority) - getPriorityRank(b.priority);
    return a.dueDate?.localeCompare(b.dueDate || '') || getPriorityRank(a.priority) - getPriorityRank(b.priority);
  });

  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    const newOrder = sortedTasks.map(t => t.id);
    const fromIndex = newOrder.indexOf(draggedId);
    const toIndex = newOrder.indexOf(targetId);
    newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, draggedId);
    reorderTasks(newOrder);
    setDraggedId(null);
  };

  const handleDragOver = (e) => e.preventDefault();

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-icon">📝</p>
        <h3>No tasks found</h3>
        <p>Create your first task to get started, or try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {sortedTasks.map(task => (
        <div
          key={task.id}
          onDrop={e => handleDrop(e, task.id)}
          onDragOver={handleDragOver}
          className={`dropdown-target ${draggedId === task.id ? 'dragging' : ''}`}
        >
          <TaskCard
            task={task}
            onDragStart={e => handleDragStart(e, task.id)}
            onDragEnd={() => setDraggedId(null)}
          />
        </div>
      ))}
    </div>
  );
}
