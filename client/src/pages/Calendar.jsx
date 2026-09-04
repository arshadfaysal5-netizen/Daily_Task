import { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import { isOverdue } from '../utils/helpers';

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarTasks, setCalendarTasks] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const { updateStatus, deleteTask } = useTasks();

  const loadTasks = async (year, month) => {
    setLoading(true);
    try {
      const res = await api.get('/tasks/calendar', { params: { year, month } });
      const grouped = {};
      res.data.forEach(task => {
        const date = task.dueDate;
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(task);
      });
      setCalendarTasks(grouped);
    } catch (err) {
      console.error('Failed to load calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
  }, [currentMonth]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];
  const selectedDateStr = selectedDate?.toISOString().split('T')[0];

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let day = 1; day <= daysInMonth; day++) days.push(day);

  return (
    <div className="page calendar-page">
      <div className="page-header">
        <h1>Calendar</h1>
        <div className="month-nav">
          <button onClick={prevMonth}><ChevronLeft size={18} /></button>
          <h2>{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
          <button onClick={nextMonth}><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="calendar-day-header">{day}</div>
        ))}
        {days.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className="calendar-cell empty" />;
          const dateStr = new Date(year, month, day).toISOString().split('T')[0];
          const cellTasks = calendarTasks[dateStr] || [];
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDateStr;

          return (
            <div
              key={dateStr}
              className={`calendar-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedDate(new Date(year, month, day))}
            >
              <span className="day-number">{day}</span>
              <div className="cell-tasks">
                {cellTasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    className={`mini-task ${task.status} ${isOverdue(task) ? 'overdue' : ''}`}
                    title={task.title}
                  >
                    {task.title}
                  </div>
                ))}
                {cellTasks.length > 3 && (
                  <span className="more-tasks">+{cellTasks.length - 3} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <div className="selected-date-tasks">
          <h3>Tasks for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
          {selectedDateStr === today && <span className="today-badge">Today</span>}
          {(!calendarTasks[selectedDateStr] || calendarTasks[selectedDateStr].length === 0) ? (
            <p className="no-tasks">No tasks for this date</p>
          ) : (
            <div className="date-task-list">
              {calendarTasks[selectedDateStr].map(task => (
                <div key={task.id} className="date-task-item">
                  <div className="date-task-info">
                    <span className={`priority-dot p-${task.priority}`} />
                    <div>
                      <span className="date-task-title">{task.title}</span>
                      {task.dueTime && <span className="date-task-time">{task.dueTime.slice(0, 5)}</span>}
                    </div>
                  </div>
                  <div className="date-task-actions">
                    {task.status !== 'completed' ? (
                      <button className="btn-complete" onClick={() => updateStatus(task.id, 'completed')}>✓ Complete</button>
                    ) : (
                      <span className="completed-label">✓ Completed</span>
                    )}
                    <button className="btn-delete" onClick={() => deleteTask(task.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {loading && <div className="loading-overlay">Loading...</div>}
    </div>
  );
}
