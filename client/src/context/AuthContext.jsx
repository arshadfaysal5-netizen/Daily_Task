import { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  loading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false };
    case 'LOGOUT':
      return { ...state, user: null, token: null, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('taskbook-token');
    const user = localStorage.getItem('taskbook-user');
    if (token && user) {
      api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          dispatch({ type: 'LOGIN', payload: { user: res.data, token } });
        })
        .catch(() => {
          localStorage.removeItem('taskbook-token');
          localStorage.removeItem('taskbook-user');
          dispatch({ type: 'SET_LOADING', payload: false });
        });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('taskbook-token', token);
    localStorage.setItem('taskbook-user', JSON.stringify(user));
    dispatch({ type: 'LOGIN', payload: { user, token } });
    return res.data;
  };

  const register = async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
    const { token, user } = res.data;
    localStorage.setItem('taskbook-token', token);
    localStorage.setItem('taskbook-user', JSON.stringify(user));
    dispatch({ type: 'LOGIN', payload: { user, token } });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('taskbook-token');
    localStorage.removeItem('taskbook-user');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
