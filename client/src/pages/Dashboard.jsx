import { useEffect, useState } from 'react';
import { useTasks } from '../context/TaskContext';
import FilterBar from '../components/FilterBar';
import TaskList from '../components/TaskList';
import QuickStats from '../components/QuickStats';
import { formatDate } from '../utils/helpers';

export default function Dashboard() {
  const { tasks, loading, error, fetchTasks, fetchStats, stats } = useTasks();
  const [activeFilters, setActiveFilters] = useState({ view: 'all' });

  useEffect(() => {
    fetchTasks({ ...activeFilters, limit: 50 });
    fetchStats();
  }, []);

  useEffect(() => {
    fetchTasks({ ...activeFilters, limit: 50 });
  }, [activeFilters]);

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page dashboard-page">
      <div className="page-header">
        <div>
          <h1>{greeting}! 👋</h1>
          <p className="subtitle">{formatDate(today.toISOString()).split(',')[1]}, {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>

      <QuickStats stats={stats} loading={loading} />

      <FilterBar onFilter={setActiveFilters} />

      {error && <div className="error-banner">{error}</div>}

      <div className="task-section">
        <h2 className="section-title">
          {activeFilters.view === 'all' ? 'All Tasks' :
            activeFilters.view === 'today' ? "Today's Tasks" :
            activeFilters.view === 'week' ? 'This Week' :
            activeFilters.view === 'upcoming' ? 'Upcoming' :
            activeFilters.view === 'overdue' ? 'Overdue Tasks' : 'Completed Tasks'}
          <span className="task-count">{tasks.length}</span>
        </h2>
        {loading && !tasks.length ? (
          <div className="loading">Loading tasks...</div>
        ) : (
          <TaskList tasks={tasks} view={activeFilters.view} />
        )}
      </div>
    </div>
  );
}
