import { CheckCircle2, AlertTriangle, LayoutGrid, Clock } from 'lucide-react';

export default function QuickStats({ stats, loading }) {
  if (loading && !stats) {
    return (
      <div className="quick-stats">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="quick-stat skeleton" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const items = [
    {
      icon: CheckCircle2,
      value: stats.completed,
      label: 'Completed',
      color: 'green',
      extra: `of ${stats.completed}`,
    },
    {
      icon: LayoutGrid,
      value: stats.total,
      label: 'Total Tasks',
      color: 'blue',
    },
    {
      icon: Clock,
      value: `${stats.completionRate}%`,
      label: 'Completion Rate',
      color: 'purple',
    },
    {
      icon: AlertTriangle,
      value: stats.overdue,
      label: 'Overdue',
      color: 'red',
    },
  ];

  return (
    <div className="quick-stats">
      {items.map(({ icon: Icon, value, label, color, extra }) => (
        <div key={label} className={`quick-stat ${color}`}>
          <Icon size={20} />
          <div>
            <span className="quick-value">{value}</span>
            <span className="quick-label">{label}</span>
            {extra && <span className="quick-extra">{extra}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
