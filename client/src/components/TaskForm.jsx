import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { priorityLabels } from '../utils/helpers';
import api from '../utils/api';

const FALLBACK_CATEGORIES = ['general', 'work', 'personal', 'health', 'study', 'finance', 'shopping', 'family', 'other'];

export default function TaskForm({ task, onClose }) {
  const { createTask, updateTask } = useTasks();
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    category: task?.category || 'general',
    dueDate: task?.dueDate || '',
    dueTime: task?.dueTime || '',
    tags: task?.tags?.join(', ') || '',
    isRecurring: task?.isRecurring || false,
    recurringPattern: task?.recurringPattern || 'daily',
    estimatedMinutes: task?.estimatedMinutes || '',
    notes: task?.notes || '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);

  useEffect(() => {
    api.get('/categories')
      .then(res => {
        const cats = res.data;
        if (Array.isArray(cats) && cats.length > 0) {
          setCategories(cats.map(c => typeof c === 'string' ? c : c.name || c.id));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      estimatedMinutes: formData.estimatedMinutes ? Number(formData.estimatedMinutes) : null,
      categoryId: task?.categoryId || null,
    };

    try {
      if (task) {
        await updateTask(task.id, payload);
      } else {
        await createTask(payload);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Edit Task' : 'New Task'}</h2>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add more details..."
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
              >
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                value={formData.dueTime}
                onChange={e => setFormData({ ...formData, dueTime: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={e => setFormData({ ...formData, tags: e.target.value })}
              placeholder="work, urgent, hobby"
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={e => setFormData({ ...formData, isRecurring: e.target.checked })}
              />
              <span style={{ marginLeft: 8 }}>Recurring task</span>
            </label>
          </div>

          {formData.isRecurring && (
            <div className="form-row">
              <div className="form-group">
                <label>Repeats</label>
                <select
                  value={formData.recurringPattern}
                  onChange={e => setFormData({ ...formData, recurringPattern: e.target.value })}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="form-group">
                <label>Estimated Minutes</label>
                <input
                  type="number"
                  min="0"
                  value={formData.estimatedMinutes}
                  onChange={e => setFormData({ ...formData, estimatedMinutes: e.target.value })}
                  placeholder="e.g. 60"
                />
              </div>
            </div>
          )}

          {error && <div className="error-msg">{error}</div>}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
