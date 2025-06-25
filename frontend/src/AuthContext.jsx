// frontend/src/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 520);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 520);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const tokenFromUrl = new URLSearchParams(location.search).get('token');
    const tokenToVerify = tokenFromUrl || localStorage.getItem('token');

    if (tokenFromUrl) {
      localStorage.setItem('token', tokenFromUrl);
    }
    
    if (tokenToVerify) {
      axios.get('/api/auth/dashboard', { headers: { 'Authorization': `Bearer ${tokenToVerify}` } })
        .then(res => {
          setUser(res.data.data);
          if (tokenFromUrl) {
             navigate('/dashboard', { replace: true });
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [location.search, navigate]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      setUser(user);
      return { success: true };
    } catch (err) {
      setUser(null);
      return { success: false, message: err.response?.data?.message || 'Failed to login' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
  };

  const value = {
    user,
    token: localStorage.getItem('token'),
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    loading,
    isMobile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 