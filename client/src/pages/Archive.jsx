import { useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { Archive as ArchiveIcon, RotateCcw, Trash2 } from 'lucide-react';

export default function Archive() {
  const { tasks, fetchTasks, toggleArchive, deleteTask } = useTasks();

  useEffect(() => {
    fetchTasks({ includeArchived: true, limit: 100 });
  }, []);

  const archivedTasks = tasks.filter(t => t.archived);

  const handleRestore = async (id) => {
    await toggleArchive(id);
    fetchTasks({ includeArchived: true, limit: 100 });
  };

  const handleDeletePerm = async (id) => {
    if (window.confirm('Delete this task permanently?')) {
      await deleteTask(id);
      fetchTasks({ includeArchived: true, limit: 100 });
    }
  };

  return (
    <div className="page archive-page">
      <div className="page-header">
        <h1>Archive</h1>
        <p className="subtitle">{archivedTasks.length} archived {archivedTasks.length === 1 ? 'task' : 'tasks'}</p>
      </div>

      {archivedTasks.length === 0 ? (
        <div className="empty-state">
          <ArchiveIcon size={48} />
          <h3>No archived tasks</h3>
          <p>Tasks you archive will appear here. Archived tasks are hidden from your dashboard.</p>
        </div>
      ) : (
        <div className="archive-list">
          {archivedTasks.map(task => (
            <div key={task.id} className="archive-item">
              <div className="archive-info">
                <span className={`priority-dot p-${task.priority}`} />
                <div>
                  <h3>{task.title}</h3>
                  {task.dueDate && <span className="archive-date">Due: {task.dueDate}</span>}
                  {task.status === 'completed' && <span className="status-completed">Completed ✓</span>}
                </div>
              </div>
              <div className="archive-actions">
                <button onClick={() => handleRestore(task.id)} className="btn-restore">
                  <RotateCcw size={14} /> Restore
                </button>
                <button onClick={() => handleDeletePerm(task.id)} className="btn-delete">
                  <Trash2 size={14} /> Delete Permanently
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
