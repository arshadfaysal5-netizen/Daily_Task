import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import api from '../utils/api';

const FALLBACK_CATEGORIES = ['general', 'work', 'personal', 'health', 'study', 'finance', 'shopping', 'family', 'other'];

export default function FilterBar({ onFilter }) {
  const [filters, setFilters] = useState({
    search: '',
    view: 'all',
    status: '',
    priority: '',
    category: '',
  });
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

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilter(filters);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    const reset = { search: '', view: 'all', status: '', priority: '', category: '' };
    setFilters(reset);
    onFilter(reset);
  };

  const hasFilters = Object.values(filters).some(v => v !== '' && v !== 'all');

  return (
    <div className="filter-bar">
      <div className="search-box">
        <Search size={16} />
        <input
          type="text"
          value={filters.search}
          onChange={e => updateFilter('search', e.target.value)}
          placeholder="Search tasks..."
        />
      </div>

      <div className="view-tabs">
        {['all', 'today', 'week', 'upcoming', 'overdue', 'completed'].map(view => (
          <button
            key={view}
            className={`tab ${filters.view === view ? 'active' : ''}`}
            onClick={() => updateFilter('view', view)}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      <div className="filter-controls">
        <select value={filters.status} onChange={e => updateFilter('status', e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select value={filters.priority} onChange={e => updateFilter('priority', e.target.value)}>
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select value={filters.category} onChange={e => updateFilter('category', e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>

        {hasFilters && (
          <button className="clear-btn" onClick={clearFilters}><X size={14} /> Clear</button>
        )}
      </div>
    </div>
  );
}
