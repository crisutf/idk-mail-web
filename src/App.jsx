import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import Profile from './components/Profile';
import ErrorPage from './components/ErrorPage';
import { ThemeProvider } from './contexts/ThemeContext';
import axios from 'axios';

const API_URL = 'https://api-idk-mail-services.crisu.qzz.io:2053/api';
const BASE_URL = 'https://api-idk-mail-services.crisu.qzz.io:2053';

const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  let cleanedPath = avatarPath.replace(/\\/g, '/');
  if (cleanedPath.startsWith('/')) {
    cleanedPath = cleanedPath.substring(1);
  }
  return `${BASE_URL}/${cleanedPath}`;
};

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const storedUser = JSON.parse(localStorage.getItem('user'));
          if (storedUser) {
            const userData = {
              ...storedUser,
              id: storedUser.id || storedUser._id
            };
            setUser(userData);
          }
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, [token]);

  const login = async (username, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });
      const userData = {
        ...res.data.user,
        id: res.data.user.id || res.data.user._id
      };
      setToken(res.data.token);
      setUser(userData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al iniciar sesión' 
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { username, email, password });
      const userData = {
        ...res.data.user,
        id: res.data.user.id || res.data.user._id
      };
      setToken(res.data.token);
      setUser(userData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al registrarse' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #fff8e6 0%, #fef3c7 25%, #fde68a 50%, #fff7ed 75%, #ffedd5 100%)'
      }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '18px', color: '#374151' }}>
          Cargando...
        </p>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="app">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
          
          {user ? (
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route path="/register" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard user={user} token={token} logout={logout} initialSection="mail" />} />
              <Route path="/chat" element={<Dashboard user={user} token={token} logout={logout} initialSection="chat" />} />
              <Route path="/mail" element={<Dashboard user={user} token={token} logout={logout} initialSection="mail" />} />
              <Route path="/friends" element={<Dashboard user={user} token={token} logout={logout} initialSection="friends" />} />
              <Route path="/profile" element={<Profile user={user} token={token} />} />
              <Route path="/admin" element={user.role === 'admin' ? <AdminPanel user={user} token={token} logout={logout} /> : <ErrorPage statusCode={403} />} />
              <Route path="/401" element={<ErrorPage statusCode={401} />} />
              <Route path="/403" element={<ErrorPage statusCode={403} />} />
              <Route path="*" element={<ErrorPage statusCode={404} />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login login={login} />} />
              <Route path="/register" element={<Register register={register} />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          )}
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
export { API_URL, BASE_URL, getAvatarUrl };
