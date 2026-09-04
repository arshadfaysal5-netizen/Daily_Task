import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, BarChart3, Archive, Sun, Moon, Plus, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import TaskForm from './TaskForm';

export default function Layout({ children }) {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/stats', icon: BarChart3, label: 'Statistics' },
    { to: '/archive', icon: Archive, label: 'Archive' },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">📖</span>
            <span className="logo-text">Taskbook</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              end={to === '/'}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="user-info">
              <span className="user-name">{user.username || user.email}</span>
              <button className="logout-btn" onClick={logout} title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          )}
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <div className="version">v1.0.0</div>
        </div>
      </aside>

      <main className="main-content" key={location.pathname}>
        <header className="topbar">
          <button className="add-task-btn" onClick={() => setShowForm(true)}>
            <Plus size={18} />
            <span>New Task</span>
          </button>
        </header>
        <div className="content-wrapper">
          {children}
        </div>
      </main>

      {showForm && <TaskForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
