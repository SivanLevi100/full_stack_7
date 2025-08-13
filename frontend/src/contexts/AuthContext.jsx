// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // בדיקה אם המשתמש מחובר בעת טעינת האפליקציה
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          // בדיקה שה-token עדיין תקף
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          // אם ה-token לא תקף, נקה הכל
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // התחברות
  const login = async (username, password) => {
    try {
      const response = await authAPI.login(username, password);
      
      // שמירת הטוקן והמשתמש
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      toast.success(`ברוך הבא, ${response.user.full_name}!`);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'שגיאה בהתחברות';
      toast.error(errorMessage);
      throw error;
    }
  };

  // הרשמה
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      toast.success('החשבון נוצר בהצלחה! אנא התחבר');
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'שגיאה ברישום';
      toast.error(errorMessage);
      throw error;
    }
  };

  // התנתקות
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('התנתקת בהצלחה');
    }
  };

  // בדיקה אם המשתמש הוא מנהל
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // בדיקה אם המשתמש הוא לקוח
  const isCustomer = () => {
    return user?.role === 'customer';
  };

  // עדכון פרטי המשתמש
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    isAdmin,
    isCustomer,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};