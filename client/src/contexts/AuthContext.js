import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { isTokenExpired } from '../utils/jwtHelper';
import { setupAxiosInterceptor, removeAxiosInterceptor } from '../utils/axiosInterceptor';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Setup Axios interceptor for 401 responses
  useEffect(() => {
    const interceptorId = setupAxiosInterceptor(logout);

    // Cleanup: remove interceptor when component unmounts
    return () => {
      removeAxiosInterceptor(interceptorId);
    };
  }, []);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        // Check if token is expired before making API call
        if (isTokenExpired(token)) {
          console.log('Token expired on app load, logging out...');
          logout();
          setLoading(false);
          return;
        }

        try {
          const response = await axios.get('/api/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);

      return { success: true, user: newUser };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/auth/profile', profileData);
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Profile update failed'
      };
    }
  };

  const value = {
    user,
    token,  // CRITICAL: Export token so components can use it for API calls
    login,
    register,
    logout,
    updateProfile,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isPublisher: user?.role === 'publisher' || user?.role === 'admin',
    isReader: user?.role === 'reader'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
