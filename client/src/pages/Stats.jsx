import { useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { Cell, Pie, PieChart, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Clock, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';

export default function Stats() {
  const { stats, fetchStats, loading } = useTasks();

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) return <div className="loading">Loading statistics...</div>;
  if (!stats) return <div className="error-banner">Failed to load statistics</div>;

  const statusData = [
    { name: 'Completed', value: stats.completed, color: '#22c55e' },
    { name: 'Pending', value: stats.pending, color: '#64748b' },
    { name: 'In Progress', value: stats.inProgress, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  const priorityData = (stats.priorityBreakdown || []).map(item => ({
    name: item.priority.charAt(0).toUpperCase() + item.priority.slice(1),
    value: Number(item.count),
  }));

  const categoryData = (stats.categoryBreakdown || []).map(item => ({
    name: item.category,
    count: Number(item.count),
  }));

  const trendData = (stats.trend || []).map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    tasks: Number(item.count),
  }));

  const cardStyle = { borderRadius: 8 };

  return (
    <div className="page stats-page">
      <div className="page-header">
        <h1>Statistics</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={cardStyle}>
          <CheckCircle2 className="stat-icon green" />
          <div>
            <h3>{stats.completed}</h3>
            <p>Completed Tasks</p>
          </div>
        </div>
        <div className="stat-card" style={cardStyle}>
          <TrendingUp className="stat-icon blue" />
          <div>
            <h3>{stats.completionRate}%</h3>
            <p>Completion Rate</p>
          </div>
        </div>
        <div className="stat-card" style={cardStyle}>
          <AlertTriangle className="stat-icon red" />
          <div>
            <h3>{stats.overdue}</h3>
            <p>Overdue Tasks</p>
          </div>
        </div>
        <div className="stat-card" style={cardStyle}>
          <Clock className="stat-icon purple" />
          <div>
            <h3>{stats.averageCompletionHours}h</h3>
            <p>Avg Completion Time</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Task Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Tasks by Priority</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Tasks by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Task Completion Trend (30 days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tasks" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
