import { createContext, useContext, useReducer } from 'react';
import api from '../utils/api';

const TaskContext = createContext();

const initialState = {
  tasks: [],
  loading: false,
  error: null,
  stats: null,
  total: 0,
  page: 1,
  pages: 1,
  filters: {},
};

function taskReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload.tasks,
        total: action.payload.total,
        page: action.payload.page,
        pages: action.payload.pages,
        loading: false,
      };
    case 'SET_STATS':
      return { ...state, stats: action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks], total: state.total + 1 };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t),
      };
    case 'REMOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload),
        total: state.total - 1,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  const fetchTasks = async (filters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      const res = await api.get(`/tasks?${params.toString()}`);
      dispatch({ type: 'SET_TASKS', payload: res.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.error || 'Failed to fetch tasks' });
    }
  };

  const fetchStats = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await api.get('/tasks/stats');
      dispatch({ type: 'SET_STATS', payload: res.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.error || 'Failed to fetch stats' });
    }
  };

  const createTask = async (taskData) => {
    try {
      const res = await api.post('/tasks', taskData);
      dispatch({ type: 'ADD_TASK', payload: res.data });
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const res = await api.put(`/tasks/${id}`, taskData);
      dispatch({ type: 'UPDATE_TASK', payload: res.data });
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await api.patch(`/tasks/${id}/status`, { status });
      dispatch({ type: 'UPDATE_TASK', payload: res.data });
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      dispatch({ type: 'REMOVE_TASK', payload: id });
    } catch (error) {
      throw error;
    }
  };

  const toggleArchive = async (id) => {
    try {
      const res = await api.post(`/tasks/${id}/toggle-archive`);
      dispatch({ type: 'UPDATE_TASK', payload: res.data });
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const reorderTasks = async (orderedIds) => {
    try {
      await api.patch('/tasks/reorder', { orderedIds });
    } catch (error) {
      throw error;
    }
  };

  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

  return (
    <TaskContext.Provider value={{
      ...state,
      fetchTasks,
      fetchStats,
      createTask,
      updateTask,
      updateStatus,
      deleteTask,
      toggleArchive,
      reorderTasks,
      clearError,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => useContext(TaskContext);
