import { useState } from 'react';
import { ChevronDown, Clock, Tag, Repeat, Trash2, Archive, Pencil } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { priorityColors, isOverdue, formatDate } from '../utils/helpers';
import TaskForm from './TaskForm';

const statusOrder = ['pending', 'in_progress', 'completed', 'cancelled'];
const statusLabels = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled' };

export default function TaskCard({ task, onDragStart, onDragEnd }) {
  const { updateStatus, deleteTask, toggleArchive, updateTask } = useTasks();
  const [expanded, setExpanded] = useState(false);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [editing, setEditing] = useState(false);
  const [subtaskError, setSubtaskError] = useState('');

  const handleStatusChange = async (newStatus) => {
    await updateStatus(task.id, newStatus);
  };

  const handleSubtaskToggle = async (subtaskId) => {
    try {
      const subtasks = task.subtasks.map(st =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      );
      await updateTask(task.id, { subtasks });
    } catch {
      setSubtaskError('Failed to update subtask');
      setTimeout(() => setSubtaskError(''), 2000);
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!subtaskInput.trim()) return;
    try {
      const subtasks = [...(task.subtasks || []), {
        id: crypto.randomUUID(),
        title: subtaskInput,
        completed: false,
        createdAt: new Date(),
      }];
      await updateTask(task.id, { subtasks });
      setSubtaskInput('');
    } catch {
      setSubtaskError('Failed to add subtask');
      setTimeout(() => setSubtaskError(''), 2000);
    }
  };

  const deleteSubtask = async (subtaskId) => {
    try {
      const subtasks = task.subtasks.filter(st => st.id !== subtaskId);
      await updateTask(task.id, { subtasks });
    } catch {
      setSubtaskError('Failed to delete subtask');
      setTimeout(() => setSubtaskError(''), 2000);
    }
  };

  const progress = task.subtasks?.length
    ? Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)
    : task.status === 'completed' ? 100 : 0;

  const overdue = isOverdue(task);

  return (
    <div
      className={`task-card ${task.status} ${overdue ? 'overdue' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="task-card-header">
        <div className="task-status-badge" style={{ borderLeftColor: priorityColors[task.priority] }}>
          <select
            value={task.status}
            onChange={e => handleStatusChange(e.target.value)}
            className="status-select"
          >
            {statusOrder.map(s => (
              <option key={s} value={s}>{statusLabels[s]}</option>
            ))}
          </select>
        </div>
        <div className="task-actions">
          <button onClick={() => setEditing(true)} className="icon-btn" title="Edit">
            <Pencil size={14} />
          </button>
          <button onClick={() => toggleArchive(task.id)} className="icon-btn" title="Archive">
            <Archive size={14} />
          </button>
          <button onClick={() => deleteTask(task.id)} className="icon-btn danger" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="task-card-body">
        <h3 className="task-title">{task.title}</h3>
        {task.description && <p className="task-desc">{task.description}</p>}

        <div className="task-meta">
          <span className="meta-item priority" style={{ color: priorityColors[task.priority] }}>
            {task.priority}
          </span>
          {task.category && <span className="meta-item category">{task.category}</span>}
          {task.dueDate && (
            <span className={`meta-item ${overdue ? 'overdue-text' : ''}`}>
              <Clock size={12} /> {formatDate(task.dueDate)}
              {task.dueTime ? ` ${task.dueTime.slice(0, 5)}` : ''}
            </span>
          )}
          {task.estimatedMinutes && (
            <span className="meta-item"><Clock size={12} /> {task.estimatedMinutes} min</span>
          )}
        </div>

        {task.tags?.length > 0 && (
          <div className="task-tags">
            {task.tags.map(tag => (
              <span key={tag} className="tag"><Tag size={10} /> {tag}</span>
            ))}
          </div>
        )}

        {task.subtasks?.length > 0 && (
          <div className="subtask-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="progress-text">{progress}% complete</span>
          </div>
        )}
      </div>

      <div className="task-card-footer">
        <button className="toggle-subtasks" onClick={() => setExpanded(!expanded)}>
          <ChevronDown size={14} className={expanded ? 'rotate' : ''} />
          Subtasks ({task.subtasks?.length || 0})
        </button>
        {task.isRecurring && <span className="recurring-badge"><Repeat size={12} /> {task.recurringPattern}</span>}
      </div>

      {expanded && (
        <div className="subtasks-section">
          {subtaskError && <div className="error-msg">{subtaskError}</div>}
          <form onSubmit={handleAddSubtask} className="subtask-input-row">
            <input
              type="text"
              value={subtaskInput}
              onChange={e => setSubtaskInput(e.target.value)}
              placeholder="Add subtask..."
            />
            <button type="submit" className="btn-primary small">Add</button>
          </form>
          <ul className="subtask-list">
            {task.subtasks?.map(subtask => (
              <li key={subtask.id} className={`subtask-item ${subtask.completed ? 'done' : ''}`}>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => handleSubtaskToggle(subtask.id)}
                  />
                  <span className="subtask-title">{subtask.title}</span>
                </label>
                <button onClick={() => deleteSubtask(subtask.id)} className="icon-btn danger small">
                  <Trash2 size={12} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {editing && <TaskForm task={task} onClose={() => setEditing(false)} />}
    </div>
  );
}
