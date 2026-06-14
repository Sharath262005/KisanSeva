import { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const decoded = JSON.parse(atob(base64Url));
        // Check if token is expired (optional – the interceptor will handle refresh)
        if (decoded.exp * 1000 > Date.now()) {
          setUser({ id: decoded.id, role: decoded.role });
        } else {
          // Token expired – try to refresh
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            API.post('/auth/refresh', { token: refreshToken })
              .then(res => {
                localStorage.setItem('accessToken', res.data.accessToken);
                localStorage.setItem('refreshToken', res.data.refreshToken);
                const newDecoded = JSON.parse(atob(res.data.accessToken.split('.')[1]));
                setUser({ id: newDecoded.id, role: newDecoded.role });
              })
              .catch(() => {
                localStorage.clear();
                setUser(null);
              });
          } else {
            localStorage.clear();
            setUser(null);
          }
        }
      } catch {
        localStorage.clear();
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (mobile, password) => {
    const { data } = await API.post('/auth/login', { mobile, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await API.post('/auth/register', formData);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};